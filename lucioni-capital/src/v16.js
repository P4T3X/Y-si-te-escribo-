
/* ===================== V16: ideas de inversión y cuentas con correo ===================== */
VIEWS.ideas=['ideas'];V2ID.ideas='ideas';ID2V.ideas='ideas';VTITLE.ideas='Ideas';
{const sec=$('#ideas');const b=document.createElement('div');b.className='backbar';b.innerHTML=`<button class="backb" aria-label="Volver al inicio">${ic('right','',false)}<span>Inicio</span></button><span class="crumb">Ideas de inversión</span>`;sec.prepend(b);b.querySelector('button').onclick=()=>setView('inicio');}
['#nav','#nav2'].forEach(n=>{const ref=$(n+' a[data-p="stocks"]');if(!ref)return;const a=document.createElement('a');a.href='#ideas';a.dataset.p='ideas';a.textContent='Ideas';a.addEventListener('click',e=>{e.preventDefault();setView('ideas');});ref.after(a);});
$$('#hub .htile[data-v="ideas"]').forEach(t=>t.addEventListener('click',()=>setView('ideas')));
{const col=$('#menu .mcol');if(col){const b=document.createElement('button');b.className='mi2';b.setAttribute('role','menuitem');b.innerHTML=`${ic('target','',false)}<span>Ideas de inversión<small>Qué acciones destacan hoy y por qué</small></span>`;b.onclick=()=>{closeMenu();setView('ideas');};col.querySelector('h4').after(b);}}

let IDS=[],IDTOT=0,idT=0,idsAt=0,idsBusy=false,idTab='perfil',idRisk=(ACC&&ACC.risk)||store.get('risk','moderado')||'moderado';
const W8={conservador:{up:.2,val:.25,div:.3,mom:.05,size:.2},moderado:{up:.3,val:.25,div:.15,mom:.15,size:.15},agresivo:{up:.45,val:.1,div:0,mom:.35,size:.1}};
const IDTABS=[['perfil','Para tu perfil'],['up','Mayor potencial'],['div','Dividendos'],['val','Valor'],['mom','Impulso']];
const pct=(v,d=1)=>v==null?'—':(v>=0?'+':'')+(v*100).toFixed(d)+'%';
function rankPct(arr,key,asc){const v=arr.filter(r=>r[key]!=null).sort((a,b)=>asc?a[key]-b[key]:b[key]-a[key]);const n=v.length;const m=new Map();v.forEach((r,i)=>m.set(r.s,n>1?1-i/(n-1):1));return r=>m.has(r.s)?m.get(r.s):.35;}
function idScore(rows,risk){const w=W8[risk]||W8.moderado;
  const rUp=rankPct(rows.map(r=>({...r,u:r.up!=null?Math.min(r.up,.8):null})).map(r=>({s:r.s,up:r.u})),'up'),rVal=rankPct(rows,'pe',true),rPeg=rankPct(rows,'peg',true),rDiv=rankPct(rows,'y'),rMom=rankPct(rows,'pos'),rSize=rankPct(rows,'m');
  return rows.map(r=>{const RS={'Compra fuerte':1,'Compra':.8,'Mantener':.45,'Venta':.15,'Venta fuerte':0};const p={up:r.rt?rUp(r)*.65+RS[r.rt]*.35:rUp(r),val:r.peg?rVal(r)*.6+rPeg(r)*.4:rVal(r),div:r.y>0?rDiv(r):0,mom:rMom(r),size:rSize(r)};let sc=Object.keys(w).reduce((a,k)=>a+w[k]*p[k],0);
    if(r.up!=null&&r.up<0)sc*=.6;if(risk==='conservador'&&r.pe&&r.pe>60)sc*=.8;
    return {...r,parts:p,score:Math.round(Math.max(1,Math.min(99,sc*100)))};});}
function idReasons(r){const o=[];
  if(r.up!=null)o.push(r.up>=.15?[`Los analistas ven un precio objetivo ${pct(r.up,0)} sobre el actual (${usd2(r.tgt)}).`,0]:r.up>=0?[`Precio objetivo de analistas cercano al actual (${pct(r.up,0)}).`,0]:[`El precio ya supera el objetivo de los analistas (${pct(r.up,0)}).`,1]);
  if(r.rt)o.push([`Consenso de ${r.na||'varios'} analistas: ${r.rt.toLowerCase()}.`,/Venta/.test(r.rt)?1:0]);
  if(r.pe)o.push(r.pe<15?[`Valuación baja: P/E de ${r.pe.toFixed(1)}.`,0]:r.pe<30?[`Valuación razonable: P/E de ${r.pe.toFixed(1)}.`,0]:[`Valuación exigente: P/E de ${r.pe.toFixed(1)}; el mercado espera mucho crecimiento.`,1]);
  if(r.gr!=null)o.push(r.gr>=10?[`Se espera que sus ganancias crezcan ${r.gr.toFixed(0)}% el próximo año${r.peg?` (PEG ${r.peg.toFixed(2)})`:''}.`,0]:r.gr<0?[`Se espera que sus ganancias caigan ${Math.abs(r.gr).toFixed(0)}% el próximo año.`,1]:[`Crecimiento de ganancias esperado moderado (${r.gr.toFixed(0)}%).`,0]);
  if(r.y>=2.5)o.push([`Paga dividendos de ${r.y.toFixed(2)}% al año.`,0]);
  if(r.pos!=null)o.push(r.pos>=.85?[`Cotiza cerca de su máximo de 52 semanas: tendencia fuerte, pero entra más caro.`,r.pos>.97?1:0]:r.pos<=.25?[`Cotiza cerca de su mínimo de 52 semanas: puede ser oportunidad o señal de problemas.`,1]:[`Está a ${Math.round(r.pos*100)}% de su rango de 52 semanas.`,0]);
  return o.slice(0,5);}
function idSort(rows){const R=idScore(rows,idRisk);
  const f={perfil:(a,b)=>b.score-a.score,up:(a,b)=>(b.up??-9)-(a.up??-9),div:(a,b)=>(b.y||0)-(a.y||0),val:(a,b)=>(a.pe??999)-(b.pe??999),mom:(a,b)=>(b.pos??-1)-(a.pos??-1)}[idTab];
  let L=R.filter(r=>idTab==='div'?r.y>0:idTab==='val'?r.pe!=null&&(r.up==null||r.up>-.05):idTab==='up'?r.up!=null:true);return L.sort(f);}

