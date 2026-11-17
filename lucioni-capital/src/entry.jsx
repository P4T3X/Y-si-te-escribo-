import React from 'react';
import {createRoot} from 'react-dom/client';
import {Player} from '@remotion/player';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';

const C0 = {bg:'#E6EBE2', panel:'#F2F4EE', txt:'#14342A', mut:'#3B574B', cu:'#B8321C', cu2:'#14342A', cu3:'#8C6D24', up:'#1D7444', down:'#AF2A1E', guil:'rgba(20,52,42,.22)', line:'rgba(20,52,42,.18)'};
let C = C0;
const SERIF = "'Bodoni Moda', Didot, Georgia, serif", SANS = "Archivo, 'Helvetica Neue', Arial, sans-serif", MONO = "'IBM Plex Mono', ui-monospace, monospace";
const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
const clamp = {extrapolateLeft:'clamp', extrapolateRight:'clamp'};

const money = (v, cur) => (cur === 'PEN' ? 'S/ ' : '$') + Math.round(v).toLocaleString('en-US');

/* Fondo: papel de billete con roseta de guilloche que gira despacio */
const rosette = (R, r, d, n) => { let p = ''; for (let i = 0; i <= n; i++) { const t = i / n * Math.PI * 2 * r; const x = (R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t), y = (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t); p += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); } return p; };
const ROS = [rosette(300, 7, 120, 1400), rosette(300, 11, 150, 1600), rosette(220, 9, 80, 1200)];
const Backdrop = () => {
  const f = useCurrentFrame(), {width, height} = useVideoConfig();
  const s = Math.max(width, height) / 900;
  const draw = interpolate(f, [0, 60], [0, 1], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill style={{background:C.bg}}>
      <svg width={width} height={height} viewBox={`${-width/2} ${-height/2} ${width} ${height}`} style={{position:'absolute', inset:0}}>
        <g transform={`scale(${s}) rotate(${f * 0.08})`}>
          {ROS.map((d, i) => <path key={i} d={d} fill="none" stroke={C.guil} strokeWidth={0.8} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />)}
        </g>
      </svg>
      <div style={{position:'absolute', inset: Math.min(width, height) * 0.025, border:`${Math.max(2, width / 400)}px double ${C.guil}`}} />
      <div style={{position:'absolute', top: height * 0.045, left: width * 0.06, fontFamily:MONO, fontWeight:600, fontSize: Math.min(width, height) * 0.028, letterSpacing:'0.18em', color:C.cu}}>LC 0{(4281 + Math.floor(f / 30)).toString().padStart(6, '0')} A</div>
    </AbsoluteFill>
  );
};

/* Fundido de entrada/salida de cada escena, con un leve blur (más suave que solo opacidad) */
const Scene = ({dur, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 12, dur - 10, dur], [0, 1, 1, 0], clamp);
  const b = interpolate(f, [0, 12, dur - 10, dur], [8, 0, 0, 8], clamp);
  const y = interpolate(f, [0, 14], [30, 0], {...clamp, easing: easeOut});
  return <AbsoluteFill style={{opacity:o, filter:`blur(${b}px)`, transform:`translateY(${y}px)`, justifyContent:'center', alignItems:'center'}}>{children}</AbsoluteFill>;
};

const Logo = ({size}) => {
  const f = useCurrentFrame();
  const d1 = interpolate(f, [4, 34], [60, 0], {...clamp, easing: easeOut});
  const d2 = interpolate(f, [20, 46], [40, 0], {...clamp, easing: easeOut});
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="29" fill={C.panel} stroke={C.txt} strokeWidth="2" />
      <path d="M24 18v26h18" stroke={C.txt} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset={d1} />
      <path d="M30 37l5-6 4 3 6-9" stroke={C.cu} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset={d2} />
    </svg>
  );
};

