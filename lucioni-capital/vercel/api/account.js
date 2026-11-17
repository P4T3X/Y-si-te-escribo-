// Lucioni Capital — cuentas con correo y contraseña.
// Contraseñas con scrypt + sal; sesiones firmadas con HMAC (AUTH_SECRET). Datos en Vercel Blob privado.
import { put, get, del } from '@vercel/blob';
import crypto from 'node:crypto';
import { entitlements, audit, delPrefix, TRIAL_DAYS, PLANS } from '../lib/core.js';

const SECRET = process.env.AUTH_SECRET || '';
const MAX_STATE = 250_000;
const attempts = new Map();

const send = (res, s, b) => { res.statusCode = s; res.setHeader('content-type', 'application/json; charset=utf-8'); res.setHeader('cache-control', 'no-store'); res.end(JSON.stringify(b)); };
const err = (res, s, code, message) => send(res, s, { code, message });
const b64u = b => Buffer.from(b).toString('base64url');
const uidOf = email => crypto.createHash('sha256').update('lc:' + email.trim().toLowerCase()).digest('hex').slice(0, 40);
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

function sign(uid) { const p = b64u(JSON.stringify({ uid, exp: Date.now() + 30 * 864e5 })); return p + '.' + crypto.createHmac('sha256', SECRET).update(p).digest('base64url'); }
function verify(tok) {
  if (!tok || !SECRET) return null; const [p, s] = String(tok).split('.'); if (!p || !s) return null;
  const want = crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
  if (want.length !== s.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(s))) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url').toString()); return d.exp > Date.now() ? d.uid : null; } catch { return null; }
}
const hashPw = (pw, salt) => new Promise((ok, ko) => crypto.scrypt(pw, salt, 64, { N: 16384, r: 8, p: 1 }, (e, k) => e ? ko(e) : ok(k.toString('hex'))));
async function readJSON(path) {
  const r = await get(path, { access: 'private', useCache: false }).catch(() => null);
  if (!r || r.statusCode !== 200 || !r.stream) return null;
  return JSON.parse(await new Response(r.stream).text());
}
const writeJSON = (path, obj) => put(path, JSON.stringify(obj), { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json' });
const CURS = ['USD', 'EUR', 'PEN', 'GBP'], LANGS = ['es', 'en', 'pt'], LEVELS = ['principiante', 'avanzado'];
const pick = (v, list, d) => list.includes(v) ? v : d;
const pub = u => ({ email: u.email, name: u.name, risk: u.risk, cur: u.cur, goal: u.goal || '', since: u.since, lang: u.lang || 'es', country: u.country || '', tz: u.tz || '', level: u.level || 'principiante',
  prefs: { notif: u.prefs?.notif !== false, analytics: u.prefs?.analytics !== false }, sub: entitlements(u) });
/* una prueba por persona: se registra el correo normalizado (sin alias +etiqueta ni puntos en Gmail) aunque la cuenta se borre */
const trialKey = email => { let [a, d] = String(email).toLowerCase().split('@'); a = a.split('+')[0]; if (/^(gmail|googlemail)\.com$/.test(d)) { a = a.replace(/\./g, ''); d = 'gmail.com'; } return crypto.createHash('sha256').update('lc-trial:' + a + '@' + d).digest('hex').slice(0, 40); };
function limited(key, max = 6, win = 10 * 60_000) { const now = Date.now(), l = (attempts.get(key) || []).filter(t => now - t < win); if (l.length >= max) return true; l.push(now); attempts.set(key, l); return false; }
async function body(req) { if (req.body && typeof req.body === 'object') return req.body; const c = []; for await (const x of req) c.push(x); try { return JSON.parse(Buffer.concat(c).toString() || '{}'); } catch { return {}; } }
const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => { const b = crypto.randomBytes(15); let o = ''; for (let i = 0; i < 15; i++) o += ALPH[b[i] % 32]; return o.match(/.{5}/g).join('-'); };
const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeHash = (code, salt) => crypto.createHash('sha256').update(salt + ':' + normCode(code)).digest('hex');
function setCode(u) { const code = newCode(), s = crypto.randomBytes(8).toString('hex'); u.rc = { s, h: codeHash(code, s) }; return code; }
/* ---------- correo (Resend o SMTP, el que esté configurado) ---------- */
const APP_URL = (process.env.APP_URL || 'https://lucioni-capital.vercel.app').replace(/\/$/, '');
const mailReady = () => !!(process.env.RESEND_API_KEY || (process.env.SMTP_USER && process.env.SMTP_PASS));
async function sendMail(to, subject, html, text) {
  const from = process.env.MAIL_FROM || (process.env.RESEND_API_KEY ? 'Lucioni Capital <onboarding@resend.dev>' : `Lucioni Capital <${process.env.SMTP_USER}>`);
  if (process.env.RESEND_API_KEY) {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'content-type': 'application/json' }, body: JSON.stringify({ from, to: [to], subject, html, text }) });
    if (!r.ok) throw new Error('resend ' + r.status + ' ' + (await r.text()).slice(0, 200));
    return;
  }
  const nodemailer = (await import('nodemailer')).default;
  const port = +(process.env.SMTP_PORT || 465);
  const t = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'smtp.gmail.com', port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  await t.sendMail({ from, to, subject, html, text });
}
const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function resetMail(name, link) {
  const text = `Hola ${name}:\n\nRecibimos una solicitud para cambiar la contraseña de tu cuenta de Lucioni Capital. Abre este enlace en los próximos 30 minutos para elegir una nueva:\n\n${link}\n\nSi no lo pediste tú, ignora este correo: tu contraseña no cambia.\n\nLucioni Capital, app financiera de Lucioni Enterprises`;
  const html = `<!doctype html><html><body style="margin:0;background:#f1f3f1;font-family:Helvetica,Arial,sans-serif;color:#13261c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:40px;height:40px;border:3px solid #13261c;text-align:center;font:700 22px Georgia,serif">L</td><td style="padding-left:12px"><b style="font-size:17px">Lucioni Capital</b><br><span style="font-size:13px;color:#5b6b62">App financiera de Lucioni Enterprises</span></td></tr></table></td></tr>
<tr><td style="padding-top:28px"><h1 style="font-size:24px;margin:0 0 12px">Cambia tu contraseña</h1>
<p style="font-size:15px;line-height:1.55;margin:0 0 22px">Hola ${escH(name)}, recibimos una solicitud para cambiar la contraseña de tu cuenta. El enlace vence en 30 minutos y sirve una sola vez.</p>
<a href="${escH(link)}" style="display:inline-block;background:#b8321c;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:999px">Elegir una nueva contraseña</a>
<p style="font-size:13px;line-height:1.5;color:#5b6b62;margin:24px 0 0">Si el botón no funciona, copia este enlace en tu navegador:<br><span style="word-break:break-all">${escH(link)}</span></p>
<p style="font-size:13px;line-height:1.5;color:#5b6b62;margin:18px 0 0">Si no lo pediste tú, ignora este correo: tu contraseña no cambia.</p></td></tr>
</table><p style="font-size:12px;color:#8a978f;margin-top:16px">Lucioni Capital · Herramienta educativa, no es asesoría financiera.</p></td></tr></table></body></html>`;
  return { html, text };
}
const clean = (s, n) => String(s || '').replace(/[<>]/g, '').trim().slice(0, n);

