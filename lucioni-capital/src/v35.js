
/* ===================== V35: herramientas de bróker — gráfico profesional, boleta avanzada y efectos de precio ===================== */
{
const {J30,big30,pc30,cls30}=window.L30;

/* ================= EFECTOS DE PRECIO (suaves, con movimiento reducido respetado) ================= */
const RMx=()=>RM||document.body.classList.contains('lite');
const FX35={
 flash(el,dir){if(!el||RMx())return;el.classList.remove('px35u','px35d');void el.offsetWidth;el.classList.add(dir>0?'px35u':'px35d');},
 tween(el,to,fmt,ms=520){if(!el)return;const from=+el.dataset.v;el.dataset.v=to;if(!isFinite(from)||RMx()||from===to){el.textContent=fmt(to);return;}const t0=performance.now();const step=t=>{const k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3);el.textContent=fmt(from+(to-from)*e);if(k<1)requestAnimationFrame(step);};requestAnimationFrame(step);}};
window.FX35=FX35;

/* ================= MOTOR DE INDICADORES (sin interfaz, probado aparte) ================= */
const LCH={
 sma(a,n){const o=new Array(a.length).fill(null);let s=0;for(let i=0;i<a.length;i++){s+=a[i];if(i>=n)s-=a[i-n];if(i>=n-1)o[i]=s/n;}return o;},
 /* EMA con semilla = SMA de los primeros n valores */
 ema(a,n){const o=new Array(a.length).fill(null),k=2/(n+1);if(a.length<n)return o;let e=a.slice(0,n).reduce((x,y)=>x+y,0)/n;o[n-1]=e;for(let i=n;i<a.length;i++){e=a[i]*k+e*(1-k);o[i]=e;}return o;},
 /* Bandas de Bollinger: media de n y ± k desviaciones estándar poblacionales */
 bb(a,n=20,k=2){const mid=LCH.sma(a,n),up=[],lo=[];for(let i=0;i<a.length;i++){if(mid[i]==null){up.push(null);lo.push(null);continue;}let v=0;for(let j=i-n+1;j<=i;j++)v+=(a[j]-mid[i])**2;const sd=Math.sqrt(v/n);up.push(mid[i]+k*sd);lo.push(mid[i]-k*sd);}return {mid,up,lo};},
 /* RSI de Wilder */
 rsi(a,n=14){const o=new Array(a.length).fill(null);if(a.length<=n)return o;let g=0,l=0;for(let i=1;i<=n;i++){const d=a[i]-a[i-1];if(d>0)g+=d;else l-=d;}g/=n;l/=n;o[n]=l===0?100:100-100/(1+g/l);
  for(let i=n+1;i<a.length;i++){const d=a[i]-a[i-1];g=(g*(n-1)+Math.max(d,0))/n;l=(l*(n-1)+Math.max(-d,0))/n;o[i]=l===0?100:100-100/(1+g/l);}return o;},
 macd(a,f=12,s=26,sg=9){const ef=LCH.ema(a,f),es=LCH.ema(a,s),m=a.map((_,i)=>ef[i]!=null&&es[i]!=null?ef[i]-es[i]:null);const first=m.findIndex(x=>x!=null);const sig=new Array(a.length).fill(null);
  if(first>=0){const e=LCH.ema(m.slice(first),sg);e.forEach((v,i)=>sig[first+i]=v);}return {m,s:sig,h:m.map((v,i)=>v!=null&&sig[i]!=null?v-sig[i]:null)};},
 /* ATR de Wilder sobre el rango verdadero */
 atr(b,n=14){const tr=b.map((x,i)=>i?Math.max(x.h-x.l,Math.abs(x.h-b[i-1].c),Math.abs(x.l-b[i-1].c)):x.h-x.l),o=new Array(b.length).fill(null);if(b.length<=n)return o;let a=tr.slice(1,n+1).reduce((x,y)=>x+y,0)/n;o[n]=a;for(let i=n+1;i<b.length;i++){a=(a*(n-1)+tr[i])/n;o[i]=a;}return o;}
};
window.LCH=LCH;

