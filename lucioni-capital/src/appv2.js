/* ===== Iconos propios animados ===== */
const IC={
 up:['<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>','l-up'],
 ext:['<path d="M7 17L17 7"/><path d="M9 7h8v8"/>','l-nudge'],
 right:['<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>','l-right'],
 x:['<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',''],
 plus:['<path d="M12 5v14"/><path d="M5 12h14"/>',''],
 minus:['<path d="M5 12h14"/>',''],
 star:['<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>','l-twinkle'],
 bolt:['<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>','l-pulse'],
 tup:['<path d="M12 6l7 11H5z"/>','l-up',1],
 tdown:['<path d="M12 18L5 7h14z"/>','l-down',1],
 buy:['<path d="M12 18V6"/><path d="M7 11l5-5 5 5"/>','l-up'],
 sell:['<path d="M12 6v12"/><path d="M7 13l5 5 5-5"/>','l-down'],
 search:['<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',''],
 news:['<rect x="3" y="5" width="15" height="14" rx="2"/><path d="M18 9h3v8a2 2 0 0 1-2 2"/><path d="M7 9h7M7 13h7M7 16h4"/>','l-float'],
 film:['<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M10 9.5l5 2.5-5 2.5z"/>','l-pulse'],
 play:['<path d="M8 5l11 7-11 7z"/>',''],
 bell:['<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>','l-wig'],
 clock:['<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',''],
 trophy:['<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4"/><path d="M17 6h3a3 3 0 0 1-3 4"/><path d="M12 14v4"/><path d="M8 20h8"/>','l-float'],
 target:['<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',''],
 calc:['<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>',''],
 chat:['<path d="M4 5h16v11H9l-5 4z"/>',''],
 cap:['<path d="M2 8l10-5 10 5-10 5z"/><path d="M6 10v5c3 3 9 3 12 0v-5"/>',''],
 accion:['<path d="M4 20h16"/><path d="M7 16v-4"/><path d="M12 16V8"/><path d="M17 16V5"/>','l-float'],
 etf:['<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17l9 5 9-5"/>','l-float'],
 dividendo:['<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.6-.9-1.6-1.3-2.8-1.3-1.6 0-2.8.8-2.8 2s1.2 1.7 2.8 2.1 2.8.9 2.8 2.1-1.2 2-2.8 2c-1.3 0-2.3-.5-2.9-1.4"/><path d="M12 6v1.9"/><path d="M12 16.1V18"/>','l-spin'],
 alcista:['<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/><path d="M3 4c2 2 4 2 6 0"/>','l-nudge'],
 bajista:['<path d="M3 7l6 6 4-4 8 8"/><path d="M14 17h7v-7"/>','l-down'],
 diversificar:['<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12l6 6"/><path d="M12 12H3.5"/>','l-spin'],
 volatilidad:['<path d="M2 12c2-6 4-6 5 0s3 6 5 0 3-6 5 0 3 6 5 0"/>','l-float'],
 compuesto:['<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v4h-4"/><path d="M9 13l2 2 4-5"/>','l-spin'],
 pe:['<circle cx="12" cy="6" r="1.6"/><path d="M5 12h14"/><circle cx="12" cy="18" r="1.6"/>','l-pulse'],
 broker:['<path d="M3 9l9-5 9 5"/><path d="M5 9v9"/><path d="M10 9v9"/><path d="M14 9v9"/><path d="M19 9v9"/><path d="M3 20h18"/>','l-float'],
 bvl:['<path d="M4 21V4"/><path d="M4 4h12l-3 4 3 4H4"/><path d="M9 21h6"/>','l-wig'],
 stop:['<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8 11l3 3 5-5"/>','l-pulse'],
 hello:['<path d="M4 18c0-6 3-11 8-13"/><path d="M12 5c3 0 6 2 6 6"/><circle cx="18" cy="15" r="2.4"/>','l-wig'],
 check:['<path d="M5 12l5 5 9-10"/>','']
};
function ic(n,cls='',loop=true){const [body,anim,fill]=IC[n]||IC.check;
  const b=fill?body.replace('<path','<path class="fi" fill="currentColor" stroke="none"'):body.replace(/<(path|circle|line|rect|polyline)/g,'<$1 pathLength="100"');
  return `<svg class="ic ${cls} ${loop?anim:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;}
function hydrate(root=document){root.querySelectorAll('i[data-i]').forEach(e=>{e.outerHTML=ic(e.dataset.i,e.dataset.c||'',e.dataset.l!=='0');});}
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const COLORS=['#E3A15C','#6E9BFF','#3DDC8A','#C08BFF','#FF8A6B','#4FD1C5','#F06292','#B5A89E'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(k,d){try{const v=localStorage.getItem('lc_'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('lc_'+k,JSON.stringify(v))}catch(e){}}};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(el,to,fmt,ms=900){if(!el)return;const from=el._v||0;el._v=to;if(RM){el.textContent=fmt(to);return;}const t0=performance.now();cancelAnimationFrame(el._r);(function f(t){const k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3);el.textContent=fmt(from+(to-from)*e);if(k<1)el._r=requestAnimationFrame(f);})(t0);}
const usd=n=>'$'+Number(n).toLocaleString('en-US',{maximumFractionDigits:0});
const usd2=n=>'$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const sgn=v=>(v>=0?'+':'')+v.toFixed(2)+'%';
const UP='#3DDC8A',DN='#FF6170';
let sample=null;

/* ================= TOASTS (pila, expansión, deslizar para cerrar) ================= */
const TS=[];let tHover=false;
function toast(msg,opt){
  if(typeof opt==='string')opt={icon:opt};opt=opt||{};
  const el=document.createElement('div');el.className='tst enter';el.setAttribute('role','status');
  el.innerHTML=(opt.icon?`<span class="ti">${opt.icon}</span>`:'')+'<span class="tm"></span>'+(opt.action?`<button class="ta">${esc(opt.action.label)}</button>`:'');
  el.querySelector('.tm').textContent=msg;
  $('#toasts').appendChild(el);
  const t={el,left:opt.dur||(opt.action?5000:3000),t0:0,timer:null};
  if(opt.action)el.querySelector('.ta').onclick=e=>{e.stopPropagation();opt.action.fn();kill(t);};
  TS.unshift(t);while(TS.length>4)kill(TS[TS.length-1],true);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.classList.remove('enter');layoutT();}));
  run(t);swipe(t);
  el.onmouseenter=()=>{tHover=true;layoutT();TS.forEach(pause)};el.onmouseleave=()=>{tHover=false;layoutT();TS.forEach(run)};
  return t;
}
function run(t){if(tHover||t.dead)return;clearTimeout(t.timer);t.t0=Date.now();t.timer=setTimeout(()=>kill(t),t.left);}
function pause(t){clearTimeout(t.timer);t.left=Math.max(800,t.left-(Date.now()-t.t0));}
function kill(t,instant){if(t.dead)return;t.dead=true;clearTimeout(t.timer);const i=TS.indexOf(t);if(i>=0)TS.splice(i,1);
  t.el.style.setProperty('--o','0');if(!t.el.style.getPropertyValue('--x'))t.el.style.setProperty('--y','40%');
  setTimeout(()=>t.el.remove(),instant?0:400);if(!TS.length)tHover=false;layoutT();}
function layoutT(){let acc=0;TS.forEach((t,i)=>{const h=t.el.offsetHeight;
  if(tHover){t.el.style.setProperty('--y',-acc+'px');t.el.style.setProperty('--s','1');t.el.style.setProperty('--o','1');acc+=h+8;}
  else{t.el.style.setProperty('--y',-(i*10)+'px');t.el.style.setProperty('--s',String(1-i*.05));t.el.style.setProperty('--o',i>2?'0':'1');}
  t.el.style.zIndex=10-i;});}
function swipe(t){const el=t.el;let x0=null,t0=0,dx=0;
  el.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;x0=e.clientX;t0=performance.now();dx=0;el.classList.add('drag');el.setPointerCapture(e.pointerId);pause(t);});
  el.addEventListener('pointermove',e=>{if(x0===null)return;dx=e.clientX-x0;el.style.setProperty('--x',dx+'px');el.style.setProperty('--o',String(Math.max(0,1-Math.abs(dx)/220)));});
  const end=()=>{if(x0===null)return;el.classList.remove('drag');const v=Math.abs(dx)/(performance.now()-t0);x0=null;
    if(Math.abs(dx)>70||v>.45){el.style.setProperty('--x',(dx>0?1:-1)*400+'px');kill(t);}else{el.style.setProperty('--x','0px');el.style.setProperty('--o','1');run(t);}};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);}

/* ================= CONFETI ================= */
const FX=(()=>{const c=$('#fx'),x=c.getContext('2d');let P=[],on=false;
  function rs(){c.width=innerWidth*(devicePixelRatio||1);c.height=innerHeight*(devicePixelRatio||1);}rs();addEventListener('resize',rs);
  function loop(){x.clearRect(0,0,c.width,c.height);const d=devicePixelRatio||1;P=P.filter(p=>p.life>0);
    for(const p of P){p.vy+=.18;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life--;x.save();x.translate(p.x*d,p.y*d);x.rotate(p.r);x.globalAlpha=Math.min(1,p.life/30);x.fillStyle=p.c;x.fillRect(-4*d,-2*d,8*d,4*d);x.restore();}
    if(P.length)requestAnimationFrame(loop);else on=false;}
  return {burst(px,py,n=60){if(RM)return;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=3+Math.random()*6;P.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s-4,r:Math.random()*6,vr:(Math.random()-.5)*.3,life:70+Math.random()*40,c:COLORS[i%6]});}if(!on){on=true;loop();}}};
})();
const center=el=>{const r=el.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];};

/* ---------- partículas de fondo ---------- */
(()=>{const c=$('#dust'),x=c.getContext('2d');let P=[];
 function rs(){c.width=innerWidth;c.height=innerHeight;P=Array.from({length:40},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.4+.3,v:Math.random()*.25+.05,a:Math.random()*.5+.1}))}
 rs();addEventListener('resize',rs);if(RM)return;
 (function f(){x.clearRect(0,0,c.width,c.height);for(const p of P){p.y-=p.v;if(p.y<0){p.y=c.height;p.x=Math.random()*c.width}x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fillStyle=`rgba(246,203,146,${p.a})`;x.fill()}requestAnimationFrame(f)})();
})();

/* ---------- saludo ---------- */
const hr=new Date().getHours();
$('#hello').innerHTML=(hr<12?'Buenos días':hr<19?'Buenas tardes':'Buenas noches').split(' ').map((w,i)=>`<span class="w" style="animation-delay:${.3+i*.15}s">${w}</span>`).join(' ');
function observe(){}

/* ---------- navegación ---------- */
let page='home';
function moveInd(){const b=$('#tabs button.act'),i=$('#ind');i.style.left=b.offsetLeft+'px';i.style.width=b.offsetWidth+'px';}
$$('#tabs button').forEach(b=>b.onclick=()=>go(b.dataset.p));
function go(p){const b=$(`#tabs button[data-p="${p}"]`);if(!b)return;
  $$('#tabs button').forEach(x=>x.classList.toggle('act',x===b));moveInd();
  if(page!==p){$$('.page').forEach(x=>x.classList.remove('show'));const pg=$('#p-'+p);void pg.offsetWidth;pg.classList.add('show');scrollTo({top:0,behavior:RM?'auto':'smooth'});}
  page=p;setTimeout(resizeAll,30);}
addEventListener('resize',()=>{moveInd();layoutT();});setTimeout(moveInd,50);

/* ---------- placeholder animado ---------- */
const phs=['Tengo S/ 2000 y quiero ganar 15% en un año…','Quiero invertir $500 por 6 meses…','¿En qué invierto $10,000 a 5 años?'];
let pi=0,ci=0,del=false;
(function typ(){const t=phs[pi],q=$('#q');
  if(document.activeElement!==q&&!q.value){q.placeholder=t.slice(0,ci)+'|';
    if(!del){ci++;if(ci>t.length){del=true;return setTimeout(typ,1600);}}else{ci--;if(ci===0){del=false;pi=(pi+1)%phs.length;}}}
  setTimeout(typ,del?25:55);})();
$$('.ex').forEach(e=>e.onclick=()=>{$('#q').value=e.textContent.replace(/·/g,',');$('#q').focus();});
function setRisk(v){$$('#risk .pill').forEach(x=>x.classList.toggle('act',x.dataset.v===v));}
$$('#risk .pill').forEach(p=>p.onclick=()=>setRisk(p.dataset.v));
$('#q').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();runAI();}});

/* ================= MERCADO SIMULADO ================= */
const SYMS=[['S&P 500','Índice EE.UU.',.6],['NASDAQ','Tecnológicas',.9],['S&P/BVL','Bolsa de Lima',.7],['NVDA','Nvidia',1.8],['AAPL','Apple',1],['MSFT','Microsoft',.9],['TSLA','Tesla',2.2],['SCCO','Southern Copper',1.4],['BAP','Credicorp',1.1],['VOO','ETF S&P 500',.6]];
const S={};SYMS.forEach(([s,n,v])=>S[s]={n,vol:v,pts:[0],drift:(Math.random()-.45)*.004,shock:0});
let cur='S&P 500',step=1,ctype='line',tick=0,hoverX=null;
function advance(){for(const s in S){const o=S[s],l=o.pts.at(-1);let sh=0;if(o.shock){sh=o.shock/5;o.shock-=sh;if(Math.abs(o.shock)<.02)o.shock=0;}
  const n=l+o.drift+sh+(Math.random()-.5)*.09*o.vol-l*.004;o.pts.push(n);if(o.pts.length>1500)o.pts.shift();}}