export default async function handler(req, res) {
  if (req.method !== 'POST') return err(res, 405, 'method', 'Método no permitido.');
  if (!SECRET || !process.env.BLOB_READ_WRITE_TOKEN) return err(res, 503, 'not_configured', 'Las cuentas no están configuradas en el servidor.');
  const b = await body(req), a = b.action, ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  try {
    if (a === 'register') {
      const email = clean(b.email, 254).toLowerCase(), pw = String(b.password || ''), name = clean(b.name, 40);
      if (!EMAIL_RE.test(email)) return err(res, 400, 'email', 'Escribe un correo válido.');
      if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return err(res, 400, 'password', 'La contraseña debe tener al menos 8 caracteres, con letras y números.');
      if (!name) return err(res, 400, 'name', 'Escribe tu nombre.');
      if (limited('reg:' + ip, 8)) return err(res, 429, 'rate', 'Demasiados intentos. Espera unos minutos.');
      const uid = uidOf(email);
      if (await readJSON(`users/${uid}/profile.json`)) return err(res, 409, 'exists', 'Ya existe una cuenta con ese correo. Inicia sesión.');
      const salt = crypto.randomBytes(16).toString('hex');
      const u = { email, name, risk: ['conservador', 'moderado', 'agresivo'].includes(b.risk) ? b.risk : 'moderado', cur: pick(b.cur, CURS, 'USD'), goal: clean(b.goal, 60), since: Date.now(), lang: pick(b.lang, LANGS, 'es'), country: clean(b.country, 2).toUpperCase(), tz: clean(b.tz, 60), level: pick(b.level, LEVELS, 'principiante'), sub: { status: 'none' }, pw: { s: salt, h: await hashPw(pw, salt) } };
      const code = setCode(u);
      await writeJSON(`users/${uid}/profile.json`, u); await audit(uid, 'account_created');
      return send(res, 200, { token: sign(uid), profile: pub(u), state: null, updatedAt: 0, recovery: code });
    }
    if (a === 'login') {
      const email = clean(b.email, 254).toLowerCase(), pw = String(b.password || '');
      if (limited('login:' + ip + ':' + email) || limited('ip:' + ip, 30)) return err(res, 429, 'rate', 'Demasiados intentos. Espera unos minutos.');
      const uid = uidOf(email), u = await readJSON(`users/${uid}/profile.json`);
      const h = u ? await hashPw(pw, u.pw.s) : await hashPw(pw, 'x'.repeat(32));
      if (!u || !crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(u.pw.h, 'hex'))) return err(res, 401, 'invalid', 'Correo o contraseña incorrectos.');
      const st = await readJSON(`users/${uid}/state.json`);
      return send(res, 200, { token: sign(uid), profile: pub(u), state: st?.state || null, updatedAt: st?.updatedAt || 0 });
    }
    if (a === 'mailstatus') return send(res, 200, { mail: mailReady() });
    if (a === 'forgot') {
      const email = clean(b.email, 254).toLowerCase();
      if (!EMAIL_RE.test(email)) return err(res, 400, 'email', 'Escribe un correo válido.');
      if (!mailReady()) return err(res, 503, 'no_mail', 'El envío de correos aún no está configurado. Usa tu código de recuperación.');
      if (limited('forgot:' + ip, 6) || limited('forgot:' + email, 3)) return err(res, 429, 'rate', 'Demasiadas solicitudes. Espera unos minutos.');
      const uid = uidOf(email), u = await readJSON(`users/${uid}/profile.json`);
      if (u) {
        const tok = crypto.randomBytes(32).toString('base64url');
        u.reset = { h: crypto.createHash('sha256').update(tok).digest('hex'), exp: Date.now() + 30 * 60_000 };
        await writeJSON(`users/${uid}/profile.json`, u);
        const link = `${APP_URL}/#reset?u=${uid}&t=${tok}`, m = resetMail(u.name || '', link);
        try { await sendMail(u.email, 'Cambia tu contraseña de Lucioni Capital', m.html, m.text); }
        catch (e) { console.error('mail', String(e && e.message)); return err(res, 502, 'mail_failed', 'No pudimos enviar el correo. Intenta en un momento o usa tu código de recuperación.'); }
      }
      // misma respuesta exista o no la cuenta, para no revelar qué correos están registrados
      return send(res, 200, { ok: true });
    }
    if (a === 'resetlink') {
      const uid = String(b.uid || ''), tok = String(b.token || ''), nw = String(b.next || '');
      if (!/^[a-f0-9]{40}$/.test(uid) || tok.length < 20) return err(res, 400, 'link', 'El enlace no es válido.');
      if (limited('rlink:' + ip, 10)) return err(res, 429, 'rate', 'Demasiados intentos. Espera unos minutos.');
      const u = await readJSON(`users/${uid}/profile.json`);
      const h = crypto.createHash('sha256').update(tok).digest('hex');
      if (!u || !u.reset || u.reset.exp < Date.now() || !crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(u.reset.h, 'hex'))) return err(res, 401, 'link', 'El enlace venció o ya se usó. Pide uno nuevo.');
      if (nw.length < 8 || !/[A-Za-z]/.test(nw) || !/\d/.test(nw)) return err(res, 400, 'password', 'La nueva contraseña debe tener al menos 8 caracteres, con letras y números.');
      const salt = crypto.randomBytes(16).toString('hex'); u.pw = { s: salt, h: await hashPw(nw, salt) }; delete u.reset;
      await writeJSON(`users/${uid}/profile.json`, u);
      const st = await readJSON(`users/${uid}/state.json`);
      return send(res, 200, { token: sign(uid), profile: pub(u), state: st?.state || null, updatedAt: st?.updatedAt || 0 });
    }
    if (a === 'reset') {
      const email = clean(b.email, 254).toLowerCase(), nw = String(b.next || '');
      if (limited('reset:' + ip, 8) || limited('reset:' + email, 5)) return err(res, 429, 'rate', 'Demasiados intentos. Espera unos minutos.');
      const uid = uidOf(email), u = await readJSON(`users/${uid}/profile.json`);
      const ok = u && u.rc && crypto.timingSafeEqual(Buffer.from(codeHash(b.code, u.rc.s), 'hex'), Buffer.from(u.rc.h, 'hex'));
      if (!ok) return err(res, 401, 'invalid', 'El correo o el código de recuperación no coinciden.');
      if (nw.length < 8 || !/[A-Za-z]/.test(nw) || !/\d/.test(nw)) return err(res, 400, 'password', 'La nueva contraseña debe tener al menos 8 caracteres, con letras y números.');
      const salt = crypto.randomBytes(16).toString('hex'); u.pw = { s: salt, h: await hashPw(nw, salt) }; const code = setCode(u);
      await writeJSON(`users/${uid}/profile.json`, u);
      const st = await readJSON(`users/${uid}/state.json`);
      return send(res, 200, { token: sign(uid), profile: pub(u), state: st?.state || null, updatedAt: st?.updatedAt || 0, recovery: code });
    }
    const uid = verify(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
    if (!uid) return err(res, 401, 'session', 'Tu sesión expiró. Vuelve a iniciar sesión.');
    const u = await readJSON(`users/${uid}/profile.json`);
    if (!u) return err(res, 401, 'session', 'La cuenta ya no existe.');
    if (a === 'me') { const st = await readJSON(`users/${uid}/state.json`); return send(res, 200, { profile: pub(u), state: st?.state || null, updatedAt: st?.updatedAt || 0 }); }
    if (a === 'save') {
      if (b.profile) { u.name = clean(b.profile.name, 40) || u.name; if (['conservador', 'moderado', 'agresivo'].includes(b.profile.risk)) u.risk = b.profile.risk; u.cur = pick(b.profile.cur, CURS, u.cur || 'USD'); u.goal = clean(b.profile.goal, 60); if (b.profile.lang) u.lang = pick(b.profile.lang, LANGS, 'es'); if (b.profile.level) u.level = pick(b.profile.level, LEVELS, 'principiante'); if (b.profile.country != null) u.country = clean(b.profile.country, 2).toUpperCase(); if (b.profile.tz != null) u.tz = clean(b.profile.tz, 60); if (b.profile.prefs) u.prefs = { notif: b.profile.prefs.notif !== false, analytics: b.profile.prefs.analytics !== false }; await writeJSON(`users/${uid}/profile.json`, u); }
      if (b.state && Array.isArray(b.state.pfs) && b.state.pfs.length > entitlements(u).limits.portfolios) return err(res, 403, 'premium_required', `Tu plan permite ${entitlements(u).limits.portfolios} cartera(s). Activa Premium para tener más.`);
      let trimmed = 0; const al = b.state?.trd?.alerts, lim = entitlements(u).limits.alerts;
      if (Array.isArray(al) && al.length > lim) { trimmed = al.length - lim; b.state.trd.alerts = al.slice(0, lim); } // Watchtower: el servidor aplica el límite del plan
      /* Strategy Lab: el servidor aplica el límite del plan sin borrar nada. Se conservan siempre las estrategias que ya existían
         (por ejemplo, tras volver de Premium a Free) y se rechazan solo las nuevas por encima del límite. */
      let limited = null;
      if (b.state && b.state.slab != null) {
        const raw = b.state.slab, sl = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : raw;
        if (sl && Array.isArray(sl.list)) {
          const prevSt = (await readJSON(`users/${uid}/state.json`))?.state?.slab, prev = typeof prevSt === 'string' ? (() => { try { return JSON.parse(prevSt); } catch { return null; } })() : prevSt;
          const had = new Set((prev?.list || []).map(x => x && x.id)), sLim = entitlements(u).limits.strategies ?? 3;
          let room = Math.max(0, sLim - sl.list.filter(x => had.has(x && x.id)).length), cut = 0;
          const keep = sl.list.filter(x => { if (had.has(x && x.id)) return true; if (room > 0) { room--; return true; } cut++; return false; });
          if (cut) { sl.list = keep; b.state.slab = typeof raw === 'string' ? JSON.stringify(sl) : sl; limited = { strategies: cut, limit: sLim }; }
        }
      }
      if (b.state) { const s = JSON.stringify(b.state); if (s.length > MAX_STATE) return err(res, 413, 'too_big', 'Tus datos superan el límite.'); const at = Date.now(); await writeJSON(`users/${uid}/state.json`, { state: b.state, updatedAt: at }); return send(res, 200, { ok: true, updatedAt: at, profile: pub(u), ...(trimmed ? { trimmed: { alerts: trimmed } } : {}), ...(limited ? { limited } : {}) }); }
      return send(res, 200, { ok: true, profile: pub(u) });
    }
    if (a === 'password') {
      const cur = String(b.current || ''), nw = String(b.next || '');
      if (!crypto.timingSafeEqual(Buffer.from(await hashPw(cur, u.pw.s), 'hex'), Buffer.from(u.pw.h, 'hex'))) return err(res, 401, 'invalid', 'La contraseña actual no es correcta.');
      if (nw.length < 8 || !/[A-Za-z]/.test(nw) || !/\d/.test(nw)) return err(res, 400, 'password', 'La nueva contraseña debe tener al menos 8 caracteres, con letras y números.');
      const salt = crypto.randomBytes(16).toString('hex'); u.pw = { s: salt, h: await hashPw(nw, salt) }; await writeJSON(`users/${uid}/profile.json`, u); await audit(uid, 'password_changed');
      return send(res, 200, { ok: true });
    }
    if (a === 'recovery') {
      if (!crypto.timingSafeEqual(Buffer.from(await hashPw(String(b.password || ''), u.pw.s), 'hex'), Buffer.from(u.pw.h, 'hex'))) return err(res, 401, 'invalid', 'La contraseña no es correcta.');
      const code = setCode(u); await writeJSON(`users/${uid}/profile.json`, u); return send(res, 200, { ok: true, recovery: code });
    }
    if (a === 'delete') {
      if (!crypto.timingSafeEqual(Buffer.from(await hashPw(String(b.password || ''), u.pw.s), 'hex'), Buffer.from(u.pw.h, 'hex'))) return err(res, 401, 'invalid', 'La contraseña no es correcta.');
      await del([`users/${uid}/profile.json`, `users/${uid}/state.json`]).catch(() => {});
      await delPrefix(`users/${uid}/`).catch(() => {}); await delPrefix(`usage/${uid}/`).catch(() => {});
      return send(res, 200, { ok: true });
    }
    if (a === 'plan') return send(res, 200, { sub: entitlements(u), plans: PLANS, trialDays: TRIAL_DAYS, billing: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID), price: process.env.PREMIUM_PRICE_LABEL || null });
    if (a === 'trial') {
      const e = entitlements(u);
      if (e.plan === 'premium') return err(res, 409, 'already', 'Ya tienes Premium activo.');
      const tk = `trials/${trialKey(u.email)}.json`;
      if (u.sub?.trialUsed || await readJSON(tk)) return err(res, 409, 'trial_used', 'La prueba gratuita ya se usó con este correo.');
      if (limited('trial:' + ip, 10, 3600_000)) return err(res, 429, 'rate', 'Demasiados intentos. Espera unos minutos.');
      const now = Date.now(); u.sub = { ...(u.sub || {}), status: 'trialing', source: 'trial', trialStart: now, trialEnd: now + TRIAL_DAYS * 864e5, trialUsed: true };
      await writeJSON(`users/${uid}/profile.json`, u); await writeJSON(tk, { at: now }); await audit(uid, 'trial_started', { end: u.sub.trialEnd });
      return send(res, 200, { ok: true, profile: pub(u) });
    }
    if (a === 'cancel') {
      if (u.sub?.source === 'stripe') return err(res, 409, 'use_portal', 'Tu suscripción de pago se cancela desde el portal de pagos.');
      if (u.sub?.status !== 'trialing') return err(res, 409, 'nothing', 'No tienes una prueba activa.');
      u.sub = { ...u.sub, status: 'canceled', canceledAt: Date.now() }; await writeJSON(`users/${uid}/profile.json`, u); await audit(uid, 'trial_canceled');
      return send(res, 200, { ok: true, profile: pub(u) });
    }
    if (a === 'export') {
      if (limited('export:' + uid, 5)) return err(res, 429, 'rate', 'Demasiadas exportaciones seguidas.');
      const st = await readJSON(`users/${uid}/state.json`), au = (await readJSON(`users/${uid}/audit.json`)) || [];
      const fm = await readJSON(`users/${uid}/fin/meta.json`), ftx = {}; for (const y of (fm && fm.years) || []) ftx[y] = ((await readJSON(`users/${uid}/fin/tx-${y}.json`)) || { txs: [] }).txs;
      const docs = ((await readJSON(`users/${uid}/docs/index.json`)) || { docs: [] }).docs.map(({ text, ...d }) => ({ ...d, versions: d.versions.map(({ path, ...v }) => v) }));
      const intel = { consent: await readJSON(`users/${uid}/intel/consent.json`), log: await readJSON(`users/${uid}/intel/log.json`), reports: await readJSON(`users/${uid}/intel/reports.json`) };
      await audit(uid, 'data_exported');
      return send(res, 200, { exportedAt: new Date().toISOString(), app: 'Lucioni Capital', profile: pub(u), state: st?.state || null, updatedAt: st?.updatedAt || 0, finance: fm ? { meta: fm, transactions: ftx } : null, intelligence: intel, documents: { note: 'Los archivos se descargan desde Document Vault; aquí van sus datos.', docs }, activity: au });
    }
    return err(res, 400, 'action', 'Acción no válida.');
  } catch (e) {
    return err(res, 500, 'server', 'Error del servidor. Intenta de nuevo.');
  }
}