/* ================= GRÁFICO PROFESIONAL ================= */
const IND=[['sma20','SMA 20','var(--gold)'],['sma50','SMA 50','#8FA9D6'],['sma200','SMA 200','#C4A1CF'],['ema20','EMA 20','#D9A07A'],['bb','Bollinger 20,2','var(--ink3)'],['vol','Volumen',''],['rsi','RSI 14',''],['macd','MACD 12,26,9','']];
let CH={s:store.get('chS','AAPL'),r:store.get('chR','1y'),type:store.get('chT','candle'),on:new Set(store.get('chI',['sma50','sma200','vol','rsi'])),bars:[],levels:store.get('chL',{}),adding:false,data:null};
if(!SYNC.includes('chL'))SYNC.push('chL');
const sec=mkView30('chart','grafico','Gráfico profesional',`<div class="sh"><div><h2>Gráfico <em>profesional</em></h2><p>Velas japonesas, volumen e indicadores técnicos con precios reales. Marca niveles de precio y conviértelos en alertas de Watchtower.</p></div></div>
 <div class="panel ch35"><div class="ch35bar"><div class="ch35sym"><input class="f" id="chS" list="chList" value="${esc(CH.s)}" aria-label="Ticker" maxlength="10"><datalist id="chList"></datalist><button class="btn pri" id="chGo">Ver</button></div>
  <div class="tb30" role="tablist" id="chR">${[['3m','3M'],['6m','6M'],['1y','1A'],['2y','2A'],['5y','5A']].map(([k,l])=>`<button data-r="${k}" class="${k===CH.r?'on':''}">${l}</button>`).join('')}</div>
  <div class="tb30" id="chT"><button data-t="candle" class="${CH.type==='candle'?'on':''}">Velas</button><button data-t="line" class="${CH.type==='line'?'on':''}">Línea</button></div>
  <button class="btn" id="chLv" aria-pressed="false">${ic('plus','',false)} Nivel</button></div>
  <div class="ch35ind" id="chI">${IND.map(([k,l,c])=>`<button class="pill ${CH.on.has(k)?'on':''}" data-i="${k}">${c?`<i style="background:${c}"></i>`:''}${l}</button>`).join('')}</div>
  <div class="ch35ro" id="chRo" aria-live="off"></div>
  <div class="ch35wrap" id="chW"><div class="ch35sk"></div></div>
  <div class="ch35foot"><span class="note" id="chSrc"></span><span class="ch35acts"><button class="btn" id="chFicha">Ficha</button><button class="btn" id="chDR">Deep Research</button></span></div></div>
 <div class="fn33g"><div class="panel"><h3>Estadísticas del período</h3><div class="cp32k" id="chSt"></div></div><div class="panel"><h3>Niveles y alertas</h3><div id="chLvL"></div><p class="note">Toca "Nivel" y luego el gráfico para marcar un precio. Cada nivel puede volverse una alerta de Watchtower.</p></div></div>
 <div class="panel"><details class="fn33m"><summary>Cómo leer los indicadores</summary><ul><li><b>SMA / EMA</b>: promedio de los últimos N cierres; la EMA da más peso a los recientes.</li><li><b>Bollinger</b>: media de 20 ± 2 desviaciones estándar; mide si el precio está estirado respecto a su rango reciente.</li><li><b>RSI 14</b> (Wilder): de 0 a 100; por encima de 70 suele leerse como sobrecompra y por debajo de 30 como sobreventa.</li><li><b>MACD</b>: EMA 12 − EMA 26 y su señal (EMA 9); el histograma muestra la diferencia.</li><li><b>ATR 14</b>: rango promedio diario; útil para dimensionar stops.</li></ul><p class="note">Los indicadores describen el pasado; no predicen el futuro ni son una recomendación.</p></details></div>`);
async function chLoad(){const W=$('#chW');if(!MKT){W.innerHTML='<p class="note">Disponible en la versión web.</p>';return;}W.innerHTML='<div class="ch35sk"></div>';
 try{const d=await J30(`${MKT}?ohlc=${encodeURIComponent(CH.s)}&range=${CH.r}`,3600000,15000);CH.data=d;CH.bars=d.bars||[];}catch(e){CH.bars=[];}
 if(CH.bars.length<20){W.innerHTML=`<p class="note">No encontramos historial para ${esc(CH.s)}. Revisa el ticker.</p>`;$('#chSt').innerHTML='';$('#chRo').innerHTML='';return;}
 store.set('chS',CH.s);store.set('chR',CH.r);chDraw();}