for(let i=0;i<400;i++)advance();
const price=s=>100*(1+S[s].pts.at(-1)/100);
const pctOf=s=>S[s].pts.at(-1);
const tradable=SYMS.filter(s=>!['S&P 500','NASDAQ','S&P/BVL'].includes(s[0])).map(s=>s[0]);
const sid=s=>s.replace(/\W/g,'');
$('#syms').innerHTML=SYMS.map(([s])=>`<button class="sym${s===cur?' act':''}" data-s="${s}">${s}<small id="m-${sid(s)}"></small></button>`).join('');
function pickSym(s){cur=s;$$('.sym').forEach(x=>x.classList.toggle('act',x.dataset.s===s));setName();drawIn=0;$('#tradeCur').classList.toggle('hidden',!tradable.includes(s));}
$$('.sym').forEach(b=>b.onclick=()=>pickSym(b.dataset.s));
function setName(){$('#chName').textContent=cur+' · '+S[cur].n;}
$$('#tf button').forEach(b=>b.onclick=()=>{step=+b.dataset.s;$$('#tf button').forEach(x=>x.classList.toggle('act',x===b));drawIn=0;});
$$('#ctype button').forEach(b=>b.onclick=()=>{ctype=b.dataset.v;$$('#ctype button').forEach(x=>x.classList.toggle('act',x===b));drawIn=0;});
$('#marq').innerHTML=[0,1].map(()=>SYMS.map(([s])=>`<span><b>${s}</b><em data-q="${sid(s)}"></em></span>`).join('')).join('');
$('#tradeCur').onclick=()=>openTrade(cur);
const cvEl=$('#cv');
cvEl.addEventListener('pointermove',e=>{const r=cvEl.getBoundingClientRect();hoverX=(e.clientX-r.left)/r.width;});
cvEl.addEventListener('pointerdown',e=>{const r=cvEl.getBoundingClientRect();hoverX=(e.clientX-r.left)/r.width;});
cvEl.addEventListener('pointerleave',()=>hoverX=null);cvEl.addEventListener('pointercancel',()=>hoverX=null);

function fit(cv){const r=cv.getBoundingClientRect();if(!r.width)return null;const d=devicePixelRatio||1;if(cv.width!==Math.round(r.width*d)||cv.height!==Math.round(r.height*d)){cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);}const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);return {x,W:r.width,H:r.height};}
let drawIn=0;
function drawMain(){
  if(page!=='home')return;
  const F=fit(cvEl);if(!F)return;const {x:cx,W,H}=F;
  const all=S[cur].pts;let pts=[];for(let i=all.length-1;i>=0&&pts.length<(ctype==='candle'?40*step:120*step);i--)pts.unshift(all[i]);
  let data;
  if(ctype==='candle'){data=[];for(let i=0;i+step*3<=pts.length;i+=step*3){const sl=pts.slice(i,i+step*3);data.push({o:sl[0],c:sl.at(-1),h:Math.max(...sl),l:Math.min(...sl)});}}
  else data=pts.filter((_,i)=>(pts.length-1-i)%step===0);
  const vals=ctype==='candle'?data.flatMap(d=>[d.h,d.l]):data;
  const mn=Math.min(...vals),mx=Math.max(...vals),pad=(mx-mn)*.15||.1,cw=W-50;
  const y=v=>H-16-((v-mn+pad)/(mx-mn+2*pad))*(H-28);
  cx.clearRect(0,0,W,H);
  cx.strokeStyle='rgba(255,220,190,.06)';cx.fillStyle='#7d716a';cx.font='10px JetBrains Mono, monospace';cx.lineWidth=1;
  for(let g=0;g<4;g++){const yy=12+g*(H-28)/3;cx.beginPath();cx.moveTo(0,yy);cx.lineTo(cw,yy);cx.stroke();const v=mx+pad-(g/3)*(mx-mn+2*pad);cx.fillText((v>=0?'+':'')+v.toFixed(2)+'%',cw+5,yy+3);}
  drawIn=Math.min(1,drawIn+(RM?1:.06));const k=1-Math.pow(1-drawIn,3);
  const last=pts.at(-1),up=last>=0,col=up?UP:DN;let hv=null;
  if(ctype==='candle'){
    const bw=cw/data.length;const n=Math.ceil(data.length*k);
    data.slice(0,n).forEach((d,i)=>{const c=d.c>=d.o?UP:DN,xm=i*bw+bw/2;cx.strokeStyle=c;cx.fillStyle=c;cx.beginPath();cx.moveTo(xm,y(d.h));cx.lineTo(xm,y(d.l));cx.stroke();const t=y(Math.max(d.o,d.c)),b=y(Math.min(d.o,d.c));cx.fillRect(xm-bw*.32,t,bw*.64,Math.max(1.5,b-t));});
    if(hoverX!==null&&k>=1){const i=Math.max(0,Math.min(data.length-1,Math.floor(hoverX*W/bw)));hv={x:i*bw+bw/2,y:y(data[i].c),v:data[i].c,ago:(data.length-1-i)*step*3,txt:`A ${data[i].o.toFixed(2)} · C ${data[i].c.toFixed(2)}`};}
  }else{
    const n=Math.max(2,Math.ceil(data.length*k)),X=i=>i/(data.length-1)*cw,d=data.slice(0,n);
    const gr=cx.createLinearGradient(0,0,0,H);gr.addColorStop(0,up?'rgba(61,220,138,.28)':'rgba(255,97,112,.28)');gr.addColorStop(1,'rgba(0,0,0,0)');
    cx.beginPath();d.forEach((v,i)=>i?cx.lineTo(X(i),y(v)):cx.moveTo(X(i),y(v)));cx.lineTo(X(n-1),H);cx.lineTo(0,H);cx.closePath();cx.fillStyle=gr;cx.fill();
    cx.beginPath();d.forEach((v,i)=>i?cx.lineTo(X(i),y(v)):cx.moveTo(X(i),y(v)));cx.strokeStyle=col;cx.lineWidth=2;cx.shadowColor=col;cx.shadowBlur=8;cx.stroke();cx.shadowBlur=0;
    if(k>=1){const lx=X(n-1),ly=y(d.at(-1));cx.beginPath();cx.arc(lx,ly,5+Math.sin(performance.now()/300)*2,0,7);cx.fillStyle=col;cx.globalAlpha=.25;cx.fill();cx.globalAlpha=1;cx.beginPath();cx.arc(lx,ly,3,0,7);cx.fill();
      cx.setLineDash([3,4]);cx.strokeStyle=col;cx.globalAlpha=.5;cx.beginPath();cx.moveTo(0,ly);cx.lineTo(cw,ly);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1;
      if(hoverX!==null){const i=Math.max(0,Math.min(data.length-1,Math.round(hoverX*W/cw*(data.length-1))));hv={x:X(i),y:y(data[i]),v:data[i],ago:(data.length-1-i)*step};}}
  }
  const e=$('#chPct');
  if(hv&&hv.x<=cw){cx.strokeStyle='rgba(246,203,146,.5)';cx.beginPath();cx.moveTo(hv.x,8);cx.lineTo(hv.x,H-8);cx.stroke();
    cx.beginPath();cx.arc(hv.x,hv.y,4,0,7);cx.fillStyle='#F6CB92';cx.fill();
    const lab=hv.ago?`hace ${hv.ago}s`:'ahora',tw=cx.measureText(lab).width+12,bx=Math.min(Math.max(hv.x-tw/2,0),cw-tw);
    cx.fillStyle='rgba(44,34,28,.95)';cx.beginPath();cx.roundRect?cx.roundRect(bx,0,tw,16,5):cx.rect(bx,0,tw,16);cx.fill();cx.fillStyle='#F6CB92';cx.fillText(lab,bx+6,11);
    e.textContent=sgn(hv.v);e.style.color=hv.v>=0?UP:DN;$('#chSub').textContent=(hv.txt?hv.txt+' · ':'')+'precio '+usd2(100*(1+hv.v/100));}
  else{e.textContent=sgn(last);e.style.color=col;$('#chSub').textContent='desde la apertura · pasa el dedo por el gráfico';}
}
function updQuotes(){for(const[s]of SYMS){const v=pctOf(s),id=sid(s),up=v>=0,t=sgn(v),c=up?UP:DN;
  const m=document.getElementById('m-'+id);if(m){setQ(m,up,t);m.style.color=c;}
  $$(`[data-q="${id}"]`).forEach(q=>{setQ(q,up,t);q.style.color=c;q.style.fontStyle='normal'});}}
function setQ(el,up,t){if(el._up!==up){el.innerHTML=ic(up?'tup':'tdown','',false)+'<span></span>';el._up=up;el.querySelector('.ic').style.cssText='width:.8em;height:.8em;margin-right:3px;vertical-align:-.05em';}el.lastChild.textContent=t;}
(function loop(){drawMain();requestAnimationFrame(loop);})();

/* ================= NOTICIAS SIMULADAS ================= */
const NEWS=[['{n} supera lo esperado en sus ganancias del trimestre',1],['Analistas recortan su precio objetivo para {n}',-1],['{n} anuncia recompra de acciones',1],['Reguladores abren una revisión a {n}',-1],['Fuerte demanda impulsa las ventas de {n}',1],['{n} advierte un trimestre más débil',-1],['{n} presenta un nuevo producto y los inversionistas reaccionan',1],['Cae el precio del cobre y presiona a {n}',-1]];
let NW=[];
function pushNews(){const s=tradable[Math.floor(Math.random()*tradable.length)];let k=Math.floor(Math.random()*NEWS.length);
  if(s==='SCCO'&&Math.random()<.5)k=7;else if(k===7)k=1;
  const [t,d]=NEWS[k],mag=(.8+Math.random()*1.2)*d*S[s].vol;S[s].shock+=mag;
  const it={s,t:t.replace('{n}',S[s].n),d,time:new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})};
  NW.unshift(it);NW=NW.slice(0,5);renderNews();
  toast(`${s}: ${it.t}`,{icon:ic('news','',false),action:{label:'Operar',fn:()=>openTrade(s)}});}
function renderNews(){$('#news').innerHTML=NW.length?NW.map(n=>`<div class="nw"><span class="chip-ic ${n.d>0?'b':'x'}" style="margin-top:2px">${ic(n.d>0?'tup':'tdown','',false)}</span><div class="nt">${esc(n.t)}<small>${esc(n.s)} · ${n.time}</small></div><button class="btn" onclick="openTrade('${n.s}')">Ver</button></div>`).join(''):'<p class="note">Las noticias aparecen cada medio minuto y mueven el precio del activo que mencionan.</p>';}
renderNews();
(function sched(){setTimeout(()=>{pushNews();sched();},22000+Math.random()*16000);})();

/* ================= WATCHLIST ================= */
let WL=store.get('wl',[]);
function toggleWL(t,n){const i=WL.findIndex(w=>w.t===t);if(i>=0){WL.splice(i,1);toast('Quitado de tu lista',ic('x','',false));}else{WL.push({t,n});toast(t+' agregado a tu lista',ic('star'));}store.set('wl',WL);renderWL(true);$$(`.star[data-t="${t}"]`).forEach(b=>b.classList.toggle('on',WL.some(w=>w.t===t)));}
function renderWL(full){
  $('#wlCount').textContent=WL.length?WL.length+' activos':'';
  if(!full)return;
  $('#wl').innerHTML=WL.length?WL.map(w=>`<div class="trow"><div class="s">${esc(w.t)}<small>${esc(w.n||'')}</small></div><div class="acts" style="margin:0"><a class="btn" href="https://finance.yahoo.com/quote/${encodeURIComponent(w.t)}" target="_blank" rel="noopener">En vivo ${ic('ext')}</a><button class="btn" data-real="${esc(w.t)}">Comprar</button><button class="btn" aria-label="Quitar" data-rm="${esc(w.t)}">${ic('x','',false)}</button></div></div>`).join(''):'<p class="note">Toca "Seguir" en una recomendación para seguirla aquí.</p>';
  $$('#wl [data-real]').forEach(b=>b.onclick=()=>openReal(b.dataset.real));
  $$('#wl [data-rm]').forEach(b=>b.onclick=()=>toggleWL(b.dataset.rm));
}
renderWL(true);

