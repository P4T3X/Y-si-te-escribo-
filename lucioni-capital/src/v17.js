
/* ===================== V17: mi cartera real y reloj de mercado ===================== */
/* ---------- reloj de la bolsa de Nueva York ---------- */
function nyNow(){const f=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());const g=t=>f.find(p=>p.type===t)?.value;
  return {wd:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday')),m:(+g('hour')%24)*60+(+g('minute'))};}
const limaAt=mins=>new Date(Date.now()+mins*60e3).toLocaleTimeString('es-PE',{timeZone:'America/Lima',hour:'numeric',minute:'2-digit'});
const dur=m=>m>=1440?`${Math.floor(m/1440)} d ${Math.floor(m%1440/60)} h`:m>=60?`${Math.floor(m/60)} h ${m%60} min`:`${m} min`;
function mClock(){const {wd,m}=nyNow(),O=570,C=960,wk=wd>=1&&wd<=5;
  if(wk&&m>=O&&m<C)return {k:'open',t:'Bolsa de Nueva York abierta',s:`Cierra en ${dur(C-m)} · ${limaAt(C-m)} hora de Lima`};
  let add=0,d=wd,mm=m;if(wk&&m<O)add=O-m;else{add=1440-m+O;d=(wd+1)%7;while(d===0||d===6){add+=1440;d=(d+1)%7;}}
  const pre=wk&&m>=240&&m<O,post=wk&&m>=C&&m<1200;
  return {k:pre?'pre':post?'post':'closed',t:pre?'Pre-apertura':post?'Después del cierre':'Bolsa de Nueva York cerrada',s:`Abre en ${dur(add)} · ${limaAt(add)} hora de Lima`};}
function clockHTML(){const c=mClock();return `<span class="mdot" data-k="${c.k}"></span><b>${c.t}</b><span>${c.s}</span>`;}
function clocksMount(){['#empresas','#ideas','#cartera'].forEach(id=>{const sec=$(id);if(!sec||sec.querySelector('.mclock'))return;const sh=sec.querySelector('.sh > div');if(!sh)return;const d=document.createElement('div');d.className='mclock';d.setAttribute('role','status');d.innerHTML=clockHTML();sh.appendChild(d);});}
setInterval(()=>$$('.mclock').forEach(e=>e.innerHTML=clockHTML()),30000);

/* ---------- mi cartera real ---------- */
VIEWS.port=['cartera'];V2ID.port='cartera';ID2V.cartera='port';VTITLE.port='Mi cartera';
SYNC.push('rpf');
let RPF=store.get('rpf',[]);if(!Array.isArray(RPF))RPF=[];const PFX={};let pfShown=false;
const savePf=()=>store.set('rpf',RPF);
{const sec=$('#cartera');const b=document.createElement('div');b.className='backbar';b.innerHTML=`<button class="backb" aria-label="Volver al inicio">${ic('right','',false)}<span>Inicio</span></button><span class="crumb">Mi cartera</span>`;sec.prepend(b);b.querySelector('button').onclick=()=>setView('inicio');}
['#nav','#nav2'].forEach(n=>{const ref=$(n+' a[data-p="ideas"]');if(!ref)return;const a=document.createElement('a');a.href='#cartera';a.dataset.p='port';a.textContent='Mi cartera';a.addEventListener('click',e=>{e.preventDefault();setView('port');});ref.after(a);});
$$('#hub .htile[data-v="port"]').forEach(t=>t.addEventListener('click',()=>setView('port')));
{const col=$('#menu .mcol');if(col){const b=document.createElement('button');b.className='mi2';b.setAttribute('role','menuitem');b.innerHTML=`${ic('diversificar','',false)}<span>Mi cartera real<small>Tus acciones con precios en vivo</small></span>`;b.onclick=()=>{closeMenu();setView('port');};const first=col.querySelector('.mi2');if(first)first.after(b);else col.appendChild(b);}}
LOCKS.port=['Mi cartera real','Registra las acciones que tienes en tu bróker y sigue su valor, ganancia y diversificación con precios en vivo.'];
const _rl17=refreshLocks;refreshLocks=function(){_rl17();setLock($('#cartera'),'port',!member());$$('#hub .htile[data-v="port"]').forEach(t=>t.classList.toggle('lockedtile',!member()));};

const pfPrice=s=>{const r=CO.find(x=>x.s===s);if(r)return {p:r.p,pc:r.pc,n:r.n,sec:r.sec};return PFX[s]||null;};
async function pfFetchMissing(){const miss=[...new Set(RPF.map(h=>h.s))].filter(s=>!CO.find(x=>x.s===s)&&!PFX[s]);
  for(const s of miss){try{const r=await fetch(`${MKT}?symbol=${encodeURIComponent(s)}&range=1d`);const d=await r.json();if(r.ok&&d.p!=null)PFX[s]={p:d.p,pc:d.pc,n:(d.n||'').replace(/\s+(Common Stock|Ordinary Shares)$/i,''),sec:d.stats?.Sector?.v||'Otros'};}catch(e){}}
  if(miss.length)pfRender();}
function pfCalc(){const rows=RPF.map((h,i)=>{const q=pfPrice(h.s)||{};const p=q.p??h.c,val=p*h.q,cost=h.c*h.q,day=q.pc!=null?val-val/(1+q.pc/100):0;
  return {...h,i,n:q.n||h.n||'',sec:q.sec||'Otros',p,pc:q.pc,val,cost,pl:val-cost,plp:cost?val/cost-1:0,day,live:!!q.p};});
  const V=rows.reduce((a,r)=>a+r.val,0),Cst=rows.reduce((a,r)=>a+r.cost,0),D=rows.reduce((a,r)=>a+r.day,0);rows.forEach(r=>r.w=V?r.val/V:0);
  const sec={};rows.forEach(r=>sec[r.sec]=(sec[r.sec]||0)+r.val);const hhi=rows.reduce((a,r)=>a+r.w*r.w,0),eff=hhi?1/hhi:0;
  return {rows,V,C:Cst,D,sec:Object.entries(sec).sort((a,b)=>b[1]-a[1]),eff,div:Math.round(Math.min(100,(Math.min(eff,12)/12)*70+Math.min(Object.keys(sec).length,6)/6*30))};}

if(!MKT){$('#pfWrap').innerHTML=`<div class="panel coempty"><h3>Tu cartera con precios en vivo funciona en la versión web</h3><p class="note">Dentro de Claude la página no puede conectarse a fuentes de datos externas. Abre la versión publicada, inicia sesión y registra tus acciones.</p><div class="acts"><a class="btn solid" href="https://lucioni-capital.vercel.app/#cartera" target="_blank" rel="noopener">Abrir Lucioni Capital en la web ${ic('ext','',false)}</a></div></div>`;}
else{$('#pfWrap').innerHTML=`<div class="pfkpis" id="pfK"></div>
  <div class="pfgrid"><div class="panel pfdon"><h4>Por sector</h4><div id="pfDon"></div></div><div class="panel"><h4>Diversificación</h4><div id="pfDiv"></div></div></div>
  <form class="panel pfadd" id="pfF" autocomplete="off"><h4>Agregar una posición</h4><div class="pfrow">
    <div class="pfsym"><label class="l" for="pfS">Acción</label><input class="f" id="pfS" placeholder="Ej: AAPL, Credicorp, Coca-Cola" aria-autocomplete="list" aria-controls="pfSug"><div class="pfsug hidden" id="pfSug" role="listbox"></div></div>
    <div><label class="l" for="pfQ">Cantidad</label><input class="f" id="pfQ" type="number" min="0" step="any" inputmode="decimal" placeholder="10"></div>
    <div><label class="l" for="pfC">Precio promedio ($)</label><input class="f" id="pfC" type="number" min="0" step="any" inputmode="decimal" placeholder="Precio de compra"></div>
    <button class="cta" type="submit">Agregar</button></div><p class="aerr hidden" id="pfE"></p></form>
  <div class="panel pftbl"><div class="pfth"><h4>Tus posiciones</h4><div class="acts"><button class="btn" id="pfCsv">Exportar CSV</button></div></div><div class="tblw"><table><thead><tr><th>Acción</th><th>Cantidad</th><th>Costo prom.</th><th>Precio</th><th>Valor</th><th>Ganancia</th><th>Hoy</th><th>Peso</th><th></th></tr></thead><tbody id="pfB"></tbody></table></div></div>
  <p class="disc">Registro personal: Lucioni Capital no está conectado a tu bróker ni mueve dinero. Precios de fuentes públicas que pueden tener algunos minutos de retraso. Valores en dólares.</p>`;
  let pick=null;const sug=$('#pfSug');
  $('#pfS').addEventListener('input',e=>{pick=null;const q=norm(e.target.value.trim());if(!q||!CO.length){sug.classList.add('hidden');return;}
    const m=CO.filter(r=>norm(r.s+' '+r.n).includes(q)).sort((a,b)=>(norm(b.s)===q)-(norm(a.s)===q)||b.m-a.m).slice(0,6);
    sug.innerHTML=m.map(r=>`<button type="button" role="option" data-s="${esc(r.s)}">${coLogo(r.s)}<b>${esc(r.s)}</b><span>${esc(r.n)}</span><em>${usd2(r.p)}</em></button>`).join('')||'<p class="note" style="padding:10px">Sin coincidencias. Escribe el símbolo exacto.</p>';sug.classList.remove('hidden');
    $$('#pfSug button').forEach(b=>b.onclick=()=>{const r=CO.find(x=>x.s===b.dataset.s);pick=r;$('#pfS').value=`${r.s} · ${r.n}`;$('#pfC').placeholder=`Ahora ${usd2(r.p)}`;sug.classList.add('hidden');$('#pfQ').focus();});});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.pfsym'))sug.classList.add('hidden');});
  $('#pfF').onsubmit=async e=>{e.preventDefault();const err=t=>{$('#pfE').textContent=t;$('#pfE').classList.remove('hidden');};$('#pfE').classList.add('hidden');
    let s=pick?pick.s:$('#pfS').value.trim().split(/[\s·]/)[0].toUpperCase();const q=parseFloat($('#pfQ').value);let c=parseFloat($('#pfC').value);
    if(!/^[A-Z.\-]{1,10}$/.test(s))return err('Elige una acción de la lista o escribe su símbolo.');
    if(!(q>0))return err('Escribe cuántas acciones tienes.');
    if(!pick&&!CO.find(x=>x.s===s)){try{const r=await fetch(`${MKT}?symbol=${encodeURIComponent(s)}&range=1d`);const d=await r.json();if(!r.ok||d.p==null)throw 0;PFX[s]={p:d.p,pc:d.pc,n:d.n,sec:d.stats?.Sector?.v||'Otros'};}catch(x){return err('No encontramos ese símbolo.');}}
    const now=pfPrice(s);if(!(c>0))c=now?.p;
    const ex=RPF.find(h=>h.s===s);if(ex){ex.lots=ex.lots||[{q:ex.q,c:ex.c,t:ex.at||Date.now()}];ex.lots.push({q,c,t:Date.now()});const tq=ex.q+q;ex.c=(ex.c*ex.q+c*q)/tq;ex.q=tq;}else RPF.push({s,n:now?.n||'',q,c,at:Date.now(),lots:[{q,c,t:Date.now()}]});
    savePf();pick=null;$('#pfF').reset();$('#pfC').placeholder='Precio de compra';pfRender(s);SFX.tick&&SFX.tick();toast(`${s} agregada a tu cartera`,ic('check','',false));addXP&&addXP(5);};
  $('#pfCsv').onclick=()=>{const {rows}=pfCalc();const L=[['Simbolo','Nombre','Cantidad','CostoPromedio','Precio','Valor','Ganancia','GananciaPct','Peso']].concat(rows.map(r=>[r.s,r.n,r.q,r.c.toFixed(4),r.p.toFixed(4),r.val.toFixed(2),r.pl.toFixed(2),(r.plp*100).toFixed(2),(r.w*100).toFixed(2)]));
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([L.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')],{type:'text/csv'}));a.download='mi-cartera-lucioni.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);};}

function countUp(el,to,fmt){if(!el)return;const from=+(el.dataset.v||0);el.dataset.v=to;if(!window.gsap||RM){el.textContent=fmt(to);return;}const o={v:from};gsap.to(o,{v:to,duration:1,ease:'expo.out',onUpdate:()=>el.textContent=fmt(o.v)});}
const sgnUsd=v=>(v>=0?'+':'−')+usd2(Math.abs(v));
function pfRender(flash){if(!MKT||!$('#pfK'))return;const P=pfCalc(),first=!pfShown;pfShown=true;
  const kp=(id,l,sub)=>`<div class="pfk"><small>${l}</small><b id="${id}">—</b><span id="${id}s">${sub||''}</span></div>`;
  if(!$('#pfKv'))$('#pfK').innerHTML=kp('pfKv','Valor actual')+kp('pfKc','Invertido')+kp('pfKp','Ganancia total')+kp('pfKd','Hoy');
  countUp($('#pfKv'),P.V,usd2);countUp($('#pfKc'),P.C,usd2);countUp($('#pfKp'),P.V-P.C,sgnUsd);countUp($('#pfKd'),P.D,sgnUsd);
  $('#pfKvs').textContent=`${RPF.length} posicion${RPF.length===1?'':'es'}`;$('#pfKcs').textContent='Costo de compra';
  const tp=P.C?(P.V/P.C-1):0,dp=P.V-P.D?P.D/(P.V-P.D):0;
  $('#pfKps').textContent=pcS(tp*100);$('#pfKps').style.color=$('#pfKp').style.color=`var(${tp>=0?'--up':'--down'})`;$('#pfKds').textContent=pcS(dp*100);$('#pfKds').style.color=$('#pfKd').style.color=`var(${P.D>=0?'--up':'--down'})`;
  if(!P.rows.length){$('#pfB').innerHTML=`<tr><td colspan="9"><p class="note" style="padding:14px 0">Aún no tienes posiciones. Agrega la primera con el formulario de arriba: elige la acción, cuántas tienes y a qué precio las compraste.</p></td></tr>`;$('#pfDon').innerHTML='<p class="note">Agrega acciones para ver tu reparto por sector.</p>';$('#pfDiv').innerHTML='<p class="note">Agrega acciones para medir tu diversificación.</p>';return;}
  $('#pfB').innerHTML=P.rows.sort((a,b)=>b.val-a.val).map(r=>`<tr data-s="${esc(r.s)}" class="${flash===r.s?'pfnew':''}"><td><button class="pfsy" data-s="${esc(r.s)}">${coLogo(r.s)}<span><b>${esc(r.s)}</b><small>${esc(r.n)}</small></span></button></td><td>${+r.q.toFixed(4)}</td><td>${usd2(r.c)}</td><td>${usd2(r.p)}${r.live?'':' <small class="note">sin dato</small>'}</td><td><b>${usd2(r.val)}</b></td>
    <td style="color:var(${r.pl>=0?'--up':'--down'})">${sgnUsd(r.pl)}<small> ${pcS(r.plp*100)}</small></td><td style="color:var(${(r.pc||0)>=0?'--up':'--down'})">${pcS(r.pc)}</td><td><span class="pfw"><i style="width:${(r.w*100).toFixed(1)}%"></i></span>${(r.w*100).toFixed(1)}%</td>
    <td class="pfact"><button class="btn pfed" data-i="${r.i}" aria-label="Editar ${esc(r.s)}" style="padding:6px 12px;font-size:13px;margin-right:6px">Editar</button><button class="ib pfdel" data-i="${r.i}" aria-label="Quitar ${esc(r.s)}">${ic('x','',false)}</button></td></tr>`).join('');
  $$('#pfB .pfsy').forEach(b=>b.onclick=()=>coOpen(b.dataset.s));
  $$('#pfB .pfdel').forEach(b=>b.onclick=()=>{const h=RPF[+b.dataset.i];if(!b._a){b._a=1;b.classList.add('warn');toast(`Toca otra vez para quitar ${h.s}`);setTimeout(()=>{b._a=0;b.classList.remove('warn');},2500);return;}RPF.splice(+b.dataset.i,1);savePf();pfRender();});
  $$('#pfB .pfed').forEach(b=>b.onclick=()=>pfEdit(+b.dataset.i));
  if(first||flash!==undefined)pfDonut(P);else pfDonut(P,true);pfDiv(P);
  if(flash&&window.gsap&&!RM)gsap.from(`#pfB tr[data-s="${flash}"]`,{backgroundColor:'rgba(31,107,79,.18)',duration:1.6});}
function pfEdit(i){const h=RPF[i];openSheet(`<div class="stepin"><h3 style="font-size:22px">Editar ${esc(h.s)}</h3><form id="peF"><label class="l" for="peQ">Cantidad</label><input class="f" id="peQ" type="number" step="any" min="0" value="${h.q}"><label class="l" for="peC">Precio promedio ($)</label><input class="f" id="peC" type="number" step="any" min="0" value="${+h.c.toFixed(4)}"><button class="cta" type="submit" style="width:100%;justify-content:center;margin-top:16px">Guardar</button></form></div>`);
  $('#peF').onsubmit=e=>{e.preventDefault();const q=parseFloat($('#peQ').value),c=parseFloat($('#peC').value);if(!(q>0)||!(c>0))return;h.q=q;h.c=c;h.lots=[{q,c,t:h.at||Date.now()}];savePf();closeSheet();pfRender();};}
function pfDonut(P,quiet){const R=70,C=2*Math.PI*R;let off=0;const segs=P.sec.map(([k,v],i)=>{const f=P.V?v/P.V:0,d=`<circle r="${R}" cx="90" cy="90" fill="none" stroke="${COLORS[i%COLORS.length]}" stroke-width="26" stroke-dasharray="${(f*C).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off*C).toFixed(2)}" data-f="${f}"><title>${SECES[k]||k}: ${(f*100).toFixed(1)}%</title></circle>`;off+=f;return d;}).join('');
  $('#pfDon').innerHTML=`<div class="pfdw"><svg viewBox="0 0 180 180" class="pfsvg" aria-label="Reparto por sector">${segs}<text x="90" y="86" text-anchor="middle" class="pfdt">${P.sec.length}</text><text x="90" y="106" text-anchor="middle" class="pfds">sector${P.sec.length===1?'':'es'}</text></svg>
    <ul class="pfleg">${P.sec.map(([k,v],i)=>`<li><i style="background:${COLORS[i%COLORS.length]}"></i>${SECES[k]||esc(k)}<b>${(v/P.V*100).toFixed(1)}%</b></li>`).join('')}</ul></div>`;
  if(window.gsap&&!RM&&!quiet){gsap.from('#pfDon .pfsvg',{rotate:-90,scale:.85,opacity:0,duration:1,ease:'expo.out',transformOrigin:'50% 50%'});gsap.from('#pfDon circle',{attr:{'stroke-dasharray':`0 ${C}`},duration:1.1,ease:'expo.out',stagger:.08});gsap.from('#pfDon .pfleg li',{x:-10,opacity:0,stagger:.05,duration:.4});}}
function pfDiv(P){const top=[...P.rows].sort((a,b)=>b.w-a.w)[0],tips=[];
  if(P.rows.length<5)tips.push([1,`Tienes ${P.rows.length} acción${P.rows.length===1?'':'es'}. Con 10 a 20 empresas de distintos sectores (o un ETF) reduces mucho el riesgo de que una sola te golpee.`]);
  if(top&&top.w>.25)tips.push([1,`${top.s} pesa ${(top.w*100).toFixed(0)}% de tu cartera. Muchos inversionistas limitan cada acción a 10–20%.`]);
  if(P.sec.length&&P.sec[0][1]/P.V>.5)tips.push([1,`${SECES[P.sec[0][0]]||P.sec[0][0]} es más de la mitad de tu cartera.`]);
  if(!tips.length)tips.push([0,'Buen reparto: ninguna acción ni sector domina tu cartera.']);
  const sc=P.div,col=sc>=70?'--up':sc>=40?'--gold':'--down';
  $('#pfDiv').innerHTML=`<div class="pfscore"><b id="pfDs" style="color:var(${col})">0</b><span>de 100</span></div><div class="pfmeter"><i style="width:0;background:var(${col})" data-w="${sc}"></i></div>
    <p class="note">Equivale a tener ${P.eff.toFixed(1)} posiciones del mismo tamaño.</p><ul class="idwhy">${tips.map(([w,t])=>`<li class="${w?'w':''}">${t}</li>`).join('')}</ul>`;
  countUp($('#pfDs'),sc,v=>Math.round(v));requestAnimationFrame(()=>{const m=$('#pfDiv .pfmeter i');if(m)m.style.width=m.dataset.w+'%';});}

const _sv17=setView;setView=function(v,o){_sv17(v,o);clocksMount();if(v==='port'&&MKT){if(!CO.length)coLoad();else{pfRender();pfFetchMissing();}}};
const _coLoad17=coLoad;coLoad=async function(f){await _coLoad17(f);if(VIEW==='port'){pfRender();pfFetchMissing();}};
setInterval(()=>{if(VIEW==='port'&&MKT&&document.visibilityState==='visible'&&Date.now()-coAt>30000)coLoad();},5000);
/* si la cuenta trae otra cartera al restaurar */
addEventListener('storage',e=>{if(e.key==='lc_rpf'){RPF=store.get('rpf',[]);pfRender();}});
clocksMount();
{const v=ID2V[location.hash.slice(1)];if(v==='port')setView('port',{noHash:true});}
refreshLocks();
