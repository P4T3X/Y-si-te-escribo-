/* Despiece: foto real de un auto de la colección que, al bajar, se convierte
   en un plano y se desarma en capas (carrocería, interior, chasis y motor).
   Uso: <section class="dsp" data-img="ruta.jpg"></section> + despiece.css */
(function () {
  const STEPS = [
    { t: "Una pieza original", p: "Así luce de cerca: pintura negra, faros redondos y la parrilla con la placa de la colección.", show: [] },
    { t: "El auto completo", p: "Sigue bajando y lo desarmamos capa por capa, como en el taller.", show: [] },
    { t: "La carrocería", p: "Acero estampado, guardafangos curvos, capó con rejillas y la parrilla cromada.", show: ["b"] },
    { t: "El interior", p: "Asiento tapizado, tablero simple y un timón grande: todo se manejaba a pura fuerza, sin dirección asistida.", show: ["b", "i"] },
    { t: "Chasis y motor", p: "Motor de 4 cilindros y 3,3 litros con unos 40 HP, caja de 3 velocidades y frenos de tambor en las cuatro ruedas.", show: ["b", "i", "c"] },
  ];
  const CALL = [
    { g: "b", n: 1, x: 821, y: 250, name: "Parrilla cromada" },
    { g: "b", n: 2, x: 884, y: 306, name: "Faro" },
    { g: "b", n: 3, x: 250, y: 360, name: "Guardafangos" },
    { g: "i", n: 4, x: 520, y: 262, name: "Timón" },
    { g: "i", n: 5, x: 372, y: 228, name: "Asiento tapizado" },
    { g: "i", n: 6, x: 626, y: 222, name: "Tablero" },
    { g: "c", n: 7, x: 726, y: 290, name: "Motor 4 cilindros" },
    { g: "c", n: 8, x: 622, y: 340, name: "Caja de 3 velocidades" },
    { g: "c", n: 9, x: 252, y: 504, name: "Diferencial" },
    { g: "c", n: 10, x: 838, y: 504, name: "Freno de tambor" },
  ];

  function wheel(cx) {
    let s = `<g class="wh"><circle cx="${cx}" cy="452" r="66" class="tire"/><circle cx="${cx}" cy="452" r="46" class="rim"/><circle cx="${cx}" cy="452" r="28" class="drum"/>`;
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      s += `<line x1="${(cx + Math.cos(a) * 13).toFixed(1)}" y1="${(452 + Math.sin(a) * 13).toFixed(1)}" x2="${(cx + Math.cos(a) * 45).toFixed(1)}" y2="${(452 + Math.sin(a) * 45).toFixed(1)}" class="spoke"/>`;
    }
    return s + `<circle cx="${cx}" cy="452" r="12" class="hub"/></g>`;
  }
  function calls(g) {
    return CALL.filter((c) => c.g === g).map((c) => `<g class="call" data-n="${c.n}"><circle cx="${c.x}" cy="${c.y}" r="19"/><text x="${c.x}" y="${c.y + 7}">${c.n}</text></g>`).join("");
  }

  function svg() {
    const louvers = Array.from({ length: 7 }, (_, k) => `<line x1="${684 + k * 16}" y1="330" x2="${684 + k * 16}" y2="384"/>`).join("");
    const grille = Array.from({ length: 6 }, (_, k) => `<line x1="${810 + k * 4.6}" y1="276" x2="${810 + k * 4.6}" y2="398"/>`).join("");
    const core = Array.from({ length: 10 }, (_, k) => `<line x1="810" y1="${282 + k * 12}" x2="832" y2="${282 + k * 12}"/>`).join("");
    const tuft = [282, 314, 346].map((y) => `<line x1="360" y1="${y}" x2="388" y2="${y + 2}"/>`).join("");
    return `<svg class="dsp-svg" viewBox="110 -170 820 880" role="img" aria-label="Plano de un Ford Model A de 1929 desarmado en capas">
<g class="L Lc">
  <path class="exh" d="M700,404 Q692,430 600,432 L150,438"/>
  <rect class="frame" x="140" y="410" width="740" height="12" rx="3"/>
  <path class="spring" d="M186,438 Q252,420 318,438 M694,438 Q760,420 826,438"/>
  <line class="shaft" x1="602" y1="392" x2="272" y2="446"/>
  <path class="trans" d="M596,364 L664,358 L664,404 L604,400 Z"/>
  <rect class="engine" x="664" y="318" width="124" height="86" rx="8"/>
  <rect class="head" x="668" y="302" width="116" height="18" rx="5"/>
  <g class="plugs"><line x1="690" y1="302" x2="690" y2="290"/><line x1="716" y1="302" x2="716" y2="290"/><line x1="742" y1="302" x2="742" y2="290"/><line x1="768" y1="302" x2="768" y2="290"/></g>
  <circle class="fan" cx="798" cy="336" r="14"/>
  <g class="core"><rect x="808" y="272" width="26" height="136" rx="3"/>${core}</g>
  ${wheel(252)}${wheel(760)}
  <circle class="diff" cx="252" cy="452" r="20"/>
  ${calls("c")}
</g>
<g class="L Li">
  <rect class="floor" x="330" y="424" width="300" height="10" rx="3"/>
  <path class="leather" d="M356,388 L350,262 Q352,244 372,246 L388,250 Q398,254 396,272 L392,388 Z"/>
  <g class="tuft">${tuft}</g>
  <path class="leather" d="M372,394 Q372,370 395,368 L500,368 Q514,370 514,394 Z"/>
  <line class="col" x1="614" y1="414" x2="556" y2="300"/>
  <ellipse class="sw" cx="552" cy="292" rx="10" ry="42" transform="rotate(-28 552 292)"/>
  <rect class="dash" x="598" y="236" width="24" height="84" rx="6"/>
  <circle class="gauge" cx="610" cy="262" r="6"/><circle class="gauge" cx="610" cy="286" r="6"/>
  <line class="col" x1="560" y1="424" x2="546" y2="352"/><circle class="knob" cx="546" cy="348" r="8"/>
  <line class="col" x1="622" y1="418" x2="644" y2="396"/>
  ${calls("i")}
</g>
<g class="L Lb">
  <path class="bd" d="M150,460 L150,452 C150,388 200,368 252,368 C306,368 350,392 360,450 L360,460 Z"/>
  <path class="bd" d="M650,462 L650,452 C664,394 706,370 760,370 C820,370 860,398 882,446 L890,462 Z"/>
  <rect class="bd" x="350" y="448" width="306" height="14" rx="4"/>
  <path class="bd" d="M318,442 L318,232 Q320,186 368,182 L596,182 Q614,184 618,200 L644,302 L652,442 Z"/>
  <rect class="glass" x="386" y="204" width="118" height="82" rx="10"/>
  <path class="glass" d="M520,204 L592,204 L612,286 L520,286 Z"/>
  <path class="bl" d="M318,302 L644,302 M512,300 L512,436 M522,318 L542,318 M372,190 L590,190"/>
  <path class="bd" d="M644,302 L806,294 L812,406 L652,414 Z"/>
  <g class="bl">${louvers}</g>
  <rect class="chrome" x="804" y="262" width="36" height="150" rx="10"/>
  <g class="grl">${grille}</g>
  <path class="bl" d="M842,372 L860,352"/>
  <circle class="lamp" cx="864" cy="330" r="22"/>
  <rect class="chrome" x="132" y="428" width="16" height="24" rx="4"/>
  <rect class="chrome" x="884" y="438" width="26" height="12" rx="4"/>
  ${calls("b")}
</g>
</svg>`;
  }

  function build(sec) {
    const img = sec.dataset.img || "";
    const title = sec.dataset.title || "Ford Model A · 1929";
    const eyebrow = sec.dataset.eyebrow || "De la colección";
    sec.innerHTML = `<div class="dsp-sticky">
  <div class="dsp-head"><div class="dsp-eyebrow">${eyebrow}</div><h2>${title}</h2></div>
  <div class="dsp-stage"><div class="dsp-photo"><img src="${img}" alt="${title} de la Colección Lucioni" loading="lazy"></div>${svg()}</div>
  <div class="dsp-cap">
    <div class="dsp-dots">${STEPS.map(() => "<i></i>").join("")}</div>
    <h3 class="dsp-t">${STEPS[0].t}</h3><p class="dsp-p">${STEPS[0].p}</p>
    <ol class="dsp-legend">${CALL.map((c) => `<li data-g="${c.g}"><b>${c.n}</b>${c.name}</li>`).join("")}</ol>
  </div>
  <div class="dsp-hint">Baja para desarmarlo</div>
</div>`;
    const $ = (s) => sec.querySelector(s);
    const photo = $(".dsp-photo"), sv = $(".dsp-svg"), Lb = $(".Lb"), Li = $(".Li"), Lc = $(".Lc");
    const t = $(".dsp-t"), p = $(".dsp-p"), dots = [...sec.querySelectorAll(".dsp-dots i")], hint = $(".dsp-hint");
    const lis = [...sec.querySelectorAll(".dsp-legend li")], callsEl = [...sec.querySelectorAll(".call")];
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const ease = (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cur = 0, target = 0, step = -1, top = 0, h = 1;
    const measure = () => { const r = sec.getBoundingClientRect(); top = r.top + scrollY; h = Math.max(1, sec.offsetHeight - innerHeight); };
    function setStep(s) {
      if (s === step) return; step = s;
      sec.classList.add("swap");
      setTimeout(() => { t.textContent = STEPS[s].t; p.textContent = STEPS[s].p; sec.classList.remove("swap"); }, reduce ? 0 : 160);
      dots.forEach((d, k) => d.classList.toggle("on", k <= s));
      const show = STEPS[s].show;
      lis.forEach((li) => li.classList.toggle("on", show.includes(li.dataset.g)));
      callsEl.forEach((c) => c.classList.toggle("on", show.includes(c.parentNode.classList.contains("Lb") ? "b" : c.parentNode.classList.contains("Li") ? "i" : "c")));
    }
    function render(v) {
      const ph = clamp((v - 0.08) / 0.14);
      photo.style.opacity = (1 - ph).toFixed(3);
      photo.style.transform = `scale(${(1 + ph * 0.25).toFixed(3)})`;
      sv.style.opacity = clamp((v - 0.12) / 0.1).toFixed(3);
      sv.style.transform = `scale(${(0.9 + 0.1 * ease(clamp((v - 0.12) / 0.14))).toFixed(3)})`;
      const e1 = ease(clamp((v - 0.3) / 0.16)), e2 = ease(clamp((v - 0.56) / 0.18));
      Lb.style.transform = `translateY(${(-262 * e1).toFixed(1)}px)`;
      Lb.style.setProperty("--fo", (1 - e1 * 0.82).toFixed(3));
      Li.style.transform = `translateY(${(-26 * e2).toFixed(1)}px)`;
      Lc.style.transform = `translateY(${(165 * e2).toFixed(1)}px)`;
      hint.style.opacity = (1 - clamp(v / 0.06)).toFixed(3);
      setStep(v < 0.14 ? 0 : v < 0.3 ? 1 : v < 0.46 ? 2 : v < 0.6 ? 3 : 4);
    }
    function loop() {
      target = clamp((scrollY - top) / h);
      cur += (target - cur) * (reduce ? 1 : 0.14);
      if (Math.abs(target - cur) < 0.0005) cur = target;
      render(cur);
      requestAnimationFrame(loop);
    }
    measure(); addEventListener("resize", measure); addEventListener("load", measure);
    render(0); requestAnimationFrame(loop);
  }
  function init() { document.querySelectorAll("section.dsp").forEach(build); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
