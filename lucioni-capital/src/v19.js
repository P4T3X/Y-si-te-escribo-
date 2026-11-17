
/* ===================== V19: metas financieras, comparador y efectos ===================== */
/* ---------- metas: planificación por objetivos ---------- */
VIEWS.goals=['metas'];V2ID.goals='metas';ID2V.metas='goals';VTITLE.goals='Metas';
SYNC.push('goals');
let GOALS=store.get('goals',[]);if(!Array.isArray(GOALS))GOALS=[];
const saveGoals=()=>store.set('goals',GOALS);
const GPROF={conservador:{r:.045,v:.06,l:'Conservador (60% bonos)'},moderado:{r:.065,v:.11,l:'Moderado (60% acciones)'},agresivo:{r:.085,v:.16,l:'Agresivo (90% acciones)'}};
const GTPL=[['emergencia','Fondo de emergencia','stop',6000,1,'conservador'],['casa','Casa propia','buy',80000,7,'moderado'],['retiro','Retiro','compuesto',600000,30,'agresivo'],['educacion','Educación','cap',40000,10,'moderado'],['viaje','Viaje','target',8000,2,'conservador'],['otra','Meta personalizada','dividendo',20000,5,'moderado']];
const gIcon=c=>(GTPL.find(t=>t[0]===c)||GTPL[5])[2];
const gCur=g=>g.cur==='USD'?'$':'S/';
const gMoney=(g,v)=>`${gCur(g)} ${Math.round(v).toLocaleString('en-US')}`;
const INF=.025;
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function monthsTo(d){const t=new Date(d+'T00:00:00'),n=new Date();return Math.max(1,(t.getFullYear()-n.getFullYear())*12+(t.getMonth()-n.getMonth()));}
function gTarget(g){const yrs=monthsTo(g.date)/12;return g.real?g.target*Math.pow(1+INF,yrs):g.target;}
/* simulación mensual con rendimientos lognormales */
function gSim(g,opt={}){const M=opt.months||monthsTo(g.date),P=GPROF[g.risk]||GPROF.moderado,r=opt.r??P.r,v=opt.v??P.v,c=opt.c??g.monthly,N=opt.n||700,keep=opt.keep;
  const mu=Math.log(1+r)/12,s=v/Math.sqrt(12),R=rng(opt.seed||12345),fin=new Float64Array(N),T=opt.target??gTarget(g),step=Math.max(1,Math.round(M/40)),snaps=keep?[]:null;
  const cols=keep?Math.floor(M/step)+1:0,grid=keep?Array.from({length:cols},()=>new Float64Array(N)):null;
  const wd=opt.wd||null;let depl=0;const ruin=[];
  for(let i=0;i<N;i++){let x=g.saved,dead=false;if(keep)grid[0][i]=x;for(let m=1;m<=M;m++){const u1=R()||1e-9,u2=R(),z=Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2),gr=Math.exp(mu-s*s/2+s*z);
    /* fase de retiro (Retirement): desde wd.from se retira wd.amt cada mes; un camino que llega a cero queda agotado */
    if(wd&&m>wd.from){x=(x-wd.amt)*gr;if(x<=0){x=0;if(!dead){dead=true;depl++;ruin.push(m);}}}else x=(x+c)*gr;if(keep&&m%step===0)grid[m/step][i]=x;}fin[i]=x;}
  const sorted=Array.from(fin).sort((a,b)=>a-b),q=p=>sorted[Math.min(N-1,Math.floor(p*N))];
  const prob=sorted.filter(x=>x>=T).length/N;
  let bands=null;if(keep){bands=grid.map((col,k)=>{const s2=Array.from(col).sort((a,b)=>a-b),qq=p=>s2[Math.min(N-1,Math.floor(p*N))];return {m:k*step,p10:qq(.1),p50:qq(.5),p90:qq(.9)};});}
  ruin.sort((a,b)=>a-b);
  return {prob,p10:q(.1),p50:q(.5),p90:q(.9),T,M,bands,depl:depl/N,ruinP10:ruin.length?ruin[Math.floor(.1*ruin.length)]:null};}
function gNeeded(g,target=.8){let lo=0,hi=Math.max(gTarget(g)/monthsTo(g.date),1);for(let k=0;k<4&&gSim(g,{c:hi,n:300}).prob<target;k++)hi*=2;
  for(let k=0;k<16;k++){const m=(lo+hi)/2;if(gSim(g,{c:m,n:300}).prob>=target)hi=m;else lo=m;}return hi;}
