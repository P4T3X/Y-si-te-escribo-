
/* ===================== V21: deudas e inversión ===================== */
VIEWS.debt=['deudas'];V2ID.debt='deudas';ID2V.deudas='debt';VTITLE.debt='Deudas';
SYNC.push('debt');
const DB0={cur:'PEN',inc:4500,exp:2500,p0:2000,ext:600,risk:'moderado',debts:[{n:'Tarjeta de crédito',p:10000,b:8000,r:65,m:400},{n:'Préstamo personal',p:20000,b:15000,r:28,m:650}]};
let DBT={...DB0,...(store.get('debt',{})||{})};const saveDebt=()=>store.set('debt',DBT);
const DTPL=[['Tarjeta de crédito',60,4],['Préstamo personal',28,3],['Préstamo vehicular',14,2.2],['Crédito hipotecario',9,.8],['Préstamo de familiares',0,5]];
{const sec=$('#deudas');const b=document.createElement('div');b.className='backbar';b.innerHTML=`<button class="backb" aria-label="Volver al inicio">${ic('right','',false)}<span>Inicio</span></button><span class="crumb">Deudas</span>`;sec.prepend(b);b.querySelector('button').onclick=()=>setView('inicio');}
['#nav','#nav2'].forEach(n=>{const ref=$(n+' a[data-p="goals"]');if(!ref)return;const a=document.createElement('a');a.href='#deudas';a.dataset.p='debt';a.textContent='Deudas';a.addEventListener('click',e=>{e.preventDefault();setView('debt');});ref.after(a);});
$$('#hub .htile[data-v="debt"]').forEach(t=>t.addEventListener('click',()=>setView('debt')));
{const col=$('#menu .mcol');if(col){const b=document.createElement('button');b.className='mi2';b.setAttribute('role','menuitem');b.innerHTML=`${ic('stop','',false)}<span>Deudas e inversión<small>Cuándo quedas libre de deudas</small></span>`;b.onclick=()=>{closeMenu();setView('debt');};col.querySelector('h4').after(b);}}
const dm=v=>`${DBT.cur==='USD'?'$':'S/'} ${Math.round(v).toLocaleString('en-US')}`;
const mr=tea=>Math.pow(1+tea/100,1/12)-1;
const whenM=m=>{const d=new Date();d.setMonth(d.getMonth()+m);return d.toLocaleDateString('es-PE',{month:'long',year:'numeric'});};
const yrsM=m=>m>=12?`${Math.floor(m/12)} año${Math.floor(m/12)>1?'s':''}${m%12?` y ${m%12} mes${m%12>1?'es':''}`:''}`:`${m} mes${m>1?'es':''}`;

/* simulación mes a mes de cada estrategia */
function dSim(kind,o={}){const MAX=600,R=GPROF[DBT.risk]||GPROF.moderado,ri=o.ret??R.r,v=o.vol??0,rand=o.rand,mu=Math.log(1+ri)/12,s=v/Math.sqrt(12);
  const D=DBT.debts.filter(d=>d.b>0).map(d=>({...d,bal:+d.b,rm:mr(+d.r||0),min:+d.m||0,paidAt:null}));let inv=0,cash=+DBT.p0||0,interest=0,payoff=null;const nw=[],debtLine=[],invLine=[];
  const order=kind==='snow'?[...D].sort((a,b)=>a.bal-b.bal):[...D].sort((a,b)=>b.r-a.r);
  const totalDebt=()=>D.reduce((a,d)=>a+d.bal,0);
  const payDebt=(amt)=>{for(const d of order){if(amt<=0)break;if(d.bal<=0)continue;const p=Math.min(amt,d.bal);d.bal-=p;amt-=p;}return amt;};
  /* monto inicial */
  if(kind==='inv')inv+=cash;else if(kind==='mix'){inv+=cash/2;const left=payDebt(cash/2);inv+=left;}else{const left=payDebt(cash);inv+=left;}
  for(let m=1;m<=MAX;m++){let freed=0;
    D.forEach(d=>{if(d.bal<=0){freed+=d.min;return;}const it=d.bal*d.rm;interest+=it;d.bal+=it;const p=Math.min(d.min,d.bal);d.bal-=p;freed+=d.min-p;if(d.bal<=.005){d.bal=0;if(!d.paidAt)d.paidAt=m;}});
    const growth=rand?Math.exp(mu-s*s/2+s*rand()):Math.pow(1+ri,1/12);inv*=growth;
    const debtLeft=totalDebt()>0.005;let extra=(+DBT.ext||0)+freed;
    if(!debtLeft){inv+=extra;}
    else if(kind==='inv'){inv+=extra;if(inv>=totalDebt()){inv-=totalDebt();D.forEach(d=>{if(d.bal>0){d.bal=0;d.paidAt=m;}});}}
    else if(kind==='mix'){inv+=extra/2;inv+=payDebt(extra/2);}
    else inv+=payDebt(extra);
    D.forEach(d=>{if(d.bal<=.005&&!d.paidAt){d.bal=0;d.paidAt=m;}});
    if(payoff==null&&totalDebt()<=.005)payoff=m;
    if(!rand&&(m<=480)){nw.push(inv-totalDebt());debtLine.push(totalDebt());invLine.push(inv);}
    if(rand&&payoff!=null)break;}
  return {payoff,interest,nw,debtLine,invLine,inv,D,order};}
