import re
def rep(s,a,b,cnt=1):
    n=s.count(a); assert n==cnt,(a[:70],n); return s.replace(a,b)
s=open('appv2.js').read()
s=rep(s," check:['<path d=\"M5 12l5 5 9-10\"/>','']"," check:['<path d=\"M5 12l5 5 9-10\"/>',''],\n uv:['<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2\"/>','']")
s=rep(s,"const UP='#3DDC8A',DN='#FF6170';","let UP='#1D7444',DN='#AF2A1E';")
a=s.index("/* ---------- partículas de fondo ---------- */");b=s.index("/* ---------- placeholder animado ---------- */")
s=s[:a]+"""/* ---------- estado de secciones y tema ---------- */
let page='home';const VIS=new Set(['home','mkt']);function on(p){return VIS.has(p);}
const cssv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
let TH={},isUV=false;
function readTheme(){TH={ink:cssv('--ink'),ink2:cssv('--ink2'),ink3:cssv('--ink3'),line:cssv('--line'),line2:cssv('--line2'),accent:cssv('--accent'),gold:cssv('--gold'),sheet:cssv('--sheet'),well:cssv('--well'),paper:cssv('--paper'),guil:cssv('--guil'),up:cssv('--up'),down:cssv('--down'),warn:cssv('--warn'),fib:[cssv('--fib1'),cssv('--fib2'),cssv('--fib3')]};
  UP=TH.up;DN=TH.down;const dt=document.documentElement.dataset.theme;isUV=dt==='dark'||(!dt&&matchMedia('(prefers-color-scheme: dark)').matches);
  COLORS.splice(0,COLORS.length,...(isUV?['#FF6A4D','#7CF7C8','#E3C766','#8DB4FF','#FF7AC6','#B9E07A','#F2A65A','#C9B8FF']:['#B8321C','#1F6B4F','#8C6D24','#2F5D8A','#7A4E8C','#B8651E','#3F8C8C','#5E6B3F']));}
try{localStorage.removeItem('lc_theme');}catch(e){}
readTheme();
addEventListener('resize',()=>layoutT());

"""+s[b:]
s=rep(s,"  if(page!=='home')return;\n  const F=fit(cvEl)","  if(!on('mkt'))return;\n  const F=fit(cvEl)")
s=rep(s,"cx.strokeStyle='rgba(255,220,190,.06)';cx.fillStyle='#7d716a';cx.font='10px JetBrains Mono, monospace';","cx.strokeStyle=TH.line;cx.fillStyle=TH.ink2;cx.font='12px IBM Plex Mono, monospace';")
s=rep(s,"gr.addColorStop(0,up?'rgba(61,220,138,.28)':'rgba(255,97,112,.28)');gr.addColorStop(1,'rgba(0,0,0,0)');","gr.addColorStop(0,col+'38');gr.addColorStop(1,col+'00');")
s=rep(s,"cx.shadowColor=col;cx.shadowBlur=8;cx.stroke();cx.shadowBlur=0;","cx.stroke();")
s=rep(s,"cx.strokeStyle='rgba(246,203,146,.5)';","cx.strokeStyle=TH.ink3;")
s=rep(s,"cx.beginPath();cx.arc(hv.x,hv.y,4,0,7);cx.fillStyle='#F6CB92';cx.fill();","cx.beginPath();cx.arc(hv.x,hv.y,4,0,7);cx.fillStyle=TH.ink;cx.fill();")
s=rep(s,"cx.fillStyle='rgba(44,34,28,.95)';cx.beginPath();cx.roundRect?cx.roundRect(bx,0,tw,16,5):cx.rect(bx,0,tw,16);cx.fill();cx.fillStyle='#F6CB92';cx.fillText(lab,bx+6,11);","cx.fillStyle=TH.ink;cx.beginPath();cx.roundRect?cx.roundRect(bx,0,tw,18,5):cx.rect(bx,0,tw,18);cx.fill();cx.fillStyle=TH.sheet;cx.fillText(lab,bx+6,13);")
s=rep(s,"desde la apertura · pasa el dedo por el gráfico","desde la apertura")
s=rep(s,"  if(page!=='play')return;\n","  if(!on('play'))return;\n",2)
s=rep(s,"background:${p[0]==='Efectivo'?'rgba(156,143,134,.4)':COLORS[i%8]}","background:${p[0]==='Efectivo'?TH.ink3:COLORS[i%8]}")
s=rep(s,"""<span class="chip-ic b" style="color:var(--cu2);background:rgba(227,161,92,.15)">""","""<span class="chip-ic" style="color:var(--gold)">""")
s=rep(s,"x.fillStyle='rgba(156,143,134,.35)';x.fillRect(X,H-hP,w,hP);","x.fillStyle=TH.line2;x.fillRect(X,H-hP,w,hP);")
s=rep(s,"const g=x.createLinearGradient(0,H-hV,0,H-hP);g.addColorStop(0,'#F6CB92');g.addColorStop(1,'#B9733A');x.fillStyle=g;","x.fillStyle=TH.accent;")
s=rep(s,"x.globalAlpha=1;x.font='10px Inter, sans-serif';","x.globalAlpha=1;x.font='12px Archivo, sans-serif';")
s=rep(s,"x.fillStyle='rgba(44,34,28,.95)';x.beginPath();x.roundRect?x.roundRect(cx,0,tw,17,5):x.rect(cx,0,tw,17);x.fill();x.fillStyle='#F6CB92';x.fillText(t,cx+6,12);","x.fillStyle=TH.ink;x.beginPath();x.roundRect?x.roundRect(cx,0,tw,19,5):x.rect(cx,0,tw,19);x.fill();x.fillStyle=TH.sheet;x.fillText(t,cx+6,14);")
s=rep(s,"else{x.fillStyle='rgba(156,143,134,.7)';x.fillRect(4,5,9,9);x.fillText('aportado',17,13);x.fillStyle='#E3A15C';x.fillRect(72,5,9,9);x.fillText('intereses',85,13);}","else{x.fillStyle=TH.ink2;x.fillRect(4,5,10,10);x.fillText('aportado',19,14);x.fillStyle=TH.accent;x.fillRect(84,5,10,10);x.fillStyle=TH.ink2;x.fillText('intereses',99,14);}")
s=rep(s,'<path d="M20 110a90 90 0 0 1 180 0" stroke="rgba(255,255,255,.08)"','<path d="M20 110a90 90 0 0 1 180 0" stroke="${TH.well}"')
s=rep(s,'<stop offset="0" stop-color="#3DDC8A"/><stop offset=".5" stop-color="#F5B142"/><stop offset="1" stop-color="#FF6170"/>','<stop offset="0" stop-color="${TH.up}"/><stop offset=".5" stop-color="${TH.warn}"/><stop offset="1" stop-color="${TH.down}"/>')
s=rep(s,'stroke="#F6CB92" stroke-width="3" stroke-linecap="round" style="transform-origin:110px 110px;transform:rotate(-90deg);transition:transform 1.2s cubic-bezier(.34,1.4,.64,1)"/><circle cx="110" cy="110" r="6" fill="#F6CB92"/>','stroke="${TH.ink}" stroke-width="3" stroke-linecap="round" style="transform-origin:110px 110px;transform:rotate(-90deg);transition:transform 1.2s var(--ease-quint)"/><circle cx="110" cy="110" r="6" fill="${TH.ink}"/>')
s=rep(s,"font-family:var(--serif);font-size:30px;color:var(--cu2)","font-family:var(--display);font-size:34px;color:var(--accent)")
s=rep(s,"const TOOLS=['calc','goal','quiz','cmp','video'];","const TOOLS=['calc','habit','goal','quiz','cmp','video'];")
s=rep(s,"s.style.animation='pageIn .3s var(--ease-out)';if(t==='calc')calc();","s.style.animation='pane .35s var(--ease-out)';if(t==='calc')calc();if(t==='habit')habit();")
s=rep(s,'<g stroke="#E3A15C" stroke-width="6" stroke-linecap="round">','<g stroke="currentColor" stroke-width="6" stroke-linecap="round">')
s=rep(s,'<circle cx="55" cy="55" r="${R}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="14"/>${segs}<text x="55" y="52" text-anchor="middle" fill="#9C8F86" font-size="9" font-family="Inter">activos</text><text x="55" y="67" text-anchor="middle" fill="#F6CB92" font-size="17" font-weight="700" font-family="JetBrains Mono">${p.length}</text>',
 '<circle cx="55" cy="55" r="${R}" fill="none" stroke="${TH.well}" stroke-width="14"/>${segs}<text x="55" y="52" text-anchor="middle" fill="${TH.ink2}" font-size="10" font-family="Archivo, sans-serif">activos</text><text x="55" y="68" text-anchor="middle" fill="${TH.ink}" font-size="18" font-weight="600" font-family="IBM Plex Mono, monospace">${p.length}</text>')