function gDet(g,c=g.monthly){const M=monthsTo(g.date),r=Math.pow(1+GPROF[g.risk].r,1/12)-1;let x=g.saved;const path=[x];for(let m=1;m<=M;m++){x=(x+c)*(1+r);path.push(x);}return path;}
function gStatus(p){return p>=.8?['ok','En camino']:p>=.5?['mid','En riesgo']:['bad','Fuera de ruta'];}

{const sec=$('#metas');const b=document.createElement('div');b.className='backbar';b.innerHTML=`<button class="backb" aria-label="Volver al inicio">${ic('right','',false)}<span>Inicio</span></button><span class="crumb">Metas</span>`;sec.prepend(b);b.querySelector('button').onclick=()=>setView('inicio');}
['#nav','#nav2'].forEach(n=>{const ref=$(n+' a[data-p="port"]');if(!ref)return;const a=document.createElement('a');a.href='#metas';a.dataset.p='goals';a.textContent='Metas';a.addEventListener('click',e=>{e.preventDefault();setView('goals');});ref.after(a);});
$$('#hub .htile[data-v="goals"]').forEach(t=>t.addEventListener('click',()=>setView('goals')));
{const col=$('#menu .mcol');if(col){const b=document.createElement('button');b.className='mi2';b.setAttribute('role','menuitem');b.innerHTML=`${ic('target','',false)}<span>Metas financieras<small>Probabilidad de lograr cada objetivo</small></span>`;b.onclick=()=>{closeMenu();setView('goals');};const f=col.querySelector('.mi2');f?f.after(b):col.appendChild(b);}}

function goalsRender(){const box=$('#gWrap');if(!box)return;
  const st=GOALS.map(g=>({g,s:gSim(g)}));const tot=GOALS.reduce((a,g)=>a+(g.cur==='USD'?g.saved*(FXD.rate||3.75):g.saved),0),mon=GOALS.reduce((a,g)=>a+(g.cur==='USD'?g.monthly*(FXD.rate||3.75):g.monthly),0);
  const onT=st.filter(x=>x.s.prob>=.8).length;
  box.innerHTML=`<div class="pfkpis"><div class="pfk"><small>Ahorrado en tus metas</small><b>S/ ${Math.round(tot).toLocaleString('en-US')}</b><span>${GOALS.length} meta${GOALS.length===1?'':'s'} · dólares convertidos a S/ ${(FXD.rate||3.75).toFixed(2)}</span></div>
      <div class="pfk"><small>Aporte mensual total</small><b>S/ ${Math.round(mon).toLocaleString('en-US')}</b><span>Lo que destinas cada mes</span></div>
      <div class="pfk"><small>Metas en camino</small><b style="color:var(${onT===GOALS.length&&GOALS.length?'--up':'--ink'})">${onT} de ${GOALS.length}</b><span>Con 80% o más de probabilidad</span></div>
      <div class="pfk"><small>Supuestos</small><b style="font-size:18px">Inflación ${(INF*100).toFixed(1)}%</b><span>Rendimientos según perfil, después de costos</span></div></div>
    <div class="ggrid">${st.map(({g,s},i)=>gCard(g,s,i)).join('')}<button class="gnew" id="gNewB"><span>${ic('target','',false)}</span><b>Nueva meta</b><small>Fondo de emergencia, casa, retiro, educación…</small></button></div>
    <details class="panel idhow"><summary>Cómo calculamos la probabilidad ${ic('right','',false)}</summary><p class="note" style="margin-top:10px">Simulamos 700 escenarios de mercado mes a mes con rendimientos aleatorios (distribución lognormal) según el perfil de riesgo de cada meta: conservador ${pctF(GPROF.conservador.r)} anual con volatilidad ${pctF(GPROF.conservador.v,0)}, moderado ${pctF(GPROF.moderado.r)} con ${pctF(GPROF.moderado.v,0)}, agresivo ${pctF(GPROF.agresivo.r)} con ${pctF(GPROF.agresivo.v,0)}. La probabilidad es el porcentaje de escenarios que alcanzan el monto objetivo en la fecha. Si eliges "en soles de hoy", el objetivo se ajusta por una inflación de ${(INF*100).toFixed(1)}% anual (meta del BCRP: 1%–3%).</p>
      <p class="disc">Proyección educativa basada en supuestos; los mercados pueden rendir menos de lo esperado durante muchos años. Para metas de menos de 3 años suele ser prudente un perfil conservador.</p></details>`;
  $('#gNewB').onclick=()=>{if(!member()&&GOALS.length>=1){toast('Crea tu cuenta gratis para tener más de una meta',ic('hello','',false));openAccount();return;}gEdit();};
  $$('#gWrap .gcard').forEach(c=>c.onclick=()=>gDetail(+c.dataset.i));
  const cards=$$('#gWrap .gcard');if(window.gsap&&!RM)gsap.fromTo(cards,{y:24,opacity:0},{y:0,opacity:1,duration:.6,ease:'expo.out',stagger:.06,clearProps:'transform,opacity'});
  cards.forEach(c=>{const fg=c.querySelector('.fg'),n=c.querySelector('.gpct');if(window.gsap&&!RM){gsap.to(fg,{attr:{'stroke-dashoffset':fg.dataset.o},duration:1.3,ease:'expo.out',delay:.2});countUp(n,+n.dataset.v,v=>Math.round(v)+'%');}else{fg.setAttribute('stroke-dashoffset',fg.dataset.o);n.textContent=n.dataset.v+'%';}
    const pth=c.querySelector('.gsp path.p');if(pth&&window.gsap&&!RM&&pth.getTotalLength){const L=pth.getTotalLength();gsap.fromTo(pth,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.4,ease:'power2.inOut',delay:.3});}});}
