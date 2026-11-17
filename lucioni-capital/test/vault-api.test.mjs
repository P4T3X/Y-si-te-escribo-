// Document Vault y reglas fiscales (Fase 7): validación de archivos, versiones, extracción con IA revisable, búsqueda,
// aislamiento entre usuarios, límites del plan, borrado, exportación e integración con Intelligence Network.
// Uso: node test/mock-server.mjs & ; node test/vault-api.test.mjs
import crypto from 'node:crypto';
const B = 'http://localhost:4320';
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('  ✓', m); } else { fail++; console.log('  ✗', m); } };
const post = async (p, body, tok) => { const r = await fetch(B + p, { method: 'POST', headers: { 'content-type': 'application/json', ...(tok ? { authorization: 'Bearer ' + tok } : {}) }, body: JSON.stringify(body) }); return { s: r.status, d: await r.json().catch(() => ({})) }; };
const V = (action, b, tok) => post('/api/vault', { action, ...b }, tok);
const reg = async e => (await post('/api/account', { action: 'register', email: e, password: 'clave12345', name: 'Prueba' })).d.token;
const eA = `va${Date.now()}@test.dev`, uidA = crypto.createHash('sha256').update('lc:' + eA).digest('hex').slice(0, 40);
const A = await reg(eA), Bt = await reg(`vb${Date.now()}@test.dev`);
const PDF1 = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n'), PDF2 = Buffer.from('%PDF-1.7\nversion dos\n%%EOF\n');
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(40)]);
const b64 = x => x.toString('base64');

