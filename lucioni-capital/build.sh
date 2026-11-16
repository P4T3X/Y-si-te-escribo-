#!/bin/bash
# Construye Lucioni Capital: aplica los módulos v16–v29 sobre la base y genera
#   vercel/index.html  (sitio web)   y   dist/lucioni-capital.html  (versión artifact de Claude)
set -e
cd "$(dirname "$0")/src"
for p in v25 v26 v27 v28 v29 v30 v33 v34 v35 v36; do python3 ${p}_patch.py >/dev/null; done
python3 patch3.py >/dev/null
node --check appv3.js
cd ..
mkdir -p dist
cp src/lucioni-capital.html dist/lucioni-capital.html
{
  printf '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  printf '<meta name="description" content="Lucioni Capital, de Lucioni Enterprises: educación, análisis y planificación financiera con datos reales e IA con fuentes. Understand. Analyze. Grow.">'
  printf '<meta name="theme-color" content="#0B0F0D"><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icons/icon-192.png"><link rel="apple-touch-icon" href="/icons/icon-192.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
  printf '<script>window.LC_API="/api/ai";window.LC_MKT="/api/market";window.LC_LOGO="/api/logo";window.LC_AUTH="/api/account";window.LC_SEC="/api/sec"</script></head><body>'
  python3 - <<'PY'
v=__import__('hashlib').sha1(open('src/media-bundle.js','rb').read()).hexdigest()[:10]
h=open('src/part1v3b.html').read();core=open('src/core-bundle.js').read();app=open('src/appv3.js').read();ld=open('src/web_loader.js').read().replace('__V__',v)
open('dist/web-body.html','w').write(h+'\n<script>\n'+core+'\n</script>\n<script>\n'+app+'\n</script>\n<script>\n'+ld+'\n</script>\n')
PY
  cat dist/web-body.html
  printf '</body></html>'
} > vercel/index.html
cp src/media-bundle.js vercel/media.js
echo "built $(wc -c < vercel/index.html) bytes"
