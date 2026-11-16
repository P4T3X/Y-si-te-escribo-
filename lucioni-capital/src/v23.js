
/* ===================== V23: barra adaptable, sol oficial, backtest y costo real ===================== */
/* ---------- barra superior: lo que no cabe pasa a "Más" ---------- */
{const nav=$('#nav'),top=$('.topin'),tr=$('.tright'),cta=$('#navCta');if(nav&&top&&tr){
  const more=document.createElement('div');more.className='nmore hidden';more.innerHTML=`<button class="nmb" aria-haspopup="true" aria-expanded="false">Más <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button><div class="nmenu" role="menu"></div>`;
  const ul=$('#uline');nav.insertBefore(more,ul);const menu=more.querySelector('.nmenu'),btn=more.querySelector('.nmb');
  const links=()=>[...nav.querySelectorAll(':scope > a'),...menu.querySelectorAll('a')].sort((a,b)=>+a.dataset.ord-+b.dataset.ord);
  nav.querySelectorAll(':scope > a').forEach((a,i)=>a.dataset.ord=i);
  const fits=()=>{const L=[...nav.children].filter(e=>e.offsetParent!==null&&!e.classList.contains('uline'));const r=L.length?Math.max(...L.map(e=>e.getBoundingClientRect().right)):nav.getBoundingClientRect().right;return r<=tr.getBoundingClientRect().left-6&&nav.scrollWidth<=nav.clientWidth+1&&tr.getBoundingClientRect().right<=Math.min(innerWidth,top.getBoundingClientRect().right)+1;};
  function fitNav(){if(getComputedStyle(nav).display==='none')return;nav.querySelectorAll(':scope > a').forEach((a,i)=>{if(a.dataset.ord==null)a.dataset.ord=100+i;});
    links().forEach(a=>nav.insertBefore(a,more));more.classList.add('hidden');if(cta)cta.style.display='';
    if(fits())return syncMore();if(cta&&getComputedStyle(cta).display!=='none'){cta.style.display='none';if(fits())return syncMore();}
    more.classList.remove('hidden');let L=[...nav.querySelectorAll(':scope > a')];while(L.length>2&&!fits()){const a=L.pop();menu.prepend(a);}syncMore();}
  function syncMore(){btn.classList.toggle('act',!!menu.querySelector('a.act'));}
  btn.onclick=e=>{e.stopPropagation();const o=more.classList.toggle('open');btn.setAttribute('aria-expanded',o);if(o&&window.gsap&&!RM)gsap.fromTo(menu.querySelectorAll('a'),{x:-8,opacity:0},{x:0,opacity:1,stagger:.025,duration:.3,ease:'power3.out'});};
  menu.addEventListener('click',()=>{more.classList.remove('open');btn.setAttribute('aria-expanded','false');});
  document.addEventListener('pointerdown',e=>{if(!more.contains(e.target)){more.classList.remove('open');btn.setAttribute('aria-expanded','false');}});
  let t=0;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(fitNav,80);});
  const _mk=markNav;markNav=function(){_mk();syncMore();};
  const _au=accUI;accUI=function(){_au();requestAnimationFrame(fitNav);};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitNav);setTimeout(fitNav,0);setTimeout(fitNav,700);window.fitNav=fitNav;}}

/* ---------- tipo de cambio oficial del BCRP ---------- */
let FXOFF=null;
async function fxOfficial(){if(!MKT||FXOFF)return FXOFF;try{const r=await fetch(`${MKT}?fxpen=1`);const d=await r.json();if(r.ok&&d.last){FXOFF=d;if(!store.get('fxUser',false)){FXD.rate=d.last[1];try{$('#fxR').value=d.last[1];}catch(e){}if(typeof fx==='function')fx();}
  const n=$('#t-fx');if(n&&!n.querySelector('.fxoff')){const p=document.createElement('p');p.className='note fxoff';p.innerHTML=`Tipo de cambio oficial: <b>S/ ${d.last[1].toFixed(3)}</b> por dólar al ${new Date(d.last[0]).toLocaleDateString('es-PE',{timeZone:'UTC'})} (BCRP, sistema bancario, venta). <button class="linkb" id="fxUse">Usar este</button>`;n.querySelector('h3')?.after(p);$('#fxUse').onclick=()=>{store.set('fxUser',false);FXD.rate=d.last[1];$('#fxR').value=d.last[1];fx();toast('Tipo de cambio oficial aplicado',ic('check','',false));};}}}catch(e){}return FXOFF;}
