// Lucioni Capital — Economía global (Fase 4).
// Solo fuentes oficiales y públicas. Cada dato sale con fuente, fecha, unidad, país y frecuencia.
// No hay valores de demostración: si una fuente falla, la sección devuelve error y la app lo dice.
//
// GET /api/macro?panel=1                 → último valor de cada indicador por país (FMI · World Economic Outlook)
// Nota: la API del Banco Mundial bloquea con su firewall las peticiones desde los servidores de Vercel (probado el 16-nov-2026); por eso no se usa.
// GET /api/macro?hist=<k>&c=US,PE         → serie histórica anual de un indicador para varios países
// GET /api/macro?rates=1                 → tasas de política monetaria de los bancos centrales (BIS)
// GET /api/macro?curve=1                 → curva de rendimientos del Tesoro de EE.UU. (hoy, hace 1 mes, hace 1 año) y spread 10A−2A
// GET /api/macro?conf=1                  → confianza del consumidor, confianza empresarial e indicador adelantado (OCDE)
// GET /api/macro?cal=1                   → calendario macro: BLS (sin clave) y, con FRED_API_KEY, las publicaciones de FRED
// GET /api/macro?us=1                    → EE.UU. mensual (IPC, desempleo, tasa de la Fed, producción industrial, ventas minoristas, confianza) — requiere FRED_API_KEY

const UA = { 'user-agent': 'Mozilla/5.0 (compatible; LucioniCapital/1.0; +https://lucioni-capital.vercel.app)', accept: '*/*' };
const cache = new Map();
async function fetchT(url, opt = {}) {
  try { return await fetchOnce(url, opt); } catch (e) { if (opt.retry === false || /HTTP 4\d\d/.test(e.message)) throw e; return fetchOnce(url, opt); }
}
async function fetchOnce(url, { ttl = 6 * 3600_000, type = 'json', headers = {}, timeout = 12000 } = {}) {
  const c = cache.get(url); if (c && Date.now() - c.t < ttl) return c.v;
  const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { headers: { ...UA, ...headers }, signal: ctrl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const v = type === 'json' ? await r.json() : await r.text();
    cache.set(url, { t: Date.now(), v }); return v;
  } finally { clearTimeout(to); }
}
function send(res, status, body, maxAge = 0) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', maxAge ? `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 4}` : 'no-store');
  res.end(JSON.stringify(body));
}
const fin = v => (v == null || v === '' || !Number.isFinite(+v)) ? null : +v;

/* ---------- Países ---------- */
// id, nombre, Banco Mundial (ISO3), FMI, BIS (política monetaria; los miembros del euro usan el BCE), OCDE
export const COUNTRIES = [
  ['US', 'Estados Unidos', 'USA', 'USA', 'US', 'USA'], ['EA', 'Zona euro', 'EMU', 'EURO', 'XM', 'EA20'],
  ['CN', 'China', 'CHN', 'CHN', 'CN', 'CHN'], ['JP', 'Japón', 'JPN', 'JPN', 'JP', 'JPN'],
  ['DE', 'Alemania', 'DEU', 'DEU', 'XM', 'DEU'], ['GB', 'Reino Unido', 'GBR', 'GBR', 'GB', 'GBR'],
  ['FR', 'Francia', 'FRA', 'FRA', 'XM', 'FRA'], ['IT', 'Italia', 'ITA', 'ITA', 'XM', 'ITA'],
  ['ES', 'España', 'ESP', 'ESP', 'XM', 'ESP'], ['IN', 'India', 'IND', 'IND', 'IN', 'IND'],
  ['BR', 'Brasil', 'BRA', 'BRA', 'BR', 'BRA'], ['MX', 'México', 'MEX', 'MEX', 'MX', 'MEX'],
  ['CA', 'Canadá', 'CAN', 'CAN', 'CA', 'CAN'], ['KR', 'Corea del Sur', 'KOR', 'KOR', 'KR', 'KOR'],
  ['AU', 'Australia', 'AUS', 'AUS', 'AU', 'AUS'], ['CH', 'Suiza', 'CHE', 'CHE', 'CH', 'CHE'],
  ['ZA', 'Sudáfrica', 'ZAF', 'ZAF', 'ZA', 'ZAF'], ['CL', 'Chile', 'CHL', 'CHL', 'CL', 'CHL'],
  ['CO', 'Colombia', 'COL', 'COL', 'CO', 'COL'], ['PE', 'Perú', 'PER', 'PER', 'PE', null],
  ['AR', 'Argentina', 'ARG', 'ARG', 'AR', null],
].map(([id, name, wb, imf, bis, oecd]) => ({ id, name, wb, imf, bis, oecd }));
const byWB = Object.fromEntries(COUNTRIES.map(c => [c.wb, c.id]));
const byIMF = Object.fromEntries(COUNTRIES.map(c => [c.imf, c.id]));
const byOECD = Object.fromEntries(COUNTRIES.filter(c => c.oecd).map(c => [c.oecd, c.id]));

