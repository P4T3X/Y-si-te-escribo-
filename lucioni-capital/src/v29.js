
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
 es:{daily:'Lucioni Daily',greetM:'Buenos días',greetT:'Buenas tardes',greetN:'Buenas noches',guest:'inversionista',mkt:'Resumen de mercados',mktNote:'ETFs que siguen cada índice · Nasdaq, puede tener retraso',my:'Mi patrimonio',myEmpty:'Aún no registras tu cartera real. Agrega lo que tienes en tu bróker y la verás aquí cada día.',myCta:'Registrar mi cartera',intel:'Daily Intelligence',intelGen:'Generar el resumen de hoy',intelNote:'Usa 1 consulta de IA. Cita cada dato con su fuente.',news:'Noticias de hoy',lesson:'Lección del día',chal:'Reto del día',week:'Progreso semanal',ins:'Para ti',insNote:'Según los datos guardados en tu cuenta',begin:'Principiante',adv:'Avanzado',streak:'racha',days:'días',xpw:'XP esta semana',lessonsW:'lecciones',start:'Empezar',done:'Completada',correct:'¡Correcto!',wrong:'No exactamente',answered:'Ya respondiste hoy. Vuelve mañana por un nuevo reto.',premium:'Premium',free:'Free',trial:'Prueba',profile:'Perfil',finances:'Finanzas',more:'Más',home:'Inicio',wealth:'Patrimonio',intelN:'Intelligence',markets:'Mercados',practice:'Práctica',academy:'Academia',tools:'Herramientas',noData:'Sin datos por ahora. Intenta en unos minutos.',src:'Fuente',loading:'Cargando…',acad:'Lucioni Academy',starter:'Starter',advanced:'Advanced',min:'min',lock:'Premium',quizGo:'Completar lección',of:'de',newsMine:'De tu cartera',newsTop:'De las empresas más grandes del índice',today:'hoy',gain:'Ganancia total',seePf:'Ver mi cartera',intelDesc:'Un resumen breve de lo que movió los mercados hoy, con cada dato enlazado a su fuente.',weekGoal:'Meta semanal: {g} XP aprendiendo y analizando. Las operaciones simuladas no suman XP.',completed:'completadas'},
 en:{daily:'Lucioni Daily',greetM:'Good morning',greetT:'Good afternoon',greetN:'Good evening',guest:'investor',mkt:'Market overview',mktNote:'ETFs tracking each index · Nasdaq, may be delayed',my:'My wealth',myEmpty:'You have not added your real portfolio yet. Add what you hold at your broker to see it here every day.',myCta:'Add my portfolio',intel:'Daily Intelligence',intelGen:'Generate today’s briefing',intelNote:'Uses 1 AI query. Every figure is cited.',news:'Today’s news',lesson:'Daily lesson',chal:'Daily challenge',week:'Weekly progress',ins:'For you',insNote:'Based on the data saved in your account',begin:'Beginner',adv:'Advanced',streak:'streak',days:'days',xpw:'XP this week',lessonsW:'lessons',start:'Start',done:'Completed',correct:'Correct!',wrong:'Not quite',answered:'You already answered today. Come back tomorrow.',premium:'Premium',free:'Free',trial:'Trial',profile:'Profile',finances:'Finances',more:'More',home:'Home',wealth:'Wealth',intelN:'Intelligence',markets:'Markets',practice:'Practice',academy:'Academy',tools:'Tools',noData:'No data right now. Try again in a few minutes.',src:'Source',loading:'Loading…',acad:'Lucioni Academy',starter:'Starter',advanced:'Advanced',min:'min',lock:'Premium',quizGo:'Complete lesson',of:'of',newsMine:'From your portfolio',newsTop:'From the largest index companies',today:'today',gain:'Total gain',seePf:'View my portfolio',intelDesc:'A short briefing on what moved markets today, with every figure linked to its source.',weekGoal:'Weekly goal: {g} XP from learning and analysis. Simulated trades do not earn XP.',completed:'completed'}};
let LANG=(ACC&&ACC.lang)||store.get('lang',null)||'es';
const t29=k=>(I18N[LANG]&&I18N[LANG][k])||I18N.es[k]||k;window.I18N29=I18N;
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
const NAV8=[['inicio','home','home'],['finance','finances','dividendo'],['chat','intelN','chat'],['stocks','markets','alcista'],['play','practice','buy'],['learn','academy','cap'],['tools','tools','compuesto'],['perfil','profile','user']];
const tb=document.createElement('nav');tb.className='tb29';tb.setAttribute('aria-label','Navegación principal');
function tbRender(){tb.innerHTML=[NAV8[0],NAV8[1],NAV8[2],NAV8[3]].map(([v,k,i])=>`<button data-v="${v}"${VIEW===v?' aria-current="page"':''}>${ic(i,'',false)}<span>${t29(k)}</span></button>`).join('')+`<button data-v="more">${ic('menu','',false)}<span>${t29('more')}</span></button>`;}
tbRender();document.body.appendChild(tb);document.body.classList.add('has-tb29');
let DEFER=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();DEFER=e;});addEventListener('appinstalled',()=>{track('pwa_installed');DEFER=null;});
tb.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const v=b.dataset.v;if(v==='more'){moreSheet();return;}if(v==='perfil'){profSheet();return;}setView(v);});
function moreSheet(){const items=[['port','wealth','diversificar','Tu cartera real con precios en vivo'],['play','practice','buy','Simulador con $10,000 virtuales'],['learn','academy','cap','Academy, glosario y trivia'],['tools','tools','compuesto','Monte Carlo, rebalanceo y calculadoras'],['desk',null,'target','Mesa del inversor · 11 herramientas'],['ideas',null,'alcista','Ideas de inversión con datos reales'],['goals',null,'target','Metas y planificación'],['debt',null,'stop','Deudas e inversión'],['home',null,'accion','Generador de carteras con IA'],['mkt',null,'alcista','Mercado simulado'],['perfil','profile','user','Idioma, moneda, plan y tus datos']];
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
