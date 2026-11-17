// Fase 10 · QA de interfaz: todas las vistas en 360, 768 y 1280 px (desborde, errores, ids duplicados),
// accesibilidad básica (nombres accesibles, etiquetas, alt, idioma) y herramientas de la beta. Requiere: node test/mock-server.mjs
const {chromium}=require('playwright');const fs=require('fs');const OUT=__dirname+'/shots';fs.mkdirSync(OUT,{recursive:true});
let pass=0,fail=0;const ok=(c,m)=>{if(c){pass++;console.log('  ✓',m);}else{fail++;console.log('  ✗',m);}};const B='http://localhost:4320';
const AUDIT=()=>{const vis=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)&&getComputedStyle(e).visibility!=='hidden';
 const name=e=>(e.getAttribute('aria-label')||e.getAttribute('title')||e.textContent||'').trim()||(e.querySelector('img[alt]')?.alt||'');
 const lab=e=>e.getAttribute('aria-label')||e.getAttribute('title')||e.closest('label')||(e.id&&document.querySelector(`label[for="${CSS.escape(e.id)}"]`))||e.getAttribute('aria-labelledby')||e.type==='hidden'||e.type==='file';
 const ids={};document.querySelectorAll('[id]').forEach(e=>ids[e.id]=(ids[e.id]||0)+1);
 return {ov:document.scrollingElement.scrollWidth-innerWidth,btn:[...document.querySelectorAll('button,a[href],[role=button]')].filter(vis).filter(e=>!name(e)).length,
  inp:[...document.querySelectorAll('input,select,textarea')].filter(vis).filter(e=>!lab(e)).length,img:[...document.querySelectorAll('img')].filter(vis).filter(e=>!e.hasAttribute('alt')).length,
  dup:Object.entries(ids).filter(([,n])=>n>1).map(([k])=>k),lang:document.documentElement.lang};};
