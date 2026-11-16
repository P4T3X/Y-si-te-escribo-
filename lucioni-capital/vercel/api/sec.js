// Lucioni Capital — datos públicos de la SEC y de la Cámara de Representantes de EE.UU.
// Métodos adaptados de las 11 skills "Trader Skill" (github.com/Jakeschincariol/trader-skill, licencia MIT):
//   ?f13=CIK      → cartera del último 13F-HR de un inversor y cambios frente al trimestre anterior (trader-copycat)
//   ?k8=SYM       → últimos 8-K de una empresa con sus ítems (trader-news)
//   ?xbrl=SYM     → resultados trimestrales reportados en XBRL: ingresos, márgenes, BPA, crecimiento (trader-analyst)
//   ?ptr=1        → últimas declaraciones de operaciones bursátiles de congresistas (trader-pelosi)
import zlib from 'node:zlib';

const UA = process.env.SEC_USER_AGENT || 'LucioniCapital/1.0 (+https://lucioni-capital.vercel.app)';
const cache = new Map();
const sleep = ms => new Promise(r => setTimeout(r, ms));
let lastSec = 0;
async function get(url, { ttl = 3600_000, as = 'json', sec = true } = {}) {
  const c = cache.get(url);
  if (c && Date.now() - c.t < ttl) return c.v;
  if (sec) { const w = 120 - (Date.now() - lastSec); if (w > 0) await sleep(w); lastSec = Date.now(); } // la SEC pide máx. 10 req/s
  const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA, accept: as === 'json' ? 'application/json' : '*/*' }, signal: ctrl.signal });
    if (!r.ok) throw new Error('status ' + r.status);
    const v = as === 'json' ? await r.json() : as === 'buf' ? Buffer.from(await r.arrayBuffer()) : await r.text();
    cache.set(url, { t: Date.now(), v });
    return v;
  } finally { clearTimeout(to); }
}
const send = (res, s, b, age = 0) => { res.statusCode = s; res.setHeader('content-type', 'application/json; charset=utf-8'); res.setHeader('cache-control', age ? `public, s-maxage=${age}, stale-while-revalidate=${age * 2}` : 'no-store'); res.end(JSON.stringify(b)); };
const cik10 = v => String(v).replace(/\D/g, '').padStart(10, '0');

