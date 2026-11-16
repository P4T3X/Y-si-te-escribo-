
/* ===================== V3: mundo billete ===================== */
const cssv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
let TH={};
function readTheme(){TH={ink:cssv('--ink'),ink2:cssv('--ink2'),ink3:cssv('--ink3'),line:cssv('--line'),line2:cssv('--line2'),accent:cssv('--accent'),gold:cssv('--gold'),sheet:cssv('--sheet'),well:cssv('--well'),paper:cssv('--paper'),guil:cssv('--guil'),up:cssv('--up'),down:cssv('--down'),fib:[cssv('--fib1'),cssv('--fib2'),cssv('--fib3')]};
  UP=TH.up;DN=TH.down;isUV=matchMedia('(prefers-color-scheme: dark)').matches&&document.documentElement.dataset.theme!=='light'||document.documentElement.dataset.theme==='dark';
  COLORS.splice(0,COLORS.length,...(isUV?['#FF6A4D','#7CF7C8','#E3C766','#8DB4FF','#FF7AC6','#B9E07A','#F2A65A','#C9B8FF']:['#B8321C','#1F6B4F','#8C6D24','#2F5D8A','#7A4E8C','#B8651E','#3F8C8C','#5E6B3F']));}
let isUV=false;
function applyTheme(){readTheme();$('#uvT').setAttribute('aria-pressed',String(isUV));drawFibers();drawRos(1);drawIn=1;if(on('tools')&&!$('#t-video').classList.contains('hidden'))mountVideo();resizeAll();}
const t0=store.get('theme',null);if(t0)document.documentElement.dataset.theme=t0;
$('#uvT').onclick=()=>{const nx=isUV?'light':'dark';document.documentElement.dataset.theme=nx;store.set('theme',nx);applyTheme();
  toast(isUV?'Luz UV encendida: aparece la marca oculta del billete':'Luz normal',ic('uv','',false));if(isUV)SFX.tick();};
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(!document.documentElement.dataset.theme)applyTheme();});

function drawFibers(){}
addEventListener('resize',()=>{clearTimeout(drawFibers._t);drawFibers._t=setTimeout(()=>{drawFibers();drawRos(1);},150);});

/* roseta de guilloche: se dibuja al cargar y cambia con el perfil de riesgo */
const RISKP={conservador:[7,.16],moderado:[11,.22],agresivo:[15,.3]};
let rosP={k:11,d:.22},rosT=null;
/* guilloche: rosas polares desfasadas, como en el fondo de un billete */
function band(x,cx,cy,R,n,amp,ph,prog){const N=Math.round(720*prog);x.beginPath();for(let i=0;i<=N;i++){const a=i/720*Math.PI*2,r=R*(1-amp*(.5+.5*Math.sin(n*a+ph)));const X=cx+r*Math.cos(a),Y=cy+r*Math.sin(a);i?x.lineTo(X,Y):x.moveTo(X,Y);}x.stroke();}
function drawRos(prog=1){const c=$('#ros');const F=fit(c);if(!F)return;const {x,W,H}=F,cx=W/2,cy=H/2,R=Math.min(W,H)*.48;x.clearRect(0,0,W,H);
  x.strokeStyle=TH.guil;x.lineWidth=.8;const n=Math.round(rosP.k);
  for(let j=0;j<10;j++)band(x,cx,cy,R,n,rosP.d,j*Math.PI*2/10,prog);
  for(let j=0;j<8;j++)band(x,cx,cy,R*.6,Math.round(n*1.5),rosP.d*.8,j*Math.PI*2/8,prog);
  x.lineWidth=1;x.strokeStyle=TH.gold;x.globalAlpha=.55;x.beginPath();x.arc(cx,cy,R*.36,0,Math.PI*2*prog);x.stroke();x.beginPath();x.arc(cx,cy,R*.33,0,Math.PI*2*prog);x.stroke();x.globalAlpha=1;}
function animRos(to){const from={...rosP},t0=performance.now(),D=RM?1:1300;cancelAnimationFrame(rosT);
  (function f(t){const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,4);
    if(to){rosP={k:from.k+(to.k-from.k)*e,d:from.d+(to.d-from.d)*e};drawRos(1);}else drawRos(e);
    if(k<1)rosT=requestAnimationFrame(f);})(t0);}
$$('#risk .pill').forEach(p=>p.addEventListener('click',()=>{const [k,d]=RISKP[p.dataset.v];animRos({k,d});updSerial();}));
addEventListener('scroll',()=>{const y=scrollY;if(y<900){$('#ros').style.transform=`translateY(-50%) rotate(${y*.06}deg)`;}},{passive:true});

/* billete vivo: monto, serie, inclinación y brillo del hilo */
function parseAmt(t){t=t||'';const m=t.match(/(s\/\.?|\$|usd|pen|soles?|d[oó]lares?)?\s*([\d][\d.,]*)\s*(k|mil|soles?|d[oó]lares?|usd|pen)?/i);if(!m)return null;
  let n=+m[2].replace(/[.,](?=\d{3}\b)/g,'').replace(',','.');if(/k|mil/i.test(m[3]||''))n*=1000;const cur=/\$|usd|d[oó]lar/i.test((m[1]||'')+(m[3]||'')+t)&&!/s\/|sol|pen/i.test((m[1]||'')+(m[3]||''))?'$':'S/';return n?{n,cur}:null;}
function updBill(){const p=parseAmt($('#q').value)||{n:2000,cur:'S/'};const el=$('#billAmt');countUp(el,p.n,v=>p.cur+' '+Math.round(v).toLocaleString('en-US'),600);}
function updSerial(){const t=$('#q').value+($('#risk .pill.act')||{}).textContent;let h=5381;for(const ch of t)h=((h<<5)+h+ch.charCodeAt(0))>>>0;
  const s='LC '+String(h%10000000).padStart(7,'0')+' '+'ABCDEFGHJK'[h%10];
  [$('#serA'),$('#serB')].forEach(e=>{if(e.textContent===s)return;const old=e.textContent;let i=0;clearInterval(e._i);e._i=setInterval(()=>{i++;e.textContent=s.split('').map((c,j)=>j<i||c===' '?c:(/\d/.test(c)?String((Math.random()*10)|0):c)).join('');if(i>=s.length)clearInterval(e._i);},RM?0:28);});}
$('#q').addEventListener('input',()=>{updBill();clearTimeout(updSerial._t);updSerial._t=setTimeout(updSerial,250);});
$('#micro').textContent=('LUCIONI CAPITAL · CERTIFICADO DE PRÁCTICA · SIN VALOR MONETARIO · ').repeat(12);
const cert=$('#cert');
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!RM){
  cert.addEventListener('pointermove',e=>{const r=cert.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    cert.style.transform=`perspective(1400px) rotateX(${(-py*2.4).toFixed(2)}deg) rotateY(${(px*3.2).toFixed(2)}deg)`;$('#thread').style.setProperty('--sh',((py+.5)*100).toFixed(1)+'%');});
  cert.addEventListener('pointerleave',()=>{cert.style.transform='';});}
else addEventListener('scroll',()=>{const y=scrollY;if(y<800)$('#thread').style.setProperty('--sh',(30+y/8)+'%');},{passive:true});

/* navegación por secciones */
const SECID={home:'plan',mkt:'mercado',play:'practica',tools:'herramientas',learn:'aprende',chat:'asesor'};
const VIS=new Set(['home','mkt']);
function on(p){return VIS.has(p);}
function go(p){if(p==='home'&&false)return;const el=document.getElementById(SECID[p]||p);if(!el)return;
  if(sh.classList.contains('open'))closeSheet();el.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});}
const secIO=new IntersectionObserver(es=>{es.forEach(e=>{const p=e.target.dataset.sec;if(e.isIntersecting)VIS.add(p);else VIS.delete(p);});
  const order=['inicio','home','mkt','play','tools','learn','chat'];const cur=(typeof VIEW!=='undefined'&&VIEW)||order.find(p=>VIS.has(p))||'home';
  if(cur!==page){page=cur;markNav();setTimeout(resizeAll,30);}},{rootMargin:'-110px 0px -35% 0px'});
$$('section[data-sec]').forEach(s=>secIO.observe(s));
function markNav(){$$('#nav a,#nav2 a').forEach(a=>a.classList.toggle('act',a.dataset.p===page));
  const a=$(`#nav a[data-p="${page}"]`),u=$('#uline');if(a&&u){u.style.left=a.offsetLeft+8+'px';u.style.width=a.offsetWidth-16+'px';}
  const b=$(`#nav2 a[data-p="${page}"]`);if(b){const n=$('#nav2');n.scrollTo({left:b.offsetLeft-n.clientWidth/2+b.offsetWidth/2,behavior:RM?'auto':'smooth'});}}
$$('#nav a,#nav2 a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();go(a.dataset.p);}));
addEventListener('resize',markNav);

/* ---------- el costo del antojo ---------- */
const HABITS=[['Café','coffee',9],['Menú','plate',14],['Delivery','bike',28],['Taxi app','car',15],['Gaseosa','cup',4],['Cerveza','beer',10],['Streaming','tv',2],['Ropa','shirt',20]];
let habI=0;
$('#habit').innerHTML=HABITS.map(([n,i,p],k)=>`<button class="hb${k?'':' act'}" data-k="${k}">${n}<small>S/ ${p}</small></button>`).join('');
$$('#habit .hb').forEach(b=>b.onclick=()=>{habI=+b.dataset.k;$$('#habit .hb').forEach(x=>x.classList.toggle('act',x===b));habit();mission('calc');});
function habit(){const [n,,p]=HABITS[habI],w=Math.max(1,+$('#hN').value||1),Y=Math.max(1,Math.min(50,+$('#hY').value||1)),pm=p*w*52/12,r=.07/12;
  let v=0;for(let m=0;m<Y*12;m++)v=v*(1+r)+pm;const put=pm*Y*12;
  countUp($('#hA'),p*w*52,x=>'S/ '+Math.round(x).toLocaleString('en-US'),600);countUp($('#hP'),put,x=>'S/ '+Math.round(x).toLocaleString('en-US'),600);countUp($('#hV'),v,x=>'S/ '+Math.round(x).toLocaleString('en-US'),900);
  $('#hLine').innerHTML=`${w} ${n.toLowerCase()}${w>1?'s':''} a la semana durante ${Y} año${Y>1?'s':''} son <b>S/ ${Math.round(v).toLocaleString('en-US')}</b> si los invirtieras. ${v>15000?'Eso es más que un viaje a Cusco con todo pagado.':v>4000?'Te alcanza para un buen celular.':'Poquito a poco se junta.'}`;}
['#hN','#hY'].forEach(s=>$(s).addEventListener('input',habit));

/* ---------- menú del logo ---------- */
const MENU=[
 ['Invertir',[
  ['accion','Tu plan con IA','Escribe cuánto tienes y arma tu cartera',()=>{go('home');setTimeout(()=>$('#q').focus({preventScroll:true}),500);}],
  ['alcista','Mercado en vivo','Gráfico, velas y tiempo acelerado',()=>go('mkt')],
  ['volatilidad','Miedo o codicia','Termómetro y mapa de calor',()=>{go('mkt');setTimeout(()=>$('#heat').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['news','Noticias de la rueda','Titulares que mueven precios',()=>{go('mkt');setTimeout(()=>$('#news').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['star','Mi lista de seguimiento','Las acciones que te interesan',()=>{go('mkt');setTimeout(()=>$('#wl').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['broker','Comprar de verdad','Brókers reales para comprar una acción',()=>openReal('VOO')]]],
 ['Practicar',[
  ['buy','Modo práctica','$10,000 de mentira para operar',()=>go('play')],
  ['target','Tú contra Lucio Bot','Duelo en vivo con un bot',()=>{go('play');setTimeout(()=>$('.duel').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['trophy','Nivel y retos de hoy','XP, retos diarios y sonidos',()=>openLevel()],
  ['clock','Órdenes y alertas','Límite, stop y avisos de precio',()=>{go('play');setTimeout(()=>$('#ord').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['clock','Piloto automático','Compra fija cada cierto tiempo (DCA)',()=>{go('play');setTimeout(()=>$('#pilot').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['stop','Salud de tu cartera','Un puntaje y qué mejorar',()=>{go('play');setTimeout(()=>$('#health').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['play','Tu resumen','Tus números en historias',()=>openStory()],
  ['news','Diario de inversión','Anota por qué compras o vendes',()=>{go('play');setTimeout(()=>$('#diary').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['bajista','Provocar una crisis','Todo el mercado cae de golpe',()=>{go('mkt');setTimeout(()=>shockAll(-1),500);}]]],
 ['Calcular y aprender',[
  ['volatilidad','Proyección Monte Carlo','Rango probable y probabilidad de meta',()=>{go('tools');tool('mc');}],
  ['diversificar','Rebalanceo','Vuelve a tu asignación objetivo',()=>{go('tools');tool('reb');}],
  ['dividendo','Impacto de comisiones','ETF de bajo costo frente a fondo caro',()=>{go('tools');tool('fee');}],
  ['bajista','Prueba de estrés','Pérdida estimada en 2008, 2020 y 2022',()=>{go('play');setTimeout(()=>$('#stress').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['compuesto','Interés compuesto','Cuánto crece tu dinero',()=>{go('tools');tool('calc');}],
  ['dividendo','El costo del antojo','Tu café diario, invertido',()=>{go('tools');tool('habit');}],
  ['target','Planificador de meta','Cuánto ahorrar al mes',()=>{go('tools');tool('goal');}],
  ['stop','Test de perfil','Qué tanto riesgo aguantas',()=>{go('tools');tool('quiz');}],
  ['bolt','Comparar acciones','Dos tickers lado a lado',()=>{go('tools');tool('cmp');}],
  ['film','Tu cartera en video','Hecho con Remotion',()=>{go('tools');tool('video');}],
  ['etf','Descubre acciones','Desliza cartas de empresas',()=>go('learn')],
  ['cap','¿Sube o baja? y glosario','Juego de 5 segundos y términos',()=>{go('learn');setTimeout(()=>$('#game').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['dividendo','Alcancía','Llena tu meta de ahorro',()=>{go('tools');tool('jar');}],
  ['broker','Soles y dólares','Conversor con margen del cambio',()=>{go('tools');tool('fx');}],
  ['bolt','Trivia de bolsa','5 preguntas para ponerte a prueba',()=>{go('learn');setTimeout(()=>$('#triv').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['chat','Asesor','Pregunta lo que quieras',()=>{go('chat');setTimeout(()=>$('#cq').focus({preventScroll:true}),600);}]]]];
const MFLAT=[];
$('#menuItems').innerHTML='<div class="mcols">'+MENU.map(([g,its])=>`<div class="mcol"><h4>${g}</h4>${its.map(([i,t,d,f])=>{MFLAT.push(f);return `<button class="mi2" role="menuitem" data-k="${MFLAT.length-1}">${ic(i,'',false)}<span>${t}<small>${d}</small></span></button>`;}).join('')}</div>`).join('')+'</div>'+
  `<div class="mfoot"><button class="btn" id="mCmd">${ic('search','',false)} Buscar</button><button class="btn" id="mTop">Volver arriba</button></div>`;
function openMenu(){$('#menu').classList.add('open');$('#brandBtn').setAttribute('aria-expanded','true');setTimeout(()=>{const f=$('#menu .mi2');f&&f.focus({preventScroll:true});},40);}
function closeMenu(back){$('#menu').classList.remove('open');$('#brandBtn').setAttribute('aria-expanded','false');if(back)$('#brandBtn').focus({preventScroll:true});}
const menuOpen=()=>$('#menu').classList.contains('open');
$('#brandBtn').onclick=e=>{e.stopPropagation();menuOpen()?closeMenu():openMenu();};
document.addEventListener('pointerdown',e=>{if(menuOpen()&&!e.target.closest('#menu,#brandBtn'))closeMenu();});
$$('#menu .mi2').forEach(b=>b.onclick=()=>{closeMenu();SFX.tick();setTimeout(MFLAT[+b.dataset.k],80);});
$('#mCmd').onclick=()=>{closeMenu();openCmd();};$('#mTop').onclick=()=>{closeMenu();scrollTo({top:0,behavior:RM?'auto':'smooth'});};
$('#menu').addEventListener('keydown',e=>{const it=$$('#menu .mi2,#menu .mfoot .btn'),i=it.indexOf(document.activeElement);
  if(e.key==='Escape'){e.stopPropagation();closeMenu(true);}
  else if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();it[(i+1)%it.length].focus();}
  else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();it[(i-1+it.length)%it.length].focus();}
  else if(e.key==='Home'){e.preventDefault();it[0].focus();}else if(e.key==='End'){e.preventDefault();it[it.length-1].focus();}});

/* ---------- V4: historia con scroll ---------- */
const story=$('#story'),stH=$('#stH'),stSub=$('#stSub'),stB=$('#stBill'),stL=$$('#stLines .st-l'),stC=$('#stCta'),stHint=$('#stHint'),stBar=$('#stBar');
const clamp01=v=>Math.max(0,Math.min(1,v)),eo=t=>1-Math.pow(1-t,3),seg=(p,a,b)=>clamp01((p-a)/(b-a));
let stLast=-1,stAmt=0;
function drawRos2(){const c=$('#ros2');const F=fit(c);if(!F)return;const {x,W,H}=F,cx=W/2,cy=H/2,R=Math.min(W,H)*.47;x.clearRect(0,0,W,H);x.strokeStyle=TH.guil;x.lineWidth=.8;
  for(let j=0;j<10;j++)band(x,cx,cy,R,11,.22,j*Math.PI*2/10,1);for(let j=0;j<8;j++)band(x,cx,cy,R*.6,16,.18,j*Math.PI*2/8,1);
  x.strokeStyle=TH.gold;x.globalAlpha=.55;x.beginPath();x.arc(cx,cy,R*.36,0,7);x.stroke();x.globalAlpha=1;}
function storyFrame(){
  const r=story.getBoundingClientRect(),total=story.offsetHeight-innerHeight,p=RM?1:clamp01(-r.top/total);
  if(Math.abs(p-stLast)<.0005)return;stLast=p;
  stBar.style.width=(p*100)+'%';
  const a=eo(seg(p,0,.32));
  stH.style.opacity=String(1-seg(p,.12,.3));stH.style.transform=`translateY(${-a*60}px) scale(${1-a*.12})`;
  stSub.style.opacity=String(1-seg(p,.04,.2));
  stHint.style.opacity=String(1-seg(p,0,.06));
  const b=eo(seg(p,0,.38)),lift=eo(seg(p,.38,.95));
  stB.style.transform=`translate(-50%,-50%) translateY(${(1-b)*24-lift*8}vh) rotateX(${(1-b)*38}deg) rotateZ(${(1-b)*-6}deg) scale(${.62+b*.38+lift*.06})`;
  stB.style.setProperty('--sh',(20+p*60)+'%');
  $('#ros2').style.transform=`translateY(-50%) rotate(${p*90}deg)`;
  const amt=Math.round(2000+eo(seg(p,.4,.9))*8000);if(amt!==stAmt){stAmt=amt;$('#stAmt').textContent='S/ '+amt.toLocaleString('en-US');}
  stL.forEach((l,i)=>{const s0=.36+i*.17,k=seg(p,s0,s0+.07)*(1-seg(p,s0+.13,s0+.17));l.style.opacity=String(k);l.style.transform=`translateY(${(1-k)*18}px)`;});
  stC.classList.toggle('on',p>.88);
}
addEventListener('scroll',()=>requestAnimationFrame(storyFrame),{passive:true});addEventListener('resize',()=>{stLast=-1;drawRos2();storyFrame();});
$('#stGo').onclick=()=>{go('home');setTimeout(()=>$('#q').focus({preventScroll:true}),700);};
$('#stMore').onclick=()=>$('#gal').scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});
$('#navCta').onclick=()=>{go('home');setTimeout(()=>$('#q').focus({preventScroll:true}),700);};
addEventListener('scroll',()=>$('.top').classList.toggle('scrolled',scrollY>8),{passive:true});

/* ---------- V4: carrusel ---------- */
const GAL=[['Duelo','Tú contra Lucio Bot.','Un bot con los mismos $10,000 compra lo que viene subiendo. Gánale.','target',0,()=>{go('play');setTimeout(()=>$('.duel').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
 ['Mercado','Provoca una crisis.','Hunde todo el mercado de golpe y mira si tu cartera aguanta.','bajista',1,()=>{go('mkt');setTimeout(()=>shockAll(-1),600);}],
 ['Calculadora','El costo del antojo.','Tu café diario, convertido en lo que valdría invertido.','dividendo',0,()=>{go('tools');tool('habit');}],
 ['Remotion','Tu cartera, en video.','Un video de 14 segundos armado con tus números.','film',1,()=>{go('tools');tool('video');}],
 ['Aprende','Desliza empresas.','Derecha si te interesa, izquierda si no. Arriba para comprarla de verdad.','etf',0,()=>go('learn')],
 ['Piloto','Compra en piloto automático.','Un monto fijo cada pocos segundos, suba o baje. Mira cómo se promedia tu costo.','clock',1,()=>{go('play');setTimeout(()=>$('#pilot').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
 ['Alcancía','Llena tu alcancía.','Ponle nombre a tu meta y mira cómo sube el nivel con cada sol que guardas.','dividendo',1,()=>{go('tools');tool('jar');}],
 ['Trivia','¿Cuánto sabes de bolsa?','Cinco preguntas con explicación. Gana XP por cada acierto.','bolt',0,()=>{go('learn');setTimeout(()=>$('#triv').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
 ['Resumen','Tus números, en historias.','Nivel, mejor jugada y duelo contra el bot, una pantalla a la vez.','play',0,()=>openStory()],
 ['De verdad','Del ensayo a tu bróker.','Cuando quieras comprar en serio, te llevamos a brókers reales.','broker',0,()=>openReal('VOO')]];
$('#gtrack').innerHTML=GAL.map(([k,h,p,i,d],n)=>`<button class="gc${d?' dk':''}" data-n="${n}"><span class="gk">${k}</span><h3>${h}</h3><span class="gp">${p}</span><span class="gv">${ic(i,'',false)}</span><span class="gplus" aria-hidden="true">${ic('plus','',false)}</span></button>`).join('');
$('#gdots').innerHTML=GAL.map(()=>'<i></i>').join('');
const gt=$('#gtrack');
$$('#gtrack .gc').forEach(b=>b.onclick=()=>GAL[+b.dataset.n][5]());
function galUpd(){const cards=$$('#gtrack .gc'),w=cards[0].offsetWidth+18,i=Math.round(gt.scrollLeft/w);$$('#gdots i').forEach((d,k)=>d.classList.toggle('on',k===Math.min(i,cards.length-1)));
  $('#gPrev').disabled=gt.scrollLeft<4;$('#gNext').disabled=gt.scrollLeft+gt.clientWidth>=gt.scrollWidth-4;}
gt.addEventListener('scroll',()=>requestAnimationFrame(galUpd),{passive:true});
$('#gPrev').onclick=()=>gt.scrollBy({left:-($('#gtrack .gc').offsetWidth+18),behavior:RM?'auto':'smooth'});
$('#gNext').onclick=()=>gt.scrollBy({left:$('#gtrack .gc').offsetWidth+18,behavior:RM?'auto':'smooth'});

/* ---------- V4: aparición al hacer scroll ---------- */
const rvIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rvIO.unobserve(e.target);}}),{threshold:.15});
if(!RM)$$('.sh, .facts > div, #gal .gnav').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('rv2');rvIO.observe(el);}});
const fIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const b=e.target;countUp(b,+b.dataset.v,v=>(b.dataset.p||'')+Math.round(v).toLocaleString('en-US')+(b.dataset.s||''),1400);fIO.unobserve(b);}}),{threshold:.5});
$$('.facts b').forEach(b=>fIO.observe(b));

applyTheme=(f=>function(){f();drawRos2();stLast=-1;storyFrame();})(applyTheme);

/* ===================== V5 ===================== */
/* ---------- indicador deslizante en selectores ---------- */
function thumbify(box,kind){if(!box||box._th)return;const t=document.createElement('span');t.className='sthumb '+kind;t.setAttribute('aria-hidden','true');box.prepend(t);box._th=t;box.classList.add('has-th');if(kind==='p')box.classList.add('tp');
  const upd=inst=>{const a=box.querySelector(':scope > .act');if(!a||!a.offsetWidth){t.style.opacity=0;return;}if(inst||t.style.opacity==='0'){t.style.transition='none';}
    t.style.opacity=1;t.style.left=a.offsetLeft+'px';t.style.top=a.offsetTop+'px';t.style.width=a.offsetWidth+'px';t.style.height=a.offsetHeight+'px';if(t.style.transition==='none'){void t.offsetWidth;t.style.transition='';}};
  new MutationObserver(()=>upd()).observe(box,{subtree:true,attributes:true,attributeFilter:['class']});new ResizeObserver(()=>upd(true)).observe(box);box._upd=upd;upd(true);}
function thumbAll(root=document){root.querySelectorAll('.seg').forEach(b=>thumbify(b,'s'));thumbify(root.querySelector('#tnav'),'p');thumbify(root.querySelector('#risk'),'p');}
thumbAll();
new MutationObserver(()=>$$('#sheetBody .seg').forEach(b=>thumbify(b,'s'))).observe($('#sheetBody'),{childList:true,subtree:true});

/* ---------- cambio de herramienta con altura animada ---------- */
tool=(f=>function(t){const cur=TOOLS.map(k=>$('#t-'+k)).find(e=>e&&!e.classList.contains('hidden'));const h0=cur?cur.offsetHeight:0;f(t);const nw=$('#t-'+t);if(!nw||RM)return;const h1=nw.offsetHeight;
  if(h0&&Math.abs(h1-h0)>4)nw.animate([{height:h0+'px',overflow:'hidden'},{height:h1+'px',overflow:'hidden'}],{duration:450,easing:'cubic-bezier(.23,1,.32,1)'});})(tool);

/* ---------- tema con revelado circular ---------- */
const uvOld=$('#uvT').onclick;
$('#uvT').onclick=e=>{if(!document.startViewTransition||RM)return uvOld(e);const r=$('#uvT').getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,R=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  document.startViewTransition(()=>uvOld(e)).ready.then(()=>document.documentElement.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${R}px at ${x}px ${y}px)`]},{duration:650,easing:'cubic-bezier(.23,1,.32,1)',pseudoElement:'::view-transition-new(root)'})).catch(()=>{});};

/* ---------- luz que sigue al puntero en las tarjetas ---------- */
$$('#gtrack .gc').forEach(c=>c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');}));

/* ---------- salud de la cartera ---------- */
function health(){const E=Object.entries(PV.h).map(([s,h])=>[s,h.n*price(s)]),tot=pvValue(),inv=tot-PV.cash;let sc=0,rows,tip;
  if(!E.length){rows=[['Diversificación',0],['Concentración',0],['Colchón de efectivo',0],['Volatilidad',0]];tip='Compra tu primera acción y aquí verás qué tan sana está tu cartera.';}
  else{const n=E.length,maxW=Math.max(...E.map(e=>e[1]))/tot,cash=PV.cash/tot,vol=E.reduce((a,[s,v])=>a+v*S[s].vol,0)/inv;
    const div=Math.min(1,n/5),conc=maxW<=.3?1:Math.max(0,1-(maxW-.3)/.5),cs=cash>=.05&&cash<=.3?1:cash<.05?cash/.05:Math.max(0,1-(cash-.3)/.6),rk=Math.max(0,Math.min(1,1-(vol-.8)/1.2));
    sc=Math.round((div*.3+conc*.3+cs*.2+rk*.2)*100);rows=[['Diversificación',div],['Concentración',conc],['Colchón de efectivo',cs],['Volatilidad',rk]];
    const worst=rows.reduce((a,b)=>b[1]<a[1]?b:a)[0],top=E.reduce((a,b)=>b[1]>a[1]?b:a)[0];
    tip={'Diversificación':`Tienes ${n} ${n>1?'activos':'activo'}. Con 4 o 5 de sectores distintos, una mala noticia pesa menos.`,
      'Concentración':`${top} es el ${Math.round(maxW*100)}% de tu cartera. Intenta que ningún activo pase del 30%.`,
      'Colchón de efectivo':cash<.05?'Casi no te queda efectivo. Guardar algo te deja comprar si el mercado cae.':`Tienes ${Math.round(cash*100)}% en efectivo. Ese dinero no está trabajando.`,
      'Volatilidad':'Tus activos suben y bajan mucho. Un ETF amplio como VOO calma la cartera.'}[worst];}
  const c=sc>=75?'var(--up)':sc>=50?'var(--warn)':'var(--down)';
  $('#hRing').style.strokeDashoffset=String(289*(1-sc/100));$('#hRing').style.stroke=c;countUp($('#hScore'),sc,v=>String(Math.round(v)),800);
  $('#hBadge').textContent=!E.length?'Sin datos':sc>=75?'Sana':sc>=50?'Mejorable':'En riesgo';$('#hBadge').style.color=E.length?c:'';
  $('#hBars').innerHTML=rows.map(([l,v])=>`<div class="hb2"><div class="hl"><span>${l}</span><b>${Math.round(v*100)}</b></div><div class="bar"><div style="width:${v*100}%;background:${v>=.75?'var(--up)':v>=.5?'var(--warn)':'var(--down)'}"></div></div></div>`).join('');
  $('#hTip').innerHTML=ic('bolt','',false)+'<span></span>';$('#hTip').lastChild.textContent=tip;}

/* ---------- piloto automático (DCA) ---------- */
const PIL={on:false,s:'VOO',amt:250,ev:15,left:0,n:0,cost:0,buys:0};
$('#pS').innerHTML=tradable.map(s=>`<option value="${s}"${s==='VOO'?' selected':''}>${s} · ${S[s].n}</option>`).join('');
$('#pS').onchange=e=>{PIL.s=e.target.value;PIL.n=0;PIL.cost=0;PIL.buys=0;pilDraw();};
$$('#pAmt button').forEach(b=>b.onclick=()=>{PIL.amt=+b.dataset.v;$$('#pAmt button').forEach(x=>x.classList.toggle('act',x===b));});
$$('#pEv button').forEach(b=>b.onclick=()=>{PIL.ev=+b.dataset.v;$$('#pEv button').forEach(x=>x.classList.toggle('act',x===b));if(PIL.on)PIL.left=Math.min(PIL.left,PIL.ev);});
$('#pGo').onclick=()=>{PIL.on=!PIL.on;$('#pGo').textContent=PIL.on?'Apagar piloto':'Encender piloto';$('#pGo').classList.toggle('solid',!PIL.on);$('#pLive').classList.toggle('hidden',!PIL.on);
  if(PIL.on){PIL.left=1;toast(`Piloto encendido: ${usd(PIL.amt)} de ${PIL.s} cada ${PIL.ev} s`,ic('clock','',false));if(!store.get('pilot',0)){store.set('pilot',1);addXP(10);}}else toast('Piloto apagado');pilDraw();};
function pilTick(){if(!PIL.on)return;PIL.left--;const cd=$('#pRing');if(cd)cd.style.strokeDashoffset=String(100*(PIL.left/PIL.ev));
  if(PIL.left>0)return;const p=price(PIL.s),n=Math.max(1,Math.floor(PIL.amt/p));
  if(trade(PIL.s,1,n,'Piloto',true)){PIL.n+=n;PIL.cost+=n*p;PIL.buys++;SFX.tick();const b=$('#pilot');b.classList.remove('pulse-on');void b.offsetWidth;b.classList.add('pulse-on');}
  else{PIL.on=false;$('#pGo').textContent='Encender piloto';$('#pGo').classList.add('solid');$('#pLive').classList.add('hidden');toast('El piloto se apagó: no queda efectivo suficiente');}
  PIL.left=PIL.ev;if(cd){cd.style.transition='none';cd.style.strokeDashoffset='0';void cd.offsetWidth;cd.style.transition='';}}
function pilDraw(){const s=PIL.s,p=price(s),avg=PIL.n?PIL.cost/PIL.n:0;
  $('#pStat').textContent=PIL.buys?`${PIL.buys} compras · ${PIL.n} acc. · costo prom. ${usd2(avg)} · ahora ${usd2(p)} (${sgn((p/avg-1)*100)})`:`${s} ahora ${usd2(p)}`;
  const F=fit($('#pc'));if(!F)return;const d=S[s].pts.slice(-120).map(v=>100*(1+v/100)),vals=avg?[...d,avg]:d,mn=Math.min(...vals)-.2,mx=Math.max(...vals)+.2,X=i=>i/(d.length-1)*F.W,Y=v=>F.H-4-(v-mn)/(mx-mn)*(F.H-8);
  F.x.clearRect(0,0,F.W,F.H);const col=d.at(-1)>=d[0]?TH.up:TH.down;F.x.beginPath();d.forEach((v,i)=>i?F.x.lineTo(X(i),Y(v)):F.x.moveTo(X(i),Y(v)));F.x.strokeStyle=col;F.x.lineWidth=1.8;F.x.stroke();
  if(avg){F.x.setLineDash([4,4]);F.x.strokeStyle=TH.accent;F.x.beginPath();F.x.moveTo(0,Y(avg));F.x.lineTo(F.W,Y(avg));F.x.stroke();F.x.setLineDash([]);F.x.fillStyle=TH.accent;F.x.font='12px IBM Plex Mono, monospace';F.x.fillText('tu costo promedio',6,Y(avg)-5);}}

/* ---------- tu resumen (historias) ---------- */
let STI=0,STT=0,STP=false,STraf=0,STlast=0;const STD=4800;
function storySlides(){const l=lvlOf(XP),tot=pvValue(),g=(tot-10000)/100,E=Object.entries(PV.h).map(([s,h])=>[s,(price(s)/h.cost-1)*100,h.n]);const best=E.sort((a,b)=>b[1]-a[1])[0];const d=tot-botVal();const nA=Object.keys(ACHD).length;
  return [
   ['#14342A',`<small>Lucioni Capital · tu resumen</small><h4>Así te va invirtiendo.</h4><p>Desliza o toca para avanzar.</p><div class="sbig">Nv ${l}</div><p>${LVLNAMES[Math.min(l-1,LVLNAMES.length-1)]} · ${XP} XP</p>`],
   ['#B8321C',`<small>Modo práctica</small><h4>Hiciste</h4><div class="sbig" data-c="${PV.ops}">0</div><h4>operaciones.</h4><p>Tu cartera vale ${usd2(tot)}, ${g>=0?'arriba':'abajo'} ${Math.abs(g).toFixed(2)}% desde que empezaste.</p>`],
   ['#8C6D24',best?`<small>Tu mejor jugada</small><h4>${best[0]}</h4><div class="sbig">${best[1]>=0?'+':''}${best[1].toFixed(1)}%</div><p>Tienes ${best[2]} ${best[2]>1?'acciones':'acción'} de ${S[best[0]].n}.</p>`:`<small>Tu mejor jugada</small><h4>Todavía nada.</h4><div class="sbig">0</div><p>Tu primera compra te espera en el modo práctica.</p>`],
   ['#2F5D8A',`<small>Tú contra Lucio Bot</small><h4>${Math.abs(d)<1?'Van empatados.':d>0?'Le vas ganando.':'Te va ganando.'}</h4><div class="sbig">${usd(Math.abs(d))}</div><p>${d>0?'Sigue así: el bot solo persigue lo que sube.':'El bot compra lo que sube. A veces paciencia gana a la moda.'}</p>`],
   ['#1F6B4F',`<small>Aprende jugando</small><h4>Tu mejor racha en ¿Sube o baja?</h4><div class="sbig" data-c="${G.best}">0</div><p>${nA} de ${ACH.length} logros desbloqueados.</p><div class="sacts"><button data-sv="1">Ver mi cartera en video</button><button class="gh" data-sc="1">Cerrar</button></div>`]];}
function openStory(){const sl=storySlides();$('#sbars').innerHTML=sl.map(()=>'<span><i></i></span>').join('');
  $('#sslides').innerHTML=sl.map(([bg,h])=>`<div class="sl" style="background:${bg}"><canvas class="sguil" aria-hidden="true"></canvas>${h}</div>`).join('');
  $$('#sslides .sguil').forEach(c=>{const F=fit(c);if(!F)return;const {x,W,H}=F;x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=.7;for(let j=0;j<10;j++)band(x,W/2,H/2,Math.min(W,H)*.47,11,.22,j*Math.PI*2/10,1);});
  $$('#sslides [data-sv]').forEach(b=>b.onclick=e=>{e.stopPropagation();closeStory();setTimeout(()=>{setVSrc('play');go('tools');tool('video');setTimeout(()=>LCVideo&&LCVideo.play(),600);},300);});
  $$('#sslides [data-sc]').forEach(b=>b.onclick=e=>{e.stopPropagation();closeStory();});
  $('#sto').classList.add('open');document.body.style.overflow='hidden';STI=0;STT=0;STP=false;showSlide(0);STlast=performance.now();cancelAnimationFrame(STraf);STraf=requestAnimationFrame(stLoop);mission('video',0);}
function closeStory(){$('#sto').classList.remove('open');document.body.style.overflow='';cancelAnimationFrame(STraf);}
function showSlide(i){const sl=$$('#sslides .sl');if(i<0)i=0;if(i>=sl.length){closeStory();return;}STI=i;STT=0;sl.forEach((s,k)=>s.classList.toggle('on',k===i));
  $$('#sbars i').forEach((b,k)=>b.style.width=k<i?'100%':'0%');const c=sl[i].querySelector('[data-c]');if(c){c._v=0;countUp(c,+c.dataset.c,v=>String(Math.round(v)),1200);}SFX.tick();}
function stLoop(t){const dt=t-STlast;STlast=t;if(!STP){STT+=dt;const b=$$('#sbars i')[STI];if(b)b.style.width=Math.min(100,STT/STD*100)+'%';if(STT>=STD)showSlide(STI+1);}if($('#sto').classList.contains('open'))STraf=requestAnimationFrame(stLoop);}
(()=>{const bx=$('#sbox');let x0=0,y0=0,t0=0,dn=false;
  bx.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;dn=true;x0=e.clientX;y0=e.clientY;t0=performance.now();STP=true;});
  bx.addEventListener('pointermove',e=>{if(!dn)return;const dy=e.clientY-y0;if(dy>0)bx.style.transform=`translateY(${dy*.6}px) scale(${1-Math.min(dy,300)/3000})`;});
  const up=e=>{if(!dn)return;dn=false;STP=false;const dy=e.clientY-y0,dx=e.clientX-x0,held=performance.now()-t0>260;bx.style.transform='';
    if(dy>90){closeStory();return;}if(held&&Math.abs(dx)<20)return;
    if(Math.abs(dx)>50)showSlide(STI+(dx<0?1:-1));else{const r=bx.getBoundingClientRect();showSlide(STI+((e.clientX-r.left)<r.width/3?-1:1));}};
  bx.addEventListener('pointerup',up);bx.addEventListener('pointercancel',()=>{dn=false;STP=false;bx.style.transform='';});
  $('#sx').onclick=e=>{e.stopPropagation();closeStory();};$('#sto').addEventListener('click',e=>{if(e.target===$('#sto'))closeStory();});
  addEventListener('keydown',e=>{if(!$('#sto').classList.contains('open'))return;if(e.key==='Escape')closeStory();else if(e.key==='ArrowRight')showSlide(STI+1);else if(e.key==='ArrowLeft')showSlide(STI-1);else if(e.key===' '){e.preventDefault();STP=!STP;}});})();
$('#openStory').onclick=openStory;

/* ---------- reloj de V5 ---------- */
setInterval(()=>{pilTick();if(on('play')){pilDraw();if(tick%2===0)health();}},1000);
health();pilDraw();

/* ===================== V6 ===================== */
TOOLS.push('fx','jar');

/* ---------- soles y dólares ---------- */
let FXD={dir:'pen',rate:store.get('fxRate',3.75),spr:store.get('fxSpr',.5)};
$('#fxR').value=FXD.rate;$('#fxS').value=FXD.spr;
$$('#fxDir button').forEach(b=>b.onclick=()=>{FXD.dir=b.dataset.v;$$('#fxDir button').forEach(x=>x.classList.toggle('act',x===b));fx();});
function fx(){const a=Math.max(0,+$('#fxA').value||0),r=Math.max(.01,+$('#fxR').value||3.75),sp=Math.max(0,+$('#fxS').value||0)/100;FXD.rate=r;store.set('fxRate',r);store.set('fxSpr',+$('#fxS').value||0);
  const pen=FXD.dir==='pen',raw=pen?a/r:a*r,got=raw*(1-sp),lost=raw-got,f=pen?(v=>'$ '+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})):(v=>'S/ '+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}));
  $('#fxAl').textContent=pen?'Tienes (S/)':'Tienes ($)';countUp($('#fxOut'),got,f,500);$('#fxLost').textContent=f(lost);
  $('#fxLine').textContent=pen?`Con S/ ${a.toLocaleString('en-US')} recibes unos ${f(got)}. La casa de cambio se queda con ${f(lost)} en el margen.`:`Con $ ${a.toLocaleString('en-US')} recibes unos ${f(got)}. El margen te cuesta ${f(lost)}.`;
  $('#fxV').textContent=pen?`Para comprar 1 acción de VOO de $400 necesitas unos S/ ${(400*r/(1-sp)).toLocaleString('en-US',{maximumFractionDigits:0})}.`:'';}
['#fxA','#fxR','#fxS'].forEach(s=>$(s).addEventListener('input',fx));

/* ---------- alcancía ---------- */
let JAR=Object.assign({name:'Mi primera inversión',goal:1000,dep:[]},store.get('jar',{}));
const jarSum=()=>JAR.dep.reduce((a,d)=>a+d.v,0);
let jarLvl=0,jarRaf=0,jarT=0,jarMil=store.get('jarMil',0);
$('#jN').value=JAR.name;$('#jG').value=JAR.goal;
function jarSave(){store.set('jar',JAR);}
function jarAdd(v){if(!(v>0))return;JAR.dep.unshift({v,d:new Date().toLocaleDateString('es-PE',{day:'numeric',month:'short'})});JAR.dep=JAR.dep.slice(0,60);jarSave();SFX.buy();jarRender();
  const k=jarSum()/JAR.goal,m=[.25,.5,.75,1].filter(x=>k>=x).length;if(m>jarMil){jarMil=m;store.set('jarMil',m);const c=$('#jarCv'),[x,y]=center(c);FX.burst(x,y,m===4?120:50);toast(m===4?`¡Llenaste "${JAR.name}"! Ahora puedes invertirlo.`:`Vas ${m*25}% de tu meta`,ic('trophy','',false));addXP(m===4?40:10);}}
$$('#jarQ button').forEach(b=>b.onclick=()=>jarAdd(+b.dataset.v));
$('#jAdd').onclick=()=>{jarAdd(+$('#jC').value);$('#jC').value='';};
$('#jC').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#jAdd').click();}});
$('#jUndo').onclick=()=>{if(!JAR.dep.length)return;const d=JAR.dep.shift();jarSave();jarRender();toast(`Quitaste S/ ${d.v} de la alcancía`);};
$('#jN').oninput=e=>{JAR.name=e.target.value||'Mi meta';jarSave();jarRender();};
$('#jG').oninput=e=>{JAR.goal=Math.max(1,+e.target.value||1);jarSave();jarRender();};
function jarRender(){const s=jarSum(),k=Math.min(1,s/JAR.goal);$('#jSum').textContent='S/ '+s.toLocaleString('en-US');$('#jPct').textContent=Math.round(k*100)+'%';
  $('#jLeft').textContent=s>=JAR.goal?'Meta cumplida':`Faltan S/ ${(JAR.goal-s).toLocaleString('en-US')} para "${JAR.name}"`;
  $('#jList').innerHTML=JAR.dep.length?JAR.dep.slice(0,6).map(d=>`<div class="trow"><div class="s" style="font-family:var(--sans);font-weight:500">${d.d}</div><div class="p" style="color:var(--up)">+S/ ${d.v.toLocaleString('en-US')}</div></div>`).join(''):'<p class="note">Aún no guardas nada. Empieza con lo que puedas.</p>';
  if(!jarRaf)jarRaf=requestAnimationFrame(jarLoop);}
function jarLoop(t){jarRaf=0;const c=$('#jarCv');if(!on('tools')||$('#t-jar').classList.contains('hidden')){return;}const F=fit(c);if(!F)return;const {x,W,H}=F,k=Math.min(1,jarSum()/JAR.goal);
  jarLvl+=(k-jarLvl)*(RM?1:.06);jarT=t/1000;
  const jw=Math.min(W*.62,190),jh=Math.min(H-24,260),jx=(W-jw)/2,jy=H-jh-6,r=26;
  x.clearRect(0,0,W,H);
  x.save();x.beginPath();x.moveTo(jx+16,jy);x.lineTo(jx+jw-16,jy);x.quadraticCurveTo(jx+jw,jy,jx+jw,jy+r);x.lineTo(jx+jw,jy+jh-r);x.quadraticCurveTo(jx+jw,jy+jh,jx+jw-r,jy+jh);x.lineTo(jx+r,jy+jh);x.quadraticCurveTo(jx,jy+jh,jx,jy+jh-r);x.lineTo(jx,jy+r);x.quadraticCurveTo(jx,jy,jx+16,jy);x.closePath();
  x.fillStyle=TH.well;x.fill();x.clip();
  const ly=jy+jh-(jh-14)*jarLvl;
  for(const [col,amp,sp,ph,al] of [[TH.gold,6,1.6,0,.55],[TH.accent,5,2.2,1.7,.85]]){x.beginPath();x.moveTo(jx,H);for(let i=0;i<=40;i++){const px=jx+jw*i/40;x.lineTo(px,ly+Math.sin(i/40*Math.PI*2+jarT*sp+ph)*amp*(jarLvl>0.002?1:0));}x.lineTo(jx+jw,H);x.closePath();x.globalAlpha=al;x.fillStyle=col;x.fill();}
  const depth=jy+jh-ly-10;x.globalAlpha=.45;x.fillStyle='#fff';if(depth>12&&!RM)for(let i=0;i<6;i++){const bx=jx+jw*(.15+i*.14)+Math.sin(jarT*2+i)*3,by=jy+jh-6-((jarT*28+i*37)%depth);x.beginPath();x.arc(bx,by,1.6+i%3,0,7);x.fill();}
  x.restore();x.globalAlpha=1;x.lineWidth=2.5;x.strokeStyle=TH.ink;x.beginPath();x.moveTo(jx+16,jy);x.lineTo(jx+jw-16,jy);x.quadraticCurveTo(jx+jw,jy,jx+jw,jy+r);x.lineTo(jx+jw,jy+jh-r);x.quadraticCurveTo(jx+jw,jy+jh,jx+jw-r,jy+jh);x.lineTo(jx+r,jy+jh);x.quadraticCurveTo(jx,jy+jh,jx,jy+jh-r);x.lineTo(jx,jy+r);x.quadraticCurveTo(jx,jy,jx+16,jy);x.stroke();
  x.fillStyle=TH.ink;x.fillRect(jx+jw*.32,jy-10,jw*.36,8);x.fillStyle=TH.sheet;x.fillRect(jx+jw*.4,jy-8,jw*.2,4);
  if(!RM||Math.abs(k-jarLvl)>.001)jarRaf=requestAnimationFrame(jarLoop);}

/* ---------- trivia ---------- */
const TQ=[['¿Qué es un ETF?',['Un fondo que agrupa muchas acciones y se compra como una sola','Un préstamo del banco','Una moneda digital','Un tipo de cuenta de ahorros'],0,'Con un ETF como VOO compras de una vez un pedacito de cientos de empresas.'],
 ['Una acción pasa de $50 a $60. ¿Cuánto subió?',['10%','12%','20%','60%'],2,'Subió $10 sobre $50: 10 ÷ 50 = 20%.'],
 ['Si pierdes 50%, ¿cuánto necesitas ganar para volver a donde empezaste?',['50%','75%','100%','25%'],2,'De $100 bajas a $50. Para volver a $100 tienes que duplicar: +100%.'],
 ['¿Qué es diversificar?',['Comprar una sola acción muy buena','Repartir tu dinero en varios activos','Vender todo cuando baja','Invertir solo en dólares'],1,'Si una empresa cae, las demás amortiguan el golpe.'],
 ['¿Qué es un dividendo?',['Una comisión del bróker','Parte de las ganancias que la empresa reparte a sus accionistas','Un impuesto','La diferencia entre compra y venta'],1,'Muchas empresas grandes pagan dividendos cada trimestre.'],
 ['¿Qué es la BVL?',['El banco central','La Bolsa de Valores de Lima','Un fondo de pensiones','Una casa de cambio'],1,'Ahí cotizan empresas peruanas y algunas extranjeras.'],
 ['¿Qué hace una orden stop loss?',['Compra cuando el precio baja','Vende si el precio cae hasta el nivel que pusiste','Congela tu cuenta','Paga dividendos'],1,'Sirve para limitar cuánto puedes perder.'],
 ['Inviertes $1,000 al 10% anual por 2 años, con interés compuesto. ¿Cuánto tienes?',['$1,200','$1,210','$1,100','$1,020'],1,'Año 1: $1,100. Año 2: $1,100 × 1.10 = $1,210. Ganas intereses sobre intereses.'],
 ['¿Qué significa volatilidad alta?',['Que el precio casi no cambia','Que el precio sube y baja mucho','Que la empresa quebró','Que paga muchos dividendos'],1,'Más volatilidad = más riesgo y más movimiento en ambos sentidos.'],
 ['¿Qué es un bróker?',['La plataforma que te deja comprar y vender en bolsa','Un tipo de acción','Un índice','Un analista de la IA'],0,'Antes de abrir cuenta revisa que esté regulado y sus comisiones.'],
 ['¿Cuándo se habla de mercado bajista?',['Cuando cae 5% en un día','Cuando cae 20% o más desde su máximo','Cuando sube 20%','Cuando cierra la bolsa'],1,'También le dicen "bear market".'],
 ['¿Qué compara el P/E (PER)?',['El precio con la ganancia por acción','El precio con el volumen','La deuda con el efectivo','El dividendo con el precio'],0,'Un P/E alto puede indicar que el mercado espera mucho crecimiento.']];
let TV={q:[],i:0,ok:0,lock:false};
function trivStart(){TV={q:[...TQ].sort(()=>Math.random()-.5).slice(0,5),i:0,ok:0,lock:false};trivShow();}
function trivShow(){const b=$('#triv');if(TV.i>=TV.q.length){const best=Math.max(store.get('trivBest',0),TV.ok);store.set('trivBest',best);
    b.innerHTML=`<div class="tvend"><div class="sbig2">${TV.ok}/5</div><p>${TV.ok===5?'Perfecto. Sabes más que muchos que ya invierten.':TV.ok>=3?'Bien. Repasa el glosario y vas por el 5/5.':'Vas aprendiendo. Abre el glosario y vuelve a intentarlo.'}</p><p class="note">Tu mejor puntaje: ${best}/5</p><button class="btn solid" id="tvAgain">Jugar otra ronda</button></div>`;
    $('#tvAgain').onclick=trivStart;if(TV.ok)addXP(TV.ok*5);if(TV.ok===5)FX.burst(...center(b),90);return;}
  const [q,o,c]=TV.q[TV.i];
  b.innerHTML=`<div class="prog"><div style="width:${TV.i/5*100}%"></div></div><p class="note" style="margin:0 0 4px">Pregunta ${TV.i+1} de 5 · aciertos ${TV.ok}</p><p class="tvq">${q}</p>${o.map((t,k)=>`<button class="qopt" data-k="${k}">${t}</button>`).join('')}<div id="tvExp"></div>`;
  $$('#triv .qopt').forEach(x=>x.onclick=()=>{if(TV.lock)return;TV.lock=true;const k=+x.dataset.k,ok=k===c;if(ok){TV.ok++;SFX.win();}else SFX.sell();
    $$('#triv .qopt').forEach((y,j)=>{y.classList.add(j===c?'right':j===k?'wrong':'dim');});
    $('#tvExp').innerHTML=`<div class="htip" style="margin-top:12px">${ic(ok?'check':'x','',false)}<span><b>${ok?'¡Correcto!':'No era esa.'}</b> ${TV.q[TV.i][3]}</span></div><button class="btn solid" id="tvNext" style="margin-top:12px">${TV.i<4?'Siguiente':'Ver resultado'}</button>`;
    $('#tvNext').onclick=()=>{TV.i++;TV.lock=false;trivShow();};$('#tvNext').focus({preventScroll:true});});}

/* ---------- diario de inversión ---------- */
let DIA=store.get('diary',[]);let diaMood='Confiado';
$('#dS').innerHTML=['General',...tradable].map(s=>`<option>${s}</option>`).join('');
$$('#dMood button').forEach(b=>b.onclick=()=>{diaMood=b.dataset.v;$$('#dMood button').forEach(x=>x.classList.toggle('act',x===b));});
$('#dAdd').onclick=()=>{const t=$('#dT').value.trim();if(!t){$('#dT').focus();toast('Escribe por qué compras, vendes o esperas');return;}
  const s=$('#dS').value;DIA.unshift({id:Date.now(),s,t,m:diaMood,p:s!=='General'?price(s):null,d:new Date().toLocaleString('es-PE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})});DIA=DIA.slice(0,50);store.set('diary',DIA);$('#dT').value='';diaRender(true);toast('Nota guardada en tu diario',ic('check','',false));if(DIA.length===1)addXP(10);};
function diaRender(fresh){$('#dN').textContent=DIA.length?DIA.length+' notas':'';
  $('#dList').innerHTML=DIA.length?DIA.slice(0,8).map((e,i)=>{const now=e.p?price(e.s):null,ch=e.p?(now/e.p-1)*100:null;return `<div class="dia${fresh&&i===0?' new':''}"><div class="dh"><b>${esc(e.s)}</b><span class="badge">${esc(e.m)}</span><span class="note" style="margin:0;margin-left:auto">${esc(e.d)}</span><button class="dx" data-id="${e.id}" aria-label="Borrar nota">${ic('x','',false)}</button></div><p>${esc(e.t)}</p>${e.p?`<span class="pnl" style="color:var(${ch>=0?'--up':'--down'})">Desde que lo escribiste: ${usd2(e.p)} → ${usd2(now)} (${sgn(ch)})</span>`:''}</div>`;}).join(''):'<p class="note">Anota por qué compras o vendes. Releerlo después es la mejor forma de aprender de tus decisiones.</p>';
  $$('#dList .dx').forEach(b=>b.onclick=()=>{DIA=DIA.filter(e=>e.id!=b.dataset.id);store.set('diary',DIA);diaRender();});}

setInterval(()=>{if(on('play')&&tick%4===0)diaRender();if(on('tools')&&!$('#t-jar').classList.contains('hidden')&&!jarRaf)jarRaf=requestAnimationFrame(jarLoop);},1000);
const _toolV6=tool;tool=function(t){_toolV6(t);if(t==='fx')fx();if(t==='jar'){jarRender();}};
fx();jarRender();trivStart();diaRender();

/* ===================== V7: cuenta y sesión ===================== */
const SYNC=['pv','xp','ach','wl','plan','game','mis','jar','jarMil','diary','bot','fxRate','fxSpr','risk','deckI','snd','realOn','trivBest','vid','pilot','realClick'];
const rawGet=k=>{try{return localStorage.getItem('lc_'+k);}catch(e){return null;}},rawSet=(k,v)=>{try{v==null?localStorage.removeItem('lc_'+k):localStorage.setItem('lc_'+k,v);}catch(e){}};
let ACC=store.get('acc',null),ACCOFF=store.get('accOff',false);
const CL={db:null,ref:null,ok:false,state:'local',last:store.get('accSync',0),dirty:false,meName:'',avatar:''};
const _sset=store.set;store.set=(k,v)=>{_sset.call(store,k,v);if(SYNC.includes(k)&&ACC&&!ACCOFF&&CL.ready){CL.dirty=true;}};
function gather(){const o={};SYNC.forEach(k=>{const v=rawGet(k);if(v!=null)o[k]=v;});return o;}
async function push(force){if(!CL.ok||!ACC||ACCOFF||(!CL.dirty&&!force))return;CL.dirty=false;const at=Date.now();setSync('saving');
  try{await CL.ref.set({profile:ACC,state:gather(),updatedAt:at});CL.last=at;CL.fail=0;_sset.call(store,'accSync',at);setSync('ok');}catch(e){CL.dirty=true;CL.fail=(CL.fail||0)+1;if(CL.fail>=3){CL.ok=false;accUI();}setSync('err');}}
setInterval(()=>push(),8000);
addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')push();});
function setSync(s){CL.state=s;const el=$('#accSync');if(el)el.innerHTML=syncTxt();const dot=$('#accDot');if(dot)dot.dataset.s=s;}
function syncTxt(){if(!ACC)return'';if(ACCOFF)return'Sesión cerrada en este dispositivo';if(!CL.ok)return`${ic('broker','',false)} Guardada solo en este navegador`;
  return {saving:`${ic('clock','',false)} Guardando…`,err:`${ic('x','',false)} No se pudo guardar. Reintentamos solo.`}[CL.state]||`${ic('check','',false)} Guardada en tu cuenta${CL.last?' · '+new Date(CL.last).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'}):''}`;}
const initials=n=>(n||'').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'LC';

/* ---------- interfaz: chip de cuenta y bloque del menú ---------- */
function accUI(){const on=ACC&&!ACCOFF,b=$('#accBtn');
  b.innerHTML=on?`<span class="av" aria-hidden="true">${esc(initials(ACC.name))}</span><span class="tx">${esc(ACC.name.split(' ')[0])}</span><span class="sdot" id="accDot" data-s="${CL.state}"></span>`:`${ic('hello','',false)}<span class="tx">${ACCOFF?'Entrar':'Crear cuenta'}</span>`;
  b.setAttribute('aria-label',on?'Tu cuenta: '+ACC.name:(ACCOFF?'Entrar a tu cuenta':'Crear cuenta'));
  $('#menuAcc').innerHTML=`<div class="mhead"><div class="mbrand">${LEMARK}<div><b>Lucioni Capital</b><span>App financiera de Lucioni Enterprises</span></div></div>
    ${on?`<button class="maccount" id="mAccOpen"><span class="av">${esc(initials(ACC.name))}</span><span><b>Hola, ${esc(ACC.name.split(' ')[0])}</b><small id="accSync">${syncTxt()}</small></span>${ic('right','',false)}</button>`
      :`<div class="mcta"><p>${ACCOFF?'Tu progreso sigue guardado. Entra para seguir donde lo dejaste.':'Crea tu cuenta y guarda tu cartera de práctica, tu nivel, tu alcancía y tu diario.'}</p><button class="btn solid" id="mAccNew">${ACCOFF?'Entrar a mi cuenta':'Crear cuenta gratis'}</button></div>`}</div>`;
  const o=$('#mAccOpen'),n=$('#mAccNew');if(o)o.onclick=()=>{closeMenu();openAccount();};if(n)n.onclick=()=>{closeMenu();ACCOFF?signIn():openAccount();};
  const g=$('#stSub');if(g&&on)g.textContent=`Hola, ${ACC.name.split(' ')[0]}. Tu plata, tu progreso y tu cartera, guardados en tu cuenta.`;}
const LEMARK='<svg class="lemark" width="40" height="40" viewBox="0 0 150 150" aria-hidden="true"><rect x="4" y="4" width="142" height="142" fill="none" stroke="currentColor" stroke-width="5"/><rect x="14" y="14" width="122" height="122" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M50 34 V110 H108" fill="none" stroke="currentColor" stroke-width="15" stroke-linecap="butt"/><rect x="96" y="34" width="14" height="14" style="fill:var(--le-gold)"/></svg>';
$('#accBtn').onclick=()=>{ACCOFF?signIn():openAccount();};

/* ---------- hoja de cuenta ---------- */
function brandHead(){return `<div class="acchead">${LEMARK}<div><b>Lucioni Capital</b><span>App financiera de Lucioni Enterprises</span></div></div>`;}
function openAccount(edit){
  if(ACC&&!ACCOFF&&!edit){const l=lvlOf(XP),tot=pvValue();
    openSheet(`${brandHead()}<div class="accard stepin"><span class="av big">${esc(initials(ACC.name))}</span><div><h3>${esc(ACC.name)}</h3><p class="note" style="margin:2px 0 0">Miembro desde ${new Date(ACC.since).toLocaleDateString('es-PE',{day:'numeric',month:'long',year:'numeric'})}</p><p class="accsync" id="accSync">${syncTxt()}</p></div></div>
      <div class="kpis"><div class="kpi"><small>Nivel</small><b>${l}</b></div><div class="kpi"><small>Cartera de práctica</small><b>${usd(tot)}</b></div><div class="kpi"><small>Alcancía</small><b>S/ ${jarSum().toLocaleString('en-US')}</b></div></div>
      <div class="accrows"><div><span>Perfil de riesgo</span><b>${esc(ACC.risk)}</b></div><div><span>Moneda</span><b>${ACC.cur==='USD'?'Dólares':'Soles'}</b></div>${ACC.goal?`<div><span>Meta</span><b>${esc(ACC.goal)}</b></div>`:''}</div>
      <div class="acts"><button class="btn" id="aEdit">Editar perfil</button>${CL.ok?'<button class="btn" id="aSave">Guardar ahora</button>':''}<button class="btn" id="aStory">Ver mi resumen</button></div>
      <div class="acts" style="margin-top:22px;border-top:1px solid var(--line);padding-top:16px"><button class="btn" id="aOut">Cerrar sesión</button><button class="btn red" id="aDel">Borrar cuenta</button></div>
      <p class="note">${CL.ok?'Tu cuenta va ligada a tu sesión de Claude: entra desde otro dispositivo y sigues donde lo dejaste. Nadie más ve estos datos.':'No hay sesión de Claude en esta vista, así que tu cuenta se guarda solo en este navegador.'}</p>`);
    $('#aEdit').onclick=()=>openAccount(true);const sv=$('#aSave');if(sv)sv.onclick=()=>push(true).then(()=>toast(CL.state==='ok'?'Cuenta guardada':'No se pudo guardar, reintenta en un momento',ic('check','',false)));
    $('#aStory').onclick=()=>{closeSheet();setTimeout(openStory,300);};
    $('#aOut').onclick=async()=>{await push(true);ACCOFF=true;_sset.call(store,'accOff',true);closeSheet();accUI();toast('Sesión cerrada. Tu progreso queda guardado.',ic('check','',false));};
    $('#aDel').onclick=e=>{const b=e.currentTarget;if(!b._a){b._a=1;b.textContent='¿Seguro? Se borra todo. Toca otra vez';setTimeout(()=>{b._a=0;b.textContent='Borrar cuenta';},3000);return;}delAccount();};
    return;}
  const a=ACC||{name:CL.meName||'',risk:($('#risk .pill.act')||{}).dataset?.v||'moderado',cur:'PEN',goal:''};
  openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">${ACC?'Edita tu perfil':'Crea tu cuenta'}</h3>
    <p class="note">${CL.ok?'Sin contraseñas: tu cuenta queda ligada a tu sesión de Claude y tu progreso se guarda solo.':'En esta vista no hay sesión de Claude: tu cuenta se guardará en este navegador.'}</p>
    <form id="accF" novalidate>
      <label class="l" for="aN">¿Cómo te llamas?</label><input class="f" id="aN" maxlength="40" autocomplete="given-name" value="${esc(a.name)}" data-focus required>
      <p class="aerr hidden" id="aNe">Escribe tu nombre para crear la cuenta.</p>
      <span class="l">¿Cómo te gusta invertir?</span><div class="seg" id="aR"><button type="button" data-v="conservador" class="${a.risk==='conservador'?'act':''}">Con calma</button><button type="button" data-v="moderado" class="${a.risk==='moderado'?'act':''}">Equilibrado</button><button type="button" data-v="agresivo" class="${a.risk==='agresivo'?'act':''}">Arriesgado</button></div>
      <span class="l">Moneda principal</span><div class="seg" id="aC"><button type="button" data-v="PEN" class="${a.cur!=='USD'?'act':''}">Soles (S/)</button><button type="button" data-v="USD" class="${a.cur==='USD'?'act':''}">Dólares ($)</button></div>
      <label class="l" for="aG">Tu meta (opcional)</label><input class="f" id="aG" maxlength="60" placeholder="Ej: Juntar para mi primera inversión" value="${esc(a.goal||'')}">
      ${ACC?'':'<label class="chk"><input type="checkbox" id="aOk"> Entiendo que Lucioni Capital es educativo y no es asesoría financiera.</label><p class="aerr hidden" id="aOke">Marca la casilla para continuar.</p>'}
      <button class="cta" type="submit" style="width:100%;justify-content:center;margin-top:18px">${ACC?'Guardar cambios':'Crear mi cuenta'}</button>
    </form></div>`);
  $$('#aR button').forEach(b=>b.onclick=()=>$$('#aR button').forEach(x=>x.classList.toggle('act',x===b)));
  $$('#aC button').forEach(b=>b.onclick=()=>$$('#aC button').forEach(x=>x.classList.toggle('act',x===b)));
  $('#accF').onsubmit=e=>{e.preventDefault();const n=$('#aN').value.trim();$('#aNe').classList.toggle('hidden',!!n);const ok=ACC||$('#aOk').checked;if(!ACC)$('#aOke').classList.toggle('hidden',ok);if(!n||!ok){(!n?$('#aN'):$('#aOk')).focus();return;}
    const isNew=!ACC;ACC={name:n,risk:$('#aR .act').dataset.v,cur:$('#aC .act').dataset.v,goal:$('#aG').value.trim(),since:ACC?.since||Date.now()};_sset.call(store,'acc',ACC);ACCOFF=false;_sset.call(store,'accOff',false);
    setRisk(ACC.risk);store.set('risk',ACC.risk);CL.dirty=true;push(true);accUI();closeSheet();
    if(isNew){setTimeout(()=>{FX.burst(innerWidth/2,innerHeight*.35,110);SFX.lvl();toast(`Bienvenido a Lucioni Capital, ${n.split(' ')[0]}`,ic('trophy','',false));addXP(25);},350);}else toast('Perfil actualizado',ic('check','',false));};}
async function signIn(){ACCOFF=false;_sset.call(store,'accOff',false);
  if(CL.ok){try{const s=await CL.ref.get();if(s.exists){const d=s.data();if((d.updatedAt||0)>CL.last){restore(d);return;}}}catch(e){}}
  accUI();toast(`Hola de nuevo, ${ACC?ACC.name.split(' ')[0]:''}`,ic('hello','',false));push(true);}
async function delAccount(){if(CL.ok){try{await CL.ref.delete();}catch(e){toast('No se pudo borrar en la nube. Intenta otra vez.');return;}}
  ['acc','accSync','accOff',...SYNC].forEach(k=>rawSet(k,null));try{sessionStorage.setItem('lc_msg','Cuenta borrada. Empiezas de cero.');}catch(e){}location.reload();}
function restore(d){Object.entries(d.state||{}).forEach(([k,v])=>{if(SYNC.includes(k))rawSet(k,v);});rawSet('acc',JSON.stringify(d.profile||null));rawSet('accSync',String(d.updatedAt||Date.now()));rawSet('accOff',null);
  try{sessionStorage.setItem('lc_msg',`Sesión recuperada. Hola, ${(d.profile?.name||'').split(' ')[0]}`);}catch(e){}location.reload();}

/* ---------- conectar con la nube de la página ---------- */
(async()=>{accUI();try{const m=sessionStorage.getItem('lc_msg');if(m){sessionStorage.removeItem('lc_msg');setTimeout(()=>toast(m,ic('check','',false)),900);}}catch(e){}
  if(!window.claude||!claude.use)return;
  const [db,u]=await Promise.all([claude.use('db'),claude.use('user')]);if(!db||!u)return;
  let me;try{me=await u.me();}catch(e){return;}if(!me||!me.id)return;
  CL.db=db;CL.meName=me.name||'';CL.ref=db.doc('data/users/'+me.id+'/cuenta');
  let done=false;const to=setTimeout(()=>{if(!done){setSync('err');}},10000);
  try{const s=await CL.ref.get();done=true;clearTimeout(to);CL.ok=true;
    if(s.exists){const d=s.data()||{};
      if(!ACCOFF&&(d.updatedAt||0)>CL.last){restore(d);return;}
      if(!ACC&&d.profile){ACC=d.profile;ACCOFF=true;_sset.call(store,'acc',ACC);_sset.call(store,'accOff',true);}}
    else if(ACC&&!ACCOFF){CL.dirty=true;}
    CL.ready=true;setSync('ok');accUI();push();}
  catch(e){done=true;clearTimeout(to);accUI();}})();

/* ===================== V8: pantalla de bienvenida ===================== */
const GATE=$('#gate');
function gateDraw(){const c=$('#gros');const F=fit(c);if(!F)return;const {x,W,H}=F;x.clearRect(0,0,W,H);x.strokeStyle=TH.guil;x.lineWidth=.8;
  for(let j=0;j<12;j++)band(x,W/2,H/2,Math.min(W,H)*.46,13,.2,j*Math.PI*2/12,1);for(let j=0;j<9;j++)band(x,W/2,H/2,Math.min(W,H)*.3,20,.16,j*Math.PI*2/9,1);}
function gateRender(){const on=ACC&&!ACCOFF,first=ACC?ACC.name.split(' ')[0]:'';
  $('#gWho').innerHTML=on?`<div class="gwho"><span class="av big">${esc(initials(ACC.name))}</span><span><b>Hola de nuevo, ${esc(first)}</b><small>Nivel ${lvlOf(XP)} · cartera de práctica ${usd(pvValue())}</small></span></div>`:'';
  $('#gBtns').innerHTML=on?`<button class="cta" id="gGo">Continuar</button><button class="btn" id="gSum">Ver mi resumen</button>`
    :ACCOFF&&ACC?`<button class="cta" id="gIn">Entrar como ${esc(first)}</button><button class="btn" id="gGo">Entrar sin cuenta</button>`
    :`<button class="cta" id="gNew">Crear cuenta gratis</button><button class="btn" id="gGo">Entrar sin cuenta</button>`;
  const b=(id,f)=>{const e=$(id);if(e)e.onclick=f;};
  b('#gGo',()=>gateClose());b('#gNew',()=>gateClose(()=>openAccount()));b('#gIn',()=>gateClose(()=>signIn()));b('#gSum',()=>gateClose(()=>openStory()));}
const GQ=[['accion','Armar mi cartera','La IA te propone acciones y ETFs',()=>{go('home');setTimeout(()=>$('#q').focus({preventScroll:true}),700);}],
 ['buy','Practicar','$10,000 de mentira para operar',()=>go('play')],
 ['compuesto','Calculadoras','Interés, antojos, meta y más',()=>go('tools')],
 ['cap','Aprender jugando','Cartas, trivia y glosario',()=>go('learn')]];
$('#gQuick').innerHTML=GQ.map(([i,t,d],k)=>`<button class="gq" data-k="${k}">${ic(i,'',false)}<span><b>${t}</b><small>${d}</small></span></button>`).join('');
$$('#gQuick .gq').forEach(q=>q.onclick=()=>gateClose(GQ[+q.dataset.k][3]));

function gateClose(then){try{sessionStorage.setItem('lc_gate','1');}catch(e){}GATE.classList.add('out');document.body.classList.remove('gated');SFX.tick();
  scrollTo({top:0,behavior:'auto'});setTimeout(()=>{GATE.setAttribute('aria-hidden','true');if(then)then();},RM?0:450);}
function gateOpen(){GATE.removeAttribute('aria-hidden');GATE.classList.remove('out');document.body.classList.add('gated');gateRender();gateDraw();setTimeout(()=>{const f=$('#gBtns .cta');f&&f.focus({preventScroll:true});},900);}
let gSkip=false;try{gSkip=sessionStorage.getItem('lc_gate')==='1';}catch(e){}
if(gSkip){GATE.classList.add('out');GATE.setAttribute('aria-hidden','true');}else{document.body.classList.add('gated');gateRender();gateDraw();}
GATE.addEventListener('keydown',e=>{if(e.key==='Escape')gateClose();});
const _accUI=accUI;accUI=function(){_accUI();if(!GATE.classList.contains('out'))gateRender();};
addEventListener('resize',()=>{if(!GATE.classList.contains('out'))gateDraw();});
{const hb=document.createElement('button');hb.className='btn';hb.textContent='Pantalla de inicio';hb.onclick=()=>{closeMenu();gateOpen();};$('#menu .mfoot').prepend(hb);}
const _ap8=applyTheme;applyTheme=function(){_ap8();if(!GATE.classList.contains('out'))gateDraw();};

/* ===================== V9: todo animado ===================== */
const GS=window.gsap,STR=window.ScrollTrigger;
const remPal=()=>({bg:TH.paper,panel:TH.sheet,txt:TH.ink,mut:TH.ink2,cu:TH.accent,cu2:TH.ink,cu3:TH.gold,up:TH.up,down:TH.down,guil:TH.guil,line:TH.line});

/* ---------- composiciones en formato HyperFrames (clips con data-start / data-duration + timeline GSAP) ---------- */
window.__timelines=window.__timelines||{};
function hfBuild(){if(!GS)return;const T=window.__timelines,D=document;
  // mercado
  {const box=D.querySelector('#hm1 .hm-cdl');box.innerHTML=Array.from({length:22},(_,i)=>{const h=50+Math.abs(Math.sin(i*1.3)*Math.cos(i*.5))*150+i*3;const up=Math.sin(i*2.1)>-.3;return `<i style="left:${i*40}px;height:${h}px;background:var(${up?'--up':'--down'})"></i>`;}).join('');
   const n={v:0},tl=GS.timeline({paused:true});
   tl.from('#hm1 .hm-cdl i',{scaleY:0,duration:.7,ease:'expo.out',stagger:.07},.2)
     .to('#hm1 .hm-line path',{strokeDashoffset:0,duration:2.6,ease:'power2.inOut'},.6)
     .to(n,{v:2.41,duration:2.4,ease:'power3.out',onUpdate:()=>{const e=D.getElementById('hmPct');if(e)e.textContent='+'+n.v.toFixed(2)+'%';}},1)
     .fromTo('#hm1 .hm-chips',{x:1600},{x:-1500,duration:7,ease:'none'},0)
     .from('#hm1 .hm-pct',{y:30,opacity:0,duration:.8,ease:'expo.out'},.8)
     .to('#hm1 > *:not(.hm-chips)',{opacity:0,y:-16,duration:.5,ease:'power2.in'},6.35).set({},{},7);
   T['hf-mkt']=tl;}
  // práctica
  {const v={a:10000},tl=GS.timeline({paused:true});
   tl.to('#hpMe',{width:'48%',duration:1,ease:'power3.out'},.3).to('#hpBot',{width:'55%',duration:1,ease:'power3.out'},.4)
     .to('#hpMe',{width:'72%',duration:1.2,ease:'power3.inOut'},1.6).to('#hpBot',{width:'61%',duration:1.2,ease:'power3.inOut'},1.7)
     .to('#hpMe',{width:'86%',duration:1,ease:'power3.out'},3.2).to('#hpBot',{width:'70%',duration:1,ease:'power3.out'},3.2)
     .to(v,{a:10482,duration:3.8,ease:'power2.out',onUpdate:()=>{const e=D.getElementById('hpVal');if(e)e.textContent='$'+Math.round(v.a).toLocaleString('en-US');}},.4)
     .fromTo('#hp1 .hp-coins i',{y:-420,opacity:0},{y:(i)=>200-i*24,opacity:1,duration:.55,ease:'power3.in',stagger:.32},.5)
     .from('#hp1 .hp-val',{y:30,opacity:0,duration:.8,ease:'expo.out'},.2)
     .to('#hp1 > *',{opacity:0,y:-16,duration:.5,ease:'power2.in'},6.35).set({},{},7);
   T['hf-play']=tl;}
  // herramientas
  {const v={a:0},tl=GS.timeline({paused:true});
   tl.to('#ht1 .ht-ln',{strokeDashoffset:0,duration:3,ease:'power2.inOut'},.3).to('#ht1 .ht-area',{opacity:1,duration:1.4,ease:'power2.out'},1.6)
     .from('#ht1 .ht-years span',{y:14,opacity:0,stagger:.22,duration:.4,ease:'power3.out'},.4)
     .fromTo('#ht1 .ht-pad i',{scale:1},{keyframes:[{scale:.86,duration:.12},{scale:1,duration:.25}],stagger:{each:.28,from:'random'}},.2)
     .to(v,{a:20504,duration:3.2,ease:'power3.out',onUpdate:()=>{const e=D.getElementById('htVal');if(e)e.textContent='$'+Math.round(v.a).toLocaleString('en-US');}},.6)
     .from('#ht1 .ht-val',{y:30,opacity:0,duration:.8,ease:'expo.out'},.4)
     .to('#ht1 > *',{opacity:0,y:-16,duration:.5,ease:'power2.in'},6.35).set({},{},7);
   T['hf-tools']=tl;}
  // aprende
  {const tl=GS.timeline({paused:true}),c='#hl1 .hl-card';
   tl.from(c,{y:60,opacity:0,duration:.6,ease:'expo.out',stagger:.08},.1)
     .to(c,{x:(i)=>(i-1.5)*250,rotation:(i)=>(i-1.5)*5,duration:1,ease:'expo.inOut',stagger:.05},.8)
     .to(c,{rotationY:180,duration:.8,ease:'power3.inOut',stagger:.35},2.1)
     .to('#hl1 .hl-check circle',{strokeDashoffset:0,duration:.8,ease:'power2.inOut'},4.1).to('#hl1 .hl-check path',{strokeDashoffset:0,duration:.5,ease:'power2.out'},4.6)
     .to('#hl1 > *',{opacity:0,y:-16,duration:.5,ease:'power2.in'},6.35).set({},{},7);
   T['hf-learn']=tl;}
  // asesor (dos clips en secuencia)
  {const ans='Empieza con poco y con algo amplio, como un ETF del S&P 500. Practica aquí primero.',st={n:0},tl=GS.timeline({paused:true});
   tl.from('#hc1 .hc-q',{x:60,opacity:0,duration:.6,ease:'expo.out'},.15).from('#hc1 .hc-typing',{y:20,opacity:0,duration:.5,ease:'expo.out'},.9)
     .to('#hc1 .hc-typing i',{y:-8,duration:.3,ease:'power1.inOut',yoyo:true,repeat:5,stagger:.12},1.2)
     .to(st,{n:ans.length,duration:2.4,ease:'none',onUpdate:()=>{const e=D.getElementById('hcA');if(e)e.textContent=ans.slice(0,Math.round(st.n));}},3.3)
     .to('#hc2 > *',{opacity:0,y:-12,duration:.4,ease:'power2.in'},6.3).set({},{},6.8);
   T['hf-chat']=tl;}
}
/* motor mínimo: escala el escenario, alterna clips según el tiempo, reproduce en bucle solo cuando se ve */
function hfRun(){$$('.hf[data-composition-id]').forEach(root=>{const id=root.dataset.compositionId,W=+root.dataset.width,H=+root.dataset.height,stage=root.querySelector('.hf-stage'),tl=window.__timelines[id];
  stage.style.width=W+'px';stage.style.height=H+'px';
  const fitS=()=>{const s=root.clientWidth/W;stage.style.transform=`scale(${s})`;root.style.height=H*s+'px';};fitS();new ResizeObserver(fitS).observe(root);
  if(!tl)return;const clips=[...root.querySelectorAll('.clip')].map(el=>({el,s:+el.dataset.start,e:+el.dataset.start+ +el.dataset.duration}));
  const vis=t=>clips.forEach(c=>{const v=t>=c.s&&t<c.e;if(c.el._v!==v){c.el.style.visibility=v?'visible':'hidden';c.el._v=v;}});
  tl.eventCallback('onUpdate',()=>vis(tl.time()));tl.eventCallback('onRepeat',()=>vis(0));tl.repeat(-1);
  if(RM){tl.pause(4.5);vis(4.5);return;}vis(0);
  new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?tl.play():tl.pause()),{threshold:.2}).observe(root);});}

/* ---------- Remotion: fondo de la bienvenida y cartera de muestra ---------- */
let gateLoop=null,planLoop=null;
function loopsMount(){if(!window.LCLoop)return;
  gateLoop=LCLoop.mount($('#gLoopIn'),'gate',remPal(),true);planLoop=LCLoop.mount($('#planLoop'),'plan',remPal());
  setTimeout(()=>{if(!GATE.classList.contains('out'))gateLoop.play();},60);
  new IntersectionObserver(es=>es.forEach(e=>{if(RM){planLoop.seek(150);return;}e.isIntersecting?planLoop.play():planLoop.pause();}),{threshold:.25}).observe($('#planLoop'));}
const _gc9=gateClose;gateClose=function(t){document.body.classList.remove('gated');try{STR&&STR.refresh();}catch(e){}_gc9(t);setTimeout(()=>gateLoop&&gateLoop.pause(),700);};
const _go9=gateOpen;gateOpen=function(){_go9();gateLoop&&gateLoop.play();};
gateDraw=function(){};

/* ---------- animaciones con scroll en toda la página ---------- */
function splitWords(h){if(h._split)return;h._split=1;const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.appendChild(document.createTextNode(w));return;}const o=document.createElement('span');o.className='w';const i=document.createElement('span');i.className='wi';i.textContent=w;o.appendChild(i);f.appendChild(o);});c.replaceWith(f);}else if(c.nodeType===1&&c.tagName!=='BR')walk(c);});};walk(h);}
function scrollAnims(){if(!GS||!STR||RM)return;
  GS.to('#pbar',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.3}});
  const below=el=>el.getBoundingClientRect().top>innerHeight*.95;
  $$('.sh h2').forEach(h=>{splitWords(h);const ws=h.querySelectorAll('.wi'),p=h.parentElement.querySelector('p');
    if(below(h)){GS.set(ws,{yPercent:110,rotate:3});if(p)GS.set(p,{y:24,opacity:0});
      STR.create({trigger:h,start:'top 88%',once:true,onEnter:()=>{GS.to(ws,{yPercent:0,rotate:0,duration:1,ease:'expo.out',stagger:.07});if(p)GS.to(p,{y:0,opacity:1,duration:.9,ease:'expo.out',delay:.25});}});}
    GS.to(h.closest('.sh'),{yPercent:-10,ease:'none',scrollTrigger:{trigger:h.closest('.sh'),start:'top bottom',end:'bottom top',scrub:true}});});
  const kids='.trow,.mi,.hb2,.ach,.kpi,.nw,.qopt,.dia,.legend span';
  const items=$$('.panel:not(.tpane), .gc, .facts > div, .term, .hf, .planloop, footer.foot > *').filter(below);
  GS.set(items,{opacity:0,y:56,scale:.97,filter:'blur(8px)'});
  STR.batch(items,{start:'top 92%',once:true,onEnter:b=>{GS.to(b,{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:1,ease:'expo.out',stagger:.09,clearProps:'transform,filter'});
    b.forEach(p=>{const k=p.querySelectorAll(kids);if(k.length)GS.from(k,{x:-14,opacity:0,duration:.6,ease:'power3.out',stagger:.035,delay:.2,clearProps:'transform,opacity'});});}});
  STR.create({trigger:'#mercado',start:'top 70%',onEnter:()=>{drawIn=0;}});
  STR.create({trigger:'.facts',start:'top 85%',once:true,onEnter:()=>GS.from('.facts b',{scale:.6,opacity:0,duration:1.1,ease:'expo.out',stagger:.12})});
  // botones con imán (solo con mouse)
  if(matchMedia('(hover:hover) and (pointer:fine)').matches)$$('.cta,.navcta,.btn.solid').forEach(b=>{const qx=GS.quickTo(b,'x',{duration:.4,ease:'power3.out'}),qy=GS.quickTo(b,'y',{duration:.4,ease:'power3.out'});
    b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();qx((e.clientX-r.left-r.width/2)*.18);qy((e.clientY-r.top-r.height/2)*.25);});b.addEventListener('pointerleave',()=>{qx(0);qy(0);});});
  document.fonts&&document.fonts.ready.then(()=>STR.refresh());}

/* ---------- entradas animadas al cambiar de herramienta y al abrir hojas ---------- */
const _tool9=tool;tool=function(t){_tool9(t);if(!GS||RM)return;const p=$('#t-'+t);if(p)GS.from(p.querySelectorAll('h3,.note,.l,.f,.seg,.btn,.kpi,canvas,.ring,.fxout,.habit .hb,.hout > div,.pl'),{y:18,opacity:0,duration:.6,ease:'expo.out',stagger:.025,clearProps:'transform,opacity'});};
const _os9=openSheet;openSheet=function(h,t){_os9(h,t);if(!GS||RM)return;GS.from('#sheetBody > *, #sheetBody .stepin > *',{y:22,opacity:0,duration:.6,ease:'expo.out',stagger:.04,delay:.12,clearProps:'transform,opacity'});};
const _om9=openMenu;openMenu=function(){_om9();if(!GS||RM)return;GS.from('#menu .mhead, #menu .mcol h4, #menu .mi2, #menu .mfoot .btn',{y:12,opacity:0,duration:.45,ease:'power3.out',stagger:.015,clearProps:'transform,opacity'});};

hfBuild();hfRun();loopsMount();scrollAnims();
const _ap9=applyTheme;applyTheme=function(){_ap9();if(window.LCLoop){LCLoop.mount($('#gLoopIn'),'gate',remPal(),!GATE.classList.contains('out'));LCLoop.mount($('#planLoop'),'plan',remPal());}};

/* ===================== V10: fondo en movimiento ===================== */
const GUIL=(()=>{const c=document.createElement('canvas'),S=1000;c.width=c.height=S;const x=c.getContext('2d');let col='';
  return {get(){if(col!==TH.guil){col=TH.guil;x.clearRect(0,0,S,S);x.strokeStyle=TH.guil;x.lineWidth=1.2;for(let j=0;j<14;j++)band(x,S/2,S/2,S*.48,13,.2,j*Math.PI*2/14,1);for(let j=0;j<10;j++)band(x,S/2,S/2,S*.31,21,.16,j*Math.PI*2/10,1);
    x.strokeStyle=TH.gold;x.globalAlpha=.5;x.beginPath();x.arc(S/2,S/2,S*.17,0,7);x.stroke();x.globalAlpha=1;}return c;}};})();
function spinner(cv,o){let raf=0;const loop=t=>{const F=fit(cv);if(F){const {x,W,H}=F,img=GUIL.get(),s=t/1000;x.clearRect(0,0,W,H);
    const R=Math.max(W,H)*o.scale*(1+Math.sin(s*.4)*.05),cx=W/2+Math.sin(s*.13)*W*.04,cy=H*o.cy+Math.cos(s*.11)*H*.03;
    x.save();x.globalAlpha=o.alpha;x.translate(cx,cy);x.rotate(s*o.speed);x.drawImage(img,-R/2,-R/2,R,R);x.rotate(-s*o.speed*2.3);const r2=R*.58;x.drawImage(img,-r2/2,-r2/2,r2,r2);x.restore();
    if(o.far){x.save();x.globalAlpha=o.alpha*.6;x.translate(W*.12,H*.9);x.rotate(-s*o.speed*.8);const r3=R*.5;x.drawImage(img,-r3/2,-r3/2,r3,r3);x.restore();}}
    raf=requestAnimationFrame(loop);};
  return {start(){if(!raf)raf=requestAnimationFrame(loop);},stop(){cancelAnimationFrame(raf);raf=0;}};}
const gSpin=spinner($('#gros'),{scale:1.15,cy:.42,speed:.12,alpha:.9,far:true}),mSpin=spinner($('#mBg'),{scale:1.1,cy:.35,speed:.18,alpha:.55});
if(!GATE.classList.contains('out'))gSpin.start();
const _gc10=gateClose;gateClose=function(t){_gc10(t);setTimeout(()=>gSpin.stop(),750);};
const _go10=gateOpen;gateOpen=function(){_go10();gSpin.start();gateLoop&&gateLoop.play();};
const _om10=openMenu;openMenu=function(){_om10();mSpin.start();};
const _cm10=closeMenu;closeMenu=function(b){_cm10(b);setTimeout(()=>{if(!menuOpen())mSpin.stop();},300);};

/* ===================== V11: modo profesional ===================== */
TOOLS.push('mc','reb','fee');
let LEARN=store.get('learnMode',false);
function applyMode(){document.body.classList.toggle('pro',!LEARN);const b=$('#mMode');if(b)b.textContent=LEARN?'Modo aprendizaje: activado':'Modo aprendizaje: desactivado';
  if(!LEARN){const cur=TOOLS.map(k=>$('#t-'+k)).find(e=>e&&!e.classList.contains('hidden'));if(cur&&(cur.id==='t-habit'||cur.id==='t-jar'))tool('calc');}
  setTimeout(()=>window.ScrollTrigger&&ScrollTrigger.refresh(),50);}
/* sin confeti, sonidos ni niveles en modo profesional */
{const b0=FX.burst;FX.burst=(...a)=>{if(LEARN)b0(...a);};}
beep=(f=>function(...a){if(LEARN)f(...a);})(beep);
levelUp=(f=>function(...a){if(LEARN)f(...a);})(levelUp);
toast=(f=>function(m,o){if(!LEARN&&typeof m==='string'&&(/^(Logro desbloqueado|Reto cumplido|Vas \d+% de tu meta|¡Pasaste a Lucio Bot)/.test(m)||(o&&o.action&&o.action.label==='Operar')))return null;return f(m,o);})(toast);
/* elementos de aprendizaje y juego */
['#lvl','.panel.duel','#mis','#achs','#deck','#game','#triv','#openStory','#t-habit','#t-jar','#tnav [data-t="habit"]','#tnav [data-t="jar"]','.hf[data-composition-id="hf-play"]','.hf[data-composition-id="hf-learn"]'].forEach(sel=>{const e=$(sel);if(!e)return;(e.closest('.panel')&&!e.classList.contains('panel')&&!/t-|tnav|openStory|lvl|hf/.test(sel)?e.closest('.panel'):e).classList.add('fun');});
$$('#menu .mi2').forEach(b=>{if(/Tú contra Lucio Bot|Nivel y retos|Tu resumen|El costo del antojo|Alcancía|Descubre acciones|¿Sube o baja|Trivia/.test(b.textContent))b.classList.add('fun');});
$$('#gQuick .gq').forEach(q=>{const t=q.querySelector('b');if(t&&t.textContent==='Aprender jugando'){t.textContent='Aprender';q.querySelector('small').textContent='Conceptos, fichas y glosario';}if(t&&t.textContent==='Practicar')q.querySelector('small').textContent='Simulador con $10,000 virtuales';});
{const mf=$('#menu .mfoot');const b=document.createElement('button');b.className='btn';b.id='mMode';b.onclick=()=>{LEARN=!LEARN;store.set('learnMode',LEARN);applyMode();toast(LEARN?'Modo aprendizaje activado: juegos, retos y niveles visibles':'Modo profesional: solo herramientas de inversión',ic('check','',false));};mf.appendChild(b);}

/* carrusel con herramientas profesionales */
{const PROG=[['Planificación','Proyección Monte Carlo.','2,000 escenarios para ver el rango probable de tu inversión y la probabilidad de llegar a tu meta.','volatilidad',1,()=>{go('tools');tool('mc');}],
  ['Cartera','Rebalanceo.','Calcula qué comprar o vender para volver a tu asignación objetivo.','diversificar',0,()=>{go('tools');tool('reb');}],
  ['Costos','Impacto de comisiones.','Compara cuánto te cuesta un fondo caro frente a un ETF de bajo costo en 25 años.','dividendo',1,()=>{go('tools');tool('fee');}],
  ['Riesgo','Pruebas de estrés.','Mide cuánto perdería tu cartera en caídas como 2008, 2020 o 2022.','bajista',0,()=>{go('play');setTimeout(()=>$('#stress').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['Disciplina','Inversión periódica (DCA).','Automatiza compras fijas y observa cómo se promedia tu costo.','clock',1,()=>{go('play');setTimeout(()=>$('#pilot').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),450);}],
  ['IA','Asignación con IA.','Describe tu objetivo y recibe una cartera diversificada con su análisis de riesgo.','accion',0,()=>{go('home');setTimeout(()=>$('#q').focus({preventScroll:true}),700);}],
  ['Ejecución','Del análisis a tu bróker.','Cuando decidas invertir, enlaces a brókers reales para operar.','broker',1,()=>openReal('VOO')]];
 $('#gtrack').innerHTML=PROG.map(([k,h,p,i,d],n)=>`<button class="gc${d?' dk':''}" data-n="${n}"><span class="gk">${k}</span><h3>${h}</h3><span class="gp">${p}</span><span class="gv">${ic(i,'',false)}</span><span class="gplus" aria-hidden="true">${ic('plus','',false)}</span></button>`).join('');
 $('#gdots').innerHTML=PROG.map(()=>'<i></i>').join('');
 $$('#gtrack .gc').forEach(c=>{c.onclick=()=>PROG[+c.dataset.n][5]();c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');});});galUpd();}

/* ---------- pruebas de estrés ---------- */
const STRESS=[['2008','Crisis financiera 2008','S&P 500: −57% (oct. 2007 – mar. 2009)',-.57],['2020','Pandemia 2020','S&P 500: −34% (feb. – mar. 2020)',-.34],['2022','Alza de tasas 2022','S&P 500: −25% (ene. – oct. 2022)',-.25],['rally','Recuperación fuerte','Rebote de +20% en el índice',.2]];
const betaOf=s=>Math.min(2,.45+S[s].vol*.6);
function stressRender(){const E=Object.entries(PV.h),inv=E.reduce((a,[s,h])=>a+h.n*price(s),0),tot=pvValue();
  $('#stRows').innerHTML=!E.length?'<p class="note">Compra algunos activos en el simulador para medir cuánto perdería tu cartera en cada escenario.</p>':
   STRESS.filter(x=>x[3]<0).map(([id,n,d,dd])=>{const loss=E.reduce((a,[s,h])=>a+h.n*price(s)*Math.max(-.95,dd*betaOf(s)),0),pct=loss/tot*100;
    return `<div class="strow"><div><b>${n}</b><small>${d}</small></div><div class="stv"><b style="color:var(--down)">−${usd(-loss)}</b><small>${pct.toFixed(1)}% de tu cartera</small></div><div class="stbar"><i style="width:${Math.min(100,-pct)}%"></i></div></div>`;}).join('');
  $('#stNote').textContent=E.length?`Estimación simple: aplica la caída histórica del índice a cada activo según qué tanto se mueve frente al mercado (beta aproximada). El efectivo (${usd(PV.cash)}) no cae.`:'';}
$('#stressGo').onclick=()=>{const k=$('#stressSel').value,sc=STRESS.find(x=>x[0]===k);if(!sc)return;
  for(const s in S)S[s].shock+=sc[3]*100*.25*(s in PV.h||tradable.includes(s)?betaOf(s):1)*(.85+Math.random()*.3);
  const f=$('#flash');f.style.background=sc[3]<0?DN:UP;f.classList.remove('go');void f.offsetWidth;f.classList.add('go');
  NW.unshift({s:'Mercado',t:`Escenario aplicado: ${sc[1]} (versión acelerada y atenuada)`,d:sc[3]<0?-1:1,time:new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})});NW=NW.slice(0,5);renderNews();
  toast(`Escenario "${sc[1]}" aplicado al mercado simulado`,ic(sc[3]<0?'bajista':'alcista','',false));if(sc[3]<0)crashWatch={v0:pvValue(),t:0};};

/* ---------- Monte Carlo ---------- */
const MCP={c:[4.5,7],m:[6.5,11],a:[8.5,16]};
$$('#mcP button').forEach(b=>b.addEventListener('click',()=>{$$('#mcP button').forEach(x=>x.classList.toggle('act',x===b));const [r,v]=MCP[b.dataset.v];$('#mcR').value=r;$('#mcV').value=v;mcRun();}));
let mcT=0,mcRes=null;
function randn(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function mcRun(){clearTimeout(mcT);mcT=setTimeout(()=>{const I=Math.max(0,+$('#mcI').value||0),M=Math.max(0,+$('#mcM').value||0),R=(+$('#mcR').value||0)/100,V=Math.max(0,(+$('#mcV').value||0)/100),Y=Math.max(1,Math.min(40,Math.round(+$('#mcY').value||1))),G=+$('#mcG').value||0,inf=$('#mcInf').checked;
  const N=2000,mu=Math.log(1+R)/12-V*V/24,sg=V/Math.sqrt(12),yr=Array.from({length:Y+1},()=>new Float64Array(N));
  for(let k=0;k<N;k++){let v=I;yr[0][k]=I;for(let m=1;m<=Y*12;m++){v=v*Math.exp(mu+sg*randn())+M;if(m%12===0)yr[m/12][k]=inf?v/Math.pow(1.03,m/12):v;}}
  const q=(a,p)=>a[Math.min(a.length-1,Math.floor(p*a.length))];
  const P=yr.map(a=>{const s=Array.from(a).sort((x,y)=>x-y);return [q(s,.1),q(s,.25),q(s,.5),q(s,.75),q(s,.9)];});
  const last=Array.from(yr[Y]),prob=G?last.filter(x=>x>=G).length/N:null,put=I+M*12*Y;
  mcRes={P,Y,G,put};mcDraw(0);
  countUp($('#mcP10'),P[Y][0],usd,700);countUp($('#mcP50'),P[Y][2],usd,700);countUp($('#mcP90'),P[Y][4],usd,700);
  $('#mcProb').textContent=prob==null?'—':Math.round(prob*100)+'%';$('#mcPut').textContent=usd(put);},120);}
function mcDraw(){const F=fit($('#mcC'));if(!F||!mcRes)return;const {x,W,H}=F,{P,Y,G,put}=mcRes,mx=Math.max(P[Y][4],G||0)*1.05,X=i=>36+i/Y*(W-46),Yv=v=>H-22-v/mx*(H-34);
  x.clearRect(0,0,W,H);x.font='12px IBM Plex Mono, monospace';x.fillStyle=TH.ink2;x.strokeStyle=TH.line;x.lineWidth=1;
  for(let g=0;g<=4;g++){const v=mx*g/4,yy=Yv(v);x.beginPath();x.moveTo(36,yy);x.lineTo(W-10,yy);x.stroke();x.fillText(v>=1e6?(v/1e6).toFixed(1)+'M':Math.round(v/1000)+'k',0,yy+4);}
  for(let i=0;i<=Y;i+=Math.max(1,Math.round(Y/6)))x.fillText(i+'a',X(i)-6,H-4);
  const band=(a,b,col)=>{x.beginPath();P.forEach((p,i)=>i?x.lineTo(X(i),Yv(p[a])):x.moveTo(X(i),Yv(p[a])));for(let i=Y;i>=0;i--)x.lineTo(X(i),Yv(P[i][b]));x.closePath();x.fillStyle=col;x.fill();};
  band(0,4,TH.accent+'22');band(1,3,TH.accent+'40');
  x.beginPath();P.forEach((p,i)=>i?x.lineTo(X(i),Yv(p[2])):x.moveTo(X(i),Yv(p[2])));x.strokeStyle=TH.accent;x.lineWidth=2.5;x.stroke();
  const I=P[0][2],step=(put-I)/Y;x.setLineDash([4,4]);x.strokeStyle=TH.ink3;x.lineWidth=1.5;x.beginPath();for(let i=0;i<=Y;i++){const v=I+step*i;i?x.lineTo(X(i),Yv(v)):x.moveTo(X(i),Yv(v));}x.stroke();
  if(G){x.strokeStyle=TH.up;x.beginPath();x.moveTo(36,Yv(G));x.lineTo(W-10,Yv(G));x.stroke();x.setLineDash([]);x.fillStyle=TH.up;x.fillText('meta',W-46,Yv(G)-5);}x.setLineDash([]);}
['#mcI','#mcM','#mcR','#mcV','#mcY','#mcG','#mcInf'].forEach(s=>$(s).addEventListener('input',mcRun));

/* ---------- rebalanceo ---------- */
const REBX=[{t:'VOO',v:6200,p:60,ex:1},{t:'BND',v:1800,p:25,ex:1},{t:'VXUS',v:2000,p:15,ex:1}];
let REB=store.get('reb',null)||REBX.map(r=>({...r}));let rebMode='full';
$$('#rebM button').forEach(b=>b.addEventListener('click',()=>{rebMode=b.dataset.v;$$('#rebM button').forEach(x=>x.classList.toggle('act',x===b));rebCalc();}));
function rebRows(){$('#rebT tbody').innerHTML=REB.map((r,i)=>`<tr><td><input class="f mono" data-i="${i}" data-k="t" value="${esc(r.t)}" maxlength="10" aria-label="Activo ${i+1}" style="text-transform:uppercase">${r.ex?'<small class="exm">ejemplo</small>':''}</td><td><input class="f" data-i="${i}" data-k="v" type="number" inputmode="decimal" value="${r.v}" aria-label="Valor actual"></td><td><input class="f" data-i="${i}" data-k="p" type="number" inputmode="decimal" value="${r.p}" aria-label="Porcentaje objetivo"></td><td class="mono" data-o="a${i}"></td><td data-o="o${i}"></td><td><button class="dx" data-rm="${i}" aria-label="Quitar">${ic('x','',false)}</button></td></tr>`).join('');
  $$('#rebT input').forEach(n=>n.addEventListener('input',()=>{const r=REB[+n.dataset.i];r[n.dataset.k]=n.dataset.k==='t'?n.value.toUpperCase():+n.value||0;r.ex=0;store.set('reb',REB);rebCalc();}));
  $$('#rebT [data-rm]').forEach(b=>b.onclick=()=>{REB.splice(+b.dataset.rm,1);store.set('reb',REB);rebRows();});rebCalc();}
function rebCalc(){const C=Math.max(0,+$('#rebC').value||0),cur=REB.reduce((a,r)=>a+(+r.v||0),0),tot=cur+C,sp=REB.reduce((a,r)=>a+(+r.p||0),0);
  let ops=REB.map(r=>tot*(r.p||0)/100-(r.v||0));
  if(rebMode==='buy'){const need=ops.map(d=>Math.max(0,d)),sn=need.reduce((a,b)=>a+b,0);ops=need.map(d=>sn?d/sn*C:0);}
  REB.forEach((r,i)=>{const a=$(`[data-o="a${i}"]`),o=$(`[data-o="o${i}"]`);if(!a)return;a.textContent=cur?((r.v||0)/cur*100).toFixed(1)+'%':'—';const d=ops[i];
    o.innerHTML=Math.abs(d)<1?'<span class="note" style="margin:0">Mantener</span>':`<b style="color:var(${d>0?'--up':'--down'})">${d>0?'Comprar':'Vender'} ${usd(Math.abs(d))}</b>`;});
  $('#rebS').innerHTML=`<div class="kpis"><div class="kpi"><small>Valor actual</small><b>${usd(cur)}</b></div><div class="kpi"><small>Después del aporte</small><b>${usd(tot)}</b></div><div class="kpi"><small>Suma de objetivos</small><b style="color:var(${Math.abs(sp-100)<.01?'--up':'--down'})">${sp.toFixed(1)}%</b></div></div>${Math.abs(sp-100)>=.01?'<p class="aerr">Los porcentajes objetivo deben sumar 100%.</p>':''}${rebMode==='buy'&&C===0?'<p class="note">Con "Solo comprar" necesitas indicar un nuevo aporte.</p>':''}`;}
$('#rebAdd').onclick=()=>{REB.push({t:'',v:0,p:0});store.set('reb',REB);rebRows();const ins=$$('#rebT tbody tr:last-child input');ins[0]&&ins[0].focus();};
$('#rebEx').onclick=()=>{REB=REBX.map(r=>({...r}));store.set('reb',REB);rebRows();};
$('#rebC').addEventListener('input',rebCalc);

/* ---------- comisiones ---------- */
function fee(){const I=+$('#feI').value||0,M=+$('#feM').value||0,R=(+$('#feR').value||0)/100,Y=Math.max(1,Math.min(50,Math.round(+$('#feY').value||1))),A=(+$('#feA').value||0)/100,B=(+$('#feB').value||0)/100;
  const path=f=>{let v=I;const out=[I];for(let m=1;m<=Y*12;m++){v=v*(1+(R-f)/12)+M;if(m%12===0)out.push(v);}return out;};
  const a=path(A),b=path(B),d=a[Y]-b[Y];countUp($('#feVA'),a[Y],usd,600);countUp($('#feVB'),b[Y],usd,600);countUp($('#feD'),d,usd,600);
  $('#feL').innerHTML=`En ${Y} años, la comisión B te cuesta <b>${usd(d)}</b>: el <b>${(d/a[Y]*100).toFixed(0)}%</b> de lo que podrías haber acumulado.`;
  const F=fit($('#feC'));if(!F)return;const {x,W,H}=F,mx=a[Y]*1.05,X=i=>36+i/Y*(W-46),Yv=v=>H-22-v/mx*(H-34);x.clearRect(0,0,W,H);x.font='12px IBM Plex Mono, monospace';x.fillStyle=TH.ink2;x.strokeStyle=TH.line;
  for(let g=0;g<=4;g++){const v=mx*g/4,yy=Yv(v);x.beginPath();x.moveTo(36,yy);x.lineTo(W-10,yy);x.stroke();x.fillText(v>=1e6?(v/1e6).toFixed(1)+'M':Math.round(v/1000)+'k',0,yy+4);}
  x.beginPath();a.forEach((v,i)=>{x.lineTo(X(i),Yv(v));});b.slice().reverse().forEach((v,i)=>x.lineTo(X(Y-i),Yv(v)));x.closePath();x.fillStyle=TH.down+'22';x.fill();
  [[a,TH.up,'A'],[b,TH.down,'B']].forEach(([arr,c,l])=>{x.beginPath();arr.forEach((v,i)=>i?x.lineTo(X(i),Yv(v)):x.moveTo(X(i),Yv(v)));x.strokeStyle=c;x.lineWidth=2.5;x.stroke();x.fillStyle=c;x.fillText(l,X(Y)-14,Yv(arr[Y])-6);});}
['#feI','#feM','#feR','#feY','#feA','#feB'].forEach(s=>$(s).addEventListener('input',fee));

const _tool11=tool;tool=function(t){_tool11(t);if(t==='mc'){mcRun();}if(t==='reb')rebCalc();if(t==='fee')fee();};
setInterval(()=>{if(on('play')&&tick%3===0)stressRender();},1000);
addEventListener('resize',()=>{if(on('tools')){mcDraw();fee();}});
const _ap11=applyTheme;applyTheme=function(){_ap11();mcDraw();fee();};
applyMode();rebRows();stressRender();mcRun();fee();

/* ===================== V12: una sección a la vez ===================== */
const VIEWS={inicio:['story','hub'],home:['plan'],mkt:['mercado'],play:['practica'],tools:['herramientas'],learn:['aprende'],chat:['asesor']};
const V2ID={inicio:'inicio',home:'plan',mkt:'mercado',play:'practica',tools:'herramientas',learn:'aprende',chat:'asesor'};
const ID2V=Object.fromEntries(Object.entries(V2ID).map(([v,i])=>[i,v]));
const VTITLE={home:'Tu plan',mkt:'Mercado',play:'Simulador',tools:'Planificación',learn:'Aprendizaje',chat:'Asistente'};
let VIEW=null,hashLock=false;
$('#gal').classList.add('hidden');
/* botón para volver en cada sección */
Object.entries(VIEWS).forEach(([v,ids])=>{if(v==='inicio')return;const sec=document.getElementById(ids[0]);const b=document.createElement('div');b.className='backbar';
  b.innerHTML=`<button class="backb" aria-label="Volver al inicio">${ic('right','',false)}<span>Inicio</span></button><span class="crumb">${VTITLE[v]}</span>`;sec.prepend(b);b.querySelector('button').onclick=()=>setView('inicio');});
function setView(v,opt={}){if(!VIEWS[v])v='inicio';const changed=VIEW!==v;VIEW=v;
  const show=new Set(VIEWS[v]);Object.values(VIEWS).flat().forEach(id=>{const e=document.getElementById(id);if(e)e.classList.toggle('vhide',!show.has(id));});
  page=v;markNav();
  if(!opt.keepScroll)scrollTo({top:0,behavior:'auto'});
  if(!opt.noHash){hashLock=true;if(location.hash!=='#'+V2ID[v])location.hash=V2ID[v];setTimeout(()=>hashLock=false,0);}
  if(changed&&window.gsap&&!RM){const secs=VIEWS[v].map(id=>document.getElementById(id));
    secs.forEach(sec=>{gsap.fromTo(sec,{opacity:0,y:18},{opacity:1,y:0,duration:.45,ease:'expo.out',clearProps:'transform,opacity'});
      const items=sec.querySelectorAll('.panel:not(.tpane), .hf, .planloop, .term, .htile, .sh p, .backbar');gsap.fromTo(items,{opacity:0,y:26},{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.6,ease:'expo.out',stagger:.04,delay:.05,overwrite:true,clearProps:'transform,filter'});
      const ws=sec.querySelectorAll('.sh h2 .wi');if(ws.length)gsap.fromTo(ws,{yPercent:110,rotate:3},{yPercent:0,rotate:0,duration:.8,ease:'expo.out',stagger:.05,overwrite:true});});}
  else Object.values(VIEWS).flat().forEach(id=>{const s=document.getElementById(id);s&&s.querySelectorAll('.panel,.hf,.planloop,.term,.sh p').forEach(e=>{e.style.opacity='';e.style.transform='';e.style.filter='';});});
  setTimeout(()=>{window.ScrollTrigger&&ScrollTrigger.refresh();resizeAll();if(v==='inicio'){stLast=-1;drawRos2();storyFrame();}},60);}
go=function(p){if(sh.classList.contains('open'))closeSheet();setView(p);};
addEventListener('hashchange',()=>{if(hashLock)return;const v=ID2V[location.hash.slice(1)];if(v&&v!==VIEW)setView(v,{noHash:true});});
/* enlaces de la barra superior: agregar Inicio */
['#nav','#nav2'].forEach(n=>{const a=document.createElement('a');a.href='#inicio';a.dataset.p='inicio';a.textContent='Inicio';a.addEventListener('click',e=>{e.preventDefault();setView('inicio');});$(n).prepend(a);});
/* panel de elección */
$$('#hub .htile').forEach(t=>t.addEventListener('click',()=>setView(t.dataset.v)));
$('#stMore').textContent='Ver todo';$('#stMore').onclick=()=>$('#hub').scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});

/* ---------- simulador por pestañas ---------- */
{const tag=(sel,t)=>{const e=$(sel);const p=e&&(e.classList.contains('panel')?e:e.closest('.panel'));if(p)p.dataset.pt=t;};
 tag('#pvTot','res');tag('#pos','res');tag('.panel.duel','res');tag('#mis','res');tag('#achs','res');
 tag('#mkt','op');tag('#ord','op');tag('#pilot','op');tag('#stress','risk');tag('#health','risk');tag('#diary','log');tag('#hist','log');
 const bar=document.createElement('div');bar.className='seg ptabs';bar.id='ptabs';bar.setAttribute('role','tablist');
 bar.innerHTML=[['res','Resumen'],['op','Operar'],['risk','Riesgo'],['log','Registro']].map(([k,l],i)=>`<button role="tab" data-pt="${k}" class="${i?'':'act'}">${l}</button>`).join('');
 const grid=$('#practica .grid2');grid.before(bar);thumbify(bar,'s');
 const pt=k=>{$$('#ptabs button').forEach(b=>{const on=b.dataset.pt===k;b.classList.toggle('act',on);b.setAttribute('aria-selected',on);});
   const ps=$$('#practica [data-pt]').filter(p=>p.classList.contains('panel'));ps.forEach(p=>p.classList.toggle('pthide',p.dataset.pt!==k));
   if(window.gsap&&!RM)gsap.fromTo(ps.filter(p=>p.dataset.pt===k),{opacity:0,y:16},{opacity:1,y:0,duration:.45,ease:'expo.out',stagger:.05,clearProps:'transform'});
   setTimeout(()=>{renderMkt(true);renderPV();renderPos();renderOrd();pilDraw();stressRender();health();window.ScrollTrigger&&ScrollTrigger.refresh();},30);};
 $$('#ptabs button').forEach(b=>b.onclick=()=>pt(b.dataset.pt));pt('res');
 window.ptab=pt;}
/* los accesos del menú que apuntan a un panel abren su pestaña */
{const g0=go;const want={'#pilot':'op','#ord':'op','#stress':'risk','#health':'risk','#diary':'log','.duel':'res'};
 const siv=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(o){for(const [s,t] of Object.entries(want)){if(this.matches&&this.matches(s)&&this.classList.contains('pthide')){window.ptab(t);break;}}return siv.call(this,o);};}

/* ---------- presentación: más corta, más rápida y suavizada ---------- */
{const stage=$('#story .stage');const g=document.createElement('div');g.className='st-glow';g.id='stGlow';stage.prepend(g);}
let stCur=0,stTgt=0,stRaf=0;
function storyRender(p){stBar.style.width=(p*100)+'%';
  const a=eo(seg(p,0,.26));stH.style.opacity=String(1-seg(p,.06,.24));stH.style.transform=`translate3d(0,${-a*48}px,0) scale(${1-a*.1})`;
  stSub.style.opacity=String(1-seg(p,.02,.16));stHint.style.opacity=String(1-seg(p,0,.05));
  const b=eo(seg(p,0,.36)),lift=eo(seg(p,.36,1));
  stB.style.transform=`translate(-50%,-50%) translate3d(0,${(1-b)*30-lift*6}vh,0) rotateX(${(1-b)*44}deg) rotateY(${(p-.6)*10}deg) scale(${.56+b*.44+lift*.08})`;
  $('#stGlow').style.opacity=String(b*.9);stB.style.setProperty('--sh',(15+p*70)+'%');
  $('#ros2').style.transform=`translateY(-50%) rotate(${p*120}deg)`;
  const amt=Math.round(2000+eo(seg(p,.38,.86))*8000);if(amt!==stAmt){stAmt=amt;$('#stAmt').textContent='S/ '+amt.toLocaleString('en-US');}
  stL.forEach((l,i)=>{const s0=.34+i*.15,k=seg(p,s0,s0+.05)*(1-seg(p,s0+.11,s0+.15));l.style.opacity=String(i===2?seg(p,s0,s0+.05)*(1-seg(p,.76,.8)):k);l.style.transform=`translate3d(0,${(1-k)*14}px,0)`;});
  stC.classList.toggle('on',p>.82);}
function stTick(){stCur+=(stTgt-stCur)*.14;if(Math.abs(stTgt-stCur)<.0005)stCur=stTgt;storyRender(stCur);stRaf=stCur!==stTgt?requestAnimationFrame(stTick):0;}
storyFrame=function(){if(VIEW&&VIEW!=='inicio')return;const r=story.getBoundingClientRect(),total=Math.max(1,story.offsetHeight-innerHeight);stTgt=RM?1:clamp01(-r.top/total);if(RM){stCur=1;storyRender(1);return;}if(!stRaf)stRaf=requestAnimationFrame(stTick);};

/* arranque en la vista pedida */
{const v=ID2V[location.hash.slice(1)];setView(v||'inicio',{noHash:!v});}

/* kill .sh parallax */
if(window.ScrollTrigger){ScrollTrigger.getAll().forEach(t=>{const tr=t.trigger;if(tr&&tr.classList&&tr.classList.contains('sh')&&t.vars&&t.vars.scrub){t.kill(true);}});$$('.sh').forEach(e=>{e.style.transform='';});}

/* ===================== V13: empresas en vivo ===================== */
VIEWS.stocks=['empresas'];V2ID.stocks='empresas';ID2V.empresas='stocks';VTITLE.stocks='Empresas';
{const sec=$('#empresas');const b=document.createElement('div');b.className='backbar';b.innerHTML=`<button class="backb" aria-label="Volver al inicio">${ic('right','',false)}<span>Inicio</span></button><span class="crumb">Empresas</span>`;sec.prepend(b);b.querySelector('button').onclick=()=>setView('inicio');}
['#nav','#nav2'].forEach(n=>{const ref=$(n+' a[data-p="mkt"]');const a=document.createElement('a');a.href='#empresas';a.dataset.p='stocks';a.textContent='Empresas';a.addEventListener('click',e=>{e.preventDefault();setView('stocks');});ref.after(a);});
$$('#hub .htile[data-v="stocks"]').forEach(t=>t.addEventListener('click',()=>setView('stocks')));
const SECES={'Technology':'Tecnología','Finance':'Finanzas','Health Care':'Salud','Consumer Discretionary':'Consumo discrecional','Consumer Staples':'Consumo básico','Industrials':'Industria','Energy':'Energía','Utilities':'Servicios públicos','Real Estate':'Inmobiliario','Telecommunications':'Telecomunicaciones','Basic Materials':'Materiales','Miscellaneous':'Otros','Otros':'Otros'};
const MKT=window.LC_MKT||null;
const LOGO=window.LC_LOGO||null;
function coLogo(sym,big){const h=[...sym].reduce((a,c)=>a+c.charCodeAt(0),0)%360;return `<span class="cologo${big?' big':''}" style="--h:${h}">${esc(sym.slice(0,2))}${LOGO?`<img src="${LOGO}?s=${encodeURIComponent(sym)}" alt="" loading="lazy" decoding="async" onload="this.parentNode.classList.add('hasimg')" onerror="this.remove()">`:''}</span>`;}let CO=[],coAt=0,coSec='all',coSort='m',coQ='',coTimer=0,coBusy=false,coPrev={};
const fmtCap=m=>m>=1e12?'$'+(m/1e12).toFixed(2)+' B':m>=1e9?'$'+(m/1e9).toFixed(1)+' mil M':'$'+(m/1e6).toFixed(0)+' M';
const fmtVol=v=>v>=1e6?(v/1e6).toFixed(1)+' M':v>=1e3?(v/1e3).toFixed(0)+' mil':String(v||0);
const pcS=v=>v==null?'—':(v>=0?'+':'')+v.toFixed(2)+'%';
if(!MKT){$('#coWrap').innerHTML=`<div class="panel coempty"><h3>Los precios en vivo funcionan en la versión web</h3><p class="note">Dentro de Claude la página no puede conectarse a fuentes de datos externas. Abre la versión publicada para ver más de 600 empresas con precio, variación y estadísticas actualizadas.</p><div class="acts"><a class="btn solid" href="https://lucioni-capital.vercel.app/#empresas" target="_blank" rel="noopener">Abrir Lucioni Capital en la web ${ic('ext','',false)}</a></div></div>`;}
async function coLoad(force){if(!MKT||coBusy)return;coBusy=true;$('#coUpd').textContent='Actualizando…';
  try{const r=await fetch(MKT+'?list=1',{cache:'no-store'});const d=await r.json();if(!r.ok||!d.rows)throw 0;CO.forEach(x=>coPrev[x.s]=x.p);CO=d.rows;coAt=d.at;coRender();coSectors();}
  catch(e){$('#coUpd').textContent='No se pudo actualizar. Reintentamos en 30 s.';if(!CO.length)$('#coList').innerHTML='<p class="note" style="padding:20px">La fuente de datos no respondió. Intenta de nuevo en un momento.</p>';}
  finally{coBusy=false;}}
function coSectors(){const g={};CO.forEach(r=>{(g[r.sec]=g[r.sec]||[]).push(r.pc||0);});const ent=Object.entries(g).map(([k,a])=>[k,a.reduce((x,y)=>x+y,0)/a.length,a.length]).sort((a,b)=>b[2]-a[2]);
  $('#coSecs').innerHTML=`<button class="cosec${coSec==='all'?' act':''}" data-s="all"><b>Todas</b><small>${CO.length} empresas</small></button>`+ent.map(([k,avg,n])=>`<button class="cosec${coSec===k?' act':''}" data-s="${esc(k)}"><b>${SECES[k]||k}</b><small style="color:var(${avg>=0?'--up':'--down'})">${pcS(avg)} · ${n}</small></button>`).join('');
  $$('#coSecs .cosec').forEach(b=>b.onclick=()=>{coSec=b.dataset.s;coSectors();coRender();});}
function coRender(){const q=norm(coQ.trim());let rows=CO.filter(r=>(coSec==='all'||r.sec===coSec)&&(!q||norm(r.s+' '+r.n).includes(q)));
  const S={m:(a,b)=>b.m-a.m,up:(a,b)=>(b.pc||0)-(a.pc||0),dn:(a,b)=>(a.pc||0)-(b.pc||0),v:(a,b)=>(b.v||0)*(b.p||0)-(a.v||0)*(a.p||0),n:(a,b)=>a.n.localeCompare(b.n)}[coSort];rows.sort(S);
  const up=CO.filter(r=>r.pc>0).length,dn=CO.filter(r=>r.pc<0).length;
  $('#coUpd').textContent=`${rows.length} de ${CO.length} empresas · ${up} suben, ${dn} bajan · actualizado ${new Date(coAt).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})}`;
  const list=$('#coList');const html=rows.map((r,i)=>{const old=coPrev[r.s],fl=old&&old!==r.p?(r.p>old?' fu':' fd'):'';return `<button class="corow" data-s="${esc(r.s)}"><span class="corank">${i+1}</span>${coLogo(r.s)}<span class="coname"><b>${esc(r.s)}</b><small>${esc(r.n)}</small></span><span class="cosector">${SECES[r.sec]||esc(r.sec)}</span><span class="cocap">${fmtCap(r.m)}</span><span class="coprice${fl}">${r.p!=null?'$'+r.p.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):'—'}</span><span class="copc ${r.pc>=0?'u':'d'}">${pcS(r.pc)}</span></button>`;}).join('');
  list.innerHTML=html||'<p class="note" style="padding:20px">Ninguna empresa coincide con tu búsqueda.</p>';
  $$('#coList .corow').forEach(b=>b.onclick=()=>coOpen(b.dataset.s));}
$('#coQ').addEventListener('input',e=>{coQ=e.target.value;coRender();});
$('#coSort').addEventListener('change',e=>{coSort=e.target.value;coRender();});
/* ficha de empresa */
let coCur=null,coRange='1d';
const STL={PreviousClose:'Cierre anterior',TodayHighLow:'Rango del día',FiftTwoWeekHighLow:'Rango 52 semanas',MarketCap:'Capitalización',PERatio:'P/E (PER)',ForwardPE1Yr:'P/E estimado',EarningsPerShare:'Ganancia por acción',AnnualizedDividend:'Dividendo anual',Yield:'Rendimiento por dividendo',ExDividendDate:'Fecha ex-dividendo',ShareVolume:'Volumen',AverageVolume:'Volumen promedio',OneYrTarget:'Precio objetivo 1 año',Beta:'Beta',Exchange:'Bolsa',Sector:'Sector',Industry:'Industria'};
async function coOpen(sym){coCur=sym;const base=CO.find(r=>r.s===sym)||{s:sym,n:''};
  openSheet(`<div class="sh-top"><div class="cohd">${coLogo(sym,1)}<div><div class="tk">${esc(sym)}</div><div class="nm" id="coN">${esc(base.n)}</div></div></div><div class="sh-pr"><span id="coP">${base.p!=null?usd2(base.p):'—'}</span><small id="coC" style="color:var(${(base.pc||0)>=0?'--up':'--down'})">${pcS(base.pc)}</small></div></div>
    <p class="note" id="coT" style="margin-top:4px">Cargando datos…</p>
    <div class="seg" id="coR" style="margin-top:10px"><button class="act" data-r="1d">1 día</button><button data-r="1m">1 mes</button><button data-r="6m">6 meses</button><button data-r="1y">1 año</button><button data-r="5y">5 años</button></div>
    <canvas id="coCv" style="height:200px;margin-top:12px;touch-action:pan-y" aria-label="Gráfico de precio"></canvas>
    <div class="costats" id="coSt"></div>
    <div class="acts"><button class="btn solid" id="coBuy">${ic('broker','',false)} Comprar de verdad</button><button class="btn" id="coWl">${ic('star','',false)} ${WL.some(w=>w.t===sym)?'Siguiendo':'Seguir'}</button><button class="btn" id="coAi">Analizar con IA</button></div>
    <p class="disc">Datos de fuentes públicas de mercado; pueden tener algunos minutos de retraso. No es una recomendación de compra o venta.</p>`);
  $('#coBuy').onclick=()=>{sheetTick=null;$('#sheetBody').innerHTML=realHTML(sym,0);bindReal(sym);};
  $('#coWl').onclick=()=>{toggleWL(sym,base.n);$('#coWl').innerHTML=`${ic('star','',false)} ${WL.some(w=>w.t===sym)?'Siguiendo':'Seguir'}`;};
  $('#coAi').onclick=()=>{closeSheet();go('chat');ask(`Haz un análisis educativo y equilibrado de ${sym} (${base.n||''}) para un inversionista de largo plazo: modelo de negocio, fortalezas, riesgos principales y qué métricas revisar (P/E, crecimiento, deuda, dividendos). Precio actual aproximado: ${base.p?usd2(base.p):'no disponible'}. No des una recomendación de compra.`);};
  $$('#coR button').forEach(b=>b.onclick=()=>{coRange=b.dataset.r;$$('#coR button').forEach(x=>x.classList.toggle('act',x===b));coDetail();});
  coRange='1d';coDetail();}
let coD=null,coHov=null;
async function coDetail(){const sym=coCur,rg=coRange;$('#coT').textContent='Cargando datos…';
  try{const r=await fetch(`${MKT}?symbol=${encodeURIComponent(sym)}&range=${rg}`);const d=await r.json();if(!r.ok)throw d;if(sym!==coCur||rg!==coRange)return;coD=d;
    if(d.n)$('#coN').textContent=d.n.replace(/\s+(Common Stock|Ordinary Shares|American Depositary Shares.*)$/i,'');
    if(d.p!=null){$('#coP').textContent=usd2(d.p);$('#coC').textContent=`${d.c>=0?'+':''}${(d.c||0).toFixed(2)} (${pcS(d.pc)})`;$('#coC').style.color=`var(${(d.pc||0)>=0?'--up':'--down'})`;const row=CO.find(x=>x.s===sym);if(row){row.p=d.p;row.pc=d.pc;row.c=d.c;}}
    $('#coT').textContent=`${d.st==='Open'?'Mercado abierto':d.st==='Closed'?'Mercado cerrado':d.st||''}${d.t?' · último dato: '+d.t:''}${d.ex?' · '+d.ex:''}`;
    $('#coSt').innerHTML=Object.entries(STL).filter(([k])=>d.stats[k]).map(([k,l])=>`<div><small>${l}</small><b>${esc(k==='Sector'?(SECES[d.stats[k].v]||d.stats[k].v):k==='MarketCap'?fmtCap(num2(d.stats[k].v)):d.stats[k].v)}</b></div>`).join('')||'<p class="note">Sin estadísticas disponibles.</p>';
    coDraw();}
  catch(e){if(sym===coCur)$('#coT').textContent=(e&&e.message)||'No se pudieron cargar los datos.';}}
const num2=v=>{const n=parseFloat(String(v).replace(/[$,%\s]/g,''));return Number.isFinite(n)?n:0;};
function coDraw(){const cv=$('#coCv');if(!cv||!coD)return;const F=fit(cv);if(!F)return;const {x,W,H}=F,pts=coD.pts||[];x.clearRect(0,0,W,H);
  if(pts.length<2){x.fillStyle=TH.ink2;x.font='13px Inter Tight, sans-serif';x.fillText('Sin datos de gráfico para este periodo.',10,H/2);return;}
  const ys=pts.map(p=>p[1]),mn=Math.min(...ys),mx=Math.max(...ys),pad=(mx-mn)*.08||1,X=i=>i/(pts.length-1)*(W-56),Y=v=>H-18-(v-mn+pad)/(mx-mn+2*pad)*(H-28);
  const up=ys.at(-1)>=ys[0],col=up?TH.up:TH.down;x.strokeStyle=TH.line;x.fillStyle=TH.ink2;x.font='11px IBM Plex Mono, monospace';
  for(let g=0;g<4;g++){const v=mn-pad+(mx-mn+2*pad)*g/3,yy=Y(v);x.beginPath();x.moveTo(0,yy);x.lineTo(W-56,yy);x.stroke();x.fillText(v.toFixed(v<10?2:0),W-52,yy+4);}
  const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,col+'33');gr.addColorStop(1,col+'00');
  x.beginPath();ys.forEach((v,i)=>i?x.lineTo(X(i),Y(v)):x.moveTo(X(i),Y(v)));x.lineTo(X(ys.length-1),H);x.lineTo(0,H);x.closePath();x.fillStyle=gr;x.fill();
  x.beginPath();ys.forEach((v,i)=>i?x.lineTo(X(i),Y(v)):x.moveTo(X(i),Y(v)));x.strokeStyle=col;x.lineWidth=2;x.stroke();
  if(coHov!=null){const i=Math.max(0,Math.min(ys.length-1,Math.round(coHov*(ys.length-1)))),px=X(i),py=Y(ys[i]);x.strokeStyle=TH.ink3;x.beginPath();x.moveTo(px,4);x.lineTo(px,H-14);x.stroke();x.fillStyle=TH.ink;x.beginPath();x.arc(px,py,4,0,7);x.fill();
    const dt=new Date(pts[i][0]),lab=`${usd2(ys[i])} · ${coRange==='1d'?dt.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'}):dt.toLocaleDateString('es-PE',{day:'numeric',month:'short',year:coRange==='5y'||coRange==='1y'?'2-digit':undefined})}`,tw=x.measureText(lab).width+12,bx=Math.min(Math.max(px-tw/2,0),W-56-tw);
    x.fillStyle=TH.ink;x.fillRect(bx,0,tw,18);x.fillStyle=TH.sheet;x.fillText(lab,bx+6,13);}}
document.addEventListener('pointermove',e=>{const cv=$('#coCv');if(!cv||e.target!==cv)return;const r=cv.getBoundingClientRect();coHov=Math.max(0,Math.min(1,(e.clientX-r.left)/(r.width-56)));coDraw();});
document.addEventListener('pointerleave',e=>{if(e.target&&e.target.id==='coCv'){coHov=null;coDraw();}},true);
/* refresco automático solo mientras se ve la sección */
setInterval(()=>{if(VIEW==='stocks'&&document.visibilityState==='visible'&&Date.now()-coAt>30000)coLoad();},5000);
const _sv13=setView;setView=function(v,o){_sv13(v,o);if(v==='stocks'&&MKT&&!CO.length)coLoad();};
{const v=ID2V[location.hash.slice(1)];if(v==='stocks')setView('stocks',{noHash:true});}

/* ===================== V15: acceso limitado, empresas pro y menú interactivo ===================== */
const member=()=>!!(ACC&&!ACCOFF);
const GUEST_FREE_TOOLS=['calc'];
const LOCKS={home:['Asignación con IA','Recibe una cartera diversificada con IA, escenarios y análisis de riesgo.'],play:['Simulador de cartera','Opera con $10,000 virtuales, órdenes límite y stop, inversión periódica y pruebas de estrés.'],chat:['Asistente de inversión','Pregunta lo que necesites sobre mercados, instrumentos y planificación.'],
  'tool:mc':['Proyección Monte Carlo','2,000 escenarios y la probabilidad de alcanzar tu meta.'],'tool:reb':['Rebalanceo','Calcula qué comprar o vender para volver a tu asignación.'],'tool:fee':['Impacto de comisiones','Compara cuánto te cuesta cada producto en el tiempo.'],'tool:goal':['Planificador de meta','Cuánto ahorrar cada mes para llegar.'],'tool:quiz':['Perfil de riesgo','Descubre tu perfil de inversionista.'],'tool:cmp':['Comparador con IA','Dos acciones lado a lado.'],'tool:video':['Tu cartera en video','Un video con tus números.'],'tool:fx':['Soles y dólares','Conversor con margen de cambio.']};
function lockCard(key){const [t,d]=LOCKS[key]||['Función para miembros',''];return `<div class="lockcard" role="region" aria-label="Contenido para miembros">
  <div class="lkic" aria-hidden="true"><svg viewBox="0 0 48 48" width="48" height="48"><rect class="lb" x="10" y="21" width="28" height="21" rx="5"/><path class="ls" d="M16 21v-6a8 8 0 0 1 16 0v6"/><circle class="lk" cx="24" cy="31" r="2.6"/></svg></div>
  <h3>${t}</h3><p>${d}</p><p class="lkfree">Crea tu cuenta gratis para desbloquear esta y todas las herramientas: simulador, IA, empresas en vivo completas, noticias, calendario y más.</p>
  <div class="acts" style="justify-content:center"><button class="cta lkgo">Crear cuenta gratis</button>${ACC?'<button class="btn lkin">Entrar como '+esc(ACC.name.split(' ')[0])+'</button>':''}</div></div>`;}
function bindLock(root){root.querySelectorAll('.lkgo').forEach(b=>b.onclick=()=>openAccount());root.querySelectorAll('.lkin').forEach(b=>b.onclick=()=>signIn());}
function setLock(el,key,on){if(!el)return;const has=el.querySelector(':scope > .lockcard');if(on){el.classList.add('locked');if(has)has.remove();const sh=el.querySelector(':scope > .sh');const wrap=document.createElement('div');wrap.innerHTML=lockCard(key);const card=wrap.firstChild;
    if(sh)sh.after(card);else el.prepend(card);bindLock(card);if(window.gsap&&!RM)gsap.from(card,{y:24,opacity:0,scale:.96,duration:.6,ease:'expo.out'});}
  else{el.classList.remove('locked');if(has)has.remove();}}
function refreshLocks(){const g=!member();document.body.classList.toggle('guest',g);
  setLock($('#plan'),'home',g);setLock($('#practica'),'play',g);setLock($('#asesor'),'chat',g);
  TOOLS.forEach(t=>{if(GUEST_FREE_TOOLS.includes(t))return;setLock($('#t-'+t),'tool:'+t,g);});
  $$('#tnav button').forEach(b=>b.classList.toggle('lockedtab',g&&!GUEST_FREE_TOOLS.includes(b.dataset.t)));
  $$('#hub .htile').forEach(t=>t.classList.toggle('lockedtile',g&&['home','play','chat'].includes(t.dataset.v)));
  if(typeof coRender==='function'&&CO.length)coRender();}
const _accUI15=accUI;accUI=function(){_accUI15();refreshLocks();};
/* la cuenta es gratis: el bloqueo solo ordena la experiencia, no protege datos */

/* ---------- empresas: resumen, filtros, mapa, calendario, mi lista y noticias ---------- */
let coTab='list',coCap='all',IDX=[];
const CAPS=[['all','Todas'],['mega','Mega (> $200 mil M)'],['large','Grandes ($10–200 mil M)'],['mid','Medianas (< $10 mil M)']];
const capOk=r=>coCap==='all'||(coCap==='mega'?r.m>=2e11:coCap==='large'?r.m>=1e10&&r.m<2e11:r.m<1e10);
{const tabs=document.createElement('div');tabs.className='seg cotabs';tabs.id='coTabs';tabs.innerHTML=[['list','Lista'],['map','Mapa de calor'],['cal','Resultados'],['wl','Mi lista']].map(([k,l],i)=>`<button data-k="${k}" class="${i?'':'act'}">${l}</button>`).join('');
 const sum=document.createElement('div');sum.className='cosum';sum.id='coSum';
 const caps=document.createElement('div');caps.className='cocaps';caps.id='coCaps';caps.innerHTML=CAPS.map(([k,l],i)=>`<button data-k="${k}" class="pill${i?'':' act'}">${l}</button>`).join('');
 const map=document.createElement('div');map.className='comap hidden';map.id='coMap';
 const cal=document.createElement('div');cal.className='cocal hidden';cal.id='coCal';
 const w=$('#coWrap');if(MKT){w.prepend(tabs);tabs.after(sum);$('#coSecs').after(caps);w.appendChild(map);w.appendChild(cal);thumbify(tabs,'s');}
 $$('#coTabs button').forEach(b=>b.onclick=()=>coSetTab(b.dataset.k));
 $$('#coCaps .pill').forEach(b=>b.onclick=()=>{coCap=b.dataset.k;$$('#coCaps .pill').forEach(x=>x.classList.toggle('act',x===b));coRender();});}
function coSetTab(k){if(!member()&&k!=='list'){toast('Crea tu cuenta gratis para usar '+({map:'el mapa de calor',cal:'el calendario de resultados',wl:'tu lista'}[k]),ic('hello','',false));openAccount();return;}
  coTab=k;$$('#coTabs button').forEach(b=>b.classList.toggle('act',b.dataset.k===k));
  const list=$('#coWrap .colist'),tools=[$('#coWrap .cotools'),$('#coSecs'),$('#coCaps'),$('#coUpd')];
  list.classList.toggle('hidden',k==='map'||k==='cal');tools.forEach(t=>t&&t.classList.toggle('hidden',k==='cal'));$('#coMap').classList.toggle('hidden',k!=='map');$('#coCal').classList.toggle('hidden',k!=='cal');
  if(k==='map')coMapDraw();if(k==='cal')coCalLoad(coCalDate||nextBiz(0));coRender();
  const pane=k==='map'?$('#coMap'):k==='cal'?$('#coCal'):list;if(window.gsap&&!RM)gsap.fromTo(pane,{opacity:0,y:14},{opacity:1,y:0,duration:.45,ease:'expo.out',clearProps:'transform'});}
/* resumen del mercado */
async function idxLoad(){try{const r=await fetch(MKT+'?indices=1');const d=await r.json();IDX=d.rows||[];}catch(e){IDX=[];}coSummary();}
function coSummary(){const box=$('#coSum');if(!box||!CO.length)return;const big=CO.slice(0,500),cap=big.reduce((a,r)=>a+r.m,0),w=big.reduce((a,r)=>a+r.m*(r.pc||0),0)/cap;
  const tech=CO.filter(r=>r.sec==='Technology'),tw=tech.reduce((a,r)=>a+r.m*(r.pc||0),0)/tech.reduce((a,r)=>a+r.m,0);
  const up=big.filter(r=>r.pc>0).length,dn=big.filter(r=>r.pc<0).length;const liq=CO.filter(r=>r.m>2e10);const g=[...liq].sort((a,b)=>(b.pc||0)-(a.pc||0))[0],l=[...liq].sort((a,b)=>(a.pc||0)-(b.pc||0))[0];
  const card=(t,v,sub,c)=>`<div class="csm"><small>${t}</small><b style="color:var(${c})">${v}</b><span>${sub}</span></div>`;
  box.innerHTML=card('500 mayores (ponderado)',pcS(w),'Referencia similar al S&P 500',w>=0?'--up':'--down')+card('Tecnología (ponderado)',pcS(tw),'Referencia similar al Nasdaq',tw>=0?'--up':'--down')+
    `<div class="csm"><small>Amplitud del mercado</small><b>${up} <span style="color:var(--up)">▲</span> · ${dn} <span style="color:var(--down)">▼</span></b><span class="brd"><i style="width:${up/(up+dn)*100}%"></i></span></div>`+
    (g?`<button class="csm csl" data-s="${g.s}"><small>Mayor alza (grandes)</small><b style="color:var(--up)">${g.s} ${pcS(g.pc)}</b><span>${esc(g.n)}</span></button>`:'')+(l?`<button class="csm csl" data-s="${l.s}"><small>Mayor baja (grandes)</small><b style="color:var(--down)">${l.s} ${pcS(l.pc)}</b><span>${esc(l.n)}</span></button>`:'')+
    (IDX.length?`<div class="csm csetf"><small>Otros mercados</small><div>${IDX.map(x=>`<span><b>${esc(x.n)}</b> <em style="color:var(${(x.pc||0)>=0?'--up':'--down'})">${pcS(x.pc)}</em></span>`).join('')}</div></div>`:'');
  $$('#coSum .csl').forEach(b=>b.onclick=()=>coOpen(b.dataset.s));}
/* lista: límite para invitados, capitalización y mi lista */
const _coRender15=coRender;coRender=function(){const all=CO;const wl=new Set(WL.map(w=>w.t));
  CO=all.filter(r=>capOk(r)&&(coTab!=='wl'||wl.has(r.s)));_coRender15();CO=all;
  if(coTab==='wl'&&!all.some(r=>wl.has(r.s)))$('#coList').innerHTML='<p class="note" style="padding:22px">Tu lista está vacía. Abre una empresa y toca "Seguir" para agregarla aquí.</p>';
  if(!member()){const rows=$$('#coList .corow');rows.slice(25).forEach(r=>r.remove());if(rows.length>25){const d=document.createElement('div');d.className='colock';d.innerHTML=`<div>${ic('stop','',false)}<b>Ves 25 de ${rows.length} empresas.</b><span>Crea tu cuenta gratis para ver las ${all.length} empresas, sus fichas completas, noticias y el mapa de calor.</span></div><button class="cta">Crear cuenta gratis</button>`;d.querySelector('button').onclick=()=>openAccount();$('#coList').appendChild(d);}}
  coSummary();if(coTab==='map')coMapDraw();};
const _coOpen15=coOpen;coOpen=function(sym){if(!member()){toast('Crea tu cuenta gratis para ver la ficha completa de '+sym,ic('hello','',false));openAccount();return;}_coOpen15(sym);coNews(sym);};
/* noticias en la ficha */
async function coNews(sym){const host=$('#coSt');if(!host)return;const box=document.createElement('div');box.className='conews';box.innerHTML='<h4>Noticias recientes</h4><p class="note">Cargando…</p>';host.after(box);
  try{const r=await fetch(`${MKT}?news=${encodeURIComponent(sym)}`);const d=await r.json();if(coCur!==sym)return;const rows=(d.rows||[]).slice(0,6);
    box.innerHTML='<h4>Noticias recientes</h4>'+(rows.length?rows.map(n=>`<a class="cnw" href="${esc(n.u)}" target="_blank" rel="noopener"><b>${esc(n.t)}</b><small>${esc(n.p)}${n.a?' · '+esc(n.a):''}</small></a>`).join(''):'<p class="note">Sin noticias recientes.</p>')+'<p class="note">Titulares en inglés de fuentes externas.</p>';
    if(window.gsap&&!RM)gsap.from('#sheetBody .cnw',{y:10,opacity:0,stagger:.05,duration:.4,ease:'power3.out'});}
  catch(e){box.innerHTML='<h4>Noticias recientes</h4><p class="note">No se pudieron cargar las noticias.</p>';}}
/* mapa de calor (treemap) */
function squarify(items,x,y,w,h){const out=[];let rest=items.slice();
  while(rest.length&&w>1&&h>1){const total=rest.reduce((a,b)=>a+b.v,0),sc=w*h/total,short=Math.min(w,h);let row=[],best=Infinity,i=0;
    while(i<rest.length){const r2=row.concat(rest[i]),s=r2.reduce((a,b)=>a+b.v*sc,0),mx=Math.max(...r2.map(b=>b.v*sc)),mn=Math.min(...r2.map(b=>b.v*sc)),worst=Math.max(short*short*mx/(s*s),s*s/(short*short*mn));if(worst<=best){row=r2;best=worst;i++;}else break;}
    const s=row.reduce((a,b)=>a+b.v*sc,0);
    if(w>=h){const cw=s/h;let yy=y;row.forEach(b=>{const bh=b.v*sc/cw;out.push({it:b,x,y:yy,w:cw,h:bh});yy+=bh;});x+=cw;w-=cw;}
    else{const rh=s/w;let xx=x;row.forEach(b=>{const bw=b.v*sc/rh;out.push({it:b,x:xx,y,w:bw,h:rh});xx+=bw;});y+=rh;h-=rh;}
    rest=rest.slice(row.length);}
  return out;}
function heatCol(pc){const a=Math.min(1,Math.abs(pc||0)/3);return pc>=0?`color-mix(in oklab, var(--up) ${Math.round(18+a*72)}%, #1b2621)`:`color-mix(in oklab, var(--down) ${Math.round(18+a*72)}%, #2a1b1b)`;}
function coMapDraw(){const box=$('#coMap');if(!box||box.classList.contains('hidden'))return;const W=box.clientWidth,H=Math.max(420,Math.min(680,W*.62));box.style.height=H+'px';
  const top=CO.filter(capOk).slice(0,150),secs={};top.forEach(r=>{(secs[r.sec]=secs[r.sec]||[]).push({...r,v:Math.pow(r.m,.82)});});
  const sItems=Object.entries(secs).map(([k,a])=>({k,a:a.sort((x,y)=>y.v-x.v),v:a.reduce((s,b)=>s+b.v,0)})).sort((a,b)=>b.v-a.v);
  let html='';squarify(sItems,0,0,W,H).forEach(S=>{html+=`<div class="tms" style="left:${S.x}px;top:${S.y}px;width:${S.w}px;height:${S.h}px"><span class="tmsl">${esc(SECES[S.it.k]||S.it.k)}</span></div>`;
    squarify(S.it.a,S.x+1,S.y+16,S.w-2,S.h-17).forEach(c=>{const r=c.it,big=c.w>58&&c.h>34,mid=c.w>34&&c.h>20;
      html+=`<button class="tmc" data-s="${esc(r.s)}" style="left:${c.x}px;top:${c.y}px;width:${Math.max(0,c.w-1)}px;height:${Math.max(0,c.h-1)}px;background:${heatCol(r.pc)}" title="${esc(r.s)} · ${esc(r.n)} · ${pcS(r.pc)}">${mid?`<b style="font-size:${Math.max(10,Math.min(22,Math.sqrt(c.w*c.h)/5.5))}px">${esc(r.s)}</b>`:''}${big?`<small>${pcS(r.pc)}</small>`:''}</button>`;});});
  box.innerHTML=html+'<div class="tmleg"><span>−3%</span><i></i><span>0%</span><i class="u"></i><span>+3%</span><span class="tmn">Tamaño según capitalización · 150 mayores</span></div>';
  $$('#coMap .tmc').forEach(b=>b.onclick=()=>coOpen(b.dataset.s));
  if(window.gsap&&!RM)gsap.from('#coMap .tmc',{scale:.6,opacity:0,duration:.5,ease:'expo.out',stagger:{each:.004,from:'start'},transformOrigin:'50% 50%'});}
addEventListener('resize',()=>{clearTimeout(coMapDraw._t);coMapDraw._t=setTimeout(coMapDraw,150);});
/* calendario de resultados */
let coCalDate=null;
function nextBiz(n){const d=new Date();let k=0;while(true){if(d.getDay()!==0&&d.getDay()!==6){if(k===n)break;k++;}d.setDate(d.getDate()+1);}return d.toISOString().slice(0,10);}
const TIMEL={'time-pre-market':'Antes de la apertura','time-after-hours':'Después del cierre','time-not-supplied':'Hora no indicada'};
async function coCalLoad(date){coCalDate=date;const box=$('#coCal');const days=[0,1,2,3,4].map(nextBiz);
  box.innerHTML=`<div class="calday">${days.map(d=>{const dt=new Date(d+'T12:00:00');return `<button class="pill${d===date?' act':''}" data-d="${d}"><b>${dt.toLocaleDateString('es-PE',{weekday:'short'})}</b> ${dt.toLocaleDateString('es-PE',{day:'numeric',month:'short'})}</button>`;}).join('')}</div><p class="note">Cargando resultados…</p>`;
  $$('#coCal .calday .pill').forEach(b=>b.onclick=()=>coCalLoad(b.dataset.d));
  try{const r=await fetch(`${MKT}?earnings=${date}`);const d=await r.json();if(coCalDate!==date)return;const rows=d.rows||[];
    box.querySelector('.note').outerHTML=rows.length?`<p class="note">${rows.length} empresas presentan resultados. BPA = ganancia por acción.</p><div class="tblw"><table class="caltb"><thead><tr><th>Empresa</th><th>Cuándo</th><th>Trimestre</th><th>BPA estimado</th><th>BPA año anterior</th><th>Analistas</th></tr></thead><tbody>${rows.slice(0,60).map(e=>`<tr data-s="${esc(e.s)}"><td><span class="calco">${coLogo(e.s)}<span><b>${esc(e.s)}</b><small>${esc(e.n)}</small></span></span></td><td>${TIMEL[e.t]||esc(e.t)}</td><td>${esc(e.q)}</td><td class="mono">${esc(e.e||'—')}</td><td class="mono">${esc(e.ly||'—')}</td><td class="mono">${esc(e.ne||'—')}</td></tr>`).join('')}</tbody></table></div>`:'<p class="note">No hay resultados programados ese día.</p>';
    $$('#coCal tbody tr').forEach(t=>t.onclick=()=>coOpen(t.dataset.s));
    if(window.gsap&&!RM)gsap.from('#coCal tbody tr',{x:-12,opacity:0,stagger:.02,duration:.4,ease:'power3.out'});}
  catch(e){const n=box.querySelector('.note');if(n)n.textContent='No se pudo cargar el calendario.';}}
const _coLoad15=coLoad;coLoad=async function(f){await _coLoad15(f);if(!IDX.length)idxLoad();else coSummary();};

/* ---------- menú del logo: más interactivo ---------- */
const FINE15=matchMedia('(hover:hover) and (pointer:fine)').matches;
{const menu=$('#menu'),items=$('#menu .mitems');const hl=document.createElement('div');hl.className='mhl';items.prepend(hl);const glow=document.createElement('div');glow.className='mglow';menu.prepend(glow);
 let hlOn=false;const moveHl=el=>{if(!el)return;const r=el.getBoundingClientRect(),p=items.getBoundingClientRect();const v={x:r.left-p.left,y:r.top-p.top+items.scrollTop,w:r.width,h:r.height};
   if(window.gsap&&!RM){gsap.to(hl,{x:v.x,y:v.y,width:v.w,height:v.h,opacity:1,duration:hlOn?.32:.01,ease:'expo.out'});}else Object.assign(hl.style,{transform:`translate(${v.x}px,${v.y}px)`,width:v.w+'px',height:v.h+'px',opacity:1});hlOn=true;};
 $$('#menu .mi2, #menu .maccount').forEach(b=>{b.addEventListener('pointerenter',()=>moveHl(b));b.addEventListener('focus',()=>moveHl(b));
   b.addEventListener('pointerenter',()=>{const s=b.querySelector('.ic');if(s&&window.gsap&&!RM)gsap.fromTo(s,{rotate:-12,scale:.85},{rotate:0,scale:1,duration:.5,ease:'back.out(3)'});});
   b.addEventListener('pointerdown',e=>{const r=b.getBoundingClientRect(),d=document.createElement('span');d.className='rip';d.style.left=(e.clientX-r.left)+'px';d.style.top=(e.clientY-r.top)+'px';b.appendChild(d);setTimeout(()=>d.remove(),600);});});
 items.addEventListener('pointerleave',()=>{hlOn=false;if(window.gsap)gsap.to(hl,{opacity:0,duration:.25});else hl.style.opacity=0;});
 menu.addEventListener('pointermove',e=>{const r=menu.getBoundingClientRect();menu.style.setProperty('--gx',(e.clientX-r.left)+'px');menu.style.setProperty('--gy',(e.clientY-r.top+menu.scrollTop)+'px');
   if(FINE15&&!RM&&!document.body.classList.contains('lite')){const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;menu.style.transform=`perspective(1200px) rotateX(${(-py*2.2).toFixed(2)}deg) rotateY(${(px*2.8).toFixed(2)}deg)`;}});
 menu.addEventListener('pointerleave',()=>{menu.style.transform='';});
 const _om15=openMenu;openMenu=function(){_om15();if(!window.gsap||RM)return;menu.style.transform='';
   gsap.fromTo(menu,{clipPath:'circle(0% at 28px 0px)'},{clipPath:'circle(150% at 28px 0px)',duration:.7,ease:'expo.out',clearProps:'clipPath'});
   gsap.fromTo('#menu .mcol',{y:26,opacity:0,rotateX:-14},{y:0,opacity:1,rotateX:0,duration:.7,ease:'expo.out',stagger:.07,transformOrigin:'50% 0%',clearProps:'transform,opacity'});
   gsap.fromTo('#menu .mi2',{x:-14,opacity:0},{x:0,opacity:1,duration:.5,ease:'expo.out',stagger:.018,delay:.12,clearProps:'transform,opacity'});
   gsap.fromTo('#menu .mhead',{y:-12,opacity:0},{y:0,opacity:1,duration:.5,ease:'expo.out'});};
 const _cm15=closeMenu;closeMenu=function(b){if(window.gsap&&!RM&&menuOpen()){gsap.to(menu,{clipPath:'circle(0% at 28px 0px)',duration:.35,ease:'power3.in',onComplete:()=>{_cm15(b);gsap.set(menu,{clearProps:'clipPath'});}});return;}_cm15(b);};}
/* inclinación y brillo en las tarjetas del inicio y la bienvenida */
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!RM)$$('#hub .htile, #gQuick .gq').forEach(t=>{t.addEventListener('pointermove',e=>{const r=t.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
  t.style.transform=`perspective(900px) rotateX(${(-py*5).toFixed(2)}deg) rotateY(${(px*6).toFixed(2)}deg) translateY(-4px)`;t.style.setProperty('--sx',((px+.5)*100)+'%');t.style.setProperty('--sy',((py+.5)*100)+'%');});
  t.addEventListener('pointerleave',()=>{t.style.transform='';});});

refreshLocks();

/* ===================== V16: ideas de inversión y cuentas con correo ===================== */
VIEWS.ideas=['ideas'];V2ID.ideas='ideas';ID2V.ideas='ideas';VTITLE.ideas='Ideas';
{const sec=$('#ideas');const b=document.createElement('div');b.className='backbar';b.innerHTML=`<button class="backb" aria-label="Volver al inicio">${ic('right','',false)}<span>Inicio</span></button><span class="crumb">Ideas de inversión</span>`;sec.prepend(b);b.querySelector('button').onclick=()=>setView('inicio');}
['#nav','#nav2'].forEach(n=>{const ref=$(n+' a[data-p="stocks"]');if(!ref)return;const a=document.createElement('a');a.href='#ideas';a.dataset.p='ideas';a.textContent='Ideas';a.addEventListener('click',e=>{e.preventDefault();setView('ideas');});ref.after(a);});
$$('#hub .htile[data-v="ideas"]').forEach(t=>t.addEventListener('click',()=>setView('ideas')));
{const col=$('#menu .mcol');if(col){const b=document.createElement('button');b.className='mi2';b.setAttribute('role','menuitem');b.innerHTML=`${ic('target','',false)}<span>Ideas de inversión<small>Qué acciones destacan hoy y por qué</small></span>`;b.onclick=()=>{closeMenu();setView('ideas');};col.querySelector('h4').after(b);}}

let IDS=[],IDTOT=0,idT=0,idsAt=0,idsBusy=false,idTab='perfil',idRisk=(ACC&&ACC.risk)||store.get('risk','moderado')||'moderado';
const W8={conservador:{up:.2,val:.25,div:.3,mom:.05,size:.2},moderado:{up:.3,val:.25,div:.15,mom:.15,size:.15},agresivo:{up:.45,val:.1,div:0,mom:.35,size:.1}};
const IDTABS=[['perfil','Para tu perfil'],['up','Mayor potencial'],['div','Dividendos'],['val','Valor'],['mom','Impulso']];
const pct=(v,d=1)=>v==null?'—':(v>=0?'+':'')+(v*100).toFixed(d)+'%';
function rankPct(arr,key,asc){const v=arr.filter(r=>r[key]!=null).sort((a,b)=>asc?a[key]-b[key]:b[key]-a[key]);const n=v.length;const m=new Map();v.forEach((r,i)=>m.set(r.s,n>1?1-i/(n-1):1));return r=>m.has(r.s)?m.get(r.s):.35;}
function idScore(rows,risk){const w=W8[risk]||W8.moderado;
  const rUp=rankPct(rows.map(r=>({...r,u:r.up!=null?Math.min(r.up,.8):null})).map(r=>({s:r.s,up:r.u})),'up'),rVal=rankPct(rows,'pe',true),rPeg=rankPct(rows,'peg',true),rDiv=rankPct(rows,'y'),rMom=rankPct(rows,'pos'),rSize=rankPct(rows,'m');
  return rows.map(r=>{const RS={'Compra fuerte':1,'Compra':.8,'Mantener':.45,'Venta':.15,'Venta fuerte':0};const p={up:r.rt?rUp(r)*.65+RS[r.rt]*.35:rUp(r),val:r.peg?rVal(r)*.6+rPeg(r)*.4:rVal(r),div:r.y>0?rDiv(r):0,mom:rMom(r),size:rSize(r)};let sc=Object.keys(w).reduce((a,k)=>a+w[k]*p[k],0);
    if(r.up!=null&&r.up<0)sc*=.6;if(risk==='conservador'&&r.pe&&r.pe>60)sc*=.8;
    return {...r,parts:p,score:Math.round(Math.max(1,Math.min(99,sc*100)))};});}
function idReasons(r){const o=[];
  if(r.up!=null)o.push(r.up>=.15?[`Los analistas ven un precio objetivo ${pct(r.up,0)} sobre el actual (${usd2(r.tgt)}).`,0]:r.up>=0?[`Precio objetivo de analistas cercano al actual (${pct(r.up,0)}).`,0]:[`El precio ya supera el objetivo de los analistas (${pct(r.up,0)}).`,1]);
  if(r.rt)o.push([`Consenso de ${r.na||'varios'} analistas: ${r.rt.toLowerCase()}.`,/Venta/.test(r.rt)?1:0]);
  if(r.pe)o.push(r.pe<15?[`Valuación baja: P/E de ${r.pe.toFixed(1)}.`,0]:r.pe<30?[`Valuación razonable: P/E de ${r.pe.toFixed(1)}.`,0]:[`Valuación exigente: P/E de ${r.pe.toFixed(1)}; el mercado espera mucho crecimiento.`,1]);
  if(r.gr!=null)o.push(r.gr>=10?[`Se espera que sus ganancias crezcan ${r.gr.toFixed(0)}% el próximo año${r.peg?` (PEG ${r.peg.toFixed(2)})`:''}.`,0]:r.gr<0?[`Se espera que sus ganancias caigan ${Math.abs(r.gr).toFixed(0)}% el próximo año.`,1]:[`Crecimiento de ganancias esperado moderado (${r.gr.toFixed(0)}%).`,0]);
  if(r.y>=2.5)o.push([`Paga dividendos de ${r.y.toFixed(2)}% al año.`,0]);
  if(r.pos!=null)o.push(r.pos>=.85?[`Cotiza cerca de su máximo de 52 semanas: tendencia fuerte, pero entra más caro.`,r.pos>.97?1:0]:r.pos<=.25?[`Cotiza cerca de su mínimo de 52 semanas: puede ser oportunidad o señal de problemas.`,1]:[`Está a ${Math.round(r.pos*100)}% de su rango de 52 semanas.`,0]);
  return o.slice(0,5);}
function idSort(rows){const R=idScore(rows,idRisk);
  const f={perfil:(a,b)=>b.score-a.score,up:(a,b)=>(b.up??-9)-(a.up??-9),div:(a,b)=>(b.y||0)-(a.y||0),val:(a,b)=>(a.pe??999)-(b.pe??999),mom:(a,b)=>(b.pos??-1)-(a.pos??-1)}[idTab];
  let L=R.filter(r=>idTab==='div'?r.y>0:idTab==='val'?r.pe!=null&&(r.up==null||r.up>-.05):idTab==='up'?r.up!=null:true);return L.sort(f);}

if(!MKT){$('#idWrap').innerHTML=`<div class="panel coempty"><h3>Las ideas con datos reales funcionan en la versión web</h3><p class="note">Dentro de Claude la página no puede conectarse a fuentes de datos externas. Abre la versión publicada para ver el ranking diario con precios objetivo de analistas, valuación y dividendos.</p><div class="acts"><a class="btn solid" href="https://lucioni-capital.vercel.app/#ideas" target="_blank" rel="noopener">Abrir Lucioni Capital en la web ${ic('ext','',false)}</a></div></div>`;}
else{$('#idWrap').innerHTML=`<div class="idtop"><div class="idprof"><span>Tu perfil</span><div class="seg" id="idRisk">${[['conservador','Con calma'],['moderado','Equilibrado'],['agresivo','Arriesgado']].map(([k,l])=>`<button data-v="${k}" class="${k===idRisk?'act':''}">${l}</button>`).join('')}</div></div><button class="btn" id="idRef">${ic('clock','',false)} Actualizar</button></div>
  <div class="idtabs" id="idTabs" role="tablist">${IDTABS.map(([k,l])=>`<button role="tab" data-k="${k}" class="${k===idTab?'act':''}">${l}</button>`).join('')}</div>
  <p class="idmeta" id="idMeta">Analizando las empresas más grandes de EE.UU.…</p>
  <div class="idcharts"><div class="panel idbars"><h4 id="idBarsT">Puntaje de las 10 primeras</h4><p class="note" id="idBarsS">De 1 a 99, combinando potencial, valuación, dividendos, tendencia y tamaño.</p><div id="idBars"></div></div>
    <div class="panel idsc"><h4>Valuación frente a potencial</h4><p class="note">Cada punto es una empresa. Arriba a la izquierda: más barata y con más potencial según analistas. Las doradas son tu top 10.</p><div id="idSc"></div></div></div>
  <div class="idgrid" id="idGrid">${'<div class="idskel"></div>'.repeat(6)}</div>
  <details class="panel idhow"><summary>Cómo se calcula el puntaje ${ic('right','',false)}</summary>
    <p class="note" style="margin-top:10px">Cada empresa se compara con las demás del grupo en cinco factores. El peso de cada factor cambia según tu perfil.</p>
    <table><thead><tr><th>Factor</th><th>Qué mide</th><th>Con calma</th><th>Equilibrado</th><th>Arriesgado</th></tr></thead><tbody>
    ${[['up','Potencial','Precio objetivo a 1 año y consenso (compra/mantener/venta) de analistas'],['val','Valor','P/E y PEG (P/E entre crecimiento esperado) más bajos que el resto'],['div','Dividendos','Rendimiento anual por dividendo'],['mom','Impulso','Posición en el rango de 52 semanas'],['size','Tamaño','Capitalización de mercado (más grande, más estable)']].map(([k,t,d])=>`<tr><td><b>${t}</b></td><td>${d}</td>${['conservador','moderado','agresivo'].map(p=>`<td>${Math.round(W8[p][k]*100)}%</td>`).join('')}</tr>`).join('')}
    </tbody></table>
    <p class="disc">Ranking automático con datos públicos de mercado (Nasdaq y estimados de Zacks Investment Research) que pueden tener retraso. Es información educativa y general, no una recomendación personalizada de compra o venta, y no considera tu situación financiera. Los precios objetivo de analistas suelen equivocarse. Antes de invertir, diversifica y consulta a un asesor registrado en la SMV.</p></details>`;
  $$('#idRisk button').forEach(b=>b.onclick=()=>{idRisk=b.dataset.v;$$('#idRisk button').forEach(x=>x.classList.toggle('act',x===b));idRender();});
  $$('#idTabs button').forEach(b=>b.onclick=()=>{idTab=b.dataset.k;$$('#idTabs button').forEach(x=>x.classList.toggle('act',x===b));idRender();});
  $('#idRef').onclick=()=>idLoad(true);}

async function idLoad(force){if(!MKT||idsBusy)return;if(!force&&IDS.length&&Date.now()-idsAt<15*60e3){idRender();return;}idsBusy=true;$('#idMeta').textContent='Analizando las empresas más grandes de EE.UU.… la primera carga del día puede tardar unos segundos.';
  try{const r=await fetch(MKT+'?ideas=1');const d=await r.json();if(!r.ok||!d.rows)throw 0;IDS=d.rows;idsAt=d.at||Date.now();IDTOT=d.total||IDS.length;idRender();if(IDS.length<IDTOT){clearTimeout(idT);idT=setTimeout(()=>{if(VIEW==='ideas')idLoad(true);},25000);}}
  catch(e){$('#idMeta').textContent='La fuente de datos no respondió. Toca "Actualizar" en un momento.';if(!IDS.length)$('#idGrid').innerHTML='';}
  finally{idsBusy=false;}}

function idRender(){if(!IDS.length)return;const L=idSort(IDS),top=L.slice(0,10),g=!member();
  const lab={perfil:'Puntaje de las 10 primeras',up:'Potencial según analistas',div:'Rendimiento por dividendo',val:'P/E (menor es más barato)',mom:'Posición en el rango de 52 semanas'}[idTab];
  $('#idBarsT').textContent=lab;
  $('#idBarsS').textContent={perfil:'De 1 a 99, combinando potencial, valuación, dividendos, tendencia y tamaño según tu perfil.',up:'Cuánto podría subir según el precio objetivo promedio de analistas a 1 año.',div:'Dividendo anual como porcentaje del precio actual.',val:'Cuántas veces sus ganancias anuales paga el mercado. Solo empresas sin caída esperada por analistas.',mom:'0% = en su mínimo de 52 semanas, 100% = en su máximo.'}[idTab];
  $('#idMeta').textContent=`${IDS.length<IDTOT?`Completando datos: ${IDS.length} de ${IDTOT} empresas (se actualiza solo) · `:`${IDS.length} empresas analizadas · `}${L.length} cumplen este filtro · datos de ${new Date(idsAt).toLocaleString('es-PE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}`;
  idBars(top);idScatter(L,new Set(top.map(r=>r.s)));
  const show=g?L.slice(0,3):L.slice(0,24);
  $('#idGrid').innerHTML=show.map((r,i)=>idCard(r,i)).join('')+(g?`<div class="idlock"><b>Ves 3 de ${L.length} ideas.</b><p>Crea tu cuenta gratis con tu correo para ver el ranking completo, filtrar por dividendos, valor o impulso, y seguir las empresas que te interesen.</p><button class="cta" id="idGo">Crear cuenta gratis</button></div>`:'');
  const idg=$('#idGo');if(idg)idg.onclick=()=>openAccount();
  $$('#idGrid .idc').forEach(c=>{const s=c.dataset.s,r=L.find(x=>x.s===s);
    c.querySelector('.idf').onclick=()=>coOpen(s);
    c.querySelector('.idb').onclick=()=>{openSheet(realHTML(s,0));bindReal(s);};
    c.querySelector('.idw').onclick=e=>{toggleWL(s,r.n);e.currentTarget.innerHTML=`${ic('star','',false)} ${WL.some(w=>w.t===s)?'Siguiendo':'Seguir'}`;};
    c.querySelector('.ida').onclick=()=>{if(!member()){openAccount();return;}go('chat');ask(`Analiza de forma educativa y equilibrada ${s} (${r.n}) para un inversionista ${idRisk}. Datos actuales: precio ${usd2(r.p)}, precio objetivo de analistas a 1 año ${r.tgt?usd2(r.tgt):'no disponible'} (${pct(r.up)}), consenso ${r.rt||'n/d'}, crecimiento esperado de ganancias ${r.gr!=null?r.gr+'%':'n/d'}, P/E ${r.pe?r.pe.toFixed(1):'n/d'}, dividendo ${r.y||0}%, posición en rango de 52 semanas ${r.pos!=null?Math.round(r.pos*100)+'%':'n/d'}. Explica fortalezas, riesgos y qué vigilar. No des una orden de compra.`);};});
  idAnimate();}

function idCard(r,i){const sc=r.score,C=2*Math.PI*24,why=idReasons(r),wl=WL.some(w=>w.t===r.s);
  const bar=(l,v,t)=>`<div class="r"><span>${l}</span><span class="t"><i data-w="${Math.max(3,Math.min(100,v*100)).toFixed(0)}"></i></span><b>${t}</b></div>`;
  return `<article class="idc" data-s="${esc(r.s)}"><div class="idh"><span class="idrk">${i+1}</span>${coLogo(r.s)}<div class="idn"><b>${esc(r.s)}</b><small>${esc(r.n)} · ${SECES[r.sec]||esc(r.sec)}</small></div>
    <div class="idring" aria-label="Puntaje ${sc} de 99"><svg viewBox="0 0 58 58"><circle class="bg" cx="29" cy="29" r="24"/><circle class="fg" style="stroke:var(${sc>=60?'--up':sc>=40?'--gold':'--ink3'})" cx="29" cy="29" r="24" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" data-o="${(C*(1-sc/100)).toFixed(1)}"/></svg><span data-n="${sc}">0</span><small>puntaje</small></div></div>
    <div class="idpx">${usd2(r.p)} <small style="color:var(${(r.pc||0)>=0?'--up':'--down'})">${pcS(r.pc)} hoy</small><em>${fmtCap(r.m)}</em></div>
    ${r.rt?`<div class="idrt" data-k="${/fuerte/.test(r.rt)&&/Compra/.test(r.rt)?'sb':/Compra/.test(r.rt)?'b':/Venta/.test(r.rt)?'s':'h'}"><span>Consenso de analistas</span><b>${r.rt}</b>${r.na?`<small>${r.na} analistas</small>`:''}</div>`:''}
    <div class="idspark" data-s="${esc(r.s)}"><div class="ld"></div></div>
    <div class="idm">${bar('Potencial analistas',r.parts.up,pct(r.up,0))}${bar('Valor (P/E)',r.parts.val,r.pe?r.pe.toFixed(1):'—')}${bar('Dividendo',r.y>0?r.parts.div:0,(r.y||0).toFixed(2)+'%')}${bar('Rango 52 sem.',r.pos??0,r.pos!=null?Math.round(r.pos*100)+'%':'—')}</div>
    <ul class="idwhy">${why.map(([t,w])=>`<li class="${w?'w':''}">${t}</li>`).join('')}</ul>
    <div class="acts"><button class="btn idf">Ver ficha</button><button class="btn solid idb">${ic('broker','',false)} Comprar de verdad</button><button class="btn idw">${ic('star','',false)} ${wl?'Siguiendo':'Seguir'}</button><button class="btn ida">Opinión de IA</button></div></article>`;}

function idAnimate(){const cards=$$('#idGrid .idc');
  if(window.gsap&&!RM)gsap.fromTo(cards,{y:26,opacity:0},{y:0,opacity:1,duration:.6,ease:'expo.out',stagger:.05,clearProps:'transform,opacity'});
  cards.forEach((c,i)=>setTimeout(()=>{const fg=c.querySelector('.fg'),n=c.querySelector('.idring span');
    if(window.gsap&&!RM){gsap.to(fg,{attr:{'stroke-dashoffset':fg.dataset.o},duration:1.2,ease:'expo.out'});const o={v:0};gsap.to(o,{v:+n.dataset.n,duration:1.2,ease:'expo.out',onUpdate:()=>n.textContent=Math.round(o.v)});}
    else{fg.setAttribute('stroke-dashoffset',fg.dataset.o);n.textContent=n.dataset.n;}
    c.querySelectorAll('.idm i').forEach(b=>b.style.width=b.dataset.w+'%');},RM?0:120+i*60));
  sparkObs();}

/* gráfico de barras animado */
function idBars(top){const W=Math.max(300,Math.min(640,$('#idBars').clientWidth||560)),rh=30,H=top.length*rh+6,lw=80,vw=64;const val=r=>idTab==='perfil'?r.score/100:idTab==='up'?Math.max(0,r.up||0):idTab==='div'?(r.y||0):idTab==='val'?(r.pe||0):(r.pos||0);
  const mx=Math.max(...top.map(val),idTab==='perfil'||idTab==='mom'?1:.0001);const txt=r=>idTab==='perfil'?r.score:idTab==='up'?pct(r.up,0):idTab==='div'?(r.y||0).toFixed(2)+'%':idTab==='val'?(r.pe?r.pe.toFixed(1):'—'):Math.round((r.pos||0)*100)+'%';
  $('#idBars').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc($('#idBarsT').textContent)}">${top.map((r,i)=>{const y=i*rh+4,w=(W-lw-vw)*val(r)/mx;
    return `<g data-s="${esc(r.s)}"><title>${esc(r.n)}</title><text x="0" y="${y+16}">${i+1}</text><text class="lb" x="22" y="${y+16}">${esc(r.s)}</text><rect class="tr" x="${lw}" y="${y+4}" width="${W-lw-vw}" height="16" rx="8"/><rect class="br" x="${lw}" y="${y+4}" width="${Math.max(4,w).toFixed(1)}" height="16" rx="8" data-w="${Math.max(4,w).toFixed(1)}"/><text class="vl" x="${W-vw+10}" y="${y+16}">${txt(r)}</text></g>`;}).join('')}</svg>`;
  $$('#idBars g').forEach(g=>g.onclick=()=>{const c=$(`#idGrid .idc[data-s="${g.dataset.s}"]`);if(c)c.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});else coOpen(g.dataset.s);});
  if(window.gsap&&!RM){gsap.fromTo('#idBars rect.br',{attr:{width:4}},{attr:{width:(i,el)=>el.dataset.w},duration:1.1,ease:'expo.out',stagger:.06});gsap.fromTo('#idBars text',{opacity:0},{opacity:1,duration:.5,stagger:.02});}}

/* dispersión P/E vs potencial */
function idScatter(L,topSet){const P=L.filter(r=>r.pe&&r.up!=null&&r.pe<80).slice(0,80);const W=Math.max(300,Math.min(560,$('#idSc').clientWidth||460)),H=Math.round(W*.6),m={l:40,r:12,t:12,b:30};if(!P.length){$('#idSc').innerHTML='<p class="note">Sin datos suficientes.</p>';return;}
  const xs=P.map(r=>r.pe),ys=P.map(r=>Math.max(-.3,Math.min(.8,r.up)));const x0=0,x1=Math.ceil(Math.max(...xs)/10)*10,y0=Math.min(-.1,Math.floor(Math.min(...ys)*10)/10),y1=Math.max(.3,Math.ceil(Math.max(...ys)*10)/10);
  const X=v=>m.l+(v-x0)/(x1-x0)*(W-m.l-m.r),Y=v=>H-m.b-(v-y0)/(y1-y0)*(H-m.t-m.b);
  let g='';for(let k=0;k<=4;k++){const v=y0+(y1-y0)*k/4;g+=`<line class="ax" x1="${m.l}" x2="${W-m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v)+4}">${Math.round(v*100)}%</text>`;}
  for(let k=0;k<=4;k++){const v=x0+(x1-x0)*k/4;g+=`<text x="${X(v)-6}" y="${H-10}">${Math.round(v)}</text>`;}
  g+=`<line class="zero" x1="${m.l}" x2="${W-m.r}" y1="${Y(0)}" y2="${Y(0)}"/><text x="${W-m.r-60}" y="${H-10}">P/E →</text>`;
  $('#idSc').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dispersión de P/E frente a potencial">${g}${P.map(r=>`<circle class="${topSet.has(r.s)?'top':''}" data-s="${esc(r.s)}" cx="${X(r.pe).toFixed(1)}" cy="${Y(Math.max(-.3,Math.min(.8,r.up))).toFixed(1)}" r="${(4+Math.sqrt(r.m/1e12)*4).toFixed(1)}"><title>${esc(r.s)} · P/E ${r.pe.toFixed(1)} · potencial ${pct(r.up,0)}</title></circle>`).join('')}<text class="tip" id="idTip" x="${m.l+6}" y="${m.t+12}"></text></svg>`;
  $$('#idSc circle').forEach(c=>{c.onpointerenter=()=>{const r=P.find(x=>x.s===c.dataset.s);$('#idTip').textContent=`${r.s} · P/E ${r.pe.toFixed(1)} · potencial ${pct(r.up,0)}`;};c.onclick=()=>coOpen(c.dataset.s);});
  if(window.gsap&&!RM)gsap.from('#idSc circle',{attr:{r:0},duration:.7,ease:'back.out(2)',stagger:{each:.012,from:'random'}});}

/* minigráficos de 6 meses: se cargan al verse */
const SPK={};let spkQ=[],spkRun=0,spkIO=null;
function sparkObs(){if(!('IntersectionObserver' in window)){$$('#idGrid .idspark').forEach(e=>spkQ.push(e));spkPump();return;}
  if(!spkIO)spkIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){spkIO.unobserve(e.target);spkQ.push(e.target);spkPump();}}),{rootMargin:'120px'});
  $$('#idGrid .idspark').forEach(e=>spkIO.observe(e));}
function spkPump(){while(spkRun<2&&spkQ.length){const el=spkQ.shift();spkRun++;spark(el).finally(()=>{spkRun--;spkPump();});}}
async function spark(el){const s=el.dataset.s;try{if(!SPK[s]){const r=await fetch(`${MKT}?symbol=${encodeURIComponent(s)}&range=6m`);const d=await r.json();SPK[s]=(d.pts||[]).map(p=>p[1]);}
  const ys=SPK[s];if(!el.isConnected)return;if(ys.length<2){el.innerHTML='<p class="note" style="margin:20px 0 0">Sin gráfico disponible.</p>';return;}
  const W=300,H=64,mn=Math.min(...ys),mx=Math.max(...ys),X=i=>i/(ys.length-1)*W,Y=v=>H-4-(v-mn)/((mx-mn)||1)*(H-10);const up=ys.at(-1)>=ys[0],col=up?'var(--up)':'var(--down)';
  const d=ys.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join('');const ch=ys.at(-1)/ys[0]-1;const id='g'+s.replace(/\W/g,'');
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="Precio de 6 meses: ${pct(ch)}"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${up?TH.up:TH.down}" stop-opacity=".25"/><stop offset="1" stop-color="${up?TH.up:TH.down}" stop-opacity="0"/></linearGradient></defs><path class="ar" d="${d}L${W} ${H}L0 ${H}Z" fill="url(#${id})"/><path class="ln" d="${d}" stroke="${col}" vector-effect="non-scaling-stroke"/></svg><small style="position:absolute;right:0;top:0;font:600 11px var(--sans);color:${col}">6 meses ${pct(ch)}</small>`;
  const ln=el.querySelector('.ln'),ar=el.querySelector('.ar');if(window.gsap&&!RM&&ln.getTotalLength){const L=ln.getTotalLength();gsap.fromTo(ln,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.3,ease:'power2.inOut'});gsap.from(ar,{opacity:0,duration:1,delay:.5});}}
  catch(e){if(el.isConnected)el.innerHTML='<p class="note" style="margin:20px 0 0">Sin gráfico disponible.</p>';}}

const _sv16=setView;setView=function(v,o){_sv16(v,o);if(v==='ideas'){if(MKT)idLoad();}};
{const v=ID2V[location.hash.slice(1)];if(v==='ideas')setView('ideas',{noHash:true});}
const _accUI16=accUI;accUI=function(){_accUI16();if(VIEW==='ideas'&&IDS.length)idRender();};

/* ---------- cuentas con correo y contraseña (versión web) ---------- */
const AUTH=window.LC_AUTH||null;
if(AUTH){
  let TOK=null;try{TOK=localStorage.getItem('lc_tok');}catch(e){}
  const setTok=t=>{TOK=t;try{t?localStorage.setItem('lc_tok',t):localStorage.removeItem('lc_tok');}catch(e){}};
  async function api(action,body={}){let r;try{r=await fetch(AUTH,{method:'POST',headers:{'content-type':'application/json',...(TOK?{authorization:'Bearer '+TOK}:{})},body:JSON.stringify({action,...body})});}catch(e){throw {code:'network',message:'Sin conexión. Revisa tu internet.'};}
    let d={};try{d=await r.json();}catch(e){}if(!r.ok)throw {status:r.status,code:d.code||'error',message:d.message||'Algo salió mal. Intenta de nuevo.'};return d;}
  let lastSave=0;
  CL.ref={set:async({profile,state})=>{const d=await api('save',{state,profile:{name:profile.name,risk:profile.risk,cur:profile.cur,goal:profile.goal}});lastSave=Date.now();if(d.profile&&ACC)ACC.email=d.profile.email;},
    get:async()=>{const d=await api('me');return {exists:true,data:()=>d};},delete:async()=>{}};
  const _push16=push;push=function(force){if(!force&&Date.now()-lastSave<45000)return Promise.resolve();return _push16(force);};
  addEventListener('pagehide',()=>{if(CL.dirty&&TOK&&ACC&&!ACCOFF){try{fetch(AUTH,{method:'POST',keepalive:true,headers:{'content-type':'application/json',authorization:'Bearer '+TOK},body:JSON.stringify({action:'save',state:gather()})});}catch(e){}}});
  addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&CL.dirty)push(true);});
  const clearLocal=()=>{['acc','accSync','accOff',...SYNC].forEach(k=>rawSet(k,null));setTok(null);};
  const reloadMsg=m=>{try{sessionStorage.setItem('lc_msg',m);sessionStorage.setItem('lc_gate','1');}catch(e){}location.reload();};

  /* sin sesión válida no hay cuenta activa en la web */
  if(!TOK&&ACC&&!ACCOFF){ACCOFF=true;_sset.call(store,'accOff',true);}
  (async()=>{if(!TOK){accUI();return;}
    try{const d=await api('me');CL.ok=true;CL.ready=true;
      if((d.updatedAt||0)>CL.last+1000&&d.state){restore(d);return;}
      ACC={...(ACC||{}),...d.profile};ACCOFF=false;_sset.call(store,'acc',ACC);_sset.call(store,'accOff',false);setRisk(ACC.risk);setSync('ok');accUI();if(!d.state){CL.dirty=true;push(true);}}
    catch(e){if(e.status===401){setTok(null);if(ACC){ACCOFF=true;_sset.call(store,'accOff',true);}toast(e.message,ic('hello','',false));}else{CL.ok=true;CL.ready=true;setSync('err');}accUI();}})();

  const pwScore=p=>{let s=0;if(p.length>=8)s++;if(/[A-Za-z]/.test(p)&&/\d/.test(p))s++;if(p.length>=12)s++;if(/[^A-Za-z0-9]/.test(p)||/[A-Z]/.test(p)&&/[a-z]/.test(p))s++;return p?Math.max(1,s):0;};
  const PWT=['','Débil','Aceptable','Buena','Muy segura'];
  const pwField=(id,ph,ac)=>`<div class="pwrap"><input class="f" id="${id}" type="password" autocomplete="${ac}" placeholder="${ph}" maxlength="128"><button type="button" class="eye" data-for="${id}">Mostrar</button></div>`;
  const bindEyes=()=>$$('#sheetBody .eye').forEach(b=>b.onclick=()=>{const i=$('#'+b.dataset.for);const sh=i.type==='password';i.type=sh?'text':'password';b.textContent=sh?'Ocultar':'Mostrar';});
  const showErr=(m)=>{let e=$('#authErr');if(!e)return;e.textContent=m;e.classList.remove('hidden');if(window.gsap&&!RM)gsap.fromTo(e,{x:-8},{x:0,duration:.4,ease:'elastic.out(1,.3)'});};
  const busy=(b,on,t)=>{b.disabled=on;if(on){b._t=b.textContent;b.textContent=t||'Un momento…';}else if(b._t)b.textContent=b._t;};

  function authSheet(tab,email){
    openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px" id="auH">${tab==='login'?'Inicia sesión':'Crea tu cuenta'}</h3>
      <p class="note" id="auP">${tab==='login'?'Entra con tu correo y contraseña para recuperar tu progreso en cualquier dispositivo.':'Gratis. Tu cartera, tu nivel, tu alcancía y tu diario se guardan en tu cuenta y los abres desde cualquier dispositivo.'}</p>
      <div class="authtabs" data-t="${tab}" role="tablist"><span class="pill2"></span><button type="button" data-t="register" class="${tab!=='login'?'act':''}">Crear cuenta</button><button type="button" data-t="login" class="${tab==='login'?'act':''}">Iniciar sesión</button></div>
      <form id="auF" novalidate>
        <div id="auReg" class="${tab==='login'?'hidden':''}"><label class="l" for="auN">Nombre</label><input class="f" id="auN" maxlength="40" autocomplete="name" value="${esc(ACC?.name||'')}"></div>
        <label class="l" for="auE">Correo electrónico</label><input class="f" id="auE" type="email" inputmode="email" autocomplete="email" maxlength="254" placeholder="tucorreo@ejemplo.com" value="${esc(email||ACC?.email||'')}">
        <label class="l" for="auW">Contraseña</label>${pwField('auW','Mínimo 8 caracteres, con letras y números',tab==='login'?'current-password':'new-password')}
        <div id="auLog" class="aulog ${tab==='login'?'':'hidden'}"><button type="button" class="linkb" id="auForgot">¿Olvidaste tu contraseña?</button></div>
        <div id="auReg2" class="${tab==='login'?'hidden':''}"><div class="pwm" id="auM" data-s="0"><i></i><i></i><i></i><i></i></div><p class="pwt" id="auMt"></p>
          <label class="l">¿Cómo te gusta invertir?</label><div class="seg" id="auR">${[['conservador','Con calma'],['moderado','Equilibrado'],['agresivo','Arriesgado']].map(([k,l])=>`<button type="button" data-v="${k}" class="${(ACC?.risk||idRisk)===k?'act':''}">${l}</button>`).join('')}</div>
          <label class="l">Moneda principal</label><div class="seg" id="auC"><button type="button" data-v="PEN" class="${ACC?.cur!=='USD'?'act':''}">Soles (S/)</button><button type="button" data-v="USD" class="${ACC?.cur==='USD'?'act':''}">Dólares ($)</button></div>
          <label class="chk"><input type="checkbox" id="auOk"> Entiendo que Lucioni Capital es una herramienta educativa y no es asesoría financiera personalizada.</label></div>
        <p class="autherr hidden" id="authErr" role="alert"></p>
        <button class="cta" type="submit" id="auGo" style="width:100%;justify-content:center;margin-top:18px">${tab==='login'?'Entrar':'Crear mi cuenta'}</button>
      </form>
      <p class="authsec">${ic('stop','',false)} Contraseña cifrada con scrypt. Nunca la guardamos en texto ni la vemos.</p></div>`);
    let mode=tab==='login'?'login':'register';
    const setMode=m=>{mode=m;const t=$('#sheetBody .authtabs');t.dataset.t=m;$$('#sheetBody .authtabs button').forEach(b=>b.classList.toggle('act',b.dataset.t===m));
      $('#auReg').classList.toggle('hidden',m==='login');$('#auReg2').classList.toggle('hidden',m==='login');$('#auLog').classList.toggle('hidden',m!=='login');$('#auH').textContent=m==='login'?'Inicia sesión':'Crea tu cuenta';
      $('#auP').textContent=m==='login'?'Entra con tu correo y contraseña para recuperar tu progreso en cualquier dispositivo.':'Gratis. Tu cartera, tu nivel, tu alcancía y tu diario se guardan en tu cuenta y los abres desde cualquier dispositivo.';
      $('#auGo').textContent=m==='login'?'Entrar':'Crear mi cuenta';$('#auW').autocomplete=m==='login'?'current-password':'new-password';$('#authErr').classList.add('hidden');
      if(window.gsap&&!RM)gsap.from(m==='login'?'#auE':'#auReg',{y:8,opacity:0,duration:.35,ease:'expo.out'});};
    $$('#sheetBody .authtabs button').forEach(b=>b.onclick=()=>setMode(b.dataset.t));
    $$('#auR button').forEach(b=>b.onclick=()=>$$('#auR button').forEach(x=>x.classList.toggle('act',x===b)));
    $$('#auC button').forEach(b=>b.onclick=()=>$$('#auC button').forEach(x=>x.classList.toggle('act',x===b)));
    bindEyes();$('#auForgot').onclick=()=>forgotSheet($('#auE').value.trim());
    $('#auW').addEventListener('input',e=>{const s=pwScore(e.target.value);$('#auM').dataset.s=s;$('#auMt').textContent=PWT[s];});
    setTimeout(()=>{const f=mode==='login'?(($('#auE').value)?$('#auW'):$('#auE')):$('#auN');f&&f.focus({preventScroll:true});},350);
    $('#auF').onsubmit=async e=>{e.preventDefault();const email=$('#auE').value.trim(),pw=$('#auW').value,btn=$('#auGo');
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){showErr('Escribe un correo válido.');$('#auE').focus();return;}
      if(mode==='register'){const n=$('#auN').value.trim();if(!n){showErr('Escribe tu nombre.');$('#auN').focus();return;}
        if(pw.length<8||!/[A-Za-z]/.test(pw)||!/\d/.test(pw)){showErr('La contraseña debe tener al menos 8 caracteres, con letras y números.');$('#auW').focus();return;}
        if(!$('#auOk').checked){showErr('Marca la casilla para continuar.');return;}
        busy(btn,true,'Creando tu cuenta…');
        try{const d=await api('register',{email,password:pw,name:n,risk:$('#auR .act').dataset.v,cur:$('#auC .act').dataset.v,goal:ACC?.goal||''});
          setTok(d.token);ACC={...d.profile};ACCOFF=false;_sset.call(store,'acc',ACC);_sset.call(store,'accOff',false);CL.ok=true;CL.ready=true;CL.dirty=true;
          setRisk(ACC.risk);store.set('risk',ACC.risk);await push(true);accUI();
          recSheet(d.recovery,true,()=>{closeSheet();setTimeout(()=>{FX.burst(innerWidth/2,innerHeight*.35,110);SFX.lvl();toast(`Bienvenido a Lucioni Capital, ${n.split(' ')[0]}`,ic('trophy','',false));addXP(25);},350);});}
        catch(err){busy(btn,false);showErr(err.message);if(err.code==='exists')setTimeout(()=>setMode('login'),1400);}
        return;}
      if(!pw){showErr('Escribe tu contraseña.');$('#auW').focus();return;}
      busy(btn,true,'Entrando…');
      try{const d=await api('login',{email,password:pw});await loginDone(d);}
      catch(err){busy(btn,false);showErr(err.message);}};}

  async function loginDone(d){setTok(d.token);
    if(d.state){restore(d);return;}
    ACC={...d.profile};ACCOFF=false;_sset.call(store,'acc',ACC);_sset.call(store,'accOff',false);CL.ok=true;CL.ready=true;CL.dirty=true;setRisk(ACC.risk);await push(true);accUI();closeSheet();
    toast(`Hola de nuevo, ${ACC.name.split(' ')[0]}`,ic('hello','',false));}
  /* código de recuperación: reemplaza al correo de "olvidé mi contraseña" */
  function recSheet(code,isNew,done){
    openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">${isNew?'Tu cuenta está lista':'Nuevo código de recuperación'}</h3>
      <p class="note">Guarda este código en un lugar seguro (una nota, una foto o un papel). Es la única forma de recuperar tu cuenta si olvidas tu contraseña. Solo se muestra una vez.</p>
      <div class="rcode" id="rcBox" aria-label="Código de recuperación">${esc(code).split('').map((c,i)=>`<span style="--i:${i}">${c}</span>`).join('')}</div>
      <div class="acts" style="justify-content:center"><button class="btn" id="rcCopy">${ic('check','',false)} Copiar</button><button class="btn" id="rcDl">Descargar .txt</button></div>
      <label class="chk"><input type="checkbox" id="rcOk"> Ya guardé mi código en un lugar seguro.</label>
      <button class="cta" id="rcGo" disabled style="width:100%;justify-content:center;margin-top:16px">Continuar</button></div>`);
    if(window.gsap&&!RM)gsap.from('#rcBox span',{y:-18,opacity:0,rotateX:-90,duration:.5,ease:'back.out(2)',stagger:.035,delay:.2});
    $('#rcCopy').onclick=async()=>{try{await navigator.clipboard.writeText(code);toast('Código copiado',ic('check','',false));}catch(e){toast('Selecciona el código y cópialo a mano');}};
    $('#rcDl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([`Lucioni Capital — código de recuperación\nCuenta: ${ACC?.email||''}\nCódigo: ${code}\nGenerado: ${new Date().toLocaleString('es-PE')}\n\nÚsalo en "¿Olvidaste tu contraseña?". Cada código sirve una sola vez.\n`],{type:'text/plain'}));a.download='lucioni-capital-recuperacion.txt';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);};
    $('#rcOk').onchange=e=>{$('#rcGo').disabled=!e.target.checked;};
    $('#rcGo').onclick=()=>done?done():closeSheet();}
  function resetSheet(email){
    openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">Recupera tu cuenta</h3>
      <p class="note">Usa el código de recuperación que guardaste al crear tu cuenta y elige una contraseña nueva.</p><form id="rsF" novalidate>
      <label class="l" for="rsE">Correo electrónico</label><input class="f" id="rsE" type="email" autocomplete="email" value="${esc(email||'')}">
      <label class="l" for="rsC">Código de recuperación</label><input class="f mono" id="rsC" autocomplete="one-time-code" placeholder="XXXXX-XXXXX-XXXXX" maxlength="24" style="text-transform:uppercase;letter-spacing:.08em">
      <label class="l" for="rsN">Nueva contraseña</label>${pwField('rsN','Mínimo 8 caracteres, con letras y números','new-password')}
      <p class="autherr hidden" id="authErr" role="alert"></p>
      <button class="cta" type="submit" id="rsGo" style="width:100%;justify-content:center;margin-top:18px">Cambiar contraseña y entrar</button>
      <button type="button" class="linkb" id="rsBack" style="margin-top:12px">Volver a iniciar sesión</button></form>
      <p class="note">¿No tienes tu código? Por seguridad no podemos recuperar la cuenta sin él; puedes crear una cuenta nueva.</p></div>`);
    bindEyes();$('#rsBack').onclick=()=>authSheet('login',$('#rsE').value.trim());
    $('#rsF').onsubmit=async e=>{e.preventDefault();const b=$('#rsGo');busy(b,true,'Verificando…');
      try{const d=await api('reset',{email:$('#rsE').value.trim(),code:$('#rsC').value,next:$('#rsN').value});setTok(d.token);ACC={...(ACC||{}),...d.profile};
        recSheet(d.recovery,false,()=>loginDone(d));toast('Contraseña cambiada. Este es tu nuevo código.',ic('check','',false));}
      catch(err){busy(b,false);showErr(err.message);}};}
  function forgotSheet(email){
    openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">¿Olvidaste tu contraseña?</h3>
      <p class="note">Escribe el correo de tu cuenta y te enviamos un enlace para elegir una nueva. Vence en 30 minutos.</p>
      <form id="fgF" novalidate><label class="l" for="fgE">Correo electrónico</label><input class="f" id="fgE" type="email" inputmode="email" autocomplete="email" value="${esc(email||'')}">
      <p class="autherr hidden" id="authErr" role="alert"></p><div id="fgOk"></div>
      <button class="cta" type="submit" id="fgGo" style="width:100%;justify-content:center;margin-top:16px">Enviarme el enlace</button></form>
      <div class="orline"><span>o</span></div>
      <button class="btn" id="fgCode" style="width:100%;justify-content:center">Usar mi código de recuperación</button>
      <button type="button" class="linkb" id="fgBack" style="margin-top:12px">Volver a iniciar sesión</button></div>`);
    $('#fgCode').onclick=()=>resetSheet($('#fgE').value.trim());$('#fgBack').onclick=()=>authSheet('login',$('#fgE').value.trim());
    setTimeout(()=>{const f=$('#fgE');f&&!f.value&&f.focus({preventScroll:true});},300);
    $('#fgF').onsubmit=async e=>{e.preventDefault();const em=$('#fgE').value.trim(),b=$('#fgGo');if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){showErr('Escribe un correo válido.');return;}
      busy(b,true,'Enviando…');
      try{await api('forgot',{email:em});$('#authErr').classList.add('hidden');b.remove();
        $('#fgOk').innerHTML=`<div class="mailok"><span class="mailic" aria-hidden="true"><svg viewBox="0 0 48 48" width="48" height="48"><rect x="6" y="11" width="36" height="26" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M7 13l17 13 17-13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg></span><div><b>Revisa tu correo</b><p>Si ${esc(em)} tiene una cuenta, te llegará un enlace en unos minutos. Mira también en Spam o Promociones.</p></div></div>`;
        if(window.gsap&&!RM){gsap.from('#fgOk .mailok',{y:14,opacity:0,duration:.5,ease:'expo.out'});gsap.fromTo('#fgOk .mailic',{rotate:-14,scale:.6},{rotate:0,scale:1,duration:.7,ease:'back.out(3)'});}}
      catch(err){busy(b,false);showErr(err.message);if(err.code==='no_mail')$('#fgCode').classList.add('solid');}};}
  function linkSheet(uid,tok){
    openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">Elige una nueva contraseña</h3><p class="note">Abriste el enlace que te enviamos por correo. Crea tu nueva contraseña para entrar.</p>
      <form id="lkF" novalidate><label class="l" for="lkN">Nueva contraseña</label>${pwField('lkN','Mínimo 8 caracteres, con letras y números','new-password')}<div class="pwm" id="lkM" data-s="0"><i></i><i></i><i></i><i></i></div><p class="pwt" id="lkMt"></p>
      <label class="l" for="lkR">Repite la contraseña</label>${pwField('lkR','Escríbela otra vez','new-password')}
      <p class="autherr hidden" id="authErr" role="alert"></p><button class="cta" type="submit" id="lkGo" style="width:100%;justify-content:center;margin-top:16px">Guardar y entrar</button></form></div>`);
    bindEyes();$('#lkN').addEventListener('input',e=>{const sc=pwScore(e.target.value);$('#lkM').dataset.s=sc;$('#lkMt').textContent=PWT[sc];});
    $('#lkF').onsubmit=async e=>{e.preventDefault();const n=$('#lkN').value,b=$('#lkGo');if(n!==$('#lkR').value){showErr('Las contraseñas no coinciden.');return;}
      busy(b,true,'Guardando…');try{const d=await api('resetlink',{uid,token:tok,next:n});toast('Contraseña cambiada',ic('check','',false));await loginDone(d);}catch(err){busy(b,false);showErr(err.message);if(err.code==='link'){const x=document.createElement('button');x.className='btn';x.textContent='Pedir un enlace nuevo';x.style.marginTop='10px';x.onclick=()=>forgotSheet('');$('#lkF').appendChild(x);}}};}
  /* enlace del correo: #reset?u=…&t=… */
  if(/^#reset\?/.test(location.hash)){const q=new URLSearchParams(location.hash.slice(7)),u=q.get('u'),t=q.get('t');try{history.replaceState(null,'',location.pathname+location.search+'#inicio');}catch(e){}
    if(u&&t)setTimeout(()=>{if(!GATE.classList.contains('out'))gateClose(()=>linkSheet(u,t));else linkSheet(u,t);},600);}
  function recNewSheet(){openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">Código de recuperación</h3><p class="note">Genera un código nuevo si perdiste el anterior. El código anterior deja de funcionar.</p><form id="rnF" novalidate>
      <label class="l" for="rnP">Tu contraseña</label>${pwField('rnP','Tu contraseña','current-password')}<p class="autherr hidden" id="authErr" role="alert"></p>
      <button class="cta" type="submit" id="rnGo" style="width:100%;justify-content:center;margin-top:18px">Generar código nuevo</button></form></div>`);
    bindEyes();$('#rnF').onsubmit=async e=>{e.preventDefault();const b=$('#rnGo');busy(b,true);try{const d=await api('recovery',{password:$('#rnP').value});recSheet(d.recovery,false);}catch(err){busy(b,false);showErr(err.message);}};}

  /* iniciar sesión visible en todas partes */
  const _gate17=gateRender;gateRender=function(){_gate17();if(member())return;const box=$('#gBtns');if(!box)return;
    const known=ACC&&ACC.email;
    box.innerHTML=known?`<button class="cta" id="gIn">Entrar como ${esc(ACC.name.split(' ')[0])}</button><button class="btn" id="gNew">Crear otra cuenta</button><button class="btn ghost" id="gGo">Entrar sin cuenta</button>`
      :`<button class="cta" id="gNew">Crear cuenta gratis</button><button class="btn" id="gIn">Iniciar sesión</button><button class="btn ghost" id="gGo">Entrar sin cuenta</button>`;
    $('#gGo').onclick=()=>gateClose();$('#gNew').onclick=()=>gateClose(()=>authSheet('register'));$('#gIn').onclick=()=>gateClose(()=>authSheet('login',ACC?.email||''));};
  if(!GATE.classList.contains('out'))gateRender();
  const _accUI17=accUI;accUI=function(){_accUI17();if(member())return;
    const b=$('#accBtn');b.innerHTML=`${ic('hello','',false)}<span class="tx">Iniciar sesión</span>`;b.setAttribute('aria-label','Iniciar sesión o crear cuenta');
    const c=$('#menuAcc .mcta');if(c){c.innerHTML=`<p>${ACC&&ACC.email?`Hola, ${esc(ACC.name.split(' ')[0])}. Entra para seguir donde lo dejaste.`:'Crea tu cuenta con tu correo y guarda tu cartera, tus ideas, tu nivel y tu diario en cualquier dispositivo.'}</p><div class="acts"><button class="btn solid" id="mIn">Iniciar sesión</button><button class="btn" id="mNew">Crear cuenta</button></div>`;
      $('#mIn').onclick=()=>{closeMenu();authSheet('login',ACC?.email||'');};$('#mNew').onclick=()=>{closeMenu();authSheet('register');};}};
  $('#accBtn').onclick=()=>{member()?openAccount():authSheet('login',ACC?.email||'');};
  accUI();
  lockCard=(function(orig){return function(key){return orig(key).replace(/<button class="btn lkin">[^<]*<\/button>/,'').replace('<button class="cta lkgo">Crear cuenta gratis</button>','<button class="cta lkgo">Crear cuenta gratis</button><button class="btn lkin">Iniciar sesión</button>');};})(lockCard);
  const _idr17=idRender;idRender=function(){_idr17();const l=$('#idGrid .idlock');if(l&&!l.querySelector('.idin')){const b=document.createElement('button');b.className='btn idin';b.textContent='Iniciar sesión';b.style.marginLeft='8px';b.onclick=()=>signIn();$('#idGo').after(b);}};

  const _openAcc16=openAccount;
  openAccount=function(edit){
    if(!(TOK&&ACC&&!ACCOFF)){authSheet('register');return;}
    _openAcc16(edit);
    if(edit)return;
    const n=$('#sheetBody .note:last-child');if(n)n.textContent='Tu cuenta está protegida con tu correo y contraseña. Entra desde cualquier dispositivo y sigues donde lo dejaste.';
    const rows=$('#sheetBody .accrows');if(rows&&ACC.email)rows.insertAdjacentHTML('afterbegin',`<div><span>Correo</span><b>${esc(ACC.email)}</b></div>`);
    const acts=$('#aEdit')?.parentNode;if(acts){const b=document.createElement('button');b.className='btn';b.textContent='Cambiar contraseña';b.onclick=pwSheet;acts.appendChild(b);const r=document.createElement('button');r.className='btn';r.textContent='Código de recuperación';r.onclick=recNewSheet;acts.appendChild(r);}
    $('#aOut').onclick=async()=>{await push(true).catch(()=>{});clearLocal();reloadMsg('Sesión cerrada. Tus datos quedan guardados en tu cuenta.');};
    $('#aDel').onclick=delSheet;};
  signIn=function(){authSheet('login',ACC?.email||'');};
  delAccount=function(){delSheet();};

  function pwSheet(){openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">Cambiar contraseña</h3><form id="pwF" novalidate>
      <label class="l" for="pwC">Contraseña actual</label>${pwField('pwC','Tu contraseña actual','current-password')}
      <label class="l" for="pwN">Nueva contraseña</label>${pwField('pwN','Mínimo 8 caracteres, con letras y números','new-password')}
      <p class="autherr hidden" id="authErr" role="alert"></p><button class="cta" type="submit" id="pwGo" style="width:100%;justify-content:center;margin-top:18px">Guardar nueva contraseña</button></form></div>`);
    bindEyes();$('#pwF').onsubmit=async e=>{e.preventDefault();const b=$('#pwGo');busy(b,true);
      try{await api('password',{current:$('#pwC').value,next:$('#pwN').value});closeSheet();toast('Contraseña actualizada',ic('check','',false));}catch(err){busy(b,false);showErr(err.message);}};}
  function delSheet(){openSheet(`${brandHead()}<div class="stepin"><h3 style="font-size:24px;margin-top:6px">Borrar cuenta</h3><p class="note">Se borran para siempre tu perfil, tu cartera de práctica, tu nivel, tu alcancía y tu diario. No se puede deshacer.</p><form id="dlF" novalidate>
      <label class="l" for="dlP">Escribe tu contraseña para confirmar</label>${pwField('dlP','Tu contraseña','current-password')}
      <p class="autherr hidden" id="authErr" role="alert"></p><button class="btn red" type="submit" id="dlGo" style="width:100%;justify-content:center;margin-top:18px">Borrar mi cuenta para siempre</button></form></div>`);
    bindEyes();$('#dlF').onsubmit=async e=>{e.preventDefault();const b=$('#dlGo');busy(b,true,'Borrando…');
      try{await api('delete',{password:$('#dlP').value});clearLocal();reloadMsg('Cuenta borrada. Empiezas de cero.');}catch(err){busy(b,false);showErr(err.message);}};}
}

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

/* ===================== V19: metas financieras, comparador y efectos ===================== */
/* ---------- metas: planificación por objetivos ---------- */
VIEWS.goals=['metas'];V2ID.goals='metas';ID2V.metas='goals';VTITLE.goals='Metas';
SYNC.push('goals');
let GOALS=store.get('goals',[]);if(!Array.isArray(GOALS))GOALS=[];
const saveGoals=()=>store.set('goals',GOALS);
const GPROF={conservador:{r:.045,v:.06,l:'Conservador (60% bonos)'},moderado:{r:.065,v:.11,l:'Moderado (60% acciones)'},agresivo:{r:.085,v:.16,l:'Agresivo (90% acciones)'}};
const GTPL=[['emergencia','Fondo de emergencia','stop',6000,1,'conservador'],['casa','Casa propia','buy',80000,7,'moderado'],['retiro','Retiro','compuesto',600000,30,'agresivo'],['educacion','Educación','cap',40000,10,'moderado'],['viaje','Viaje','target',8000,2,'conservador'],['otra','Meta personalizada','dividendo',20000,5,'moderado']];
const gIcon=c=>(GTPL.find(t=>t[0]===c)||GTPL[5])[2];
const gCur=g=>g.cur==='USD'?'$':'S/';
const gMoney=(g,v)=>`${gCur(g)} ${Math.round(v).toLocaleString('en-US')}`;
const INF=.025;
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function monthsTo(d){const t=new Date(d+'T00:00:00'),n=new Date();return Math.max(1,(t.getFullYear()-n.getFullYear())*12+(t.getMonth()-n.getMonth()));}
function gTarget(g){const yrs=monthsTo(g.date)/12;return g.real?g.target*Math.pow(1+INF,yrs):g.target;}
/* simulación mensual con rendimientos lognormales */
function gSim(g,opt={}){const M=opt.months||monthsTo(g.date),P=GPROF[g.risk]||GPROF.moderado,r=opt.r??P.r,v=opt.v??P.v,c=opt.c??g.monthly,N=opt.n||700,keep=opt.keep;
  const mu=Math.log(1+r)/12,s=v/Math.sqrt(12),R=rng(opt.seed||12345),fin=new Float64Array(N),T=opt.target??gTarget(g),step=Math.max(1,Math.round(M/40)),snaps=keep?[]:null;
  const cols=keep?Math.floor(M/step)+1:0,grid=keep?Array.from({length:cols},()=>new Float64Array(N)):null;
  for(let i=0;i<N;i++){let x=g.saved;if(keep)grid[0][i]=x;for(let m=1;m<=M;m++){const u1=R()||1e-9,u2=R(),z=Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);x=(x+c)*Math.exp(mu-s*s/2+s*z);if(keep&&m%step===0)grid[m/step][i]=x;}fin[i]=x;}
  const sorted=Array.from(fin).sort((a,b)=>a-b),q=p=>sorted[Math.min(N-1,Math.floor(p*N))];
  const prob=sorted.filter(x=>x>=T).length/N;
  let bands=null;if(keep){bands=grid.map((col,k)=>{const s2=Array.from(col).sort((a,b)=>a-b),qq=p=>s2[Math.min(N-1,Math.floor(p*N))];return {m:k*step,p10:qq(.1),p50:qq(.5),p90:qq(.9)};});}
  return {prob,p10:q(.1),p50:q(.5),p90:q(.9),T,M,bands};}
function gNeeded(g,target=.8){let lo=0,hi=Math.max(gTarget(g)/monthsTo(g.date),1);for(let k=0;k<4&&gSim(g,{c:hi,n:300}).prob<target;k++)hi*=2;
  for(let k=0;k<16;k++){const m=(lo+hi)/2;if(gSim(g,{c:m,n:300}).prob>=target)hi=m;else lo=m;}return hi;}
function gDet(g,c=g.monthly){const M=monthsTo(g.date),r=Math.pow(1+GPROF[g.risk].r,1/12)-1;let x=g.saved;const path=[x];for(let m=1;m<=M;m++){x=(x+c)*(1+r);path.push(x);}return path;}
function gStatus(p){return p>=.8?['ok','En camino']:p>=.5?['mid','En riesgo']:['bad','Fuera de ruta'];}

{const sec=$('#metas');const b=document.createElement('div');b.className='backbar';b.innerHTML=`<button class="backb" aria-label="Volver al inicio">${ic('right','',false)}<span>Inicio</span></button><span class="crumb">Metas</span>`;sec.prepend(b);b.querySelector('button').onclick=()=>setView('inicio');}
['#nav','#nav2'].forEach(n=>{const ref=$(n+' a[data-p="port"]');if(!ref)return;const a=document.createElement('a');a.href='#metas';a.dataset.p='goals';a.textContent='Metas';a.addEventListener('click',e=>{e.preventDefault();setView('goals');});ref.after(a);});
$$('#hub .htile[data-v="goals"]').forEach(t=>t.addEventListener('click',()=>setView('goals')));
{const col=$('#menu .mcol');if(col){const b=document.createElement('button');b.className='mi2';b.setAttribute('role','menuitem');b.innerHTML=`${ic('target','',false)}<span>Metas financieras<small>Probabilidad de lograr cada objetivo</small></span>`;b.onclick=()=>{closeMenu();setView('goals');};const f=col.querySelector('.mi2');f?f.after(b):col.appendChild(b);}}

function goalsRender(){const box=$('#gWrap');if(!box)return;
  const st=GOALS.map(g=>({g,s:gSim(g)}));const tot=GOALS.reduce((a,g)=>a+(g.cur==='USD'?g.saved*(FXD.rate||3.75):g.saved),0),mon=GOALS.reduce((a,g)=>a+(g.cur==='USD'?g.monthly*(FXD.rate||3.75):g.monthly),0);
  const onT=st.filter(x=>x.s.prob>=.8).length;
  box.innerHTML=`<div class="pfkpis"><div class="pfk"><small>Ahorrado en tus metas</small><b>S/ ${Math.round(tot).toLocaleString('en-US')}</b><span>${GOALS.length} meta${GOALS.length===1?'':'s'} · dólares convertidos a S/ ${(FXD.rate||3.75).toFixed(2)}</span></div>
      <div class="pfk"><small>Aporte mensual total</small><b>S/ ${Math.round(mon).toLocaleString('en-US')}</b><span>Lo que destinas cada mes</span></div>
      <div class="pfk"><small>Metas en camino</small><b style="color:var(${onT===GOALS.length&&GOALS.length?'--up':'--ink'})">${onT} de ${GOALS.length}</b><span>Con 80% o más de probabilidad</span></div>
      <div class="pfk"><small>Supuestos</small><b style="font-size:18px">Inflación ${(INF*100).toFixed(1)}%</b><span>Rendimientos según perfil, después de costos</span></div></div>
    <div class="ggrid">${st.map(({g,s},i)=>gCard(g,s,i)).join('')}<button class="gnew" id="gNewB"><span>${ic('target','',false)}</span><b>Nueva meta</b><small>Fondo de emergencia, casa, retiro, educación…</small></button></div>
    <details class="panel idhow"><summary>Cómo calculamos la probabilidad ${ic('right','',false)}</summary><p class="note" style="margin-top:10px">Simulamos 700 escenarios de mercado mes a mes con rendimientos aleatorios (distribución lognormal) según el perfil de riesgo de cada meta: conservador ${pctF(GPROF.conservador.r)} anual con volatilidad ${pctF(GPROF.conservador.v,0)}, moderado ${pctF(GPROF.moderado.r)} con ${pctF(GPROF.moderado.v,0)}, agresivo ${pctF(GPROF.agresivo.r)} con ${pctF(GPROF.agresivo.v,0)}. La probabilidad es el porcentaje de escenarios que alcanzan el monto objetivo en la fecha. Si eliges "en soles de hoy", el objetivo se ajusta por una inflación de ${(INF*100).toFixed(1)}% anual (meta del BCRP: 1%–3%).</p>
      <p class="disc">Proyección educativa basada en supuestos; los mercados pueden rendir menos de lo esperado durante muchos años. Para metas de menos de 3 años suele ser prudente un perfil conservador.</p></details>`;
  $('#gNewB').onclick=()=>{if(!member()&&GOALS.length>=1){toast('Crea tu cuenta gratis para tener más de una meta',ic('hello','',false));openAccount();return;}gEdit();};
  $$('#gWrap .gcard').forEach(c=>c.onclick=()=>gDetail(+c.dataset.i));
  const cards=$$('#gWrap .gcard');if(window.gsap&&!RM)gsap.fromTo(cards,{y:24,opacity:0},{y:0,opacity:1,duration:.6,ease:'expo.out',stagger:.06,clearProps:'transform,opacity'});
  cards.forEach(c=>{const fg=c.querySelector('.fg'),n=c.querySelector('.gpct');if(window.gsap&&!RM){gsap.to(fg,{attr:{'stroke-dashoffset':fg.dataset.o},duration:1.3,ease:'expo.out',delay:.2});countUp(n,+n.dataset.v,v=>Math.round(v)+'%');}else{fg.setAttribute('stroke-dashoffset',fg.dataset.o);n.textContent=n.dataset.v+'%';}
    const pth=c.querySelector('.gsp path.p');if(pth&&window.gsap&&!RM&&pth.getTotalLength){const L=pth.getTotalLength();gsap.fromTo(pth,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.4,ease:'power2.inOut',delay:.3});}});}
function gCard(g,s,i){const T=gTarget(g),pr=Math.min(1,g.saved/T),C=2*Math.PI*30,[k,l]=gStatus(s.prob),path=gDet(g),W=220,H=50,mx=Math.max(T,path.at(-1))*1.05,X=m=>m/(path.length-1)*W,Y=v=>H-v/mx*H;
  const step=Math.max(1,Math.floor(path.length/50)),d=path.filter((_,m)=>m%step===0||m===path.length-1).map((v,j,a)=>(j?'L':'M')+X(j*(path.length-1)/(a.length-1)).toFixed(1)+' '+Y(v).toFixed(1)).join('');
  return `<button class="gcard" data-i="${i}"><div class="gch"><span class="gic">${ic(gIcon(g.cat),'',false)}</span><span class="gnm"><b>${esc(g.name)}</b><small>${new Date(g.date+'T00:00:00').toLocaleDateString('es-PE',{month:'long',year:'numeric'})} · ${GPROF[g.risk].l.split(' ')[0]}</small></span><span class="gst ${k}">${l}</span></div>
    <div class="gmid"><div class="gring"><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" class="bg"/><circle cx="36" cy="36" r="30" class="fg" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" data-o="${(C*(1-s.prob)).toFixed(1)}" style="stroke:var(--${k==='ok'?'up':k==='mid'?'gold':'down'})"/></svg><span class="gpct" data-v="${Math.round(s.prob*100)}">0%</span><small>probabilidad</small></div>
      <div class="gnums"><div><small>Ahorrado</small><b>${gMoney(g,g.saved)}</b></div><div><small>${g.real?'Objetivo ajustado':'Objetivo'}</small><b>${gMoney(g,T)}</b></div><div><small>Aporte mensual</small><b>${gMoney(g,g.monthly)}</b></div></div></div>
    <div class="gbar"><i style="width:${(pr*100).toFixed(1)}%"></i></div><div class="gbl"><span>${(pr*100).toFixed(0)}% reunido</span><span>Escenario central: ${gMoney(g,s.p50)}</span></div>
    <svg class="gsp" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><line x1="0" x2="${W}" y1="${Y(T)}" y2="${Y(T)}" class="t"/><path class="p" d="${d}"/></svg></button>`;}
function gEdit(i){const g=i!=null?GOALS[i]:null;const tpl=g?null:GTPL[0];
  const dd=y=>{const d=new Date();d.setFullYear(d.getFullYear()+y);return d.toISOString().slice(0,10);};
  openSheet(`<div class="stepin"><h3 style="font-size:24px;margin-top:6px">${g?'Editar meta':'Nueva meta'}</h3>
    ${g?'':`<div class="gtpl" id="gTpl">${GTPL.map((t,k)=>`<button type="button" data-k="${k}" class="${k?'':'act'}">${ic(t[2],'',false)}<span>${t[1]}</span></button>`).join('')}</div>`}
    <form id="gF" novalidate><label class="l" for="gN">Nombre</label><input class="f" id="gN" maxlength="40" value="${esc(g?g.name:tpl[1])}">
      <div class="dcfn"><div><label class="l" for="gT">Monto objetivo</label><input class="f" id="gT" type="number" min="0" step="any" value="${g?g.target:tpl[3]}"></div><div><label class="l" for="gD">Fecha objetivo</label><input class="f" id="gD" type="date" value="${g?g.date:dd(tpl[4])}"></div>
      <div><label class="l" for="gS">Ya tengo ahorrado</label><input class="f" id="gS" type="number" min="0" step="any" value="${g?g.saved:0}"></div><div><label class="l" for="gM">Aporte mensual</label><input class="f" id="gM" type="number" min="0" step="any" value="${g?g.monthly:Math.round(tpl[3]/(tpl[4]*12))}"></div></div>
      <label class="l">Moneda</label><div class="seg" id="gC"><button type="button" data-v="PEN" class="${!g||g.cur!=='USD'?'act':''}">Soles (S/)</button><button type="button" data-v="USD" class="${g&&g.cur==='USD'?'act':''}">Dólares ($)</button></div>
      <label class="l">Cómo invertirás este dinero</label><div class="seg" id="gR">${Object.entries(GPROF).map(([k2,p])=>`<button type="button" data-v="${k2}" class="${(g?g.risk:tpl[5])===k2?'act':''}">${p.l.split(' (')[0]}</button>`).join('')}</div>
      <label class="chk"><input type="checkbox" id="gI" ${g&&g.real?'checked':''}> El monto es en dinero de hoy (ajustar por inflación)</label>
      <p class="autherr hidden" id="gE"></p>
      <button class="cta" type="submit" style="width:100%;justify-content:center;margin-top:16px">${g?'Guardar cambios':'Crear meta'}</button></form></div>`);
  const segs=id=>$$(id+' button').forEach(b=>b.onclick=()=>$$(id+' button').forEach(x=>x.classList.toggle('act',x===b)));segs('#gC');segs('#gR');
  $$('#gTpl button').forEach(b=>b.onclick=()=>{$$('#gTpl button').forEach(x=>x.classList.toggle('act',x===b));const t=GTPL[+b.dataset.k];$('#gN').value=t[1];$('#gT').value=t[3];$('#gD').value=dd(t[4]);$('#gM').value=Math.round(t[3]/(t[4]*12));$$('#gR button').forEach(x=>x.classList.toggle('act',x.dataset.v===t[5]));});
  $('#gF').onsubmit=e=>{e.preventDefault();const v=id=>parseFloat($(id).value),err=t=>{$('#gE').textContent=t;$('#gE').classList.remove('hidden');};
    const o={name:$('#gN').value.trim()||'Mi meta',target:v('#gT'),date:$('#gD').value,saved:v('#gS')||0,monthly:v('#gM')||0,cur:$('#gC .act').dataset.v,risk:$('#gR .act').dataset.v,real:$('#gI').checked,cat:g?g.cat:GTPL[+(($('#gTpl .act')||{}).dataset?.k||5)][0],log:g?g.log:[],at:g?g.at:Date.now()};
    if(!(o.target>0))return err('Indica el monto objetivo.');if(!o.date||new Date(o.date)<=new Date())return err('La fecha objetivo debe ser futura.');
    if(g)GOALS[i]=o;else GOALS.push(o);saveGoals();closeSheet();goalsRender();toast(g?'Meta actualizada':'Meta creada',ic('check','',false));if(!g)addXP&&addXP(10);};}
function gDetail(i){const g=GOALS[i];if(!g)return;
  openSheet(`<div class="stepin"><div class="gdh"><span class="gic big">${ic(gIcon(g.cat),'',false)}</span><div><h3 style="font-size:24px">${esc(g.name)}</h3><p class="note" style="margin:0">${gMoney(g,gTarget(g))} para ${new Date(g.date+'T00:00:00').toLocaleDateString('es-PE',{month:'long',year:'numeric'})} · ${GPROF[g.risk].l}</p></div></div>
    <div class="fkg" id="gdK"></div><div class="fachart" id="gdC"></div>
    <h4 style="margin:6px 0 4px">¿Y si cambio algo?</h4><p class="note">Mueve los controles para ver el efecto en la probabilidad. No se guardan hasta que toques "Aplicar".</p>
    <div class="dcfs"><label class="l" for="wC">Aporte mensual <b id="wCv"></b></label><input type="range" id="wC" min="0" max="${Math.max(100,Math.round(g.monthly*3+gTarget(g)/monthsTo(g.date)))}" step="10" value="${g.monthly}"></div>
    <div class="dcfs"><label class="l" for="wY">Meses adicionales <b id="wYv"></b></label><input type="range" id="wY" min="0" max="120" step="6" value="0"></div>
    <div class="dcfs"><label class="l" for="wR">Rendimiento anual esperado <b id="wRv"></b></label><input type="range" id="wR" min="1" max="12" step=".5" value="${(GPROF[g.risk].r*100).toFixed(1)}"></div>
    <div class="acts"><button class="btn solid" id="wApply">Aplicar aporte</button><button class="btn" id="gAdd">Registrar aporte</button><button class="btn" id="gEd">Editar meta</button><button class="btn red" id="gDel">Eliminar</button></div>
    <div id="gLog"></div>
    <p class="disc">Proyección basada en 700 escenarios simulados. No es una garantía de resultados.</p></div>`);
  const draw=first=>{const c=+$('#wC').value,ex=+$('#wY').value,r=+$('#wR').value/100,M=monthsTo(g.date)+ex,T=g.real?g.target*Math.pow(1+INF,M/12):g.target;
    $('#wCv').textContent=gMoney(g,c);$('#wYv').textContent=ex?`+${ex} (${(ex/12).toFixed(1)} años)`:'Ninguno';$('#wRv').textContent=(r*100).toFixed(1)+'%';
    const s=gSim(g,{c,months:M,r,target:T,keep:true}),[k,l]=gStatus(s.prob),need=gNeeded({...g,date:new Date(Date.now()+M*30.44*864e5).toISOString().slice(0,10)},.8);
    $('#gdK').innerHTML=`<div class="fk"><small>Probabilidad</small><b style="color:var(--${k==='ok'?'up':k==='mid'?'gold':'down'})">${Math.round(s.prob*100)}%</b><span>${l}</span></div><div class="fk"><small>Escenario central</small><b>${gMoney(g,s.p50)}</b><span>Rango probable ${gMoney(g,s.p10)} – ${gMoney(g,s.p90)}</span></div>
      <div class="fk"><small>Aporte para 80%</small><b>${gMoney(g,need)}</b><span>al mes${need>c?`, ${gMoney(g,need-c)} más que ahora`:', ya lo cubres'}</span></div><div class="fk"><small>Plazo</small><b>${(M/12).toFixed(1)} años</b><span>${M} aportes mensuales</span></div>`;
    const B=s.bands,W=Math.max(320,($('#gdC').clientWidth||520)),H=230,p={l:56,r:12,t:12,b:24},mx=Math.max(T*1.1,B.at(-1).p90),X=m=>p.l+m/M*(W-p.l-p.r),Y=v=>p.t+(1-Math.min(v,mx)/mx)*(H-p.t-p.b);
    const area=B.map(b=>`${X(b.m).toFixed(1)},${Y(b.p90).toFixed(1)}`).join(' ')+' '+[...B].reverse().map(b=>`${X(b.m).toFixed(1)},${Y(b.p10).toFixed(1)}`).join(' ');
    let gg='';for(let q=0;q<=4;q++){const v=mx*q/4;gg+=`<line class="ax" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v)+4}">${v>=1e6?(v/1e6).toFixed(1)+' M':Math.round(v/1000)+' mil'}</text>`;}
    const yrs=Math.ceil(M/12);for(let y=0;y<=yrs;y+=Math.max(1,Math.ceil(yrs/6)))gg+=`<text x="${X(Math.min(M,y*12))}" y="${H-6}" text-anchor="middle">${new Date().getFullYear()+y}</text>`;
    gg+=`<polygon points="${area}" class="fan"/><path class="med" d="${B.map((b,j)=>(j?'L':'M')+X(b.m).toFixed(1)+' '+Y(b.p50).toFixed(1)).join('')}"/><line class="tgt" x1="${p.l}" x2="${W-p.r}" y1="${Y(T)}" y2="${Y(T)}"/><text class="tl" x="${W-p.r}" y="${Y(T)-6}" text-anchor="end">Objetivo ${gMoney(g,T)}</text>`;
    $('#gdC').innerHTML=svgEl(W,H,gg,'Proyección de la meta con rango probable')+`<div class="faleg"><span><i style="background:color-mix(in srgb,var(--accent) 22%,transparent)"></i>Rango probable (80% de escenarios)</span><span><i style="background:var(--accent)"></i>Escenario central</span><span><i class="dash"></i>Objetivo</span></div>`;
    if(first&&window.gsap&&!RM){const m2=$('#gdC .med');if(m2.getTotalLength){const L=m2.getTotalLength();gsap.fromTo(m2,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.4,ease:'power2.inOut'});}gsap.from('#gdC .fan',{opacity:0,duration:1.2,delay:.3});}};
  let tq=0;['#wC','#wY','#wR'].forEach(id=>$(id).addEventListener('input',()=>{cancelAnimationFrame(tq);tq=requestAnimationFrame(()=>draw(false));}));draw(true);
  const logR=()=>{const L=(g.log||[]).slice(-6).reverse();$('#gLog').innerHTML=L.length?`<h4 style="margin:14px 0 6px">Últimos aportes</h4><div class="tblw"><table class="ftbl"><tbody>${L.map(x=>`<tr><td>${new Date(x.t).toLocaleDateString('es-PE',{day:'numeric',month:'short',year:'numeric'})}</td><td style="text-align:right">${x.a>=0?'+':''}${gMoney(g,x.a)}</td></tr>`).join('')}</tbody></table></div>`:'';};logR();
  $('#wApply').onclick=()=>{g.monthly=+$('#wC').value;saveGoals();goalsRender();toast('Aporte mensual actualizado',ic('check','',false));};
  $('#gEd').onclick=()=>gEdit(i);
  $('#gDel').onclick=e=>{const b=e.currentTarget;if(!b._a){b._a=1;b.textContent='Toca otra vez para eliminar';setTimeout(()=>{b._a=0;b.textContent='Eliminar';},2500);return;}GOALS.splice(i,1);saveGoals();closeSheet();goalsRender();};
  $('#gAdd').onclick=()=>{if($('#gAr')){$('#gAv').focus();return;}$('#gLog').insertAdjacentHTML('beforebegin',`<form class="gaddrow" id="gAr"><label class="l" for="gAv">Monto del aporte (${gCur(g)}). Usa un número negativo para un retiro.</label><div><input class="f" id="gAv" type="number" step="any" value="${g.monthly||''}"><button class="cta" type="submit">Registrar</button></div></form>`);$('#gAv').focus();
    $('#gAr').onsubmit=ev=>{ev.preventDefault();const v=parseFloat($('#gAv').value);if(!isFinite(v)||!v)return;$('#gAr').remove();const before=g.saved/gTarget(g);g.saved=Math.max(0,g.saved+v);(g.log=g.log||[]).push({t:Date.now(),a:v});saveGoals();goalsRender();draw(false);logR();
    const after=g.saved/gTarget(g);const ms=[.25,.5,.75,1].find(x=>before<x&&after>=x);if(ms){FX.burst(innerWidth/2,innerHeight*.4,ms===1?140:70);SFX.lvl&&SFX.lvl();toast(ms===1?`¡Meta "${g.name}" alcanzada!`:`Llegaste al ${ms*100}% de "${g.name}"`,ic('trophy','',false));}else toast('Aporte registrado',ic('check','',false));};};}
const _sv19=setView;setView=function(v,o){_sv19(v,o);if(v==='goals')goalsRender();};
{const v=ID2V[location.hash.slice(1)];if(v==='goals')setView('goals',{noHash:true});}
addEventListener('storage',e=>{if(e.key==='lc_goals'){GOALS=store.get('goals',[]);if(VIEW==='goals')goalsRender();}});

/* ---------- comparador de rendimiento ---------- */
TOOLS.push('perf');LOCKS['tool:perf']=['Comparador de rendimiento','Compara hasta 5 acciones o ETF en los últimos 12 meses: rendimiento, volatilidad, Sharpe, caída máxima y correlación.'];
{const ref=$('#tnav button[data-t="dcf"]');if(ref){const a=document.createElement('button');a.dataset.t='perf';a.textContent='Comparar rendimiento';ref.after(a);a.onclick=()=>tool('perf');}}
let PERF=['SPY','AAPL','MSFT'];
function perfChips(){$('#prChips').innerHTML=PERF.map((s,i)=>`<span class="pchip" style="--c:${COLORS[i%COLORS.length]}"><i></i>${esc(s)}<button aria-label="Quitar ${esc(s)}" data-s="${esc(s)}">×</button></span>`).join('');
  $$('#prChips button').forEach(b=>b.onclick=()=>{PERF=PERF.filter(x=>x!==b.dataset.s);perfChips();perfRun();});}
async function perfRun(){const out=$('#prOut');if(!MKT){out.innerHTML='<p class="note">Disponible en la versión web, que tiene acceso a datos de mercado.</p>';return;}if(!PERF.length){out.innerHTML='<p class="note">Agrega al menos un símbolo.</p>';return;}
  out.innerHTML='<div class="idskel" style="height:260px"></div>';
  try{const D={};for(const s of PERF){try{D[s]=await h1y(s);}catch(e){D[s]=[];}}const ok=PERF.filter(s=>D[s].length>60);if(!ok.length)throw 0;
    const base=D[ok[0]].map(p=>new Date(p[0]).toISOString().slice(0,10));const al=s=>{const m=new Map(D[s].map(p=>[new Date(p[0]).toISOString().slice(0,10),p[1]]));let l=null;return base.map(d=>{if(m.has(d))l=m.get(d);return l;});};
    let start=0;const A=ok.map(al);while(start<base.length&&A.some(a=>a[start]==null))start++;
    const S=ok.map((s,i)=>{const c=A[i].slice(start),r=c.slice(1).map((v,t)=>v/c[t]-1),n=r.length,cum=c.map(v=>v/c[0]*100);let pk=0,dd=0;cum.forEach(v=>{pk=Math.max(pk,v);dd=Math.min(dd,v/pk-1);});const vol=sd(r)*Math.sqrt(252),ann=Math.pow(cum.at(-1)/100,252/n)-1;return {s,r,cum,ret:cum.at(-1)/100-1,vol,sh:(ann-.04)/vol,dd,col:COLORS[PERF.indexOf(s)%COLORS.length]};});
    const W=Math.max(340,Math.min(1100,out.clientWidth||700)),H=260,p={l:40,r:90,t:12,b:24},all=S.flatMap(x=>x.cum),mx=Math.max(...all),mn=Math.min(...all),N=S[0].cum.length,X=t=>p.l+t/(N-1)*(W-p.l-p.r),Y=v=>p.t+(mx-v)/((mx-mn)||1)*(H-p.t-p.b);
    let g='';for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4;g+=`<line class="ax" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v)+4}">${v.toFixed(0)}</text>`;}
    S.forEach(x=>{g+=`<path class="pl2" stroke="${x.col}" d="${x.cum.map((v,t)=>(t?'L':'M')+X(t).toFixed(1)+' '+Y(v).toFixed(1)).join('')}"/><text x="${W-p.r+6}" y="${Y(x.cum.at(-1))+4}" fill="${x.col}" class="pe2">${esc(x.s)} ${x.ret>=0?'+':''}${(x.ret*100).toFixed(1)}%</text>`;});
    const corr=(a,b)=>cov(a,b)/(sd(a)*sd(b));const spy=S.find(x=>x.s==='SPY');
    out.innerHTML=`<div class="fachart">${svgEl(W,H,g,'Rendimiento comparado, base 100')}</div>
      <div class="tblw"><table class="ftbl"><thead><tr><th>Símbolo</th><th>Rendimiento 12 m</th><th>Volatilidad anual</th><th>Sharpe</th><th>Caída máxima</th>${spy?'<th>Beta vs S&amp;P 500</th>':''}</tr></thead><tbody>${S.map(x=>`<tr><td><b style="color:${x.col}">${esc(x.s)}</b></td><td class="${x.ret>=0?'u':'d'}">${pctF(x.ret)}</td><td>${pctF(x.vol)}</td><td>${x.sh.toFixed(2)}</td><td class="d">${pctF(x.dd)}</td>${spy?`<td>${(cov(x.r,spy.r)/(sd(spy.r)**2)).toFixed(2)}</td>`:''}</tr>`).join('')}</tbody></table></div>
      ${S.length>1?`<h4 style="margin:10px 0 6px">Correlación</h4><div class="tblw"><table class="corr"><thead><tr><th></th>${S.map(x=>`<th>${esc(x.s)}</th>`).join('')}</tr></thead><tbody>${S.map(a=>`<tr><th>${esc(a.s)}</th>${S.map(b=>{const v=corr(a.r,b.r);return `<td style="background:color-mix(in srgb,var(${v>=0?'--accent':'--up'}) ${Math.round(Math.abs(v)*70)}%,transparent);color:${Math.abs(v)>.6?'var(--paper)':'var(--ink)'}">${v.toFixed(2)}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`:''}
      ${PERF.length>ok.length?`<p class="note">Sin datos suficientes: ${PERF.filter(s=>!ok.includes(s)).join(', ')}.</p>`:''}
      <p class="disc">Precios de cierre diarios de los últimos 12 meses, sin dividendos reinvertidos. Sharpe con tasa libre de riesgo de 4%.</p>`;
    if(window.gsap&&!RM){$$('#prOut .pl2').forEach((pth,i)=>{const L=pth.getTotalLength();gsap.fromTo(pth,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.5,ease:'power2.inOut',delay:i*.12});});gsap.from('#prOut .pe2',{opacity:0,x:-6,duration:.5,delay:1.2,stagger:.08});}}
  catch(e){out.innerHTML='<p class="note">No se pudieron cargar los precios. Intenta de nuevo en un momento.</p>';}}
$('#prF').onsubmit=e=>{e.preventDefault();const s=$('#prS').value.trim().toUpperCase().split(/[\s,·]/)[0];if(!/^[A-Z.\-]{1,10}$/.test(s))return;if(PERF.includes(s)){$('#prS').value='';return;}if(PERF.length>=5){toast('Máximo 5 símbolos');return;}PERF.push(s);$('#prS').value='';perfChips();perfRun();};
const _tool19=tool;tool=function(t){_tool19(t);if(t==='perf'){perfChips();if(!$('#prOut').dataset.done){$('#prOut').dataset.done=1;perfRun();}}};

/* ---------- efectos ---------- */
const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
/* luz que sigue al cursor en tarjetas y paneles */
if(FINE&&!RM)document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.panel,.idc,.gcard,.pfk,.fk,.htile,.corow');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');},{passive:true});
/* botones magnéticos */
if(FINE&&!RM)document.addEventListener('pointermove',e=>{const b=e.target.closest&&e.target.closest('.cta');$$('.cta.mag').forEach(x=>{if(x!==b){x.classList.remove('mag');x.style.transform='';}});if(!b)return;const r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);b.classList.add('mag');b.style.transform=`translate(${(dx*.18).toFixed(1)}px,${(dy*.25).toFixed(1)}px)`;},{passive:true});
/* onda al tocar botones */
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.btn,.cta,.seg button,.idtabs button');if(!b||RM)return;const r=b.getBoundingClientRect(),d=document.createElement('span');d.className='rip2';const s=Math.max(r.width,r.height)*2;d.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;b.appendChild(d);setTimeout(()=>d.remove(),650);},{passive:true});
/* aparición al hacer scroll */
const revIO='IntersectionObserver' in window&&!RM?new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('rv-in');revIO.unobserve(en.target);}}),{rootMargin:'0px 0px -8% 0px'}):null;
function revealScan(){if(!revIO)return;$$('section:not(.vhide) .panel:not(.rv), section:not(.vhide) .tblw:not(.rv), .footer-lockup:not(.rv)').forEach(el=>{if(el.closest('#sheet')||el.getBoundingClientRect().top<innerHeight*.9)return;el.classList.add('rv');revIO.observe(el);});}
const _sv19b=setView;setView=function(v,o){_sv19b(v,o);setTimeout(revealScan,600);};
setTimeout(revealScan,1200);
/* barra de progreso superior para cargas de datos */
{const bar=document.createElement('div');bar.className='topbar2';document.body.appendChild(bar);let n=0,t=0;const _f=window.fetch.bind(window);
 window.fetch=function(u,o){const track=typeof u==='string'&&(u.startsWith('/api/')||(MKT&&u.startsWith(MKT)));if(track){n++;clearTimeout(t);bar.classList.add('on');}
   return _f(u,o).finally(()=>{if(track){n=Math.max(0,n-1);if(!n){bar.classList.add('done');t=setTimeout(()=>{bar.classList.remove('on','done');},450);}}});};}
refreshLocks();

/* ===================== V20: Mesa del inversor (11 módulos de Trader Skill) ===================== */
/* Métodos adaptados de github.com/Jakeschincariol/trader-skill (MIT). Nada aquí coloca órdenes. */
const SEC=window.LC_SEC||null;
VIEWS.desk=['mesa'];V2ID.desk='mesa';ID2V.mesa='desk';VTITLE.desk='Mesa';
SYNC.push('trd');
const TRD0={budget:5000,buffer:10,cap:25,minOrder:5,maxOrder:0,fractional:true,blocked:[],band:5,maxDay:5,cash:0,taxRate:5,targets:[],tsrc:'',orders:[],log:[],alerts:[],watch:['Pelosi'],seenPtr:[],rules:null};
let TRD={...TRD0,...(store.get('trd',{})||{})};
const saveTrd=()=>store.set('trd',TRD);
const DESK=[['copy','Copiar inversor','copycat'],['budget','Presupuesto','budget'],['risk','Riesgo','risk'],['orders','Órdenes','broker'],['alerts','Alertas','alerts'],['news','Noticias','news'],['congress','Congreso','pelosi'],['analyst','Analista SEC','analyst'],['screen','Filtro','screener'],['tax','Impuestos','tax'],['rebal','Rebalanceo','rebalance']];
let deskTab=store.get('deskTab','copy');
{const sec=$('#mesa');const b=document.createElement('div');b.className='backbar';b.innerHTML=`<button class="backb" aria-label="Volver al inicio">${ic('right','',false)}<span>Inicio</span></button><span class="crumb">Mesa del inversor</span>`;sec.prepend(b);b.querySelector('button').onclick=()=>setView('inicio');}
['#nav','#nav2'].forEach(n=>{const ref=$(n+' a[data-p="goals"]');if(!ref)return;const a=document.createElement('a');a.href='#mesa';a.dataset.p='desk';a.textContent='Mesa';a.addEventListener('click',e=>{e.preventDefault();setView('desk');});ref.after(a);});
$$('#hub .htile[data-v="desk"]').forEach(t=>t.addEventListener('click',()=>setView('desk')));
{const col=$('#menu .mcol');if(col){const b=document.createElement('button');b.className='mi2';b.setAttribute('role','menuitem');b.innerHTML=`${ic('broker','',false)}<span>Mesa del inversor<small>Copiar inversores, riesgo, órdenes y alertas</small></span>`;b.onclick=()=>{closeMenu();setView('desk');};col.querySelector('h4').after(b);}}
LOCKS.desk=['Mesa del inversor','Copia la cartera de grandes inversores desde sus reportes a la SEC, dimensiona cada compra a tu presupuesto, controla el riesgo y vigila noticias, alertas y operaciones del Congreso.'];
const _rl20=refreshLocks;refreshLocks=function(){_rl20();setLock($('#mesa'),'desk',!member());$$('#hub .htile[data-v="desk"]').forEach(t=>t.classList.toggle('lockedtile',!member()));};

/* ---------- utilidades ---------- */
const m$=v=>v==null||!isFinite(v)?'—':(v<0?'−':'')+'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const mBig=v=>v>=1e9?'$'+(v/1e9).toFixed(1)+' mil M':v>=1e6?'$'+(v/1e6).toFixed(1)+' M':m$(v);
const pxOf=s=>{const r=CO.find(x=>x.s===s);return r?r.p:(PFX[s]&&PFX[s].p)||null;};
async function ensurePrices(list){if(!MKT)return;if(!CO.length)await coLoad();for(const s of [...new Set(list)]){if(pxOf(s))continue;try{const r=await fetch(`${MKT}?symbol=${encodeURIComponent(s)}&range=1d`);const d=await r.json();if(r.ok&&d.p!=null)PFX[s]={p:d.p,pc:d.pc,n:d.n,sec:d.stats?.Sector?.v||'Otros'};}catch(e){}}}
const holdingsMap=()=>{const m={};RPF.forEach(h=>{m[h.s]=(m[h.s]||0)+h.q;});return m;};
const stamp=(ok,txt)=>`<span class="stamp ${ok?'pass':'block'}">${txt||(ok?'APROBADA':'BLOQUEADA')}</span>`;
function deskHead(t,d){return `<div class="dkh"><div><h3>${t}</h3><p class="note">${d}</p></div></div>`;}
const needWeb=t=>`<div class="panel coempty"><h3>${t} funciona en la versión web</h3><p class="note">Dentro de Claude la página no puede conectarse a fuentes de datos externas como la SEC o la Cámara de Representantes.</p><div class="acts"><a class="btn solid" href="https://lucioni-capital.vercel.app/#mesa" target="_blank" rel="noopener">Abrir Lucioni Capital en la web ${ic('ext','',false)}</a></div></div>`;

/* ---------- estructura ---------- */
$('#mesaWrap').innerHTML=`<div class="dkterm" aria-hidden="true"><i class="scan"></i></div>
  <div class="dkflow" id="dkFlow">${[['copy','Copiar'],['budget','Presupuesto'],['risk','Riesgo'],['orders','Órdenes']].map(([k,l],i)=>`<button data-k="${k}"><b>${i+1}</b>${l}</button>`).join('<span class="dkar">→</span>')}<span class="dknote">El flujo completo, con tu confirmación al final</span></div>
  <div class="dktabs" id="dkTabs" role="tablist"><span class="dkind"></span>${DESK.map(([k,l])=>`<button role="tab" data-k="${k}">${l}</button>`).join('')}</div>
  <div id="dkBody"></div>
  <p class="disc">Herramientas educativas basadas en datos públicos (SEC EDGAR, Cámara de Representantes de EE.UU., Nasdaq). Lucioni Capital no está conectado a tu bróker y nunca coloca órdenes: cada operación la confirmas tú y la ejecutas en tu propia cuenta. Métodos adaptados del proyecto abierto Trader Skill (licencia MIT).</p>`;
function deskGo(k){deskTab=k;store.set('deskTab',k);$$('#dkTabs button').forEach(b=>b.classList.toggle('act',b.dataset.k===k));$$('#dkFlow button').forEach(b=>b.classList.toggle('act',b.dataset.k===k));
  const a=$('#dkTabs .act'),ind=$('#dkTabs .dkind');if(a&&ind){ind.style.width=a.offsetWidth+'px';ind.style.transform=`translateX(${a.offsetLeft}px)`;const box=$('#dkTabs');box.scrollTo({left:a.offsetLeft-box.clientWidth/2+a.offsetWidth/2,behavior:RM?'auto':'smooth'});}
  const body=$('#dkBody');body.innerHTML='';({copy:dkCopy,budget:dkBudget,risk:dkRisk,orders:dkOrders,alerts:dkAlerts,news:dkNews,congress:dkCongress,analyst:dkAnalyst,screen:dkScreen,tax:dkTax,rebal:dkRebal}[k])(body);
  anim(body.children,{y:16,opacity:0},{y:0,opacity:1,duration:.5,stagger:.05,ease:'expo.out',clearProps:'transform,opacity'});}
$$('#dkTabs button,#dkFlow button').forEach(b=>b.onclick=()=>deskGo(b.dataset.k));
const _sv20=setView;setView=function(v,o){_sv20(v,o);if(v==='desk')requestAnimationFrame(()=>deskGo(deskTab));};
{const v=ID2V[location.hash.slice(1)];if(v==='desk')setView('desk',{noHash:true});}

/* ---------- 1. Copiar inversor (trader-copycat) ---------- */
const FILERS=[['1067983','Berkshire Hathaway','Warren Buffett y Greg Abel'],['1336528','Pershing Square','Bill Ackman'],['1350694','Bridgewater','fundada por Ray Dalio'],['1697748','ARK Invest','Cathie Wood'],['1536411','Duquesne','Stanley Druckenmiller'],['1656456','Appaloosa','David Tepper'],['1061768','Baupost','Seth Klarman'],['1040273','Third Point','Dan Loeb'],['1709323','Himalaya Capital','Li Lu'],['921669','Icahn','Carl Icahn'],['1029160','Soros Fund','George Soros'],['1037389','Renaissance','fundada por Jim Simons'],['1167483','Tiger Global','Chase Coleman'],['1569205','Fundsmith','Terry Smith'],['1096343','Markel','Tom Gayner'],['1549575','Dalal Street','Mohnish Pabrai'],['1112520','Akre Capital','fundada por Chuck Akre'],['949509','Oaktree','Howard Marks'],['1649339','Scion','Michael Burry']];
const F13={};let copyCik=store.get('copyCik','1067983'),copyTop=10;
function dkCopy(b){b.innerHTML=deskHead('Copiar a un inversor','Reconstruye la cartera de un gran inversor desde su último reporte 13F ante la SEC: cada posición, su peso y lo que compró, aumentó, redujo o vendió frente al trimestre anterior.')+
  `<div class="fgrid" id="cpF">${FILERS.map(([c,n,p])=>`<button class="fchip${c===copyCik?' act':''}" data-c="${c}"><b>${n}</b><small>${p}</small></button>`).join('')}</div><div id="cpOut"></div>`;
  $$('#cpF .fchip').forEach(x=>x.onclick=()=>{copyCik=x.dataset.c;store.set('copyCik',copyCik);$$('#cpF .fchip').forEach(y=>y.classList.toggle('act',y===x));cpLoad();});
  if(!SEC){$('#cpOut').innerHTML=needWeb('Copiar inversores');return;}cpLoad();}
async function cpLoad(){const out=$('#cpOut');if(!out)return;const cik=copyCik;out.innerHTML='<div class="idskel" style="height:300px"></div>';
  try{if(!F13[cik]){const r=await fetch(`${SEC}?f13=${cik}`);const d=await r.json();if(!r.ok)throw d;F13[cik]=d;}if(cik!==copyCik)return;cpRender(F13[cik]);}
  catch(e){if(cik===copyCik)out.innerHTML=`<p class="note">${esc((e&&e.message)||'No se pudo leer el reporte en la SEC.')}</p>`;}}
const CHG={NEW:['Nueva','u'],ADDED:['Aumentó','u'],TRIMMED:['Redujo','d'],SAME:['Igual','']};
function cpRender(d){const out=$('#cpOut'),P=d.positions,top=P.filter(p=>p.ticker).slice(0,copyTop),base=top.reduce((a,p)=>a+p.pct,0)||1,W=Math.max(320,Math.min(900,out.clientWidth||700)),rh=26,lw=70;
  const bars=svgEl(W,top.length*rh+4,top.map((p,i)=>`<g><text class="lb" x="0" y="${i*rh+17}">${esc(p.ticker)}</text><rect class="tr" x="${lw}" y="${i*rh+6}" width="${W-lw-60}" height="14" rx="7"/><rect class="br" x="${lw}" y="${i*rh+6}" width="${Math.max(3,(W-lw-60)*p.pct/top[0].pct).toFixed(1)}" height="14" rx="7"/><text class="vl" x="${W-52}" y="${i*rh+17}">${p.pct.toFixed(2)}%</text></g>`).join(''),'Peso de cada posición');
  const counts={NEW:0,ADDED:0,TRIMMED:0};P.forEach(p=>{if(p.chg&&counts[p.chg.s]!=null)counts[p.chg.s]++;});
  out.innerHTML=`<div class="fkg"><div class="fk"><small>Reporte</small><b>${esc(d.name)}</b><span>Trimestre al ${esc(d.period)} · presentado ${esc(d.filed)}</span></div><div class="fk"><small>Valor declarado</small><b>${mBig(d.total)}</b><span>${d.count} posiciones en acciones</span></div>
      <div class="fk"><small>Cambios del trimestre</small><b>${counts.NEW} nuevas · ${d.sold.length} vendidas</b><span>${counts.ADDED} aumentadas · ${counts.TRIMMED} reducidas</span></div></div>
    <div class="panel idbars"><div class="pfth"><h4>Pesos de las ${top.length} mayores posiciones</h4><div class="seg" id="cpTop">${[5,10,15,20].map(n=>`<button data-n="${n}" class="${n===copyTop?'act':''}">Top ${n}</button>`).join('')}</div></div>${bars}</div>
    <div class="tblw"><table class="ftbl"><thead><tr><th>Empresa</th><th>Ticker</th><th>% del 13F</th><th>Peso al copiar</th><th>Valor</th><th>Cambio</th></tr></thead><tbody>${P.slice(0,30).map((p,i)=>{const c=p.chg?CHG[p.chg.s]:null,inTop=top.includes(p);return `<tr><td>${esc(p.issuer)}</td><td><b>${esc(p.ticker||'—')}</b>${p.tickers&&p.tickers.length>1?` <small class="note">(${p.tickers.join(' + ')})</small>`:''}</td><td>${p.pct.toFixed(2)}%</td><td>${inTop?(100*p.pct/base).toFixed(2)+'%':'—'}</td><td>${mBig(p.value)}</td><td class="${c?c[1]:''}">${c?c[0]+(p.chg.ch!=null&&p.chg.s!=='SAME'?` ${p.chg.ch>0?'+':''}${(p.chg.ch*100).toFixed(0)}%`:''):'—'}</td></tr>`;}).join('')}</tbody></table></div>
    ${d.sold.length?`<p class="note"><b>Vendió todo:</b> ${d.sold.map(s=>esc(s.ticker||s.issuer)).join(', ')}.</p>`:''}
    <div class="acts"><button class="btn solid" id="cpUse">${ic('broker','',false)} Usar el top ${top.length} como mi objetivo</button><a class="btn" href="${esc(d.url)}" target="_blank" rel="noopener">Ver el reporte en la SEC ${ic('ext','',false)}</a></div>
    <ul class="idwhy"><li class="w">Un 13F es una foto del último día del trimestre, presentada hasta 45 días después: el inversor pudo haber vendido o comprado desde entonces.</li><li class="w">Solo muestra acciones de EE.UU. compradas (en largo): no incluye ventas en corto, efectivo, bonos ni acciones extranjeras.</li><li>Lo presenta la firma, no la persona por la que es conocida.</li></ul>`;
  $$('#cpTop button').forEach(x=>x.onclick=()=>{copyTop=+x.dataset.n;cpRender(d);});
  $('#cpUse').onclick=()=>{TRD.targets=top.map(p=>({t:p.ticker,n:p.issuer,w:+(100*p.pct/base).toFixed(2)}));TRD.tsrc=`${d.name} · 13F al ${d.period}`;saveTrd();toast(`Objetivo: top ${top.length} de ${d.name}`,ic('check','',false));deskGo('budget');};
  if(window.gsap&&!RM)gsap.fromTo('#cpOut rect.br',{attr:{width:3}},{attr:{width:(i,el)=>el.getAttribute('width')},duration:1,ease:'expo.out',stagger:.04});}

/* ---------- 2. Presupuesto (trader-budget) ---------- */
function sizeBudget(rows,cfg,prices){const EPS=1e-9,budget=+cfg.budget,buf=+cfg.buffer,capP=+cfg.cap,minO=+cfg.minOrder||0,whole=!cfg.fractional;
  if(!(budget>0))throw new Error('Indica un presupuesto.');if(!(capP>0&&capP<=100))throw new Error('El límite por acción debe estar entre 1% y 100%.');
  const blocked=new Set((cfg.blocked||[]).map(x=>x.toUpperCase())),dropped=[];let keep=[];
  rows.forEach(r=>{if(blocked.has(r.t))dropped.push([r.t,'está en tu lista de bloqueados']);else if(!(r.w>0))dropped.push([r.t,'peso cero o negativo']);else keep.push({...r});});
  const cashBuf=+(budget*buf/100).toFixed(2),inv=+(budget-cashBuf).toFixed(2),cap=+(budget*capP/100).toFixed(2);
  if(whole){const miss=keep.filter(r=>!prices[r.t]).map(r=>r.t);if(miss.length)throw new Error('Sin precio para comprar acciones enteras: '+miss.join(', '));}
  let live,dollars,capped,shares;
  while(true){if(!keep.length)throw new Error('Todas las posiciones quedan bajo tu orden mínima: sube el presupuesto o usa menos acciones.');
    const tot=keep.reduce((a,r)=>a+r.w,0);live=keep.map(r=>({...r,wt:100*r.w/tot}));
    const alloc={};capped=new Set();let active=[...live],money=inv;
    while(active.length){const ws=active.reduce((a,r)=>a+r.wt,0),trial={};active.forEach(r=>trial[r.t]=money*r.wt/ws);const over=active.filter(r=>trial[r.t]>cap+EPS);
      if(!over.length){Object.assign(alloc,trial);break;}over.forEach(r=>{alloc[r.t]=cap;capped.add(r.t);money-=cap;});active=active.filter(r=>!capped.has(r.t));if(money<=EPS){active.forEach(r=>alloc[r.t]=0);break;}}
    const order=[...live].sort((a,b)=>alloc[b.t]-alloc[a.t]).map(r=>r.t),unit=whole?.01:1,U=x=>Math.floor(x/unit+EPS),capU=U(cap);
    let totU=U(Object.values(alloc).reduce((a,v)=>a+v,0)),o={};order.forEach(t=>o[t]=capped.has(t)?capU:Math.floor(alloc[t]/unit+.5+EPS));
    let diff=totU-Object.values(o).reduce((a,v)=>a+v,0);const takers=order.filter(t=>!capped.has(t));let g=0;
    while(diff&&takers.length&&g++<100000){let mv=false;for(const t of takers){if(!diff)break;if(diff>0&&o[t]+1<=capU){o[t]++;diff--;mv=true;}else if(diff<0&&o[t]>0){o[t]--;diff++;mv=true;}}if(!mv)break;}
    dollars={};order.forEach(t=>dollars[t]=+(o[t]*unit).toFixed(2));shares=null;
    if(whole){shares={};order.forEach(t=>shares[t]=dollars[t]>0?Math.floor(dollars[t]/prices[t]+EPS):0);let left=Object.values(dollars).reduce((a,v)=>a+v,0)-order.reduce((a,t)=>a+shares[t]*prices[t],0);
      while(true){let best=null,gap=null;for(const t of order){const p=prices[t];if(p>left+EPS||(shares[t]+1)*p>cap+EPS)continue;const gg=dollars[t]-shares[t]*p;if(best==null||gg>gap+EPS){best=t;gap=gg;}}if(best==null)break;shares[best]++;left-=prices[best];}
      order.forEach(t=>dollars[t]=+(shares[t]*prices[t]).toFixed(2));}
    const small=live.filter(r=>dollars[r.t]<minO-EPS);if(!small.length)break;
    const worst=small.sort((a,b)=>a.w-b.w||a.t.localeCompare(b.t))[0];dropped.push([worst.t,whole&&shares&&shares[worst.t]===0?`una acción cuesta ${m$(prices[worst.t])}, más que su parte`:`su parte (${m$(dollars[worst.t])}) queda bajo tu orden mínima de ${m$(minO)}`]);keep=keep.filter(r=>r.t!==worst.t);}
  const pos=live.sort((a,b)=>b.wt-a.wt).map(r=>({t:r.t,n:r.n,w:+r.wt.toFixed(2),d:dollars[r.t],capped:capped.has(r.t),p:prices[r.t]||null,sh:prices[r.t]?(shares?shares[r.t]:+(dollars[r.t]/prices[r.t]).toFixed(4)):null}));
  const invested=+pos.reduce((a,p)=>a+p.d,0).toFixed(2);return {budget,cashBuf,inv,cap,pos,invested,idle:+(inv-invested).toFixed(2),dropped,whole};}
function dkBudget(b){b.innerHTML=deskHead('Presupuesto','Reparte tu dinero según tus pesos objetivo: guarda un colchón de efectivo, limita cuánto pesa cada acción (el exceso se reparte entre las demás) y descarta montos menores a tu orden mínima.')+
  `<div class="dkcols"><div class="panel"><h4>Reglas</h4><div class="dcfn">${[['bB','Presupuesto ($)','budget'],['bF','Colchón de efectivo (%)','buffer'],['bC','Máximo por acción (%)','cap'],['bM','Orden mínima ($)','minOrder']].map(([id,l,k])=>`<div><label class="l" for="${id}">${l}</label><input class="f" id="${id}" type="number" step="any" min="0" value="${TRD[k]}"></div>`).join('')}</div>
      <label class="chk"><input type="checkbox" id="bW" ${TRD.fractional?'':'checked'}> Solo acciones enteras (sin fracciones)</label>
      <h4 style="margin-top:14px">Pesos objetivo ${TRD.tsrc?`<small class="note">· ${esc(TRD.tsrc)}</small>`:''}</h4><div id="bT"></div>
      <form class="prf" id="bAdd" autocomplete="off"><input class="f" id="bAs" placeholder="Ticker" maxlength="10"><input class="f" id="bAw" type="number" step="any" placeholder="Peso" style="max-width:110px"><button class="btn" type="submit">Agregar</button></form></div>
    <div class="panel"><h4>Resultado</h4><div id="bOut"><p class="note">Agrega pesos objetivo o copia a un inversor.</p></div></div></div>`;
  const rT=()=>{$('#bT').innerHTML=TRD.targets.length?`<div class="tblw"><table class="ftbl"><tbody>${TRD.targets.map((t,i)=>`<tr><td><b>${esc(t.t)}</b> <small class="note">${esc((t.n||'').slice(0,26))}</small></td><td style="width:110px"><input class="f mini" data-i="${i}" type="number" step="any" value="${t.w}"></td><td style="width:40px"><button class="ib bx" data-i="${i}" aria-label="Quitar">${ic('x','',false)}</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="note">Sin pesos objetivo.</p>';
    $$('#bT input').forEach(x=>x.oninput=()=>{TRD.targets[+x.dataset.i].w=+x.value;saveTrd();bRun();});$$('#bT .bx').forEach(x=>x.onclick=()=>{TRD.targets.splice(+x.dataset.i,1);saveTrd();rT();bRun();});};
  rT();[['bB','budget'],['bF','buffer'],['bC','cap'],['bM','minOrder']].forEach(([id,k])=>$('#'+id).oninput=e=>{TRD[k]=+e.target.value;saveTrd();bRun();});
  $('#bW').onchange=e=>{TRD.fractional=!e.target.checked;saveTrd();bRun();};
  $('#bAdd').onsubmit=e=>{e.preventDefault();const t=$('#bAs').value.trim().toUpperCase(),w=+$('#bAw').value;if(!/^[A-Z.\-]{1,10}$/.test(t)||!(w>0))return;const ex=TRD.targets.find(x=>x.t===t);if(ex)ex.w=w;else TRD.targets.push({t,n:(CO.find(x=>x.s===t)||{}).n||'',w});saveTrd();$('#bAdd').reset();rT();bRun();};
  bRun();}
let bRes=null;
async function bRun(){const out=$('#bOut');if(!out)return;if(!TRD.targets.length){out.innerHTML='<p class="note">Agrega pesos objetivo o copia a un inversor.</p>';return;}
  await ensurePrices(TRD.targets.map(t=>t.t));const prices={};TRD.targets.forEach(t=>{const p=pxOf(t.t);if(p)prices[t.t]=p;});
  try{bRes=sizeBudget(TRD.targets,TRD,prices);}catch(e){out.innerHTML=`<p class="autherr">${esc(e.message)}</p>`;return;}const R=bRes;
  const C=2*Math.PI*54;let off=0;const segs=R.pos.map((p,i)=>{const f=p.d/R.budget,s=`<circle r="54" cx="70" cy="70" fill="none" stroke="${COLORS[i%COLORS.length]}" stroke-width="22" stroke-dasharray="${(f*C).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off*C).toFixed(2)}"><title>${p.t} ${m$(p.d)}</title></circle>`;off+=f;return s;}).join('')+`<circle r="54" cx="70" cy="70" fill="none" stroke="var(--well)" stroke-width="22" stroke-dasharray="${((R.cashBuf+R.idle)/R.budget*C).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off*C).toFixed(2)}"><title>Efectivo</title></circle>`;
  out.innerHTML=`<div class="pfdw"><svg viewBox="0 0 140 140" class="pfsvg" style="width:140px;height:140px">${segs}</svg><div class="fkg" style="flex:1;margin:0"><div class="fk"><small>Invertido</small><b>${m$(R.invested)}</b><span>de ${m$(R.budget)}</span></div><div class="fk"><small>Efectivo</small><b>${m$(R.cashBuf+R.idle)}</b><span>Colchón ${m$(R.cashBuf)} · sin usar ${m$(R.idle)}</span></div></div></div>
    <div class="tblw"><table class="ftbl"><thead><tr><th>Ticker</th><th>Peso</th><th>Monto</th><th>Acciones</th><th></th></tr></thead><tbody>${R.pos.map((p,i)=>`<tr><td><i class="dot" style="background:${COLORS[i%COLORS.length]}"></i><b>${esc(p.t)}</b></td><td>${p.w.toFixed(2)}%</td><td><b>${m$(p.d)}</b></td><td>${p.sh!=null?(+p.sh).toLocaleString('en-US',{maximumFractionDigits:4}):'—'}</td><td>${p.capped?'<span class="gst mid">Al límite</span>':''}</td></tr>`).join('')}</tbody></table></div>
    ${R.dropped.length?`<ul class="idwhy">${R.dropped.map(([t,w])=>`<li class="w"><b>${esc(t)}</b> fuera: ${esc(w)}.</li>`).join('')}</ul>`:''}
    <div class="acts"><button class="btn solid" id="bGo">Generar órdenes y revisar riesgo →</button></div>`;
  if(window.gsap&&!RM)gsap.from('#bOut circle',{attr:{'stroke-dasharray':`0 ${C}`},duration:1,ease:'expo.out',stagger:.05});
  $('#bGo').onclick=()=>{TRD.orders=R.pos.filter(p=>p.d>0).map(p=>R.whole?{symbol:p.t,side:'buy',qty:p.sh,type:'market',why:'Presupuesto'}:{symbol:p.t,side:'buy',notional:p.d,type:'market',why:'Presupuesto'});TRD.cash=TRD.cash||R.budget;saveTrd();deskGo('risk');};}

/* ---------- 3. Riesgo (trader-risk) ---------- */
function riskCheck(orders,c){const prices={};orders.forEach(o=>{const p=pxOf(o.symbol);if(p)prices[o.symbol]=p;});RPF.forEach(h=>{const p=pxOf(h.s);if(p)prices[h.s]=p;});
  const held=holdingsMap(),vals={};Object.entries(held).forEach(([t,q])=>vals[t]=q*(prices[t]||0));let cash=+c.cash||0;if(!RPF.length&&!cash)cash=+c.budget||0;
  const blocked=new Set((c.blocked||[]).map(x=>x.toUpperCase())),today=new Date().toISOString().slice(0,10),done=(c.log||[]).filter(l=>l.st==='ejecutada'&&l.date===today),seen=new Set(),res=[];
  orders.forEach(o=>{const R=[],sym=o.symbol,side=o.side,ref=prices[sym];let v=o.notional!=null?+o.notional:o.qty!=null&&ref?o.qty*ref:null;
    if(!/^[A-Z][A-Z0-9.\-]{0,9}$/.test(sym||''))R.push('formato: ticker no válido');if(v==null)R.push(`precio: no hay precio para ${sym}`);
    if(blocked.has(sym))R.push(`bloqueado: ${sym} está en tu lista de bloqueados`);
    if(v!=null){if(v<(+c.minOrder||0)-.01)R.push(`tamaño: ${m$(v)} es menor a tu orden mínima de ${m$(c.minOrder)}`);if(+c.maxOrder&&v>+c.maxOrder+.01)R.push(`tamaño: ${m$(v)} supera tu orden máxima de ${m$(c.maxOrder)}`);}
    const total=cash+Object.values(vals).reduce((a,x)=>a+x,0),bufUsd=total*(+c.buffer||0)/100;
    if(v!=null&&side==='buy'){const after=cash-v;if(after<-.01)R.push(`efectivo: necesita ${m$(v)} y tienes ${m$(cash)}; sería comprar con préstamo (margen)`);else if(after<bufUsd-.01)R.push(`efectivo: te deja ${m$(Math.max(after,0))}, por debajo de tu colchón de ${(+c.buffer).toFixed(0)}% (${m$(bufUsd)})`);
      const posAfter=(vals[sym]||0)+v,lim=total*(+c.cap||100)/100;if(total>0&&posAfter>lim+.01)R.push(`concentración: ${sym} quedaría en ${m$(posAfter)}, ${(100*posAfter/total).toFixed(1)}% de la cuenta, sobre tu límite de ${c.cap}%`);}
    if(side==='sell'){const over=o.qty!=null?o.qty>(held[sym]||0)+1e-9:v>(vals[sym]||0)+.01;if(over)R.push(`venta en corto: vendes más ${sym} del que tienes; no está permitido`);}
    const k=sym+side;if(seen.has(k))R.push(`duplicada: otra orden de ${side==='buy'?'compra':'venta'} de ${sym} en este lote`);seen.add(k);
    const passed=res.filter(r=>r.ok).length;if(+c.maxDay&&done.length+passed>=+c.maxDay)R.push(`límite diario: ya llevas ${done.length+passed} de ${c.maxDay} órdenes hoy`);
    const ok=!R.length;if(ok&&v!=null){if(side==='buy'){cash-=v;vals[sym]=(vals[sym]||0)+v;}else{cash+=v;vals[sym]=Math.max(0,(vals[sym]||0)-v);}}
    res.push({o,ok,v,R});});
  return {res,cashAfter:cash};}
function dkRisk(b){b.innerHTML=deskHead('Control de riesgo','Revisa cada orden propuesta contra tus límites antes de que llegue al bróker y bloquea lo que los supere: lista de bloqueados, tamaño de orden, concentración después de comprar, colchón de efectivo, compras con préstamo, ventas en corto y máximo de órdenes por día.')+
  `<div class="dkcols"><div class="panel"><h4>Tus límites</h4><div class="dcfn">${[['rC','Efectivo disponible en tu cuenta ($)','cash'],['rX','Orden máxima ($, 0 = sin límite)','maxOrder'],['rP','Máximo por acción (%)','cap'],['rF','Colchón de efectivo (%)','buffer'],['rM','Orden mínima ($)','minOrder'],['rD','Órdenes por día (máx.)','maxDay']].map(([id,l,k])=>`<div><label class="l" for="${id}">${l}</label><input class="f" id="${id}" type="number" step="any" min="0" value="${TRD[k]}"></div>`).join('')}</div>
    <label class="l" for="rB">Tickers bloqueados (separados por coma)</label><input class="f" id="rB" value="${esc((TRD.blocked||[]).join(', '))}" placeholder="Ej: TSLA, GME">
    <p class="note">Siempre activo: sin opciones, sin margen y sin ventas en corto. Las posiciones de tu cuenta se toman de "Mi cartera real".</p></div>
    <div class="panel"><h4>Órdenes propuestas</h4><div id="rOut"></div></div></div>`;
  [['rC','cash'],['rX','maxOrder'],['rP','cap'],['rF','buffer'],['rM','minOrder'],['rD','maxDay']].forEach(([id,k])=>$('#'+id).oninput=e=>{TRD[k]=+e.target.value;saveTrd();rRun();});
  $('#rB').oninput=e=>{TRD.blocked=e.target.value.split(/[,\s]+/).map(x=>x.trim().toUpperCase()).filter(Boolean);saveTrd();rRun();};rRun();}
async function rRun(){const out=$('#rOut');if(!out)return;if(!TRD.orders.length){out.innerHTML='<p class="note">No hay órdenes propuestas. Créalas en Presupuesto o Rebalanceo.</p>';return;}
  await ensurePrices([...TRD.orders.map(o=>o.symbol),...RPF.map(h=>h.s)]);const {res,cashAfter}=riskCheck(TRD.orders,TRD);const np=res.filter(r=>r.ok).length;
  out.innerHTML=`<div class="fkg"><div class="fk"><small>Aprobadas</small><b style="color:var(--up)">${np}</b><span>pasan todos tus límites</span></div><div class="fk"><small>Bloqueadas</small><b style="color:var(--down)">${res.length-np}</b><span>con el motivo exacto</span></div><div class="fk"><small>Efectivo después</small><b>${m$(cashAfter)}</b><span>si se ejecutan las aprobadas</span></div></div>
    <div class="rlist">${res.map(r=>`<div class="rrow ${r.ok?'ok':'no'}"><div><b>${r.o.side==='buy'?'Compra':'Venta'} ${esc(r.o.symbol)}</b><small>${r.o.notional!=null?m$(r.o.notional):r.o.qty+' acciones'}${r.v!=null&&r.o.notional==null?' ≈ '+m$(r.v):''} · ${esc(r.o.why||'')}</small>${r.R.length?`<ul>${r.R.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</div>${stamp(r.ok)}</div>`).join('')}</div>
    <div class="acts"><button class="btn solid" id="rGo" ${np?'':'disabled'}>Preparar tickets de las ${np} aprobadas →</button><button class="btn" id="rClr">Descartar órdenes</button></div>`;
  if(window.gsap&&!RM)gsap.fromTo('#rOut .stamp',{scale:2.4,rotate:-18,opacity:0},{scale:1,rotate:-8,opacity:1,duration:.45,ease:'back.out(2.2)',stagger:.12});
  $('#rGo').onclick=()=>{TRD.approved=res.filter(r=>r.ok).map(r=>({...r.o,v:r.v}));saveTrd();deskGo('orders');};$('#rClr').onclick=()=>{TRD.orders=[];TRD.approved=[];saveTrd();rRun();};}

/* ---------- 4. Órdenes (trader-broker) ---------- */
function dkOrders(b){const A=TRD.approved||[];b.innerHTML=deskHead('Órdenes','Convierte cada orden aprobada en un ticket claro para tu bróker y registra tu confirmación. Lucioni Capital nunca la coloca: tú la ejecutas en tu propia cuenta.')+
  `<div id="oT">${A.length?A.map((o,i)=>`<div class="ticket" data-i="${i}"><div class="tkh"><span>TICKET ${String(i+1).padStart(2,'0')}</span><span>${new Date().toLocaleDateString('es-PE')}</span></div>
      <p class="tkb">${o.side==='buy'?'Comprar':'Vender'} <b>${o.notional!=null?m$(o.notional)+' de':o.qty+' acciones de'} ${esc(o.symbol)}</b>, a mercado, válida por el día.</p>
      <div class="tkm"><span>Precio ref. ${pxOf(o.symbol)?usd2(pxOf(o.symbol)):'—'}</span><span>${o.v!=null?'≈ '+m$(o.v):''}</span></div>
      <label class="l" for="tkY${i}">Escribe <b>SÍ</b> para confirmar esta orden exacta</label><div class="tkc"><input class="f" id="tkY${i}" maxlength="3" autocomplete="off"><button class="btn solid tkok" data-i="${i}" disabled>Confirmar</button></div></div>`).join(''):'<p class="note">No hay órdenes aprobadas. Pásalas primero por Control de riesgo.</p>'}</div>
  <div class="panel"><h4>Registro de confirmaciones</h4><div id="oL"></div></div>`;
  if(window.gsap&&!RM)gsap.from('#oT .ticket',{clipPath:'inset(0 0 100% 0)',y:-10,duration:.7,ease:'power3.out',stagger:.12});
  $$('#oT input').forEach(x=>x.oninput=()=>{const i=x.id.slice(3);$(`.tkok[data-i="${i}"]`).disabled=!/^s[ií]$/i.test(x.value.trim());});
  $$('#oT .tkok').forEach(x=>x.onclick=()=>{const o=A[+x.dataset.i];TRD.log.unshift({at:Date.now(),date:new Date().toISOString().slice(0,10),symbol:o.symbol,side:o.side,amt:o.notional!=null?m$(o.notional):o.qty+' acc.',notional:o.notional,qty:o.qty,st:'confirmada'});
    A.splice(+x.dataset.i,1);TRD.approved=A;saveTrd();SFX.buy&&SFX.buy();toast(`Confirmada: ${o.symbol}. Ahora ejecútala en tu bróker.`,ic('check','',false));openSheet(realHTML(o.symbol,0));bindReal(o.symbol);dkOrders($('#dkBody'));});
  oLog();}
function oLog(){const L=TRD.log||[];$('#oL').innerHTML=L.length?`<div class="tblw"><table class="ftbl"><thead><tr><th>Fecha</th><th>Orden</th><th>Estado</th><th></th></tr></thead><tbody>${L.slice(0,25).map((l,i)=>`<tr><td>${new Date(l.at).toLocaleString('es-PE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td><td>${l.side==='buy'?'Compra':'Venta'} ${esc(l.amt)} de <b>${esc(l.symbol)}</b></td><td><span class="gst ${l.st==='ejecutada'?'ok':'mid'}">${l.st==='ejecutada'?'Ejecutada':'Confirmada'}</span></td><td>${l.st!=='ejecutada'?`<button class="btn lgx" data-i="${i}" style="padding:5px 10px;font-size:12.5px">Marcar ejecutada</button>`:''}</td></tr>`).join('')}</tbody></table></div><p class="note">Al marcarla como ejecutada, la compra se agrega a "Mi cartera real" como un lote nuevo al precio de referencia.</p>`:'<p class="note">Aún no confirmaste órdenes.</p>';
  $$('#oL .lgx').forEach(x=>x.onclick=()=>{const l=TRD.log[+x.dataset.i],p=pxOf(l.symbol);if(!p){toast('Sin precio de referencia para '+l.symbol);return;}const q=l.qty!=null?+l.qty:+(l.notional/p).toFixed(6);
    if(l.side==='buy'){const ex=RPF.find(h=>h.s===l.symbol);if(ex){ex.lots=ex.lots||[{q:ex.q,c:ex.c,t:ex.at||Date.now()}];ex.lots.push({q,c:p,t:Date.now()});const tq=ex.q+q;ex.c=(ex.c*ex.q+p*q)/tq;ex.q=tq;}else RPF.push({s:l.symbol,n:(CO.find(c=>c.s===l.symbol)||{}).n||'',q,c:p,at:Date.now(),lots:[{q,c:p,t:Date.now()}]});}
    else{const ex=RPF.find(h=>h.s===l.symbol);if(ex){ex.q=Math.max(0,ex.q-q);if(ex.lots){let left=q;ex.lots.forEach(lt=>{const tk=Math.min(left,lt.q);lt.q-=tk;left-=tk;});ex.lots=ex.lots.filter(lt=>lt.q>1e-9);}if(ex.q<=1e-9)RPF.splice(RPF.indexOf(ex),1);}}
    savePf();l.st='ejecutada';saveTrd();oLog();toast('Agregada a Mi cartera real',ic('check','',false));});}

/* ---------- 5. Alertas (trader-alerts) + calendario NYSE ---------- */
const NYSE_H={'2026-01-01':'Año Nuevo','2026-01-19':'Día de Martin Luther King Jr.','2026-02-16':'Día de los Presidentes','2026-04-03':'Viernes Santo','2026-05-25':'Memorial Day','2026-06-19':'Juneteenth','2026-07-03':'Día de la Independencia (observado)','2026-09-07':'Día del Trabajo','2026-11-26':'Acción de Gracias','2026-12-25':'Navidad','2027-01-01':'Año Nuevo','2027-01-18':'Día de Martin Luther King Jr.','2027-02-15':'Día de los Presidentes','2027-03-26':'Viernes Santo','2027-05-31':'Memorial Day','2027-06-18':'Juneteenth (observado)','2027-07-05':'Día de la Independencia (observado)','2027-09-06':'Día del Trabajo','2027-11-25':'Acción de Gracias','2027-12-24':'Navidad (observado)'};
const NYSE_E={'2026-11-27':'día después de Acción de Gracias','2026-12-24':'Nochebuena','2027-11-26':'día después de Acción de Gracias'};
const nyDate=(off=0)=>{const d=new Date(Date.now()+off*864e5);return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);};
/* el reloj de mercado ahora respeta feriados y cierres anticipados */
mClock=(orig=>function(){const c=orig(),today=nyDate(),{wd,m}=nyNow();
  if(NYSE_H[today]&&wd>=1&&wd<=5){let k=1;while(k<10){const d=nyDate(k),w=new Date(d+'T12:00:00Z').getUTCDay();if(w>=1&&w<=5&&!NYSE_H[d])break;k++;}const add=(k-1)*1440+(1440-m)+570;return {k:'closed',t:`Bolsa cerrada por feriado: ${NYSE_H[today]}`,s:`Abre en ${dur(add)} · ${limaAt(add)} hora de Lima`};}
  if(NYSE_E[today]&&c.k==='open'){const C=780;if(m>=C)return {k:'post',t:'Cerró temprano hoy',s:`Cierre anticipado a la 1:00 p. m. de Nueva York (${NYSE_E[today]})`};return {k:'open',t:'Bolsa abierta · cierre anticipado',s:`Cierra en ${dur(C-m)} · ${limaAt(C-m)} hora de Lima`};}
  if(c.k!=='open'){let k=c.k==='post'||c.k==='closed'&&m>=960?1:0,add=0;for(let j=k;j<10;j++){const d=nyDate(j),w=new Date(d+'T12:00:00Z').getUTCDay();if(w>=1&&w<=5&&!NYSE_H[d]){add=j*1440+570-m;break;}}if(add>0)return {...c,s:`Abre en ${dur(add)} · ${limaAt(add)} hora de Lima`};}
  return c;})(mClock);
setTimeout(()=>$$('.mclock').forEach(e=>e.innerHTML=clockHTML()),50);
const ALT_T={above:'Sube a',below:'Baja a',stop:'Stop en',move:'Se mueve ±'};
function altCheck(){if(!TRD.alerts.length)return;let hit=false;TRD.alerts.forEach(a=>{if(a.rang)return;if(a.type==='bell'){const c=mClock();if(c.k==='open'&&a.day!==nyDate()){a.day=nyDate();altRing(a,'Sonó la campana: la Bolsa de Nueva York abrió.');hit=true;}return;}
  const p=pxOf(a.s),pc=(CO.find(x=>x.s===a.s)||PFX[a.s]||{}).pc;if(p==null)return;
  const ok=a.type==='above'?p>=a.v:a.type==='below'||a.type==='stop'?p<=a.v:a.type==='move'?Math.abs(pc||0)>=a.v:false;
  if(ok){a.rang=Date.now();a.at=p;altRing(a,`${a.s} ${a.type==='move'?`se movió ${pcS(pc)} hoy`:a.type==='above'?`subió a ${usd2(p)} (objetivo ${usd2(a.v)})`:`bajó a ${usd2(p)} (${a.type==='stop'?'stop':'nivel'} ${usd2(a.v)})`}.`);hit=true;}});
  if(hit){saveTrd();if(deskTab==='alerts'&&VIEW==='desk')aRender();}}
function altRing(a,msg){SFX.win&&SFX.win();toast(msg,ic('clock','',false));const bell=$('#aBell');if(bell){bell.classList.remove('ring');void bell.offsetWidth;bell.classList.add('ring');}
  try{if('Notification' in window&&Notification.permission==='granted')new Notification('Lucioni Capital',{body:msg});}catch(e){}}
setInterval(()=>{if(!member()||!TRD.alerts.length)return;const need=TRD.alerts.filter(a=>a.s&&!a.rang).map(a=>a.s);(need.length&&MKT?(Date.now()-coAt>30000?coLoad():Promise.resolve()).then(()=>ensurePrices(need)):Promise.resolve()).then(altCheck);},30000);
function dkAlerts(b){const c=mClock();b.innerHTML=deskHead('Alertas de precio','Avisa una sola vez cuando una acción llega a tu objetivo, toca tu stop o se mueve fuerte en el día, y cuando suena la campana de apertura, con el calendario real de la Bolsa de Nueva York.')+
  `<div class="dkcols"><div class="panel"><div class="pfth"><h4>Nueva alerta</h4><span class="bell" id="aBell" aria-hidden="true">${ic('clock','',false)}</span></div><form class="dcfn" id="aF" autocomplete="off"><div><label class="l" for="aS">Ticker</label><input class="f" id="aS" maxlength="10" placeholder="Ej: AAPL" style="text-transform:uppercase"></div>
      <div><label class="l" for="aT">Condición</label><select class="f" id="aT"><option value="above">Sube a (precio)</option><option value="below">Baja a (precio)</option><option value="stop">Stop-loss (precio)</option><option value="move">Movimiento del día (%)</option><option value="bell">Campana de apertura</option></select></div>
      <div><label class="l" for="aV">Valor</label><input class="f" id="aV" type="number" step="any" placeholder="Ej: 200"></div><div style="align-self:end"><button class="cta" type="submit" style="width:100%;justify-content:center">Crear alerta</button></div></form>
      <div class="acts"><button class="btn" id="aN">${'Notification' in window&&Notification.permission==='granted'?'Notificaciones activadas':'Activar notificaciones del navegador'}</button></div><p class="note">Las alertas se revisan cada 30 segundos mientras la app está abierta.</p></div>
    <div class="panel"><h4>Calendario de la bolsa</h4><div class="mclock" style="margin:0 0 10px">${clockHTML()}</div><ul class="cal2">${Object.entries({...NYSE_H}).filter(([d])=>d>=nyDate()).slice(0,6).map(([d,n])=>`<li><b>${new Date(d+'T12:00:00Z').toLocaleDateString('es-PE',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}</b><span>${n} · cerrada</span></li>`).join('')}${Object.entries(NYSE_E).filter(([d])=>d>=nyDate()).slice(0,2).map(([d,n])=>`<li><b>${new Date(d+'T12:00:00Z').toLocaleDateString('es-PE',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'})}</b><span>Cierre a la 1:00 p. m. (${n})</span></li>`).join('')}</ul></div></div>
  <div class="panel"><h4>Tus alertas</h4><div id="aL"></div></div>`;
  $('#aT').onchange=e=>{$('#aS').disabled=$('#aV').disabled=e.target.value==='bell';};
  $('#aF').onsubmit=e=>{e.preventDefault();const t=$('#aT').value,s=$('#aS').value.trim().toUpperCase(),v=+$('#aV').value;if(t!=='bell'&&(!/^[A-Z.\-]{1,10}$/.test(s)||!(v>0))){toast('Indica ticker y valor');return;}TRD.alerts.unshift({id:Date.now(),type:t,s:t==='bell'?'':s,v:t==='bell'?0:v,rang:0});saveTrd();$('#aF').reset();aRender();toast('Alerta creada',ic('check','',false));};
  $('#aN').onclick=async()=>{if(!('Notification' in window)){toast('Tu navegador no admite notificaciones');return;}const r=await Notification.requestPermission();$('#aN').textContent=r==='granted'?'Notificaciones activadas':'Permiso no concedido';};aRender();}
function aRender(){const L=TRD.alerts;$('#aL').innerHTML=L.length?`<div class="rlist">${L.map((a,i)=>{const p=a.s?pxOf(a.s):null,dist=p&&a.type!=='move'&&a.v?(a.v/p-1):null;return `<div class="rrow ${a.rang?'ok':''}"><div><b>${a.type==='bell'?'Campana de apertura':`${esc(a.s)} · ${ALT_T[a.type]} ${a.type==='move'?a.v+'%':usd2(a.v)}`}</b><small>${a.rang?`Sonó el ${new Date(a.rang).toLocaleString('es-PE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}${a.at?' a '+usd2(a.at):''}`:p?`Precio actual ${usd2(p)}${dist!=null?` · a ${pctF(Math.abs(dist))} del nivel`:''}`:a.type==='bell'?'Cada día hábil, una vez':'Esperando precio…'}</small></div><div class="acts" style="margin:0">${a.rang&&a.type!=='bell'?`<button class="btn ar" data-i="${i}" style="padding:5px 10px;font-size:12.5px">Reactivar</button>`:''}<button class="ib ad" data-i="${i}" aria-label="Eliminar">${ic('x','',false)}</button></div></div>`;}).join('')}</div>`:'<p class="note">Sin alertas. Crea la primera arriba.</p>';
  $$('#aL .ad').forEach(x=>x.onclick=()=>{TRD.alerts.splice(+x.dataset.i,1);saveTrd();aRender();});$$('#aL .ar').forEach(x=>x.onclick=()=>{TRD.alerts[+x.dataset.i].rang=0;saveTrd();aRender();});
  if(MKT)ensurePrices(L.filter(a=>a.s).map(a=>a.s)).then(()=>{if(deskTab==='alerts')altCheck();});}

/* ---------- 6. Noticias y 8-K (trader-news) ---------- */
function dkNews(b){const W=[...new Set([...RPF.map(h=>h.s),...TRD.targets.map(t=>t.t)])].slice(0,10);b.innerHTML=deskHead('Monitor de noticias','Titulares y reportes oficiales a la SEC (8-K: resultados, cambios de directivos, adquisiciones, nueva deuda…) de las acciones que tienes y de tu objetivo, en una sola lista.')+
  `<div class="pchips" id="nW">${W.map((s,i)=>`<span class="pchip" style="--c:${COLORS[i%COLORS.length]}"><i></i>${esc(s)}</span>`).join('')||'<p class="note">Agrega acciones a Mi cartera real o define un objetivo para monitorearlas.</p>'}</div><div class="seg" id="nF" style="margin-bottom:12px"><button data-f="all" class="act">Todo</button><button data-f="sec">Solo reportes SEC</button><button data-f="news">Solo titulares</button></div><div id="nOut"></div>`;
  if(!W.length)return;if(!SEC||!MKT){$('#nOut').innerHTML=needWeb('El monitor de noticias');return;}nLoad(W);}
let NI=[];
async function nLoad(W){$('#nOut').innerHTML='<div class="idskel" style="height:260px"></div>';NI=[];
  await Promise.all(W.map(async s=>{try{const [a,b2]=await Promise.all([fetch(`${MKT}?news=${encodeURIComponent(s)}`).then(r=>r.json()).catch(()=>({})),fetch(`${SEC}?k8=${encodeURIComponent(s)}`).then(r=>r.json()).catch(()=>({}))]);
    (a.rows||[]).slice(0,5).forEach(n=>NI.push({k:'news',s,t:n.t,u:n.u,src:n.p,when:n.a,ts:0}));
    (b2.filings||[]).filter(f=>/^8-K/.test(f.form)).slice(0,4).forEach(f=>NI.push({k:'sec',s,t:f.items.length?f.items.map(i=>i.t||('Ítem '+i.c)).filter(x=>x!=='Estados financieros y anexos').join(' · ')||'Reporte 8-K':'Reporte 8-K',u:f.url,src:'SEC · '+f.form,when:f.date,ts:Date.parse(f.date)||0,imp:f.items.some(i=>/^(1\.0[35]|2\.0[26]|3\.01|4\.0[12]|5\.0[12])$/.test(i.c))}));}catch(e){}}));
  nRender('all');$$('#nF button').forEach(x=>x.onclick=()=>{$$('#nF button').forEach(y=>y.classList.toggle('act',y===x));nRender(x.dataset.f);});}
function nRender(f){const L=NI.filter(n=>f==='all'||n.k===f).sort((a,b)=>(b.ts||0)-(a.ts||0));$('#nOut').innerHTML=L.length?`<div class="nfeed">${L.map(n=>`<a class="nit ${n.k}${n.imp?' imp':''}" href="${esc(n.u)}" target="_blank" rel="noopener"><span class="ntk">${esc(n.s)}</span><span class="nbd"><b>${esc(n.t)}</b><small>${esc(n.src||'')}${n.when?' · '+esc(n.when):''}${n.imp?' · evento importante':''}</small></span></a>`).join('')}</div><p class="note">Titulares en inglés de fuentes externas. Los 8-K son reportes oficiales que la empresa debe presentar ante hechos relevantes.</p>`:'<p class="note">Sin novedades recientes.</p>';
  anim('#nOut .nit',{x:-10,opacity:0},{x:0,opacity:1,duration:.4,stagger:.03,ease:'power3.out'});}

/* ---------- 7. Congreso (trader-pelosi) ---------- */
let PTR=null;
function dkCongress(b){b.innerHTML=deskHead('Operaciones del Congreso','Las declaraciones de compra y venta de acciones que los miembros de la Cámara de Representantes de EE.UU. deben publicar por ley (STOCK Act), apenas aparecen en el registro oficial.')+
  `<div class="dkcols"><div class="panel"><h4>Miembros que sigues</h4><form class="prf" id="cgF" autocomplete="off"><input class="f" id="cgM" placeholder="Apellido, ej: Pelosi" maxlength="30"><button class="btn" type="submit">Seguir</button></form><div class="pchips" id="cgW"></div><p class="note">Te avisamos una vez por cada nueva declaración de quienes sigues.</p></div>
    <div class="panel"><h4>Quiénes declaran más este año</h4><div id="cgTop"><p class="note">Cargando…</p></div></div></div><div class="panel"><div class="pfth"><h4>Últimas declaraciones</h4><input class="f" id="cgQ" placeholder="Filtrar por nombre o estado" style="max-width:240px"></div><div id="cgOut"><div class="idskel" style="height:240px"></div></div></div>
  <p class="note">Cada declaración (PTR) es un PDF oficial con el detalle: activo, compra o venta, fecha y rango de monto. Los congresistas tienen hasta 45 días para declarar, así que la información llega con retraso.</p>`;
  const rW=()=>{$('#cgW').innerHTML=(TRD.watch||[]).map((m,i)=>`<span class="pchip" style="--c:var(--accent)"><i></i>${esc(m)}<button data-i="${i}" aria-label="Dejar de seguir">×</button></span>`).join('');$$('#cgW button').forEach(x=>x.onclick=()=>{TRD.watch.splice(+x.dataset.i,1);saveTrd();rW();cgRender();});};rW();
  $('#cgF').onsubmit=e=>{e.preventDefault();const m=$('#cgM').value.trim();if(!m)return;if(!TRD.watch.some(x=>x.toLowerCase()===m.toLowerCase()))TRD.watch.push(m);saveTrd();$('#cgF').reset();rW();cgRender();};
  $('#cgQ').oninput=cgRender;if(!SEC){$('#cgOut').innerHTML=needWeb('El seguimiento del Congreso');$('#cgTop').innerHTML='';return;}cgLoad();}
async function cgLoad(){try{if(!PTR){const r=await fetch(`${SEC}?ptr=1`);PTR=await r.json();if(!r.ok)throw 0;}cgRender();
  const mx=PTR.top[0]?PTR.top[0][1]:1;$('#cgTop').innerHTML=`<div class="insb2">${PTR.top.slice(0,8).map(([n,c])=>`<div><span>${esc(n.replace(/^Hon\. /,''))}</span><i style="--w:${(c/mx*100).toFixed(0)}%"></i><b>${c}</b></div>`).join('')}</div>`;requestAnimationFrame(()=>$$('#cgTop i').forEach(e=>e.style.width=e.style.getPropertyValue('--w')));}
  catch(e){$('#cgOut').innerHTML='<p class="note">No se pudo leer el registro de la Cámara. Intenta en un momento.</p>';}}
function cgRender(){if(!PTR||!$('#cgOut'))return;const q=norm(($('#cgQ')||{}).value||''),W=(TRD.watch||[]).map(w=>norm(w)),seen=new Set(TRD.seenPtr||[]);
  const L=PTR.rows.filter(r=>!q||norm(r.name+' '+r.district).includes(q)).slice(0,40);
  $('#cgOut').innerHTML=`<div class="tblw"><table class="ftbl"><thead><tr><th>Miembro</th><th>Estado</th><th>Presentada</th><th></th></tr></thead><tbody>${L.map(r=>{const w=W.some(x=>norm(r.name).includes(x)),nw=w&&!seen.has(r.doc);return `<tr class="${w?'wt':''}"><td>${esc(r.name.replace(/^Hon\. /,''))}${nw?' <span class="gst ok">Nueva</span>':''}</td><td>${esc(r.district)}</td><td>${esc(r.filed)}</td><td><a class="btn" style="padding:5px 10px;font-size:12.5px" href="${esc(r.url)}" target="_blank" rel="noopener">Ver PDF ${ic('ext','',false)}</a></td></tr>`;}).join('')}</tbody></table></div>`;
  const fresh=PTR.rows.filter(r=>W.some(x=>norm(r.name).includes(x))&&!seen.has(r.doc));if(fresh.length){toast(`${fresh.length} declaración${fresh.length>1?'es':''} nueva${fresh.length>1?'s':''} de quienes sigues`,ic('news','',false));TRD.seenPtr=[...seen,...fresh.map(r=>r.doc)].slice(-400);saveTrd();}}

/* ---------- 8. Analista SEC (trader-analyst) ---------- */
let anSym=store.get('anSym','AAPL');const XB={};
function dkAnalyst(b){b.innerHTML=deskHead('Analista de resultados','Lee los números que la empresa reportó a la SEC en sus 10-Q y 10-K (XBRL) y resume qué cambió: ingresos, márgenes, utilidad, BPA diluido y crecimiento frente al mismo trimestre del año anterior.')+
  `<form class="prf" id="anF" autocomplete="off"><div><label class="l" for="anS">Ticker</label><input class="f" id="anS" value="${esc(anSym)}" maxlength="10" style="text-transform:uppercase"></div><button class="btn solid" type="submit">Analizar</button></form><div id="anOut"></div>`;
  $('#anF').onsubmit=e=>{e.preventDefault();anSym=$('#anS').value.trim().toUpperCase();store.set('anSym',anSym);anLoad();};if(!SEC){$('#anOut').innerHTML=needWeb('El analista SEC');return;}anLoad();}
async function anLoad(){const s=anSym,out=$('#anOut');out.innerHTML='<div class="idskel" style="height:280px"></div>';
  try{if(!XB[s]){const r=await fetch(`${SEC}?xbrl=${encodeURIComponent(s)}`);const d=await r.json();if(!r.ok)throw d;XB[s]=d;}if(s!==anSym)return;const d=XB[s],R=[...d.rows].reverse();if(!R.length)throw {message:'Sin datos trimestrales.'};
    const W=Math.max(320,Math.min(900,out.clientWidth||680)),H=210,p={l:8,r:8,t:16,b:26},mx=Math.max(...R.map(r=>r.revenue||0)),gw=(W-p.l-p.r)/R.length,Y=v=>p.t+(1-v/mx)*(H-p.t-p.b);
    let g='';R.forEach((r,i)=>{const x=p.l+i*gw+gw*.2,w=gw*.6;if(r.revenue!=null)g+=`<rect class="fb" x="${x}" y="${Y(r.revenue)}" width="${w}" height="${H-p.b-Y(r.revenue)}" rx="4" fill="var(--ink3)" data-y0="${H-p.b}"><title>Ingresos ${mBig(r.revenue)}</title></rect>`;if(r.net!=null&&r.net>0)g+=`<rect class="fb" x="${x+w*.2}" y="${Y(r.net)}" width="${w*.6}" height="${H-p.b-Y(r.net)}" rx="3" fill="var(--accent)" data-y0="${H-p.b}"><title>Utilidad ${mBig(r.net)}</title></rect>`;g+=`<text x="${x+w/2}" y="${H-8}" text-anchor="middle">${esc(r.label||r.end)}</text>`;});
    const L=d.rows[0],chg=[];if(L.revYoy!=null)chg.push([L.revYoy>=0,`Ingresos ${L.revYoy>=0?'crecieron':'cayeron'} ${Math.abs(L.revYoy)}% frente al mismo trimestre del año anterior (${mBig(L.revenue)}).`]);
    if(L.netYoy!=null)chg.push([L.netYoy>=0,`Utilidad neta ${L.netYoy>=0?'creció':'cayó'} ${Math.abs(L.netYoy)}% (${mBig(L.net)}).`]);if(L.epsYoy!=null)chg.push([L.epsYoy>=0,`BPA diluido de $${L.eps} (${L.epsYoy>=0?'+':''}${L.epsYoy}% interanual).`]);
    if(L.om!=null&&d.rows[4]&&d.rows[4].om!=null){const dm=+(L.om-d.rows[4].om).toFixed(1);chg.push([dm>=0,`Margen operativo de ${L.om}%, ${dm>=0?'+':''}${dm} puntos frente a hace un año.`]);}
    out.innerHTML=`<div class="fkg"><div class="fk"><small>Empresa</small><b>${esc(d.name)}</b><span>CIK ${esc(d.cik)} · último trimestre ${esc(L.label||L.end)}</span></div><div class="fk"><small>Ingresos del trimestre</small><b>${mBig(L.revenue)}</b><span>${L.revYoy!=null?(L.revYoy>=0?'+':'')+L.revYoy+'% interanual':''}</span></div><div class="fk"><small>BPA diluido</small><b>${L.eps!=null?'$'+L.eps:'—'}</b><span>${L.epsYoy!=null?(L.epsYoy>=0?'+':'')+L.epsYoy+'% interanual':''}</span></div></div>
      <div class="fachart">${svgEl(W,H,g,'Ingresos y utilidad por trimestre')}<div class="faleg"><span><i style="background:var(--ink3)"></i>Ingresos</span><span><i style="background:var(--accent)"></i>Utilidad neta</span></div></div>
      <h4 style="margin:4px 0 6px">Qué cambió</h4><ul class="idwhy">${chg.map(([ok,t])=>`<li class="${ok?'':'w'}">${t}</li>`).join('')}</ul>
      <div class="tblw"><table class="ftbl"><thead><tr><th>Trimestre</th><th>Ingresos</th><th>Interanual</th><th>Margen bruto</th><th>Margen operativo</th><th>Utilidad</th><th>BPA</th></tr></thead><tbody>${d.rows.map(r=>`<tr><td>${esc(r.label||r.end)}${r.derived?' <small class="note">(Q4 calculado)</small>':''}</td><td>${mBig(r.revenue)}</td><td class="${(r.revYoy||0)>=0?'u':'d'}">${r.revYoy!=null?(r.revYoy>=0?'+':'')+r.revYoy+'%':'—'}</td><td>${r.gm!=null?r.gm+'%':'—'}</td><td>${r.om!=null?r.om+'%':'—'}</td><td>${mBig(r.net)}</td><td>${r.eps!=null?'$'+r.eps:'—'}</td></tr>`).join('')}</tbody></table></div>
      <p class="note">El cuarto trimestre fiscal se calcula restando los tres primeros del total anual del 10-K, como hacen los analistas.</p>`;
    if(window.gsap&&!RM)gsap.from('#anOut .fb',{attr:{height:0,y:(i,el)=>el.dataset.y0},duration:.9,ease:'expo.out',stagger:.04});}
  catch(e){if(s===anSym)out.innerHTML=`<p class="note">${esc((e&&e.message)||'No se pudieron leer los datos de la SEC.')}</p>`;}}

/* ---------- 9. Filtro (trader-screener) ---------- */
const SM={up:['Potencial según analistas (%)',r=>r.up!=null?r.up*100:null],pe:['P/E',r=>r.pe],fpe:['P/E estimado',r=>r.fpe],peg:['PEG',r=>r.peg],gr:['Crecimiento de utilidades esperado (%)',r=>r.gr],y:['Dividendo (%)',r=>r.y],pos:['Posición en rango 52 semanas (%)',r=>r.pos!=null?r.pos*100:null],m:['Capitalización (mil M$)',r=>r.m/1e9],na:['Analistas que la cubren',r=>r.na]};
const SPRE={growth:['Crecimiento a precio razonable',[['gr','>=',10],['peg','<=',2],['pe','<=',40]]],value:['Valor con dividendo',[['pe','<=',20],['y','>=',2]]],consensus:['Favoritas de analistas',[['up','>=',15],['na','>=',20]]],quality:['Grandes y estables',[['m','>=',200],['pe','<=',35]]]};
function dkScreen(b){if(!TRD.rules)TRD.rules=SPRE.growth[1].map(([m,o,v])=>({m,o,v}));
  b.innerHTML=deskHead('Filtro de acciones','Revisa las empresas más grandes contra tus propias reglas y te dice exactamente qué regla cumple o no cada una, y por cuánto.')+
  `<div class="pchips">${Object.entries(SPRE).map(([k,[n]])=>`<button class="fchip sm" data-k="${k}"><b>${n}</b></button>`).join('')}</div>
  <div class="panel"><h4>Tus reglas</h4><div id="scR"></div><button class="btn" id="scAdd" style="margin-top:8px">+ Agregar regla</button></div><div id="scOut"></div>`;
  $$('.fchip.sm').forEach(x=>x.onclick=()=>{TRD.rules=SPRE[x.dataset.k][1].map(([m,o,v])=>({m,o,v}));saveTrd();scRules();scRun();});
  $('#scAdd').onclick=()=>{TRD.rules.push({m:'up',o:'>=',v:10});saveTrd();scRules();scRun();};scRules();
  if(!MKT){$('#scOut').innerHTML=needWeb('El filtro con datos reales');return;}if(!IDS.length)idLoad().then(scRun);else scRun();}
function scRules(){$('#scR').innerHTML=TRD.rules.map((r,i)=>`<div class="scr"><select class="f" data-i="${i}" data-k="m">${Object.entries(SM).map(([k,[l]])=>`<option value="${k}" ${k===r.m?'selected':''}>${l}</option>`).join('')}</select><select class="f" data-i="${i}" data-k="o" style="max-width:80px">${['>=','<=','>','<'].map(o=>`<option ${o===r.o?'selected':''}>${o}</option>`).join('')}</select><input class="f" data-i="${i}" data-k="v" type="number" step="any" value="${r.v}" style="max-width:110px"><button class="ib" data-x="${i}" aria-label="Quitar regla">${ic('x','',false)}</button></div>`).join('');
  $$('#scR [data-k]').forEach(x=>x.oninput=x.onchange=()=>{const r=TRD.rules[+x.dataset.i];r[x.dataset.k]=x.dataset.k==='v'?+x.value:x.value;saveTrd();scRun();});$$('#scR [data-x]').forEach(x=>x.onclick=()=>{TRD.rules.splice(+x.dataset.x,1);saveTrd();scRules();scRun();});}
function scRun(){const out=$('#scOut');if(!out||!IDS.length){if(out)out.innerHTML='<div class="idskel" style="height:200px"></div>';return;}
  const res=IDS.map(r=>{const chk=TRD.rules.map(u=>{const have=SM[u.m][1](r);if(have==null)return {ok:false,txt:`${SM[u.m][0]}: sin dato`};const ok={'>=':have>=u.v,'<=':have<=u.v,'>':have>u.v,'<':have<u.v}[u.o];const gap=have-u.v;return {ok,txt:`${SM[u.m][0]} ${have.toFixed(1)}${ok?'':` · necesita ${u.o} ${u.v} (le falta ${Math.abs(gap).toFixed(1)})`}`};});return {r,chk,n:chk.filter(c=>c.ok).length};}).sort((a,b)=>b.n-a.n||(b.r.up||0)-(a.r.up||0));
  const pass=res.filter(x=>x.n===TRD.rules.length);
  out.innerHTML=`<div class="fkg"><div class="fk"><small>Cumplen todo</small><b style="color:var(--up)">${pass.length}</b><span>de ${IDS.length} empresas analizadas</span></div><div class="fk"><small>Casi cumplen</small><b>${res.filter(x=>x.n===TRD.rules.length-1).length}</b><span>les falta una regla</span></div></div>
    <div class="scgrid">${res.slice(0,18).map(x=>`<button class="scc ${x.n===TRD.rules.length?'ok':''}" data-s="${esc(x.r.s)}"><div class="idh">${coLogo(x.r.s)}<div class="idn"><b>${esc(x.r.s)}</b><small>${esc(x.r.n)}</small></div><span class="scn">${x.n}/${TRD.rules.length}</span></div><ul class="chk2">${x.chk.map(c=>`<li class="${c.ok?'ok':'no'}">${esc(c.txt)}</li>`).join('')}</ul></button>`).join('')}</div>`;
  $$('#scOut .scc').forEach(x=>x.onclick=()=>coOpen(x.dataset.s));anim('#scOut .scc',{y:14,opacity:0},{y:0,opacity:1,duration:.45,stagger:.025,ease:'expo.out'});}

/* ---------- 10. Impuestos (trader-tax) ---------- */
const lotsOf=h=>(h.lots&&h.lots.length?h.lots:[{q:h.q,c:h.c,t:h.at||Date.now()}]).map((l,i)=>({...l,id:h.s+'-'+(i+1)}));
const termOf=t=>{const a=new Date(t);a.setFullYear(a.getFullYear()+1);return Date.now()>a.getTime()?'largo':'corto';};
function dkTax(b){b.innerHTML=deskHead('Impuestos y lotes','Sigue el costo de cada compra (lote), la ganancia o pérdida no realizada de cada uno, cuánto pagarías al vender según el método de lotes y qué posiciones en pérdida podrías vender para compensar ganancias.')+
  `<div class="panel"><div class="dcfn" style="max-width:520px"><div><label class="l" for="txR">Tasa de impuesto estimada (%)</label><input class="f" id="txR" type="number" step="any" min="0" max="60" value="${TRD.taxRate}"></div></div><p class="note">En Perú, la ganancia por vender acciones suele gravarse con 5% si se negocian en la Bolsa de Valores de Lima; las acciones extranjeras pueden tributar distinto. Confirma tu caso con SUNAT o un contador.</p></div><div id="txOut"></div>`;
  $('#txR').oninput=e=>{TRD.taxRate=+e.target.value;saveTrd();txRun();};if(!RPF.length){$('#txOut').innerHTML='<p class="note">Agrega posiciones en "Mi cartera real" para ver tus lotes.</p>';return;}ensurePrices(RPF.map(h=>h.s)).then(txRun);}
function txRun(){const out=$('#txOut');if(!out)return;const rows=[];let G=0,S=0,Lg=0;
  RPF.forEach(h=>{const p=pxOf(h.s);lotsOf(h).forEach(l=>{const v=p!=null?l.q*p:null,g=v!=null?v-l.q*l.c:null,tm=termOf(l.t);rows.push({h,l,p,v,g,tm});if(g!=null){G+=g;if(tm==='corto')S+=g;else Lg+=g;}});});
  const losers=rows.filter(r=>r.g!=null&&r.g<-1).sort((a,b)=>a.g-b.g);
  out.innerHTML=`<div class="fkg"><div class="fk"><small>Ganancia no realizada</small><b style="color:var(${G>=0?'--up':'--down'})">${m$(G)}</b><span>Impuesto estimado si vendieras todo: ${m$(Math.max(0,G)*TRD.taxRate/100)}</span></div><div class="fk"><small>Corto plazo (≤ 1 año)</small><b>${m$(S)}</b><span>Lotes con menos de un año</span></div><div class="fk"><small>Largo plazo (> 1 año)</small><b>${m$(Lg)}</b><span>En EE.UU. tributa menos; en Perú no cambia</span></div></div>
    <div class="tblw"><table class="ftbl"><thead><tr><th>Lote</th><th>Fecha</th><th>Acciones</th><th>Costo</th><th>Valor</th><th>Ganancia</th><th>Plazo</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.l.id)}</b></td><td>${new Date(r.l.t).toLocaleDateString('es-PE')}</td><td>${+r.l.q.toFixed(4)}</td><td>${m$(r.l.q*r.l.c)}</td><td>${m$(r.v)}</td><td class="${(r.g||0)>=0?'u':'d'}">${m$(r.g)}</td><td>${r.tm==='largo'?'Largo':'Corto'}</td></tr>`).join('')}</tbody></table></div>
    <div class="dkcols"><div class="panel"><h4>Simular una venta</h4><div class="dcfn"><div><label class="l" for="txS">Acción</label><select class="f" id="txS">${RPF.map(h=>`<option>${esc(h.s)}</option>`).join('')}</select></div><div><label class="l" for="txQ">Acciones a vender</label><input class="f" id="txQ" type="number" step="any" min="0"></div>
      <div><label class="l" for="txM">Método de lotes</label><select class="f" id="txM"><option value="fifo">FIFO: primero los más antiguos</option><option value="hifo">HIFO: primero los de costo más alto</option></select></div><div><label class="l" for="txP">Precio de venta ($)</label><input class="f" id="txP" type="number" step="any" min="0"></div></div><div id="txSim"></div></div>
    <div class="panel"><h4>Cosecha de pérdidas</h4>${losers.length?`<p class="note">Vender estos lotes en pérdida compensa ganancias del año. Si vuelves a comprar la misma acción dentro de 30 días antes o después, en EE.UU. la pérdida no cuenta (regla "wash sale"); recompra desde el ${new Date(Date.now()+31*864e5).toLocaleDateString('es-PE')}.</p><div class="rlist">${losers.slice(0,6).map(r=>`<div class="rrow"><div><b>${esc(r.l.id)}</b><small>${+r.l.q.toFixed(4)} acc. · pérdida ${m$(r.g)} (${pctF(r.g/(r.l.q*r.l.c))}) · ahorro estimado ${m$(-r.g*TRD.taxRate/100)}</small></div></div>`).join('')}</div>`:'<p class="note">Ningún lote está en pérdida ahora.</p>'}</div></div>`;
  const sim=()=>{const h=RPF.find(x=>x.s===$('#txS').value),p=+$('#txP').value||pxOf(h.s)||0,q=+$('#txQ').value,meth=$('#txM').value;$('#txP').placeholder=pxOf(h.s)?usd2(pxOf(h.s)):'';
    if(!(q>0)){$('#txSim').innerHTML='<p class="note">Indica cuántas acciones venderías.</p>';return;}let L=lotsOf(h);if(meth==='hifo')L=[...L].sort((a,b)=>b.c-a.c);const held=L.reduce((a,l)=>a+l.q,0);if(q>held+1e-9){$('#txSim').innerHTML=`<p class="autherr">Solo tienes ${+held.toFixed(4)} acciones.</p>`;return;}
    let left=q,used=[];for(const l of L){if(left<=1e-9)break;const tk=Math.min(left,l.q);used.push({l,tk,g:tk*(p-l.c)});left-=tk;}const g=used.reduce((a,u)=>a+u.g,0);
    $('#txSim').innerHTML=`<div class="fkg" style="margin-top:10px"><div class="fk"><small>Recibirías</small><b>${m$(q*p)}</b><span>${q} × ${usd2(p)}</span></div><div class="fk"><small>Ganancia realizada</small><b style="color:var(${g>=0?'--up':'--down'})">${m$(g)}</b><span>Impuesto estimado ${m$(Math.max(0,g)*TRD.taxRate/100)}</span></div></div><p class="note">Lotes usados: ${used.map(u=>`${u.l.id} (${+u.tk.toFixed(4)} acc., ${termOf(u.l.t)} plazo)`).join(', ')}.</p>`;};
  ['#txS','#txQ','#txM','#txP'].forEach(id=>$(id).oninput=$(id).onchange=sim);sim();}

/* ---------- 11. Rebalanceo (trader-rebalance) ---------- */
function dkRebal(b){b.innerHTML=deskHead('Rebalanceo','Compara tu cartera real con tus pesos objetivo y propone solo las operaciones de las acciones que se desviaron más que tu banda: primero ventas, luego compras con el efectivo disponible sobre tu colchón.')+
  `<div class="panel"><div class="dcfn" style="max-width:620px"><div><label class="l" for="rbB">Banda de tolerancia (puntos porcentuales)</label><input class="f" id="rbB" type="number" step="any" min="0" value="${TRD.band}"></div><div><label class="l" for="rbC">Efectivo en tu cuenta ($)</label><input class="f" id="rbC" type="number" step="any" min="0" value="${TRD.cash}"></div></div><p class="note">Objetivo actual: ${TRD.targets.length?esc(TRD.tsrc||'pesos definidos en Presupuesto'):'sin definir: copia a un inversor o agrega pesos en Presupuesto'}.</p></div><div id="rbOut"></div>`;
  $('#rbB').oninput=e=>{TRD.band=+e.target.value;saveTrd();rbRun();};$('#rbC').oninput=e=>{TRD.cash=+e.target.value;saveTrd();rbRun();};
  if(!TRD.targets.length||!RPF.length){$('#rbOut').innerHTML=`<p class="note">${!RPF.length?'Agrega posiciones en "Mi cartera real".':'Define pesos objetivo.'}</p>`;return;}ensurePrices([...RPF.map(h=>h.s),...TRD.targets.map(t=>t.t)]).then(rbRun);}
function rbRun(){const out=$('#rbOut');if(!out||!TRD.targets.length||!RPF.length)return;const held=holdingsMap(),tw={},tsum=TRD.targets.reduce((a,t)=>a+t.w,0);TRD.targets.forEach(t=>tw[t.t]=100*t.w/tsum);
  const need=[...new Set([...Object.keys(held),...Object.keys(tw)])],miss=need.filter(t=>!pxOf(t));if(miss.length){out.innerHTML=`<p class="note">Sin precio para: ${miss.join(', ')}.</p>`;return;}
  const val={};need.forEach(t=>val[t]=(held[t]||0)*pxOf(t));const cash=+TRD.cash||0,total=cash+Object.values(val).reduce((a,v)=>a+v,0),buf=total*TRD.buffer/100,cap=total*TRD.cap/100;
  /* objetivos con límite por acción, el exceso se reparte */
  const tgt={};let act=Object.keys(tw),money=total-buf,capped=new Set();while(act.length){const ws=act.reduce((a,t)=>a+tw[t],0),tr={};act.forEach(t=>tr[t]=money*tw[t]/ws);const ov=act.filter(t=>tr[t]>cap+1e-9);if(!ov.length){Object.assign(tgt,tr);break;}ov.forEach(t=>{tgt[t]=cap;capped.add(t);money-=cap;});act=act.filter(t=>!capped.has(t));}
  const rows=need.map(t=>{const cur=100*val[t]/total,tp=100*(tgt[t]||0)/total,dr=cur-tp,tracked=t in tw,act2=!tracked?'Fuera del objetivo':Math.abs(dr)<=TRD.band?'Mantener':dr>0?'Vender':'Comprar';return {t,cur,tp,dr,tracked,act:act2,delta:(tgt[t]||0)-val[t]};}).sort((a,b)=>b.tp-a.tp);
  const sells=rows.filter(r=>r.act==='Vender').map(r=>({symbol:r.t,side:'sell',qty:Math.floor(-r.delta/pxOf(r.t)*10000)/10000,type:'market',why:`se desvió ${r.dr>0?'+':''}${r.dr.toFixed(1)} puntos de su ${r.tp.toFixed(1)}%`})).filter(o=>o.qty*pxOf(o.symbol)>=(TRD.minOrder||0));
  let cashAfter=cash+sells.reduce((a,o)=>a+o.qty*pxOf(o.symbol),0);const buysW=rows.filter(r=>r.act==='Comprar'),want=buysW.reduce((a,r)=>a+r.delta,0),spend=Math.max(0,cashAfter-buf),sc=want>spend?spend/want:1;
  const buys=buysW.map(r=>({symbol:r.t,side:'buy',notional:Math.floor(r.delta*sc),type:'market',why:`se desvió ${r.dr.toFixed(1)} puntos de su ${r.tp.toFixed(1)}%`})).filter(o=>o.notional>=Math.max(1,TRD.minOrder||0));
  const W=Math.max(320,Math.min(900,out.clientWidth||680)),rh=28,lw=70,mid=lw+(W-lw-80)/2,sc2=(W-lw-80)/2/Math.max(TRD.band*2,...rows.map(r=>Math.abs(r.dr)));
  const g=rows.map((r,i)=>`<g><text class="lb" x="0" y="${i*rh+18}">${esc(r.t)}</text><rect x="${mid-TRD.band*sc2}" y="${i*rh+5}" width="${TRD.band*2*sc2}" height="18" fill="var(--well)" rx="4"/><rect class="dbr" x="${r.dr<0?mid+r.dr*sc2:mid}" y="${i*rh+8}" width="${Math.max(2,Math.abs(r.dr)*sc2)}" height="12" rx="3" fill="var(${Math.abs(r.dr)<=TRD.band?'--ink3':r.dr>0?'--down':'--up'})"/><text class="vl" x="${W-74}" y="${i*rh+18}">${r.dr>0?'+':''}${r.dr.toFixed(1)} pts</text></g>`).join('')+`<line x1="${mid}" x2="${mid}" y1="0" y2="${rows.length*rh}" stroke="var(--ink)" stroke-width="1.5"/>`;
  out.innerHTML=`<div class="fkg"><div class="fk"><small>Valor de la cuenta</small><b>${m$(total)}</b><span>Incluye ${m$(cash)} en efectivo</span></div><div class="fk"><small>Fuera de banda</small><b>${rows.filter(r=>r.act==='Vender'||r.act==='Comprar').length}</b><span>de ${rows.length} posiciones</span></div><div class="fk"><small>Operaciones propuestas</small><b>${sells.length+buys.length}</b><span>${sells.length} ventas · ${buys.length} compras</span></div></div>
    <div class="panel idbars"><h4>Desviación frente al objetivo</h4><p class="note">La zona gris es tu banda de ±${TRD.band} puntos: dentro de ella no se opera.</p>${svgEl(W,rows.length*rh+4,g,'Desviación de cada posición')}</div>
    <div class="tblw"><table class="ftbl"><thead><tr><th>Ticker</th><th>Actual</th><th>Objetivo</th><th>Desviación</th><th>Acción</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.t)}</b></td><td>${r.cur.toFixed(1)}%</td><td>${r.tracked?r.tp.toFixed(1)+'%':'—'}</td><td>${r.dr>0?'+':''}${r.dr.toFixed(1)}</td><td class="${r.act==='Comprar'?'u':r.act==='Vender'?'d':''}">${r.act}</td></tr>`).join('')}</tbody></table></div>
    ${sc<1?`<p class="note warnline">Compras reducidas al ${(sc*100).toFixed(0)}%: solo hay ${m$(spend)} libres sobre tu colchón.</p>`:''}
    <div class="acts"><button class="btn solid" id="rbGo" ${sells.length+buys.length?'':'disabled'}>Enviar ${sells.length+buys.length} operaciones a Control de riesgo →</button></div>`;
  if(window.gsap&&!RM)gsap.from('#rbOut .dbr',{attr:{width:0,x:mid},duration:.9,ease:'expo.out',stagger:.05});
  $('#rbGo').onclick=()=>{TRD.orders=[...sells,...buys];saveTrd();deskGo('risk');};}
addEventListener('storage',e=>{if(e.key==='lc_trd'){TRD={...TRD0,...(store.get('trd',{})||{})};}});
refreshLocks();
/* barrido de transición al cambiar de sección */
{const sw=document.createElement('div');sw.className='vsweep';document.body.appendChild(sw);const _sv20b=setView;setView=function(v,o){const was=VIEW;_sv20b(v,o);if(was&&was!==v&&!RM){sw.classList.remove('go');void sw.offsetWidth;sw.classList.add('go');}};}
/* inclinación suave en tarjetas de inversores y del filtro */
if(FINE&&!RM)document.addEventListener('pointermove',e=>{const t=e.target.closest&&e.target.closest('.fchip,.scc,.ticket');if(!t)return;const r=t.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;t.style.transform=`perspective(700px) rotateX(${(-py*4).toFixed(2)}deg) rotateY(${(px*5).toFixed(2)}deg) translateY(-2px)`;t.onpointerleave=()=>{t.style.transform='';};},{passive:true});

/* ===================== V21: deudas e inversión ===================== */
VIEWS.debt=['deudas'];V2ID.debt='deudas';ID2V.deudas='debt';VTITLE.debt='Deudas';
SYNC.push('debt');
const DB0={cur:'PEN',inc:4500,exp:2500,p0:2000,ext:600,risk:'moderado',debts:[{n:'Tarjeta de crédito',p:10000,b:8000,r:65,m:400},{n:'Préstamo personal',p:20000,b:15000,r:28,m:650}]};
let DBT={...DB0,...(store.get('debt',{})||{})};const saveDebt=()=>store.set('debt',DBT);
const DTPL=[['Tarjeta de crédito',60,4],['Préstamo personal',28,3],['Préstamo vehicular',14,2.2],['Crédito hipotecario',9,.8],['Préstamo de familiares',0,5]];
{const sec=$('#deudas');const b=document.createElement('div');b.className='backbar';b.innerHTML=`<button class="backb" aria-label="Volver al inicio">${ic('right','',false)}<span>Inicio</span></button><span class="crumb">Deudas</span>`;sec.prepend(b);b.querySelector('button').onclick=()=>setView('inicio');}
['#nav','#nav2'].forEach(n=>{const ref=$(n+' a[data-p="goals"]');if(!ref)return;const a=document.createElement('a');a.href='#deudas';a.dataset.p='debt';a.textContent='Deudas';a.addEventListener('click',e=>{e.preventDefault();setView('debt');});ref.after(a);});
$$('#hub .htile[data-v="debt"]').forEach(t=>t.addEventListener('click',()=>setView('debt')));
{const col=$('#menu .mcol');if(col){const b=document.createElement('button');b.className='mi2';b.setAttribute('role','menuitem');b.innerHTML=`${ic('stop','',false)}<span>Deudas e inversión<small>Cuándo quedas libre de deudas</small></span>`;b.onclick=()=>{closeMenu();setView('debt');};col.querySelector('h4').after(b);}}
const dm=v=>`${DBT.cur==='USD'?'$':'S/'} ${Math.round(v).toLocaleString('en-US')}`;
const mr=tea=>Math.pow(1+tea/100,1/12)-1;
const whenM=m=>{const d=new Date();d.setMonth(d.getMonth()+m);return d.toLocaleDateString('es-PE',{month:'long',year:'numeric'});};
const yrsM=m=>m>=12?`${Math.floor(m/12)} año${Math.floor(m/12)>1?'s':''}${m%12?` y ${m%12} mes${m%12>1?'es':''}`:''}`:`${m} mes${m>1?'es':''}`;

/* simulación mes a mes de cada estrategia */
function dSim(kind,o={}){const MAX=600,R=GPROF[DBT.risk]||GPROF.moderado,ri=o.ret??R.r,v=o.vol??0,rand=o.rand,mu=Math.log(1+ri)/12,s=v/Math.sqrt(12);
  const D=DBT.debts.filter(d=>d.b>0).map(d=>({...d,bal:+d.b,rm:mr(+d.r||0),min:+d.m||0,paidAt:null}));let inv=0,cash=+DBT.p0||0,interest=0,payoff=null;const nw=[],debtLine=[],invLine=[];
  const order=kind==='snow'?[...D].sort((a,b)=>a.bal-b.bal):[...D].sort((a,b)=>b.r-a.r);
  const totalDebt=()=>D.reduce((a,d)=>a+d.bal,0);
  const payDebt=(amt)=>{for(const d of order){if(amt<=0)break;if(d.bal<=0)continue;const p=Math.min(amt,d.bal);d.bal-=p;amt-=p;}return amt;};
  /* monto inicial */
  if(kind==='inv')inv+=cash;else if(kind==='mix'){inv+=cash/2;const left=payDebt(cash/2);inv+=left;}else{const left=payDebt(cash);inv+=left;}
  for(let m=1;m<=MAX;m++){let freed=0;
    D.forEach(d=>{if(d.bal<=0){freed+=d.min;return;}const it=d.bal*d.rm;interest+=it;d.bal+=it;const p=Math.min(d.min,d.bal);d.bal-=p;freed+=d.min-p;if(d.bal<=.005){d.bal=0;if(!d.paidAt)d.paidAt=m;}});
    const growth=rand?Math.exp(mu-s*s/2+s*rand()):Math.pow(1+ri,1/12);inv*=growth;
    const debtLeft=totalDebt()>0.005;let extra=(+DBT.ext||0)+freed;
    if(!debtLeft){inv+=extra;}
    else if(kind==='inv'){inv+=extra;if(inv>=totalDebt()){inv-=totalDebt();D.forEach(d=>{if(d.bal>0){d.bal=0;d.paidAt=m;}});}}
    else if(kind==='mix'){inv+=extra/2;inv+=payDebt(extra/2);}
    else inv+=payDebt(extra);
    D.forEach(d=>{if(d.bal<=.005&&!d.paidAt){d.bal=0;d.paidAt=m;}});
    if(payoff==null&&totalDebt()<=.005)payoff=m;
    if(!rand&&(m<=480)){nw.push(inv-totalDebt());debtLine.push(totalDebt());invLine.push(inv);}
    if(rand&&payoff!=null)break;}
  return {payoff,interest,nw,debtLine,invLine,inv,D,order};}
function dMC(){const R=GPROF[DBT.risk]||GPROF.moderado,res=[];const g=rng(777);for(let i=0;i<400;i++){const rnd=()=>{const u1=g()||1e-9,u2=g();return Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);};const s=dSim('inv',{vol:R.v,rand:rnd});res.push(s.payoff??9999);}
  res.sort((a,b)=>a-b);const q=p=>res[Math.floor(p*(res.length-1))];return {p10:q(.1),p50:q(.5),p90:q(.9)};}

function debtRender(){const box=$('#dWrap');if(!box)return;
  box.innerHTML=`<div class="dkcols"><div>
      <div class="panel"><h4>Tus ingresos y gastos</h4><div class="seg" id="dCur" style="margin-bottom:10px"><button data-v="PEN" class="${DBT.cur!=='USD'?'act':''}">Soles (S/)</button><button data-v="USD" class="${DBT.cur==='USD'?'act':''}">Dólares ($)</button></div>
        <div class="dcfn"><div><label class="l" for="dInc">Ingreso mensual neto</label><input class="f" id="dInc" type="number" min="0" step="any" value="${DBT.inc}"></div><div><label class="l" for="dExp">Gastos mensuales (sin deudas)</label><input class="f" id="dExp" type="number" min="0" step="any" value="${DBT.exp}"></div></div></div>
      <div class="panel"><h4>Para invertir o pagar</h4><div class="dcfn"><div><label class="l" for="dP0">Monto inicial disponible</label><input class="f" id="dP0" type="number" min="0" step="any" value="${DBT.p0}"></div><div><label class="l" for="dExt">Monto mensual extra</label><input class="f" id="dExt" type="number" min="0" step="any" value="${DBT.ext}"><small class="hint">Además de los pagos mínimos</small></div></div>
        <label class="l">Cómo invertirías</label><div class="seg" id="dRisk">${Object.entries(GPROF).map(([k,p])=>`<button data-v="${k}" class="${DBT.risk===k?'act':''}">${p.l.split(' (')[0]} ${pctF(p.r)}</button>`).join('')}</div></div></div>
    <div class="panel"><div class="pfth"><h4>Tus deudas</h4><span class="note">Tasa efectiva anual (TEA)</span></div><div id="dList"></div>
      <div class="pchips" style="margin-top:10px">${DTPL.map((t,i)=>`<button class="fchip sm" data-t="${i}"><b>+ ${t[0]}</b></button>`).join('')}</div></div></div>
  <div id="dOut"></div>`;
  const segs=(id,k)=>$$(id+' button').forEach(b=>b.onclick=()=>{$$(id+' button').forEach(x=>x.classList.toggle('act',x===b));DBT[k]=b.dataset.v;saveDebt();dCalc();});segs('#dCur','cur');segs('#dRisk','risk');
  [['dInc','inc'],['dExp','exp'],['dP0','p0'],['dExt','ext']].forEach(([id,k])=>$('#'+id).oninput=e=>{DBT[k]=+e.target.value;saveDebt();dCalcSoon();});
  $$('.fchip[data-t]').forEach(b=>b.onclick=()=>{const t=DTPL[+b.dataset.t];DBT.debts.push({n:t[0],p:5000,b:5000,r:t[1],m:Math.round(5000*t[2]/100)});saveDebt();dList();dCalc();});
  dList();dCalc();}
/* progreso de cada préstamo: cuánto del capital ya pagaste */
function dProg(d){const p=+d.p||0,b=+d.b||0;if(!(p>0))return '<span class="dpg muted">Escribe el capital prestado para ver cuánto llevas pagado.</span>';
  if(b>p)return `<span class="dpg warn">Tu saldo (${dm(b)}) supera el capital prestado (${dm(p)}): debes intereses acumulados o comisiones.</span>`;
  const f=(p-b)/p;return `<span class="dpg"><span class="dbar"><i style="width:${(f*100).toFixed(1)}%"></i></span><span>Pagaste <b>${dm(p-b)}</b> de ${dm(p)} · ${pctF(f,0)} del capital</span></span>`;}
function dList(){$('#dList').innerHTML=DBT.debts.length?`<div class="dlist">${DBT.debts.map((d,i)=>`<div class="drow"><input class="f" data-i="${i}" data-k="n" value="${esc(d.n)}" aria-label="Nombre de la deuda"><label><small>Capital prestado</small><input class="f" data-i="${i}" data-k="p" type="number" min="0" step="any" value="${d.p??''}" placeholder="Monto original"></label><label><small>Saldo que debes hoy</small><input class="f" data-i="${i}" data-k="b" type="number" min="0" step="any" value="${d.b}"></label><label><small>TEA %</small><input class="f" data-i="${i}" data-k="r" type="number" min="0" step="any" value="${d.r}"></label><label><small>Cuota o pago mínimo</small><input class="f" data-i="${i}" data-k="m" type="number" min="0" step="any" value="${d.m}"></label><button class="ib" data-x="${i}" aria-label="Quitar">${ic('x','',false)}</button><div class="dprog" id="dPg${i}">${dProg(d)}</div></div>`).join('')}</div>`:'<p class="note">Sin deudas. Agrega una con los botones de abajo.</p>';
  $$('#dList [data-k]').forEach(x=>x.oninput=()=>{const i=+x.dataset.i,d=DBT.debts[i];d[x.dataset.k]=x.dataset.k==='n'?x.value:(x.value===''?null:+x.value);saveDebt();const pg=$('#dPg'+i);if(pg)pg.innerHTML=dProg(d);dCalcSoon();});
  $$('#dList [data-x]').forEach(x=>x.onclick=()=>{DBT.debts.splice(+x.dataset.x,1);saveDebt();dList();dCalc();});}
let dT=0;const dCalcSoon=()=>{clearTimeout(dT);dT=setTimeout(dCalc,250);};
function dCalc(){const out=$('#dOut');if(!out)return;const D=DBT.debts.filter(d=>d.b>0);
  if(!D.length){out.innerHTML=`<div class="panel coempty"><h3>Sin deudas</h3><p class="note">Todo lo que puedas destinar va directo a invertir. Revisa tus metas en la sección Metas.</p></div>`;return;}
  const tot=D.reduce((a,d)=>a+ +d.b,0),mins=D.reduce((a,d)=>a+ +d.m,0),wr=D.reduce((a,d)=>a+d.b*d.r,0)/tot,surplus=DBT.inc-DBT.exp-mins,dti=DBT.inc?mins/DBT.inc:0,R=GPROF[DBT.risk];
  const bad=D.filter(d=>d.b*mr(d.r)>=d.m-.01);
  const S={aval:dSim('aval'),snow:dSim('snow'),inv:dSim('inv'),mix:dSim('mix')};
  const H=Math.min(480,Math.max(24,...Object.values(S).map(s=>s.payoff||480))+24);const nwAt=s=>s.nw[Math.min(s.nw.length,H)-1];
  const NAMES={aval:['Avalancha','Pagas primero la deuda con la tasa más alta y luego inviertes todo.'],snow:['Bola de nieve','Pagas primero la deuda más pequeña (motivación rápida) y luego inviertes.'],inv:['Invertir primero','Pagas solo mínimos e inviertes el resto; liquidas las deudas cuando tu inversión alcanza para cubrirlas.'],mix:['Mitad y mitad','La mitad del extra a deudas y la mitad a inversión.']};
  const valid=Object.entries(S).filter(([,s])=>s.payoff);const best=valid.sort((a,b)=>nwAt(b[1])-nwAt(a[1]))[0];const fastest=[...valid].sort((a,b)=>a[1].payoff-b[1].payoff)[0];
  const mc=dMC();
  const ok=(t,c)=>`<div class="fk"><small>${t[0]}</small><b ${c?`style="color:var(${c})"`:''}>${t[1]}</b><span>${t[2]}</span></div>`;
  const DP=D.filter(d=>+d.p>0),capT=DP.reduce((a,d)=>a+ +d.p,0),capPaid=DP.reduce((a,d)=>a+Math.max(0,d.p-d.b),0);
  out.innerHTML=`<div class="fkg">${ok(['Deuda total',dm(tot),`${D.length} deuda${D.length>1?'s':''} · tasa promedio ${wr.toFixed(1)}% TEA`])}${capT?ok(['Capital ya pagado',dm(capPaid),`${pctF(capPaid/capT,0)} de ${dm(capT)} prestados`],'--up'):''}${ok(['Pagos mínimos al mes',dm(mins),`${pctF(dti,0)} de tu ingreso`],dti>.43?'--down':dti>.36?'--gold':null)}${ok(['Te sobra cada mes',dm(surplus),`Ingreso − gastos − mínimos`],surplus<DBT.ext?'--down':'--up')}${ok(['Más rápido libre de deudas',fastest?yrsM(fastest[1].payoff):'—',fastest?`${NAMES[fastest[0]][0]} · ${whenM(fastest[1].payoff)}`:'Con estos pagos no terminas'],'--up')}</div>
    ${surplus<DBT.ext?`<p class="autherr">Tu monto mensual extra (${dm(DBT.ext)}) es mayor a lo que te sobra (${dm(surplus)}). Ajusta tus gastos o el monto.</p>`:''}
    ${bad.length?`<p class="autherr">El pago mínimo de ${bad.map(d=>esc(d.n)).join(', ')} no cubre los intereses: esa deuda crece cada mes aunque pagues.</p>`:''}
    <div class="dstrat">${Object.entries(S).map(([k,s])=>`<div class="dsc ${best&&best[0]===k?'best':''}">${best&&best[0]===k?'<span class="dbest">Mejor resultado</span>':''}<h4>${NAMES[k][0]}</h4><p class="note">${NAMES[k][1]}</p>
      <div class="drows"><div><span>Libre de deudas en</span><b>${s.payoff?yrsM(s.payoff):'Más de 50 años'}</b></div><div><span>Fecha</span><b>${s.payoff?whenM(s.payoff):'—'}</b></div><div><span>Intereses pagados</span><b style="color:var(--down)">${dm(s.interest)}</b></div><div><span>Patrimonio en ${yrsM(H)}</span><b style="color:var(${nwAt(s)>=0?'--up':'--down'})">${dm(nwAt(s))}</b></div></div></div>`).join('')}</div>
    <div class="panel"><h4>Tu patrimonio neto mes a mes (inversiones menos deudas)</h4><div class="fachart" id="dCh"></div></div>
    <div class="dkcols"><div class="panel"><h4>Invirtiendo: cuándo podrías pagar todo</h4><p class="note">Si inviertes y pagas solo mínimos, tu inversión alcanzaría para liquidar todas tus deudas en:</p>
        <div class="fkg"><div class="fk"><small>Escenario central</small><b>${mc.p50<9999?yrsM(mc.p50):'—'}</b><span>${mc.p50<9999?whenM(mc.p50):'No alcanza'}</span></div><div class="fk"><small>Buen mercado</small><b>${mc.p10<9999?yrsM(mc.p10):'—'}</b><span>1 de cada 10 escenarios, antes</span></div><div class="fk"><small>Mal mercado</small><b>${mc.p90<9999?yrsM(mc.p90):'Más de 50 años'}</b><span>1 de cada 10 escenarios, después</span></div></div>
        <p class="note">Calculado con 400 escenarios de mercado al ${pctF(R.r)} anual esperado y ${pctF(R.v,0)} de volatilidad (perfil ${DBT.risk}).</p></div>
      <div class="panel"><h4>Orden de pago recomendado</h4><ol class="dord">${S.aval.order.map(d=>`<li><b>${esc(d.n)}</b><span>${d.r}% TEA · debes ${dm(d.b)}${+d.p>0&&d.p>=d.b?` de ${dm(d.p)} (${pctF((d.p-d.b)/d.p,0)} pagado)`:''} · libre en ${d.paidAt?whenM(d.paidAt):'—'}</span></li>`).join('')}</ol></div></div>
    <div class="panel"><h4>Qué conviene en tu caso</h4><ul class="idwhy">${dAdvice(D,R,S,best,surplus,dti).map(([w,t])=>`<li class="${w?'w':''}">${t}</li>`).join('')}</ul>
      <p class="disc">Simulación educativa con pagos mensuales y tasas fijas. Las inversiones pueden perder valor y vender para pagar deudas puede generar impuestos o comisiones. Las tasas de tarjetas en Perú suelen superar el 40% TEA: consulta tu cronograma real con tu banco.</p></div>`;
  dChart(S,H);anim('#dOut .dsc',{y:18,opacity:0},{y:0,opacity:1,duration:.5,stagger:.06,ease:'expo.out',clearProps:'transform,opacity'});}
function dAdvice(D,R,S,best,surplus,dti){const a=[],mx=D.reduce((m,d)=>d.r>m.r?d:m,D[0]),ret=R.r*100;
  if(mx.r>ret+2)a.push([0,`Tu deuda más cara (${esc(mx.n)}) cuesta ${mx.r}% al año y tu inversión rendiría alrededor de ${ret.toFixed(1)}%. Pagarla es como ganar ${mx.r}% seguro: va primero.`]);
  else a.push([0,`Tus deudas cuestan menos de lo que esperas ganar invirtiendo (${ret.toFixed(1)}%). Invertir mientras pagas los mínimos puede darte más patrimonio, aunque con el riesgo del mercado.`]);
  if(best)a.push([0,`Con tus números, la estrategia que deja más patrimonio es <b>${{aval:'Avalancha',snow:'Bola de nieve',inv:'Invertir primero',mix:'Mitad y mitad'}[best[0]]}</b>.`]);
  const sv=S.snow.interest-S.aval.interest;if(sv>1)a.push([0,`Avalancha te ahorra ${dm(sv)} en intereses frente a Bola de nieve.`]);
  if(dti>.36)a.push([1,`Tus pagos mínimos son ${pctF(dti,0)} de tu ingreso. Los bancos consideran riesgoso pasar de 36%–40%: evita deuda nueva.`]);
  if(surplus<(DBT.exp*.1))a.push([1,'Tu margen mensual es muy ajustado. Antes de invertir, arma un fondo de emergencia de al menos 1 mes de gastos.']);
  a.push([0,`Una vez libre de deudas, destinar ese mismo pago mensual a invertir acelera tu patrimonio: es el efecto de "pagarte a ti mismo".`]);
  return a;}
function dChart(S,H){const el=$('#dCh');if(!el)return;const W=Math.max(320,Math.min(1100,el.clientWidth||700)),Ht=260,p={l:64,r:110,t:14,b:26},keys=['aval','snow','inv','mix'],cols={aval:'var(--up)',snow:'var(--gold)',inv:'var(--accent)',mix:'var(--ink3)'},nm={aval:'Avalancha',snow:'Bola de nieve',inv:'Invertir primero',mix:'Mitad y mitad'};
  const all=keys.flatMap(k=>S[k].nw.slice(0,H)),mx=Math.max(...all,1),mn=Math.min(...all,0),X=m=>p.l+m/(H-1)*(W-p.l-p.r),Y=v=>p.t+(mx-v)/((mx-mn)||1)*(Ht-p.t-p.b);
  let g='';for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4;g+=`<line class="ax" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v)+4}">${Math.abs(v)>=1e6?(v/1e6).toFixed(1)+' M':Math.round(v/1000)+' mil'}</text>`;}
  g+=`<line x1="${p.l}" x2="${W-p.r}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--ink)" stroke-width="1.2"/>`;
  const yrs=Math.ceil(H/12);for(let y=0;y<=yrs;y+=Math.max(1,Math.ceil(yrs/6)))g+=`<text x="${X(Math.min(H-1,y*12))}" y="${Ht-6}" text-anchor="middle">${(()=>{const d=new Date();d.setMonth(d.getMonth()+y*12);return d.toLocaleDateString('es-PE',{month:'short',year:'numeric'});})()}</text>`;
  const ends=keys.map(k=>({k,v:S[k].nw[Math.min(S[k].nw.length,H)-1]})).sort((a,b)=>b.v-a.v);let ly=-99;
  keys.forEach(k=>{const a=S[k].nw.slice(0,H);g+=`<path class="dl" stroke="${cols[k]}" d="${a.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join('')}"/>`;if(S[k].payoff&&S[k].payoff<H)g+=`<circle cx="${X(S[k].payoff-1)}" cy="${Y(a[S[k].payoff-1])}" r="4.5" fill="${cols[k]}" class="dpo"><title>${nm[k]}: libre de deudas en ${whenM(S[k].payoff)}</title></circle>`;});
  ends.forEach(e=>{let y=Y(e.v)+4;if(y-ly<14)y=ly+14;ly=y;g+=`<text x="${W-p.r+8}" y="${y}" fill="${cols[e.k]}" class="dle">${nm[e.k]}</text>`;});
  el.innerHTML=svgEl(W,Ht,g,'Patrimonio neto por estrategia')+`<div class="faleg">${keys.map(k=>`<span><i style="background:${cols[k]}"></i>${nm[k]}</span>`).join('')}<span><i style="background:var(--ink);border-radius:50%"></i>Punto = libre de deudas</span></div>`;
  if(window.gsap&&!RM){$$('#dCh .dl').forEach((pth,i)=>{const L=pth.getTotalLength();gsap.fromTo(pth,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.6,ease:'power2.inOut',delay:i*.1});});gsap.from('#dCh .dpo',{attr:{r:0},duration:.5,delay:1.4,stagger:.1,ease:'back.out(3)'});gsap.from('#dCh .dle',{opacity:0,x:-6,duration:.5,delay:1.3,stagger:.08});}}
const _sv21=setView;setView=function(v,o){_sv21(v,o);if(v==='debt')debtRender();};
{const v=ID2V[location.hash.slice(1)];if(v==='debt')setView('debt',{noHash:true});}
addEventListener('storage',e=>{if(e.key==='lc_debt'){DBT={...DB0,...(store.get('debt',{})||{})};if(VIEW==='debt')debtRender();}});
/* acceso directo desde la bienvenida */
{const q=$('#gQuick');if(q&&!q.querySelector('[data-debt]')){const b=document.createElement('button');b.className='gq';b.dataset.debt='1';b.innerHTML=`${ic('stop','',false)}<span><b>Salir de deudas</b><small>Cuándo quedas libre invirtiendo</small></span>`;b.onclick=()=>gateClose(()=>setView('debt'));q.prepend(b);}}

/* ===================== V22: plan con acciones reales y lista de compra exacta ===================== */
const ETFS=[['VOO','Vanguard S&P 500 ETF','500 mayores empresas de EE.UU.',.03,'Renta variable EE.UU.'],['VTI','Vanguard Total Stock Market ETF','Todo el mercado de EE.UU.',.03,'Renta variable EE.UU.'],['QQQM','Invesco Nasdaq 100 ETF','100 mayores tecnológicas del Nasdaq',.15,'Crecimiento / tecnología'],['SCHD','Schwab U.S. Dividend Equity ETF','Empresas de EE.UU. con dividendos sólidos',.06,'Dividendos'],['VXUS','Vanguard Total International Stock ETF','Acciones fuera de EE.UU.',.05,'Internacional'],['VWO','Vanguard FTSE Emerging Markets ETF','Mercados emergentes',.08,'Emergentes'],['BND','Vanguard Total Bond Market ETF','Bonos de EE.UU. de alta calidad',.03,'Renta fija'],['SGOV','iShares 0-3 Month Treasury Bond ETF','Letras del Tesoro a muy corto plazo (casi efectivo)',.09,'Liquidez'],['IAU','iShares Gold Trust','Oro físico',.25,'Oro'],['EPU','iShares MSCI Peru ETF','Empresas peruanas',.59,'Perú'],['VNQ','Vanguard Real Estate ETF','Inmobiliario de EE.UU.',.13,'Inmobiliario']];
const ETFM=Object.fromEntries(ETFS.map(e=>[e[0],e]));
const LQ={};
async function liveQuotes(list){const need=[...new Set(list)].filter(s=>!LQ[s]&&!pxOf(s));if(MKT&&need.length){for(let i=0;i<need.length;i+=16){try{const r=await fetch(`${MKT}?quotes=${need.slice(i,i+16).join(',')}`);const d=await r.json();Object.assign(LQ,d.q||{});}catch(e){}}}
  const o={};list.forEach(s=>{const r=CO.find(x=>x.s===s);o[s]=r?{p:r.p,pc:r.pc,n:r.n,src:'live'}:LQ[s]||(PFX[s]?{p:PFX[s].p,pc:PFX[s].pc,src:'live'}:null);});return o;}
function horizonOf(q){const y=/(\d+(?:[.,]\d+)?)\s*(años?|a\b|years?)/i.exec(q),m=/(\d+)\s*(meses?|m\b)/i.exec(q);return y?Math.round(parseFloat(y[1].replace(',','.'))*12):m?+m[1]:36;}
/* cartera por reglas, sin IA: núcleo de ETF + acciones con mejor puntaje real */
function rulesPlan(q,risk){const a=parseAmt(q)||{n:2000,cur:'S/'},M=horizonOf(q),cur=a.cur==='$'?'USD':'PEN';let core;
  if(M<12)core=[['SGOV',60],['BND',25],['VOO',15]];
  else if(risk==='conservador')core=[['SGOV',20],['BND',30],['VOO',30],['SCHD',10],['IAU',10]];
  else if(risk==='agresivo')core=[['VOO',35],['QQQM',20],['VXUS',10],['EPU',5]];
  else core=[['VOO',40],['VXUS',15],['BND',20],['SCHD',10]];
  const used=core.reduce((x,c)=>x+c[1],0),nStk=M<12?0:risk==='agresivo'?3:risk==='moderado'?2:0,stk=[];
  if(nStk&&IDS.length){const S=idScore(IDS,risk).filter(r=>r.rt&&!/Venta/.test(r.rt)&&(r.up==null||r.up>0)).sort((x,y)=>y.score-x.score);const seen=new Set();for(const r of S){if(seen.has(r.sec))continue;seen.add(r.sec);stk.push(r);if(stk.length>=nStk)break;}}
  const rest=100-used,per=stk.length?Math.floor(rest/stk.length):0;if(!stk.length&&rest>0)core[0][1]+=rest;
  const cart=[...core.map(([t,w])=>{const e=ETFM[t];return {ticker:t,nombre:e[1],mercado:'NYSE Arca / Nasdaq',tipo:'ETF',porcentaje:w,riesgo:['SGOV','BND'].includes(t)?'Bajo':['IAU','VOO','VTI','SCHD'].includes(t)?'Medio':'Alto',razon:`${e[2]}. Costo anual aprox. ${e[3].toFixed(2)}%. Rol: ${e[4].toLowerCase()}.`};}),
    ...stk.map((r,i)=>({ticker:r.s,nombre:r.n,mercado:'EE.UU.',tipo:'Acción',porcentaje:i===stk.length-1?rest-per*(stk.length-1):per,riesgo:'Alto',razon:`Puntaje ${r.score}/99 en Ideas de inversión: ${r.rt?'consenso '+r.rt.toLowerCase()+', ':''}${r.up!=null?'potencial '+pctF(r.up,0)+' según analistas':''}${r.pe?', P/E '+r.pe.toFixed(1):''}.`}))];
  const amt=a.n,ret={conservador:.045,moderado:.065,agresivo:.085}[risk]||.065,vol={conservador:.06,moderado:.11,agresivo:.16}[risk]||.11,yrs=M/12,base=amt*Math.pow(1+ret,yrs);
  cart.forEach(c=>c.monto=Math.round(amt*c.porcentaje/100));
  return {monto:amt,moneda:cur,plazo_meses:M,meta_pct:+(100*(Math.pow(1+ret,yrs)-1)).toFixed(1),supuestos:`Plazo de ${M} meses y rendimiento esperado de ${pctF(ret)} anual para un perfil ${risk}.`,resumen:`Cartera ${risk} armada con reglas: un núcleo de ETF de bajo costo${stk.length?` y ${stk.length} acción${stk.length>1?'es':''} con el mejor puntaje real de hoy`:''}.`,realismo:'La meta mostrada es el rendimiento esperado del perfil, no una promesa.',cartera:cart,
    escenarios:{pesimista:Math.round(amt*Math.pow(1+ret-1.28*vol/Math.sqrt(Math.max(1,yrs)),yrs)),base:Math.round(base),optimista:Math.round(amt*Math.pow(1+ret+1.28*vol/Math.sqrt(Math.max(1,yrs)),yrs))},consejos:['Compra el núcleo de ETF primero: es lo que más diversifica.','Si tu bróker permite fracciones, compra montos exactos; si no, usa las acciones enteras de la lista.','Revisa y rebalancea una vez al año.'],reglas:true};}
const _runAI22=runAI;
runAI=async function(){const q=$('#q').value.trim(),out=$('#out');if(!q){$('#q').focus();toast('Escribe cuánto quieres invertir');return;}
  const risk=$('#risk .pill.act').dataset.v;
  if(!MKT){if(!sample){render(rulesPlan(q,risk));return;}return _runAI22();}
  $('#go').disabled=true;out.innerHTML=`<div class="card" style="animation:pageIn .4s var(--ease-out)"><div class="thinking">${MARK}<span class="shim">Leyendo precios reales y el ranking de hoy…</span></div><div class="stream" id="st"></div></div>`;
  try{if(!CO.length)await coLoad();if(!IDS.length)await idLoad();}catch(e){}
  const Q=await liveQuotes(ETFS.map(e=>e[0]));
  if(!sample){const d=rulesPlan(q,risk);await planEnrich(d);store.set('plan',d);render(d);$('#go').disabled=false;return;}
  const top=idScore(IDS,risk).sort((a,b)=>b.score-a.score).slice(0,24);
  const uni=[...ETFS.filter(e=>Q[e[0]]).map(e=>`${e[0]} | ETF | ${e[1]} | ${e[2]} | costo anual ${e[3]}% | precio $${Q[e[0]].p}`),...top.map(r=>`${r.s} | Acción | ${r.n} | ${SECES[r.sec]||r.sec} | precio $${r.p} | potencial analistas ${r.up!=null?(r.up*100).toFixed(0)+'%':'n/d'} | P/E ${r.pe?r.pe.toFixed(1):'n/d'} | dividendo ${r.y||0}% | consenso ${r.rt||'n/d'} | puntaje ${r.score}`)].join('\n');
  const prompt=`Eres el analista de la app "Lucioni Capital". El usuario escribió: "${q.replace(/"/g,"'")}". Perfil de riesgo: ${risk}.
1) Extrae presupuesto (monto y moneda USD o PEN), plazo en meses y meta de ganancia en %. "Duplicar" = 100%. Si falta algo, asume algo razonable y dilo en "supuestos".
2) Arma una cartera diversificada de 4 a 7 posiciones eligiendo SOLO tickers de esta lista de instrumentos reales con precios de hoy (no inventes otros):
${uni}
Usa ETF amplios como núcleo (más peso si el monto es pequeño o el plazo corto) y, si el perfil lo permite, agrega 1 a 3 acciones de la lista con buen puntaje y de sectores distintos. Porcentajes enteros que suman 100. En "razon" explica el rol y cita un dato de la lista. Si la meta es poco realista, dilo con honestidad. Nunca prometas ganancias.
Responde SOLO con JSON válido en español:
{"monto":0,"moneda":"USD","plazo_meses":12,"meta_pct":0,"supuestos":"","resumen":"2-3 frases","realismo":"1-2 frases","cartera":[{"ticker":"","nombre":"","mercado":"","tipo":"Acción|ETF","porcentaje":0,"monto":0,"riesgo":"Bajo|Medio|Alto","razon":"1-2 frases"}],"escenarios":{"pesimista":0,"base":0,"optimista":0},"consejos":["","",""]}
"escenarios" = valor final estimado de toda la cartera al terminar el plazo, en la moneda del usuario.`;
  try{const res=await sample(prompt,{modelTier:'default',cache:false,onText:({text})=>{const st=$('#st');if(st){st.textContent=text;st.scrollTop=st.scrollHeight;}}});
    let d=pj(res.text);const ok=new Set([...ETFS.map(e=>e[0]),...top.map(r=>r.s)]);const bad=(d.cartera||[]).filter(c=>!ok.has(String(c.ticker).toUpperCase()));
    if(!d.cartera||!d.cartera.length||bad.length>1){d=rulesPlan(q,risk);}else if(bad.length){const b=bad[0],tot=d.cartera.filter(c=>c!==b);tot[0].porcentaje+=b.porcentaje;d.cartera=tot;}
    await planEnrich(d);store.set('plan',d);render(d);checkAch();}
  catch(e){const d=rulesPlan(q,risk);await planEnrich(d);store.set('plan',d);render(d);toast('La IA no respondió: armamos tu cartera con reglas y datos reales',ic('check','',false));}
  finally{$('#go').disabled=false;}};
/* precios en vivo y acciones exactas */
async function planEnrich(d){const Q=await liveQuotes((d.cartera||[]).map(c=>String(c.ticker).toUpperCase()));const fx=FXD.rate||3.75,usd=d.moneda==='PEN'?(+d.monto||0)/fx:(+d.monto||0);
  (d.cartera||[]).forEach(c=>{c.ticker=String(c.ticker).toUpperCase();const q=Q[c.ticker];c.usd=+(usd*c.porcentaje/100).toFixed(2);c.monto=Math.round((+d.monto||0)*c.porcentaje/100);
    if(q&&q.p){c.precio=q.p;c.pc=q.pc;c.precio_ref=`$${q.p.toFixed(2)}${q.src==='close'?' (cierre)':' en vivo'}`;c.frac=+(c.usd/q.p).toFixed(4);c.ent=Math.floor(c.usd/q.p);}});
  d.fx=fx;d.usd=+usd.toFixed(2);d.at=Date.now();}
const _render22=render;
render=function(d,quiet){_render22(d,quiet);if(!d||!d.cartera)return;const out=$('#out .result');if(!out)return;
  if(d.precio==null&&!d.cartera.some(c=>c.precio))return buyStale(d);
  const C=d.cartera,fx=d.fx||FXD.rate||3.75,whole=C.reduce((a,c)=>a+(c.ent||0)*(c.precio||0),0),left=(d.usd||0)-whole;
  const box=document.createElement('div');box.className='buylist';box.innerHTML=`<div class="blh"><div><span class="blk">Lista de compra exacta</span><h3>Qué comprar, cuántas acciones y a qué precio</h3><p class="note">Precios reales de hoy${d.at?' · '+new Date(d.at).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'}):''} ${d.moneda==='PEN'?'·':''} ${d.moneda==='PEN'?`Tus ${fmt(d.monto,'PEN')} equivalen a unos $${(d.usd||0).toLocaleString('en-US',{maximumFractionDigits:0})} al tipo de cambio de S/ ${fx.toFixed(2)} (puedes ajustarlo en Herramientas → Soles y dólares).`:''}</p></div>
      <div class="seg" id="blMode"><button data-m="frac" class="act">Con fracciones</button><button data-m="ent">Acciones enteras</button></div></div>
    <div class="tblw"><table class="ftbl bltb"><thead><tr><th>Comprar</th><th>Peso</th><th>Monto</th><th>Precio hoy</th><th>Cantidad</th><th></th></tr></thead><tbody>${C.map((c,i)=>`<tr><td><span class="bltk"><i style="background:${COLORS[i%8]}"></i><b>${esc(c.ticker)}</b></span><small>${esc(c.nombre||'')}</small></td><td>${c.porcentaje}%</td><td>$${(c.usd||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>${c.precio?usd2(c.precio)+(c.pc!=null?` <small style="color:var(${c.pc>=0?'--up':'--down'})">${pcS(c.pc)}</small>`:''):'<small class="note">sin precio</small>'}</td><td class="blq" data-f="${c.frac??''}" data-e="${c.ent??''}"><b>${c.frac!=null?(+c.frac).toLocaleString('en-US',{maximumFractionDigits:4}):'—'}</b><small> acciones</small></td><td><button class="btn solid blb" data-t="${esc(c.ticker)}" data-i="${i}" style="padding:7px 12px;font-size:13px">${ic('broker','',false)} Comprar</button></td></tr>`).join('')}</tbody></table></div>
    <div class="blfoot" id="blFoot"></div>
    <div class="acts"><button class="btn" id="blCopy">Copiar lista</button><button class="btn" id="blDesk">Llevar a la Mesa: revisar riesgo y confirmar</button><button class="btn" id="blRef">${ic('clock','',false)} Actualizar precios</button></div>
    <p class="disc">Cómo comprar: abre tu bróker (por ejemplo eToro, Hapi o Interactive Brokers; revisa que acepte residentes de Perú), busca cada ticker y compra el monto o la cantidad indicada con orden "a mercado" o "límite" cerca del precio de hoy. Los precios cambian durante el día. Lucioni Capital no recibe comisiones y no compra por ti. No es asesoría financiera personalizada.</p>`;
  const sc=out.querySelector('.scen');(sc?sc.previousElementSibling:out.querySelector('.disc')).before(box);
  let mode='frac';const foot=()=>{const spent=mode==='frac'?C.reduce((a,c)=>a+(c.precio?c.usd:0),0):whole;$('#blFoot').innerHTML=`<span>Total a invertir <b>$${spent.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</b></span>${mode==='ent'?`<span>Te sobran <b>$${Math.max(0,left).toLocaleString('en-US',{maximumFractionDigits:2})}</b> por comprar acciones enteras</span>`:'<span>Necesitas un bróker que permita fracciones</span>'}`;};
  $$('#blMode button').forEach(b=>b.onclick=()=>{mode=b.dataset.m;$$('#blMode button').forEach(x=>x.classList.toggle('act',x===b));$$('.blq').forEach(td=>{const v=td.dataset[mode==='frac'?'f':'e'];const el=td.querySelector('b');const n=v===''?null:+v;if(window.gsap&&!RM&&n!=null){const o={v:0};gsap.to(o,{v:n,duration:.6,ease:'expo.out',onUpdate:()=>el.textContent=mode==='frac'?o.v.toFixed(4):Math.round(o.v)});}else el.textContent=n==null?'—':String(n);});foot();});foot();
  $$('.buylist .blb').forEach(b=>b.onclick=()=>{const c=C[+b.dataset.i];openReal(b.dataset.t,mode==='ent'?c.ent:c.frac);});
  $('#blCopy').onclick=async()=>{const txt=C.map(c=>`${c.ticker}: ${mode==='ent'?c.ent:c.frac} acciones (~$${(c.usd||0).toFixed(2)}) a ${c.precio?usd2(c.precio):'precio de mercado'}`).join('\n');try{await navigator.clipboard.writeText('Lista de compra · Lucioni Capital\n'+txt);toast('Lista copiada',ic('check','',false));}catch(e){toast('No se pudo copiar');}};
  $('#blDesk').onclick=()=>{if(!member()){toast('Crea tu cuenta gratis para usar la Mesa del inversor',ic('hello','',false));openAccount();return;}TRD.orders=C.filter(c=>c.precio).map(c=>mode==='ent'?{symbol:c.ticker,side:'buy',qty:c.ent,type:'market',why:'Plan con IA'}:{symbol:c.ticker,side:'buy',notional:Math.floor(c.usd),type:'market',why:'Plan con IA'}).filter(o=>(o.qty??o.notional)>0);TRD.cash=TRD.cash||Math.ceil(d.usd||0);TRD.targets=C.map(c=>({t:c.ticker,n:c.nombre,w:c.porcentaje}));TRD.tsrc='Tu plan con IA';saveTrd();setView('desk');setTimeout(()=>deskGo('risk'),300);};
  $('#blRef').onclick=async()=>{C.forEach(c=>delete LQ[c.ticker]);if(MKT)await coLoad();await planEnrich(d);store.set('plan',d);render(d,true);toast('Precios actualizados',ic('check','',false));};
  if(window.gsap&&!RM){gsap.from(box,{y:22,opacity:0,duration:.6,ease:'expo.out',delay:.2});gsap.from('.bltb tbody tr',{x:-12,opacity:0,stagger:.06,duration:.45,delay:.35,ease:'power3.out'});}};
function buyStale(d){if(!MKT)return;const out=$('#out .result');if(!out||out.querySelector('.buylist'))return;const b=document.createElement('div');b.className='buylist';b.innerHTML=`<p class="note" style="margin:0">Este plan se armó antes de tener precios en vivo.</p><div class="acts"><button class="btn solid" id="blLoad">Ver la lista de compra con precios de hoy</button></div>`;out.querySelector('.disc').before(b);$('#blLoad').onclick=async()=>{await planEnrich(d);store.set('plan',d);render(d,true);};}
$('#go').onclick=()=>runAI();
{const p=store.get('plan',null);if(p&&p.cartera){try{render(p,true);}catch(e){}}}

/* ===================== V23: barra adaptable, sol oficial, backtest y costo real ===================== */
/* ---------- barra superior: lo que no cabe pasa a "Más" ---------- */
{const nav=$('#nav'),top=$('.topin'),tr=$('.tright'),cta=$('#navCta');if(nav&&top&&tr){
  const more=document.createElement('div');more.className='nmore hidden';more.innerHTML=`<button class="nmb" aria-haspopup="true" aria-expanded="false">Más <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button><div class="nmenu" role="menu"></div>`;
  const ul=$('#uline');nav.insertBefore(more,ul);const menu=more.querySelector('.nmenu'),btn=more.querySelector('.nmb');
  const links=()=>[...nav.querySelectorAll(':scope > a'),...menu.querySelectorAll('a')].sort((a,b)=>+a.dataset.ord-+b.dataset.ord);
  nav.querySelectorAll(':scope > a').forEach((a,i)=>a.dataset.ord=i);
  const fits=()=>{const L=[...nav.children].filter(e=>e.offsetParent!==null&&!e.classList.contains('uline'));const r=L.length?Math.max(...L.map(e=>e.getBoundingClientRect().right)):nav.getBoundingClientRect().right;return r<=tr.getBoundingClientRect().left-6&&nav.scrollWidth<=nav.clientWidth+1&&tr.getBoundingClientRect().right<=Math.min(innerWidth,top.getBoundingClientRect().right)+1;};
  function fitNav(){if(getComputedStyle(nav).display==='none')return;nav.querySelectorAll(':scope > a').forEach((a,i)=>{if(a.dataset.ord==null)a.dataset.ord=100+i;});
    links().forEach(a=>nav.insertBefore(a,more));more.classList.add('hidden');if(cta)cta.style.display='';
    if(fits())return syncMore();if(cta&&getComputedStyle(cta).display!=='none'){cta.style.display='none';if(fits())return syncMore();}
    more.classList.remove('hidden');let L=[...nav.querySelectorAll(':scope > a')];while(L.length>2&&!fits()){const a=L.pop();menu.prepend(a);}syncMore();}
  function syncMore(){btn.classList.toggle('act',!!menu.querySelector('a.act'));}
  btn.onclick=e=>{e.stopPropagation();const o=more.classList.toggle('open');btn.setAttribute('aria-expanded',o);if(o&&window.gsap&&!RM)gsap.fromTo(menu.querySelectorAll('a'),{x:-8,opacity:0},{x:0,opacity:1,stagger:.025,duration:.3,ease:'power3.out'});};
  menu.addEventListener('click',()=>{more.classList.remove('open');btn.setAttribute('aria-expanded','false');});
  document.addEventListener('pointerdown',e=>{if(!more.contains(e.target)){more.classList.remove('open');btn.setAttribute('aria-expanded','false');}});
  let t=0;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(fitNav,80);});
  const _mk=markNav;markNav=function(){_mk();syncMore();};
  const _au=accUI;accUI=function(){_au();requestAnimationFrame(fitNav);};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitNav);setTimeout(fitNav,0);setTimeout(fitNav,700);window.fitNav=fitNav;}}

/* ---------- tipo de cambio oficial del BCRP ---------- */
let FXOFF=null;
async function fxOfficial(){if(!MKT||FXOFF)return FXOFF;try{const r=await fetch(`${MKT}?fxpen=1`);const d=await r.json();if(r.ok&&d.last){FXOFF=d;if(!store.get('fxUser',false)){FXD.rate=d.last[1];try{$('#fxR').value=d.last[1];}catch(e){}if(typeof fx==='function')fx();}
  const n=$('#t-fx');if(n&&!n.querySelector('.fxoff')){const p=document.createElement('p');p.className='note fxoff';p.innerHTML=`Tipo de cambio oficial: <b>S/ ${d.last[1].toFixed(3)}</b> por dólar al ${new Date(d.last[0]).toLocaleDateString('es-PE',{timeZone:'UTC'})} (BCRP, sistema bancario, venta). <button class="linkb" id="fxUse">Usar este</button>`;n.querySelector('h3')?.after(p);$('#fxUse').onclick=()=>{store.set('fxUser',false);FXD.rate=d.last[1];$('#fxR').value=d.last[1];fx();toast('Tipo de cambio oficial aplicado',ic('check','',false));};}}}catch(e){}return FXOFF;}
$('#fxR')&&$('#fxR').addEventListener('input',()=>store.set('fxUser',true));
fxOfficial();

/* ---------- mi cartera en soles: efecto del tipo de cambio ---------- */
if(MKT&&$('#pfRisk')){const d=document.createElement('div');d.className='panel pfpen';d.id='pfPen';d.innerHTML='<h4>Tu cartera en soles</h4><div id="pfPenB"><p class="note">Agrega acciones para verla en soles.</p></div>';$('#pfRisk').after(d);}
async function pfPen(){const box=$('#pfPenB');if(!box)return;const P=pfCalc();if(!P.rows.length){box.innerHTML='<p class="note">Agrega acciones para verla en soles.</p>';return;}const F=await fxOfficial();if(!F){box.innerHTML='<p class="note">No se pudo leer el tipo de cambio oficial.</p>';return;}
  const pts=F.pts,now=pts.at(-1),yAgo=pts.find(p=>p[0]>=now[0]-365*864e5)||pts[0],fxR=now[1]/yAgo[1]-1;
  let rU=null;try{let num=0,den=0;for(const r of P.rows){const h=await h1y(r.s);if(h.length>30){num+=r.w*(h.at(-1)[1]/h[0][1]-1);den+=r.w;}}if(den>0)rU=num/den;}catch(e){}
  const tot=rU!=null?(1+rU)*(1+fxR)-1:null,vPen=P.V*now[1],fxEff=rU!=null?vPen-vPen/(1+fxR):null;
  const W=Math.max(300,Math.min(560,box.clientWidth||520)),H=110,ys=pts.map(p=>p[1]),mn=Math.min(...ys),mx=Math.max(...ys),X=i=>i/(pts.length-1)*(W-60),Y=v=>8+(mx-v)/((mx-mn)||1)*(H-24);
  const path=pts.map((p,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(p[1]).toFixed(1)).join('');
  box.innerHTML=`<div class="fkg"><div class="fk"><small>Valor en soles hoy</small><b>S/ ${Math.round(vPen).toLocaleString('en-US')}</b><span>${usd2(P.V)} × S/ ${now[1].toFixed(3)} (oficial BCRP)</span></div>
      <div class="fk"><small>Tus acciones en dólares (12 m)</small><b style="color:var(${(rU||0)>=0?'--up':'--down'})">${rU!=null?pctF(rU):'—'}</b><span>Con tus pesos actuales</span></div>
      <div class="fk"><small>El dólar frente al sol (12 m)</small><b style="color:var(${fxR>=0?'--up':'--down'})">${pctF(fxR)}</b><span>De S/ ${yAgo[1].toFixed(3)} a S/ ${now[1].toFixed(3)}</span></div>
      <div class="fk"><small>Resultado total en soles</small><b style="color:var(${(tot||0)>=0?'--up':'--down'})">${tot!=null?pctF(tot):'—'}</b><span>${fxEff!=null?`El tipo de cambio ${fxEff>=0?'sumó':'restó'} unos S/ ${Math.abs(Math.round(fxEff)).toLocaleString('en-US')}`:''}</span></div></div>
    <div class="fachart">${svgEl(W,H,`<path class="fxl" d="${path}"/><text x="${W-54}" y="${Y(now[1])+4}" class="fxt">S/ ${now[1].toFixed(3)}</text><text x="0" y="${H-2}">${new Date(pts[0][0]).toLocaleDateString('es-PE',{month:'short',year:'2-digit',timeZone:'UTC'})}</text>`,'Tipo de cambio de los últimos meses')}</div>
    <p class="note">Si ganas y gastas en soles, tu resultado real incluye lo que se mueve el dólar. Cuando el sol se fortalece, tus inversiones en dólares valen menos soles aunque las acciones suban.</p>`;
  const fl=box.querySelector('.fxl');if(fl&&window.gsap&&!RM&&fl.getTotalLength){const L=fl.getTotalLength();gsap.fromTo(fl,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.4,ease:'power2.inOut'});}}
const _pfR23=pfRender;let penT=0;pfRender=function(f){_pfR23(f);clearTimeout(penT);penT=setTimeout(()=>{if(VIEW==='port'&&member())pfPen();},900);};

/* ---------- backtest de una cartera (5 años reales) ---------- */
TOOLS.push('bt','cost');
LOCKS['tool:bt']=['Backtest de cartera','Prueba cómo le habría ido a tu cartera en los últimos 1, 3 o 5 años con precios reales, aportes mensuales y rebalanceo.'];
LOCKS['tool:cost']=['Costo real desde Perú','Calcula cuánto se lleva el tipo de cambio, las comisiones, la retención de dividendos y los impuestos.'];
{const ref=$('#tnav button[data-t="perf"]')||$('#tnav button[data-t="fee"]');if(ref){[['cost','Costo real desde Perú'],['bt','Backtest']].forEach(([k,l])=>{const b=document.createElement('button');b.dataset.t=k;b.textContent=l;b.onclick=()=>tool(k);ref.after(b);});}}
{const cols=$$('#menu .mcol'),col=cols[cols.length-1];if(col){const h=col.querySelector('h4');[['volatilidad','Backtest de cartera','Cómo le habría ido en 5 años',()=>{go('tools');tool('bt');}],['dividendo','Costo real desde Perú','Cambio, comisiones e impuestos',()=>{go('tools');tool('cost');}]].forEach(([i,t,s,f])=>{const b=document.createElement('button');b.className='mi2';b.setAttribute('role','menuitem');b.innerHTML=`${ic(i,'',false)}<span>${t}<small>${s}</small></span>`;b.onclick=()=>{closeMenu();f();};h.after(b);});}}
const H5={};async function h5(s){if(H5[s])return H5[s];const r=await fetch(`${MKT}?h5=${encodeURIComponent(s)}`);const d=await r.json();H5[s]=d.pts||[];return H5[s];}
let BT=store.get('bt',{rows:[{t:'VOO',w:60},{t:'BND',w:25},{t:'VXUS',w:15}],init:1000,mon:100,yrs:5,reb:true});
function btRows(){$('#btR').innerHTML=BT.rows.map((r,i)=>`<div class="scr"><input class="f" data-i="${i}" data-k="t" value="${esc(r.t)}" maxlength="10" style="text-transform:uppercase;max-width:130px"><input class="f" data-i="${i}" data-k="w" type="number" step="any" min="0" value="${r.w}" style="max-width:100px"><span class="note" style="align-self:center">%</span><button class="ib" data-x="${i}" aria-label="Quitar">${ic('x','',false)}</button></div>`).join('')+`<p class="note">Suma: <b>${BT.rows.reduce((a,r)=>a+(+r.w||0),0)}%</b></p>`;
  $$('#btR [data-k]').forEach(x=>x.onchange=()=>{const r=BT.rows[+x.dataset.i];r[x.dataset.k]=x.dataset.k==='t'?x.value.trim().toUpperCase():+x.value;store.set('bt',BT);btRows();});$$('#btR [data-x]').forEach(x=>x.onclick=()=>{BT.rows.splice(+x.dataset.x,1);store.set('bt',BT);btRows();});}
function btInit(){const host=$('#btHost');if(!host||host.dataset.ok)return;host.dataset.ok=1;
  host.innerHTML=`<div class="dkcols"><div><h4 style="margin-bottom:6px">Tu cartera</h4><div id="btR"></div><div class="acts"><button class="btn" id="btAdd">+ Agregar</button><button class="btn" id="btPlan">Usar mi plan</button><button class="btn" id="btPf">Usar Mi cartera real</button></div></div>
    <div><div class="dcfn"><div><label class="l" for="btI">Inversión inicial ($)</label><input class="f" id="btI" type="number" min="0" step="any" value="${BT.init}"></div><div><label class="l" for="btM">Aporte mensual ($)</label><input class="f" id="btM" type="number" min="0" step="any" value="${BT.mon}"></div></div>
      <label class="l">Periodo</label><div class="seg" id="btY">${[1,3,5].map(y=>`<button data-y="${y}" class="${BT.yrs===y?'act':''}">${y} año${y>1?'s':''}</button>`).join('')}</div>
      <label class="chk"><input type="checkbox" id="btRb" ${BT.reb?'checked':''}> Rebalancear una vez al año</label><button class="cta" id="btGo" style="width:100%;justify-content:center;margin-top:12px">Probar en el pasado</button></div></div><div id="btOut"></div>`;
  btRows();$('#btAdd').onclick=()=>{BT.rows.push({t:'',w:0});btRows();};
  $('#btPlan').onclick=()=>{const p=store.get('plan',null);if(!p||!p.cartera){toast('Primero arma tu plan en "Tu plan"');return;}BT.rows=p.cartera.map(c=>({t:String(c.ticker).toUpperCase(),w:c.porcentaje}));if(p.usd)BT.init=Math.round(p.usd);$('#btI').value=BT.init;store.set('bt',BT);btRows();};
  $('#btPf').onclick=()=>{const P=pfCalc();if(!P.rows.length){toast('Tu cartera real está vacía');return;}BT.rows=P.rows.map(r=>({t:r.s,w:+(r.w*100).toFixed(1)}));store.set('bt',BT);btRows();};
  $$('#btY button').forEach(b=>b.onclick=()=>{BT.yrs=+b.dataset.y;$$('#btY button').forEach(x=>x.classList.toggle('act',x===b));store.set('bt',BT);});
  $('#btI').oninput=e=>{BT.init=+e.target.value;store.set('bt',BT);};$('#btM').oninput=e=>{BT.mon=+e.target.value;store.set('bt',BT);};$('#btRb').onchange=e=>{BT.reb=e.target.checked;store.set('bt',BT);};
  $('#btGo').onclick=btRun;if(!MKT)$('#btOut').innerHTML='<p class="note">El backtest con precios reales funciona en la versión web.</p>';}
async function btRun(){const out=$('#btOut');if(!MKT)return;const R=BT.rows.filter(r=>r.t&&r.w>0),ws=R.reduce((a,r)=>a+r.w,0);if(!R.length){toast('Agrega al menos un ticker');return;}
  out.innerHTML='<div class="idskel" style="height:280px;margin-top:14px"></div>';const syms=[...new Set([...R.map(r=>r.t),'SPY'])],D={};let i=0;
  await Promise.all([0,1,2].map(async()=>{while(i<syms.length){const s=syms[i++];try{D[s]=await h5(s);}catch(e){D[s]=[];}}}));
  const miss=R.filter(r=>D[r.t].length<20).map(r=>r.t);if(miss.length){out.innerHTML=`<p class="autherr">Sin historial para: ${miss.join(', ')}.</p>`;return;}
  const startT=Date.now()-BT.yrs*365.25*864e5,first=Math.max(startT,...R.map(r=>D[r.t][0][0]));const dates=D.SPY.filter(p=>p[0]>=first).map(p=>p[0]);if(dates.length<10){out.innerHTML='<p class="autherr">Historial insuficiente para ese periodo.</p>';return;}
  const at=(s,t)=>{const a=D[s];let lo=0,hi=a.length-1,b=a[0][1];while(lo<=hi){const m=(lo+hi)>>1;if(a[m][0]<=t){b=a[m][1];lo=m+1;}else hi=m-1;}return b;};
  const sim=(rows)=>{const tw=rows.reduce((a,r)=>a+r.w,0),sh={};rows.forEach(r=>sh[r.t]=BT.init*(r.w/tw)/at(r.t,dates[0]));let contrib=BT.init,lastM=new Date(dates[0]).getUTCMonth(),lastY=new Date(dates[0]).getUTCFullYear(),units=BT.init,curve=[],cc=[],peak=0,mdd=0,nav=1;let prevV=BT.init;
    dates.forEach((t,k)=>{const d=new Date(t),val=rows.reduce((a,r)=>a+sh[r.t]*at(r.t,t),0);if(k){nav*=val/prevV;}
      let v=val;if(d.getUTCMonth()!==lastM&&BT.mon>0){rows.forEach(r=>sh[r.t]+=BT.mon*(r.w/tw)/at(r.t,t));contrib+=BT.mon;v+=BT.mon;lastM=d.getUTCMonth();}else if(d.getUTCMonth()!==lastM)lastM=d.getUTCMonth();
      if(BT.reb&&d.getUTCFullYear()!==lastY){rows.forEach(r=>sh[r.t]=v*(r.w/tw)/at(r.t,t));lastY=d.getUTCFullYear();}
      prevV=v;curve.push(v);cc.push(contrib);peak=Math.max(peak,nav);mdd=Math.min(mdd,nav/peak-1);});
    const yrs=(dates.at(-1)-dates[0])/(365.25*864e5),cagr=Math.pow(nav,1/yrs)-1;return {curve,cc,contrib,final:curve.at(-1),cagr,mdd,yrs,nav};};
  const A=sim(R),B=sim([{t:'SPY',w:1}]);
  const rets=[];for(let k=1;k<A.curve.length;k++){const a=A.curve[k]-(A.cc[k]-A.cc[k-1]),b=A.curve[k-1];rets.push(a/b-1);}const vol=sd(rets)*Math.sqrt(52),sh=(A.cagr-.04)/vol;
  const W=Math.max(320,Math.min(1100,out.clientWidth||700)),Hc=270,p={l:58,r:96,t:14,b:26},all=[...A.curve,...B.curve,...A.cc],mx=Math.max(...all),mn=Math.min(...all)*.95,X=k=>p.l+k/(dates.length-1)*(W-p.l-p.r),Y=v=>p.t+(mx-v)/((mx-mn)||1)*(Hc-p.t-p.b);
  const path=a=>a.map((v,k)=>(k?'L':'M')+X(k).toFixed(1)+' '+Y(v).toFixed(1)).join('');let g='';
  for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4;g+=`<line class="ax" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="0" y="${Y(v)+4}">$${v>=1000?(v/1000).toFixed(1)+' mil':v.toFixed(0)}</text>`;}
  g+=`<text x="${p.l}" y="${Hc-6}">${new Date(dates[0]).toLocaleDateString('es-PE',{month:'short',year:'numeric'})}</text><text x="${W-p.r}" y="${Hc-6}" text-anchor="end">${new Date(dates.at(-1)).toLocaleDateString('es-PE',{month:'short',year:'numeric'})}</text>`;
  g+=`<path class="btc" d="${path(A.cc)}"/><path class="btb" d="${path(B.curve)}"/><path class="bta" d="${path(A.curve)}"/><text class="btl" x="${W-p.r+6}" y="${Y(A.final)+4}" fill="var(--accent)">Tu cartera</text><text class="btl" x="${W-p.r+6}" y="${Y(B.final)+(Math.abs(Y(B.final)-Y(A.final))<14?18:4)}" fill="var(--ink2)">S&amp;P 500</text>`;
  const k=(t,v,s,c)=>`<div class="fk"><small>${t}</small><b ${c?`style="color:var(${c})"`:''}>${v}</b><span>${s}</span></div>`;
  out.innerHTML=`<div class="fkg" style="margin-top:14px">${k('Valor final',m$(A.final),`Aportaste ${m$(A.contrib)}`,A.final>=A.contrib?'--up':'--down')}${k('Ganancia',m$(A.final-A.contrib),pctF(A.final/A.contrib-1)+' sobre lo aportado',A.final>=A.contrib?'--up':'--down')}${k('Rendimiento anual (CAGR)',pctF(A.cagr),`S&P 500: ${pctF(B.cagr)}`)}${k('Caída máxima',pctF(A.mdd),`S&P 500: ${pctF(B.mdd)}`,'--down')}${k('Volatilidad anual',pctF(vol),'Semanal anualizada')}${k('Sharpe',sh.toFixed(2),'Tasa libre 4%')}</div>
    <div class="fachart">${svgEl(W,Hc,g,'Evolución de la cartera frente al S&P 500')}<div class="faleg"><span><i style="background:var(--accent)"></i>Tu cartera</span><span><i style="background:var(--ink3)"></i>S&amp;P 500 con los mismos aportes</span><span><i class="dash"></i>Dinero aportado</span></div></div>
    <ul class="idwhy"><li>${A.final>=B.final?`Tu cartera terminó ${m$(A.final-B.final)} por encima del S&amp;P 500`:`El S&amp;P 500 habría terminado ${m$(B.final-A.final)} por encima`}${A.mdd>B.mdd?', con caídas menos profundas.':'.'}</li><li class="w">En el peor momento, tu cartera llegó a estar ${pctF(Math.abs(A.mdd))} por debajo de su máximo. Pregúntate si habrías aguantado sin vender.</li></ul>
    <p class="disc">Simulación con precios de cierre semanales reales${BT.reb?', rebalanceo anual':''} y aportes al inicio de cada mes. No incluye dividendos, comisiones ni impuestos. El pasado no garantiza resultados futuros.</p>`;
  if(window.gsap&&!RM){$$('#btOut .bta,#btOut .btb').forEach((pth,j)=>{const L=pth.getTotalLength();gsap.fromTo(pth,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.8,ease:'power2.inOut',delay:j*.15});});gsap.from('#btOut .fk',{y:12,opacity:0,stagger:.05,duration:.45,ease:'expo.out'});}}

/* ---------- costo real de invertir desde Perú ---------- */
const CBRK={hapi:['Hapi',0,0,'Sin comisión por operar; cobra por retiro (revisa su tarifa vigente).'],ibkr:['Interactive Brokers',1,0,'Comisión aprox. de $0.005 por acción con mínimo de $1 por orden (plan Pro).'],etoro:['eToro',0,0,'Sin comisión en acciones; cobra cambio de divisas y retiro.'],tyba:['Tyba (Credicorp)',0,0,'0% de comisión anunciada en acciones y ETF de EE.UU.'],otro:['Otro',0,0,'Escribe tus comisiones.']};
let CS=store.get('costc',{amt:5000,cur:'PEN',mon:200,yrs:10,ret:7,div:1.5,ter:.1,spread:1,fee:0,trades:12,wh:30,tax:5,brk:'hapi'});
function costInit(){const h=$('#costHost');if(!h||h.dataset.ok)return;h.dataset.ok=1;const f=(id,l,k,st,hint)=>`<div><label class="l" for="${id}">${l}</label><input class="f" id="${id}" data-k="${k}" type="number" step="${st||'any'}" min="0" value="${CS[k]}">${hint?`<small class="hint">${hint}</small>`:''}</div>`;
  h.innerHTML=`<div class="dkcols"><div><div class="seg" id="csC" style="margin-bottom:8px"><button data-v="PEN" class="${CS.cur==='PEN'?'act':''}">Invierto soles</button><button data-v="USD" class="${CS.cur==='USD'?'act':''}">Ya tengo dólares</button></div>
      <div class="dcfn">${f('csA','Monto inicial','amt')}${f('csM','Aporte mensual','mon')}${f('csY','Años','yrs',1)}${f('csR','Rendimiento anual esperado (%)','ret')}</div>
      <label class="l" for="csB">Bróker</label><select class="f" id="csB">${Object.entries(CBRK).map(([k,b])=>`<option value="${k}" ${CS.brk===k?'selected':''}>${b[0]}</option>`).join('')}</select><p class="note" id="csBn"></p></div>
    <div class="dcfn">${f('csS','Diferencia del cambio (%)','spread','any','Banco: 1–2%. Casa de cambio digital: 0.2–0.5%.')}${f('csF','Comisión por operación ($)','fee')}${f('csT','Operaciones al año','trades',1)}${f('csD','Dividendo de tu cartera (%)','div','any','ETF del S&P 500: ~1.2%.')}${f('csW','Retención de dividendos en EE.UU. (%)','wh','any','30% sin convenio tributario.')}${f('csE','Costo anual de los ETF (%)','ter','any','VOO: 0.03%. Fondos activos: 1–2%.')}${f('csX','Impuesto al vender (%)','tax','any','Confirma tu tasa con SUNAT o un contador.')}</div></div><div id="csOut"></div>`;
  $$('#costHost [data-k]').forEach(x=>x.oninput=()=>{CS[x.dataset.k]=+x.value;store.set('costc',CS);csRun();});
  $$('#csC button').forEach(b=>b.onclick=()=>{CS.cur=b.dataset.v;$$('#csC button').forEach(x=>x.classList.toggle('act',x===b));store.set('costc',CS);csRun();});
  $('#csB').onchange=e=>{CS.brk=e.target.value;const b=CBRK[CS.brk];CS.fee=b[1];$('#csF').value=b[1];store.set('costc',CS);csRun();};csRun();}
function csRun(){const out=$('#csOut');if(!out)return;$('#csBn').textContent=CBRK[CS.brk][3];const fx=FXD.rate||3.4,toU=v=>CS.cur==='PEN'?v/fx:v,sp=CS.spread/100,N=Math.round(CS.yrs*12),rm=Math.pow(1+CS.ret/100,1/12)-1,dm=CS.div/100/12,ter=CS.ter/100/12,wh=CS.wh/100;
  /* bruto: sin ningún costo */let g=toU(CS.amt),aport=toU(CS.amt);for(let m=1;m<=N;m++){g=(g+(m>1?toU(CS.mon):0))*(1+rm+dm);if(m>1)aport+=toU(CS.mon);}
  /* neto: cambio al entrar, comisiones, costo del ETF, retención de dividendos */let v=toU(CS.amt)*(CS.cur==='PEN'?1-sp:1)-CS.fee,cFx=CS.cur==='PEN'?toU(CS.amt)*sp:0,cFee=CS.fee,cTer=0,cWh=0;
  for(let m=1;m<=N;m++){if(m>1){const a=toU(CS.mon);const fxc=CS.cur==='PEN'?a*sp:0;const fe=CS.trades>=12||m%Math.max(1,Math.round(12/Math.max(1,CS.trades)))===0?CS.fee:0;v+=a-fxc-fe;cFx+=fxc;cFee+=fe;}
    const t=v*ter,w=v*dm*wh;v=v*(1+rm+dm)-t-w;cTer+=t;cWh+=w;}
  const gain=Math.max(0,v-aport),cTax=gain*CS.tax/100,cOut=CS.cur==='PEN'?(v-cTax)*sp:0,net=v-cTax-cOut,lost=g-net;
  const parts=[['Tipo de cambio (entrar y salir)',cFx+cOut],['Comisiones del bróker',cFee],['Costo anual de los ETF',cTer],['Retención de dividendos en EE.UU.',cWh],['Impuesto al vender',cTax]];const mxp=Math.max(...parts.map(p=>p[1]),1);
  const S=v2=>CS.cur==='PEN'?`S/ ${Math.round(v2*fx).toLocaleString('en-US')}`:m$(v2);
  out.innerHTML=`<div class="fkg" style="margin-top:14px"><div class="fk"><small>Sin costos tendrías</small><b>${S(g)}</b><span>en ${CS.yrs} años, aportando ${S(aport)}</span></div><div class="fk"><small>Con costos reales</small><b style="color:var(--up)">${S(net)}</b><span>lo que de verdad te queda</span></div><div class="fk"><small>Se va en costos</small><b style="color:var(--down)">${S(lost)}</b><span>${pctF(lost/Math.max(1,g-aport),0)} de tus ganancias</span></div></div>
    <div class="cbars">${parts.map(([l,c])=>`<div><span>${l}</span><i style="--w:${(c/mxp*100).toFixed(1)}%"></i><b>${S(c)}</b></div>`).join('')}</div>
    <h4 style="margin:14px 0 6px">Cómo pagar menos</h4><ul class="idwhy">${csTips(parts).map(([w,t])=>`<li class="${w?'w':''}">${t}</li>`).join('')}</ul>
    <p class="disc">Estimación educativa. Las tarifas de los brókers cambian: revisa la vigente en su página. Perú no tiene convenio para evitar la doble tributación con EE.UU., por lo que la retención usual sobre dividendos es 30% (algunas fuentes mencionan 15%; confírmalo con tu bróker). No es asesoría tributaria.</p>`;
  requestAnimationFrame(()=>$$('#csOut .cbars i').forEach(e=>e.style.width=e.style.getPropertyValue('--w')));}
function csTips(parts){const t=[],top=[...parts].sort((a,b)=>b[1]-a[1])[0][0];
  t.push([0,`Tu costo más grande es <b>${top.toLowerCase()}</b>.`]);
  if(CS.cur==='PEN'&&CS.spread>.6)t.push([0,`Cambia tus soles en una casa de cambio digital regulada por la SBS en vez del banco: bajar la diferencia de ${CS.spread}% a 0.4% te ahorra en cada aporte.`]);
  if(CS.fee>0)t.push([0,'Junta tus aportes y compra menos veces: cada operación paga comisión. O usa un bróker sin comisión por operar.']);
  if(CS.wh>=30&&CS.div>0)t.push([0,'Los ETF domiciliados en Irlanda (por ejemplo CSPX o VUAA, que replican el S&amp;P 500) pagan 15% de retención dentro del fondo en lugar de 30% a ti, y reinvierten los dividendos solos. Verifica si tu bróker los ofrece.']);
  t.push([1,'Si tus acciones de empresas de EE.UU. superan los $60,000, como no residente podrías estar expuesto al impuesto a la herencia de EE.UU. Los ETF irlandeses no tienen ese riesgo. Consulta a un especialista.']);
  if(CS.ter>.3)t.push([0,`Un costo anual de ${CS.ter}% es alto: los ETF indexados cuestan 0.03–0.10%.`]);
  return t;}
const _tool23=tool;tool=function(t){_tool23(t);if(t==='bt')btInit();if(t==='cost')costInit();};
/* botón en la lista de compra del plan */
const _render23=render;render=function(d,q){_render23(d,q);const acts=$('.buylist .acts');if(acts&&!$('#blBt')){const b=document.createElement('button');b.className='btn';b.id='blBt';b.textContent='Probar este plan en los últimos 5 años';b.onclick=()=>{if(!member()){openAccount();return;}BT.rows=d.cartera.map(c=>({t:c.ticker,w:c.porcentaje}));BT.init=Math.round(d.usd||1000);BT.yrs=5;store.set('bt',BT);go('tools');tool('bt');setTimeout(()=>{btRows();$('#btI').value=BT.init;btRun();},400);};acts.appendChild(b);}};
{const p=store.get('plan',null);if(p&&p.cartera&&$('.buylist')){try{render(p,true);}catch(e){}}}
refreshLocks();

/* ===================== V24: rendimiento del fondo animado ===================== */
/* El patrón se dibuja una sola vez como imagen y la GPU lo gira con CSS (antes se redibujaba en cada cuadro). */
{let url='';const mk=async()=>{const c=GUIL.get();const blob=await new Promise(ok=>c.toBlob(ok,'image/png'));if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);document.documentElement.style.setProperty('--guilimg',`url(${url})`);};
  const build=(cv,o,spin)=>{if(!cv)return;spin.stop();const box=document.createElement('div');box.className='gspin'+(o.far?' far':'');box.style.opacity=o.alpha;box.style.setProperty('--cy',(o.cy*100)+'%');box.style.setProperty('--sc',o.scale);box.style.setProperty('--sp',(2*Math.PI/o.speed).toFixed(1)+'s');
    box.innerHTML='<div class="gdrift"><i class="g1"></i></div>';cv.style.display='none';cv.after(box);
    spin.start=()=>box.classList.remove('paused');spin.stop=()=>box.classList.add('paused');};
  mk().then(()=>{build($('#gros'),{scale:1.15,cy:.42,speed:.12,alpha:.9,far:true},gSpin);build($('#mBg'),{scale:1.1,cy:.35,speed:.18,alpha:.55},mSpin);
    if(GATE.classList.contains('out'))gSpin.stop();else gSpin.start();if(!menuOpen())mSpin.stop();else mSpin.start();});
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>setTimeout(mk,60));}
/* menos trabajo por movimiento del puntero */
{let lastMag=null;document.addEventListener('pointermove',e=>{if(lastMag&&!(e.target.closest&&e.target.closest('.cta')===lastMag)){lastMag.classList.remove('mag');lastMag.style.transform='';lastMag=null;}const b=e.target.closest&&e.target.closest('.cta');if(b)lastMag=b;},{passive:true});}
/* calidad automática: si el equipo no llega a ~48 cuadros por segundo, se apagan las capas decorativas más pesadas */
{const setLite=on=>{document.body.classList.toggle('lite',on);try{sessionStorage.setItem('lc_lite',on?'1':'0');}catch(e){}if(on){try{gateLoop&&gateLoop.pause&&gateLoop.pause();}catch(e){}}};
 let saved=null;try{saved=sessionStorage.getItem('lc_lite');}catch(e){}
 const weak=(navigator.hardwareConcurrency||8)<=4||(navigator.connection&&navigator.connection.saveData)||(navigator.deviceMemory&&navigator.deviceMemory<=4);
 if(saved==='1'||weak)setLite(true);
 else if(saved!=='0'){const probe=(delay,last)=>setTimeout(()=>{if(document.hidden){probe(1500,last);return;}let n=0;const t0=performance.now();const f=t=>{n++;if(t-t0<1500)requestAnimationFrame(f);else{const fps=n/1.5;if(fps<50)setLite(true);else if(last)try{sessionStorage.setItem('lc_lite','0');}catch(e){}else probe(2500,true);}};requestAnimationFrame(f);},delay);probe(2500,false);}}

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

/* ===================== V26: cinta de cotizaciones con marco y datos reales ===================== */
{const tape=$('.tape'),marq=$('#marq');if(tape&&marq){
  const badge=document.createElement('span');badge.className='tbadge sim';badge.innerHTML='<i></i><span>SIMULADO</span>';
  const view=document.createElement('div');view.className='tview';tape.prepend(badge);badge.after(view);view.appendChild(marq);
  const speed=()=>{const w=marq.scrollWidth/2;if(w>0)tape.style.setProperty('--tdur',Math.max(30,Math.round(w/55))+'s');};
  /* modo simulado: colores de la variación en píldoras */
  const tint=()=>$$('#marq em[data-q]').forEach(e=>{const up=e._up;e.classList.toggle('u',up===true);e.classList.toggle('d',up===false);});
  setInterval(()=>{if(!tape.classList.contains('live'))tint();},1500);tint();requestAnimationFrame(speed);
  /* modo en vivo (versión web): precios reales */
  const LIVE=[['VOO','S&P 500'],['QQQM','Nasdaq 100'],['EPU','Perú'],['NVDA'],['AAPL'],['MSFT'],['AMZN'],['GOOGL'],['META'],['TSLA'],['SCCO'],['BAP'],['JPM'],['IAU','Oro']];
  const prev={};
  async function liveTape(){if(!MKT||typeof liveQuotes!=='function')return;const syms=LIVE.map(x=>x[0]);LIVE.forEach(([s])=>{delete LQ[s];});
    let Q;try{if(Date.now()-coAt>60000)await coLoad();Q=await liveQuotes(syms);}catch(e){return;}
    const rows=LIVE.filter(([s])=>Q[s]&&Q[s].p);if(rows.length<5)return;
    const item=([s,l])=>{const q=Q[s],up=(q.pc||0)>=0,old=prev[s],fl=old&&old!==q.p?(q.p>old?' fu':' fd'):'';return `<span data-s="${esc(s)}" class="${fl.trim()}" title="${esc((l?l+' · ':'')+s)}"><b>${esc(s)}</b>${l?`<small>${esc(l)}</small>`:''}<span class="tp">${usd2(q.p)}</span><em class="${up?'u':'d'}">${up?'▲':'▼'} ${pcS(q.pc)}</em></span>`;};
    const html=rows.map(item).join('');marq.innerHTML=html+html.replace(/ class="f[ud]"/g,'');rows.forEach(([s])=>prev[s]=Q[s].p);
    if(!tape.classList.contains('live')){tape.classList.add('live');badge.className='tbadge';badge.innerHTML='<i></i><span>EN VIVO</span>';tape.setAttribute('aria-label','Cotizaciones en vivo con algunos minutos de retraso');
      if(window.gsap&&!RM)gsap.fromTo(marq,{opacity:0},{opacity:1,duration:.6});}
    requestAnimationFrame(speed);}
  marq.addEventListener('click',e=>{const s=e.target.closest&&e.target.closest('[data-s]');if(!s)return;const sym=s.dataset.s;if(member()&&MKT)coOpen(sym);else setView('stocks');});
  if(MKT){setTimeout(liveTape,1200);setInterval(()=>{if(document.visibilityState==='visible')liveTape();},60000);}
  addEventListener('resize',()=>requestAnimationFrame(speed));}}

/* ===================== V27: paleta de gráficos más sobria ===================== */
{const muted=()=>{const dark=(()=>{const dt=document.documentElement.dataset.theme;return dt==='dark'||(!dt&&matchMedia('(prefers-color-scheme: dark)').matches);})();
  COLORS.splice(0,COLORS.length,...(dark?['#E9785E','#8CC7B0','#D9BC7C','#8FA9D6','#C4A1CF','#A9C98E','#D9A07A','#7FB9B9']:['#B8321C','#2F6F57','#8C6D24','#3E6690','#7A5A8C','#9A5E2A','#3F8080','#5E6B3F']));};
 /* el cargador de tema reescribe la paleta: se aplica la versión sobria justo después */
 const _rt27=readTheme;readTheme=function(){_rt27();muted();};
 muted();matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>setTimeout(muted,30));}

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

/* ===================== V29: Lucioni Daily, Intelligence, Academy, Premium, perfil global, PWA y analítica ===================== */
{
const WEB=!!window.LC_API;
Object.assign(IC,{home:['<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>',''],user:['<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',''],menu:['<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',''],book:['<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>','']});
const TOKK='lc_tok';const tok=()=>{try{return localStorage.getItem(TOKK)||'';}catch(e){return '';}};
const AUTH29=window.LC_AUTH||null,ACAD_API='/api/academy',BILL='/api/billing',EVT='/api/event';
async function acc29(action,body={}){if(!AUTH29)throw {code:'offline',message:'Disponible en la versión web.'};let r;try{r=await fetch(AUTH29,{method:'POST',headers:{'content-type':'application/json',...(tok()?{authorization:'Bearer '+tok()}:{})},body:JSON.stringify({action,...body})});}catch(e){throw {code:'network',message:'Sin conexión.'};}
  const d=await r.json().catch(()=>({}));if(!r.ok)throw {status:r.status,code:d.code||'error',message:d.message||'Algo salió mal.'};return d;}
async function get29(u,auth){const r=await fetch(u,{headers:auth&&tok()?{authorization:'Bearer '+tok()}:{}});const d=await r.json().catch(()=>({}));if(!r.ok)throw {status:r.status,code:d.code||'error',message:d.message||''};return d;}
const day29=(t=Date.now())=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const RM29=()=>RM||document.body.classList.contains('lite');

/* ---------- idioma y formatos regionales ---------- */
const I18N={
 es:{daily:'Lucioni Daily',greetM:'Buenos días',greetT:'Buenas tardes',greetN:'Buenas noches',guest:'inversionista',mkt:'Resumen de mercados',mktNote:'ETFs que siguen cada índice · Nasdaq, puede tener retraso',my:'Mi patrimonio',myEmpty:'Aún no registras tu cartera real. Agrega lo que tienes en tu bróker y la verás aquí cada día.',myCta:'Registrar mi cartera',intel:'Daily Intelligence',intelGen:'Generar el resumen de hoy',intelNote:'Usa 1 consulta de IA. Cita cada dato con su fuente.',news:'Noticias de hoy',lesson:'Lección del día',chal:'Reto del día',week:'Progreso semanal',ins:'Para ti',insNote:'Según los datos guardados en tu cuenta',begin:'Principiante',adv:'Avanzado',streak:'racha',days:'días',xpw:'XP esta semana',lessonsW:'lecciones',start:'Empezar',done:'Completada',correct:'¡Correcto!',wrong:'No exactamente',answered:'Ya respondiste hoy. Vuelve mañana por un nuevo reto.',premium:'Premium',free:'Free',trial:'Prueba',profile:'Perfil',more:'Más',home:'Inicio',wealth:'Patrimonio',intelN:'Intelligence',markets:'Mercados',practice:'Práctica',academy:'Academia',tools:'Herramientas',noData:'Sin datos por ahora. Intenta en unos minutos.',src:'Fuente',loading:'Cargando…',acad:'Lucioni Academy',starter:'Starter',advanced:'Advanced',min:'min',lock:'Premium',quizGo:'Completar lección',of:'de',newsMine:'De tu cartera',newsTop:'De las empresas más grandes del índice',today:'hoy',gain:'Ganancia total',seePf:'Ver mi cartera',intelDesc:'Un resumen breve de lo que movió los mercados hoy, con cada dato enlazado a su fuente.',weekGoal:'Meta semanal: {g} XP aprendiendo y analizando. Las operaciones simuladas no suman XP.',completed:'completadas'},
 en:{daily:'Lucioni Daily',greetM:'Good morning',greetT:'Good afternoon',greetN:'Good evening',guest:'investor',mkt:'Market overview',mktNote:'ETFs tracking each index · Nasdaq, may be delayed',my:'My wealth',myEmpty:'You have not added your real portfolio yet. Add what you hold at your broker to see it here every day.',myCta:'Add my portfolio',intel:'Daily Intelligence',intelGen:'Generate today’s briefing',intelNote:'Uses 1 AI query. Every figure is cited.',news:'Today’s news',lesson:'Daily lesson',chal:'Daily challenge',week:'Weekly progress',ins:'For you',insNote:'Based on the data saved in your account',begin:'Beginner',adv:'Advanced',streak:'streak',days:'days',xpw:'XP this week',lessonsW:'lessons',start:'Start',done:'Completed',correct:'Correct!',wrong:'Not quite',answered:'You already answered today. Come back tomorrow.',premium:'Premium',free:'Free',trial:'Trial',profile:'Profile',more:'More',home:'Home',wealth:'Wealth',intelN:'Intelligence',markets:'Markets',practice:'Practice',academy:'Academy',tools:'Tools',noData:'No data right now. Try again in a few minutes.',src:'Source',loading:'Loading…',acad:'Lucioni Academy',starter:'Starter',advanced:'Advanced',min:'min',lock:'Premium',quizGo:'Complete lesson',of:'of',newsMine:'From your portfolio',newsTop:'From the largest index companies',today:'today',gain:'Total gain',seePf:'View my portfolio',intelDesc:'A short briefing on what moved markets today, with every figure linked to its source.',weekGoal:'Weekly goal: {g} XP from learning and analysis. Simulated trades do not earn XP.',completed:'completed'}};
let LANG=(ACC&&ACC.lang)||store.get('lang',null)||'es';
const t29=k=>(I18N[LANG]&&I18N[LANG][k])||I18N.es[k]||k;
const LOC=()=>LANG==='en'?'en-US':'es-PE';
let CUR29=(ACC&&ACC.cur)||store.get('cur29','USD');
let FXR=null;
async function fxLoad(){if(FXR||!MKT)return FXR;try{FXR=await J29(`${MKT}?fx=1`);}catch(e){FXR=null;}return FXR;}
/* convierte desde USD solo con tipos de referencia reales; si no hay tipo, muestra USD */
function money29(usd,cur=CUR29){const r=FXR&&FXR.rates&&FXR.rates[cur];const c=r?cur:'USD';const v=r?usd*r:usd;return new Intl.NumberFormat(LOC(),{style:'currency',currency:c,maximumFractionDigits:v>=1000?0:2}).format(v);}
const pct29=(v,d=2)=>v==null?'—':(v>=0?'+':'')+new Intl.NumberFormat(LOC(),{maximumFractionDigits:d,minimumFractionDigits:d}).format(v)+'%';
const J29=async(u,ms=9000)=>{const c=new AbortController(),tm=setTimeout(()=>c.abort(),ms);try{const r=await fetch(u,{signal:c.signal});const d=await r.json();if(!r.ok)throw d;return d;}finally{clearTimeout(tm);}};

/* ---------- plan y permisos (los decide el servidor) ---------- */
let SUB=(ACC&&ACC.sub)||null;
const isPrem=()=>!!(SUB&&SUB.plan==='premium');
async function planLoad(){if(!AUTH29||!tok())return null;try{const d=await acc29('plan');SUB=d.sub;PLANCFG=d;if(ACC){ACC.sub=SUB;_sset.call(store,'acc',ACC);}planUI();return d;}catch(e){return null;}}
let PLANCFG=null;
function planBadge(){if(!member())return '';const s=SUB||{plan:'free'};const tr=s.status==='trialing';return `<button class="d29plan${s.plan==='premium'?' on':''}" data-prem>${s.plan==='premium'?(tr?t29('trial')+' '+t29('premium'):t29('premium')):t29('free')}</button>`;}
function planUI(){$$('.d29planWrap').forEach(e=>e.innerHTML=planBadge());}

/* ---------- analítica anónima con consentimiento ---------- */
const AID=(()=>{let a=store.get('aid',null);if(!a){a=(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)+Date.now());store.set('aid',a);}return a;})();
let EVQ=[];const consent=()=>store.get('anOk',null);
function track(e){if(!WEB||consent()!==true)return;EVQ.push(e);if(EVQ.length>=12)flush();}
function flush(){if(!EVQ.length||!WEB)return;const b=JSON.stringify({aid:AID,events:EVQ.splice(0)});try{navigator.sendBeacon?navigator.sendBeacon(EVT,new Blob([b],{type:'application/json'})):fetch(EVT,{method:'POST',body:b,keepalive:true,headers:{'content-type':'application/json'}});}catch(e){}}
addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush();});
{const last=store.get('lastDay',null),td=day29();track('app_opened');if(last&&last!==td)track('user_returned');store.set('lastDay',td);}
window.LCtrack=track;

/* ---------- IA: sesión y cuota en cada consulta ---------- */
if(WEB){const _f=window.fetch.bind(window);window.fetch=function(u,o){try{if(typeof u==='string'&&u===window.LC_API&&o&&o.method==='POST'&&tok()){o={...o,headers:{...(o.headers||{}),authorization:'Bearer '+tok()}};return _f(u,o).then(r=>{if(r.ok){track('ai_analysis_completed');streakTouch();mission('ai29');}return r;});}}catch(e){}return _f(u,o);};}
const _aiErr29=aiErr;aiErr=function(e){if(e&&(e.code==='quota'||e.code==='premium_required')){setTimeout(()=>member()?premSheet():openAccount(),600);return e.message||'Llegaste al límite de consultas de hoy.';}return _aiErr29(e);};

/* ---------- XP: registro diario, racha y retos que premian aprender ---------- */
let XPLOG=store.get('xplog',{});
const _ax29=addXP;addXP=function(n,why){_ax29(n,why);const d=day29();XPLOG[d]=(XPLOG[d]||0)+n;const ks=Object.keys(XPLOG).sort();while(ks.length>40)delete XPLOG[ks.shift()];store.set('xplog',XPLOG);};
let STRK=store.get('strk',{last:null,n:0});
function streakTouch(){const d=day29();if(STRK.last===d)return;const y=day29(Date.now()-864e5);STRK={last:d,n:STRK.last===y?STRK.n+1:1};store.set('strk',STRK);dailyWeek();}
let ACAD=store.get('acad',{done:{},sc:{}});let CHAL=store.get('chal',{});
['xplog','strk','acad','chal','lang','cur29','lvl29','anOk'].forEach(k=>{if(!SYNC.includes(k))SYNC.push(k);});
/* retos diarios: se reemplazan los que premiaban operar más por retos de aprendizaje y análisis */
{const rm=['buy','ops'];for(let i=MPOOL.length-1;i>=0;i--)if(rm.includes(MPOOL[i][0]))MPOOL.splice(i,1);
 MPOOL.push(['lesson','Completa la lección del día',1,30,'cap'],['chal29','Responde el reto del día',1,20,'target'],['research','Analiza la ficha de una empresa',1,25,'accion'],['ai29','Pide un análisis con fuentes a la IA',1,20,'chat']);
 if(MIS.ids.some(id=>!MPOOL.find(m=>m[0]===id))){MIS.ids=MIS.ids.map(id=>MPOOL.find(m=>m[0]===id)?id:['lesson','chal29','research','ai29'].find(x=>!MIS.ids.includes(x))||'calc');store.set('mis',MIS);try{renderMis();}catch(e){}}
 const ten=ACH.find(a=>a[0]==='ten');if(ten){ten[1]='Reflexiona: 3 notas en tu diario';ten[2]='book';ten[3]=()=>(store.get('diary',[])||[]).length>=3;}}
if(typeof coOpen==='function'){const _co29=coOpen;coOpen=function(s){mission('research');return _co29(s);};}

/* ---------- tema: oscuro elegante por defecto, acento esmeralda ---------- */
if(!store.get('theme',null)){document.documentElement.dataset.theme='dark';try{applyTheme();}catch(e){}}
{const em=()=>{const dk=document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);COLORS[0]=dk?'#3CCB94':'#0E7A54';};const _rt29=readTheme;readTheme=function(){_rt29();em();};em();}

/* ---------- datos del mercado para el Daily ---------- */
const OV=[['SPY','S&P 500','Las 500 empresas más grandes de EE. UU.; el termómetro principal de la bolsa.'],['QQQ','Nasdaq 100','Las 100 mayores empresas no financieras del Nasdaq, con mucho peso tecnológico.'],['DIA','Dow Jones','30 grandes empresas históricas de EE. UU.'],['EFA','Desarrollados ex-EE. UU.','Europa, Japón, Australia y otros mercados desarrollados.'],['EEM','Emergentes','China, India, Brasil, Taiwán y otros mercados emergentes.'],['EPU','Perú (MSCI)','Las mayores empresas listadas de Perú.'],['GLD','Oro','El oro suele usarse como refugio en momentos de estrés.'],['TLT','Bonos EE. UU. 20+','Bonos del Tesoro de largo plazo; suben cuando bajan las tasas.']];
const OVEN={SPY:['S&P 500','The 500 largest US companies; the main gauge of the stock market.'],QQQ:['Nasdaq 100','The 100 largest non-financial Nasdaq companies, tech-heavy.'],DIA:['Dow Jones','30 large, long-established US companies.'],EFA:['Developed ex-US','Europe, Japan, Australia and other developed markets.'],EEM:['Emerging','China, India, Brazil, Taiwan and other emerging markets.'],EPU:['Peru (MSCI)','The largest listed companies in Peru.'],GLD:['Gold','Gold is often used as a haven in times of stress.'],TLT:['US Treasuries 20+','Long-term Treasury bonds; they rise when rates fall.']};
const ovName=(s,n,ex)=>LANG==='en'&&OVEN[s]?OVEN[s]:[n,ex];
let OVD={},OVH={},NEWS29=null;
async function ovLoad(){if(!MKT)return;
  const [q,ix]=await Promise.allSettled([J29(`${MKT}?quotes=${OV.slice(0,5).map(o=>o[0]).join(',')}`),J29(`${MKT}?indices=1`)]);
  if(q.status==='fulfilled')Object.entries(q.value.q||{}).forEach(([s,v])=>OVD[s]={p:v.p,pc:v.pc});
  if(ix.status==='fulfilled')(ix.value.rows||[]).forEach(r=>{if(!OVD[r.s])OVD[r.s]={p:r.p,pc:r.pc};});
  dailyMkt();
  /* historia ligera para minigráficos, de a dos para no saturar */
  const syms=OV.map(o=>o[0]).filter(s=>OVD[s]);for(let i=0;i<syms.length;i+=2){await Promise.all(syms.slice(i,i+2).map(async s=>{try{const d=await J29(`${MKT}?h1y=${s}`);OVH[s]=(d.pts||[]);}catch(e){}}));dailyMkt(true);}}
function volOf(pts){if(!pts||pts.length<10)return null;const c=pts.map(p=>p[1]);const r=[];for(let i=1;i<c.length;i++)r.push(Math.log(c[i]/c[i-1]));const m=r.reduce((a,b)=>a+b,0)/r.length,sd=Math.sqrt(r.reduce((a,b)=>a+(b-m)**2,0)/(r.length-1));const yrs=(pts.at(-1)[0]-pts[0][0])/(365.25*864e5)||1;return {vol:sd*Math.sqrt((c.length-1)/yrs),ret:c.at(-1)/c[0]-1};}
function spark29(pts){if(!pts||pts.length<8)return '<svg class="d29sp" viewBox="0 0 100 28" aria-hidden="true"></svg>';const c=pts.slice(-26).map(p=>p[1]),mn=Math.min(...c),mx=Math.max(...c);const d=c.map((v,i)=>(i?'L':'M')+(i/(c.length-1)*100).toFixed(1)+' '+(26-(v-mn)/((mx-mn)||1)*24).toFixed(1)).join('');return `<svg class="d29sp ${c.at(-1)>=c[0]?'up':'dn'}" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${d}"/></svg>`;}

/* ---------- sección Daily ---------- */
const sec=document.createElement('section');sec.className='d29';sec.id='daily';sec.dataset.sec='inicio';sec.setAttribute('aria-label','Lucioni Daily');
document.getElementById('story').before(sec);VIEWS.inicio.unshift('daily');
let LV=store.get('lvl29',(ACC&&ACC.level)||'principiante');
function greet(){const h=new Date().getHours();return h<12?t29('greetM'):h<19?t29('greetT'):t29('greetN');}
function dailyShell(){const nm=member()&&ACC&&ACC.name?esc(ACC.name.split(' ')[0]):t29('guest');
 sec.innerHTML=`<div class="d29in">
  <header class="d29hd"><div class="d29hl"><p class="d29k">${t29('daily')} · <span>${new Date().toLocaleDateString(LOC(),{weekday:'long',day:'numeric',month:'long'})}</span></p><h1>${greet()}, <em>${nm}</em>.</h1><p class="d29tag">Understand. Analyze. Grow.</p></div>
   <div class="d29hr"><div class="d29seg" role="group" aria-label="Nivel"><button data-lv="principiante" class="${LV==='principiante'?'on':''}">${t29('begin')}</button><button data-lv="avanzado" class="${LV==='avanzado'?'on':''}">${t29('adv')}</button></div><span class="d29planWrap">${planBadge()}</span></div></header>
  <div class="d29grid">
   <article class="d29c d29mkt"><div class="d29ch"><h2>${t29('mkt')}</h2><small>${t29('mktNote')}</small></div><div class="d29tiles" id="d29tiles"></div></article>
   <article class="d29c d29my" id="d29my"></article>
   <article class="d29c d29intel" id="d29intel"></article>
   <article class="d29c d29news" id="d29news"><div class="d29ch"><h2>${t29('news')}</h2></div><div class="d29nl"><div class="d29sk"></div><div class="d29sk"></div><div class="d29sk"></div></div></article>
   <article class="d29c d29les" id="d29les"></article>
   <article class="d29c d29chal" id="d29chal"></article>
   <article class="d29c d29wk" id="d29wk"></article>
   <article class="d29c d29ins" id="d29ins"></article>
  </div></div>`;
 sec.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{LV=b.dataset.lv;store.set('lvl29',LV);sec.querySelectorAll('[data-lv]').forEach(x=>x.classList.toggle('on',x===b));dailyMkt(true);dailyLesson();if(member()&&ACC){ACC.level=LV;acc29('save',{profile:profPayload()}).catch(()=>{});}});
 dailyMkt();dailyMy();dailyIntel();dailyLesson();dailyChal();dailyWeek();dailyIns();
}
function dailyMkt(soft){const el=$('#d29tiles');if(!el)return;const adv=LV==='avanzado';
 if(!MKT){el.innerHTML=`<p class="d29e">${t29('noData')}</p>`;return;}
 if(!Object.keys(OVD).length){el.innerHTML=OV.map(()=>'<div class="d29t sk"></div>').join('');return;}
 el.innerHTML=OV.filter(o=>OVD[o[0]]).map(([s,n0,ex0],i)=>{const [n,ex]=ovName(s,n0,ex0),d=OVD[s],v=volOf(OVH[s]);return `<button class="d29t" data-s="${s}" style="--i:${i}" title="${esc(ex)}"><span class="d29tn"><b>${esc(n)}</b><small>${s}</small></span><span class="d29tp"><b>${usd2(d.p)}</b><small class="${(d.pc||0)>=0?'up':'dn'}">${pct29(d.pc)}</small></span>${spark29(OVH[s])}${adv?`<span class="d29tx">${v?`${LANG==='en'?'1 yr':'1 año'} ${pct29(v.ret*100,1)} · vol ${(v.vol*100).toFixed(0)}%`:'&nbsp;'}</span>`:`<span class="d29tx">${esc(ex)}</span>`}</button>`;}).join('');
 if(!soft)el.classList.add('in');}
function dailyMy(){const el=$('#d29my');if(!el)return;
 if(!member()||!RPF.length){el.innerHTML=`<div class="d29ch"><h2>${t29('my')}</h2></div><p class="d29e">${t29('myEmpty')}</p><button class="btn pri" data-go="port">${t29('myCta')} ${ic('right','',false)}</button>`;return;}
 let C;try{C=pfCalc();}catch(e){return;}const V=C.rows.reduce((a,r)=>a+r.val,0),Cs=C.rows.reduce((a,r)=>a+r.cost,0),D=C.rows.reduce((a,r)=>a+r.day,0),top=[...C.rows].sort((a,b)=>b.val-a.val).slice(0,3);
 el.innerHTML=`<div class="d29ch"><h2>${t29('my')}</h2><small>${FXR&&CUR29!=='USD'&&FXR.rates[CUR29]?`${CUR29} · ${esc(FXR.src[CUR29]||'')}`:'USD'}</small></div>
  <div class="d29big"><b data-cnt="${V}">${money29(V)}</b><span class="${D>=0?'up':'dn'}">${D>=0?'+':''}${money29(D)} ${t29('today')}</span></div>
  <div class="d29kv"><span>${t29('gain')}</span><b class="${V-Cs>=0?'up':'dn'}">${money29(V-Cs)} · ${pct29(Cs?(V/Cs-1)*100:0,1)}</b></div>
  <div class="d29bars">${top.map(r=>`<div><span>${esc(r.s)}</span><i style="--w:${(r.w*100).toFixed(1)}%"></i><b>${(r.w*100).toFixed(0)}%</b></div>`).join('')}</div>
  <button class="btn" data-go="port">${t29('seePf')} ${ic('right','',false)}</button>`;}
function dailyIntel(){const el=$('#d29intel');if(!el)return;const c=store.get('dai',null);
 const head=`<div class="d29ch"><h2>${t29('intel')}</h2><small>Lucioni Intelligence</small></div>`;
 if(c&&c.d===day29()&&window.LC28){el.innerHTML=head+`<div class="d29it">${LC28.text28(c.text,c.S)}</div>${LC28.srcs28(c.S).replace(' open','')}<p class="d29fine">Generado el ${new Date(c.at).toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit'})} · Educativo, no es asesoría financiera.</p>`;return;}
 el.innerHTML=head+`<p class="d29e">${t29('intelDesc')}</p><button class="btn pri" id="d29gen">${t29('intelGen')} ${ic('right','',false)}</button><p class="d29fine">${t29('intelNote')}</p>`;
 $('#d29gen').onclick=genIntel;}
async function genIntel(){if(!member()){openAccount();return;}if(!sample){toast('La IA no está disponible ahora.');return;}
 const el=$('#d29intel'),b=$('#d29gen');b.disabled=true;b.innerHTML='<span class="typing"><span></span><span></span><span></span></span> Reuniendo fuentes…';
 const S=[];const add=o=>{o.n=S.length+1;S.push(o);return o.n;};
 OV.filter(o=>OVD[o[0]]).forEach(([s,n])=>add({kind:'Mercado',title:`${n} (${s}) · cotización`,url:`https://www.nasdaq.com/market-activity/etf/${s.toLowerCase()}`,snip:`Precio ${OVD[s].p} USD, variación del día ${OVD[s].pc!=null?OVD[s].pc.toFixed(2)+'%':'—'}.`}));
 await newsLoad();(NEWS29||[]).forEach(a=>add({kind:'Noticia',title:a.t,url:a.u,snip:`${a.p||'Nasdaq'} · ${a.a||''} · sobre ${a.s}`}));
 await fxLoad();if(FXR&&FXR.rates.PEN)add({kind:'BCRP',title:'Tipo de cambio oficial (BCRP)',url:'https://estadisticas.bcrp.gob.pe/estadisticas/series/diarias/resultados/PD04640PD/html',snip:`S/ ${FXR.rates.PEN.toFixed(3)} por dólar al ${FXR.dates.PEN}.`});
 const lvl=LV==='avanzado'?'avanzado: usa términos técnicos (beta, duración, rotación sectorial) con precisión':'principiante: explica en palabras simples cada término';
 const prompt=`Eres Lucioni Intelligence. Hoy es ${new Date().toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}. Escribe el resumen de mercado del día para un inversionista ${lvl}. Formato: 4 viñetas que empiecen con "- " y una línea final "Qué vigilar:". Máx 150 palabras. Usa SOLO las fuentes numeradas para cifras y hechos y cita cada uno con [n]. No predigas precios ni des recomendaciones de compra.\n\nFUENTES:\n${S.map(o=>`[${o.n}] ${o.kind} — ${o.title}: ${o.snip}`).join('\n')}`;
 try{const r=await sample([{role:'user',content:prompt}],{cache:false});const text=String(r.text||'').trim();store.set('dai',{d:day29(),text,S,at:Date.now()});track('daily_briefing_viewed');dailyIntel();}
 catch(e){b.disabled=false;b.textContent=aiErr(e);}}
async function newsLoad(){if(NEWS29||!MKT)return NEWS29;const hold=member()&&RPF.length?[...new Set(RPF.map(h=>h.s))].slice(0,3):['AAPL','MSFT','NVDA'];
 const res=await Promise.allSettled(hold.map(s=>J29(`${MKT}?news=${s}`)));const out=[],seen=new Set();
 res.forEach((r,i)=>{if(r.status!=='fulfilled')return;const a=(r.value.rows||[]).find(x=>!seen.has(x.u));if(a){seen.add(a.u);out.push({...a,s:hold[i]});}});NEWS29=out;return out;}
async function dailyNews(){const el=$('#d29news .d29nl');if(!el)return;await newsLoad().catch(()=>null);
 if(!NEWS29||!NEWS29.length){el.innerHTML=`<p class="d29e">${t29('noData')}</p>`;return;}
 const ctx=member()&&RPF.length?t29('newsMine'):t29('newsTop');
 el.innerHTML=NEWS29.map((a,i)=>`<a class="d29n" href="${esc(a.u)}" target="_blank" rel="noopener" style="--i:${i}"><span class="d29nm">${coLogo(a.s)}<small>${esc(a.s)} · ${esc(ctx)}</small></span><b>${esc(a.t)}</b><small>${t29('src')}: ${esc(a.p||'Nasdaq')} · ${esc(a.a||'')}</small></a>`).join('');}

/* ---------- Academy ---------- */
let ALIST=null;
async function acadList(){if(ALIST)return ALIST;try{const [s,a]=await Promise.all([get29(ACAD_API+'?track=starter'),get29(ACAD_API+'?track=advanced')]);ALIST={starter:s.lessons,advanced:a.lessons};}catch(e){ALIST=null;}return ALIST;}
function nextLesson(L){const tr=LV==='avanzado'&&isPrem()?'advanced':'starter';const pool=L[tr];return {tr,l:pool.find(x=>!ACAD.done[x.id])||pool[new Date().getDate()%pool.length]};}
async function dailyLesson(){const el=$('#d29les');if(!el)return;if(!WEB){el.innerHTML=`<div class="d29ch"><h2>${t29('lesson')}</h2></div><p class="d29e">Disponible en la versión web.</p>`;return;}
 const L=await acadList();if(!L){el.innerHTML=`<div class="d29ch"><h2>${t29('lesson')}</h2></div><p class="d29e">${t29('noData')}</p>`;return;}
 const {tr,l}=nextLesson(L),dn=!!ACAD.done[l.id],tot=L.starter.length+L.advanced.length,nd=Object.keys(ACAD.done).length;
 el.innerHTML=`<div class="d29ch"><h2>${t29('lesson')}</h2><small>${t29('acad')} · ${tr==='advanced'?t29('advanced'):t29('starter')}</small></div><h3 class="d29lt">${esc(l.t)}</h3><p class="d29e">${l.min} ${t29('min')} · ${nd} ${t29('of')} ${tot} ${t29('completed')}</p><div class="d29prog"><i style="--w:${(nd/tot*100).toFixed(1)}%"></i></div><button class="btn ${dn?'':'pri'}" data-les="${l.id}" data-tr="${tr}">${dn?t29('done')+' · repasar':t29('start')} ${ic('right','',false)}</button>`;
 el.querySelector('[data-les]').onclick=e=>lessonOpen(e.currentTarget.dataset.tr,e.currentTarget.dataset.les);}
async function lessonOpen(tr,id){let d;try{d=await get29(`${ACAD_API}?track=${tr}&lesson=${id}`,true);}catch(e){if(e.code==='premium_required'||e.code==='session'){member()?premSheet('academy'):openAccount();return;}toast(t29('noData'));return;}
 const l=d.lesson,ans={};
 openSheet(`<div class="l29"><p class="d29k">${t29('acad')} · ${tr==='advanced'?t29('advanced'):t29('starter')} · ${l.min} ${t29('min')}</p><h2>${esc(l.t)}</h2>${l.body.map(p=>`<p>${esc(p)}</p>`).join('')}
  <div class="l29q">${l.q.map((q,i)=>`<fieldset data-q="${i}"><legend>${i+1}. ${esc(q.q)}</legend>${q.o.map((o,j)=>`<label class="l29o"><input type="radio" name="q${i}" value="${j}"><span>${esc(o)}</span></label>`).join('')}<p class="l29w" hidden></p></fieldset>`).join('')}</div>
  <button class="btn pri" id="l29go" disabled>${t29('quizGo')}</button><p class="d29fine">Contenido educativo. No es asesoría financiera.</p></div>`);
 const root=$('#sheetBody');root.querySelectorAll('fieldset').forEach(fs=>fs.addEventListener('change',e=>{const i=+fs.dataset.q,j=+e.target.value,q=l.q[i];ans[i]=j;const w=fs.querySelector('.l29w');w.hidden=false;w.className='l29w '+(j===q.a?'ok':'no');w.textContent=(j===q.a?t29('correct'):t29('wrong')+': '+q.o[q.a]+'.')+' '+q.why;root.querySelector('#l29go').disabled=Object.keys(ans).length<l.q.length;}));
 root.querySelector('#l29go').onclick=()=>{const ok=l.q.filter((q,i)=>ans[i]===q.a).length,first=!ACAD.done[l.id];ACAD.done[l.id]=Date.now();ACAD.sc[l.id]=ok+'/'+l.q.length;store.set('acad',ACAD);
  if(first){addXP(25+ok*5);mission('lesson');track('lesson_completed');streakTouch();}closeSheet();toast(`${t29('done')}: ${l.t} · ${ok}/${l.q.length}${first?` · +${25+ok*5} XP`:''}`,ic('cap'));dailyLesson();dailyWeek();acadRender();};}
/* panel de Academy dentro de Aprende */
const acadP=document.createElement('div');acadP.className='panel a29';acadP.id='a29';
{const ap=document.getElementById('aprende');if(ap){const bb=ap.querySelector('.backbar');(bb?bb.nextSibling:ap.firstChild)?ap.insertBefore(acadP,bb?bb.nextSibling:ap.firstChild):ap.appendChild(acadP);}}
async function acadRender(){if(!WEB){acadP.remove();return;}const L=await acadList();if(!L){acadP.innerHTML=`<p class="d29e">${t29('noData')}</p>`;return;}
 const row=(tr,l,i)=>{const dn=ACAD.done[l.id],lk=tr==='advanced'&&!isPrem();return `<button class="a29l${dn?' dn':''}" data-tr="${tr}" data-id="${l.id}" style="--i:${i}"><span class="a29n">${dn?ic('check','',false):i+1}</span><span class="a29t"><b>${esc(l.t)}</b><small>${l.min} ${t29('min')}${dn?' · '+ACAD.sc[l.id]:''}</small></span>${lk?`<span class="a29lock">${t29('lock')}</span>`:''}</button>`;};
 const pr=tr=>{const n=L[tr].filter(l=>ACAD.done[l.id]).length;return `${n}/${L[tr].length}`;};
 acadP.innerHTML=`<div class="d29ch"><h2>${t29('acad')}</h2><small>Dos rutas · lecciones breves con evaluación</small></div><div class="a29g"><div><h3>${t29('starter')} <small>${pr('starter')}</small></h3>${L.starter.map((l,i)=>row('starter',l,i)).join('')}</div><div><h3>${t29('advanced')} <small>${pr('advanced')}</small></h3>${L.advanced.map((l,i)=>row('advanced',l,i)).join('')}</div></div>`;
 acadP.querySelectorAll('.a29l').forEach(b=>b.onclick=()=>{if(b.dataset.tr==='advanced'&&!isPrem()){member()?premSheet('academy'):openAccount();return;}lessonOpen(b.dataset.tr,b.dataset.id);});}

/* ---------- reto diario ---------- */
const CH29=[['Si una acción sube 50% y luego baja 50%, ¿cómo terminas?',['Igual que al inicio','Con 25% menos','Con 25% más'],1,'1,5 × 0,5 = 0,75: pierdes 25%.'],
 ['¿Qué riesgo reduce más la diversificación?',['El de una empresa en particular','El de todo el mercado','La inflación'],0,'El riesgo específico se diluye; el del mercado se mantiene.'],
 ['Un fondo cobra 1% al año y otro 0,1%. En 30 años la diferencia de costos…',['Es mínima','Puede ser grande por el interés compuesto','No existe'],1,'Los costos se componen igual que los rendimientos.'],
 ['El dividend yield de una acción de US$100 que paga US$3 al año es…',['0,3%','3%','30%'],1,'3 ÷ 100 = 3%.'],
 ['Si las tasas de interés suben, el precio de los bonos existentes suele…',['Subir','Bajar','No cambiar'],1,'Los bonos nuevos pagan más, así que los antiguos valen menos.'],
 ['¿Qué mide la capitalización bursátil?',['Las ventas del año','Precio × número de acciones','La deuda total'],1,'Es el valor de mercado de todas las acciones.'],
 ['La regla del 72: al 8% anual, el dinero se duplica en unos…',['5 años','9 años','15 años'],1,'72 ÷ 8 ≈ 9 años.'],
 ['Un P/E de 10 frente a uno de 40 significa que la primera acción…',['Es siempre mejor','Cuesta menos por cada dólar de utilidad','Crece más rápido'],1,'Más barata por utilidad no implica mejor inversión: depende del crecimiento y la calidad.'],
 ['¿Qué es un ETF de acumulación?',['Reinvierte los dividendos','Paga más dividendos','No tiene comisiones'],0,'En lugar de repartir dividendos, los reinvierte dentro del fondo.'],
 ['Invertir un monto fijo cada mes sin importar el precio se llama…',['Market timing','Promedio del costo en dólares (DCA)','Apalancamiento'],1,'El DCA compra más unidades cuando el precio está bajo.'],
 ['Una correlación de 0,9 entre dos activos indica que…',['Se mueven muy parecido','Se mueven al revés','No se relacionan'],0,'Cerca de 1: alta relación positiva, poca diversificación entre ellos.'],
 ['¿Qué pasa con tu poder de compra si tu dinero rinde 2% y la inflación es 4%?',['Sube 2%','Baja cerca de 2%','No cambia'],1,'El rendimiento real es aproximadamente 2% − 4% = −2%.'],
 ['Un stop-loss es…',['Una orden para vender si el precio cae a cierto nivel','Un seguro garantizado','Un tipo de dividendo'],0,'Limita pérdidas, aunque en caídas bruscas puede ejecutarse por debajo del nivel.'],
 ['El fondo de emergencia recomendado suele cubrir…',['1 semana de gastos','3 a 6 meses de gastos','5 años de gastos'],1,'Te permite no vender inversiones ante un imprevisto.']];
function dailyChal(){const el=$('#d29chal');if(!el)return;const di=Math.floor(Date.now()/864e5)%CH29.length,[q,o,a,why]=CH29[di],td=day29(),r=CHAL.d===td?CHAL:null;
 el.innerHTML=`<div class="d29ch"><h2>${t29('chal')}</h2><small>+20 XP</small></div><p class="d29q">${esc(q)}</p><div class="d29opts">${o.map((x,j)=>`<button class="d29o${r?(j===a?' ok':j===r.p?' no':''):''}" data-j="${j}" ${r?'disabled':''}>${esc(x)}</button>`).join('')}</div><p class="d29why"${r?'':' hidden'}>${r?(r.ok?t29('correct'):t29('wrong'))+' '+esc(why):''}</p>`;
 if(r)return;el.querySelectorAll('.d29o').forEach(b=>b.onclick=()=>{const j=+b.dataset.j,ok=j===a;CHAL={d:td,p:j,ok};store.set('chal',CHAL);if(ok)addXP(20);else addXP(5);mission('chal29');track('challenge_completed');streakTouch();
  el.querySelectorAll('.d29o').forEach((x,k)=>{x.disabled=true;if(k===a)x.classList.add('ok');if(k===j&&!ok)x.classList.add('no');});const w=el.querySelector('.d29why');w.hidden=false;w.textContent=(ok?t29('correct'):t29('wrong'))+' '+why;if(ok&&!RM29())FX.burst(b.getBoundingClientRect().left+b.offsetWidth/2,b.getBoundingClientRect().top,40);});}
function dailyWeek(){const el=$('#d29wk');if(!el)return;const ds=[];for(let i=6;i>=0;i--)ds.push(day29(Date.now()-i*864e5));const vals=ds.map(d=>XPLOG[d]||0),mx=Math.max(60,...vals),tot=vals.reduce((a,b)=>a+b,0);
 const wk=Object.values(ACAD.done).filter(t=>Date.now()-t<7*864e5).length,goal=150,st=STRK.last===day29()||STRK.last===day29(Date.now()-864e5)?STRK.n:0;
 el.innerHTML=`<div class="d29ch"><h2>${t29('week')}</h2><small>Nv ${lvlOf(XP)} · ${LVLNAMES[Math.min(lvlOf(XP)-1,LVLNAMES.length-1)]}</small></div>
  <div class="d29wkk"><div><b>${st}</b><small>${t29('days')} de ${t29('streak')}</small></div><div><b>${tot}</b><small>${t29('xpw')}</small></div><div><b>${wk}</b><small>${t29('lessonsW')}</small></div></div>
  <div class="d29wkc" role="img" aria-label="XP por día de la semana">${vals.map((v,i)=>`<div><i style="--h:${(v/mx*100).toFixed(0)}%;--i:${i}"></i><small>${new Date(ds[i]+'T12:00').toLocaleDateString(LOC(),{weekday:'narrow'})}</small></div>`).join('')}</div>
  <div class="d29prog"><i style="--w:${Math.min(100,tot/goal*100).toFixed(0)}%"></i></div><p class="d29fine">${t29('weekGoal').replace('{g}',goal)}</p>`;}
function dailyIns(){const el=$('#d29ins');if(!el)return;const out=[];
 if(member()&&RPF.length){try{const C=pfCalc(),V=C.rows.reduce((a,r)=>a+r.val,0);const top=[...C.rows].sort((a,b)=>b.val-a.val)[0];if(top&&V&&top.val/V>.35)out.push(['diversificar',`${top.s} representa el ${(top.val/V*100).toFixed(0)}% de tu cartera real. Una sola posición tan grande domina tu resultado.`,'port']);
  const hh=C.rows.reduce((a,r)=>a+(r.val/V)**2,0);if(hh&&1/hh<4&&C.rows.length)out.push(['etf',`Tu cartera equivale a ${(1/hh).toFixed(1)} posiciones del mismo peso. Un ETF amplio sumaría diversificación con una sola compra.`,'learn']);}catch(e){}}
 const db=store.get('debt',null);if(db&&Array.isArray(db.debts)){const hi=db.debts.filter(d=>+d.r>=30&&+d.b>0);if(hi.length)out.push(['stop',`Tienes ${hi.length} deuda(s) con tasa de ${Math.max(...hi.map(d=>+d.r))}% o más. Pagarlas primero rinde más que casi cualquier inversión.`,'debt']);}
 if(member()&&!(store.get('goals',[])||[]).length)out.push(['target','Aún no tienes metas. Empieza por un fondo de emergencia de 3 a 6 meses de gastos.','goals']);
 if(PV&&PV.cash/pvValue()>.8&&Object.keys(PV.h||{}).length)out.push(['buy',`En práctica tienes ${(PV.cash/pvValue()*100).toFixed(0)}% en efectivo: prueba cómo se comporta una cartera diversificada sin arriesgar dinero.`,'play']);
 if(!out.length)out.push(['cap',LV==='avanzado'?'Revisa la correlación entre tus posiciones en Herramientas: dos activos muy correlacionados se comportan como uno.':'Empieza por la ruta Starter de Academy: 7 lecciones de 3 minutos.',LV==='avanzado'?'tools':'learn']);
 el.innerHTML=`<div class="d29ch"><h2>${t29('ins')}</h2><small>${t29('insNote')}</small></div>${out.slice(0,3).map(([i,txt,v],k)=>`<button class="d29i" data-go="${v}" style="--i:${k}"><span class="d29ii">${ic(i,'',false)}</span><span>${esc(txt)}</span>${ic('right','',false)}</button>`).join('')}`;}
sec.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){setView(g.dataset.go);return;}const p=e.target.closest('[data-prem]');if(p){premSheet();return;}const t=e.target.closest('.d29t');if(t&&member()&&MKT){setView('stocks');setTimeout(()=>coOpen(t.dataset.s),250);}});
function dailyMount(){dailyShell();if(!MKT)return;const go=()=>{ovLoad();dailyNews();fxLoad().then(()=>dailyMy());};(window.requestIdleCallback||setTimeout)(go,{timeout:900});}
dailyMount();
/* al iniciar o cerrar sesión, el Daily se rehace con el nombre, el plan y la cartera de la cuenta */
let SHM=member();const _au29=accUI;accUI=function(){_au29();const m=member();if(m!==SHM){SHM=m;SUB=(ACC&&ACC.sub)||null;if(ACC&&ACC.lang&&ACC.lang!==LANG){LANG=ACC.lang;applyLang();}dailyShell();NEWS29=null;if(MKT)dailyNews();if(m)planLoad();}};
const _sv29=setView;setView=function(v,o){_sv29(v,o);if(v==='inicio'){dailyMy();dailyIns();dailyWeek();planUI();}if(v==='learn')acadRender();};

/* ---------- Premium y prueba gratuita ---------- */
async function premSheet(why){if(!member()){openAccount();return;}await planLoad();const s=SUB||{plan:'free',status:'none'},P=(PLANCFG&&PLANCFG.plans)||{free:{aiDaily:15},premium:{aiDaily:150}},bill=PLANCFG&&PLANCFG.billing,price=PLANCFG&&PLANCFG.price;
 const fmt=t=>new Date(t).toLocaleDateString(LOC(),{day:'numeric',month:'long',year:'numeric'});
 const rows=[['Consultas de IA por día',P.free.aiDaily,P.premium.aiDaily],['Investigación profunda con más fuentes','—','Incluida'],['Academy ruta Advanced (8 lecciones)','—','Incluida'],['Lucioni Daily, Academy Starter, simulador, cartera, metas y herramientas','Incluido','Incluido']];
 const trialing=s.status==='trialing',canTrial=!s.trialUsed&&s.plan!=='premium';
 openSheet(`<div class="p29"><p class="d29k">${why==='academy'?'Contenido Premium':'Tu plan'}</p><h2>${s.plan==='premium'?(trialing?'Estás en tu prueba Premium':'Lucioni Premium activo'):'Lucioni Free'}</h2>
  ${trialing?`<p class="p29st">Tu prueba termina el <b>${fmt(s.trialEnd)}</b>. Después vuelves a Free automáticamente${s.source==='stripe'?' salvo que tu suscripción continúe según lo que aceptaste en el pago':''}; tus datos y tu progreso se conservan.</p>`:''}
  ${s.status==='canceled'&&s.source==='trial'?'<p class="p29st">Cancelaste tu prueba. Sigues en Free con todos tus datos.</p>':''}
  <table class="p29t"><thead><tr><th></th><th>Free</th><th>Premium</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b></td></tr>`).join('')}</tbody></table>
  ${canTrial?`<div class="p29box"><h3>Prueba Premium gratis por 7 días</h3><ul><li>No pedimos tarjeta ni datos de pago.</li><li>Al terminar vuelves a Free sin cargos; no se renueva sola.</li><li>Puedes cancelarla cuando quieras desde aquí.</li><li>Una prueba por persona.</li></ul><button class="btn pri" id="p29trial">Empezar mis 7 días gratis</button></div>`:''}
  ${trialing&&s.source==='trial'?'<button class="btn" id="p29cancel">Cancelar la prueba y volver a Free</button>':''}
  <div class="p29pay"><h3>Suscripción de pago</h3>${bill?`<p>${price?esc(price):'Precio indicado en el pago'} · renovación automática hasta que canceles · cancelas en el portal de pagos en cualquier momento.</p><button class="btn ${canTrial?'':'pri'}" id="p29buy">${s.source==='stripe'?'Gestionar mi suscripción':'Suscribirme'}</button>`:'<p>Los pagos aún no están activos. Cuando se activen verás aquí el precio, la duración y las condiciones de renovación antes de pagar.</p>'}</div>
  <p class="d29fine">Lucioni Capital es una herramienta educativa: no es una sociedad agente de bolsa ni está supervisada por la SMV y no brinda asesoría financiera personalizada.</p></div>`);
 const B=$('#sheetBody');
 B.querySelector('#p29trial')?.addEventListener('click',async e=>{e.target.disabled=true;try{const d=await acc29('trial');SUB=d.profile.sub;ACC.sub=SUB;_sset.call(store,'acc',ACC);track('trial_started');toast('Premium activo por 7 días',ic('trophy'));if(!RM29())FX.burst(innerWidth/2,innerHeight/2,90);premSheet();planUI();acadRender();dailyLesson();}catch(er){e.target.disabled=false;toast(er.message);}});
 B.querySelector('#p29cancel')?.addEventListener('click',async e=>{if(!confirm('¿Cancelar la prueba? Vuelves a Free ahora y conservas todos tus datos.'))return;try{const d=await acc29('cancel');SUB=d.profile.sub;ACC.sub=SUB;_sset.call(store,'acc',ACC);track('subscription_cancelled');toast('Prueba cancelada. Sigues en Free.');premSheet();planUI();acadRender();}catch(er){toast(er.message);}});
 B.querySelector('#p29buy')?.addEventListener('click',async e=>{e.target.disabled=true;try{const r=await fetch(BILL,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+tok()},body:JSON.stringify({action:s.source==='stripe'?'portal':'checkout'})});const d=await r.json();if(!r.ok)throw d;location.href=d.url;}catch(er){e.target.disabled=false;toast(er.message||'No se pudo abrir el pago.');}});}
window.premSheet=premSheet;

/* ---------- Perfil y preferencias ---------- */
function profPayload(){return {name:ACC.name,risk:ACC.risk,cur:CUR29,goal:ACC.goal||'',lang:LANG,level:LV,country:ACC.country||'',tz:ACC.tz||Intl.DateTimeFormat().resolvedOptions().timeZone,prefs:{notif:store.get('notif',true),analytics:consent()===true}};}
const COUNTRIES=[['PE','Perú'],['US','Estados Unidos'],['MX','México'],['CO','Colombia'],['CL','Chile'],['AR','Argentina'],['ES','España'],['GB','Reino Unido'],['DE','Alemania'],['BR','Brasil'],['EC','Ecuador'],['BO','Bolivia'],['OT','Otro']];
async function profSheet(){if(!member()){openAccount();return;}await planLoad();const tz=ACC.tz||Intl.DateTimeFormat().resolvedOptions().timeZone;
 openSheet(`<div class="f29"><p class="d29k">${t29('profile')}</p><h2>${esc(ACC.name||'')}</h2><p class="d29e">${esc(ACC.email||'')}</p><span class="d29planWrap">${planBadge()}</span>
  <div class="f29g"><label>Idioma<select id="f29l"><option value="es">Español</option><option value="en">English</option></select></label>
  <label>Moneda de presentación<select id="f29c">${['USD','EUR','PEN','GBP'].map(c=>`<option>${c}</option>`).join('')}</select></label>
  <label>País<select id="f29p"><option value="">—</option>${COUNTRIES.map(([c,n])=>`<option value="${c}">${n}</option>`).join('')}</select></label>
  <label>Zona horaria<input id="f29z" value="${esc(tz)}" maxlength="60"></label>
  <label>Nivel<select id="f29v"><option value="principiante">${t29('begin')}</option><option value="avanzado">${t29('adv')}</option></select></label></div>
  <p class="d29fine">Los precios de los activos se muestran en su moneda original (USD). La moneda de presentación convierte totales con tipos de referencia del BCE y del BCRP; si no hay tipo disponible, se muestra en USD.</p>
  <label class="chk"><input type="checkbox" id="f29n" ${store.get('notif',true)?'checked':''}> Recordatorio del reto diario dentro de la app</label>
  <label class="chk"><input type="checkbox" id="f29a" ${consent()===true?'checked':''}> Compartir estadísticas de uso anónimas (sin correo, nombre ni montos)</label>
  <div class="f29b"><button class="btn pri" id="f29s">Guardar</button><button class="btn" id="f29prem">Plan y Premium</button><button class="btn" id="f29x">Exportar mis datos</button><button class="btn" id="f29acc">Cuenta, contraseña y eliminar cuenta</button></div></div>`);
 const B=$('#sheetBody');B.querySelector('#f29l').value=LANG;B.querySelector('#f29c').value=CUR29;B.querySelector('#f29p').value=ACC.country||'';B.querySelector('#f29v').value=LV;
 B.querySelector('#f29s').onclick=async()=>{LANG=B.querySelector('#f29l').value;CUR29=B.querySelector('#f29c').value;LV=B.querySelector('#f29v').value;ACC.country=B.querySelector('#f29p').value;ACC.tz=B.querySelector('#f29z').value.trim();
  store.set('lang',LANG);store.set('cur29',CUR29);store.set('lvl29',LV);store.set('notif',B.querySelector('#f29n').checked);store.set('anOk',B.querySelector('#f29a').checked);ACC.cur=CUR29;ACC.lang=LANG;ACC.level=LV;_sset.call(store,'acc',ACC);
  try{await acc29('save',{profile:profPayload()});toast('Preferencias guardadas',ic('check'));}catch(e){toast(e.message);}closeSheet();applyLang();dailyShell();if(MKT){dailyNews();}};
 B.querySelector('#f29prem').onclick=()=>premSheet();B.querySelector('#f29acc').onclick=()=>{closeSheet();setTimeout(()=>openAccount(true),250);};
 B.querySelector('#f29x').onclick=async e=>{e.target.disabled=true;try{const d=await acc29('export');const url=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`lucioni-capital-mis-datos-${day29()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);toast('Descargaste tus datos');}catch(er){toast(er.message);}e.target.disabled=false;};}
window.profSheet=profSheet;

/* ---------- navegación: 8 secciones; en móvil, barra inferior ---------- */
const NAV8=[['inicio','home','home'],['port','wealth','diversificar'],['chat','intelN','chat'],['stocks','markets','alcista'],['play','practice','buy'],['learn','academy','cap'],['tools','tools','compuesto'],['perfil','profile','user']];
const tb=document.createElement('nav');tb.className='tb29';tb.setAttribute('aria-label','Navegación principal');
function tbRender(){tb.innerHTML=[NAV8[0],NAV8[1],NAV8[2],NAV8[3]].map(([v,k,i])=>`<button data-v="${v}"${VIEW===v?' aria-current="page"':''}>${ic(i,'',false)}<span>${t29(k)}</span></button>`).join('')+`<button data-v="more">${ic('menu','',false)}<span>${t29('more')}</span></button>`;}
tbRender();document.body.appendChild(tb);document.body.classList.add('has-tb29');
let DEFER=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();DEFER=e;});addEventListener('appinstalled',()=>{track('pwa_installed');DEFER=null;});
tb.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const v=b.dataset.v;if(v==='more'){moreSheet();return;}if(v==='perfil'){profSheet();return;}setView(v);});
function moreSheet(){const items=[['play','practice','buy','Simulador con $10,000 virtuales'],['learn','academy','cap','Academy, glosario y trivia'],['tools','tools','compuesto','Monte Carlo, rebalanceo y calculadoras'],['desk',null,'target','Mesa del inversor · 11 herramientas'],['ideas',null,'alcista','Ideas de inversión con datos reales'],['goals',null,'target','Metas y planificación'],['debt',null,'stop','Deudas e inversión'],['home',null,'accion','Generador de carteras con IA'],['mkt',null,'alcista','Mercado simulado'],['perfil','profile','user','Idioma, moneda, plan y tus datos']];
 const nm={desk:'Mesa del inversor',ideas:'Ideas',goals:'Metas',debt:'Deudas',home:'Tu plan',mkt:'Mercado simulado'};
 openSheet(`<div class="m29"><p class="d29k">Lucioni Capital</p><h2>${t29('more')}</h2><div class="m29g">${items.map(([v,k,i,d],n)=>`<button data-v="${v}" style="--i:${n}">${ic(i,'',false)}<span><b>${k?t29(k):nm[v]}</b><small>${d}</small></span></button>`).join('')}</div>${DEFER?'<button class="btn pri" id="m29i">Instalar la app en este dispositivo</button>':''}</div>`);
 const B=$('#sheetBody');B.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{closeSheet();const v=b.dataset.v;if(v==='perfil')setTimeout(profSheet,250);else setView(v);});
 B.querySelector('#m29i')?.addEventListener('click',async()=>{if(!DEFER)return;DEFER.prompt();await DEFER.userChoice.catch(()=>null);DEFER=null;closeSheet();});}
const _mk29=markNav;markNav=function(){_mk29();tb.querySelectorAll('[data-v]').forEach(b=>{if(b.dataset.v===VIEW)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});};
/* nombres de la navegación superior según el idioma */
function applyLang(){document.documentElement.lang=LANG;tbRender();markNav();const map={chat:'intelN',learn:'academy',play:'practice',tools:'tools'};$$('#nav a[data-p], #nav2 a[data-p]').forEach(a=>{const k=map[a.dataset.p];if(k)a.textContent=t29(k);});}
applyLang();
addEventListener('hashchange',()=>{const h=location.hash;if(h.startsWith('#premium'))premSheet();else if(h==='#perfil')profSheet();});
if(location.hash.startsWith('#premium')){setTimeout(()=>{premSheet();if(/ok=1/.test(location.hash))toast('Pago recibido. Tu plan se actualiza en cuanto el sistema de pagos lo confirme.');},900);}else if(location.hash==='#perfil')setTimeout(profSheet,900);

/* ---------- consentimiento de analítica (una sola vez) ---------- */
if(WEB&&consent()===null){setTimeout(()=>{toast('¿Nos ayudas a mejorar con estadísticas de uso anónimas? No incluyen tu correo, nombre ni montos.',{action:{label:'Sí, acepto',fn:()=>{store.set('anOk',true);track('app_opened');}},dur:12000});setTimeout(()=>{if(consent()===null)store.set('anOk',false);},13000);},4000);}

/* ---------- PWA ---------- */
if(WEB&&'serviceWorker' in navigator&&location.protocol==='https:'){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));}

/* ---------- arranque con sesión: plan del servidor y aviso del reto ---------- */
(async()=>{if(member()&&tok()){await planLoad();dailyLesson();}
 if(store.get('notif',true)&&CHAL.d!==day29()&&member())setTimeout(()=>toast('Tu reto de hoy está listo en Lucioni Daily',{icon:ic('target'),action:{label:'Ver',fn:()=>{setView('inicio');setTimeout(()=>$('#d29chal')?.scrollIntoView({behavior:RM29()?'auto':'smooth',block:'center'}),300);}}}),2600);})();
}