console.log('1. Reglas fiscales (público)');
let r = await fetch(B + '/api/vault?tax=1'); let T = await r.json();
ok(r.status === 200 && T.rules.length >= 12 && T.version && T.rules.every(x => x.jur && x.basis && /^https:\/\//.test(x.src) && x.reviewed && ['vigente', 'verificar'].includes(x.status)), 'cada regla trae jurisdicción, base legal, fuente oficial https, revisión y estado');
ok(T.rules.filter(x => x.status === 'verificar').every(x => x.value == null) && T.rules.find(x => x.id === 'pe-uit-2026').value === null, 'las reglas por verificar no traen una cifra inventada (UIT 2026 sin valor)');
ok(T.rules.find(x => x.id === 'pe-div').history.length === 2 && T.rules.find(x => x.id === 'pe-div').value === 5, 'historial de cambios: dividendos 4,1% → 6,8% → 5%');

console.log('2. Subida y validación');
r = await V('list', {}); ok(r.s === 401, 'sin sesión no hay acceso');
r = await V('list', {}, A); ok(r.s === 200 && r.d.docs.length === 0 && r.d.usage.limits.docs === 25, 'bóveda vacía con límites del plan Free (25 documentos)');
r = await V('upload', { name: 'x.exe', mime: 'application/x-msdownload', data: b64(PDF1) }, A); ok(r.s === 415, 'formato no admitido → 415');
r = await V('upload', { name: 'falso.pdf', mime: 'application/pdf', data: b64(PNG) }, A); ok(r.s === 415 && /no coincide/.test(r.d.message), 'un PNG disfrazado de PDF se rechaza por su contenido');
r = await V('upload', { name: 'grande.pdf', mime: 'application/pdf', data: b64(Buffer.concat([PDF1, Buffer.alloc(3.1 * 1024 * 1024)])) }, A); ok(r.s === 413, 'más de 3 MB → 413');
r = await V('upload', { name: 'x.pdf', mime: 'application/pdf', data: 'no es base64!!' }, A); ok(r.s === 400, 'base64 inválido → 400');
r = await V('upload', { name: '<script>Estado</script> octubre.pdf', mime: 'application/pdf', data: b64(PDF1), cat: 'estado' }, A); const D1 = r.d.doc;
ok(r.s === 200 && D1.cat === 'estado' && !/<script>/.test(D1.name) && D1.versions.length === 1 && !('path' in D1.versions[0]) && D1.status === 'none', 'documento subido: nombre limpio, sin rutas internas, sin analizar');
r = await V('upload', { name: 'foto.png', mime: 'image/png', data: b64(PNG), cat: 'comprobante' }, A); const D2 = r.d.doc; ok(r.s === 200 && D2.versions[0].mime === 'image/png', 'imagen PNG admitida');
r = await V('upload', { id: D1.id, name: 'estado-v2.pdf', mime: 'application/pdf', data: b64(PDF2) }, A); ok(r.s === 200 && r.d.doc.versions.length === 2 && r.d.doc.versions[1].v === 2, 'nueva versión del mismo documento');
r = await V('download', { id: D1.id, v: 1 }, A); ok(r.s === 200 && Buffer.from(r.d.data, 'base64').equals(PDF1), 'historial de versiones: la versión 1 se conserva intacta');
r = await V('download', { id: D1.id }, A); ok(Buffer.from(r.d.data, 'base64').equals(PDF2) && r.d.v === 2, 'por defecto se descarga la última versión');

console.log('3. Extracción con IA revisable');
r = await V('extract', { id: D1.id }, A); const X = r.d.doc;
const LD = await (await fetch(B + '/__store')).json();
ok(r.s === 200 && X.status === 'suggested' && X.ai.date === '2026-10-31' && X.ai.due === '2026-11-25', 'OCR y extracción: fechas del documento y de vencimiento (sugeridas)');
ok(X.ai.issuer === 'Banco de Prueba S.A.' && X.ai.amounts.length === 2 && X.ai.amounts[0].cur === 'PEN' && X.ai.amounts[1].value === 120, 'se limpian HTML, monedas e importes; los importes inválidos se descartan');
ok(/Saldo final S\/ 4,250.75/.test(r.d.text) && X.hasText, 'texto reconocido guardado para búsqueda');
r = await V('update', { id: D1.id, patch: { fields: { ...X.ai, amounts: [{ label: 'Saldo final', value: 4250.75, cur: 'PEN' }], due: '2026-02-30', title: 'Estado de cuenta BCP octubre' }, tags: ['Banco', 'tarjeta'], remind: 5 } }, A);
ok(r.s === 200 && r.d.doc.status === 'reviewed' && r.d.doc.fields.title === 'Estado de cuenta BCP octubre' && r.d.doc.fields.due === null && r.d.doc.tags.join() === 'banco,tarjeta', 'el usuario corrige y confirma: queda "revisado"; fechas imposibles se rechazan');
await V('update', { id: D1.id, patch: { fields: { ...r.d.doc.fields, due: '2026-11-25' } } }, A);
r = await V('search', { q: 'saldo final' }, A); ok(r.d.hits.length === 1 && r.d.hits[0].id === D1.id && /Saldo final/.test(r.d.hits[0].snip), 'búsqueda en el texto reconocido con fragmento');
r = await V('search', { q: 'tarjeta octubre' }, A); ok(r.d.hits.length === 1, 'búsqueda por etiquetas y datos confirmados');
r = await V('search', { q: 'inexistente' }, A); ok(r.d.hits.length === 0, 'sin coincidencias → vacío');

console.log('4. Aislamiento, límites y registro');
r = await V('list', {}, Bt); ok(r.d.docs.length === 0, 'otro usuario no ve los documentos');
r = await V('download', { id: D1.id }, Bt); ok(r.s === 404, 'ni puede descargarlos aunque conozca el id');
r = await V('extract', { id: D1.id }, Bt); ok(r.s === 404, 'ni analizarlos');
let lastS = 200, n = 0; while (lastS === 200 && n < 30) { lastS = (await V('upload', { name: `c${n}.pdf`, mime: 'application/pdf', data: b64(PDF1) }, Bt)).s; n++; }
ok(lastS === 402 && n === 26, 'Free: el documento 26 se rechaza (límite de 25)');
const LOG = (await post('/api/intel', { action: 'log' }, A)).d.log; ok(LOG.some(x => x.kind === 'doc' && x.ok && x.model), 'la lectura con IA queda en el registro de uso de IA');
const st = await (await fetch(B + '/__store')).json(); const au = st[`users/${uidA}/audit.json`] || '';
ok(/doc_upload/.test(au) && /doc_reviewed/.test(au), 'auditoría de subidas y revisiones');

console.log('5. Intelligence Network y exportación');
await post('/api/intel', { action: 'consent.set', mods: { docs: true } }, A); r = await post('/api/intel', { action: 'report', mods: ['docs'] }, A);
ok(r.s === 200 && r.d.datos.some(f => f.mod === 'docs' && /Próximos vencimientos|vencimiento pasado/.test(f.label)) && r.d.datos.some(f => f.mod === 'docs' && f.type === 'hecho' && /Resumen/.test(f.label)), 'Intelligence resume tus documentos (con permiso); los datos revisados cuentan como hechos');
r = await post('/api/account', { action: 'export' }, A); ok(r.d.documents && r.d.documents.docs.length === 2 && !JSON.stringify(r.d.documents).includes('/docs/') && !('text' in r.d.documents.docs[0]), 'la exportación incluye los datos de los documentos sin rutas internas');
r = await V('delete', { id: D1.id }, A); const st2 = await (await fetch(B + '/__store')).json();
ok(r.s === 200 && !Object.keys(st2).some(k => k.startsWith(`users/${uidA}/docs/${D1.id}/`)) && /doc_deleted/.test(st2[`users/${uidA}/audit.json`]), 'borrar elimina todas las versiones del almacenamiento y queda auditado');
r = await V('nada', {}, A); ok(r.s === 400, 'acción desconocida → 400');
console.log(`\n${pass} correctas, ${fail} fallidas`); process.exit(fail ? 1 : 0);
