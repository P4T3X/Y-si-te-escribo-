// Fase 10 · Cálculos financieros contra valores de libro: patrimonio, divisas, flujo de caja, intereses y amortización,
// rentabilidad inmobiliaria, jubilación, inflación y simulaciones históricas. Usa los mismos motores de la app.
// Requiere: node test/mock-server.mjs
const {chromium}=require('playwright');let pass=0,fail=0;const ok=(c,m)=>{if(c){pass++;console.log('  ✓',m);}else{fail++;console.log('  ✗',m);}};
const near=(a,b,t)=>Math.abs(a-b)<=t;
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.addInitScript(()=>{sessionStorage.setItem('lc_gate','1');localStorage.setItem('lc_anOk','false');});await p.goto('http://localhost:4320/');await p.waitForTimeout(1200);
const R=await p.evaluate(()=>{const o={},Rt={rates:{USD:1,EUR:.92,PEN:3.75,GBP:.78}};
 /* divisas */
 o.c1=LFIN.conv(100,'EUR','PEN',Rt).v;o.c2=LFIN.conv(LFIN.conv(100,'EUR','PEN',Rt).v,'PEN','EUR',Rt).v;o.c3=LFIN.conv(LFIN.conv(1000,'PEN','GBP',Rt).v,'GBP','EUR',Rt).v;o.c4=LFIN.conv(1000,'PEN','EUR',Rt).v;o.c5=LFIN.conv(10,'PEN','JPY',Rt);o.c6=LFIN.conv(10,'PEN','PEN',null).v;
 /* flujo de caja: ingresos, gastos, transferencias excluidas, cuentas en otra moneda convertidas */
 const meta={accounts:[{id:'a1',cur:'PEN',type:'bank',open:0},{id:'a2',cur:'USD',type:'savings',open:0}],cats:[{id:'s',kind:'inc'},{id:'g',kind:'exp'},{id:'t',kind:'tr'}],settings:{base:'PEN'}};
 const txs=[{acc:'a1',date:'2026-09-05',amt:5000,cat:'s'},{acc:'a1',date:'2026-09-10',amt:-1200,cat:'g'},{acc:'a1',date:'2026-09-11',amt:-800,cat:'t'},{acc:'a2',date:'2026-09-20',amt:-100,cat:'g'},{acc:'a1',date:'2026-10-05',amt:5000,cat:'s'}];
 const A=LFIN.aggregate(txs,meta,Rt);o.cf=[A.byM['2026-09'].inc,A.byM['2026-09'].exp,A.byM['2026-10'].inc];o.bal=LFIN.balances(meta,txs);
 /* intereses y amortización: préstamo de 10.000 a TEA 12% con la cuota de 12 meses */
 const r=Math.pow(1.12,1/12)-1,P=10000*r/(1-Math.pow(1+r,-12)),am=F33.amort({b:10000,r:12,m:P});o.am=[am.n,am.it,12*P-10000,P];o.amInf=F33.amort({b:10000,r:12,m:90}).n;
 /* rentabilidad inmobiliaria */
 const prop={price:400000,date:'2020-05-01',valuations:[{date:'2026-01-15',value:450000,src:'appraisal'}],rent:2000,occ:100,exp:{maint:100,hoa:50,tax:1200,ins:600,other:0},mort:{initial:300000,balance:200000,tea:8,payment:2500},closing:10000,cur:'PEN'};
 const pm=LW.propMetrics(prop);o.pm=[pm.cv,pm.rentY,pm.expY,pm.noi,pm.gross,pm.net,pm.equity,pm.ltv,pm.cfY,pm.coc,pm.cash];
 /* patrimonio neto: efectivo, tarjeta, inversión, inmueble con hipoteca y deudas, en varias monedas */
 const nw=LW.netWorth({meta:{accounts:[{id:'b1',cur:'PEN',type:'bank',open:10000},{id:'b2',cur:'USD',type:'card',open:-200},{id:'b3',cur:'EUR',type:'investment',open:920}],cats:[],settings:{base:'PEN'}},txs:[],props:[prop],pf:{V:1000},debt:{cur:'PEN',debts:[{n:'Préstamo',b:5000}]},R:Rt,base:'PEN'});
 o.nw=[nw.assets,nw.liab,nw.nw,nw.parts.cash,nw.parts.inv,nw.parts.estate,nw.parts.cards,nw.parts.mort,nw.parts.debts];
 /* jubilación: tasa real y trayectoria */
 o.rr=LW.realRate(.065,.025);const rp=LW.retPath({age:30,retAge:31,endAge:32,saved:0,monthly:100,income:100,other:0},0);o.rp=[rp.atRet,rp.end,rp.outAt];
 const rp2=LW.retPath({age:30,retAge:40,endAge:90,saved:10000,monthly:0,income:0,other:0},.05);o.rp2=rp2.atRet;
 /* inflación: metas en dinero de hoy */
 const d10=new Date();d10.setFullYear(d10.getFullYear()+10);o.inf=[gTarget({target:10000,real:true,date:d10.toISOString().slice(0,10)}),gTarget({target:10000,real:false,date:d10.toISOString().slice(0,10)})];
 /* Monte Carlo sin volatilidad = resultado determinista */
 const s=gSim({saved:1000,monthly:100,risk:'moderado',target:2200,date:'2030-01-01'},{months:12,r:0,v:0,c:100,target:2200,n:50});o.mc=[s.p50,s.prob];const s2=gSim({saved:1000,monthly:100,risk:'moderado',date:'2030-01-01'},{months:12,r:0,v:0,c:100,target:2201,n:50});o.mc2=s2.prob;
 /* simulación histórica: aportes mensuales en un activo que duplica su precio a mitad del período */
 const W=7*864e5,t0=Date.UTC(2024,0,1),T=Array.from({length:104},(_,i)=>t0+i*W),D={X:T.map((t,i)=>[t,i<52?100:200])};
 const bt=LBT.run({assets:[{t:'X',w:100}],init:1000,monthly:100,reb:'none',costs:{pct:0,fixed:0,slip:0}},D,T);
 let sh=1000/100;const m0=new Date(T[0]).getUTCMonth();let lm=m0;T.forEach((t,k)=>{const m=new Date(t).getUTCMonth();if(k&&m!==lm){sh+=100/(k<52?100:200);}lm=m;});o.bt=[bt.final,sh*200,bt.contributed];
 return o;});
