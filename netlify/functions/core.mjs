// Lógica del servidor de "¿Y si te escribo?": cuentas, datos guardados e IA.
// Se separa del handler de Netlify para poder probarla con un almacén falso.
import crypto from "node:crypto";

const enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const json = (d, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json" } });
const today = () => new Date().toISOString().slice(0, 10);

/* ---------- Contraseñas y sesiones ---------- */
function hashPassword(pw, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(pw, salt, 64).toString("hex");
  return { salt, hash };
}
function checkPassword(pw, salt, hash) {
  const h = crypto.scryptSync(pw, salt, 64);
  const ref = Buffer.from(hash, "hex");
  return h.length === ref.length && crypto.timingSafeEqual(h, ref);
}
function sign(payload, secret) {
  const body = enc(payload);
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + sig;
}
function verify(token, secret) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const good = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  const p = JSON.parse(Buffer.from(body, "base64url").toString());
  return p.exp > Date.now() ? p : null;
}

/* ---------- Instrucciones de la IA ---------- */
const BASE = `Eres "¿Y si te escribo?", un coach de conversación para ligar: cercano, con buena onda y honesto. Escribes en español latino casual, como se escribe por WhatsApp o Instagram, natural, nunca robótico ni cursi.
Reglas que siempre cumples:
- Lo pícaro es coqueto, con chispa y doble sentido suave; nunca vulgar, sexual explícito ni insistente.
- Nada manipulador, de presión, celos o que ignore un "no". Si la otra persona muestra desinterés, lo dices con honestidad y sugieres soltar o ir tranquilo.
- Mensajes cortos (1-2 líneas) que el usuario pueda mandar tal cual. Emojis solo si encajan con el tono.
- Responde SOLO con JSON válido, sin texto antes ni después.

MÉTODO (lo que mejor funciona al chatear, según coaches y datos de apps de citas):
1. Personaliza: engancha algo concreto que ella dijo o que aparece en su perfil. Lo genérico ("hey", "¿qué tal tu día?") se ignora.
2. Atrapa y devuelve: responde a lo que ella dijo, agrega algo tuyo (opinión, mini historia, broma) y deja un gancho fácil de contestar.
3. Nada de modo entrevista: mezcla afirmaciones y observaciones con preguntas; prefiere preguntas abiertas o juguetonas a las de sí/no; nunca varias preguntas seguidas.
4. Juego ligero: callbacks a algo que ya hablaron, exageraciones juguetonas, retos suaves, "asumir" en broma que ya hay plan ("si nos preguntan cómo nos conocimos…"). Cumplidos específicos, no sobre el físico de entrada.
5. Iguala su energía: largo parecido al de ella, su nivel de emojis y su forma de escribir. Si ella escribe corto, tú no mandas párrafos.
6. Evita: respuestas de una palabra, frases cliché de ligue, exceso de cumplidos, negatividad, quejas, insistir si no responde, sonar necesitado.
7. Si el interés es alto, propón verse con algo concreto (actividad + día) ligado a lo que a ella le gusta. El objetivo del chat es la cita, no chatear para siempre.
8. Mejor cerrar en un punto alto que dejar morir la charla.
9. Si responde corto, tarde o seco varias veces, dilo con honestidad: soltar también es una opción.`;

function voiceCtx(p) {
  return p.voice ? `\nIMPORTANTE: escribe como el propio usuario para que suene a él. Ejemplos reales de cómo escribe: """${String(p.voice).slice(0, 800)}""". Copia su forma (mayúsculas/minúsculas, jerga, abreviaturas, emojis, largo), no su contenido.` : "";
}
function crushCtx(c) {
  if (!c || !c.name) return "";
  return `\nLa conversación es con ${c.name}. Notas del usuario sobre ella: ${c.notes || "ninguna"}.`;
}

