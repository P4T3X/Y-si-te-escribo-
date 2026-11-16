// Intelligence Network (Fase 5): consentimiento por módulo en el servidor, lectura de datos reales del usuario,
// informe de 10 secciones, validación de la IA, aislamiento entre usuarios, registro de uso y cuota.
// Uso: node test/mock-server.mjs & ; node test/intel-api.test.mjs
import crypto from 'node:crypto';
const B = 'http://localhost:4320';
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('  ✓', m); } else { fail++; console.log('  ✗', m); } };
const post = async (p, body, tok) => { const r = await fetch(B + p, { method: 'POST', headers: { 'content-type': 'application/json', ...(tok ? { authorization: 'Bearer ' + tok } : {}) }, body: JSON.stringify(body) }); return { s: r.status, d: await r.json().catch(() => ({})) }; };
const intel = (action, b, tok) => post('/api/intel', { action, ...b }, tok);
const reg = async e => (await post('/api/account', { action: 'register', email: e, password: 'clave12345', name: 'Prueba' })).d.token;
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const eA = `ia${Date.now()}@test.dev`, uidA = crypto.createHash('sha256').update('lc:' + eA).digest('hex').slice(0, 40);
const A = await reg(eA), Bt = await reg(`ib${Date.now()}@test.dev`);

// Datos reales de prueba del usuario A en cada módulo
const cats = [{ id: 'sueldo', name: 'Sueldo', kind: 'inc' }, { id: 'alimentacion', name: 'Alimentación', kind: 'exp' }, { id: 'vivienda', name: 'Vivienda', kind: 'exp' }, { id: 'transfer', name: 'Transferencia', kind: 'tr' }];
await post('/api/finance', { action: 'meta.save', meta: { accounts: [{ id: 'acc1abc', name: 'Sueldo BCP', type: 'bank', cur: 'PEN', open: 6000 }, { id: 'acc2abc', name: 'Ahorro', type: 'savings', cur: 'PEN', open: 4000, emergency: true }], cats, budgets: { alimentacion: 500 }, recurring: [{ id: 'rec1abc', name: 'Netflix', amt: 45, cur: 'PEN', freq: 'monthly', day: 5, kind: 'sub', active: true }], settings: { base: 'PEN', efMonths: 6 } } }, A);
const txs = []; const now = new Date();
for (let i = 1; i <= 6; i++) { const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 10)).toISOString().slice(0, 10);
  txs.push({ id: id(), acc: 'acc1abc', date: d, amt: 5000, desc: 'Sueldo', cat: 'sueldo' }, { id: id(), acc: 'acc1abc', date: d, amt: -1500, desc: 'Alquiler', cat: 'vivienda' }, { id: id(), acc: 'acc1abc', date: d, amt: -2000, desc: 'Supermercado', cat: 'alimentacion' }, { id: id(), acc: 'acc1abc', date: d, amt: -300, desc: 'Paso a ahorro', cat: 'transfer' }); }
let r = await post('/api/finance', { action: 'tx.add', txs }, A);
await post('/api/finance', { action: 'estate.save', props: [{ id: 'propabc1', name: 'Depa Miraflores', type: 'apartment', country: 'PE', cur: 'PEN', price: 400000, date: '2020-05-01', use: 'rent', rent: 2000, occ: 100, valuations: [{ date: '2026-01-15', value: 450000, src: 'appraisal' }], mort: { initial: 300000, balance: 200000, tea: 8, payment: 2500 } }] }, A);
await post('/api/finance', { action: 'wealth.snap', snap: { cur: 'PEN', assets: 700000, liab: 210000, nw: 490000 } }, A);
const state = { debt: { cur: 'PEN', inc: 5000, debts: [{ n: 'Tarjeta de crédito', p: 10000, b: 8000, r: 65, m: 400 }, { n: 'Préstamo personal', p: 20000, b: 15000, r: 28, m: 650 }] },
  rpf: [{ s: 'AAPL', q: 10, c: 150 }, { s: 'MSFT', q: 2, c: 300 }], ret: { age: 30, retAge: 65, endAge: 90, saved: 20000, monthly: 300, income: 2500, other: 0, ret: .065, inf: .025, cur: 'PEN' },
  goals: [{ name: 'Viaje a Cusco', target: 3000, date: new Date(Date.now() + 300 * 864e5).toISOString().slice(0, 10), saved: 500, monthly: 50, cur: 'PEN' }] };