/* ---------- tickers ---------- */
const ABBREV = { AMER: 'AMERICA', AMERN: 'AMERICAN', FINL: 'FINANCIAL', FIN: 'FINANCIAL', PETE: 'PETROLEUM', HLDGS: 'HOLDINGS', HLDG: 'HOLDING', HOLDG: 'HOLDING', INTL: 'INTERNATIONAL', GRP: 'GROUP', SVCS: 'SERVICES', SVC: 'SERVICE', SYS: 'SYSTEMS', MGMT: 'MANAGEMENT', INDS: 'INDUSTRIES', NATL: 'NATIONAL', ENTMT: 'ENTERTAINMENT', PAC: 'PACIFIC', LABS: 'LABORATORIES', PPTYS: 'PROPERTIES', RLTY: 'REALTY', TECHS: 'TECHNOLOGIES', TECH: 'TECHNOLOGY', COMMNS: 'COMMUNICATIONS', COMMUNICATN: 'COMMUNICATIONS', MFG: 'MANUFACTURING', ELEC: 'ELECTRIC', PHARMS: 'PHARMACEUTICALS', BANCORPORATION: 'BANCORP', RES: 'RESOURCES', WTR: 'WATER', MTRS: 'MOTORS', AIRLS: 'AIRLINES', CHEM: 'CHEMICAL' };
const DROP = new Set(['INC', 'INCORPORATED', 'CORP', 'CORPORATION', 'CO', 'COMPANY', 'LTD', 'LIMITED', 'PLC', 'LLC', 'LP', 'SA', 'NV', 'AG', 'SE', 'THE', 'AND', 'OF']);
const NONCOMMON = /-P[A-Z]*$|-WT[A-Z]*$|-WS$|-U$|-UN$|-R$|-RT$/;
const CLASSES = { '02079K305': 'GOOGL', '02079K107': 'GOOG', '084670108': 'BRK.A', '084670702': 'BRK.B', '526057104': 'LEN', '526057302': 'LEN.B', '530909100': 'LLYVA', '530909308': 'LLYVK', '531229755': 'FWONK', '35137L105': 'FOXA', '35137L204': 'FOX', '65249B109': 'NWSA', '65249B208': 'NWS', '904311107': 'UAA', '904311206': 'UA', '422806109': 'HEI', '422806208': 'HEI.A', '98954M101': 'ZG', '98954M200': 'Z', '115637100': 'BF.A', '115637209': 'BF.B' };
function normName(n) { let s = (n || '').toUpperCase().replace(/&/g, ' AND '); for (let i = 0; i < 2; i++) s = s.replace(/\s*\/\s*[A-Z]{2,5}\s*\/?\s*$/, ''); s = s.replace(/['’]/g, '').replace(/[^A-Z0-9 ]+/g, ' ');
  return s.split(/\s+/).filter(Boolean).map(w => ABBREV[w] || w).filter(w => !DROP.has(w)); }
const nameKeys = n => { const w = normName(n); return [w.join(''), [...w].sort().join(' ')]; };
const normTicker = t => { t = (t || '').trim().toUpperCase(); return NONCOMMON.test(t) ? t : t.replace(/[-/ ]([A-Z]{1,2})$/, '.$1'); };
let TIX = null;
async function tickerIndex() {
  if (TIX && Date.now() - TIX.t < 86400_000) return TIX;
  const data = await get('https://www.sec.gov/files/company_tickers.json', { ttl: 86400_000 });
  const byCik = new Map(), titles = new Map(), spaceless = new Map(), sorted = new Map(), byTicker = new Map();
  for (const v of Object.values(data)) { const c = cik10(v.cik_str); if (!byCik.has(c)) byCik.set(c, []); byCik.get(c).push(v.ticker); byTicker.set(v.ticker.toUpperCase(), { cik: c, title: v.title });
    if (titles.has(c)) continue; titles.set(c, v.title); const [a, b] = nameKeys(v.title); if (a) { if (!spaceless.has(a)) spaceless.set(a, new Set()); spaceless.get(a).add(c); if (!sorted.has(b)) sorted.set(b, new Set()); sorted.get(b).add(c); } }
  TIX = { t: Date.now(), byCik, titles, spaceless, sorted, byTicker };
  return TIX;
}
function matchCik(ix, issuer) {
  const [a, b] = nameKeys(issuer); if (!a) return null;
  for (const hits of [ix.spaceless.get(a), ix.sorted.get(b)]) if (hits && hits.size === 1) return [...hits][0];
  const best = []; for (const [key, ciks] of ix.spaceless) if (key.length >= 8 && ciks.size === 1 && (a.startsWith(key) || key.startsWith(a))) best.push([key.length, [...ciks][0]]);
  best.sort((x, y) => y[0] - x[0]); if (best.length && (best.length === 1 || best[0][0] > best[1][0])) return best[0][1];
  return null;
}
function tickerFor(ix, cik, title) {
  const tk = ix.byCik.get(cik) || []; const c = tk.filter(t => !NONCOMMON.test(t)); const cands = c.length ? c : tk;
  if (!cands.length) return null; if (cands.length === 1 || cands.slice(1).every(t => t.startsWith(cands[0]))) return normTicker(cands[0]);
  const m = /\b(?:CL|CLASS|SER|SERIES)\s*([A-Z])\b/.exec((title || '').toUpperCase());
  if (m) { const L = m[1]; const hit = cands.find(t => /[-./]/.test(t) && t.toUpperCase().endsWith(L)) || cands.find(t => t.length >= 4 && t.toUpperCase().endsWith(L)); if (hit) return normTicker(hit); }
  return normTicker(cands[0]);
}
async function cikOf(sym) { const ix = await tickerIndex(); const r = ix.byTicker.get(sym.toUpperCase()) || ix.byTicker.get(sym.toUpperCase().replace('.', '-')); return r ? r : null; }

/* ---------- 13F (trader-copycat) ---------- */
function parseInfoTable(xml, mult) {
  const rows = []; const re = /<(?:\w+:)?infoTable\b[^>]*>([\s\S]*?)<\/(?:\w+:)?infoTable>/g; let m;
  const tag = (s, n) => { const r = new RegExp(`<(?:\\w+:)?${n}\\b[^>]*>([^<]*)<`).exec(s); return r ? r[1].trim() : ''; };
  while ((m = re.exec(xml))) { const s = m[1];
    rows.push({ issuer: tag(s, 'nameOfIssuer'), title: tag(s, 'titleOfClass'), cusip: tag(s, 'cusip').toUpperCase(), value: parseFloat(tag(s, 'value').replace(/,/g, '') || '0') * mult,
      shares: parseFloat(tag(s, 'sshPrnamt').replace(/,/g, '') || '0'), type: (tag(s, 'sshPrnamtType') || 'SH').toUpperCase(), pc: tag(s, 'putCall').toUpperCase() }); }
  return rows;
}
function aggregate(rows) {
  const total = rows.reduce((a, r) => a + r.value, 0), g = new Map();
  for (const r of rows) { const k = r.cusip + '|' + r.pc + '|' + r.type; if (!g.has(k)) g.set(k, { ...r, value: 0, shares: 0 }); const p = g.get(k); p.value += r.value; p.shares += r.shares; }
  return { pos: [...g.values()].sort((a, b) => b.value - a.value), total };
}
async function load13F(cik, sub, filing) {
  const base = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik, 10)}/${filing.accession.replace(/-/g, '')}/`;
  const idx = await get(base + 'index.json', { ttl: 30 * 86400_000 });
  const names = (idx.directory?.item || []).map(i => i.name);
  const xmls = names.filter(n => /\.xml$/i.test(n) && !/^(primary_doc|filingsummary)\.xml$/i.test(n));
  const name = xmls.find(n => /info|table|13f/i.test(n)) || xmls[0];
  if (!name) throw new Error('sin tabla de información');
  const xml = await get(base + name, { ttl: 30 * 86400_000, as: 'text' });
  const mult = filing.filed >= '2023-01-03' ? 1 : 1000;
  return { ...aggregate(parseInfoTable(xml, mult)), url: base };
}
async function f13(cik) {
  const C = cik10(cik);
  const sub = await get(`https://data.sec.gov/submissions/CIK${C}.json`, { ttl: 6 * 3600_000 });
  const rec = sub.filings?.recent || {}; const fl = [];
  (rec.form || []).forEach((f, i) => { if (f === '13F-HR') fl.push({ accession: rec.accessionNumber[i], filed: rec.filingDate[i], period: rec.reportDate?.[i] || '' }); });
  fl.sort((a, b) => (b.period + b.filed).localeCompare(a.period + a.filed));
  const uniq = []; for (const f of fl) if (!uniq.some(u => u.period === f.period)) uniq.push(f);
  if (!uniq.length) throw Object.assign(new Error('Este inversor no tiene un 13F-HR reciente.'), { code: 'no13f' });
  const cur = await load13F(C, sub, uniq[0]); const prev = uniq[1] ? await load13F(C, sub, uniq[1]).catch(() => null) : null;
  const ix = await tickerIndex();
  const stock = p => p.type === 'SH' && !p.pc;
  // combinar clases del mismo emisor (6 primeros caracteres del CUSIP) y resolver tickers
  const resolve = p => CLASSES[p.cusip] || (() => { const c = matchCik(ix, p.issuer); return c ? tickerFor(ix, c, p.title) : null; })();
  const combine = (list, total) => { const out = [], by = new Map();
    for (const p of list) { if (!stock(p)) continue; const k = p.cusip.slice(0, 6); const t = resolve(p);
      if (!by.has(k)) { const q = { issuer: p.issuer, cusip: p.cusip, ticker: t, tickers: t ? [t] : [], value: p.value, shares: p.shares, big: p.value }; by.set(k, q); out.push(q); }
      else { const q = by.get(k); q.value += p.value; q.shares += p.shares; if (t && !q.tickers.includes(t)) q.tickers.push(t); if (p.value > q.big) { q.big = p.value; q.ticker = t || q.ticker; } } }
    out.forEach(q => { q.pct = total ? 100 * q.value / total : 0; delete q.big; }); return out.sort((a, b) => b.value - a.value); };
  const now = combine(cur.pos, cur.total), before = prev ? combine(prev.pos, prev.total) : [];
  const bmap = new Map(before.map(p => [p.cusip.slice(0, 6), p]));
  const nmap = new Map(now.map(p => [p.cusip.slice(0, 6), p]));
  const status = p => { const q = bmap.get(p.cusip.slice(0, 6)); if (!prev) return null; if (!q) return { s: 'NEW' }; if (p.shares > q.shares) return { s: 'ADDED', ch: (p.shares - q.shares) / q.shares }; if (p.shares < q.shares) return { s: 'TRIMMED', ch: (p.shares - q.shares) / q.shares }; return { s: 'SAME' }; };
  const sold = prev ? before.filter(q => !nmap.has(q.cusip.slice(0, 6))).slice(0, 15).map(q => ({ issuer: q.issuer, ticker: q.ticker, value: q.value })) : [];
  return { cik: C, name: sub.name, period: uniq[0].period, filed: uniq[0].filed, prevPeriod: uniq[1]?.period || null, url: cur.url,
    total: cur.total, count: now.length, nonStock: cur.pos.filter(p => !stock(p)).length,
    positions: now.slice(0, 60).map(p => ({ issuer: p.issuer, ticker: p.ticker, tickers: p.tickers, value: p.value, shares: p.shares, pct: +p.pct.toFixed(2), chg: status(p) })), sold };
}

