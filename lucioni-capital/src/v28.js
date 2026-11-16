
/* ===================== V28: Asesor con fuentes reales, gráficos, imágenes y proyecciones ===================== */
{
const C28={tk:[]};
const J28=async(u,ms=9000)=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(u,{signal:c.signal});const d=await r.json().catch(()=>null);if(!r.ok||!d)throw 0;return d;}finally{clearTimeout(t);}};
const NM28={'apple':'AAPL','nvidia':'NVDA','microsoft':'MSFT','tesla':'TSLA','amazon':'AMZN','google':'GOOGL','alphabet':'GOOGL','meta':'META','facebook':'META','netflix':'NFLX','coca cola':'KO','coca-cola':'KO','amd':'AMD','intel':'INTC','disney':'DIS','walmart':'WMT','visa':'V','mastercard':'MA','jpmorgan':'JPM','jp morgan':'JPM','berkshire':'BRK.B','mcdonald':'MCD','nike':'NKE','pfizer':'PFE','boeing':'BA','southern copper':'SCCO','credicorp':'BAP','buenaventura':'BVN','ibm':'IBM','oracle':'ORCL','paypal':'PYPL','uber':'UBER','spotify':'SPOT','starbucks':'SBUX','costco':'COST','broadcom':'AVGO','palantir':'PLTR','mercadolibre':'MELI','mercado libre':'MELI','s&p 500':'VOO','s&p500':'VOO','sp500':'VOO','nasdaq 100':'QQQM','berkshire hathaway':'BRK.B','johnson & johnson':'JNJ','exxon':'XOM','chevron':'CVX','bitcoin':'IBIT','oro':'IAU'};
const STOP28=new Set(['ETF','ETFS','PER','EEUU','USA','IA','AI','BCRP','SEC','PBI','PEN','USD','CEO','IPO','DCF','ROE','ROI','EPS','PE','OK','SUNAT','SMV','BVL','FED','NO','SI','YO','UN','EL','LA','DE','QUE','Y','O','A']);
function tickers28(q){const out=[];const add=s=>{if(s&&!out.includes(s)&&out.length<3)out.push(s);};
  const known=new Set([...CO.map(r=>r.s),...ETFS.map(e=>e[0]),...(typeof IDS!=='undefined'?IDS.map(r=>r.s):[]),...Object.values(NM28)]);
  (q.match(/\$[A-Za-z.]{1,6}/g)||[]).forEach(t=>add(t.slice(1).toUpperCase()));
  (q.match(/\b[A-Z][A-Z.]{0,5}\b/g)||[]).forEach(t=>{if(!STOP28.has(t)&&known.has(t))add(t);});
  const lq=q.toLowerCase();Object.entries(NM28).sort((a,b)=>b[0].length-a[0].length).forEach(([k,s])=>{if(new RegExp('(^|[^a-záéíóúñ])'+k.replace(/[.*+?^${}()|[\]\\&]/g,'\\$&')+'([^a-záéíóúñ]|$)').test(lq))add(s);});
  return out;}
const dom28=u=>{try{return new URL(u).hostname.replace(/^www\./,'');}catch(e){return '';}};
const fav28=d=>`https://icons.duckduckgo.com/ip3/${encodeURIComponent(d)}.ico`;
const num28=v=>{const n=parseFloat(String(v??'').replace(/[$,%\s]/g,''));return isFinite(n)?n:null;};
const fd28=t=>new Date(t).toLocaleDateString('es-PE',{day:'numeric',month:'short',year:'numeric'});