function gCard(g,s,i){const T=gTarget(g),pr=Math.min(1,g.saved/T),C=2*Math.PI*30,[k,l]=gStatus(s.prob),path=gDet(g),W=220,H=50,mx=Math.max(T,path.at(-1))*1.05,X=m=>m/(path.length-1)*W,Y=v=>H-v/mx*H;
  const step=Math.max(1,Math.floor(path.length/50)),d=path.filter((_,m)=>m%step===0||m===path.length-1).map((v,j,a)=>(j?'L':'M')+X(j*(path.length-1)/(a.length-1)).toFixed(1)+' '+Y(v).toFixed(1)).join('');
  return `<button class="gcard" data-i="${i}"><div class="gch"><span class="gic">${ic(gIcon(g.cat),'',false)}</span><span class="gnm"><b>${esc(g.name)}</b><small>${new Date(g.date+'T00:00:00').toLocaleDateString('es-PE',{month:'long',year:'numeric'})} · ${GPROF[g.risk].l.split(' ')[0]}</small></span><span class="gst ${k}">${l}</span></div>
    <div class="gmid"><div class="gring"><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" class="bg"/><circle cx="36" cy="36" r="30" class="fg" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" data-o="${(C*(1-s.prob)).toFixed(1)}" style="stroke:var(--${k==='ok'?'up':k==='mid'?'gold':'down'})"/></svg><span class="gpct" data-v="${Math.round(s.prob*100)}">0%</span><small>probabilidad</small></div>
      <div class="gnums"><div><small>Ahorrado</small><b>${gMoney(g,g.saved)}</b></div><div><small>${g.real?'Objetivo ajustado':'Objetivo'}</small><b>${gMoney(g,T)}</b></div><div><small>Aporte mensual</small><b>${gMoney(g,g.monthly)}</b></div></div></div>
    <div class="gbar"><i style="width:${(pr*100).toFixed(1)}%"></i></div><div class="gbl"><span>${(pr*100).toFixed(0)}% reunido</span><span>Escenario central: ${gMoney(g,s.p50)}</span></div>
    <svg class="gsp" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><line x1="0" x2="${W}" y1="${Y(T)}" y2="${Y(T)}" class="t"/><path class="p" d="${d}"/></svg></button>`;}
