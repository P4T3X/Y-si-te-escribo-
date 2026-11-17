// Rendimiento en un móvil de gama media simulado (CPU 4x más lenta): tareas largas y fluidez al desplazar el Daily.
const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['Pixel 5'],colorScheme:'dark'});const p=await c.newPage();
const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await p.addInitScript(()=>{sessionStorage.setItem('lc_gate','1');localStorage.setItem('lc_anOk','false');window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push(e.duration))).observe({type:'longtask',buffered:true});});
const t0=Date.now();await p.goto('http://localhost:4320/');await p.waitForSelector(process.env.SEL||'.d29t:not(.sk)',{timeout:20000});const ready=Date.now()-t0;await p.waitForTimeout(2500);
const before=await p.evaluate(()=>window.__lt.length);
const fps=await p.evaluate(()=>new Promise(r=>{let f=0,t=performance.now();const y0=scrollY;function tick(n){f++;scrollTo(0,y0+(n-t)*1.2);if(n-t<2000)requestAnimationFrame(tick);else r(f/2);}requestAnimationFrame(tick);}));
const lt=await p.evaluate(()=>window.__lt);console.log(JSON.stringify({dailyReadyMs:ready,longTasksLoad:before,longTasksMaxMs:Math.round(Math.max(0,...lt)),scrollFps:fps,lite:await p.evaluate(()=>document.body.classList.contains('lite'))}));await b.close();})();
