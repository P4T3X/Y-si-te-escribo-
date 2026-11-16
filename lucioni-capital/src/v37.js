/* ===================== V37: Lucioni Intelligence Network (Fase 5) — orquestación única sobre el Copilot ===================== */
{
const IN=AUTH?AUTH.replace(/account$/,'intel'):null;
const tokI=()=>{try{return localStorage.getItem('lc_tok')||'';}catch(e){return '';}};
async function iapi(action,b={}){let r;try{r=await fetch(IN,{method:'POST',headers:{'content-type':'application/json',...(tokI()?{authorization:'Bearer '+tokI()}:{})},body:JSON.stringify({action,...b})});}catch(e){throw {code:'network',message:'Sin conexión. Revisa tu internet.'};}
 const d=await r.json().catch(()=>({}));if(!r.ok)throw {status:r.status,...d};return d;}
const INTEL_RE=/(situaci[oó]n financiera (completa|general|global|total)|an[aá]lisis (financiero )?(completo|integral)|informe (financiero|completo|integral)|diagn[oó]stico (financiero|completo)|pr[oó]ximos 12 meses|qu[eé] deber[ií]a mejorar|plan financiero (completo|personal|integral)|revisa (todas )?mis finanzas)/i;
const ICONS={finance:'dividendo',credit:'calc',wealth:'diversificar',invest:'alcista',estate:'pts',retire:'compuesto',goals:'target',macro:'news'};
const TYPE={hecho:['Hecho','h'],'estimación':['Estimación','e'],'simulación':['Simulación','s']};
const GO={finance:()=>setView('finance'),credit:()=>setView('debt'),wealth:()=>{setView('finance');setTimeout(()=>F33?.goTab?.('nw'),200);},invest:()=>setView('port'),estate:()=>{setView('finance');setTimeout(()=>F33?.goTab?.('est'),200);},retire:()=>{setView('finance');setTimeout(()=>F33?.goTab?.('ret'),200);},goals:()=>setView('goals'),macro:()=>window.EC36?EC36.open('sum'):setView('macro')};
let MODS=null;const LAST={};
const fdt=t=>new Date(t).toLocaleString('es-PE',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});

/* ---------- consentimiento ---------- */
async function intelAsk(t){const ch=$('#chat');ch.insertAdjacentHTML('beforeend',`<div class="msg u">${esc(t)}</div>`);const m=document.createElement('div');m.className='msg a in37m';ch.appendChild(m);m.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});
 if(!IN){m.innerHTML='<p>El análisis financiero completo lee tus datos guardados en el servidor y está disponible en la versión web con tu cuenta.</p>';return;}
 if(!member()||!tokI()){m.innerHTML=`<div class="in37card"><b>Necesitas una cuenta para el análisis completo</b><p>Lucioni Intelligence lee tus finanzas, deudas, cartera, inmuebles, jubilación y metas desde tu cuenta, siempre con tu permiso.</p><button class="btn pri" data-acc>Crear cuenta o iniciar sesión</button></div>`;m.querySelector('[data-acc]').onclick=()=>openAccount();return;}
 m.innerHTML='<div class="c28st"><span class="typing"><span></span><span></span><span></span></span><small>Revisando tus permisos…</small></div>';
 try{MODS=(await iapi('consent.get')).modules;}catch(e){m.textContent=e.message||'No pudimos revisar tus permisos.';return;}
 const ctry=(window.EC36&&EC36.EC.c)||store.get('ecC','PE');
 m.innerHTML=`<div class="in37card in37perm"><div class="in37h">${ic('chat','',false)}<div><b>¿Qué puede leer Lucioni Intelligence?</b><p>Elige los módulos para este análisis. Los datos se leen en el servidor solo con tu autorización, se usan para este informe y puedes retirar el permiso cuando quieras.</p></div></div>
  <div class="in37mods">${MODS.map(x=>`<label class="in37mod ${x.sensitive?'':'pub'}"><input type="checkbox" value="${x.k}" ${x.on?'checked':''} ${x.sensitive?'':'disabled checked'}><span class="in37ic">${ic(ICONS[x.k]||'check','',false)}</span><span><b>${esc(x.label)}</b><small>${x.sensitive?'Lee: ':''}${esc(x.reads)}${x.on&&x.sensitive&&x.at?` · autorizado el ${new Date(x.at).toLocaleDateString('es-PE')}`:''}${x.sensitive?'':' · siempre disponible'}</small></span></label>`).join('')}</div>
  <div class="in37row"><button class="btn" data-all>Seleccionar todos</button><label class="in37ct">País para el contexto económico <select class="f" data-ct>${['PE','US','MX','CO','CL','AR','BR','ES','EA'].map(c=>`<option value="${c}" ${c===ctry?'selected':''}>${{PE:'Perú',US:'Estados Unidos',MX:'México',CO:'Colombia',CL:'Chile',AR:'Argentina',BR:'Brasil',ES:'España',EA:'Zona euro'}[c]}</option>`).join('')}</select></label></div>
  <div class="in37row"><button class="btn pri" data-go>Autorizar y analizar</button><button class="btn" data-no>Cancelar</button><span class="note">No realiza operaciones ni comparte tus datos con otros usuarios.</span></div></div>`;
 m.querySelector('[data-all]').onclick=()=>m.querySelectorAll('.in37mod input:not([disabled])').forEach(x=>x.checked=true);
 m.querySelector('[data-no]').onclick=()=>{m.innerHTML='<p>Listo, no leí ningún dato. Puedes pedirme el análisis cuando quieras.</p>';};
 m.querySelector('[data-go]').onclick=async()=>{const sel=[...m.querySelectorAll('.in37mod input:checked')].map(x=>x.value),country=m.querySelector('[data-ct]').value;
  const grant={};sel.forEach(k=>{const x=MODS.find(y=>y.k===k);if(x&&x.sensitive&&!x.on)grant[k]=true;});
  if(!sel.some(k=>MODS.find(y=>y.k===k)?.sensitive)&&!confirm('Solo elegiste datos públicos. El informe no incluirá tu situación personal. ¿Continuar?'))return;
  try{if(Object.keys(grant).length)MODS=(await iapi('consent.set',{mods:grant})).modules;}catch(e){toast(e.message||'No se guardaron los permisos');return;}
  run(m,t,sel,country);};}