s=rep(s,"color:s==='Efectivo'?'#9C8F86':COLORS[i%8]","color:s==='Efectivo'?TH.ink3:COLORS[i%8]")
s=rep(s,"color:'#9C8F86'},{t:'Intereses'","color:TH.ink3},{t:'Intereses'")
s=rep(s,"color:'#E3A15C'}]","color:TH.accent}]")
s=rep(s,"LCVideo.mount($('#player'),videoProps());","LCVideo.mount($('#player'),{...videoProps(),pal:{bg:TH.paper,panel:TH.sheet,txt:TH.ink,mut:TH.ink2,cu:TH.accent,cu2:TH.ink,cu3:TH.gold,up:TH.up,down:TH.down,guil:TH.guil,line:TH.line}});")
a=s.index("function render(d,quiet){");b=s.index("/* ---- comparador ---- */")
s=s[:a]+open('render3.js').read()+s[b:]
s=rep(s,"m.scrollIntoView({behavior:'smooth',block:'end'});","ch.scrollTop=ch.scrollHeight;",2)
a=s.index("$('#flips').innerHTML=");b=s.index("/* ================= ACADEMIA: ¿Sube o baja? ================= */")
s=s[:a]+"""$('#flips').innerHTML=TERMS.map(([e,t,d])=>`<details class="term"><summary>${ic(e,'',false)}${t}</summary><p>${d} <button class="btn" style="margin-top:8px" data-t="${t}">Pregúntale al asesor ${ic('right','',false)}</button></p></details>`).join('');
$$('.term .btn').forEach(b=>b.onclick=()=>{go('chat');ask('Explícame con un ejemplo qué es: '+b.dataset.t);});

"""+s[b:]
s=rep(s,"function gDraw(){if(page==='learn')","function gDraw(){if(on('learn'))")
s=rep(s,'<circle cx="23" cy="23" r="20" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="4"/>','<circle cx="23" cy="23" r="20" fill="none" stroke="${TH.well}" stroke-width="4"/>')
s=rep(s,"function renderPulse(){const v=fgCalc();if(page!=='home')return;","function renderPulse(){const v=fgCalc();if(!on('mkt'))return;")
s=rep(s,"t.style.backgroundColor=v>=0?`rgba(46,${150+a*60|0},${100+a*20|0},${.25+a*.6})`:`rgba(${200+a*40|0},70,85,${.25+a*.6})`;","t.style.backgroundColor=`color-mix(in oklab, var(${v>=0?'--up':'--down'}) ${Math.round(10+a*38)}%, var(--sheet))`;")
s=rep(s,"const FGL=[[20,'Miedo extremo',DN],[40,'Miedo','#FF8A6B'],[60,'Neutral','#F5B142'],[80,'Codicia','#9BE07A'],[101,'Codicia extrema',UP]];","const FGL=[[20,'Miedo extremo','var(--down)'],[40,'Miedo','var(--down)'],[60,'Neutral','var(--warn)'],[80,'Codicia','var(--up)'],[101,'Codicia extrema','var(--up)']];")
s=rep(s,"  if(page==='play'){$('#dMe')","  if(on('play')){$('#dMe')")
s=rep(s,"if(page!=='learn'||/INPUT","if(!on('learn')||/INPUT")
s=rep(s,"const RC={Bajo:UP,Medio:'#F5B142',Alto:DN};","const RC={Bajo:'var(--up)',Medio:'var(--warn)',Alto:'var(--down)'};")
s=rep(s,'<span class="bl" style="background:${b[2]}">','<span class="bl">')
s=rep(s,'<span class="stamp yes">ME INTERESA</span><span class="stamp no">PASO</span><span class="stamp buy">COMPRAR</span>','<span class="stampd yes">ME INTERESA</span><span class="stampd no">PASO</span><span class="stampd buy">COMPRAR</span>')
s=rep(s,"const st=e=>el.querySelector('.stamp.'+e);","const st=e=>el.querySelector('.stampd.'+e);")
s=rep(s,"el.querySelectorAll('.stamp').forEach","el.querySelectorAll('.stampd').forEach")
s=rep(s,'<div class="dq"><b>Dato</b>${q}</div>','<div class="dq"><b>Dato:</b> ${q}</div>')
s=rep(s,'<span class="badge" style="color:${RC[r]};border-color:${RC[r]}66">Riesgo ${r}</span>','<span class="badge" style="color:${RC[r]};border-color:currentColor">Riesgo ${r}</span>')
s=rep(s,"if(page==='play'&&tick%3===0)","if(on('play')&&tick%3===0)")
s=rep(s,"if(page==='tools'){drawCalc();}if(page==='learn')gDraw();}","if(on('tools')){drawCalc();}if(on('learn'))gDraw();}")
s=rep(s,"[['home','Invertir con IA','accion'],['play','Modo práctica','buy'],['tools','Herramientas','calc'],['chat','Asesor IA','chat'],['learn','Academia','cap']]","[['home','Tu plan','accion'],['mkt','Mercado en vivo','alcista'],['play','Práctica','buy'],['tools','Herramientas','calc'],['learn','Aprende','cap'],['chat','Asesor','chat']]")
s=rep(s,"[['calc','Calculadora de interés compuesto','compuesto'],","[['calc','Calculadora de interés compuesto','compuesto'],['habit','El costo del antojo','dividendo'],")
s=rep(s,"f:()=>{go('home');pickSym(s);}","f:()=>{go('mkt');pickSym(s);}")
s=rep(s,"if(!tradable.includes(s)){pickSym(s);go('home');return;}","if(!tradable.includes(s)){pickSym(s);go('mkt');return;}")
s=rep(s,"f:()=>{go('home');shockAll(-1);}","f:()=>{go('mkt');shockAll(-1);}")
s=rep(s,"f:()=>{go('home');shockAll(1);}","f:()=>{go('mkt');shockAll(1);}")
s=rep(s," {g:'Acciones',n:'Simular crisis del mercado'"," {g:'Acciones',n:'Abrir el menú de todo lo que incluye',i:'cap',k:'menu logo',f:()=>openMenu()},\n {g:'Acciones',n:'Simular crisis del mercado'")
s=rep(s,"if(dir<0){document.body.classList.remove('quake')","if(dir<0&&!RM){document.body.classList.remove('quake')")
s=rep(s,"  UP=TH.up;DN=TH.down;const dt=","  const ms=document.getElementById('mercado');if(ms){const g=getComputedStyle(ms),v=n=>g.getPropertyValue(n).trim();THM={ink:v('--ink'),ink2:v('--ink2'),ink3:v('--ink3'),line:v('--line'),sheet:v('--sheet'),up:v('--up'),down:v('--down')};}\n  UP=TH.up;DN=TH.down;const dt=")
s=rep(s,"let TH={},isUV=false;","let TH={},THM={},isUV=false;")
a=s.index("function drawMain(){");b=s.index("function updQuotes(){")
dm=s[a:b].replace("TH.","THM.").replace("?UP:DN","?THM.up:THM.down")
s=s[:a]+dm+s[b:]
p3=open('part3.js').read()
a=p3.index("const cssv=n=>");b=p3.index("let isUV=false;\n")+len("let isUV=false;\n")
p3=p3[:a]+p3[b:]
p3=rep(p3,"const t0=store.get('theme',null);if(t0)document.documentElement.dataset.theme=t0;\n","")
p3=rep(p3,"const VIS=new Set(['home','mkt']);\nfunction on(p){return VIS.has(p);}\n","")

