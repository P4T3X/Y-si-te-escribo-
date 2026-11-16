
/* ===================== V25: menú sin cortes, buscador y efectos ===================== */
{const items=$('#menu .mitems');
 /* bordes difuminados que indican que hay más opciones al desplazar */
 const fades=()=>{if(!items)return;items.classList.toggle('ft',items.scrollTop>4);items.classList.toggle('fb',items.scrollTop+items.clientHeight<items.scrollHeight-4);};
 if(items)items.addEventListener('scroll',fades,{passive:true});addEventListener('resize',fades);
 /* buscador del menú */
 const mi=$('#menuItems');
 if(mi&&!$('#mFind')){const f=document.createElement('div');f.className='mfind';f.innerHTML=`${ic('search','',false)}<input id="mFind" type="search" placeholder="Busca una herramienta: deudas, backtest, impuestos…" autocomplete="off" aria-label="Buscar en el menú"><kbd>/</kbd>`;mi.prepend(f);
   const nm=document.createElement('p');nm.className='mnone hidden';nm.textContent='Nada coincide. Prueba con otra palabra.';mi.querySelector('.mcols').after(nm);
   const base=new Map();
   const mark=(html,q)=>{const tmp=document.createElement('div');tmp.innerHTML=html;const walk=el=>{[...el.childNodes].forEach(c=>{if(c.nodeType===3){const t=c.textContent,i=norm(t).indexOf(q);if(i>=0){const m=document.createElement('span');m.innerHTML=esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+q.length))+'</mark>'+esc(t.slice(i+q.length));c.replaceWith(...m.childNodes);}}else walk(c);});};walk(tmp);return tmp.innerHTML;};
   const run=()=>{const q=norm($('#mFind').value.trim());let any=0;
     $$('#menu .mcol').forEach(col=>{let n=0;col.querySelectorAll('.mi2').forEach(b=>{const s=b.querySelector('span');if(s&&!base.has(b))base.set(b,s.innerHTML);const h=base.get(b)||'';const ok=!q||norm(b.textContent).includes(q);b.classList.toggle('hidden',!ok);if(ok)n++;if(s)s.innerHTML=q&&ok?mark(h,q):h;});
       const h4=col.querySelector('h4');if(h4)h4.classList.toggle('hidden',!n);any+=n;});
     nm.classList.toggle('hidden',!!any);items.scrollTop=0;fades();};
   $('#mFind').addEventListener('input',run);
   $('#mFind').addEventListener('keydown',e=>{if(e.key==='Enter'){const b=$('#menu .mi2:not(.hidden)');if(b){e.preventDefault();b.click();}}if(e.key==='Escape'&&$('#mFind').value){e.stopPropagation();$('#mFind').value='';run();}});
   const _om25=openMenu;openMenu=function(){_om25();if($('#mFind').value){$('#mFind').value='';run();}items.scrollTop=0;requestAnimationFrame(fades);
     if(window.gsap&&!RM){const its=$$('#menu .mi2');gsap.killTweensOf(its);gsap.killTweensOf('#menu .mcol');gsap.set(its,{clearProps:'transform,opacity'});
       gsap.fromTo('#menu .mcols',{y:12,opacity:0},{y:0,opacity:1,duration:.34,ease:'expo.out',clearProps:'transform,opacity'});
       gsap.fromTo('#menu .mcol h4',{x:-8,opacity:0},{x:0,opacity:1,duration:.4,ease:'expo.out',stagger:.05,delay:.05,clearProps:'transform,opacity'});}};
   document.addEventListener('keydown',e=>{if(e.key==='/'&&menuOpen()&&document.activeElement!==$('#mFind')){e.preventDefault();$('#mFind').focus();}});}}

/* transición suave al cambiar de sección desde la navegación */
{let vtNext=false;document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('#nav a,#nav2 a,.nmenu a,.htile,.backb,.mi2,#gQuick .gq'))vtNext=true;},true);
 const _sv25=setView;setView=function(v,o){const use=vtNext&&document.startViewTransition&&!RM&&!document.body.classList.contains('lite')&&VIEW!==v;vtNext=false;
   if(use){document.startViewTransition(()=>_sv25(v,o));}else _sv25(v,o);
   requestAnimationFrame(()=>{const secs=(VIEWS[v]||[]).map(id=>document.getElementById(id)).filter(Boolean);
     secs.forEach(sec=>{const em=sec.querySelector('.sh h2 em');if(!em)return;const parts=em.querySelectorAll('.wi');if(parts.length)em.classList.remove('shine');(parts.length?[...parts]:[em]).forEach(x=>{x.classList.remove('shine');void x.offsetWidth;x.classList.add('shine');});});
     if(v==='inicio'&&!RM)$$('#hub .htile').forEach((t,i)=>{t.classList.remove('pop');t.style.setProperty('--i',i);void t.offsetWidth;t.classList.add('pop');});});};}
