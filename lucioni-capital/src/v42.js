/* ===================== V42: beta — comentarios, reporte de errores y panel de administración (Fase 10) ===================== */
(()=>{
const EV=AUTH?AUTH.replace(/account$/,'event'):null;
const tok=()=>{try{return localStorage.getItem('lc_tok')||'';}catch(e){return '';}};
const plan=()=>member()?((ACC&&ACC.sub&&ACC.sub.plan)||'free'):'anon';
const LIMITS=['Las respuestas de la IA y parte de la interfaz están en español; el inglés cubre la navegación y los módulos principales, y el portugués es una vista previa.',
 'El pago de Premium con Mercado Pago se activa cuando el dueño configura sus claves; mientras tanto, la prueba de 7 días es gratuita y sin tarjeta.','No hay conexión automática con bancos: los movimientos se registran a mano o se importan desde el archivo del banco.',
 'Los precios de mercado provienen de fuentes públicas y pueden tener minutos de retraso.','Las reglas fiscales cubren Perú y EE.UU. y deben revisarse cada año.','Los recordatorios se muestran dentro de la app; aún no se envían por correo.'];
const AREAS=[['general','General'],['finanzas','Mis finanzas'],['mercados','Mercados y gráficos'],['intelligence','Intelligence y Copilot'],['strategy','Strategy Lab'],['documentos','Document Vault'],['impuestos','Tax & Compliance'],['metas','Metas y Life Planner'],['premium','Premium'],['idioma','Idioma y formatos'],['error','Algo no funciona'],['otro','Otro']];

/* ---------- comentarios ---------- */
function feedback(area){const v=typeof VIEW!=='undefined'?VIEW:'';
 openSheet(`<div class="b42"><p class="d29k">Beta</p><h2>Cuéntanos qué mejorar</h2><p class="note">Tu comentario llega al equipo de Lucioni Capital. No incluyas datos personales ni números de cuenta: no guardamos tu correo ni tu cuenta junto al comentario.</p>
  <div class="vt39f"><label>Tema<select class="f" id="b42a">${AREAS.map(([k,l])=>`<option value="${k}" ${k===area?'selected':''}>${l}</option>`).join('')}</select></label><label>¿Qué tan útil te resulta?<div class="b42r" id="b42r" role="radiogroup" aria-label="Calificación">${[1,2,3,4,5].map(n=>`<button type="button" role="radio" aria-checked="false" data-n="${n}" aria-label="${n} de 5">★</button>`).join('')}</div></label></div>
  <label class="vt39full">Comentario<textarea class="f" id="b42t" rows="5" maxlength="1000" placeholder="Qué intentabas hacer, qué pasó y qué esperabas"></textarea></label><small class="note" id="b42c">0 / 1000</small>
  <div class="sl38row"><button class="btn pri" id="b42s">Enviar comentario</button><button class="btn" id="b42x">Cancelar</button></div>
  <details class="b42lim"><summary>Limitaciones conocidas de la beta</summary><ul>${LIMITS.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details></div>`);
 let rating=0;$$('#b42r button').forEach(b=>b.onclick=()=>{rating=+b.dataset.n;$$('#b42r button').forEach(x=>{const on=+x.dataset.n<=rating;x.classList.toggle('on',on);x.setAttribute('aria-checked',+x.dataset.n===rating);});});
 $('#b42t').oninput=e=>{$('#b42c').textContent=`${e.target.value.length} / 1000`;};$('#b42x').onclick=closeSheet;
 $('#b42s').onclick=async()=>{const text=$('#b42t').value.trim();if(text.length<3){toast('Escribe tu comentario');return;}if(!EV){toast('Los comentarios se envían desde la versión web');return;}const b=$('#b42s');b.disabled=true;
  try{const r=await fetch(EV,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({kind:'feedback',area:$('#b42a').value,rating,text,view:v,lang:store.get('lang','es')||'es',plan:plan()})});const d=await r.json().catch(()=>({}));
   if(!r.ok)throw d;closeSheet();toast('¡Gracias! Recibimos tu comentario',ic('check','',false));}catch(e){b.disabled=false;toast(e.message||'No se pudo enviar. Intenta más tarde.');}};}

/* ---------- reporte de errores (solo con estadísticas anónimas aceptadas; sin datos personales) ---------- */
const seen=new Set();let sent=0;
function report(msg,src){if(!EV||store.get('anOk',null)!==true||sent>=5)return;const m=String(msg||'').slice(0,200);if(!m||seen.has(m))return;if(src&&!String(src).startsWith(location.origin)&&!/^(|about:)/.test(String(src)))return;seen.add(m);sent++;
 try{fetch(EV,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({kind:'error',msg:m,view:typeof VIEW!=='undefined'?VIEW:''}),keepalive:true});}catch(e){}}