function gEdit(i){const g=i!=null?GOALS[i]:null;const tpl=g?null:GTPL[0];
  const dd=y=>{const d=new Date();d.setFullYear(d.getFullYear()+y);return d.toISOString().slice(0,10);};
  openSheet(`<div class="stepin"><h3 style="font-size:24px;margin-top:6px">${g?'Editar meta':'Nueva meta'}</h3>
    ${g?'':`<div class="gtpl" id="gTpl">${GTPL.map((t,k)=>`<button type="button" data-k="${k}" class="${k?'':'act'}">${ic(t[2],'',false)}<span>${t[1]}</span></button>`).join('')}</div>`}
    <form id="gF" novalidate><label class="l" for="gN">Nombre</label><input class="f" id="gN" maxlength="40" value="${esc(g?g.name:tpl[1])}">
      <div class="dcfn"><div><label class="l" for="gT">Monto objetivo</label><input class="f" id="gT" type="number" min="0" step="any" value="${g?g.target:tpl[3]}"></div><div><label class="l" for="gD">Fecha objetivo</label><input class="f" id="gD" type="date" value="${g?g.date:dd(tpl[4])}"></div>
      <div><label class="l" for="gS">Ya tengo ahorrado</label><input class="f" id="gS" type="number" min="0" step="any" value="${g?g.saved:0}"></div><div><label class="l" for="gM">Aporte mensual</label><input class="f" id="gM" type="number" min="0" step="any" value="${g?g.monthly:Math.round(tpl[3]/(tpl[4]*12))}"></div></div>
      <label class="l">Moneda</label><div class="seg" id="gC"><button type="button" data-v="PEN" class="${!g||g.cur!=='USD'?'act':''}">Soles (S/)</button><button type="button" data-v="USD" class="${g&&g.cur==='USD'?'act':''}">Dólares ($)</button></div>
      <label class="l">Cómo invertirás este dinero</label><div class="seg" id="gR">${Object.entries(GPROF).map(([k2,p])=>`<button type="button" data-v="${k2}" class="${(g?g.risk:tpl[5])===k2?'act':''}">${p.l.split(' (')[0]}</button>`).join('')}</div>
      <label class="chk"><input type="checkbox" id="gI" ${g&&g.real?'checked':''}> El monto es en dinero de hoy (ajustar por inflación)</label>
      <p class="autherr hidden" id="gE"></p>
      <button class="cta" type="submit" style="width:100%;justify-content:center;margin-top:16px">${g?'Guardar cambios':'Crear meta'}</button></form></div>`);
  const segs=id=>$$(id+' button').forEach(b=>b.onclick=()=>$$(id+' button').forEach(x=>x.classList.toggle('act',x===b)));segs('#gC');segs('#gR');
  $$('#gTpl button').forEach(b=>b.onclick=()=>{$$('#gTpl button').forEach(x=>x.classList.toggle('act',x===b));const t=GTPL[+b.dataset.k];$('#gN').value=t[1];$('#gT').value=t[3];$('#gD').value=dd(t[4]);$('#gM').value=Math.round(t[3]/(t[4]*12));$$('#gR button').forEach(x=>x.classList.toggle('act',x.dataset.v===t[5]));});
  $('#gF').onsubmit=e=>{e.preventDefault();const v=id=>parseFloat($(id).value),err=t=>{$('#gE').textContent=t;$('#gE').classList.remove('hidden');};
    const o={name:$('#gN').value.trim()||'Mi meta',target:v('#gT'),date:$('#gD').value,saved:v('#gS')||0,monthly:v('#gM')||0,cur:$('#gC .act').dataset.v,risk:$('#gR .act').dataset.v,real:$('#gI').checked,cat:g?g.cat:GTPL[+(($('#gTpl .act')||{}).dataset?.k||5)][0],log:g?g.log:[],at:g?g.at:Date.now()};
    if(!(o.target>0))return err('Indica el monto objetivo.');if(!o.date||new Date(o.date)<=new Date())return err('La fecha objetivo debe ser futura.');
    if(g)GOALS[i]=o;else GOALS.push(o);saveGoals();closeSheet();goalsRender();toast(g?'Meta actualizada':'Meta creada',ic('check','',false));if(!g)addXP&&addXP(10);};}