/* ---------- 8-K (trader-news) ---------- */
const ITEMS = { '1.01': 'Acuerdo material', '1.02': 'Fin de un acuerdo material', '1.03': 'Quiebra', '1.05': 'Incidente de ciberseguridad', '2.01': 'Compra o venta de activos', '2.02': 'Resultados financieros', '2.03': 'Nueva deuda', '2.05': 'Reestructuración', '2.06': 'Deterioro de activos', '3.01': 'Aviso de exclusión de bolsa', '3.02': 'Venta de acciones no registrada', '3.03': 'Cambio en derechos de accionistas', '4.01': 'Cambio de auditor', '4.02': 'Estados financieros no confiables', '5.01': 'Cambio de control', '5.02': 'Cambio de directivos', '5.03': 'Cambio de estatutos', '5.07': 'Votación de accionistas', '7.01': 'Comunicación al mercado (Reg FD)', '8.01': 'Otros eventos', '9.01': 'Estados financieros y anexos' };
async function k8(sym) {
  const r = await cikOf(sym); if (!r) throw Object.assign(new Error('Símbolo no encontrado en la SEC.'), { code: 'nosym' });
  const sub = await get(`https://data.sec.gov/submissions/CIK${r.cik}.json`, { ttl: 1800_000 });
  const rec = sub.filings?.recent || {}; const out = [];
  (rec.form || []).forEach((f, i) => { if (!/^(8-K|10-Q|10-K|6-K|20-F)(\/A)?$/.test(f) || out.length >= 12) return;
    const acc = rec.accessionNumber[i]; const items = String(rec.items?.[i] || '').split(',').map(s => s.trim()).filter(Boolean);
    out.push({ form: f, date: rec.filingDate[i], acc, items: items.map(x => ({ c: x, t: ITEMS[x] || '' })), desc: rec.primaryDocDescription?.[i] || '',
      url: `https://www.sec.gov/Archives/edgar/data/${parseInt(r.cik, 10)}/${acc.replace(/-/g, '')}/${rec.primaryDocument?.[i] || ''}` }); });
  return { s: sym.toUpperCase(), name: sub.name, cik: r.cik, filings: out };
}

