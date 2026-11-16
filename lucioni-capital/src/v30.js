
/* ===================== V30: servicios compartidos, Lucioni Pro (categorías) y Lucioni Terminal ===================== */
{
const WEB30=!!window.LC_API;
/* caché de sesión para no repetir consultas (los datos ya traen su propia caché en el servidor) */
const C30=new Map();
async function J30(u,ttl=60000,ms=12000){const h=C30.get(u);if(h&&Date.now()-h.t<ttl)return h.v;const c=new AbortController(),tm=setTimeout(()=>c.abort(),ms);
  try{const r=await fetch(u,{signal:c.signal});const d=await r.json().catch(()=>null);if(!r.ok||!d)throw (d||{code:'http'});C30.set(u,{t:Date.now(),v:d});return d;}finally{clearTimeout(tm);}}
async function pool30(items,n,fn){const out=new Array(items.length);let i=0;await Promise.all(Array.from({length:Math.min(n,items.length)},async()=>{while(i<items.length){const k=i++;try{out[k]=await fn(items[k],k);}catch(e){out[k]=null;}}}));return out;}
const big30=v=>{if(v==null||!isFinite(v))return '—';const a=Math.abs(v),s=v<0?'-':'';return a>=1e12?s+'$'+(a/1e12).toFixed(2)+' bill.':a>=1e9?s+'$'+(a/1e9).toFixed(1)+' mil M':a>=1e6?s+'$'+(a/1e6).toFixed(1)+' M':s+'$'+Math.round(a).toLocaleString('en-US');};
const pc30=(v,d=1)=>v==null||!isFinite(v)?'—':(v>=0?'+':'')+v.toFixed(d)+'%';
const cls30=v=>v==null?'':v>=0?'up':'dn';
const hhmm=t=>new Date(t).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
/* estadística de series: rendimientos, volatilidad anual, caída máxima */
function stats30(pts){if(!pts||pts.length<6)return null;const c=pts.map(p=>p[1]),r=[];for(let i=1;i<c.length;i++)r.push(c[i]/c[i-1]-1);
  const yrs=(pts.at(-1)[0]-pts[0][0])/(365.25*864e5)||1,per=(c.length-1)/yrs,m=r.reduce((a,b)=>a+b,0)/r.length,sd=Math.sqrt(r.reduce((a,b)=>a+(b-m)**2,0)/Math.max(1,r.length-1));
  let pk=c[0],dd=0;c.forEach(v=>{pk=Math.max(pk,v);dd=Math.min(dd,v/pk-1);});
  const dn=Math.sqrt(r.filter(x=>x<0).reduce((a,b)=>a+b*b,0)/Math.max(1,r.length));
  return {ret:c.at(-1)/c[0]-1,cagr:Math.pow(c.at(-1)/c[0],1/yrs)-1,vol:sd*Math.sqrt(per),dvol:dn*Math.sqrt(per),mdd:dd,per,r,yrs};}
/* alinea varias series semanales por fecha (para correlación y beta) */
function align30(series){const keys=series.map(s=>new Map(s.map(p=>[Math.round(p[0]/(7*864e5)),p[1]])));const common=[...keys[0].keys()].filter(k=>keys.every(m=>m.has(k))).sort((a,b)=>a-b);return keys.map(m=>common.map(k=>m.get(k)));}
const rets30=c=>c.slice(1).map((v,i)=>v/c[i]-1);
function corr30(a,b){const n=Math.min(a.length,b.length);if(n<5)return null;const ma=a.reduce((x,y)=>x+y,0)/n,mb=b.reduce((x,y)=>x+y,0)/n;let sab=0,sa=0,sb=0;for(let i=0;i<n;i++){sab+=(a[i]-ma)*(b[i]-mb);sa+=(a[i]-ma)**2;sb+=(b[i]-mb)**2;}return sab/Math.sqrt(sa*sb||1);}
function beta30(a,m){const n=Math.min(a.length,m.length);if(n<5)return null;const ma=a.reduce((x,y)=>x+y,0)/n,mm=m.reduce((x,y)=>x+y,0)/n;let c=0,v=0;for(let i=0;i<n;i++){c+=(a[i]-ma)*(m[i]-mm);v+=(m[i]-mm)**2;}return c/(v||1);}
/* gráfico de líneas SVG (varias series) */
function lines30(series,{w=640,h=220,norm=false,labels=true,fmt=v=>v.toFixed(0),xfmt=null}={}){const S=series.filter(s=>s.pts&&s.pts.length>1);if(!S.length)return '';
  const data=S.map(s=>({...s,pts:norm?s.pts.map(p=>[p[0],p[1]/s.pts[0][1]*100]):s.pts}));const xs=data.flatMap(s=>s.pts.map(p=>p[0])),ys=data.flatMap(s=>s.pts.map(p=>p[1]));
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),pd={l:8,r:labels?52:8,t:10,b:20};const X=x=>pd.l+(x-x0)/((x1-x0)||1)*(w-pd.l-pd.r),Y=y=>pd.t+(1-(y-y0)/((y1-y0)||1))*(h-pd.t-pd.b);
  const grid=[0,.5,1].map(f=>{const v=y0+(y1-y0)*f;return `<line class="g30" x1="${pd.l}" x2="${w-pd.r}" y1="${Y(v)}" y2="${Y(v)}"/>${labels?`<text class="t30" x="${w-pd.r+6}" y="${Y(v)+4}">${fmt(v)}</text>`:''}`;}).join('');
  return `<svg class="l30" viewBox="0 0 ${w} ${h}" role="img" aria-label="Gráfico">${grid}${data.map((s,i)=>`<path class="ln30" pathLength="1" style="stroke:${s.color||COLORS[i%COLORS.length]};animation-delay:${i*90}ms" d="${s.pts.map((p,j)=>(j?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join('')}"/>`).join('')}<text class="t30" x="${pd.l}" y="${h-4}">${xfmt?xfmt(x0):new Date(x0).toLocaleDateString('es-PE',{month:'short',year:'2-digit'})}</text><text class="t30" x="${w-pd.r}" y="${h-4}" text-anchor="end">${xfmt?xfmt(x1):new Date(x1).toLocaleDateString('es-PE',{month:'short',year:'2-digit'})}</text></svg>`;}