$('#fxR')&&$('#fxR').addEventListener('input',()=>store.set('fxUser',true));
fxOfficial();

/* ---------- mi cartera en soles: efecto del tipo de cambio ---------- */
if(MKT&&$('#pfRisk')){const d=document.createElement('div');d.className='panel pfpen';d.id='pfPen';d.innerHTML='<h4>Tu cartera en soles</h4><div id="pfPenB"><p class="note">Agrega acciones para verla en soles.</p></div>';$('#pfRisk').after(d);}
async function pfPen(){const box=$('#pfPenB');if(!box)return;const P=pfCalc();if(!P.rows.length){box.innerHTML='<p class="note">Agrega acciones para verla en soles.</p>';return;}const F=await fxOfficial();if(!F){box.innerHTML='<p class="note">No se pudo leer el tipo de cambio oficial.</p>';return;}
  const pts=F.pts,now=pts.at(-1),yAgo=pts.find(p=>p[0]>=now[0]-365*864e5)||pts[0],fxR=now[1]/yAgo[1]-1;
  let rU=null;try{let num=0,den=0;for(const r of P.rows){const h=await h1y(r.s);if(h.length>30){num+=r.w*(h.at(-1)[1]/h[0][1]-1);den+=r.w;}}if(den>0)rU=num/den;}catch(e){}
  const tot=rU!=null?(1+rU)*(1+fxR)-1:null,vPen=P.V*now[1],fxEff=rU!=null?vPen-vPen/(1+fxR):null;
  const W=Math.max(300,Math.min(560,box.clientWidth||520)),H=110,ys=pts.map(p=>p[1]),mn=Math.min(...ys),mx=Math.max(...ys),X=i=>i/(pts.length-1)*(W-60),Y=v=>8+(mx-v)/((mx-mn)||1)*(H-24);
  const path=pts.map((p,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(p[1]).toFixed(1)).join('');
  box.innerHTML=`<div class="fkg"><div class="fk"><small>Valor en soles hoy</small><b>S/ ${Math.round(vPen).toLocaleString('en-US')}</b><span>${usd2(P.V)} × S/ ${now[1].toFixed(3)} (oficial BCRP)</span></div>
      <div class="fk"><small>Tus acciones en dólares (12 m)</small><b style="color:var(${(rU||0)>=0?'--up':'--down'})">${rU!=null?pctF(rU):'—'}</b><span>Con tus pesos actuales</span></div>
      <div class="fk"><small>El dólar frente al sol (12 m)</small><b style="color:var(${fxR>=0?'--up':'--down'})">${pctF(fxR)}</b><span>De S/ ${yAgo[1].toFixed(3)} a S/ ${now[1].toFixed(3)}</span></div>
      <div class="fk"><small>Resultado total en soles</small><b style="color:var(${(tot||0)>=0?'--up':'--down'})">${tot!=null?pctF(tot):'—'}</b><span>${fxEff!=null?`El tipo de cambio ${fxEff>=0?'sumó':'restó'} unos S/ ${Math.abs(Math.round(fxEff)).toLocaleString('en-US')}`:''}</span></div></div>
    <div class="fachart">${svgEl(W,H,`<path class="fxl" d="${path}"/><text x="${W-54}" y="${Y(now[1])+4}" class="fxt">S/ ${now[1].toFixed(3)}</text><text x="0" y="${H-2}">${new Date(pts[0][0]).toLocaleDateString('es-PE',{month:'short',year:'2-digit',timeZone:'UTC'})}</text>`,'Tipo de cambio de los últimos meses')}</div>
    <p class="note">Si ganas y gastas en soles, tu resultado real incluye lo que se mueve el dólar. Cuando el sol se fortalece, tus inversiones en dólares valen menos soles aunque las acciones suban.</p>`;
  const fl=box.querySelector('.fxl');if(fl&&window.gsap&&!RM&&fl.getTotalLength){const L=fl.getTotalLength();gsap.fromTo(fl,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.4,ease:'power2.inOut'});}}
