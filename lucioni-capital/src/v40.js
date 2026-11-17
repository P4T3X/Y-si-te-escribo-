/* ===================== V40: Lucioni Life Planner (Fase 8) — amplía Metas (mismas metas GOALS y mismo motor gSim) ===================== */
(()=>{
const {lines30}=window.L30;
/* ---------- tipos nuevos de meta en la misma lista de plantillas de Metas ---------- */
if(!GTPL.some(t=>t[0]==='vehiculo'))GTPL.push(['vehiculo','Vehículo','bolt',35000,3,'conservador'],['patrimonio','Patrimonio objetivo','diversificar',500000,15,'moderado']);
const PRIO={1:'Alta',2:'Media',3:'Baja'},SRC={liquid:'Mi liquidez (cuentas y efectivo)',invest:'Inversiones aparte',other:'Otra fuente'};
const uid=()=>'g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function ensureIds(){let ch=false;GOALS.forEach(g=>{if(!g.id){g.id=uid();ch=true;}if(!g.prio){g.prio=2;ch=true;}});if(ch)saveGoals();}
ensureIds();

/* ================= MOTOR LP (puro) =================
   Aporte necesario con rentabilidad esperada del perfil: el ahorro actual crece todo el plazo y los aportes empiezan
   cuando termina la meta de la que depende. Las metas se financian con tu capacidad de ahorro por prioridad y fecha. */
const fx=()=>FXD.rate||3.75,toPEN=(g,v)=>g.cur==='USD'?v*fx():v;
const mBetween=(a,b)=>Math.max(0,Math.round((Date.parse(b)-Date.parse(a))/(30.44*864e5)));
function reqMonthly(T,S,n,s,ra){if(n<=0)return Math.max(0,T-S);const r=Math.pow(1+ra,1/12)-1,k=Math.max(1,n-s),grow=S*Math.pow(1+r,n);if(grow>=T)return 0;return r?(T-grow)*r/(Math.pow(1+r,k)-1):(T-grow)/k;}
/* dependencias: se ignoran las que forman un ciclo o apuntan a metas inexistentes */
function startOf(g,byId,now,seen=new Set()){if(!g.after||!byId[g.after]||seen.has(g.id))return 0;seen.add(g.id);const p=byId[g.after];if(seen.has(p.id))return 0;
 return Math.max(mBetween(now,p.date),startOf(p,byId,now,seen));}
function plan(goals,cap,opt={}){const now=opt.now||new Date().toISOString().slice(0,10),byId=Object.fromEntries(goals.map(g=>[g.id,g])),dr=opt.dr||0;
 const rows=goals.map(g=>{const P=GPROF[g.risk]||GPROF.moderado,ra=Math.max(-.5,P.r+dr),n=mBetween(now,g.date),s=Math.min(n,startOf(g,byId,now));
  const T=toPEN(g,gTarget(g)),S=toPEN(g,g.saved),need=opt.needFn?opt.needFn(g,n,s,ra):reqMonthly(T,S,n,s,ra);return {g,id:g.id,name:g.name,prio:g.prio||2,date:g.date,T,S,n,s,ra,need,cur:toPEN(g,g.monthly),progress:T?Math.min(1,S/T):0};});
 /* reparto mes a mes: en cada mes, las metas activas se financian por prioridad y luego por fecha; cuando una termina, su aporte pasa a las demás */
 const order=[...rows].sort((a,b)=>a.prio-b.prio||(a.date<b.date?-1:1)),H=Math.max(1,...rows.map(r=>r.n)),com=new Array(H).fill(0),needM=new Array(H).fill(0);
 rows.forEach(r=>{r.sum=0;r.act=0;});
 for(let m=0;m<H;m++){let left=cap==null?Infinity:cap;for(const r of order){if(m<r.s||m>=r.n)continue;const a=Math.min(r.need,Math.max(0,left));left-=a;r.sum+=a;r.act++;com[m]+=a;needM[m]+=r.need;}}
 rows.forEach(r=>{r.alloc=r.act?r.sum/r.act:0;r.funded=!r.need||r.alloc>=r.need-1e-6?1:r.alloc/r.need;});
 const now0=needM[0]||0,peak=Math.max(0,...needM),gap=cap==null?0:Math.max(0,...needM.map(x=>x-cap)),free=cap==null?null:cap-now0;
 return {rows,order,need:now0,peak,cap,free,gap,com,needM};}
/* compromisos mes a mes (cuánto aportas a metas activas en cada mes) */
function commitments(P,H){const out=new Array(H).fill(0);for(let m=0;m<H&&m<P.com.length;m++)out[m]=P.com[m];return out;}
/* probabilidad con el motor de Metas (Monte Carlo); para metas dependientes el ahorro crece sin aportes hasta que empiezan */
function prob(r,dr=0,cmul=1){const g=r.g,P=GPROF[g.risk]||GPROF.moderado,ra=Math.max(-.5,P.r+dr),saved=g.saved*Math.pow(1+ra,r.s/12),c=(r.alloc/(g.cur==='USD'?fx():1))*cmul;
 return gSim({...g,saved,real:false,target:gTarget(g)},{months:Math.max(1,r.n-r.s),r:ra,c,target:gTarget(g)}).prob;}
/* mismo criterio que Metas: aporte para llegar con 80% de probabilidad (gNeeded); en metas dependientes el ahorro crece hasta que empiezan los aportes */
const N80={};function need80(g,n,s,ra){const k=[g.id,g.target,g.saved,g.date,g.risk,g.real,g.cur,n,s].join('|');if(N80[k]!=null)return N80[k];
 const months=Math.max(1,n-s),d=new Date(Date.now()+months*30.44*864e5).toISOString().slice(0,10),g2={...g,saved:g.saved*Math.pow(1+ra,s/12),date:d,real:false,target:gTarget(g)};
 return N80[k]=toPEN(g,n<=0?Math.max(0,g2.target-g2.saved):gNeeded(g2,.8));}
window.LP40={reqMonthly,plan,commitments,prob,mBetween,startOf,need80};

/* ================= datos de Mis finanzas (si existen) ================= */
let LP={cap:null,auto:true,...(store.get('lp',{})||{})};if(!SYNC.includes('lp'))SYNC.push('lp');const saveLP=()=>store.set('lp',LP);
async function finData(){const F=window.F33;if(!F||!member())return null;try{await F.finLoad();await F.fx();}catch(e){return null;}const FIN=F.FIN;if(!FIN||!FIN.meta||!FIN.meta.accounts.length)return null;
 const base=FIN.meta.settings.base,R=F.FXR,A=LFIN.aggregate(F.allTx(),FIN.meta,R),ms=Object.keys(A.byM).sort().filter(k=>k<new Date().toISOString().slice(0,7)).slice(-6);if(!ms.length)return null;
 const c=v=>{const x=LFIN.conv(v,base,'PEN',R);return x?x.v:null;};const inc=ms.reduce((a,k)=>a+A.byM[k].inc,0)/ms.length,exp=ms.reduce((a,k)=>a+A.byM[k].exp,0)/ms.length;
 let liquid=null;try{const W=window.LW&&LW.netWorth({meta:FIN.meta,txs:F.allTx(),props:FIN.estate?.props||[],pf:[],debt:null,R,base});liquid=W?c(W.parts.cash):null;}catch(e){}
 return {months:ms.length,cap:c(inc-exp),exp:c(exp),liquid,base};}

/* ================= vista ================= */
const nf=v=>v==null||!isFinite(v)?'—':'S/ '+Math.round(v).toLocaleString('es-PE');
const pc=v=>v==null||!isFinite(v)?'—':Math.round(v*100)+'%';
const fdm=d=>new Date(d+'T12:00:00Z').toLocaleDateString('es-PE',{month:'short',year:'numeric',timeZone:'UTC'});
const sec=mkView30('plan','planificador','Life Planner',`<div class="sh"><div><h2>Life <em>Planner</em></h2><p>Tus metas de vida en un solo plan: cuánto necesitas aportar, en qué orden, qué depende de qué, cómo afecta tu liquidez y qué pasa si los mercados rinden menos. Usa tus mismas metas de Lucioni Goals.</p></div></div><div id="lpBody" class="lp40"></div>`);
let SORT='prio';
async function render(){const B=$('#lpBody');ensureIds();LP={cap:null,auto:true,...(store.get('lp',{})||{})};
 if(!GOALS.length){B.innerHTML=`<div class="panel sl38empty">${ic('target','',false)}<p>Aún no tienes metas. Crea la primera (vivienda, auto, estudios, viaje, fondo de emergencia, jubilación o patrimonio) y vuelve aquí para planificarlas juntas.</p><button class="btn pri" id="lpNew">Crear una meta</button></div>`;$('#lpNew').onclick=()=>{setView('goals');setTimeout(()=>gEdit(),300);};return;}
 B.innerHTML='<div class="panel"><div class="ec36sk"><i></i><i></i><i></i></div></div>';
 const FD=LP.auto?await finData():null;const cap=LP.auto&&FD&&FD.cap!=null?Math.max(0,FD.cap):LP.cap;
 const P=plan(GOALS,cap,{needFn:need80}),H=Math.min(360,Math.max(24,...P.rows.map(r=>r.n))),C=commitments(P,H);
 const over=cap!=null?C.findIndex(v=>v>cap+0.5):-1,src=LP.auto&&FD?`promedio de ingresos menos gastos de tus últimos ${FD.months} meses en Mis finanzas`:cap!=null?'monto que ingresaste':'sin definir';
 const liqSet=P.rows.filter(r=>r.g.src==='liquid').reduce((a,r)=>a+r.S,0),liqFree=FD&&FD.liquid!=null?FD.liquid-liqSet:null,cover=liqFree!=null&&FD.exp?liqFree/FD.exp:null;
 const sc=[['Pesimista',-0.02,0.8],['Base',0,1],['Optimista',0.015,1]];
 const probs=P.rows.map(r=>sc.map(([,dr,cm])=>prob(r,dr,cm)));
 const Pd=cap!=null?plan(GOALS,cap*0.8,{needFn:need80}):null,hurt=Pd?Pd.rows.filter((r,i)=>r.funded<0.999&&P.rows[i].funded>=0.999):[];
 const rows=[...P.rows].map((r,i)=>({...r,pb:probs[i][1],i})).sort((a,b)=>SORT==='date'?(a.date<b.date?-1:1):SORT==='prob'?a.pb-b.pb:SORT==='need'?b.need-a.need:a.prio-b.prio||(a.date<b.date?-1:1));
 const st=r=>r.funded>=.999&&r.pb>=.75?['ok','En camino']:r.funded>=.999||r.pb>=.5?['mid','En riesgo']:['bad','Sin financiar'];
 B.innerHTML=`<div class="ec36g lp40k">
  <div class="ec36k"><small>Aporte mensual necesario hoy</small><b class="mono">${nf(P.need)}</b><span>${P.peak>P.need+0.5?`En el mes más exigente: ${nf(P.peak)}`:'Para llegar a cada meta con 80% de probabilidad'}</span></div>
  <div class="ec36k"><small>Capacidad de ahorro mensual</small><b class="mono">${nf(cap)}</b><span>${esc(src)}</span></div>
  <div class="ec36k"><small>${P.gap>0?'Te faltan en el mes más exigente':'Te sobran este mes'}</small><b class="mono ${P.gap>0?'dn':'up'}">${cap==null?'—':nf(P.gap>0?P.gap:P.free)}</b><span>${P.gap>0?'Las metas de menor prioridad quedan sin financiar por completo':'Margen libre después de financiar tus metas'}</span></div>
  <div class="ec36k"><small>Liquidez libre</small><b class="mono">${liqFree==null?'—':nf(liqFree)}</b><span>${liqFree==null?'Conecta Mis finanzas para calcularla':`Tras apartar ${nf(liqSet)} de metas que salen de tu liquidez · ${cover==null?'':cover.toFixed(1)+' meses de gasto'}`}</span></div></div>
 <div class="panel"><div class="sl38row"><label class="chk"><input type="checkbox" id="lpAuto" ${LP.auto?'checked':''}> Usar mi capacidad de ahorro de Mis finanzas</label><label class="lp40cap" ${LP.auto&&FD?'hidden':''}>Capacidad mensual (S/)<input class="f mono" id="lpCap" type="number" min="0" step="any" value="${LP.cap??''}"></label>${LP.auto&&!FD?'<span class="note">No hay suficientes datos en Mis finanzas: ingresa el monto a mano.</span>':''}</div></div>
 <div class="panel"><div class="ph30"><h3>Prioridades y financiamiento</h3><small>Tu capacidad se reparte por prioridad y luego por fecha</small></div>
  <div class="lp40alloc">${P.order.map((r,i)=>`<div class="lp40a" style="--i:${i}"><span class="lp40p p${r.prio}">${PRIO[r.prio]}</span><b>${esc(r.name)}</b><span class="lp40bar"><i style="--w:${Math.round(r.funded*100)}%"></i></span><span class="mono">${nf(r.alloc)} / ${nf(r.need)}</span></div>`).join('')}</div>
  ${over>=0?`<p class="in37warn">En ${fdm(new Date(Date.now()+over*30.44*864e5).toISOString().slice(0,10))} tus compromisos superan tu capacidad de ahorro.</p>`:''}</div>
 <div class="panel"><div class="ph30"><h3>Línea de tiempo y dependencias</h3><small>Las barras empiezan cuando empiezas a aportar; ◆ marca la fecha en que usarás ese dinero</small></div>${timeline(P,H)}</div>
 <div class="fn33g"><div class="panel"><h3>Impacto en tu liquidez mensual</h3><div class="sl38leg"><span><i style="background:var(--em)"></i>Aportes comprometidos</span>${cap!=null?'<span><i style="background:var(--gold)"></i>Capacidad de ahorro</span>':''}</div>
   ${lines30([{pts:C.map((v,m)=>[Date.now()+m*30.44*864e5,v]),color:'var(--em)'},...(cap!=null?[{pts:C.map((_,m)=>[Date.now()+m*30.44*864e5,cap]),color:'var(--gold)'}]:[])],{w:620,h:200,fmt:v=>Math.round(v).toLocaleString('es-PE')})}
   <p class="note">Cuando una meta termina y usas ese dinero, su aporte se libera para las siguientes.${liqFree!=null&&cover!=null&&cover<3?' Tu liquidez libre cubre menos de 3 meses de gasto: considera priorizar el fondo de emergencia.':''}</p></div>
  <div class="panel"><h3>Escenarios</h3><div class="ec36tw"><table class="ec36t sm"><thead><tr><th>Meta</th>${sc.map(s=>`<th class="r">${s[0]}</th>`).join('')}</tr></thead><tbody>${P.rows.map((r,i)=>`<tr><td>${esc(r.name)}</td>${probs[i].map(p=>`<td class="r mono ${p>=.8?'up':p<.5?'dn':''}">${pc(p)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
   <p class="note">Probabilidad de llegar a cada meta (Monte Carlo de 700 escenarios, como en Metas). Pesimista: rentabilidad 2 puntos menor y 20% menos de aporte. Optimista: 1,5 puntos más.</p>
   ${cap!=null?`<p>${hurt.length?`Si tu capacidad baja 20%, dejarías de financiar por completo: <b>${hurt.map(r=>esc(r.name)).join(', ')}</b>.`:'Si tu capacidad baja 20%, tus metas actuales siguen financiadas.'}</p>`:''}</div></div>
 <div class="panel"><div class="ph30"><h3>Comparación de metas</h3><div class="tb30" id="lpSort">${[['prio','Prioridad'],['date','Fecha'],['prob','Probabilidad'],['need','Aporte']].map(([k,l])=>`<button data-s="${k}" class="${SORT===k?'on':''}">${l}</button>`).join('')}</div></div>
  <div class="ec36tw"><table class="ec36t"><thead><tr><th>Meta</th><th>Prioridad</th><th>Fecha</th><th class="r">Objetivo</th><th class="r">Progreso</th><th class="r">Aporte actual</th><th class="r">Necesario</th><th class="r">Probabilidad</th><th>Depende de</th><th>Estado</th><th></th></tr></thead>
  <tbody>${rows.map(r=>{const [k,l]=st(r),dep=r.g.after&&GOALS.find(x=>x.id===r.g.after);return `<tr><td><b>${esc(r.name)}</b><small>${esc(SRC[r.g.src]||SRC.other)}</small></td><td><span class="lp40p p${r.prio}">${PRIO[r.prio]}</span></td><td>${fdm(r.date)}</td><td class="r mono">${nf(r.T)}</td><td class="r"><span class="lp40mini"><i style="--w:${Math.round(r.progress*100)}%"></i></span>${pc(r.progress)}</td><td class="r mono">${nf(r.cur)}</td><td class="r mono ${r.cur+1<r.need?'dn':''}">${nf(r.need)}</td><td class="r mono">${pc(r.pb)}</td><td>${dep?esc(dep.name):'—'}</td><td><span class="lp40st ${k}">${l}</span></td><td><button class="btn" data-g="${r.i}">Abrir</button></td></tr>`;}).join('')}</tbody></table></div>
  <p class="note">Montos en soles (los de metas en dólares se convierten a S/ ${fx().toFixed(2)}). "Necesario" es el aporte para llegar con 80% de probabilidad (el mismo cálculo de Metas, con 700 escenarios de mercado según el perfil de cada meta); si la meta depende de otra, empieza a aportarse cuando la anterior termina. Proyección educativa, no garantiza resultados.</p></div>`;
 $('#lpAuto').onchange=e=>{LP.auto=e.target.checked;saveLP();render();};$('#lpCap')&&($('#lpCap').onchange=e=>{LP.cap=e.target.value===''?null:Math.max(0,+e.target.value);saveLP();render();});
 $$('#lpSort button').forEach(b=>b.onclick=()=>{SORT=b.dataset.s;render();});$$('#lpBody [data-g]').forEach(b=>b.onclick=()=>{setView('goals');setTimeout(()=>gDetail(+b.dataset.g),300);});
 requestAnimationFrame(()=>$('#lpBody')?.classList.add('in'));}
function timeline(P,H){const W=760,rowH=34,top=26,L=150,R=P.rows,Hh=top+R.length*rowH+10,X=m=>L+m/H*(W-L-12),byId=Object.fromEntries(R.map((r,i)=>[r.id,i]));
 const yrs=Math.ceil(H/12),step=Math.max(1,Math.ceil(yrs/8)),y0=new Date().getFullYear();let s='';
 for(let y=0;y<=yrs;y+=step){const x=X(Math.min(H,y*12));s+=`<line class="g30" x1="${x}" x2="${x}" y1="${top-6}" y2="${Hh}"/><text class="t30" x="${x}" y="14" text-anchor="middle">${y0+y}</text>`;}
 R.forEach((r,i)=>{const y=top+i*rowH,cl=r.funded>=.999?'ok':r.funded>0?'mid':'bad';s+=`<text class="lp40tn" x="0" y="${y+18}">${esc(r.name.slice(0,20))}</text>`;
  if(r.s>0)s+=`<rect class="lp40wait" x="${X(0)}" y="${y+8}" width="${X(r.s)-X(0)}" height="14" rx="4"/>`;
  s+=`<rect class="lp40b ${cl}" x="${X(r.s)}" y="${y+6}" width="${Math.max(3,X(Math.min(r.n,H))-X(r.s))}" height="18" rx="6" style="--i:${i}"><title>${esc(r.name)}: aportes de ${nf(r.alloc)} al mes desde ${r.s?`el mes ${r.s}`:'hoy'} hasta ${fdm(r.date)}</title></rect>`;
  s+=`<path class="lp40d" d="M${X(Math.min(r.n,H))} ${y+8}l6 7-6 7-6-7z"><title>Usarás ${nf(r.T)} en ${fdm(r.date)}</title></path>`;
  if(r.g.after&&byId[r.g.after]!=null){const j=byId[r.g.after],pr=R[j],x1=X(Math.min(pr.n,H)),y1=top+j*rowH+15;s+=`<path class="lp40dep" d="M${x1} ${y1}C${x1+30} ${y1},${X(r.s)-30} ${y+15},${X(r.s)} ${y+15}"/>`;}});
 return `<div class="ec36tw"><svg class="lp40tl" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Línea de tiempo de tus metas">${s}</svg></div>`;}

/* ================= Metas: prioridad, dependencia, fuente y vínculos en el mismo formulario ================= */
const _ge40=gEdit;gEdit=function(i){_ge40.apply(this,arguments);const f=$('#gF');if(!f)return;const g=i!=null?GOALS[i]:null,others=GOALS.filter((x,k)=>k!==i);
 const box=document.createElement('div');box.className='lp40ext';box.innerHTML=`<h4>Life Planner</h4><div class="vt39f">
  <label>Prioridad<select class="f" id="lpPr">${Object.entries(PRIO).map(([k,l])=>`<option value="${k}" ${(g?.prio||2)==k?'selected':''}>${l}</option>`).join('')}</select></label>
  <label>Empieza después de<select class="f" id="lpAf"><option value="">Ninguna meta</option>${others.map(x=>`<option value="${x.id}" ${g?.after===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>
  <label>El dinero sale de<select class="f" id="lpSr">${Object.entries(SRC).map(([k,l])=>`<option value="${k}" ${(g?.src||'other')===k?'selected':''}>${l}</option>`).join('')}</select></label>
  <label>Vincular con<select class="f" id="lpLk"><option value="">Nada</option><option value="ret" ${g?.link==='ret'?'selected':''}>Mi plan de jubilación</option><option value="nw" ${g?.link==='nw'?'selected':''}>Mi patrimonio neto</option></select></label></div>
  <p class="note">"Empieza después de": tus aportes a esta meta comienzan cuando termina la otra (por ejemplo, el auto después del fondo de emergencia).</p>`;
 f.querySelector('.cta').before(box);const prevId=g?.id,orig=f.onsubmit;
 f.onsubmit=e=>{const ex={prio:+$('#lpPr').value,after:$('#lpAf').value||null,src:$('#lpSr').value,link:$('#lpLk').value||null};const n=GOALS.length;orig.call(f,e);
  const t=i!=null?GOALS[i]:(GOALS.length>n?GOALS.at(-1):null);if(t){Object.assign(t,ex);t.id=prevId||t.id||uid();if(t.after===t.id)t.after=null;saveGoals();if(VIEW==='plan')render();}};};
/* vínculos: jubilación (mismo cálculo de Retirement) y patrimonio neto (último registro de Mis finanzas) */
async function syncLinks(){let ch=false;const ret=store.get('ret',null);
 for(const g of GOALS){if(g.link==='ret'&&ret&&window.LW){const {Macc,Mret,need}=LW.retPlan(ret),r=Math.pow(1+LW.realRate(ret.ret,ret.inf),1/12)-1,capN=r?need*(1-Math.pow(1+r,-Mret))/r:need*Mret;
   const d=new Date(Date.now()+Macc*30.44*864e5).toISOString().slice(0,10);Object.assign(g,{target:Math.round(capN),saved:ret.saved||0,monthly:ret.monthly||0,date:d,cur:ret.cur==='USD'?'USD':'PEN',real:false});ch=true;}
  if(g.link==='nw'&&window.F33&&member()){try{await F33.finLoad();const s=(F33.FIN.wealth?.snaps||[]).filter(x=>x.nw!=null).at(-1);if(s){const c=LFIN.conv(s.nw,s.cur,g.cur==='USD'?'USD':'PEN',F33.FXR);if(c){g.saved=Math.max(0,Math.round(c.v));ch=true;}}}catch(e){}}}
 if(ch)saveGoals();}
const _sv40=setView;setView=function(v){const r=_sv40.apply(this,arguments);if(v==='plan')syncLinks().then(render);return r;};
/* accesos */
{const h=$('#metas .sh')||$('#metas');if(h&&!$('#lp40go')){const b=document.createElement('button');b.id='lp40go';b.className='btn';b.innerHTML=`${ic('target','',false)} Abrir Life Planner`;b.onclick=()=>setView('plan');(h.querySelector('div')||h).appendChild(b);}}
{const g=[...document.querySelectorAll('#pro30 .pg30')].find(x=>/My Finances/.test(x.textContent));if(g&&!$('#lp40pro')){const b=document.createElement('button');b.className='pt30';b.id='lp40pro';b.innerHTML=`${ic('target','',false)}<span><b>Life Planner</b><small>Todas tus metas: aportes necesarios, prioridades, dependencias, liquidez y escenarios</small></span>${ic('right','',false)}`;b.onclick=()=>setView('plan');g.appendChild(b);}}
window.LP40.render=render;window.LP40.syncLinks=syncLinks;
})();
