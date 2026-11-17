// Lucioni Capital — logo de una empresa por su símbolo.
// Se sirve desde nuestro dominio (con caché larga) para no depender de enlaces externos en el navegador.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const SOURCES = s => [
  `https://financialmodelingprep.com/image-stock/${s}.png`,
  `https://assets.parqet.com/logos/symbol/${s}?format=png&size=128`,
];

export default async function handler(req, res) {
  const s = (new URL(req.url, 'http://x').searchParams.get('s') || '').toUpperCase().replace('.', '-');
  if (!/^[A-Z\-]{1,10}$/.test(s)) { res.statusCode = 400; return res.end(); }
  for (const url of SOURCES(s)) {
    const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 6000);
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'image/*' }, signal: ctrl.signal });
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !type.startsWith('image/')) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 300) continue; // imágenes vacías o de relleno
      res.statusCode = 200;
      res.setHeader('content-type', type);
      res.setHeader('cache-control', 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800');
      return res.end(buf);
    } catch { /* probar la siguiente fuente */ } finally { clearTimeout(to); }
  }
  res.statusCode = 404;
  res.setHeader('cache-control', 'public, max-age=3600, s-maxage=86400');
  res.end();
}