/* mapa de árbol (squarified) para el mapa de calor */
function treemap30(items,W,H){const out=[];const tot=items.reduce((a,b)=>a+b.v,0)||1;const scale=W*H/tot;const it=items.map(x=>({...x,_a:x.v*scale})).sort((a,b)=>b._a-a._a);
  let x=0,y=0,w=W,h=H,row=[];const worst=(r,s)=>{const sum=r.reduce((a,b)=>a+b._a,0),mx=Math.max(...r.map(z=>z._a)),mn=Math.min(...r.map(z=>z._a));return Math.max(s*s*mx/(sum*sum),sum*sum/(s*s*mn));};
  const lay=r=>{const sum=r.reduce((a,b)=>a+b._a,0);if(w>=h){const cw=sum/h;let yy=y;r.forEach(z=>{const ch=z._a/cw;out.push({...z,x,y:yy,w:cw,h:ch});yy+=ch;});x+=cw;w-=cw;}else{const rh=sum/w;let xx=x;r.forEach(z=>{const cw=z._a/rh;out.push({...z,x:xx,y,w:cw,h:rh});xx+=cw;});y+=rh;h-=rh;}};
  for(const z of it){const s=Math.min(w,h);if(!row.length||worst([...row,z],s)<=worst(row,s))row.push(z);else{lay(row);row=[z];}}if(row.length)lay(row);return out;}
window.L30={J30,pool30,big30,pc30,cls30,stats30,align30,rets30,corr30,beta30,lines30,treemap30,C30};

