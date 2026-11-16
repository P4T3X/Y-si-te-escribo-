// Pruebas de los flujos del servidor contra el servidor de pruebas (node test/mock-server.mjs).
// Uso: node test/api-flows.test.mjs
import crypto from 'node:crypto';
const B = 'http://localhost:4320';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓', m); } else { fail++; console.log('  ✗', m); } };
const post = async (path, body, tok, headers = {}) => { const r = await fetch(B + path, { method: 'POST', headers: { 'content-type': 'application/json', ...(tok ? { authorization: 'Bearer ' + tok } : {}), ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) }); return { s: r.status, d: await r.json().catch(() => ({})) }; };
const getj = async (path, tok) => { const r = await fetch(B + path, { headers: tok ? { authorization: 'Bearer ' + tok } : {} }); return { s: r.status, d: await r.json().catch(() => ({})) }; };
const acc = (action, body = {}, tok) => post('/api/account', { action, ...body }, tok);
const uidOf = e => crypto.createHash('sha256').update('lc:' + e.toLowerCase()).digest('hex').slice(0, 40);
const email = `u${Date.now()}@test.dev`;

console.log('1. Registro e inicio de sesión');
let r = await acc('register', { email, password: 'clave12345', name: 'Ana Prueba', cur: 'EUR', lang: 'en', country: 'pe' });
ok(r.s === 200 && r.d.token && r.d.recovery, 'registro devuelve sesión y código de recuperación');
ok(r.d.profile.sub.plan === 'free' && r.d.profile.cur === 'EUR' && r.d.profile.lang === 'en' && r.d.profile.country === 'PE', 'perfil global: plan Free, moneda, idioma y país validados');
const tok = r.d.token, uid = uidOf(email);
r = await acc('login', { email, password: 'mala1234' }); ok(r.s === 401, 'contraseña incorrecta rechazada');
r = await acc('login', { email, password: 'clave12345' }); ok(r.s === 200 && r.d.token, 'inicio de sesión correcto');

console.log('2. Permisos Premium verificados en el servidor');
r = await getj('/api/academy?track=advanced&lesson=a1', tok); ok(r.s === 402 && r.d.code === 'premium_required', 'Free no puede abrir la ruta Advanced');
r = await getj('/api/academy?track=advanced&lesson=a1'); ok(r.s === 401, 'sin sesión no hay ruta Advanced');
r = await post('/api/ai', { input: 'hola', mode: 'deep' }, tok); ok(r.s === 402, 'investigación profunda bloqueada en Free');
r = await acc('save', { state: { pfs: [{}, {}] } }, tok); ok(r.s === 403 && r.d.code === 'premium_required', 'Free no puede guardar más carteras que su límite');
const forged = tok.split('.')[0] + '.AAAA'; r = await acc('trial', {}, forged); ok(r.s === 401, 'un token manipulado no da acceso');

console.log('3. Cuota diaria de IA');
r = await post('/api/ai', { input: 'Pregunta FUENTES de prueba' }, tok); ok(r.s === 200 && r.d.quota && r.d.quota.used === 1 && r.d.quota.limit === 15, 'consulta cuenta en la cuota del plan Free (1/15)');
await post('/__put', { p: `usage/${uid}/${new Date().toISOString().slice(0, 10)}.json`, v: { n: 15, tin: 0, tout: 0 } });
r = await post('/api/ai', { input: 'otra' }, tok); ok(r.s === 429 && r.d.code === 'quota', 'al llegar a 15 consultas el servidor corta con code=quota');

console.log('4. Prueba gratuita de 7 días');
r = await acc('trial', {}, tok); ok(r.s === 200 && r.d.profile.sub.plan === 'premium' && r.d.profile.sub.status === 'trialing', 'inicio de prueba: plan Premium en prueba');
const days = (r.d.profile.sub.trialEnd - Date.now()) / 864e5; ok(days > 6.9 && days <= 7, 'la prueba dura 7 días');
r = await getj('/api/academy?track=advanced&lesson=a1', tok); ok(r.s === 200 && r.d.lesson.q.length, 'en prueba se abre la ruta Advanced');
r = await post('/api/ai', { input: 'otra' }, tok); ok(r.s === 200 && r.d.quota.limit === 150, 'en prueba la cuota sube a 150');
r = await acc('save', { state: { pfs: [{}, {}], xp: 120 } }, tok); ok(r.s === 200, 'en Premium se guardan varias carteras');
r = await acc('trial', {}, tok); ok(r.s === 409, 'no se puede iniciar otra prueba estando en Premium');

console.log('5. Cancelación y pérdida de permisos sin borrar datos');
r = await acc('cancel', {}, tok); ok(r.s === 200 && r.d.profile.sub.plan === 'free', 'cancelar devuelve a Free al instante');
r = await acc('me', {}, tok); ok(r.d.state && r.d.state.xp === 120, 'los datos del usuario se conservan tras cancelar');
r = await getj('/api/academy?track=advanced&lesson=a1', tok); ok(r.s === 402, 'tras cancelar se pierde la ruta Advanced');
r = await acc('trial', {}, tok); ok(r.s === 409 && r.d.code === 'trial_used', 'la prueba no se puede repetir');