/* ================= PRÁCTICA ================= */
const PV0=()=>({cash:10000,h:{},ops:0,hist:[],curve:[10000],orders:[],alerts:[]});
let PV=Object.assign(PV0(),store.get('pv',{}));PV.orders=PV.orders||[];PV.alerts=PV.alerts||[];
function pvValue(){return PV.cash+Object.entries(PV.h).reduce((a,[s,q])=>a+q.n*price(s),0);}
function trade(s,dir,n=1,via){
  n=Math.max(1,Math.floor(n));const p=price(s),snap=JSON.stringify(PV);
  if(dir>0){if(PV.cash<p*n){toast(`Te falta efectivo: ${n} ${s} cuestan ${usd2(p*n)}`);return false;}PV.cash-=p*n;const h=PV.h[s]||{n:0,cost:0};h.cost=(h.cost*h.n+p*n)/(h.n+n);h.n+=n;PV.h[s]=h;}
  else{const h=PV.h[s];if(!h||h.n<n){toast(h?`Solo tienes ${h.n} ${s}`:`No tienes ${s} para vender`);return false;}PV.cash+=p*n;h.n-=n;if(!h.n)delete PV.h[s];}
  PV.ops++;PV.hist.unshift({s,dir,p,n,via,t:new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit',second:'2-digit'})});PV.hist=PV.hist.slice(0,40);
  store.set('pv',PV);
  const undo={label:'Deshacer',fn:()=>{PV=JSON.parse(snap);store.set('pv',PV);refreshPlay();toast('Operación deshecha');}};
  toast(`${via?via+': ':''}${dir>0?'Compraste':'Vendiste'} ${n} ${s} a ${usd2(p)}`,{icon:`<span class="chip-ic ${dir>0?'b':'x'}" style="margin:0">${ic(dir>0?'buy':'sell')}</span>`,action:via?null:(dir>0&&REALON&&!sheetSym?{label:'Comprar de verdad',fn:()=>openReal(s,n)}:undo)});
  (dir>0?SFX.buy:SFX.sell)();addXP(3);mission('ops');if(dir>0)mission('buy');
  refreshPlay();checkAch();return true;
}
function refreshPlay(){renderMkt(true);renderPV();renderHist();renderPos();renderOrd();sheetTick&&sheetTick();}
let mktBuilt=false;
function renderMkt(force){
  const box=$('#mkt');
  if(!mktBuilt||force){box.innerHTML=tradable.map(s=>`<div class="trow click" id="r-${s}" data-open="${s}"><div class="s">${s}<small>${S[s].n} · <span class="hold"></span></small></div><canvas class="spark"></canvas><div class="p"><span class="pr"></span><small class="pc"></small></div><div class="qb"><button class="x" aria-label="Vender 1 ${s}" data-t="${s}" data-d="-1">${ic('minus','',false)}</button><button class="b" aria-label="Comprar 1 ${s}" data-t="${s}" data-d="1">${ic('plus','',false)}</button></div></div>`).join('');mktBuilt=true;
    $$('#mkt .qb button').forEach(b=>b.onclick=e=>{e.stopPropagation();trade(b.dataset.t,+b.dataset.d);});
    $$('#mkt [data-open]').forEach(r=>r.onclick=()=>openTrade(r.dataset.open));}
  if(page!=='play')return;
  tradable.forEach(s=>{const r=document.getElementById('r-'+s);if(!r)return;const p=price(s),v=pctOf(s),c=v>=0?UP:DN;
    const pr=r.querySelector('.pr'),old=pr._p;pr.textContent=usd2(p);pr._p=p;
    if(old!==undefined&&old!==p){pr.classList.remove('flash-up','flash-down');void pr.offsetWidth;pr.classList.add(p>old?'flash-up':'flash-down');}
    const pc=r.querySelector('.pc');pc.textContent=sgn(v);pc.style.color=c;
    const h=PV.h[s];r.querySelector('.hold').textContent=h?h.n+' acc.':'0 acc.';
    spark(r.querySelector('.spark'),S[s].pts.slice(-40),c);
  });
}
function spark(cv,d,c,fill){const F=fit(cv);if(!F)return;const mn=Math.min(...d),mx=Math.max(...d),X=i=>i/(d.length-1)*F.W,Y=q=>F.H-3-(q-mn)/((mx-mn)||1)*(F.H-6);F.x.clearRect(0,0,F.W,F.H);
  F.x.beginPath();d.forEach((q,i)=>i?F.x.lineTo(X(i),Y(q)):F.x.moveTo(X(i),Y(q)));F.x.strokeStyle=c;F.x.lineWidth=fill?2:1.5;F.x.stroke();
  if(fill){F.x.lineTo(F.W,F.H);F.x.lineTo(0,F.H);F.x.closePath();const g=F.x.createLinearGradient(0,0,0,F.H);g.addColorStop(0,c+'44');g.addColorStop(1,c+'00');F.x.fillStyle=g;F.x.fill();F.x.beginPath();F.x.arc(X(d.length-1),Y(d.at(-1)),3,0,7);F.x.fillStyle=c;F.x.fill();}}
function renderPV(){
  const tot=pvValue(),g=(tot-10000)/100;PV.curve.push(tot);if(PV.curve.length>200)PV.curve.shift();
  if(page!=='play')return;
  const inv=tot-PV.cash;countUp($('#pvTot'),tot,usd2,600);countUp($('#pvCash'),PV.cash,usd,600);countUp($('#pvInv'),inv,usd,600);$('#pvOps').textContent=PV.ops;
  const e=$('#pvGain');e.textContent=sgn(g);e.style.color=g>=0?UP:DN;
  const F=fit($('#pvc'));if(F){const d=PV.curve,mn=Math.min(...d)-5,mx=Math.max(...d)+5,c=g>=0?UP:DN;
  F.x.clearRect(0,0,F.W,F.H);F.x.beginPath();d.forEach((q,i)=>{const X=d.length<2?0:i/(d.length-1)*F.W,Y=F.H-(q-mn)/(mx-mn)*F.H;i?F.x.lineTo(X,Y):F.x.moveTo(X,Y)});F.x.strokeStyle=c;F.x.lineWidth=2;F.x.stroke();}
  const parts=Object.entries(PV.h).map(([s,h])=>[s,h.n*price(s)]);parts.push(['Efectivo',PV.cash]);
  const box=$('#alloc');if(box.childElementCount!==parts.length)box.innerHTML=parts.map((p,i)=>`<div title="${p[0]}" style="background:${p[0]==='Efectivo'?'rgba(156,143,134,.4)':COLORS[i%8]};flex-grow:0"></div>`).join('');
  [...box.children].forEach((el,i)=>{el.style.flexGrow=String(parts[i][1]/tot);el.title=`${parts[i][0]} · ${(parts[i][1]/tot*100).toFixed(1)}%`;});
}
function renderPos(){const E=Object.entries(PV.h);$('#posN').textContent=E.length?E.length+' activos':'';
  $('#pos').innerHTML=E.length?E.map(([s,h],i)=>{const p=price(s),pl=(p-h.cost)*h.n,pp=(p/h.cost-1)*100,c=pl>=0?UP:DN;return `<div class="trow click" data-open="${s}"><div class="s"><span style="display:inline-block;width:8px;height:8px;border-radius:3px;background:${COLORS[i%8]};margin-right:6px"></span>${s}<small>${h.n} acc. · costo prom. ${usd2(h.cost)}</small></div><div class="p">${usd2(p*h.n)}<small class="pnl" style="color:${c}">${pl>=0?'+':''}${usd2(pl)} · ${sgn(pp)}</small></div></div>`;}).join(''):'<p class="note">Todavía no tienes acciones. Toca un activo del mercado para comprar.</p>';
  $$('#pos [data-open]').forEach(r=>r.onclick=()=>openTrade(r.dataset.open));}
function renderHist(){$('#hist').innerHTML=PV.hist.length?PV.hist.map(h=>`<div class="trow"><div class="s" style="font-size:13px"><span class="chip-ic ${h.dir>0?'b':'x'}">${ic(h.dir>0?'buy':'sell','',false)}</span>${h.dir>0?'Compra':'Venta'} · ${h.n||1} ${h.s}<small>${h.t}${h.via?' · '+h.via:''}</small></div><div class="p">${usd2(h.p*(h.n||1))}<small style="color:var(--mut)">${usd2(h.p)} c/u</small></div></div>`).join(''):'Aún no has hecho operaciones.';}
const OT={limit:'Límite',stop:'Stop'};
function renderOrd(){const n=PV.orders.length+PV.alerts.length;$('#ordN').textContent=n?n+' activas':'';
  $('#ord').innerHTML=n?[...PV.orders.map(o=>`<div class="trow"><div class="s" style="font-size:13px"><span class="chip-ic ${o.dir>0?'b':'x'}">${ic('clock','',false)}</span>${OT[o.type]} · ${o.dir>0?'Comprar':'Vender'} ${o.n} ${o.s}<small>cuando llegue a ${usd2(o.px)} · ahora ${usd2(price(o.s))}</small></div><button class="btn" data-co="${o.id}" aria-label="Cancelar orden">${ic('x','',false)}</button></div>`),
    ...PV.alerts.map(a=>`<div class="trow"><div class="s" style="font-size:13px"><span class="chip-ic b" style="color:var(--cu2);background:rgba(227,161,92,.15)">${ic('bell','',false)}</span>Alerta · ${a.s}<small>si ${a.up?'sube':'baja'} a ${usd2(a.px)} · ahora ${usd2(price(a.s))}</small></div><button class="btn" data-ca="${a.id}" aria-label="Quitar alerta">${ic('x','',false)}</button></div>`)].join(''):'<p class="note">Crea órdenes límite, stop o alertas de precio desde la ficha de cada activo.</p>';
  $$('#ord [data-co]').forEach(b=>b.onclick=()=>{PV.orders=PV.orders.filter(o=>o.id!=b.dataset.co);store.set('pv',PV);renderOrd();toast('Orden cancelada');});
  $$('#ord [data-ca]').forEach(b=>b.onclick=()=>{PV.alerts=PV.alerts.filter(o=>o.id!=b.dataset.ca);store.set('pv',PV);renderOrd();toast('Alerta quitada');});}
function checkOrders(){let ch=false;
  for(const o of [...PV.orders]){const p=price(o.s);const hit=o.type==='limit'?(o.dir>0?p<=o.px:p>=o.px):(o.dir>0?p>=o.px:p<=o.px);
    if(hit){PV.orders=PV.orders.filter(x=>x!==o);ch=true;trade(o.s,o.dir,o.n,'Orden '+OT[o.type].toLowerCase());}}
  for(const a of [...PV.alerts]){const p=price(a.s);if(a.up?p>=a.px:p<=a.px){PV.alerts=PV.alerts.filter(x=>x!==a);ch=true;toast(`${a.s} llegó a ${usd2(p)}`,{icon:ic('bell'),action:{label:'Ver',fn:()=>openTrade(a.s)}});}}
  if(ch){store.set('pv',PV);renderOrd();}}
$('#reset').onclick=e=>{const b=e.currentTarget;if(!b._arm){b._arm=1;b.textContent='¿Seguro? Toca otra vez';setTimeout(()=>{b._arm=0;b.textContent='Reiniciar';},2500);return;}
  b._arm=0;b.textContent='Reiniciar';const snap=JSON.stringify(PV);PV=PV0();store.set('pv',PV);BOT={cash:10000,h:{},log:''};store.set('bot',BOT);refreshPlay();toast('Cartera de práctica reiniciada',{action:{label:'Deshacer',fn:()=>{PV=JSON.parse(snap);store.set('pv',PV);refreshPlay();}}});};
setInterval(()=>store.set('pv',PV),5000);

/* ================= LOGROS ================= */
const ACH=[['first','Primera compra','trophy',()=>PV.hist.some(h=>h.dir>0)],['div','4 activos','diversificar',()=>Object.keys(PV.h).length>=4],['ten','10 operaciones','accion',()=>PV.ops>=10],['green','Cartera +2%','alcista',()=>pvValue()>=10200],
  ['order','Primera orden','clock',()=>PV.hist.some(h=>h.via)||PV.orders.length>0],['ai','Cartera con IA','bolt',()=>!!store.get('plan',null)],['game','Racha de 3','target',()=>G.best>=3],['video','Viste tu video','film',()=>!!store.get('vid',0)]];
let ACHD=store.get('ach',{});
function renderAch(){$('#achs').innerHTML=ACH.map(([id,n,i])=>`<div class="ach${ACHD[id]?' on':''}" id="a-${id}">${ic(i,'',false)}${n}</div>`).join('');$('#achN').textContent=Object.keys(ACHD).length+' de '+ACH.length;}
function checkAch(){let nw=false;for(const [id,n,i,t] of ACH){if(!ACHD[id]){let ok=false;try{ok=t()}catch(e){}if(ok){ACHD[id]=Date.now();nw=true;addXP(50);toast('Logro desbloqueado: '+n,ic('trophy'));FX.burst(innerWidth/2,innerHeight-140,70);}}}
  if(nw){store.set('ach',ACHD);renderAch();}}

/* ================= HOJA INFERIOR (ficha y operación) ================= */
let sheetTick=null,sheetSym=null;
const sh=$('#sheet'),shBg=$('#sheetBg');
function openSheet(html,onTick){$('#sheetBody').innerHTML=html;hydrate($('#sheetBody'));sheetTick=onTick||null;sh.style.transform='';
  document.body.classList.add('sheet-open');document.body.style.overflow='hidden';shBg.classList.add('open');sh.classList.add('open');sh.scrollTop=0;
  setTimeout(()=>{const f=sh.querySelector('[data-focus]');f&&f.focus({preventScroll:true});},350);}
function closeSheet(){sh.classList.remove('open','drag');sh.style.transform='';shBg.classList.remove('open');document.body.classList.remove('sheet-open');document.body.style.overflow='';sheetTick=null;sheetSym=null;}
shBg.onclick=closeSheet;
(()=>{let y0=null,t0=0,dy=0;
  const start=e=>{if(!e.target.closest('.handle,.sh-top'))return;if(sh.scrollTop>0)return;y0=e.clientY;t0=performance.now();dy=0;sh.classList.add('drag');sh.setPointerCapture(e.pointerId);};
  sh.addEventListener('pointerdown',start);
  sh.addEventListener('pointermove',e=>{if(y0===null)return;dy=e.clientY-y0;const v=dy<0?-Math.sqrt(-dy)*2:dy;sh.style.transform=`translateY(${v}px)`;shBg.style.opacity=String(Math.max(0,1-dy/400));});
  const end=()=>{if(y0===null)return;y0=null;sh.classList.remove('drag');shBg.style.opacity='';const v=dy/(performance.now()-t0);
    if(dy>sh.offsetHeight*.3||v>.5)closeSheet();else sh.style.transform='';};
  sh.addEventListener('pointerup',end);sh.addEventListener('pointercancel',end);})();

function openTrade(s){
  if(!tradable.includes(s)){pickSym(s);go('home');return;}
  sheetSym=s;let qty=1,mode='market',dirAlert=1;
  const h=()=>PV.h[s];
  openSheet(`
   <div class="sh-top"><div><div class="tk">${s}</div><div class="nm">${esc(S[s].n)} · precio de práctica</div></div><div class="sh-pr"><span id="sp">—</span><small id="spc"></small></div></div>
   <canvas id="spk" style="height:110px;margin-top:10px"></canvas>
   <div class="kpis"><div class="kpi"><small>Tienes</small><b id="sH">0</b></div><div class="kpi"><small>Costo prom.</small><b id="sC">—</b></div><div class="kpi"><small>Resultado</small><b id="sPL">—</b></div></div>
   <label class="l">Tipo de orden</label>
   <div class="seg" id="oT" style="margin-top:0"><button class="act" data-v="market">Mercado</button><button data-v="limit">Límite</button><button data-v="stop">Stop</button></div>
   <p class="note" id="oHelp">Se ejecuta ahora al precio actual.</p>
   <div id="pxRow" class="hidden"><label class="l" for="oPx">Precio objetivo</label><input class="f" id="oPx" type="number" step="0.01" inputmode="decimal"></div>
   <label class="l" for="oQ">Cantidad</label>
   <div class="stp"><button id="qM" aria-label="Menos">−</button><input class="f" id="oQ" type="number" min="1" value="1" inputmode="numeric" data-focus><button id="qP" aria-label="Más">+</button></div>
   <div class="qchips"><button class="qchip" data-q="1">1</button><button class="qchip" data-q="5">5</button><button class="qchip" data-q="10">10</button><button class="qchip" data-q="25">25</button><button class="qchip" data-q="max">Máx</button></div>
   <div class="tot"><span>Total ≈ <b id="oTot">—</b></span><span>Efectivo <b id="oCash">—</b></span></div>
   <div class="tbtns"><button class="sell" id="oS">Vender</button><button class="buy" id="oB">Comprar</button></div>
   <label class="l">Alerta de precio</label>
   <div class="stp"><button id="aDir" aria-label="Cambiar dirección" style="width:auto;padding:0 12px;font-size:13px">Si sube a</button><input class="f" id="aPx" type="number" step="0.01" inputmode="decimal" aria-label="Precio de la alerta"><button id="aGo" aria-label="Crear alerta">${ic('bell','',false)}</button></div>
   <label class="chk"><input type="checkbox" id="sReal" ${REALON?'checked':''}> Después de comprar, muéstrame dónde comprarla de verdad</label>
   <div class="acts"><button class="btn solid" id="sReal2">${ic('broker','',false)} Comprar ${s} de verdad</button><button class="btn" id="sAsk">Preguntar a la IA sobre ${s}</button></div>`,
  ()=>{const p=price(s),v=pctOf(s),c=v>=0?UP:DN,H=h();
    $('#sp').textContent=usd2(p);$('#spc').textContent=sgn(v);$('#spc').style.color=c;
    spark($('#spk'),S[s].pts.slice(-90),c,true);
    $('#sH').textContent=H?H.n+' acc.':'0';$('#sC').textContent=H?usd2(H.cost):'—';
    const pl=H?(p-H.cost)*H.n:0;$('#sPL').textContent=H?(pl>=0?'+':'')+usd2(pl):'—';$('#sPL').style.color=H?(pl>=0?UP:DN):'';
    const px=mode==='market'?p:(+$('#oPx').value||p);$('#oTot').textContent=usd2(px*qty);$('#oCash').textContent=usd(PV.cash);});
  const p0=price(s);$('#oPx').value=p0.toFixed(2);$('#aPx').value=(p0*1.02).toFixed(2);
  const setQ=n=>{qty=Math.max(1,Math.floor(n)||1);$('#oQ').value=qty;sheetTick();};
  $('#oQ').oninput=()=>setQ(+$('#oQ').value);
  const hold=(b,d)=>{let t,iv;const st=()=>{setQ(qty+d);t=setTimeout(()=>{iv=setInterval(()=>setQ(qty+d),70);},380);},sp=()=>{clearTimeout(t);clearInterval(iv);};
    b.addEventListener('pointerdown',e=>{e.preventDefault();st();});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,sp));};
  hold($('#qM'),-1);hold($('#qP'),1);
  $$('#sheet .qchip').forEach(b=>b.onclick=()=>{const p=price(s);setQ(b.dataset.q==='max'?Math.max(1,Math.floor(PV.cash/p)):+b.dataset.q);});
  const help={market:'Se ejecuta ahora al precio actual.',limit:'Compra si el precio baja hasta tu objetivo, o vende si sube hasta él.',stop:'Vende si el precio cae hasta tu objetivo (stop loss), o compra si sube hasta él.'};
  $$('#oT button').forEach(b=>b.onclick=()=>{mode=b.dataset.v;$$('#oT button').forEach(x=>x.classList.toggle('act',x===b));$('#oHelp').textContent=help[mode];$('#pxRow').classList.toggle('hidden',mode==='market');
    const p=price(s);$('#oPx').value=(mode==='limit'?p*.98:p*.97).toFixed(2);sheetTick();});
  $('#oPx').oninput=()=>sheetTick();
  const place=dir=>{if(mode==='market'){if(trade(s,dir,qty)){const b=dir>0?$('#oB'):$('#oS');const [x,y]=center(b);dir>0&&FX.burst(x,y,24);if(dir>0&&REALON){const q=qty;setTimeout(()=>{if(sheetSym!==s)return;sheetTick=null;$('#sheetBody').innerHTML=realHTML(s,q);bindReal(s);sh.scrollTop=0;},650);}}return;}
    const px=+$('#oPx').value;if(!px)return toast('Escribe el precio objetivo');
    if(dir<0&&(!h()||h().n<qty))return toast(`Necesitas ${qty} ${s} para poner esa orden de venta`);
    PV.orders.push({id:Date.now(),s,dir,type:mode,px,n:qty});store.set('pv',PV);renderOrd();checkAch();mission('order');addXP(5);
    toast(`Orden ${OT[mode].toLowerCase()}: ${dir>0?'comprar':'vender'} ${qty} ${s} a ${usd2(px)}`,ic('clock'));};
  $('#oB').onclick=()=>place(1);$('#oS').onclick=()=>place(-1);
  $('#aDir').onclick=()=>{dirAlert*=-1;$('#aDir').textContent=dirAlert>0?'Si sube a':'Si baja a';$('#aPx').value=(price(s)*(1+.02*dirAlert)).toFixed(2);};
  $('#aGo').onclick=()=>{const px=+$('#aPx').value;if(!px)return;PV.alerts.push({id:Date.now(),s,px,up:dirAlert>0});store.set('pv',PV);renderOrd();toast(`Te aviso si ${s} ${dirAlert>0?'sube':'baja'} a ${usd2(px)}`,ic('bell'));};
  $('#sReal').onchange=e=>{REALON=e.target.checked;store.set('realOn',REALON);};$('#sReal2').onclick=()=>{sheetTick=null;$('#sheetBody').innerHTML=realHTML(s,0);bindReal(s);sh.scrollTop=0;};
  $('#sAsk').onclick=()=>{closeSheet();go('chat');ask(`En mi simulador ${s} (${S[s].n}) va ${sgn(pctOf(s))}. ¿Qué debería mirar antes de invertir en la acción real? Ventajas y riesgos.`);};
  sheetTick();
}