function chCalc(){const b=CH.bars,c=b.map(x=>x.c);return {c,sma20:LCH.sma(c,20),sma50:LCH.sma(c,50),sma200:LCH.sma(c,200),ema20:LCH.ema(c,20),bb:LCH.bb(c,20,2),rsi:LCH.rsi(c,14),macd:LCH.macd(c),atr:LCH.atr(b,14)};}
let G=null;
function chDraw(){const b=CH.bars,I=chCalc(),on=CH.on,n=b.length;const W=1000,pR=64,pL=8,mainH=380,volH=on.has('vol')?70:0,rsiH=on.has('rsi')?100:0,macdH=on.has('macd')?110:0,gap=14;
 const H=mainH+(volH?volH+gap:0)+(rsiH?rsiH+gap:0)+(macdH?macdH+gap:0)+22;const bw=(W-pL-pR)/n,X=i=>pL+i*bw+bw/2;
 const lv=(CH.levels[CH.s]||[]);let lo=Math.min(...b.map(x=>x.l)),hi=Math.max(...b.map(x=>x.h));if(on.has('bb'))I.bb.lo.forEach((v,i)=>{if(v!=null){lo=Math.min(lo,v);hi=Math.max(hi,I.bb.up[i]);}});lv.forEach(v=>{lo=Math.min(lo,v);hi=Math.max(hi,v);});const pad=(hi-lo)*.06;lo-=pad;hi+=pad;
 const Y=v=>12+(1-(v-lo)/(hi-lo))*(mainH-24);let y0=mainH+gap;const vY0=y0;if(volH)y0+=volH+gap;const rY0=y0;if(rsiH)y0+=rsiH+gap;const mY0=y0;
 const path=(arr,yf)=>{let d='',pen=false;arr.forEach((v,i)=>{if(v==null){pen=false;return;}d+=(pen?'L':'M')+X(i).toFixed(1)+' '+yf(v).toFixed(1);pen=true;});return d;};
 const ticks=5,tk=Array.from({length:ticks},(_,i)=>lo+(hi-lo)*(i+.5)/ticks);
 const dates=[];const step=Math.max(1,Math.round(n/6));for(let i=0;i<n;i+=step)dates.push(i);
 const fmtD=t=>new Date(t).toLocaleDateString('es-PE',CH.r==='5y'||CH.r==='2y'?{month:'short',year:'2-digit'}:{day:'numeric',month:'short'});
 let s=`<svg viewBox="0 0 ${W} ${H}" class="ch35svg" role="img" aria-label="Gráfico de ${esc(CH.s)}">`;
 s+=`<g class="ch35g">${tk.map(v=>`<line x1="${pL}" x2="${W-pR}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${W-pR+6}" y="${Y(v)+4}">${v.toFixed(v<10?2:v<1000?1:0)}</text>`).join('')}${dates.map(i=>`<text x="${X(i)}" y="${H-6}" text-anchor="middle">${fmtD(b[i].t)}</text>`).join('')}</g>`;
 if(on.has('bb'))s+=`<path class="ch35bbf" d="${path(I.bb.up,Y)} ${[...I.bb.lo].reverse().map((v,j)=>{const i=n-1-j;return v==null?'':'L'+X(i).toFixed(1)+' '+Y(v).toFixed(1);}).join('')} Z"/><path class="ch35l" style="stroke:var(--ink3)" d="${path(I.bb.up,Y)}"/><path class="ch35l" style="stroke:var(--ink3)" d="${path(I.bb.lo,Y)}"/>`;
 if(CH.type==='candle'){const cw=Math.max(1,Math.min(14,bw*.66));s+=`<g class="ch35c">${b.map((x,i)=>{const up=x.c>=x.o,y1=Y(Math.max(x.o,x.c)),y2=Y(Math.min(x.o,x.c));return `<g class="${up?'u':'d'}" style="--i:${i}"><line x1="${X(i)}" x2="${X(i)}" y1="${Y(x.h)}" y2="${Y(x.l)}"/><rect x="${X(i)-cw/2}" y="${y1}" width="${cw}" height="${Math.max(1,y2-y1)}"/></g>`;}).join('')}</g>`;}
 else s+=`<path class="ch35line" pathLength="1" d="${path(I.c,Y)}"/>`;
 IND.slice(0,4).forEach(([k,,c])=>{if(on.has(k))s+=`<path class="ch35l" style="stroke:${c}" d="${path(I[k],Y)}"/>`;});
 lv.forEach((v,j)=>{s+=`<g class="ch35lv"><line x1="${pL}" x2="${W-pR}" y1="${Y(v)}" y2="${Y(v)}"/><rect x="${W-pR+2}" y="${Y(v)-10}" width="${pR-4}" height="20" rx="4"/><text x="${W-pR+6}" y="${Y(v)+4}">${v.toFixed(2)}</text></g>`;});
 const last=b.at(-1);s+=`<g class="ch35last"><line x1="${pL}" x2="${W-pR}" y1="${Y(last.c)}" y2="${Y(last.c)}"/><rect x="${W-pR+2}" y="${Y(last.c)-10}" width="${pR-4}" height="20" rx="4"/><text x="${W-pR+6}" y="${Y(last.c)+4}">${last.c.toFixed(2)}</text></g>`;
 if(volH){const mv=Math.max(...b.map(x=>x.v))||1;s+=`<g class="ch35v">${b.map((x,i)=>`<rect class="${x.c>=x.o?'u':'d'}" x="${X(i)-Math.max(.5,bw*.33)}" y="${vY0+volH-x.v/mv*volH}" width="${Math.max(1,bw*.66)}" height="${x.v/mv*volH}"/>`).join('')}</g><text class="ch35pl" x="${pL+4}" y="${vY0+12}">Volumen</text>`;}
 if(rsiH){const RY=v=>rY0+(1-v/100)*rsiH;s+=`<g class="ch35p"><rect x="${pL}" y="${RY(70)}" width="${W-pR-pL}" height="${RY(30)-RY(70)}" class="ch35band"/><line x1="${pL}" x2="${W-pR}" y1="${RY(70)}" y2="${RY(70)}"/><line x1="${pL}" x2="${W-pR}" y1="${RY(30)}" y2="${RY(30)}"/><text x="${W-pR+6}" y="${RY(70)+4}">70</text><text x="${W-pR+6}" y="${RY(30)+4}">30</text></g><path class="ch35l" style="stroke:var(--em)" d="${path(I.rsi,RY)}"/><text class="ch35pl" x="${pL+4}" y="${rY0+12}">RSI 14</text>`;}
 if(macdH){const all=[...I.macd.m,...I.macd.s,...I.macd.h].filter(v=>v!=null),mx=Math.max(...all.map(Math.abs))||1,MY=v=>mY0+macdH/2-v/mx*(macdH/2-6);s+=`<line class="ch35z" x1="${pL}" x2="${W-pR}" y1="${MY(0)}" y2="${MY(0)}"/><g class="ch35h">${I.macd.h.map((v,i)=>v==null?'':`<rect class="${v>=0?'u':'d'}" x="${X(i)-Math.max(.5,bw*.33)}" y="${Math.min(MY(v),MY(0))}" width="${Math.max(1,bw*.66)}" height="${Math.abs(MY(v)-MY(0))}"/>`).join('')}</g><path class="ch35l" style="stroke:var(--em)" d="${path(I.macd.m,MY)}"/><path class="ch35l" style="stroke:var(--gold)" d="${path(I.macd.s,MY)}"/><text class="ch35pl" x="${pL+4}" y="${mY0+12}">MACD 12,26,9</text>`;}
 s+=`<g class="ch35x" style="display:none"><line class="v" y1="0" y2="${H-20}"/><line class="h" x1="${pL}" x2="${W-pR}"/><rect class="tag" x="${W-pR+2}" width="${pR-4}" height="20" rx="4"/><text class="tagt" x="${W-pR+6}"></text></g><rect class="ch35hit" x="${pL}" y="0" width="${W-pR-pL}" height="${H-20}"/></svg>`;
 $('#chW').innerHTML=s;G={W,H,pL,pR,bw,X,Y,lo,hi,mainH,n,I};
 $('#chSrc').textContent=`${CH.data.src} · velas ${CH.data.tf} · último dato ${new Date(last.t).toLocaleDateString('es-PE',{day:'numeric',month:'long',year:'numeric'})}`;
 readout(n-1);stats(I);lvList();wire();}