r = await post('/api/account', { action: 'save', state }, A);
ok(r.s === 200, 'datos de prueba cargados en los módulos reales (finanzas, inmuebles, patrimonio, deudas, cartera, jubilación, metas)');

console.log('1. Consentimiento en el servidor');
r = await intel('consent.get', {}); ok(r.s === 401, 'sin sesión no hay acceso');
r = await intel('consent.get', {}, A); ok(r.s === 200 && r.d.modules.length === 8 && r.d.modules.filter(m => m.on).map(m => m.k).join() === 'macro', 'por defecto solo Economía global (datos públicos) está permitida');
r = await intel('report', { mods: ['finance', 'macro'] }, A); ok(r.s === 403 && r.d.code === 'consent_required' && r.d.need.join() === 'finance', 'sin autorización no se lee Finanzas (403 consent_required)');
r = await intel('consent.set', { mods: { finance: true, credit: true, wealth: true, invest: true, estate: true, retire: true, goals: true, macro: false, hack: true } }, A);
ok(r.s === 200 && r.d.modules.every(m => m.on) && !r.d.modules.some(m => m.k === 'hack'), 'permisos guardados; módulos desconocidos ignorados; Economía global no se puede "apagar" porque es pública');
const st = await (await fetch(B + '/__store')).json();
ok(/intel_consent/.test(st[`users/${uidA}/audit.json`] || ''), 'el cambio de permisos queda en la auditoría');