/* ================= PALETA DE COMANDOS ================= */
const TERMS=[['accion','Acción','Una pequeña parte de una empresa. Si a la empresa le va bien, tu acción suele valer más.'],
 ['etf','ETF','Una canasta de muchas acciones en un solo producto. Diversificas con una sola compra.'],
 ['dividendo','Dividendo','Parte de las ganancias que una empresa te paga por ser accionista, normalmente cada 3 meses.'],
 ['alcista','Mercado alcista','Cuando los precios suben por un buen tiempo. Se le llama "bull market".'],
 ['bajista','Mercado bajista','Cuando los precios caen 20% o más desde su máximo. Se le llama "bear market".'],
 ['diversificar','Diversificar','No poner todos los huevos en una canasta: repartir en varias empresas y sectores.'],
 ['volatilidad','Volatilidad','Qué tanto sube y baja un precio. Más volatilidad = más riesgo y más posible ganancia.'],
 ['compuesto','Interés compuesto','Ganar intereses sobre tus intereses. Con tiempo, tu dinero crece cada vez más rápido.'],
 ['pe','P/E (PER)','Precio ÷ ganancia por acción. Indica si una acción está "cara" o "barata" frente a lo que gana.'],
 ['broker','Bróker','La plataforma o empresa que te permite comprar y vender acciones en la bolsa.'],
 ['bvl','BVL','Bolsa de Valores de Lima, donde cotizan empresas peruanas como Credicorp o Buenaventura.'],
 ['stop','Stop loss','Orden para vender automáticamente si el precio cae hasta cierto nivel y limitar pérdidas.']];
const CMDS=[
 ...[['home','Invertir con IA','accion'],['play','Modo práctica','buy'],['tools','Herramientas','calc'],['chat','Asesor IA','chat'],['learn','Academia','cap']].map(([p,n,i])=>({g:'Ir a',n,i,k:'',f:()=>go(p)})),
 ...[['calc','Calculadora de interés compuesto','compuesto'],['goal','Planificador de meta','target'],['quiz','Test de perfil de riesgo','stop'],['cmp','Comparador de acciones','bolt'],['video','Tu cartera en video','film']].map(([t,n,i])=>({g:'Herramientas',n,i,k:'',f:()=>{go('tools');tool(t);}})),
 {g:'Acciones',n:'Simular crisis del mercado',i:'bajista',k:'crash caida',f:()=>{go('home');shockAll(-1);}},{g:'Acciones',n:'Simular rally del mercado',i:'alcista',k:'subida',f:()=>{go('home');shockAll(1);}},
 {g:'Acciones',n:'Mi nivel y retos de hoy',i:'trophy',k:'xp misiones',f:()=>openLevel()},{g:'Acciones',n:'Descubre acciones (deslizar)',i:'etf',k:'swipe',f:()=>go('learn')},{g:'Acciones',n:'Duelo contra Lucio Bot',i:'target',k:'bot',f:()=>go('play')},
 ...['AAPL','MSFT','NVDA','VOO','BAP','SCCO','TSLA','KO','MELI','AMZN'].map(t=>({g:'Comprar de verdad',n:t,i:'broker',k:'real broker',f:()=>openReal(t)})),
 {g:'Herramientas',n:'Jugar ¿Sube o baja?',i:'target',k:'juego',f:()=>{go('learn');}},
 ...tradable.map(s=>({g:'Operar',n:`${s} · ${S[s].n}`,i:'buy',k:'comprar vender',f:()=>openTrade(s)})),
 ...SYMS.filter(s=>!tradable.includes(s[0])).map(([s,n])=>({g:'Gráfico',n:`${s} · ${n}`,i:'alcista',k:'indice',f:()=>{go('home');pickSym(s);}})),
 ...TERMS.map(([e,t])=>({g:'Aprender',n:'Qué es: '+t,i:e,k:'',f:()=>{go('chat');ask('Explícame con un ejemplo qué es: '+t);}}))];
let cmdSel=0,cmdRes=[];
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function openCmd(){$('#cmdBg').classList.add('open');$('#cmd').classList.add('open');$('#cmdIn').value='';renderCmd();setTimeout(()=>$('#cmdIn').focus(),20);}
function closeCmd(){$('#cmdBg').classList.remove('open');$('#cmd').classList.remove('open');}
function renderCmd(){const q=norm($('#cmdIn').value.trim());
  cmdRes=CMDS.filter(c=>!q||q.split(/\s+/).every(w=>norm(c.n+' '+c.g+' '+c.k).includes(w))).slice(0,q?30:12);cmdSel=Math.min(cmdSel,Math.max(0,cmdRes.length-1));
  let g='';$('#cmdList').innerHTML=cmdRes.length?cmdRes.map((c,i)=>{const hd=c.g!==g?`<div class="grp">${c.g}</div>`:'';g=c.g;return hd+`<li data-i="${i}" class="${i===cmdSel?'sel':''}">${ic(c.i,'',false)}${esc(c.n)}${i===cmdSel?'<small>Enter</small>':''}</li>`;}).join(''):'<div class="empty">Nada coincide. Prueba con un ticker como NVDA o un término como ETF.</div>';
  $$('#cmdList li').forEach(li=>{li.onclick=()=>pickCmd(+li.dataset.i);li.onmousemove=()=>{if(cmdSel!==+li.dataset.i){cmdSel=+li.dataset.i;renderCmd();}};});
  const s=$('#cmdList li.sel');s&&s.scrollIntoView({block:'nearest'});}
function pickCmd(i){const c=cmdRes[i];if(!c)return;closeCmd();setTimeout(c.f,60);}
$('#cmdIn').oninput=()=>{cmdSel=0;renderCmd();};
$('#cmdIn').onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();cmdSel=Math.min(cmdRes.length-1,cmdSel+1);renderCmd();}else if(e.key==='ArrowUp'){e.preventDefault();cmdSel=Math.max(0,cmdSel-1);renderCmd();}else if(e.key==='Enter'){e.preventDefault();pickCmd(cmdSel);}};
$('#cmdBg').onclick=closeCmd;$('#openCmd').onclick=openCmd;
addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#cmd').classList.contains('open')?closeCmd():openCmd();}
  else if(e.key==='Escape'){if($('#cmd').classList.contains('open'))closeCmd();else if(sh.classList.contains('open'))closeSheet();}
  else if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();openCmd();}});
if(!/Mac|iPhone|iPad/.test(navigator.platform))$('#openCmd kbd').textContent='Ctrl K';