function gDetail(i){const g=GOALS[i];if(!g)return;
  openSheet(`<div class="stepin"><div class="gdh"><span class="gic big">${ic(gIcon(g.cat),'',false)}</span><div><h3 style="font-size:24px">${esc(g.name)}</h3><p class="note" style="margin:0">${gMoney(g,gTarget(g))} para ${new Date(g.date+'T00:00:00').toLocaleDateString('es-PE',{month:'long',year:'numeric'})} · ${GPROF[g.risk].l}</p></div></div>
    <div class="fkg" id="gdK"></div><div class="fachart" id="gdC"></div>
    <h4 style="margin:6px 0 4px">¿Y si cambio algo?</h4><p class="note">Mueve los controles para ver el efecto en la probabilidad. No se guardan hasta que toques "Aplicar".</p>
    <div class="dcfs"><label class="l" for="wC">Aporte mensual <b id="wCv"></b></label><input type="range" id="wC" min="0" max="${Math.max(100,Math.round(g.monthly*3+gTarget(g)/monthsTo(g.date)))}" step="10" value="${g.monthly}"></div>
    <div class="dcfs"><label class="l" for="wY">Meses adicionales <b id="wYv"></b></label><input type="range" id="wY" min="0" max="120" step="6" value="0"></div>
    <div class="dcfs"><label class="l" for="wR">Rendimiento anual esperado <b id="wRv"></b></label><input type="range" id="wR" min="1" max="12" step=".5" value="${(GPROF[g.risk].r*100).toFixed(1)}"></div>
    <div class="acts"><button class="btn solid" id="wApply">Aplicar aporte</button><button class="btn" id="gAdd">Registrar aporte</button><button class="btn" id="gEd">Editar meta</button><button class="btn red" id="gDel">Eliminar</button></div>
    <div id="gLog"></div>
    <p class="disc">Proyección basada en 700 escenarios simulados. No es una garantía de resultados.</p></div>`);
  const draw=first=>{const c=+$('#wC').value,ex=+$('#wY').value,r=+$('#wR').value/100,M=monthsTo(g.date)+ex,T=g.real?g.target*Math.pow(1+INF,M/12):g.target;
    $('#wCv').textContent=gMoney(g,c);$('#wYv').textContent=ex?`+${ex} (${(ex/12).toFixed(1)} años)`:'Ninguno';$('#wRv').textContent=(r*100).toFixed(1)+'%';
    const s=gSim(g,{c,months:M,r,target:T,keep:true}),[k,l]=gStatus(s.prob),need=gNeeded({...g,date:new Date(Date.now()+M*30.44*864e5).toISOString().slice(0,10)},.8);
    $('#gdK').innerHTML=`<div class="fk"><small>Probabilidad</small><b style="color:var(--${k==='ok'?'up':k==='mid'?'gold':'down'})">${Math.round(s.prob*100)}%</b><span>${l}</span></div><div class="fk"><small>Escenario central</small><b>${gMoney(g,s.p50)}</b><span>Rango probable ${gMoney(g,s.p10)} – ${gMoney(g,s.p90)}</span></div>
      <div class="fk"><small>Aporte para 80%</small><b>${gMoney(g,need)}</b><span>al mes${need>c?`, ${gMoney(g,need-c)} más que ahora`:', ya lo cubres'}</span></div><div class="fk"><small>Plazo</small><b>${(M/12).toFixed(1)} años</b><span>${M} aportes mensuales</span></div>`;
    const B=s.bands,W=Math.max(320,($('#gdC').clientWidth||520)),H=230,p={l:56,r:12,t:12,b:24},mx=Math.max(T*1.1,B.at(-1).p90),X=m=>p.l+m/M*(W-p.l-p.r),Y=v=>p.t+(1-Math.min(v,mx)/mx)*(H-p.t-p.b);
    const area=B.map(b=>`${X(b.m).toFixed(1)},${Y(b.p90).toFixed(1)}`).join(' ')+' '+[...B].reverse().map(b=>`${X(b.m).toFixed(1)},${Y(b.p10).toFixed(1)}`).join(' ');
    let gg='';for(let q=0;q<=4;q++){const v=mx*q/4;gg+=`<line class="ax" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v)+4}">${v>=1e6?(v/1e6).toFixed(1)+' M':Math.round(v/1000)+' mil'}</text>`;}
    const yrs=Math.ceil(M/12);for(let y=0;y<=yrs;y+=Math.max(1,Math.ceil(yrs/6)))gg+=`<text x="${X(Math.min(M,y*12))}" y="${H-6}" text-anchor="middle">${new Date().getFullYear()+y}</text>`;
    gg+=`<polygon points="${area}" class="fan"/><path class="med" d="${B.map((b,j)=>(j?'L':'M')+X(b.m).toFixed(1)+' '+Y(b.p50).toFixed(1)).join('')}"/><line class="tgt" x1="${p.l}" x2="${W-p.r}" y1="${Y(T)}" y2="${Y(T)}"/><text class="tl" x="${W-p.r}" y="${Y(T)-6}" text-anchor="end">Objetivo ${gMoney(g,T)}</text>`;
    $('#gdC').innerHTML=svgEl(W,H,gg,'Proyección de la meta con rango probable')+`<div class="faleg"><span><i style="background:color-mix(in srgb,var(--accent) 22%,transparent)"></i>Rango probable (80% de escenarios)</span><span><i style="background:var(--accent)"></i>Escenario central</span><span><i class="dash"></i>Objetivo</span></div>`;
    if(first&&window.gsap&&!RM){const m2=$('#gdC .med');if(m2.getTotalLength){const L=m2.getTotalLength();gsap.fromTo(m2,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.4,ease:'power2.inOut'});}gsap.from('#gdC .fan',{opacity:0,duration:1.2,delay:.3});}};
  let tq=0;['#wC','#wY','#wR'].forEach(id=>$(id).addEventListener('input',()=>{cancelAnimationFrame(tq);tq=requestAnimationFrame(()=>draw(false));}));draw(true);
  const logR=()=>{const L=(g.log||[]).slice(-6).reverse();$('#gLog').innerHTML=L.length?`<h4 style="margin:14px 0 6px">Últimos aportes</h4><div class="tblw"><table class="ftbl"><tbody>${L.map(x=>`<tr><td>${new Date(x.t).toLocaleDateString('es-PE',{day:'numeric',month:'short',year:'numeric'})}</td><td style="text-align:right">${x.a>=0?'+':''}${gMoney(g,x.a)}</td></tr>`).join('')}</tbody></table></div>`:'';};logR();
  $('#wApply').onclick=()=>{g.monthly=+$('#wC').value;saveGoals();goalsRender();toast('Aporte mensual actualizado',ic('check','',false));};
  $('#gEd').onclick=()=>gEdit(i);
  $('#gDel').onclick=e=>{const b=e.currentTarget;if(!b._a){b._a=1;b.textContent='Toca otra vez para eliminar';setTimeout(()=>{b._a=0;b.textContent='Eliminar';},2500);return;}GOALS.splice(i,1);saveGoals();closeSheet();goalsRender();};
  $('#gAdd').onclick=()=>{if($('#gAr')){$('#gAv').focus();return;}$('#gLog').insertAdjacentHTML('beforebegin',`<form class="gaddrow" id="gAr"><label class="l" for="gAv">Monto del aporte (${gCur(g)}). Usa un número negativo para un retiro.</label><div><input class="f" id="gAv" type="number" step="any" value="${g.monthly||''}"><button class="cta" type="submit">Registrar</button></div></form>`);$('#gAv').focus();
    $('#gAr').onsubmit=ev=>{ev.preventDefault();const v=parseFloat($('#gAv').value);if(!isFinite(v)||!v)return;$('#gAr').remove();const before=g.saved/gTarget(g);g.saved=Math.max(0,g.saved+v);(g.log=g.log||[]).push({t:Date.now(),a:v});saveGoals();goalsRender();draw(false);logR();
    const after=g.saved/gTarget(g);const ms=[.25,.5,.75,1].find(x=>before<x&&after>=x);if(ms){FX.burst(innerWidth/2,innerHeight*.4,ms===1?140:70);SFX.lvl&&SFX.lvl();toast(ms===1?`¡Meta "${g.name}" alcanzada!`:`Llegaste al ${ms*100}% de "${g.name}"`,ic('trophy','',false));}else toast('Aporte registrado',ic('check','',false));};};}