function dMC(){const R=GPROF[DBT.risk]||GPROF.moderado,res=[];const g=rng(777);for(let i=0;i<400;i++){const rnd=()=>{const u1=g()||1e-9,u2=g();return Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);};const s=dSim('inv',{vol:R.v,rand:rnd});res.push(s.payoff??9999);}
  res.sort((a,b)=>a-b);const q=p=>res[Math.floor(p*(res.length-1))];return {p10:q(.1),p50:q(.5),p90:q(.9)};}

function debtRender(){const box=$('#dWrap');if(!box)return;
  box.innerHTML=`<div class="dkcols"><div>
      <div class="panel"><h4>Tus ingresos y gastos</h4><div class="seg" id="dCur" style="margin-bottom:10px"><button data-v="PEN" class="${DBT.cur!=='USD'?'act':''}">Soles (S/)</button><button data-v="USD" class="${DBT.cur==='USD'?'act':''}">Dólares ($)</button></div>
        <div class="dcfn"><div><label class="l" for="dInc">Ingreso mensual neto</label><input class="f" id="dInc" type="number" min="0" step="any" value="${DBT.inc}"></div><div><label class="l" for="dExp">Gastos mensuales (sin deudas)</label><input class="f" id="dExp" type="number" min="0" step="any" value="${DBT.exp}"></div></div></div>
      <div class="panel"><h4>Para invertir o pagar</h4><div class="dcfn"><div><label class="l" for="dP0">Monto inicial disponible</label><input class="f" id="dP0" type="number" min="0" step="any" value="${DBT.p0}"></div><div><label class="l" for="dExt">Monto mensual extra</label><input class="f" id="dExt" type="number" min="0" step="any" value="${DBT.ext}"><small class="hint">Además de los pagos mínimos</small></div></div>
        <label class="l">Cómo invertirías</label><div class="seg" id="dRisk">${Object.entries(GPROF).map(([k,p])=>`<button data-v="${k}" class="${DBT.risk===k?'act':''}">${p.l.split(' (')[0]} ${pctF(p.r)}</button>`).join('')}</div></div></div>
    <div class="panel"><div class="pfth"><h4>Tus deudas</h4><span class="note">Tasa efectiva anual (TEA)</span></div><div id="dbtList"></div>
      <div class="pchips" style="margin-top:10px">${DTPL.map((t,i)=>`<button class="fchip sm" data-t="${i}"><b>+ ${t[0]}</b></button>`).join('')}</div></div></div>
  <div id="dOut"></div>`;
  const segs=(id,k)=>$$(id+' button').forEach(b=>b.onclick=()=>{$$(id+' button').forEach(x=>x.classList.toggle('act',x===b));DBT[k]=b.dataset.v;saveDebt();dCalc();});segs('#dCur','cur');segs('#dRisk','risk');
  [['dInc','inc'],['dExp','exp'],['dP0','p0'],['dExt','ext']].forEach(([id,k])=>$('#'+id).oninput=e=>{DBT[k]=+e.target.value;saveDebt();dCalcSoon();});
  $$('.fchip[data-t]').forEach(b=>b.onclick=()=>{const t=DTPL[+b.dataset.t];DBT.debts.push({n:t[0],p:5000,b:5000,r:t[1],m:Math.round(5000*t[2]/100)});saveDebt();dList();dCalc();});
  dList();dCalc();}