const MODES = {
  reply: (p) => ({
    text: `${p.hasImages ? "Te paso capturas de un chat. Los mensajes del usuario suelen estar a la DERECHA; los de la otra persona a la IZQUIERDA.\n" : ""}${p.chat ? "Chat en texto:\n" + p.chat + "\n" : ""}${p.ctx ? "Contexto: " + p.ctx + "\n" : ""}Estilo del usuario: ${p.style || "relajado"}.${crushCtx(p.crush)}${voiceCtx(p)}
Lee el último mensaje de ella y el tono, y propone respuestas.
JSON: {"interes":0-100,"lectura":"1-2 frases sobre cómo va","picara":[{"msg":"","por":"por qué funciona","tecnica":"nombre corto de la técnica del MÉTODO, ej. Callback"},{"msg":"","por":"","tecnica":""}],"normal":[{"msg":"","por":"","tecnica":""},{"msg":"","por":"","tecnica":""}],"seguir":[{"msg":"","por":"","tecnica":""},{"msg":"","por":"","tecnica":""}],"error":"si el usuario cometió un error en el chat (modo entrevista, respuestas secas, etc.), dilo en una frase; si no, vacío","consejo":"consejo corto"}`,
    max: 1200,
  }),
  opener: (p) => ({
    text: `${p.hasImages ? "Te paso capturas de su perfil (fotos, bio, historias). Fíjate en detalles concretos: lugares, mascotas, gustos, estilo.\n" : ""}${p.bio ? "Lo que el usuario sabe de ella: " + p.bio + "\n" : ""}Estilo del usuario: ${p.style || "relajado"}.${voiceCtx(p)}
Crea 6 mensajes para iniciar conversación, basados en detalles concretos (nada de "hola, ¿cómo estás?"). Mezcla tipos.
JSON: {"detalles":["detalle que notaste", "..."],"abridores":[{"tipo":"pícaro|gracioso|curioso|directo","msg":"","por":""}]}`,
    max: 1000,
  }),
  check: (p) => ({
    text: `El usuario está a punto de mandar este mensaje: "${p.mensaje}".${p.chat ? "\nContexto del chat:\n" + p.chat : ""}${crushCtx(p.crush)}
Evalúalo con honestidad usando el MÉTODO antes de que lo envíe.${voiceCtx(p)}
JSON: {"puntaje":0-10,"veredicto":"frase corta y graciosa","bien":["lo que funciona"],"riesgos":["lo que puede salir mal"],"mejoradas":[{"msg":"","por":""},{"msg":"","por":""}]}`,
    max: 800,
  }),
  decode: (p) => ({
    text: `Ella escribió: "${p.mensaje}".${p.chat ? "\nContexto del chat:\n" + p.chat : ""}${crushCtx(p.crush)}
Decodifica qué pudo querer decir. Sé realista, sin crear falsas esperanzas.${voiceCtx(p)}
JSON: {"lecturas":[{"significado":"","probabilidad":0-100}],"senales":["señal que se nota en el mensaje"],"que_hacer":"consejo corto","respuesta":{"msg":"","por":""}}`,
    max: 800,
  }),
  invite: (p) => ({
    text: `El usuario quiere invitar a salir a ${p.crush?.name || "una chica"}.${crushCtx(p.crush)}${p.chat ? "\nCómo va el chat:\n" + p.chat : ""}${p.ciudad ? "\nCiudad: " + p.ciudad : ""}${p.presupuesto ? "\nPresupuesto: " + p.presupuesto : ""}${voiceCtx(p)}
Propón 3 planes de primera cita concretos, baratos y cómodos (lugares públicos, de día o temprano), ligados a lo que a ella le gusta, y para cada uno un mensaje para invitarla con día propuesto. Incluye cuándo conviene mandarlo.
JSON: {"listo":0-100,"comentario":"¿ya es buen momento para invitarla? 1 frase","planes":[{"titulo":"","por":"por qué a ella le gustaría","msg":"mensaje para invitarla"}],"si_dice_no":"cómo responder con buena onda si no puede"}`,
    max: 1000,
  }),
  double: (p) => ({
    text: `Situación: ${p.quien === "yo" ? "el usuario escribió último y ella no ha respondido" : "ella escribió último"}. Tiempo desde el último mensaje: ${p.tiempo || "no indicado"}.${p.chat ? "\nÚltimos mensajes:\n" + p.chat : ""}${crushCtx(p.crush)}${voiceCtx(p)}
¿Debería el usuario escribirle ahora? Sé honesto: insistir demasiado resta. Si conviene escribir, propone mensajes que no suenen a reclamo (nada de "¿por qué no respondes?"), ligeros y con algo nuevo.
JSON: {"semaforo":"verde|amarillo|rojo","veredicto":"frase corta","por":"explicación breve","esperar":"cuánto conviene esperar si no es verde","mensajes":[{"msg":"","por":""},{"msg":"","por":""}]}`,
    max: 700,
  }),
  sim: (p) => ({
    system: `Interpretas a ${p.persona?.name || "Vale"}, una chica ficticia de ${p.persona?.edad || 22} años, en un simulador para que el usuario practique a chatear. NUNCA rompas el personaje ni digas que eres IA.
Personalidad: ${p.persona?.vibe || "simpática pero no fácil de impresionar"}.
Forma de escribir: ${p.persona?.estilo || "minúsculas, frases cortas, 'jaja', algún emoji"}.
Dificultad: ${p.dificultad || "normal"} (fácil = se abre rápido; normal = hay que ganarse su interés; difícil = muy exigente, se aburre fácil).
Escribe como una chica real por WhatsApp, no como un asistente:
- Mensajes MUY cortos (1 a 8 palabras casi siempre). A veces mandas 2 o 3 mensajitos seguidos en vez de uno largo.
- Usa jerga latina natural, abreviaciones (q, xq, tmb, ntp, jsjs, jajaj), minúsculas, sin puntos finales, emojis solo si van con tu personalidad.
- No hagas preguntas en cada mensaje. Si él es aburrido o hace modo entrevista: respuestas secas ("ah", "sí", "jsjs ok", "normal"), y si sigue así lo dejas en visto.
- Si es gracioso, original o recuerda algo que dijiste: te abres, bromeas, coqueteas según tu personalidad.
- Si es intenso, necesitado, manda muchos cumplidos o insiste: te enfrías.
- Si es vulgar o irrespetuoso: cortas en seco y lo dejas en visto.
- Coqueteo como mucho pícaro con doble sentido suave; nada sexual explícito.
- Si te invita a salir con un plan concreto y tu interés es alto (más de 70), aceptas o propones otro día; si es bajo, pones excusa.
Responde SOLO JSON: {"msgs":["mensaje 1","mensaje 2 opcional"],"interes":0-100,"visto":false,"cita":false,"piensa":"lo que ella piensa en secreto de su último mensaje, 1 frase honesta y graciosa"}
"visto": true si lo dejas en visto (msgs vacío). "cita": true solo si aceptaste salir.`,
    max: 400,
  }),
  simScore: (p) => ({
    text: `Esta fue una práctica de chat del usuario con ${p.persona?.name || "una chica"} (${p.persona?.vibe || ""}):
${(p.history || []).map((m) => (m.role === "user" ? "Él: " : "Ella: ") + m.content).join("\n")}
Evalúa al usuario como coach.
JSON: {"puntaje":0-100,"titulo":"apodo divertido según cómo lo hizo","bien":["..."],"mejorar":["..."],"mejor_mensaje":"su mejor mensaje literal","peor_mensaje":"su peor mensaje literal","reescrito":"cómo debió escribir ese peor mensaje"}`,
    max: 700,
  }),
};