if(!MKT){$('#idWrap').innerHTML=`<div class="panel coempty"><h3>Las ideas con datos reales funcionan en la versión web</h3><p class="note">Dentro de Claude la página no puede conectarse a fuentes de datos externas. Abre la versión publicada para ver el ranking diario con precios objetivo de analistas, valuación y dividendos.</p><div class="acts"><a class="btn solid" href="https://lucioni-capital.vercel.app/#ideas" target="_blank" rel="noopener">Abrir Lucioni Capital en la web ${ic('ext','',false)}</a></div></div>`;}
else{$('#idWrap').innerHTML=`<div class="idtop"><div class="idprof"><span>Tu perfil</span><div class="seg" id="idRisk">${[['conservador','Con calma'],['moderado','Equilibrado'],['agresivo','Arriesgado']].map(([k,l])=>`<button data-v="${k}" class="${k===idRisk?'act':''}">${l}</button>`).join('')}</div></div><button class="btn" id="idRef">${ic('clock','',false)} Actualizar</button></div>
  <div class="idtabs" id="idTabs" role="tablist">${IDTABS.map(([k,l])=>`<button role="tab" data-k="${k}" class="${k===idTab?'act':''}">${l}</button>`).join('')}</div>
  <p class="idmeta" id="idMeta">Analizando las empresas más grandes de EE.UU.…</p>
  <div class="idcharts"><div class="panel idbars"><h4 id="idBarsT">Puntaje de las 10 primeras</h4><p class="note" id="idBarsS">De 1 a 99, combinando potencial, valuación, dividendos, tendencia y tamaño.</p><div id="idBars"></div></div>
    <div class="panel idsc"><h4>Valuación frente a potencial</h4><p class="note">Cada punto es una empresa. Arriba a la izquierda: más barata y con más potencial según analistas. Las doradas son tu top 10.</p><div id="idSc"></div></div></div>
  <div class="idgrid" id="idGrid">${'<div class="idskel"></div>'.repeat(6)}</div>
  <details class="panel idhow"><summary>Cómo se calcula el puntaje ${ic('right','',false)}</summary>
    <p class="note" style="margin-top:10px">Cada empresa se compara con las demás del grupo en cinco factores. El peso de cada factor cambia según tu perfil.</p>
    <table><thead><tr><th>Factor</th><th>Qué mide</th><th>Con calma</th><th>Equilibrado</th><th>Arriesgado</th></tr></thead><tbody>
    ${[['up','Potencial','Precio objetivo a 1 año y consenso (compra/mantener/venta) de analistas'],['val','Valor','P/E y PEG (P/E entre crecimiento esperado) más bajos que el resto'],['div','Dividendos','Rendimiento anual por dividendo'],['mom','Impulso','Posición en el rango de 52 semanas'],['size','Tamaño','Capitalización de mercado (más grande, más estable)']].map(([k,t,d])=>`<tr><td><b>${t}</b></td><td>${d}</td>${['conservador','moderado','agresivo'].map(p=>`<td>${Math.round(W8[p][k]*100)}%</td>`).join('')}</tr>`).join('')}
    </tbody></table>
    <p class="disc">Ranking automático con datos públicos de mercado (Nasdaq y estimados de Zacks Investment Research) que pueden tener retraso. Es información educativa y general, no una recomendación personalizada de compra o venta, y no considera tu situación financiera. Los precios objetivo de analistas suelen equivocarse. Antes de invertir, diversifica y consulta a un asesor registrado en la SMV.</p></details>`;
  $$('#idRisk button').forEach(b=>b.onclick=()=>{idRisk=b.dataset.v;$$('#idRisk button').forEach(x=>x.classList.toggle('act',x===b));idRender();});
  $$('#idTabs button').forEach(b=>b.onclick=()=>{idTab=b.dataset.k;$$('#idTabs button').forEach(x=>x.classList.toggle('act',x===b));idRender();});
  $('#idRef').onclick=()=>idLoad(true);}

async function idLoad(force){if(!MKT||idsBusy)return;if(!force&&IDS.length&&Date.now()-idsAt<15*60e3){idRender();return;}idsBusy=true;$('#idMeta').textContent='Analizando las empresas más grandes de EE.UU.… la primera carga del día puede tardar unos segundos.';
  try{const r=await fetch(MKT+'?ideas=1');const d=await r.json();if(!r.ok||!d.rows)throw 0;IDS=d.rows;idsAt=d.at||Date.now();IDTOT=d.total||IDS.length;idRender();if(IDS.length<IDTOT){clearTimeout(idT);idT=setTimeout(()=>{if(VIEW==='ideas')idLoad(true);},25000);}}
  catch(e){$('#idMeta').textContent='La fuente de datos no respondió. Toca "Actualizar" en un momento.';if(!IDS.length)$('#idGrid').innerHTML='';}
  finally{idsBusy=false;}}

function idRender(){if(!IDS.length)return;const L=idSort(IDS),top=L.slice(0,10),g=!member();
  const lab={perfil:'Puntaje de las 10 primeras',up:'Potencial según analistas',div:'Rendimiento por dividendo',val:'P/E (menor es más barato)',mom:'Posición en el rango de 52 semanas'}[idTab];
  $('#idBarsT').textContent=lab;
  $('#idBarsS').textContent={perfil:'De 1 a 99, combinando potencial, valuación, dividendos, tendencia y tamaño según tu perfil.',up:'Cuánto podría subir según el precio objetivo promedio de analistas a 1 año.',div:'Dividendo anual como porcentaje del precio actual.',val:'Cuántas veces sus ganancias anuales paga el mercado. Solo empresas sin caída esperada por analistas.',mom:'0% = en su mínimo de 52 semanas, 100% = en su máximo.'}[idTab];
  $('#idMeta').textContent=`${IDS.length<IDTOT?`Completando datos: ${IDS.length} de ${IDTOT} empresas (se actualiza solo) · `:`${IDS.length} empresas analizadas · `}${L.length} cumplen este filtro · datos de ${new Date(idsAt).toLocaleString('es-PE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}`;
  idBars(top);idScatter(L,new Set(top.map(r=>r.s)));
  const show=g?L.slice(0,3):L.slice(0,24);
  $('#idGrid').innerHTML=show.map((r,i)=>idCard(r,i)).join('')+(g?`<div class="idlock"><b>Ves 3 de ${L.length} ideas.</b><p>Crea tu cuenta gratis con tu correo para ver el ranking completo, filtrar por dividendos, valor o impulso, y seguir las empresas que te interesen.</p><button class="cta" id="idGo">Crear cuenta gratis</button></div>`:'');
  const idg=$('#idGo');if(idg)idg.onclick=()=>openAccount();
  $$('#idGrid .idc').forEach(c=>{const s=c.dataset.s,r=L.find(x=>x.s===s);
    c.querySelector('.idf').onclick=()=>coOpen(s);
    c.querySelector('.idb').onclick=()=>{openSheet(realHTML(s,0));bindReal(s);};
    c.querySelector('.idw').onclick=e=>{toggleWL(s,r.n);e.currentTarget.innerHTML=`${ic('star','',false)} ${WL.some(w=>w.t===s)?'Siguiendo':'Seguir'}`;};
    c.querySelector('.ida').onclick=()=>{if(!member()){openAccount();return;}go('chat');ask(`Analiza de forma educativa y equilibrada ${s} (${r.n}) para un inversionista ${idRisk}. Datos actuales: precio ${usd2(r.p)}, precio objetivo de analistas a 1 año ${r.tgt?usd2(r.tgt):'no disponible'} (${pct(r.up)}), consenso ${r.rt||'n/d'}, crecimiento esperado de ganancias ${r.gr!=null?r.gr+'%':'n/d'}, P/E ${r.pe?r.pe.toFixed(1):'n/d'}, dividendo ${r.y||0}%, posición en rango de 52 semanas ${r.pos!=null?Math.round(r.pos*100)+'%':'n/d'}. Explica fortalezas, riesgos y qué vigilar. No des una orden de compra.`);};});
  idAnimate();}

