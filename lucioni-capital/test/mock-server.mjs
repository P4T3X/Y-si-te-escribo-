// Servidor de pruebas local: sirve vercel/index.html y ejecuta las funciones reales de vercel/api
// con un almacenamiento en memoria en lugar de Vercel Blob y respuestas simuladas de Gemini, Resend y Nasdaq.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');const FIX=ROOT+'/test/fixtures/';
const rows=JSON.parse(fs.readFileSync(FIX+'sample_rows.json'));const html=fs.readFileSync(process.env.HTML_FILE||ROOT+'/vercel/index.html');
const fund=JSON.parse(fs.readFileSync(FIX+'sample_fund.json'));const store=new Map();
globalThis.__fake={put:async(p,b)=>{store.set(p,b);},get:async(p)=>store.has(p)?{statusCode:200,stream:new Response(store.get(p)).body}:null,del:async(ps)=>{for(const p of [].concat(ps))store.delete(p);},
 list:async({prefix})=>({blobs:[...store.keys()].filter(k=>k.startsWith(prefix)).map(k=>({url:k,pathname:k})),hasMore:false})};
globalThis.__store=store;
process.env.AUTH_SECRET='t';process.env.RESEND_API_KEY='re_x';process.env.BLOB_READ_WRITE_TOKEN='x';process.env.GEMINI_API_KEY='k';process.env.ADMIN_EMAILS='admin@test.dev';process.env.STRIPE_WEBHOOK_SECRET='whsec_test';
let LASTMAIL=null;const _f=globalThis.fetch;
globalThis.fetch=async(u,o)=>{const s=String(u);
 if(s.includes('resend.com')){LASTMAIL=JSON.parse(o.body);return {ok:true,status:200,text:async()=>'{}'};}
 if(s.includes('generativelanguage.googleapis.com')){const B=String(o.body);globalThis.LASTAI=B;
  const text=B.includes('FUENTES')?'Según los datos, la acción cotiza a **$100** [1] y su volatilidad anual es alta [2]. Las noticias recientes hablan de ingresos récord [3].\n- Riesgo: caídas fuertes [2]\n- Objetivo de analistas: $125 [1]':JSON.stringify(globalThis.PLAN);
  return new Response(JSON.stringify({candidates:[{content:{parts:[{text}]}}],usageMetadata:{promptTokenCount:120,candidatesTokenCount:80}}),{status:200,headers:{'content-type':'application/json'}});}
 return _f(u,o);};
