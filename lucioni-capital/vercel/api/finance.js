// Lucioni Personal Finance + Banking — cuentas, movimientos, categorías, presupuestos y pagos recurrentes por usuario.
// Datos privados en Vercel Blob bajo users/<uid>/fin/; el uid sale SIEMPRE de la sesión firmada, nunca del cuerpo de la petición.
// No guarda credenciales bancarias ni mueve dinero: modo manual e importación de archivos, solo lectura.
import crypto from 'node:crypto';
import { send, err, body, verify, bearer, readJSON, writeJSON, entitlements, audit, limited, ipOf, blobReady } from '../lib/core.js';

const ID = /^[a-z0-9]{6,24}$/;
const CURS = /^[A-Z]{3}$/;
const ACC_TYPES = ['bank', 'savings', 'cash', 'card', 'investment', 'other'];
const FREQ = ['weekly', 'monthly', 'yearly'];
const str = (v, n) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, n);
const num = v => { const n = Number(v); return Number.isFinite(n) && Math.abs(n) < 1e12 ? Math.round(n * 100) / 100 : null; };
const okDate = d => { if (!/^\d{4}-\d{2}-\d{2}$/.test(String(d))) return false; const t = Date.parse(d + 'T12:00:00Z'); if (!t) return false; const y = +d.slice(0, 4); return y >= 1970 && t <= Date.now() + 366 * 864e5 && new Date(t).toISOString().slice(0, 10) === d; };
const normDesc = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\b\d{4,}\b/g, ' ').replace(/\s+/g, ' ').trim();
const hashTx = t => crypto.createHash('sha1').update([t.acc, t.date, t.amt.toFixed(2), normDesc(t.desc)].join('|')).digest('hex').slice(0, 16);
const META0 = () => ({ v: 1, accounts: [], cats: [], budgets: {}, recurring: [], rules: [], settings: { base: 'USD', efMonths: 6 }, updatedAt: 0 });

function cleanMeta(m, lim) {
  const e = [];
  const accounts = (Array.isArray(m.accounts) ? m.accounts : []).map(a => ({ id: String(a.id || ''), name: str(a.name, 60), type: ACC_TYPES.includes(a.type) ? a.type : 'bank', cur: String(a.cur || '').toUpperCase(), open: num(a.open) ?? 0, openDate: okDate(a.openDate) ? a.openDate : null, inst: str(a.inst, 60), emergency: a.emergency === true, archived: a.archived === true }));
  accounts.forEach(a => { if (!ID.test(a.id)) e.push('id de cuenta inválido'); if (!a.name) e.push('cada cuenta necesita un nombre'); if (!CURS.test(a.cur)) e.push(`moneda inválida en ${a.name || 'una cuenta'}`); });
  if (accounts.length > lim.finAccounts) e.push(`Tu plan permite ${lim.finAccounts} cuentas.`);
  if (new Set(accounts.map(a => a.id)).size !== accounts.length) e.push('ids de cuenta repetidos');
  const cats = (Array.isArray(m.cats) ? m.cats : []).slice(0, 120).map(c => ({ id: String(c.id || ''), name: str(c.name, 40), kind: ['inc', 'exp', 'tr'].includes(c.kind) ? c.kind : 'exp' }));
  cats.forEach(c => { if (!/^[a-z0-9_]{2,24}$/.test(c.id) || !c.name) e.push('categoría inválida'); });
  const catIds = new Set(cats.map(c => c.id));
  const budgets = {}; for (const [k, v] of Object.entries(m.budgets || {})) { const n = num(v); if (catIds.has(k) && n != null && n >= 0) budgets[k] = n; }
  const recurring = (Array.isArray(m.recurring) ? m.recurring : []).slice(0, 200).map(r => ({ id: String(r.id || ''), name: str(r.name, 60), amt: num(r.amt), cur: String(r.cur || '').toUpperCase(), freq: FREQ.includes(r.freq) ? r.freq : 'monthly', day: Math.min(31, Math.max(1, parseInt(r.day, 10) || 1)), cat: catIds.has(r.cat) ? r.cat : null, kind: ['sub', 'bill', 'income'].includes(r.kind) ? r.kind : 'bill', next: okDate(r.next) ? r.next : null, active: r.active !== false }));
  recurring.forEach(r => { if (!ID.test(r.id) || !r.name || r.amt == null || !CURS.test(r.cur)) e.push('pago recurrente inválido'); });
  const rules = (Array.isArray(m.rules) ? m.rules : []).slice(0, 300).map(r => ({ k: normDesc(r.k).slice(0, 60), cat: r.cat })).filter(r => r.k.length >= 3 && catIds.has(r.cat));
  const s = m.settings || {}; const settings = { base: CURS.test(String(s.base || '')) ? s.base : 'USD', efMonths: Math.min(24, Math.max(1, parseInt(s.efMonths, 10) || 6)) };
  return { e, meta: { v: 1, accounts, cats, budgets, recurring, rules, settings } };
}
function cleanTx(t, accIds, catIds) {
  const x = { id: String(t.id || ''), acc: String(t.acc || ''), date: String(t.date || ''), amt: num(t.amt), desc: str(t.desc, 140), cat: catIds.has(t.cat) ? t.cat : null, src: ['manual', 'csv', 'recurring'].includes(t.src) ? t.src : 'manual', note: str(t.note, 200) };
  if (!ID.test(x.id)) return [null, 'id de movimiento inválido'];
  if (!accIds.has(x.acc)) return [null, 'la cuenta no existe'];
  if (!okDate(x.date)) return [null, `fecha inválida: ${String(t.date).slice(0, 20)}`];
  if (x.amt == null || x.amt === 0) return [null, 'importe inválido'];
  x.h = hashTx(x); return [x, null];
}
const txPath = (uid, y) => `users/${uid}/fin/tx-${y}.json`;
async function loadYear(uid, y) { return (await readJSON(txPath(uid, y))) || { txs: [] }; }