const _sv19=setView;setView=function(v,o){_sv19(v,o);if(v==='goals')goalsRender();};
{const v=ID2V[location.hash.slice(1)];if(v==='goals')setView('goals',{noHash:true});}
addEventListener('storage',e=>{if(e.key==='lc_goals'){GOALS=store.get('goals',[]);if(VIEW==='goals')goalsRender();}});

/* ---------- comparador de rendimiento ---------- */
TOOLS.push('perf');LOCKS['tool:perf']=['Comparador de rendimiento','Compara hasta 5 acciones o ETF en los últimos 12 meses: rendimiento, volatilidad, Sharpe, caída máxima y correlación.'];
{const ref=$('#tnav button[data-t="dcf"]');if(ref){const a=document.createElement('button');a.dataset.t='perf';a.textContent='Comparar rendimiento';ref.after(a);a.onclick=()=>tool('perf');}}
let PERF=['SPY','AAPL','MSFT'];
function perfChips(){$('#prChips').innerHTML=PERF.map((s,i)=>`<span class="pchip" style="--c:${COLORS[i%COLORS.length]}"><i></i>${esc(s)}<button aria-label="Quitar ${esc(s)}" data-s="${esc(s)}">×</button></span>`).join('');
  $$('#prChips button').forEach(b=>b.onclick=()=>{PERF=PERF.filter(x=>x!==b.dataset.s);perfChips();perfRun();});}