const _pfR23=pfRender;let penT=0;pfRender=function(f){_pfR23(f);clearTimeout(penT);penT=setTimeout(()=>{if(VIEW==='port'&&member())pfPen();},900);};

/* ---------- backtest de una cartera (5 años reales) ---------- */
TOOLS.push('bt','cost');
LOCKS['tool:bt']=['Backtest de cartera','Prueba cómo le habría ido a tu cartera en los últimos 1, 3 o 5 años con precios reales, aportes mensuales y rebalanceo.'];
LOCKS['tool:cost']=['Costo real desde Perú','Calcula cuánto se lleva el tipo de cambio, las comisiones, la retención de dividendos y los impuestos.'];
{const ref=$('#tnav button[data-t="perf"]')||$('#tnav button[data-t="fee"]');if(ref){[['cost','Costo real desde Perú'],['bt','Backtest']].forEach(([k,l])=>{const b=document.createElement('button');b.dataset.t=k;b.textContent=l;b.onclick=()=>tool(k);ref.after(b);});}}
{const cols=$$('#menu .mcol'),col=cols[cols.length-1];if(col){const h=col.querySelector('h4');[['volatilidad','Backtest de cartera','Cómo le habría ido en 5 años',()=>{go('tools');tool('bt');}],['dividendo','Costo real desde Perú','Cambio, comisiones e impuestos',()=>{go('tools');tool('cost');}]].forEach(([i,t,s,f])=>{const b=document.createElement('button');b.className='mi2';b.setAttribute('role','menuitem');b.innerHTML=`${ic(i,'',false)}<span>${t}<small>${s}</small></span>`;b.onclick=()=>{closeMenu();f();};h.after(b);});}}
const H5={};async function h5(s){if(H5[s])return H5[s];const r=await fetch(`${MKT}?h5=${encodeURIComponent(s)}`);const d=await r.json();H5[s]=d.pts||[];return H5[s];}
let BT=store.get('bt',{rows:[{t:'VOO',w:60},{t:'BND',w:25},{t:'VXUS',w:15}],init:1000,mon:100,yrs:5,reb:true});
function btRows(){$('#btR').innerHTML=BT.rows.map((r,i)=>`<div class="scr"><input class="f" data-i="${i}" data-k="t" value="${esc(r.t)}" maxlength="10" style="text-transform:uppercase;max-width:130px"><input class="f" data-i="${i}" data-k="w" type="number" step="any" min="0" value="${r.w}" style="max-width:100px"><span class="note" style="align-self:center">%</span><button class="ib" data-x="${i}" aria-label="Quitar">${ic('x','',false)}</button></div>`).join('')+`<p class="note">Suma: <b>${BT.rows.reduce((a,r)=>a+(+r.w||0),0)}%</b></p>`;
  $$('#btR [data-k]').forEach(x=>x.onchange=()=>{const r=BT.rows[+x.dataset.i];r[x.dataset.k]=x.dataset.k==='t'?x.value.trim().toUpperCase():+x.value;store.set('bt',BT);btRows();});$$('#btR [data-x]').forEach(x=>x.onclick=()=>{BT.rows.splice(+x.dataset.x,1);store.set('bt',BT);btRows();});}
