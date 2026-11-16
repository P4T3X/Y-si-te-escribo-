// Llamada compartida a Gemini en modo JSON (Intelligence Network y Document Vault). La clave vive solo en el servidor.
export async function geminiJSON({ parts, sys, maxTokens = 3000, temperature = 0.3, timeout = 28000 }) {
  const key = process.env.GEMINI_API_KEY; if (!key) return { error: 'no_key' };
  const models = [...new Set([process.env.GEMINI_MODEL, 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-flash-latest'].filter(Boolean))];
  let last = '';
  for (const model of models) {
    const c = new AbortController(), t = setTimeout(() => c.abort(), timeout);
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: 'POST', signal: c.signal, headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ contents: [{ role: 'user', parts }], systemInstruction: { parts: [{ text: sys }] }, generationConfig: { temperature, maxOutputTokens: maxTokens, responseMimeType: 'application/json' } }) });
      if (r.status === 404 || r.status === 400) { last = model + ':' + r.status; continue; }
      if (r.status === 429) return { error: 'rate_limited' };
      if (!r.ok) { last = model + ':' + r.status; continue; }
      const j = await r.json(), text = (j.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join('');
      const um = j.usageMetadata || {};
      return { text, model, tin: um.promptTokenCount || 0, tout: um.candidatesTokenCount || 0 };
    } catch (e) { last = model + ':' + (e.name === 'AbortError' ? 'timeout' : 'network'); }
    finally { clearTimeout(t); }
  }
  return { error: 'upstream', detail: last };
}
export const parseJSON = t => JSON.parse(String(t || '').replace(/^\s*```(json)?|```\s*$/g, '').trim());
/* registro de uso de IA del usuario (compartido por todos los módulos) */
export async function logAI(readJSON, writeJSON, uid, e) { try { const p = `users/${uid}/intel/log.json`, L = (await readJSON(p)) || []; L.push({ t: Date.now(), ...e }); await writeJSON(p, L.slice(-200)); } catch {} }
