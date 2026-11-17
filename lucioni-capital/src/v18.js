
/* ===================== V18: análisis profesional ===================== */
const fmtK=v=>v==null?'—':(v<0?'−':'')+fmtCap(Math.abs(v)*1000);
const pctF=(v,d=1)=>v==null||!isFinite(v)?'—':(v*100).toFixed(d)+'%';
const rowOf=(t,re)=>{if(!t||!t.rows)return null;const k=Object.keys(t.rows).find(l=>re.test(l));return k?t.rows[k]:null;};
const svgEl=(w,h,inner,label)=>`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label||'')}">${inner}</svg>`;
const anim=(sel,from,to)=>{if(window.gsap&&!RM)gsap.fromTo(sel,from,to);};

/* ---------- motor DCF ---------- */
function dcf({fcf,g1,g2,r,tg,sh,net}){if(!(sh>0)||!(r>tg))return null;let pv=0,f=fcf;for(let y=1;y<=10;y++){f*=1+(y<=5?g1:g2);pv+=f/Math.pow(1+r,y);}
  const tv=f*(1+tg)/(r-tg),pvtv=tv/Math.pow(1+r,10),ev=pv+pvtv;return {ps:(ev+net)/sh,ev,pvtv,share:pvtv/ev};}
function dcfUI(host,pre){const P={s:'',p:0,fcf:0,g1:.08,r:.09,tg:.025,sh:0,net:0,...pre};
  const sl=(id,l,min,max,st,v,suf)=>`<div class="dcfs"><label class="l" for="${id}">${l} <b id="${id}v">${(v*100).toFixed(1)}${suf}</b></label><input type="range" id="${id}" min="${min}" max="${max}" step="${st}" value="${(v*100).toFixed(1)}"></div>`;
  const nm=(id,l,v,h)=>`<div><label class="l" for="${id}">${l}</label><input class="f" id="${id}" type="number" step="any" value="${v!=null&&isFinite(v)?+(+v).toFixed(2):''}">${h?`<small class="hint">${h}</small>`:''}</div>`;
  host.innerHTML=`<div class="dcfg"><div class="dcfin">
      <div class="dcfn">${nm('dFcf','Flujo de caja libre anual (millones de $)',P.fcf,P.src?'Último año fiscal: flujo operativo menos inversión en activos.':'')}${nm('dSh','Acciones en circulación (millones)',P.sh)}${nm('dNet','Caja neta (millones de $)',P.net,'Caja e inversiones de corto plazo menos deuda. Negativo si debe más de lo que tiene.')}${nm('dP','Precio actual ($)',P.p)}</div>
      ${sl('dG1','Crecimiento años 1–5',-10,40,.5,P.g1,'%')}${sl('dG2','Crecimiento años 6–10',-5,25,.5,P.g2??P.g1/2,'%')}${sl('dR','Tasa de descuento (costo de capital)',5,15,.25,P.r,'%')}${sl('dTg','Crecimiento perpetuo',0,4,.25,P.tg,'%')}
    </div><div class="dcfout" id="dOut"></div></div>
    <div class="dcfsens"><h4>Sensibilidad del valor por acción</h4><p class="note">Filas: tasa de descuento. Columnas: crecimiento de los años 1–5. Verde: al menos 10% por encima del precio actual; rojo: al menos 10% por debajo.</p><div class="tblw" id="dSens"></div></div>
    <p class="disc">Modelo de flujo de caja descontado a 10 años con valor terminal de Gordon. El resultado depende por completo de los supuestos: cambios pequeños en crecimiento o tasa de descuento mueven mucho el valor. Úsalo para entender qué expectativas ya están en el precio, no como precio objetivo.</p>`;
  const $h=s=>host.querySelector(s);let g2touched=P.g2!=null;
  const read=()=>({fcf:+$h('#dFcf').value,sh:+$h('#dSh').value,net:+$h('#dNet').value||0,p:+$h('#dP').value,g1:+$h('#dG1').value/100,g2:+$h('#dG2').value/100,r:+$h('#dR').value/100,tg:+$h('#dTg').value/100});
  function calc(first){const I=read();['dG1','dG2','dR','dTg'].forEach(k=>$h('#'+k+'v').textContent=(+$h('#'+k).value).toFixed(k==='dR'||k==='dTg'?2:1)+'%');
    const o=dcf(I),out=$h('#dOut');
    if(!o||!(I.fcf)){out.innerHTML=`<p class="note">${!(I.sh>0)?'Indica las acciones en circulación.':!(I.r>I.tg)?'La tasa de descuento debe ser mayor que el crecimiento perpetuo.':'Indica el flujo de caja libre.'}</p>`;$h('#dSens').innerHTML='';return;}
    const mos=I.p>0?o.ps/I.p-1:null,col=mos==null?'--ink':mos>=.1?'--up':mos<=-.1?'--down':'--gold';
    const mx=Math.max(o.ps,I.p||0)*1.1||1;
    out.innerHTML=`<small>Valor intrínseco estimado</small><b class="dval" style="color:var(${col})">${o.ps>0?usd2(o.ps):'Negativo'}</b>
      ${I.p>0?`<p class="dmos">${mos>=0?'Por encima':'Por debajo'} del precio actual en <b style="color:var(${col})">${pctF(Math.abs(mos))}</b>${mos>=.25?' · margen de seguridad amplio':mos>=0?' · margen de seguridad reducido':' · el precio ya descuenta más crecimiento que tu escenario'}</p>
      <div class="dbars"><div><span>Precio</span><i style="--w:${(I.p/mx*100).toFixed(1)}%;background:var(--ink3)"></i><b>${usd2(I.p)}</b></div><div><span>Valor</span><i style="--w:${(Math.max(0,o.ps)/mx*100).toFixed(1)}%;background:var(${col})"></i><b>${o.ps>0?usd2(o.ps):'—'}</b></div></div>`:''}
      <div class="drows"><div><span>Valor de la empresa (EV)</span><b>${fmtK(o.ev*1000)}</b></div><div><span>Peso del valor terminal</span><b>${pctF(o.share,0)}</b></div><div><span>Crecimiento implícito</span><b id="dImp">—</b></div></div>
      ${o.share>.8?'<p class="note warnline">Más del 80% del valor viene del valor terminal: el resultado es muy sensible a los supuestos de largo plazo.</p>':''}`;
    if(I.p>0){let lo=-.2,hi=.6;for(let k=0;k<40;k++){const m=(lo+hi)/2,v=dcf({...I,g1:m,g2:m/2});if(!v||v.ps<I.p)lo=m;else hi=m;}$h('#dImp').textContent=hi>=.599?'> 60% anual':`${(hi*100).toFixed(1)}% anual (años 1–5)`;}
    if(first)anim(out.querySelectorAll('.dbars i'),{width:0},{width:(i,el)=>el.style.getPropertyValue('--w'),duration:1,ease:'expo.out'});else out.querySelectorAll('.dbars i').forEach(e=>e.style.width=e.style.getPropertyValue('--w'));
    if(!(window.gsap&&!RM&&first))out.querySelectorAll('.dbars i').forEach(e=>e.style.width=e.style.getPropertyValue('--w'));
    const rs=[-.02,-.01,0,.01,.02].map(d=>I.r+d),gs=[-.06,-.03,0,.03,.06].map(d=>I.g1+d);
    $h('#dSens').innerHTML=`<table class="sens"><thead><tr><th></th>${gs.map(g=>`<th>${(g*100).toFixed(1)}%</th>`).join('')}</tr></thead><tbody>${rs.map(r=>`<tr><th>${(r*100).toFixed(2)}%</th>${gs.map(g=>{const v=dcf({...I,r,g1:g,g2:g2touched?I.g2:g/2});const ps=v?v.ps:null;const c=!ps||!(I.p>0)?'':ps>=I.p*1.1?'u':ps<=I.p*.9?'d':'m';return `<td class="${c}${Math.abs(r-I.r)<1e-9&&Math.abs(g-I.g1)<1e-9?' cur':''}">${ps!=null&&ps>0?usd2(ps):'—'}</td>`;}).join('')}</tr>`).join('')}</tbody></table>`;
    if(first)anim($h('#dSens').querySelectorAll('td'),{opacity:0,scale:.9},{opacity:1,scale:1,duration:.35,stagger:.012,ease:'power2.out'});}
  host.querySelectorAll('input').forEach(i=>i.addEventListener('input',()=>{if(i.id==='dG2')g2touched=true;if(i.id==='dG1'&&!g2touched)$h('#dG2').value=(+$h('#dG1').value/2).toFixed(1);calc(false);}));
  calc(true);}