(async()=>{const b=await chromium.launch();
console.log('1. Todas las vistas en tres anchos');
for(const W of [360,768,1280]){const ctx=await b.newContext({viewport:{width:W,height:820},colorScheme:'dark'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await ctx.route('https://icons.duckduckgo.com/**',r=>r.fulfill({status:404,body:''}));await p.addInitScript(()=>{sessionStorage.setItem('lc_gate','1');localStorage.setItem('lc_anOk','false');});await p.goto(B+'/');await p.waitForTimeout(1500);
 const views=await p.evaluate(()=>Object.keys(VIEWS));const bad={ov:[],btn:[],inp:[],img:[],dup:new Set(),err:[]};
 for(const v of views){errs.length=0;await p.evaluate(v=>{try{setView(v);}catch(e){}},v);await p.waitForTimeout(700);const r=await p.evaluate(AUDIT);
  if(r.ov>1)bad.ov.push(`${v}(${r.ov}px)`);if(r.btn)bad.btn.push(v);if(r.inp)bad.inp.push(v);if(r.img)bad.img.push(v);r.dup.forEach(d=>bad.dup.add(d));if(errs.length)bad.err.push(v+': '+errs[0]);}
 ok(!bad.ov.length,`${W}px · ${views.length} vistas sin desborde horizontal`+(bad.ov.length?': '+bad.ov.join(', '):''));
 ok(!bad.err.length,`${W}px · sin errores de JavaScript al abrir cada vista`+(bad.err.length?': '+bad.err.slice(0,2).join(' | '):''));
 if(W===1280){ok(!bad.btn.length&&!bad.inp.length&&!bad.img.length,'accesibilidad: botones con nombre, campos con etiqueta e imágenes con texto alternativo'+(bad.btn.length+bad.inp.length+bad.img.length?`: ${[...bad.btn,...bad.inp,...bad.img].join(', ')}`:''));
  ok(!bad.dup.size,'sin ids duplicados en ninguna vista'+(bad.dup.size?': '+[...bad.dup].join(', '):''));ok(await p.evaluate(()=>document.documentElement.lang==='es'),'idioma declarado en la página');}
 await ctx.close();}
console.log('2. Herramientas de la beta');
const ctx=await b.newContext({viewport:{width:1280,height:900},colorScheme:'dark'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const sentEv=[];
await ctx.route('https://icons.duckduckgo.com/**',r=>r.fulfill({status:404,body:''}));await p.route('**/api/event',async r=>{try{sentEv.push(JSON.parse(r.request().postData()||'{}'));}catch(e){}await r.continue();});
await p.addInitScript(()=>{sessionStorage.setItem('lc_gate','1');localStorage.setItem('lc_anOk','false');});await p.goto(B+'/');await p.waitForTimeout(1200);
ok(await p.evaluate(()=>!!document.querySelector('.b42tag')&&!!document.querySelector('#b42foot')&&!!document.querySelector('#b42pro')),'insignia Beta y accesos a comentarios (cabecera, pie y Lucioni Pro)');
await p.click('.b42tag');await p.waitForSelector('#b42t');ok(await p.evaluate(()=>/Limitaciones conocidas/.test(document.querySelector('.b42').textContent)&&/No incluyas datos personales/.test(document.querySelector('.b42').textContent)),'el formulario explica qué no incluir y las limitaciones de la beta');
await p.click('#b42r [data-n="4"]');await p.fill('#b42t','El gráfico profesional debería recordar mis indicadores');await p.selectOption('#b42a','mercados');await p.click('#b42s');await p.waitForTimeout(600);
ok(sentEv.some(e=>e.kind==='feedback'&&e.rating===4&&e.area==='mercados'&&!('email' in e)),'comentario enviado con tema y calificación, sin correo');
await p.evaluate(()=>{setTimeout(()=>{throw new Error('fallo de prueba 1');},0);});await p.waitForTimeout(500);ok(!sentEv.some(e=>e.kind==='error'),'sin consentimiento de estadísticas no se reportan errores');
await p.evaluate(()=>{localStorage.setItem('lc_anOk','true');setTimeout(()=>{throw new Error('fallo de prueba 2');},0);});await p.waitForTimeout(500);ok(sentEv.some(e=>e.kind==='error'&&/fallo de prueba 2/.test(e.msg)),'con consentimiento, el error se reporta (solo el mensaje y la vista)');
errs.length=0;await p.evaluate(()=>localStorage.setItem('lc_anOk','false'));
await p.click('#accBtn');await p.waitForTimeout(400);await p.click('.authtabs button[data-t="register"]');await p.fill('#auN','Admin Lucioni');await p.fill('#auE','admin@test.dev');await p.fill('#auW','clave12345');await p.check('#auOk');await p.click('#auGo');await p.waitForTimeout(1300);
const reg=await p.evaluate(()=>!!document.querySelector('#rcOk'));if(reg){await p.check('#rcOk');await p.click('#rcGo');await p.waitForTimeout(900);}else{await p.evaluate(()=>closeSheet&&closeSheet());}
if(!(await p.evaluate(()=>!!localStorage.getItem('lc_tok')))){await p.click('#accBtn');await p.waitForTimeout(400);await p.fill('#auE','admin@test.dev');await p.fill('#auW','clave12345');await p.click('#auGo');await p.waitForTimeout(1300);}
await p.evaluate(()=>{document.querySelectorAll('.tst').forEach(e=>e.remove());profSheet();});await p.waitForSelector('#b42ad',{timeout:10000});
await p.click('#b42ad');await p.waitForSelector('.b42h');ok(await p.evaluate(()=>{const t=document.querySelector('#b42adm').textContent;return /ia gemini/i.test(t)&&/pagos mercadopago/i.test(t)&&/Pendiente/.test(t)&&/Comentarios recientes/.test(t)&&/El gráfico profesional debería recordar/.test(t)&&/fallo de prueba #/.test(t);}),'panel de administración: integraciones configuradas o pendientes, comentarios y errores agrupados');
await p.screenshot({path:OUT+'/admin-beta.png'});
ok(!errs.length,'sin errores de consola'+(errs.length?': '+errs[0]:''));
await ctx.close();await b.close();console.log(`\n${pass} correctas, ${fail} fallidas`);process.exit(fail?1:0);})();