s=rep(s,"/* ================= BUCLE PRINCIPAL ================= */",p3+"\n/* ================= BUCLE PRINCIPAL ================= */")
s=rep(s,"renderLvl();renderMis();deckRender();renderPulse();renderDuel();","renderLvl();renderMis();deckRender();renderPulse();renderDuel();\napplyTheme();animRos();updBill();updSerial();habit();markNav();")
for bad in ["page!==","page===","$('#hello')","moveInd","#tabs"]:
    for m in re.finditer(re.escape(bad),s): print('LEFT',bad,'::',s[m.start()-50:m.start()+50].replace('\n',' '))
s=rep(s,"function trade(s,dir,n=1,via){","function trade(s,dir,n=1,via,quiet){")
s=rep(s,"  toast(`${via?via+': ':''}${dir>0?'Compraste':'Vendiste'}","  if(!quiet)toast(`${via?via+': ':''}${dir>0?'Compraste':'Vendiste'}")
s=rep(s,"  (dir>0?SFX.buy:SFX.sell)();","  if(!quiet)(dir>0?SFX.buy:SFX.sell)();")
s=rep(s," {g:'Acciones',n:'Abrir el menú de todo lo que incluye'"," {g:'Acciones',n:'Ver mi resumen en historias',i:'play',k:'stories resumen',f:()=>openStory()},{g:'Acciones',n:'Piloto automático (DCA)',i:'clock',k:'dca automatico',f:()=>{go('play');setTimeout(()=>$('#pilot').scrollIntoView({block:'center'}),450);}},{g:'Acciones',n:'Salud de tu cartera',i:'stop',k:'puntaje diversificacion',f:()=>{go('play');setTimeout(()=>$('#health').scrollIntoView({block:'center'}),450);}},\n {g:'Acciones',n:'Abrir el menú de todo lo que incluye'")
s=rep(s," {g:'Acciones',n:'Ver mi resumen en historias'"," {g:'Herramientas',n:'Alcancía (meta de ahorro)',i:'dividendo',k:'ahorro meta',f:()=>{go('tools');tool('jar');}},{g:'Herramientas',n:'Soles y dólares',i:'broker',k:'tipo de cambio conversor',f:()=>{go('tools');tool('fx');}},{g:'Herramientas',n:'Trivia de bolsa',i:'bolt',k:'quiz preguntas',f:()=>{go('learn');setTimeout(()=>$('#triv').scrollIntoView({block:'center'}),450);}},{g:'Acciones',n:'Diario de inversión',i:'news',k:'notas',f:()=>{go('play');setTimeout(()=>$('#diary').scrollIntoView({block:'center'}),450);}},\n {g:'Acciones',n:'Ver mi resumen en historias'")
s=rep(s," {g:'Acciones',n:'Ver mi resumen en historias'"," {g:'Acciones',n:'Mi cuenta (crear o ver)',i:'hello',k:'perfil sesion registro login',f:()=>{ACCOFF?signIn():openAccount();}},\n {g:'Acciones',n:'Ver mi resumen en historias'")
s=rep(s," {g:'Acciones',n:'Mi cuenta (crear o ver)'"," {g:'Acciones',n:'Ver la pantalla de bienvenida',i:'hello',k:'inicio menu principal',f:()=>gateOpen()},\n {g:'Acciones',n:'Mi cuenta (crear o ver)'")
s=rep(s,"  try{sample=await claude.use('sample');}catch(e){sample=null;}\n  if(sample){$('#aiDot').classList.add('on');$('#aiTxt').textContent='IA activa';}else $('#aiTxt').textContent='IA no disponible aquí';","""  if(window.claude&&claude.use){try{sample=await claude.use('sample');}catch(e){sample=null;}}
  if(!sample&&window.LC_API){let st=null;try{st=await fetch(LC_API,{cache:'no-store'}).then(r=>r.json());}catch(e){}
    if(st&&st.hasKey){sample=async(input,opts={})=>{let r;try{r=await fetch(LC_API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({input}),signal:opts.signal});}catch(e){throw {code:'network',message:'Sin conexión'};}
      const d=await r.json().catch(()=>({}));if(!r.ok)throw {code:d.code||'error',message:d.message||''};if(opts.onText)opts.onText({text:d.text,delta:d.text});return {text:d.text||'',truncated:false};};
      $('#aiDot').classList.add('on');$('#aiTxt').textContent='IA activa · Gemini';return;}
    $('#aiTxt').textContent=st?'Falta configurar la clave de Gemini':'IA sin conexión';return;}
  if(sample){$('#aiDot').classList.add('on');$('#aiTxt').textContent='IA activa';}else $('#aiTxt').textContent='IA no disponible aquí';""")