async function perfRun(){const out=$('#prOut');if(!MKT){out.innerHTML='<p class="note">Disponible en la versión web, que tiene acceso a datos de mercado.</p>';return;}if(!PERF.length){out.innerHTML='<p class="note">Agrega al menos un símbolo.</p>';return;}
  out.innerHTML='<div class="idskel" style="height:260px"></div>';
  try{const D={};for(const s of PERF){try{D[s]=await h1y(s);}catch(e){D[s]=[];}}const ok=PERF.filter(s=>D[s].length>60);if(!ok.length)throw 0;
    const base=D[ok[0]].map(p=>new Date(p[0]).toISOString().slice(0,10));const al=s=>{const m=new Map(D[s].map(p=>[new Date(p[0]).toISOString().slice(0,10),p[1]]));let l=null;return base.map(d=>{if(m.has(d))l=m.get(d);return l;});};
    let start=0;const A=ok.map(al);while(start<base.length&&A.some(a=>a[start]==null))start++;
    const S=ok.map((s,i)=>{const c=A[i].slice(start),r=c.slice(1).map((v,t)=>v/c[t]-1),n=r.length,cum=c.map(v=>v/c[0]*100);let pk=0,dd=0;cum.forEach(v=>{pk=Math.max(pk,v);dd=Math.min(dd,v/pk-1);});const vol=sd(r)*Math.sqrt(252),ann=Math.pow(cum.at(-1)/100,252/n)-1;return {s,r,cum,ret:cum.at(-1)/100-1,vol,sh:(ann-.04)/vol,dd,col:COLORS[PERF.indexOf(s)%COLORS.length]};});
    const W=Math.max(340,Math.min(1100,out.clientWidth||700)),H=260,p={l:40,r:90,t:12,b:24},all=S.flatMap(x=>x.cum),mx=Math.max(...all),mn=Math.min(...all),N=S[0].cum.length,X=t=>p.l+t/(N-1)*(W-p.l-p.r),Y=v=>p.t+(mx-v)/((mx-mn)||1)*(H-p.t-p.b);
    let g='';for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4;g+=`<line class="ax" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v)+4}">${v.toFixed(0)}</text>`;}
    S.forEach(x=>{g+=`<path class="pl2" stroke="${x.col}" d="${x.cum.map((v,t)=>(t?'L':'M')+X(t).toFixed(1)+' '+Y(v).toFixed(1)).join('')}"/><text x="${W-p.r+6}" y="${Y(x.cum.at(-1))+4}" fill="${x.col}" class="pe2">${esc(x.s)} ${x.ret>=0?'+':''}${(x.ret*100).toFixed(1)}%</text>`;});
    const corr=(a,b)=>cov(a,b)/(sd(a)*sd(b));const spy=S.find(x=>x.s==='SPY');
    out.innerHTML=`<div class="fachart">${svgEl(W,H,g,'Rendimiento comparado, base 100')}</div>
      <div class="tblw"><table class="ftbl"><thead><tr><th>Símbolo</th><th>Rendimiento 12 m</th><th>Volatilidad anual</th><th>Sharpe</th><th>Caída máxima</th>${spy?'<th>Beta vs S&amp;P 500</th>':''}</tr></thead><tbody>${S.map(x=>`<tr><td><b style="color:${x.col}">${esc(x.s)}</b></td><td class="${x.ret>=0?'u':'d'}">${pctF(x.ret)}</td><td>${pctF(x.vol)}</td><td>${x.sh.toFixed(2)}</td><td class="d">${pctF(x.dd)}</td>${spy?`<td>${(cov(x.r,spy.r)/(sd(spy.r)**2)).toFixed(2)}</td>`:''}</tr>`).join('')}</tbody></table></div>
      ${S.length>1?`<h4 style="margin:10px 0 6px">Correlación</h4><div class="tblw"><table class="corr"><thead><tr><th></th>${S.map(x=>`<th>${esc(x.s)}</th>`).join('')}</tr></thead><tbody>${S.map(a=>`<tr><th>${esc(a.s)}</th>${S.map(b=>{const v=corr(a.r,b.r);return `<td style="background:color-mix(in srgb,var(${v>=0?'--accent':'--up'}) ${Math.round(Math.abs(v)*70)}%,transparent);color:${Math.abs(v)>.6?'var(--paper)':'var(--ink)'}">${v.toFixed(2)}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`:''}
      ${PERF.length>ok.length?`<p class="note">Sin datos suficientes: ${PERF.filter(s=>!ok.includes(s)).join(', ')}.</p>`:''}
      <p class="disc">Precios de cierre diarios de los últimos 12 meses, sin dividendos reinvertidos. Sharpe con tasa libre de riesgo de 4%.</p>`;
    if(window.gsap&&!RM){$$('#prOut .pl2').forEach((pth,i)=>{const L=pth.getTotalLength();gsap.fromTo(pth,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.5,ease:'power2.inOut',delay:i*.12});});gsap.from('#prOut .pe2',{opacity:0,x:-6,duration:.5,delay:1.2,stagger:.08});}}
  catch(e){out.innerHTML='<p class="note">No se pudieron cargar los precios. Intenta de nuevo en un momento.</p>';}}