/* ---------- Indicadores anuales (FMI · World Economic Outlook) ---------- */
const IMF_SRC = { src: 'FMI · World Economic Outlook (DataMapper)', url: 'https://www.imf.org/external/datamapper/' };
export const INDICATORS = [
  ['inf', 'Inflación (precios al consumidor)', '% anual, promedio', 'PCPIPCH', 'Inflación'],
  ['gdp', 'Crecimiento del PIB real', '% anual', 'NGDP_RPCH', 'PIB'],
  ['gdpusd', 'PIB nominal', 'miles de millones de US$', 'NGDPD', 'PIB'],
  ['gdppc', 'PIB per cápita', 'US$ corrientes', 'NGDPDPC', 'PIB'],
  ['unemp', 'Desempleo', '% de la población activa', 'LUR', 'Empleo'],
  ['debt', 'Deuda pública bruta', '% del PIB', 'GGXWDG_NGDP', 'Deuda pública'],
  ['fiscal', 'Resultado fiscal (préstamo/endeudamiento neto)', '% del PIB', 'GGXCNL_NGDP', 'Deuda pública'],
  ['ca', 'Cuenta corriente', '% del PIB', 'BCA_NGDPD', 'Comercio exterior'],
  ['causd', 'Saldo de cuenta corriente (bienes, servicios y rentas)', 'miles de millones de US$', 'BCA', 'Comercio exterior'],
].map(([k, name, unit, code, cat]) => ({ k, name, unit, code, cat, freq: 'Anual (el FMI actualiza en abril y octubre)', src: IMF_SRC.src, url: IMF_SRC.url + code }));
const IND = Object.fromEntries(INDICATORS.map(i => [i.k, i]));

async function imfSeries(code) {
  let j = await fetchT(`https://www.imf.org/external/datamapper/api/v1/${code}/${COUNTRIES.map(c => c.imf).join('/')}`, { ttl: 12 * 3600_000 });
  // A veces la API devuelve solo el listado de países; en ese caso se pide el indicador completo.
  if (!j?.values?.[code]) j = await fetchT(`https://www.imf.org/external/datamapper/api/v1/${code}`, { ttl: 12 * 3600_000, timeout: 20000 });
  const v = j?.values?.[code]; if (!v) throw new Error('respuesta inesperada del FMI');
  const y = new Date().getUTCFullYear(), out = {};
  for (const iso in v) { const id = byIMF[iso]; if (!id) continue; out[id] = Object.entries(v[iso]).map(([yr, x]) => [+yr, fin(x)]).filter(p => p[1] != null && p[0] >= 1990).sort((a, b) => a[0] - b[0]); }
  // Las cifras del FMI desde el año en curso son estimaciones o proyecciones del World Economic Outlook.
  return { series: out, projFrom: y };
}
async function series(k) { const i = IND[k]; if (!i) throw new Error('indicador desconocido'); return { ...i, ...(await imfSeries(i.code)) }; }
async function pool(items, n, fn) { const out = new Array(items.length); let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; try { out[k] = { status: 'fulfilled', value: await fn(items[k]) }; } catch (e) { out[k] = { status: 'rejected', reason: e }; } } })); return out; }