/* ---------- análisis fundamental en la ficha ---------- */
const FD={};
const TXT={'Sell':'Venta','Automatic Sell':'Venta automática (plan 10b5-1)','Buy':'Compra en mercado','Automatic Buy':'Compra automática','Disposition (Non Open Market)':'Entrega fuera de mercado','Acquisition (Non Open Market)':'Adquisición fuera de mercado','Option Execute':'Ejercicio de opciones','Gift':'Donación'};
const REL={'Officer':'Directivo','Director':'Director','Beneficial Owner (10% or more)':'Accionista >10%','President':'Presidente','Chief Executive Officer':'CEO','Chief Financial Officer':'CFO'};
const shortN=n=>n==null?'—':Math.abs(n)>=1e6?(n/1e6).toFixed(1)+' M':Math.abs(n)>=1e3?(n/1e3).toFixed(1)+' mil':String(Math.round(n));
const _coOpen18=coOpen;coOpen=function(sym){_coOpen18(sym);if(!member()||!MKT||!$('#coSt'))return;
  const box=document.createElement('section');box.className='fa';box.id='fa';box.innerHTML=`<div class="fah"><h4>Análisis fundamental</h4><span class="note">Datos anuales de los últimos cuatro ejercicios fiscales</span></div>
    <div class="seg fatabs" id="faT">${[['fin','Finanzas'],['res','Resultados'],['val','Valoración'],['ins','Insiders'],['inst','Instituciones']].map(([k,l],i)=>`<button data-k="${k}" class="${i?'':'act'}">${l}</button>`).join('')}</div><div id="faB"><div class="idskel" style="height:220px"></div></div>`;
  $('#coSt').after(box);$$('#faT button').forEach(b=>b.onclick=()=>{$$('#faT button').forEach(x=>x.classList.toggle('act',x===b));faShow(sym,b.dataset.k);});
  faLoad(sym);};
async function faLoad(sym){try{if(!FD[sym]){const r=await fetch(`${MKT}?fund=${encodeURIComponent(sym)}`);const d=await r.json();if(!r.ok)throw 0;FD[sym]=d;}if(coCur!==sym)return;faShow(sym,($('#faT .act')||{}).dataset?.k||'fin');}
  catch(e){const b=$('#faB');if(b&&coCur===sym)b.innerHTML='<p class="note">No se pudieron cargar los datos fundamentales. Intenta de nuevo en un momento.</p>';}}
function faShow(sym,k){const b=$('#faB'),d=FD[sym];if(!b)return;if(!d){b.innerHTML='<div class="idskel" style="height:220px"></div>';return;}
  const f={fin:faFin,res:faRes,val:faVal,ins:faIns,inst:faInst}[k];b.innerHTML='';try{f(b,d,sym);}catch(e){b.innerHTML='<p class="note">Sin datos suficientes para esta empresa.</p>';}
  anim(b.children,{y:10,opacity:0},{y:0,opacity:1,duration:.45,stagger:.05,ease:'expo.out',clearProps:'transform,opacity'});}