/* proyección estadística a 12 meses con la volatilidad del último año */
function proj28(pts){const c=pts.map(p=>p[1]).filter(v=>v>0);if(c.length<12)return null;
  const yrs=(pts.at(-1)[0]-pts[0][0])/(365.25*864e5)||1,per=(c.length-1)/yrs,r=[];for(let i=1;i<c.length;i++)r.push(Math.log(c[i]/c[i-1]));
  const m=r.reduce((a,b)=>a+b,0)/r.length,sd=Math.sqrt(r.reduce((a,b)=>a+(b-m)**2,0)/(r.length-1)),sig=sd*Math.sqrt(per),mu=.06,p=c.at(-1);
  let pk=c[0],dd=0;c.forEach(v=>{pk=Math.max(pk,v);dd=Math.min(dd,v/pk-1);});
  const at=t=>({m:p*Math.exp(mu*t-.5*sig*sig*t),l68:p*Math.exp(mu*t-.5*sig*sig*t-sig*Math.sqrt(t)),h68:p*Math.exp(mu*t-.5*sig*sig*t+sig*Math.sqrt(t)),l90:p*Math.exp(mu*t-.5*sig*sig*t-1.645*sig*Math.sqrt(t)),h90:p*Math.exp(mu*t-.5*sig*sig*t+1.645*sig*Math.sqrt(t))});
  return {p,sig,ret:p/c[0]-1,dd,y:at(1),band:Array.from({length:13},(_,i)=>({t:pts.at(-1)[0]+i/12*365.25*864e5,...at(i/12)}))};}

async function tkData28(s){const isE=ETFS.some(e=>e[0]===s);
  const [det,h,nw,k8]=await Promise.allSettled([isE?Promise.reject():J28(`${MKT}?symbol=${encodeURIComponent(s)}&range=1d`),J28(`${MKT}?h1y=${encodeURIComponent(s)}`),J28(`${MKT}?news=${encodeURIComponent(s)}`),SEC&&!isE?J28(`${SEC}?k8=${encodeURIComponent(s)}`):Promise.reject()]);
  const d=det.value||{},pts=(h.value&&h.value.pts)||[],st=d.stats||{},E=ETFS.find(e=>e[0]===s),coR=CO.find(r=>r.s===s);
  const p=d.p!=null?d.p:(pts.length?pts.at(-1)[1]:null);if(p==null&&!pts.length)return null;
  const tgt=num28(st.OneYrTarget&&st.OneYrTarget.v);
  return {s,n:(d.n||(coR&&coR.n)||(E&&E[1])||s).replace(/\s+(Common Stock|Class [A-C].*|Ordinary Shares.*)$/i,''),p,pc:d.pc,etf:!!E,stats:st,tgt,pts,pr:proj28(pts),news:((nw.value&&nw.value.rows)||[]).slice(0,3),sec:((k8.value&&k8.value.filings)||[]).slice(0,2),at:Date.now()};}

async function wiki28(q){const t=q.replace(/[¿?¡!.,]/g,' ').replace(/\b(qu[eé]|es|son|un|una|el|la|los|las|de|del|c[oó]mo|funciona|explica(me)?|significa|para|por|me|mi|en|y|o|con|cu[aá]l|diferencia|entre|sobre|dime|ejemplo)\b/gi,' ').replace(/\s+/g,' ').trim().slice(0,80);if(!t)return [];
  const d=await J28(`https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(t)}&gsrlimit=2&prop=extracts|pageimages|info&exintro=1&explaintext=1&exsentences=4&piprop=thumbnail&pithumbsize=360&inprop=url`,6000);
  return Object.values((d.query&&d.query.pages)||{}).sort((a,b)=>a.index-b.index).map(p=>({title:p.title,url:p.fullurl,text:String(p.extract||'').slice(0,600),img:p.thumbnail&&p.thumbnail.source}));}