console.log('1. Conversión de divisas');
ok(near(R.c1,100*3.75/.92,1e-9),'EUR → PEN con tasas de referencia (100 € = 407,61 S/)');
ok(near(R.c2,100,1e-9),'ida y vuelta EUR → PEN → EUR devuelve el monto original');
ok(near(R.c3,R.c4,1e-9),'triangulación PEN → GBP → EUR = PEN → EUR directo');
ok(R.c5===null&&R.c6===10,'sin tasa para una moneda: no se inventa (null); misma moneda: sin conversión');
console.log('2. Flujo de caja');
ok(R.cf[0]===5000&&near(R.cf[1],1200+375,1e-9)&&R.cf[2]===5000,'ingresos y gastos por mes; la transferencia no cuenta y el gasto en dólares se convierte (100 US$ = 375 S/)');
ok(R.bal.a1.bal===8000&&R.bal.a2.bal===-100,'saldos por cuenta en su moneda original');
console.log('3. Intereses y amortización');
ok(R.am[0]===12&&near(R.am[1],R.am[2],0.02),`préstamo de 10.000 a TEA 12%: cuota ${R.am[3].toFixed(2)} lo paga en 12 meses con intereses = 12 × cuota − capital`);
ok(R.amInf===Infinity,'si la cuota no cubre los intereses, la deuda no se termina de pagar');
console.log('4. Rentabilidad inmobiliaria');
ok(R.pm[0]===450000&&R.pm[1]===24000&&R.pm[2]===3600&&R.pm[3]===20400,'valor por tasación, renta anual 24.000, gastos 3.600 (mensuales×12 + anuales), NOI 20.400');
ok(near(R.pm[4],24000/450000,1e-12)&&near(R.pm[5],20400/450000,1e-12),'rentabilidad bruta 5,33% y neta 4,53% sobre el valor actual');
ok(R.pm[6]===250000&&near(R.pm[7],200000/450000,1e-12),'patrimonio en el inmueble 250.000 y LTV 44,4%');
ok(R.pm[8]===20400-30000&&R.pm[10]===110000&&near(R.pm[9],(20400-30000)/110000,1e-12),'flujo de caja después de la hipoteca y cash-on-cash sobre el capital propio invertido');
console.log('5. Patrimonio neto');
const [as,li,nw,cash,inv,est,cards,mort,debts]=R.nw;
ok(cash===10000&&near(inv,920/.92*3.75+1000*3.75,1e-6)&&est===450000,'activos: efectivo, inversión en euros convertida y cartera en dólares, inmueble');
ok(near(cards,200*3.75,1e-9)&&mort===200000&&debts===5000,'pasivos: tarjeta en dólares convertida, hipoteca y préstamo');
ok(near(nw,as-li,1e-9)&&near(as,cash+inv+est,1e-9)&&near(li,cards+mort+debts,1e-9),'patrimonio neto = activos − pasivos');
console.log('6. Jubilación');
ok(near(R.rr,1.065/1.025-1,1e-12),'tasa real = (1 + 6,5%) / (1 + 2,5%) − 1 = 3,90%');
ok(R.rp[0]===1200&&R.rp[1]===0&&R.rp[2]!=null&&near(R.rp[2],32,0.01),'sin rentabilidad: 12 aportes de 100 = 1.200; retirando 100 al mes se agota a los 32');
ok(near(R.rp2,10000*Math.pow(1.05,10),0.5),'10.000 al 5% anual durante 10 años = 16.289 al retiro');
console.log('7. Inflación');
ok(near(R.inf[0]/10000,Math.pow(1.025,10),0.004)&&R.inf[1]===10000,'meta en dinero de hoy: 10.000 a 10 años con 2,5% de inflación ≈ 12.801; meta nominal sin ajuste');
console.log('8. Simulaciones');
ok(near(R.mc[0],2200,1e-6)&&R.mc[1]===1&&R.mc2===0,'Monte Carlo sin volatilidad es determinista: 1.000 + 12×100 = 2.200 (probabilidad 100%; con objetivo 2.201, 0%)');
ok(near(R.bt[0],R.bt[1],0.01),`backtest con aportes mensuales en un activo que duplica: ${R.bt[0].toFixed(2)} = acciones acumuladas × precio final`);
await b.close();console.log(`\n${pass} correctas, ${fail} fallidas`);process.exit(fail?1:0);})();