function finData(d){const F=d.fin||{},I=F.inc,B=F.bal,C=F.cf,R=F.rat;if(!I||!I.per.length)return null;
  const per=I.per.map(p=>{const y=String(p).split('/').pop();return 'AF '+y;});
  const rev=rowOf(I,/^Total Revenue$/),ni=rowOf(I,/^Net Income$/),op=rowOf(I,/^Operating Income$/),gp=rowOf(I,/^Gross Profit$/);
  const ocf=rowOf(C,/^Net Cash Flow-Operating$/),cap=rowOf(C,/^Capital Expenditures$/),buy=rowOf(C,/Sale and Purchase of Stock/);
  const fcf=ocf?ocf.map((v,i)=>v==null?null:v+(cap&&cap[i]||0)):null;
  const eq=rowOf(B,/^Total Equity$/),std=rowOf(B,/^Short-Term Debt/),ltd=rowOf(B,/^Long-Term Debt$/),cash=rowOf(B,/^Cash and Cash Equivalents$/),sti=rowOf(B,/^Short-Term Investments$/),ca=rowOf(B,/^Total Current Assets$/),cl=rowOf(B,/^Total Current Liabilities$/);
  const debt=per.map((_,i)=>(std&&std[i]||0)+(ltd&&ltd[i]||0)),liq=per.map((_,i)=>(cash&&cash[i]||0)+(sti&&sti[i]||0));
  const m=(a,b,i)=>a&&b&&a[i]!=null&&b[i]?a[i]/b[i]:null;
  return {per,rev,ni,op,gp,fcf,eq,debt,liq,buy,ca,cl,
    gm:per.map((_,i)=>m(gp,rev,i)),om:per.map((_,i)=>m(op,rev,i)),nm:per.map((_,i)=>m(ni,rev,i)),roe:per.map((_,i)=>m(ni,eq,i)),de:per.map((_,i)=>eq&&eq[i]>0?debt[i]/eq[i]:null),cr:per.map((_,i)=>m(ca,cl,i)),
    yoy:rev?rev.map((v,i)=>rev[i+1]?v/rev[i+1]-1:null):[]};}
function faFin(b,d){const X=finData(d);if(!X){b.innerHTML='<p class="note">Esta empresa no publica estados financieros en esta fuente (por ejemplo, algunos ADR o empresas recién listadas).</p>';return;}
  const n=X.per.length,idx=[...Array(n).keys()].reverse(),W=560,H=220,pad={l:8,r:8,t:14,b:26},ser=[['Ingresos',X.rev,'var(--ink3)'],['Utilidad neta',X.ni,'var(--accent)'],['Flujo de caja libre',X.fcf,'var(--gold)']].filter(s=>s[1]);
  const all=ser.flatMap(s=>s[1]).filter(v=>v!=null),mx=Math.max(...all,1),mn=Math.min(0,...all),Y=v=>pad.t+(mx-v)/(mx-mn)*(H-pad.t-pad.b),gw=(W-pad.l-pad.r)/n,bw=Math.min(34,(gw-18)/ser.length);
  let g=`<line x1="0" x2="${W}" y1="${Y(0)}" y2="${Y(0)}" class="ax"/>`;
  idx.forEach((i,j)=>{const x0=pad.l+j*gw+(gw-bw*ser.length)/2;ser.forEach(([l,a,c],k)=>{const v=a[i];if(v==null)return;const y=Math.min(Y(v),Y(0)),h=Math.abs(Y(v)-Y(0));g+=`<rect class="fb" x="${(x0+k*bw).toFixed(1)}" y="${y.toFixed(1)}" width="${(bw-3).toFixed(1)}" height="${Math.max(1,h).toFixed(1)}" fill="${c}" rx="3" data-y0="${Y(0).toFixed(1)}"><title>${l} ${X.per[i]}: ${fmtK(v)}</title></rect>`;});
    g+=`<text x="${(pad.l+j*gw+gw/2).toFixed(1)}" y="${H-6}" text-anchor="middle">${X.per[i]}</text>`;});
  const L=i=>X.per[i]||'',last=0,prev=1;
  const kp=(t,v,sub,tone)=>`<div class="fk"><small>${t}</small><b ${tone?`style="color:var(${tone})"`:''}>${v}</b><span>${sub||''}</span></div>`;
  const dlt=(a,f=pctF)=>a&&a[prev]!=null&&a[last]!=null?`${f(a[prev])} en ${L(prev)}`:'';
  const cagr=X.rev&&X.rev[n-1]>0&&X.rev[0]>0?Math.pow(X.rev[0]/X.rev[n-1],1/(n-1))-1:null;
  const checks=[
    [X.rev&&X.rev.every((v,i)=>i===n-1||v>=X.rev[i+1]),'Ingresos crecientes en cada uno de los últimos ejercicios'],
    [X.fcf&&X.fcf.every(v=>v>0),'Flujo de caja libre positivo en todos los ejercicios'],
    [X.om[0]!=null&&X.om[0]>=.15,'Margen operativo de al menos 15%'],
    [X.om[0]!=null&&X.om[1]!=null&&X.om[0]>=X.om[1],'Margen operativo estable o en mejora'],
    [X.roe[0]!=null&&X.roe[0]>=.15,'Rentabilidad sobre patrimonio (ROE) de al menos 15%'],
    [X.de[0]!=null&&X.de[0]<=1,'Deuda financiera menor o igual al patrimonio'],
    [X.cr[0]!=null&&X.cr[0]>=1,'Activos corrientes cubren los pasivos de corto plazo'],
    [X.fcf&&X.ni&&X.ni[0]>0&&X.fcf[0]/X.ni[0]>=.8,'Las utilidades se convierten en caja (FCF ≥ 80% de la utilidad)']];
  const sc=checks.filter(c=>c[0]).length;
  b.innerHTML=`<div class="fachart">${svgEl(W,H,g,'Ingresos, utilidad y flujo de caja libre por año')}<div class="faleg">${ser.map(([l,,c])=>`<span><i style="background:${c}"></i>${l}</span>`).join('')}</div></div>
    <div class="fkg">${kp('Ingresos '+L(0),fmtK(X.rev&&X.rev[0]),X.yoy[0]!=null?`${X.yoy[0]>=0?'+':''}${pctF(X.yoy[0])} interanual · ${cagr!=null?'crec. anual comp. '+pctF(cagr):''}`:'',X.yoy[0]!=null?(X.yoy[0]>=0?'--up':'--down'):null)}
      ${kp('Margen bruto',pctF(X.gm[0]),dlt(X.gm))}${kp('Margen operativo',pctF(X.om[0]),dlt(X.om))}${kp('Margen neto',pctF(X.nm[0]),dlt(X.nm))}
      ${kp('ROE',pctF(X.roe[0]),dlt(X.roe))}${kp('Deuda / patrimonio',X.de[0]!=null?X.de[0].toFixed(2)+'x':'—',`Deuda ${fmtK(X.debt[0])} · caja ${fmtK(X.liq[0])}`)}
      ${kp('Liquidez corriente',X.cr[0]!=null?X.cr[0].toFixed(2)+'x':'—','Activo corriente / pasivo corriente')}${kp('Flujo de caja libre',fmtK(X.fcf&&X.fcf[0]),X.fcf&&X.rev?'Margen FCF '+pctF(X.fcf[0]/X.rev[0]):'')}
      ${X.buy?kp('Recompras netas',X.buy[0]<0?fmtK(-X.buy[0]):'—',X.buy[0]<0?'Devueltos al accionista en el año':'Sin recompras netas'):''}</div>
    <div class="facheck"><div class="fach"><b>Lista de calidad</b><span><b id="faSc">0</b> de ${checks.length}</span></div><div class="pfmeter"><i style="width:0;background:var(${sc>=6?'--up':sc>=4?'--gold':'--down'})" data-w="${sc/checks.length*100}"></i></div>
      <ul class="chk2">${checks.map(([ok,t])=>`<li class="${ok?'ok':'no'}">${t}</li>`).join('')}</ul><p class="note">Filtro inspirado en criterios de calidad usados por analistas fundamentales. No sustituye leer el informe anual (10-K) de la empresa.</p></div>`;
  if(window.gsap&&!RM){gsap.from(b.querySelectorAll('.fb'),{attr:{height:0,y:(i,el)=>el.dataset.y0},duration:.9,ease:'expo.out',stagger:.04});}
  countUp($('#faSc'),sc,v=>Math.round(v));requestAnimationFrame(()=>{const m=b.querySelector('.pfmeter i');if(m)m.style.width=m.dataset.w+'%';});}