/* ================= CALCULADORA ================= */
let calcYrs=[],calcK=1,calcHi=null;
function calc(){
  const I=+$('#cI').value||0,M=+$('#cM').value||0,R=+$('#cR').value,Y=+$('#cY').value,inf=$('#cInf').checked;
  $('#cRv').textContent=R+'%';$('#cYv').textContent=Y;
  const r=R/100/12;let v=I,put=I;const yrs=[];
  for(let m=1;m<=Y*12;m++){v=v*(1+r)+M;put+=M;if(m%12===0){const d=inf?Math.pow(1.03,m/12):1;yrs.push({v:v/d,put:put/d});}}
  const L=yrs.at(-1)||{v:I,put:I};$('#cFl').textContent=inf?'Final (hoy)':'Final';
  countUp($('#cF'),L.v,usd);countUp($('#cP'),L.put,usd);countUp($('#cG'),L.v-L.put,usd);
  calcYrs=yrs;calcHi=null;calcK=RM?1:0;(function a(){calcK=Math.min(1,calcK+.06);drawCalc();if(calcK<1)requestAnimationFrame(a)})();
}
function drawCalc(){
  const F=fit($('#cc'));const yrs=calcYrs;if(!F||!yrs.length)return;const {x,W,H}=F,mx=yrs.at(-1).v,bw=W/yrs.length,k=1-Math.pow(1-calcK,3),top=22;
  x.clearRect(0,0,W,H);
  yrs.forEach((y,i)=>{const hV=y.v/mx*(H-top)*k,hP=y.put/mx*(H-top)*k,X=i*bw+bw*.15,w=bw*.7;x.globalAlpha=calcHi===null||calcHi===i?1:.45;
    x.fillStyle='rgba(156,143,134,.35)';x.fillRect(X,H-hP,w,hP);
    const g=x.createLinearGradient(0,H-hV,0,H-hP);g.addColorStop(0,'#F6CB92');g.addColorStop(1,'#B9733A');x.fillStyle=g;x.fillRect(X,H-hV,w,Math.max(0,hV-hP));});
  x.globalAlpha=1;x.font='10px Inter, sans-serif';
  if(calcHi!==null&&yrs[calcHi]){const y=yrs[calcHi],t=`Año ${calcHi+1}: ${usd(y.v)} (+${usd(y.v-y.put)})`,tw=x.measureText(t).width+12,cx=Math.min(Math.max(calcHi*bw+bw/2-tw/2,0),W-tw);
    x.fillStyle='rgba(44,34,28,.95)';x.beginPath();x.roundRect?x.roundRect(cx,0,tw,17,5):x.rect(cx,0,tw,17);x.fill();x.fillStyle='#F6CB92';x.fillText(t,cx+6,12);}
  else{x.fillStyle='rgba(156,143,134,.7)';x.fillRect(4,5,9,9);x.fillText('aportado',17,13);x.fillStyle='#E3A15C';x.fillRect(72,5,9,9);x.fillText('intereses',85,13);}
}
['#cI','#cM','#cR','#cY','#cInf'].forEach(s=>{$(s).addEventListener('input',calc);$(s).addEventListener('change',()=>mission('calc'));});
const ccEl=$('#cc');const ccPick=e=>{const r=ccEl.getBoundingClientRect();if(!calcYrs.length)return;calcHi=Math.max(0,Math.min(calcYrs.length-1,Math.floor((e.clientX-r.left)/r.width*calcYrs.length)));drawCalc();};
ccEl.addEventListener('pointermove',ccPick);ccEl.addEventListener('pointerdown',ccPick);ccEl.addEventListener('pointerleave',()=>{calcHi=null;drawCalc();});

/* ================= META ================= */
let goalOut={};
function goal(){const T=+$('#gT').value||0,P=+$('#gH').value||0,Y=+$('#gY').value,R=+$('#gR').value,n=Y*12,r=R/100/12;
  $('#gYv').textContent=Y+(Y===1?' año':' años');$('#gRv').textContent=R+'%';
  const g=r?Math.pow(1+r,n):1,fvP=P*g,pmt=Math.max(0,r?(T-fvP)*r/(g-1):(T-P)/n);
  const share=T?Math.min(1,fvP/T):0;
  $('#gRing').style.strokeDashoffset=String(289*(1-share));$('#gPct').textContent=Math.round(share*100)+'%';
  countUp($('#gPmt'),pmt,usd,700);
  $('#gTxt').textContent=pmt<=0?'Con lo que ya tienes llegas sin aportar más.':`Tu ahorro actual cubre el ${Math.round(share*100)}% de la meta. Aportarías ${usd(pmt*n)} y los intereses pondrían ${usd(Math.max(0,T-P-pmt*n))}.`;
  goalOut={P,pmt,Y,R};}
['#gT','#gH','#gY','#gR'].forEach(s=>$(s).addEventListener('input',goal));
$('#gUse').onclick=()=>{$('#cI').value=goalOut.P;$('#cM').value=Math.ceil(goalOut.pmt);$('#cR').value=Math.max(1,goalOut.R);$('#cY').value=goalOut.Y;tool('calc');toast('Datos llevados a la calculadora');};

/* ================= TEST DE RIESGO ================= */
const QZ=[
 ['Si tu inversión baja 20% en un mes, ¿qué haces?',['Vendo todo para no perder más','Espero a que se recupere','Compro más, está barato']],
 ['¿Cuándo vas a necesitar este dinero?',['En menos de 1 año','En 1 a 5 años','En más de 5 años']],
 ['¿Qué prefieres?',['Ganar poco pero seguro','Un equilibrio','Ganar mucho aunque pueda perder']],
 ['¿Cuánta experiencia tienes invirtiendo?',['Ninguna','Algo, he leído o probado','Bastante']],
 ['Si pierdes parte de lo invertido, ¿cómo afecta tu vida?',['Mucho, lo necesito','Un poco','Casi nada, es dinero extra']]];
let qi=0,qs=0;
function quiz(){
  const box=$('#quiz');
  if(qi<QZ.length){const [q,o]=QZ[qi];
    box.innerHTML=`<h3>Test de perfil de riesgo</h3><div class="prog"><div style="width:${qi/QZ.length*100}%"></div></div><p class="note" style="margin:0 0 6px">Pregunta ${qi+1} de ${QZ.length}${qi?' · <button class="btn" id="qBack" style="padding:2px 8px;font-size:11px">Atrás</button>':''}</p><p style="font-size:15px;font-weight:600;animation:fadeUp .3s var(--ease-out)">${q}</p>${o.map((t,i)=>`<button class="qopt" style="animation-delay:${i*.05}s" data-s="${i}">${t}</button>`).join('')}`;
    $$('.qopt').forEach(b=>b.onclick=()=>{qs+=+b.dataset.s;(quiz.h=quiz.h||[]).push(+b.dataset.s);qi++;b.style.borderColor='var(--cu)';setTimeout(quiz,180);});
    const bk=$('#qBack');if(bk)bk.onclick=()=>{qi--;qs-=quiz.h.pop()||0;quiz();};
  }else{
    const sc=qs/(QZ.length*2),prof=sc<.34?['conservador','Conservador','Prefieres cuidar tu dinero. Te convienen ETFs amplios, bonos y empresas estables con dividendos.']:sc<.67?['moderado','Moderado','Buscas equilibrio: una base de ETFs con algunas acciones de crecimiento.']:['agresivo','Agresivo','Aceptas subidas y bajadas fuertes buscando más ganancia: tecnología y crecimiento, siempre diversificando.'];
    box.innerHTML=`<h3 style="text-align:center">Tu perfil es</h3><svg class="gauge" width="220" height="125" viewBox="0 0 220 125"><path d="M20 110a90 90 0 0 1 180 0" stroke="rgba(255,255,255,.08)" stroke-width="14" fill="none" stroke-linecap="round"/><path id="garc" d="M20 110a90 90 0 0 1 180 0" stroke="url(#gg)" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="283" stroke-dashoffset="283" style="transition:stroke-dashoffset 1.2s var(--ease-out)"/><defs><linearGradient id="gg"><stop offset="0" stop-color="#3DDC8A"/><stop offset=".5" stop-color="#F5B142"/><stop offset="1" stop-color="#FF6170"/></linearGradient></defs><line id="gn" x1="110" y1="110" x2="110" y2="36" stroke="#F6CB92" stroke-width="3" stroke-linecap="round" style="transform-origin:110px 110px;transform:rotate(-90deg);transition:transform 1.2s cubic-bezier(.34,1.4,.64,1)"/><circle cx="110" cy="110" r="6" fill="#F6CB92"/></svg>
    <p style="text-align:center;font-family:var(--serif);font-size:30px;color:var(--cu2);animation:fadeUp .5s .4s both">${prof[1]}</p><p class="sum" style="text-align:center;animation:fadeUp .5s .55s both">${prof[2]}</p>
    <div class="acts" style="justify-content:center"><button class="btn solid" id="useP">Usar este perfil</button><button class="btn" id="reQ">Repetir</button></div>`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{$('#garc').style.strokeDashoffset=283*(1-Math.max(.05,sc));$('#gn').style.transform=`rotate(${-90+180*sc}deg)`;}));
    $('#useP').onclick=()=>{setRisk(prof[0]);store.set('risk',prof[0]);toast('Perfil '+prof[1]+' aplicado');go('home');};
    $('#reQ').onclick=()=>{qi=0;qs=0;quiz.h=[];quiz();};
  }
}
quiz();
const TOOLS=['calc','goal','quiz','cmp','video'];
function tool(t){$$('#tnav button').forEach(x=>x.classList.toggle('act',x.dataset.t===t));TOOLS.forEach(k=>$('#t-'+k).classList.toggle('hidden',k!==t));
  const s=$('#t-'+t);s.style.animation='none';void s.offsetWidth;s.style.animation='pageIn .3s var(--ease-out)';if(t==='calc')calc();if(t==='goal')goal();if(t==='video')mountVideo();}
$$('#tnav button').forEach(b=>b.onclick=()=>tool(b.dataset.t));

/* ================= VIDEO CON REMOTION ================= */
let vSrc='calc',vFmt='v';
function exPlan(){return {monto:5000,moneda:'USD',plazo_meses:36,meta_pct:30,ejemplo:true,cartera:[{ticker:'VOO',porcentaje:40},{ticker:'MSFT',porcentaje:20},{ticker:'NVDA',porcentaje:15},{ticker:'BAP',porcentaje:15},{ticker:'SCCO',porcentaje:10}],escenarios:{pesimista:4600,base:6300,optimista:7800}};}
function smooth(a,b,n,wob){return Array.from({length:n},(_,i)=>{const k=i/(n-1);return a+(b-a)*(k*k*(3-2*k))+Math.sin(i*1.7)*wob*(1-Math.abs(.5-k)*2)*Math.abs(b-a)*.08;});}
function videoProps(){
  const vertical=vFmt==='v';
  if(vSrc==='ai'){const d=store.get('plan',null)||exPlan(),cur=d.moneda==='PEN'?'PEN':'USD',amt=+d.monto||0,s=d.escenarios||{};
    return {vertical,kicker:d.ejemplo?'Cartera de ejemplo':'Tu cartera sugerida',amountLabel:'Monto a invertir',amount:amt,currency:cur,
      chips:[['Plazo',(d.plazo_meses||12)+' meses'],['Meta',(d.meta_pct||0)+'%'],['Activos',String((d.cartera||[]).length)]],
      items:(d.cartera||[]).map((x,i)=>({t:x.ticker,pct:+x.porcentaje||0,color:COLORS[i%8]})),
      curveTitle:'Escenario base',curve:smooth(amt,+s.base||amt,30,1),scen:{pes:+s.pesimista||amt,base:+s.base||amt,opt:+s.optimista||amt},outro:'Invierte con calma y diversifica'};}
  if(vSrc==='play'){const tot=pvValue(),E=Object.entries(PV.h).map(([s,h])=>[s,h.n*price(s)]);E.push(['Efectivo',PV.cash]);
    return {vertical,kicker:'Mi cartera de práctica',amountLabel:'Valor total',amount:tot,currency:'USD',
      chips:[['Ganancia',sgn((tot-10000)/100)],['Operaciones',String(PV.ops)],['Posiciones',String(E.length-1)]],
      items:E.map(([s,v],i)=>({t:s==='Efectivo'?'CASH':s,pct:Math.round(v/tot*1000)/10,color:s==='Efectivo'?'#9C8F86':COLORS[i%8]})),
      curveTitle:'Así se movió',curve:PV.curve.length>3?PV.curve.slice(-80):[10000,10000,tot],scen:null,outro:'Practica antes de invertir de verdad'};}
  const L=calcYrs.at(-1)||{v:0,put:0};
  return {vertical,kicker:'Interés compuesto',amountLabel:`En ${$('#cY').value} años tendrías`,amount:L.v,currency:'USD',
    chips:[['Inicial',usd(+$('#cI').value||0)],['Al mes',usd(+$('#cM').value||0)],['Rendimiento',$('#cR').value+'%']],
    items:[{t:'Aportado',pct:Math.round(L.put/L.v*1000)/10||0,color:'#9C8F86'},{t:'Intereses',pct:Math.round((L.v-L.put)/L.v*1000)/10||0,color:'#E3A15C'}],
    curveTitle:'Crecimiento año a año',curve:[+$('#cI').value||0,...calcYrs.map(y=>y.v)],scen:null,outro:'El tiempo es tu mejor aliado'};
}
function mountVideo(){
  if(!window.LCVideo){$('#plEmpty').textContent='El reproductor no se pudo cargar en este navegador.';return;}
  if(vSrc==='calc'&&!calcYrs.length)calc();
  $('#plEmpty').classList.add('hidden');$('#plBox').className='pl '+vFmt;
  LCVideo.mount($('#player'),videoProps());
  $('#vNote').textContent=vSrc==='ai'&&!store.get('plan',null)?'Aún no pediste una cartera a la IA, así que se muestra una cartera de ejemplo.':'';
}
function segPick(id,fn){$$(id+' button').forEach(b=>b.onclick=()=>{$$(id+' button').forEach(x=>x.classList.toggle('act',x===b));fn(b.dataset.v);mountVideo();});}
segPick('#vSrc',v=>vSrc=v);segPick('#vFmt',v=>vFmt=v);
function setVSrc(v){vSrc=v;$$('#vSrc button').forEach(x=>x.classList.toggle('act',x.dataset.v===v));}
$('#vPlay').onclick=()=>{mountVideo();setTimeout(()=>{LCVideo.play();mission('video');if(!store.get('vid',0)){store.set('vid',1);checkAch();}},50);};
document.addEventListener('click',e=>{const b=e.target.closest('[data-video]');if(!b)return;setVSrc(b.dataset.video);go('tools');tool('video');setTimeout(()=>{$('#plBox').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});LCVideo&&LCVideo.play();store.set('vid',1);mission('video');checkAch();},350);});

