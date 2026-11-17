
/* ===================== V32: Lucioni AI Copilot (acciones con tus datos) y Lucioni Watchtower (alertas inteligentes) ===================== */
{
const {J30,pool30,big30,pc30,cls30,stats30,align30,rets30,corr30,beta30,lines30}=window.L30;
const day32=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const kp=(l,v,c='')=>`<div><small>${l}</small><b class="mono ${c}">${v}</b></div>`;

/* ================= HERRAMIENTAS DEL COPILOT ================= */
async function hist(s){const d=await J30(`${MKT}?h1y=${encodeURIComponent(s)}`,6*3600000);return d.pts||[];}
/* análisis de la cartera real: pesos, sectores, concentración, volatilidad, caída máxima, Sharpe, beta y aporte al riesgo */
async function toolPortfolio(step){if(!member()||!RPF.length)return {cards:'<div class="cp32c"><p class="note">No tienes una cartera real registrada. Agrégala en Mi patrimonio y vuelve a pedírmelo.</p><button class="btn" onclick="setView(\'port\')">Registrar mi cartera</button></div>',S:[],ctx:'El usuario no tiene cartera registrada.'};
 step('Analizando tu cartera con precios de 1 año…');if(MKT)await ensurePrices(RPF.map(h=>h.s)).catch(()=>{});
 const P=pfCalc(),rows=P.rows.filter(r=>r.val>0).sort((a,b)=>b.val-a.val).slice(0,12),V=rows.reduce((a,r)=>a+r.val,0);
 const H=await pool30([...rows.map(r=>r.s),'SPY','BIL'],3,s=>hist(s));const spy=H[rows.length],bil=H[rows.length+1];
 const ok=rows.map((r,i)=>({r,h:H[i]})).filter(x=>x.h&&x.h.length>20);
 let pstat=null,beta=null,contrib=[],pair=null,rf=null,sharpe=null,sortino=null;
 if(ok.length){const al=align30([...ok.map(x=>x.h),spy&&spy.length?spy:ok[0].h]);const W=ok.map(x=>x.r.val);const ws=W.reduce((a,b)=>a+b,0);const w=W.map(x=>x/ws);
  const n=al[0].length;const port=Array.from({length:n},(_,k)=>ok.reduce((a,x,i)=>a+w[i]*al[i][k]/al[i][0],0));
  const pts=port.map((v,k)=>[k*7*864e5,v]);pstat=stats30(pts);const pr=rets30(port),mr=rets30(al[al.length-1]);beta=spy&&spy.length?beta30(pr,mr):null;
  const R=ok.map((x,i)=>rets30(al[i]));const vp=pr.reduce((a,b)=>a+(b-pr.reduce((x,y)=>x+y,0)/pr.length)**2,0)/(pr.length-1);
  contrib=ok.map((x,i)=>{const mi=R[i].reduce((a,b)=>a+b,0)/R[i].length,mp=pr.reduce((a,b)=>a+b,0)/pr.length;let c=0;for(let k=0;k<pr.length;k++)c+=(R[i][k]-mi)*(pr[k]-mp);c/=(pr.length-1);return {s:x.r.s,w:w[i],rc:vp?w[i]*c/vp:0};}).sort((a,b)=>b.rc-a.rc);
  for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const c=corr30(R[i],R[j]);if(c!=null&&(!pair||c>pair.c))pair={a:ok[i].r.s,b:ok[j].r.s,c};}
  const bs=stats30(bil);rf=bs?bs.ret:null;if(pstat&&rf!=null){sharpe=(pstat.ret-rf)/pstat.vol;sortino=pstat.dvol?(pstat.ret-rf)/pstat.dvol:null;}}
 const sec=P.sec.map(([k,v])=>[k,v/V]);const hhi=rows.reduce((a,r)=>a+(r.val/V)**2,0);
 const S=[{kind:'Tu cuenta',title:'Tu cartera real guardada en Lucioni Capital',url:'',snip:`${rows.length} posiciones, valor ${big30(V)}. Pesos: ${rows.map(r=>`${r.s} ${(r.val/V*100).toFixed(1)}%`).join(', ')}. Sectores: ${sec.map(([k,v])=>`${SECES[k]||k} ${(v*100).toFixed(0)}%`).join(', ')}.`},
  {kind:'Mercado',title:'Precios semanales de 1 año de tus posiciones, SPY y BIL',url:'https://www.nasdaq.com/market-activity/quotes/historical',snip:pstat?`Cartera (pesos actuales aplicados al último año): rendimiento ${pc30(pstat.ret*100)}, volatilidad anual ${(pstat.vol*100).toFixed(1)}%, caída máxima ${(pstat.mdd*100).toFixed(1)}%${beta!=null?`, beta frente al S&P 500 ${beta.toFixed(2)}`:''}${rf!=null?`; rendimiento de BIL (letras del Tesoro) ${pc30(rf*100)}`:''}.`:'Sin historial suficiente.'},
  {kind:'Cálculo',title:'Cálculo de riesgo Lucioni Capital',url:'',snip:`Posiciones equivalentes ${(1/hhi).toFixed(1)}${sharpe!=null?`; Sharpe ${sharpe.toFixed(2)}`:''}${sortino!=null?`; Sortino ${sortino.toFixed(2)}`:''}. Mayor aporte al riesgo: ${contrib.slice(0,3).map(c=>`${c.s} ${(c.rc*100).toFixed(0)}% del riesgo con ${(c.w*100).toFixed(0)}% del peso`).join('; ')}${pair?`. Par más correlacionado: ${pair.a}-${pair.b} (${pair.c.toFixed(2)})`:''}.`}];
 const cards=`<div class="cp32c"><h4>Análisis de tu cartera <small>pesos actuales aplicados al último año</small></h4><div class="cp32k">${kp('Valor',big30(V))}${pstat?kp('Rendimiento 1 año',pc30(pstat.ret*100),cls30(pstat.ret))+kp('Volatilidad anual',(pstat.vol*100).toFixed(1)+'%')+kp('Caída máxima',(pstat.mdd*100).toFixed(1)+'%','dn'):''}${beta!=null?kp('Beta vs S&P 500',beta.toFixed(2)):''}${sharpe!=null?kp('Sharpe',sharpe.toFixed(2)):''}${kp('Posiciones equivalentes',(1/hhi).toFixed(1))}</div>
  <div class="cp32two"><div><h5>Sectores</h5>${sec.map(([k,v],i)=>`<div class="cp32b" style="--i:${i}"><span>${esc(SECES[k]||k)}</span><i style="--w:${(v*100).toFixed(1)}%"></i><b class="mono">${(v*100).toFixed(0)}%</b></div>`).join('')}</div>
  <div><h5>Aporte al riesgo</h5>${contrib.length?contrib.slice(0,6).map((c,i)=>`<div class="cp32b" style="--i:${i}"><span>${c.s}</span><i class="r" style="--w:${Math.max(0,c.rc*100).toFixed(1)}%"></i><b class="mono">${(c.rc*100).toFixed(0)}% <small>peso ${(c.w*100).toFixed(0)}%</small></b></div>`).join(''):'<p class="note">Sin historial suficiente.</p>'}</div></div>
  <p class="note">Supuestos: precios semanales del último año (Nasdaq), tasa libre de riesgo = rendimiento de BIL en el mismo período. Usa los pesos de hoy; no reconstruye tus compras pasadas. El pasado no garantiza el futuro.</p></div>`;
 return {cards,S,ctx:'Análisis de la cartera real del usuario, hecho con sus datos y con su permiso.'};}