/* progreso de cada préstamo: cuánto del capital ya pagaste */
function dProg(d){const p=+d.p||0,b=+d.b||0;if(!(p>0))return '<span class="dpg muted">Escribe el capital prestado para ver cuánto llevas pagado.</span>';
  if(b>p)return `<span class="dpg warn">Tu saldo (${dm(b)}) supera el capital prestado (${dm(p)}): debes intereses acumulados o comisiones.</span>`;
  const f=(p-b)/p;return `<span class="dpg"><span class="dbar"><i style="width:${(f*100).toFixed(1)}%"></i></span><span>Pagaste <b>${dm(p-b)}</b> de ${dm(p)} · ${pctF(f,0)} del capital</span></span>`;}
function dList(){$('#dbtList').innerHTML=DBT.debts.length?`<div class="dlist">${DBT.debts.map((d,i)=>`<div class="drow"><input class="f" data-i="${i}" data-k="n" value="${esc(d.n)}" aria-label="Nombre de la deuda"><label><small>Capital prestado</small><input class="f" data-i="${i}" data-k="p" type="number" min="0" step="any" value="${d.p??''}" placeholder="Monto original"></label><label><small>Saldo que debes hoy</small><input class="f" data-i="${i}" data-k="b" type="number" min="0" step="any" value="${d.b}"></label><label><small>TEA %</small><input class="f" data-i="${i}" data-k="r" type="number" min="0" step="any" value="${d.r}"></label><label><small>Cuota o pago mínimo</small><input class="f" data-i="${i}" data-k="m" type="number" min="0" step="any" value="${d.m}"></label><button class="ib" data-x="${i}" aria-label="Quitar">${ic('x','',false)}</button><div class="dprog" id="dPg${i}">${dProg(d)}</div></div>`).join('')}</div>`:'<p class="note">Sin deudas. Agrega una con los botones de abajo.</p>';
  $$('#dbtList [data-k]').forEach(x=>x.oninput=()=>{const i=+x.dataset.i,d=DBT.debts[i];d[x.dataset.k]=x.dataset.k==='n'?x.value:(x.value===''?null:+x.value);saveDebt();const pg=$('#dPg'+i);if(pg)pg.innerHTML=dProg(d);dCalcSoon();});
  $$('#dbtList [data-x]').forEach(x=>x.onclick=()=>{DBT.debts.splice(+x.dataset.x,1);saveDebt();dList();dCalc();});}