addEventListener('error',e=>report(e.message,e.filename));addEventListener('unhandledrejection',e=>{const r=e.reason;if(r&&(r.code||r.status))return;report(r&&r.message||String(r),'');});

/* ---------- panel de administración (el servidor decide quién es administrador) ---------- */
async function admin(){openSheet('<div class="b42"><p class="d29k">Administración</p><h2>Panel de la beta</h2><div id="b42adm"><div class="ec36sk"><i></i><i></i><i></i></div></div></div>');
 let d;try{const r=await fetch(EV,{headers:{authorization:'Bearer '+tok()}});d=await r.json();if(!r.ok)throw d;}catch(e){$('#b42adm').innerHTML=`<p>${esc(e.message||'Sin acceso.')}</p>`;return;}
 const H=d.health,pc=v=>v==null?'—':Math.round(v*100)+'%',fd=t=>new Date(t).toLocaleString('es-PE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
 $('#b42adm').innerHTML=`<h3>Integraciones</h3><ul class="b42h">${Object.entries(H).map(([k,v])=>`<li class="${v===true||v>0?'y':'n'}"><span>${v===true?'Configurada':v===false?'Pendiente':v}</span>${esc(k.replace(/_/g,' '))}</li>`).join('')}</ul>
  <h3>Uso</h3><div class="ec36g">${[['Usuarios hoy',d.dau],['Últimos 7 días',d.wau],['Últimos 30 días',d.mau],['Retención día 1',pc(d.d1)],['Retención día 7',pc(d.d7)],['Conversión de prueba (30 días)',pc(d.trialConversion30d)]].map(([l,v])=>`<div class="ec36k"><small>${l}</small><b class="mono">${v??'—'}</b></div>`).join('')}</div>
  <h3>Comentarios recientes (${d.feedback.length})</h3>${d.feedback.length?`<ul class="b42fb">${d.feedback.slice(0,30).map(f=>`<li><b>${esc((AREAS.find(a=>a[0]===f.area)||[0,f.area])[1])}</b>${f.rating?` · ${'★'.repeat(f.rating)}`:''} · ${fd(f.t)} · ${esc(f.plan)} · ${esc(f.view||'')}<p>${esc(f.text)}</p></li>`).join('')}</ul>`:'<p class="note">Sin comentarios todavía.</p>'}
  <h3>Errores más frecuentes (7 días)</h3>${d.errors.length?`<div class="ec36tw"><table class="ec36t sm"><thead><tr><th>Mensaje</th><th class="r">Veces</th><th>Vistas</th><th>Último</th></tr></thead><tbody>${d.errors.map(e=>`<tr><td>${esc(e.msg)}</td><td class="r mono">${e.n}</td><td>${esc(Object.keys(e.views).join(', '))}</td><td>${fd(e.last)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="note">Sin errores reportados.</p>'}
  <p class="note">${esc(d.note||'')}</p>`;}

/* ---------- accesos ---------- */
{const br=document.querySelector('.brand');if(br&&!document.querySelector('.b42tag')){br.insertAdjacentHTML('afterend','<button class="b42tag" type="button" aria-label="Versión beta: enviar un comentario">Beta</button>');document.querySelector('.b42tag').onclick=()=>feedback();}}
{const f=document.querySelector('footer.foot');if(f&&!document.querySelector('#b42foot')){f.insertAdjacentHTML('beforeend','<p id="b42foot" class="b42foot">Lucioni Capital está en beta. <button class="btn" type="button">Enviar un comentario</button></p>');f.querySelector('#b42foot button').onclick=()=>feedback();}}
{const g=$('#pro30');if(g&&!$('#b42pro')){g.insertAdjacentHTML('afterend','<div class="b42pro" id="b42pro"><span>¿Algo no funciona o falta una herramienta?</span><button class="btn" type="button">Enviar un comentario</button></div>');$('#b42pro button').onclick=()=>feedback();}}
new MutationObserver(async()=>{const b=document.querySelector('.f29b');if(!b||b.dataset.v42)return;b.dataset.v42=1;b.insertAdjacentHTML('beforeend','<button class="btn" id="b42pf" type="button">Enviar comentario (beta)</button>');$('#b42pf').onclick=()=>{closeSheet();setTimeout(()=>feedback(),250);};
 if(!EV||!tok())return;try{const r=await fetch(EV+'?me=1',{headers:{authorization:'Bearer '+tok()}});const j=await r.json().catch(()=>({}));if(j.admin&&document.querySelector('.f29b')&&!$('#b42ad')){b.insertAdjacentHTML('beforeend','<button class="btn" id="b42ad" type="button">Panel de administración</button>');$('#b42ad').onclick=()=>{closeSheet();setTimeout(admin,250);};}}catch(e){}}).observe(document.body,{childList:true,subtree:true});
window.B42={feedback,admin,report,LIMITS};
})();