/* exposición sectorial y qué activos la explican */
async function toolSector(step,t){if(!member()||!RPF.length)return toolPortfolio(step);step('Calculando tu exposición por sector…');if(MKT)await ensurePrices(RPF.map(h=>h.s)).catch(()=>{});
 const P=pfCalc(),V=P.rows.reduce((a,r)=>a+r.val,0);const want=/tecnol|tech/i.test(t)?'Technology':P.sec[0]&&P.sec[0][0];const inS=P.rows.filter(r=>r.sec===want).sort((a,b)=>b.val-a.val);const wS=inS.reduce((a,r)=>a+r.val,0)/V;
 const snap=store.get('wtsnap',null);const prev=snap&&snap.sec?snap.sec[want]:null;
 const S=[{kind:'Tu cuenta',title:`Exposición de tu cartera a ${SECES[want]||want}`,url:'',snip:`${(wS*100).toFixed(1)}% de tu cartera está en ${SECES[want]||want}${prev!=null?` (hace ${Math.round((Date.now()-snap.t)/864e5)} días: ${(prev*100).toFixed(1)}%)`:''}. Activos: ${inS.map(r=>`${r.s} ${(r.val/V*100).toFixed(1)}%`).join(', ')||'ninguno'}.`}];
 const cards=`<div class="cp32c"><h4>Exposición a ${esc(SECES[want]||want)}</h4><div class="cp32k">${kp('Peso del sector',(wS*100).toFixed(1)+'%',wS>.4?'dn':'')}${prev!=null?kp('Cambio desde la última foto',pc30((wS-prev)*100)+' pts'):''}${kp('Activos del sector',inS.length)}</div>${inS.map((r,i)=>`<div class="cp32b" style="--i:${i}"><span>${r.s}</span><i style="--w:${(r.val/V*100).toFixed(1)}%"></i><b class="mono">${(r.val/V*100).toFixed(1)}%</b></div>`).join('')}</div>`;
 return {cards,S,ctx:'Exposición sectorial de la cartera del usuario.'};}