function readout(i){const b=CH.bars,x=b[i],p=i?b[i-1].c:x.o,ch=(x.c/p-1)*100,I=G.I,v=(k,d=2)=>k!=null?k.toFixed(d):'—';
 $('#chRo').innerHTML=`<b>${esc(CH.s)}</b><span>${new Date(x.t).toLocaleDateString('es-PE',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</span><span>A <b class="mono">${x.o.toFixed(2)}</b></span><span>Máx <b class="mono">${x.h.toFixed(2)}</b></span><span>Mín <b class="mono">${x.l.toFixed(2)}</b></span><span>C <b class="mono ${cls30(ch)}" id="chC">${x.c.toFixed(2)}</b></span><span class="${cls30(ch)} mono">${pc30(ch,2)}</span><span>Vol <b class="mono">${big30(x.v).replace('$','')}</b></span>${CH.on.has('rsi')?`<span>RSI <b class="mono">${v(I.rsi[i],1)}</b></span>`:''}${CH.on.has('sma50')?`<span>SMA50 <b class="mono">${v(I.sma50[i])}</b></span>`:''}${CH.on.has('macd')?`<span>MACD <b class="mono">${v(I.macd.m[i])}</b></span>`:''}`;}
function stats(I){const b=CH.bars,c=I.c,last=b.at(-1),hi=Math.max(...b.map(x=>x.h)),lo=Math.min(...b.map(x=>x.l)),r=c.slice(1).map((v,i)=>Math.log(v/c[i])),m=r.reduce((a,x)=>a+x,0)/r.length,sd=Math.sqrt(r.reduce((a,x)=>a+(x-m)**2,0)/(r.length-1)),per=CH.data.tf==='semanal'?52:252,atr=I.atr.at(-1),v20=b.slice(-20).reduce((a,x)=>a+x.v,0)/Math.min(20,b.length),s200=I.sma200.at(-1),rsi=I.rsi.at(-1);
 $('#chSt').innerHTML=[['Último cierre',`<span data-tw="${last.c}">${last.c.toFixed(2)}</span>`],['Variación del período',`<span class="${cls30(last.c/b[0].c-1)}">${pc30((last.c/b[0].c-1)*100,1)}</span>`],['Máximo del período',hi.toFixed(2)],['Mínimo del período',lo.toFixed(2)],['Distancia al máximo',pc30((last.c/hi-1)*100,1)],['Volatilidad anual',(sd*Math.sqrt(per)*100).toFixed(1)+'%'],[`ATR 14 (${CH.data.tf})`,atr!=null?`${atr.toFixed(2)} · ${(atr/last.c*100).toFixed(1)}%`:'—'],['Volumen promedio 20',big30(v20).replace('$','')],['RSI 14',rsi!=null?rsi.toFixed(1)+(rsi>70?' · sobrecompra':rsi<30?' · sobreventa':''):'—'],['Precio vs SMA 200',s200!=null?pc30((last.c/s200-1)*100,1):'necesita 200 velas']].map(([l,v])=>`<div><small>${l}</small><b class="mono">${v}</b></div>`).join('');}
