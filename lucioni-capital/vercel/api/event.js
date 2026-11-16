// Lucioni Capital — analítica de producto sin datos personales.
// Solo guarda conteos diarios por evento y un identificador anónimo cifrado (HMAC) para DAU/WAU/MAU y retención.
// Nunca guarda correos, nombres, IP, montos ni contenido de conversaciones.
import crypto from 'node:crypto';
import { send, err, body, readJSON, writeJSON, verify, bearer, uidOf, limited, ipOf, SECRET } from '../lib/core.js';

export const EVENTS = ['app_opened', 'user_returned', 'account_created', 'onboarding_completed', 'portfolio_created', 'ai_analysis_completed', 'daily_briefing_viewed',
  'lesson_completed', 'challenge_completed', 'trial_started', 'premium_activated', 'subscription_cancelled', 'pwa_installed'];
const day = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);
const anon = id => crypto.createHmac('sha256', SECRET || 'lc').update('a:' + id).digest('hex').slice(0, 16);

export default async function handler(req, res) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return send(res, 200, { ok: false, reason: 'storage_off' });
  if (req.method === 'POST') {
    if (limited('ev:' + ipOf(req), 30)) return err(res, 429, 'rate', 'Demasiados eventos.');
    const b = await body(req), id = String(b.aid || '').slice(0, 64);
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
  if (!uid || !admins.includes(uid)) return err(res, 403, 'forbidden', 'Solo administradores.');
  const days = []; for (let i = 0; i < 38; i++) days.push(day(Date.now() - i * 864e5));
  const files = await Promise.all(days.map(dd => readJSON(`analytics/${dd}.json`)));
  const set = i => new Set(Object.keys(files[i]?.u || {}));
  const union = (a, b) => { const s = new Set(); for (let i = a; i < b; i++) set(i).forEach(x => s.add(x)); return s; };
  const ret = n => { const base = set(n), back = set(0); if (!base.size) return null; let k = 0; base.forEach(x => { if (back.has(x)) k++; }); return k / base.size; };
  const sum = (e, n) => files.slice(0, n).reduce((a, f) => a + (f?.c?.[e] || 0), 0);
  const tr = sum('trial_started', 30), pa = sum('premium_activated', 30);
  return send(res, 200, { dau: set(0).size, wau: union(0, 7).size, mau: union(0, 30).size, d1: ret(1), d7: ret(7), d30: ret(30),
    trialConversion30d: tr ? pa / tr : null, events30d: Object.fromEntries(EVENTS.map(e => [e, sum(e, 30)])),
    note: 'Retención Dn = de los usuarios vistos hace n días, fracción vista hoy. MRR y churn se leen en el panel de Stripe cuando los pagos estén activos.' });
}
