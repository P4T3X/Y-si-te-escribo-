/* ¿Y si te escribo? — app principal */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ls = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} } };

/* ---------- Logo animado (inline para poder animar ojos) ---------- */
const FACE = $("#face").innerHTML;
$$("svg.logo").forEach((s) => (s.innerHTML = FACE));
function paintIcons(root = document) { $$("[data-ic]", root).forEach((e) => { e.innerHTML = ic(e.dataset.ic); e.removeAttribute("data-ic"); }); }
paintIcons();
function wink() { $$("svg.logo").forEach((l) => { l.classList.add("wink"); setTimeout(() => l.classList.remove("wink"), 450); }); }
setInterval(wink, 4500);
$$("svg.logo").forEach((l) => l.addEventListener("click", (e) => { wink(); hearts(e.clientX, e.clientY, 10); }));

/* ---------- Efectos ---------- */
const EM = [["heart", "#ff4f8b"], ["sparkle", "#ffd166"], ["heartO", "#ff8fb6"], ["star", "#ffd166"], ["face-flirty", "#ff4f8b"], ["chat", "#a45cff"]];
function floater() {
  if (reduce || document.hidden) return;
  const e = document.createElement("div");
  const [n, col] = EM[(Math.random() * EM.length) | 0]; e.className = "fl"; e.innerHTML = ic(n); e.style.color = col;
  const sz = 18 + Math.random() * 24; e.style.left = Math.random() * 100 + "vw"; e.style.width = e.style.height = sz + "px";
  e.style.setProperty("--r", Math.random() * 80 - 40 + "deg"); e.style.animationDuration = 9 + Math.random() * 8 + "s";
  $("#floaters").append(e); setTimeout(() => e.remove(), 18000);
}
for (let i = 0; i < 4; i++) setTimeout(floater, i * 800);
setInterval(floater, innerWidth < 700 ? 2600 : 1800);

function hearts(x, y, n = 14) {
  if (reduce) return;
  for (let i = 0; i < n; i++) {
    const h = document.createElement("div");
    const bp = [["heart", "#ff4f8b"], ["sparkle", "#ffd166"], ["heart", "#ff8fb6"], ["starF", "#ffd166"], ["heart", "#a45cff"]][i % 5]; h.className = "burst"; h.innerHTML = ic(bp[0]); h.style.color = bp[1]; h.style.width = h.style.height = "24px";
    h.style.left = x + "px"; h.style.top = y + "px";
    const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 90;
    h.style.setProperty("--dx", Math.cos(a) * d + "px"); h.style.setProperty("--dy", Math.sin(a) * d - 40 + "px"); h.style.setProperty("--r", Math.random() * 120 - 60 + "deg");
    document.body.append(h); setTimeout(() => h.remove(), 950);
  }
}
let toastT;
function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("on"), 2000); }
function modal(html) { $("#modalBox").innerHTML = html + '<button class="go" id="mClose">¡Vamos!</button>'; paintIcons($("#modalBox")); $("#modal").classList.remove("hide"); $("#mClose").onclick = () => $("#modal").classList.add("hide"); }

/* Frases que se escriben solas */
const LINES = ["Sube la captura y te digo qué responderle", "Practica con el simulador antes de escribirle", "Revisa tu mensaje antes de mandarlo", "Nunca más la dejes en visto"];
(function tw() {
  let li = 0, ci = 0, del = false;
  (function step() {
    const t = LINES[li]; $$(".tw").forEach((e) => (e.textContent = t.slice(0, ci)));
    if (!del && ci < t.length) { ci++; setTimeout(step, 45); }
    else if (!del) { del = true; setTimeout(step, 1800); }
    else if (ci > 0) { ci--; setTimeout(step, 18); }
    else { del = false; li = (li + 1) % LINES.length; setTimeout(step, 300); }
  })();
})();

/* ---------- API ---------- */
let TOKEN = ls.get("yste_token");
let DATA = null;
async function api(path, method = "GET", body) {
  if (window.PREVIEW_API) return window.PREVIEW_API(path, method, body, TOKEN);
  let r;
  try {
    r = await fetch("/api/" + path, {
      method,
      headers: { "content-type": "application/json", ...(TOKEN ? { authorization: "Bearer " + TOKEN } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch { throw new Error("Sin conexión a internet"); }
  const d = await r.json().catch(() => ({ error: "Error del servidor" }));
  if (r.status === 401 && path !== "login") { logout(); throw new Error(d.error || "Inicia sesión otra vez"); }
  if (!r.ok) throw new Error(d.error || "Algo falló");
  return d;
}
let saveT;
function save() {
  ls.set("yste_cache", JSON.stringify(DATA));
  clearTimeout(saveT);
  saveT = setTimeout(() => api("data", "PUT", { data: DATA }).catch((e) => toast("No se pudo guardar: " + e.message)), 700);
}
async function ai(mode, payload) {
  const pr = DATA.profile || {};
  if (pr.voice && pr.voiceOn !== false) payload = { ...payload, voice: pr.voice };
  if (pr.hot) payload = { ...payload, hot: true };
  if (pr.target && pr.target !== "chica") payload = { ...payload, target: pr.target };
  if (pr.region) payload = { ...payload, region: pr.region };
  if ((DATA.likes || []).length) payload = { ...payload, likes: DATA.likes.slice(0, 6) };
  if ((DATA.dislikes || []).length) payload = { ...payload, dislikes: DATA.dislikes.slice(0, 6) };
  const d = await api("ai", "POST", { mode, payload });
  return d.result;
}

/* ---------- Datos, niveles, logros ---------- */
const LEVELS = [[0, "Novato"], [100, "Aprendiz del floro"], [300, "Labia fina"], [700, "Galán certificado"], [1500, "Leyenda del ¿y si te escribo?"]];
const BADGES = [
  { id: "first", e: "target", t: "Primer análisis" },
  { id: "opener", e: "rocket", t: "Rompehielos" },
  { id: "check", e: "shield", t: "Antes de la cagada" },
  { id: "decode", e: "search", t: "Detective" },
  { id: "sim", e: "game", t: "Primera práctica" },
  { id: "sim80", e: "trophy", t: "Práctica 80+" },
  { id: "crush", e: "heart", t: "Primer crush" },
  { id: "fav5", e: "starF", t: "5 favoritos" },
  { id: "streak3", e: "fire", t: "Racha de 3 días" },
  { id: "invite", e: "calendar", t: "La invité" },
  { id: "double", e: "traffic", t: "Paciencia" },
  { id: "photo", e: "camera2", t: "Con foto" },
  { id: "voice", e: "voice", t: "Suena a mí" },
  { id: "cita", e: "calendar", t: "Cita en el simulador" },
  { id: "llamada", e: "phone", t: "Primera llamada" },
  { id: "share", e: "share", t: "Lo compartí" },
  { id: "heat", e: "fire", t: "Zona HOT" },
  { id: "escena", e: "target", t: "Escenario superado" },
  { id: "aprende", e: "brainUp", t: "IA entrenada" },
  { id: "perfil", e: "camera2", t: "Perfil revisado" },
];
function level(xp) { let i = 0; LEVELS.forEach((l, k) => { if (xp >= l[0]) i = k; }); return i; }
function ensure() {
  DATA = Object.assign({ profile: { name: "", style: "relajado" }, xp: 0, crushes: [], favs: [], history: [], badges: [], streak: { last: "", count: 0 } }, DATA || {});
}
function weekId(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return t.getUTCFullYear() + "-W" + String(Math.ceil(((t - y) / 864e5 + 1) / 7)).padStart(2, "0");
}
function addXP(n) {
  const before = level(DATA.xp);
  const wk = weekId(); if (!DATA.week || DATA.week.id !== wk) DATA.week = { id: wk, xp: 0 }; DATA.week.xp += n;
  DATA.xp += n; renderTop(); save();
  const after = level(DATA.xp);
  if (after > before) { hearts(innerWidth / 2, innerHeight / 2, 24); modal(`<div class="big" data-ic="party"></div><h2>¡Subiste de nivel!</h2><p class="lead">Ahora eres <b>${LEVELS[after][1]}</b>.</p>`); }
}
function badge(id) {
  if (DATA.badges.includes(id)) return;
  DATA.badges.push(id); save();
  const b = BADGES.find((x) => x.id === id);
  setTimeout(() => toast(`Logro desbloqueado: ${b.t}`), 600);
}
function touchStreak() {
  const t = new Date().toISOString().slice(0, 10);
  if (DATA.streak.last === t) return;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  DATA.streak.count = DATA.streak.last === y ? DATA.streak.count + 1 : 1;
  DATA.streak.last = t;
  if (DATA.streak.count >= 3) badge("streak3");
  save();
}
function log(tool, summary) { DATA.history.unshift({ tool, summary: String(summary).slice(0, 120), date: Date.now() }); DATA.history = DATA.history.slice(0, 40); }
function renderTop() {
  const i = level(DATA.xp), cur = LEVELS[i][0], next = LEVELS[i + 1]?.[0];
  $("#helloName").textContent = "Hola, " + (DATA.profile.name || "galán");
  $("#lvlName").textContent = LEVELS[i][1];
  $("#xpTxt").textContent = next ? `${DATA.xp}/${next} XP` : `${DATA.xp} XP · máx.`;
  $("#xpFill").style.width = next ? ((DATA.xp - cur) / (next - cur)) * 100 + "%" : "100%";
  $("#topAv").innerHTML = avatarInner(); $("#topAv").onclick = () => go("profile");
  $(".topbar .logo").onclick = secretTap;
}

/* ---------- Cuenta ---------- */
let authMode = "register";
$$(".tab").forEach((t) => (t.onclick = () => {
  authMode = t.dataset.tab;
  $$(".tab").forEach((x) => x.classList.toggle("on", x === t));
  $("#nameRow").classList.toggle("hide", authMode === "login");
  $("#authBtn").textContent = authMode === "login" ? "Entrar" : "Crear mi cuenta";
  $("#aPass").autocomplete = authMode === "login" ? "current-password" : "new-password";
  $("#authStatus").textContent = "";
}));
$("#authForm").onsubmit = async (e) => {
  e.preventDefault();
  const st = $("#authStatus"); st.className = "status"; st.textContent = "Un momento…";
  $("#authBtn").disabled = true;
  try {
    const body = { email: $("#aEmail").value, password: $("#aPass").value, name: $("#aName").value };
    const d = await api(authMode, "POST", body);
    if (d.pending) { st.textContent = ""; showVerify(d); return; }
    TOKEN = d.token; ls.set("yste_token", TOKEN); DATA = d.data;
    enterApp(authMode === "register");
  } catch (err) { st.className = "status err"; st.textContent = err.message; }
  finally { $("#authBtn").disabled = false; }
};

/* ---------- Verificación por correo ---------- */
let vEmail = "", vIsNew = true;
(function buildCode() {
  const box = $("#codeIn");
  for (let i = 0; i < 6; i++) { const inp = document.createElement("input"); inp.inputMode = "numeric"; inp.autocomplete = i ? "off" : "one-time-code"; inp.setAttribute("aria-label", "Dígito " + (i + 1)); box.append(inp); }
  const ins = $$("input", box);
  ins.forEach((inp, i) => {
    inp.oninput = () => {
      const v = inp.value.replace(/\D/g, "");
      if (v.length > 1) { v.split("").slice(0, 6).forEach((ch, k) => { if (ins[k]) ins[k].value = ch; }); ins[Math.min(5, v.length - 1)].focus(); }
      else { inp.value = v.slice(0, 1); if (v && ins[i + 1]) ins[i + 1].focus(); }
      if (ins.every((x) => x.value)) $("#vBtn").click();
    };
    inp.onkeydown = (e) => { if (e.key === "Backspace" && !inp.value && ins[i - 1]) ins[i - 1].focus(); };
  });
})();
function showVerify(d) {
  vEmail = d.email; vIsNew = authMode === "register";
  $("#authForm").classList.add("hide"); $(".tabs").classList.add("hide"); $("#verifyBox").classList.remove("hide");
  $("#vEmail").textContent = d.email; $("#vStatus").textContent = ""; $$("#codeIn input").forEach((x) => (x.value = ""));
  inbox(d.devCode);
  setTimeout(() => $("#codeIn input").focus(), 200);
}
function inbox(code) {
  $("#vInbox").innerHTML = code ? `<div class="inbox"><div class="from">${ic("mail")} <span><b>¿Y si te escribo?</b> · ahora<br>Vista previa: así llegaría el correo</span></div><div class="cd">${esc(code)}</div><small class="lead">En la versión publicada este código llega a tu correo de verdad.</small></div>` : "";
}
function hideVerify() { $("#verifyBox").classList.add("hide"); $("#authForm").classList.remove("hide"); $(".tabs").classList.remove("hide"); }
$("#vBack").onclick = hideVerify;
$("#vBtn").onclick = async () => {
  const code = $$("#codeIn input").map((x) => x.value).join("");
  const st = $("#vStatus"); st.className = "status";
  if (code.length < 6) { st.textContent = "Escribe los 6 dígitos"; return; }
  $("#vBtn").disabled = true; st.textContent = "Verificando…";
  try {
    const d = await api("verify", "POST", { email: vEmail, code });
    TOKEN = d.token; ls.set("yste_token", TOKEN); DATA = d.data; hideVerify();
    enterApp(vIsNew);
  } catch (e) { st.className = "status err"; st.textContent = e.message; $("#codeIn").animate([{ transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "none" }], { duration: 300 }); $$("#codeIn input").forEach((x) => (x.value = "")); $("#codeIn input").focus(); }
  finally { $("#vBtn").disabled = false; }
};
$("#vResend").onclick = async () => {
  const st = $("#vStatus"); st.className = "status";
  try { const d = await api("resend", "POST", { email: vEmail }); st.textContent = "Te mandamos un código nuevo"; inbox(d.devCode); }
  catch (e) { st.className = "status err"; st.textContent = e.message; }
};

function logout() {
  document.body.classList.remove("hot");
  TOKEN = null; DATA = null; ls.set("yste_token", null); ls.set("yste_cache", null);
  $("#app").classList.add("hide"); showLanding();
}
function setHot(on, anim) {
  DATA.profile.hot = !!on; document.body.classList.toggle("hot", !!on);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = on ? "#1a0405" : "#0e0d12";
  if (anim && on) { document.body.classList.add("hotflash"); setTimeout(() => document.body.classList.remove("hotflash"), 1600); for (let i = 0; i < 4; i++) setTimeout(() => hearts(innerWidth * Math.random(), innerHeight * (0.3 + Math.random() * 0.5), 14), i * 250); }
}
let logoTaps = [];
function secretTap() {
  const now = Date.now(); logoTaps = logoTaps.filter((t) => now - t < 4000); logoTaps.push(now);
  if (logoTaps.length >= 5) { logoTaps = []; pedirCodigo(); }
}
const normCode = (v) => String(v || "").toUpperCase().normalize("NFD").replace(/[^A-Z0-9]/g, "");
function codigoValido(v) { const c = normCode(v); return !!c && (c === "HOT" || c === normCode(DATA.profile.hotCode)); }
function activarHot(v) {
  if (!codigoValido(v)) return false;
  setHot(true, true); save(); toast("Modo HOT activado"); return true;
}
function pedirCodigo() {
  modal(`<div class="big" data-ic="fire"></div><h2>Zona secreta</h2><p class="lead">Escribe tu código secreto para activar el Modo HOT.</p><form id="hotForm"><input id="hotCode" placeholder="Código" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" enterkeyhint="go" style="text-align:center;font:700 22px Space Grotesk;letter-spacing:4px;margin:6px 0 4px"></form>`);
  const i = $("#hotCode"), btn = $("#mClose");
  btn.textContent = "Activar";
  const ok = (e) => { if (e) e.preventDefault(); if (activarHot(i.value)) { $("#modal").classList.add("hide"); go(current); } else { i.value = ""; i.animate([{ transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "none" }], { duration: 300 }); toast(i.value ? "Código incorrecto" : "Código incorrecto"); } };
  btn.onclick = ok; $("#hotForm").onsubmit = ok;
  setTimeout(() => i.focus(), 80);
}
async function takeShared() {
  if (!/[?&]shared=1/.test(location.search) || !("caches" in window)) return false;
  try {
    const c = await caches.open("yste-shared"), ks = await c.keys();
    for (const k of ks) { const r = await c.match(k); const b = await r.blob(); SHARED_FILES.push(new File([b], "captura.jpg", { type: b.type || "image/jpeg" })); await c.delete(k); }
    history.replaceState(null, "", "/");
  } catch {}
  return SHARED_FILES.length > 0;
}
function enterApp(isNew) {
  ensure(); touchStreak(); setHot(DATA.profile.hot);
  takeShared().then((ok) => ok && go("reply"));
  $("#auth").classList.add("hide"); $("#landing").classList.add("hide"); $("#app").classList.remove("hide");
  renderTop(); go("home");
  if (isNew) { hearts(innerWidth / 2, innerHeight / 3, 24); setTimeout(() => toast("Tip: en Perfil elige de dónde eres y a quién le hablas"), 4000); modal(`<div class="big" data-ic="face-flirty"></div><h2>¡Bienvenido, ${esc(DATA.profile.name)}!</h2><p class="lead">Gana XP usando las herramientas, mantén tu racha diaria y desbloquea logros. Empieza subiendo la captura de un chat.</p>`); }
}
async function boot() {
  if (!TOKEN) return showLanding();
  try { DATA = JSON.parse(ls.get("yste_cache") || "null"); } catch {}
  if (DATA) enterApp(false);
  try { const d = await api("data"); DATA = d.data; enterApp(false); }
  catch (e) { if (!DATA) logout(); }
}

/* ---------- Navegación ---------- */
const V = $("#view");
let current = "home";
$$("nav.bottom button").forEach((b) => (b.onclick = () => go(b.dataset.go)));
function go(name, arg) {
  current = name;
  const tab = TOOLS[name] ? "home" : name.startsWith("crush") ? "crushes" : name;
  $$("nav.bottom button").forEach((b) => b.classList.toggle("on", b.dataset.go === tab));
  V.className = "wrap view-in"; void V.offsetWidth;
  (VIEWS[name] || VIEWS.home)(arg);
  scrollTo({ top: 0, behavior: "smooth" });
}
const backBtn = (to = "home") => `<button class="back" data-back="${to}">${ic("arrowL")} Volver</button>`;
function wireBack() { $$("[data-back]", V).forEach((b) => (b.onclick = () => go(b.dataset.back))); }

/* ---------- Componentes compartidos ---------- */
function avatarInner() { const p = DATA.profile.photo; return p ? `<img src="${p}" alt="Tu foto">` : ic("face"); }
async function photoFrom(file) {
  const bmp = await createImageBitmap(file), s = Math.min(bmp.width, bmp.height), N = 220;
  const cv = document.createElement("canvas"); cv.width = cv.height = N;
  cv.getContext("2d").drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, N, N);
  return cv.toDataURL("image/jpeg", 0.82);
}
let SHARED_FILES = [];
function uploader(id) {
  const st = { imgs: SHARED_FILES.splice(0, 4) };
  const html = `<div class="drop" id="${id}" role="button" tabindex="0"><b>${ic("camera")} Toca para subir capturas</b><small>o arrástralas / pégalas aquí (hasta 4)</small><input type="file" accept="image/*" multiple hidden></div><div class="thumbs"></div>`;
  function mount() {
    const drop = $("#" + id), input = $("input", drop), th = drop.nextElementSibling;
    const draw = () => { th.innerHTML = ""; st.imgs.forEach((f, i) => { const d = document.createElement("div"); d.innerHTML = `<img alt="Captura ${i + 1}"><button aria-label="Quitar captura">${ic("close")}</button>`; $("img", d).src = URL.createObjectURL(f); $("button", d).onclick = () => { st.imgs.splice(i, 1); draw(); }; th.append(d); }); };
    const add = (list) => { for (const f of list) if (f.type.startsWith("image/") && st.imgs.length < 4) st.imgs.push(f); draw(); wink(); };
    drop.onclick = () => input.click();
    drop.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } };
    input.onchange = () => add(input.files);
    ["dragover", "dragenter"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
    drop.addEventListener("drop", (e) => add(e.dataTransfer.files));
    if (st.imgs.length) { draw(); toast("Captura recibida desde Compartir"); }
    st.onPaste = (e) => { const f = [...(e.clipboardData?.items || [])].filter((i) => i.type.startsWith("image/")).map((i) => i.getAsFile()); if (f.length) add(f); };
    document.onpaste = st.onPaste;
  }
  async function encoded() {
    return Promise.all(st.imgs.map(async (file) => {
      const bmp = await createImageBitmap(file), s = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
      const cv = document.createElement("canvas"); cv.width = bmp.width * s; cv.height = bmp.height * s;
      cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
      return { type: "image/jpeg", data: cv.toDataURL("image/jpeg", 0.82).split(",")[1] };
    }));
  }
  return { html, mount, encoded, st };
}
function crushSelect(id, selected) {
  if (!DATA.crushes.length) return `<input type="hidden" id="${id}" value="">`;
  return `<label for="${id}">¿Con quién hablas? (la IA usa tus notas sobre ella)</label><select id="${id}"><option value="">Nadie en especial</option>${DATA.crushes.map((c) => `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select>`;
}
const getCrush = (id) => DATA.crushes.find((c) => c.id === id);
const crushPayload = (id) => { const c = getCrush(id); return c ? { name: c.name, notes: c.notes } : null; };
function styleChips() {
  const s = DATA.profile.style || "relajado";
  return `<label>Tu estilo</label><div class="row" id="styles">${[["relajado", ic("face-cool") + " Relajado"], ["gracioso", ic("face-laugh") + " Gracioso"], ["seguro y directo", ic("fire") + " Seguro"], ["tierno", ic("heart") + " Tierno"]].map(([v, t]) => `<button class="chip ${v === s ? "on" : ""}" data-v="${v}">${t}</button>`).join("")}</div>`;
}
function wireStyles() { $$("#styles .chip", V).forEach((c) => (c.onclick = () => { $$("#styles .chip", V).forEach((x) => x.classList.remove("on")); c.classList.add("on"); DATA.profile.style = c.dataset.v; save(); })); }
const loadingHTML = `<div class="loading" id="loading"><i></i><i></i><i></i><span id="ltxt"></span></div><p class="status" id="st"></p><div id="out"></div>`;
async function withLoading(btn, msgs, fn) {
  const L = $("#loading", V), lt = $("#ltxt", V), st = $("#st", V);
  btn.disabled = true; st.textContent = ""; st.className = "status"; L.classList.add("on");
  let k = 0; lt.textContent = msgs[0]; const iv = setInterval(() => { k = (k + 1) % msgs.length; lt.textContent = msgs[k]; }, 1600);
  try { await fn(); } catch (e) { st.className = "status err"; st.textContent = e.message; }
  finally { clearInterval(iv); L.classList.remove("on"); btn.disabled = false; }
}
function optCard(o, cat, color, delay, tag) {
  const isFav = DATA.favs.some((f) => f.msg === o.msg);
  const liked = (DATA.likes || []).includes(o.msg), disliked = (DATA.dislikes || []).includes(o.msg);
  return `<div class="opt ${cat}" style="--c:${color};animation-delay:${delay}s">${tag ? `<span class="tag tec">${esc(tag)}</span>` : ""}<p>${esc(o.msg)}</p>${o.por ? `<small>${esc(o.por)}</small>` : ""}<div class="acts"><button class="copy" data-copy="${esc(o.msg)}" data-cat="${cat}">${ic("copy")} Copiar</button><button class="copy ${isFav ? "faved" : ""}" data-fav="${esc(o.msg)}" data-cat="${cat}" aria-label="Guardar en favoritos">${isFav ? ic("starF") + " Guardada" : ic("star") + " Guardar"}</button><button class="copy" data-tw="${esc(o.msg)}" aria-label="Ajustar respuesta">${ic("wand")} Ajustar</button><span class="fb"><button class="fbb up ${liked ? "on" : ""}" data-like="${esc(o.msg)}" aria-label="Me gusta">${ic("up")}</button><button class="fbb down ${disliked ? "on" : ""}" data-dislike="${esc(o.msg)}" aria-label="No me gusta">${ic("down")}</button></span></div></div>`;
}
const TWEAKS = ["más corto", "más pícaro", "más tierno", "más gracioso", "más directo", "más natural"];
function wireExtras(root = V) {
  const mark = (msg, good, btn) => {
    DATA.likes = (DATA.likes || []).filter((x) => x !== msg); DATA.dislikes = (DATA.dislikes || []).filter((x) => x !== msg);
    const opt = btn.closest(".opt"); const was = btn.classList.contains("on");
    opt.querySelectorAll(".fbb").forEach((b) => b.classList.remove("on"));
    if (!was) { (good ? DATA.likes : DATA.dislikes).unshift(msg); btn.classList.add("on"); }
    DATA.likes = DATA.likes.slice(0, 20); DATA.dislikes = DATA.dislikes.slice(0, 20); save();
    if (!was) { toast(good ? "Anotado: la IA hará más respuestas así" : "Anotado: la IA evitará ese estilo"); if ((DATA.likes.length + DATA.dislikes.length) >= 5) badge("aprende"); }
  };
  $$("[data-like]", root).forEach((b) => (b.onclick = (e) => { mark(b.dataset.like, true, b); if (b.classList.contains("on")) hearts(e.clientX, e.clientY, 5); }));
  $$("[data-dislike]", root).forEach((b) => (b.onclick = () => mark(b.dataset.dislike, false, b)));
  $$("[data-tw]", root).forEach((b) => (b.onclick = () => {
    const opt = b.closest(".opt"); let box = opt.querySelector(".tweaks");
    if (box) { box.remove(); return; }
    box = document.createElement("div"); box.className = "tweaks";
    box.innerHTML = TWEAKS.map((t) => `<button class="chip" data-a="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("");
    opt.append(box);
    $$("[data-a]", box).forEach((c) => (c.onclick = async () => {
      $$("[data-a]", box).forEach((x) => (x.disabled = true)); c.textContent = "Pensando…";
      try {
        const r = await ai("tweak", { msg: b.dataset.tw, accion: c.dataset.a });
        const out = document.createElement("div"); out.className = "tweakout";
        out.innerHTML = (r.opciones || []).map((o) => optCard(o, "normal", "var(--violet)", 0, c.dataset.a)).join("");
        box.replaceWith(out); wireOpts(out); addXP(2);
      } catch (e) { toast(e.message); box.remove(); }
    }));
  }));
}
function wireOpts(root = V) {
  wireExtras(root);
  $$("[data-copy]", root).forEach((b) => (b.onclick = async (e) => {
    hearts(e.clientX, e.clientY, b.dataset.cat === "picara" ? 16 : 8);
    try { await navigator.clipboard.writeText(b.dataset.copy); toast(b.dataset.cat === "picara" ? "¡Copiado! Atrévete" : "¡Copiado! Ahora mándaselo"); addXP(2); }
    catch { toast("Mantén presionado el texto para copiarlo"); }
  }));
  $$("[data-fav]", root).forEach((b) => (b.onclick = (e) => {
    const msg = b.dataset.fav, i = DATA.favs.findIndex((f) => f.msg === msg);
    if (i >= 0) { DATA.favs.splice(i, 1); b.classList.remove("faved"); b.innerHTML = ic("star") + " Guardar"; }
    else { DATA.favs.unshift({ msg, cat: b.dataset.cat, date: Date.now() }); b.classList.add("faved"); b.innerHTML = ic("starF") + " Guardada"; hearts(e.clientX, e.clientY, 6); if (DATA.favs.length >= 5) badge("fav5"); dailyEvent({ type: "fav" }); }
    save(); if (current === "favs") go("favs");
  }));
}
function meterHTML(lvl, lectura) {
  const tag = lvl >= 75 ? ic("fire") + " Le gustas" : lvl >= 50 ? ic("face-flirty") + " Hay química" : lvl >= 25 ? ic("face-think") + " Tibio" : ic("snow") + " Frío";
  return `<div class="card read"><h3>Lectura del chat</h3><div class="mlabel"><span>Medidor de interés</span><span>${tag} · ${lvl}%</span></div><div class="meter"><div data-w="${lvl}"></div></div><div>${esc(lectura)}</div></div>`;
}
function animateMeters() { requestAnimationFrame(() => requestAnimationFrame(() => $$(".meter div[data-w]", V).forEach((m) => (m.style.width = m.dataset.w + "%")))); }
function celebrate(btn, xp, badgeId) { if (badgeId && TOOLS[badgeId]) dailyEvent({ type: "tool", v: badgeId }); const b = btn.getBoundingClientRect(); hearts(b.left + b.width / 2, b.top, 18); wink(); addXP(xp); if (badgeId) badge(badgeId); }