function btInit(){const host=$('#btHost');if(!host||host.dataset.ok)return;host.dataset.ok=1;
  host.innerHTML=`<div class="dkcols"><div><h4 style="margin-bottom:6px">Tu cartera</h4><div id="btR"></div><div class="acts"><button class="btn" id="btAdd">+ Agregar</button><button class="btn" id="btPlan">Usar mi plan</button><button class="btn" id="btPf">Usar Mi cartera real</button></div></div>
    <div><div class="dcfn"><div><label class="l" for="btI">Inversión inicial ($)</label><input class="f" id="btI" type="number" min="0" step="any" value="${BT.init}"></div><div><label class="l" for="btM">Aporte mensual ($)</label><input class="f" id="btM" type="number" min="0" step="any" value="${BT.mon}"></div></div>
      <label class="l">Periodo</label><div class="seg" id="btY">${[1,3,5].map(y=>`<button data-y="${y}" class="${BT.yrs===y?'act':''}">${y} año${y>1?'s':''}</button>`).join('')}</div>
      <label class="chk"><input type="checkbox" id="btRb" ${BT.reb?'checked':''}> Rebalancear una vez al año</label><button class="cta" id="btGo" style="width:100%;justify-content:center;margin-top:12px">Probar en el pasado</button></div></div><div id="btOut"></div>`;
  btRows();$('#btAdd').onclick=()=>{BT.rows.push({t:'',w:0});btRows();};
  $('#btPlan').onclick=()=>{const p=store.get('plan',null);if(!p||!p.cartera){toast('Primero arma tu plan en "Tu plan"');return;}BT.rows=p.cartera.map(c=>({t:String(c.ticker).toUpperCase(),w:c.porcentaje}));if(p.usd)BT.init=Math.round(p.usd);$('#btI').value=BT.init;store.set('bt',BT);btRows();};
  $('#btPf').onclick=()=>{const P=pfCalc();if(!P.rows.length){toast('Tu cartera real está vacía');return;}BT.rows=P.rows.map(r=>({t:r.s,w:+(r.w*100).toFixed(1)}));store.set('bt',BT);btRows();};
  $$('#btY button').forEach(b=>b.onclick=()=>{BT.yrs=+b.dataset.y;$$('#btY button').forEach(x=>x.classList.toggle('act',x===b));store.set('bt',BT);});
  $('#btI').oninput=e=>{BT.init=+e.target.value;store.set('bt',BT);};$('#btM').oninput=e=>{BT.mon=+e.target.value;store.set('bt',BT);};$('#btRb').onchange=e=>{BT.reb=e.target.checked;store.set('bt',BT);};
  $('#btGo').onclick=btRun;if(!MKT)$('#btOut').innerHTML='<p class="note">El backtest con precios reales funciona en la versión web.</p>';}