/* simulación de una inversión con Monte Carlo calibrado con 5 años reales del S&P 500 (SPY) */
async function toolSim(step,t){const num=s=>{s=String(s).trim();if(/^\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');return parseFloat(s.replace(/[,\s]/g,''));};const am=t.match(/\$?\s?([\d][\d.,]*)\s*(mil\b|k\b)?/i),yr=t.match(/(\d{1,2})\s*(años|anos|years|yrs)/i),mo=t.match(/([\d][\d.,]*)\s*(al mes|mensual|cada mes|per month|monthly)/i);
 let A=am?num(am[1])*(am[2]?1000:1):5000;const Y=yr?Math.min(40,+yr[1]):10,M=mo?num(mo[1]):0;if(!(A>0))A=5000;
 step('Calibrando la simulación con 5 años del S&P 500…');let h=null;try{h=await J30(`${MKT}?h5=SPY`,21600000);}catch(e){}const st=stats30(h&&h.pts);
 const mu=st?Math.log(1+st.cagr):Math.log(1.07),sg=st?st.vol:.16,N=2000;const yrs=[];
 for(let y=0;y<=Y;y++)yrs.push([]);for(let k=0;k<N;k++){let v=A;yrs[0].push(v);for(let y=1;y<=Y;y++){let z=0;for(let j=0;j<6;j++)z+=Math.random();z=(z-3)*Math.SQRT2;v=v*Math.exp(mu-.5*sg*sg+sg*z)+M*12;yrs[y].push(v);}}
 const q=(a,p)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(p*(s.length-1))];};const P10=yrs.map(a=>q(a,.1)),P50=yrs.map(a=>q(a,.5)),P90=yrs.map(a=>q(a,.9));const inv=A+M*12*Y;
 const ts=y=>Date.now()+y*365.25*864e5;const S=[{kind:'Mercado',title:'S&P 500 (SPY): precios semanales de 5 años',url:'https://www.nasdaq.com/market-activity/etf/spy/historical',snip:st?`Rendimiento anual compuesto ${pc30(st.cagr*100)}, volatilidad anual ${(st.vol*100).toFixed(1)}%, caída máxima ${(st.mdd*100).toFixed(1)}% en ${st.yrs.toFixed(1)} años.`:'Sin datos; se usó un supuesto de 7% anual y 16% de volatilidad.'},
  {kind:'Cálculo',title:`Simulación Monte Carlo Lucioni (${N} escenarios)`,url:'',snip:`Inversión inicial ${big30(A)}${M?` y ${big30(M)} al mes`:''} durante ${Y} años, total aportado ${big30(inv)}. Resultado al final: escenario malo (10%) ${big30(P10[Y])}, mediano ${big30(P50[Y])}, bueno (90%) ${big30(P90[Y])}. Supone rendimientos con la media y volatilidad del período; no incluye comisiones, impuestos ni inflación.`}];
 const cards=`<div class="cp32c"><h4>Simulación: ${big30(A)}${M?` + ${big30(M)}/mes`:''} durante ${Y} años <small>${N} escenarios</small></h4><div class="cp32k">${kp('Aportado',big30(inv))}${kp('Escenario malo (10%)',big30(P10[Y]),'dn')}${kp('Mediano',big30(P50[Y]))}${kp('Escenario bueno (90%)',big30(P90[Y]),'up')}</div>
  ${lines30([{pts:P90.map((v,y)=>[ts(y),v]),color:'var(--up)'},{pts:P50.map((v,y)=>[ts(y),v]),color:'var(--em)'},{pts:P10.map((v,y)=>[ts(y),v]),color:'var(--down)'}],{h:190,fmt:v=>big30(v)})}
  <p class="note">Calibrado con el S&P 500 de los últimos 5 años: un período concreto que puede no repetirse. Es una ilustración, no una promesa.</p><button class="btn" onclick="setView('goals')">Convertirlo en una meta ${ic('right','',false)}</button></div>`;
 return {cards,S,ctx:'Simulación hipotética hecha por Lucioni Capital.',noResearch:true};}
