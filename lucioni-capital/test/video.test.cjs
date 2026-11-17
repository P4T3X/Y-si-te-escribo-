// El reproductor de video (Remotion) se carga en diferido y funciona al pedirlo.
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{sessionStorage.setItem('lc_gate','1');localStorage.setItem('lc_anOk','false');});
await p.goto('http://localhost:4320/');await p.waitForTimeout(300);
const early=await p.evaluate(()=>!!(window.LCVideo&&window.LCVideo.__stub));
await p.evaluate(()=>{setView('tools');tool('video');});await p.waitForTimeout(400);await p.evaluate(()=>{mountVideo();setTimeout(()=>LCVideo.play(),50);});await p.waitForTimeout(4000);
const r=await p.evaluate(()=>({real:!!(window.LCVideo&&!window.LCVideo.__stub),loop:!!window.LCLoop,player:!!document.querySelector('#player *')}));
console.log(JSON.stringify({stubAtStart:early,...r,errs}));process.exit(r.real&&r.player&&!errs.length?0:1);})();