async function btRun(){const out=$('#btOut');if(!MKT)return;const R=BT.rows.filter(r=>r.t&&r.w>0),ws=R.reduce((a,r)=>a+r.w,0);if(!R.length){toast('Agrega al menos un ticker');return;}
  out.innerHTML='<div class="idskel" style="height:280px;margin-top:14px"></div>';const syms=[...new Set([...R.map(r=>r.t),'SPY'])],D={};let i=0;
  await Promise.all([0,1,2].map(async()=>{while(i<syms.length){const s=syms[i++];try{D[s]=await h5(s);}catch(e){D[s]=[];}}}));
  const miss=R.filter(r=>D[r.t].length<20).map(r=>r.t);if(miss.length){out.innerHTML=`<p class="autherr">Sin historial para: ${miss.join(', ')}.</p>`;return;}
  const startT=Date.now()-BT.yrs*365.25*864e5,first=Math.max(startT,...R.map(r=>D[r.t][0][0]));const dates=D.SPY.filter(p=>p[0]>=first).map(p=>p[0]);if(dates.length<10){out.innerHTML='<p class="autherr">Historial insuficiente para ese periodo.</p>';return;}
  const at=(s,t)=>{const a=D[s];let lo=0,hi=a.length-1,b=a[0][1];while(lo<=hi){const m=(lo+hi)>>1;if(a[m][0]<=t){b=a[m][1];lo=m+1;}else hi=m-1;}return b;};
  const sim=(rows)=>{const tw=rows.reduce((a,r)=>a+r.w,0),sh={};rows.forEach(r=>sh[r.t]=BT.init*(r.w/tw)/at(r.t,dates[0]));let contrib=BT.init,lastM=new Date(dates[0]).getUTCMonth(),lastY=new Date(dates[0]).getUTCFullYear(),units=BT.init,curve=[],cc=[],peak=0,mdd=0,nav=1;let prevV=BT.init;
    dates.forEach((t,k)=>{const d=new Date(t),val=rows.reduce((a,r)=>a+sh[r.t]*at(r.t,t),0);if(k){nav*=val/prevV;}
      let v=val;if(d.getUTCMonth()!==lastM&&BT.mon>0){rows.forEach(r=>sh[r.t]+=BT.mon*(r.w/tw)/at(r.t,t));contrib+=BT.mon;v+=BT.mon;lastM=d.getUTCMonth();}else if(d.getUTCMonth()!==lastM)lastM=d.getUTCMonth();
      if(BT.reb&&d.getUTCFullYear()!==lastY){rows.forEach(r=>sh[r.t]=v*(r.w/tw)/at(r.t,t));lastY=d.getUTCFullYear();}
      prevV=v;curve.push(v);cc.push(contrib);peak=Math.max(peak,nav);mdd=Math.min(mdd,nav/peak-1);});
    const yrs=(dates.at(-1)-dates[0])/(365.25*864e5),cagr=Math.pow(nav,1/yrs)-1;return {curve,cc,contrib,final:curve.at(-1),cagr,mdd,yrs,nav};};
  const A=sim(R),B=sim([{t:'SPY',w:1}]);
  const rets=[];for(let k=1;k<A.curve.length;k++){const a=A.curve[k]-(A.cc[k]-A.cc[k-1]),b=A.curve[k-1];rets.push(a/b-1);}const vol=sd(rets)*Math.sqrt(52),sh=(A.cagr-.04)/vol;
  const W=Math.max(320,Math.min(1100,out.clientWidth||700)),Hc=270,p={l:58,r:96,t:14,b:26},all=[...A.curve,...B.curve,...A.cc],mx=Math.max(...all),mn=Math.min(...all)*.95,X=k=>p.l+k/(dates.length-1)*(W-p.l-p.r),Y=v=>p.t+(mx-v)/((mx-mn)||1)*(Hc-p.t-p.b);
  const path=a=>a.map((v,k)=>(k?'L':'M')+X(k).toFixed(1)+' '+Y(v).toFixed(1)).join('');let g='';
  for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4;g+=`<line class="ax" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v)+4}">$${v>=1000?(v/1000).toFixed(1)+' mil':v.toFixed(0)}</text>`;}
  g+=`<text x="${p.l}" y="${Hc-6}">${new Date(dates[0]).toLocaleDateString('es-PE',{month:'short',year:'numeric'})}</text><text x="${W-p.r}" y="${Hc-6}" text-anchor="end">${new Date(dates.at(-1)).toLocaleDateString('es-PE',{month:'short',year:'numeric'})}</text>`;
  g+=`<path class="btc" d="${path(A.cc)}"/><path class="btb" d="${path(B.curve)}"/><path class="bta" d="${path(A.curve)}"/><text class="btl" x="${W-p.r+6}" y="${Y(A.final)+4}" fill="var(--accent)">Tu cartera</text><text class="btl" x="${W-p.r+6}" y="${Y(B.final)+(Math.abs(Y(B.final)-Y(A.final))<14?18:4)}" fill="var(--ink2)">S&amp;P 500</text>`;
  const k=(t,v,s,c)=>`<div class="fk"><small>${t}</small><b ${c?`style="color:var(${c})"`:''}>${v}</b><span>${s}</span></div>`;
  out.innerHTML=`<div class="fkg" style="margin-top:14px">${k('Valor final',m$(A.final),`Aportaste ${m$(A.contrib)}`,A.final>=A.contrib?'--up':'--down')}${k('Ganancia',m$(A.final-A.contrib),pctF(A.final/A.contrib-1)+' sobre lo aportado',A.final>=A.contrib?'--up':'--down')}${k('Rendimiento anual (CAGR)',pctF(A.cagr),`S&P 500: ${pctF(B.cagr)}`)}${k('Caída máxima',pctF(A.mdd),`S&P 500: ${pctF(B.mdd)}`,'--down')}${k('Volatilidad anual',pctF(vol),'Semanal anualizada')}${k('Sharpe',sh.toFixed(2),'Tasa libre 4%')}</div>
    <div class="fachart">${svgEl(W,Hc,g,'Evolución de la cartera frente al S&P 500')}<div class="faleg"><span><i style="background:var(--accent)"></i>Tu cartera</span><span><i style="background:var(--ink3)"></i>S&amp;P 500 con los mismos aportes</span><span><i class="dash"></i>Dinero aportado</span></div></div>
    <ul class="idwhy"><li>${A.final>=B.final?`Tu cartera terminó ${m$(A.final-B.final)} por encima del S&amp;P 500`:`El S&amp;P 500 habría terminado ${m$(B.final-A.final)} por encima`}${A.mdd>B.mdd?', con caídas menos profundas.':'.'}</li><li class="w">En el peor momento, tu cartera llegó a estar ${pctF(Math.abs(A.mdd))} por debajo de su máximo. Pregúntate si habrías aguantado sin vender.</li></ul>
    <p class="disc">Simulación con precios de cierre semanales reales${BT.reb?', rebalanceo anual':''} y aportes al inicio de cada mes. No incluye dividendos, comisiones ni impuestos. El pasado no garantiza resultados futuros.</p>`;
  if(window.gsap&&!RM){$$('#btOut .bta,#btOut .btb').forEach((pth,j)=>{const L=pth.getTotalLength();gsap.fromTo(pth,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.8,ease:'power2.inOut',delay:j*.15});});gsap.from('#btOut .fk',{y:12,opacity:0,stagger:.05,duration:.45,ease:'expo.out'});}}