/* ---------- XBRL trimestral (trader-analyst) ---------- */
const CONCEPTS = { revenue: ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'RevenuesNetOfInterestExpense', 'RevenueFromContractWithCustomerIncludingAssessedTax', 'SalesRevenueNet', 'SalesRevenueGoodsNet', 'SalesRevenueServicesNet'],
  cost: ['CostOfGoodsAndServicesSold', 'CostOfRevenue', 'CostOfGoodsSold'], gross: ['GrossProfit'], op: ['OperatingIncomeLoss'], net: ['NetIncomeLoss', 'ProfitLoss', 'NetIncomeLossAvailableToCommonStockholdersBasic'], eps: ['EarningsPerShareDiluted', 'EarningsPerShareBasicAndDiluted'] };
const dd = s => new Date(s + 'T00:00:00Z').getTime() / 864e5;
function quarterly(facts) {
  const latest = new Map(), first = new Map();
  for (const f of facts) { if (!f.start || !/^(10-Q|10-K|20-F|40-F)/.test(f.form || '')) continue; const k = f.start + '|' + f.end, st = (f.filed || '') + (f.accn || '');
    if (!latest.has(k) || st > (latest.get(k).filed || '') + (latest.get(k).accn || '')) latest.set(k, f); if (!first.has(k) || st < (first.get(k).filed || '') + (first.get(k).accn || '')) first.set(k, f); }
  const q = new Map(), years = [];
  for (const [k, f] of latest) { const [s, e] = k.split('|'), d = dd(e) - dd(s), fr = first.get(k);
    if (d >= 80 && d <= 100) q.set(e, { v: f.val, s, e, fy: fr.fy, fp: fr.fp, derived: false }); else if (d >= 350 && d <= 380) years.push([s, e, f, fr]); }
  for (const [s, e, f, fr] of years) { if (q.has(e)) continue; const inside = [...q.values()].filter(v => v.s >= s && v.e < e).sort((a, b) => a.e.localeCompare(b.e));
    if (inside.length !== 3) continue; q.set(e, { v: f.val - inside.reduce((a, v) => a + v.v, 0), s: new Date((dd(inside[2].e) + 1) * 864e5).toISOString().slice(0, 10), e, fy: fr.fy, fp: 'Q4', derived: true }); }
  return q;
}
function series(cf, key) { const unit = key === 'eps' ? 'USD/shares' : 'USD', merged = new Map();
  for (const c of CONCEPTS[key]) { const node = cf.facts?.['us-gaap']?.[c]; if (!node) continue; const u = node.units?.[unit] || Object.values(node.units || {})[0] || [];
    for (const [e, v] of quarterly(u)) if (!merged.has(e)) merged.set(e, v); }
  return merged; }