const Intro = ({p, u}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 14, mass: 0.8}});
  const word = 'Lucioni Capital'.split('');
  return (
    <Scene dur={70}>
      <div style={{transform:`scale(${0.6 + s * 0.4})`}}><Logo size={u * 22} /></div>
      <div style={{fontFamily:SERIF, fontSize:u * 13, fontWeight:500, color:C.txt, marginTop:u * 5, display:'flex'}}>
        {word.map((ch, i) => {
          const k = spring({frame: f - 10 - i * 1.6, fps, config: {damping: 16}});
          return <span key={i} style={{display:'inline-block', opacity:k, transform:`translateY(${(1 - k) * u * 4}px)`, whiteSpace:'pre'}}>{ch}</span>;
        })}
      </div>
      <div style={{fontFamily:SANS, fontSize:u * 4.2, color:C.mut, marginTop:u * 2, opacity:interpolate(f, [30, 45], [0, 1], clamp), letterSpacing:u * 0.3, textTransform:'uppercase'}}>{p.kicker}</div>
    </Scene>
  );
};

const Amount = ({p, u}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const k = interpolate(f, [8, 55], [0, 1], {...clamp, easing: easeOut});
  const s = spring({frame: f, fps, config: {damping: 12}});
  return (
    <Scene dur={80}>
      <div style={{fontFamily:SANS, fontSize:u * 4.4, color:C.mut, textTransform:'uppercase', letterSpacing:u * 0.4}}>{p.amountLabel}</div>
      <div style={{fontFamily:MONO, fontWeight:700, fontSize:u * 17, color:C.txt, transform:`scale(${0.85 + s * 0.15})`, borderTop:`${u*0.4}px solid ${C.cu3}`,borderBottom:`${u*0.4}px solid ${C.cu3}`,padding:`${u*1}px ${u*4}px`}}>{money(p.amount * k, p.currency)}</div>
      <div style={{display:'flex', gap:u * 2.4, marginTop:u * 5, flexWrap:'wrap', justifyContent:'center', maxWidth:'86%'}}>
        {p.chips.map((c, i) => {
          const q = spring({frame: f - 20 - i * 6, fps, config: {damping: 14}});
          return <div key={i} style={{fontFamily:SANS, fontSize:u * 4, color:C.txt, border:`${u * 0.25}px solid ${C.line}`, background:C.panel, padding:`${u * 1.6}px ${u * 3}px`, borderRadius:u * 2.4, opacity:q, transform:`translateY(${(1 - q) * u * 5}px) scale(${0.9 + q * 0.1})`}}><span style={{color:C.mut}}>{c[0]} </span>{c[1]}</div>;
        })}
      </div>
    </Scene>
  );
};

const Allocation = ({p, u}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const R = 40, Cc = 2 * Math.PI * R;
  let off = 0;
  const segs = p.items.map((it, i) => {
    const k = spring({frame: f - 8 - i * 7, fps, config: {damping: 20, mass: 0.9}});
    const len = Cc * it.pct / 100;
    const el = <circle key={i} cx="50" cy="50" r={R} fill="none" stroke={it.color} strokeWidth="13" strokeDasharray={`${Math.max(0, len - 1.5) * k} ${Cc}`} strokeDashoffset={-off} transform="rotate(-90 50 50)" />;
    off += len; return el;
  });
  const vertical = p.vertical;
  return (
    <Scene dur={100}>
      <div style={{fontFamily:SERIF, fontSize:u * 9, color:C.txt, marginBottom:u * 5}}>Cómo se reparte</div>
      <div style={{display:'flex', flexDirection: vertical ? 'column' : 'row', alignItems:'center', gap:u * 7}}>
        <div style={{position:'relative', width:u * 52, height:u * 52, transform:`rotate(${interpolate(f, [0, 100], [-20, 0], clamp)}deg)`}}>
          <svg width="100%" height="100%" viewBox="0 0 100 100"><circle cx="50" cy="50" r={R} fill="none" stroke={C.line} strokeWidth="13" />{segs}</svg>
          <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
            <div style={{fontFamily:MONO, fontSize:u * 11, fontWeight:700, color:C.txt}}>{p.items.length}</div>
            <div style={{fontFamily:SANS, fontSize:u * 3.4, color:C.mut}}>activos</div>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:u * 2.2}}>
          {p.items.map((it, i) => {
            const k = spring({frame: f - 14 - i * 7, fps, config: {damping: 16}});
            return <div key={i} style={{display:'flex', alignItems:'center', gap:u * 2.4, opacity:k, transform:`translateX(${(1 - k) * u * -8}px)`, fontFamily:MONO, fontSize:u * 4.8, color:C.txt}}>
              <span style={{width:u * 3, height:u * 3, borderRadius:u, background:it.color}} />
              <b style={{minWidth:u * 18}}>{it.t}</b><span style={{color:C.mut}}>{Math.round(it.pct * k)}%</span>
            </div>;
          })}
        </div>
      </div>
    </Scene>
  );
};