/* ---------- Reto del día ---------- */
const RETOS = [
  { t: "Consigue una cita con Cami en el simulador", ic: "face-roll", ok: (e) => e.type === "simCita" && e.p === "Cami" },
  { t: "Saca 70 o más en el simulador", ic: "trophy", ok: (e) => e.type === "simScore" && e.v >= 70 },
  { t: "Haz que Dani (la cortante) se ría", ic: "face-flat", ok: (e) => e.type === "simInteres" && e.p === "Dani" && e.v >= 70 },
  { t: "Revisa un mensaje con ¿La cagué? antes de mandarlo", ic: "shield", ok: (e) => e.type === "tool" && e.v === "check" },
  { t: "Consigue una cita con Lu sin que te deje en visto", ic: "face-flirty", ok: (e) => e.type === "simCita" && e.p === "Lu" && !e.visto },
  { t: "Arma un plan de cita con Invítala", ic: "calendar", ok: (e) => e.type === "tool" && e.v === "invite" },
  { t: "Guarda 2 frases en favoritos", ic: "starF", ok: (e) => e.type === "fav" && e.v >= 2 },
];
function retoHoy() { const d = new Date(); return RETOS[(d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate()) % RETOS.length]; }
function dailyEvent(e) {
  const t = new Date().toISOString().slice(0, 10);
  if (!DATA.daily || DATA.daily.date !== t) DATA.daily = { date: t, done: false, favs: 0 };
  if (DATA.daily.done) return;
  if (e.type === "fav") e.v = ++DATA.daily.favs;
  if (retoHoy().ok(e)) { DATA.daily.done = true; save(); setTimeout(() => { hearts(innerWidth / 2, innerHeight / 2, 24); modal(`<div class="big" data-ic="trophy"></div><h2>¡Reto del día cumplido!</h2><p class="lead">${esc(retoHoy().t)}<br><b>+30 XP</b></p>`); addXP(30); }, 900); }
  else save();
}

/* ---------- Herramientas ---------- */
const TOOLS = {
  reply: { e: "camera", t: "Responder chat", d: "Sube la captura y te doy respuestas", c: "var(--pink)" },
  opener: { e: "rocket", t: "Abridores", d: "Cómo empezar a hablarle según su perfil", c: "var(--violet)" },
  check: { e: "shield", t: "¿La cagué?", d: "Revisa tu mensaje antes de mandarlo", c: "var(--yellow)", nuevo: true },
  decode: { e: "search", t: "¿Qué quiso decir?", d: "Decodifica sus mensajes raros", c: "var(--blue)", nuevo: true },
  invite: { e: "calendar", t: "Invítala", d: "Planes de cita y el mensaje para invitarla", c: "var(--pink)", nuevo: true },
  double: { e: "traffic", t: "¿Le escribo otra vez?", d: "Semáforo para no insistir de más", c: "var(--yellow)", nuevo: true },
  juegos: { e: "party", t: "Juegos para la previa", d: "Verdad o reto, yo nunca, botella… con versión picante", c: "#ff2d6f", nuevo: true },
  escenas: { e: "target", t: "Escenarios", d: "Practica situaciones difíciles: reconectar, pedir el número, primera cita…", c: "var(--green)", nuevo: true },
  perfil: { e: "camera2", t: "Revisa mi perfil", d: "Qué foto poner primero y una bio que funcione", c: "#ff7a3d", nuevo: true },
  progreso: { e: "chart", t: "Mi progreso", d: "Cómo vas mejorando semana a semana", c: "var(--blue)", nuevo: true },
  ranking: { e: "trophy", t: "Ranking semanal", d: "Compite con otros usuarios por XP", c: "var(--yellow)", nuevo: true },
  heat: { e: "fire", t: "Subir la temperatura", d: "3 niveles de coqueteo, de suave a atrevido", c: "#ff2d2d", nuevo: true, hot: true },
  chats: { e: "chat", t: "Varias a la vez", d: "Lleva el control de todas tus conversaciones", c: "var(--blue)", nuevo: true },
  ruleta: { e: "refresh", t: "Ruleta de temas", d: "Gira y revive la conversación", c: "var(--violet)", nuevo: true },
  sim: { e: "game", t: "Simulador", d: "10 chicas con personalidades distintas: cortante, pícara, tímida, sarcástica… Consigue la cita sin que te dejen en visto", c: "var(--green)", nuevo: true, big: true },
};
const TIPS = ["Responde con una pregunta abierta cuando sientas que la charla se apaga.", "Un buen mensaje pícaro deja algo a la imaginación.", "No respondas siempre al instante: tómate tu tiempo, pero sin hacerte el difícil.", "Si te deja en visto dos veces, suelta. La dignidad también enamora.", "Invitar a algo concreto (un café el jueves) funciona mejor que un “salgamos algún día”.", "Recuerda detalles que te contó; guárdalos en las notas de tu crush."];