let dT=0;const dCalcSoon=()=>{clearTimeout(dT);dT=setTimeout(dCalc,250);};
function dCalc(){const out=$('#dOut');if(!out)return;const D=DBT.debts.filter(d=>d.b>0);
  if(!D.length){out.innerHTML=`<div class="panel coempty"><h3>Sin deudas</h3><p class="note">Todo lo que puedas destinar va directo a invertir. Revisa tus metas en la sección Metas.</p></div>`;return;}
  const tot=D.reduce((a,d)=>a+ +d.b,0),mins=D.reduce((a,d)=>a+ +d.m,0),wr=D.reduce((a,d)=>a+d.b*d.r,0)/tot,surplus=DBT.inc-DBT.exp-mins,dti=DBT.inc?mins/DBT.inc:0,R=GPROF[DBT.risk];
  const bad=D.filter(d=>d.b*mr(d.r)>=d.m-.01);
  const S={aval:dSim('aval'),snow:dSim('snow'),inv:dSim('inv'),mix:dSim('mix')};
  const H=Math.min(480,Math.max(24,...Object.values(S).map(s=>s.payoff||480))+24);const nwAt=s=>s.nw[Math.min(s.nw.length,H)-1];
  const NAMES={aval:['Avalancha','Pagas primero la deuda con la tasa más alta y luego inviertes todo.'],snow:['Bola de nieve','Pagas primero la deuda más pequeña (motivación rápida) y luego inviertes.'],inv:['Invertir primero','Pagas solo mínimos e inviertes el resto; liquidas las deudas cuando tu inversión alcanza para cubrirlas.'],mix:['Mitad y mitad','La mitad del extra a deudas y la mitad a inversión.']};
  const valid=Object.entries(S).filter(([,s])=>s.payoff);const best=valid.sort((a,b)=>nwAt(b[1])-nwAt(a[1]))[0];const fastest=[...valid].sort((a,b)=>a[1].payoff-b[1].payoff)[0];
  const mc=dMC();
  const ok=(t,c)=>`<div class="fk"><small>${t[0]}</small><b ${c?`style="color:var(${c})"`:''}>${t[1]}</b><span>${t[2]}</span></div>`;
  const DP=D.filter(d=>+d.p>0),capT=DP.reduce((a,d)=>a+ +d.p,0),capPaid=DP.reduce((a,d)=>a+Math.max(0,d.p-d.b),0);
  out.innerHTML=`<div class="fkg">${ok(['Deuda total',dm(tot),`${D.length} deuda${D.length>1?'s':''} · tasa promedio ${wr.toFixed(1)}% TEA`])}${capT?ok(['Capital ya pagado',dm(capPaid),`${pctF(capPaid/capT,0)} de ${dm(capT)} prestados`],'--up'):''}${ok(['Pagos mínimos al mes',dm(mins),`${pctF(dti,0)} de tu ingreso`],dti>.43?'--down':dti>.36?'--gold':null)}${ok(['Te sobra cada mes',dm(surplus),`Ingreso − gastos − mínimos`],surplus<DBT.ext?'--down':'--up')}${ok(['Más rápido libre de deudas',fastest?yrsM(fastest[1].payoff):'—',fastest?`${NAMES[fastest[0]][0]} · ${whenM(fastest[1].payoff)}`:'Con estos pagos no terminas'],'--up')}</div>
    ${surplus<DBT.ext?`<p class="autherr">Tu monto mensual extra (${dm(DBT.ext)}) es mayor a lo que te sobra (${dm(surplus)}). Ajusta tus gastos o el monto.</p>`:''}
    ${bad.length?`<p class="autherr">El pago mínimo de ${bad.map(d=>esc(d.n)).join(', ')} no cubre los intereses: esa deuda crece cada mes aunque pagues.</p>`:''}
    <div class="dstrat">${Object.entries(S).map(([k,s])=>`<div class="dsc ${best&&best[0]===k?'best':''}">${best&&best[0]===k?'<span class="dbest">Mejor resultado</span>':''}<h4>${NAMES[k][0]}</h4><p class="note">${NAMES[k][1]}</p>
      <div class="drows"><div><span>Libre de deudas en</span><b>${s.payoff?yrsM(s.payoff):'Más de 50 años'}</b></div><div><span>Fecha</span><b>${s.payoff?whenM(s.payoff):'—'}</b></div><div><span>Intereses pagados</span><b style="color:var(--down)">${dm(s.interest)}</b></div><div><span>Patrimonio en ${yrsM(H)}</span><b style="color:var(${nwAt(s)>=0?'--up':'--down'})">${dm(nwAt(s))}</b></div></div></div>`).join('')}</div>
    <div class="panel"><h4>Tu patrimonio neto mes a mes (inversiones menos deudas)</h4><div class="fachart" id="dCh"></div></div>
    <div class="dkcols"><div class="panel"><h4>Invirtiendo: cuándo podrías pagar todo</h4><p class="note">Si inviertes y pagas solo mínimos, tu inversión alcanzaría para liquidar todas tus deudas en:</p>
        <div class="fkg"><div class="fk"><small>Escenario central</small><b>${mc.p50<9999?yrsM(mc.p50):'—'}</b><span>${mc.p50<9999?whenM(mc.p50):'No alcanza'}</span></div><div class="fk"><small>Buen mercado</small><b>${mc.p10<9999?yrsM(mc.p10):'—'}</b><span>1 de cada 10 escenarios, antes</span></div><div class="fk"><small>Mal mercado</small><b>${mc.p90<9999?yrsM(mc.p90):'Más de 50 años'}</b><span>1 de cada 10 escenarios, después</span></div></div>
        <p class="note">Calculado con 400 escenarios de mercado al ${pctF(R.r)} anual esperado y ${pctF(R.v,0)} de volatilidad (perfil ${DBT.risk}).</p></div>
      <div class="panel"><h4>Orden de pago recomendado</h4><ol class="dord">${S.aval.order.map(d=>`<li><b>${esc(d.n)}</b><span>${d.r}% TEA · debes ${dm(d.b)}${+d.p>0&&d.p>=d.b?` de ${dm(d.p)} (${pctF((d.p-d.b)/d.p,0)} pagado)`:''} · libre en ${d.paidAt?whenM(d.paidAt):'—'}</span></li>`).join('')}</ol></div></div>
    <div class="panel"><h4>Qué conviene en tu caso</h4><ul class="idwhy">${dAdvice(D,R,S,best,surplus,dti).map(([w,t])=>`<li class="${w?'w':''}">${t}</li>`).join('')}</ul>
      <p class="disc">Simulación educativa con pagos mensuales y tasas fijas. Las inversiones pueden perder valor y vender para pagar deudas puede generar impuestos o comisiones. Las tasas de tarjetas en Perú suelen superar el 40% TEA: consulta tu cronograma real con tu banco.</p></div>`;
  dChart(S,H);anim('#dOut .dsc',{y:18,opacity:0},{y:0,opacity:1,duration:.5,stagger:.06,ease:'expo.out',clearProps:'transform,opacity'});}