/* por qué se movió el mercado: índices, sectores y titulares del día */
async function toolMarket(step){step('Revisando índices, sectores y noticias de hoy…');const S=[];if(!CO.length&&MKT)await coLoad().catch(()=>{});
 let q={};try{q=(await J30(`${MKT}?quotes=SPY,QQQ,DIA,IWM,EFA,EEM,TLT,GLD`,60000)).q||{};}catch(e){}
 S.push({kind:'Mercado',title:'Índices y activos de referencia hoy (ETFs)',url:'https://www.nasdaq.com/market-activity/etf/spy',snip:Object.entries(q).map(([s,v])=>`${s} ${pc30(v.pc,2)}`).join(', ')+'.'});
 const g={};CO.forEach(r=>{if(!r.m||r.pc==null)return;const k=r.sec||'Otros';g[k]=g[k]||{m:0,w:0};g[k].m+=r.m;g[k].w+=r.m*r.pc;});const secs=Object.entries(g).map(([k,v])=>[k,v.w/v.m]).sort((a,b)=>b[1]-a[1]);
 if(secs.length)S.push({kind:'Mercado',title:'Variación por sector hoy (ponderada por capitalización)',url:'https://www.nasdaq.com/market-activity/stocks/screener',snip:secs.map(([k,v])=>`${SECES[k]||k} ${pc30(v,2)}`).join(', ')+'.'});
 const big=[...CO].filter(r=>r.m).sort((a,b)=>b.m-a.m).slice(0,8);if(big.length)S.push({kind:'Mercado',title:'Las mayores empresas hoy',url:'https://www.nasdaq.com/market-activity/stocks/screener',snip:big.map(r=>`${r.s} ${pc30(r.pc,2)}`).join(', ')+'.'});
 const nw=await pool30(['AAPL','NVDA','MSFT','AMZN'],2,s=>J30(`${MKT}?news=${s}`,600000));const seen=new Set();nw.forEach((d,i)=>{const a=d&&(d.rows||[]).find(x=>!seen.has(x.u));if(a){seen.add(a.u);S.push({kind:'Noticia',title:a.t,url:a.u,snip:`${a.p||'Nasdaq'} · ${a.a||''}`});}});
 const cards=`<div class="cp32c"><h4>Mercado hoy</h4><div class="cp32k">${Object.entries(q).slice(0,6).map(([s,v])=>kp(s,pc30(v.pc,2),cls30(v.pc))).join('')}</div>${secs.length?`<h5>Sectores</h5>${secs.map(([k,v],i)=>`<div class="cp32b s" style="--i:${i}"><span>${esc(SECES[k]||k)}</span><i class="${cls30(v)}" style="--w:${Math.min(100,Math.abs(v)*25).toFixed(1)}%"></i><b class="mono ${cls30(v)}">${pc30(v,2)}</b></div>`).join('')}`:''}<button class="btn" onclick="setView('terminal')">Abrir Lucioni Terminal ${ic('right','',false)}</button></div>`;
 return {cards,S,ctx:'Resumen del mercado de hoy.',noResearch:true};}
const INTENTS=[[/(analiza|revisa|eval[uú]a|diagn[oó]stico).{0,20}(mi|mis) (cartera|portafolio|inversiones)|analy[sz]e my portfolio/i,toolPortfolio,true],
 [/(exposici[oó]n|cu[aá]nto tengo|peso).{0,30}(sector|tecnol|tech)|tech(nology)? exposure/i,toolSector,true],
 [/(simula|proyecta|si invierto|cu[aá]nto tendr[ií]a|simulate)/i,toolSim,false],
 [/(por qu[eé]|qu[eé] pas[oó]|why).{0,40}(mercado|bolsa|market)|c[oó]mo (est[aá]|va) el mercado/i,toolMarket,false]];

window.CP32={INTENTS};
/* ================= COPILOT: nueva pregunta con herramientas ================= */
{const h=$('#asesor .sh h2');if(h)h.innerHTML='Lucioni <em>Copilot</em>';const p=$('#asesor .sh p');if(p)p.textContent='Pregunta sobre mercados, empresas, tu cartera o cualquier concepto. El Copilot usa los módulos de Lucioni Capital con datos reales, cita sus fuentes y solo lee tu cartera si le das permiso.';
 const sg=$('#sugs');if(sg&&!$('#cp32a')){const d=document.createElement('div');d.id='cp32a';d.className='cp32a';d.innerHTML=`<span>Acciones</span>`+[['diversificar','Analiza mi cartera'],['bolt','Compara Apple y Microsoft'],['news','¿Por qué se movió el mercado hoy?'],['compuesto','Simula $5,000 durante 10 años'],['volatilidad','¿Qué riesgos tiene mi exposición tecnológica?']].map(([i,q])=>`<button class="pill" data-q="${esc(q)}">${ic(i,'',false)} ${q}</button>`).join('');sg.before(d);d.querySelectorAll('button').forEach(b=>b.onclick=()=>ask(b.dataset.q));}}