/* reúne las fuentes reales para la pregunta */
async function research28(q,step){const S=[],cards=[],imgs=[];const add=o=>{o.n=S.length+1;S.push(o);return o.n;};
  let tk=tickers28(q);if(!tk.length&&q.length<90&&/\b(esa|esta|ella|eso|su|sus|la acción|la empresa|y si|entonces)\b/i.test(q))tk=C28.tk;
  const concept=!tk.length||/qu[eé] (es|son|significa)|c[oó]mo funciona|explica|diferencia/i.test(q);
  const fx=/d[oó]lar|tipo de cambio|\bsoles\b|\bpen\b/i.test(q);
  step('Consultando '+[tk.length&&'Nasdaq y la SEC',concept&&'Wikipedia',fx&&'el BCRP'].filter(Boolean).join(', ')+'…');
  const [T,W,F]=await Promise.all([MKT?Promise.all(tk.map(s=>tkData28(s).catch(()=>null))):[],concept?wiki28(q).catch(()=>[]):[],fx&&MKT?J28(`${MKT}?fxpen=1`).catch(()=>null):null]);
  (T||[]).filter(Boolean).forEach(t=>{const sk=Object.values(t.stats).slice(0,9).map(o=>`${o.l}: ${o.v}`).join('; ');
    t.src=add({kind:'Mercado',title:`${t.n} (${t.s}) · cotización y estadísticas`,url:`https://www.nasdaq.com/market-activity/${t.etf?'etf':'stocks'}/${t.s.toLowerCase()}`,snip:`Precio ${t.p!=null?t.p.toFixed(2):'—'} USD${t.pc!=null?` (${t.pc>=0?'+':''}${t.pc.toFixed(2)}% hoy)`:''}. ${sk}`});
    if(t.pr){const P=t.pr;t.calc=add({kind:'Cálculo',title:`Proyección estadística de ${t.s} a 12 meses (Lucioni Capital)`,url:'',snip:`Con datos de 1 año: rendimiento ${(P.ret*100).toFixed(1)}%, volatilidad anual ${(P.sig*100).toFixed(0)}%, caída máxima ${(P.dd*100).toFixed(0)}%. Supuesto de 6% anual: mediana ${P.y.m.toFixed(2)} USD, rango probable (68%) ${P.y.l68.toFixed(2)}–${P.y.h68.toFixed(2)} USD, rango amplio (90%) ${P.y.l90.toFixed(2)}–${P.y.h90.toFixed(2)} USD. Es una estimación, no una predicción garantizada.${t.tgt?` Precio objetivo promedio de analistas a 1 año: ${t.tgt.toFixed(2)} USD.`:''}`});}
    t.news.forEach(a=>add({kind:'Noticia',title:a.t,url:a.u,snip:`${a.p||'Nasdaq'}${a.a?' · '+a.a:''}`}));
    t.sec.forEach(f=>add({kind:'SEC',title:`${t.n}: formulario ${f.form} del ${f.date}`,url:f.url,snip:`Reporte oficial en SEC EDGAR${f.items&&f.items.length?': '+f.items.map(i=>i.t||i.c).join(', '):''}.`}));
    cards.push(t);});
  (W||[]).forEach(w=>{const n=add({kind:'Wikipedia',title:w.title,url:w.url,snip:w.text});if(w.img)imgs.push({...w,n});});
  if(F&&F.last){const l=F.last;add({kind:'BCRP',title:'Tipo de cambio oficial (BCRP)',url:'https://estadisticas.bcrp.gob.pe/estadisticas/series/diarias/resultados/PD04640PD/html',snip:`${F.src}: S/ ${(+l[1]).toFixed(3)} por dólar al ${fd28(l[0])}.`});}
  if(cards.length)C28.tk=cards.map(c=>c.s);
  return {S,cards,imgs};}

