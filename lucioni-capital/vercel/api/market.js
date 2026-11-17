import { put, get } from '@vercel/blob';
// Lucioni Capital — datos de mercado.
// Fuente: endpoints públicos (no oficiales) de nasdaq.com. Pueden tener unos minutos de retraso y cambiar sin aviso.
// GET /api/market?list=1            → las ~600 empresas más grandes de EE.UU. con precio y variación
// GET /api/market?symbol=AAPL&range=1d|1m|6m|1y → ficha: precio, estadísticas y gráfico

const H = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  accept: 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9',
  origin: 'https://www.nasdaq.com',
  referer: 'https://www.nasdaq.com/',
};
const BASE = 'https://api.nasdaq.com/api';
const cache = new Map();
const num = v => { if (v == null) return null; const n = parseFloat(String(v).replace(/[$,%\s]/g, '')); return Number.isFinite(n) ? n : null; };

async function getJSON(url, ttl) {
  const c = cache.get(url);
  if (c && Date.now() - c.t < ttl) return c.v;
  const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 9000);
  try {
    const r = await fetch(url, { headers: H, signal: ctrl.signal });
    if (!r.ok) throw new Error('status ' + r.status);
    const v = await r.json();
    cache.set(url, { t: Date.now(), v });
    return v;
  } finally { clearTimeout(to); }
}

function send(res, status, body, maxAge = 0) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', maxAge ? `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}` : 'no-store');
  res.end(JSON.stringify(body));
}

async function list() {
  const j = await getJSON(`${BASE}/screener/stocks?tableonly=true&download=true`, 25_000);
  const rows = j?.data?.rows || [];
  const out = rows
    .filter(r => r.symbol && !/[\^\/]/.test(r.symbol) && num(r.marketCap) > 0 && num(r.lastsale) > 0)
    .map(r => ({ s: r.symbol.trim(), n: (r.name || '').replace(/\s+(Common Stock|Class [A-C] Common Stock|Ordinary Shares|American Depositary Shares.*|Common Shares.*)$/i, '').trim(),
      p: num(r.lastsale), c: num(r.netchange), pc: num(r.pctchange), m: num(r.marketCap), v: num(r.volume), sec: r.sector || 'Otros', ind: r.industry || '', co: r.country || '' }))
    .sort((a, b) => b.m - a.m)
    .slice(0, 620);
  return { at: Date.now(), rows: out };
}

const RANGES = { '1m': 31, '6m': 183, '1y': 366, '5y': 1830 };
async function detail(sym, range) {
  const S = encodeURIComponent(sym.toUpperCase());
  const [info, sum] = await Promise.all([
    getJSON(`${BASE}/quote/${S}/info?assetclass=stocks`, 15_000).catch(() => null),
    getJSON(`${BASE}/quote/${S}/summary?assetclass=stocks`, 60_000).catch(() => null),
  ]);
  const pd = info?.data?.primaryData || {};
  const stats = {};
  for (const [k, o] of Object.entries(sum?.data?.summaryData || {})) if (o && o.value != null && o.value !== '' && o.value !== 'N/A') stats[k] = { l: o.label, v: o.value };
  let pts = [];
  try {
    if (range === '1d') {
      const c = await getJSON(`${BASE}/quote/${S}/chart?assetclass=stocks`, 30_000);
      pts = (c?.data?.chart || []).map(p => [p.x, num(p.y)]).filter(p => p[1] != null);
    } else {
      const days = RANGES[range] || 31, to = new Date(), from = new Date(Date.now() - days * 864e5);
      const f = d => d.toISOString().slice(0, 10);
      const h = await getJSON(`${BASE}/quote/${S}/historical?assetclass=stocks&fromdate=${f(from)}&todate=${f(to)}&limit=2000`, 300_000);
      pts = (h?.data?.tradesTable?.rows || []).map(r => [Date.parse(r.date), num(r.close)]).filter(p => p[1] != null && p[0]).reverse();
    }
  } catch { pts = []; }
  if (!info?.data && !pts.length) return null;
  return {
    s: sym.toUpperCase(), n: info?.data?.companyName || '', ex: info?.data?.exchange || '',
    p: num(pd.lastSalePrice), c: num(pd.netChange), pc: num(pd.percentageChange), t: pd.lastTradeTimestamp || '', rt: !!pd.isRealTime,
    st: info?.data?.marketStatus || '', stats, pts, range,
  };
}