/* ---------- costo real de invertir desde Perú ---------- */
const CBRK={hapi:['Hapi',0,0,'Sin comisión por operar; cobra por retiro (revisa su tarifa vigente).'],ibkr:['Interactive Brokers',1,0,'Comisión aprox. de $0.005 por acción con mínimo de $1 por orden (plan Pro).'],etoro:['eToro',0,0,'Sin comisión en acciones; cobra cambio de divisas y retiro.'],tyba:['Tyba (Credicorp)',0,0,'0% de comisión anunciada en acciones y ETF de EE.UU.'],otro:['Otro',0,0,'Escribe tus comisiones.']};
let CS=store.get('costc',{amt:5000,cur:'PEN',mon:200,yrs:10,ret:7,div:1.5,ter:.1,spread:1,fee:0,trades:12,wh:30,tax:5,brk:'hapi'});
function costInit(){const h=$('#costHost');if(!h||h.dataset.ok)return;h.dataset.ok=1;const f=(id,l,k,st,hint)=>`<div><label class="l" for="${id}">${l}</label><input class="f" id="${id}" data-k="${k}" type="number" step="${st||'any'}" min="0" value="${CS[k]}">${hint?`<small class="hint">${hint}</small>`:''}</div>`;
  h.innerHTML=`<div class="dkcols"><div><div class="seg" id="csC" style="margin-bottom:8px"><button data-v="PEN" class="${CS.cur==='PEN'?'act':''}">Invierto soles</button><button data-v="USD" class="${CS.cur==='USD'?'act':''}">Ya tengo dólares</button></div>
      <div class="dcfn">${f('csA','Monto inicial','amt')}${f('csM','Aporte mensual','mon')}${f('csY','Años','yrs',1)}${f('csR','Rendimiento anual esperado (%)','ret')}</div>
      <label class="l" for="csB">Bróker</label><select class="f" id="csB">${Object.entries(CBRK).map(([k,b])=>`<option value="${k}" ${CS.brk===k?'selected':''}>${b[0]}</option>`).join('')}</select><p class="note" id="csBn"></p></div>
    <div class="dcfn">${f('csS','Diferencia del cambio (%)','spread','any','Banco: 1–2%. Casa de cambio digital: 0.2–0.5%.')}${f('csF','Comisión por operación ($)','fee')}${f('csT','Operaciones al año','trades',1)}${f('csD','Dividendo de tu cartera (%)','div','any','ETF del S&P 500: ~1.2%.')}${f('csW','Retención de dividendos en EE.UU. (%)','wh','any','30% sin convenio tributario.')}${f('csE','Costo anual de los ETF (%)','ter','any','VOO: 0.03%. Fondos activos: 1–2%.')}${f('csX','Impuesto al vender (%)','tax','any','Confirma tu tasa con SUNAT o un contador.')}</div></div><div id="csOut"></div>`;
  $$('#costHost [data-k]').forEach(x=>x.oninput=()=>{CS[x.dataset.k]=+x.value;store.set('costc',CS);csRun();});
  $$('#csC button').forEach(b=>b.onclick=()=>{CS.cur=b.dataset.v;$$('#csC button').forEach(x=>x.classList.toggle('act',x===b));store.set('costc',CS);csRun();});
  $('#csB').onchange=e=>{CS.brk=e.target.value;const b=CBRK[CS.brk];CS.fee=b[1];$('#csF').value=b[1];store.set('costc',CS);csRun();};csRun();}