$('#prF').onsubmit=e=>{e.preventDefault();const s=$('#prS').value.trim().toUpperCase().split(/[\s,·]/)[0];if(!/^[A-Z.\-]{1,10}$/.test(s))return;if(PERF.includes(s)){$('#prS').value='';return;}if(PERF.length>=5){toast('Máximo 5 símbolos');return;}PERF.push(s);$('#prS').value='';perfChips();perfRun();};
const _tool19=tool;tool=function(t){_tool19(t);if(t==='perf'){perfChips();if(!$('#prOut').dataset.done){$('#prOut').dataset.done=1;perfRun();}}};

/* ---------- efectos ---------- */
const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
/* luz que sigue al cursor en tarjetas y paneles */
if(FINE&&!RM)document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.panel,.idc,.gcard,.pfk,.fk,.htile,.corow');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');},{passive:true});
/* botones magnéticos */
if(FINE&&!RM)document.addEventListener('pointermove',e=>{const b=e.target.closest&&e.target.closest('.cta');$$('.cta.mag').forEach(x=>{if(x!==b){x.classList.remove('mag');x.style.transform='';}});if(!b)return;const r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);b.classList.add('mag');b.style.transform=`translate(${(dx*.18).toFixed(1)}px,${(dy*.25).toFixed(1)}px)`;},{passive:true});
/* onda al tocar botones */
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.btn,.cta,.seg button,.idtabs button');if(!b||RM)return;const r=b.getBoundingClientRect(),d=document.createElement('span');d.className='rip2';const s=Math.max(r.width,r.height)*2;d.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;b.appendChild(d);setTimeout(()=>d.remove(),650);},{passive:true});
/* aparición al hacer scroll */
const revIO='IntersectionObserver' in window&&!RM?new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('rv-in');revIO.unobserve(en.target);}}),{rootMargin:'0px 0px -8% 0px'}):null;
function revealScan(){if(!revIO)return;$$('section:not(.vhide) .panel:not(.rv), section:not(.vhide) .tblw:not(.rv), .footer-lockup:not(.rv)').forEach(el=>{if(el.closest('#sheet')||el.getBoundingClientRect().top<innerHeight*.9)return;el.classList.add('rv');revIO.observe(el);});}
const _sv19b=setView;setView=function(v,o){_sv19b(v,o);setTimeout(revealScan,600);};
setTimeout(revealScan,1200);
/* barra de progreso superior para cargas de datos */
{const bar=document.createElement('div');bar.className='topbar2';document.body.appendChild(bar);let n=0,t=0;const _f=window.fetch.bind(window);
 window.fetch=function(u,o){const track=typeof u==='string'&&(u.startsWith('/api/')||(MKT&&u.startsWith(MKT)));if(track){n++;clearTimeout(t);bar.classList.add('on');}
   return _f(u,o).finally(()=>{if(track){n=Math.max(0,n-1);if(!n){bar.classList.add('done');t=setTimeout(()=>{bar.classList.remove('on','done');},450);}}});};}
refreshLocks();