function idCard(r,i){const sc=r.score,C=2*Math.PI*24,why=idReasons(r),wl=WL.some(w=>w.t===r.s);
  const bar=(l,v,t)=>`<div class="r"><span>${l}</span><span class="t"><i data-w="${Math.max(3,Math.min(100,v*100)).toFixed(0)}"></i></span><b>${t}</b></div>`;
  return `<article class="idc" data-s="${esc(r.s)}"><div class="idh"><span class="idrk">${i+1}</span>${coLogo(r.s)}<div class="idn"><b>${esc(r.s)}</b><small>${esc(r.n)} · ${SECES[r.sec]||esc(r.sec)}</small></div>
    <div class="idring" aria-label="Puntaje ${sc} de 99"><svg viewBox="0 0 58 58"><circle class="bg" cx="29" cy="29" r="24"/><circle class="fg" style="stroke:var(${sc>=60?'--up':sc>=40?'--gold':'--ink3'})" cx="29" cy="29" r="24" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" data-o="${(C*(1-sc/100)).toFixed(1)}"/></svg><span data-n="${sc}">0</span><small>puntaje</small></div></div>
    <div class="idpx">${usd2(r.p)} <small style="color:var(${(r.pc||0)>=0?'--up':'--down'})">${pcS(r.pc)} hoy</small><em>${fmtCap(r.m)}</em></div>
    ${r.rt?`<div class="idrt" data-k="${/fuerte/.test(r.rt)&&/Compra/.test(r.rt)?'sb':/Compra/.test(r.rt)?'b':/Venta/.test(r.rt)?'s':'h'}"><span>Consenso de analistas</span><b>${r.rt}</b>${r.na?`<small>${r.na} analistas</small>`:''}</div>`:''}
    <div class="idspark" data-s="${esc(r.s)}"><div class="ld"></div></div>
    <div class="idm">${bar('Potencial analistas',r.parts.up,pct(r.up,0))}${bar('Valor (P/E)',r.parts.val,r.pe?r.pe.toFixed(1):'—')}${bar('Dividendo',r.y>0?r.parts.div:0,(r.y||0).toFixed(2)+'%')}${bar('Rango 52 sem.',r.pos??0,r.pos!=null?Math.round(r.pos*100)+'%':'—')}</div>
    <ul class="idwhy">${why.map(([t,w])=>`<li class="${w?'w':''}">${t}</li>`).join('')}</ul>
    <div class="acts"><button class="btn idf">Ver ficha</button><button class="btn solid idb">${ic('broker','',false)} Comprar de verdad</button><button class="btn idw">${ic('star','',false)} ${wl?'Siguiendo':'Seguir'}</button><button class="btn ida">Opinión de IA</button></div></article>`;}

function idAnimate(){const cards=$$('#idGrid .idc');
  if(window.gsap&&!RM)gsap.fromTo(cards,{y:26,opacity:0},{y:0,opacity:1,duration:.6,ease:'expo.out',stagger:.05,clearProps:'transform,opacity'});
  cards.forEach((c,i)=>setTimeout(()=>{const fg=c.querySelector('.fg'),n=c.querySelector('.idring span');
    if(window.gsap&&!RM){gsap.to(fg,{attr:{'stroke-dashoffset':fg.dataset.o},duration:1.2,ease:'expo.out'});const o={v:0};gsap.to(o,{v:+n.dataset.n,duration:1.2,ease:'expo.out',onUpdate:()=>n.textContent=Math.round(o.v)});}
    else{fg.setAttribute('stroke-dashoffset',fg.dataset.o);n.textContent=n.dataset.n;}
    c.querySelectorAll('.idm i').forEach(b=>b.style.width=b.dataset.w+'%');},RM?0:120+i*60));
  sparkObs();}

/* gráfico de barras animado */
function idBars(top){const W=Math.max(300,Math.min(640,$('#idBars').clientWidth||560)),rh=30,H=top.length*rh+6,lw=80,vw=64;const val=r=>idTab==='perfil'?r.score/100:idTab==='up'?Math.max(0,r.up||0):idTab==='div'?(r.y||0):idTab==='val'?(r.pe||0):(r.pos||0);
  const mx=Math.max(...top.map(val),idTab==='perfil'||idTab==='mom'?1:.0001);const txt=r=>idTab==='perfil'?r.score:idTab==='up'?pct(r.up,0):idTab==='div'?(r.y||0).toFixed(2)+'%':idTab==='val'?(r.pe?r.pe.toFixed(1):'—'):Math.round((r.pos||0)*100)+'%';
  $('#idBars').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc($('#idBarsT').textContent)}">${top.map((r,i)=>{const y=i*rh+4,w=(W-lw-vw)*val(r)/mx;
    return `<g data-s="${esc(r.s)}"><title>${esc(r.n)}</title><text x="0" y="${y+16}">${i+1}</text><text class="lb" x="22" y="${y+16}">${esc(r.s)}</text><rect class="tr" x="${lw}" y="${y+4}" width="${W-lw-vw}" height="16" rx="8"/><rect class="br" x="${lw}" y="${y+4}" width="${Math.max(4,w).toFixed(1)}" height="16" rx="8" data-w="${Math.max(4,w).toFixed(1)}"/><text class="vl" x="${W-vw+10}" y="${y+16}">${txt(r)}</text></g>`;}).join('')}</svg>`;
  $$('#idBars g').forEach(g=>g.onclick=()=>{const c=$(`#idGrid .idc[data-s="${g.dataset.s}"]`);if(c)c.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});else coOpen(g.dataset.s);});
  if(window.gsap&&!RM){gsap.fromTo('#idBars rect.br',{attr:{width:4}},{attr:{width:(i,el)=>el.dataset.w},duration:1.1,ease:'expo.out',stagger:.06});gsap.fromTo('#idBars text',{opacity:0},{opacity:1,duration:.5,stagger:.02});}}

