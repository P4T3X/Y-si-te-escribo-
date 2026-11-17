// Premium permanente para las cuentas del dueño (variable PREMIUM_EMAILS, nunca en el código). Requiere: node test/mock-server.mjs
const {chromium}=require('playwright');let pass=0,fail=0;const ok=(c,m)=>{if(c){pass++;console.log('  ✓',m);}else{fail++;console.log('  ✗',m);}};const B='http://localhost:4320';
const post=async(p,b,t)=>{const r=await fetch(B+p,{method:'POST',headers:{'content-type':'application/json',...(t?{authorization:'Bearer '+t}:{})},body:JSON.stringify(b)});return {s:r.status,d:await r.json().catch(()=>({}))};};
const env=(k,v)=>fetch(`${B}/__env?k=${k}&v=${encodeURIComponent(v??'')}`);
(async()=>{const vip=`Dueno${Date.now()}@Test.dev`;await env('PREMIUM_EMAILS',` otro@test.dev , ${vip.toLowerCase()} `);
const T=(await post('/api/account',{action:'register',email:vip,password:'clave12345',name:'Dueño'})).d.token,N=(await post('/api/account',{action:'register',email:`normal${Date.now()}@test.dev`,password:'clave12345',name:'Normal'})).d.token;
let r=await post('/api/account',{action:'plan'},T);ok(r.d.sub.plan==='premium'&&r.d.sub.source==='owner'&&r.d.sub.periodEnd===null&&r.d.sub.trialEnd===null,'la cuenta del dueño es Premium sin vencimiento (sin importar mayúsculas ni espacios)');
ok(r.d.sub.limits.intelDaily===30&&r.d.sub.limits.strategies===20&&r.d.sub.limits.deepResearch===true,'con todos los límites de Premium');
r=await post('/api/account',{action:'plan'},N);ok(r.d.sub.plan==='free','las demás cuentas no cambian');
r=await post('/api/account',{action:'save',state:{slab:{list:Array.from({length:8},(_,i)=>({id:'s'+i}))}}},T);ok(!r.d.limited,'el servidor aplica los límites de Premium (8 estrategias guardadas)');
console.log('  · pantalla');const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{sessionStorage.setItem('lc_gate','1');localStorage.setItem('lc_anOk','false');});await p.goto(B+'/');await p.waitForTimeout(900);
await p.click('#accBtn');await p.waitForTimeout(400);await p.fill('#auE',vip);await p.fill('#auW','clave12345');await p.click('#auGo');await p.waitForTimeout(1500);
await p.evaluate(()=>{document.querySelectorAll('.tst').forEach(e=>e.remove());premSheet();});await p.waitForSelector('.p29',{timeout:10000});
ok(await p.evaluate(()=>/Premium permanente/.test(document.querySelector('.p29').textContent)&&!document.querySelector('#p29trial')&&(!document.querySelector('#p29buy')||document.querySelector('#p29buy').closest('[hidden]'))),'la hoja de plan dice "Premium permanente" y no ofrece prueba ni pago');
ok(!errs.length,'sin errores'+(errs.length?': '+errs[0]:''));await b.close();
await env('PREMIUM_EMAILS','');r=await post('/api/account',{action:'plan'},T);ok(r.d.sub.plan==='free','lo decide solo el servidor: sin la variable, la misma cuenta vuelve a Free (sin borrar datos)');
console.log(`\n${pass} correctas, ${fail} fallidas`);process.exit(fail?1:0);})();
