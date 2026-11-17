
/* ===================== V26: cinta de cotizaciones con marco y datos reales ===================== */
{const tape=$('.tape'),marq=$('#marq');if(tape&&marq){
  const badge=document.createElement('span');badge.className='tbadge sim';badge.innerHTML='<i></i><span>SIMULADO</span>';
  const view=document.createElement('div');view.className='tview';tape.prepend(badge);badge.after(view);view.appendChild(marq);
  const speed=()=>{const w=marq.scrollWidth/2;if(w>0)tape.style.setProperty('--tdur',Math.max(30,Math.round(w/55))+'s');};
  /* modo simulado: colores de la variación en píldoras */
  const tint=()=>$$('#marq em[data-q]').forEach(e=>{const up=e._up;e.classList.toggle('u',up===true);e.classList.toggle('d',up===false);});
  setInterval(()=>{if(!tape.classList.contains('live'))tint();},1500);tint();requestAnimationFrame(speed);
  /* modo en vivo (versión web): precios reales */
  const LIVE=[['VOO','S&P 500'],['QQQM','Nasdaq 100'],['EPU','Perú'],['NVDA'],['AAPL'],['MSFT'],['AMZN'],['GOOGL'],['META'],['TSLA'],['SCCO'],['BAP'],['JPM'],['IAU','Oro']];
  const prev={};
  async function liveTape(){if(!MKT||typeof liveQuotes!=='function')return;const syms=LIVE.map(x=>x[0]);LIVE.forEach(([s])=>{delete LQ[s];});
    let Q;try{if(Date.now()-coAt>60000)await coLoad();Q=await liveQuotes(syms);}catch(e){return;}
    const rows=LIVE.filter(([s])=>Q[s]&&Q[s].p);if(rows.length<5)return;
    const item=([s,l])=>{const q=Q[s],up=(q.pc||0)>=0,old=prev[s],fl=old&&old!==q.p?(q.p>old?' fu':' fd'):'';return `<span data-s="${esc(s)}" class="${fl.trim()}" title="${esc((l?l+' · ':'')+s)}"><b>${esc(s)}</b>${l?`<small>${esc(l)}</small>`:''}<span class="tp">${usd2(q.p)}</span><em class="${up?'u':'d'}">${up?'▲':'▼'} ${pcS(q.pc)}</em></span>`;};
    const html=rows.map(item).join('');marq.innerHTML=html+html.replace(/ class="f[ud]"/g,'');rows.forEach(([s])=>prev[s]=Q[s].p);
    if(!tape.classList.contains('live')){tape.classList.add('live');badge.className='tbadge';badge.innerHTML='<i></i><span>EN VIVO</span>';tape.setAttribute('aria-label','Cotizaciones en vivo con algunos minutos de retraso');
      if(window.gsap&&!RM)gsap.fromTo(marq,{opacity:0},{opacity:1,duration:.6});}
    requestAnimationFrame(speed);}
  marq.addEventListener('click',e=>{const s=e.target.closest&&e.target.closest('[data-s]');if(!s)return;const sym=s.dataset.s;if(member()&&MKT)coOpen(sym);else setView('stocks');});
  if(MKT){setTimeout(liveTape,1200);setInterval(()=>{if(document.visibilityState==='visible')liveTape();},60000);}
  addEventListener('resize',()=>requestAnimationFrame(speed));}}
