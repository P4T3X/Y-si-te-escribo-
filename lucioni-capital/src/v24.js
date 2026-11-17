
/* ===================== V24: rendimiento del fondo animado ===================== */
/* El patrón se dibuja una sola vez como imagen y la GPU lo gira con CSS (antes se redibujaba en cada cuadro). */
{let url='';const mk=async()=>{const c=GUIL.get();const blob=await new Promise(ok=>c.toBlob(ok,'image/png'));if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);document.documentElement.style.setProperty('--guilimg',`url(${url})`);};
  const build=(cv,o,spin)=>{if(!cv)return;spin.stop();const box=document.createElement('div');box.className='gspin'+(o.far?' far':'');box.style.opacity=o.alpha;box.style.setProperty('--cy',(o.cy*100)+'%');box.style.setProperty('--sc',o.scale);box.style.setProperty('--sp',(2*Math.PI/o.speed).toFixed(1)+'s');
    box.innerHTML='<div class="gdrift"><i class="g1"></i></div>';cv.style.display='none';cv.after(box);
    spin.start=()=>box.classList.remove('paused');spin.stop=()=>box.classList.add('paused');};
  mk().then(()=>{build($('#gros'),{scale:1.15,cy:.42,speed:.12,alpha:.9,far:true},gSpin);build($('#mBg'),{scale:1.1,cy:.35,speed:.18,alpha:.55},mSpin);
    if(GATE.classList.contains('out'))gSpin.stop();else gSpin.start();if(!menuOpen())mSpin.stop();else mSpin.start();});
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>setTimeout(mk,60));}
/* menos trabajo por movimiento del puntero */
{let lastMag=null;document.addEventListener('pointermove',e=>{if(lastMag&&!(e.target.closest&&e.target.closest('.cta')===lastMag)){lastMag.classList.remove('mag');lastMag.style.transform='';lastMag=null;}const b=e.target.closest&&e.target.closest('.cta');if(b)lastMag=b;},{passive:true});}
/* calidad automática: si el equipo no llega a ~48 cuadros por segundo, se apagan las capas decorativas más pesadas */
{const setLite=on=>{document.body.classList.toggle('lite',on);try{sessionStorage.setItem('lc_lite',on?'1':'0');}catch(e){}if(on){try{gateLoop&&gateLoop.pause&&gateLoop.pause();}catch(e){}}};
 let saved=null;try{saved=sessionStorage.getItem('lc_lite');}catch(e){}
 const weak=(navigator.hardwareConcurrency||8)<=4||(navigator.connection&&navigator.connection.saveData)||(navigator.deviceMemory&&navigator.deviceMemory<=4);
 if(saved==='1'||weak)setLite(true);
 else if(saved!=='0'){const probe=(delay,last)=>setTimeout(()=>{if(document.hidden){probe(1500,last);return;}let n=0;const t0=performance.now();const f=t=>{n++;if(t-t0<1500)requestAnimationFrame(f);else{const fps=n/1.5;if(fps<50)setLite(true);else if(last)try{sessionStorage.setItem('lc_lite','0');}catch(e){}else probe(2500,true);}};requestAnimationFrame(f);},delay);probe(2500,false);}}