const VIEWS = {
  home() {
    const s = DATA.streak.count || 0;
    V.innerHTML = `
      ${(() => { const r = retoHoy(), done = DATA.daily && DATA.daily.date === new Date().toISOString().slice(0, 10) && DATA.daily.done; return `<div class="card daily ${done ? "done" : ""}">${ic(done ? "check" : r.ic)}<div><small>Reto del día</small><b>${esc(r.t)}</b></div><span class="xp">${done ? "Hecho" : "+30 XP"}</span></div>`; })()}
      <form class="card quick" id="qForm"><h3>${ic("bolt")} Respuesta rápida</h3><textarea id="qText" rows="2" placeholder="Pega lo que te escribió y te doy respuestas al toque"></textarea><button class="go" style="margin-top:10px">${ic("sparkle")} Responder</button></form>
      <div class="card streak"><span class="fire">${ic("fire")}</span><div><b>Racha de ${s} día${s === 1 ? "" : "s"}</b><small>${s >= 3 ? "¡Estás que ardes! No la pierdas." : "Entra cada día para mantener tu racha."}</small></div></div>
      ${DATA.profile.hot ? `<div class="card hotbanner">${ic("fire")}<div><b>Modo HOT activo</b><small>Todas las respuestas salen más atrevidas</small></div></div>` : ""}
      <div class="grid">${Object.entries(TOOLS).filter(([, t]) => !t.hot || DATA.profile.hot).map(([k, t], i) => `<button class="tool ${t.big ? "big" : ""}" data-tool="${k}" style="--c:${t.c};animation-delay:${i * 0.07}s">${t.nuevo ? '<span class="new">NUEVO</span>' : ""}<span class="ic">${ic(t.e)}</span><b>${t.t}</b><small>${t.d}</small></button>`).join("")}</div>
      <div class="card tipday" style="animation-delay:.4s"><b>${ic("bulb")} Tip del día:</b> ${TIPS[new Date().getDate() % TIPS.length]}</div>
      <p class="madeby">Made by: <a href="https://ysiteescrib.netlify.app/lucioni/" target="_blank" rel="noopener"><b>Lucioni Enterprises</b></a></p>`;
    $$("[data-tool]", V).forEach((b) => (b.onclick = () => go(b.dataset.tool)));
    $("#qForm", V).onsubmit = (e) => { e.preventDefault(); const t = $("#qText", V).value.trim(); if (!t) return toast("Pega primero lo que te escribió"); go("reply", { quick: t }); };
  },

  reply(arg) {
    const quick = arg && arg.quick ? arg.quick : null, crushId = typeof arg === "string" ? arg : null;
    const up = uploader("dropR");
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("camera")} Responder chat</h1><p class="lead">Sube la captura y te doy respuestas pícaras, normales y para seguir la conversación.</p>
      ${up.html}
      <label for="rText">¿No tienes captura? Pega el chat (opcional)</label><textarea id="rText" rows="3" placeholder="Ella: jaja qué haces?&#10;Yo: nada, aburrido"></textarea>
      ${crushSelect("rCrush", crushId)}
      <label for="rCtx">Contexto (opcional)</label><input id="rCtx" placeholder="Ej: quiero invitarla a salir este finde">
      ${styleChips()}
      <button class="go" id="rGo">${ic("sparkle")} Dame respuestas pícaras</button>${loadingHTML}`;
    up.mount(); wireBack(); wireStyles();
    const run = async () => {
      const chat = $("#rText", V).value.trim();
      if (!up.st.imgs.length && !chat) { $("#st", V).textContent = "Sube una captura o pega el chat primero"; return; }
      await withLoading($("#rGo", V), ["Leyendo el chat…", "Analizando sus señales…", "Afilando la labia…", "Casi listo…"], async () => {
        const cid = $("#rCrush", V).value;
        const r = await ai("reply", { images: await up.encoded(), chat, ctx: $("#rCtx", V).value.trim(), style: DATA.profile.style, crush: crushPayload(cid) });
        const lvl = Math.max(0, Math.min(100, Number(r.interes) || 0));
        const cats = [["picara", ic("face-flirty") + " Pícara", "var(--pink)"], ["normal", ic("face") + " Normal", "var(--blue)"], ["seguir", ic("chat") + " Para seguir la conversación", "var(--green)"]];
        let dl = 0.1;
        $("#out", V).innerHTML = `<div class="res">${meterHTML(lvl, r.lectura)}${cats.map(([k, t, c]) => `<div class="sec"><h2>${t}</h2>${(r[k] || []).map((o) => optCard(o, k, c, (dl += 0.12), o.tecnica)).join("")}</div>`).join("")}${r.error ? `<div class="card tip warnbox">${ic("warn")} <b>Ojo:</b> ${esc(r.error)}</div>` : ""}<div class="card tip">${ic("bulb")} ${esc(r.consejo)}</div><button class="go alt" id="rAgain">${ic("refresh")} Otras opciones</button></div>`;
        wireOpts(); animateMeters(); $("#rAgain", V).onclick = run;
        const c = getCrush(cid);
        if (c) { c.log.push({ date: Date.now(), interes: lvl, lectura: r.lectura }); c.log = c.log.slice(-30); c.turno = "yo"; c.lastAt = Date.now(); }
        log("reply", r.lectura); celebrate($("#rGo", V), 10, "first");
        $(".res", V).scrollIntoView({ behavior: "smooth" });
      });
    };
    $("#rGo", V).onclick = run;
    if (quick) { $("#rText", V).value = "Ella: " + quick; setTimeout(run, 150); }
  },

  opener() {
    const up = uploader("dropO");
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("rocket")} Abridores</h1><p class="lead">Sube capturas de su perfil (Instagram, Tinder, historias) y te doy formas originales de empezar a hablar. Nada de "hola, ¿qué tal?".</p>
      ${up.html}
      <label for="oBio">O cuéntame qué sabes de ella</label><textarea id="oBio" rows="3" placeholder="Ej: le gustan los gatos, estudia diseño, subió una foto en la playa"></textarea>
      ${styleChips()}
      <button class="go" id="oGo">${ic("rocket")} Rompe el hielo</button>${loadingHTML}`;
    up.mount(); wireBack(); wireStyles();
    const run = async () => {
      const bio = $("#oBio", V).value.trim();
      if (!up.st.imgs.length && !bio) { $("#st", V).textContent = "Sube su perfil o cuéntame algo de ella"; return; }
      await withLoading($("#oGo", V), ["Stalkeando con respeto…", "Buscando detalles…", "Preparando el primer mensaje…"], async () => {
        const r = await ai("opener", { images: await up.encoded(), bio, style: DATA.profile.style });
        let dl = 0.1;
        $("#out", V).innerHTML = `<div class="res">${r.detalles?.length ? `<div class="card read"><h3>Lo que noté</h3><ul class="list">${r.detalles.map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div>` : ""}<div class="sec"><h2>${ic("chat")} Para escribirle primero</h2>${(r.abridores || []).map((o) => optCard(o, /p[ií]caro/i.test(o.tipo) ? "picara" : "normal", /p[ií]caro/i.test(o.tipo) ? "var(--pink)" : "var(--violet)", (dl += 0.1), o.tipo)).join("")}</div><button class="go alt" id="oAgain">${ic("refresh")} Otras opciones</button></div>`;
        wireOpts(); $("#oAgain", V).onclick = run; log("opener", "Abridores generados"); celebrate($("#oGo", V), 10, "opener");
      });
    };
    $("#oGo", V).onclick = run;
  },

  check() {
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("shield")} ¿La cagué?</h1><p class="lead">Escribe el mensaje que piensas mandarle. Te digo si suena bien, qué riesgos tiene y te doy versiones mejores.</p>
      <label for="cMsg">Tu mensaje</label><textarea id="cMsg" rows="3" placeholder="Ej: oye y si salimos algún día jaja"></textarea>
      <label for="cChat">Lo último que te escribió ella (opcional)</label><textarea id="cChat" rows="2"></textarea>
      ${crushSelect("cCrush")}
      <button class="go" id="cGo">${ic("shield")} Revisar mi mensaje</button>${loadingHTML}`;
    wireBack();
    $("#cGo", V).onclick = async () => {
      const mensaje = $("#cMsg", V).value.trim();
      if (!mensaje) { $("#st", V).textContent = "Escribe tu mensaje primero"; return; }
      await withLoading($("#cGo", V), ["Leyendo con lupa…", "Calculando el riesgo…", "Puliendo tu mensaje…"], async () => {
        const r = await ai("check", { mensaje, chat: $("#cChat", V).value.trim(), crush: crushPayload($("#cCrush", V).value) });
        const p = Math.max(0, Math.min(10, Number(r.puntaje) || 0));
        let dl = 0.2;
        $("#out", V).innerHTML = `<div class="res"><div class="card score"><div class="ring" style="--p:${p * 10}"><span>${p}</span></div><div><b>${esc(r.veredicto)}</b><p class="lead" style="margin:4px 0 0">${p >= 8 ? "Mándalo sin miedo" : p >= 5 ? "Pasable, pero se puede mejorar" : "Mejor no lo mandes así"}</p></div></div>
          ${r.bien?.length ? `<div class="card tip"><h3>${ic("check")} Lo que funciona</h3><ul class="list">${r.bien.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
          ${r.riesgos?.length ? `<div class="card tip"><h3>${ic("warn")} Riesgos</h3><ul class="list">${r.riesgos.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
          <div class="sec"><h2>${ic("sparkle")} Mejor así</h2>${(r.mejoradas || []).map((o) => optCard(o, "normal", "var(--yellow)", (dl += 0.12))).join("")}</div></div>`;
        wireOpts(); log("check", r.veredicto); celebrate($("#cGo", V), 8, "check");
      });
    };
  },

  decode() {
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("search")} ¿Qué quiso decir?</h1><p class="lead">¿Te mandó un "jaja ok", un "tal vez" o un emoji raro? Pégalo y lo decodifico.</p>
      <label for="dMsg">Su mensaje</label><textarea id="dMsg" rows="2" placeholder='Ej: "jsjs puede ser"'></textarea>
      <label for="dChat">Contexto del chat (opcional)</label><textarea id="dChat" rows="3"></textarea>
      ${crushSelect("dCrush")}
      <button class="go" id="dGo">${ic("search")} Decodificar</button>${loadingHTML}`;
    wireBack();
    $("#dGo", V).onclick = async () => {
      const mensaje = $("#dMsg", V).value.trim();
      if (!mensaje) { $("#st", V).textContent = "Pega su mensaje primero"; return; }
      await withLoading($("#dGo", V), ["Descifrando…", "Leyendo entre líneas…", "Consultando a los expertos…"], async () => {
        const r = await ai("decode", { mensaje, chat: $("#dChat", V).value.trim(), crush: crushPayload($("#dCrush", V).value) });
        $("#out", V).innerHTML = `<div class="res"><div class="card read"><h3>Posibles significados</h3>${(r.lecturas || []).map((l) => `<div class="mlabel" style="margin-top:8px"><span style="font-weight:500">${esc(l.significado)}</span><span>${Number(l.probabilidad) || 0}%</span></div><div class="meter"><div data-w="${Number(l.probabilidad) || 0}"></div></div>`).join("")}</div>
          ${r.senales?.length ? `<div class="card tip"><h3>${ic("eye")} Señales</h3><ul class="list">${r.senales.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
          <div class="card tip">${ic("bulb")} ${esc(r.que_hacer)}</div>
          ${r.respuesta?.msg ? `<div class="sec"><h2>${ic("chat")} Podrías responder</h2>${optCard(r.respuesta, "normal", "var(--blue)", 0.3)}</div>` : ""}</div>`;
        wireOpts(); animateMeters(); log("decode", mensaje); celebrate($("#dGo", V), 8, "decode");
      });
    };
  },

  escenas() {
    const tg = DATA.profile.target || "chica", la = tg === "chico" ? "lo" : tg === "persona" ? "le" : "la", ella = tg === "chico" ? "él" : tg === "persona" ? "esa persona" : "ella";
    const ESC = [
      { t: "Volver a escribir tras el silencio", ic: "chat", d: `Hace 2 semanas que no hablan y quieres revivir el chat.`, ctx: `Hace dos semanas dejaron de hablar sin pelear. ${ella} se sorprende de que le escriba. Si el mensaje es natural y no reclama, retoma; si suena necesitado, responde frío.`, open: null, p: null },
      { t: "Pedir el número en persona", ic: "phone", d: `Se conocieron hoy en una fiesta y quieres su número.`, ctx: `Se conocieron hace un rato en una fiesta de un amigo en común y ahora siguen conversando por chat de Instagram. El reto es que el usuario consiga su número o un plan concreto sin sonar intenso.`, open: "oye q buena la fiesta jaja", p: null },
      { t: "Se quedó en silencio", ic: "face-think", d: `${ella[0].toUpperCase() + ella.slice(1)} respondió seco y la charla se muere.`, ctx: `La conversación se enfrió: llevas respondiendo cortito ("ah", "ok"). Solo te reanimas si el usuario saca un tema original o divertido.`, open: "ok", p: null },
      { t: "Está molesta contigo", ic: "warn", d: `No respondiste en todo el día y ${ella} se resintió.`, ctx: `Estás algo molesta porque el usuario desapareció todo el día sin avisar después de quedar en hablar. Si se disculpa sincero y sin excusas largas, te calmas. Si se justifica de más o minimiza, sigues seca.`, open: "ah, ahora sí apareces", p: null },
      { t: "Tienes otra oportunidad", ic: "refresh", d: `La primera cita fue rara y quieres una segunda.`, ctx: `Tuvieron una primera cita algo incómoda la semana pasada (silencios, nervios). No estás segura de una segunda. Si el usuario hace humor sobre eso con seguridad y propone algo mejor, aceptas.`, open: "holaa", p: null },
      { t: "Ensayo de primera cita", ic: "calendar", d: `Llamada que simula la cita en persona en un café: de qué hablar y cómo cerrar.`, ctx: `Están en su primera cita en persona en una cafetería (simulada por llamada). Hablan cara a cara. Evalúa si el usuario hace buenas preguntas, escucha, cuenta cosas de sí mismo y al final propone una segunda salida.`, call: true, callOpen: "Hola… perdón la demora, ¿hace mucho llegaste?", open: "ya llegué al café, ¿dónde estás?", p: null },
    ];
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("target")} Escenarios</h1><p class="lead">Practica las situaciones que más cuestan. Cada una tiene su propio reto y al final te da tu puntaje.</p>
      <div>${ESC.map((e, i) => `<button class="crush scenbtn" data-e="${i}" style="animation-delay:${i * 0.06}s"><span class="av">${ic(e.ic)}</span><span><b>${esc(e.t)}</b><small>${esc(e.d)}</small></span>${e.call ? `<span class="pct">${ic("phone")}</span>` : ""}</button>`).join("")}</div>`;
    wireBack();
    $$("[data-e]", V).forEach((b) => (b.onclick = () => go("sim", ESC[b.dataset.e])));
  },

  perfil() {
    const up = uploader("dropP");
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("camera2")} Revisa mi perfil</h1><p class="lead">Sube tus fotos o capturas de tu perfil de Tinder, Bumble o Instagram, en el orden en que aparecen. Te digo cuál poner primero, qué mejorar y te escribo una bio nueva.</p>
      ${up.html}
      <label for="pfBio">Tu bio actual (opcional)</label><textarea id="pfBio" rows="3" placeholder="Pega tu bio aquí"></textarea>
      <label for="pfApp">¿Dónde la usas?</label><select id="pfApp"><option>Tinder</option><option>Bumble</option><option>Hinge</option><option>Instagram</option><option>Otra</option></select>
      <button class="go" id="pfGo">${ic("sparkle")} Revisar mi perfil</button>${loadingHTML}`;
    up.mount(); wireBack();
    $("#pfGo", V).onclick = async () => {
      const bio = $("#pfBio", V).value.trim();
      if (!up.st.imgs.length && !bio) { $("#st", V).textContent = "Sube tus fotos o pega tu bio"; return; }
      await withLoading($("#pfGo", V), ["Mirando tus fotos…", "Pensando como ella…", "Escribiendo tu bio…"], async () => {
        const r = await ai("profile", { images: await up.encoded(), bio, app: $("#pfApp", V).value });
        const P = Math.max(0, Math.min(100, Number(r.puntaje) || 0)); let dl = 0.2;
        $("#out", V).innerHTML = `<div class="res"><div class="card score"><div class="ring" style="--p:${P}"><span>${P}</span></div><div><b>${P >= 75 ? "Perfil fuerte" : P >= 50 ? "Va bien, se puede mejorar" : "Hay que mejorarlo"}</b><p class="lead" style="margin:4px 0 0">${esc(r.resumen)}</p></div></div>
          ${r.primera_foto ? `<div class="card tip">${ic("starF")} <b>Foto principal:</b> ${esc(r.primera_foto)}</div>` : ""}
          ${(r.fotos || []).length ? `<div class="card read"><h3>Foto por foto</h3>${r.fotos.map((f) => `<div class="mlabel" style="margin-top:10px"><span>Foto ${esc(f.n)}</span><span>${Number(f.nota) || 0}/10</span></div><div class="meter"><div data-w="${(Number(f.nota) || 0) * 10}"></div></div><small class="lead">${esc(f.consejo)}</small>`).join("")}</div>` : ""}
          ${r.bio_comentario ? `<div class="card tip">${ic("pencil")} <b>Tu bio:</b> ${esc(r.bio_comentario)}</div>` : ""}
          ${(r.bios || []).length ? `<div class="sec"><h2>${ic("sparkle")} Bios nuevas</h2>${r.bios.map((b) => optCard({ msg: b }, "normal", "#ff7a3d", (dl += 0.1))).join("")}</div>` : ""}
          ${(r.agregar || []).length ? `<div class="card tip"><h3>${ic("plus")} Te falta una foto de…</h3><ul class="list">${r.agregar.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}</div>`;
        wireOpts(); animateMeters(); log("perfil", r.resumen); celebrate($("#pfGo", V), 12, "perfil");
      });
    };
  },

  progreso() {
    const sc = DATA.scores || [];
    const last = sc.slice(-20), w = 520, h = 160;
    let chart = `<p class="lead">Todavía no tienes prácticas. Haz una en el Simulador o en Escenarios y aquí verás tu evolución.</p>`;
    if (last.length) {
      const step = last.length > 1 ? w / (last.length - 1) : 0, y = (p) => h - 10 - (p / 100) * (h - 20);
      const pts = last.map((x, i) => `${(i * step).toFixed(1)},${y(x.p).toFixed(1)}`);
      chart = `<svg class="spark big" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Puntajes de tus últimas prácticas"><path d="M0,${h} L${pts.join(" L")} L${(last.length - 1) * step},${h} Z" fill="url(#gp)" opacity=".35"/><defs><linearGradient id="gp" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff4f8b"/><stop offset="1" stop-color="#ff4f8b" stop-opacity="0"/></linearGradient></defs><path d="M${pts.join(" L")}" fill="none" stroke="#ff4f8b" stroke-width="3" stroke-linejoin="round"/>${last.map((x, i) => `<circle cx="${i * step}" cy="${y(x.p)}" r="4" fill="#ffd166"/>`).join("")}</svg>`;
    }
    const avg = (a) => (a.length ? Math.round(a.reduce((s, x) => s + x.p, 0) / a.length) : 0);
    const wk = 7 * 864e5, now = Date.now();
    const thisW = sc.filter((x) => now - x.d < wk), prevW = sc.filter((x) => now - x.d >= wk && now - x.d < 2 * wk);
    const diff = thisW.length && prevW.length ? avg(thisW) - avg(prevW) : null;
    const best = sc.reduce((b, x) => (x.p > (b?.p || -1) ? x : b), null);
    const uses = {}; (DATA.history || []).forEach((x) => (uses[x.tool] = (uses[x.tool] || 0) + 1));
    const fav = Object.entries(uses).sort((a, b) => b[1] - a[1])[0];
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("chart")} Mi progreso</h1>
      <div class="statgrid">
        <div class="card stat"><b>${sc.length}</b><small>prácticas</small></div>
        <div class="card stat"><b>${avg(sc)}</b><small>promedio</small></div>
        <div class="card stat"><b>${best ? best.p : "–"}</b><small>mejor puntaje</small></div>
        <div class="card stat"><b class="${diff > 0 ? "up" : diff < 0 ? "down" : ""}">${diff === null ? "–" : (diff > 0 ? "+" : "") + diff}</b><small>vs semana pasada</small></div>
      </div>
      <div class="card read"><h3>Tus últimas prácticas</h3>${chart}</div>
      ${best ? `<div class="card tip">${ic("medal")} <b>Tu mejor práctica:</b> ${best.p}/100 con ${esc(best.n)} (${esc(best.m)}${best.e ? ", " + esc(best.e) : ""})</div>` : ""}
      ${(DATA.tips || []).length ? `<div class="card tip"><h3>${ic("bulb")} En lo que debes trabajar</h3><ul class="list">${[...new Set(DATA.tips)].slice(0, 5).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
      <div class="card tip">${ic("fire")} Racha actual: <b>${DATA.streak.count} día(s)</b> · XP esta semana: <b>${DATA.week && DATA.week.id === weekId() ? DATA.week.xp : 0}</b>${fav && TOOLS[fav[0]] ? ` · Herramienta favorita: <b>${TOOLS[fav[0]].t}</b>` : ""}</div>
      <button class="go" id="prGo">${ic("game")} Hacer una práctica</button>`;
    wireBack(); $("#prGo", V).onclick = () => go("sim");
  },

  async ranking() {
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("trophy")} Ranking semanal</h1><p class="lead">Gana XP usando la app esta semana. El ranking se reinicia cada lunes. Solo se muestra tu apodo.</p><div id="rk"><div class="loading on"><i></i><i></i><i></i><span>Cargando ranking…</span></div></div>`;
    wireBack(); save();
    try {
      await new Promise((r) => setTimeout(r, 900));
      const d = await api("ranking");
      const medal = ["#ffd166", "#c9d1e0", "#e0995e"];
      $("#rk", V).innerHTML = (d.top || []).length ? `<div class="card streak"><span class="fire">${ic("trophy")}</span><div><b>${d.mine ? `Vas en el puesto #${d.mine}` : "Aún no estás en el ranking"}</b><small>${d.total} jugadores esta semana</small></div></div>
        ${d.top.map((u, i) => `<div class="rkrow ${u.me ? "me" : ""}" style="animation-delay:${i * 0.04}s"><span class="pos" style="${i < 3 ? `background:${medal[i]};color:#1a1020` : ""}">${i + 1}</span><span class="av">${ic(ICONS[u.icon] ? u.icon : "face")}</span><b>${esc(u.name)}${u.me ? " (tú)" : ""}${u.hot ? " " + ic("fire") : ""}</b><span class="xp">${u.xp} XP</span></div>`).join("")}`
        : `<div class="empty"><span class="big">${ic("trophy")}</span>Nadie ha ganado XP esta semana todavía. ¡Sé el primero!</div>`;
    } catch (e) { $("#rk", V).innerHTML = `<p class="status err">${esc(e.message)}</p>`; }
  },

  heat(crushId) {
    if (!DATA.profile.hot) return go("home");
    const up = uploader("dropH");
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("fire")} Subir la temperatura</h1><p class="lead">Sube la captura o pega el chat y te doy una escalera de coqueteo: suave, medio y atrevido. Sube de nivel solo si ella sigue el juego.</p>
      ${up.html}
      <label for="hText">O pega el chat</label><textarea id="hText" rows="3"></textarea>
      ${crushSelect("hCrush", crushId)}
      <button class="go" id="hGo">${ic("fire")} Calentar la conversación</button>${loadingHTML}`;
    up.mount(); wireBack();
    $("#hGo", V).onclick = async () => {
      const chat = $("#hText", V).value.trim();
      if (!up.st.imgs.length && !chat) { $("#st", V).textContent = "Sube una captura o pega el chat"; return; }
      await withLoading($("#hGo", V), ["Midiendo la temperatura…", "Subiendo el fuego…", "Eligiendo las palabras…"], async () => {
        const r = await ai("heat", { images: await up.encoded(), chat, crush: crushPayload($("#hCrush", V).value) });
        const T = Math.max(0, Math.min(100, Number(r.temperatura) || 0));
        const chili = ["", "var(--yellow)", "#ff7a3d", "#ff2d2d"];
        let dl = 0.1;
        $("#out", V).innerHTML = `<div class="res"><div class="card read"><h3>Temperatura actual</h3><div class="mlabel"><span>${T < 35 ? "Fría" : T < 65 ? "Tibia" : "Caliente"}</span><span>${T}°</span></div><div class="meter thermo"><div data-w="${T}"></div></div><div>${esc(r.lectura)}</div></div>
          ${(r.niveles || []).map((n, k) => `<div class="sec"><h2>${ic("fire").repeat(k + 1)} ${esc(n.nivel)}</h2>${(n.msgs || []).map((o) => optCard(o, "picara", chili[k + 1] || "#ff2d2d", (dl += 0.1))).join("")}</div>`).join("")}
          ${r.subir?.length ? `<div class="card tip"><h3>${ic("check")} Sube de nivel si…</h3><ul class="list">${r.subir.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
          ${r.bajar?.length ? `<div class="card tip warnbox"><h3>${ic("warn")} Baja la intensidad si…</h3><ul class="list">${r.bajar.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}</div>`;
        wireOpts(); animateMeters(); log("heat", r.lectura); celebrate($("#hGo", V), 10, "heat");
      });
    };
  },

  chats() {
    const now = Date.now();
    const ago = (t) => { if (!t) return "sin registro"; const h = (now - t) / 36e5; return h < 1 ? "hace " + Math.max(1, Math.round(h * 60)) + " min" : h < 24 ? "hace " + Math.round(h) + " h" : "hace " + Math.round(h / 24) + " d"; };
    const list = [...DATA.crushes].sort((a, b) => (a.turno === "yo" ? 0 : 1) - (b.turno === "yo" ? 0 : 1) || (a.lastAt || 0) - (b.lastAt || 0));
    const debo = list.filter((c) => c.turno === "yo").length;
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("chat")} Varias a la vez</h1><p class="lead">Si estás soltero y hablas con varias, aquí ves de un vistazo a quién le debes respuesta, cómo va el interés de cada una y qué hacer después.</p>
      <div class="card streak"><span class="fire">${ic(debo ? "warn" : "check")}</span><div><b>${debo ? `Le debes respuesta a ${debo}` : "Estás al día"}</b><small>${list.length} conversaciones guardadas</small></div></div>
      <div id="cBoard">${list.length ? list.map((c, i) => { const last = c.log[c.log.length - 1]; return `<div class="card chatrow" style="animation-delay:${i * 0.05}s"><div class="crtop"><span class="av">${ic(c.emoji)}</span><div><b>${esc(c.name)}</b><small>${last ? "Interés " + last.interes + "% · " : ""}${ago(c.lastAt)}</small></div><button class="turno ${c.turno === "yo" ? "me" : ""}" data-t="${c.id}">${c.turno === "yo" ? "Te toca a ti" : c.turno === "ella" ? "Le toca a ella" : "Marcar turno"}</button></div>
        <div class="row"><button class="btn" data-r="${c.id}">${ic("camera")} Responder</button><button class="btn" data-s="${c.id}">${ic("traffic")} ¿Le escribo?</button><button class="btn" data-i="${c.id}">${ic("calendar")} Invitar</button></div></div>`; }).join("") : `<div class="empty"><span class="big">${ic("heart")}</span>Agrega a las personas con las que hablas en Crushes y aquí aparecerán.</div>`}</div>
      <button class="go" id="cAdd">${ic("plus")} Agregar a alguien</button>`;
    wireBack();
    $$("[data-t]", V).forEach((b) => (b.onclick = () => { const c = getCrush(b.dataset.t); c.turno = c.turno === "yo" ? "ella" : "yo"; c.lastAt = Date.now(); save(); go("chats"); }));
    $$("[data-r]", V).forEach((b) => (b.onclick = () => go("reply", b.dataset.r)));
    $$("[data-s]", V).forEach((b) => (b.onclick = () => go("double")));
    $$("[data-i]", V).forEach((b) => (b.onclick = () => go("invite", b.dataset.i)));
    $("#cAdd", V).onclick = () => go("crushEdit");
  },

  ruleta() { vistaRuleta(); },
  juegos() { vistaJuegos(); },

  invite(crushId) {
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("calendar")} Invítala</h1><p class="lead">El chat es para llegar a la cita. Te digo si ya es buen momento, te doy planes concretos según lo que le gusta y el mensaje exacto para invitarla.</p>
      ${crushSelect("iCrush", crushId)}
      <label for="iChat">Cómo va el chat (opcional)</label><textarea id="iChat" rows="3" placeholder="Pega los últimos mensajes"></textarea>
      <div class="row" style="gap:10px"><div style="flex:1;min-width:140px"><label for="iCity">Ciudad / zona</label><input id="iCity" placeholder="Ej: Miraflores"></div><div style="flex:1;min-width:140px"><label for="iBud">Presupuesto</label><select id="iBud"><option value="">Normal</option><option>Muy barato</option><option>Puedo gastar un poco más</option></select></div></div>
      <button class="go" id="iGo">${ic("calendar")} Armar la cita</button>${loadingHTML}`;
    wireBack();
    $("#iGo", V).onclick = async () => {
      const cid = $("#iCrush", V).value, chat = $("#iChat", V).value.trim();
      if (!cid && !chat) { $("#st", V).textContent = "Elige a tu crush o pega cómo va el chat"; return; }
      await withLoading($("#iGo", V), ["Buscando el plan perfecto…", "Pensando qué le gustaría…", "Escribiendo la invitación…"], async () => {
        const r = await ai("invite", { crush: crushPayload(cid), chat, ciudad: $("#iCity", V).value.trim(), presupuesto: $("#iBud", V).value });
        const L = Math.max(0, Math.min(100, Number(r.listo) || 0));
        let dl = 0.2;
        $("#out", V).innerHTML = `<div class="res"><div class="card read"><h3>¿Ya es momento?</h3><div class="mlabel"><span>Listo para invitarla</span><span>${L}%</span></div><div class="meter"><div data-w="${L}"></div></div><div>${esc(r.comentario)}</div></div>
          ${(r.planes || []).map((p) => `<div class="sec"><h2>${ic("heart")} ${esc(p.titulo)}</h2><p class="lead" style="margin:0 0 8px">${esc(p.por)}</p>${optCard({ msg: p.msg }, "picara", "var(--pink)", (dl += 0.15))}</div>`).join("")}
          ${r.si_dice_no ? `<div class="card tip">${ic("bulb")} <b>Si te dice que no puede:</b> ${esc(r.si_dice_no)}</div>` : ""}</div>`;
        wireOpts(); animateMeters(); log("invite", (r.planes || [])[0]?.titulo || "Plan de cita"); celebrate($("#iGo", V), 12, "invite");
      });
    };
  },

  double() {
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("traffic")} ¿Le escribo otra vez?</h1><p class="lead">Antes de mandarle otro mensaje, mira el semáforo. Insistir de más es de lo que más resta.</p>
      <label>¿Quién escribió último?</label><div class="row" id="dWho"><button class="chip on" data-v="yo">Yo</button><button class="chip" data-v="ella">Ella</button></div>
      <label for="dTime">¿Hace cuánto?</label><select id="dTime"><option>Menos de 1 hora</option><option>Unas horas</option><option selected>1 día</option><option>2 o 3 días</option><option>Una semana o más</option></select>
      <label for="dChat2">Últimos mensajes (opcional)</label><textarea id="dChat2" rows="3"></textarea>
      ${crushSelect("dCrush2")}
      <button class="go" id="dGo2">${ic("traffic")} Ver semáforo</button>${loadingHTML}`;
    wireBack();
    let quien = "yo";
    $$("#dWho .chip", V).forEach((b) => (b.onclick = () => { $$("#dWho .chip", V).forEach((x) => x.classList.remove("on")); b.classList.add("on"); quien = b.dataset.v; }));
    $("#dGo2", V).onclick = async () => {
      await withLoading($("#dGo2", V), ["Mirando el semáforo…", "Calculando el tiempo…"], async () => {
        const r = await ai("double", { quien, tiempo: $("#dTime", V).value, chat: $("#dChat2", V).value.trim(), crush: crushPayload($("#dCrush2", V).value) });
        const sem = ["verde", "amarillo", "rojo"].includes(r.semaforo) ? r.semaforo : "amarillo";
        let dl = 0.2;
        $("#out", V).innerHTML = `<div class="res"><div class="card sema"><div class="light ${sem}"></div><div><b style="font-family:Space Grotesk;font-size:18px">${esc(r.veredicto)}</b><p class="lead" style="margin:4px 0 0">${esc(r.por)}</p></div></div>
          ${sem !== "verde" && r.esperar ? `<div class="card tip">${ic("bulb")} <b>Espera:</b> ${esc(r.esperar)}</div>` : ""}
          ${(r.mensajes || []).length ? `<div class="sec"><h2>${ic("chat")} ${sem === "verde" ? "Mándale esto" : "Cuando sea momento"}</h2>${r.mensajes.map((o) => optCard(o, "normal", "var(--yellow)", (dl += 0.12))).join("")}</div>` : ""}</div>`;
        wireOpts(); log("double", r.veredicto); celebrate($("#dGo2", V), 6, "double");
      });
    };
  },

  sim(esc0) {
    const PERS_F = [
      { name: "Vale", av: "face-calm", tag: "Fácil", edad: 22, vibe: "tranquila y simpática, se ríe fácil pero se aburre con preguntas genéricas", estilo: "minúsculas, 'jaja', emojis suaves 😊🙈" },
      { name: "Dani", av: "face-flat", tag: "Cortante", edad: 23, vibe: "seca y cortante, odia el small talk, responde con 1 o 2 palabras; solo se abre si él es muy original o la hace reír", estilo: "'ok', 'ya', 'ah', 'normal', sin emojis, sin signos" },
      { name: "Lu", av: "face-flirty", tag: "Pícara", edad: 24, vibe: "coqueta, segura y pícara; le encanta el doble sentido suave y poner a prueba al otro con retos", estilo: "😏🔥, frases cortas con doble sentido, 'mmm', 'atrévete'" },
      { name: "Cami", av: "face-roll", tag: "Sarcástica", edad: 22, vibe: "sarcástica y difícil de impresionar, se burla de las frases cliché, respeta el ingenio", estilo: "minúsculas, ironía, 🙄, 'aja', 'qué original'" },
      { name: "Sofi", av: "face-shy", tag: "Tímida", edad: 21, vibe: "tímida, responde poco al inicio, se abre si la haces sentir cómoda y sin presión", estilo: "'jsjs', '...', 🥺, mensajes muy cortos" },
      { name: "Majo", av: "face-busy", tag: "Ocupada", edad: 25, vibe: "siempre ocupada (trabajo, gym, amigas), responde rápido y se va; valora que no la presionen y que propongan planes concretos", estilo: "'ando en clase', 'luego te escribo', 'jaja sí', abreviaciones" },
      { name: "Ari", av: "face-laugh", tag: "Graciosa", edad: 22, vibe: "graciosa y memera, ama los chistes absurdos y exagerar todo; se aburre con gente seria", estilo: "'JAJAJAJ', 'nooo', 'me muero', 💀😭" },
      { name: "Isa", av: "face-mystery", tag: "Misteriosa", edad: 24, vibe: "misteriosa, responde con otra pregunta, cuenta poco de sí misma, le atrae la gente segura y paciente", estilo: "frases ambiguas, '¿tú qué crees?', 'quizás', puntos suspensivos" },
      { name: "Nati", av: "face-diva", tag: "Exigente", edad: 23, vibe: "creída y exigente, estándares altos, le aburren los que la halagan mucho; respeta a quien no se deja impresionar", estilo: "'ay no', 'holaaa', alarga vocales, 💅✨" },
      { name: "Rocío", av: "face-love", tag: "Intensa", edad: 22, vibe: "romántica e intensa, se ilusiona rápido, manda muchos emojis y mensajes; sirve para practicar a no ser intenso tú también", estilo: "muchos emojis 🥰💕, varios mensajes seguidos, '¿y tú me extrañaste?'" },
    ];
    const PERS_M = [
      { genero: "m", name: "Diego", av: "face-calm", tag: "Fácil", edad: 23, vibe: "tranquilo y amable, se ríe fácil, se aburre con preguntas genéricas", estilo: "minúsculas, 'jaja', pocos emojis" },
      { genero: "m", name: "Seba", av: "face-flat", tag: "Cortante", edad: 24, vibe: "seco y de pocas palabras, solo se engancha con algo original", estilo: "'ya', 'ok', 'normal', sin emojis" },
      { genero: "m", name: "Leo", av: "face-flirty", tag: "Pícaro", edad: 24, vibe: "coqueto y seguro, le gusta el doble sentido suave y los retos", estilo: "😏, frases cortas con picardía" },
      { genero: "m", name: "Mateo", av: "face-shy", tag: "Tímido", edad: 21, vibe: "tímido, responde poco al inicio, se abre si se siente cómodo", estilo: "'jsjs', '...', mensajes cortitos" },
      { genero: "m", name: "Bruno", av: "face-busy", tag: "Ocupado", edad: 26, vibe: "siempre ocupado con trabajo y gym, valora planes concretos", estilo: "'ando en el gym', 'luego hablamos', abreviaciones" },
      { genero: "m", name: "Gael", av: "face-laugh", tag: "Gracioso", edad: 22, vibe: "gracioso y memero, ama exagerar y los chistes absurdos", estilo: "'JAJAJA', 'nooo', 💀" },
    ];
    const tgt = DATA.profile.target || "chica";
    const PERS = tgt === "chico" ? PERS_M : tgt === "persona" ? [...PERS_F.slice(0, 5), ...PERS_M.slice(0, 5)] : PERS_F;
    const escena = esc0 && esc0.ctx ? esc0 : null;
    let pers = escena && escena.p ? PERS.find((x) => x.tag === escena.p) || PERS[0] : PERS[0], hist = [], lastInt = 50, dif = "normal", mind = false, gotCita = false, wasSeen = false, busy = false;
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("game")} ${escena ? esc(escena.t) : "Simulador"}</h1>${escena ? `<div class="card hotbanner scen">${ic(escena.ic)}<div><b>Escenario</b><small>${esc(escena.d)}</small></div></div>` : ""}<p class="lead">Practica con 10 chicas distintas antes de escribirle a la de verdad. Responden como una chica real: corto, a veces cortante, y te dejan en visto si te pasas.</p>
      <div class="personas">${PERS.map((p, i) => `<button class="persona ${i ? "" : "on"}" data-i="${i}"><span class="av">${ic(p.av)}</span><b>${p.name}</b><small>${esc(p.vibe.split(/[,(;]/)[0])}</small><span class="tg">${p.tag}</span></button>`).join("")}</div>
      <label>Dificultad</label><div class="row" id="difs"><button class="chip" data-v="fácil">Fácil</button><button class="chip on" data-v="normal">Normal</button><button class="chip" data-v="difícil">Difícil</button></div>
      <div class="simtop"><span class="av" id="simAv"></span><div><b id="simName"></b><small><span class="status-dot"></span><span id="simState">en línea</span></small></div><button class="callbtn" id="simCall">${ic("phone")} Llamar</button></div>
      <div class="simbar"><small id="simLbl">Interés: 50%</small><div class="meter"><div id="simM" style="width:50%"></div></div></div>
      <div class="goalbar">${ic("calendar")} <span>Reto: <b>consigue una cita</b> sin que te deje en visto</span></div>
      <button class="toggle" id="mindT">${ic("brain")}<span class="sw"></span> Leer su mente</button>
      <div class="chat" id="chat"></div>
      <form class="sendrow" id="simF"><input id="simIn" placeholder="Escríbele algo…" autocomplete="off" aria-label="Tu mensaje"><button aria-label="Enviar">${ic("send")}</button></form>
      <div class="row" style="margin-top:10px"><button class="btn" id="simReset">${ic("refresh")} Empezar de nuevo</button></div>
      <button class="go alt" id="simEnd">${ic("trophy")} Terminar y ver mi puntaje</button>${loadingHTML}`;
    wireBack();
    const chat = $("#chat", V);
    const setInt = (v) => { lastInt = v; $("#simM", V).style.width = v + "%"; $("#simLbl", V).textContent = `Interés: ${v}%`; };
    const add = (who, t) => { const m = document.createElement("div"); m.className = "msg " + who; m.textContent = t; chat.append(m); chat.scrollTop = chat.scrollHeight; return m; };
    const addMind = (t) => { const m = document.createElement("div"); m.className = "mind" + (mind ? "" : " blur"); m.innerHTML = ic("brain") + `<span>${esc(t)}</span>`; m.onclick = () => m.classList.remove("blur"); chat.append(m); chat.scrollTop = chat.scrollHeight; };
    const opener = () => (escena && escena.open) || ({ "Dani": "q", "Majo": "holi, ando a full jsjs", "Ari": "HOLAAA", "Nati": "holaaa", "Rocío": "holaaa 🥰🥰", "Isa": "hola…", "Sofi": "hola 🙈", "Cami": "hola", "Lu": "hola tú 😏" }[pers.name] || "holaa");
    const reset = () => {
      const o = opener(); hist = [{ role: "assistant", content: o }]; chat.innerHTML = ""; add("her", o); setInt(dif === "fácil" ? 60 : dif === "difícil" ? 35 : 50);
      gotCita = false; wasSeen = false; $("#out", V).innerHTML = ""; $("#simIn", V).disabled = false;
      $("#simAv", V).innerHTML = ic(pers.av); $("#simName", V).textContent = pers.name + " · " + pers.tag; $("#simState", V).textContent = "en línea";
    };
    reset();
    $$(".persona", V).forEach((b) => (b.onclick = () => { $$(".persona", V).forEach((x) => x.classList.remove("on")); b.classList.add("on"); pers = PERS[b.dataset.i]; reset(); $(".simtop", V).scrollIntoView({ behavior: "smooth", block: "start" }); }));
    $$("#difs .chip", V).forEach((b) => (b.onclick = () => { $$("#difs .chip", V).forEach((x) => x.classList.remove("on")); b.classList.add("on"); dif = b.dataset.v; reset(); }));
    $("#mindT", V).onclick = () => { mind = !mind; $("#mindT", V).classList.toggle("on", mind); $$(".mind", chat).forEach((m) => m.classList.toggle("blur", !mind)); };
    $("#simReset", V).onclick = reset;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    $("#simF", V).onsubmit = async (e) => {
      e.preventDefault();
      const t = $("#simIn", V).value.trim(); if (!t || busy) return;
      if (wasSeen) { toast(`${pers.name} te dejó en visto. Empieza de nuevo o cambia de chica.`); return; }
      busy = true; $("#simIn", V).value = ""; add("me", t); hist.push({ role: "user", content: t });
      const seen = document.createElement("div"); seen.className = "seen"; seen.textContent = "Enviado"; chat.append(seen);
      $("#simState", V).textContent = "en línea";
      try {
        const r = await ai("sim", { persona: pers, dificultad: dif, history: hist, escenario: escena?.ctx });
        await wait(500); seen.classList.add("read"); seen.textContent = "Visto";
        const v = Math.max(0, Math.min(100, Number(r.interes) || 0));
        const msgs = (Array.isArray(r.msgs) ? r.msgs : r.msg ? [r.msg] : []).filter(Boolean).slice(0, 3);
        if (r.visto || !msgs.length) {
          wasSeen = true; await wait(700);
          const ls2 = document.createElement("div"); ls2.className = "leftseen"; ls2.textContent = `${pers.name} te dejó en visto`; chat.append(ls2);
          $("#simState", V).textContent = "últ. vez hace un momento"; $("#simIn", V).disabled = true;
          hist.push({ role: "assistant", content: "(me dejó en visto)" });
        } else {
          for (const m of msgs) {
            $("#simState", V).textContent = "escribiendo…";
            const typing = add("her typing", ""); typing.innerHTML = "<i></i><i></i><i></i>";
            await wait(Math.min(2200, 500 + m.length * 45));
            typing.remove(); add("her", m);
          }
          $("#simState", V).textContent = "en línea";
          hist.push({ role: "assistant", content: msgs.join("\n") });
        }
        if (r.piensa) addMind(r.piensa);
        if (v > lastInt + 8) { const b = chat.getBoundingClientRect(); hearts(b.left + 40, b.bottom - 40, 6); }
        setInt(v); dailyEvent({ type: "simInteres", p: pers.name, v });
        if (r.cita && !gotCita) {
          gotCita = true; addXP(25); badge("cita"); dailyEvent({ type: "simCita", p: pers.name, visto: wasSeen });
          setTimeout(() => { hearts(innerWidth / 2, innerHeight / 2, 30); modal(`<div class="big" data-ic="calendar"></div><h2>¡${esc(pers.name)} aceptó salir contigo!</h2><p class="lead">Reto cumplido: +25 XP. Termina la práctica para ver tu puntaje.</p>`); }, 600);
        }
      } catch (err) { hist.pop(); seen.remove(); toast(err.message); }
      finally { busy = false; }
    };
    const showScore = (r, modo, extraTxt) => {
      const p = Math.max(0, Math.min(100, Number(r.puntaje) || 0));
      $("#out", V).innerHTML = `<div class="res"><div class="card score"><div class="ring" style="--p:${p}"><span>${p}</span></div><div><b>${esc(r.titulo)}</b><p class="lead" style="margin:4px 0 0">${modo} con ${esc(pers.name)} (${esc(pers.tag)}, ${dif})${extraTxt ? " · " + extraTxt : ""}</p></div></div>
        <button class="go" id="shareBtn">${ic("share")} Compartir mi puntaje en historias</button>
        ${r.bien?.length ? `<div class="card tip"><h3>${ic("check")} Lo hiciste bien</h3><ul class="list">${r.bien.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        ${r.mejorar?.length ? `<div class="card tip"><h3>${ic("chart")} Para mejorar</h3><ul class="list">${r.mejorar.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        ${r.mejor_mensaje ? `<div class="card tip"><h3>${ic("medal")} Tu mejor frase</h3>"${esc(r.mejor_mensaje)}"</div>` : ""}
        ${r.peor_mensaje ? `<div class="card tip warnbox"><h3>${ic("warn")} Tu peor frase</h3>"${esc(r.peor_mensaje)}"${r.reescrito ? `<br><br><b>Mejor así:</b> "${esc(r.reescrito)}"` : ""}</div>` : ""}</div>`;
      DATA.scores = [...(DATA.scores || []), { d: Date.now(), p, m: modo, n: pers.name, e: escena?.t || "" }].slice(-60);
      if (r.mejorar?.length) DATA.tips = [...r.mejorar.slice(0, 2), ...(DATA.tips || [])].slice(0, 12);
      if (escena) badge("escena");
      save();
      $("#shareBtn", V).onclick = () => tarjeta({ score: p, titulo: r.titulo, persona: pers.name, tag: pers.tag, extra: extraTxt }).catch(() => toast("No pude crear la imagen"));
      $(".res", V).scrollIntoView({ behavior: "smooth" });
      return p;
    };
    if (escena && escena.call) setTimeout(() => $("#simCall", V) && toast("Toca Llamar para empezar el ensayo"), 400);
    $("#simCall", V).onclick = () => {
      abrirLlamada(pers, dif, escena, async ({ hist: ch, cita, secs, colgo }) => {
        if (ch.filter((m) => m.role === "user").length < 1) return;
        badge("llamada"); addXP(10);
        if (cita) { addXP(25); badge("cita"); dailyEvent({ type: "simCita", p: pers.name, visto: false }); }
        await withLoading($("#simEnd", V), ["Escuchando la grabación…", "Calculando tu puntaje…"], async () => {
          const r = await ai("simScore", { persona: pers, llamada: true, history: ch, escenario: escena?.ctx });
          const extra = cita ? "consiguió cita" : colgo ? "te colgó" : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")} min`;
          const p = showScore(r, "Llamada", extra);
          log("sim", `Llamada con ${pers.name}: ${p}/100`); dailyEvent({ type: "simScore", v: p });
          if (p >= 80) badge("sim80");
        });
      });
    };
    $("#simEnd", V).onclick = async () => {
      if (hist.filter((m) => m.role === "user").length < 2) { $("#st", V).textContent = "Chatea un poco más antes de terminar"; return; }
      await withLoading($("#simEnd", V), ["Revisando tu chat…", "Calculando tu puntaje…"], async () => {
        const r = await ai("simScore", { persona: pers, history: hist, escenario: escena?.ctx });
        const p = showScore(r, "Chat", gotCita ? "consiguió cita" : wasSeen ? "te dejó en visto" : "");
        log("sim", `Práctica con ${pers.name}: ${p}/100`); dailyEvent({ type: "simScore", v: p });
        celebrate($("#simEnd", V), 15 + Math.round(p / 5), "sim"); if (p >= 80) badge("sim80");
      });
    };
  },

  crushes() {
    V.innerHTML = `<h1 class="title">${ic("heart")} Mis crushes</h1><p class="lead">Guarda a cada persona con notas (gustos, cosas que te contó). La IA las usa para darte respuestas más personalizadas, y el medidor de interés se guarda en el tiempo.</p>
      <div id="cList">${DATA.crushes.length ? DATA.crushes.map((c, i) => { const last = c.log[c.log.length - 1]; return `<button class="crush" data-id="${c.id}" style="animation-delay:${i * 0.06}s"><span class="av">${ic(c.emoji)}</span><span><b>${esc(c.name)}</b><small>${c.log.length} análisis${c.notes ? " · " + esc(c.notes.slice(0, 40)) : ""}</small></span><span class="pct">${last ? last.interes + "%" : "–"}</span></button>`; }).join("") : `<div class="empty"><span class="big">${ic("heart")}</span>Todavía no tienes crushes guardados.<br>Agrega uno para que la IA recuerde todo sobre ella.</div>`}</div>
      <button class="go" id="addC">${ic("plus")} Agregar crush</button>`;
    $$(".crush", V).forEach((b) => (b.onclick = () => go("crush", b.dataset.id)));
    $("#addC", V).onclick = () => go("crushEdit");
  },

  crushEdit(id) {
    const c = getCrush(id) || { name: "", notes: "", emoji: "heart" };
    const EMO = ["heart", "face-flirty", "starF", "flower", "fire", "sparkle", "moon", "bolt"];
    V.innerHTML = `${backBtn(id ? "crush" : "crushes")}<h1 class="title">${id ? "Editar" : "Nuevo"} crush</h1>
      <label for="eName">Nombre o apodo</label><input id="eName" value="${esc(c.name)}" placeholder="Ej: Ana de la uni">
      <label>Emoji</label><div class="row" id="eEmo">${EMO.map((e) => `<button class="chip ${e === c.emoji ? "on" : ""}" data-e="${e}" aria-label="${e}">${ic(e)}</button>`).join("")}</div>
      <label for="eNotes">Notas: gustos, cosas que te contó, chistes internos</label><textarea id="eNotes" rows="5" placeholder="Ej: ama los gatos, odia el reggaetón, cumple en marzo, le gusta el sushi">${esc(c.notes)}</textarea>
      <button class="go" id="eSave">${ic("heart")} Guardar</button>${id ? '<button class="go alt" id="eDel">Eliminar</button>' : ""}`;
    $$("[data-back]", V).forEach((b) => (b.onclick = () => go(b.dataset.back, id)));
    let emo = c.emoji;
    $$("#eEmo .chip", V).forEach((b) => (b.onclick = () => { $$("#eEmo .chip", V).forEach((x) => x.classList.remove("on")); b.classList.add("on"); emo = b.dataset.e; }));
    $("#eSave", V).onclick = (e) => {
      const name = $("#eName", V).value.trim(); if (!name) return toast("Ponle un nombre");
      if (id) Object.assign(c, { name, notes: $("#eNotes", V).value.trim(), emoji: emo });
      else { DATA.crushes.push({ id: Math.random().toString(36).slice(2), name, notes: $("#eNotes", V).value.trim(), emoji: emo, log: [] }); badge("crush"); hearts(e.clientX, e.clientY, 14); addXP(5); }
      save(); go("crushes");
    };
    if (id) {
      let sure = false;
      $("#eDel", V).onclick = () => { if (!sure) { sure = true; $("#eDel", V).textContent = "Toca otra vez para confirmar"; return; } DATA.crushes = DATA.crushes.filter((x) => x.id !== id); save(); go("crushes"); };
    }
  },

  crush(id) {
    const c = getCrush(id); if (!c) return go("crushes");
    const pts = c.log.map((l) => l.interes);
    let spark = "";
    if (pts.length > 1) {
      const w = 500, h = 90, step = w / (pts.length - 1);
      const path = pts.map((p, i) => `${i ? "L" : "M"}${(i * step).toFixed(1)},${(h - 8 - (p / 100) * (h - 16)).toFixed(1)}`).join(" ");
      spark = `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Evolución del interés"><path d="${path}" fill="none" stroke="#ff4f8b" stroke-width="3" stroke-linejoin="round"/>${pts.map((p, i) => `<circle cx="${i * step}" cy="${h - 8 - (p / 100) * (h - 16)}" r="4" fill="#ff4f8b"/>`).join("")}</svg>`;
    }
    V.innerHTML = `${backBtn("crushes")}<div class="crush" style="cursor:default"><span class="av">${ic(c.emoji)}</span><span><b>${esc(c.name)}</b><small>${c.log.length} análisis guardados</small></span></div>
      <div class="card read"><h3>Interés en el tiempo</h3>${pts.length > 1 ? spark : pts.length === 1 ? `<p>Último: ${pts[0]}%. Analiza más chats para ver la tendencia.</p>` : "<p class='lead'>Aún no hay análisis. Usa “Responder chat” eligiéndola a ella.</p>"}</div>
      <div class="card read"><h3>Notas</h3><div style="white-space:pre-wrap">${esc(c.notes) || "<span class='lead'>Sin notas</span>"}</div></div>
      ${c.log.length ? `<div class="card read"><h3>Últimas lecturas</h3><ul class="list">${c.log.slice(-5).reverse().map((l) => `<li><b>${l.interes}%</b> · ${esc(l.lectura)}</li>`).join("")}</ul></div>` : ""}
      <button class="go" id="cReply">${ic("camera")} Analizar un chat con ${esc(c.name)}</button><button class="go alt" id="cEdit">${ic("pencil")} Editar notas</button>`;
    wireBack();
    $("#cReply", V).onclick = () => go("reply", id);
    $("#cEdit", V).onclick = () => go("crushEdit", id);
  },

  favs() {
    V.innerHTML = `<h1 class="title">${ic("starF")} Favoritos</h1><p class="lead">Tus mejores frases guardadas, listas para copiar cuando las necesites.</p>
      <div>${DATA.favs.length ? DATA.favs.map((f, i) => optCard({ msg: f.msg }, f.cat, f.cat === "picara" ? "var(--pink)" : f.cat === "seguir" ? "var(--green)" : "var(--blue)", i * 0.05)).join("") : `<div class="empty"><span class="big">${ic("starF")}</span>Aún no guardas frases.<br>Toca “Guardar” en cualquier respuesta.</div>`}</div>`;
    wireOpts();
  },

  profile() {
    const i = level(DATA.xp);
    V.innerHTML = `<h1 class="title">${ic("face-cool")} Perfil</h1>
      <div class="card score"><div class="ring" style="--p:${LEVELS[i + 1] ? Math.round(((DATA.xp - LEVELS[i][0]) / (LEVELS[i + 1][0] - LEVELS[i][0])) * 100) : 100}"><span>${i + 1}</span></div><div><b>${LEVELS[i][1]}</b><p class="lead" style="margin:4px 0 0">${DATA.xp} XP · racha de ${DATA.streak.count} día(s)</p></div></div>
      <div class="pfoto"><button class="avatar" id="pAv" aria-label="Cambiar foto">${avatarInner()}</button><div class="btns"><button class="btn" id="pPhoto">${ic("camera2")} ${DATA.profile.photo ? "Cambiar foto" : "Agregar foto"}</button>${DATA.profile.photo ? `<button class="btn" id="pDelPhoto">${ic("close")} Quitar</button>` : ""}<input type="file" id="pFile" accept="image/*" hidden></div></div>
      <label for="pName">Tu nombre o apodo</label><input id="pName" value="${esc(DATA.profile.name)}">
      <label>Le hablo a…</label><div class="row" id="pTarget">${[["chica", "Chicas"], ["chico", "Chicos"], ["persona", "Sin especificar"]].map(([v, t]) => `<button class="chip ${(DATA.profile.target || "chica") === v ? "on" : ""}" data-v="${v}">${t}</button>`).join("")}</div>
      <label>¿De dónde eres? (la IA habla con tu jerga)</label><div class="row" id="pRegion">${[["peru", "Perú"], ["mexico", "México"], ["argentina", "Argentina"], ["colombia", "Colombia"], ["chile", "Chile"], ["espana", "España"], ["neutro", "Neutro"]].map(([v, t]) => `<button class="chip ${(DATA.profile.region || "neutro") === v ? "on" : ""}" data-v="${v}">${t}</button>`).join("")}</div>
      <div class="card learn" style="margin-top:14px">${ic("brainUp")}<div><b style="font-family:Space Grotesk">La IA aprende de ti</b><small class="lead" style="display:block">${(DATA.likes || []).length} respuestas que te gustaron · ${(DATA.dislikes || []).length} que no. Usa 👍 y 👎 en cada respuesta para que suene más a ti.</small>${(DATA.likes || []).length + (DATA.dislikes || []).length ? `<button class="btn" id="pLearnReset" style="margin-top:8px">${ic("refresh")} Empezar de cero</button>` : ""}</div></div>
      <label>Tu ícono en el ranking</label><div class="row" id="pIcon">${["face", "face-cool", "face-flirty", "face-laugh", "fire", "bolt", "starF", "heart"].map((v) => `<button class="chip ${(DATA.profile.icon || "face") === v ? "on" : ""}" data-v="${v}" aria-label="${v}">${ic(v)}</button>`).join("")}</div>
      <div class="card voicecard"><h3 style="margin:0 0 6px;font-size:15px;font-family:Space Grotesk">${ic("voice")} Suena como tú ${DATA.profile.voice ? '<span class="on">· activado</span>' : ""}</h3><p class="lead" style="margin:0 0 8px">Pega 3 a 5 mensajes reales que hayas escrito tú. La IA copia tu forma de escribir (minúsculas, jerga, emojis) para que las respuestas no suenen a robot.</p>
        <textarea id="pVoice" rows="4" placeholder="ej: jajaja nooo pero q pasó&#10;oe yaaa vamos el sábado&#10;tmr no puede ser 😂">${esc(DATA.profile.voice || "")}</textarea>
        <button class="btn" id="pVoiceSave" style="margin-top:10px">${ic("check")} Guardar mi estilo</button></div>
      ${styleChips()}
      <h3 style="margin:22px 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mut)">Logros (${DATA.badges.length}/${BADGES.length})</h3>
      <div class="badges">${BADGES.map((b) => `<div class="badge ${DATA.badges.includes(b.id) ? "got" : ""}"><span>${ic(b.e)}</span>${b.t}</div>`).join("")}</div>
      ${DATA.history.length ? `<h3 style="margin:22px 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mut)">Actividad reciente</h3><div class="card"><ul class="list">${DATA.history.slice(0, 8).map((h) => `<li>${TOOLS[h.tool] ? ic(TOOLS[h.tool].e) : ""} ${esc(h.summary)}</li>`).join("")}</ul></div>` : ""}
      <div class="card voicecard ${DATA.profile.hot ? "hotcard" : ""}"><h3 style="margin:0 0 6px;font-size:15px;font-family:Space Grotesk">${ic("fire")} ${DATA.profile.hot ? "Modo HOT activo" : "Modo HOT"}</h3>
        ${DATA.profile.hot ? `<p class="lead" style="margin:0 0 8px">Las respuestas, el simulador y los juegos están en modo atrevido.</p><button class="btn" id="hotOff">${ic("snow")} Desactivar Modo HOT</button>` : `<p class="lead" style="margin:0 0 8px">Escribe tu código para activarlo. Si no creaste uno, el código es <b>HOT</b>.</p><form class="sendrow" id="hotInline"><input id="hotIn" placeholder="Código" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" enterkeyhint="go"><button aria-label="Activar">${ic("bolt")}</button></form>`}
        <label for="hotNew">Crea tu propio código secreto</label><form class="sendrow" id="hotNewF"><input id="hotNew" placeholder="${DATA.profile.hotCode ? "Ya tienes uno · escribe otro para cambiarlo" : "Ej: PATO23"}" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false"><button aria-label="Guardar código">${ic("check")}</button></form>
        <small class="lead">Truco: toca 5 veces rápido el logo de arriba para abrir la zona secreta.</small></div>
      <button class="go alt" id="pOut">${ic("logout")} Cerrar sesión</button>`;
    wireStyles();
    $("#pName", V).onchange = (e) => { DATA.profile.name = e.target.value.trim().slice(0, 40); save(); renderTop(); toast("Nombre guardado"); };
    $("#pOut", V).onclick = logout;
    $$("#pTarget .chip", V).forEach((b) => (b.onclick = () => { DATA.profile.target = b.dataset.v; save(); toast("Listo: el simulador y las respuestas se adaptan"); go("profile"); }));
    $$("#pRegion .chip", V).forEach((b) => (b.onclick = () => { DATA.profile.region = b.dataset.v; save(); toast("Listo: la IA ahora habla así"); go("profile"); }));
    if ($("#pLearnReset", V)) $("#pLearnReset", V).onclick = () => { DATA.likes = []; DATA.dislikes = []; save(); go("profile"); };
    $$("#pIcon .chip", V).forEach((b) => (b.onclick = () => { DATA.profile.icon = b.dataset.v; save(); go("profile"); }));
    if ($("#hotInline", V)) $("#hotInline", V).onsubmit = (e) => { e.preventDefault(); if (activarHot($("#hotIn", V).value)) go("profile"); else { $("#hotIn", V).value = ""; toast("Código incorrecto"); } };
    $("#hotNewF", V).onsubmit = (e) => { e.preventDefault(); const c = normCode($("#hotNew", V).value); if (c.length < 3) return toast("Mínimo 3 letras o números"); DATA.profile.hotCode = c; save(); toast("Código guardado: " + c); go("profile"); };
    if ($("#hotOff", V)) $("#hotOff", V).onclick = () => { setHot(false); save(); toast("Modo HOT desactivado"); go("profile"); };
    const pick = () => $("#pFile", V).click();
    $("#pAv", V).onclick = pick; $("#pPhoto", V).onclick = pick;
    $("#pFile", V).onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { DATA.profile.photo = await photoFrom(f); save(); renderTop(); badge("photo"); const r = $("#pAv", V).getBoundingClientRect(); hearts(r.left + r.width / 2, r.top + r.height / 2, 14); go("profile"); toast("Foto actualizada"); }
      catch { toast("No pude leer esa imagen"); }
    };
    if ($("#pDelPhoto", V)) $("#pDelPhoto", V).onclick = () => { delete DATA.profile.photo; save(); renderTop(); go("profile"); };
    $("#pVoiceSave", V).onclick = (e) => { DATA.profile.voice = $("#pVoice", V).value.trim().slice(0, 800); save(); if (DATA.profile.voice) { badge("voice"); hearts(e.clientX, e.clientY, 10); toast("Listo: ahora las respuestas suenan a ti"); } else toast("Estilo borrado"); go("profile"); };
  },
};


/* ---------- Portada ---------- */
function showLanding() { $("#auth").classList.add("hide"); $("#landing").classList.remove("hide"); scrollTo(0, 0); requestAnimationFrame(() => { measure(); onScroll(); }); }
function showAuth(mode) {
  $("#landing").classList.add("hide"); $("#auth").classList.remove("hide"); scrollTo(0, 0);
  const t = $(`.tab[data-tab="${mode}"]`); if (t) t.click();
  setTimeout(() => (mode === "login" ? $("#aEmail") : $("#aName")).focus(), 300);
}
$("#authBack").innerHTML = ic("arrowL") + " Volver";
$("#authBack").onclick = showLanding;
$$("[data-auth]").forEach((b) => (b.onclick = () => showAuth(b.dataset.auth)));
$$("[data-scroll]").forEach((b) => (b.onclick = () => $(b.dataset.scroll).scrollIntoView({ behavior: "smooth" })));
$("#tick").innerHTML = Array(2).fill(["Respuestas pícaras", "heart", "Sin dejar en visto", "sparkle", "Practica sin miedo", "fire", "Tu labia + IA", "bolt"].map((x) => (ICONS[x] ? ic(x) : `<span>${x}</span>`)).join("")).join("");
const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.18 }) : null;
$$(".rv, .nos").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
const phone = $("#phone"), stage = $("#stage"), bigs = $$(".bigt h1");
/* Animación de la portada suavizada: medidas en caché + interpolación por frame */
const L = { st: 0, sh: 1, vh: innerHeight, bub: [], tilt: null, cur: 0, target: 0, raf: 0, idx: -1, solid: null };
function measure() {
  if ($("#landing").classList.contains("hide")) return;
  L.vh = innerHeight;
  L.st = stage.offsetTop; L.sh = Math.max(1, stage.offsetHeight - L.vh);
  const bp = $("#bubbles"); L.bub = bp ? $$(".floatb", bp).map((el) => ({ el, sp: parseFloat(el.dataset.sp) || 0, mid: bp.getBoundingClientRect().top + scrollY + bp.offsetHeight / 2 })) : [];
  const t = $("#tilt"); L.tilt = t ? { el: t, mid: t.getBoundingClientRect().top + scrollY + t.offsetHeight / 2 } : null;
}
function frame() {
  L.raf = 0;
  const y = scrollY;
  L.target = Math.min(1, Math.max(0, (y - L.st) / L.sh));
  L.cur += (L.target - L.cur) * 0.14;
  if (Math.abs(L.target - L.cur) < 0.0005) L.cur = L.target;
  const p = L.cur;
  if (!reduce) {
    const rotY = -18 + p * 540, rotX = Math.sin(p * Math.PI * 2) * 12, rotZ = Math.sin(p * Math.PI) * -8;
    const sc = 1 + Math.sin(p * Math.PI) * 0.1, ty = Math.sin(p * Math.PI * 3) * 12;
    phone.style.transform = `translate3d(0,${ty.toFixed(2)}px,0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    const center = y + L.vh / 2;
    L.bub.forEach((b) => { const d = Math.max(-1, Math.min(1, (b.mid - center) / L.vh)); b.el.style.transform = `translate3d(0,${(d * 70 * b.sp).toFixed(1)}px,0)`; });
    if (L.tilt) { const k = Math.max(-0.6, Math.min(0.6, (L.tilt.mid - center) / L.vh)); L.tilt.el.style.transform = `translate3d(0,${(k * 30).toFixed(1)}px,0) rotate(${(4 + k * 8).toFixed(2)}deg)`; }
  }
  const idx = Math.min(2, Math.floor(L.target * 3.2));
  if (idx !== L.idx) { L.idx = idx; bigs.forEach((h) => h.classList.toggle("off", +h.dataset.i !== idx)); }
  const solid = y > L.st + stage.offsetHeight - 80;
  if (solid !== L.solid) { L.solid = solid; $("#lnav").classList.toggle("solid", solid); }
  if (L.cur !== L.target) L.raf = requestAnimationFrame(frame);
}
function onScroll() {
  if ($("#landing").classList.contains("hide")) return;
  if (!L.raf) L.raf = requestAnimationFrame(frame);
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", () => { measure(); onScroll(); });
addEventListener("load", () => { measure(); onScroll(); });


/* ---------- Voz: hablar y escuchar ---------- */
const VOZ = { tts: null, dict: null, ready: false };
(async () => {
  try { if (window.claude && claude.use) { VOZ.tts = await claude.use("tts"); VOZ.dict = await claude.use("dictation"); } } catch {}
  VOZ.ready = true;
})();
function vozEs() {
  const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
  const es = vs.filter((v) => /^es/i.test(v.lang));
  return es.find((v) => /paulina|m[oó]nica|female|mujer|helena|lupe|sabina|isabela|luciana|marisol/i.test(v.name)) || es.find((v) => /419|MX|US|PE|AR|CO/i.test(v.lang)) || es[0] || null;
}
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => {};
function hablar(text, cfg = {}) {
  if (cfg.mute) return Promise.resolve();
  if (VOZ.tts) return VOZ.tts.speak(text, { voice: "airy", rate: 1.05 }).catch(() => {});
  if (!window.speechSynthesis) return Promise.resolve();
  return new Promise((res) => {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = vozEs(); if (v) u.voice = v; u.lang = v?.lang || "es-MX";
      u.pitch = cfg.pitch || 1.15; u.rate = cfg.rate || 1.05;
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
      setTimeout(res, 15000);
    } catch { res(); }
  });
}
function puedeEscuchar() { return !!(VOZ.dict || window.SpeechRecognition || window.webkitSpeechRecognition); }
function escuchar(onPartial) {
  // Llamar directo desde un toque del usuario
  if (VOZ.dict) {
    return new Promise((res, rej) => {
      let txt = "";
      const offP = VOZ.dict.onPartial(({ text }) => onPartial && onPartial(txt + " " + text));
      const offF = VOZ.dict.onFinal(({ text }) => { txt = (txt + " " + text).trim(); onPartial && onPartial(txt); });
      const offS = VOZ.dict.onState(({ state }) => { if (state === "idle") { [offP, offF, offS].forEach((f) => typeof f === "function" && f()); res(txt.trim()); } });
      VOZ.dict.start().catch((e) => rej(e));
      escuchar.stop = () => VOZ.dict.stop().catch(() => {});
    });
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return new Promise((res, rej) => {
    try {
      const r = new SR(); r.lang = "es-PE"; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
      let fin = "";
      r.onresult = (e) => { let t = ""; for (const x of e.results) t += x[0].transcript; fin = t; onPartial && onPartial(t); };
      r.onerror = (e) => (e.error === "no-speech" ? res("") : rej(e));
      r.onend = () => res(fin.trim());
      r.start();
      escuchar.stop = () => { try { r.stop(); } catch {} };
    } catch (e) { rej(e); }
  });
}
function ringtone(ctxHolder) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)(); ctxHolder.ctx = ctx;
    const beep = (t) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 440; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.15, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9); o.start(t); o.stop(t + 1); };
    const t0 = ctx.currentTime; beep(t0); beep(t0 + 1.6);
  } catch {}
}