function faRes(b,d){const S=(d.sur||[]).filter(r=>r.eps!=null);if(!S.length){b.innerHTML='<p class="note">Sin historial de resultados trimestrales en esta fuente.</p>';return;}
  const W=560,H=200,p={l:40,r:10,t:16,b:28},vals=S.flatMap(r=>[r.eps,r.est]).filter(v=>v!=null),mx=Math.max(...vals),mn=Math.min(0,...vals),Y=v=>p.t+(mx-v)/((mx-mn)||1)*(H-p.t-p.b),gw=(W-p.l-p.r)/S.length;
  let g='';for(let k=0;k<=3;k++){const v=mn+(mx-mn)*k/3;g+=`<line class="ax" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v)+4}">$${v.toFixed(2)}</text>`;}
  S.forEach((r,i)=>{const cx=p.l+i*gw+gw/2,beat=r.est!=null&&r.eps>=r.est;g+=`<rect class="fb" x="${cx-16}" y="${Y(Math.max(r.eps,0))}" width="32" height="${Math.abs(Y(r.eps)-Y(0))}" rx="4" fill="var(${beat?'--up':'--down'})" opacity=".85" data-y0="${Y(0)}"><title>Real: $${r.eps}</title></rect>`;
    if(r.est!=null)g+=`<line x1="${cx-22}" x2="${cx+22}" y1="${Y(r.est)}" y2="${Y(r.est)}" stroke="var(--ink)" stroke-width="2.5" stroke-dasharray="4 3"><title>Estimado: $${r.est}</title></line>`;
    g+=`<text x="${cx}" y="${H-8}" text-anchor="middle">${esc(r.q)}</text>`;});
  const beats=S.filter(r=>r.est!=null&&r.eps>=r.est).length,avg=S.reduce((a,r)=>a+(r.sp||0),0)/S.length;
  b.innerHTML=`<div class="fachart">${svgEl(W,H,g,'Ganancia por acción real frente a estimada')}<div class="faleg"><span><i style="background:var(--up)"></i>Real (superó)</span><span><i style="background:var(--down)"></i>Real (no alcanzó)</span><span><i class="dash"></i>Estimado de consenso</span></div></div>
    <div class="fkg"><div class="fk"><small>Superó el consenso</small><b>${beats} de ${S.length}</b><span>trimestres</span></div><div class="fk"><small>Sorpresa promedio</small><b style="color:var(${avg>=0?'--up':'--down'})">${avg>=0?'+':''}${avg.toFixed(1)}%</b><span>frente a lo estimado</span></div><div class="fk"><small>Último reporte</small><b>${esc(S.at(-1).d||'')}</b><span>${esc(S.at(-1).q)}</span></div></div>
    <div class="tblw"><table class="ftbl"><thead><tr><th>Trimestre</th><th>Reportado</th><th>BPA real</th><th>BPA estimado</th><th>Sorpresa</th></tr></thead><tbody>${[...S].reverse().map(r=>`<tr><td>${esc(r.q)}</td><td>${esc(r.d||'')}</td><td>$${r.eps.toFixed(2)}</td><td>${r.est!=null?'$'+r.est.toFixed(2):'—'}</td><td style="color:var(${(r.sp||0)>=0?'--up':'--down'})">${r.sp!=null?(r.sp>=0?'+':'')+r.sp.toFixed(2)+'%':'—'}</td></tr>`).join('')}</tbody></table></div>
    <p class="note">BPA: beneficio por acción ajustado. Superar estimados de forma consistente suele indicar una gerencia conservadora en su guía y un negocio predecible.</p>`;
  if(window.gsap&&!RM)gsap.from(b.querySelectorAll('.fb'),{attr:{height:0,y:(i,el)=>el.dataset.y0},duration:.8,ease:'expo.out',stagger:.08});}
