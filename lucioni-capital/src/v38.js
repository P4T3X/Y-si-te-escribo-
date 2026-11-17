/* ===================== V38: Lucioni Strategy Lab (Fase 6) — motor único de backtest LBT ===================== */
(()=>{
const {J30,lines30,cls30,corr30,beta30,pool30}=window.L30;const LCH=window.LCH;
const WK=7*864e5,YR=365.25*864e5;

/* ================= MOTOR LBT (puro, sin interfaz) =================
   Sin sesgo de anticipación: la señal de la semana t usa solo cierres hasta la semana t−1 y la operación se ejecuta al cierre de t.
   Costos: comisión % + deslizamiento % sobre el monto operado + comisión fija por operación. Efectivo sin rendimiento salvo que se indique. */
/* un indicador sin valor (calentamiento) nunca da señal: null no se compara como 0 */
const gt=(x,y)=>x!=null&&y!=null&&isFinite(x)&&isFinite(y)&&x>y;
const COND={
 above_sma:{l:'Precio sobre su media de',p:[['n','semanas',40]],f:(I,i,a)=>gt(I.c[i],I.sma(a.n)[i])},
 below_sma:{l:'Precio bajo su media de',p:[['n','semanas',40]],f:(I,i,a)=>gt(I.sma(a.n)[i],I.c[i])},
 sma_up:{l:'Media corta sobre media larga',p:[['f','corta',10],['s','larga',40]],f:(I,i,a)=>gt(I.sma(a.f)[i],I.sma(a.s)[i])},
 sma_dn:{l:'Media corta bajo media larga',p:[['f','corta',10],['s','larga',40]],f:(I,i,a)=>gt(I.sma(a.s)[i],I.sma(a.f)[i])},
 rsi_lt:{l:'RSI menor que',p:[['n','periodo',14],['v','nivel',30]],f:(I,i,a)=>gt(a.v,I.rsi(a.n)[i])},
 rsi_gt:{l:'RSI mayor que',p:[['n','periodo',14],['v','nivel',70]],f:(I,i,a)=>gt(I.rsi(a.n)[i],a.v)},
 mom_gt:{l:'Rendimiento de N semanas mayor que %',p:[['n','semanas',26],['v','%',0]],f:(I,i,a)=>i>=a.n&&(I.c[i]/I.c[i-a.n]-1)*100>a.v},
 mom_lt:{l:'Rendimiento de N semanas menor que %',p:[['n','semanas',26],['v','%',0]],f:(I,i,a)=>i>=a.n&&(I.c[i]/I.c[i-a.n]-1)*100<a.v},
 dd_lt:{l:'Caída desde el máximo de N semanas peor que %',p:[['n','semanas',52],['v','%',-15]],f:(I,i,a)=>{if(i<1)return false;let m=0;for(let j=Math.max(0,i-a.n+1);j<=i;j++)m=Math.max(m,I.c[j]);return (I.c[i]/m-1)*100<a.v;}}};
function ind(pts){const c=pts.map(p=>p[1]),C={};const memo=(k,fn)=>C[k]||(C[k]=fn());
 return {t:pts.map(p=>p[0]),c,sma:n=>memo('s'+n,()=>LCH.sma(c,n)),rsi:n=>memo('r'+n,()=>LCH.rsi(c,n))};}
const lastBefore=(t,T)=>{let lo=0,hi=T.length-1,r=-1;while(lo<=hi){const m=(lo+hi)>>1;if(T[m]<t){r=m;lo=m+1;}else hi=m-1;}return r;};
const lastAtOrBefore=(t,T)=>{let lo=0,hi=T.length-1,r=-1;while(lo<=hi){const m=(lo+hi)>>1;if(T[m]<=t){r=m;lo=m+1;}else hi=m-1;}return r;};
const sdv=a=>{if(a.length<2)return 0;const m=a.reduce((x,y)=>x+y,0)/a.length;return Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(a.length-1));};
function grid(def,D){const bench=def.bench&&D[def.bench]?.length?def.bench:def.assets[0].t;const startT=def.from||Date.now()-(def.yrs||5)*YR;const first=Math.max(startT,...def.assets.map(a=>(D[a.t]||[[Infinity]])[0][0]));
 return {dates:(D[bench]||[]).filter(p=>p[0]>=first).map(p=>p[0]),limiting:def.assets.filter(a=>(D[a.t]||[[0]])[0][0]>startT+2*WK).map(a=>a.t)};}
function run(def,D,dates){
 const A=def.assets.filter(a=>a.t&&a.w>0),tw=A.reduce((s,a)=>s+a.w,0);if(!A.length||!tw)throw new Error('Agrega al menos un activo con peso.');
 for(const a of A)if(!D[a.t]||D[a.t].length<20)throw new Error(`Sin historial suficiente para ${a.t}.`);
 const G=dates?{dates,limiting:[]}:grid(def,D);const T=G.dates;if(T.length<10)throw new Error('Historial insuficiente para ese período.');
 const I=Object.fromEntries(A.map(a=>[a.t,ind(D[a.t])])),px=(s,t)=>{const x=I[s],k=lastAtOrBefore(t,x.t);return x.c[Math.max(0,k)];};
 const cst=def.costs||{},cp=((+cst.pct||0)+(+cst.slip||0))/100,cf=+cst.fixed||0,rules=def.rules&&def.rules.on&&((def.rules.entry||[]).length||(def.rules.exit||[]).length)?def.rules:null;
 const evalSet=(list,x,i,mode)=>{if(!list.length)return null;const r=list.map(c=>{const C=COND[c.k];if(!C||i<0)return false;try{return !!C.f(x,i,c);}catch(e){return false;}});return mode==='any'?r.some(Boolean):r.every(Boolean);};
 const sh=Object.fromEntries(A.map(a=>[a.t,0])),inPos=Object.fromEntries(A.map(a=>[a.t,!rules]));
 let cash=+def.init||0,contrib=cash,cost=0,traded=0,nav=1,prevV=null;const out={dates:T,value:[],contrib:[],nav:[],inv:[],trades:[],cash:[]};
 const trade=(s,amt,t,p,why)=>{if(Math.abs(amt)<1)return;const c=Math.abs(amt)*cp+cf;if(amt>0){const tot=amt+c;if(tot>cash){amt=Math.max(0,(cash-cf)/(1+cp));if(amt<1)return;}}
  const fee=Math.abs(amt)*cp+cf;sh[s]+=amt/p;cash-=amt+fee;cost+=fee;traded+=Math.abs(amt);out.trades.push({t,s,side:amt>0?'compra':'venta',amt:Math.abs(amt),p,fee,why});};
 let lastM=new Date(T[0]).getUTCMonth(),lastQ=Math.floor(lastM/3),lastY=new Date(T[0]).getUTCFullYear();
 T.forEach((t,k)=>{const d=new Date(t),m=d.getUTCMonth(),y=d.getUTCFullYear();let add=0;
  if(k&&m!==lastM&&def.monthly>0){add=+def.monthly;cash+=add;contrib+=add;}
  let changed=false;
  if(rules)A.forEach(a=>{const x=I[a.t],i=lastBefore(t,x.t);const en=evalSet(rules.entry||[],x,i,rules.mode),ex=evalSet(rules.exit||[],x,i,rules.mode);
   const wantIn=inPos[a.t]?!(ex===null?en===false:ex):(en===null?ex===false:en);if(wantIn!==inPos[a.t]){inPos[a.t]=wantIn;changed=true;}});
  const V=cash+A.reduce((s,a)=>s+sh[a.t]*px(a.t,t),0),invW=A.filter(a=>inPos[a.t]).reduce((s,a)=>s+a.w,0);
  const tgt=a=>inPos[a.t]?V*a.w/tw:0;
  const per=def.reb==='monthly'?m!==lastM:def.reb==='quarterly'?Math.floor(m/3)!==lastQ:def.reb==='annual'?y!==lastY:false;
  const band=def.reb==='band'&&A.some(a=>V>0&&Math.abs(sh[a.t]*px(a.t,t)-tgt(a))/V*100>(+def.band||5));
  if(k===0||changed||per||band){const why=k===0?'inicio':changed?'señal':band?'banda':'rebalanceo';
   A.forEach(a=>{const p=px(a.t,t),dv=tgt(a)-sh[a.t]*p;if(dv<0)trade(a.t,dv,t,p,why);});A.forEach(a=>{const p=px(a.t,t),dv=tgt(a)-sh[a.t]*p;if(dv>0)trade(a.t,Math.min(dv,cash),t,p,why);});}
  else if(add>0&&invW>0){A.filter(a=>inPos[a.t]).forEach(a=>trade(a.t,add*a.w/invW,t,px(a.t,t),'aporte'));}
  if(def.cashRate>0)cash*=Math.pow(1+def.cashRate/100,1/52);
  const Ve=cash+A.reduce((s,a)=>s+sh[a.t]*px(a.t,t),0);nav*=prevV==null?(Ve/(+def.init||Ve||1)):(Ve-add)/prevV;prevV=Ve;
  out.value.push(Ve);out.contrib.push(contrib);out.nav.push(nav);out.cash.push(cash);out.inv.push(Ve>0?1-cash/Ve:0);lastM=m;lastQ=Math.floor(m/3);lastY=y;});
 return metrics(out,{...def,assets:A},{cost,traded,limiting:G.limiting});}
function metrics(o,def,x){const n=o.nav,r=n.slice(1).map((v,i)=>v/n[i]-1),yrs=(o.dates.at(-1)-o.dates[0])/YR||1/52,rf=(def.rf??4)/100;
 const cagr=Math.pow(n.at(-1),1/yrs)-1,vol=sdv(r)*Math.sqrt(52),dn=sdv(r.filter(v=>v<0))*Math.sqrt(52);let pk=0,mdd=0,dur=0,cur=0;const dd=n.map(v=>{pk=Math.max(pk,v);const d=v/pk-1;mdd=Math.min(mdd,d);cur=d<0?cur+1:0;dur=Math.max(dur,cur);return d;});
 const years={};o.dates.forEach((t,i)=>{years[new Date(t).getUTCFullYear()]=i;});const yk=Object.keys(years).sort();const yearly=yk.map((y,j)=>{const e=n[years[y]],b=j?n[years[yk[j-1]]]:1;return {y:+y,r:e/b-1,partial:j===0||j===yk.length-1};});
 const avgV=o.value.reduce((a,v)=>a+v,0)/o.value.length;
 return {...o,def,rets:r,dd,final:o.value.at(-1),contributed:o.contrib.at(-1),cagr,vol,sharpe:vol?(cagr-rf)/vol:null,sortino:dn?(cagr-rf)/dn:null,mdd,mddWeeks:dur,yrs,yearly,cost:x.cost,turnover:avgV?x.traded/avgV/yrs:0,nTrades:o.trades.length,invested:o.inv.reduce((a,v)=>a+v,0)/o.inv.length,limiting:x.limiting,from:o.dates[0],to:o.dates.at(-1)};}
function vsBench(R,B){const n=Math.min(R.rets.length,B.rets.length);return {beta:beta30(R.rets.slice(-n),B.rets.slice(-n)),corr:corr30(R.rets.slice(-n),B.rets.slice(-n))};}
/* supuestos y limitaciones que acompañan a cada backtest */
function assumptions(R,src){const d=R.def,c=d.costs||{},L=[];
 L.push(`Período: ${fd(R.from)} a ${fd(R.to)} (${R.dates.length} semanas)${R.limiting.length?`; empieza cuando todos los activos tienen historial (limitan: ${R.limiting.join(', ')})`:''}.`);
 L.push(`Datos: ${src}. Solo precio: no incluye dividendos, por lo que el rendimiento de activos que pagan dividendos está subestimado.`);
 L.push(`Costos: comisión ${nf(+c.pct||0,2)}% + deslizamiento ${nf(+c.slip||0,2)}% del monto operado + US$ ${nf(+c.fixed||0,2)} por operación. Total pagado: US$ ${nf(R.cost,2)}.`);
 L.push(`Ejecución: ${d.rules&&d.rules.on?'las señales usan solo cierres hasta la semana anterior y se ejecutan al cierre de la semana siguiente (sin sesgo de anticipación); los indicadores necesitan semanas de calentamiento antes de dar señales':'compra inicial y aportes al cierre de la primera semana de cada mes'}.`);
 L.push(`Rebalanceo: ${REB[d.reb]||'sin rebalanceo'}${d.reb==='band'?` (desvío mayor a ${d.band||5} puntos)`:''}. Efectivo ${d.cashRate>0?`con rendimiento de ${d.cashRate}% anual`:'sin rendimiento'}.`);
 L.push('Sesgo de supervivencia: eliges activos que existen hoy; los que quebraron o desaparecieron no están en la muestra. Compara siempre con un índice amplio.');
 L.push('No incluye impuestos, tipo de cambio desde soles ni límites de tu bróker. El pasado no garantiza resultados futuros; es una simulación educativa.');return L;}
window.LBT={run,grid,metrics,COND,vsBench,assumptions,legacy:R=>({curve:R.value,cc:R.contrib,contrib:R.contributed,final:R.final,cagr:R.cagr,mdd:R.mdd,yrs:R.yrs,nav:R.nav.at(-1)})};

/* ================= utilidades de interfaz ================= */
const nf=(v,d=1)=>v==null||!isFinite(v)?'—':v.toLocaleString('es-PE',{minimumFractionDigits:d,maximumFractionDigits:d});
const pa=(v,d=1)=>v==null||!isFinite(v)?'—':nf(v*100,d)+'%';
const pc=(v,d=1)=>v==null||!isFinite(v)?'—':(v>0?'+':'')+nf(v*100,d)+'%';const usd=v=>'US$ '+nf(v,0);
const fd=t=>new Date(t).toLocaleDateString('es-PE',{day:'numeric',month:'short',year:'numeric'});
const REB={none:'Sin rebalanceo (comprar y mantener)',monthly:'Mensual',quarterly:'Trimestral',annual:'Anual',band:'Por banda de tolerancia'};
const SRC='Nasdaq · cierres semanales reales (5 años)';
const H={};async function hist(s){if(H[s])return H[s];const d=await J30(`${MKT}?h5=${encodeURIComponent(s)}`,6*3600000,20000);return H[s]=d.pts||[];}
const TPL=[['Clásica 60/40','Acciones de EE.UU. y bonos, rebalanceo anual',{assets:[{t:'VOO',w:60},{t:'BND',w:40}],reb:'annual'}],
 ['Todo el mundo','EE.UU., resto del mundo y bonos',{assets:[{t:'VTI',w:50},{t:'VXUS',w:30},{t:'BND',w:20}],reb:'annual'}],
 ['Tendencia (media de 40 semanas)','Invierte solo cuando el precio está sobre su media de 40 semanas (≈200 días)',{assets:[{t:'VOO',w:100}],reb:'none',rules:{on:true,mode:'all',entry:[{k:'above_sma',n:40}],exit:[{k:'below_sma',n:40}]}}],
 ['Momentum 6 meses','Invierte si los últimos 6 meses fueron positivos',{assets:[{t:'QQQ',w:100}],reb:'none',rules:{on:true,mode:'all',entry:[{k:'mom_gt',n:26,v:0}],exit:[{k:'mom_lt',n:26,v:0}]}}],
 ['Comprar en caídas (RSI)','Entra con RSI bajo 35 y sale con RSI sobre 70',{assets:[{t:'VOO',w:100}],reb:'none',rules:{on:true,mode:'all',entry:[{k:'rsi_lt',n:14,v:35}],exit:[{k:'rsi_gt',n:14,v:70}]}}]];
const DEF0=()=>({name:'Mi estrategia',assets:[{t:'VOO',w:60},{t:'BND',w:40}],yrs:5,init:10000,monthly:200,bench:'SPY',reb:'annual',band:5,costs:{pct:0.1,fixed:0,slip:0.05},cashRate:0,rf:4,rules:{on:false,mode:'all',entry:[],exit:[]}});
let SL=store.get('slab',{list:[]});if(!Array.isArray(SL.list))SL={list:[]};if(!SYNC.includes('slab'))SYNC.push('slab');const saveSL=()=>store.set('slab',SL);
let ST={tab:'edit',def:store.get('slDraft',null)||DEF0(),id:store.get('slId',null),R:null,B:null,cmp:[]};
const clone=o=>JSON.parse(JSON.stringify(o));const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const draft=()=>{store.set('slDraft',ST.def);store.set('slId',ST.id);};

const sec=mkView30('lab','strategylab','Strategy Lab',`<div class="sh"><div><h2>Strategy <em>Lab</em></h2><p>Crea estrategias con reglas, rebalanceo, aportes y costos; pruébalas con 5 años de precios reales, guarda versiones y compáralas. Sin sesgo de anticipación y con cada supuesto a la vista.</p></div></div>
 <div class="ec36tabs" id="slTabs">${[['edit','Editor'],['mine','Mis estrategias'],['cmp','Comparar']].map(([k,l])=>`<button data-t="${k}" class="${k==='edit'?'on':''}">${l}</button>`).join('')}</div><div id="slBody"></div>
 <p class="note">Simulaciones educativas con datos históricos. No son recomendaciones ni garantizan resultados futuros; Lucioni Capital no ejecuta operaciones.</p>`);
$('#slTabs').onclick=e=>{const b=e.target.closest('button[data-t]');if(!b)return;ST.tab=b.dataset.t;$$('#slTabs button').forEach(x=>x.classList.toggle('on',x===b));render();};
function render(){const B=$('#slBody');if(!MKT){B.innerHTML='<div class="panel"><p class="note">Strategy Lab usa 5 años de precios reales y está disponible en la versión web.</p></div>';return;}({edit:rEdit,mine:rMine,cmp:rCmp})[ST.tab]();}

/* ---------------- EDITOR ---------------- */
const condRow=(c,i,side)=>`<div class="sl38c" data-side="${side}" data-i="${i}"><select class="f" data-f="k">${Object.entries(COND).map(([k,C])=>`<option value="${k}" ${k===c.k?'selected':''}>${C.l}</option>`).join('')}</select>${COND[c.k].p.map(([p,l,dv])=>`<label>${l}<input class="f mono" type="number" step="any" data-f="${p}" value="${c[p]??dv}"></label>`).join('')}<button class="ib" data-x aria-label="Quitar condición">${ic('x','',false)}</button></div>`;
function rEdit(){const d=ST.def,sum=d.assets.reduce((a,x)=>a+(+x.w||0),0),cur=ST.id&&SL.list.find(s=>s.id===ST.id);
 $('#slBody').innerHTML=`<div class="sl38">
 <div class="panel sl38ed"><div class="sl38nm"><input class="f" id="slN" value="${esc(d.name)}" maxlength="50" aria-label="Nombre de la estrategia">${cur?`<span class="note">versión ${cur.versions.length} guardada</span>`:'<span class="note">sin guardar</span>'}</div>
  <details class="sl38tpl"><summary>Empezar desde una plantilla</summary><div>${TPL.map(([n,s],i)=>`<button class="pt30" data-tpl="${i}"><span><b>${n}</b><small>${s}</small></span></button>`).join('')}<button class="pt30" data-tpl="pf"><span><b>Mi cartera real</b><small>Los pesos actuales de tu cartera</small></span></button></div></details>
  <h4>Activos</h4><div id="slA">${d.assets.map((a,i)=>`<div class="sl38a"><input class="f mono" data-i="${i}" data-k="t" value="${esc(a.t)}" maxlength="10" aria-label="Ticker"><input class="f mono" data-i="${i}" data-k="w" type="number" min="0" step="any" value="${a.w}" aria-label="Peso"><span>%</span><button class="ib" data-rm="${i}" aria-label="Quitar">${ic('x','',false)}</button></div>`).join('')}</div>
  <div class="sl38row"><button class="btn" id="slAdd">+ Activo</button><span class="note ${Math.abs(sum-100)>.01?'dn':''}">Suma: ${nf(sum,1)}%${Math.abs(sum-100)>.01?' · se normaliza a 100%':''}</span></div>
  <div class="sl38g"><label>Período<select class="f" id="slY">${[1,3,5].map(y=>`<option value="${y}" ${d.yrs===y?'selected':''}>${y} año${y>1?'s':''}</option>`).join('')}</select></label>
   <label>Inversión inicial (US$)<input class="f mono" id="slI" type="number" min="0" step="any" value="${d.init}"></label><label>Aporte mensual (US$)<input class="f mono" id="slM" type="number" min="0" step="any" value="${d.monthly}"></label>
   <label>Comparar con<input class="f mono" id="slBm" value="${esc(d.bench)}" maxlength="10"></label></div>
  <h4>Rebalanceo</h4><div class="sl38g"><label>Regla<select class="f" id="slR">${Object.entries(REB).map(([k,l])=>`<option value="${k}" ${d.reb===k?'selected':''}>${l}</option>`).join('')}</select></label><label ${d.reb==='band'?'':'hidden'} id="slBandL">Banda (puntos)<input class="f mono" id="slBand" type="number" min="1" step="any" value="${d.band}"></label></div>
  <h4>Costos</h4><div class="sl38g"><label>Comisión (%)<input class="f mono" id="slCp" type="number" min="0" step="any" value="${d.costs.pct}"></label><label>Fija por operación (US$)<input class="f mono" id="slCf" type="number" min="0" step="any" value="${d.costs.fixed}"></label><label>Deslizamiento (%)<input class="f mono" id="slCs" type="number" min="0" step="any" value="${d.costs.slip}"></label><label>Rendimiento del efectivo (% anual)<input class="f mono" id="slCr" type="number" min="0" step="any" value="${d.cashRate}"></label></div>
  <h4><label class="chk"><input type="checkbox" id="slRu" ${d.rules.on?'checked':''}> Reglas de entrada y salida</label></h4>
  <div id="slRules" ${d.rules.on?'':'hidden'}><p class="note">Se aplican a cada activo. Las señales se calculan con cierres semanales hasta la semana anterior.</p>
   <div class="sl38row"><span>Se cumplen</span><select class="f" id="slMode"><option value="all" ${d.rules.mode==='all'?'selected':''}>todas las condiciones</option><option value="any" ${d.rules.mode==='any'?'selected':''}>alguna condición</option></select></div>
   <h5>Entrar cuando</h5>${d.rules.entry.map((c,i)=>condRow(c,i,'entry')).join('')}<button class="btn" data-addc="entry">+ Condición de entrada</button>
   <h5>Salir cuando</h5>${d.rules.exit.map((c,i)=>condRow(c,i,'exit')).join('')}<button class="btn" data-addc="exit">+ Condición de salida</button></div>
  <div class="sl38row sl38go"><button class="cta" id="slRun">Probar con datos reales</button><button class="btn" id="slSave">${cur?'Guardar nueva versión':'Guardar'}</button>${cur?'<button class="btn" id="slDup">Duplicar</button><button class="btn" id="slNew">Nueva</button>':''}</div></div>
 <div id="slOut">${ST.R?'':`<div class="panel sl38empty">${ic('compuesto','',false)}<p>Define tu estrategia y toca <b>Probar con datos reales</b>. Verás rendimiento, caídas, operaciones, costos y cada supuesto.</p></div>`}</div></div>`;
 if(ST.R)out(ST.R,ST.B);
 const set=(f)=>{f(d);draft();};const re=()=>{draft();rEdit();};
 $('#slN').oninput=e=>set(d=>d.name=e.target.value);
 $$('#slA [data-k]').forEach(x=>x.onchange=()=>{const a=d.assets[+x.dataset.i];a[x.dataset.k]=x.dataset.k==='t'?x.value.trim().toUpperCase().replace(/[^A-Z.\-]/g,''):Math.max(0,+x.value||0);re();});
 $$('#slA [data-rm]').forEach(b=>b.onclick=()=>{d.assets.splice(+b.dataset.rm,1);re();});$('#slAdd').onclick=()=>{if(d.assets.length>=10){toast('Máximo 10 activos');return;}d.assets.push({t:'',w:0});re();};
 $('#slY').onchange=e=>set(d=>d.yrs=+e.target.value);$('#slI').oninput=e=>set(d=>d.init=Math.max(0,+e.target.value||0));$('#slM').oninput=e=>set(d=>d.monthly=Math.max(0,+e.target.value||0));$('#slBm').onchange=e=>set(d=>d.bench=e.target.value.trim().toUpperCase()||'SPY');
 $('#slR').onchange=e=>{d.reb=e.target.value;re();};$('#slBand').oninput=e=>set(d=>d.band=Math.max(1,+e.target.value||5));
 [['slCp','pct'],['slCf','fixed'],['slCs','slip']].forEach(([id,k])=>$('#'+id).oninput=e=>set(d=>d.costs[k]=Math.max(0,+e.target.value||0)));$('#slCr').oninput=e=>set(d=>d.cashRate=Math.max(0,+e.target.value||0));
 $('#slRu').onchange=e=>{d.rules.on=e.target.checked;if(d.rules.on&&!d.rules.entry.length&&!d.rules.exit.length){d.rules.entry.push({k:'above_sma',n:40});d.rules.exit.push({k:'below_sma',n:40});}re();};
 $('#slMode')&&($('#slMode').onchange=e=>set(d=>d.rules.mode=e.target.value));
 $$('[data-addc]').forEach(b=>b.onclick=()=>{d.rules[b.dataset.addc].push({k:b.dataset.addc==='entry'?'above_sma':'below_sma',n:40});re();});
 $$('.sl38c').forEach(r=>{const L=d.rules[r.dataset.side],c=L[+r.dataset.i];r.querySelectorAll('[data-f]').forEach(x=>x.onchange=()=>{if(x.dataset.f==='k'){const n={k:x.value};COND[x.value].p.forEach(([p,,dv])=>n[p]=dv);L[+r.dataset.i]=n;re();}else{c[x.dataset.f]=+x.value;draft();}});r.querySelector('[data-x]').onclick=()=>{L.splice(+r.dataset.i,1);re();};});
 $$('[data-tpl]').forEach(b=>b.onclick=()=>{if(b.dataset.tpl==='pf'){const P=typeof pfCalc==='function'?pfCalc():{rows:[]};if(!P.rows.length){toast('Tu cartera real está vacía');return;}ST.def={...DEF0(),name:'Mi cartera real',assets:P.rows.map(r=>({t:r.s,w:+(r.w*100).toFixed(1)}))};}
  else{const [n,,o]=TPL[+b.dataset.tpl];ST.def={...DEF0(),...clone(o),name:n,rules:o.rules?clone(o.rules):{on:false,mode:'all',entry:[],exit:[]}};}ST.id=null;ST.R=null;re();});
 $('#slRun').onclick=go;$('#slSave').onclick=save;$('#slDup')&&($('#slDup').onclick=()=>{ST.id=null;d.name=d.name+' (copia)';re();toast('Copia lista para editar');});$('#slNew')&&($('#slNew').onclick=()=>{ST.id=null;ST.def=DEF0();ST.R=null;re();});}
async function backtest(def){const syms=[...new Set([...def.assets.filter(a=>a.t&&a.w>0).map(a=>a.t),def.bench||'SPY'])];const D={};
 await pool30(syms,3,async s=>{try{D[s]=await hist(s);}catch(e){D[s]=[];}});const miss=syms.filter(s=>!D[s]||D[s].length<20);if(miss.length)throw new Error(`Sin historial para: ${miss.join(', ')}. Revisa el ticker.`);
 const G=grid(def,D);const R=run(def,D,null),B=run({...def,assets:[{t:def.bench||'SPY',w:100}],reb:'none',rules:null},D,G.dates);R.limiting=G.limiting;R.vs=vsBench(R,B);R.D=D;return {R,B};}
async function go(){const o=$('#slOut');o.innerHTML=`<div class="panel">${'<div class="ec36sk"><i></i><i></i><i></i></div>'}</div>`;
 try{const {R,B}=await backtest(ST.def);ST.R=R;ST.B=B;out(R,B);typeof addXP==='function'&&addXP(3);}catch(e){o.innerHTML=`<div class="panel"><div class="ec36err"><p>${esc(e.message||'No se pudo correr el backtest.')}</p></div></div>`;}}
function kp(l,v,s,c=''){return `<div class="ec36k"><small>${l}</small><b class="mono ${c}">${v}</b>${s?`<span>${s}</span>`:''}</div>`;}
function corrM(R){const S=R.def.assets.map(a=>a.t);if(S.length<2)return '';const rets=S.map(s=>{const c=R.dates.map(t=>{const p=R.D[s],k=lastAtOrBefore(t,p.map(x=>x[0]));return p[Math.max(0,k)][1];});return c.slice(1).map((v,i)=>v/c[i]-1);});
 return `<div class="panel"><h3>Correlación entre activos</h3><div class="ec36tw"><table class="sl38m"><thead><tr><th></th>${S.map(s=>`<th>${esc(s)}</th>`).join('')}</tr></thead><tbody>${S.map((s,i)=>`<tr><th>${esc(s)}</th>${S.map((_,j)=>{const v=i===j?1:corr30(rets[i],rets[j]);return `<td style="--a:${Math.abs(v||0).toFixed(2)}" class="${v>=0?'p':'n'}">${nf(v,2)}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div><p class="note">Rendimientos semanales del período. Cerca de 1: se mueven juntos y diversifican poco; cerca de 0 o negativa: diversifican más.</p></div>`;}
function out(R,B){const o=$('#slOut');if(!o)return;const w=R.final-R.contributed,last=R.trades.slice(-12).reverse();
 const ddS=[{pts:R.dates.map((t,i)=>[t,R.dd[i]*100]),color:'var(--down)'},{pts:B.dates.map((t,i)=>[t,B.dd[i]*100]),color:'var(--ink3)'}];
 o.innerHTML=`<div class="panel sl38res"><div class="ph30"><h3>${esc(R.def.name)}</h3><small>${fd(R.from)} → ${fd(R.to)} · ${R.dates.length} semanas</small></div>
  <div class="ec36g">${kp('Valor final',usd(R.final),`Aportaste ${usd(R.contributed)}`,w>=0?'up':'dn')}${kp('Rendimiento anual (CAGR)',pc(R.cagr),`${esc(R.def.bench)}: ${pc(B.cagr)}`,R.cagr>=B.cagr?'up':'')}${kp('Caída máxima',pc(R.mdd),`${esc(R.def.bench)}: ${pc(B.mdd)} · ${R.mddWeeks} sem. bajo su máximo`,'dn')}${kp('Volatilidad anual',pa(R.vol),`${esc(R.def.bench)}: ${pa(B.vol)}`)}
   ${kp('Sharpe / Sortino',`${nf(R.sharpe,2)} / ${nf(R.sortino,2)}`,`Tasa libre ${nf(R.def.rf??4,1)}%`)}${kp('Beta y correlación',`${nf(R.vs.beta,2)} · ${nf(R.vs.corr,2)}`,`frente a ${esc(R.def.bench)}`)}${kp('Costos pagados',usd(R.cost),`${R.nTrades} operaciones · rotación ${nf(R.turnover*100,0)}%/año`)}${kp('Tiempo invertido',nf(R.invested*100,0)+'%','Promedio del período')}</div>
  <h4>Evolución</h4><div class="sl38leg"><span><i style="background:var(--em)"></i>${esc(R.def.name)}</span><span><i style="background:var(--ink3)"></i>${esc(R.def.bench)} (mismos aportes y costos)</span><span><i style="background:var(--gold)"></i>Dinero aportado</span></div>
  ${lines30([{pts:R.dates.map((t,i)=>[t,R.value[i]]),color:'var(--em)'},{pts:B.dates.map((t,i)=>[t,B.value[i]]),color:'var(--ink3)'},{pts:R.dates.map((t,i)=>[t,R.contrib[i]]),color:'var(--gold)'}],{w:760,h:260,fmt:v=>v>=1000?nf(v/1000,0)+' mil':nf(v,0)})}
  <h4>Caídas desde el máximo</h4>${lines30(ddS,{w:760,h:150,fmt:v=>nf(v,0)+'%'})}
  <div class="sl38row sl38ex"><button class="btn" id="slCsv">Descargar CSV</button><button class="btn" id="slPdf">${ic('film','',false)} Informe PDF</button></div></div>
 <div class="fn33g"><div class="panel"><h3>Rendimiento por año</h3><div class="ec36tw"><table class="ec36t sm"><thead><tr><th>Año</th><th class="r">Estrategia</th><th class="r">${esc(R.def.bench)}</th></tr></thead><tbody>${R.yearly.map(y=>{const b=B.yearly.find(z=>z.y===y.y);return `<tr><td>${y.y}${y.partial?' <small>(parcial)</small>':''}</td><td class="r mono ${cls30(y.r)}">${pc(y.r)}</td><td class="r mono ${b?cls30(b.r):''}">${b?pc(b.r):'—'}</td></tr>`;}).join('')}</tbody></table></div></div>
  <div class="panel"><h3>Últimas operaciones</h3>${last.length?`<div class="ec36tw"><table class="ec36t sm"><thead><tr><th>Fecha</th><th>Activo</th><th>Tipo</th><th class="r">Monto</th><th class="r">Costo</th><th>Motivo</th></tr></thead><tbody>${last.map(x=>`<tr><td>${fd(x.t)}</td><td>${esc(x.s)}</td><td class="${x.side==='compra'?'up':'dn'}">${x.side}</td><td class="r mono">${usd(x.amt)}</td><td class="r mono">${nf(x.fee,2)}</td><td>${x.why}</td></tr>`).join('')}</tbody></table></div><p class="note">${R.nTrades} operaciones en total.</p>`:'<p class="note">Sin operaciones.</p>'}</div></div>
 ${corrM(R)}
 <div class="panel sl38as"><h3>Supuestos y limitaciones de este backtest</h3><ul>${assumptions(R,SRC).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
 $('#slCsv').onclick=()=>csv(R,B);$('#slPdf').onclick=()=>pdf();}
function csv(R,B){const L=['fecha,valor_estrategia,aportado,nav_estrategia,caida,valor_'+R.def.bench+',nav_'+R.def.bench];R.dates.forEach((t,i)=>L.push([new Date(t).toISOString().slice(0,10),R.value[i].toFixed(2),R.contrib[i].toFixed(2),R.nav[i].toFixed(5),(R.dd[i]*100).toFixed(2),B.value[i]?.toFixed(2)??'',B.nav[i]?.toFixed(5)??''].join(',')));
 L.push('','# Supuestos',...assumptions(R,SRC).map(x=>'# '+x.replace(/,/g,';')));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+L.join('\n')],{type:'text/csv'}));a.download=`strategy-lab-${R.def.name.replace(/[^\w]+/g,'-').toLowerCase()}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}
function pdf(){let P=$('#pr37');if(!P){P=document.createElement('div');P.id='pr37';document.body.appendChild(P);}P.innerHTML=`<div class="pr37head"><b>Lucioni Capital · Strategy Lab</b><span>${new Date().toLocaleDateString('es-PE')}</span></div>`+$('#slOut').innerHTML;P.querySelectorAll('.sl38ex').forEach(x=>x.remove());
 document.documentElement.classList.add('pr37');const done=()=>{document.documentElement.classList.remove('pr37');removeEventListener('afterprint',done);};addEventListener('afterprint',done);setTimeout(()=>{window.print();setTimeout(done,1500);},60);}

/* ---------------- guardar y versiones ---------------- */
const summ=R=>R?{cagr:R.cagr,mdd:R.mdd,vol:R.vol,sharpe:R.sharpe,final:R.final,cost:R.cost,from:R.from,to:R.to}:null;
function save(){const d=ST.def;if(!d.name.trim()){toast('Ponle un nombre');return;}if(!d.assets.some(a=>a.t&&a.w>0)){toast('Agrega al menos un activo');return;}
 let s=ST.id&&SL.list.find(x=>x.id===ST.id);if(!s){if(SL.list.length>=20){toast('Máximo 20 estrategias guardadas');return;}s={id:uid(),name:d.name,versions:[]};SL.list.push(s);ST.id=s.id;}
 s.name=d.name;s.versions.push({v:s.versions.length+1,at:Date.now(),def:clone(d),sum:summ(ST.R&&ST.R.def.name===d.name?ST.R:null)});if(s.versions.length>15)s.versions.splice(0,s.versions.length-15);
 saveSL();draft();toast(`Guardada como versión ${s.versions.at(-1).v}`,ic('check','',false));rEdit();}
function diff(a,b){const out=[],f=(k,x,y)=>{if(JSON.stringify(x)!==JSON.stringify(y))out.push([k,x,y]);};
 f('Activos',a.assets.map(x=>`${x.t} ${x.w}%`).join(', '),b.assets.map(x=>`${x.t} ${x.w}%`).join(', '));f('Período',a.yrs+' años',b.yrs+' años');f('Inicial',usd(a.init),usd(b.init));f('Aporte',usd(a.monthly),usd(b.monthly));f('Rebalanceo',REB[a.reb],REB[b.reb]);
 f('Costos',`${a.costs.pct}% + ${a.costs.slip}% + US$ ${a.costs.fixed}`,`${b.costs.pct}% + ${b.costs.slip}% + US$ ${b.costs.fixed}`);const rs=r=>r&&r.on?[...r.entry.map(c=>'entra: '+COND[c.k].l+' '+COND[c.k].p.map(p=>c[p[0]]).join('/')),...r.exit.map(c=>'sale: '+COND[c.k].l+' '+COND[c.k].p.map(p=>c[p[0]]).join('/'))].join('; '):'sin reglas';f('Reglas',rs(a.rules),rs(b.rules));return out;}
function rMine(){const B=$('#slBody');if(!SL.list.length){B.innerHTML=`<div class="panel sl38empty">${ic('target','',false)}<p>Aún no guardas estrategias. Crea una en el Editor y toca <b>Guardar</b>.</p></div>`;return;}
 B.innerHTML=`<div class="sl38list">${SL.list.map((s,i)=>{const v=s.versions.at(-1),m=v.sum;return `<div class="panel sl38card" style="--i:${i}"><div class="ph30"><h3>${esc(s.name)}</h3><small>versión ${v.v} · ${fd(v.at)}</small></div>
  ${m?`<div class="ec36g two">${kp('CAGR',pc(m.cagr))}${kp('Caída máxima',pc(m.mdd),'','dn')}</div>`:'<p class="note">Guardada sin resultados; ábrela y prueba.</p>'}
  <p class="note">${esc(v.def.assets.map(a=>`${a.t} ${a.w}%`).join(' · '))} · ${REB[v.def.reb]}${v.def.rules?.on?' · con reglas':''}</p>
  <div class="sl38row"><button class="btn pri" data-open="${s.id}">Abrir</button>${s.versions.length>1?`<button class="btn" data-ver="${s.id}">Comparar versiones (${s.versions.length})</button>`:''}<button class="btn" data-del="${s.id}">Eliminar</button></div><div class="sl38vv" id="slV-${s.id}"></div></div>`;}).join('')}</div>`;
 $$('[data-open]').forEach(b=>b.onclick=()=>{const s=SL.list.find(x=>x.id===b.dataset.open);ST.def=clone(s.versions.at(-1).def);ST.id=s.id;ST.R=null;draft();ST.tab='edit';$$('#slTabs button').forEach(x=>x.classList.toggle('on',x.dataset.t==='edit'));render();});
 $$('[data-del]').forEach(b=>b.onclick=()=>{if(!confirm('¿Eliminar esta estrategia y todas sus versiones?'))return;SL.list=SL.list.filter(x=>x.id!==b.dataset.del);if(ST.id===b.dataset.del)ST.id=null;saveSL();rMine();});
 $$('[data-ver]').forEach(b=>b.onclick=()=>{const s=SL.list.find(x=>x.id===b.dataset.ver),h=$('#slV-'+s.id),vs=s.versions;
  h.innerHTML=`<div class="sl38row"><select class="f" data-a>${vs.map((v,i)=>`<option value="${i}" ${i===vs.length-2?'selected':''}>Versión ${v.v} · ${fd(v.at)}</option>`).join('')}</select><span>vs</span><select class="f" data-b>${vs.map((v,i)=>`<option value="${i}" ${i===vs.length-1?'selected':''}>Versión ${v.v} · ${fd(v.at)}</option>`).join('')}</select><button class="btn pri" data-go>Comparar</button></div><div data-o></div>`;
  h.querySelector('[data-go]').onclick=async()=>{const a=vs[+h.querySelector('[data-a]').value],c=vs[+h.querySelector('[data-b]').value],O=h.querySelector('[data-o]');O.innerHTML='<div class="ec36sk"><i></i></div>';
   try{const [x,y]=[await backtest({...a.def,name:'Versión '+a.v}),await backtest({...c.def,name:'Versión '+c.v})];const D=diff(a.def,c.def);
    O.innerHTML=`<h4>Qué cambió</h4>${D.length?`<div class="ec36tw"><table class="ec36t sm"><thead><tr><th></th><th>Versión ${a.v}</th><th>Versión ${c.v}</th></tr></thead><tbody>${D.map(([k,p,q])=>`<tr><td>${k}</td><td>${esc(String(p))}</td><td>${esc(String(q))}</td></tr>`).join('')}</tbody></table></div>`:'<p class="note">Las dos versiones tienen los mismos parámetros.</p>'}
    <h4>Resultados</h4>${mt([x.R,y.R])}${lines30([{pts:x.R.dates.map((t,i)=>[t,x.R.nav[i]*100]),color:'var(--ink3)'},{pts:y.R.dates.map((t,i)=>[t,y.R.nav[i]*100]),color:'var(--em)'}],{w:640,h:200,fmt:v=>nf(v,0)})}`;}catch(e){O.innerHTML=`<p class="dn">${esc(e.message)}</p>`;}};});}
const mt=L=>`<div class="ec36tw"><table class="ec36t sm"><thead><tr><th>Estrategia</th><th class="r">CAGR</th><th class="r">Volatilidad</th><th class="r">Caída máx.</th><th class="r">Sharpe</th><th class="r">Costos</th><th class="r">Valor final</th></tr></thead><tbody>${L.map((R,i)=>`<tr><td><i class="sl38dot" style="background:${COL[i%COL.length]}"></i>${esc(R.def.name)}</td><td class="r mono">${pc(R.cagr)}</td><td class="r mono">${pa(R.vol)}</td><td class="r mono dn">${pc(R.mdd)}</td><td class="r mono">${nf(R.sharpe,2)}</td><td class="r mono">${usd(R.cost)}</td><td class="r mono">${usd(R.final)}</td></tr>`).join('')}</tbody></table></div>`;
const COL=['var(--em)','var(--gold)','#8FA9D6','#D9A07A'];
function rCmp(){const B=$('#slBody');if(SL.list.length<2){B.innerHTML=`<div class="panel sl38empty">${ic('diversificar','',false)}<p>Guarda al menos dos estrategias para compararlas en el mismo período.</p></div>`;return;}
 B.innerHTML=`<div class="panel"><h3>Elige hasta 4 estrategias</h3><div class="sl38pick">${SL.list.map(s=>`<label class="in37mod"><input type="checkbox" value="${s.id}" ${ST.cmp.includes(s.id)?'checked':''}><span></span><span><b>${esc(s.name)}</b><small>versión ${s.versions.at(-1).v}</small></span></label>`).join('')}</div><button class="cta" id="slCmpGo">Comparar en el mismo período</button></div><div id="slCmpO"></div>`;
 $$('.sl38pick input').forEach(x=>x.onchange=()=>{const v=[...$$('.sl38pick input:checked')].map(y=>y.value);if(v.length>4){x.checked=false;toast('Máximo 4');return;}ST.cmp=v;});
 $('#slCmpGo').onclick=async()=>{const S=ST.cmp.map(id=>SL.list.find(s=>s.id===id)).filter(Boolean);const O=$('#slCmpO');if(S.length<2){toast('Elige al menos 2');return;}O.innerHTML='<div class="panel"><div class="ec36sk"><i></i><i></i></div></div>';
  try{const defs=S.map(s=>({...clone(s.versions.at(-1).def),name:s.name}));const yrs=Math.min(...defs.map(d=>d.yrs));const syms=[...new Set(defs.flatMap(d=>[...d.assets.map(a=>a.t),d.bench||'SPY']))],D={};await pool30(syms,3,async s=>{try{D[s]=await hist(s);}catch(e){D[s]=[];}});
   const startT=Date.now()-yrs*YR,first=Math.max(startT,...defs.flatMap(d=>d.assets.map(a=>(D[a.t]||[[Infinity]])[0][0])));const dates=(D.SPY&&D.SPY.length?D.SPY:D[syms[0]]).filter(p=>p[0]>=first).map(p=>p[0]);
   const R=defs.map(d=>run({...d,yrs},D,dates));
   O.innerHTML=`<div class="panel"><div class="ph30"><h3>Mismo período: ${fd(dates[0])} → ${fd(dates.at(-1))}</h3><small>Cada una con sus aportes y costos</small></div>${mt(R)}
    <h4>Crecimiento de 100 (sin contar aportes)</h4><div class="sl38leg">${R.map((r,i)=>`<span><i style="background:${COL[i]}"></i>${esc(r.def.name)}</span>`).join('')}</div>${lines30(R.map((r,i)=>({pts:dates.map((t,k)=>[t,r.nav[k]*100]),color:COL[i]})),{w:760,h:240,fmt:v=>nf(v,0)})}
    <h4>Caídas desde el máximo</h4>${lines30(R.map((r,i)=>({pts:dates.map((t,k)=>[t,r.dd[k]*100]),color:COL[i]})),{w:760,h:150,fmt:v=>nf(v,0)+'%'})}
    <p class="note">Se usa el período común a todas (el más corto y desde que todos los activos tienen historial). ${esc(SRC)}; solo precio, sin dividendos.</p></div>`;}catch(e){O.innerHTML=`<div class="panel"><p class="dn">${esc(e.message)}</p></div>`;}};}

render();window.SL38={ST,SL:()=>SL,go,save,render,backtest};
/* accesos: Lucioni Pro → Analysis y el backtest clásico */
{const g=[...document.querySelectorAll('#pro30 .pg30')].find(x=>/Analysis/.test(x.textContent));if(g&&!$('#sl38pro')){const b=document.createElement('button');b.className='pt30';b.id='sl38pro';b.innerHTML=`${ic('compuesto','',false)}<span><b>Strategy Lab</b><small>Reglas, rebalanceo, aportes, costos, versiones y comparación con 5 años de precios reales</small></span>${ic('right','',false)}`;b.onclick=()=>setView('lab');g.querySelector('h3').after(b);}}
{const h=$('#btHost');if(h&&!$('#sl38bt')){const b=document.createElement('button');b.id='sl38bt';b.className='btn';b.style.marginTop='10px';b.textContent='Abrir en Strategy Lab (reglas, costos y versiones)';b.onclick=()=>{ST.def={...DEF0(),name:'Desde el backtest',assets:(store.get('bt',{rows:[]}).rows||[]).filter(r=>r.t&&r.w>0).map(r=>({t:r.t,w:r.w}))};if(!ST.def.assets.length)ST.def.assets=DEF0().assets;ST.id=null;ST.R=null;draft();setView('lab');};h.after(b);}}
})();