/* dispersión P/E vs potencial */
function idScatter(L,topSet){const P=L.filter(r=>r.pe&&r.up!=null&&r.pe<80).slice(0,80);const W=Math.max(300,Math.min(560,$('#idSc').clientWidth||460)),H=Math.round(W*.6),m={l:40,r:12,t:12,b:30};if(!P.length){$('#idSc').innerHTML='<p class="note">Sin datos suficientes.</p>';return;}
  const xs=P.map(r=>r.pe),ys=P.map(r=>Math.max(-.3,Math.min(.8,r.up)));const x0=0,x1=Math.ceil(Math.max(...xs)/10)*10,y0=Math.min(-.1,Math.floor(Math.min(...ys)*10)/10),y1=Math.max(.3,Math.ceil(Math.max(...ys)*10)/10);
  const X=v=>m.l+(v-x0)/(x1-x0)*(W-m.l-m.r),Y=v=>H-m.b-(v-y0)/(y1-y0)*(H-m.t-m.b);
  let g='';for(let k=0;k<=4;k++){const v=y0+(y1-y0)*k/4;g+=`<line class="ax" x1="${m.l}" x2="${W-m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v)+4}">${Math.round(v*100)}%</text>`;}
  for(let k=0;k<=4;k++){const v=x0+(x1-x0)*k/4;g+=`<text x="${X(v)-6}" y="${H-10}">${Math.round(v)}</text>`;}
  g+=`<line class="zero" x1="${m.l}" x2="${W-m.r}" y1="${Y(0)}" y2="${Y(0)}"/><text x="${W-m.r-60}" y="${H-10}">P/E →</text>`;
  $('#idSc').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dispersión de P/E frente a potencial">${g}${P.map(r=>`<circle class="${topSet.has(r.s)?'top':''}" data-s="${esc(r.s)}" cx="${X(r.pe).toFixed(1)}" cy="${Y(Math.max(-.3,Math.min(.8,r.up))).toFixed(1)}" r="${(4+Math.sqrt(r.m/1e12)*4).toFixed(1)}"><title>${esc(r.s)} · P/E ${r.pe.toFixed(1)} · potencial ${pct(r.up,0)}</title></circle>`).join('')}<text class="tip" id="idTip" x="${m.l+6}" y="${m.t+12}"></text></svg>`;
  $$('#idSc circle').forEach(c=>{c.onpointerenter=()=>{const r=P.find(x=>x.s===c.dataset.s);$('#idTip').textContent=`${r.s} · P/E ${r.pe.toFixed(1)} · potencial ${pct(r.up,0)}`;};c.onclick=()=>coOpen(c.dataset.s);});
  if(window.gsap&&!RM)gsap.from('#idSc circle',{attr:{r:0},duration:.7,ease:'back.out(2)',stagger:{each:.012,from:'random'}});}

/* minigráficos de 6 meses: se cargan al verse */
const SPK={};let spkQ=[],spkRun=0,spkIO=null;
function sparkObs(){if(!('IntersectionObserver' in window)){$$('#idGrid .idspark').forEach(e=>spkQ.push(e));spkPump();return;}
  if(!spkIO)spkIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){spkIO.unobserve(e.target);spkQ.push(e.target);spkPump();}}),{rootMargin:'120px'});
  $$('#idGrid .idspark').forEach(e=>spkIO.observe(e));}
function spkPump(){while(spkRun<2&&spkQ.length){const el=spkQ.shift();spkRun++;spark(el).finally(()=>{spkRun--;spkPump();});}}
async function spark(el){const s=el.dataset.s;try{if(!SPK[s]){const r=await fetch(`${MKT}?symbol=${encodeURIComponent(s)}&range=6m`);const d=await r.json();SPK[s]=(d.pts||[]).map(p=>p[1]);}
  const ys=SPK[s];if(!el.isConnected)return;if(ys.length<2){el.innerHTML='<p class="note" style="margin:20px 0 0">Sin gráfico disponible.</p>';return;}
  const W=300,H=64,mn=Math.min(...ys),mx=Math.max(...ys),X=i=>i/(ys.length-1)*W,Y=v=>H-4-(v-mn)/((mx-mn)||1)*(H-10);const up=ys.at(-1)>=ys[0],col=up?'var(--up)':'var(--down)';
  const d=ys.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join('');const ch=ys.at(-1)/ys[0]-1;const id='g'+s.replace(/\W/g,'');
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="Precio de 6 meses: ${pct(ch)}"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${up?TH.up:TH.down}" stop-opacity=".25"/><stop offset="1" stop-color="${up?TH.up:TH.down}" stop-opacity="0"/></linearGradient></defs><path class="ar" d="${d}L${W} ${H}L0 ${H}Z" fill="url(#${id})"/><path class="ln" d="${d}" stroke="${col}" vector-effect="non-scaling-stroke"/></svg><small style="position:absolute;right:0;top:0;font:600 11px var(--sans);color:${col}">6 meses ${pct(ch)}</small>`;
  const ln=el.querySelector('.ln'),ar=el.querySelector('.ar');if(window.gsap&&!RM&&ln.getTotalLength){const L=ln.getTotalLength();gsap.fromTo(ln,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.3,ease:'power2.inOut'});gsap.from(ar,{opacity:0,duration:1,delay:.5});}}
  catch(e){if(el.isConnected)el.innerHTML='<p class="note" style="margin:20px 0 0">Sin gráfico disponible.</p>';}}

const _sv16=setView;setView=function(v,o){_sv16(v,o);if(v==='ideas'){if(MKT)idLoad();}};
{const v=ID2V[location.hash.slice(1)];if(v==='ideas')setView('ideas',{noHash:true});}
const _accUI16=accUI;accUI=function(){_accUI16();if(VIEW==='ideas'&&IDS.length)idRender();};