async function indices() {
  const L = [['EPU', 'Perú (MSCI)'], ['GLD', 'Oro'], ['SLV', 'Plata'], ['TLT', 'Bonos EE.UU. 20+ años'], ['EEM', 'Emergentes'], ['EWZ', 'Brasil'], ['ECH', 'Chile'], ['EWW', 'México'], ['VNQ', 'Inmobiliario'], ['USO', 'Petróleo']];
  const out = [];
  for (const [s, n] of L) {
    let row = { s, n, p: null };
    for (let k = 0; k < 2 && row.p == null; k++) {
      try { const j = await getJSON(`${BASE}/quote/${s}/info?assetclass=etf`, 20_000); const pd = j?.data?.primaryData || {};
        row = { s, n, p: num(pd.lastSalePrice), c: num(pd.netChange), pc: num(pd.percentageChange), st: j?.data?.marketStatus || '' }; }
      catch { await new Promise(r => setTimeout(r, 250)); }
    }
    out.push(row);
  }
  return { at: Date.now(), rows: out.filter(r => r.p != null) };
}
async function earnings(date) {
  const j = await getJSON(`${BASE}/calendar/earnings?date=${date}`, 600_000);
  const rows = (j?.data?.rows || []).map(r => ({ s: r.symbol, n: r.name, m: num(r.marketCap), q: r.fiscalQuarterEnding || '', e: r.epsForecast || '', ne: r.noOfEsts || '', ly: r.lastYearEPS || '', t: r.time || '' }))
    .filter(r => r.s).sort((a, b) => (b.m || 0) - (a.m || 0)).slice(0, 80);
  return { date, rows };
}
async function news(sym) {
  const j = await getJSON(`${BASE}/news/topic/articlebysymbol?q=${encodeURIComponent(sym)}|stocks&offset=0&limit=8&fallback=true`, 600_000);
  const rows = (j?.data?.rows || []).map(r => ({ t: r.title, u: r.url && r.url.startsWith('http') ? r.url : 'https://www.nasdaq.com' + (r.url || ''), a: r.ago || '', p: r.publisher || '' })).filter(r => r.t);
  return { s: sym, rows };
}

