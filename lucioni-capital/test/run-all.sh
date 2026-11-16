#!/bin/bash
# Corre todas las pruebas. Reinicia el servidor local antes de cada grupo: los límites anti-abuso
# (8 registros por IP cada 10 minutos) son reales y las pruebas registran muchas cuentas seguidas.
cd "$(dirname "$0")/.."
fresh(){ pkill -f mock-server.mjs >/dev/null 2>&1; sleep .5; nohup node test/mock-server.mjs > test/mock.log 2>&1 & sleep 2; }
run(){ fresh; out=$(timeout 400 node "$@" 2>&1); r=$(echo "$out" | grep -E "correctas|^\{" | tail -1); printf "%-34s %s\n" "$1" "${r:-ERROR: $(echo "$out" | grep -m1 -E 'Error|✗')}"; }
run test/api-flows.test.mjs
run test/finance-api.test.mjs
run test/ui-platform.test.cjs
run test/ui-pro.test.cjs
run test/ui-finance.test.cjs
run test/ui-phase3.test.cjs
run test/chat-sources.test.cjs dark
run test/video.test.cjs
fresh; printf "%-34s " "test/perf.test.cjs"; SEL='#hub' node test/perf.test.cjs
pkill -f mock-server.mjs >/dev/null 2>&1; fresh