/* ---------- cuentas con correo y contraseña (versión web) ---------- */
const AUTH=window.LC_AUTH||null;
if(AUTH){
  let TOK=null;try{TOK=localStorage.getItem('lc_tok');}catch(e){}
  const setTok=t=>{TOK=t;try{t?localStorage.setItem('lc_tok',t):localStorage.removeItem('lc_tok');}catch(e){}};
  async function api(action,body={}){let r;try{r=await fetch(AUTH,{method:'POST',headers:{'content-type':'application/json',...(TOK?{authorization:'Bearer '+TOK}:{})},body:JSON.stringify({action,...body})});}catch(e){throw {code:'network',message:'Sin conexión. Revisa tu internet.'};}
    let d={};try{d=await r.json();}catch(e){}if(!r.ok)throw {status:r.status,code:d.code||'error',message:d.message||'Algo salió mal. Intenta de nuevo.'};return d;}
  let lastSave=0;
  CL.ref={set:async({profile,state})=>{const d=await api('save',{state,profile:{name:profile.name,risk:profile.risk,cur:profile.cur,goal:profile.goal}});lastSave=Date.now();if(d.profile&&ACC)ACC.email=d.profile.email;},
    get:async()=>{const d=await api('me');return {exists:true,data:()=>d};},delete:async()=>{}};
  const _push16=push;push=function(force){if(!force&&Date.now()-lastSave<45000)return Promise.resolve();return _push16(force);};
  addEventListener('pagehide',()=>{if(CL.dirty&&TOK&&ACC&&!ACCOFF){try{fetch(AUTH,{method:'POST',keepalive:true,headers:{'content-type':'application/json',authorization:'Bearer '+TOK},body:JSON.stringify({action:'save',state:gather()})});}catch(e){}}});
  addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&CL.dirty)push(true);});
  const clearLocal=()=>{['acc','accSync','accOff',...SYNC].forEach(k=>rawSet(k,null));setTok(null);};
  const reloadMsg=m=>{try{sessionStorage.setItem('lc_msg',m);sessionStorage.setItem('lc_gate','1');}catch(e){}location.reload();};

  /* sin sesión válida no hay cuenta activa en la web */
  if(!TOK&&ACC&&!ACCOFF){ACCOFF=true;_sset.call(store,'accOff',true);}
  (async()=>{if(!TOK){accUI();return;}
    try{const d=await api('me');CL.ok=true;CL.ready=true;
      if((d.updatedAt||0)>CL.last+1000&&d.state){restore(d);return;}
      ACC={...(ACC||{}),...d.profile};ACCOFF=false;_sset.call(store,'acc',ACC);_sset.call(store,'accOff',false);setRisk(ACC.risk);setSync('ok');accUI();if(!d.state){CL.dirty=true;push(true);}}
    catch(e){if(e.status===401){setTok(null);if(ACC){ACCOFF=true;_sset.call(store,'accOff',true);}toast(e.message,ic('hello','',false));}else{CL.ok=true;CL.ready=true;setSync('err');}accUI();}})();

  const pwScore=p=>{let s=0;if(p.length>=8)s++;if(/[A-Za-z]/.test(p)&&/\d/.test(p))s++;if(p.length>=12)s++;if(/[^A-Za-z0-9]/.test(p)||/[A-Z]/.test(p)&&/[a-z]/.test(p))s++;return p?Math.max(1,s):0;};
  const PWT=['','Débil','Aceptable','Buena','Muy segura'];
  const pwField=(id,ph,ac)=>`<div class="pwrap"><input class="f" id="${id}" type="password" autocomplete="${ac}" placeholder="${ph}" maxlength="128"><button type="button" class="eye" data-for="${id}">Mostrar</button></div>`;
  const bindEyes=()=>$$('#sheetBody .eye').forEach(b=>b.onclick=()=>{const i=$('#'+b.dataset.for);const sh=i.type==='password';i.type=sh?'text':'password';b.textContent=sh?'Ocultar':'Mostrar';});
  const showErr=(m)=>{let e=$('#authErr');if(!e)return;e.textContent=m;e.classList.remove('hidden');if(window.gsap&&!RM)gsap.fromTo(e,{x:-8},{x:0,duration:.4,ease:'elastic.out(1,.3)'});};
  const busy=(b,on,t)=>{b.disabled=on;if(on){b._t=b.textContent;b.textContent=t||'Un momento…';}else if(b._t)b.textContent=b._t;};

  function authSheet(tab,email){
    openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px" id="auH">${tab==='login'?'Inicia sesión':'Crea tu cuenta'}</h3>
      <p class="note" id="auP">${tab==='login'?'Entra con tu correo y contraseña para recuperar tu progreso en cualquier dispositivo.':'Gratis. Tu cartera, tu nivel, tu alcancía y tu diario se guardan en tu cuenta y los abres desde cualquier dispositivo.'}</p>
      <div class="authtabs" data-t="${tab}" role="tablist"><span class="pill2"></span><button type="button" data-t="register" class="${tab!=='login'?'act':''}">Crear cuenta</button><button type="button" data-t="login" class="${tab==='login'?'act':''}">Iniciar sesión</button></div>
      <form id="auF" novalidate>
        <div id="auReg" class="${tab==='login'?'hidden':''}"><label class="l" for="auN">Nombre</label><input class="f" id="auN" maxlength="40" autocomplete="name" value="${esc(ACC?.name||'')}"></div>
        <label class="l" for="auE">Correo electrónico</label><input class="f" id="auE" type="email" inputmode="email" autocomplete="email" maxlength="254" placeholder="tucorreo@ejemplo.com" value="${esc(email||ACC?.email||'')}">
        <label class="l" for="auW">Contraseña</label>${pwField('auW','Mínimo 8 caracteres, con letras y números',tab==='login'?'current-password':'new-password')}
        <div id="auLog" class="aulog ${tab==='login'?'':'hidden'}"><button type="button" class="linkb" id="auForgot">¿Olvidaste tu contraseña?</button></div>
        <div id="auReg2" class="${tab==='login'?'hidden':''}"><div class="pwm" id="auM" data-s="0"><i></i><i></i><i></i><i></i></div><p class="pwt" id="auMt"></p>
          <label class="l">¿Cómo te gusta invertir?</label><div class="seg" id="auR">${[['conservador','Con calma'],['moderado','Equilibrado'],['agresivo','Arriesgado']].map(([k,l])=>`<button type="button" data-v="${k}" class="${(ACC?.risk||idRisk)===k?'act':''}">${l}</button>`).join('')}</div>
          <label class="l">Moneda principal</label><div class="seg" id="auC"><button type="button" data-v="PEN" class="${ACC?.cur!=='USD'?'act':''}">Soles (S/)</button><button type="button" data-v="USD" class="${ACC?.cur==='USD'?'act':''}">Dólares ($)</button></div>
          <label class="chk"><input type="checkbox" id="auOk"> Entiendo que Lucioni Capital es una herramienta educativa y no es asesoría financiera personalizada.</label></div>
        <p class="autherr hidden" id="authErr" role="alert"></p>
        <button class="cta" type="submit" id="auGo" style="width:100%;justify-content:center;margin-top:18px">${tab==='login'?'Entrar':'Crear mi cuenta'}</button>
      </form>
      <p class="authsec">${ic('stop','',false)} Contraseña cifrada con scrypt. Nunca la guardamos en texto ni la vemos.</p></div>`);
    let mode=tab==='login'?'login':'register';
    const setMode=m=>{mode=m;const t=$('#sheetBody .authtabs');t.dataset.t=m;$$('#sheetBody .authtabs button').forEach(b=>b.classList.toggle('act',b.dataset.t===m));
      $('#auReg').classList.toggle('hidden',m==='login');$('#auReg2').classList.toggle('hidden',m==='login');$('#auLog').classList.toggle('hidden',m!=='login');$('#auH').textContent=m==='login'?'Inicia sesión':'Crea tu cuenta';
      $('#auP').textContent=m==='login'?'Entra con tu correo y contraseña para recuperar tu progreso en cualquier dispositivo.':'Gratis. Tu cartera, tu nivel, tu alcancía y tu diario se guardan en tu cuenta y los abres desde cualquier dispositivo.';
      $('#auGo').textContent=m==='login'?'Entrar':'Crear mi cuenta';$('#auW').autocomplete=m==='login'?'current-password':'new-password';$('#authErr').classList.add('hidden');
      if(window.gsap&&!RM)gsap.from(m==='login'?'#auE':'#auReg',{y:8,opacity:0,duration:.35,ease:'expo.out'});};
    $$('#sheetBody .authtabs button').forEach(b=>b.onclick=()=>setMode(b.dataset.t));
    $$('#auR button').forEach(b=>b.onclick=()=>$$('#auR button').forEach(x=>x.classList.toggle('act',x===b)));
    $$('#auC button').forEach(b=>b.onclick=()=>$$('#auC button').forEach(x=>x.classList.toggle('act',x===b)));
    bindEyes();$('#auForgot').onclick=()=>forgotSheet($('#auE').value.trim());
    $('#auW').addEventListener('input',e=>{const s=pwScore(e.target.value);$('#auM').dataset.s=s;$('#auMt').textContent=PWT[s];});
    setTimeout(()=>{const f=mode==='login'?(($('#auE').value)?$('#auW'):$('#auE')):$('#auN');f&&f.focus({preventScroll:true});},350);
    $('#auF').onsubmit=async e=>{e.preventDefault();const email=$('#auE').value.trim(),pw=$('#auW').value,btn=$('#auGo');
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){showErr('Escribe un correo válido.');$('#auE').focus();return;}
      if(mode==='register'){const n=$('#auN').value.trim();if(!n){showErr('Escribe tu nombre.');$('#auN').focus();return;}
        if(pw.length<8||!/[A-Za-z]/.test(pw)||!/\d/.test(pw)){showErr('La contraseña debe tener al menos 8 caracteres, con letras y números.');$('#auW').focus();return;}
        if(!$('#auOk').checked){showErr('Marca la casilla para continuar.');return;}
        busy(btn,true,'Creando tu cuenta…');
        try{const d=await api('register',{email,password:pw,name:n,risk:$('#auR .act').dataset.v,cur:$('#auC .act').dataset.v,goal:ACC?.goal||''});
          setTok(d.token);ACC={...d.profile};ACCOFF=false;_sset.call(store,'acc',ACC);_sset.call(store,'accOff',false);CL.ok=true;CL.ready=true;CL.dirty=true;
          setRisk(ACC.risk);store.set('risk',ACC.risk);await push(true);accUI();
          recSheet(d.recovery,true,()=>{closeSheet();setTimeout(()=>{FX.burst(innerWidth/2,innerHeight*.35,110);SFX.lvl();toast(`Bienvenido a Lucioni Capital, ${n.split(' ')[0]}`,ic('trophy','',false));addXP(25);},350);});}
        catch(err){busy(btn,false);showErr(err.message);if(err.code==='exists')setTimeout(()=>setMode('login'),1400);}
        return;}
      if(!pw){showErr('Escribe tu contraseña.');$('#auW').focus();return;}
      busy(btn,true,'Entrando…');
      try{const d=await api('login',{email,password:pw});await loginDone(d);}
      catch(err){busy(btn,false);showErr(err.message);}};}

  async function loginDone(d){setTok(d.token);
    if(d.state){restore(d);return;}
    ACC={...d.profile};ACCOFF=false;_sset.call(store,'acc',ACC);_sset.call(store,'accOff',false);CL.ok=true;CL.ready=true;CL.dirty=true;setRisk(ACC.risk);await push(true);accUI();closeSheet();
    toast(`Hola de nuevo, ${ACC.name.split(' ')[0]}`,ic('hello','',false));}
  /* código de recuperación: reemplaza al correo de "olvidé mi contraseña" */
  function recSheet(code,isNew,done){
    openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">${isNew?'Tu cuenta está lista':'Nuevo código de recuperación'}</h3>
      <p class="note">Guarda este código en un lugar seguro (una nota, una foto o un papel). Es la única forma de recuperar tu cuenta si olvidas tu contraseña. Solo se muestra una vez.</p>
      <div class="rcode" id="rcBox" aria-label="Código de recuperación">${esc(code).split('').map((c,i)=>`<span style="--i:${i}">${c}</span>`).join('')}</div>
      <div class="acts" style="justify-content:center"><button class="btn" id="rcCopy">${ic('check','',false)} Copiar</button><button class="btn" id="rcDl">Descargar .txt</button></div>
      <label class="chk"><input type="checkbox" id="rcOk"> Ya guardé mi código en un lugar seguro.</label>
      <button class="cta" id="rcGo" disabled style="width:100%;justify-content:center;margin-top:16px">Continuar</button></div>`);
    if(window.gsap&&!RM)gsap.from('#rcBox span',{y:-18,opacity:0,rotateX:-90,duration:.5,ease:'back.out(2)',stagger:.035,delay:.2});
    $('#rcCopy').onclick=async()=>{try{await navigator.clipboard.writeText(code);toast('Código copiado',ic('check','',false));}catch(e){toast('Selecciona el código y cópialo a mano');}};
    $('#rcDl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([`Lucioni Capital — código de recuperación\nCuenta: ${ACC?.email||''}\nCódigo: ${code}\nGenerado: ${new Date().toLocaleString('es-PE')}\n\nÚsalo en "¿Olvidaste tu contraseña?". Cada código sirve una sola vez.\n`],{type:'text/plain'}));a.download='lucioni-capital-recuperacion.txt';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);};
    $('#rcOk').onchange=e=>{$('#rcGo').disabled=!e.target.checked;};
    $('#rcGo').onclick=()=>done?done():closeSheet();}
  function resetSheet(email){
    openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">Recupera tu cuenta</h3>
      <p class="note">Usa el código de recuperación que guardaste al crear tu cuenta y elige una contraseña nueva.</p><form id="rsF" novalidate>
      <label class="l" for="rsE">Correo electrónico</label><input class="f" id="rsE" type="email" autocomplete="email" value="${esc(email||'')}">
      <label class="l" for="rsC">Código de recuperación</label><input class="f mono" id="rsC" autocomplete="one-time-code" placeholder="XXXXX-XXXXX-XXXXX" maxlength="24" style="text-transform:uppercase;letter-spacing:.08em">
      <label class="l" for="rsN">Nueva contraseña</label>${pwField('rsN','Mínimo 8 caracteres, con letras y números','new-password')}
      <p class="autherr hidden" id="authErr" role="alert"></p>
      <button class="cta" type="submit" id="rsGo" style="width:100%;justify-content:center;margin-top:18px">Cambiar contraseña y entrar</button>
      <button type="button" class="linkb" id="rsBack" style="margin-top:12px">Volver a iniciar sesión</button></form>
      <p class="note">¿No tienes tu código? Por seguridad no podemos recuperar la cuenta sin él; puedes crear una cuenta nueva.</p></div>`);
    bindEyes();$('#rsBack').onclick=()=>authSheet('login',$('#rsE').value.trim());
    $('#rsF').onsubmit=async e=>{e.preventDefault();const b=$('#rsGo');busy(b,true,'Verificando…');
      try{const d=await api('reset',{email:$('#rsE').value.trim(),code:$('#rsC').value,next:$('#rsN').value});setTok(d.token);ACC={...(ACC||{}),...d.profile};
        recSheet(d.recovery,false,()=>loginDone(d));toast('Contraseña cambiada. Este es tu nuevo código.',ic('check','',false));}
      catch(err){busy(b,false);showErr(err.message);}};}
  function forgotSheet(email){
    openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">¿Olvidaste tu contraseña?</h3>
      <p class="note">Escribe el correo de tu cuenta y te enviamos un enlace para elegir una nueva. Vence en 30 minutos.</p>
      <form id="fgF" novalidate><label class="l" for="fgE">Correo electrónico</label><input class="f" id="fgE" type="email" inputmode="email" autocomplete="email" value="${esc(email||'')}">
      <p class="autherr hidden" id="authErr" role="alert"></p><div id="fgOk"></div>
      <button class="cta" type="submit" id="fgGo" style="width:100%;justify-content:center;margin-top:16px">Enviarme el enlace</button></form>
      <div class="orline"><span>o</span></div>
      <button class="btn" id="fgCode" style="width:100%;justify-content:center">Usar mi código de recuperación</button>
      <button type="button" class="linkb" id="fgBack" style="margin-top:12px">Volver a iniciar sesión</button></div>`);
    $('#fgCode').onclick=()=>resetSheet($('#fgE').value.trim());$('#fgBack').onclick=()=>authSheet('login',$('#fgE').value.trim());
    setTimeout(()=>{const f=$('#fgE');f&&!f.value&&f.focus({preventScroll:true});},300);
    $('#fgF').onsubmit=async e=>{e.preventDefault();const em=$('#fgE').value.trim(),b=$('#fgGo');if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){showErr('Escribe un correo válido.');return;}
      busy(b,true,'Enviando…');
      try{await api('forgot',{email:em});$('#authErr').classList.add('hidden');b.remove();
        $('#fgOk').innerHTML=`<div class="mailok"><span class="mailic" aria-hidden="true"><svg viewBox="0 0 48 48" width="48" height="48"><rect x="6" y="11" width="36" height="26" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M7 13l17 13 17-13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg></span><div><b>Revisa tu correo</b><p>Si ${esc(em)} tiene una cuenta, te llegará un enlace en unos minutos. Mira también en Spam o Promociones.</p></div></div>`;
        if(window.gsap&&!RM){gsap.from('#fgOk .mailok',{y:14,opacity:0,duration:.5,ease:'expo.out'});gsap.fromTo('#fgOk .mailic',{rotate:-14,scale:.6},{rotate:0,scale:1,duration:.7,ease:'back.out(3)'});}}
      catch(err){busy(b,false);showErr(err.message);if(err.code==='no_mail')$('#fgCode').classList.add('solid');}};}
  function linkSheet(uid,tok){
    openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">Elige una nueva contraseña</h3><p class="note">Abriste el enlace que te enviamos por correo. Crea tu nueva contraseña para entrar.</p>
      <form id="lkF" novalidate><label class="l" for="lkN">Nueva contraseña</label>${pwField('lkN','Mínimo 8 caracteres, con letras y números','new-password')}<div class="pwm" id="lkM" data-s="0"><i></i><i></i><i></i><i></i></div><p class="pwt" id="lkMt"></p>
      <label class="l" for="lkR">Repite la contraseña</label>${pwField('lkR','Escríbela otra vez','new-password')}
      <p class="autherr hidden" id="authErr" role="alert"></p><button class="cta" type="submit" id="lkGo" style="width:100%;justify-content:center;margin-top:16px">Guardar y entrar</button></form></div>`);
    bindEyes();$('#lkN').addEventListener('input',e=>{const sc=pwScore(e.target.value);$('#lkM').dataset.s=sc;$('#lkMt').textContent=PWT[sc];});
    $('#lkF').onsubmit=async e=>{e.preventDefault();const n=$('#lkN').value,b=$('#lkGo');if(n!==$('#lkR').value){showErr('Las contraseñas no coinciden.');return;}
      busy(b,true,'Guardando…');try{const d=await api('resetlink',{uid,token:tok,next:n});toast('Contraseña cambiada',ic('check','',false));await loginDone(d);}catch(err){busy(b,false);showErr(err.message);if(err.code==='link'){const x=document.createElement('button');x.className='btn';x.textContent='Pedir un enlace nuevo';x.style.marginTop='10px';x.onclick=()=>forgotSheet('');$('#lkF').appendChild(x);}}};}
  /* enlace del correo: #reset?u=…&t=… */
  if(/^#reset\?/.test(location.hash)){const q=new URLSearchParams(location.hash.slice(7)),u=q.get('u'),t=q.get('t');try{history.replaceState(null,'',location.pathname+location.search+'#inicio');}catch(e){}
    if(u&&t)setTimeout(()=>{if(!GATE.classList.contains('out'))gateClose(()=>linkSheet(u,t));else linkSheet(u,t);},600);}
  function recNewSheet(){openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">Código de recuperación</h3><p class="note">Genera un código nuevo si perdiste el anterior. El código anterior deja de funcionar.</p><form id="rnF" novalidate>
      <label class="l" for="rnP">Tu contraseña</label>${pwField('rnP','Tu contraseña','current-password')}<p class="autherr hidden" id="authErr" role="alert"></p>
      <button class="cta" type="submit" id="rnGo" style="width:100%;justify-content:center;margin-top:18px">Generar código nuevo</button></form></div>`);
    bindEyes();$('#rnF').onsubmit=async e=>{e.preventDefault();const b=$('#rnGo');busy(b,true);try{const d=await api('recovery',{password:$('#rnP').value});recSheet(d.recovery,false);}catch(err){busy(b,false);showErr(err.message);}};}

  /* iniciar sesión visible en todas partes */
  const _gate17=gateRender;gateRender=function(){_gate17();if(member())return;const box=$('#gBtns');if(!box)return;
    const known=ACC&&ACC.email;
    box.innerHTML=known?`<button class="cta" id="gIn">Entrar como ${esc(ACC.name.split(' ')[0])}</button><button class="btn" id="gNew">Crear otra cuenta</button><button class="btn ghost" id="gGo">Entrar sin cuenta</button>`
      :`<button class="cta" id="gNew">Crear cuenta gratis</button><button class="btn" id="gIn">Iniciar sesión</button><button class="btn ghost" id="gGo">Entrar sin cuenta</button>`;
    $('#gGo').onclick=()=>gateClose();$('#gNew').onclick=()=>gateClose(()=>authSheet('register'));$('#gIn').onclick=()=>gateClose(()=>authSheet('login',ACC?.email||''));};
  if(!GATE.classList.contains('out'))gateRender();
  const _accUI17=accUI;accUI=function(){_accUI17();if(member())return;
    const b=$('#accBtn');b.innerHTML=`${ic('hello','',false)}<span class="tx">Iniciar sesión</span>`;b.setAttribute('aria-label','Iniciar sesión o crear cuenta');
    const c=$('#menuAcc .mcta');if(c){c.innerHTML=`<p>${ACC&&ACC.email?`Hola, ${esc(ACC.name.split(' ')[0])}. Entra para seguir donde lo dejaste.`:'Crea tu cuenta con tu correo y guarda tu cartera, tus ideas, tu nivel y tu diario en cualquier dispositivo.'}</p><div class="acts"><button class="btn solid" id="mIn">Iniciar sesión</button><button class="btn" id="mNew">Crear cuenta</button></div>`;
      $('#mIn').onclick=()=>{closeMenu();authSheet('login',ACC?.email||'');};$('#mNew').onclick=()=>{closeMenu();authSheet('register');};}};
  $('#accBtn').onclick=()=>{member()?openAccount():authSheet('login',ACC?.email||'');};
  accUI();
  lockCard=(function(orig){return function(key){return orig(key).replace(/<button class="btn lkin">[^<]*<\/button>/,'').replace('<button class="cta lkgo">Crear cuenta gratis</button>','<button class="cta lkgo">Crear cuenta gratis</button><button class="btn lkin">Iniciar sesión</button>');};})(lockCard);
  const _idr17=idRender;idRender=function(){_idr17();const l=$('#idGrid .idlock');if(l&&!l.querySelector('.idin')){const b=document.createElement('button');b.className='btn idin';b.textContent='Iniciar sesión';b.style.marginLeft='8px';b.onclick=()=>signIn();$('#idGo').after(b);}};

  const _openAcc16=openAccount;
  openAccount=function(edit){
    if(!(TOK&&ACC&&!ACCOFF)){authSheet('register');return;}
    _openAcc16(edit);
    if(edit)return;
    const n=$('#sheetBody .note:last-child');if(n)n.textContent='Tu cuenta está protegida con tu correo y contraseña. Entra desde cualquier dispositivo y sigues donde lo dejaste.';
    const rows=$('#sheetBody .accrows');if(rows&&ACC.email)rows.insertAdjacentHTML('afterbegin',`<div><span>Correo</span><b>${esc(ACC.email)}</b></div>`);
    const acts=$('#aEdit')?.parentNode;if(acts){const b=document.createElement('button');b.className='btn';b.textContent='Cambiar contraseña';b.onclick=pwSheet;acts.appendChild(b);const r=document.createElement('button');r.className='btn';r.textContent='Código de recuperación';r.onclick=recNewSheet;acts.appendChild(r);}
    $('#aOut').onclick=async()=>{await push(true).catch(()=>{});clearLocal();reloadMsg('Sesión cerrada. Tus datos quedan guardados en tu cuenta.');};
    $('#aDel').onclick=delSheet;};
  signIn=function(){authSheet('login',ACC?.email||'');};
  delAccount=function(){delSheet();};

  function pwSheet(){openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">Cambiar contraseña</h3><form id="pwF" novalidate>
      <label class="l" for="pwC">Contraseña actual</label>${pwField('pwC','Tu contraseña actual','current-password')}
      <label class="l" for="pwN">Nueva contraseña</label>${pwField('pwN','Mínimo 8 caracteres, con letras y números','new-password')}
      <p class="autherr hidden" id="authErr" role="alert"></p><button class="cta" type="submit" id="pwGo" style="width:100%;justify-content:center;margin-top:18px">Guardar nueva contraseña</button></form></div>`);
    bindEyes();$('#pwF').onsubmit=async e=>{e.preventDefault();const b=$('#pwGo');busy(b,true);
      try{await api('password',{current:$('#pwC').value,next:$('#pwN').value});closeSheet();toast('Contraseña actualizada',ic('check','',false));}catch(err){busy(b,false);showErr(err.message);}};}
  function delSheet(){openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">Borrar cuenta</h3><p class="note">Se borran para siempre tu perfil, tu cartera de práctica, tu nivel, tu alcancía y tu diario. No se puede deshacer.</p><form id="dlF" novalidate>
      <label class="l" for="dlP">Escribe tu contraseña para confirmar</label>${pwField('dlP','Tu contraseña','current-password')}
      <p class="autherr hidden" id="authErr" role="alert"></p><button class="btn red" type="submit" id="dlGo" style="width:100%;justify-content:center;margin-top:18px">Borrar mi cuenta para siempre</button></form></div>`);
    bindEyes();$('#dlF').onsubmit=async e=>{e.preventDefault();const b=$('#dlGo');busy(b,true,'Borrando…');
      try{await api('delete',{password:$('#dlP').value});clearLocal();reloadMsg('Cuenta borrada. Empiezas de cero.');}catch(err){busy(b,false);showErr(err.message);}};}
}