function parseJSON(t) {
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b < a) throw new Error("La IA no devolvió JSON");
  return JSON.parse(t.slice(a, b + 1));
}

/* ---------- Correo ---------- */
function emailHTML(name, code) {
  return `<div style="font-family:Arial,sans-serif;background:#0e0d12;padding:32px 16px"><div style="max-width:440px;margin:0 auto;background:#18161f;border-radius:20px;padding:28px;color:#f1eff6;text-align:center">
<div style="font-size:15px;color:#a8a3b5">¿y si te</div><div style="font-size:34px;font-weight:bold">escribo<span style="color:#ff4f8b">?</span></div>
<p style="font-size:16px;margin:22px 0 8px">Hola ${name}, este es tu código para activar tu cuenta:</p>
<div style="font-size:40px;letter-spacing:10px;font-weight:bold;color:#ffd166;background:#0e0d12;border-radius:14px;padding:16px;margin:12px 0">${code}</div>
<p style="font-size:13px;color:#a8a3b5">Vence en 15 minutos. Si no fuiste tú, ignora este correo.</p></div></div>`;
}

/* ---------- La app ---------- */
export function makeApp({ store, env, fetchImpl = fetch }) {
  const SECRET = env.JWT_SECRET || "dev-secret-cambia-esto";
  const MODEL = env.AI_MODEL || "claude-haiku-5-5";
  const DAILY = Number(env.DAILY_LIMIT || 40);
  const VERIFY = env.REQUIRE_EMAIL_VERIFY === "1"; // apagado: cualquiera entra sin código

  const getJSON = async (k) => {
    const v = await store.get(k);
    return v ? JSON.parse(v) : null;
  };
  const setJSON = (k, v) => store.set(k, JSON.stringify(v));
  const userKey = (email) => "user:" + crypto.createHash("sha256").update(email).digest("hex");

  async function sendCode(u) {
    const code = String(crypto.randomInt(100000, 1000000));
    u.verify = { hash: crypto.createHash("sha256").update(code + u.salt).digest("hex"), exp: Date.now() + 15 * 60e3, tries: 0, sent: Date.now() };
    await setJSON(userKey(u.email), u);
    if (env.RESEND_API_KEY) {
      const r = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({ from: env.EMAIL_FROM || "¿Y si te escribo? <onboarding@resend.dev>", to: [u.email], subject: `Tu código: ${code}`, html: emailHTML(u.name || "", code) }),
      });
      if (!r.ok) { console.error("Resend", r.status, await r.text()); throw Object.assign(new Error("No se pudo enviar el correo, intenta de nuevo"), { status: 502 }); }
      return {};
    }
    if (env.DEV_SHOW_CODE === "1") return { devCode: code };
    throw Object.assign(new Error("Falta configurar RESEND_API_KEY para enviar correos"), { status: 500 });
  }
  const session = async (u) => ({ token: sign({ id: u.id, email: u.email, exp: Date.now() + 30 * 864e5 }, SECRET), data: (await getJSON("data:" + u.id)) || {} });

  async function auth(req) {
    const h = req.headers.get("authorization") || "";
    return verify(h.replace(/^Bearer /, ""), SECRET);
  }

  async function callAI(mode, payload) {
    const build = MODES[mode];
    if (!build) throw Object.assign(new Error("Modo desconocido"), { status: 400 });
    if (!env.ANTHROPIC_API_KEY) throw Object.assign(new Error("Falta configurar ANTHROPIC_API_KEY en el servidor"), { status: 500 });
    const images = (payload.images || []).slice(0, 4);
    const p = { ...payload, hasImages: images.length > 0 };
    const spec = build(p);
    let messages;
    if (mode === "sim") {
      messages = (p.history || []).slice(-20).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 600) || "…" }));
      if (messages[0]?.role === "assistant") messages.unshift({ role: "user", content: "(él abre el chat)" });
      if (!messages.length || messages[messages.length - 1].role !== "user") throw Object.assign(new Error("Falta tu mensaje"), { status: 400 });
    } else {
      const content = images.map((im) => ({
        type: "image",
        source: { type: "base64", media_type: im.type || "image/jpeg", data: im.data },
      }));
      content.push({ type: "text", text: spec.text });
      messages = [{ role: "user", content }];
    }
    const r = await fetchImpl("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: spec.max, system: spec.system || BASE, messages }),
    });
    if (!r.ok) {
      const e = await r.text();
      console.error("Anthropic error", r.status, e);
      throw Object.assign(new Error("La IA no respondió, intenta otra vez"), { status: 502 });
    }
    const data = await r.json();
    return parseJSON(data.content.map((c) => c.text || "").join(""));
  }

  return async function handle(req) {
    const url = new URL(req.url);
    const route = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
    const method = req.method;
    try {
      if (route === "register" && method === "POST") {
        const { email, password, name } = await req.json();
        const em = String(email || "").trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return json({ error: "Correo no válido" }, 400);
        if (String(password || "").length < 6) return json({ error: "La contraseña debe tener al menos 6 caracteres" }, 400);
        if (!String(name || "").trim()) return json({ error: "Escribe tu nombre o apodo" }, 400);
        const k = userKey(em);
        const prev = await getJSON(k);
        if (prev && prev.verified) return json({ error: "Ese correo ya tiene cuenta. Inicia sesión." }, 409);
        const id = prev?.id || crypto.randomUUID();
        const { salt, hash } = hashPassword(password);
        const u = { id, email: em, name: String(name).trim().slice(0, 40), salt, hash, created: Date.now(), verified: !VERIFY };
        await setJSON(k, u);
        const data = { profile: { name: u.name, style: "relajado" }, xp: 0, crushes: [], favs: [], history: [], badges: [], streak: { last: "", count: 0 } };
        await setJSON("data:" + id, data);
        if (!VERIFY) return json(await session(u));
        const extra = await sendCode(u);
        return json({ pending: true, email: em, ...extra });
      }
      if (route === "verify" && method === "POST") {
        const { email, code } = await req.json();
        const u = await getJSON(userKey(String(email || "").trim().toLowerCase()));
        if (!u || !u.verify) return json({ error: "Pide un código nuevo" }, 400);
        if (u.verify.exp < Date.now()) return json({ error: "El código venció. Pide otro." }, 400);
        if (u.verify.tries >= 5) return json({ error: "Demasiados intentos. Pide otro código." }, 429);
        const ok = crypto.createHash("sha256").update(String(code || "").trim() + u.salt).digest("hex") === u.verify.hash;
        if (!ok) { u.verify.tries++; await setJSON(userKey(u.email), u); return json({ error: `Código incorrecto (${5 - u.verify.tries} intentos más)` }, 400); }
        u.verified = true; delete u.verify; await setJSON(userKey(u.email), u);
        return json(await session(u));
      }
      if (route === "resend" && method === "POST") {
        const { email } = await req.json();
        const u = await getJSON(userKey(String(email || "").trim().toLowerCase()));
        if (!u || u.verified) return json({ ok: true });
        if (u.verify && Date.now() - u.verify.sent < 45e3) return json({ error: "Espera unos segundos antes de pedir otro" }, 429);
        return json({ ok: true, ...(await sendCode(u)) });
      }
      if (route === "login" && method === "POST") {
        const { email, password } = await req.json();
        const em = String(email || "").trim().toLowerCase();
        const u = await getJSON(userKey(em));
        if (!u || !checkPassword(String(password || ""), u.salt, u.hash)) return json({ error: "Correo o contraseña incorrectos" }, 401);
        if (VERIFY && u.verified === false) { const extra = await sendCode(u).catch(() => ({})); return json({ pending: true, email: em, ...extra }); }
        return json(await session(u));
      }

      const me = await auth(req);
      if (!me) return json({ error: "Inicia sesión otra vez" }, 401);

      if (route === "data" && method === "GET") return json({ data: (await getJSON("data:" + me.id)) || {}, email: me.email });
      if (route === "data" && method === "PUT") {
        const raw = await req.text();
        if (raw.length > 900_000) return json({ error: "Demasiados datos guardados" }, 413);
        const { data } = JSON.parse(raw);
        await setJSON("data:" + me.id, data);
        return json({ ok: true });
      }
      if (route === "ai" && method === "POST") {
        const uk = `usage:${me.id}:${today()}`;
        const used = Number((await store.get(uk)) || 0);
        if (used >= DAILY) return json({ error: `Llegaste al límite de ${DAILY} usos de IA por hoy. Vuelve mañana 😉` }, 429);
        const { mode, payload } = await req.json();
        const result = await callAI(mode, payload || {});
        await store.set(uk, String(used + 1));
        return json({ result, left: DAILY - used - 1 });
      }
      return json({ error: "Ruta no encontrada" }, 404);
    } catch (e) {
      console.error(e);
      return json({ error: e.message || "Error del servidor" }, e.status || 500);
    }
  };
}