function csRun(){const out=$('#csOut');if(!out)return;$('#csBn').textContent=CBRK[CS.brk][3];const fx=FXD.rate||3.4,toU=v=>CS.cur==='PEN'?v/fx:v,sp=CS.spread/100,N=Math.round(CS.yrs*12),rm=Math.pow(1+CS.ret/100,1/12)-1,dm=CS.div/100/12,ter=CS.ter/100/12,wh=CS.wh/100;
  /* bruto: sin ningún costo */let g=toU(CS.amt),aport=toU(CS.amt);for(let m=1;m<=N;m++){g=(g+(m>1?toU(CS.mon):0))*(1+rm+dm);if(m>1)aport+=toU(CS.mon);}
  /* neto: cambio al entrar, comisiones, costo del ETF, retención de dividendos */let v=toU(CS.amt)*(CS.cur==='PEN'?1-sp:1)-CS.fee,cFx=CS.cur==='PEN'?toU(CS.amt)*sp:0,cFee=CS.fee,cTer=0,cWh=0;
  for(let m=1;m<=N;m++){if(m>1){const a=toU(CS.mon);const fxc=CS.cur==='PEN'?a*sp:0;const fe=CS.trades>=12||m%Math.max(1,Math.round(12/Math.max(1,CS.trades)))===0?CS.fee:0;v+=a-fxc-fe;cFx+=fxc;cFee+=fe;}
    const t=v*ter,w=v*dm*wh;v=v*(1+rm+dm)-t-w;cTer+=t;cWh+=w;}
  const gain=Math.max(0,v-aport),cTax=gain*CS.tax/100,cOut=CS.cur==='PEN'?(v-cTax)*sp:0,net=v-cTax-cOut,lost=g-net;
  const parts=[['Tipo de cambio (entrar y salir)',cFx+cOut],['Comisiones del bróker',cFee],['Costo anual de los ETF',cTer],['Retención de dividendos en EE.UU.',cWh],['Impuesto al vender',cTax]];const mxp=Math.max(...parts.map(p=>p[1]),1);
  const S=v2=>CS.cur==='PEN'?`S/ ${Math.round(v2*fx).toLocaleString('en-US')}`:m$(v2);
  out.innerHTML=`<div class="fkg" style="margin-top:14px"><div class="fk"><small>Sin costos tendrías</small><b>${S(g)}</b><span>en ${CS.yrs} años, aportando ${S(aport)}</span></div><div class="fk"><small>Con costos reales</small><b style="color:var(--up)">${S(net)}</b><span>lo que de verdad te queda</span></div><div class="fk"><small>Se va en costos</small><b style="color:var(--down)">${S(lost)}</b><span>${pctF(lost/Math.max(1,g-aport),0)} de tus ganancias</span></div></div>
    <div class="cbars">${parts.map(([l,c])=>`<div><span>${l}</span><i style="--w:${(c/mxp*100).toFixed(1)}%"></i><b>${S(c)}</b></div>`).join('')}</div>
    <h4 style="margin:14px 0 6px">Cómo pagar menos</h4><ul class="idwhy">${csTips(parts).map(([w,t])=>`<li class="${w?'w':''}">${t}</li>`).join('')}</ul>
    <p class="disc">Estimación educativa. Las tarifas de los brókers cambian: revisa la vigente en su página. Perú no tiene convenio para evitar la doble tributación con EE.UU., por lo que la retención usual sobre dividendos es 30% (algunas fuentes mencionan 15%; confírmalo con tu bróker). No es asesoría tributaria.</p>`;
  requestAnimationFrame(()=>$$('#csOut .cbars i').forEach(e=>e.style.width=e.style.getPropertyValue('--w')));}