/* ---------- Llamada en el simulador ---------- */
function abrirLlamada(pers, dif, escena, onEnd) {
  // iPhone/iPad: la voz solo funciona si se "desbloquea" dentro del toque del usuario
  try { if (window.speechSynthesis && !VOZ.tts) { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } } catch {}
  const el = document.createElement("div");
  el.className = "callscr";
  el.innerHTML = `<div class="cbg"></div>
    <div class="ctop"><small id="cState">Llamando…</small><b>${esc(pers.name)}</b><span class="ctag">${esc(pers.tag)}</span></div>
    <div class="cav" id="cAv"><i></i><i></i><i></i><span>${ic(pers.av)}</span></div>
    <div class="cint"><small id="cIntL">Interés 50%</small><div class="meter"><div id="cIntM" style="width:50%"></div></div></div>
    <div class="ctrans" id="cTrans"></div>
    <div class="clive" id="cLive"></div>
    <button class="toggle" id="cKbd" type="button" style="color:#ffd1e1">${ic("pencil")} Escribir en vez de hablar</button>
    <form class="ctext hide" id="cTextF"><input id="cTextIn" placeholder="Escribe lo que le dirías…" aria-label="Lo que le dices"><button aria-label="Decir">${ic("send")}</button></form>
    <div class="cbtns">
      <button class="cb" id="cMute" aria-label="Silenciar su voz">${ic("voice")}<small>Su voz</small></button>
      <button class="cb mic" id="cMic" aria-label="Hablar">${ic("chat")}<small id="cMicL">Toca y habla</small></button>
      <button class="cb hang" id="cHang" aria-label="Colgar">${ic("close")}<small>Colgar</small></button>
    </div>`;
  document.body.append(el);
  paintIcons(el);
  const hist = [], st = { mute: false, busy: false, ended: false, cita: false, t0: 0, timer: 0, int: 50 };
  const $c = (s) => el.querySelector(s);
  const line = (who, t) => { const d = document.createElement("div"); d.className = "cl " + who; d.textContent = t; $c("#cTrans").append(d); $c("#cTrans").scrollTop = 1e6; };
  const setInt = (v) => { st.int = v; $c("#cIntM").style.width = v + "%"; $c("#cIntL").textContent = `Interés ${v}%`; };
  const talking = (on) => $c("#cAv").classList.toggle("talk", on);
  if (!puedeEscuchar()) { $c("#cTextF").classList.remove("hide"); $c("#cMic").classList.add("hide"); }
  const end = async (reason) => {
    if (st.ended) return; st.ended = true; clearInterval(st.timer);
    try { speechSynthesis && speechSynthesis.cancel(); VOZ.tts && VOZ.tts.stop(); } catch {}
    $c("#cState").textContent = reason || "Llamada terminada";
    el.classList.add("ending");
    setTimeout(() => { el.remove(); onEnd && onEnd({ hist, cita: st.cita, secs: st.t0 ? Math.round((Date.now() - st.t0) / 1000) : 0, colgo: reason && reason.includes("colgó") }); }, 1400);
  };
  const sheSays = async (t) => { line("her", t); talking(true); await hablar(t, { mute: st.mute }); talking(false); };
  const send = async (txt) => {
    txt = (txt || "").trim(); if (!txt || st.busy || st.ended) return;
    st.busy = true; line("me", txt); hist.push({ role: "user", content: txt });
    $c("#cLive").textContent = ""; $c("#cMicL").textContent = "Ella responde…";
    try {
      const r = await ai("sim", { persona: pers, dificultad: dif, llamada: true, history: hist, escenario: escena?.ctx });
      const v = Math.max(0, Math.min(100, Number(r.interes) || 0)); setInt(v);
      const said = (Array.isArray(r.msgs) ? r.msgs : [r.msg]).filter(Boolean).join(" ");
      if (said) { hist.push({ role: "assistant", content: said }); await sheSays(said); }
      if (r.cita && !st.cita) { st.cita = true; hearts(innerWidth / 2, innerHeight / 2, 24); toast(`¡${pers.name} aceptó salir contigo!`); }
      if (r.colgar) return end(`${pers.name} colgó`);
    } catch (e) { hist.pop(); line("sys", "No se escuchó bien (" + e.message + "). Repite lo que dijiste."); }
    finally { st.busy = false; if (!st.ended) $c("#cMicL").textContent = "Toca y habla"; }
  };
  $c("#cMic").onclick = () => {
    if (st.busy || st.ended) return;
    if (el.classList.contains("listening")) { escuchar.stop && escuchar.stop(); return; }
    el.classList.add("listening"); $c("#cMicL").textContent = "Escuchando… toca para enviar";
    const guard = setTimeout(() => escuchar.stop && escuchar.stop(), 12000);
    escuchar((t) => ($c("#cLive").textContent = t)).finally(() => clearTimeout(guard)).then((t) => { el.classList.remove("listening"); if (t) send(t); else { $c("#cMicL").textContent = "No te escuché, toca otra vez"; } })
      .catch(() => { el.classList.remove("listening"); $c("#cTextF").classList.remove("hide"); $c("#cMic").classList.add("hide"); toast("No pude usar el micrófono aquí. Escribe lo que dirías."); });
  };
  $c("#cKbd").onclick = () => { $c("#cTextF").classList.toggle("hide"); if (!$c("#cTextF").classList.contains("hide")) $c("#cTextIn").focus(); };
  $c("#cTextF").onsubmit = (e) => { e.preventDefault(); const v = $c("#cTextIn").value; $c("#cTextIn").value = ""; send(v); };
  $c("#cMute").onclick = () => { st.mute = !st.mute; $c("#cMute").classList.toggle("off", st.mute); if (st.mute) try { speechSynthesis.cancel(); VOZ.tts && VOZ.tts.stop(); } catch {} };
  $c("#cHang").onclick = () => end("Colgaste");
  // timbre y contesta
  const holder = {}; ringtone(holder);
  setTimeout(async () => {
    if (st.ended) return;
    try { holder.ctx && holder.ctx.close(); } catch {}
    st.t0 = Date.now(); el.classList.add("live");
    st.timer = setInterval(() => { const s = Math.round((Date.now() - st.t0) / 1000); $c("#cState").textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }, 1000);
    const hola = (escena && escena.callOpen) || { Dani: "¿Aló? ¿Quién habla?", Lu: "Mmm, ¿y esta llamada sorpresa?", Cami: "Aló… ¿pasó algo?", Sofi: "Ho… hola", Majo: "Aló, sí, dime rápido que estoy saliendo", Ari: "¡ALÓ! jaja ¿qué fue?", Isa: "Hola… no esperaba tu llamada", Nati: "Aló, ¿sí?", "Rocío": "¡Holaaa! ¡Qué lindo que me llames!" }[pers.name] || "¿Aló?";
    hist.push({ role: "assistant", content: hola });
    await sheSays(hola);
  }, 3200);
}