function lvList(){const lv=CH.levels[CH.s]||[],last=CH.bars.at(-1).c;$('#chLvL').innerHTML=lv.length?lv.map((v,j)=>`<div class="er30"><span class="mono">${v.toFixed(2)} <small class="${v>last?'up':'dn'}">${pc30((v/last-1)*100,1)} del último</small></span><span class="fn33aa"><button class="btn" data-al="${j}">${ic('bell','',false)} Alerta</button><button class="ib" data-rl="${j}" aria-label="Quitar nivel">${ic('x','',false)}</button></span></div>`).join(''):'<p class="note">Sin niveles marcados.</p>';
 $$('#chLvL [data-rl]').forEach(b=>b.onclick=()=>{lv.splice(+b.dataset.rl,1);CH.levels[CH.s]=lv;store.set('chL',CH.levels);chDraw();});
 $$('#chLvL [data-al]').forEach(b=>b.onclick=()=>{if(!member()){openAccount();return;}const v=lv[+b.dataset.al],lim=(ACC&&ACC.sub&&ACC.sub.limits&&ACC.sub.limits.alerts)||5;if(TRD.alerts.length>=lim){toast(`Tu plan permite ${lim} alertas.`,{action:{label:'Ver planes',fn:()=>premSheet()}});return;}
  TRD.alerts.unshift({id:Date.now(),type:v>last?'above':'below',s:CH.s,v:+v.toFixed(2),rang:0});saveTrd();toast(`Alerta en Watchtower: ${CH.s} ${v>last?'sube a':'baja a'} ${usd2(v)}`,{icon:ic('bell','',false),action:{label:'Ver',fn:()=>setView('watch')}});});}
function wire(){const svg=$('#chW svg'),hit=svg.querySelector('.ch35hit'),x=svg.querySelector('.ch35x'),vl=x.querySelector('.v'),hl=x.querySelector('.h'),tag=x.querySelector('.tag'),tt=x.querySelector('.tagt');let raf=0,ev=null;
 const pt=e=>{const r=svg.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*G.W,y:(e.clientY-r.top)/r.height*G.H};};
 const move=()=>{raf=0;if(!ev)return;const p=pt(ev),i=Math.max(0,Math.min(G.n-1,Math.round((p.x-G.pL-G.bw/2)/G.bw)));x.style.display='';const cx=G.X(i);vl.setAttribute('x1',cx);vl.setAttribute('x2',cx);
  if(p.y<=G.mainH){const v=G.lo+(1-(p.y-12)/(G.mainH-24))*(G.hi-G.lo);hl.style.display=tag.style.display=tt.style.display='';hl.setAttribute('y1',p.y);hl.setAttribute('y2',p.y);tag.setAttribute('y',p.y-10);tt.setAttribute('y',p.y+4);tt.textContent=v.toFixed(2);}else{hl.style.display=tag.style.display=tt.style.display='none';}readout(i);};
 hit.addEventListener('pointermove',e=>{ev=e;if(!raf)raf=requestAnimationFrame(move);});hit.addEventListener('pointerleave',()=>{ev=null;x.style.display='none';readout(G.n-1);});
 hit.addEventListener('click',e=>{if(!CH.adding)return;const p=pt(e);if(p.y>G.mainH)return;const v=G.lo+(1-(p.y-12)/(G.mainH-24))*(G.hi-G.lo);(CH.levels[CH.s]=CH.levels[CH.s]||[]).push(+v.toFixed(2));store.set('chL',CH.levels);CH.adding=false;$('#chLv').setAttribute('aria-pressed','false');$('#chLv').classList.remove('on');chDraw();toast(`Nivel marcado en ${v.toFixed(2)}`);});}
$('#chGo').onclick=()=>{const v=$('#chS').value.trim().toUpperCase().replace(/^\$/,'');if(!/^[A-Z.\-]{1,10}$/.test(v)){toast('Escribe un ticker válido');return;}CH.s=v;chLoad();};
$('#chS').addEventListener('keydown',e=>{if(e.key==='Enter')$('#chGo').click();});
$$('#chR button').forEach(b=>b.onclick=()=>{$$('#chR button').forEach(x=>x.classList.toggle('on',x===b));CH.r=b.dataset.r;chLoad();});
$$('#chT button').forEach(b=>b.onclick=()=>{$$('#chT button').forEach(x=>x.classList.toggle('on',x===b));CH.type=b.dataset.t;store.set('chT',CH.type);if(CH.bars.length)chDraw();});
$$('#chI .pill').forEach(b=>b.onclick=()=>{const k=b.dataset.i;CH.on.has(k)?CH.on.delete(k):CH.on.add(k);b.classList.toggle('on');store.set('chI',[...CH.on]);if(CH.bars.length)chDraw();});
$('#chLv').onclick=()=>{CH.adding=!CH.adding;$('#chLv').setAttribute('aria-pressed',String(CH.adding));$('#chLv').classList.toggle('on',CH.adding);if(CH.adding)toast('Toca el gráfico en el precio que quieres marcar');};
$('#chFicha').onclick=()=>{if(member()){setView('stocks');setTimeout(()=>coOpen(CH.s),250);}else openAccount();};$('#chDR').onclick=()=>window.research31&&research31(CH.s);
window.chart35=s=>{CH.s=s;$('#chS').value=s;setView('chart');};
const _sv35=setView;setView=function(v,o){_sv35(v,o);if(v==='chart'){const dl=$('#chList');if(dl&&CO.length&&!dl.children.length)dl.innerHTML=CO.slice(0,600).map(r=>`<option value="${esc(r.s)}">${esc(r.n)}</option>`).join('');chLoad();}if(v==='play')tkRender();};
{const v=ID2V[location.hash.slice(1)];if(v==='chart')setTimeout(()=>setView(v,{noHash:true}),0);}
/* acceso: Lucioni Pro, ficha de empresa, Terminal y Deep Research */
{const g=[...document.querySelectorAll('#pro30 .pg30')].find(x=>/Markets/.test(x.textContent));if(g){const b=document.createElement('button');b.className='pt30';b.innerHTML=`${ic('alcista','',false)}<span><b>Gráfico profesional</b><small>Velas, volumen, SMA, Bollinger, RSI, MACD y niveles con alertas</small></span>${ic('right','',false)}`;b.onclick=()=>setView('chart');g.querySelector('h3').after(b);}}
if(typeof coOpen==='function'){const _co35=coOpen;coOpen=async function(sym){const r=await _co35.apply(this,arguments);setTimeout(()=>{const rg=$('#coR');if(rg&&!$('#co35'))rg.insertAdjacentHTML('afterend',`<button class="btn" id="co35" style="margin-top:10px">${ic('alcista','',false)} Gráfico profesional</button>`);const bt=$('#co35');if(bt)bt.onclick=()=>{closeSheet&&closeSheet();setTimeout(()=>chart35(sym),200);};},80);return r;};}

