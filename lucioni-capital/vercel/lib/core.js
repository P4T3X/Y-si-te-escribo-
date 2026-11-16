// Lucioni Capital — servicios compartidos del servidor: sesiones, almacenamiento, planes y permisos.
// Todo control de Premium se decide aquí, en el servidor; el navegador solo muestra lo que esto responde.
import { put, get, del, list } from '@vercel/blob';
import crypto from 'node:crypto';

export const SECRET = process.env.AUTH_SECRET || '';
export const blobReady = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export const send = (res, s, b, extra = {}) => {
  res.statusCode = s; res.setHeader('content-type', 'application/json; charset=utf-8'); res.setHeader('cache-control', 'no-store');
  for (const [k, v] of Object.entries(extra)) res.setHeader(k, v);
  res.end(JSON.stringify(b));
};
export const err = (res, s, code, message, more = {}) => send(res, s, { code, message, ...more });

export async function rawBody(req) { const c = []; for await (const x of req) c.push(x); return Buffer.concat(c); }
export async function body(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  try { return JSON.parse((await rawBody(req)).toString('utf8') || '{}'); } catch { return {}; }
}

/* ---------- sesiones firmadas (mismo formato que api/account.js) ---------- */
export function verify(tok) {
  if (!tok || !SECRET) return null; const [p, s] = String(tok).split('.'); if (!p || !s) return null;
  const want = crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
  if (want.length !== s.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(s))) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url').toString()); return d.exp > Date.now() ? d.uid : null; } catch { return null; }
}
export const bearer = req => String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
export const uidOf = email => crypto.createHash('sha256').update('lc:' + String(email).trim().toLowerCase()).digest('hex').slice(0, 40);

/* ---------- almacenamiento privado ---------- */
export async function readJSON(path) {
  const r = await get(path, { access: 'private', useCache: false }).catch(() => null);
  if (!r || r.statusCode !== 200 || !r.stream) return null;
  try { return JSON.parse(await new Response(r.stream).text()); } catch { return null; }
}
export const writeJSON = (path, obj) => put(path, JSON.stringify(obj), { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json' });
export async function delPrefix(prefix) {
  let cursor, n = 0;
  do { const r = await list({ prefix, cursor, limit: 1000 }); const urls = r.blobs.map(b => b.url || b.pathname); if (urls.length) { await del(urls); n += urls.length; } cursor = r.hasMore ? r.cursor : null; } while (cursor);
  return n;
}
export { del };

/* ---------- límites de abuso por instancia ---------- */
const hitsMap = new Map();
export function limited(key, max, windowMs = 10 * 60_000) {
  const now = Date.now(), l = (hitsMap.get(key) || []).filter(t => now - t < windowMs);
  if (l.length >= max) return true; l.push(now); hitsMap.set(key, l); return false;
}
export const ipOf = req => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';

/* ---------- planes: un solo lugar para los límites ----------
   Se pueden cambiar sin tocar el código con la variable PLAN_LIMITS (JSON con las mismas claves). */
const DEFAULT_PLANS = {
  free: { aiDaily: 15, deepResearch: false, academyAdvanced: false, portfolios: 1, alerts: 5, finAccounts: 5, finTxYear: 3000, properties: 2, intelDaily: 3, label: 'Lucioni Free' },
  premium: { aiDaily: 150, deepResearch: true, academyAdvanced: true, portfolios: 10, alerts: 50, finAccounts: 50, finTxYear: 50000, properties: 50, intelDaily: 30, label: 'Lucioni Premium' },
};
export const PLANS = (() => {
  try { const o = JSON.parse(process.env.PLAN_LIMITS || '{}'); return { free: { ...DEFAULT_PLANS.free, ...(o.free || {}) }, premium: { ...DEFAULT_PLANS.premium, ...(o.premium || {}) } }; }
  catch { return DEFAULT_PLANS; }
})();
export const TRIAL_DAYS = 7;
export const ANON_AI_DAILY = 5;

/* Estado de suscripción del usuario → plan efectivo. Una prueba vencida vuelve a Free sola, sin borrar nada. */
export function subOf(u, now = Date.now()) {
  const s = { status: 'none', trialUsed: false, ...(u && u.sub || {}) };
  let plan = 'free';
  if (s.status === 'trialing') { if (s.trialEnd && now >= s.trialEnd && s.source !== 'stripe') s.status = 'expired'; else if (!s.trialEnd || now < s.trialEnd || s.source === 'stripe') plan = 'premium'; }
  else if (s.source === 'stripe' && s.status === 'active') plan = 'premium';
  // pago atrasado o cancelado: conserva Premium solo hasta el final del período ya pagado
  else if (s.source === 'stripe' && ['past_due', 'canceled'].includes(s.status) && s.periodEnd && now < s.periodEnd) plan = 'premium';
  s.plan = plan; return s;
}
export function entitlements(u) {
  const s = subOf(u), p = PLANS[s.plan] || PLANS.free;
  return { plan: s.plan, label: p.label, status: s.status, trialEnd: s.trialEnd || null, trialUsed: !!s.trialUsed, periodEnd: s.periodEnd || null, source: s.source || null, limits: { ...p } };
}
export const pubSub = u => entitlements(u);

/* Registro de auditoría por usuario (últimos 200 eventos). Nunca guarda contraseñas ni datos de pago. */
export async function audit(uid, type, data = {}) {
  try { const p = `users/${uid}/audit.json`, a = (await readJSON(p)) || []; a.push({ t: Date.now(), type, ...data }); await writeJSON(p, a.slice(-200)); } catch {}
}
export const today = () => new Date().toISOString().slice(0, 10);