const Growth = ({p, u}) => {
  const f = useCurrentFrame(), {fps, width} = useVideoConfig();
  const W = 100, H = 56, pts = p.curve, mn = Math.min(...pts), mx = Math.max(...pts), rg = (mx - mn) || 1;
  const X = i => i / (pts.length - 1) * W, Y = v => H - 4 - (v - mn) / rg * (H - 10);
  const prog = interpolate(f, [8, 70], [0, 1], {...clamp, easing: easeOut});
  const n = Math.max(2, Math.ceil(pts.length * prog));
  const vis = pts.slice(0, n);
  const line = vis.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(2)},${Y(v).toFixed(2)}`).join('');
  const area = line + `L${X(n - 1)},${H}L0,${H}Z`;
  const last = vis[vis.length - 1], up = last >= pts[0], col = up ? C.up : C.down;
  const chartW = Math.min(width * 0.84, u * 150);
  return (
    <Scene dur={110}>
      <div style={{fontFamily:SERIF, fontSize:u * 9, color:C.txt}}>{p.curveTitle}</div>
      <div style={{fontFamily:MONO, fontSize:u * 10, fontWeight:700, color:col, marginTop:u}}>{money(last, p.currency)}</div>
      <svg width={chartW} height={chartW * H / W} viewBox={`0 0 ${W} ${H}`} style={{marginTop:u * 3, overflow:'visible'}}>
        <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity=".35" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient></defs>
        {[0, 1, 2, 3].map(g => <line key={g} x1="0" x2={W} y1={4 + g * (H - 8) / 3} y2={4 + g * (H - 8) / 3} stroke={C.line} strokeWidth=".3" />)}
        <path d={area} fill="url(#g)" />
        <path d={line} fill="none" stroke={col} strokeWidth=".9" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={X(n - 1)} cy={Y(last)} r={1.4 + Math.sin(f / 4) * 0.4} fill={col} />
      </svg>
      {p.scen && <div style={{display:'flex', gap:u * 3, marginTop:u * 5}}>
        {[['Pesimista', p.scen.pes, C.down], ['Base', p.scen.base, C.txt], ['Optimista', p.scen.opt, C.up]].map(([l, v, c], i) => {
          const k = spring({frame: f - 60 - i * 6, fps, config: {damping: 14}});
          return <div key={l} style={{textAlign:'center', border:`${u * 0.25}px solid ${C.line}`, background:C.panel, borderRadius:u * 3, padding:`${u * 2}px ${u * 3.4}px`, opacity:k, transform:`translateY(${(1 - k) * u * 6}px)`}}>
            <div style={{fontFamily:SANS, fontSize:u * 3.2, color:C.mut}}>{l}</div>
            <div style={{fontFamily:MONO, fontSize:u * 4.8, fontWeight:700, color:c}}>{money(v, p.currency)}</div>
          </div>;
        })}
      </div>}
    </Scene>
  );
};

const Outro = ({p, u}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 13}});
  return (
    <Scene dur={70}>
      <div style={{transform:`scale(${0.7 + s * 0.3}) rotate(${(1 - s) * -30}deg)`}}><Logo size={u * 16} /></div>
      <div style={{fontFamily:SERIF, fontSize:u * 10, color:C.txt, marginTop:u * 4, textAlign:'center', maxWidth:'80%'}}>{p.outro}</div>
      <div style={{fontFamily:SANS, fontSize:u * 3.2, color:C.mut, marginTop:u * 4, textAlign:'center', maxWidth:'78%'}}>Herramienta educativa · no es asesoría financiera · toda inversión puede perder valor</div>
    </Scene>
  );
};

export const FILM_FRAMES = 70 + 80 + 100 + 110 + 70;
const Film = (p) => {
  C = p.pal || C0;
  const {width, height} = useVideoConfig();
  const u = Math.min(width, height) / 100 * (p.vertical ? 1 : 0.9);
  let at = 0;
  const seq = (dur, el) => { const s = <Sequence key={at} from={at} durationInFrames={dur}>{el}</Sequence>; at += dur; return s; };
  return (
    <AbsoluteFill style={{overflow:'hidden'}}>
      <Backdrop />
      {seq(70, <Intro p={p} u={u} />)}
      {seq(80, <Amount p={p} u={u} />)}
      {seq(100, <Allocation p={p} u={u} />)}
      {seq(110, <Growth p={p} u={u} />)}
      {seq(70, <Outro p={p} u={u} />)}
    </AbsoluteFill>
  );
};

/* API para la app (vanilla JS) */
let root = null, ref = React.createRef(), last = null;
function App({props}) {
  const v = props.vertical;
  return <Player ref={ref} component={Film} inputProps={props} durationInFrames={FILM_FRAMES} fps={30}
    compositionWidth={v ? 1080 : 1920} compositionHeight={v ? 1920 : 1080}
    style={{width:'100%', borderRadius:16, overflow:'hidden'}} controls loop autoPlay={false} clickToPlay doubleClickToFullscreen
    acknowledgeRemotionLicense />;
}
window.LCVideo = {
  mount(el, props) { if (!root) root = createRoot(el); last = props; root.render(<App props={props} />); },
  play() { ref.current?.seekTo(0); ref.current?.play(); },
  toggle() { ref.current?.toggle(); },
  frames: FILM_FRAMES,
  on(ev, fn) { ref.current?.addEventListener(ev, fn); },
};

/* ===== Animaciones en bucle con Remotion: fondo de bienvenida y cartera de muestra ===== */
const GateLoop = (p) => {
  C = p.pal || C0;
  const f = useCurrentFrame(), {width, height, durationInFrames: D} = useVideoConfig();
  const s = Math.max(width, height) / 900;
  const tick = ['NVDA +1.2%','VOO +0.4%','BAP −0.3%','SCCO +2.1%','AAPL +0.8%','MSFT −0.2%','TSLA +3.4%','KO +0.1%'];
  const loopT = (f % D) / D;
  return (
    <AbsoluteFill style={{background:C.bg, overflow:'hidden'}}>
      <svg width={width} height={height} viewBox={`${-width/2} ${-height/2} ${width} ${height}`} style={{position:'absolute', inset:0}}>
        <g transform={`scale(${s*1.25}) rotate(${loopT*90})`}>{ROS.map((d, i) => <path key={i} d={d} fill="none" stroke={C.guil} strokeWidth={0.7} />)}</g>
        <g transform={`scale(${s*0.7}) rotate(${-loopT*72})`}>{ROS.slice(0,2).map((d, i) => <path key={i} d={d} fill="none" stroke={C.guil} strokeWidth={0.6} />)}</g>
      </svg>
      {tick.map((t, i) => {
        const ph = (loopT + i / tick.length) % 1, x = ((i * 271) % 100) / 100 * width, y = height * (1.05 - ph * 1.2);
        const o = interpolate(ph, [0, .15, .8, 1], [0, .55, .55, 0]);
        const up = !t.includes('−');
        return <div key={i} style={{position:'absolute', left:x, top:y, fontFamily:MONO, fontSize:height*.022, color:up?C.up:C.down, opacity:o, whiteSpace:'nowrap'}}>{t}</div>;
      })}
      <div style={{position:'absolute', left:0, right:0, bottom:0, height:height*.22, display:'flex', alignItems:'flex-end', gap:width*.006, padding:`0 ${width*.04}px`, opacity:.35}}>
        {Array.from({length: 48}, (_, i) => {
          const k = spring({frame: (f % D) - i * 2, fps: 30, config: {damping: 18}});
          const h = (0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * .37))) * height * .2;
          const out = interpolate(f % D, [D - 30, D - 5], [1, 0], clamp);
          return <div key={i} style={{flex:1, height:h * k * out, background: (Math.sin(i * 2.3) > -0.2) ? C.up : C.down, borderRadius:2}} />;
        })}
      </div>
    </AbsoluteFill>
  );
};
const PlanLoop = (p) => {
  C = p.pal || C0;
  const f = useCurrentFrame(), {fps, durationInFrames: D, width, height} = useVideoConfig();
  const items = [['VOO',40],['MSFT',20],['NVDA',15],['BAP',15],['SCCO',10]], cols = [C.cu, '#1F6B4F', C.cu3, '#2F5D8A', '#7A4E8C'];
  const out = interpolate(f, [D - 24, D - 4], [1, 0], clamp);
  const R = 120, Cc = 2 * Math.PI * R; let off = 0;
  const amt = Math.round(interpolate(f, [10, 90], [0, 5000], {...clamp, easing: easeOut}));
  const pts = Array.from({length: 40}, (_, i) => 1 + i * 0.012 + Math.sin(i * .7) * 0.025);
  const prog = interpolate(f, [60, 150], [0, 1], {...clamp, easing: easeOut});
  const n = Math.max(2, Math.ceil(pts.length * prog));
  const LW = width * .36, LH = height * .42, mn = Math.min(...pts), mx = Math.max(...pts);
  const line = pts.slice(0, n).map((v, i) => `${i ? 'L' : 'M'}${(i / (pts.length - 1) * LW).toFixed(1)},${(LH - (v - mn) / (mx - mn) * LH).toFixed(1)}`).join('');
  return (
    <AbsoluteFill style={{background:C.panel, opacity:out, fontFamily:SANS, color:C.txt, flexDirection:'row', alignItems:'center', justifyContent:'space-around', padding:'0 4%'}}>
      <div style={{position:'relative', width:300, height:300}}>
        <svg width="300" height="300" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r={R} fill="none" stroke={C.line} strokeWidth="34" />
          {items.map(([t, pc], i) => { const k = spring({frame: f - 12 - i * 8, fps, config: {damping: 20}}); const len = Cc * pc / 100; const el = <circle key={t} cx="150" cy="150" r={R} fill="none" stroke={cols[i]} strokeWidth="34" strokeDasharray={`${Math.max(0, len - 3) * k} ${Cc}`} strokeDashoffset={-off} transform="rotate(-90 150 150)" />; off += len; return el; })}
        </svg>
        <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center', textAlign:'center'}}><div><div style={{fontSize:22, color:C.mut}}>Tu cartera</div><div style={{fontFamily:MONO, fontWeight:700, fontSize:40}}>S/ {amt.toLocaleString('en-US')}</div></div></div>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:14}}>
        {items.map(([t, pc], i) => { const k = spring({frame: f - 30 - i * 7, fps, config: {damping: 16}}); return (
          <div key={t} style={{display:'flex', alignItems:'center', gap:14, opacity:k, transform:`translateX(${(1 - k) * 40}px)`}}>
            <span style={{width:16, height:16, borderRadius:3, background:cols[i]}} /><b style={{fontFamily:MONO, fontSize:30, width:110}}>{t}</b>
            <div style={{width:260 * pc / 40 * k, height:14, borderRadius:7, background:cols[i]}} /><span style={{fontFamily:MONO, fontSize:24, color:C.mut}}>{pc}%</span>
          </div>); })}
      </div>
      <div>
        <div style={{fontSize:22, color:C.mut, marginBottom:8}}>Escenario base</div>
        <svg width={LW} height={LH} style={{overflow:'visible'}}><path d={line} fill="none" stroke={C.up} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={(n - 1) / (pts.length - 1) * LW} cy={LH - (pts[n - 1] - mn) / (mx - mn) * LH} r="9" fill={C.up} /></svg>
      </div>
    </AbsoluteFill>
  );
};
const loops = {};
window.LCLoop = {
  mount(el, kind, pal, auto) {
    const cfg = kind === 'gate' ? {component: GateLoop, w: 1600, h: 1000, d: 300} : {component: PlanLoop, w: 1600, h: 440, d: 210};
    const r = React.createRef();
    if (!loops[kind]) loops[kind] = {root: createRoot(el), ref: r};
    const L = loops[kind];
    L.root.render(<Player ref={L.ref} component={cfg.component} inputProps={{pal}} durationInFrames={cfg.d} fps={30} compositionWidth={cfg.w} compositionHeight={cfg.h}
      style={{width:'100%', height:'100%'}} loop autoPlay={!!auto} controls={false} clickToPlay={false} acknowledgeRemotionLicense />);
    if (auto) [80, 400, 1200].forEach(t => setTimeout(() => { const p = L.ref.current; if (p && !p.isPlaying()) p.play(); }, t));
    return {play: () => L.ref.current?.play(), pause: () => L.ref.current?.pause(), seek: (f) => L.ref.current?.seekTo(f)};
  },
};

/* ===== GSAP (motor de las composiciones estilo HyperFrames) ===== */
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
window.gsap = gsap; window.ScrollTrigger = ScrollTrigger;
