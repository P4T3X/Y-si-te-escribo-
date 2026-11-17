#!/bin/bash
# Sube vercel/ y crea un despliegue de producción en el proyecto lucioni-capital (equipo de Vercel conectado).
cd "$(dirname "$0")/vercel"; T=${VERCEL_TEAM:-team_Cd1TVlh1DOsDrIoIGhErDOBA}
FILES=$(find index.html media.js api lib icons manifest.webmanifest sw.js package.json vercel.json -type f | sort); J='['
for f in $FILES; do sha=$(sha1sum "$f"|cut -d' ' -f1); sz=$(stat -c%s "$f")
  curl -s -o /dev/null -X POST "https://api.vercel.com/v2/files?teamId=$T" -H "Authorization: Bearer x" -H "Content-Type: application/octet-stream" -H "x-vercel-digest: $sha" --data-binary @"$f"
  J="$J{\"file\":\"$f\",\"sha\":\"$sha\",\"size\":$sz},"; done; J="${J%,}]"
echo "{\"name\":\"lucioni-capital\",\"project\":\"lucioni-capital\",\"target\":\"production\",\"files\":$J,\"projectSettings\":{\"framework\":null}}" > ../dist/deploy.json
id=$(curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=$T&skipAutoDetectionConfirmation=1" -H "Authorization: Bearer x" -H "Content-Type: application/json" --data @../dist/deploy.json | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('id') or d)")
for i in $(seq 1 40); do s=$(curl -s "https://api.vercel.com/v13/deployments/$id?teamId=$T" -H "Authorization: Bearer x" | python3 -c "import sys,json;print(json.load(sys.stdin).get('readyState'))"); case "$s" in READY|ERROR|CANCELED) break;; esac; sleep 5; done
echo "$id $s"