const cpOk=()=>store.get('cpOk',false)===true;
ask=async function(t,again){
 t=(t||$('#cq').value).trim();if(!t)return;$('#cq').value='';const ch=$('#chat');
 if(!again)ch.insertAdjacentHTML('beforeend',`<div class="msg u">${esc(t)}</div>`);
 if(!sample){ch.insertAdjacentHTML('beforeend',`<div class="msg a">${window.LC_API?'La IA no está disponible ahora. Intenta en un momento.':'La IA funciona cuando abres esta app dentro de Claude.'}</div>`);return;}
 mission('ask');const m=document.createElement('div');m.className='msg a c28';m.innerHTML='<div class="c28st"><span class="typing"><span></span><span></span><span></span></span><small>Pensando…</small></div>';ch.appendChild(m);ch.scrollTop=ch.scrollHeight;
 const step=s=>{const e=m.querySelector('.c28st small');if(e)e.textContent=s;};
 const it=INTENTS.find(([re])=>re.test(t));
 const ck=it&&(it[4]||'cpOk');if(it&&it[2]&&member()&&store.get(ck,false)!==true){m.innerHTML=`<div class="cp32p"><b>¿Puedo leer ${it[3]||'tu cartera'}?</b><p>Para responder necesito usar ${it[3]||'las posiciones'} guardad${it[3]?'os':'as'} en tu cuenta de Lucioni Capital. Solo se usan para esta respuesta y para las siguientes que lo requieran; puedes retirar el permiso en Perfil.</p><div><button class="btn pri" data-y>Permitir</button><button class="btn" data-n>Ahora no</button></div></div>`;
  m.querySelector('[data-y]').onclick=()=>{store.set(ck,true);m.remove();ask(t,true);};m.querySelector('[data-n]').onclick=()=>{m.innerHTML='Entendido. Puedo responder de forma general si me lo pides sin usar tus datos.';};return;}
 $('#cs').disabled=true;
 let T={cards:'',S:[],ctx:''};try{if(it&&MKT)T=await it[1](step,t);}catch(e){T={cards:'',S:[],ctx:''};}
 let R={S:[],cards:[],imgs:[]};try{if(!T.noResearch&&window.LC28){if(MKT&&!CO.length)await Promise.race([coLoad(),new Promise(r=>setTimeout(r,2500))]);R=await LC28.research28(t,step);}}catch(e){}
 const S=[...T.S];R.S.forEach(o=>{S.push({...o,n:S.length+1});});T.S.forEach((o,i)=>o.n=i+1);
 R.cards.forEach(c=>LC28.data[c.s]=c);
 step(S.length?`Redactando con ${S.length} fuente${S.length>1?'s':''}…`:'Redactando…');
 const hoy=new Date().toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 const sys=`Eres Lucioni Copilot, el asistente financiero de Lucioni Capital (herramienta educativa, inversionistas en Perú y el mundo). Hoy es ${hoy}. Respondes en español, claro y profesional (máx 190 palabras).
Reglas: usa SOLO las fuentes numeradas para cifras, precios, noticias y fechas, y cita cada dato con [n]. Si falta un dato, dilo. Las simulaciones y proyecciones son hipotéticas: preséntalas así. Nunca prometes rentabilidades, no dices que un activo va a subir y no ejecutas operaciones reales. Cuando sea útil, sugiere qué herramienta de Lucioni Capital usar (Terminal, Deep Research, Watchtower, Metas, Mi patrimonio). Formato: texto simple, puedes usar **negritas** y listas con "- ".${T.ctx?`\nContexto: ${T.ctx}`:''}`;
 const ctx=S.length?`\n\nFUENTES:\n${S.map(o=>`[${o.n}] ${o.kind} — ${o.title}${o.url?' ('+o.url.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]+')':''}: ${o.snip}`).join('\n')}`:'\n\nFUENTES: ninguna; responde con conocimiento general y sin cifras actuales.';
 const prev=HIST.slice(-8);
 try{const r=await sample([...prev,{role:'user',content:sys+ctx+'\n\nPregunta: '+t}],{cache:false,modelTier:'default'});const txt=String(r.text||'').trim();
  m.innerHTML=`<div class="c28tx">${LC28.text28(txt,S)}</div>${T.cards}${R.cards.map(LC28.card28).join('')}${LC28.imgs28(R.imgs)}${LC28.srcs28(S)}<p class="c28ft">Datos consultados en vivo · ${new Date().toLocaleString('es-PE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · Información educativa, no asesoría financiera</p>`;
  m.querySelectorAll('.c28card').forEach(c=>{const b=document.createElement('button');b.className='btn';b.innerHTML=`Deep Research ${ic('right','',false)}`;b.onclick=()=>research31(c.dataset.sym);(c.querySelector('.c28open')||c.lastElementChild).after(b);});
  LC28.wire28(m);HIST.push({role:'user',content:t},{role:'assistant',content:txt.replace(/\[\d{1,2}\]/g,'')});if(HIST.length>16)HIST.splice(0,HIST.length-16);}
 catch(e){m.textContent=aiErr(e);}finally{$('#cs').disabled=false;m.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});}};

/* ================= WATCHTOWER ================= */
const WT_NEW=['hi52','lo52','earn','news','vol','pf','sector','fx'];
const WTT={above:['Precio sube a','Avísame si el precio llega o supera un nivel','US$',true],below:['Precio baja a','Avísame si el precio cae a un nivel','US$',true],move:['Movimiento del día','Variación diaria mayor que','%',true],
 hi52:['Nuevo máximo de 52 semanas','Cuando el precio toca su máximo del último año','',true],lo52:['Nuevo mínimo de 52 semanas','Cuando el precio toca su mínimo del último año','',true],earn:['Resultados próximos','Días de anticipación antes de que reporte','días',true],
 news:['Noticia nueva','Cada vez que aparece un titular nuevo de la empresa','',true],vol:['Volatilidad en aumento','Volatilidad de 8 semanas vs. 1 año (veces)','x',true],pf:['Variación de mi cartera','Mi cartera real sube o baja más que','%',false],
 sector:['Concentración sectorial','El peso de mi sector principal cambia más de','pts',false],fx:['Dólar frente al sol','El tipo de cambio oficial varía más de','%',false]};
