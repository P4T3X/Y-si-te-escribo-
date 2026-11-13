/* Vitrina: la foto real del auto empieza como una tarjeta, al bajar se abre a
   pantalla completa y aparecen detalles sobre la foto y sus datos.
   Uso: <section class="vit" data-img="ruta.jpg"></section> + vitrina.css */
(function () {
  const SPOTS = [
    { u: 0.63, v: 0.5, t: "Faros cromados", d: "Grandes, redondos y pulidos a mano." },
    { u: 0.5, v: 0.74, t: "Ruedas de rayos de madera", d: "Con llantas de banda blanca, como salían de fábrica." },
    { u: 0.31, v: 0.57, t: "Estribo", d: "El escalón lateral para subir al auto." },
    { u: 0.83, v: 0.73, t: "Parachoques de triple barra", d: "Cromo brillante de punta a punta." },
  ];
  const SPECS = [
    { n: 4, l: "puertas" },
    { t: "Años 20", l: "su época" },
    { n: 30, p: "+", l: "autos más te esperan en el museo" },
  ];
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => 1 - Math.pow(1 - v, 3);
  const io = (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

  function build(sec) {
    const img = sec.dataset.img, title = sec.dataset.title || "Ford Model A · 1929", eyebrow = sec.dataset.eyebrow || "De la colección";
    sec.innerHTML = `<div class="vit-sticky">
  <div class="vit-intro"><div class="vit-eyebrow">${eyebrow}</div><h2>${title}</h2></div>
  <div class="vit-frame"><img src="${img}" alt="${title} de la Colección Lucioni" decoding="async"><div class="vit-shade"></div>
    ${SPOTS.map((s, i) => `<button class="vit-spot" data-i="${i}" aria-label="${s.t}"><i></i><span><b>${s.t}</b>${s.d}</span></button>`).join("")}
  </div>
  <div class="vit-copy"><div class="vit-eyebrow">${eyebrow}</div><h2>${title}</h2><p>Original, restaurado y listo para rodar.</p></div>
  <div class="vit-specs">${SPECS.map((s) => s.n != null ? `<div><b data-n="${s.n}" data-p="${s.p || ""}">0</b><span>${s.l}</span></div>` : `<div><b>${s.t}</b><span>${s.l}</span></div>`).join("")}</div>
</div>`;
    const $ = (s) => sec.querySelector(s);
    const frame = $(".vit-frame"), pic = $(".vit-frame img"), shade = $(".vit-shade"), intro = $(".vit-intro"), copy = $(".vit-copy"), specs = $(".vit-specs");
    const spots = [...sec.querySelectorAll(".vit-spot")], nums = [...sec.querySelectorAll(".vit-specs b[data-n]")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let top = 0, h = 1, W = 0, H = 0, cur = 0, counted = false;
    const measure = () => { top = sec.getBoundingClientRect().top + scrollY; h = Math.max(1, sec.offsetHeight - innerHeight); W = frame.clientWidth; H = frame.clientHeight; placeSpots(); };

    function placeSpots() {
      const nw = pic.naturalWidth || 1280, nh = pic.naturalHeight || 848;
      const sc = Math.max(W / nw, H / nh), dw = nw * sc, dh = nh * sc;
      const op = getComputedStyle(pic).objectPosition.split(" ").map((x) => parseFloat(x) / 100);
      const ox = (W - dw) * (isNaN(op[0]) ? 0.5 : op[0]), oy = (H - dh) * (isNaN(op[1]) ? 0.5 : op[1]);
      spots.forEach((el, i) => {
        const x = ox + SPOTS[i].u * dw, y = oy + SPOTS[i].v * dh;
        const ok = x > 24 && x < W - 24 && y > 90 && y < H - 150;
        el.style.left = x + "px"; el.style.top = y + "px";
        el.dataset.ok = ok ? "1" : "0";
        el.classList.toggle("left", x > W * 0.6);
      });
    }
    function countUp() {
      if (counted) return; counted = true;
      nums.forEach((b) => { const to = +b.dataset.n, t0 = performance.now();
        const tick = (t) => { const k = Math.min(1, (t - t0) / 1300); b.textContent = (b.dataset.p || "") + Math.round(to * ease(k)); if (k < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick); });
    }
    function render(v) {
      const open = io(clamp(v / 0.32));
      const mw = innerWidth < 760 ? 0.12 : 0.24, mh = innerWidth < 760 ? 0.2 : 0.17;
      const ix = (1 - open) * mw * 100, iy = (1 - open) * mh * 100, r = (1 - open) * 28;
      frame.style.clipPath = `inset(${(iy + 6 * (1 - open)).toFixed(2)}% ${ix.toFixed(2)}% ${(iy - 6 * (1 - open)).toFixed(2)}% ${ix.toFixed(2)}% round ${r.toFixed(1)}px)`;
      pic.style.transform = `scale(${(1.18 - 0.18 * open + 0.06 * clamp((v - 0.4) / 0.6)).toFixed(3)})`;
      intro.style.opacity = (1 - clamp(v / 0.12)).toFixed(3);
      intro.style.transform = `translateY(${(-30 * clamp(v / 0.12)).toFixed(1)}px)`;
      const c = ease(clamp((v - 0.3) / 0.12));
      copy.style.opacity = (c * (1 - clamp((v - 0.41) / 0.05))).toFixed(3);
      copy.style.transform = `translateY(${(26 * (1 - c)).toFixed(1)}px)`;
      shade.style.opacity = (0.35 + 0.5 * clamp((v - 0.3) / 0.15) + 0.15 * clamp((v - 0.74) / 0.1)).toFixed(3);
      spots.forEach((el, i) => el.classList.toggle("on", el.dataset.ok === "1" && v > 0.44 + i * 0.07 && v < 0.78));
      const s = ease(clamp((v - 0.78) / 0.12));
      specs.style.opacity = s.toFixed(3);
      specs.style.transform = `translateY(${(40 * (1 - s)).toFixed(1)}px)`;
      specs.style.pointerEvents = s > 0.5 ? "auto" : "none";
      if (s > 0.3) countUp();
    }
    function loop() {
      const t = clamp((scrollY - top) / h);
      cur += (t - cur) * (reduce ? 1 : 0.14);
      if (Math.abs(t - cur) < 0.0005) cur = t;
      render(cur);
      requestAnimationFrame(loop);
    }
    spots.forEach((el) => el.addEventListener("click", () => { spots.forEach((o) => o !== el && o.classList.remove("open")); el.classList.toggle("open"); }));
    pic.addEventListener("load", measure);
    addEventListener("resize", measure); addEventListener("load", measure);
    measure(); render(0); requestAnimationFrame(loop);
  }
  function init() { document.querySelectorAll("section.vit").forEach(build); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
