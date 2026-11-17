// Lucioni Capital — analítica de producto sin datos personales.
// Solo guarda conteos diarios por evento y un identificador anónimo cifrado (HMAC) para DAU/WAU/MAU y retención.
// Nunca guarda correos, nombres, IP, montos ni contenido de conversaciones.
import crypto from 'node:crypto';
import { send, err, body, readJSON, writeJSON, verify, bearer, uidOf, limited, ipOf, SECRET } from '../lib/core.js';

const AREAS = ['general', 'finanzas', 'mercados', 'intelligence', 'strategy', 'documentos', 'impuestos', 'metas', 'premium', 'idioma', 'error', 'otro'];
const clean = (s, n) => String(s ?? '').replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
export const EVENTS = ['app_opened', 'user_returned', 'account_created', 'onboarding_completed', 'portfolio_created', 'ai_analysis_completed', 'daily_briefing_viewed',
  'lesson_completed', 'challenge_completed', 'trial_started', 'premium_activated', 'subscription_cancelled', 'pwa_installed'];
const day = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);
const anon = id => crypto.createHmac('sha256', SECRET || 'lc').update('a:' + id).digest('hex').slice(0, 16);

export default async function handler(req, res) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return send(res, 200, { ok: false, reason: 'storage_off' });
  if (req.method === 'POST') {
    const b = await body(req);
    /* beta: comentarios de los usuarios (sin datos personales: no se guarda IP, correo ni cuenta) */
    if (b.kind === 'feedback') {
      if (limited('fb:' + ipOf(req), 5)) return err(res, 429, 'rate', 'Ya enviaste varios comentarios. Gracias; intenta más tarde.');
      const text = clean(b.text, 1000); if (text.length < 3) return err(res, 400, 'bad_request', 'Escribe tu comentario.');
      const p = `feedback/${day()}.json`, L = (await readJSON(p)) || [];
      if (L.length >= 500) return err(res, 429, 'rate', 'Recibimos muchos comentarios hoy. Gracias; intenta mañana.');
      L.push({ t: Date.now(), area: AREAS.includes(b.area) ? b.area : 'otro', rating: Math.min(5, Math.max(0, parseInt(b.rating, 10) || 0)), text, view: clean(b.view, 30), lang: ['es', 'en', 'pt'].includes(b.lang) ? b.lang : 'es', plan: ['free', 'premium', 'anon'].includes(b.plan) ? b.plan : 'anon' });
      await writeJSON(p, L); return send(res, 200, { ok: true });
    }
    /* beta: errores de la app agrupados por mensaje (sin URLs, números ni datos del usuario) */
    if (b.kind === 'error') {
      if (limited('er:' + ipOf(req), 20)) return send(res, 200, { ok: true, dropped: true });
      const msg = clean(b.msg, 200).replace(/https?:\/\/\S+/g, '<url>').replace(/\d+/g, '#'); if (!msg) return err(res, 400, 'bad_request', 'Falta el mensaje.');
      const k = crypto.createHash('sha1').update(msg).digest('hex').slice(0, 12), p = `errors/${day()}.json`, d = (await readJSON(p)) || {};
      const e = d[k] || (d[k] = { msg, n: 0, views: {}, first: Date.now() }); e.n++; e.last = Date.now(); const v = clean(b.view, 30) || '—'; e.views[v] = (e.views[v] || 0) + 1;
      if (Object.keys(d).length <= 300) await writeJSON(p, d); return send(res, 200, { ok: true });
    }
    if (limited('ev:' + ipOf(req), 30)) return err(res, 429, 'rate', 'Demasiados eventos.');
    const id = String(b.aid || '').slice(0, 64);
    if (!/^[a-z0-9-]{8,64}$/i.test(id)) return err(res, 400, 'aid', 'Identificador inválido.');
    const evs = (Array.isArray(b.events) ? b.events : []).map(String).filter(e => EVENTS.includes(e)).slice(0, 30);
    const p = `analytics/${day()}.json`, d = (await readJSON(p)) || { c: {}, u: {} };
    for (const e of evs) d.c[e] = (d.c[e] || 0) + 1;
    d.u[anon(id)] = 1;
    await writeJSON(p, d);
    return send(res, 200, { ok: true });
  }
  /* métricas solo para administradores (ADMIN_EMAILS en Vercel, separados por comas) */
  const uid = verify(bearer(req)), admins = String(process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean).map(uidOf);
  if (new URL(req.url, 'http://x').searchParams.get('me')) return send(res, 200, { admin: !!uid && admins.includes(uid) });
  if (!uid || !admins.includes(uid)) return err(res, 403, 'forbidden', 'Solo administradores.');
  const days = []; for (let i = 0; i < 38; i++) days.push(day(Date.now() - i * 864e5));
  const files = await Promise.all(days.map(dd => readJSON(`analytics/${dd}.json`)));
  const set = i => new Set(Object.keys(files[i]?.u || {}));
  const union = (a, b) => { const s = new Set(); for (let i = a; i < b; i++) set(i).forEach(x => s.add(x)); return s; };
  const ret = n => { const base = set(n), back = set(0); if (!base.size) return null; let k = 0; base.forEach(x => { if (back.has(x)) k++; }); return k / base.size; };
  const sum = (e, n) => files.slice(0, n).reduce((a, f) => a + (f?.c?.[e] || 0), 0);
  const tr = sum('trial_started', 30), pa = sum('premium_activated', 30);
  /* estado de integraciones: solo si cada variable está configurada (nunca su valor) */
  const E = process.env, health = { almacenamiento: !!E.BLOB_READ_WRITE_TOKEN, sesiones: !!E.AUTH_SECRET, ia_gemini: !!E.GEMINI_API_KEY, correo: !!(E.RESEND_API_KEY || (E.SMTP_USER && E.SMTP_PASS)),
    pagos_mercadopago: !!(E.MP_ACCESS_TOKEN && E.MP_WEBHOOK_SECRET && +E.PREMIUM_PRICE_PEN > 0), pagos_stripe_otros_paises: !!(E.STRIPE_SECRET_KEY && E.STRIPE_PRICE_ID && E.STRIPE_WEBHOOK_SECRET), fred: !!E.FRED_API_KEY, administradores: admins.length, limites_personalizados: !!E.PLAN_LIMITS };
  const fb = (await Promise.all(days.slice(0, 14).map(dd => readJSON(`feedback/${dd}.json`)))).flat().filter(Boolean).sort((a, b) => b.t - a.t).slice(0, 100);
  const errsAll = {}; (await Promise.all(days.slice(0, 7).map(dd => readJSON(`errors/${dd}.json`)))).forEach(d => Object.entries(d || {}).forEach(([k, e]) => { const x = errsAll[k] || (errsAll[k] = { msg: e.msg, n: 0, views: {}, last: 0 }); x.n += e.n; x.last = Math.max(x.last, e.last || 0); Object.entries(e.views || {}).forEach(([v, n]) => x.views[v] = (x.views[v] || 0) + n); }));
  const errors = Object.values(errsAll).sort((a, b) => b.n - a.n).slice(0, 30);
  return send(res, 200, { health, feedback: fb, errors, dau: set(0).size, wau: union(0, 7).size, mau: union(0, 30).size, d1: ret(1), d7: ret(7), d30: ret(30),
    trialConversion30d: tr ? pa / tr : null, events30d: Object.fromEntries(EVENTS.map(e => [e, sum(e, 30)])),
    note: 'Retención Dn = de los usuarios vistos hace n días, fracción vista hoy. MRR y churn se leen en el panel de Stripe cuando los pagos estén activos.' });
}