const yoy = (s, end) => { const t = dd(end) - 365; let best = null; for (const [e, v] of s) { const g = Math.abs(dd(e) - t); if (g <= 10 && (!best || g < best[0])) best = [g, v]; } return best ? best[1].v : null; };
const pctCh = (a, b) => a == null || !b ? null : +(100 * (a - b) / Math.abs(b)).toFixed(1);
const mg = (p, w) => p == null || !w ? null : +(100 * p / w).toFixed(1);
async function xbrl(sym) {
  const r = await cikOf(sym); if (!r) throw Object.assign(new Error('Símbolo no encontrado en la SEC.'), { code: 'nosym' });
  const cf = await get(`https://data.sec.gov/api/xbrl/companyfacts/CIK${r.cik}.json`, { ttl: 12 * 3600_000 });
  const S = {}; for (const k of Object.keys(CONCEPTS)) S[k] = series(cf, k);
  const ends = [...new Set([...S.revenue.keys(), ...S.net.keys()])].sort().reverse().slice(0, 8);
  const rows = ends.map(e => { const rv = S.revenue.get(e)?.v ?? null; let gp = S.gross.get(e)?.v ?? null; if (gp == null && rv != null && S.cost.has(e)) gp = rv - S.cost.get(e).v;
    const op = S.op.get(e)?.v ?? null, ni = S.net.get(e)?.v ?? null, eps = S.eps.get(e)?.v ?? null, b = S.revenue.get(e) || S.net.get(e) || {};
    return { end: e, label: `${b.fp || ''} ${b.fy || ''}`.trim(), derived: !!b.derived, revenue: rv, gross: gp, op, net: ni, eps: eps != null ? +eps.toFixed(2) : null,
      gm: mg(gp, rv), om: mg(op, rv), nm: mg(ni, rv), revYoy: pctCh(rv, yoy(S.revenue, e)), netYoy: pctCh(ni, yoy(S.net, e)), epsYoy: pctCh(eps, yoy(S.eps, e)) }; });
  return { s: sym.toUpperCase(), name: cf.entityName, cik: r.cik, rows };
}