function dAdvice(D,R,S,best,surplus,dti){const a=[],mx=D.reduce((m,d)=>d.r>m.r?d:m,D[0]),ret=R.r*100;
  if(mx.r>ret+2)a.push([0,`Tu deuda más cara (${esc(mx.n)}) cuesta ${mx.r}% al año y tu inversión rendiría alrededor de ${ret.toFixed(1)}%. Pagarla es como ganar ${mx.r}% seguro: va primero.`]);
  else a.push([0,`Tus deudas cuestan menos de lo que esperas ganar invirtiendo (${ret.toFixed(1)}%). Invertir mientras pagas los mínimos puede darte más patrimonio, aunque con el riesgo del mercado.`]);
  if(best)a.push([0,`Con tus números, la estrategia que deja más patrimonio es <b>${{aval:'Avalancha',snow:'Bola de nieve',inv:'Invertir primero',mix:'Mitad y mitad'}[best[0]]}</b>.`]);
  const sv=S.snow.interest-S.aval.interest;if(sv>1)a.push([0,`Avalancha te ahorra ${dm(sv)} en intereses frente a Bola de nieve.`]);
  if(dti>.36)a.push([1,`Tus pagos mínimos son ${pctF(dti,0)} de tu ingreso. Los bancos consideran riesgoso pasar de 36%–40%: evita deuda nueva.`]);
  if(surplus<(DBT.exp*.1))a.push([1,'Tu margen mensual es muy ajustado. Antes de invertir, arma un fondo de emergencia de al menos 1 mes de gastos.']);
  a.push([0,`Una vez libre de deudas, destinar ese mismo pago mensual a invertir acelera tu patrimonio: es el efecto de "pagarte a ti mismo".`]);
  return a;}