/* ---------- ejecución con progreso ---------- */
async function run(m,q,mods,country){const labels=mods.map(k=>(MODS.find(x=>x.k===k)||{}).label||k);
 m.innerHTML=`<div class="in37card in37prog"><b>Analizando tu situación</b><ol>${labels.map((l,i)=>`<li style="--i:${i}">${ic(ICONS[mods[i]]||'check','',false)}<span>${esc(l)}</span><i></i></li>`).join('')}<li class="ai"><span>Redactando el informe con citas</span><i></i></li></ol></div>`;
 const lis=[...m.querySelectorAll('.in37prog li')];let k=0;const tm=setInterval(()=>{if(k<lis.length-1){lis[k].classList.add('done');k++;lis[k]?.classList.add('now');}},420);lis[0]?.classList.add('now');
 let R;try{R=await iapi('report',{q,mods,country});}catch(e){clearInterval(tm);m.innerHTML=`<div class="in37card"><b>No pudimos generar el informe</b><p>${esc(e.message||'Intenta de nuevo en un momento.')}</p>${e.code==='quota'?'<button class="btn pri" data-prem>Ver Premium</button>':''}</div>`;m.querySelector('[data-prem]')?.addEventListener('click',()=>typeof premSheet==='function'&&premSheet());return;}
 clearInterval(tm);lis.forEach(x=>x.classList.add('done'));await new Promise(r=>setTimeout(r,RM?0:250));
 LAST[R.id]=R;m.innerHTML=report(R);wire(m,R);m.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});typeof addXP==='function'&&addXP(5);}

