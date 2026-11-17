/* ===================== V43: rol de dueño (CEO) — nombre en dorado, insignia y panel con usuarios registrados ===================== */
(()=>{
const tok=()=>{try{return localStorage.getItem('lc_tok')||'';}catch(e){return '';}};
const EV=AUTH?AUTH.replace(/account$/,'event'):null;
const isCEO=()=>!!(ACC&&!ACCOFF&&ACC.role==='ceo');
/* el rol lo decide el servidor (OWNER_EMAILS); aquí solo se muestra */
function apply(){const on=isCEO();document.documentElement.classList.toggle('ceo43',on);if(!on){document.querySelectorAll('.ceo43b').forEach(e=>e.remove());return;}
 const b=document.querySelector('#accBtn');if(b&&!b.querySelector('.ceo43b')){const tx=b.querySelector('.tx');tx&&tx.insertAdjacentHTML('afterend','<span class="ceo43b" aria-label="CEO">CEO</span>');b.setAttribute('aria-label','Tu cuenta: '+ACC.name+' · CEO de Lucioni Enterprises');}
 const h=document.querySelector('.d29hl h1 em');if(h&&!h.parentElement.querySelector('.ceo43b')){h.classList.add('ceo43n');h.insertAdjacentHTML('afterend',' <span class="ceo43b big" role="button" tabindex="0" title="Abrir el panel CEO">CEO</span>');h.parentElement.querySelector('.ceo43b').onclick=()=>panel();}
 const ac=document.querySelector('.accard h3');if(ac&&!ac.querySelector('.ceo43b')){ac.classList.add('ceo43n');ac.insertAdjacentHTML('beforeend',' <span class="ceo43b big">CEO</span>');ac.closest('.accard').insertAdjacentHTML('afterend','<button class="ceo43go" id="ceoGo"><span><b>Panel CEO</b><small>Usuarios registrados, uso de la app, integraciones, comentarios y errores</small></span><span aria-hidden="true">›</span></button>');document.querySelector('#ceoGo').onclick=()=>{closeSheet();setTimeout(panel,250);};}
 const pf=document.querySelector('.f29 h2');if(pf&&!pf.querySelector('.ceo43b')){pf.classList.add('ceo43n');pf.insertAdjacentHTML('beforeend',' <span class="ceo43b big">CEO</span>');pf.insertAdjacentHTML('afterend','<p class="ceo43sub">CEO · Lucioni Enterprises · Premium permanente y acceso de administración</p>');}}
/* actualiza el rol desde el servidor al abrir la app (por si cambió) */
async function refresh(){if(!AUTH||!tok()||!ACC||ACCOFF)return;try{const r=await fetch(AUTH,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+tok()},body:JSON.stringify({action:'me'})});const d=await r.json();if(r.ok&&d.profile){const was=ACC.role;ACC.role=d.profile.role||'user';ACC.title=d.profile.title||null;ACC.sub=d.profile.sub||ACC.sub;try{localStorage.setItem('lc_acc',JSON.stringify(ACC));}catch(e){}if(was!==ACC.role)apply();}}catch(e){}}
new MutationObserver(()=>{if(isCEO())apply();}).observe(document.body,{childList:true,subtree:true});
apply();setTimeout(refresh,1200);

/* ---------- panel CEO: el panel de administración de la beta + usuarios registrados ---------- */
let U=null;
async function users(box){box.innerHTML='<div class="ec36sk"><i></i><i></i></div>';try{const r=await fetch(EV+'?users=1',{headers:{authorization:'Bearer '+tok()}});U=await r.json();if(!r.ok)throw U;}catch(e){box.innerHTML=`<p>${esc(e.message||'Sin acceso.')}</p>`;return;}draw(box,'');}
function draw(box,q){const L=U.users.filter(u=>!q||(u.name+' '+u.email+' '+u.country).toLowerCase().includes(q.toLowerCase()));const fd=t=>t?new Date(t).toLocaleDateString('es-PE',{day:'numeric',month:'short',year:'numeric'}):'—';
 box.innerHTML=`<div class="ec36g">${[['Usuarios registrados',U.total],['Nuevos en 7 días',U.last7],['Con Premium',U.premium]].map(([l,v])=>`<div class="ec36k"><small>${l}</small><b class="mono">${v}</b></div>`).join('')}</div>
  <div class="sl38row"><input class="f" id="ceoQ" type="search" placeholder="Buscar por nombre, correo o país" aria-label="Buscar usuarios" value="${esc(q)}"><button class="btn" id="ceoCsv">Descargar CSV</button></div>
  <div class="ec36tw"><table class="ec36t sm"><thead><tr><th>Nombre</th><th>Correo</th><th>Registro</th><th>Plan</th><th>País</th><th>Idioma</th></tr></thead><tbody>${L.slice(0,300).map(u=>`<tr><td>${esc(u.name||'—')}</td><td>${esc(u.email)}</td><td>${fd(u.since)}</td><td>${u.plan==='premium'?`<span class="in37t h">Premium${u.source==='owner'?' · dueño':u.source==='trial'?' · prueba':''}</span>`:'Free'}</td><td>${esc(u.country||'—')}</td><td>${esc(u.lang)}</td></tr>`).join('')}</tbody></table></div>
  <p class="note">${L.length>300?`Mostrando 300 de ${L.length}. `:''}Datos de la cuenta únicamente: nunca se muestran contraseñas, finanzas, documentos ni conversaciones. Trátalos como datos personales.</p>`;
 const qi=box.querySelector('#ceoQ');qi.oninput=()=>{const v=qi.value;draw(box,v);const n=box.querySelector('#ceoQ');n.focus();n.setSelectionRange(v.length,v.length);};
 box.querySelector('#ceoCsv').onclick=()=>{const rows=[['nombre','correo','registro','plan','origen','pais','idioma'],...L.map(u=>[u.name,u.email,u.since?new Date(u.since).toISOString().slice(0,10):'',u.plan,u.source||'',u.country,u.lang])].map(r=>r.map(x=>`"${String(x??'').replace(/"/g,'""')}"`).join(','));
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+rows.join('\n')],{type:'text/csv'}));a.download=`lucioni-usuarios-${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);};}
async function panel(){if(!window.B42)return;await B42.admin();const s=document.querySelector('.b42 h2');if(s&&isCEO()){s.innerHTML='Panel <span class="ceo43n">CEO</span>';s.previousElementSibling&&(s.previousElementSibling.textContent='Lucioni Enterprises');}
 const adm=document.querySelector('#b42adm');if(!adm||adm.querySelector('#ceoU'))return;adm.insertAdjacentHTML('afterbegin','<h3>Usuarios registrados</h3><div id="ceoU"></div>');users(adm.querySelector('#ceoU'));}
/* el botón del perfil abre el panel completo */
new MutationObserver(()=>{const b=document.querySelector('#b42ad');if(b&&!b.dataset.v43){b.dataset.v43=1;if(isCEO())b.textContent='Panel CEO';b.onclick=()=>{closeSheet();setTimeout(panel,250);};}}).observe(document.body,{childList:true,subtree:true});
window.CEO43={apply,panel,refresh};
})();