const DEF={move:3,earn:7,vol:1.5,pf:2,sector:5,fx:0.5};
Object.assign(ALT_T,{hi52:'Máximo de 52 semanas',lo52:'Mínimo de 52 semanas',earn:'Resultados en',news:'Noticias de',vol:'Volatilidad x',pf:'Mi cartera ±',sector:'Sector ±',fx:'USD/PEN ±'});
const wtLabel=a=>{const d=WTT[a.type]||[a.type];return `${a.s?a.s+' · ':''}${d[0]}${a.v&&!['hi52','lo52','news'].includes(a.type)?' '+(a.type==='above'||a.type==='below'?usd2(a.v):a.v+' '+d[2]):''}`;};
if(typeof aRender==='function'){const _ar=aRender;aRender=function(){_ar();$$('#aL .rrow').forEach((r,i)=>{const a=TRD.alerts[i];if(a&&WT_NEW.includes(a.type)){const b=r.querySelector('b');if(b)b.textContent=wtLabel(a);}});};}
let WLOG=store.get('wtlog',[]);if(!SYNC.includes('wtlog'))SYNC.push('wtlog');if(!SYNC.includes('wtsnap'))SYNC.push('wtsnap');
const lim=()=>((ACC&&ACC.sub&&ACC.sub.limits&&ACC.sub.limits.alerts)||5);
const w=mkView30('watch','watchtower','Watchtower',`<div class="sh"><div><h2>Lucioni <em>Watchtower</em></h2><p>Alertas que vigilan por ti: precios, máximos y mínimos, resultados, noticias, volatilidad, tu cartera y el dólar. Pocas y relevantes: cada alerta avisa como máximo una vez al día.</p></div></div>
 <div class="wt32bar" id="wtBar"></div>
 <div class="wt32g"><div class="panel"><h3>Nueva alerta</h3><form id="wtF" class="wt32f" autocomplete="off"><label>Tipo<select class="f" id="wtT">${Object.entries(WTT).map(([k,d])=>`<option value="${k}">${d[0]}</option>`).join('')}</select></label><p class="note" id="wtD"></p>
  <label id="wtSL">Empresa o ETF<input class="f" id="wtS" maxlength="10" placeholder="Ej.: AAPL" style="text-transform:uppercase"></label><label id="wtVL">Valor<input class="f" id="wtV" type="number" step="any"></label><button class="btn pri" type="submit">Crear alerta</button></form>
  <div class="wt32opt"><label class="chk"><input type="checkbox" id="wtNo"> Notificaciones del navegador</label><label>Máximo de avisos por día <select class="f" id="wtCap"><option>3</option><option>5</option><option>10</option></select></label></div></div>
  <div class="panel"><h3>Tus alertas</h3><div id="wtL"></div></div>
  <div class="panel wt32h"><h3>Lo que pasó</h3><div id="wtH"></div></div></div>`);
function wtForm(){const t=$('#wtT').value,d=WTT[t];$('#wtD').textContent=d[1];$('#wtSL').hidden=!d[3];$('#wtVL').hidden=['hi52','lo52','news'].includes(t);$('#wtV').placeholder=DEF[t]!=null?String(DEF[t]):'Ej.: 200';$('#wtV').value=DEF[t]!=null?DEF[t]:'';}
$('#wtT').onchange=wtForm;wtForm();$('#wtCap').value=String(store.get('wtcap',5));$('#wtCap').onchange=e=>store.set('wtcap',+e.target.value);
$('#wtNo').checked='Notification' in window&&Notification.permission==='granted'&&store.get('wtno',false);
$('#wtNo').onchange=async e=>{if(e.target.checked){if(!('Notification' in window)){toast('Tu navegador no admite notificaciones');e.target.checked=false;return;}const r=await Notification.requestPermission();e.target.checked=r==='granted';}store.set('wtno',e.target.checked);};
$('#wtF').onsubmit=e=>{e.preventDefault();if(!member()){openAccount();return;}const t=$('#wtT').value,d=WTT[t],s=$('#wtS').value.trim().toUpperCase(),v=+$('#wtV').value||0;
 if(d[3]&&!/^[A-Z.\-]{1,10}$/.test(s)){toast('Escribe un ticker válido');return;}if(['above','below','move','earn','vol','pf','sector','fx'].includes(t)&&!(v>0)){toast('Indica un valor mayor que cero');return;}
 if(TRD.alerts.length>=lim()){toast(`Tu plan permite ${lim()} alertas. Premium amplía el límite.`,{action:{label:'Ver planes',fn:()=>premSheet()}});return;}
 if(t==='pf'&&!RPF.length){toast('Primero registra tu cartera real');return;}
 TRD.alerts.unshift({id:Date.now(),type:t,s:d[3]?s:'',v,rang:0,day:'',last:null});saveTrd();$('#wtF').reset();$('#wtT').value=t;wtForm();wtRender();toast('Alerta creada',ic('check','',false));wtCheck(true);};