export default async function handler(req, res) {
  if (req.method !== 'POST') return err(res, 405, 'method', 'Método no permitido.');
  if (!blobReady()) return err(res, 503, 'not_configured', 'El almacenamiento no está configurado.');
  const uid = verify(bearer(req)); if (!uid) return err(res, 401, 'session', 'Inicia sesión para usar tus finanzas.');
  const u = await readJSON(`users/${uid}/profile.json`); if (!u) return err(res, 401, 'session', 'La cuenta ya no existe.');
  if (limited('fin:' + uid, 120, 60_000) || limited('finip:' + ipOf(req), 300, 60_000)) return err(res, 429, 'rate', 'Demasiadas operaciones seguidas.');
  const lim = entitlements(u).limits, b = await body(req), a = b.action;
  const metaPath = `users/${uid}/fin/meta.json`;
  try {
    const meta = (await readJSON(metaPath)) || META0();
    if (a === 'load') {
      const now = new Date().getUTCFullYear();
      const years = (Array.isArray(b.years) ? b.years : [now, now - 1]).map(Number).filter(y => y >= 1970 && y <= now + 1).slice(0, 6);
      const tx = {}; for (const y of years) tx[y] = (await loadYear(uid, y)).txs;
      return send(res, 200, { meta, tx, years: meta.years || [], limits: { finAccounts: lim.finAccounts, finTxYear: lim.finTxYear } });
    }
    if (a === 'meta.save') {
      const { e, meta: m } = cleanMeta(b.meta || {}, lim);
      if (e.length) return err(res, 400, 'invalid', [...new Set(e)].slice(0, 3).join(' · '));
      m.years = meta.years || []; m.updatedAt = Date.now();
      await writeJSON(metaPath, m); return send(res, 200, { ok: true, meta: m });
    }
    if (a === 'tx.add' || a === 'tx.import') {
      const list = Array.isArray(b.txs) ? b.txs : []; if (!list.length || list.length > 2000) return err(res, 400, 'invalid', 'Envía entre 1 y 2000 movimientos.');
      const accIds = new Set(meta.accounts.map(x => x.id)), catIds = new Set(meta.cats.map(x => x.id));
      const byYear = {}, bad = []; let dup = 0;
      for (const t of list) { const [x, e] = cleanTx(t, accIds, catIds); if (!x) { bad.push(e); continue; } (byYear[x.date.slice(0, 4)] ||= []).push(x); }
      if (!Object.keys(byYear).length) return err(res, 400, 'invalid', bad[0] || 'Ningún movimiento válido.');
      let added = 0;
      for (const [y, arr] of Object.entries(byYear)) {
        const f = await loadYear(uid, y); const seenH = new Set(f.txs.map(t => t.h)), seenId = new Set(f.txs.map(t => t.id));
        for (const x of arr) { if (seenId.has(x.id) || (a === 'tx.import' && seenH.has(x.h))) { dup++; continue; } seenH.add(x.h); seenId.add(x.id); f.txs.push(x); added++; }
        if (f.txs.length > lim.finTxYear) return err(res, 403, 'premium_required', `Tu plan permite ${lim.finTxYear} movimientos por año.`);
        f.txs.sort((p, q) => p.date < q.date ? 1 : p.date > q.date ? -1 : 0); await writeJSON(txPath(uid, y), f);
        if (!(meta.years || []).includes(+y)) { meta.years = [...(meta.years || []), +y].sort(); await writeJSON(metaPath, meta); }
      }
      if (a === 'tx.import') await audit(uid, 'finance_import', { added, dup, bad: bad.length });
      return send(res, 200, { ok: true, added, duplicates: dup, rejected: bad.length, errors: [...new Set(bad)].slice(0, 5) });
    }
    if (a === 'tx.update') {
      const y = String(b.year || ''), id = String(b.id || ''); if (!/^\d{4}$/.test(y) || !ID.test(id)) return err(res, 400, 'invalid', 'Movimiento inválido.');
      const f = await loadYear(uid, y), i = f.txs.findIndex(t => t.id === id); if (i < 0) return err(res, 404, 'nf', 'Movimiento no encontrado.');
      const accIds = new Set(meta.accounts.map(x => x.id)), catIds = new Set(meta.cats.map(x => x.id));
      const [x, e] = cleanTx({ ...f.txs[i], ...(b.patch || {}), id }, accIds, catIds); if (!x) return err(res, 400, 'invalid', e);
      if (x.date.slice(0, 4) !== y) { f.txs.splice(i, 1); await writeJSON(txPath(uid, y), f); const g = await loadYear(uid, x.date.slice(0, 4)); g.txs.push(x); await writeJSON(txPath(uid, x.date.slice(0, 4)), g); }
      else { f.txs[i] = x; await writeJSON(txPath(uid, y), f); }
      return send(res, 200, { ok: true, tx: x });
    }
    if (a === 'tx.delete') {
      const y = String(b.year || ''), ids = new Set((Array.isArray(b.ids) ? b.ids : []).map(String)); if (!/^\d{4}$/.test(y) || !ids.size) return err(res, 400, 'invalid', 'Nada que borrar.');
      const f = await loadYear(uid, y), n0 = f.txs.length; f.txs = f.txs.filter(t => !ids.has(t.id)); await writeJSON(txPath(uid, y), f);
      return send(res, 200, { ok: true, deleted: n0 - f.txs.length });
    }
    if (a === 'acc.delete') {
      const id = String(b.id || ''); if (!meta.accounts.some(x => x.id === id)) return err(res, 404, 'nf', 'Cuenta no encontrada.');
      let removed = 0; for (const y of meta.years || []) { const f = await loadYear(uid, y), n0 = f.txs.length; f.txs = f.txs.filter(t => t.acc !== id); removed += n0 - f.txs.length; await writeJSON(txPath(uid, y), f); }
      meta.accounts = meta.accounts.filter(x => x.id !== id); meta.updatedAt = Date.now(); await writeJSON(metaPath, meta); await audit(uid, 'finance_account_deleted', { removed });
      return send(res, 200, { ok: true, removed, meta });
    }
    return err(res, 400, 'action', 'Acción no válida.');
  } catch (e) { return err(res, 500, 'server', 'Error del servidor. Intenta de nuevo.'); }
}
export { cleanMeta, cleanTx, hashTx, normDesc, okDate };