function faVal(b,d,sym){const X=finData(d),base=CO.find(r=>r.s===sym)||{},idea=(IDS||[]).find(r=>r.s===sym);const p=(coD&&coD.s===sym&&coD.p)||base.p||0;
  if(!X||!X.fcf||X.fcf[0]==null||!(d.inst&&d.inst.so)){b.innerHTML='<p class="note">Faltan datos (flujo de caja o acciones en circulación) para estimar un DCF de esta empresa. Puedes usar la herramienta "Valor intrínseco" con tus propios datos.</p>';return;}
  const cagr=X.rev&&X.rev[X.rev.length-1]>0?Math.pow(X.rev[0]/X.rev[X.rev.length-1],1/(X.rev.length-1))-1:.06;
  const g1=Math.max(-.05,Math.min(.25,idea&&idea.gr!=null?idea.gr/100:cagr));
  const net=(X.liq[0]-X.debt[0])/1000;
  b.innerHTML='<div class="fadcf"></div>';dcfUI(b.querySelector('.fadcf'),{s:sym,p,fcf:+(X.fcf[0]/1000).toFixed(0),sh:d.inst.so,net:+net.toFixed(0),g1:+g1.toFixed(3),r:.09,tg:.025,src:1});
  b.insertAdjacentHTML('afterbegin',`<p class="note">Valores iniciales tomados de los estados financieros de ${esc(sym)}${idea&&idea.gr!=null?' y del crecimiento de utilidades esperado por analistas':' y del crecimiento histórico de ingresos'}. Ajústalos a tu propio escenario.</p>`);}
function faIns(b,d){const I=d.ins;if(!I){b.innerHTML='<p class="note">Sin datos de operaciones de insiders.</p>';return;}
  const bar=(l,bu,se)=>{const t=(bu||0)+(se||0)||1;return `<div class="insb"><span>${l}</span><div class="insbar"><i class="b" style="--w:${((bu||0)/t*100).toFixed(1)}%"></i><i class="s" style="--w:${((se||0)/t*100).toFixed(1)}%"></i></div><b>${bu||0} compras · ${se||0} ventas</b></div>`;};
  const open=(I.last||[]).filter(r=>/^(Buy|Automatic Buy)$/.test(r.t)).length;
  b.innerHTML=`<div class="fkg"><div class="fk"><small>Acciones netas (3 meses)</small><b style="color:var(${(I.n3||0)>=0?'--up':'--down'})">${(I.n3||0)>=0?'+':''}${shortN(I.n3)}</b><span>compradas menos vendidas</span></div><div class="fk"><small>Acciones netas (12 meses)</small><b style="color:var(${(I.n12||0)>=0?'--up':'--down'})">${(I.n12||0)>=0?'+':''}${shortN(I.n12)}</b><span>compradas menos vendidas</span></div></div>
    ${bar('3 meses',I.b3,I.s3)}${bar('12 meses',I.b12,I.s12)}
    <div class="tblw"><table class="ftbl"><thead><tr><th>Persona</th><th>Cargo</th><th>Fecha</th><th>Operación</th><th>Acciones</th><th>Precio</th></tr></thead><tbody>${(I.last||[]).map(r=>`<tr><td>${esc((r.n||'').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()))}</td><td>${esc(REL[r.r]||r.r||'')}</td><td>${esc(r.d||'')}</td><td class="${/Buy/.test(r.t)?'u':/Sell/.test(r.t)?'d':''}">${esc(TXT[r.t]||r.t||'')}</td><td>${shortN(r.sh)}</td><td>${r.p?usd2(r.p):'—'}</td></tr>`).join('')}</tbody></table></div>
    <p class="note">Las ventas de directivos son frecuentes por impuestos, diversificación o planes programados (10b5-1) y no implican por sí solas una mala señal. Las compras con dinero propio en mercado abierto son más informativas${open?`: hay ${open} entre las operaciones recientes`:''}.</p>`;
  requestAnimationFrame(()=>b.querySelectorAll('.insbar i').forEach(e=>e.style.width=e.style.getPropertyValue('--w')));}
function faInst(b,d){const S=d.inst;if(!S){b.innerHTML='<p class="note">Sin datos de propiedad institucional.</p>';return;}
  const C=2*Math.PI*42,pc=Math.min(100,S.pct||0)/100,t=(S.inc||0)+(S.dec||0)||1;
  b.innerHTML=`<div class="instg"><div class="instring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="bg"/><circle cx="50" cy="50" r="42" class="fg" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" data-o="${(C*(1-pc)).toFixed(1)}"/></svg><div><b>${S.pct!=null?S.pct.toFixed(1)+'%':'—'}</b><small>en manos de instituciones</small></div></div>
    <div class="fkg" style="flex:1"><div class="fk"><small>Instituciones accionistas</small><b>${S.holders!=null?S.holders.toLocaleString('en-US'):'—'}</b><span>fondos, bancos y gestoras</span></div><div class="fk"><small>Acciones en circulación</small><b>${S.so!=null?S.so.toLocaleString('en-US')+' M':'—'}</b><span></span></div>
    <div class="fk"><small>Nuevas posiciones / cerradas</small><b>${S.nw??'—'} / ${S.out??'—'}</b><span>último trimestre reportado</span></div></div></div>
    <div class="insb"><span>Último trimestre</span><div class="insbar"><i class="b" style="--w:${((S.inc||0)/t*100).toFixed(1)}%"></i><i class="s" style="--w:${((S.dec||0)/t*100).toFixed(1)}%"></i></div><b>${(S.inc||0).toLocaleString('en-US')} aumentaron · ${(S.dec||0).toLocaleString('en-US')} redujeron</b></div>
    <div class="tblw"><table class="ftbl"><thead><tr><th>Institución</th><th>Fecha del reporte</th><th>Acciones</th><th>Cambio</th><th>Valor</th></tr></thead><tbody>${(S.top||[]).map(r=>`<tr><td>${esc(r.n)}</td><td>${esc(r.d||'')}</td><td>${shortN(r.sh)}</td><td class="${(r.ch||0)>=0?'u':'d'}">${r.ch!=null?(r.ch>=0?'+':'')+r.ch.toFixed(2)+'%':'—'}</td><td>${fmtK(r.v)}</td></tr>`).join('')}</tbody></table></div>
    <p class="note">Datos de los formularios 13F que los gestores presentan cada trimestre ante la SEC, con hasta 45 días de retraso.</p>`;
  const fg=b.querySelector('.instring .fg');if(window.gsap&&!RM)gsap.to(fg,{attr:{'stroke-dashoffset':fg.dataset.o},duration:1.2,ease:'expo.out'});else fg.setAttribute('stroke-dashoffset',fg.dataset.o);
  requestAnimationFrame(()=>b.querySelectorAll('.insbar i').forEach(e=>e.style.width=e.style.getPropertyValue('--w')));}