async function panel() {
  const res = await pool(INDICATORS, 3, i => series(i.k));
  const now = new Date().getUTCFullYear();
  const indicators = res.map((r, n) => {
    const i = INDICATORS[n]; if (r.status !== 'fulfilled') return { ...i, error: 'La fuente no respondió. Intenta más tarde.', detail: String(r.reason?.message || r.reason).slice(0, 80), values: {} };
    const d = r.value, values = {};
    for (const id in d.series) {
      const s = d.series[id];
      // Último dato observado (antes del año en curso) y, si es del FMI, la estimación del año en curso.
      const obs = [...s].reverse().find(p => !d.projFrom || p[0] < d.projFrom);
      const cur = d.projFrom ? s.find(p => p[0] === now) : null;
      if (obs) values[id] = { v: obs[1], y: obs[0], ...(cur ? { est: cur[1], estY: now } : {}) };
    }
    const { series: _s, ...meta } = d; return { ...meta, values };
  });
  return { countries: COUNTRIES.map(({ id, name }) => ({ id, name })), indicators, asOf: new Date().toISOString(), note: 'Los valores marcados como estimación provienen del World Economic Outlook del FMI y pueden revisarse.' };
}

/* ---------- Tasas de política monetaria (BIS) ---------- */
function parseCSV(t) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) { const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { row.push(f); f = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; } else f += ch; }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  const [h, ...b] = rows.filter(r => r.length > 1); return b.map(r => Object.fromEntries(h.map((k, i) => [k.trim(), r[i]])));
}
const BANKS = { US: 'Reserva Federal', XM: 'Banco Central Europeo', CN: 'Banco Popular de China', JP: 'Banco de Japón', GB: 'Banco de Inglaterra', IN: 'Banco de la Reserva de la India', BR: 'Banco Central do Brasil', MX: 'Banco de México', CA: 'Banco de Canadá', KR: 'Banco de Corea', AU: 'Banco de la Reserva de Australia', CH: 'Banco Nacional Suizo', ZA: 'Banco de la Reserva de Sudáfrica', CL: 'Banco Central de Chile', CO: 'Banco de la República', PE: 'Banco Central de Reserva del Perú', AR: 'Banco Central de la República Argentina' };
async function rates() {
  const areas = Object.keys(BANKS).join('+'), y = new Date(); const start = `${y.getUTCFullYear() - 3}-01`;
  const base = 'https://stats.bis.org/api/v2/data/dataflow/BIS/WS_CBPOL/1.0/';
  const [m, d] = await Promise.all([
    fetchT(`${base}M.${areas}?startPeriod=${start}&format=csv`, { type: 'text', ttl: 6 * 3600_000 }),
    fetchT(`${base}D.${areas}?lastNObservations=1&format=csv`, { type: 'text', ttl: 3 * 3600_000 }).catch(() => ''),
  ]);
  const hist = {}; for (const r of parseCSV(m)) { const v = fin(r.OBS_VALUE); if (v == null) continue; (hist[r.REF_AREA] ||= []).push([r.TIME_PERIOD, v]); }
  const last = {}; if (d) for (const r of parseCSV(d)) { const v = fin(r.OBS_VALUE); if (v != null) last[r.REF_AREA] = [r.TIME_PERIOD, v]; }
  const rows = Object.keys(BANKS).filter(a => hist[a] || last[a]).map(a => {
    const h = (hist[a] || []).sort((x, z) => x[0] < z[0] ? -1 : 1); const cur = last[a] || h[h.length - 1];
    // Si el dato diario es más nuevo que el último mes del historial, se agrega como punto del mes en curso.
    if (last[a] && h.length && cur[0].slice(0, 7) > h[h.length - 1][0]) h.push([cur[0].slice(0, 7), cur[1]]);
    else if (last[a] && h.length && cur[0].slice(0, 7) === h[h.length - 1][0]) h[h.length - 1] = [h[h.length - 1][0], cur[1]];
    let chg = null; for (let i = h.length - 1; i > 0; i--) if (h[i][1] !== h[i - 1][1]) { chg = { date: h[i][0], from: h[i - 1][1], to: h[i][1] }; break; }
    const ym = cur[0].slice(0, 7), [yy, mm] = ym.split('-').map(Number), prevY = `${yy - 1}-${String(mm).padStart(2, '0')}`;
    const yAgo = (h.find(p => p[0] === prevY) || [])[1] ?? null;
    const stale = (Date.now() - Date.parse(cur[0].length === 7 ? cur[0] + '-01' : cur[0])) > 75 * 864e5;
    return { area: a, bank: BANKS[a], countries: COUNTRIES.filter(c => c.bis === a).map(c => c.id), rate: cur[1], date: cur[0], yAgo, lastChange: chg, stale, hist: h };
  });
  if (!rows.length) throw new Error('el BIS no devolvió datos');
  return { rows, src: 'BIS · Central bank policy rates (WS_CBPOL)', url: 'https://data.bis.org/topics/CBPOL', unit: '% anual', freq: 'Diaria (último dato) y mensual (historial)', asOf: new Date().toISOString() };
}

