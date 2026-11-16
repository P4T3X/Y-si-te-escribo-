
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