function wtRender(){const L=TRD.alerts,n=L.length;$('#wtBar').innerHTML=`<span><b>${n}</b> de ${lim()} alertas</span><span>Última revisión: ${store.get('wtlast',0)?new Date(store.get('wtlast')).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'}):'—'}</span><span>Avisos hoy: ${WLOG.filter(x=>x.d===day32()).length}</span><button class="btn" id="wtNow">${ic('clock','',false)} Revisar ahora</button>`;$('#wtNow').onclick=()=>wtCheck(true);
 $('#wtL').innerHTML=n?L.map((a,i)=>`<div class="wt32a ${a.rang||a.day===day32()?'hit':''}" style="--i:${i}"><span class="wt32i">${ic(a.type==='news'?'news':a.type==='earn'?'clock':a.type==='pf'||a.type==='sector'?'diversificar':a.type==='fx'?'broker':'bell','',false)}</span><span><b>${esc(a.type==='bell'?'Campana de apertura':wtLabel(a))}</b><small>${a.rang?'Avisó el '+new Date(a.rang).toLocaleDateString('es-PE',{day:'numeric',month:'short'}):a.day?'Último aviso: '+a.day:'Vigilando'}</small></span><button class="ib" data-del="${i}" aria-label="Eliminar alerta">${ic('x','',false)}</button></div>`).join(''):'<p class="note">Aún no tienes alertas. Crea la primera a la izquierda.</p>';
 $$('#wtL [data-del]').forEach(b=>b.onclick=()=>{TRD.alerts.splice(+b.dataset.del,1);saveTrd();wtRender();});
 $('#wtH').innerHTML=WLOG.length?WLOG.slice(0,20).map((x,i)=>`<div class="wt32e" style="--i:${i}"><small>${new Date(x.t).toLocaleString('es-PE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</small><p>${esc(x.msg)}</p>${x.ctx?`<button class="btn" data-x="${i}">${ic('chat','',false)} Explicar con IA</button>`:''}</div>`).join(''):'<p class="note">Cuando una alerta se active verás aquí qué pasó y por qué.</p>';
 $$('#wtH [data-x]').forEach(b=>b.onclick=()=>{const x=WLOG[+b.dataset.x];setView('chat');setTimeout(()=>ask(`Explícame esta alerta de Watchtower y qué podría significar para mí: "${x.msg}". Datos: ${x.ctx}`),300);});}
function fire(a,msg,ctx){a.day=day32();a.lastAt=Date.now();WLOG.unshift({t:Date.now(),d:day32(),id:a.id,type:a.type,msg,ctx:ctx||''});WLOG=WLOG.slice(0,60);store.set('wtlog',WLOG);
 const today=WLOG.filter(x=>x.d===day32()).length;if(today<=store.get('wtcap',5)){toast(msg,{icon:ic('bell','',false),action:{label:'Ver',fn:()=>setView('watch')},dur:7000});
  try{if(store.get('wtno',false)&&'Notification' in window&&Notification.permission==='granted')new Notification('Lucioni Watchtower',{body:msg,icon:'/icons/icon-192.png'});}catch(e){}}}
let EARN=null;async function earnSet(days){if(EARN&&EARN.n>=days)return EARN.m;const m=new Map();const ds=[];let k=0;while(ds.length<days&&k<days*2){const d=new Date(Date.now()+k*864e5);if(d.getDay()%6)ds.push(d.toISOString().slice(0,10));k++;}
 const R=await pool30(ds,2,d=>J30(`${MKT}?earnings=${d}`,1800000));R.forEach((r,i)=>(r&&r.rows||[]).forEach(x=>{if(!m.has(x.s))m.set(x.s,ds[i]);}));EARN={n:days,m};return m;}