/* ---------- Curva de rendimientos del Tesoro de EE.UU. ---------- */
const TENORS = [['1 Mo', '1M', 1 / 12], ['2 Mo', '2M', 2 / 12], ['3 Mo', '3M', .25], ['4 Mo', '4M', 1 / 3], ['6 Mo', '6M', .5], ['1 Yr', '1A', 1], ['2 Yr', '2A', 2], ['3 Yr', '3A', 3], ['5 Yr', '5A', 5], ['7 Yr', '7A', 7], ['10 Yr', '10A', 10], ['20 Yr', '20A', 20], ['30 Yr', '30A', 30]];
async function treasuryYear(y) {
  const t = await fetchT(`https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${y}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${y}&page&_format=csv`, { type: 'text', ttl: 3 * 3600_000, timeout: 22000, retry: false });
  return parseCSV(t).map(r => { const [mm, dd, yy] = String(r.Date || '').split('/'); if (!yy) return null; return { d: `${yy}-${mm}-${dd}`, y: TENORS.map(([h]) => fin(r[h])) }; }).filter(Boolean);
}
async function curve() {
  const y = new Date().getUTCFullYear();
  const [a, b] = await Promise.all([treasuryYear(y), treasuryYear(y - 1).catch(() => [])]);
  const all = [...a, ...b].sort((x, z) => x.d < z.d ? 1 : -1); if (!all.length) throw new Error('el Tesoro no devolvió datos');
  const pick = days => { const t = new Date(all[0].d); t.setUTCDate(t.getUTCDate() - days); const s = t.toISOString().slice(0, 10); return all.find(r => r.d <= s) || null; };
  const i2 = TENORS.findIndex(t => t[1] === '2A'), i10 = TENORS.findIndex(t => t[1] === '10A'), i3m = TENORS.findIndex(t => t[1] === '3M');
  const spread = all.filter(r => r.y[i2] != null && r.y[i10] != null).map(r => [r.d, +(r.y[i10] - r.y[i2]).toFixed(2)]).reverse();
  return { tenors: TENORS.map(([, l, t]) => ({ l, t })), now: all[0], m1: pick(30), y1: pick(365), spread, spread3m: all[0].y[i10] != null && all[0].y[i3m] != null ? +(all[0].y[i10] - all[0].y[i3m]).toFixed(2) : null,
    src: 'U.S. Department of the Treasury · Daily Treasury Par Yield Curve Rates', url: 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates', unit: '% anual (rendimiento par)', freq: 'Diaria (días hábiles)', country: 'US', asOf: new Date().toISOString() };
}

/* ---------- Confianza e indicador adelantado (OCDE) ---------- */
// La exportación CSV de la OCDE devuelve error 500; se usa el formato SDMX-XML genérico, que sí responde.
const CONF = { BCICP: ['Confianza empresarial (manufactura)', 'Industria'], CCICP: ['Confianza del consumidor', 'Consumo'], LI: ['Indicador compuesto adelantado (CLI)', 'Ciclo económico'] };
export function parseSDMX(x) {
  const out = [];
  for (const part of x.split('<generic:Series>').slice(1)) {
    const key = Object.fromEntries([...(part.match(/<generic:SeriesKey>([\s\S]*?)<\/generic:SeriesKey>/) || [, ''])[1].matchAll(/id="([^"]+)" value="([^"]+)"/g)].map(m => [m[1], m[2]]));
    const obs = [...part.matchAll(/<generic:Obs>[\s\S]*?ObsDimension[^>]*value="([^"]+)"[\s\S]*?ObsValue[^>]*value="([^"]+)"[\s\S]*?<\/generic:Obs>/g)].map(m => [m[1], fin(m[2])]).filter(p => p[1] != null);
    out.push({ key, obs });
  } return out;
}
async function conf() {
  const y = new Date().getUTCFullYear(), areas = Object.keys(byOECD).join('+');
  const x = await fetchT(`https://sdmx.oecd.org/public/rest/data/OECD.SDD.STES,DSD_STES@DF_CLI,4.1/${areas}.M.${Object.keys(CONF).join('+')}.IX._Z.AA.IX._Z.H?startPeriod=${y - 3}-01`, { type: 'text', ttl: 12 * 3600_000, timeout: 20000 });
  const out = {};
  for (const s of parseSDMX(x)) { const id = byOECD[s.key.REF_AREA], m = s.key.MEASURE; if (!id || !CONF[m] || !s.obs.length) continue; const arr = ((out[m] ||= {})[id] ||= []); arr.push(...s.obs); }
  if (!Object.keys(out).length) throw new Error('la OCDE no devolvió datos');
  for (const m in out) for (const id in out[m]) { const seen = new Map(); out[m][id].forEach(p => seen.set(p[0], p[1])); out[m][id] = [...seen].sort((a, b) => a[0] < b[0] ? -1 : 1); }
  return { measures: Object.entries(CONF).map(([k, [name, cat]]) => ({ k, name, cat, series: out[k] || {} })), unit: 'Índice, 100 = promedio de largo plazo (amplitud ajustada)', freq: 'Mensual',
    src: 'OCDE · Composite leading indicators y encuestas de confianza (DF_CLI)', url: 'https://www.oecd.org/en/data/indicators/composite-leading-indicator-cli.html', note: 'Por encima de 100: mejor que el promedio histórico del país. Perú y Argentina no están en la base de la OCDE.', asOf: new Date().toISOString() };
}

/* ---------- FRED (opcional, requiere FRED_API_KEY) ---------- */
const FRED = 'https://api.stlouisfed.org/fred/';
const US_SERIES = [
  ['CPIAUCSL', 'Inflación (IPC)', '% interanual', 'pc1', 'Inflación'], ['CPILFESL', 'Inflación subyacente (IPC sin alimentos ni energía)', '% interanual', 'pc1', 'Inflación'],
  ['UNRATE', 'Desempleo', '% de la población activa', 'lin', 'Empleo'], ['PAYEMS', 'Empleo no agrícola (cambio mensual)', 'miles de puestos', 'chg', 'Empleo'],
  ['FEDFUNDS', 'Tasa efectiva de fondos federales', '% anual', 'lin', 'Tasas de interés'], ['INDPRO', 'Producción industrial', '% interanual', 'pc1', 'Industria'],
  ['RSAFS', 'Ventas minoristas', '% interanual', 'pc1', 'Consumo'], ['UMCSENT', 'Confianza del consumidor (U. de Michigan)', 'índice, 1966 = 100', 'lin', 'Confianza'],
];
async function us() {
  const key = process.env.FRED_API_KEY; if (!key) return { blocked: 'FRED_API_KEY', msg: 'Para ver los datos mensuales de EE.UU., el dueño de la app debe agregar FRED_API_KEY (gratuita en fred.stlouisfed.org) en Vercel.' };
  const start = `${new Date().getUTCFullYear() - 5}-01-01`;
  const rows = await Promise.all(US_SERIES.map(async ([id, name, unit, units, cat]) => {
    try { const j = await fetchT(`${FRED}series/observations?series_id=${id}&api_key=${encodeURIComponent(key)}&file_type=json&observation_start=${start}&units=${units}`, { ttl: 3 * 3600_000 });
      const s = (j.observations || []).map(o => [o.date, fin(o.value)]).filter(p => p[1] != null);
      return { id, name, unit, cat, series: s, last: s[s.length - 1] || null, url: 'https://fred.stlouisfed.org/series/' + id };
    } catch { return { id, name, unit, cat, error: 'FRED no respondió' }; }
  }));
  return { rows, src: 'FRED · Federal Reserve Bank of St. Louis', freq: 'Mensual', country: 'US', asOf: new Date().toISOString() };
}

/* ---------- Calendario macro ---------- */
function parseICS(t) {
  const ev = []; for (const b of t.split('BEGIN:VEVENT').slice(1)) {
    const g = k => { const m = b.match(new RegExp('\\n' + k + '[^:\\n]*:([^\\r\\n]*(?:\\r?\\n[ \\t][^\\r\\n]*)*)')); return m ? m[1].replace(/\r?\n[ \t]/g, '').replace(/\\,/g, ',').replace(/\\n/g, ' ').trim() : ''; };
    const ds = g('DTSTART'); const m = ds.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/); if (!m) continue;
    ev.push({ date: `${m[1]}-${m[2]}-${m[3]}`, time: m[4] ? `${m[4]}:${m[5]}` : null, tz: /Z$/.test(ds) ? 'UTC' : (b.match(/DTSTART;TZID=([^:]+)/) || [])[1] || null, title: g('SUMMARY') });
  } return ev;
}
const KEY_RE = /Consumer Price Index|Employment Situation|Gross Domestic Product|Personal Income|Producer Price|Industrial Production|Retail|FOMC|Job Openings|Surveys of Consumers|Housing Starts|Durable|Real Earnings|Import and Export Price|Employment Cost|Productivity|Unemployment Insurance|Beige Book/i;
const ES = [[/Consumer Price Index/i, 'Inflación (IPC) de EE.UU.'], [/Employment Situation/i, 'Informe de empleo de EE.UU. (nóminas y desempleo)'], [/Producer Price/i, 'Precios al productor (IPP) de EE.UU.'], [/Job Openings/i, 'Vacantes de empleo (JOLTS)'], [/Real Earnings/i, 'Salarios reales de EE.UU.'], [/Import and Export Price/i, 'Precios de importación y exportación'], [/Employment Cost/i, 'Índice de costo laboral'], [/Productivity/i, 'Productividad y costos laborales'], [/Gross Domestic Product/i, 'PIB de EE.UU.'], [/Personal Income/i, 'Ingreso y gasto personal (PCE)'], [/Industrial Production/i, 'Producción industrial de EE.UU.'], [/Retail/i, 'Ventas minoristas de EE.UU.'], [/FOMC/i, 'Reserva Federal: decisión de tasas (FOMC)'], [/Surveys of Consumers/i, 'Confianza del consumidor (U. de Michigan)'], [/Housing Starts/i, 'Inicios de vivienda'], [/Durable/i, 'Pedidos de bienes duraderos'], [/Unemployment Insurance/i, 'Solicitudes de subsidio por desempleo'], [/Beige Book/i, 'Libro Beige de la Fed']];
const esName = t => (ES.find(([r]) => r.test(t)) || [, t])[1];
// Fechas de reunión del FOMC publicadas por la Reserva Federal (la decisión se anuncia el último día de la reunión).
const MON = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 };
export function fomc(html) {
  const out = []; const yr = [...html.matchAll(/<h4[^>]*>\s*<a[^>]*>\s*(\d{4}) FOMC Meetings/gi)].map(m => ({ y: +m[1], i: m.index }));
  for (let k = 0; k < yr.length; k++) { const seg = html.slice(yr[k].i, k + 1 < yr.length ? yr[k + 1].i : undefined);
    for (const m of seg.matchAll(/fomc-meeting__month[^>]*>\s*<strong>([A-Za-z\/]+)<\/strong>[\s\S]*?fomc-meeting__date[^>]*>([^<]+)</g)) {
      const months = m[1].split('/').map(x => MON[x]).filter(Boolean), days = m[2].replace(/\*/g, '').trim().match(/(\d+)(?:-(\d+))?/); if (!months.length || !days) continue;
      const end = +(days[2] || days[1]), mo = months.length > 1 && days[2] && +days[2] < +days[1] ? months[1] : months[0];
      out.push({ date: `${yr[k].y}-${String(mo).padStart(2, '0')}-${String(end).padStart(2, '0')}`, time: '14:00', tz: 'America/New_York', title: 'FOMC', name: 'Reserva Federal: decisión de tasas (FOMC)', country: 'US', src: 'Federal Reserve · calendario del FOMC', url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm', sep: /\*/.test(m[2]) });
    } }
  return out;
}
async function cal() {
  const today = new Date().toISOString().slice(0, 10), until = new Date(Date.now() + 45 * 864e5).toISOString().slice(0, 10);
  const parts = await Promise.allSettled([
    fetchT('https://www.bls.gov/schedule/news_release/bls.ics', { type: 'text', ttl: 12 * 3600_000, headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' } })
      .then(t => parseICS(t).filter(e => e.date >= today && e.date <= until && KEY_RE.test(e.title)).map(e => ({ ...e, name: esName(e.title), country: 'US', src: 'U.S. Bureau of Labor Statistics', url: 'https://www.bls.gov/schedule/' }))),
    fetchT('https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm', { type: 'text', ttl: 24 * 3600_000, timeout: 15000 }).then(h => fomc(h).filter(e => e.date >= today).slice(0, 3)),
    (async () => { const key = process.env.FRED_API_KEY; if (!key) return { blocked: true };
      const j = await fetchT(`${FRED}releases/dates?api_key=${encodeURIComponent(key)}&file_type=json&realtime_start=${today}&realtime_end=${until}&include_release_dates_with_no_data=true&sort_order=asc&limit=1000`, { ttl: 6 * 3600_000 });
      return (j.release_dates || []).filter(r => KEY_RE.test(r.release_name) && r.date >= today).map(r => ({ date: r.date, time: null, title: r.release_name, name: esName(r.release_name), country: 'US', src: 'FRED · calendario de publicaciones', url: 'https://fred.stlouisfed.org/releases/calendar' })); })(),
  ]);
  const ev = [], sources = [];
  ['BLS', 'Reserva Federal', 'FRED'].forEach((src, i) => { const p = parts[i];
    if (p.status === 'fulfilled' && Array.isArray(p.value)) { ev.push(...p.value); sources.push({ src, ok: true }); }
    else if (p.status === 'fulfilled') sources.push({ src, ok: false, blocked: 'FRED_API_KEY' });
    else sources.push({ src, ok: false, detail: String(p.reason?.message || p.reason).slice(0, 60) }); });
  const seen = new Set(), events = ev.sort((a, b) => (a.date + (a.time || '')) < (b.date + (b.time || '')) ? -1 : 1).filter(e => { const k = e.date + e.name; if (seen.has(k)) return false; seen.add(k); return true; });
  if (!sources.some(s => s.ok)) throw new Error('ninguna fuente del calendario respondió');
  return { events, sources, from: today, to: until, asOf: new Date().toISOString(), note: 'Fechas oficiales de publicación de EE.UU. Las horas, cuando aparecen, están en la zona horaria indicada por la fuente.' };
}

export default async function handler(req, res) {
  const u = new URL(req.url, 'http://x'); const q = k => u.searchParams.get(k);
  if (req.method !== 'GET') return send(res, 405, { error: 'Método no permitido' });
  try {
    if (q('panel')) return send(res, 200, await panel(), 6 * 3600);
    if (q('hist')) {
      const k = q('hist'); if (!IND[k]) return send(res, 400, { error: 'Indicador desconocido' });
      const ids = String(q('c') || 'US').split(',').filter(id => COUNTRIES.some(c => c.id === id)).slice(0, 8); if (!ids.length) return send(res, 400, { error: 'País desconocido' });
      const d = await series(k); const { series: s, ...meta } = d;
      return send(res, 200, { ...meta, series: Object.fromEntries(ids.map(id => [id, s[id] || []])), countries: ids.map(id => ({ id, name: COUNTRIES.find(c => c.id === id).name })) }, 6 * 3600);
    }
    if (q('rates')) return send(res, 200, await rates(), 3 * 3600);
    if (q('curve')) return send(res, 200, await curve(), 3 * 3600);
    if (q('conf')) return send(res, 200, await conf(), 12 * 3600);
    if (q('cal')) return send(res, 200, await cal(), 6 * 3600);
    if (q('us')) { const d = await us(); return send(res, 200, d, d.blocked ? 600 : 3 * 3600); }
    return send(res, 400, { error: 'Parámetro no reconocido' });
  } catch (e) {
    return send(res, 502, { error: 'La fuente oficial no respondió en este momento. Intenta más tarde.', detail: String(e.message || e).slice(0, 120) });
  }
}