/* ================= IA ================= */
(async()=>{
  try{sample=await claude.use('sample');}catch(e){sample=null;}
  if(sample){$('#aiDot').classList.add('on');$('#aiTxt').textContent='IA activa';}else $('#aiTxt').textContent='IA no disponible aquí';
})();
const MARK='<svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true"><g stroke="#E3A15C" stroke-width="6" stroke-linecap="round"><line x1="32" y1="6" x2="32" y2="24"/><line x1="32" y1="40" x2="32" y2="58"/><line x1="6" y1="32" x2="24" y2="32"/><line x1="40" y1="32" x2="58" y2="32"/></g></svg>';
function aiErr(e){return e&&e.code==='rate_limited'?'Demasiadas consultas seguidas. Espera un momento y vuelve a intentar.':e&&e.code==='not_granted'?'Necesitas dar permiso a la IA para usar esta función.':'No se pudo completar. Intenta de nuevo.';}
const noAI='<div class="card err">La IA funciona cuando abres esta app dentro de Claude.</div>';
const pj=t=>JSON.parse(t.slice(t.indexOf('{'),t.lastIndexOf('}')+1));

/* ---- asesor principal ---- */
$('#go').onclick=runAI;
function realism(g,m){const a=(Math.pow(1+g/100,12/m)-1)*100;return {a,cls:a<=10?'ok':a<=25?'mid':'bad'};}
function fmt(n,c){return (c==='PEN'?'S/ ':'$ ')+Number(n||0).toLocaleString('es-PE',{maximumFractionDigits:0});}
async function runAI(){
  const out=$('#out'),q=$('#q').value.trim();
  if(!q){$('#q').focus();toast('Escribe cuánto quieres invertir');return;}
  if(!sample){out.innerHTML=noAI;return;}
  const risk=$('#risk .pill.act').dataset.v;$('#go').disabled=true;
  out.innerHTML=`<div class="card" style="animation:pageIn .4s var(--ease-out)"><div class="thinking">${MARK}<span class="shim">Analizando el mercado…</span></div><div class="stream" id="st"></div></div>`;
  const prompt=`Eres el analista de la app "Lucioni Capital". El usuario escribió: "${q.replace(/"/g,"'")}". Perfil de riesgo: ${risk}.
1) Extrae presupuesto (monto y moneda USD o PEN), plazo en meses y meta de ganancia en %. "Duplicar" = 100%. Si falta algo, asume algo razonable y dilo en "supuestos".
2) Arma una cartera diversificada de 4 a 6 acciones y/o ETFs reales (EE.UU. y/o Bolsa de Valores de Lima). Si el plazo es corto o la meta es poco realista, dilo con honestidad y prioriza ETFs amplios. Nunca prometas ganancias. Porcentajes suman 100. "precio_ref" = precio aproximado según tu conocimiento.
Responde SOLO con JSON válido en español:
{"monto":0,"moneda":"USD","plazo_meses":12,"meta_pct":0,"supuestos":"","resumen":"2-3 frases","realismo":"1-2 frases","cartera":[{"ticker":"","nombre":"","mercado":"","tipo":"Acción|ETF","porcentaje":0,"monto":0,"precio_ref":"","riesgo":"Bajo|Medio|Alto","razon":"1-2 frases"}],"escenarios":{"pesimista":0,"base":0,"optimista":0},"consejos":["","",""]}
"escenarios" = valor final estimado de toda la cartera al terminar el plazo, en la moneda del usuario.`;
  try{
    const res=await sample(prompt,{modelTier:'default',cache:false,onText:({text})=>{const st=$('#st');if(st){st.textContent=text;st.scrollTop=st.scrollHeight;}}});
    const d=pj(res.text);store.set('plan',d);render(d);checkAch();
  }catch(e){out.innerHTML=`<div class="card err">${aiErr(e)}</div>`;}
  finally{$('#go').disabled=false;}
}
function donut(p){
  const R=42,C=2*Math.PI*R;let off=0;
  const segs=p.map((x,i)=>{const len=C*x.porcentaje/100,s=`<circle class="seg2" cx="55" cy="55" r="${R}" fill="none" stroke="${COLORS[i%8]}" stroke-width="14" stroke-dasharray="0 ${C}" data-d="${Math.max(0,len-2)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 55 55)"/>`;off+=len;return s;}).join('');
  return `<svg class="donut" width="110" height="110" viewBox="0 0 110 110" aria-hidden="true"><circle cx="55" cy="55" r="${R}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="14"/>${segs}<text x="55" y="52" text-anchor="middle" fill="#9C8F86" font-size="9" font-family="Inter">activos</text><text x="55" y="67" text-anchor="middle" fill="#F6CB92" font-size="17" font-weight="700" font-family="JetBrains Mono">${p.length}</text></svg>`;
}
function render(d,quiet){
  const c=d.moneda==='PEN'?'PEN':'USD',amt=+d.monto||0,m=+d.plazo_meses||12,r=realism(+d.meta_pct||0,m);
  const p=d.cartera||[],rc={Bajo:'r1',Medio:'r2',Alto:'r3'},lab={ok:'Meta realista',mid:'Meta ambiciosa',bad:'Meta poco realista'};
  const pc=v=>{if(!amt)return'';const q=(v-amt)/amt*100;return `<span style="color:${q>=0?UP:DN};font-size:11px">${q>=0?'+':''}${q.toFixed(1)}%</span>`};
  const s=d.escenarios||{};
  $('#out').innerHTML=`
  <div class="card" style="animation:pageIn .4s var(--ease-out)">
    <div class="ch"><h3>Tu cartera sugerida</h3><button class="btn" data-video="ai">${ic('film','',false)} Ver en video</button></div>
    <div class="params">${[['Monto',fmt(amt,c)],['Plazo',m+' meses'],['Meta',d.meta_pct+'%'],['≈ anual',(r.a>999?'999+':r.a.toFixed(1))+'%']].map((x,i)=>`<span class="param" style="animation-delay:${i*.06}s"><span>${x[0]}</span> ${x[1]}</span>`).join('')}</div>
    ${d.supuestos?`<p class="note">Supuse: ${esc(d.supuestos)}</p>`:''}
    <p class="sum">${esc(d.resumen)}</p>
    <div class="reality ${r.cls}"><b>${lab[r.cls]}</b>${esc(d.realismo)}</div>
    <div class="donutwrap">${donut(p)}<div class="legend">${p.map((x,i)=>`<span><i style="background:${COLORS[i%8]}"></i>${esc(x.ticker)} · ${x.porcentaje}%</span>`).join('')}</div></div>
    ${p.map((x,i)=>`
    <div class="pick" style="border-left:3px solid ${COLORS[i%8]};animation-delay:${.2+i*.08}s">
      <div class="phd"><div><div class="tk">${esc(x.ticker)}</div><div class="nm">${esc(x.nombre)}</div></div>
      <div class="pct">${x.porcentaje}%<small>${fmt(x.monto,c)}</small></div></div>
      <div class="bar"><div data-w="${x.porcentaje}" style="background:${COLORS[i%8]}"></div></div>
      <div class="tags"><span class="tag">${esc(x.tipo)}</span><span class="tag">${esc(x.mercado)}</span><span class="tag ${rc[x.riesgo]||''}">Riesgo ${esc(x.riesgo)}</span>${x.precio_ref?`<span class="tag">Ref. ~${esc(x.precio_ref)}</span>`:''}</div>
      <div class="why">${esc(x.razon)}</div>
      <div class="acts"><a class="btn" href="https://finance.yahoo.com/quote/${encodeURIComponent(x.ticker)}" target="_blank" rel="noopener">Ver en vivo ${ic('ext')}</a><button class="btn star${WL.some(w=>w.t===x.ticker)?' on':''}" data-t="${esc(x.ticker)}" data-n="${esc(x.nombre)}">${ic('star')} Seguir</button>${tradable.includes(x.ticker)?`<button class="btn prac" data-t="${esc(x.ticker)}">Practicar</button>`:''}<button class="btn ask" data-t="${esc(x.ticker)}">Preguntar a la IA</button><button class="btn solid real" data-t="${esc(x.ticker)}">${ic('broker','',false)} Comprar de verdad</button></div>
    </div>`).join('')}
  </div>
  <div class="card rv">
    <h3>Escenarios al final del plazo</h3>
    <div class="scen">${[['Pesimista',s.pesimista],['Base',s.base],['Optimista',s.optimista]].map(([n,v])=>`<div class="sc"><small>${n}</small><b class="cu" data-v="${+v||0}" data-c="${c}">${fmt(0,c)}</b><br>${pc(v)}</div>`).join('')}</div>
  </div>
  <div class="card rv">
    <h3>Consejos</h3>
    <ul class="tips">${(d.consejos||[]).map((t,i)=>`<li style="animation-delay:${i*.1}s">${esc(t)}</li>`).join('')}</ul>
    <p class="disc">Lucioni Capital es una herramienta educativa: no es asesoría financiera ni garantiza resultados. Los precios de referencia pueden estar desactualizados; confirma el precio en vivo antes de comprar. Toda inversión puede perder valor.</p>
  </div>`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    $$('.donut .seg2').forEach((e,i)=>setTimeout(()=>e.setAttribute('stroke-dasharray',e.dataset.d),i*90));
    $$('.bar div').forEach((e,i)=>setTimeout(()=>e.style.width=e.dataset.w+'%',300+i*90));
    $$('.cu').forEach(e=>countUp(e,+e.dataset.v,v=>fmt(v,e.dataset.c),1300));
  }));
  $$('.star').forEach(b=>b.onclick=()=>toggleWL(b.dataset.t,b.dataset.n));
  $$('.real').forEach(b=>b.onclick=()=>openReal(b.dataset.t));
  $$('.prac').forEach(b=>b.onclick=()=>openTrade(b.dataset.t));
  $$('.ask').forEach(b=>b.onclick=()=>{go('chat');ask('¿Qué opinas de '+b.dataset.t+' como inversión? Ventajas y riesgos.');});
  if(!quiet)$('#out').scrollIntoView({behavior:RM?'auto':'smooth'});
}

/* ---- comparador ---- */
$('#cGo').onclick=async()=>{
  const A=$('#cA').value.trim().toUpperCase(),B=$('#cB').value.trim().toUpperCase(),o=$('#cOut');
  if(!A||!B)return toast('Escribe dos tickers');
  if(!sample){o.innerHTML=noAI;return;}
  o.innerHTML=`<div class="thinking" style="margin-top:14px">${MARK}<span class="shim">Comparando ${esc(A)} vs ${esc(B)}…</span></div>`;
  try{
    const r=await sample(`Compara las acciones o ETFs ${A} y ${B} para un inversionista principiante. Responde SOLO JSON válido en español:
{"a":{"nombre":"","sector":"","riesgo":"Bajo|Medio|Alto","crecimiento":"","dividendos":"","fortaleza":"","debilidad":""},"b":{...mismas claves},"veredicto":"2-3 frases neutrales: para qué tipo de inversionista va cada uno"}
Breve (máx 12 palabras por campo). No prometas ganancias.`,{modelTier:'default'});
    const d=pj(r.text),rows=[['Empresa','nombre'],['Sector','sector'],['Riesgo','riesgo'],['Crecimiento','crecimiento'],['Dividendos','dividendos'],['Fortaleza','fortaleza'],['Debilidad','debilidad']];
    o.innerHTML=`<div class="tblw"><table class="cmp"><tr><th></th><th>${esc(A)}</th><th>${esc(B)}</th></tr>${rows.map(([l,k],i)=>`<tr style="animation-delay:${i*.06}s"><td>${l}</td><td>${esc(d.a?.[k])}</td><td>${esc(d.b?.[k])}</td></tr>`).join('')}</table></div><div class="reality mid" style="animation:fadeUp .4s .45s both"><b>Veredicto</b>${esc(d.veredicto)}</div>`;
  }catch(e){o.innerHTML=`<p class="err" style="margin-top:12px">${aiErr(e)}</p>`;}
};

/* ---- chat ---- */
const HIST=[];
async function ask(t){
  t=(t||$('#cq').value).trim();if(!t)return;$('#cq').value='';
  const ch=$('#chat');ch.insertAdjacentHTML('beforeend',`<div class="msg u">${esc(t)}</div>`);
  if(!sample){ch.insertAdjacentHTML('beforeend',`<div class="msg a">La IA funciona cuando abres esta app dentro de Claude.</div>`);return;}
  HIST.push({role:'user',content:t});mission('ask');
  const m=document.createElement('div');m.className='msg a';m.innerHTML='<span class="typing"><span></span><span></span><span></span></span>';ch.appendChild(m);m.scrollIntoView({behavior:'smooth',block:'end'});
  $('#cs').disabled=true;
  const sys='Eres el asesor de la app Lucioni Capital. Respondes en español, claro y breve (máx 120 palabras), para principiantes, muchas veces en Perú. Educas, das pros y contras, nunca prometes ganancias y recuerdas que no es asesoría financiera personalizada cuando sea relevante. Sin markdown pesado.';
  const msgs=HIST.map((h,i)=>i===0?{role:'user',content:sys+'\n\nPregunta: '+h.content}:h);
  try{
    const r=await sample(msgs,{cache:false,modelTier:'default',onText:({text})=>{m.textContent=text;}});
    m.textContent=r.text;HIST.push({role:'assistant',content:r.text});
  }catch(e){m.textContent=aiErr(e);HIST.pop();}
  finally{$('#cs').disabled=false;m.scrollIntoView({behavior:'smooth',block:'end'});}
}
$('#cs').onclick=()=>ask();
$('#cq').addEventListener('keydown',e=>{if(e.key==='Enter')ask();});
$$('#sugs .pill:not(#askPort)').forEach(b=>b.onclick=()=>ask(b.textContent));
$('#askPort').onclick=()=>{const E=Object.entries(PV.h);ask(E.length?`Mi cartera de práctica vale ${usd2(pvValue())} (empecé con $10,000) y tiene: ${E.map(([s,h])=>`${h.n} ${s} a costo ${usd2(h.cost)}`).join(', ')}, más ${usd(PV.cash)} en efectivo. ¿Está bien diversificada? ¿Qué mejorarías?`:'Aún no tengo acciones en mi cartera de práctica. ¿Cómo debería empezar a armarla?');};