function dChart(S,H){const el=$('#dCh');if(!el)return;const W=Math.max(320,Math.min(1100,el.clientWidth||700)),Ht=260,p={l:64,r:110,t:14,b:26},keys=['aval','snow','inv','mix'],cols={aval:'var(--up)',snow:'var(--gold)',inv:'var(--accent)',mix:'var(--ink3)'},nm={aval:'Avalancha',snow:'Bola de nieve',inv:'Invertir primero',mix:'Mitad y mitad'};
  const all=keys.flatMap(k=>S[k].nw.slice(0,H)),mx=Math.max(...all,1),mn=Math.min(...all,0),X=m=>p.l+m/(H-1)*(W-p.l-p.r),Y=v=>p.t+(mx-v)/((mx-mn)||1)*(Ht-p.t-p.b);
  let g='';for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4;g+=`<line class="ax" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v)+4}">${Math.abs(v)>=1e6?(v/1e6).toFixed(1)+' M':Math.round(v/1000)+' mil'}</text>`;}
  g+=`<line x1="${p.l}" x2="${W-p.r}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--ink)" stroke-width="1.2"/>`;
  const yrs=Math.ceil(H/12);for(let y=0;y<=yrs;y+=Math.max(1,Math.ceil(yrs/6)))g+=`<text x="${X(Math.min(H-1,y*12))}" y="${Ht-6}" text-anchor="middle">${(()=>{const d=new Date();d.setMonth(d.getMonth()+y*12);return d.toLocaleDateString('es-PE',{month:'short',year:'numeric'});})()}</text>`;
  const ends=keys.map(k=>({k,v:S[k].nw[Math.min(S[k].nw.length,H)-1]})).sort((a,b)=>b.v-a.v);let ly=-99;
  keys.forEach(k=>{const a=S[k].nw.slice(0,H);g+=`<path class="dl" stroke="${cols[k]}" d="${a.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join('')}"/>`;if(S[k].payoff&&S[k].payoff<H)g+=`<circle cx="${X(S[k].payoff-1)}" cy="${Y(a[S[k].payoff-1])}" r="4.5" fill="${cols[k]}" class="dpo"><title>${nm[k]}: libre de deudas en ${whenM(S[k].payoff)}</title></circle>`;});
  ends.forEach(e=>{let y=Y(e.v)+4;if(y-ly<14)y=ly+14;ly=y;g+=`<text x="${W-p.r+8}" y="${y}" fill="${cols[e.k]}" class="dle">${nm[e.k]}</text>`;});
  el.innerHTML=svgEl(W,Ht,g,'Patrimonio neto por estrategia')+`<div class="faleg">${keys.map(k=>`<span><i style="background:${cols[k]}"></i>${nm[k]}</span>`).join('')}<span><i style="background:var(--ink);border-radius:50%"></i>Punto = libre de deudas</span></div>`;
  if(window.gsap&&!RM){$$('#dCh .dl').forEach((pth,i)=>{const L=pth.getTotalLength();gsap.fromTo(pth,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.6,ease:'power2.inOut',delay:i*.1});});gsap.from('#dCh .dpo',{attr:{r:0},duration:.5,delay:1.4,stagger:.1,ease:'back.out(3)'});gsap.from('#dCh .dle',{opacity:0,x:-6,duration:.5,delay:1.3,stagger:.08});}}
const _sv21=setView;setView=function(v,o){_sv21(v,o);if(v==='debt')debtRender();};
{const v=ID2V[location.hash.slice(1)];if(v==='debt')setView('debt',{noHash:true});}
addEventListener('storage',e=>{if(e.key==='lc_debt'){DBT={...DB0,...(store.get('debt',{})||{})};if(VIEW==='debt')debtRender();}});
/* acceso directo desde la bienvenida */
{const q=$('#gQuick');if(q&&!q.querySelector('[data-debt]')){const b=document.createElement('button');b.className='gq';b.dataset.debt='1';b.innerHTML=`${ic('stop','',false)}<span><b>Salir de deudas</b><small>Cuándo quedas libre invirtiendo</small></span>`;b.onclick=()=>gateClose(()=>setView('debt'));q.prepend(b);}}