/* ---------- informe de 10 secciones ---------- */
const cite=(s,id)=>esc(s).replace(/\[(\d{1,3})\]/g,(x,n)=>`<a class="in37c" href="#${id}-f${n}" data-f="${n}">${n}</a>`);
const line=(o,id)=>`<li>${cite(o.t,id)}${o.unverified?' <em class="in37uv" title="Esta frase contiene una cifra que no aparece en los datos calculados. Revísala.">cifra no verificada</em>':''}</li>`;
function report(R){const id='in37'+R.id,A=R.ai,S=R.señales||[];
 const sec=(n,t,body,cls='')=>`<section class="in37s ${cls}" style="--i:${n}"><h4><span>${n}</span>${t}</h4>${body}</section>`;
 const list=(arr,fb)=>arr&&arr.length?`<ul>${arr.map(o=>line(o,id)).join('')}</ul>`:fb;
 const sigl=kind=>{const L=S.filter(s=>s.kind===kind);return L.length?`<ul>${L.map(s=>`<li>${esc(s.text)} <a class="in37c" href="#${id}-f${s.ref}" data-f="${s.ref}">${s.ref}</a></li>`).join('')}</ul>`:'<p class="note">No se detectaron con los datos disponibles.</p>';};
 const byMod={};R.datos.forEach(f=>(byMod[f.mod]||=[]).push(f));const mlabel=k=>(MODS&&MODS.find(x=>x.k===k)||{}).label||k;
 const datos=Object.entries(byMod).map(([k,L])=>`<tbody><tr class="in37g"><th colspan="4">${ic(ICONS[k]||'check','',false)} ${esc(mlabel(k))}</th></tr>${L.map(f=>`<tr id="${id}-f${f.id}"><td class="mono">${f.id}</td><td><b>${esc(f.label)}</b><small>${esc(f.src)}${f.date?' · '+esc(f.date):''}</small></td><td class="mono">${esc(f.value)}</td><td><span class="in37t ${TYPE[f.type]?.[1]||'h'}">${TYPE[f.type]?.[0]||f.type}</span></td></tr>`).join('')}</tbody>`).join('');
 return `<article class="in37r" id="${id}"><header class="in37top"><div><small>Lucioni Intelligence · Informe financiero</small><h3>${esc(R.q)}</h3><p>${fdt(R.at)} · ${R.mods.length} módulos · ${R.datos.length} datos${R.model?` · redactado con ${esc(R.model)}`:''}</p></div><div class="in37acts"><button class="btn" data-pdf>${ic('film','',false)} PDF</button><button class="btn" data-perm>Permisos y registro</button></div></header>
 ${R.aiError?`<p class="in37warn">${esc(R.aiError)}</p>`:''}${R.message?`<p class="in37warn">${esc(R.message)}</p>`:''}
 ${sec(1,'Resumen ejecutivo',A&&A.resumen.t?`<p class="in37sum">${cite(A.resumen.t,id)}${A.resumen.unverified?' <em class="in37uv">cifra no verificada</em>':''}</p>`:`<p>${S.length?`Detectamos ${S.filter(s=>s.kind==='fortaleza').length} fortalezas y ${S.filter(s=>s.kind==='riesgo').length} riesgos con reglas fijas sobre tus datos. Revisa cada sección.`:'Sin datos suficientes para un resumen.'}</p>`)}
 ${sec(2,'Datos utilizados',R.datos.length?`<details open><summary>${R.datos.length} datos de ${Object.keys(byMod).length} módulos · hecho, estimación o simulación</summary><div class="in37tw"><table class="in37d">${datos}</table></div></details>`:'<p class="note">Ningún dato disponible.</p>')}
 ${sec(3,'Situación actual',list(A&&A.situacion,`<ul>${R.datos.slice(0,6).map(f=>`<li>${esc(f.label)}: <b>${esc(f.value)}</b> <a class="in37c" href="#${id}-f${f.id}" data-f="${f.id}">${f.id}</a></li>`).join('')}</ul>`))}
 <div class="in37two">${sec(4,'Fortalezas',list(A&&A.fortalezas,sigl('fortaleza')),'pos')}${sec(5,'Riesgos',list(A&&A.riesgos,sigl('riesgo'))+(R.desactualizado.length?`<div class="in37stale"><b>Datos posiblemente desactualizados</b><ul>${R.desactualizado.map(s=>`<li>${esc(s.text)}</li>`).join('')}</ul></div>`:''),'neg')}</div>
 ${sec(6,'Oportunidades',list(A&&A.oportunidades,R.escenarios.length?`<ul>${R.escenarios.map(s=>`<li>${esc(s.name)}: ${esc(s.result)}</li>`).join('')}</ul>`:'<p class="note">Sin datos suficientes.</p>'))}
 ${sec(7,'Escenarios',R.escenarios.length?`<div class="in37sc">${R.escenarios.map((s,i)=>`<div class="in37scn" style="--i:${i}"><span class="in37t s">Simulación</span><b>${esc(s.name)}</b><small>Supuesto: ${esc(s.assume)}</small><p>${esc(s.result)}</p></div>`).join('')}</div>${A&&A.escenarios.length?`<ul class="in37sct">${A.escenarios.map(o=>line(o,id)).join('')}</ul>`:''}<p class="note">Cálculos hipotéticos de Lucioni Capital con tus datos; no son pronósticos.</p>`:'<p class="note">Agrega más datos para simular escenarios.</p>')}
 ${sec(8,'Recomendaciones educativas',A&&A.recomendaciones.length?`<ol class="in37rec">${A.recomendaciones.map(r=>`<li>${r.when?`<span class="in37when">${esc(r.when)}</span>`:''}<b>${cite(r.t,id)}</b>${r.why?`<small>${cite(r.why,id)}</small>`:''}${r.unverified?' <em class="in37uv">cifra no verificada</em>':''}</li>`).join('')}</ol>`:'<p class="note">Sin recomendaciones redactadas en este informe. Usa los riesgos y escenarios de arriba como guía.</p>')}
 ${sec(9,'Datos faltantes',R.faltantes.length?`<ul class="in37miss">${R.faltantes.map(x=>`<li><span>${esc(mlabel(x.mod))}: ${esc(x.what)}</span><button class="btn" data-go="${x.mod}">Completar en ${esc(x.where)}</button></li>`).join('')}</ul>`:'<p>No falta información en los módulos elegidos.</p>')}
 ${sec(10,'Fuentes y fechas',`<ul class="in37src">${R.fuentes.map(s=>`<li><b>${esc(s.src)}</b>${s.dates.length?` · ${s.dates.map(esc).join(', ')}`:''}</li>`).join('')}</ul><p class="note">Hechos: datos registrados por ti o publicados por la fuente. Estimaciones: proyecciones oficiales o valores declarados. Simulaciones: cálculos hipotéticos. Información educativa; no es asesoría financiera ni tributaria y Lucioni Capital no ejecuta operaciones.</p>`)}
 </article>`;}