/* ================= BOLETA AVANZADA (simulador de práctica) ================= */
Object.assign(OT,{stoplimit:'Stop-límite',trail:'Trailing stop'});
const FEES={none:['Sin comisión',()=>0],fixed1:['US$1 por orden',()=>1],pct10:['0,10% (mín. US$1)',v=>Math.max(1,v*.001)],pct25:['0,25% (mín. US$5)',v=>Math.max(5,v*.0025)]};
let FEE=store.get('fee35','none');if(!FEES[FEE])FEE='none';if(!SYNC.includes('fee35'))SYNC.push('fee35');
const feeOf=v=>FEES[FEE][1](v);
/* las comisiones se descuentan en todas las operaciones del simulador (también la boleta rápida) */
const _tr35=trade;trade=function(s,dir,n=1,via){const p=price(s),q=Math.max(1,Math.floor(n)),f=feeOf(p*q);if(dir>0&&f>0&&PV.cash<p*q+f){toast(`Te falta efectivo: ${q} ${s} cuestan ${usd2(p*q)} + ${usd2(f)} de comisión`);return false;}
 const ok=_tr35(s,dir,n,via);if(ok&&f>0){PV.cash-=f;PV.fees=(PV.fees||0)+f;if(PV.hist[0])PV.hist[0].fee=f;store.set('pv',PV);try{refreshPlay();}catch(e){}}return ok;};
/* órdenes: stop-límite se activa al tocar el stop; trailing sigue el precio; OCO cancela la otra; vigencia "día" vence a medianoche */
const _ck35=checkOrders;let lastRO=0;checkOrders=function(){const now=Date.now();let ch=false;
 const exp=PV.orders.filter(o=>o.exp&&now>o.exp);if(exp.length){PV.orders=PV.orders.filter(o=>!exp.includes(o));ch=true;toast(`${exp.length} orden${exp.length>1?'es':''} del día vencida${exp.length>1?'s':''}`,ic('clock'));}
 for(const o of PV.orders){const p=price(o.s);if(o.type==='stoplimit'&&!o.armed){if(o.dir>0?p>=o.stop:p<=o.stop){o.armed=true;o.type='limit';o.px=o.lim;ch=true;toast(`${o.s}: se alcanzó el stop; ahora es una orden límite a ${usd2(o.lim)}`,ic('clock'));}}
  else if(o.type==='trail'){if(o.dir<0){o.ext=Math.max(o.ext||p,p);o.px=o.ext*(1-o.pct/100);}else{o.ext=Math.min(o.ext||p,p);o.px=o.ext*(1+o.pct/100);}}}
 const before=PV.orders.slice();_ck35();const filled=before.filter(o=>!PV.orders.includes(o));
 filled.forEach(o=>{if(o.oco){const sib=PV.orders.filter(x=>x.oco===o.oco);if(sib.length){PV.orders=PV.orders.filter(x=>x.oco!==o.oco);ch=true;toast(`OCO: se canceló ${sib.map(x=>OT[x.type].toLowerCase()).join(' y ')} de ${o.s}`,ic('clock'));}}});
 if(ch||filled.length){store.set('pv',PV);renderOrd();}else if(PV.orders.some(o=>o.type==='trail')&&now-lastRO>2000){lastRO=now;renderOrd();}};