/* ---------- herramientas: tamaño de posición y valor intrínseco ---------- */
TOOLS.push('size','dcf');
LOCKS['tool:size']=['Tamaño de posición','Calcula cuántas acciones comprar según el riesgo máximo que aceptas y tu stop-loss.'];
LOCKS['tool:dcf']=['Valor intrínseco (DCF)','Estima el valor de una empresa descontando sus flujos de caja futuros.'];
{const ref=$('#tnav button[data-t="fee"]');if(ref){const a=document.createElement('button');a.dataset.t='size';a.textContent='Tamaño de posición';const c=document.createElement('button');c.dataset.t='dcf';c.textContent='Valor intrínseco';ref.after(a);a.after(c);[a,c].forEach(x=>x.onclick=()=>tool(x.dataset.t));}}
{const cols=$$('#menu .mcol');const col=cols[cols.length-1];if(col){const h=col.querySelector('h4');[['target','Tamaño de posición','Cuántas acciones según tu riesgo',()=>{go('tools');tool('size');}],['volatilidad','Valor intrínseco (DCF)','Flujo de caja descontado',()=>{go('tools');tool('dcf');}]].reverse().forEach(([i,t,s,f])=>{const b=document.createElement('button');b.className='mi2';b.setAttribute('role','menuitem');b.innerHTML=`${ic(i,'',false)}<span>${t}<small>${s}</small></span>`;b.onclick=()=>{closeMenu();f();};h.after(b);});}}
function sizeCalc(){const v=id=>parseFloat($('#'+id).value),cap=v('zCap'),rk=v('zRisk')/100,en=v('zEn'),st=v('zSt'),tg=v('zTg'),out=$('#zOut');
  if(!(cap>0)||!(rk>0)||!(en>0)||!(st>0)){out.innerHTML='<p class="note">Completa capital, riesgo, entrada y stop-loss.</p>';$('#zLad').innerHTML='';return;}
  if(st>=en){out.innerHTML='<p class="autherr">El stop-loss debe estar por debajo del precio de entrada (posición de compra).</p>';$('#zLad').innerHTML='';return;}
  const risk=cap*rk,per=en-st;let q=Math.floor(risk/per),lim=false;if(q*en>cap){q=Math.floor(cap/en);lim=true;}
  const pos=q*en,loss=q*per,gain=tg>en?q*(tg-en):null,rr=tg>en?(tg-en)/per:null,w=pos/cap,stp=per/en;
  const k=(t,v,s,c)=>`<div class="pfk"><small>${t}</small><b ${c?`style="color:var(${c})"`:''}>${v}</b><span>${s||''}</span></div>`;
  out.innerHTML=`<div class="pfkpis">${k('Acciones a comprar',q.toLocaleString('en-US'),lim?'Limitado por tu capital':'Según tu riesgo')}${k('Tamaño de la posición',usd2(pos),pctF(w)+' de tu capital')}${k('Pérdida si toca el stop',usd2(loss),pctF(loss/cap,2)+' del capital','--down')}${k('Ganancia en el objetivo',gain!=null?usd2(gain):'—',rr!=null?`Beneficio/riesgo ${rr.toFixed(2)} : 1`:'Indica un precio objetivo',gain!=null?'--up':null)}</div>
    <ul class="idwhy">${[stp>.15?[1,`Tu stop está ${pctF(stp)} por debajo de la entrada: es amplio y obliga a una posición pequeña.`]:[0,`Distancia al stop: ${pctF(stp)} (${usd2(per)} por acción).`],
      w>.25?[1,`La posición sería ${pctF(w,0)} de tu capital. Muchos gestores limitan cada posición a 5–20%.`]:[0,`Concentración razonable: ${pctF(w,0)} del capital.`],
      rr==null?[0,'Agrega un precio objetivo para medir la relación beneficio/riesgo.']:rr<2?[1,`Relación beneficio/riesgo de ${rr.toFixed(2)}:1. Con menos de 2:1 necesitas acertar más de un tercio de las veces solo para no perder.`]:[0,`Relación beneficio/riesgo de ${rr.toFixed(2)}:1: con ella basta acertar ${pctF(1/(1+rr),0)} de las veces para no perder.`],
      rk>.02?[1,`Arriesgas ${pctF(rk)} del capital por operación. La práctica habitual es 0.5–2%.`]:[0,`Riesgo por operación de ${pctF(rk)}: dentro de la práctica habitual (0.5–2%).`]].map(([w2,t])=>`<li class="${w2?'w':''}">${t}</li>`).join('')}</ul>`;
  const hi=Math.max(en,tg||en)*1.04,lo=st*.96,Hh=260,Y=p=>12+(hi-p)/(hi-lo)*(Hh-24),z=(a,b2,c,l)=>`<rect x="70" y="${Y(a)}" width="150" height="${Math.max(2,Y(b2)-Y(a))}" fill="${c}" opacity=".18" rx="6"/>`,ln=(p,l,c)=>`<line x1="62" x2="228" y1="${Y(p)}" y2="${Y(p)}" stroke="${c}" stroke-width="2"/><text x="0" y="${Y(p)+4}" class="zl">${l}</text><text x="234" y="${Y(p)+4}" class="zv">${usd2(p)}</text>`;
  $('#zLad').innerHTML=svgEl(320,Hh,`${tg>en?z(tg,en,'var(--up)'):''}${z(en,st,'var(--down)')}${tg>en?ln(tg,'Objetivo','var(--up)'):''}${ln(en,'Entrada','var(--ink)')}${ln(st,'Stop','var(--down)')}`,'Niveles de la operación');
  anim('#zLad rect',{scaleY:0,transformOrigin:'50% 50%'},{scaleY:1,duration:.6,ease:'expo.out'});}