/* copia las funciones con el almacenamiento falso */
const GEN=ROOT+'/test/.gen';fs.rmSync(GEN,{recursive:true,force:true});
for(const d of ['lib','api']){fs.mkdirSync(GEN+'/'+d,{recursive:true});for(const f of fs.readdirSync(ROOT+'/vercel/'+d))fs.writeFileSync(GEN+'/'+d+'/'+f.replace(/\.js$/,'.mjs'),fs.readFileSync(ROOT+'/vercel/'+d+'/'+f,'utf8').replace(/import \{([^}]*)\} from '@vercel\/blob';/,'const {$1} = globalThis.__fake;').replace(/from '\.\.\/lib\/core\.js'/g,"from '../lib/core.mjs'"));}
const mod={};for(const n of ['account','ai','academy','billing','event'])mod[n]=(await import(GEN+'/api/'+n+'.mjs')).default;
const wrapReq=async req=>{if(req.method==='POST'&&!req.url.includes('webhook')){const c=[];for await(const x of req)c.push(x);const raw=Buffer.concat(c).toString()||'{}';try{req.body=JSON.parse(raw);}catch{req.body={};}}req.query=Object.fromEntries(new URL(req.url,'http://x').searchParams);return req;};
const STATIC={'/media.js':'text/javascript','/manifest.webmanifest':'application/manifest+json','/sw.js':'text/javascript','/icons/icon-192.png':'image/png','/icons/icon-512.png':'image/png','/icons/icon-maskable-512.png':'image/png'};
globalThis.PLAN={monto:5000,moneda:'PEN',plazo_meses:36,meta_pct:20,supuestos:'',resumen:'Cartera moderada.',realismo:'Realista.',cartera:[{ticker:'VOO',nombre:'Vanguard S&P 500',mercado:'NYSE',tipo:'ETF',porcentaje:45,monto:0,riesgo:'Medio',razon:'Núcleo.'},{ticker:'BND',nombre:'Bonos',mercado:'Nasdaq',tipo:'ETF',porcentaje:25,monto:0,riesgo:'Bajo',razon:'Estabilidad.'},{ticker:'QQQM',nombre:'Nasdaq 100',mercado:'EE.UU.',tipo:'Acción',porcentaje:20,monto:0,riesgo:'Alto',razon:'Puntaje alto.'},{ticker:'FAKEX',nombre:'Inventada',mercado:'?',tipo:'Acción',porcentaje:10,monto:0,riesgo:'Alto',razon:'x'}],escenarios:{pesimista:4800,base:6000,optimista:7200},consejos:['a','b','c']};
const rowsTop=rows[0].s;const ideas=rows.slice(0,60).map((r,i)=>{const tgt=r.p*(0.9+((i*37)%50)/100);const hi=r.p*1.2,lo=r.p*(0.6+(i%5)/20);return {s:r.s,n:r.n,sec:r.sec,p:r.p,pc:r.pc,m:r.m,tgt,up:tgt/r.p-1,pe:i%7?10+(i*13)%55:null,fpe:i%3?8+(i*7)%40:null,peg:i%4?1+(i%9)/4:null,gr:(i*11)%30-5,rt:['Compra fuerte','Compra','Mantener','Venta'][i%4],na:10+i%20,y:(i%4)*0.9,hi,lo,pos:(r.p-lo)/(hi-lo)};});
http.createServer(async(req,res)=>{const u=new URL(req.url,'http://x');res.setHeader('content-type','application/json');
 if(STATIC[u.pathname]){res.setHeader('content-type',STATIC[u.pathname]);return res.end(fs.readFileSync(ROOT+'/vercel'+u.pathname));}
 if(u.pathname==='/__store')return res.end(JSON.stringify(Object.fromEntries([...store.entries()].map(([k,v])=>[k,String(v).slice(0,4000)]))));
 if(u.pathname==='/__put'){const c=[];for await(const x of req)c.push(x);const {p,v}=JSON.parse(Buffer.concat(c).toString());store.set(p,JSON.stringify(v));return res.end('{"ok":true}');}
 if(u.pathname==='/__setsub'){const c=[];for await(const x of req)c.push(x);const {uid,sub}=JSON.parse(Buffer.concat(c).toString());const p=JSON.parse(store.get(`users/${uid}/profile.json`));p.sub={...p.sub,...sub};store.set(`users/${uid}/profile.json`,JSON.stringify(p));return res.end('{"ok":true}');}
 for(const n of ['academy','billing','event'])if(u.pathname==='/api/'+n)return mod[n](await wrapReq(req),res);
 if(u.pathname==='/__ai')return res.end(String(globalThis.LASTAI||''));
 if(u.pathname==='/__mail')return res.end(JSON.stringify(LASTMAIL));
 if(u.pathname==='/api/account')return mod.account(await wrapReq(req),res);
 if(u.pathname==='/api/sec'){const q=u.searchParams;const f=q.get('f13')?'f13':q.get('xbrl')?'xbrl':q.get('k8')?'k8':'ptr';return res.end(fs.readFileSync(FIX+'sample_'+f+'.json'));}
 if(u.pathname==='/api/market'){
   if(u.searchParams.get('fund'))return res.end(JSON.stringify({...fund,s:u.searchParams.get('fund')}));
   if(u.searchParams.get('h1y')){const sy=u.searchParams.get('h1y');let seed=[...sy].reduce((a,c)=>a*31+c.charCodeAt(0),7)%2147483647;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;const mkt=[];let m=1;let sd=99;const r2=()=>(sd=sd*16807%2147483647)/2147483647;for(let i=0;i<252;i++)mkt.push((r2()-.48)*0.02);let v=100;const now=Date.UTC(2026,10,13);const pts=[];for(let i=0;i<252;i++){const b=sy==='SPY'?1:0.6+rnd();v*=1+b*mkt[i]+(sy==='SPY'?0:(rnd()-.5)*0.015);let d=now-(251-i)*864e5;pts.push([d,+v.toFixed(2)]);}return res.end(JSON.stringify({s:sy,pts}));}
   if(u.searchParams.get('fxpen')){const pts=[];let v=3.45;const t0=Date.UTC(2025,9,15);for(let i=0;i<300;i++){v+=Math.sin(i/9)*.004-.0002;pts.push([t0+i*1.3*864e5,+v.toFixed(3)]);}return res.end(JSON.stringify({src:'mock',pts,last:pts.at(-1)}));}
   if(u.searchParams.get('h5')){const sy=u.searchParams.get('h5');let seed=[...sy].reduce((a,c)=>a*31+c.charCodeAt(0),7)%2147483647;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;let v=100;const pts=[];const now=Date.UTC(2026,10,13);for(let i=0;i<261;i++){v*=1+(rnd()-.47)*(sy==='BND'?.01:.04);pts.push([now-(260-i)*7*864e5,+v.toFixed(2)]);}return res.end(JSON.stringify({s:sy,pts}));}
   if(u.searchParams.get('quotes')){const P={SPY:671.2,QQQ:604.1,DIA:466.3,EFA:91.4,EEM:52.2,VOO:553.2,VTI:301.5,QQQM:231.4,SCHD:27.9,VXUS:68.1,VWO:49.3,BND:73.2,SGOV:100.4,IAU:61.2,EPU:48.7,VNQ:92.1};const q={};u.searchParams.get('quotes').split(',').forEach(s=>{if(P[s])q[s]={p:P[s],pc:.4,src:'live'};});return res.end(JSON.stringify({q}));}
   if(u.searchParams.get('ideas'))return setTimeout(()=>res.end(JSON.stringify({at:Date.now(),rows:ideas})),400);
   if(u.searchParams.get('list'))return res.end(JSON.stringify({at:Date.now(),rows}));
   if(u.searchParams.get('indices'))return res.end(JSON.stringify({rows:[{s:'EPU',n:'Perú (MSCI)',p:48.7,pc:.6},{s:'GLD',n:'Oro',p:368.2,pc:-.4},{s:'TLT',n:'Bonos',p:89.1,pc:.2}]}));
   if(u.searchParams.get('fx'))return res.end(JSON.stringify({at:Date.now(),base:'USD',rates:{USD:1,EUR:.92,GBP:.78,PEN:3.75},src:{EUR:'BCE (prueba)',GBP:'BCE (prueba)',PEN:'BCRP (prueba)'},dates:{EUR:'2026-11-13',GBP:'2026-11-13',PEN:'2026-11-13'}}));
   if(u.searchParams.get('news'))return res.end(JSON.stringify({rows:[{t:'Nvidia supera estimados de ingresos por centros de datos',u:'https://www.nasdaq.com/articles/nvidia-test',a:'2 horas',p:'Reuters'},{t:'Analistas elevan el precio objetivo',u:'https://www.nasdaq.com/articles/nvda-target',a:'1 día',p:'Zacks'}]}));
   const now=Date.now(),k=u.searchParams.get('symbol').length;return res.end(JSON.stringify({s:u.searchParams.get('symbol'),n:'Empresa',p:100,c:1,pc:1,st:'Closed',stats:{OneYrTarget:{l:'1 Year Target',v:'$125.00'},PERatio:{l:'P/E Ratio',v:'31.2'}},pts:Array.from({length:120},(_,i)=>[now-(120-i)*864e5,90+(k%2?i/6:-i/8)+3*Math.sin(i/5)])}));}
 if(u.pathname==='/api/ai')return mod.ai(await wrapReq(req),res);
 if(u.pathname==='/api/logo'){res.statusCode=404;return res.end();}
 res.setHeader('content-type','text/html');res.end(html);}).listen(4320,()=>console.log('up'));