/* ---------- Congreso (trader-pelosi) ---------- */
function unzipFirstXml(buf) {
  // directorio central del ZIP
  let eocd = -1; for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('zip inválido');
  let p = buf.readUInt32LE(eocd + 16); const n = buf.readUInt16LE(eocd + 10);
  for (let k = 0; k < n; k++) { const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20), nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32), off = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nlen).toString(); p += 46 + nlen + xlen + clen;
    if (!/\.xml$/i.test(name)) continue;
    const lh = off, start = lh + 30 + buf.readUInt16LE(lh + 26) + buf.readUInt16LE(lh + 28), data = buf.slice(start, start + csize);
    return method === 0 ? data.toString('utf8') : zlib.inflateRawSync(data).toString('utf8'); }
  throw new Error('sin XML en el zip');
}
const isoMdy = s => { const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s || ''); return m ? `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` : ''; };
async function ptr() {
  const y = new Date().getUTCFullYear(); let rows = [];
  for (const yr of [y, y - 1]) {
    let xml; try { const buf = await get(`https://disclosures-clerk.house.gov/public_disc/financial-pdfs/${yr}FD.zip`, { ttl: 3 * 3600_000, as: 'buf', sec: false }); xml = unzipFirstXml(buf); } catch { continue; }
    const re = /<Member>([\s\S]*?)<\/Member>/g; let m; const t = (s, n) => (new RegExp(`<${n}>([^<]*)</${n}>`).exec(s) || [])[1]?.trim() || '';
    while ((m = re.exec(xml))) { const s = m[1]; if (t(s, 'FilingType') !== 'P') continue; const doc = t(s, 'DocID');
      rows.push({ name: [t(s, 'Prefix'), t(s, 'First'), t(s, 'Last'), t(s, 'Suffix')].filter(Boolean).join(' '), last: t(s, 'Last'), district: t(s, 'StateDst'), filed: isoMdy(t(s, 'FilingDate')), doc, url: `https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/${t(s, 'Year') || yr}/${doc}.pdf` }); }
    if (rows.length >= 80) break;
  }
  rows.sort((a, b) => (b.filed + b.doc).localeCompare(a.filed + a.doc));
  const byMember = {}; rows.forEach(r => byMember[r.name] = (byMember[r.name] || 0) + 1);
  return { at: Date.now(), rows: rows.slice(0, 80), top: Object.entries(byMember).sort((a, b) => b[1] - a[1]).slice(0, 10) };
}

export default async function handler(req, res) {
  const q = new URL(req.url, 'http://x').searchParams, sym = (q.get('k8') || q.get('xbrl') || '').trim();
  try {
    if (q.get('f13')) { const c = q.get('f13'); if (!/^\d{1,10}$/.test(c)) return send(res, 400, { code: 'bad_cik' }); return send(res, 200, await f13(c), 21600); }
    if (q.get('k8') || q.get('xbrl')) { if (!/^[A-Za-z.\-]{1,10}$/.test(sym)) return send(res, 400, { code: 'bad_symbol' }); return send(res, 200, q.get('k8') ? await k8(sym) : await xbrl(sym), q.get('k8') ? 1800 : 21600); }
    if (q.get('ptr')) return send(res, 200, await ptr(), 3600);
    return send(res, 400, { code: 'bad_request' });
  } catch (e) {
    return send(res, e.code ? 404 : 502, { code: e.code || 'upstream', message: e.code ? e.message : 'La fuente pública (SEC o Cámara de Representantes) no respondió. Intenta en un momento.' });
  }
}
