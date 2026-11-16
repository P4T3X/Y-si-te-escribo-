/* ===================== V36: Economía global (Fase 4) — FMI, BIS, Tesoro de EE.UU., OCDE, Reserva Federal y FRED ===================== */
(()=>{
const {J30,lines30,cls30,C30}=window.L30;
const MAC=MKT?MKT.replace(/market$/,'macro'):null;
const FLAG=id=>id==='EA'?'🇪🇺':String.fromCodePoint(...[...id].map(c=>127397+c.charCodeAt(0)));
const nf=(v,d=1)=>v==null||!isFinite(v)?'—':v.toLocaleString('es-PE',{minimumFractionDigits:d,maximumFractionDigits:d});
const MES=['ene','feb','mar','abr','may','jun','jul','ago','set','oct','nov','dic'];
const fd=s=>{if(!s)return '—';const [y,m,d]=String(s).split('-');return d?`${+d} ${MES[+m-1]} ${y}`:m?`${MES[+m-1]} ${y}`:y;};
const ppt=v=>v==null?'—':(v>0?'+':'')+nf(v,2)+' pp';
/* formato según la unidad del indicador */
function fv(k,v){if(v==null)return '—';if(k==='gdpusd'||k==='causd'){const a=Math.abs(v);return (v<0?'−':'')+'US$ '+(a>=1000?nf(a/1000,2)+' bill.':nf(a,0)+' mil M');}if(k==='gdppc')return 'US$ '+nf(v,0);return nf(v,1)+'%';}
const TABS=[['sum','Resumen'],['cmp','Comparar países'],['cb','Bancos centrales'],['yc','Curva de rendimientos'],['conf','Confianza y ciclo'],['cal','Calendario'],['us','EE.UU. mensual']];
const EC={tab:store.get('ecT','sum'),c:store.get('ecC','PE'),k:store.get('ecK','inf'),cmp:store.get('ecCmp',['PE','US','CL','CO','MX']),mode:'obs',span:20,cm:'LI',cc:store.get('ecCC',['US','EA','CN','MX','BR']),D:{}};
if(!TABS.some(t=>t[0]===EC.tab))EC.tab='sum';
const src=(d,extra='')=>d?`<p class="ec36src">${ic('news','',false)}<span>Fuente: <a href="${esc(d.url||'#')}" target="_blank" rel="noopener">${esc(d.src)}</a>${d.freq?` · ${esc(d.freq)}`:''}${d.unit?` · ${esc(d.unit)}`:''}${extra}</span></p>`:'';
const errBox=(m,k)=>`<div class="ec36err"><p>${esc(m||'La fuente oficial no respondió en este momento.')}</p><button class="btn" data-retry="${k}">Reintentar</button></div>`;
const sk=n=>`<div class="ec36sk">${'<i></i>'.repeat(n)}</div>`;

/* Carga con caché por sección; los errores se muestran, no se rellenan con datos falsos. */
const URLS={panel:'?panel=1',rates:'?rates=1',curve:'?curve=1',conf:'?conf=1',cal:'?cal=1',us:'?us=1'};
async function get(k,force){if(!MAC)throw {error:'Disponible en la versión web.'};if(force){delete EC.D[k];C30.delete(MAC+URLS[k]);}if(EC.D[k])return EC.D[k];const d=await J30(MAC+URLS[k],3600000,30000);if(d.error)throw d;return EC.D[k]=d;}

const sec=mkView30('macro','economia','Economía global',`<div class="sh"><div><h2>Economía <em>global</em></h2><p>Inflación, crecimiento, empleo, deuda, tasas de los bancos centrales, curva de rendimientos, confianza y calendario. Cada dato muestra su fuente oficial, fecha, unidad y frecuencia.</p></div></div>
 <div class="ec36tabs" role="tablist" id="ecTabs">${TABS.map(([k,l])=>`<button role="tab" data-t="${k}" aria-selected="${k===EC.tab}" class="${k===EC.tab?'on':''}">${l}</button>`).join('')}</div>
 <div id="ecBody" class="ec36"></div>
 <p class="note ec36disc">Información educativa con datos públicos oficiales. Las cifras anuales del FMI para el año en curso y siguientes son estimaciones o proyecciones del World Economic Outlook y se revisan dos veces al año. No es asesoría financiera.</p>`);
$('#ecTabs').onclick=e=>{const b=e.target.closest('button[data-t]');if(!b)return;EC.tab=b.dataset.t;store.set('ecT',EC.tab);$$('#ecTabs button').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-selected',on);});b.scrollIntoView({block:'nearest',inline:'nearest',behavior:RM?'auto':'smooth'});render();};
$('#ecBody').addEventListener('click',e=>{const r=e.target.closest('[data-retry]');if(r){get(r.dataset.retry,true).catch(()=>{}).finally(render);}});

function render(){const B=$('#ecBody');if(!B)return;if(!MAC){B.innerHTML='<div class="panel"><p class="note">Economía global usa datos oficiales en vivo y está disponible en la versión web: lucioni-capital.vercel.app</p></div>';return;}
 ({sum:rSum,cmp:rCmp,cb:rCB,yc:rYC,conf:rConf,cal:rCal,us:rUS})[EC.tab]();}

const countrySel=(id,val,list)=>`<select class="f" id="${id}" aria-label="País">${list.map(c=>`<option value="${c.id}" ${c.id===val?'selected':''}>${FLAG(c.id)} ${esc(c.name)}</option>`).join('')}</select>`;
const COUNTRIES=()=>EC.D.panel?.countries||[];
const nameOf=id=>(COUNTRIES().find(c=>c.id===id)||{name:id}).name;

/* ---------------- RESUMEN POR PAÍS ---------------- */
async function rSum(){const B=$('#ecBody');B.innerHTML=`<div class="panel">${sk(8)}</div>`;
 const [P,R,CF]=await Promise.allSettled([get('panel'),get('rates'),get('conf')]);if(EC.tab!=='sum')return;
 if(P.status!=='fulfilled'){B.innerHTML=`<div class="panel">${errBox(P.reason?.error,'panel')}</div>`;return;}
 const p=P.value,c=EC.c,cs=p.countries;
 const rank=k=>{const I=p.indicators.find(i=>i.k===k);if(!I||!I.values[c])return '';const arr=Object.entries(I.values).filter(([,v])=>v.v!=null).sort((a,b)=>b[1].v-a[1].v);const i=arr.findIndex(([id])=>id===c);return i<0?'':`${i+1}.º de ${arr.length}`;};
 const cards=p.indicators.map((I,i)=>{const v=I.values[c];if(I.error)return `<div class="ec36k" style="--i:${i}"><small>${esc(I.name)}</small><b>—</b><span class="note">La fuente no respondió</span></div>`;if(!v)return `<div class="ec36k off" style="--i:${i}"><small>${esc(I.name)}</small><b>—</b><span class="note">Sin dato para ${esc(nameOf(c))}</span></div>`;
  return `<button class="ec36k" style="--i:${i}" data-k="${I.k}" title="Comparar ${esc(I.name)} entre países"><small>${esc(I.name)}</small><b class="mono">${fv(I.k,v.v)}</b><span>${v.y} · ${esc(I.unit)}</span>${v.est!=null?`<span class="ec36est">Estimación ${v.estY}: <b class="mono">${fv(I.k,v.est)}</b></span>`:''}<span class="ec36rk">${rank(I.k)}</span></button>`;}).join('');
 let cb='';if(R.status==='fulfilled'){const bis=R.value.rows.find(r=>r.countries.includes(c));if(bis)cb=`<div class="panel ec36cb"><div class="ph30"><h3>Tasa de política monetaria</h3><small>${esc(bis.bank)}</small></div><div class="ec36big"><b class="mono">${nf(bis.rate,2)}%</b><span>al ${fd(bis.date)}${bis.stale?' · <em class="dn">la fuente no publica datos recientes</em>':''}</span></div>
  <p>${bis.lastChange?`Último movimiento: <b class="${bis.lastChange.to>bis.lastChange.from?'dn':'up'}">${bis.lastChange.to>bis.lastChange.from?'subió':'bajó'} ${nf(Math.abs(bis.lastChange.to-bis.lastChange.from),2)} pp</b> en ${fd(bis.lastChange.date)} (de ${nf(bis.lastChange.from,2)}% a ${nf(bis.lastChange.to,2)}%).`:'Sin cambios en los últimos 3 años.'}${bis.yAgo!=null?` Hace un año: ${nf(bis.yAgo,2)}%.`:''}</p>
  ${read(p,bis,c)}${src(R.value)}</div>`;}else cb=`<div class="panel">${errBox(R.reason?.error,'rates')}</div>`;
 let cf='';if(CF.status==='fulfilled'){const ms=CF.value.measures.map(m=>{const s=m.series[c];if(!s||!s.length)return null;const l=s[s.length-1],b=s[Math.max(0,s.length-4)];return `<div class="ec36k"><small>${esc(m.name)}</small><b class="mono">${nf(l[1],1)}</b><span>${fd(l[0])} · ${l[1]>=100?'sobre':'bajo'} su promedio</span><span class="${cls30(l[1]-b[1])}">${l[1]-b[1]>=0?'▲':'▼'} ${nf(Math.abs(l[1]-b[1]),1)} en 3 meses</span></div>`;}).filter(Boolean);
  cf=ms.length?`<div class="panel"><div class="ph30"><h3>Confianza y ciclo</h3><small>Índices mensuales, 100 = promedio histórico</small></div><div class="ec36g">${ms.join('')}</div>${src(CF.value)}</div>`:`<div class="panel"><h3>Confianza y ciclo</h3><p class="note">La OCDE no publica estos indicadores para ${esc(nameOf(c))}.</p></div>`;}
 B.innerHTML=`<div class="panel ec36head"><label class="ec36lab">País o región${countrySel('ecC',c,cs)}</label><span class="ec36flag" aria-hidden="true">${FLAG(c)}</span></div>
  <div class="panel"><div class="ph30"><h3>Indicadores anuales</h3><small>Toca uno para comparar entre países</small></div><div class="ec36g">${cards}</div>${src({src:'FMI · World Economic Outlook (DataMapper)',url:'https://www.imf.org/external/datamapper/',freq:'Anual, actualizado en abril y octubre'},` · consultado ${fd(p.asOf.slice(0,10))}`)}</div>
  <div class="fn33g">${cb}${cf}</div>`;
 $('#ecC').onchange=e=>{EC.c=e.target.value;store.set('ecC',EC.c);rSum();};
 $$('#ecBody .ec36k[data-k]').forEach(b=>b.onclick=()=>{EC.k=b.dataset.k;store.set('ecK',EC.k);if(!EC.cmp.includes(c)){EC.cmp=[c,...EC.cmp].slice(0,6);store.set('ecCmp',EC.cmp);}EC.tab='cmp';store.set('ecT','cmp');$$('#ecTabs button').forEach(x=>{x.classList.toggle('on',x.dataset.t==='cmp');x.setAttribute('aria-selected',x.dataset.t==='cmp');});render();});}
/* Lectura con reglas fijas a partir de los datos mostrados (no es IA ni una recomendación). */
function read(p,bis,c){const inf=p.indicators.find(i=>i.k==='inf')?.values[c];if(!inf)return '';const ref=inf.est!=null?inf.est:inf.v,yr=inf.est!=null?inf.estY:inf.y,real=bis.rate-ref;
 const t=real>1.5?'restrictiva: la tasa supera con holgura a la inflación esperada':real>0?'moderadamente restrictiva':real>-1?'cercana a neutral':'expansiva: la tasa está por debajo de la inflación';
 return `<div class="ec36read"><b>Lectura rápida</b><p>Tasa real aproximada: <b class="mono">${nf(real,1)} pp</b> (tasa de ${nf(bis.rate,2)}% menos inflación ${inf.est!=null?'estimada':'observada'} de ${nf(ref,1)}% en ${yr}). La política monetaria luce ${t}.</p><small>Cálculo de Lucioni con los datos de esta página; es una aproximación, no un pronóstico.</small></div>`;}

/* ---------------- COMPARAR PAÍSES ---------------- */
async function rCmp(){const B=$('#ecBody');B.innerHTML=`<div class="panel">${sk(10)}</div>`;let p;try{p=await get('panel');}catch(e){B.innerHTML=`<div class="panel">${errBox(e.error,'panel')}</div>`;return;}if(EC.tab!=='cmp')return;
 const I=p.indicators.find(i=>i.k===EC.k)||p.indicators[0];EC.k=I.k;const cats=[...new Set(p.indicators.map(i=>i.cat))];
 const rows=Object.entries(I.values).map(([id,v])=>({id,val:EC.mode==='est'?v.est:v.v,y:EC.mode==='est'?v.estY:v.y})).filter(r=>r.val!=null).sort((a,b)=>b.val-a.val);
 const mx=Math.max(...rows.map(r=>Math.abs(r.val)),1e-9),neg=rows.some(r=>r.val<0);
 B.innerHTML=`<div class="panel"><div class="ec36bar"><label class="ec36lab">Indicador<select class="f" id="ecK">${cats.map(ct=>`<optgroup label="${esc(ct)}">${p.indicators.filter(i=>i.cat===ct).map(i=>`<option value="${i.k}" ${i.k===I.k?'selected':''}>${esc(i.name)}</option>`).join('')}</optgroup>`).join('')}</select></label>
  <div class="tb30" id="ecMode"><button data-m="obs" class="${EC.mode==='obs'?'on':''}">Último dato</button><button data-m="est" class="${EC.mode==='est'?'on':''}">Estimación ${I.projFrom||''}</button></div>
  <button class="btn" id="ecCsv">Descargar CSV</button></div>
  <h3 class="ec36h">${esc(I.name)} <small>${esc(I.unit)}</small></h3>
  ${I.error?errBox(I.error,'panel'):`<div class="ec36rank${neg?' neg':''}" id="ecRank">${rows.map((r,i)=>`<button class="ec36row ${EC.cmp.includes(r.id)?'sel':''}" data-c="${r.id}" style="--i:${i}" aria-pressed="${EC.cmp.includes(r.id)}"><span class="ec36n">${FLAG(r.id)} ${esc(nameOf(r.id))}</span><span class="ec36b"><i class="${r.val<0?'dn':'up'}" style="--w:${(Math.abs(r.val)/mx*(neg?50:100)).toFixed(2)}%"></i></span><b class="mono">${fv(I.k,r.val)}</b><small>${r.y}</small></button>`).join('')}</div>
  <p class="note">Toca un país para agregarlo o quitarlo del gráfico histórico (máximo 6).</p>`}
  ${src(I)}</div>
  <div class="panel"><div class="ph30"><h3>Evolución histórica</h3><div class="tb30" id="ecSpan">${[[10,'10 años'],[20,'20 años'],[40,'Todo']].map(([n,l])=>`<button data-n="${n}" class="${EC.span===n?'on':''}">${l}</button>`).join('')}</div></div>
  <div class="ec36chips" id="ecChips">${EC.cmp.map((id,i)=>`<span class="ec36chip" style="--c:${COL[i%COL.length]}">${FLAG(id)} ${esc(nameOf(id))}<button data-x="${id}" aria-label="Quitar ${esc(nameOf(id))}">×</button></span>`).join('')}</div>
  <div id="ecHist">${sk(1)}</div></div>`;
 $('#ecK').onchange=e=>{EC.k=e.target.value;store.set('ecK',EC.k);rCmp();};
 $('#ecMode').onclick=e=>{const b=e.target.closest('button');if(!b)return;EC.mode=b.dataset.m;rCmp();};
 $('#ecSpan').onclick=e=>{const b=e.target.closest('button');if(!b)return;EC.span=+b.dataset.n;$$('#ecSpan button').forEach(x=>x.classList.toggle('on',x===b));hist(I);};
 const tog=id=>{EC.cmp=EC.cmp.includes(id)?EC.cmp.filter(x=>x!==id):[...EC.cmp,id].slice(-6);store.set('ecCmp',EC.cmp);rCmp();};
 $$('#ecRank .ec36row').forEach(b=>b.onclick=()=>tog(b.dataset.c));$$('#ecChips [data-x]').forEach(b=>b.onclick=()=>tog(b.dataset.x));
 $('#ecCsv').onclick=()=>{const L=[['pais','indicador','unidad','anio','valor','tipo','fuente'].join(',')];Object.entries(I.values).forEach(([id,v])=>{L.push([nameOf(id),I.name,I.unit,v.y,v.v,'observado',I.src].map(x=>`"${String(x).replace(/"/g,'""')}"`).join(','));if(v.est!=null)L.push([nameOf(id),I.name,I.unit,v.estY,v.est,'estimacion FMI',I.src].map(x=>`"${String(x).replace(/"/g,'""')}"`).join(','));});
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+L.join('\n')],{type:'text/csv'}));a.download=`lucioni-${I.k}-${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);};
 requestAnimationFrame(()=>$('#ecRank')?.classList.add('in'));hist(I);}
const COL=['var(--em)','var(--gold)','#8FA9D6','#D9A07A','#C4A1CF','#7CC4B8'];
async function hist(I){const H=$('#ecHist');if(!H)return;if(!EC.cmp.length){H.innerHTML='<p class="note">Elige al menos un país.</p>';return;}
 let d;try{d=await J30(`${MAC}?hist=${I.k}&c=${EC.cmp.join(',')}`,3600000,30000);if(d.error)throw d;}catch(e){H.innerHTML=errBox(e.error,'panel');return;}if(!$('#ecHist'))return;
 const y1=new Date().getFullYear()+(EC.mode==='est'?5:1),y0=y1-EC.span;
 const S=EC.cmp.map((id,i)=>({id,color:COL[i%COL.length],pts:(d.series[id]||[]).filter(p=>p[0]>=y0&&p[0]<=y1)})).filter(s=>s.pts.length>1);
 H.innerHTML=S.length?chartY(S,d.projFrom,I.k)+`<p class="note">La parte punteada (desde ${d.projFrom}) son estimaciones y proyecciones del FMI.</p>`:'<p class="note">Sin historial para esta selección.</p>';}
/* Gráfico anual con tramo proyectado punteado y línea de cero */
function chartY(S,pf,k){const W=680,H=260,pl=8,pr=58,pt=12,pb=24;const xs=S.flatMap(s=>s.pts.map(p=>p[0])),ys=S.flatMap(s=>s.pts.map(p=>p[1]));const x0=Math.min(...xs),x1=Math.max(...xs);let y0=Math.min(...ys),y1=Math.max(...ys);if(y0===y1){y0-=1;y1+=1;}const pad=(y1-y0)*.08;y0-=pad;y1+=pad;
 const X=x=>pl+(x-x0)/((x1-x0)||1)*(W-pl-pr),Y=y=>pt+(1-(y-y0)/(y1-y0))*(H-pt-pb);
 const path=pts=>pts.map((p,j)=>(j?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join('');
 const g=[0,.25,.5,.75,1].map(f=>{const v=y0+(y1-y0)*f;return `<line class="g30" x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="t30" x="${W-pr+6}" y="${Y(v)+4}">${k==='gdpusd'||k==='causd'?nf(v/1000,1)+' b':k==='gdppc'?nf(v/1000,0)+' k':nf(v,1)}</text>`;}).join('');
 const step=Math.max(1,Math.ceil((x1-x0)/6)),xl=[];for(let x=x0;x<=x1;x+=step)xl.push(x);
 const zero=y0<0&&y1>0?`<line class="ec36z" x1="${pl}" x2="${W-pr}" y1="${Y(0)}" y2="${Y(0)}"/>`:'';
 const pfx=pf&&pf>x0&&pf<=x1?`<rect class="ec36pj" x="${X(pf-1)}" y="${pt}" width="${X(x1)-X(pf-1)}" height="${H-pt-pb}"/><text class="t30" x="${X(pf-1)+4}" y="${pt+10}">proyección</text>`:'';
 return `<svg class="l30 ec36ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución histórica">${pfx}${g}${zero}${xl.map(x=>`<text class="t30" x="${X(x)}" y="${H-6}" text-anchor="middle">${x}</text>`).join('')}
  ${S.map((s,i)=>{const a=s.pts.filter(p=>!pf||p[0]<pf),b=s.pts.filter(p=>pf&&p[0]>=pf-1);const l=s.pts[s.pts.length-1];return `<path class="ln30" pathLength="1" style="stroke:${s.color};animation-delay:${i*90}ms" d="${path(a)}"/>${b.length>1?`<path class="ec36dash" style="stroke:${s.color}" d="${path(b)}"/>`:''}<circle cx="${X(l[0])}" cy="${Y(l[1])}" r="3" style="fill:${s.color}"><title>${esc(nameOf(s.id))} ${l[0]}: ${fv(k,l[1])}</title></circle>`;}).join('')}</svg>`;}

/* ---------------- BANCOS CENTRALES ---------------- */
let cbSort='rate';
async function rCB(){const B=$('#ecBody');B.innerHTML=`<div class="panel">${sk(10)}</div>`;let d;try{d=await get('rates');}catch(e){B.innerHTML=`<div class="panel">${errBox(e.error,'rates')}</div>`;return;}if(EC.tab!=='cb')return;
 const rows=[...d.rows].sort((a,b)=>cbSort==='rate'?b.rate-a.rate:cbSort==='chg'?((b.rate-(b.yAgo??b.rate))-(a.rate-(a.yAgo??a.rate))):a.bank.localeCompare(b.bank));
 const cut=d.rows.filter(r=>r.yAgo!=null&&r.rate<r.yAgo).length,hike=d.rows.filter(r=>r.yAgo!=null&&r.rate>r.yAgo).length,same=d.rows.length-cut-hike;
 const spark=h=>{const v=h.slice(-36).map(p=>p[1]);if(v.length<2)return '';const lo=Math.min(...v),hi=Math.max(...v),X=i=>i/(v.length-1)*100,Y=x=>hi===lo?12:22-(x-lo)/(hi-lo)*20;return `<svg viewBox="0 0 100 24" class="ec36sp" preserveAspectRatio="none" aria-hidden="true"><path d="${v.map((x,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(x).toFixed(1)).join('')}"/></svg>`;};
 B.innerHTML=`<div class="panel"><div class="ec36cyc"><div><b class="up mono">${cut}</b><span>bajaron su tasa en 12 meses</span></div><div><b class="dn mono">${hike}</b><span>la subieron</span></div><div><b class="mono">${same}</b><span>sin cambio o sin dato</span></div></div></div>
 <div class="panel"><div class="ph30"><h3>Tasas de política monetaria</h3><div class="tb30" id="cbS"><button data-s="rate" class="${cbSort==='rate'?'on':''}">Por tasa</button><button data-s="chg" class="${cbSort==='chg'?'on':''}">Por cambio</button><button data-s="name" class="${cbSort==='name'?'on':''}">A–Z</button></div></div>
 <div class="ec36tw"><table class="ec36t"><thead><tr><th>Banco central</th><th class="r">Tasa</th><th class="r">vs hace 1 año</th><th>Último movimiento</th><th>3 años</th></tr></thead><tbody>${rows.map((r,i)=>{const ch=r.yAgo!=null?r.rate-r.yAgo:null,lc=r.lastChange;return `<tr style="--i:${i}"><td><span class="ec36fl">${r.countries.map(FLAG).slice(0,1).join('')}</span><b>${esc(r.bank)}</b><small>${r.countries.length>1?'Zona euro':esc(nameOf(r.countries[0]))}</small></td><td class="r mono"><b>${nf(r.rate,2)}%</b><small>${fd(r.date)}${r.stale?' · <em class="dn">dato antiguo</em>':''}</small></td><td class="r mono ${ch==null?'':ch<0?'up':ch>0?'dn':''}">${ch==null?'—':ppt(ch)}</td><td>${lc?`<span class="${lc.to>lc.from?'dn':'up'}">${lc.to>lc.from?'▲ Subió':'▼ Bajó'} ${nf(Math.abs(lc.to-lc.from),2)} pp</span><small>${fd(lc.date)}</small>`:'<small>Sin cambios en 3 años</small>'}</td><td>${spark(r.hist)}</td></tr>`;}).join('')}</tbody></table></div>
 <p class="note">En verde, bajadas de tasa (política más flexible); en rojo, subidas. Los países de la zona euro comparten la tasa del BCE (facilidad de depósito, según el BIS).</p>${src(d,` · consultado ${fd(d.asOf.slice(0,10))}`)}</div>`;
 $('#cbS').onclick=e=>{const b=e.target.closest('button');if(!b)return;cbSort=b.dataset.s;rCB();};}

/* ---------------- CURVA DE RENDIMIENTOS ---------------- */
async function rYC(){const B=$('#ecBody');B.innerHTML=`<div class="panel">${sk(6)}</div>`;let d;try{d=await get('curve');}catch(e){B.innerHTML=`<div class="panel">${errBox(e.error,'curve')}</div>`;return;}if(EC.tab!=='yc')return;
 const L=[[d.now,'Hoy','var(--em)'],[d.m1,'Hace 1 mes','var(--gold)'],[d.y1,'Hace 1 año','#8FA9D6']].filter(x=>x[0]);
 const W=680,H=280,pl=10,pr=50,pt=14,pb=28,T=d.tenors.map(t=>Math.sqrt(t.t)),t0=T[0],t1=T[T.length-1];const all=L.flatMap(x=>x[0].y).filter(v=>v!=null);let y0=Math.min(...all),y1=Math.max(...all);const pd=(y1-y0)*.12||.2;y0-=pd;y1+=pd;
 const X=i=>pl+(T[i]-t0)/(t1-t0)*(W-pl-pr),Y=v=>pt+(1-(v-y0)/(y1-y0))*(H-pt-pb);
 const path=y=>y.map((v,i)=>v==null?null:[X(i),Y(v)]).filter(Boolean).map((p,j)=>(j?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join('');
 const sv=`<svg class="l30 ec36ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Curva de rendimientos del Tesoro de EE.UU.">${[0,.25,.5,.75,1].map(f=>{const v=y0+(y1-y0)*f;return `<line class="g30" x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="t30" x="${W-pr+6}" y="${Y(v)+4}">${nf(v,2)}%</text>`;}).join('')}
  ${d.tenors.map((t,i)=>['1M','3M','6M','1A','2A','5A','10A','30A'].includes(t.l)?`<text class="t30" x="${X(i)}" y="${H-8}" text-anchor="middle">${t.l}</text>`:'').join('')}
  ${L.map(([r,l,c],j)=>`<path class="ln30" pathLength="1" style="stroke:${c};animation-delay:${j*120}ms;${j?'opacity:.75':''}" d="${path(r.y)}"/>${j===0?r.y.map((v,i)=>v==null?'':`<circle class="ec36pt" cx="${X(i)}" cy="${Y(v)}" r="3.5" style="fill:${c}"><title>${d.tenors[i].l}: ${nf(v,2)}%</title></circle>`).join(''):''}`).join('')}</svg>`;
 const i2=d.tenors.findIndex(t=>t.l==='2A'),i10=d.tenors.findIndex(t=>t.l==='10A'),s=d.now.y[i10]-d.now.y[i2];
 const sp=d.spread.map(([t,v])=>[Date.parse(t),v]);const inv=sp.filter(p=>p[1]<0).length;
 B.innerHTML=`<div class="panel"><div class="ph30"><h3>Curva del Tesoro de EE.UU.</h3><small>Rendimiento par por plazo</small></div>
  <div class="ec36chips">${L.map(([r,l,c])=>`<span class="ec36chip" style="--c:${c}">${l} · ${fd(r.d)}</span>`).join('')}</div>${sv}
  <div class="ec36tw"><table class="ec36t sm"><thead><tr><th>Plazo</th>${d.tenors.map(t=>`<th class="r">${t.l}</th>`).join('')}</tr></thead><tbody>${L.map(([r,l])=>`<tr><td>${l}</td>${r.y.map(v=>`<td class="r mono">${v==null?'—':nf(v,2)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${src(d,` · último dato ${fd(d.now.d)}`)}</div>
 <div class="fn33g"><div class="panel"><h3>Pendiente de la curva</h3><div class="ec36g two"><div class="ec36k"><small>10 años − 2 años</small><b class="mono ${s<0?'dn':''}">${ppt(s)}</b><span>${s<0?'Curva invertida':'Curva con pendiente positiva'}</span></div><div class="ec36k"><small>10 años − 3 meses</small><b class="mono ${d.spread3m<0?'dn':''}">${ppt(d.spread3m)}</b><span>${d.spread3m<0?'Invertida':'Positiva'}</span></div></div>
  <p class="note">Cuando los plazos cortos rinden más que los largos (curva invertida), el mercado suele anticipar recortes de tasas o una desaceleración. Históricamente ha precedido recesiones en EE.UU., aunque con desfases largos y sin ser una regla fija.</p></div>
  <div class="panel"><h3>Spread 10A − 2A</h3>${lines30([{pts:sp,color:'var(--em)'}],{w:640,h:200,fmt:v=>nf(v,2)})}<p class="note">${inv?`${inv} días con la curva invertida en este período.`:'Sin días con la curva invertida en este período.'}</p></div></div>`;}

/* ---------------- CONFIANZA Y CICLO (OCDE) ---------------- */
async function rConf(){const B=$('#ecBody');B.innerHTML=`<div class="panel">${sk(8)}</div>`;let d;try{d=await get('conf');await get('panel').catch(()=>{});}catch(e){B.innerHTML=`<div class="panel">${errBox(e.error,'conf')}</div>`;return;}if(EC.tab!=='conf')return;
 const M=d.measures.find(m=>m.k===EC.cm)||d.measures[0],ids=Object.keys(M.series);const sel=EC.cc.filter(id=>ids.includes(id));
 const rows=ids.map(id=>{const s=M.series[id],l=s[s.length-1],b=s[Math.max(0,s.length-4)];return {id,v:l[1],d:l[0],ch:l[1]-b[1]};}).sort((a,b)=>b.v-a.v);
 B.innerHTML=`<div class="panel"><div class="tb30" id="ecCM">${d.measures.map(m=>`<button data-m="${m.k}" class="${m.k===M.k?'on':''}">${esc(m.name)}</button>`).join('')}</div>
  <p class="note ec36what">${M.k==='LI'?'El indicador adelantado anticipa giros del ciclo económico unos 6 a 9 meses. Subiendo y sobre 100: expansión por encima de la tendencia.':M.k==='CCICP'?'Mide cómo ven los hogares su situación y la economía; anticipa el consumo.':'Mide la opinión de las empresas manufactureras sobre producción, pedidos e inventarios; es un indicador de la actividad industrial.'}</p>
  <div class="ec36chips">${sel.map((id,i)=>`<span class="ec36chip" style="--c:${COL[i%COL.length]}">${FLAG(id)} ${esc(nameOf(id))}</span>`).join('')}</div>
  <div id="ecCC">${lines30(sel.map((id,i)=>({pts:M.series[id].map(p=>[Date.parse(p[0]+'-01'),p[1]]),color:COL[i%COL.length]})),{w:640,h:230,fmt:v=>nf(v,1)})||'<p class="note">Elige países en la tabla.</p>'}</div>
  ${src(d,` · ${esc(d.note)}`)}</div>
 <div class="panel"><div class="ec36tw"><table class="ec36t"><thead><tr><th>País</th><th class="r">Último</th><th class="r">Cambio 3 meses</th><th>Dato</th><th class="r">Gráfico</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${FLAG(r.id)} ${esc(nameOf(r.id))}</td><td class="r mono ${r.v>=100?'up':'dn'}"><b>${nf(r.v,1)}</b></td><td class="r mono ${cls30(r.ch)}">${r.ch>=0?'▲':'▼'} ${nf(Math.abs(r.ch),1)}</td><td><small>${fd(r.d)}</small></td><td class="r"><input type="checkbox" data-cc="${r.id}" ${sel.includes(r.id)?'checked':''} aria-label="Mostrar ${esc(nameOf(r.id))} en el gráfico"></td></tr>`).join('')}</tbody></table></div></div>`;
 $('#ecCM').onclick=e=>{const b=e.target.closest('button');if(!b)return;EC.cm=b.dataset.m;rConf();};
 $$('#ecBody [data-cc]').forEach(x=>x.onchange=()=>{const id=x.dataset.cc;EC.cc=x.checked?[...EC.cc.filter(y=>y!==id),id].slice(-6):EC.cc.filter(y=>y!==id);store.set('ecCC',EC.cc);rConf();});}

/* ---------------- CALENDARIO ---------------- */
async function rCal(){const B=$('#ecBody');B.innerHTML=`<div class="panel">${sk(5)}</div>`;let d;try{d=await get('cal');}catch(e){B.innerHTML=`<div class="panel">${errBox(e.error,'cal')}</div>`;return;}if(EC.tab!=='cal')return;
 const by={};d.events.forEach(e=>(by[e.date]||=[]).push(e));const days=Object.keys(by).sort();
 const dn=s=>new Date(s+'T12:00:00Z').toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'});
 const st=d.sources.map(s=>`<span class="ec36st ${s.ok?'ok':''}">${esc(s.src)}: ${s.ok?'en línea':s.blocked?'requiere FRED_API_KEY':'no disponible'}</span>`).join('');
 B.innerHTML=`<div class="panel"><div class="ph30"><h3>Próximas publicaciones y reuniones</h3><small>${fd(d.from)} → ${fd(d.to)}</small></div><div class="ec36srcs">${st}</div>
  ${days.length?`<ol class="ec36cal">${days.map((k,i)=>`<li style="--i:${i}"><h4>${dn(k)}</h4>${by[k].map(e=>`<div class="ec36ev"><span class="ec36tm mono">${e.time?esc(e.time):'—'}</span><span><b>${FLAG(e.country)} ${esc(e.name)}</b>${e.sep?'<em class="ec36tag">con proyecciones económicas (SEP)</em>':''}<small>${e.time&&e.tz?`Hora de ${e.tz==='America/New_York'?'Nueva York':esc(e.tz)} · `:''}<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.src)}</a></small></span></div>`).join('')}</li>`).join('')}</ol>`:'<p class="note">No hay publicaciones en este período en las fuentes disponibles.</p>'}
  ${d.sources.some(s=>s.blocked)?'<p class="note">Con FRED_API_KEY el calendario agrega las publicaciones de inflación, empleo, PIB, ventas minoristas, producción industrial y confianza de EE.UU.</p>':''}
  <p class="note">${esc(d.note)}</p></div>`;}

/* ---------------- EE.UU. MENSUAL (FRED) ---------------- */
async function rUS(){const B=$('#ecBody');B.innerHTML=`<div class="panel">${sk(6)}</div>`;let d;try{d=await get('us');}catch(e){B.innerHTML=`<div class="panel">${errBox(e.error,'us')}</div>`;return;}if(EC.tab!=='us')return;
 if(d.blocked){B.innerHTML=`<div class="panel ec36lock">${ic('stop','',false)}<div><h3>Datos mensuales de EE.UU.: pendiente de activar</h3><p>${esc(d.msg)}</p><p class="note">Activa: inflación general y subyacente, desempleo, empleo no agrícola, tasa de fondos federales, producción industrial, ventas minoristas y confianza del consumidor de la Universidad de Michigan, además del calendario completo de publicaciones. Mientras tanto, los datos anuales de EE.UU. están en Resumen y Comparar países.</p></div></div>`;return;}
 B.innerHTML=`<div class="panel"><div class="ec36g wide">${d.rows.map((r,i)=>r.error?`<div class="ec36k"><small>${esc(r.name)}</small><b>—</b><span class="note">${esc(r.error)}</span></div>`:`<a class="ec36k" style="--i:${i}" href="${esc(r.url)}" target="_blank" rel="noopener"><small>${esc(r.name)}</small><b class="mono">${nf(r.last?.[1],r.unit.includes('miles')?0:1)}${r.unit.startsWith('%')?'%':''}</b><span>${fd(r.last?.[0]?.slice(0,7))} · ${esc(r.unit)}</span>${lines30([{pts:r.series.slice(-36).map(p=>[Date.parse(p[0]),p[1]]),color:'var(--em)'}],{w:300,h:70,labels:false})}</a>`).join('')}</div>${src(d)}</div>`;}

render();
window.EC36={open(tab,c){if(tab)EC.tab=tab;if(c)EC.c=c;store.set('ecT',EC.tab);setView('macro');$$('#ecTabs button').forEach(x=>{x.classList.toggle('on',x.dataset.t===EC.tab);x.setAttribute('aria-selected',x.dataset.t===EC.tab);});render();},EC,fv,read};

/* Lucioni Pro: categoría Economy */
{const g=$('#pro30');if(g){const d=document.createElement('div');d.className='pg30';d.style.setProperty('--i',2);const IT=[['sum','diversificar','Global Economy','Inflación, PIB, empleo y deuda de 21 economías con fuente oficial'],['cb','calc','Bancos centrales','Tasas de política monetaria de 17 bancos centrales y su último movimiento'],['yc','curve','Curva de rendimientos','Tesoro de EE.UU.: hoy, hace un mes y hace un año; inversión 10A−2A'],['cal','clock','Calendario macro','Reuniones de la Fed y publicaciones oficiales']];
 d.innerHTML=`<h3><span>Economy</span><small>Economía global</small></h3>`+IT.map(([t,i,n,s])=>`<button class="pt30" data-ec="${t}">${ic(i,'',false)}<span><b>${n}</b><small>${s}</small></span>${ic('right','',false)}</button>`).join('');
 const mk=[...g.querySelectorAll('.pg30')].find(x=>/Markets/.test(x.textContent));(mk?mk.after(d):g.appendChild(d));d.querySelectorAll('[data-ec]').forEach(b=>b.onclick=()=>EC36.open(b.dataset.ec));}}
/* Terminal: acceso directo */
{const t=document.getElementById('terminal');const h=t&&t.querySelector('.sh');if(h&&!$('#tmEc')){h.insertAdjacentHTML('beforeend',`<button class="btn" id="tmEc">${ic('diversificar','',false)} Economía global</button>`);$('#tmEc').onclick=()=>EC36.open('sum');}}

/* Copilot: preguntas macro con datos oficiales (sin permiso: son datos públicos) */
const CNAMES={US:/estados unidos|ee\.? ?uu|eeuu|usa\b|norteam/i,EA:/zona euro|eurozona|europa/i,CN:/china/i,JP:/jap[oó]n/i,DE:/alemania/i,GB:/reino unido|inglaterra|uk\b/i,FR:/francia/i,IT:/italia/i,ES:/espa[ñn]a/i,IN:/india/i,BR:/brasil/i,MX:/m[eé]xico/i,CA:/canad[aá]/i,KR:/corea/i,AU:/australia/i,CH:/suiza/i,ZA:/sud[aá]frica/i,CL:/chile/i,CO:/colombia/i,PE:/per[uú]/i,AR:/argentina/i};
async function toolMacro(step,text){if(!MAC)throw new Error('Disponible en la versión web.');step('Consultando FMI, BIS y OCDE…');
 const ids=Object.entries(CNAMES).filter(([,r])=>r.test(text||'')).map(([id])=>id).slice(0,3);if(!ids.length)ids.push(EC.c||'PE');
 const [P,R]=await Promise.allSettled([get('panel'),get('rates')]);if(P.status!=='fulfilled')throw new Error('El FMI no respondió.');const p=P.value,S=[];
 const keys=['inf','gdp','unemp','debt','fiscal','ca'];
 ids.forEach(id=>{const parts=keys.map(k=>{const I=p.indicators.find(i=>i.k===k),v=I&&I.values[id];return v?`${I.name}: ${fv(k,v.v)} (${v.y})${v.est!=null?`, estimación ${v.estY}: ${fv(k,v.est)}`:''}`:null;}).filter(Boolean);
  S.push({kind:'FMI',title:`${nameOf(id)} — World Economic Outlook`,url:'https://www.imf.org/external/datamapper/',snip:parts.join('; ')+'.'});
  const b=R.status==='fulfilled'&&R.value.rows.find(r=>r.countries.includes(id));if(b)S.push({kind:'BIS',title:`${b.bank}: tasa de política monetaria`,url:'https://data.bis.org/topics/CBPOL',snip:`${nf(b.rate,2)}% al ${fd(b.date)}${b.lastChange?`; último movimiento en ${fd(b.lastChange.date)}: de ${nf(b.lastChange.from,2)}% a ${nf(b.lastChange.to,2)}%`:''}${b.yAgo!=null?`; hace un año ${nf(b.yAgo,2)}%`:''}.`});});
 const kp=(l,v)=>`<div><small>${esc(l)}</small><b class="mono">${v}</b></div>`;
 const cards=ids.map(id=>{const g=k=>p.indicators.find(i=>i.k===k)?.values[id];const b=R.status==='fulfilled'&&R.value.rows.find(r=>r.countries.includes(id));
  return `<div class="cp32c"><h4>${FLAG(id)} ${esc(nameOf(id))}</h4><div class="cp32k">${kp('Inflación '+(g('inf')?.y||''),fv('inf',g('inf')?.v))}${kp('PIB real '+(g('gdp')?.y||''),fv('gdp',g('gdp')?.v))}${kp('Desempleo',fv('unemp',g('unemp')?.v))}${kp('Deuda pública',fv('debt',g('debt')?.v))}${b?kp('Tasa del banco central',nf(b.rate,2)+'%'):''}</div><button class="btn" onclick="EC36.open('sum','${id}')">Abrir Economía global</button></div>`;}).join('');
 return {cards,S,ctx:`Datos macroeconómicos oficiales de ${ids.map(nameOf).join(', ')}. Distingue entre datos observados y estimaciones del FMI.`,noResearch:true};}
if(window.CP32){CP32.INTENTS.unshift([/(inflaci[oó]n|\bpib\b|desempleo|tasa de (inter[eé]s|referencia)|banco central|reserva federal|\bfed\b|\bbce\b|econom[ií]a (de|del|global|mundial)|recesi[oó]n|curva de rendimiento|deuda p[uú]blica)/i,(step,t)=>toolMacro(step,t),false,'datos macro oficiales']);}
})();