function csTips(parts){const t=[],top=[...parts].sort((a,b)=>b[1]-a[1])[0][0];
  t.push([0,`Tu costo más grande es <b>${top.toLowerCase()}</b>.`]);
  if(CS.cur==='PEN'&&CS.spread>.6)t.push([0,`Cambia tus soles en una casa de cambio digital regulada por la SBS en vez del banco: bajar la diferencia de ${CS.spread}% a 0.4% te ahorra en cada aporte.`]);
  if(CS.fee>0)t.push([0,'Junta tus aportes y compra menos veces: cada operación paga comisión. O usa un bróker sin comisión por operar.']);
  if(CS.wh>=30&&CS.div>0)t.push([0,'Los ETF domiciliados en Irlanda (por ejemplo CSPX o VUAA, que replican el S&amp;P 500) pagan 15% de retención dentro del fondo en lugar de 30% a ti, y reinvierten los dividendos solos. Verifica si tu bróker los ofrece.']);
  t.push([1,'Si tus acciones de empresas de EE.UU. superan los $60,000, como no residente podrías estar expuesto al impuesto a la herencia de EE.UU. Los ETF irlandeses no tienen ese riesgo. Consulta a un especialista.']);
  if(CS.ter>.3)t.push([0,`Un costo anual de ${CS.ter}% es alto: los ETF indexados cuestan 0.03–0.10%.`]);
  return t;}
const _tool23=tool;tool=function(t){_tool23(t);if(t==='bt')btInit();if(t==='cost')costInit();};
/* botón en la lista de compra del plan */
const _render23=render;render=function(d,q){_render23(d,q);const acts=$('.buylist .acts');if(acts&&!$('#blBt')){const b=document.createElement('button');b.className='btn';b.id='blBt';b.textContent='Probar este plan en los últimos 5 años';b.onclick=()=>{if(!member()){openAccount();return;}BT.rows=d.cartera.map(c=>({t:c.ticker,w:c.porcentaje}));BT.init=Math.round(d.usd||1000);BT.yrs=5;store.set('bt',BT);go('tools');tool('bt');setTimeout(()=>{btRows();$('#btI').value=BT.init;btRun();},400);};acts.appendChild(b);}};
{const p=store.get('plan',null);if(p&&p.cartera&&$('.buylist')){try{render(p,true);}catch(e){}}}
refreshLocks();