function sizeInit(){const P=typeof pfCalc==='function'?pfCalc():null;if(P&&P.V>0&&!$('#zCap').value)$('#zCap').value=Math.round(P.V);if(!$('#zCap').value)$('#zCap').value=10000;sizeCalc();}
$$('#t-size input').forEach(i=>i.addEventListener('input',sizeCalc));
let dcfReady=false;function dcfInit(){if(dcfReady)return;dcfReady=true;dcfUI($('#dcfHost'),{fcf:1000,sh:500,net:0,p:40,g1:.08,r:.09,tg:.025});}
if(MKT){$('#dcfLoad').classList.remove('hidden');$('#dcfGo').onclick=async()=>{const s=($('#dcfSym').value||'').trim().toUpperCase();if(!/^[A-Z.\-]{1,10}$/.test(s))return;const b=$('#dcfGo');b.disabled=true;b.textContent='Cargando…';
  try{if(!FD[s]){const r=await fetch(`${MKT}?fund=${encodeURIComponent(s)}`);FD[s]=await r.json();}if(!CO.length)await coLoad();const host=$('#dcfHost');faVal(host,FD[s],s);dcfReady=true;}catch(e){toast('No se pudieron cargar los datos de '+s);}finally{b.disabled=false;b.textContent='Cargar datos';}};}
const _tool18=tool;tool=function(t){_tool18(t);if(t==='size')sizeInit();if(t==='dcf')dcfInit();};

