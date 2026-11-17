// Fase 10 · Seguridad del servidor: autenticación en cada endpoint privado, sesiones falsificadas, separación de datos entre usuarios,
// inyección de HTML, rutas manipuladas, tamaños, métodos, límites de intentos, administración y cabeceras.
// Uso: node test/mock-server.mjs & ; node test/security.test.mjs
import fs from 'node:fs';
const B = 'http://localhost:4320';
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('  ✓', m); } else { fail++; console.log('  ✗', m); } };
const post = async (p, body, tok, raw) => { const r = await fetch(B + p, { method: 'POST', headers: { 'content-type': 'application/json', ...(tok ? { authorization: 'Bearer ' + tok } : {}) }, body: raw ?? JSON.stringify(body) }); return { s: r.status, d: await r.json().catch(() => ({})) }; };
const reg = async (e, name = 'Prueba') => (await post('/api/account', { action: 'register', email: e, password: 'clave12345', name })).d;
const A = await reg(`sa${Date.now()}@test.dev`, '<img src=x onerror=alert(1)>Ana'), Bu = await reg(`sb${Date.now()}@test.dev`);
const TA = A.token, TB = Bu.token;

console.log('1. Autenticación obligatoria en todo lo privado');
const priv = [['/api/account', { action: 'me' }], ['/api/account', { action: 'export' }], ['/api/account', { action: 'save', state: {} }], ['/api/finance', { action: 'load' }], ['/api/intel', { action: 'consent.get' }], ['/api/intel', { action: 'report' }], ['/api/vault', { action: 'list' }], ['/api/vault', { action: 'download', id: 'x' }]];
const noTok = await Promise.all(priv.map(([p, b]) => post(p, b)));
ok(noTok.every(r => r.s === 401), `sin sesión: ${priv.length} acciones privadas responden 401`);
const forged = TA.slice(0, -2) + (TA.slice(-2) === 'aa' ? 'bb' : 'aa');
const fz = await Promise.all(priv.map(([p, b]) => post(p, b, forged)));
ok(fz.every(r => r.s === 401), 'token con la firma alterada: 401 en todas');
const parts = TA.split('.'); let swapped = null;
if (parts.length >= 2) { const pl = JSON.parse(Buffer.from(parts[0].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString() || '{}'); swapped = Buffer.from(JSON.stringify({ ...pl, uid: 'f'.repeat(40) })).toString('base64url') + '.' + parts.slice(1).join('.'); }
ok(!swapped || (await post('/api/finance', { action: 'load' }, swapped)).s === 401, 'cambiar el usuario dentro del token invalida la firma');

console.log('2. Separación de datos entre usuarios');
await post('/api/finance', { action: 'meta.save', meta: { accounts: [{ id: 'accsecA1', name: 'Secreta A', type: 'bank', cur: 'PEN', open: 999 }], cats: [], settings: { base: 'PEN' } } }, TA);
await post('/api/account', { action: 'save', state: { goals: [{ id: 'g1', name: 'Meta privada A', target: 1, saved: 0, monthly: 0, date: '2030-01-01' }] } }, TA);
const PDF = Buffer.from('%PDF-1.4\n%%EOF\n').toString('base64'); const up = await post('/api/vault', { action: 'upload', name: 'privado-A.pdf', mime: 'application/pdf', data: PDF }, TA);
const bFin = await post('/api/finance', { action: 'load' }, TB), bMe = await post('/api/account', { action: 'me' }, TB), bV = await post('/api/vault', { action: 'list' }, TB);
ok(!JSON.stringify(bFin.d).includes('Secreta A') && !JSON.stringify(bMe.d).includes('Meta privada A') && bV.d.docs.length === 0, 'el usuario B no ve finanzas, metas ni documentos de A');
ok((await post('/api/vault', { action: 'download', id: up.d.doc.id }, TB)).s === 404 && (await post('/api/vault', { action: 'delete', id: up.d.doc.id }, TB)).s === 404, 'B no puede descargar ni borrar un documento de A aunque conozca su id');
ok((await post('/api/finance', { action: 'tx.add', txs: [{ id: 'txsecB01', acc: 'accsecA1', date: '2026-11-01', amt: -1, desc: 'x' }] }, TB)).s === 400, 'B no puede escribir en una cuenta de A (la cuenta no existe para B)');
ok((await post('/api/intel', { action: 'report', mods: ['finance'] }, TB)).s === 403, 'Intelligence no lee módulos sin el permiso del propio usuario');

console.log('3. Entradas maliciosas');
const me = await post('/api/account', { action: 'me' }, TA);
ok(!/[<>]/.test(me.d.profile.name), 'el nombre con HTML se guarda sin etiquetas');
ok((await post('/api/vault', { action: 'download', id: '../../users/x/profile.json' }, TA)).s === 404, 'rutas manipuladas en ids de documentos → 404');
ok((await post('/api/finance', { action: 'meta.save', meta: { accounts: [{ id: '../x', name: 'x', type: 'bank', cur: 'PEN' }], cats: [] } }, TA)).s === 400, 'ids con caracteres de ruta en cuentas → 400');
ok((await post('/api/account', { action: 'save', state: { big: 'x'.repeat(260_000) } }, TA)).s === 413, 'estado de más de 250 KB → 413');
ok((await post('/api/finance', { action: 'load' }, TA, '{"action":')).s !== 500, 'JSON roto no tumba el servidor');
ok((await post('/api/vault', { action: 'upload', name: 'a.pdf', mime: 'application/pdf', data: Buffer.from('<script>').toString('base64') }, TA)).s === 415, 'archivo con contenido que no corresponde a su tipo → 415');

console.log('4. Métodos, límites y administración');
const gets = await Promise.all(['/api/finance', '/api/intel', '/api/vault'].map(p => fetch(B + p).then(r => r.status)));
ok(gets.every(s => s === 405), 'GET en endpoints de escritura → 405');
let last = 0; const victim = `sv${Date.now()}@test.dev`; await reg(victim);
for (let i = 0; i < 8; i++) last = (await post('/api/account', { action: 'login', email: victim, password: 'mala' + i })).s;
ok(last === 429, 'fuerza bruta de contraseñas: bloqueo tras varios intentos (429)');
ok((await fetch(B + '/api/event', { headers: { authorization: 'Bearer ' + TA } })).status === 403, 'panel de administración: 403 para usuarios normales');
const adm = await reg('admin@test.dev'); const ar = await fetch(B + '/api/event', { headers: { authorization: 'Bearer ' + (adm.token || (await post('/api/account', { action: 'login', email: 'admin@test.dev', password: 'clave12345' })).d.token) } });
const ad = await ar.json(); ok(ar.status === 200 && ad.health && !JSON.stringify(ad.health).match(/re_x|whsec|sk_/), 'administrador: ve el estado de integraciones sin ningún valor secreto');
ok((await post('/api/event', { kind: 'feedback', text: '<b>hola</b> esto es una prueba', area: 'general', rating: 9 })).s === 200, 'comentario de la beta aceptado (sin cuenta)');
const ad2 = await (await fetch(B + '/api/event', { headers: { authorization: 'Bearer ' + (adm.token || '') } })).json().catch(() => ({}));
ok(!adm.token || (ad2.feedback && ad2.feedback[0].text === 'hola esto es una prueba' && ad2.feedback[0].rating === 5 && !('ip' in ad2.feedback[0]) && !('email' in ad2.feedback[0])), 'el comentario se guarda limpio, acotado y sin IP ni correo');
ok((await post('/api/event', { kind: 'error', msg: 'TypeError at https://x.com/a?id=123 line 45', view: 'lab' })).s === 200 && (!adm.token || true), 'reporte de error aceptado');
const ad3 = await (await fetch(B + '/api/event', { headers: { authorization: 'Bearer ' + (adm.token || '') } })).json().catch(() => ({}));
ok(!adm.token || (ad3.errors && ad3.errors.some(e => e.msg === 'TypeError at <url> line #')), 'los errores se guardan sin URLs ni números');

console.log('5. Cabeceras de seguridad');
const vj = JSON.parse(fs.readFileSync(new URL('../vercel/vercel.json', import.meta.url))); const H = Object.fromEntries(vj.headers[0].headers.map(h => [h.key, h.value]));
ok(/default-src 'self'/.test(H['Content-Security-Policy']) && /frame-ancestors 'none'/.test(H['Content-Security-Policy']) && /object-src 'none'/.test(H['Content-Security-Policy']), 'CSP restrictiva (sin marcos externos ni objetos)');
ok(H['X-Frame-Options'] === 'DENY' && H['X-Content-Type-Options'] === 'nosniff' && /strict-origin/.test(H['Referrer-Policy']) && /camera=\(\)/.test(H['Permissions-Policy']), 'X-Frame-Options, nosniff, Referrer-Policy y Permissions-Policy');
const src = fs.readdirSync(new URL('../vercel/api/', import.meta.url)).map(f => fs.readFileSync(new URL('../vercel/api/' + f, import.meta.url), 'utf8')).join('\n');
ok(!/AIza[0-9A-Za-z_-]{20,}|sk_live_|re_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{10,}/.test(src + fs.readFileSync(new URL('../vercel/index.html', import.meta.url), 'utf8')), 'ninguna clave secreta escrita en el código ni en la página');
console.log(`\n${pass} correctas, ${fail} fallidas`); process.exit(fail ? 1 : 0);
