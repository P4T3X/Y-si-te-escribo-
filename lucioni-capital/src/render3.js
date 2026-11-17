function render(d,quiet){
  const c=d.moneda==='PEN'?'PEN':'USD',amt=+d.monto||0,m=+d.plazo_meses||12,r=realism(+d.meta_pct||0,m);
  const p=d.cartera||[],rc={Bajo:'r1',Medio:'r2',Alto:'r3'},lab={ok:'Meta realista',mid:'Meta ambiciosa',bad:'Meta poco realista'};
  const pc=v=>{if(!amt)return'';const q=(v-amt)/amt*100;return `<span style="color:var(${q>=0?'--up':'--down'});font-size:13px">${q>=0?'+':''}${q.toFixed(1)}%</span>`};
  const s=d.escenarios||{};
  $('#out').innerHTML=`
  <div class="panel result">
    <span class="stamp2" aria-hidden="true">${d.ejemplo?'EJEMPLO':'EMITIDO'}</span>
    <div class="sh" style="margin:0"><div><h2 style="font-size:clamp(26px,3.4vw,38px)">Tu cartera sugerida</h2></div><button class="btn" data-video="ai">${ic('film','',false)} Ver en video</button></div>
    <div class="params">${[['Monto',fmt(amt,c)],['Plazo',m+' meses'],['Meta',d.meta_pct+'%'],['Equivale a',(r.a>999?'999+':r.a.toFixed(1))+'% al año']].map(x=>`<span class="param"><span>${x[0]}</span> ${x[1]}</span>`).join('')}</div>
    ${d.supuestos?`<p class="note">Supuse: ${esc(d.supuestos)}</p>`:''}
    <p class="sum">${esc(d.resumen)}</p>
    <div class="reality ${r.cls}"><b>${lab[r.cls]}</b>${esc(d.realismo)}</div>
    <div class="donutwrap">${donut(p)}<div class="legend">${p.map((x,i)=>`<span><i style="background:${COLORS[i%8]}"></i>${esc(x.ticker)} · ${x.porcentaje}%</span>`).join('')}</div></div>
    <div class="picks">${p.map((x,i)=>`
    <div class="pick">
      <div class="phd"><div><div class="tk"><i style="background:${COLORS[i%8]}"></i>${esc(x.ticker)}</div><div class="nm">${esc(x.nombre)}</div></div>
      <div class="pct">${x.porcentaje}%<small>${fmt(x.monto,c)}</small></div></div>
      <div class="bar"><div data-w="${x.porcentaje}" style="background:${COLORS[i%8]}"></div></div>
      <div class="tags"><span class="tag">${esc(x.tipo)}</span><span class="tag">${esc(x.mercado)}</span><span class="tag ${rc[x.riesgo]||''}">Riesgo ${esc(x.riesgo)}</span>${x.precio_ref?`<span class="tag">Ref. ~${esc(x.precio_ref)}</span>`:''}</div>
      <div class="why">${esc(x.razon)}</div>
      <div class="acts"><button class="btn solid real" data-t="${esc(x.ticker)}">${ic('broker','',false)} Comprar de verdad</button><button class="btn star${WL.some(w=>w.t===x.ticker)?' on':''}" data-t="${esc(x.ticker)}" data-n="${esc(x.nombre)}">${ic('star','',false)} Seguir</button>${tradable.includes(x.ticker)?`<button class="btn prac" data-t="${esc(x.ticker)}">Practicar</button>`:''}<button class="btn ask" data-t="${esc(x.ticker)}">Preguntar</button><a class="btn" href="https://finance.yahoo.com/quote/${encodeURIComponent(x.ticker)}" target="_blank" rel="noopener">Precio real ${ic('ext','',false)}</a></div>
    </div>`).join('')}</div>
    <h3 style="margin-top:22px">Cómo podría terminar</h3>
    <div class="scen">${[['Si va mal',s.pesimista],['Lo esperable',s.base],['Si va bien',s.optimista]].map(([n,v])=>`<div class="sc"><small>${n}</small><b class="cu" data-v="${+v||0}" data-c="${c}">${fmt(0,c)}</b><br>${pc(v)}</div>`).join('')}</div>
    <h3 style="margin-top:22px">Consejos</h3>
    <ul class="tips">${(d.consejos||[]).map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
    <p class="disc">Lucioni Capital es una herramienta educativa: no es asesoría financiera ni garantiza resultados. Los precios de referencia pueden estar desactualizados; confirma el precio real antes de comprar. Toda inversión puede perder valor.</p>
  </div>`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    $$('.donut .seg2').forEach((e,i)=>setTimeout(()=>e.setAttribute('stroke-dasharray',e.dataset.d),i*90));
    $$('.bar div[data-w]').forEach((e,i)=>setTimeout(()=>e.style.width=e.dataset.w+'%',300+i*90));
    $$('.cu').forEach(e=>countUp(e,+e.dataset.v,v=>fmt(v,e.dataset.c),1300));
  }));
  $$('.star').forEach(b=>b.onclick=()=>toggleWL(b.dataset.t,b.dataset.n));
  $$('.real').forEach(b=>b.onclick=()=>openReal(b.dataset.t));
  $$('.prac').forEach(b=>b.onclick=()=>openTrade(b.dataset.t));
  $$('.ask').forEach(b=>b.onclick=()=>{go('chat');ask('¿Qué opinas de '+b.dataset.t+' como inversión? Ventajas y riesgos.');});
  if(!quiet){$('#out').scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});SFX.win&&SFX.win();}
}