function wire(m,R){m.querySelectorAll('.in37c').forEach(a=>a.onclick=e=>{e.preventDefault();const row=m.querySelector(a.getAttribute('href'));if(!row)return;const d=row.closest('details');if(d)d.open=true;row.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});row.classList.remove('hl');void row.offsetWidth;row.classList.add('hl');});
 m.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>GO[b.dataset.go]?.());
 m.querySelector('[data-pdf]')?.addEventListener('click',()=>pdf(R));m.querySelector('[data-perm]')?.addEventListener('click',permSheet);}

/* ---------- PDF ---------- */
function pdf(R){let P=$('#pr37');if(!P){P=document.createElement('div');P.id='pr37';document.body.appendChild(P);}
 P.innerHTML=`<div class="pr37head"><b>Lucioni Capital</b><span>Informe financiero · ${fdt(R.at)}</span></div>`+report(R);P.querySelectorAll('details').forEach(d=>d.open=true);P.querySelectorAll('.in37acts').forEach(x=>x.remove());
 const prev=document.title;document.title=`Lucioni Capital — Informe financiero — ${new Date(R.at).toISOString().slice(0,10)}`;document.documentElement.classList.add('pr37');
 const done=()=>{document.documentElement.classList.remove('pr37');document.title=prev;removeEventListener('afterprint',done);};addEventListener('afterprint',done);setTimeout(()=>{window.print();setTimeout(done,1500);},60);}