console.log('2. Informe completo');
const t0 = Date.now(); r = await intel('report', { q: 'Analiza mi situación financiera completa y ayúdame a identificar qué debería mejorar durante los próximos 12 meses', country: 'PE' }, A); const R = r.d;
ok(r.s === 200 && R.ai && R.datos.length >= 15, `informe generado con ${R.datos?.length} datos en ${Date.now() - t0} ms`);
const has = (mod, re) => R.datos.some(f => f.mod === mod && re.test(f.label + ' ' + f.value));
ok(has('finance', /Ingreso mensual promedio.*PEN 5[.,]000/) && has('finance', /Gasto mensual promedio.*PEN 3[.,]500/) && has('finance', /Tasa de ahorro 30%/), 'finanzas: ingreso 5.000, gasto 3.500 (sin contar transferencias) y ahorro 30%');
ok(has('finance', /Liquidez.*PEN 17[.,]200/) && has('finance', /Fondo de emergencia.*meses/) && has('finance', /Suscripciones activas 1/), 'liquidez, fondo de emergencia y suscripciones');
ok(has('credit', /Deuda total PEN 23[.,]000/) && has('credit', /Cuotas de deuda sobre ingreso 21%/) && has('credit', /Tarjeta.*TEA 65%/), 'deudas: total, cuotas sobre ingreso y detalle con TEA');
ok(has('invest', /Valor de la cartera/) && has('invest', /2 posiciones/), 'inversiones valorizadas con precios de mercado');
ok(R.datos.some(f => f.mod === 'estate' && f.type === 'hecho' && /patrimonio PEN 250[.,]000/.test(f.value) && /renta bruta 5[.,]3%/.test(f.value)), 'inmueble: tasación (hecho), patrimonio neto de hipoteca y renta bruta');
ok(R.datos.some(f => f.mod === 'retire' && f.type === 'simulación') && has('goals', /Viaje a Cusco/) && has('wealth', /Patrimonio neto PEN 490[.,]000/), 'jubilación como simulación, metas y patrimonio neto');
ok(R.datos.some(f => f.mod === 'macro' && f.type === 'estimación' && /Inflación de Perú/.test(f.label)) && R.datos.some(f => f.mod === 'macro' && /Banco Central de Reserva del Perú/.test(f.label)), 'economía de Perú: proyección del FMI (estimación) y tasa del BCRP');
ok(R.escenarios.length >= 4 && R.escenarios.every(s => s.type === 'simulación') && R.escenarios.some(s => /deuda más cara \(Tarjeta/.test(s.name)), 'escenarios calculados por el servidor y marcados como simulación');
ok(['resumen', 'situacion', 'fortalezas', 'riesgos', 'oportunidades', 'escenarios', 'recomendaciones'].every(k => k in R.ai) && Array.isArray(R.faltantes) && R.fuentes.length >= 4, 'las 10 secciones: resumen, datos usados, situación, fortalezas, riesgos, oportunidades, escenarios, recomendaciones, faltantes y fuentes');
ok(R.ai.riesgos.every(x => !/\[999\]|<b>/.test(x.t)), 'la IA no puede citar datos inexistentes ni inyectar HTML');
ok(R.ai.resumen.unverified === true && R.ai.fortalezas[0].unverified === false, 'una cifra que no está en los datos se marca como no verificada');
ok(R.ai.recomendaciones[1].when === null && R.ai.recomendaciones[0].when === '0-3 meses', 'plazos fuera de la lista se descartan');
ok(R.señales.some(s => s.kind === 'riesgo' && /Tarjeta/.test(s.text)) && R.señales.some(s => s.kind === 'fortaleza' && /Ahorras/.test(s.text)), 'señales por reglas (riesgos y fortalezas) además del texto de la IA');
const P = await (await fetch(B + '/__intel')).text();
ok(P.includes('[1]') && !P.includes(eA) && /SOLO este JSON/.test(P), 'la IA recibe datos numerados, sin el correo del usuario');

console.log('3. Aislamiento, revocación y fallos');
r = await intel('report', { mods: ['finance'] }, Bt); ok(r.s === 403, 'otro usuario no tiene permisos heredados');
await intel('consent.set', { mods: { finance: true, invest: true } }, Bt); r = await intel('report', { mods: ['finance', 'invest'] }, Bt);
ok(r.s === 200 && r.d.datos.length === 0 && r.d.faltantes.length === 2 && !JSON.stringify(r.d).includes('Sueldo BCP'), 'el usuario B solo ve sus propios datos (vacíos), nunca los de A');
await intel('consent.set', { mods: { finance: false } }, A); r = await intel('report', { mods: ['finance'] }, A); ok(r.s === 403, 'al revocar el permiso, deja de leerse');
await intel('consent.set', { mods: { finance: true } }, A);
await fetch(B + '/__intelfail?on=1'); r = await intel('report', { mods: ['finance', 'credit'] }, A); await fetch(B + '/__intelfail?on=0');
ok(r.s === 200 && r.d.ai === null && /sin redacción/.test(r.d.aiError) && r.d.datos.length > 5 && r.d.señales.length > 0, 'si la IA falla, se entrega el análisis calculado (sin inventar texto)');
r = await intel('log', {}, A); const L = r.d.log;
ok(r.s === 200 && L.length >= 2 && L[0].ok === false && L[0].code && L.some(x => x.ok && x.model && x.tin > 0), 'registro de uso y de errores de IA (modelo, tokens, módulos, duración)');
ok(r.d.today.reports === 1 && r.d.today.reportLimit === 3, 'los fallos de la IA no consumen cuota');
r = await intel('reports', {}, A); ok(r.d.reports.length >= 2 && r.d.reports[0].id, 'informes guardados para revisarlos después');
console.log('4. Cuota por plan y datos del usuario');
await intel('report', { mods: ['macro'] }, A); await intel('report', { mods: ['macro'] }, A); r = await intel('report', { mods: ['macro'] }, A);
ok(r.s === 429 && r.d.code === 'quota' && /3 informes/.test(r.d.message), 'Free: 3 informes completos al día');
r = await post('/api/account', { action: 'export' }, A); ok(r.d.intelligence && r.d.intelligence.consent && r.d.intelligence.log.length >= 2, 'la exportación de datos incluye permisos, registro e informes');
r = await intel('report', { mods: ['nada'] }, A); ok(r.s === 400, 'módulos inválidos → 400');
r = await intel('xx', {}, A); ok(r.s === 400, 'acción desconocida → 400');
console.log(`\n${pass} correctas, ${fail} fallidas`); process.exit(fail ? 1 : 0);