/* ---------- registro de vistas nuevas ---------- */
function mkView(v,id,title,html){VIEWS[v]=[id];V2ID[v]=id;ID2V[id]=v;VTITLE[v]=title;const s=document.createElement('section');s.className='sec vhide p30';s.id=id;s.dataset.sec=v;s.innerHTML=html;
  const b=document.createElement('div');b.className='backbar';b.innerHTML=`<button class="backb" aria-label="Volver">${ic('right','',false)}<span>Lucioni Pro</span></button><span class="crumb">${title}</span>`;s.prepend(b);b.querySelector('button').onclick=()=>setView(v==='pro'?'inicio':'pro');
  const anchor=document.getElementById('deudas')||document.querySelector('footer.foot');anchor.parentNode.insertBefore(s,anchor);return s;}
window.mkView30=mkView;

/* ---------- Lucioni Pro: herramientas agrupadas por categoría (solo herramientas que existen) ---------- */
const PRO=[['Markets','Mercados',[['terminal','alcista','Lucioni Terminal','Índices del mundo, mapa de calor, sectores, resultados, materias primas y divisas',()=>setView('terminal')],['stocks','accion','Empresas en vivo','+600 empresas con ficha, gráficos y fundamentales',()=>setView('stocks')],['ideas','target','Ideas de inversión','Acciones que destacan hoy según analistas y valuación',()=>setView('ideas')]]],
 ['Research','Investigación',[['research','search','Deep Research','Informe completo de una empresa con fuentes y Lucioni Verdict',()=>setView('research')],['screen','etf','Screener','Filtros por valuación, crecimiento y dividendos (Mesa del inversor)',()=>{setView('desk');setTimeout(()=>deskGo('screen'),200);}],['insider','news','Insider e institucionales','13F de grandes inversores y operaciones del Congreso (Mesa del inversor)',()=>{setView('desk');setTimeout(()=>deskGo('copy'),200);}]]],
 ['Analysis','Análisis',[['risk','volatilidad','Riesgo de cartera','Volatilidad, beta, correlación y pruebas de estrés de tu cartera real',()=>{setView('port');}],['dcf','calc','Valoración DCF','Flujo de caja descontado desde la ficha de cada empresa',()=>setView('stocks')],['bt','compuesto','Backtest','5 años de datos reales para cualquier cartera',()=>{setView('tools');setTimeout(()=>window.tool&&tool('bt'),250);}]]],
 ['Intelligence','Inteligencia',[['chat','chat','AI Copilot','Analiza tu cartera, compara empresas y simula escenarios con fuentes',()=>setView('chat')],['watch','bell','Watchtower','Alertas de precio, máximos, resultados, noticias, volatilidad y cartera',()=>setView('watch')]]],
 ['Practice','Práctica',[['play','buy','Simulador','$10,000 virtuales, órdenes límite y stop',()=>setView('play')],['diary','book','Diario de inversión','Anota tu tesis y revisa tus decisiones',()=>{setView('play');setTimeout(()=>$('#diary')?.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],['goals','target','Metas','Probabilidad real de lograr cada objetivo',()=>setView('goals')]]],
 ['Reports','Informes',[['report','film','Informe de empresa en PDF','Desde Deep Research: portada, tablas, fuentes y metodología',()=>setView('research')]]]];
const pro=mkView('pro','pro','Lucioni Pro',`<div class="sh"><div><h2>Lucioni <em>Pro</em></h2><p>Las herramientas profesionales de la plataforma, ordenadas por lo que quieres hacer. Todas usan datos reales y muestran su fuente.</p></div></div><div class="pro30" id="pro30"></div>`);
pro.querySelector('.backb span').textContent='Inicio';
$('#pro30').innerHTML=PRO.map(([en,es,its],g)=>`<div class="pg30" style="--i:${g}"><h3><span>${en}</span><small>${es}</small></h3>${its.map(([k,i,t,d],j)=>`<button class="pt30" data-g="${g}" data-j="${j}">${ic(i,'',false)}<span><b>${t}</b><small>${d}</small></span>${ic('right','',false)}</button>`).join('')}</div>`).join('');
$$('#pro30 .pt30').forEach(b=>b.onclick=()=>PRO[+b.dataset.g][2][+b.dataset.j][4]());
/* acceso desde el menú del logo y el inicio */
{const cols=$('#menu .mcols');if(cols){const col=document.createElement('div');col.className='mcol';col.innerHTML=`<h4>Lucioni Pro</h4>`+[['alcista','Terminal','Índices, mapa de calor y sectores','terminal'],['search','Deep Research','Informe completo de una empresa','research'],['bell','Watchtower','Tus alertas inteligentes','watch'],['chat','AI Copilot','Analiza, compara y simula','chat'],['star','Todas las herramientas Pro','Por categoría','pro']].map(([i,t,d,v])=>`<button class="mi2" role="menuitem" data-v30="${v}">${ic(i,'',false)}<span>${t}<small>${d}</small></span></button>`).join('');cols.prepend(col);col.querySelectorAll('[data-v30]').forEach(b=>b.onclick=()=>{closeMenu();setTimeout(()=>setView(b.dataset.v30),80);});}}
{const hub=$('#hub .hubg');if(hub){const t=document.createElement('button');t.className='htile wide dk';t.dataset.v='pro';t.innerHTML=`<span class="hwtxt"><span class="hk">Lucioni Pro · herramientas profesionales</span><h3>Terminal, Deep Research, Watchtower y Copilot</h3><p>Mercados del mundo, informes completos de empresas con fuentes, alertas inteligentes y un asistente que usa tus datos con tu permiso.</p></span><span class="hv"><span class="hgo">Abrir <i data-i="right" data-l="0"></i></span><i data-i="alcista" data-l="0"></i></span>`;hub.prepend(t);hydrate&&hydrate(t);t.onclick=()=>setView('pro');}}

/* ---------- Lucioni Terminal ---------- */
const IDX=[['SPY','S&P 500','EE. UU.'],['QQQ','Nasdaq 100','EE. UU.'],['DIA','Dow Jones','EE. UU.'],['IWM','Russell 2000','EE. UU.'],['EWU','Reino Unido (≈ FTSE 100)','Europa'],['EWG','Alemania (≈ DAX)','Europa'],['EWQ','Francia (≈ CAC 40)','Europa'],['EWJ','Japón (≈ Nikkei 225)','Asia'],['EWH','Hong Kong (≈ Hang Seng)','Asia'],['EEM','Emergentes','Global'],['EWZ','Brasil','Latam'],['EWW','México','Latam'],['EPU','Perú','Latam']];
const CMD=[['GLD','Oro'],['SLV','Plata'],['USO','Petróleo WTI'],['UNG','Gas natural'],['CPER','Cobre'],['DBA','Agrícolas']];
const FXL=[['EUR','Euro'],['GBP','Libra esterlina'],['JPY','Yen japonés'],['CHF','Franco suizo'],['CAD','Dólar canadiense'],['CNY','Yuan chino'],['MXN','Peso mexicano'],['BRL','Real brasileño']];
const term=mkView('terminal','terminal','Terminal',`<div class="sh"><div><h2>Lucioni <em>Terminal</em></h2><p>Mercados del mundo en una pantalla: índices, mapa de calor, sectores, líderes del día, resultados, materias primas y divisas.</p></div></div>
 <div class="tm30bar"><span class="mclock" id="tmClock"></span><span class="tm30src" id="tmSrc">Cotizaciones: Nasdaq, pueden tener hasta 15 min de retraso · Divisas: BCE y BCRP</span><button class="btn" id="tmRef">${ic('clock','',false)} Actualizar</button></div>
 <div class="tm30g">
  <div class="panel tm30idx"><div class="ph30"><h3>Índices del mundo</h3><small>Seguidos mediante ETFs que cotizan en EE. UU. (precio en USD, no puntos del índice)</small></div><div class="tw30" id="tmIdx"></div></div>
  <div class="panel tm30cmp"><div class="ph30"><h3>Comparación de índices · 1 año</h3><small>Base 100 · toca un índice para añadirlo o quitarlo</small></div><div id="tmCmpL" class="lg30"></div><div id="tmCmp"></div></div>
  <div class="panel tm30heat"><div class="ph30"><h3>Mapa de calor</h3><small id="tmHeatN">Las 80 mayores empresas de EE. UU. por capitalización · color = variación del día</small></div><div class="hm30" id="tmHeat"></div></div>
  <div class="panel tm30sec"><div class="ph30"><h3>Sectores hoy</h3><small>Variación ponderada por capitalización</small></div><div id="tmSec"></div></div>
  <div class="panel tm30mov"><div class="ph30"><h3>Líderes del día</h3><small>Empresas de más de US$2.000 millones</small></div><div class="tb30" role="tablist" id="tmMovT"><button class="on" data-m="up">Suben</button><button data-m="dn">Bajan</button><button data-m="act">Más negociadas</button><button data-m="cap">Más grandes</button></div><div id="tmMov"></div></div>
  <div class="panel tm30earn"><div class="ph30"><h3>Calendario de resultados</h3><small>Próximos días hábiles · Nasdaq</small></div><div id="tmEarn"></div></div>
  <div class="panel tm30cmd"><div class="ph30"><h3>Materias primas</h3><small>ETFs que siguen cada materia prima</small></div><div class="tw30" id="tmCmd"></div></div>
  <div class="panel tm30fx"><div class="ph30"><h3>Divisas frente al dólar</h3><small id="tmFxS">Tipos de referencia del BCE · 90 días</small></div><div class="tw30" id="tmFx"></div></div>
 </div>`);
let TM={q:{},h:{},sel:store.get('tmSel',['SPY','EWG','EWJ','EEM']),mov:'up',at:0};
const spk30=(pts,up)=>{if(!pts||pts.length<4)return '<svg class="sp30" viewBox="0 0 80 22"></svg>';const c=pts.slice(-26).map(p=>p[1]),mn=Math.min(...c),mx=Math.max(...c);return `<svg class="sp30 ${up?'up':'dn'}" viewBox="0 0 80 22" preserveAspectRatio="none"><path pathLength="1" d="${c.map((v,i)=>(i?'L':'M')+(i/(c.length-1)*80).toFixed(1)+' '+(20-(v-mn)/((mx-mn)||1)*18).toFixed(1)).join('')}"/></svg>`;};
function tmIdx(){const el=$('#tmIdx');if(!el)return;el.innerHTML=`<table class="t30"><thead><tr><th>Índice</th><th>ETF</th><th class="r">Precio</th><th class="r">Día</th><th class="r hm">1 año</th><th class="r hm">Volatilidad</th><th class="hm"></th></tr></thead><tbody>${IDX.map(([s,n,rg],i)=>{const q=TM.q[s]||{},st=stats30(TM.h[s]);return `<tr class="${TM.sel.includes(s)?'sel':''}" data-s="${s}" style="--i:${i}" tabindex="0"><td><b>${esc(n)}</b><small>${rg}</small></td><td class="mono">${s}</td><td class="r mono">${q.p!=null?usd2(q.p):'<span class="sk30"></span>'}</td><td class="r mono ${cls30(q.pc)}">${pc30(q.pc,2)}</td><td class="r mono hm ${cls30(st&&st.ret)}">${st?pc30(st.ret*100):'—'}</td><td class="r mono hm">${st?(st.vol*100).toFixed(0)+'%':'—'}</td><td class="hm">${spk30(TM.h[s],st&&st.ret>=0)}</td></tr>`;}).join('')}</tbody></table>`;
 el.querySelectorAll('tr[data-s]').forEach(r=>{const tg=()=>{const s=r.dataset.s;TM.sel=TM.sel.includes(s)?TM.sel.filter(x=>x!==s):[...TM.sel,s].slice(-5);store.set('tmSel',TM.sel);tmIdx();tmCmp();};r.onclick=tg;r.onkeydown=e=>{if(e.key==='Enter')tg();};});}
function tmCmp(){const el=$('#tmCmp');if(!el)return;const S=TM.sel.filter(s=>TM.h[s]&&TM.h[s].length).map((s,i)=>({pts:TM.h[s],color:COLORS[i%COLORS.length],s}));
 $('#tmCmpL').innerHTML=S.map(x=>`<span><i style="background:${x.color}"></i>${esc((IDX.find(r=>r[0]===x.s)||[x.s,x.s])[1])} <b class="${cls30(stats30(x.pts)?.ret)}">${pc30(stats30(x.pts)?.ret*100)}</b></span>`).join('');
 el.innerHTML=S.length?lines30(S,{norm:true,fmt:v=>v.toFixed(0)}):`<p class="note">Cargando historial…</p>`;}
function tmHeat(){const el=$('#tmHeat');if(!el)return;if(!CO.length){el.innerHTML='<p class="note">Cargando empresas…</p>';return;}
 const top=[...CO].filter(r=>r.m).sort((a,b)=>b.m-a.m).slice(0,80);const W=el.clientWidth||900,H=Math.max(320,Math.min(520,W*.5));
 const secs={};top.forEach(r=>{(secs[r.sec||'Otros']=secs[r.sec||'Otros']||[]).push(r);});
 const sb=treemap30(Object.entries(secs).map(([k,a])=>({k,v:a.reduce((x,y)=>x+y.m,0),a})),W,H);
 const col=v=>{const a=Math.min(1,Math.abs(v||0)/3);return `color-mix(in oklab, var(${(v||0)>=0?'--up':'--down'}) ${Math.round(18+a*62)}%, var(--well))`;};
 el.style.height=H+'px';el.innerHTML=sb.map(b=>`<div class="hs30" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px"><span class="hsl">${esc(SECES[b.k]||b.k)}</span>${treemap30(b.a.map(r=>({...r,v:r.m})),b.w,b.h).map(t=>`<button class="ht30" data-s="${t.s}" style="left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px;background:${col(t.pc)}" title="${esc(t.n)} · ${pc30(t.pc,2)} · ${big30(t.m)}">${t.w>44&&t.h>26?`<b>${t.s}</b>${t.h>40?`<small>${pc30(t.pc,1)}</small>`:''}`:''}</button>`).join('')}</div>`).join('');
 el.querySelectorAll('.ht30').forEach(b=>b.onclick=()=>{if(member()){setView('stocks');setTimeout(()=>coOpen(b.dataset.s),250);}else openAccount();});
 $('#tmHeatN').textContent=`Las 80 mayores empresas de EE. UU. por capitalización · color = variación del día · ${coAt?'datos de las '+hhmm(coAt):''}`;}
function tmSec(){const el=$('#tmSec');if(!el||!CO.length)return;const g={};CO.forEach(r=>{if(!r.m||r.pc==null)return;const k=r.sec||'Otros';g[k]=g[k]||{m:0,w:0,n:0};g[k].m+=r.m;g[k].w+=r.m*r.pc;g[k].n++;});
 const rows=Object.entries(g).map(([k,v])=>({k,pc:v.w/v.m,n:v.n,m:v.m})).filter(r=>r.n>=3).sort((a,b)=>b.pc-a.pc);const mx=Math.max(.5,...rows.map(r=>Math.abs(r.pc)));
 el.innerHTML=`<div class="sb30">${rows.map((r,i)=>`<div style="--i:${i}"><span>${esc(SECES[r.k]||r.k)} <small>${r.n}</small></span><span class="bar30"><i class="${cls30(r.pc)}" style="--w:${(Math.abs(r.pc)/mx*50).toFixed(1)}%;${r.pc<0?'right:50%':'left:50%'}"></i></span><b class="mono ${cls30(r.pc)}">${pc30(r.pc,2)}</b></div>`).join('')}</div>`;}
function tmMov(){const el=$('#tmMov');if(!el||!CO.length)return;let L=CO.filter(r=>r.m>=2e9&&r.pc!=null);const m=TM.mov;
 L=m==='up'?L.sort((a,b)=>b.pc-a.pc):m==='dn'?L.sort((a,b)=>a.pc-b.pc):m==='act'?L.filter(r=>r.v).sort((a,b)=>b.v*b.p-a.v*a.p):L.sort((a,b)=>b.m-a.m);
 el.innerHTML=`<table class="t30"><thead><tr><th>Empresa</th><th class="r">Precio</th><th class="r">Día</th><th class="r hm">${m==='act'?'Volumen (US$)':'Capitalización'}</th></tr></thead><tbody>${L.slice(0,10).map((r,i)=>`<tr data-s="${r.s}" style="--i:${i}" tabindex="0"><td><span class="nm30">${coLogo(r.s)}<span><b>${r.s}</b><small>${esc(r.n)}</small></span></span></td><td class="r mono">${usd2(r.p)}</td><td class="r mono ${cls30(r.pc)}">${pc30(r.pc,2)}</td><td class="r mono hm">${m==='act'?big30(r.v*r.p):big30(r.m)}</td></tr>`).join('')}</tbody></table>`;
 el.querySelectorAll('tr[data-s]').forEach(r=>r.onclick=()=>{if(member()){setView('stocks');setTimeout(()=>coOpen(r.dataset.s),250);}else openAccount();});}
async function tmEarn(){const el=$('#tmEarn');if(!el||!MKT)return;const ds=[];let k=0;while(ds.length<4&&k<10){const d=new Date(Date.now()+k*864e5);const w=d.getDay();if(w>0&&w<6)ds.push(d.toISOString().slice(0,10));k++;}
 const R=await pool30(ds,2,d=>J30(`${MKT}?earnings=${d}`,600000));
 el.innerHTML=ds.map((d,i)=>{const rows=(R[i]&&R[i].rows||[]).slice(0,6);return `<div class="ed30"><h4>${new Date(d+'T12:00').toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'short'})}</h4>${rows.length?rows.map(r=>`<div class="er30"><span class="nm30">${coLogo(r.s)}<span><b>${esc(r.s)}</b><small>${esc(r.n||'')}</small></span></span><span class="mono">${r.e?'BPA est. '+esc(r.e):''}${r.t==='time-pre-market'?' · antes de la apertura':r.t==='time-after-hours'?' · después del cierre':''}</span></div>`).join(''):'<p class="note">Sin reportes de empresas grandes este día.</p>'}</div>`;}).join('');}
function tmCmdR(){const el=$('#tmCmd');if(!el)return;el.innerHTML=`<table class="t30"><tbody>${CMD.map(([s,n],i)=>{const q=TM.q[s]||{},st=stats30(TM.h[s]);return `<tr style="--i:${i}"><td><b>${n}</b><small>${s}</small></td><td class="r mono">${q.p!=null?usd2(q.p):'—'}</td><td class="r mono ${cls30(q.pc)}">${pc30(q.pc,2)}</td><td class="r mono hm ${cls30(st&&st.ret)}">${st?pc30(st.ret*100)+' 1a':''}</td></tr>`;}).join('')}</tbody></table>`;}
async function tmFx(){const el=$('#tmFx');if(!el||!MKT)return;let F=null,H=null;try{[F,H]=await Promise.all([J30(`${MKT}?fx=1`,3600000),J30(`${MKT}?fxhist=1`,3600000).catch(()=>null)]);}catch(e){el.innerHTML='<p class="note">Sin datos de divisas ahora.</p>';return;}
 const rows=FXL.filter(([c])=>F.rates[c]).map(([c,n])=>{const s=H&&H.series[c]||[];const ch=s.length>1?(s.at(-1)[1]/s[0][1]-1)*100:null;return `<tr><td><b>USD/${c}</b><small>${n}</small></td><td class="r mono">${F.rates[c].toFixed(c==='JPY'?2:4)}</td><td class="r mono hm ${cls30(ch==null?null:-ch)}">${ch==null?'—':pc30(ch,1)+' 90d'}</td><td class="hm">${spk30(s,ch!=null&&ch<=0)}</td></tr>`;});
 if(F.rates.PEN)rows.push(`<tr><td><b>USD/PEN</b><small>Sol peruano · BCRP</small></td><td class="r mono">${F.rates.PEN.toFixed(3)}</td><td class="r mono hm">${esc(F.dates.PEN||'')}</td><td class="hm"></td></tr>`);
 el.innerHTML=`<table class="t30"><tbody>${rows.join('')}</tbody></table>`;$('#tmFxS').textContent=`Tipos de referencia del BCE al ${F.dates.GBP||F.dates.EUR||'—'} · sol: BCRP · verde = el dólar se debilita`;}
async function tmLoad(force){if(!MKT){$('#tmIdx').innerHTML='<p class="note">Disponible en la versión web.</p>';return;}
 if(!force&&Date.now()-TM.at<60000){tmAll();return;}TM.at=Date.now();
 if(!CO.length)coLoad();
 const syms=[...IDX.map(r=>r[0]),...CMD.map(r=>r[0])];
 const qs=await pool30([syms.slice(0,16),syms.slice(16)].filter(a=>a.length),2,a=>J30(`${MKT}?quotes=${a.join(',')}`,force?0:60000));qs.forEach(d=>{if(d&&d.q)Object.assign(TM.q,d.q);});
 $('#tmSrc').textContent=`Cotizaciones: Nasdaq, pueden tener hasta 15 min de retraso · actualizado ${hhmm(Date.now())} · Divisas: BCE y BCRP`;
 tmAll();tmEarn();tmFx();
 await pool30(syms,3,async s=>{if(TM.h[s])return;const d=await J30(`${MKT}?h1y=${s}`,6*3600000);TM.h[s]=d.pts||[];if(VIEW==='terminal'){tmIdx();tmCmdR();tmCmp();}});}
function tmAll(){tmIdx();tmCmp();tmCmdR();tmHeat();tmSec();tmMov();try{$('#tmClock').innerHTML=clockHTML();}catch(e){}}
$('#tmRef').onclick=()=>tmLoad(true);
$$('#tmMovT button').forEach(b=>b.onclick=()=>{$$('#tmMovT button').forEach(x=>x.classList.toggle('on',x===b));TM.mov=b.dataset.m;tmMov();});
/* cuando llega la lista de empresas, se rehace lo que depende de ella */
if(typeof coRender==='function'){const _cr30=coRender;coRender=function(){_cr30.apply(this,arguments);if(VIEW==='terminal'){tmHeat();tmSec();tmMov();}};}
let tmRes=0;addEventListener('resize',()=>{clearTimeout(tmRes);tmRes=setTimeout(()=>{if(VIEW==='terminal')tmHeat();},200);});
setInterval(()=>{if(VIEW==='terminal'&&document.visibilityState==='visible')tmLoad(true);},90000);
const _sv30=setView;setView=function(v,o){_sv30(v,o);if(v==='terminal')tmLoad();};
{const v=ID2V[location.hash.slice(1)];if(['terminal','pro'].includes(v))setTimeout(()=>setView(v,{noHash:true}),0);}
}