/* ================= ACADEMIA: tarjetas ================= */
$('#flips').innerHTML=TERMS.map(([e,t,d],i)=>`<div class="flip rv" style="animation-delay:${(i%2)*.06}s" tabindex="0" role="button" aria-label="${t}"><div class="in"><div class="fc">${ic(e,'big-ic')}<b>${t}</b><small>Toca para ver</small></div><div class="bc">${d}<button class="btn" style="margin-top:8px;align-self:flex-start" data-t="${t}">Saber más ${ic('right')}</button></div></div></div>`).join('');
$$('.flip').forEach(f=>{f.onclick=e=>{if(e.target.closest('button'))return;f.classList.toggle('on');};f.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f.classList.toggle('on');}};});
$$('.flip .btn').forEach(b=>b.onclick=()=>{go('chat');ask('Explícame con un ejemplo qué es: '+b.dataset.t);});

/* ================= ACADEMIA: ¿Sube o baja? ================= */
const G=Object.assign({sym:'NVDA',st:0,best:0,hit:0,tot:0,bet:null,p0:0,left:0},store.get('game',{}));G.bet=null;
function gNew(){G.sym=tradable[Math.floor(Math.random()*tradable.length)];$('#gSym').textContent=G.sym+' · '+S[G.sym].n;$('#gMid').innerHTML='';$('#gUp').disabled=$('#gDn').disabled=false;gStat();}
function gStat(){$('#gSt').textContent=G.st;$('#gBest').textContent=G.best;$('#gHit').textContent=G.hit+'/'+G.tot;}
function gBet(d){if(G.bet!==null)return;G.bet=d;G.p0=price(G.sym);G.left=5;$('#gUp').disabled=$('#gDn').disabled=true;
  $('#gMid').innerHTML=`<div class="cd"><svg width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="20" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="4"/><circle id="gcd" cx="23" cy="23" r="20" fill="none" stroke="${d>0?UP:DN}" stroke-width="4" stroke-linecap="round" stroke-dasharray="126" stroke-dashoffset="0" style="transition:stroke-dashoffset 5s linear"/></svg><b id="gLeft">5</b></div><p class="note" style="margin-top:4px">Apostaste que ${d>0?'sube':'baja'} desde ${usd2(G.p0)}</p>`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const c=$('#gcd');if(c)c.style.strokeDashoffset='126';}));}
function gDraw(){if(page==='learn'){const d=S[G.sym].pts.slice(-50);spark($('#gc'),d,d.at(-1)>=d[0]?UP:DN,true);}}
function gTick(){gDraw();
  if(G.bet===null)return;G.left--;const l=$('#gLeft');if(l)l.textContent=Math.max(0,G.left);
  if(G.left>0)return;
  const p=price(G.sym),moved=p-G.p0,win=(moved>=0?1:-1)===G.bet;G.tot++;
  if(win){G.hit++;G.st++;G.best=Math.max(G.best,G.st);FX.burst(...center($('#game')),40);SFX.win();addXP(10);mission('game');}else{G.st=0;SFX.sell();}
  $('#gMid').innerHTML=`<p style="margin-top:12px;font-weight:700;color:${win?UP:DN};animation:pop .3s var(--ease-out)">${win?'¡Acertaste!':'Esta vez no'} · ${usd2(G.p0)} → ${usd2(p)} (${moved>=0?'+':''}${(moved/G.p0*100).toFixed(2)}%)</p><button class="btn solid" id="gNext" style="margin-top:10px">Otra ronda ${ic('right','',false)}</button>`;
  $('#gNext').onclick=gNew;G.bet=null;store.set('game',{st:G.st,best:G.best,hit:G.hit,tot:G.tot});gStat();checkAch();}
$('#gUp').onclick=()=>gBet(1);$('#gDn').onclick=()=>gBet(-1);


/* ===================== V2 ===================== */

/* ---------- sonido (sintetizado, sin archivos) ---------- */
let SND=store.get('snd',true),AC=null;
function beep(notes,type='sine',vol=.06){if(!SND)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime;
  notes.forEach(([f,at,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t+at);g.gain.linearRampToValueAtTime(vol,t+at+.01);g.gain.exponentialRampToValueAtTime(.0001,t+at+d);o.connect(g).connect(AC.destination);o.start(t+at);o.stop(t+at+d+.02);});}catch(e){}}
const SFX={buy:()=>beep([[660,0,.12],[990,.07,.18]],'triangle'),sell:()=>beep([[740,0,.12],[494,.07,.18]],'triangle'),win:()=>beep([[523,0,.15],[659,.08,.15],[784,.16,.25]],'triangle'),
  lvl:()=>beep([[523,0,.2],[659,.1,.2],[784,.2,.2],[1047,.3,.4]],'triangle',.07),crash:()=>beep([[180,0,.5],[120,.1,.6]],'sawtooth',.04),tick:()=>beep([[1200,0,.04]],'sine',.02)};

/* ---------- XP y niveles ---------- */
let XP=store.get('xp',0);
const lvlOf=x=>Math.floor(Math.sqrt(x/40))+1, xpFor=l=>40*(l-1)*(l-1);
function renderLvl(){const l=lvlOf(XP),a=xpFor(l),b=xpFor(l+1),k=(XP-a)/(b-a);
  $('#lvlN').textContent='Nv '+l;$('#lvlR').style.strokeDashoffset=String(56.5*(1-k));
  const s=$('#lvSheetBar');if(s){s.style.width=(k*100)+'%';$('#lvSheetTxt').textContent=`${XP-a} / ${b-a} XP para el nivel ${l+1}`;}}
function addXP(n,why){const l0=lvlOf(XP);XP+=n;store.set('xp',XP);renderLvl();const c=$('#lvl');c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump');
  if(lvlOf(XP)>l0)levelUp(lvlOf(XP));}
const LVLNAMES=['Curioso','Aprendiz','Ahorrista','Inversionista','Estratega','Analista','Gestor','Lobo de Lima','Leyenda','Maestro Lucioni'];
function levelUp(l){const o=$('#lvlUp');o.querySelector('b').textContent=l;o.querySelector('span').textContent=LVLNAMES[Math.min(l-1,LVLNAMES.length-1)];
  o.classList.add('on');SFX.lvl();FX.burst(innerWidth/2,innerHeight/2,120);setTimeout(()=>o.classList.remove('on'),1900);}

/* ---------- retos diarios ---------- */
const MPOOL=[['buy','Haz 3 compras',3,30,'buy'],['ops','Haz 6 operaciones',6,30,'accion'],['game','Acierta 2 veces en ¿Sube o baja?',2,35,'target'],['swipe','Desliza 5 acciones en Descubre',5,25,'etf'],
  ['order','Crea una orden límite o stop',1,25,'clock'],['crash','Sobrevive a una crisis simulada',1,30,'bajista'],['ask','Hazle una pregunta al asesor',1,20,'chat'],['video','Mira tu cartera en video',1,20,'film'],
  ['real','Revisa dónde comprar una acción de verdad',1,20,'broker'],['beat','Supera a Lucio Bot',1,45,'trophy'],['calc','Juega con la calculadora',3,15,'compuesto']];
const today=()=>new Date().toISOString().slice(0,10);
let MIS=store.get('mis',null);
if(!MIS||MIS.d!==today()){const seed=today().split('-').join('')%997;const ids=[...MPOOL].sort((a,b)=>((a[0].charCodeAt(0)*seed)%31)-((b[0].charCodeAt(0)*seed)%31)).slice(0,4).map(m=>m[0]);MIS={d:today(),ids,p:{},done:{}};store.set('mis',MIS);}
function mission(id,n=1){if(!MIS.ids.includes(id)||MIS.done[id])return;const m=MPOOL.find(x=>x[0]===id);MIS.p[id]=Math.min(m[2],(MIS.p[id]||0)+n);
  if(MIS.p[id]>=m[2]){MIS.done[id]=1;toast('Reto cumplido: '+m[1]+' · +'+m[3]+' XP',ic('trophy'));SFX.win();addXP(m[3]);}
  store.set('mis',MIS);renderMis();}
function misHTML(){return MIS.ids.map(id=>{const m=MPOOL.find(x=>x[0]===id),p=MIS.p[id]||0,d=MIS.done[id];return `<div class="mi${d?' done':''}"><span class="mic">${ic(d?'check':m[4],'',false)}</span><div class="mt">${m[1]}<div class="bar"><div style="width:${p/m[2]*100}%;background:${d?UP:'var(--cu)'}"></div></div></div><span class="mx">${d?'Listo':p+'/'+m[2]}</span></div>`;}).join('');}
function renderMis(){const n=Object.keys(MIS.done).length;$('#misN').textContent=n+' de '+MIS.ids.length;$('#mis').innerHTML=misHTML();const s=$('#lvMis');if(s)s.innerHTML=misHTML();}
function openLevel(){const l=lvlOf(XP);
  openSheet(`<div class="sh-top"><div><div class="nm">Tu nivel</div><div class="tk" style="font-family:var(--serif);font-weight:500;font-size:34px">${l} · ${LVLNAMES[Math.min(l-1,LVLNAMES.length-1)]}</div></div><div class="sh-pr">${XP}<small style="color:var(--mut)">XP total</small></div></div>
   <div class="xpbar"><div id="lvSheetBar" style="width:0"></div></div><p class="note" id="lvSheetTxt"></p>
   <label class="l">Retos de hoy</label><div class="mis" id="lvMis">${misHTML()}</div>
   <p class="note">Ganas XP al operar, acertar en el juego, desbloquear logros y cumplir retos. Los retos cambian cada día.</p>
   <label class="chk"><input type="checkbox" id="sndT" ${SND?'checked':''}> Sonidos</label>
   <label class="chk"><input type="checkbox" id="realT" ${REALON?'checked':''}> Al comprar, muéstrame dónde comprar la acción de verdad</label>`);
  requestAnimationFrame(()=>requestAnimationFrame(renderLvl));
  $('#sndT').onchange=e=>{SND=e.target.checked;store.set('snd',SND);SND&&SFX.buy();};
  $('#realT').onchange=e=>{REALON=e.target.checked;store.set('realOn',REALON);};}
$('#lvl').onclick=openLevel;

/* ---------- comprar de verdad ---------- */
let REALON=store.get('realOn',true);
const PERU=['BAP','SCCO','BVN','IFS','S&P/BVL'];
function brokers(t){const T=encodeURIComponent(t.toUpperCase()),l=encodeURIComponent(t.toLowerCase());const B=[
  ['eToro','eT','#13C636',`https://www.etoro.com/markets/${l}`,'Abre la página de '+t+'. Disponible en muchos países, permite comprar fracciones.'],
  ['Hapi','H','#6E4BFF','https://www.hapi.trade/','App para invertir en la bolsa de EE.UU. desde Latinoamérica.'],
  ['Interactive Brokers','IB','#D81F26','https://www.interactivebrokers.com/','Bróker global que acepta clientes de Perú. Más completo, más técnico.'],
  ['Robinhood','R','#00A86B',`https://robinhood.com/us/en/stocks/${T}/`,'Abre la página de '+t+'. Solo para residentes de EE.UU.']];
  if(PERU.includes(t.toUpperCase()))B.push(['Bolsa de Valores de Lima','BVL','#B9733A','https://www.bvl.com.pe/','Para comprar en Lima necesitas una Sociedad Agente de Bolsa (SAB); la BVL publica la lista.']);
  return B;}
function realHTML(t,n){return `<div class="stepin"><div class="real-hd"><span class="chip-ic b" style="width:34px;height:34px;margin:0">${ic('broker')}</span><div><div class="nm">Comprar de verdad</div><div class="tk">${esc(t)}${n?` <span class="nm" style="font-family:var(--sans)">· ${n} acc.</span>`:''}</div></div></div>
  <p class="sum">Lucioni Capital no vende acciones. Elige un bróker: se abrirá su página en una pestaña nueva y ahí buscas <b>${esc(t)}</b>.</p>
  <div class="cpy"><code id="rTk">${esc(t)}</code><button class="btn" id="rCp">Copiar ticker</button></div>
  <div class="brk">${brokers(t).map((b,i)=>`<a class="bk" style="animation-delay:${i*.05}s" href="${b[3]}" target="_blank" rel="noopener noreferrer"><span class="bl" style="background:${b[2]}">${b[1]}</span><span class="bt">${b[0]}<small>${b[4]}</small></span>${ic('ext')}</a>`).join('')}</div>
  <div class="acts"><a class="btn" href="https://finance.yahoo.com/quote/${encodeURIComponent(t)}" target="_blank" rel="noopener">Ver el precio real ${ic('ext')}</a></div>
  <p class="disc">No recibimos comisión ni tenemos relación con estos brókers. Antes de abrir una cuenta revisa comisiones, que esté regulado y cómo retiras tu dinero. El precio real es distinto al del simulador. Toda inversión puede perder valor.</p></div>`;}
function bindReal(t){$('#rCp').onclick=async()=>{try{await navigator.clipboard.writeText(t);toast('Ticker copiado: '+t,ic('check'));}catch(e){const r=document.createRange();r.selectNodeContents($('#rTk'));getSelection().removeAllRanges();getSelection().addRange(r);toast('Selecciónalo y cópialo');}};
  $$('#sheet .bk').forEach(a=>a.addEventListener('click',()=>{mission('real');if(!store.get('realClick',0)){store.set('realClick',1);addXP(15);}}));mission('real');}
function openReal(t,n){openSheet(realHTML(t,n));bindReal(t);}