/* ---------- mi cartera: riesgo y rendimiento ---------- */
const H1={};let pfRiskSig='',pfRiskBusy=false,pfRiskT=0;
if(MKT&&$('#pfWrap')){const g=$('#pfWrap .pfgrid');const d=document.createElement('div');d.className='panel pfrisk';d.id='pfRisk';d.innerHTML=`<div class="pfth"><h4>Riesgo y rendimiento · últimos 12 meses</h4><span class="note" id="pfRiskN"></span></div><div id="pfRiskB"><p class="note">Agrega acciones para analizar el riesgo de tu cartera.</p></div>`;g.after(d);}
async function h1y(s){if(H1[s])return H1[s];const r=await fetch(`${MKT}?h1y=${encodeURIComponent(s)}`);const d=await r.json();H1[s]=d.pts||[];return H1[s];}
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length,sd=a=>{const m=mean(a);return Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(a.length-1));},cov=(a,b2)=>{const ma=mean(a),mb=mean(b2);let s=0;for(let i=0;i<a.length;i++)s+=(a[i]-ma)*(b2[i]-mb);return s/(a.length-1);};
async function pfRisk(){if(!MKT||!$('#pfRiskB'))return;const P=pfCalc();const hold=P.rows.filter(r=>r.val>0).sort((a,b2)=>b2.val-a.val).slice(0,15);
  const sig=hold.map(r=>r.s+':'+r.w.toFixed(3)).join('|');if(!hold.length){$('#pfRiskB').innerHTML='<p class="note">Agrega acciones para analizar el riesgo de tu cartera.</p>';pfRiskSig='';return;}
  if(sig===pfRiskSig||pfRiskBusy)return;pfRiskBusy=true;pfRiskSig=sig;$('#pfRiskN').textContent='Calculando con precios diarios…';
  try{const syms=['SPY',...hold.map(r=>r.s)];const out={};let i=0;await Promise.all([0,1].map(async()=>{while(i<syms.length){const s=syms[i++];try{out[s]=await h1y(s);}catch(e){out[s]=[];}}}));
    const B=out.SPY||[];if(B.length<60)throw 0;const dates=B.map(p=>new Date(p[0]).toISOString().slice(0,10));
    const align=pts=>{const m=new Map(pts.map(p=>[new Date(p[0]).toISOString().slice(0,10),p[1]]));let last=null;return dates.map(d=>{if(m.has(d))last=m.get(d);return last;});};
    const inc=hold.filter(r=>{const a=align(out[r.s]||[]);return a.filter(v=>v!=null).length>=dates.length*.8;});const skipped=hold.filter(r=>!inc.includes(r));
    if(!inc.length)throw 0;const tw=inc.reduce((a,r)=>a+r.w,0);const series=inc.map(r=>({s:r.s,w:r.w/tw,c:align(out[r.s])}));
    let start=0;while(start<dates.length&&series.some(x=>x.c[start]==null))start++;
    const ret=a=>{const o=[];for(let t=start+1;t<a.length;t++)o.push(a[t]/a[t-1]-1);return o;};
    const bc=B.map(p=>p[1]),rb=ret(bc),rs=series.map(x=>ret(x.c)),rp=rb.map((_,t)=>rs.reduce((a,r,k)=>a+series[k].w*r[t],0));
    const curve=a=>{let v=100;const o=[100];a.forEach(r=>{v*=1+r;o.push(v);});return o;};const cp=curve(rp),cb=curve(rb);
    const n=rp.length,annR=Math.pow(cp.at(-1)/100,252/n)-1,vol=sd(rp)*Math.sqrt(252),bvol=sd(rb)*Math.sqrt(252),rf=.04,sharpe=(annR-rf)/vol,beta=cov(rp,rb)/(sd(rb)**2),corrB=cov(rp,rb)/(sd(rp)*sd(rb));
    let pk=cp[0],mdd=0;cp.forEach(v=>{pk=Math.max(pk,v);mdd=Math.min(mdd,v/pk-1);});let pkb=cb[0],mddb=0;cb.forEach(v=>{pkb=Math.max(pkb,v);mddb=Math.min(mddb,v/pkb-1);});
    const sorted=[...rp].sort((a,b2)=>a-b2),var95=-sorted[Math.floor(n*.05)],worst=sorted[0];
    const bAnn=Math.pow(cb.at(-1)/100,252/n)-1,alpha=annR-(rf+beta*(bAnn-rf));
    const top=series.slice(0,8),cm=top.map(a=>top.map(b2=>{const ra=ret(a.c),rb2=ret(b2.c);return cov(ra,rb2)/(sd(ra)*sd(rb2));}));
    const W=Math.max(340,Math.min(1100,($('#pfRiskB').clientWidth||620))),Hc=Math.round(Math.min(300,Math.max(220,W*.32))),pd={l:42,r:84,t:12,b:24},all=[...cp,...cb],mx=Math.max(...all),mn=Math.min(...all),X=t=>pd.l+t/(cp.length-1)*(W-pd.l-pd.r),Y=v=>pd.t+(mx-v)/((mx-mn)||1)*(Hc-pd.t-pd.b);
    const path=a=>a.map((v,t)=>(t?'L':'M')+X(t).toFixed(1)+' '+Y(v).toFixed(1)).join('');
    let g='';for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4;g+=`<line class="ax" x1="${pd.l}" x2="${W-pd.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v)+4}">${v.toFixed(0)}</text>`;}
    const d0=new Date(dates[start]),d1=new Date(dates.at(-1)),fm=d=>d.toLocaleDateString('es-PE',{month:'short',year:'2-digit',timeZone:'UTC'});
    g+=`<text x="${pd.l}" y="${Hc-6}">${fm(d0)}</text><text x="${W-pd.r}" y="${Hc-6}" text-anchor="end">${fm(d1)}</text>`;
    g+=`<path class="rl b" d="${path(cb)}"/><path class="rl p" d="${path(cp)}"/><text class="re" x="${W-pd.r+6}" y="${Y(cp.at(-1))+4}" fill="var(--accent)">Tú ${cp.at(-1)>=100?'+':''}${(cp.at(-1)-100).toFixed(1)}%</text><text class="re" x="${W-pd.r+6}" y="${Y(cb.at(-1))+4}" fill="var(--ink2)">S&amp;P ${cb.at(-1)>=100?'+':''}${(cb.at(-1)-100).toFixed(1)}%</text>`;
    const k=(t,v,s,c)=>`<div class="fk"><small>${t}</small><b ${c?`style="color:var(${c})"`:''}>${v}</b><span>${s}</span></div>`;
    $('#pfRiskB').innerHTML=`<div class="fachart">${svgEl(W,Hc,g,'Evolución de tu cartera frente al S&P 500, base 100')}<div class="faleg"><span><i style="background:var(--accent)"></i>Tu cartera (pesos actuales)</span><span><i style="background:var(--ink3)"></i>S&amp;P 500 (SPY)</span></div></div>
      <div class="fkg">${k('Rendimiento 12 meses',pctF(cp.at(-1)/100-1),`S&P 500: ${pctF(cb.at(-1)/100-1)}`,cp.at(-1)>=100?'--up':'--down')}${k('Volatilidad anual',pctF(vol),`S&P 500: ${pctF(bvol)}`)}${k('Ratio de Sharpe',sharpe.toFixed(2),'Rendimiento extra por unidad de riesgo (tasa libre 4%)',sharpe>=1?'--up':sharpe<0?'--down':null)}
        ${k('Beta',beta.toFixed(2),beta>1.1?'Más sensible que el mercado':beta<.9?'Menos sensible que el mercado':'Se mueve parecido al mercado')}${k('Alfa anual (CAPM)',pctF(alpha),'Rendimiento no explicado por el mercado',alpha>=0?'--up':'--down')}${k('Caída máxima',pctF(mdd),`S&P 500: ${pctF(mddb)}`,'--down')}
        ${k('VaR 95% a 1 día',usd2(var95*P.V),`En 1 de cada 20 días podrías perder más de ${pctF(var95)}`,'--down')}${k('Peor día',pctF(worst),'Del último año','--down')}${k('Correlación con el S&P 500',corrB.toFixed(2),corrB>.85?'Diversifica poco frente a un ETF del índice':'Aporta diversificación frente al índice')}</div>
      <ul class="idwhy" style="margin:6px 0 14px"><li>Si el S&amp;P 500 cayera 10%, tu cartera caería alrededor de <b>${pctF(beta*.1)}</b> (≈ ${usd2(beta*.1*P.V)}) según su beta histórica.</li></ul>
      ${top.length>1?`<h4 style="margin:4px 0 8px">Correlación entre tus posiciones</h4><p class="note">1 = se mueven igual; 0 = sin relación; negativo = en sentido opuesto. Correlaciones altas entre posiciones grandes reducen el beneficio de diversificar.</p>
      <div class="tblw"><table class="corr"><thead><tr><th></th>${top.map(x=>`<th>${esc(x.s)}</th>`).join('')}</tr></thead><tbody>${top.map((a,i)=>`<tr><th>${esc(a.s)}</th>${cm[i].map(v=>`<td style="background:color-mix(in srgb,var(${v>=0?'--accent':'--up'}) ${Math.round(Math.abs(v)*70)}%,transparent);color:${Math.abs(v)>.6?'var(--paper)':'var(--ink)'}">${v.toFixed(2)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:''}
      <p class="disc">Cálculo con precios de cierre diarios de los últimos 12 meses, aplicando tus pesos actuales a todo el periodo (no refleja cuándo compraste realmente). El rendimiento pasado no garantiza resultados futuros.${skipped.length?` Sin historial suficiente, excluidas: ${skipped.map(r=>r.s).join(', ')}.`:''}</p>`;
    $('#pfRiskN').textContent=`${n} sesiones · ${inc.length} posiciones`;
    if(window.gsap&&!RM){$$('#pfRiskB .rl').forEach((p,i)=>{const L=p.getTotalLength();gsap.fromTo(p,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.6,ease:'power2.inOut',delay:i*.15});});gsap.from('#pfRiskB .re',{opacity:0,x:-6,duration:.5,delay:1.4});gsap.from('#pfRiskB .fk',{y:12,opacity:0,stagger:.04,duration:.5,ease:'expo.out'});gsap.from('#pfRiskB .corr td',{opacity:0,duration:.3,stagger:.01});}}
  catch(e){pfRiskSig='';$('#pfRiskN').textContent='';$('#pfRiskB').innerHTML='<p class="note">No se pudo obtener el historial de precios. Intenta de nuevo en un momento.</p>';}
  finally{pfRiskBusy=false;}}
const _pfR18=pfRender;pfRender=function(f){_pfR18(f);clearTimeout(pfRiskT);pfRiskT=setTimeout(()=>{if(VIEW==='port'&&member())pfRisk();},700);};
refreshLocks();