const host=$('#ord')&&$('#ord').closest('.panel');const tk=document.createElement('div');tk.className='panel tk35';tk.id='tk35';if(host)host.before(tk);
const TYPES=[['market','Mercado','Se ejecuta ahora al precio actual.'],['limit','Límite','Compra a ese precio o menos; vende a ese precio o más.'],['stop','Stop','Se ejecuta a mercado cuando el precio toca el stop.'],['stoplimit','Stop-límite','Al tocar el stop se convierte en una orden límite: controlas el precio, pero puede no ejecutarse.'],['trail','Trailing stop','El stop sigue al precio a una distancia en %: protege ganancias sin fijar un precio.'],['bracket','Bracket (OCO)','Compra a mercado y deja un objetivo de ganancia y un stop de pérdida; cuando uno se ejecuta, el otro se cancela.']];
let TK={s:store.get('tkS','AAPL'),side:1,type:'limit',q:10,tif:'gtc'};
function tkRender(){if(!$('#tk35'))return;const s=S[TK.s]?TK.s:'AAPL',p=price(s),h=PV.h[s];
 tk.innerHTML=`<div class="ph"><h3>Boleta avanzada</h3><span class="note" style="margin:0">Práctica · precios simulados</span></div>
 <div class="tk35g"><label>Activo<select class="f" id="tkS">${Object.keys(S).map(k=>`<option ${k===s?'selected':''}>${k}</option>`).join('')}</select></label>
 <div class="tk35side" role="group" aria-label="Lado"><button class="${TK.side>0?'on b':''}" data-sd="1">Comprar</button><button class="${TK.side<0?'on s':''}" data-sd="-1" ${TK.type==='bracket'?'disabled':''}>Vender</button></div>
 <label>Tipo de orden<select class="f" id="tkT">${TYPES.map(([k,l])=>`<option value="${k}" ${k===TK.type?'selected':''}>${l}</option>`).join('')}</select></label>
 <label>Cantidad<input class="f mono" id="tkQ" type="number" min="1" step="1" value="${TK.q}"></label>
 <label class="tkp" data-for="limit stoplimit">Precio límite<input class="f mono" id="tkL" type="number" step="0.01" value="${(p*(TK.side>0?.98:1.02)).toFixed(2)}"></label>
 <label class="tkp" data-for="stop stoplimit">Precio stop<input class="f mono" id="tkSt" type="number" step="0.01" value="${(p*(TK.side>0?1.02:.97)).toFixed(2)}"></label>
 <label class="tkp" data-for="trail">Distancia del trailing (%)<input class="f mono" id="tkTr" type="number" min="0.5" max="50" step="0.5" value="5"></label>
 <label class="tkp" data-for="bracket">Objetivo de ganancia<input class="f mono" id="tkTP" type="number" step="0.01" value="${(p*1.08).toFixed(2)}"></label>
 <label class="tkp" data-for="bracket">Stop de pérdida<input class="f mono" id="tkSL" type="number" step="0.01" value="${(p*.95).toFixed(2)}"></label>
 <label class="tkp" data-for="limit stop stoplimit trail">Vigencia<select class="f" id="tkTif"><option value="gtc" ${TK.tif==='gtc'?'selected':''}>Hasta cancelar (GTC)</option><option value="day" ${TK.tif==='day'?'selected':''}>Solo hoy (día)</option></select></label>
 <label>Comisión de tu bróker<select class="f" id="tkF">${Object.entries(FEES).map(([k,[l]])=>`<option value="${k}" ${k===FEE?'selected':''}>${l}</option>`).join('')}</select></label></div>
 <p class="note" id="tkHelp"></p><div class="tk35pv" id="tkPv"></div><button class="cta" id="tkGo" style="width:100%;justify-content:center"></button>`;
 const upd=()=>{const t=$('#tkT').value;TK.type=t;if(t==='bracket')TK.side=1;$$('#tk35 .tkp').forEach(l=>l.hidden=!l.dataset.for.split(' ').includes(t));$('#tkHelp').textContent=TYPES.find(x=>x[0]===t)[2];
  $$('#tk35 [data-sd]').forEach(b=>{const on=+b.dataset.sd===TK.side;b.classList.toggle('on',on);b.classList.toggle('b',on&&TK.side>0);b.classList.toggle('s',on&&TK.side<0);b.disabled=t==='bracket'&&+b.dataset.sd<0;});preview();};
 const preview=()=>{const s=$('#tkS').value,p=price(s),q=Math.max(1,Math.floor(+$('#tkQ').value||1)),t=TK.type,ref=t==='limit'||t==='stoplimit'?+$('#tkL').value:t==='stop'?+$('#tkSt').value:p,v=ref*q,f=feeOf(v),h=PV.h[s];
  let warn='';if(TK.side>0&&v+f>PV.cash)warn=`Te faltan ${usd2(v+f-PV.cash)} de efectivo.`;if(TK.side<0&&(!h||h.n<q))warn=`Solo tienes ${h?h.n:0} ${s}.`;
  if(t==='limit'&&TK.side>0&&ref>p)warn=warn||'Ojo: un límite de compra por encima del precio actual se ejecuta enseguida.';
  if(t==='bracket'){const tp=+$('#tkTP').value,sl=+$('#tkSL').value;if(!(tp>p&&sl<p))warn='En un bracket de compra, el objetivo va por encima del precio y el stop por debajo.';}
  const rr=t==='bracket'?((+$('#tkTP').value-p)/(p-+$('#tkSL').value)):null;
  $('#tkPv').innerHTML=`<div class="cp32k">${[['Precio actual',`<span id="tkPx" data-v="${p}">${usd2(p)}</span>`],['Monto estimado',usd2(v)],['Comisión estimada',usd2(f)],[TK.side>0?'Efectivo después':'Posición después',TK.side>0?usd2(PV.cash-v-f):`${Math.max(0,(h?h.n:0)-q)} ${s}`],...(t==='bracket'?[['Riesgo : beneficio',rr>0?`1 : ${rr.toFixed(2)}`:'—'],['Pérdida máx. estimada',usd2((p-+$('#tkSL').value)*q+2*f)]]:[]),...(t==='trail'?[['Stop inicial',usd2(TK.side<0?p*(1-+$('#tkTr').value/100):p*(1+ +$('#tkTr').value/100))]]:[])].map(([l,x])=>`<div><small>${l}</small><b class="mono">${x}</b></div>`).join('')}</div>${warn?`<p class="note dn">${warn}</p>`:''}`;
  const go=$('#tkGo');go.disabled=!!warn&&!/^Ojo/.test(warn);go.className='cta '+(TK.side>0?'':'sell');go.textContent=`${t==='market'||t==='bracket'?'Enviar':'Colocar'} ${TYPES.find(x=>x[0]===t)[1].toLowerCase()}: ${TK.side>0?'comprar':'vender'} ${q} ${s}`;};
 $('#tkS').onchange=e=>{TK.s=e.target.value;store.set('tkS',TK.s);tkRender();};$('#tkT').onchange=upd;$('#tkF').onchange=e=>{FEE=e.target.value;store.set('fee35',FEE);preview();};$('#tkTif').onchange=e=>{TK.tif=e.target.value;};
 $$('#tk35 [data-sd]').forEach(b=>b.onclick=()=>{TK.side=+b.dataset.sd;tkRender();});$$('#tk35 input').forEach(i=>i.oninput=()=>{if(i.id==='tkQ')TK.q=+i.value||1;preview();});
 $('#tkGo').onclick=()=>{const s=$('#tkS').value,q=Math.max(1,Math.floor(+$('#tkQ').value||1)),t=TK.type,dir=TK.side,id=Date.now(),exp=TK.tif==='day'?new Date(new Date().setHours(23,59,59,999)).getTime():null;
  if(t==='market'){if(trade(s,dir,q))FX.burst&&!RMx()&&FX.burst(...center($('#tkGo')),24);}
  else if(t==='bracket'){if(trade(s,1,q,'Bracket')){const oco='o'+id;PV.orders.push({id:id+1,s,dir:-1,type:'limit',px:+$('#tkTP').value,n:q,oco},{id:id+2,s,dir:-1,type:'stop',px:+$('#tkSL').value,n:q,oco});store.set('pv',PV);renderOrd();toast(`Bracket activo: objetivo ${usd2(+$('#tkTP').value)} y stop ${usd2(+$('#tkSL').value)} (OCO)`,ic('clock'));}}
  else{if(dir<0&&(!PV.h[s]||PV.h[s].n<q)){toast(`Necesitas ${q} ${s} para esa orden de venta`);return;}const o={id,s,dir,type:t,n:q,exp};
   if(t==='limit')o.px=+$('#tkL').value;if(t==='stop')o.px=+$('#tkSt').value;if(t==='stoplimit'){o.stop=+$('#tkSt').value;o.lim=+$('#tkL').value;o.px=o.stop;}if(t==='trail'){o.pct=+$('#tkTr').value||5;o.ext=price(s);o.px=dir<0?o.ext*(1-o.pct/100):o.ext*(1+o.pct/100);}
   PV.orders.push(o);store.set('pv',PV);renderOrd();mission('order');toast(`Orden ${OT[t].toLowerCase()} colocada${exp?' (vence hoy)':''}`,ic('clock'));}
  tkRender();};
 upd();}
/* precio vivo en la boleta con transición suave */
setInterval(()=>{if(VIEW!=='play'||!$('#tkPx'))return;const s=$('#tkS').value,p=price(s),el=$('#tkPx'),old=+el.dataset.v;if(Math.abs(p-old)>1e-6){FX35.flash(el.closest('div'),p-old);FX35.tween(el,p,usd2,400);}},1500);
/* órdenes vivas: mostrar vigencia, trailing y OCO en la lista existente */
if(typeof renderOrd==='function'){const _ro=renderOrd;renderOrd=function(){_ro();$$('#ord .trow').forEach((row,i)=>{const o=PV.orders[i];if(!o)return;const sm=row.querySelector('small');if(!sm)return;const extra=[o.type==='trail'?`sigue a ${o.pct}% · stop ${usd2(o.px)}`:'',o.type==='stoplimit'?`stop ${usd2(o.stop)} → límite ${usd2(o.lim)}`:'',o.oco?'OCO':'',o.exp?'vence hoy':'GTC'].filter(Boolean).join(' · ');if(extra&&!sm.dataset.x){sm.dataset.x=1;sm.insertAdjacentText('beforeend',' · '+extra);}});};}
setTimeout(tkRender,600);
}