/* ---------- velocidad del mercado, crisis y rally ---------- */
let SPEED=1,shockCD=0,crashWatch=null;
$$('#spd button').forEach(b=>b.onclick=()=>{SPEED=+b.dataset.v;$$('#spd button').forEach(x=>x.classList.toggle('act',x===b));toast(SPEED===1?'Mercado a velocidad normal':`Mercado acelerado ${SPEED}×`,ic('clock'));});
function shockAll(dir){if(shockCD>0)return;shockCD=20;$('#crash').disabled=$('#rally').disabled=true;
  for(const s in S)S[s].shock+=dir*S[s].vol*(dir<0?2.6:1.9)*(0.7+Math.random()*.6);
  const f=$('#flash');f.style.background=dir<0?DN:UP;f.classList.remove('go');void f.offsetWidth;f.classList.add('go');
  if(dir<0){document.body.classList.remove('quake');void document.body.offsetWidth;document.body.classList.add('quake');SFX.crash();crashWatch={v0:pvValue(),t:0};}
  else{FX.burst(innerWidth/2,innerHeight*.4,80);SFX.win();}
  NW.unshift({s:'Mercado',t:dir<0?'Venta masiva: los índices caen con fuerza':'Rally: compras en todo el mercado',d:dir,time:new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})});NW=NW.slice(0,5);renderNews();
  toast(dir<0?'Crisis simulada: todo el mercado cae. ¿Vendes o aguantas?':'Rally simulado: todo sube',{icon:ic(dir<0?'bajista':'alcista','',false)});}
$('#crash').onclick=()=>shockAll(-1);$('#rally').onclick=()=>shockAll(1);

/* ---------- termómetro miedo / codicia + mapa de calor ---------- */
let FG=50;
function fgCalc(){let m=0,br=0;for(const[s]of SYMS){const p=S[s].pts,a=p.at(-1)-p.at(-15);m+=a/S[s].vol;br+=a>0?1:-1;}
  const raw=50+m/SYMS.length*55+br/SYMS.length*22;FG=FG+(Math.max(2,Math.min(98,raw))-FG)*.35;return FG;}
const FGL=[[20,'Miedo extremo',DN],[40,'Miedo','#FF8A6B'],[60,'Neutral','#F5B142'],[80,'Codicia','#9BE07A'],[101,'Codicia extrema',UP]];
function renderPulse(){const v=fgCalc();if(page!=='home')return;const [,l,c]=FGL.find(x=>v<x[0]);
  $('#fgN').style.transform=`rotate(${-90+180*v/100}deg)`;$('#fgV').textContent=Math.round(v);$('#fgV').style.color=c;$('#fgL').textContent=l;
  SYMS.forEach(([s])=>{const t=document.getElementById('h-'+sid(s));if(!t)return;const v=pctOf(s),a=Math.min(1,Math.abs(v)/3);
    t.style.backgroundColor=v>=0?`rgba(46,${150+a*60|0},${100+a*20|0},${.25+a*.6})`:`rgba(${200+a*40|0},70,85,${.25+a*.6})`;
    t.querySelector('small').textContent=sgn(v);const up=v>=(t._v??v);if(t._u!==undefined&&t._u!==up){t.classList.remove('fl');void t.offsetWidth;t.classList.add('fl');}t._u=up;t._v=v;});}
$('#heat').innerHTML=SYMS.map(([s],i)=>`<button class="ht${i<2?' big':''}" id="h-${sid(s)}" data-s="${s}">${s}<small></small></button>`).join('');
$$('#heat .ht').forEach(b=>b.onclick=()=>{const s=b.dataset.s;if(tradable.includes(s))openTrade(s);else{pickSym(s);$('#cv').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});}});

/* ---------- duelo contra Lucio Bot ---------- */
let BOT=Object.assign({cash:10000,h:{},log:''},store.get('bot',{}));
const botVal=()=>BOT.cash+Object.entries(BOT.h).reduce((a,[s,n])=>a+n*price(s),0);
function botStep(){
  if(tick%4)return;
  const mom=tradable.map(s=>[s,S[s].pts.at(-1)-S[s].pts.at(-10)]).sort((a,b)=>b[1]-a[1]);
  for(const [s,n] of Object.entries(BOT.h)){const m=mom.find(x=>x[0]===s)[1];if(m<-.35||Math.random()<.04){BOT.cash+=n*price(s);delete BOT.h[s];BOT.log=`Vendió ${n} ${s} a ${usd2(price(s))}`;return save();}}
  const [best,m]=mom[0];if(m>.25&&BOT.cash>price(best)*5){const n=Math.floor(Math.min(BOT.cash*.3,BOT.cash)/price(best));if(n>0){BOT.cash-=n*price(best);BOT.h[best]=(BOT.h[best]||0)+n;BOT.log=`Compró ${n} ${best} a ${usd2(price(best))}`;}}
  save();function save(){store.set('bot',BOT);}
}
let wasAhead=null;
function renderDuel(){const me=pvValue(),bt=botVal(),mx=Math.max(me,bt,10000)*1.02,mn=Math.min(me,bt,10000)*.98;
  if(page==='play'){$('#dMe').textContent=usd2(me);$('#dBot').textContent=usd2(bt);
    $('#dMeT').style.width=((me-mn)/(mx-mn)*100)+'%';$('#dBotT').style.width=((bt-mn)/(mx-mn)*100)+'%';
    const d=me-bt;$('#dLead').innerHTML=Math.abs(d)<1?`${ic('target','',false)} Van empatados`:d>0?`${ic('trophy','',false)} Le ganas a Lucio Bot por <b style="color:${UP}">${usd2(d)}</b>`:`${ic('bajista','',false)} Lucio Bot te gana por <b style="color:${DN}">${usd2(-d)}</b>`;
    const lg=$('#dLog');if(lg._t!==BOT.log){lg._t=BOT.log;lg.innerHTML=BOT.log?`<span>Lucio Bot: ${esc(BOT.log)}</span>`:'Lucio Bot está mirando el mercado…';}}
  const ahead=me>bt+5;if(ahead&&wasAhead===false&&PV.ops>0){toast('¡Pasaste a Lucio Bot!',ic('trophy'));mission('beat');}wasAhead=ahead;}

/* ---------- descubre: mazo deslizable ---------- */
const DECK=[['AAPL','Apple','Tecnología · EE.UU.','Medio','Vende el iPhone, las Mac y servicios como la App Store y iCloud.','La mayor parte de sus ventas viene del iPhone.'],
 ['MSFT','Microsoft','Tecnología · EE.UU.','Medio','Windows, Office, LinkedIn, Xbox y la nube Azure.','Su negocio de nube es uno de los más grandes del mundo.'],
 ['NVDA','Nvidia','Semiconductores · EE.UU.','Alto','Diseña chips gráficos (GPU) para videojuegos, centros de datos e inteligencia artificial.','Muchos modelos de IA se entrenan con sus chips.'],
 ['VOO','Vanguard S&P 500','ETF · EE.UU.','Bajo','Te da las ~500 empresas más grandes de EE.UU. en una sola compra.','Su costo anual es muy bajo comparado con un fondo tradicional.'],
 ['BAP','Credicorp','Banca · Perú','Medio','El grupo financiero más grande del Perú: BCP, Mibanco, Prima AFP y más.','Cotiza en Nueva York y en la Bolsa de Lima.'],
 ['SCCO','Southern Copper','Minería · Perú y México','Alto','Extrae cobre en minas de Perú y México.','Su precio suele moverse junto con el precio del cobre.'],
 ['KO','Coca-Cola','Consumo · EE.UU.','Bajo','Bebidas que se venden en más de 200 países.','Es famosa por pagar y subir su dividendo durante décadas.'],
 ['MELI','MercadoLibre','Comercio electrónico · Latinoamérica','Alto','La tienda en línea más grande de Latinoamérica, más Mercado Pago.','Nació en Argentina y cotiza en el Nasdaq.'],
 ['TSLA','Tesla','Autos eléctricos · EE.UU.','Alto','Autos eléctricos, baterías y energía solar.','Es de las acciones grandes que más sube y baja.'],
 ['V','Visa','Pagos · EE.UU.','Bajo','Una red de pagos con tarjeta usada en casi todo el mundo.','No presta dinero: cobra una pequeña parte de cada pago.'],
 ['QQQ','Invesco QQQ','ETF · EE.UU.','Medio','Las 100 empresas no financieras más grandes del Nasdaq.','Está muy cargado a tecnología.'],
 ['BVN','Buenaventura','Minería · Perú','Alto','Minera peruana de oro, plata y cobre.','Cotiza en la Bolsa de Nueva York.'],
 ['AMZN','Amazon','Comercio y nube · EE.UU.','Medio','Tienda en línea, Prime Video y la nube AWS.','AWS aporta una parte grande de sus ganancias.'],
 ['JPM','JPMorgan Chase','Banca · EE.UU.','Medio','El banco más grande de Estados Unidos.','Paga dividendos cada trimestre.'],
 ['DIS','Disney','Entretenimiento · EE.UU.','Medio','Parques, películas de Marvel y Pixar, y Disney+.','Sus parques son uno de sus negocios más rentables.']];
let dIdx=store.get('deckI',0)%DECK.length,dSeen=0;
const RC={Bajo:UP,Medio:'#F5B142',Alto:DN};
function deckRender(){const box=$('#deck');box.innerHTML='';
  if(dSeen>=DECK.length){box.innerHTML=`<div class="dend">Viste todas. Las que te interesaron están en tu lista de seguimiento.<br><button class="btn" id="dAgain" style="margin-top:10px">Empezar de nuevo</button></div>`;$('#dAgain').onclick=()=>{dSeen=0;deckRender();};return;}
  for(let k=2;k>=0;k--){if(dSeen+k>=DECK.length)continue;const [t,n,sec,r,d,q]=DECK[(dIdx+k)%DECK.length];
    const el=document.createElement('div');el.className='dc';el.style.setProperty('--sc',String(1-k*.05));el.style.setProperty('--dy',(k*14)+'px');el.style.zIndex=10-k;
    el.innerHTML=`<span class="stamp yes">ME INTERESA</span><span class="stamp no">PASO</span><span class="stamp buy">COMPRAR</span><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div><div class="dt">${t}</div><div class="dn">${n}</div></div><span class="badge" style="color:${RC[r]};border-color:${RC[r]}66">Riesgo ${r}</span></div><div class="note" style="margin-top:4px">${sec}</div><div class="dd">${d}</div><div class="dq"><b>Dato</b>${q}</div>`;
    box.appendChild(el);if(k===0)dragCard(el,t,n);}}
function deckGo(dir,el,t,n){const w=$('#deck').offsetWidth;el=el||$('#deck .dc:last-child');if(!el)return;const [tk,nm]=DECK[dIdx%DECK.length];t=t||tk;n=n||nm;
  el.style.setProperty('--dx',(dir==='up'?0:(dir==='yes'?1:-1)*w*1.4)+'px');el.style.setProperty('--dy',dir==='up'?'-500px':'40px');el.style.setProperty('--rot',dir==='up'?'0deg':(dir==='yes'?24:-24)+'deg');el.style.opacity='0';
  if(dir==='yes'&&!WL.some(w=>w.t===t)){toggleWL(t,n);}if(dir==='up')setTimeout(()=>openReal(t),200);
  SFX.tick();mission('swipe');dIdx=(dIdx+1)%DECK.length;dSeen++;store.set('deckI',dIdx);setTimeout(deckRender,280);}
function dragCard(el,t,n){let x0=null,y0=0,t0=0,dx=0,dy=0;const st=e=>el.querySelector('.stamp.'+e);
  el.addEventListener('pointerdown',e=>{x0=e.clientX;y0=e.clientY;t0=performance.now();dx=dy=0;el.classList.add('drag');el.setPointerCapture(e.pointerId);});
  el.addEventListener('pointermove',e=>{if(x0===null)return;dx=e.clientX-x0;dy=Math.min(0,e.clientY-y0);el.style.setProperty('--dx',dx+'px');el.style.setProperty('--dy',dy+'px');el.style.setProperty('--rot',dx/18+'deg');
    st('yes').style.opacity=Math.max(0,dx/90);st('no').style.opacity=Math.max(0,-dx/90);st('buy').style.opacity=Math.abs(dx)<40?Math.max(0,-dy/90):0;});
  const end=()=>{if(x0===null)return;x0=null;el.classList.remove('drag');const dt=performance.now()-t0,vx=dx/dt,vy=dy/dt;
    if(dy<-110&&Math.abs(dx)<70||vy<-.7&&Math.abs(dx)<70)return deckGo('up',el,t,n);
    if(dx>100||vx>.5)return deckGo('yes',el,t,n);if(dx<-100||vx<-.5)return deckGo('no',el,t,n);
    ['--dx','--dy','--rot'].forEach(p=>el.style.setProperty(p,p==='--rot'?'0deg':'0px'));el.querySelectorAll('.stamp').forEach(s=>s.style.opacity=0);};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);}
$('#dNo').onclick=()=>deckGo('no');$('#dYes').onclick=()=>deckGo('yes');$('#dBuy').onclick=()=>deckGo('up');
addEventListener('keydown',e=>{if(page!=='learn'||/INPUT|TEXTAREA/.test(document.activeElement.tagName)||sh.classList.contains('open'))return;if(e.key==='ArrowRight')deckGo('yes');else if(e.key==='ArrowLeft')deckGo('no');});

/* ================= BUCLE PRINCIPAL ================= */
setInterval(()=>{for(let i=0;i<SPEED;i++)advance();tick++;renderPulse();botStep();renderDuel();
  if(shockCD>0&&--shockCD===0){$('#crash').disabled=$('#rally').disabled=false;}
  if(crashWatch&&++crashWatch.t===15){if(Object.keys(PV.h).length)mission('crash');crashWatch=null;}
  updQuotes();renderMkt();renderPV();checkOrders();sheetTick&&sheetTick();gTick();
  if(page==='play'&&tick%3===0){renderPos();renderOrd();}if(tick%5===0)checkAch();},1000);
function resizeAll(){renderMkt(true);renderPV();renderPos();renderOrd();if(page==='tools'){drawCalc();}if(page==='learn')gDraw();}

/* ---------- arranque ---------- */
const r0=store.get('risk',null);if(r0)setRisk(r0);
hydrate();pickSym(cur);updQuotes();calc();goal();renderMkt(true);renderPV();renderHist();renderPos();renderOrd();renderAch();gNew();renderLvl();renderMis();deckRender();renderPulse();renderDuel();
const plan=store.get('plan',null);if(plan){try{render(plan,true);}catch(e){}}
setTimeout(()=>{if(!NW.length)pushNews();},6000);