/* gráfico: último año + abanico de proyección + objetivo de analistas */
function chart28(t){const pts=t.pts;if(pts.length<8)return '';const P=t.pr,W=560,H=210,pd={l:8,r:58,t:14,b:22};
  const xs=[pts[0][0],P?P.band.at(-1).t:pts.at(-1)[0]],vals=pts.map(p=>p[1]).concat(P?[P.y.l90,P.y.h90]:[]).concat(t.tgt?[t.tgt]:[]);
  const mn=Math.min(...vals)*.97,mx=Math.max(...vals)*1.02,X=x=>pd.l+(x-xs[0])/(xs[1]-xs[0])*(W-pd.l-pd.r),Y=v=>pd.t+(1-(v-mn)/(mx-mn))*(H-pd.t-pd.b);
  const line=pts.map((p,i)=>(i?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join('');
  let fan='';if(P){const B=P.band,poly=(a,b)=>B.map(q=>X(q.t).toFixed(1)+','+Y(q[a]).toFixed(1)).concat(B.slice().reverse().map(q=>X(q.t).toFixed(1)+','+Y(q[b]).toFixed(1))).join(' ');
    fan=`<g class="c28fan"><polygon points="${poly('h90','l90')}" class="f90"/><polygon points="${poly('h68','l68')}" class="f68"/><path class="med" d="${B.map((q,i)=>(i?'L':'M')+X(q.t).toFixed(1)+' '+Y(q.m).toFixed(1)).join('')}"/></g>
    <text class="c28lb" x="${W-pd.r+6}" y="${Y(P.y.h90)+4}">${usd2(P.y.h90)}</text><text class="c28lb" x="${W-pd.r+6}" y="${Y(P.y.m)+4}">${usd2(P.y.m)}</text><text class="c28lb" x="${W-pd.r+6}" y="${Y(P.y.l90)+4}">${usd2(P.y.l90)}</text>`;}
  const tg=t.tgt?`<line class="c28tg" x1="${X(pts.at(-1)[0])}" x2="${W-pd.r}" y1="${Y(t.tgt)}" y2="${Y(t.tgt)}"/><text class="c28lb tg" x="${X(pts.at(-1)[0])+4}" y="${Y(t.tgt)-5}">Objetivo analistas ${usd2(t.tgt)}</text>`:'';
  const xn=X(pts.at(-1)[0]);
  return `<svg class="c28ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Precio de ${esc(t.s)} en el último año y rango proyectado a 12 meses">
   <line class="c28now" x1="${xn}" x2="${xn}" y1="${pd.t}" y2="${H-pd.b}"/><text class="c28ax" x="${xn}" y="${H-6}" text-anchor="middle">Hoy</text>
   <text class="c28ax" x="${pd.l}" y="${H-6}">${fd28(pts[0][0])}</text><text class="c28ax" x="${W-pd.r}" y="${H-6}" text-anchor="end">+12 meses</text>
   ${fan}${tg}<path class="c28ln" pathLength="1" d="${line}"/><circle class="c28dot" r="4" cx="${xn}" cy="${Y(pts.at(-1)[1])}"/>
   <g class="c28hv" style="display:none"><line y1="${pd.t}" y2="${H-pd.b}"/><circle r="4"/><text y="${pd.t+10}"></text></g>
   <rect class="c28hit" x="${pd.l}" y="0" width="${xn-pd.l}" height="${H}" fill="transparent" data-x0="${pts[0][0]}" data-x1="${pts.at(-1)[0]}"/></svg>`;}

function card28(t){const P=t.pr,up=t.tgt&&t.p?t.tgt/t.p-1:null;
  return `<div class="c28card" data-sym="${esc(t.s)}"><div class="c28hd">${coLogo(t.s)}<div class="c28nm"><b>${esc(t.n)}</b><small>${esc(t.s)}${t.etf?' · ETF':''}</small></div>
   <div class="c28px"><b>${t.p!=null?usd2(t.p):'—'}</b>${t.pc!=null?`<small class="${t.pc>=0?'up':'dn'}">${t.pc>=0?'+':''}${t.pc.toFixed(2)}% hoy</small>`:''}</div></div>
   ${chart28(t)}
   <div class="c28kp">${P?`<div><small>Último año</small><b class="${P.ret>=0?'up':'dn'}">${pct(P.ret)}</b></div><div><small>Volatilidad anual</small><b>${(P.sig*100).toFixed(0)}%</b></div><div><small>Caída máxima</small><b class="dn">${(P.dd*100).toFixed(0)}%</b></div><div><small>Rango probable 12 m</small><b>${usd2(P.y.l68)}–${usd2(P.y.h68)}</b></div>`:''}${up!=null?`<div><small>Objetivo analistas</small><b>${usd2(t.tgt)} <span class="${up>=0?'up':'dn'}">(${pct(up,0)})</span></b></div>`:''}</div>
   <p class="c28nt">Proyección estadística con la volatilidad del último año y un supuesto de 6% anual: 68% de probabilidad dentro de la banda oscura y 90% en la clara. No es una garantía${t.tgt?'; el objetivo de analistas es su promedio publicado':''}.</p>
   ${MKT?`<button class="btn c28open" data-sym="${esc(t.s)}">Ver ficha completa ${ic('right','',false)}</button>`:''}</div>`;}

function text28(s,S){let h=esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/^\s*[-*]\s+/gm,'• ');
  h=h.replace(/\[(\d{1,2})\](?!\()/g,(m,n)=>{const o=S[n-1];if(!o)return '';return o.url?`<a class="c28ci" href="${esc(o.url)}" target="_blank" rel="noopener" title="${esc(o.title)}">${n}</a>`:`<span class="c28ci" title="${esc(o.title)}">${n}</span>`;});
  return h.replace(/(<\/?(a|span)[^>]*>)\s*(?=<a class="c28ci"|<span class="c28ci")/g,'$1');}

function srcs28(S){if(!S.length)return '';
  return `<details class="c28src" open><summary>Fuentes (${S.length})</summary><ol>${S.map(o=>{const d=o.url?dom28(o.url):'lucionicapital';return `<li><span class="c28n">${o.n}</span>${o.url?`<img src="${fav28(d)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`:`<span class="c28me">${MARK}</span>`}<div>${o.url?`<a href="${esc(o.url)}" target="_blank" rel="noopener">${esc(o.title)}</a>`:`<span>${esc(o.title)}</span>`}<small>${esc(o.kind)} · ${esc(o.url?d:'cálculo propio con datos de Nasdaq')}</small></div></li>`;}).join('')}</ol></details>`;}

function imgs28(I){if(!I.length)return '';return `<div class="c28im">${I.map(w=>`<a href="${esc(w.url)}" target="_blank" rel="noopener"><img src="${esc(w.img)}" alt="${esc(w.title)}" loading="lazy" onerror="this.parentNode.remove()"><span>${esc(w.title)} <i>[${w.n}] Wikipedia</i></span></a>`).join('')}</div>`;}

function wire28(m){m.querySelectorAll('.c28open').forEach(b=>b.onclick=()=>{const s=b.dataset.sym;if(member()&&MKT){setView('stocks');setTimeout(()=>coOpen(s),250);}else openAccount();});
  m.querySelectorAll('.c28ch').forEach(svg=>{const hit=svg.querySelector('.c28hit'),hv=svg.querySelector('.c28hv'),card=svg.closest('.c28card'),t=C28.data[card.dataset.sym];if(!hit||!t)return;
    hit.addEventListener('pointermove',e=>{const r=svg.getBoundingClientRect(),vx=(e.clientX-r.left)/r.width*560;const x0=+hit.getAttribute('x'),w=+hit.getAttribute('width');const f=Math.max(0,Math.min(1,(vx-x0)/w));const i=Math.round(f*(t.pts.length-1)),p=t.pts[i];
      const ys=t.pts.map(q=>q[1]).concat(t.pr?[t.pr.y.l90,t.pr.y.h90]:[]).concat(t.tgt?[t.tgt]:[]),mn=Math.min(...ys)*.97,mx=Math.max(...ys)*1.02,Y=14+(1-(p[1]-mn)/(mx-mn))*(210-36);
      hv.style.display='';const L=hv.querySelector('line'),c=hv.querySelector('circle'),tx=hv.querySelector('text');const xi=x0+(i/(t.pts.length-1))*w;L.setAttribute('x1',xi);L.setAttribute('x2',xi);c.setAttribute('cx',xi);c.setAttribute('cy',Y);tx.setAttribute('x',Math.min(xi+6,380));tx.textContent=`${fd28(p[0])} · ${usd2(p[1])}`;});
    hit.addEventListener('pointerleave',()=>{hv.style.display='none';});});}
C28.data={};

/* pregunta con investigación previa */
ask=async function(t){
  t=(t||$('#cq').value).trim();if(!t)return;$('#cq').value='';
  const ch=$('#chat');ch.insertAdjacentHTML('beforeend',`<div class="msg u">${esc(t)}</div>`);
  if(!sample){ch.insertAdjacentHTML('beforeend',`<div class="msg a">${window.LC_API?'La IA no está disponible ahora. Intenta en un momento.':'La IA funciona cuando abres esta app dentro de Claude.'}</div>`);return;}
  mission('ask');
  const m=document.createElement('div');m.className='msg a c28';m.innerHTML='<div class="c28st"><span class="typing"><span></span><span></span><span></span></span><small>Buscando fuentes…</small></div>';ch.appendChild(m);ch.scrollTop=ch.scrollHeight;
  $('#cs').disabled=true;const step=s=>{const e=m.querySelector('.c28st small');if(e)e.textContent=s;};
  let R={S:[],cards:[],imgs:[]};try{if(MKT&&!CO.length)await Promise.race([coLoad(),new Promise(r=>setTimeout(r,2500))]);}catch(e){}
  try{R=await research28(t,step);}catch(e){}
  R.cards.forEach(c=>C28.data[c.s]=c);
  step(R.S.length?`Redactando con ${R.S.length} fuente${R.S.length>1?'s':''}…`:'Redactando…');
  const hoy=new Date().toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const sys=`Eres el asistente de inversión de Lucioni Capital, una herramienta educativa para inversionistas en Perú. Hoy es ${hoy}. Respondes en español, con precisión y lenguaje profesional pero claro (máx 170 palabras).
Reglas: usa SOLO las fuentes numeradas de abajo para precios, cifras, noticias y fechas, y cita cada dato con [n] justo después (por ejemplo: "cotiza a $190 [1]"). Si un dato no está en las fuentes, dilo y no lo inventes; puedes explicar conceptos con conocimiento general sin cita. Las proyecciones son estimaciones estadísticas, no promesas: preséntalas así. Das pros y contras, nunca prometes ganancias y recuerdas que no es asesoría personalizada cuando sea relevante. Formato: texto simple, puedes usar **negritas** y listas con "- ".`;
  const ctx=R.S.length?`\n\nFUENTES:\n${R.S.map(o=>`[${o.n}] ${o.kind} — ${o.title}${o.url?' ('+dom28(o.url)+')':''}: ${o.snip}`).join('\n')}`:'\n\nFUENTES: ninguna disponible para esta pregunta; responde con conocimiento general y sin cifras de mercado actuales.';
  const prev=HIST.slice(-8);const msgs=[...prev,{role:'user',content:sys+ctx+'\n\nPregunta: '+t}];
  try{
    const r=await sample(msgs,{cache:false,modelTier:'default'});
    const txt=String(r.text||'').trim();
    m.innerHTML=`<div class="c28tx">${text28(txt,R.S)}</div>${R.cards.map(card28).join('')}${imgs28(R.imgs)}${srcs28(R.S)}${R.S.length?`<p class="c28ft">Datos consultados en vivo · ${new Date().toLocaleString('es-PE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · Información educativa, no asesoría financiera</p>`:''}`;
    wire28(m);HIST.push({role:'user',content:t},{role:'assistant',content:txt.replace(/\[\d{1,2}\]/g,'')});if(HIST.length>16)HIST.splice(0,HIST.length-16);
  }catch(e){m.textContent=aiErr(e);}
  finally{$('#cs').disabled=false;m.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});}
};
window.LC28={research28,text28,srcs28,card28,wire28,imgs28,data:C28.data,J28};
/* sugerencias con datos en vivo */
{const sg=$('#sugs');if(sg&&!sg.querySelector('.c28sg')){[['¿Cómo le fue a Nvidia este año y qué proyecta?'],['Compara Apple y Microsoft'],['¿Cuál es el tipo de cambio hoy y cómo afecta invertir en dólares?']].forEach(([q])=>{const b=document.createElement('button');b.className='pill c28sg';b.textContent=q;b.onclick=()=>ask(q);sg.insertBefore(b,$('#askPort'));});}}
}