/* ---------- Tarjeta para compartir ---------- */
async function tarjeta({ score, titulo, persona, tag, extra }) {
  const W = 1080, H = 1920, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const x = cv.getContext("2d");
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#ff4f8b"); g.addColorStop(0.55, "#a8235f"); g.addColorStop(1, "#2b0a18");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.globalAlpha = 0.12; x.fillStyle = "#fff";
  for (let i = 0; i < 40; i++) { const px = (i * 197) % W, py = (i * 311) % H, s = 30 + (i % 4) * 14; x.beginPath(); x.moveTo(px, py + s * 0.3); x.bezierCurveTo(px, py, px - s * 0.5, py, px - s * 0.5, py + s * 0.3); x.bezierCurveTo(px - s * 0.5, py + s * 0.6, px, py + s * 0.8, px, py + s); x.bezierCurveTo(px, py + s * 0.8, px + s * 0.5, py + s * 0.6, px + s * 0.5, py + s * 0.3); x.bezierCurveTo(px + s * 0.5, py, px, py, px, py + s * 0.3); x.fill(); }
  x.globalAlpha = 1;
  const face = new Image(); face.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${FACE}</svg>`);
  await new Promise((r) => { face.onload = r; face.onerror = r; });
  try { x.drawImage(face, W / 2 - 150, 220, 300, 300); } catch {}
  x.textAlign = "center"; x.fillStyle = "#fff";
  x.font = "500 54px 'Space Grotesk', Arial"; x.fillText("¿y si te", W / 2, 640);
  x.font = "700 110px 'Space Grotesk', Arial"; x.fillText("escribo?", W / 2, 750);
  x.beginPath(); x.arc(W / 2, 1060, 210, 0, Math.PI * 2); x.fillStyle = "#0e0d12"; x.fill();
  x.beginPath(); x.arc(W / 2, 1060, 210, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score) / 100); x.lineWidth = 34; x.strokeStyle = "#ffd166"; x.lineCap = "round"; x.stroke();
  x.fillStyle = "#fff"; x.font = "700 170px 'Space Grotesk', Arial"; x.fillText(String(score), W / 2, 1120);
  x.font = "600 40px Inter, Arial"; x.fillStyle = "#ffd166"; x.fillText("PUNTOS", W / 2, 1180);
  x.fillStyle = "#fff"; x.font = "700 62px 'Space Grotesk', Arial";
  const t = String(titulo || "").slice(0, 34); x.fillText(t, W / 2, 1390);
  x.font = "500 44px Inter, Arial"; x.fillStyle = "#ffe2ec"; x.fillText(`Practiqué con ${persona} (${tag})`, W / 2, 1470);
  if (extra) { x.fillStyle = "#ffd166"; x.font = "700 46px Inter, Arial"; x.fillText(extra, W / 2, 1545); }
  x.fillStyle = "#fff"; x.font = "600 40px Inter, Arial"; x.fillText("¿Le ganas? Prueba el simulador", W / 2, 1720);
  x.font = "700 44px 'Space Grotesk', Arial"; x.fillStyle = "#ffd166"; x.fillText(location.hostname.includes("netlify") ? location.hostname : "¿Y si te escribo?", W / 2, 1790);
  const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
  const file = new File([blob], "mi-puntaje.png", { type: "image/png" });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Mi puntaje en ¿Y si te escribo?" }); badge("share"); return; } } catch (e) { if (e && e.name === "AbortError") return; }
  const url = URL.createObjectURL(blob);
  modal(`<h2>Tu tarjeta</h2><p class="lead">Mantén presionada la imagen para guardarla y subirla a tus historias.</p><img src="${url}" alt="Tarjeta con tu puntaje" style="width:100%;border-radius:16px;margin:8px 0">`);
  badge("share");
}

/* ---------- Ruleta de temas ---------- */
const TEMAS = [
  { n: "Pícaro", c: "#ff4f8b", q: ["¿Qué es lo más atrevido que has hecho por alguien que te gustaba?", "Si tuviéramos una cita secreta, ¿a dónde me llevarías?", "Dime tu mejor cualidad… pero la que no pondrías en tu bio", "¿Eres de las que da el primer paso o de las que espera?", "Del 1 al 10, ¿qué tan peligrosa eres cuando te aburres?"] },
  { n: "Random", c: "#a45cff", q: ["Si fueras un snack, ¿cuál serías y por qué?", "¿Qué opinas: la pizza con piña es crimen o arte?", "¿Cuál es tu teoría conspirativa favorita (en broma)?", "Si tu vida fuera serie, ¿cómo se llamaría?", "¿Qué superpoder inútil te gustaría tener?"] },
  { n: "Profundo", c: "#4fa3ff", q: ["¿Qué te hace sentir más tú misma?", "¿Qué te gustaría hacer este año sí o sí?", "¿Qué canción te pone nostálgica?", "¿Cuál es el mejor consejo que te han dado?", "¿Qué cosa pequeña te alegra el día?"] },
  { n: "Gracioso", c: "#ffd166", q: ["Cuéntame tu momento más vergonzoso (yo te cuento el mío)", "¿Cuál es el peor apodo que te han puesto?", "¿Qué meme te representa hoy?", "Si tu mascota hablara, ¿qué chisme contaría de ti?", "¿Cuál es la excusa más absurda que has inventado?"] },
  { n: "Retos", c: "#3fd59a", q: ["Reto: mándame un audio diciendo tu frase favorita", "Te reto a adivinar mi comida favorita en 3 intentos", "Reto: dime 3 emojis que me describan", "El que pierda en piedra, papel o tijera invita el café", "Reto: cuéntame algo que nadie sepa de ti"] },
  { n: "Planes", c: "#ff7a3d", q: ["¿Plan ideal de domingo: playa, cine o quedarse en casa?", "¿Qué lugar de la ciudad todavía no conoces y te mueres por ir?", "¿Café, helado o algo más loco para una primera salida?", "¿Te animas a un plan improvisado esta semana?", "¿Cuál es el mejor sitio para comer que conoces?"] },
  { n: "Música", c: "#e83e8c", q: ["¿Qué canción no puede faltar en tu playlist?", "¿Concierto al que irías aunque sea sola?", "¿Reggaetón, rock, pop o algo que me sorprenda?", "¿Qué canción te sabes completita?", "Mándame una canción y te mando otra"] },
  { n: "Comida", c: "#7a1840", q: ["¿Ceviche o lomo saltado? Piensa bien tu respuesta", "¿Cuál es tu antojo de medianoche?", "¿Sabes cocinar algo o eres team delivery?", "¿La comida que nunca probarías?", "Si te invito a comer, ¿qué pides sin pensar?"] },
];
function vistaRuleta() {
  const N = TEMAS.length, R = 140, cx = 150, cy = 150;
  const seg = TEMAS.map((t, i) => {
    const a0 = (i / N) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / N) * Math.PI * 2 - Math.PI / 2;
    const p = (a) => `${cx + R * Math.cos(a)},${cy + R * Math.sin(a)}`;
    const am = (a0 + a1) / 2, tx = cx + R * 0.62 * Math.cos(am), ty = cy + R * 0.62 * Math.sin(am);
    return `<path d="M${cx},${cy} L${p(a0)} A${R},${R} 0 0 1 ${p(a1)} Z" fill="${t.c}" stroke="#0e0d12" stroke-width="3"/><text x="${tx}" y="${ty}" fill="#fff" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="15" text-anchor="middle" dominant-baseline="middle" transform="rotate(${(am * 180) / Math.PI + 90} ${tx} ${ty})">${t.n}</text>`;
  }).join("");
  V.innerHTML = `${backBtn()}<h1 class="title">${ic("refresh")} Ruleta de temas</h1><p class="lead">¿Se murió la conversación? Gira la ruleta y te doy un tema o pregunta para revivirla.</p>
    <div class="wheelwrap"><div class="pointer"></div><svg class="wheel" id="wheel" viewBox="0 0 300 300" role="img" aria-label="Ruleta de temas">${seg}<circle cx="150" cy="150" r="26" fill="#0e0d12"/><circle cx="150" cy="150" r="10" fill="#ffd166"/></svg></div>
    <button class="go" id="spin">${ic("refresh")} Girar</button><div id="out"></div>`;
  wireBack();
  let rot = 0, spinning = false;
  $("#spin", V).onclick = () => {
    if (spinning) return; spinning = true;
    const i = Math.floor(Math.random() * N), q = TEMAS[i].q[Math.floor(Math.random() * 5)];
    const target = 360 * 6 + (360 - (i + 0.5) * (360 / N));
    rot = rot - (rot % 360) + target;
    const w = $("#wheel", V); w.style.transition = reduce ? "none" : "transform 4s cubic-bezier(.15,.9,.2,1)"; w.style.transform = `rotate(${rot}deg)`;
    setTimeout(() => {
      spinning = false; const b = w.getBoundingClientRect(); hearts(b.left + b.width / 2, b.top + 20, 14);
      $("#out", V).innerHTML = `<div class="res"><div class="sec"><h2><span class="dot" style="background:${TEMAS[i].c}"></span>${TEMAS[i].n}</h2>${optCard({ msg: q, por: "Úsalo tal cual o adáptalo a tu estilo" }, TEMAS[i].n === "Pícaro" ? "picara" : "seguir", TEMAS[i].c, 0.05)}</div></div>`;
      wireOpts(); addXP(2); dailyEvent({ type: "tool", v: "ruleta" });
    }, reduce ? 50 : 4100);
  };
}


/* ---------- Juegos para la previa ---------- */
const JUEGOS = {
  verdad: {
    suave: ["¿Cuál ha sido tu cita más desastrosa?", "¿A quién del grupo le pedirías consejo de amor?", "¿Qué es lo más vergonzoso que te ha pasado frente a alguien que te gustaba?", "¿Cuál es tu tipo ideal en 3 palabras?", "¿Alguna vez stalkeaste a alguien hasta fotos de hace años?", "¿Cuál es el apodo más raro que te han puesto?", "¿Qué canción te dedicarías a ti mismo?", "¿Cuál es tu mayor red flag?", "¿Qué fue lo último que buscaste en Google?", "¿Has dejado en visto a alguien que te gustaba?", "¿Cuál es tu peor hábito?", "¿Qué es lo que más te atrae de una persona?"],
    hot: ["¿Quién del grupo te parece más guapo o guapa?", "¿Cuál es el mensaje más atrevido que has mandado?", "¿Alguna vez te gustó alguien que está aquí?", "¿Cuál fue tu primer beso y cómo fue?", "¿Qué es lo más loco que has hecho por alguien que te gustaba?", "Del 1 al 10, ¿qué tan buen coqueto o coqueta eres?", "¿Con quién de tus contactos tienes más química por chat?", "¿Cuál es la frase para ligar que mejor te ha funcionado?", "¿Qué te pone nervioso o nerviosa en una cita?", "¿Has escrito un mensaje y lo borraste antes de enviarlo? ¿A quién?", "¿Qué es lo primero que miras en alguien?", "¿Cuál es tu crush famoso?"],
  },
  reto: {
    suave: ["Imita a alguien del grupo hasta que adivinen quién es", "Habla con acento extranjero hasta tu próximo turno", "Cuenta un chiste malo; si nadie se ríe, repites", "Haz tu mejor pose de modelo por 10 segundos", "Deja que el grupo te ponga un apodo por el resto de la noche", "Canta el coro de una canción que elija el grupo", "Haz 10 sentadillas mientras dices cumplidos", "Muestra la última foto de tu galería (puedes elegir otra si es privada)", "Baila sin música por 15 segundos", "Di 3 cosas buenas de la persona a tu izquierda"],
    hot: ["Mándale un mensaje coqueto a tu crush (lo escribe el grupo, tú decides si lo envías)", "Dile tu mejor piropo a la persona de tu derecha", "Muéstrale al grupo tu último chat con alguien que te gusta (o pasa)", "Haz tu mejor mirada seductora a la cámara por 5 segundos", "Imita cómo coqueteas por chat, en voz alta", "Escoge a alguien y dile qué es lo que más te atrae de su personalidad", "Deja que el grupo escriba tu bio de Tinder", "Cuenta en 20 segundos cómo sería tu cita perfecta", "Llama a alguien y dile que lo extrañas (puedes elegir a tu mamá)", "Susúrrale un cumplido a alguien del grupo"],
  },
  yonunca: {
    suave: ["Yo nunca nunca he dejado a alguien en visto a propósito", "Yo nunca nunca he fingido estar ocupado para no salir", "Yo nunca nunca he stalkeado a un ex", "Yo nunca nunca me he enamorado de alguien por chat", "Yo nunca nunca he mandado un audio y luego lo borré", "Yo nunca nunca he olvidado el nombre de alguien con quien salí", "Yo nunca nunca he usado una frase de internet para ligar", "Yo nunca nunca he llorado viendo una película romántica"],
    hot: ["Yo nunca nunca he besado a alguien en la primera cita", "Yo nunca nunca he tenido un crush en alguien de este grupo", "Yo nunca nunca he mandado un mensaje coqueto y me arrepentí", "Yo nunca nunca he salido con dos personas en la misma semana", "Yo nunca nunca he besado a alguien que conocí ese mismo día", "Yo nunca nunca he escrito a un ex a medianoche", "Yo nunca nunca he dado el primer beso yo", "Yo nunca nunca he tenido una cita a ciegas"],
  },
  prefieres: {
    suave: ["¿Qué prefieres: que te dejen en visto o que te respondan con 'ok'?", "¿Qué prefieres: cita en la playa o en un concierto?", "¿Qué prefieres: que te escriban todos los días o que te sorprendan de vez en cuando?", "¿Qué prefieres: primera cita con cena o con helado y caminar?", "¿Qué prefieres: alguien muy gracioso o muy detallista?", "¿Qué prefieres: audios o mensajes de texto?"],
    hot: ["¿Qué prefieres: un beso inesperado o una declaración por chat?", "¿Qué prefieres: que te coqueteen directo o con indirectas?", "¿Qué prefieres: tu crush lee todos tus chats o tú lees todos los suyos?", "¿Qué prefieres: una cita romántica o una cita llena de adrenalina?", "¿Qué prefieres: que tu ex te escriba o que tu crush te ignore?", "¿Qué prefieres: abrazo largo o beso corto?"],
  },
  probable: {
    suave: ["¿Quién es más probable que se enamore en una semana?", "¿Quién es más probable que deje en visto a todos?", "¿Quién es más probable que se case primero?", "¿Quién es más probable que se pierda camino a una cita?", "¿Quién es más probable que escriba 'jaja' sin reírse?"],
    hot: ["¿Quién es más probable que tenga un crush secreto aquí?", "¿Quién es más probable que le escriba a su ex esta noche?", "¿Quién es más probable que bese primero en una cita?", "¿Quién es más probable que tenga más matches en Tinder?", "¿Quién es más probable que coquetee con el mesero?"],
  },
  botella: {
    suave: ["Díganse un cumplido sincero", "Cuéntense su peor cita", "Hagan una pose juntos para una foto", "Elijan juntos una canción y cántenla", "Uno le pregunta algo al otro y debe responder sí o sí"],
    hot: ["Mírense a los ojos 10 segundos sin reírse", "Díganse qué es lo que más les atrae del otro", "Bailen juntos el coro de una canción", "Uno le escribe al otro el mensaje más coqueto que se le ocurra", "Abrazo de 5 segundos (o paso, si no quieren)"],
  },
};
const JMETA = [
  ["verdad", "Verdad o reto", "face-flirty", "#ff4f8b"],
  ["yonunca", "Yo nunca nunca", "bolt", "#a45cff"],
  ["prefieres", "¿Qué prefieres?", "face-think", "#4fa3ff"],
  ["probable", "¿Quién es más probable…?", "target", "#ffd166"],
  ["botella", "Gira la botella", "refresh", "#3fd59a"],
];
function vistaJuegos() {
  const hot = !!DATA.profile.hot;
  let jugadores = (DATA.players || []).slice(0, 12), juego = null, turno = 0, usados = {};
  const pick = (arr) => { const k = arr.join("|").length; usados[k] = usados[k] || []; let pool = arr.filter((x) => !usados[k].includes(x)); if (!pool.length) { usados[k] = []; pool = arr; } const x = pool[Math.floor(Math.random() * pool.length)]; usados[k].push(x); return x; };
  const lista = (id) => { const g = JUEGOS[id]; return hot ? [...g.suave, ...g.hot, ...g.hot] : g.suave; };
  const render = () => {
    V.innerHTML = `${backBtn()}<h1 class="title">${ic("party")} Juegos para la previa</h1>
      <p class="lead">${hot ? "Modo HOT activo: las preguntas y retos salen más picantes." : "Activa el Modo HOT en Perfil para la versión picante."} Siempre se puede decir <b>paso</b>.</p>
      <div class="card"><h3 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mut)">Jugadores (${jugadores.length})</h3>
        <div class="row" id="jp">${jugadores.map((n, i) => `<button class="chip" data-del="${i}">${esc(n)} ${ic("close")}</button>`).join("")}</div>
        <form class="sendrow" id="jf"><input id="jn" placeholder="Agregar nombre" autocomplete="off" maxlength="16"><button aria-label="Agregar">${ic("plus")}</button></form></div>
      <div class="grid" style="margin-top:14px">${JMETA.map(([id, t, icn, c], i) => `<button class="tool ${i === 0 ? "big" : ""}" data-j="${id}" style="--c:${c};animation-delay:${i * 0.06}s;min-height:110px"><span class="ic">${ic(icn)}</span><b>${t}</b></button>`).join("")}</div>`;
    wireBack();
    $("#jf", V).onsubmit = (e) => { e.preventDefault(); const n = $("#jn", V).value.trim(); if (!n) return; jugadores.push(n.slice(0, 16)); DATA.players = jugadores; save(); render(); setTimeout(() => $("#jn", V).focus(), 50); };
    $$("[data-del]", V).forEach((b) => (b.onclick = () => { jugadores.splice(+b.dataset.del, 1); DATA.players = jugadores; save(); render(); }));
    $$("[data-j]", V).forEach((b) => (b.onclick = () => { juego = b.dataset.j; turno = 0; jugar(); }));
  };
  const nombre = (k = 0) => (jugadores.length ? jugadores[(turno + k) % jugadores.length] : "");
  const jugar = (tipo) => {
    const meta = JMETA.find((m) => m[0] === juego);
    let titulo = meta[1], txt = "", quien = nombre(), extra = "";
    if (juego === "verdad") {
      if (!tipo) {
        V.innerHTML = `${backBtn("juegos")}<h1 class="title">${ic(meta[2])} ${titulo}</h1><div class="card gamecard" style="--c:${meta[3]}"><small>${quien ? "Turno de" : "Tu turno"}</small><b class="who">${esc(quien || "¿Quién empieza?")}</b><p class="lead">Elige:</p><div class="row" style="justify-content:center"><button class="go" id="gv" style="width:auto;padding:16px 30px">Verdad</button><button class="go alt" id="gr" style="width:auto;padding:16px 30px">Reto</button></div></div>`;
        $$("[data-back]", V).forEach((b) => (b.onclick = render));
        $("#gv", V).onclick = () => jugar("verdad"); $("#gr", V).onclick = () => jugar("reto");
        return;
      }
      txt = pick(lista(tipo)); titulo = tipo === "verdad" ? "Verdad" : "Reto";
    } else if (juego === "botella") {
      if (jugadores.length < 2) { toast("Agrega al menos 2 jugadores"); return render(); }
      const a = Math.floor(Math.random() * jugadores.length); let b = Math.floor(Math.random() * (jugadores.length - 1)); if (b >= a) b++;
      quien = jugadores[a]; extra = jugadores[b]; txt = pick(lista("botella"));
    } else {
      txt = pick(lista(juego));
      if (juego === "yonunca") extra = "Si lo hiciste, baja un dedo. Quien baje los 5 primero, cumple un reto.";
      if (juego === "probable") { extra = "A la cuenta de 3, todos señalan a alguien."; quien = ""; }
      if (juego === "prefieres") extra = "Todos responden y explican por qué.";
    }
    V.innerHTML = `${backBtn("juegos")}<h1 class="title">${ic(meta[2])} ${esc(meta[1])}</h1>
      <div class="card gamecard pop" style="--c:${meta[3]}">
        ${juego === "botella" ? `<div class="bottle" id="bt">${ic("refresh")}</div><small>La botella eligió a</small><b class="who">${esc(quien)} y ${esc(extra)}</b>` : quien ? `<small>Turno de</small><b class="who">${esc(quien)}</b>` : ""}
        <div class="gtag">${esc(titulo)}${DATA.profile.hot && JUEGOS[juego === "verdad" ? (titulo === "Reto" ? "reto" : "verdad") : juego]?.hot.includes(txt) ? " · " + ic("fire") + " picante" : ""}</div>
        <p class="gtxt">${esc(txt)}</p>
        ${extra && juego !== "botella" ? `<p class="lead">${esc(extra)}</p>` : ""}
      </div>
      <div class="row"><button class="go" id="gn" style="flex:1">${ic("refresh")} Siguiente</button><button class="go alt" id="gp" style="flex:1">Paso</button></div>`;
    $$("[data-back]", V).forEach((b) => (b.onclick = render));
    const next = () => { turno++; addXP(1); jugar(); };
    $("#gn", V).onclick = (e) => { hearts(e.clientX, e.clientY, 8); next(); };
    $("#gp", V).onclick = () => { toast("Paso, sin problema"); next(); };
    if (!reduce) { const c = $(".gamecard", V); c.animate([{ transform: "rotateY(90deg) scale(.8)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 450, easing: "cubic-bezier(.3,1.4,.5,1)" }); }
  };
  render();
}

/* PWA */
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
boot();