let busy=false;
async function wtCheck(force){if(!MKT||busy||!TRD.alerts.length||!member())return;if(!force&&Date.now()-store.get('wtlast',0)<9*60000)return;busy=true;
 try{const syms=[...new Set(TRD.alerts.filter(a=>a.s).map(a=>a.s))];await ensurePrices(syms).catch(()=>{});try{altCheck();}catch(e){}
  const today=day32(),todo=TRD.alerts.filter(a=>WT_NEW.includes(a.type)&&a.day!==today);
  await pool30(todo,3,async a=>{
   if(a.type==='hi52'||a.type==='lo52'){const d=await J30(`${MKT}?symbol=${a.s}&range=1d`,60000);const [hi,lo]=String(d.stats&&d.stats.FiftTwoWeekHighLow&&d.stats.FiftTwoWeekHighLow.v||'').split('/').map(x=>parseFloat(x.replace(/[$,]/g,'')));if(!d.p)return;
    if(a.type==='hi52'&&hi&&d.p>=hi*.998)fire(a,`${a.s} toca su máximo de 52 semanas: ${usd2(d.p)} (máximo ${usd2(hi)}).`,`Precio ${d.p}, máximo 52 semanas ${hi}, fuente Nasdaq`);
    if(a.type==='lo52'&&lo&&d.p<=lo*1.002)fire(a,`${a.s} toca su mínimo de 52 semanas: ${usd2(d.p)} (mínimo ${usd2(lo)}).`,`Precio ${d.p}, mínimo 52 semanas ${lo}, fuente Nasdaq`);}
   if(a.type==='earn'){const m=await earnSet(Math.min(10,Math.max(1,a.v||7)));const d=m.get(a.s);if(d&&a.last!==d){a.last=d;fire(a,`${a.s} presenta resultados el ${new Date(d+'T12:00').toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long'})}.`,`Calendario de resultados de Nasdaq, fecha ${d}`);}}
   if(a.type==='news'){const d=await J30(`${MKT}?news=${a.s}`,600000);const n=(d.rows||[])[0];if(n){if(a.last&&a.last!==n.u)fire(a,`Noticia nueva de ${a.s}: ${n.t}`,`Titular: ${n.t} (${n.p||'Nasdaq'}, ${n.u})`);a.last=n.u;}}
   if(a.type==='vol'){const h=await hist(a.s);if(h.length>20){const y=stats30(h),r=stats30(h.slice(-9));if(y&&r&&y.vol&&r.vol/y.vol>=a.v)fire(a,`La volatilidad de ${a.s} subió: ${(r.vol*100).toFixed(0)}% anualizada en 8 semanas frente a ${(y.vol*100).toFixed(0)}% del último año.`,`Volatilidad 8 semanas ${(r.vol*100).toFixed(1)}%, 1 año ${(y.vol*100).toFixed(1)}%, precios semanales Nasdaq`);}}
   if(a.type==='pf'&&RPF.length){await ensurePrices(RPF.map(h=>h.s)).catch(()=>{});const P=pfCalc(),V=P.rows.reduce((x,r)=>x+r.val,0),D=P.rows.reduce((x,r)=>x+r.day,0),pc=V?D/(V-D)*100:0;
    if(Math.abs(pc)>=a.v){const top=[...P.rows].sort((x,y)=>Math.abs(y.day)-Math.abs(x.day)).slice(0,3);fire(a,`Tu cartera ${pc>=0?'sube':'baja'} ${pc30(pc,2)} hoy. Lo explican sobre todo: ${top.map(r=>`${r.s} (${pc30(r.pc,1)})`).join(', ')}.`,`Variación de la cartera ${pc.toFixed(2)}%; mayores aportes ${top.map(r=>`${r.s} ${r.day.toFixed(0)} USD`).join(', ')}`);}}
   if(a.type==='sector'&&RPF.length){const P=pfCalc(),V=P.rows.reduce((x,r)=>x+r.val,0);const now=Object.fromEntries(P.sec.map(([k,v])=>[k,v/V]));const snap=store.get('wtsnap',null);
    if(snap&&snap.sec){const k=P.sec[0][0],ch=((now[k]||0)-(snap.sec[k]||0))*100;if(Math.abs(ch)>=a.v){const why=P.rows.filter(r=>r.sec===k).map(r=>{const wn=r.val/V,wo=snap.w&&snap.w[r.s]||0;return {s:r.s,d:(wn-wo)*100};}).sort((x,y)=>Math.abs(y.d)-Math.abs(x.d)).slice(0,3);
     fire(a,`Tu cartera tiene ${ch>0?'más':'menos'} concentración en ${SECES[k]||k} que hace ${Math.round((Date.now()-snap.t)/864e5)} días (${pc30(ch,1)} pts). Lo explican: ${why.map(x=>`${x.s} ${pc30(x.d,1)} pts`).join(', ')}.`,`Peso actual ${((now[k]||0)*100).toFixed(1)}%, antes ${((snap.sec[k]||0)*100).toFixed(1)}%`);}}
    if(!snap||Date.now()-snap.t>7*864e5)store.set('wtsnap',{t:Date.now(),sec:now,w:Object.fromEntries(P.rows.map(r=>[r.s,r.val/V]))});}
   if(a.type==='fx'){const d=await J30(`${MKT}?fxpen=1`,3600000);const p=d.pts||[];if(p.length>1){const l=p.at(-1),b=p.at(-2),ch=(l[1]/b[1]-1)*100,dd=new Date(l[0]).toISOString().slice(0,10);if(Math.abs(ch)>=a.v&&a.last!==dd){a.last=dd;fire(a,`El dólar ${ch>0?'sube':'baja'} ${pc30(ch,2)} frente al sol: S/ ${l[1].toFixed(3)} (BCRP, ${dd}).`,`Tipo de cambio BCRP ${b[1]} → ${l[1]}`);}}}
  });
  store.set('wtlast',Date.now());saveTrd();}
 catch(e){}finally{busy=false;if(VIEW==='watch')wtRender();}}
setTimeout(()=>{if(member())wtCheck();},9000);setInterval(()=>{if(document.visibilityState==='visible'&&member())wtCheck();},10*60000);
const _sv32=setView;setView=function(v,o){_sv32(v,o);if(v==='watch'){wtRender();wtCheck();}};
{const v=ID2V[location.hash.slice(1)];if(v==='watch')setTimeout(()=>setView(v,{noHash:true}),0);}
window.wtCheck32=wtCheck;
}