/* ---------- permisos, registro de uso e informes anteriores ---------- */
async function permSheet(){if(!IN||!member()||!tokI()){openAccount();return;}
 openSheet(`<div class="in37sheet"><h3>Lucioni Intelligence</h3><p class="note">Permisos por módulo, uso de IA de hoy y registro de cada análisis. Todo se guarda en tu cuenta y se incluye en la exportación de tus datos.</p><div id="in37P"><div class="ec36sk"><i></i><i></i><i></i></div></div></div>`);
 let C,L,H;try{[C,L,H]=await Promise.all([iapi('consent.get'),iapi('log'),iapi('reports')]);}catch(e){$('#in37P').innerHTML=`<p>${esc(e.message||'No se pudo cargar.')}</p>`;return;}MODS=C.modules;
 const st=x=>x.ok?'<span class="up">Correcto</span>':`<span class="dn">Error${x.code?` (${esc(x.code)})`:''}</span>`;
 $('#in37P').innerHTML=`<h4>Permisos</h4><div class="in37mods">${C.modules.map(x=>`<label class="in37mod ${x.sensitive?'':'pub'}"><input type="checkbox" data-k="${x.k}" ${x.on?'checked':''} ${x.sensitive?'':'disabled'}><span class="in37ic">${ic(ICONS[x.k]||'check','',false)}</span><span><b>${esc(x.label)}</b><small>${x.sensitive?(x.on?`Autorizado${x.at?' el '+new Date(x.at).toLocaleDateString('es-PE'):''}`:'Sin autorización'):'Datos públicos'}</small></span></label>`).join('')}</div>
  <h4>Uso de hoy</h4><div class="ec36g two"><div class="ec36k"><small>Informes completos</small><b class="mono">${L.today.reports} / ${L.today.reportLimit}</b><span>Plan ${L.plan==='premium'?'Premium':'Free'}</span></div><div class="ec36k"><small>Consultas de IA</small><b class="mono">${L.today.ai} / ${L.today.aiLimit}</b><span>Se reinicia cada día</span></div></div>
  <h4>Informes anteriores</h4>${H.reports.length?`<div class="in37hist">${H.reports.map(r=>`<button class="btn" data-r="${r.id}">${fdt(r.at)} · ${r.mods.length} módulos</button>`).join('')}</div>`:'<p class="note">Aún no tienes informes.</p>'}
  <h4>Registro de uso de IA</h4>${L.log.length?`<div class="ec36tw"><table class="ec36t sm"><thead><tr><th>Fecha</th><th>Módulos</th><th>Modelo</th><th class="r">Tokens</th><th class="r">Duración</th><th>Estado</th></tr></thead><tbody>${L.log.slice(0,20).map(x=>`<tr><td>${fdt(x.t)}</td><td>${(x.mods||[]).length}</td><td>${esc(x.model||'—')}</td><td class="r mono">${(x.tin||0)+(x.tout||0)}</td><td class="r mono">${((x.ms||0)/1000).toFixed(1)} s</td><td>${st(x)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="note">Sin registros todavía.</p>'}`;
 $$('#in37P input[data-k]').forEach(x=>x.onchange=async()=>{try{MODS=(await iapi('consent.set',{mods:{[x.dataset.k]:x.checked}})).modules;toast(x.checked?'Permiso concedido':'Permiso retirado',ic('check','',false));const s=x.closest('label').querySelector('small');s.textContent=x.checked?'Autorizado hoy':'Sin autorización';}catch(e){x.checked=!x.checked;toast(e.message||'No se pudo guardar');}});
 $$('#in37P [data-r]').forEach(b=>b.onclick=()=>{const R=H.reports.find(r=>r.id===b.dataset.r);if(!R)return;closeSheet();setView('chat');const ch=$('#chat'),m=document.createElement('div');m.className='msg a in37m';ch.appendChild(m);m.innerHTML=report(R);wire(m,R);setTimeout(()=>m.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'}),200);});}

/* ---------- integración: el Copilot decide; no hay un segundo chatbot ---------- */
const _ask37=ask;ask=async function(t,again){const q=(t||$('#cq')?.value||'').trim();if(q&&!again&&INTEL_RE.test(q)){$('#cq').value='';return intelAsk(q);}return _ask37.apply(this,arguments);};
const Q='Analiza mi situación financiera completa y ayúdame a identificar qué debería mejorar durante los próximos 12 meses';
{const a=$('#cp32a');if(a&&!$('#in37a')){const b=document.createElement('button');b.id='in37a';b.className='pill in37pill';b.innerHTML=`${ic('target','',false)} Informe financiero completo`;b.onclick=()=>ask(Q);a.querySelector('span')?.after(b);const p=document.createElement('button');p.className='pill';p.id='in37pp';p.innerHTML=`${ic('stop','',false)} Permisos de IA`;p.onclick=permSheet;b.after(p);}}
{const g=[...document.querySelectorAll('#pro30 .pg30')].find(x=>/Intelligence/.test(x.textContent));if(g&&!$('#in37pro')){const b=document.createElement('button');b.className='pt30';b.id='in37pro';b.innerHTML=`${ic('target','',false)}<span><b>Intelligence Network</b><small>Informe de tu situación completa: finanzas, deudas, patrimonio, inversiones, inmuebles, jubilación, metas y economía</small></span>${ic('right','',false)}`;b.onclick=()=>{setView('chat');setTimeout(()=>ask(Q),300);};g.querySelector('h3').after(b);}}
window.IN37={INTEL_RE,report,permSheet,LAST,Q};
}