let ideasCache = null;
const sleep = ms => new Promise(ok => setTimeout(ok, ms));
async function tryJSON(url, ttl, tries = 2) {
  for (let k = 0; k < tries; k++) { try { const j = await getJSON(url, ttl); if (j?.data) return j.data; } catch { /* reintento */ } await sleep(350 * (k + 1)); }
  return null;
}
const RATING = { 'Strong Buy': 'Compra fuerte', Buy: 'Compra', Hold: 'Mantener', Sell: 'Venta', 'Strong Sell': 'Venta fuerte' };
async function oneIdea(r) {
  const S = encodeURIComponent(r.s);
  const [sum, peg, rat] = await Promise.all([
    tryJSON(`${BASE}/quote/${S}/summary?assetclass=stocks`, 3600_000, 3),
    tryJSON(`${BASE}/analyst/${S}/peg-ratio`, 6 * 3600_000),
    tryJSON(`${BASE}/analyst/${S}/ratings`, 6 * 3600_000),
  ]);
  if (!sum?.summaryData) return null;
  const d = sum.summaryData, v = k => d[k]?.value;
  const hl = String(v('FiftTwoWeekHighLow') || '').split('/').map(num);
  const tgt = num(v('OneYrTarget')), y = num(v('Yield'));
  const pc = (peg?.per?.peRatioChart || []).map(x => num(x.y));
  const gr = (peg?.gr?.peGrowthChart || []).filter(x => x.z === 'Growth').map(x => num(x.y));
  const na = parseInt(String(rat?.ratingsSummary || '').match(/(\d+)\s+analyst/)?.[1] || '0', 10);
  return { s: r.s, n: r.n, sec: r.sec, p: r.p, pc: r.pc, m: r.m, tgt, up: tgt && r.p ? tgt / r.p - 1 : null,
    pe: pc[0] > 0 ? pc[0] : null, fpe: pc[1] > 0 ? pc[1] : null, peg: num(peg?.pegr?.pegValue) > 0 ? num(peg.pegr.pegValue) : null, gr: gr[0] != null ? gr[0] : null,
    rt: RATING[rat?.meanRatingType] || null, na: na || null, y: y != null ? y : 0, hi: hl[0] || null, lo: hl[1] || null,
    pos: hl[0] && hl[1] && hl[0] > hl[1] ? Math.max(0, Math.min(1, (r.p - hl[1]) / (hl[0] - hl[1]))) : null };
}
async function loadStore() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return {};
  try { const r = await get('cache/ideas.json', { access: 'private', useCache: false }); if (!r || r.statusCode !== 200 || !r.stream) return {}; return JSON.parse(await new Response(r.stream).text()) || {}; } catch { return {}; }
}
async function saveStore(o) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  try { await put('cache/ideas.json', JSON.stringify(o), { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json' }); } catch { /* sin caché persistente */ }
}
const sane = x => { if (x.pe != null && (x.pe < 3 || x.pe > 400)) x.pe = null; if (x.fpe != null && (x.fpe < 3 || x.fpe > 400)) x.fpe = null; if (x.peg != null && x.peg > 20) x.peg = null; if (x.gr != null && Math.abs(x.gr) > 150) x.gr = null; return x; };
async function ideas() {
  if (ideasCache && ideasCache.rows.length >= 55 && Date.now() - ideasCache.at < 3600_000) return ideasCache;
  const [{ rows }, store] = await Promise.all([list(), ideasCache?.store ? Promise.resolve(ideasCache.store) : loadStore()]);
  const pick = rows.filter(r => r.p > 5).slice(0, 60);
  const fresh = r => store[r.s] && Date.now() - store[r.s].t < 8 * 3600_000;
  const todo = pick.filter(r => !fresh(r)).sort((a, b) => (store[a.s]?.t || 0) - (store[b.s]?.t || 0));
  const t0 = Date.now(); let i = 0, got = 0, fails = 0;
  async function worker() {
    while (i < todo.length && Date.now() - t0 < 22_000 && fails < 6) {
      const r = todo[i++]; const x = await oneIdea(r).catch(() => null);
      if (x) { store[r.s] = { ...sane(x), t: Date.now() }; got++; fails = 0; } else fails++;
      await sleep(200);
    }
  }
  await Promise.all([worker(), worker()]);
  if (got) await saveStore(store);
  const out = pick.filter(r => store[r.s]).map(r => { const x = { ...store[r.s] }; delete x.t; x.p = r.p; x.pc = r.pc; x.m = r.m; x.n = r.n;
    x.up = x.tgt && r.p ? x.tgt / r.p - 1 : null; x.pos = x.hi && x.lo && x.hi > x.lo ? Math.max(0, Math.min(1, (r.p - x.lo) / (x.hi - x.lo))) : null; return x; })
    .filter(x => x.up != null || x.pe != null);
  ideasCache = { at: Date.now(), rows: out, total: pick.length, store };
  return ideasCache;
}

/* ---------- análisis fundamental ---------- */
const nk = v => { if (v == null) return null; const t = String(v).trim(); if (!t || t === '--' || t === 'N/A') return null; const neg = /^\(.*\)$/.test(t) || t.startsWith('-'); const n = parseFloat(t.replace(/[$,%()\s-]/g, '')); return Number.isFinite(n) ? (neg ? -n : n) : null; };
function table(t) { if (!t?.rows) return { per: [], rows: {} }; const h = t.headers || {}; const keys = Object.keys(h).filter(k => k !== 'value1');
  const rows = {}; for (const r of t.rows) { const l = String(r.value1 || '').trim(); if (l) rows[l] = keys.map(k => nk(r[k])); } return { per: keys.map(k => h[k]), rows }; }
async function fund(sym) {
  const S = encodeURIComponent(sym);
  const [fin, sur, ins, inst] = await Promise.all([
    tryJSON(`${BASE}/company/${S}/financials?frequency=1`, 12 * 3600_000),
    tryJSON(`${BASE}/company/${S}/earnings-surprise`, 6 * 3600_000),
    tryJSON(`${BASE}/company/${S}/insider-trades?limit=10&type=ALL&sortColumn=lastDate&sortOrder=DESC`, 6 * 3600_000),
    tryJSON(`${BASE}/company/${S}/institutional-holdings?limit=8&type=TOTAL&sortColumn=marketValue&sortOrder=DESC`, 12 * 3600_000),
  ]);
  const out = { s: sym };
  if (fin) out.fin = { inc: table(fin.incomeStatementTable), bal: table(fin.balanceSheetTable), cf: table(fin.cashFlowTable), rat: table(fin.financialRatiosTable) };
  if (sur?.earningsSurpriseTable?.rows) out.sur = sur.earningsSurpriseTable.rows.map(r => ({ q: r.fiscalQtrEnd, d: r.dateReported, eps: nk(r.eps), est: nk(r.consensusForecast), sp: nk(r.percentageSurprise) })).reverse();
  if (ins) { const g = (t, l) => (t?.rows || []).find(r => r.insiderTrade === l) || {};
    const nt = ins.numberOfTrades, ns = ins.numberOfSharesTraded;
    out.ins = { b3: nk(g(nt, 'Number of Open Market Buys').months3), b12: nk(g(nt, 'Number of Open Market Buys').months12), s3: nk(g(nt, 'Number of Sells').months3), s12: nk(g(nt, 'Number of Sells').months12),
      n3: nk(g(ns, 'Net Activity').months3), n12: nk(g(ns, 'Net Activity').months12),
      last: (ins.transactionTable?.table?.rows || []).slice(0, 8).map(r => ({ n: r.insider, r: r.relation, d: r.lastDate, t: r.transactionType, sh: nk(r.sharesTraded), p: nk(r.lastPrice), h: nk(r.sharesHeld) })) }; }
  if (inst) { const os = inst.ownershipSummary || {}, ap = inst.activePositions?.rows || [], np = inst.newSoldOutPositions?.rows || [], f = (a, l) => a.find(r => r.positions === l) || {};
    out.inst = { pct: nk(os.SharesOutstandingPCT?.value), so: nk(os.ShareoutstandingTotal?.value), holders: nk(f(ap, 'Total Institutional Shares').holders),
      inc: nk(f(ap, 'Increased Positions').holders), dec: nk(f(ap, 'Decreased Positions').holders), nw: nk(f(np, 'New Positions').holders), out: nk(f(np, 'Sold Out Positions').holders),
      incSh: nk(f(ap, 'Increased Positions').shares), decSh: nk(f(ap, 'Decreased Positions').shares),
      top: (inst.holdingsTransactions?.table?.rows || []).slice(0, 8).map(r => ({ n: r.ownerName, d: r.date, sh: nk(r.sharesHeld), ch: nk(r.sharesChangePCT), v: nk(r.marketValue) })) }; }
  return out;
}
/* velas OHLCV para el gráfico profesional: diarias hasta 1 año, semanales para 2 y 5 años */
const OHLC_DAYS = { '3m': 95, '6m': 186, '1y': 372, '2y': 735, '5y': 1835 };
async function ohlc(sym, range) {
  const days = OHLC_DAYS[range] || 372, to = new Date(), from = new Date(Date.now() - days * 864e5), f = d => d.toISOString().slice(0, 10), S = encodeURIComponent(sym);
  for (const ac of ['stocks', 'etf']) {
    const d = await tryJSON(`${BASE}/quote/${S}/historical?assetclass=${ac}&fromdate=${f(from)}&todate=${f(to)}&limit=2000`, 6 * 3600_000);
    let rows = (d?.tradesTable?.rows || []).map(r => ({ t: Date.parse(r.date), o: num(r.open), h: num(r.high), l: num(r.low), c: num(r.close), v: num(r.volume) || 0 }))
      .filter(r => r.t && r.c != null).map(r => ({ ...r, o: r.o ?? r.c, h: r.h ?? Math.max(r.o ?? r.c, r.c), l: r.l ?? Math.min(r.o ?? r.c, r.c) })).reverse();
    if (rows.length < 20) continue;
    let tf = 'diario';
    if (days > 400) { const w = []; for (const r of rows) { const k = Math.floor((r.t / 864e5 + 3) / 7); const last = w.at(-1);
      if (last && last.k === k) { last.h = Math.max(last.h, r.h); last.l = Math.min(last.l, r.l); last.c = r.c; last.v += r.v; last.t = r.t; } else w.push({ k, t: r.t, o: r.o, h: r.h, l: r.l, c: r.c, v: r.v }); }
      rows = w.map(({ k, ...r }) => r); tf = 'semanal'; }
    return { s: sym, range, tf, src: 'Nasdaq · precios históricos (cierre del día; pueden tener retraso)', bars: rows };
  }
  return { s: sym, range, bars: [] };
}
async function hist1y(sym) {
  const to = new Date(), from = new Date(Date.now() - 372 * 864e5), f = d => d.toISOString().slice(0, 10), S = encodeURIComponent(sym);
  for (const ac of ['stocks', 'etf']) {
    const d = await tryJSON(`${BASE}/quote/${S}/historical?assetclass=${ac}&fromdate=${f(from)}&todate=${f(to)}&limit=400`, 6 * 3600_000);
    const rows = d?.tradesTable?.rows || [];
    if (rows.length > 20) return { s: sym, pts: rows.map(r => [Date.parse(r.date), num(r.close)]).filter(p => p[0] && p[1] != null).reverse() };
  }
  return { s: sym, pts: [] };
}

/* ---------- cotizaciones para la lista de compra (acciones y ETF) ---------- */
async function quotes(syms) {
  const { rows } = await list().catch(() => ({ rows: [] }));
  const by = new Map(rows.map(r => [r.s, r]));
  const out = {};
  await Promise.all(syms.map(async s => {
    const r = by.get(s);
    if (r) { out[s] = { p: r.p, pc: r.pc, n: r.n, src: 'live' }; return; }
    for (const ac of ['etf', 'stocks']) {
      const j = await tryJSON(`${BASE}/quote/${encodeURIComponent(s)}/info?assetclass=${ac}`, 30_000, 1);
      const pd = j?.primaryData; const p = num(pd?.lastSalePrice);
      if (p) { out[s] = { p, pc: num(pd.percentageChange), n: (j.companyName || '').replace(/\s+(Common Stock|ETF)$/i, ''), src: 'live' }; return; }
    }
    const h = await hist1y(s).catch(() => ({ pts: [] }));
    if (h.pts.length) { const a = h.pts.at(-1), b2 = h.pts.at(-2); out[s] = { p: a[1], pc: b2 ? +(100 * (a[1] / b2[1] - 1)).toFixed(2) : null, src: 'close', d: new Date(a[0]).toISOString().slice(0, 10) }; }
  }));
  return { at: Date.now(), q: out };
}

/* ---------- historial de 5 años (semanal) para backtest ---------- */
async function hist5(sym) {
  const to = new Date(), from = new Date(Date.now() - 5 * 366 * 864e5), f = d => d.toISOString().slice(0, 10), S = encodeURIComponent(sym);
  for (const ac of ['etf', 'stocks']) {
    const d = await tryJSON(`${BASE}/quote/${S}/historical?assetclass=${ac}&fromdate=${f(from)}&todate=${f(to)}&limit=1400`, 12 * 3600_000);
    const rows = (d?.tradesTable?.rows || []).map(r => [Date.parse(r.date), num(r.close)]).filter(p => p[0] && p[1] != null).reverse();
    if (rows.length > 40) { const out = []; let lastWk = -1; for (const p of rows) { const wk = Math.floor(p[0] / (7 * 864e5)); if (wk !== lastWk) { out.push(p); lastWk = wk; } else out[out.length - 1] = p; } return { s: sym, pts: out }; }
  }
  return { s: sym, pts: [] };
}
/* ---------- historial de 90 días del BCE, convertido a base USD ---------- */
async function fxHist() {
  const c = cache.get('fxhist'); if (c && Date.now() - c.t < 6 * 3600_000) return c.v;
  const r = await fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml', { headers: { 'user-agent': 'LucioniCapital/1.0' } });
  if (!r.ok) throw new Error('ecb ' + r.status);
  const x = await r.text(), days = [];
  for (const m of x.matchAll(/<Cube time=['"](\d{4}-\d{2}-\d{2})['"]>([\s\S]*?)<\/Cube>/g)) { const R = {}; for (const k of m[2].matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) R[k[1]] = parseFloat(k[2]); if (R.USD) days.push([m[1], R]); }
  days.sort((a, b) => a[0] < b[0] ? -1 : 1);
  const cur = ['EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'CNY', 'MXN', 'BRL', 'INR', 'AUD'];
  const series = Object.fromEntries(cur.map(k => [k, days.map(([d, R]) => [Date.parse(d), k === 'EUR' ? 1 / R.USD : R[k] ? R[k] / R.USD : null]).filter(p => p[1] != null)]));
  const v = { at: Date.now(), base: 'USD', src: 'Banco Central Europeo · tipos de referencia (90 días)', series };
  cache.set('fxhist', { t: Date.now(), v }); return v;
}
/* ---------- tipos de cambio de referencia: BCE (EUR, GBP, USD) + BCRP (PEN). Sin tasas inventadas. ---------- */
async function fxAll() {
  const c = cache.get('fxall'); if (c && Date.now() - c.t < 3 * 3600_000) return c.v;
  const [ecb, pen] = await Promise.allSettled([
    fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', { headers: { 'user-agent': 'LucioniCapital/1.0' } }).then(r => { if (!r.ok) throw new Error('ecb ' + r.status); return r.text(); }),
    fxPen()]);
  const rates = { USD: 1 }, src = {}, dates = {};
  if (ecb.status === 'fulfilled') {
    const x = ecb.value, R = {}; for (const m of x.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) R[m[1]] = parseFloat(m[2]);
    const d = (x.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/) || [])[1];
    if (R.USD) { rates.EUR = 1 / R.USD; for (const [k, v] of Object.entries(R)) if (k !== 'USD') { rates[k] = v / R.USD; src[k] = 'Banco Central Europeo · tipos de referencia'; dates[k] = d || null; } src.EUR = 'Banco Central Europeo · tipos de referencia'; dates.EUR = d || null; }
  }
  if (pen.status === 'fulfilled' && pen.value.last) { rates.PEN = +pen.value.last[1]; src.PEN = pen.value.src; dates.PEN = new Date(pen.value.last[0]).toISOString().slice(0, 10); }
  const v = { at: Date.now(), base: 'USD', rates, src, dates };
  if (Object.keys(rates).length > 1) cache.set('fxall', { t: Date.now(), v });
  return v;
}
/* ---------- tipo de cambio oficial (BCRP, sistema bancario SBS, venta) ---------- */
const MES = { Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4, Jun: 5, Jul: 6, Ago: 7, Sep: 8, Set: 8, Oct: 9, Nov: 10, Dic: 11 };
async function fxPen() {
  const to = new Date(), from = new Date(Date.now() - 400 * 864e5), f = d => d.toISOString().slice(0, 10);
  const c = cache.get('fxpen'); if (c && Date.now() - c.t < 3 * 3600_000) return c.v;
  const r = await fetch(`https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04640PD/json/${f(from)}/${f(to)}`, { headers: { 'user-agent': 'LucioniCapital/1.0', accept: 'application/json' } });
  if (!r.ok) throw new Error('bcrp ' + r.status);
  const j = JSON.parse((await r.text()).replace(/^﻿/, ''));
  const pts = (j.periods || []).map(p => { const m = /^(\d{1,2})\.(\w{3})\.(\d{2})$/.exec(p.name || ''); const v = parseFloat(p.values?.[0]); if (!m || !(v > 0) || MES[m[2]] == null) return null; return [Date.UTC(2000 + +m[3], MES[m[2]], +m[1]), v]; }).filter(Boolean);
  const v = { src: 'BCRP · TC sistema bancario SBS, venta (PD04640PD)', pts, last: pts.at(-1) || null };
  cache.set('fxpen', { t: Date.now(), v }); return v;
}

export default async function handler(req, res) {
  const q = new URL(req.url, 'http://x').searchParams;
  try {
    if (q.get('fund')) { const sy = q.get('fund'); if (!/^[A-Za-z.\-]{1,10}$/.test(sy)) return send(res, 400, { code: 'bad_symbol' }); return send(res, 200, await fund(sy.toUpperCase()), 21600); }
    if (q.get('h1y')) { const sy = q.get('h1y'); if (!/^[A-Za-z.\-]{1,10}$/.test(sy)) return send(res, 400, { code: 'bad_symbol' }); const d = await hist1y(sy.toUpperCase()); return send(res, 200, d, d.pts.length ? 21600 : 60); }
    if (q.get('h5')) { const sy = q.get('h5'); if (!/^[A-Za-z.\-]{1,10}$/.test(sy)) return send(res, 400, { code: 'bad_symbol' }); const d = await hist5(sy.toUpperCase()); return send(res, 200, d, d.pts.length ? 43200 : 60); }
    if (q.get('fx')) return send(res, 200, await fxAll(), 3600);
    if (q.get('ohlc')) { const sy = q.get('ohlc'); if (!/^[A-Za-z.\-]{1,10}$/.test(sy)) return send(res, 400, { code: 'bad_symbol' }); const rg = OHLC_DAYS[q.get('range')] ? q.get('range') : '1y'; const d = await ohlc(sy.toUpperCase(), rg); return send(res, 200, d, d.bars.length ? 3600 : 60); }
    if (q.get('fxhist')) return send(res, 200, await fxHist(), 21600);
    if (q.get('fxpen')) return send(res, 200, await fxPen(), 10800);
    if (q.get('quotes')) { const L = q.get('quotes').toUpperCase().split(',').map(x => x.trim()).filter(x => /^[A-Z.\-]{1,10}$/.test(x)).slice(0, 16); return send(res, 200, await quotes([...new Set(L)]), 30); }
    if (q.get('ideas')) { const d = await ideas(); return send(res, 200, { at: d.at, total: d.total, rows: d.rows }, d.rows.length >= 55 ? 1800 : 30); }
    if (q.get('indices')) return send(res, 200, await indices(), 20);
    if (q.get('earnings')) { const d = q.get('earnings'); if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return send(res, 400, { code: 'bad_date' }); return send(res, 200, await earnings(d), 600); }
    if (q.get('news')) { const sy = q.get('news'); if (!/^[A-Za-z.\-]{1,10}$/.test(sy)) return send(res, 400, { code: 'bad_symbol' }); return send(res, 200, await news(sy.toUpperCase()), 600); }
    if (q.get('list')) return send(res, 200, await list(), 20);
    const sym = (q.get('symbol') || '').trim();
    if (!/^[A-Za-z.\-]{1,10}$/.test(sym)) return send(res, 400, { code: 'bad_symbol', message: 'Símbolo no válido.' });
    const d = await detail(sym, q.get('range') || '1d');
    if (!d) return send(res, 404, { code: 'not_found', message: 'No encontramos datos para ese símbolo.' });
    return send(res, 200, d, 15);
  } catch (e) {
    return send(res, 502, { code: 'upstream', message: 'La fuente de datos no respondió. Intenta en un momento.' });
  }
}