console.log('6. Vencimiento automático de la prueba');
const e2 = `v${Date.now()}@test.dev`; r = await acc('register', { email: e2, password: 'clave12345', name: 'Vence' }); const t2 = r.d.token;
await acc('trial', {}, t2); await post('/__setsub', { uid: uidOf(e2), sub: { trialEnd: Date.now() - 1000 } });
r = await acc('plan', {}, t2); ok(r.d.sub.plan === 'free' && r.d.sub.status === 'expired', 'una prueba vencida vuelve sola a Free');
const e3 = e2.replace('@', '+otro@'); r = await acc('register', { email: e3, password: 'clave12345', name: 'Alias' });
r = await acc('trial', {}, r.d.token); ok(r.s === 409 && r.d.code === 'trial_used', 'el mismo correo con alias +etiqueta no repite la prueba');

console.log('7. Pagos (Stripe): inactivos sin claves, webhooks firmados e idempotentes');
r = await getj('/api/billing'); ok(r.d.enabled === false, 'sin STRIPE_SECRET_KEY los pagos se muestran inactivos');
r = await post('/api/billing', { action: 'checkout' }, tok); ok(r.s === 503 && r.d.code === 'billing_off', 'checkout responde que los pagos no están activos');
const sign = raw => { const t = Math.floor(Date.now() / 1000); return `t=${t},v1=` + crypto.createHmac('sha256', 'whsec_test').update(t + '.' + raw).digest('hex'); };
const ev1 = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed', data: { object: { client_reference_id: uid, customer: 'cus_1' } } });
r = await post('/api/billing?webhook=1', ev1, null, { 'stripe-signature': 't=1,v1=bad' }); ok(r.s === 400, 'webhook con firma falsa rechazado');
r = await post('/api/billing?webhook=1', ev1, null, { 'stripe-signature': sign(ev1) }); ok(r.s === 200, 'webhook firmado aceptado');
const ev2 = JSON.stringify({ id: 'evt_2', type: 'customer.subscription.updated', data: { object: { id: 'sub_1', customer: 'cus_1', status: 'active', current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400 } } });
r = await post('/api/billing?webhook=1', ev2, null, { 'stripe-signature': sign(ev2) }); r = await acc('plan', {}, tok); ok(r.d.sub.plan === 'premium' && r.d.sub.source === 'stripe', 'suscripción activa por webhook = Premium');
r = await post('/api/billing?webhook=1', ev2, null, { 'stripe-signature': sign(ev2) }); ok(r.d.duplicate === true, 'el mismo evento no se procesa dos veces');
const ev3 = JSON.stringify({ id: 'evt_3', type: 'customer.subscription.deleted', data: { object: { id: 'sub_1', customer: 'cus_1', status: 'canceled', current_period_end: Math.floor(Date.now() / 1000) - 10 } } });
await post('/api/billing?webhook=1', ev3, null, { 'stripe-signature': sign(ev3) }); r = await acc('plan', {}, tok); ok(r.d.sub.plan === 'free', 'suscripción eliminada y período vencido = Free');
r = await acc('cancel', {}, tok); ok(r.s === 409 && r.d.code === 'use_portal', 'una suscripción de pago se cancela en el portal');

console.log('8. Analítica sin datos personales');
r = await post('/api/event', { aid: 'abc12345-test', events: ['app_opened', 'lesson_completed', 'hack<script>'] }); ok(r.s === 200, 'eventos aceptados');
const st = await getj('/__store'); const an = Object.entries(st.d).find(([k]) => k.startsWith('analytics/'));
ok(an && !/test\.dev|Ana|hack/.test(an[1]) && /lesson_completed/.test(an[1]), 'se guardan solo conteos y un id anónimo (sin correo ni eventos no permitidos)');
r = await getj('/api/event', tok); ok(r.s === 403, 'métricas cerradas para usuarios normales');
const ra = await acc('register', { email: 'admin@test.dev', password: 'clave12345', name: 'Admin' });
r = await getj('/api/event', ra.d.token || (await acc('login', { email: 'admin@test.dev', password: 'clave12345' })).d.token); ok(r.s === 200 && r.d.dau >= 1 && 'd7' in r.d, 'administrador ve DAU/WAU/MAU y retención');

console.log('9. Exportación y eliminación de cuenta');
r = await acc('export', {}, tok); ok(r.s === 200 && r.d.profile.email === email && Array.isArray(r.d.activity) && r.d.activity.some(a => a.type === 'trial_started'), 'exportación incluye perfil, datos y actividad');
ok(!JSON.stringify(r.d).includes('"pw"') && !JSON.stringify(r.d).includes('"rc"'), 'la exportación no incluye hash de contraseña ni del código');
r = await acc('delete', { password: 'clave12345' }, tok); ok(r.s === 200, 'cuenta eliminada');
const st2 = await getj('/__store'); ok(!Object.keys(st2.d).some(k => k.includes(uid)), 'no queda ningún archivo del usuario (perfil, estado, auditoría, uso)');
r = await acc('me', {}, tok); ok(r.s === 401, 'la sesión de una cuenta eliminada ya no funciona');

console.log(`\n${pass} correctas, ${fail} fallidas`); process.exit(fail ? 1 : 0);