s=rep(s,"const noAI='<div class=\"card err\">La IA funciona cuando abres esta app dentro de Claude.</div>';","const noAI=`<div class=\"card err\">${window.LC_API?'La IA no está disponible ahora. Intenta en un momento.':'La IA funciona cuando abres esta app dentro de Claude.'}</div>`;")
s=rep(s,"`<div class=\"msg a\">La IA funciona cuando abres esta app dentro de Claude.</div>`","`<div class=\"msg a\">${window.LC_API?'La IA no está disponible ahora. Intenta en un momento.':'La IA funciona cuando abres esta app dentro de Claude.'}</div>`")
s=rep(s,"[['Si va mal',s.pesimista],['Lo esperable',s.base],['Si va bien',s.optimista]]","[['Escenario pesimista',s.pesimista],['Escenario base',s.base],['Escenario optimista',s.optimista]]")
s=rep(s,"2) Arma una cartera diversificada de 4 a 6 acciones y/o ETFs reales (EE.UU. y/o Bolsa de Valores de Lima).","2) Arma una cartera diversificada de 4 a 6 instrumentos reales (ETFs de bajo costo, acciones de EE.UU. y/o de la Bolsa de Valores de Lima) con una mezcla de renta variable, renta fija y efectivo coherente con el perfil y el plazo; prioriza ETFs amplios para montos pequeños o plazos cortos. En \"razon\" menciona el rol del activo en la cartera y, si lo conoces, su ratio de gastos aproximado.")
s=rep(s,"const sys='Eres el asesor de la app Lucioni Capital. Respondes en español, claro y breve (máx 120 palabras), para principiantes, muchas veces en Perú.","const sys='Eres el asistente de inversión de Lucioni Capital, una herramienta educativa. Respondes en español, con precisión y lenguaje profesional pero claro (máx 140 palabras), para inversionistas en Perú.")
s=rep(s,"{g:'Acciones',n:'Simular crisis del mercado'","{g:'Herramientas',n:'Proyección Monte Carlo',i:'volatilidad',k:'probabilidad escenarios',f:()=>{go('tools');tool('mc');}},{g:'Herramientas',n:'Rebalanceo de cartera',i:'diversificar',k:'asignacion objetivo',f:()=>{go('tools');tool('reb');}},{g:'Herramientas',n:'Impacto de comisiones',i:'dividendo',k:'ratio de gastos fondo etf',f:()=>{go('tools');tool('fee');}},{g:'Herramientas',n:'Prueba de estrés de mi cartera',i:'bajista',k:'2008 2020 2022 riesgo',f:()=>{go('play');setTimeout(()=>$('#stress').scrollIntoView({block:'center'}),450);}},\n {g:'Acciones',n:'Simular crisis del mercado'")
s=rep(s," {g:'Acciones',n:'Mi cuenta (crear o ver)'"," {g:'Ir a',n:'Empresas en vivo (600+)',i:'accion',k:'acciones cotizaciones bolsa precios',f:()=>setView('stocks')},\n {g:'Acciones',n:'Mi cuenta (crear o ver)'")
open('appv3.js','w').write(s)
h=open('part1v3.html').read()
h=h.replace("Hecho por Lucioni Enterprises · Lima","Hecho por Lucioni Enterprises")
h=h.replace("  --r:14px;","  --cu:var(--accent); --cu2:var(--accent); --cu3:var(--gold); --mut:var(--ink2); --soft:var(--ink); --txt:var(--ink); --serif:var(--display);\n  --r:14px;")
def fix(m):
    tag=m.group(0)
    vars_=re.findall(r'\s(stroke|fill)="(var\([^)]*\))"',tag)
    if not vars_: return tag
    tag=re.sub(r'\s(stroke|fill)="var\([^)]*\)"','',tag)
    st=';'.join(f'{k}:{v}' for k,v in vars_)
    if 'style="' in tag: return tag.replace('style="','style="'+st+';',1)
    end='/>' if tag.endswith('/>') else '>'
    return tag[:-len(end)]+f' style="{st}"'+end
h=re.sub(r'<(?:circle|path|line|text)\b[^>]*>',fix,h)
open('part1v3b.html','w').write(h)
b=open('bundle.js').read()
open('lucioni-capital.html','w').write(h+'\n<script>\n'+b+'\n</script>\n<script>\n'+s+'\n</script>\n')
