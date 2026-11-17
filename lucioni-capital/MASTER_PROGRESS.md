# MASTER_PROGRESS — Lucioni Capital

Registro real de lo terminado y lo pendiente. "Hecho" significa implementado **y** probado; lo que no se pudo probar se dice.

Producción: https://lucioni-capital.vercel.app · Último despliegue: `dpl_68C4SmgC6bbtELKr6GUSGi3XjPvN`

## Estado final de la plataforma (Fase 10 · 17 nov 2026)

Resumen consolidado de las 10 fases del master prompt "Complete Financial Platform". El detalle de cada entrega está más abajo (Entregas 1 a 12).

### 1. Auditoría inicial
Ver `AUDITORIA.md` e `INVENTARIO_Y_PLAN.md`. Cada fase empezó con una auditoría de lo existente para ampliarlo en vez de duplicarlo; el resultado está al inicio de cada entrega.

### 2. Arquitectura actual
- **Cliente**: aplicación de una sola página. `build.sh` aplica los módulos `src/v16.js` … `src/v42.js` (y sus `.css`) sobre la base y genera `vercel/index.html` (web) y `dist/lucioni-capital.html` (artifact). Desde v36 cada módulo vive en su propia función para no pisar funciones globales.
- **Servidor**: 12 funciones de Vercel (límite del plan): `account`, `ai`, `academy`, `billing`, `event`, `finance`, `intel`, `logo`, `macro`, `market`, `sec`, `vault`, con librerías compartidas en `vercel/lib/` (`core.js` sesiones, límites y planes; `gemini.js` IA; `tax-rules.js` reglas fiscales).
- **Datos**: Vercel Blob privado. El identificador de usuario sale siempre de la sesión firmada (HMAC), nunca del cuerpo de la petición.

### 3. Arquitectura objetivo (para escalar)
- Base de datos relacional (por ejemplo Postgres) para movimientos y documentos cuando crezca el volumen; hoy Blob + JSON por usuario es suficiente para la beta.
- Separar el cliente en módulos cargados bajo demanda (hoy el HTML pesa ~1,3 MB con todo incluido).
- Proveedor de datos de mercado con licencia de redistribución, y Mercado Pago activo para cobrar Premium en soles.

### 4. Módulos existentes (antes del master prompt) y 5. módulos nuevos
| Existían y se ampliaron | Nuevos |
|---|---|
| Copilot y Deep Research → Intelligence Network | Mis finanzas (Personal Finance, Banking, Credit) |
| Metas → Life Planner | Patrimonio neto, Estate y Retirement |
| Backtest → motor único de Strategy Lab | Economía global |
| Mesa del inversor (impuestos y lotes) y Costo real desde Perú → Tax & Compliance | Intelligence Network (informe de 10 secciones) |
| Simulador → boleta de bróker avanzada | Strategy Lab |
| Terminal, Watchtower, i18n de Daily, Premium y prueba de 7 días | Gráfico profesional, Document Vault, Tax & Compliance, Life Planner, panel de beta |

### 6. Funciones completadas (lógica + validación + persistencia + permisos + errores + pruebas)
Mis finanzas, Credit, Patrimonio, Estate, Retirement, Economía global, Intelligence Network, Strategy Lab, Document Vault, Tax & Compliance, Life Planner, Premium con límites en el servidor, internacionalización base, herramientas de bróker, panel de beta. Cada una tiene su archivo de pruebas (ver punto 11).

### 7. Funciones pendientes
- Pagos de Premium (Mercado Pago, en soles) y correos (Resend): preparados, inactivos sin claves.
- Datos mensuales de EE.UU. y calendario completo: requieren `FRED_API_KEY`.
- Traducción completa al inglés de textos dinámicos, herramientas antiguas, Academy y respuestas de la IA; portugués completo.
- Recordatorios por correo (hoy dentro de la app).
- Conexión automática con bancos: no disponible (se registra a mano o se importa el archivo del banco).

### 8. Integraciones reales
Nasdaq (precios, velas, fundamentales; públicos y con posible retraso) · SEC EDGAR · FMI (World Economic Outlook) · BIS (tasas de bancos centrales) · Tesoro de EE.UU. (curva) · OCDE (confianza y ciclo) · Reserva Federal (calendario FOMC) · BCE y BCRP (tipos de cambio) · Gemini (IA, clave en el servidor) · Vercel Blob (almacenamiento).

### 9. Integraciones simuladas o pendientes (identificadas)
Mercado Pago (preparado y probado con su API simulada; inactivo hasta configurar claves) · Stripe (alternativa para otros países; Stripe no acepta empresas del Perú) · Resend/SMTP (inactivo) · FRED (opcional, inactivo) · Banco Mundial (bloquea los servidores de Vercel; reemplazado por el FMI) · BLS (bloquea servidores) · conexión bancaria (no existe). En las pruebas, las fuentes externas se sustituyen por un servidor local con sus formatos reales; nunca en producción.

### 10. Problemas conocidos
- La IA a veces devuelve cifras que no están en los datos: se marcan como "cifra no verificada" en vez de ocultarlas.
- Los datos de mercado públicos pueden tener retraso y cambiar de formato sin aviso.
- El backtest usa solo precio (sin dividendos) y tiene sesgo de supervivencia, documentado en cada resultado.
- El HTML inicial es grande; en un celular simulado con CPU lenta, la portada está lista en ~5 s.

### 11. Pruebas realizadas
`bash test/run-all.sh` ejecuta 21 grupos, **todos en verde** al cierre de esta fase: flujos de API (41), finanzas en el servidor (22), plataforma (27), Pro (41), Mis finanzas (40), Fase 3 (34), bróker (33), Economía global (46), Intelligence servidor (32) e interfaz (19), Strategy Lab (27), Vault servidor (31) e interfaz (29), Life Planner (25), Premium e idiomas (23), **cálculos financieros (21)**, **seguridad (24)**, **QA de interfaz (16)**, fuentes del chat, video y rendimiento. Cubren pruebas unitarias de los motores, integración, permisos, cálculos financieros, errores, responsive (todas las vistas en 360, 768 y 1280 px), rendimiento, seguridad y accesibilidad básica.

### 12. Cambios en la base de datos (rutas en Vercel Blob)
`users/<uid>/profile.json` · `state.json` (estado sincronizado: cartera, metas con prioridad y dependencias, deudas, jubilación, estrategias `slab`, impuestos `tax`, Life Planner `lp`…) · `fin/meta.json`, `fin/tx-<año>.json`, `fin/estate.json`, `fin/wealth.json` · `intel/consent.json`, `intel/log.json`, `intel/reports.json` · `docs/index.json`, `docs/<id>/v<n>.<ext>` · `audit.json` · `usage/<uid>/<día>.json` · `analytics/<día>.json` · `feedback/<día>.json` · `errors/<día>.json`. Todo lo del usuario se incluye en la exportación y se borra al eliminar la cuenta.

### 13. Decisiones técnicas
- Reutilizar antes que crear: un solo asistente, un solo motor de metas, un solo motor de backtest y un solo Gemini compartido.
- Todo lo sensible en el servidor: permisos por módulo, límites de plan, lectura de datos para la IA, validación de archivos por contenido.
- Sin datos inventados: si una fuente falla se dice; las reglas fiscales que cambian se marcan "por verificar".
- Límites de plan sin borrar datos al bajar de Premium a Free.
- Cada módulo nuevo aislado en su propia función (lección aprendida en la Fase 6).

### 14. Próximos pasos y qué falta para producción
1. Configurar en Vercel: `RESEND_API_KEY` (correos), Mercado Pago (`MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `PREMIUM_PRICE_PEN` y la URL de notificaciones `https://lucioni-capital.vercel.app/api/billing?mp=1` con el evento de suscripciones), `FRED_API_KEY`, `ADMIN_EMAILS` (para ver el panel de la beta) y rotar `GEMINI_API_KEY`.
2. Revisión legal: política de privacidad, términos, y revisión regulatoria por país; revisión de las reglas fiscales por un contador.
3. Datos de mercado con licencia antes de un lanzamiento comercial.
4. Beta cerrada: invitar usuarios, leer comentarios y errores en el panel de administración y corregir.
5. Completar traducciones y medir rendimiento en dispositivos reales.

## Entrega 12 — Complete Financial Platform, Fase 10: QA, optimización y beta (17 nov 2026)

### Hecho
- **Pruebas de cálculos financieros** (`test/calc.test.cjs`, 21): divisas (conversión, ida y vuelta, triangulación, sin tasa = sin conversión inventada), flujo de caja, intereses y amortización (cuota de libro a TEA 12%), rentabilidad inmobiliaria (bruta, neta, NOI, LTV, cash-on-cash), patrimonio neto en varias monedas, jubilación (tasa real, trayectoria), inflación y simulaciones (Monte Carlo sin volatilidad y backtest con aportes).
- **Pruebas de seguridad** (`test/security.test.mjs`, 24): sesión obligatoria en todo lo privado, tokens alterados, separación entre usuarios (finanzas, metas, documentos, Intelligence), HTML en nombres, rutas manipuladas, tamaños, JSON roto, métodos, fuerza bruta, administración, comentarios y errores sin datos personales, cabeceras y ausencia de claves en el código.
- **QA de interfaz** (`test/qa-ui.test.cjs`, 16): las 24 vistas en 360, 768 y 1280 px sin desborde ni errores, accesibilidad básica, ids únicos y herramientas de la beta.
- **Beta**: insignia Beta y formulario de comentarios (tema, calificación, limitaciones conocidas; sin datos personales), reporte de errores agrupados solo con estadísticas aceptadas, y **panel de administración** (estado de integraciones sin valores secretos, uso y retención, comentarios y errores). El servidor decide quién es administrador (`ADMIN_EMAILS`).
- **Optimización**: Economía global ya no consulta FMI, BIS y OCDE al abrir la app, solo al entrar a la vista.

### Problemas encontrados y corregidos
- **Id duplicado `dList`**: Deudas y el Diario de inversión usaban el mismo id; la lista de deudas podía dibujarse en el lugar equivocado. Renombrado a `dbtList`.
- **Terminal desbordaba 46 px en celulares de 360 px**: etiquetas del mapa de calor y una tabla. Corregido.
- **Consulta de administrador generaba un error en consola** para usuarios normales (403): ahora existe una consulta que responde sí/no.

### Desplegado
`dpl_A3HYG69Uf4xCQ7TyrrZwSKP5BX7e`. Verificado en producción: `/api/event?me=1` responde `{admin:false}` sin sesión de administrador.

## Cómo trabajar

```bash
cd lucioni-capital
./build.sh                       # genera vercel/index.html (web) y dist/lucioni-capital.html (artifact)
node test/mock-server.mjs &      # servidor local en :4320 con las funciones reales y almacenamiento en memoria
node test/api-flows.test.mjs     # 40 pruebas de servidor
node test/ui-platform.test.cjs   # 27 pruebas de interfaz (escritorio + iPhone 13)
node test/chat-sources.test.cjs dark
node test/video.test.cjs
node test/perf.test.cjs          # móvil con CPU 4x más lenta
./deploy.sh                      # despliegue de producción (necesita la conexión de Vercel)
```

Para regenerar los paquetes JS (`src/core-bundle.js`, `src/media-bundle.js`, `src/bundle.js`): `cd src && npm install && npx esbuild entry-core.js --bundle --minify --format=iife --outfile=core-bundle.js` (y lo mismo con `entry-media.jsx` y `--jsx=automatic`).

## Entrega 1 — Fases 0 a 3 y parte de 4 a 9 (16 nov 2026)

### Fase 0 · Auditoría — hecha
`AUDITORIA.md`: tecnología real, estado de las 20 funciones, problemas P0–P3, riesgos y arquitectura propuesta.

### Fase 1 · Estabilización — hecha
- Código fuente rescatado del contenedor temporal al repositorio, con build y despliegue reproducibles.
- Cabeceras de seguridad: CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy (verificadas en producción).
- Eliminar la cuenta borra todos los archivos del usuario (probado).
- La IA ignora instrucciones que vengan dentro de fuentes externas (regla en el servidor).

### Fase 2 · Arquitectura — hecha
- `vercel/lib/core.js`: sesiones, almacenamiento, **planes y permisos en un solo lugar** (`PLANS`, configurable con la variable `PLAN_LIMITS` sin tocar código), auditoría por usuario.
- Perfil global: idioma (es/en), moneda (USD/EUR/PEN/GBP), país, zona horaria, nivel, preferencias de notificaciones y analítica.

### Fase 3 · Experiencia — hecha
- **Lucioni Daily** en Inicio: resumen de mercados (8 ETFs que siguen índices, con minigráficos; en modo avanzado, rendimiento y volatilidad de 1 año), mi patrimonio en la moneda elegida, Daily Intelligence con fuentes, 3 noticias con fuente, fecha y enlace, lección del día, reto del día, progreso semanal y recomendaciones basadas en los datos del usuario. Sin datos ficticios: sin datos muestra estados vacíos.
- Modo Principiante / Avanzado.
- Tema oscuro por defecto con acento esmeralda (#3CCB94 en oscuro, #0E7A54 en claro; contraste 8,4:1 y 5,3:1).
- Móvil: barra inferior (Inicio, Patrimonio, Intelligence, Mercados, Más) y menú "Más" con todas las secciones y el perfil.

### Fase 4 · Intelligence — parcial
- Hecho: cuota diaria por plan en el servidor (Free 15, Premium 150, sin cuenta 5), registro de tokens por usuario y día, modo "deep" reservado a Premium, Daily Intelligence y Asesor con fuentes numeradas.
- Pendiente: modos separados de Portfolio Analyst y Stock Research dentro del chat (hoy el Asesor detecta acciones y arma tarjetas con datos reales, pero no hay selector de modo); historial de conversaciones en el servidor.

### Fase 5 · Patrimonio y simulación — parcial
- Hecho: el servidor ya limita el número de carteras por plan.
- Pendiente: interfaz de varias carteras, comparación con índices dentro de la cartera real, alertas personalizadas.

### Fase 6 · Academy y retención — hecha
- Lucioni Academy: Starter (7 lecciones) y Advanced (8 lecciones, entregadas por el servidor solo a Premium o en prueba), cada una con evaluación y explicación.
- XP por aprender y analizar; **los retos que premiaban comprar u operar más se reemplazaron** por lección, reto, análisis de empresa y consulta a la IA con fuentes. El logro "10 operaciones" se cambió por "3 notas en el diario".
- Racha diaria por actividades de valor, meta semanal de XP.
- Recordatorio del reto dentro de la app, desactivable en Perfil.

### Fase 7 · Monetización — hecha en la parte técnica; pagos sin activar
- Free / Premium con permisos verificados en el servidor (probado: un token manipulado o un botón visible no dan acceso).
- Prueba Premium de 7 días: sin tarjeta, una por persona (también con alias +etiqueta y puntos de Gmail), cancelable, vuelve sola a Free al vencer sin borrar datos. Registra inicio, fin, estado, uso y cancelación.
- Stripe: Checkout, portal de cliente, webhooks con verificación de firma e idempotencia. Se probó con eventos firmados localmente; **no se probó contra Stripe real** porque no hay cuenta configurada.

### Fase 8 · Internacionalización — parcial
- Hecho: idioma es/en para la navegación nueva y todo Lucioni Daily; moneda de presentación con tipos de referencia reales (BCE para EUR/GBP, BCRP para PEN); los activos siguen en su moneda original; formatos regionales con `Intl`.
- Pendiente: traducir al inglés el resto de pantallas antiguas, las lecciones de Academy, portugués y precios regionales.

### Fase 9 · Pruebas — hecha para esta entrega
- 40/40 pruebas de servidor: registro, inicio de sesión, permisos Premium, cuota de IA, prueba, cancelación, vencimiento, abuso de prueba, webhooks, analítica, exportación y eliminación.
- 27/27 pruebas de interfaz en escritorio y iPhone 13: Daily, reto, lección, Intelligence con citas, Premium, desbloqueo, moneda e idioma, barra inferior, botones de 44 px, sin desbordes horizontales en 10 secciones, sin errores de consola.
- Rendimiento (Pixel 5, CPU 4x más lenta): página de 1,37 MB → 0,87 MB; arranque 6,4 s → 5,3 s; desplazamiento a 60 fps.
- Producción verificada: Academy, tipos de cambio reales, pagos inactivos, manifest y cabeceras.
- No verificado: abrir la web publicada en un navegador real desde aquí (este entorno no abre vercel.app en un navegador); las pruebas de interfaz corren contra el servidor local.

### Fase 10 · Lanzamiento — pendiente
Necesita decisiones y cuentas del dueño (lista abajo).

## Entrega 2 — Professional Expansion, Fase A (16 nov 2026)

Despliegue: `dpl_DJ1SpsbtY8F8sHVr36vL2rMaJyPC`. Pruebas: 41/41 servidor, 41/41 Fase A (`test/ui-pro.test.cjs`), 27/27 plataforma, chat con fuentes, video y rendimiento sin regresiones.

### Auditoría previa: qué ya existía y cómo se integró (sin duplicar)
| Pedido | Ya existía | Decisión |
|---|---|---|
| AI Copilot | Asesor con fuentes (v28) | Se amplió: mismo chat, ahora con acciones y permiso de datos |
| Watchtower | Alertas de precio en Mesa del inversor (TRD.alerts) | Se reutilizan los mismos datos; Watchtower añade 8 tipos nuevos y la Mesa los muestra |
| Screener | Mesa → Screener | Se enlaza desde Lucioni Pro (Fase B: ampliar filtros) |
| Insider | Ficha (directivos, institucionales) y Mesa (13F, Congreso) | Se enlaza; Fase C: Form 4 de la SEC con fechas de operación |
| Risk Lab | Riesgo de la cartera real (v18) y pruebas de estrés del simulador | El cálculo nuevo del Copilot (beta, Sharpe, aporte al riesgo) es la base de Risk Lab (Fase B) |
| Valuation Studio | DCF en la ficha (v18) | Se enlaza; Fase B: DDM, comparables y sensibilidad |
| Journal Pro | Diario de inversión | Fase D |
| Arena | Lucio Bot y retos | Fase D |

### Hecho
- **Lucioni Pro**: página con las herramientas agrupadas en Markets, Research, Analysis, Intelligence, Practice y Reports; solo enlaza funciones que existen. También en el menú del logo y en Inicio.
- **Lucioni Terminal**: 13 índices del mundo (S&P 500, Nasdaq 100, Dow, Russell 2000, Reino Unido, Alemania, Francia, Japón, Hong Kong, emergentes, Brasil, México, Perú) seguidos con ETFs y rotulados como tales; comparación base 100 a 1 año; mapa de calor de las 80 mayores empresas por sector; sectores ponderados por capitalización; líderes (suben, bajan, más negociadas por volumen en dólares, más grandes); calendario de resultados; materias primas; 8 divisas del BCE con historial de 90 días y el sol del BCRP. Fuente, hora y posible retraso visibles. Se actualiza cada 90 s mientras está abierto.
- **Deep Research**: informe de cualquier empresa con datos de Nasdaq, SEC (XBRL, 8-K/10-Q/10-K), noticias y 5 años de precios. Ingresos, márgenes, beneficios trimestrales, deuda, flujo de caja, valoración (P/E y P/S de 12 meses, P/B, EV, EV/EBIT, rendimiento del flujo libre), rendimiento y riesgo a 5 años, directivos e institucionales. Con Premium, la IA redacta los 10 apartados cualitativos y el **Lucioni Verdict** (favorable, desfavorable, incertidumbres), citando las fuentes y marcando lo que es "conocimiento general"; sin recomendación de compra o venta. **Exportar PDF** con portada, tablas, fuentes, metodología y advertencias (impresión del navegador → "Guardar como PDF").
- **AI Copilot**: 5 acciones (analizar mi cartera, comparar empresas, por qué se movió el mercado, simular una inversión, exposición sectorial). Pide permiso antes de leer la cartera. El análisis calcula volatilidad, caída máxima, beta frente al S&P 500, Sharpe (con BIL como tasa libre de riesgo real), posiciones equivalentes, aporte de cada activo al riesgo y el par más correlacionado. La simulación usa Monte Carlo calibrado con 5 años reales del S&P 500. Desde cada empresa se puede abrir Deep Research.
- **Watchtower**: alertas de precio, movimiento diario, máximos y mínimos de 52 semanas, resultados próximos, noticias nuevas, aumento de volatilidad, variación de la cartera, concentración sectorial (con los activos que explican el cambio) y dólar/sol. Cada alerta avisa como máximo una vez al día, con un tope diario configurable (3/5/10), historial y "Explicar con IA". Notificaciones del navegador opcionales. El límite de alertas por plan (Free 5, Premium 50) lo aplica el servidor.
- Servidor: tipos de cambio de todas las divisas del BCE y su historial de 90 días; límite anti-abuso de pruebas más justo para redes compartidas (10 por hora por IP).

### Pendiente (Fases B, C y D)
- **Fase B**: Risk Lab como página propia (pruebas de estrés configurables, comparación de carteras), Valuation Studio (DDM, comparables, sensibilidad), Screener ampliado (ROE, ROIC, márgenes, filtros guardados), Lucioni Macro.
- **Fase C**: Fund Manager con Portfolio Score explicado, Lucioni Dividend, Insider con SEC Form 4, Lucioni Reports (cartera, riesgo, macro, progreso).
- **Fase D**: Arena con ligas y ranking ajustado al riesgo, Journal Pro, Global Watch con varias listas.
- **Calendario económico y Macro**: necesitan una fuente con licencia y clave, por ejemplo FRED (gratuita, requiere `FRED_API_KEY`), Trading Economics o el Banco Mundial.
- Alertas cuando la app está cerrada: necesitan correo configurado o notificaciones push con un servicio en segundo plano.

## Entrega 3 — Complete Financial Platform, Fases 1 y 2 (16 nov 2026)

Despliegue: `dpl_Ev9tHnTLzrUAn7ipF2F7K8tQPKW2`.

**Fase 1:** inventario por categorías y plan de integración en `INVENTARIO_Y_PLAN.md`. No hubo cambios destructivos.

### Fase 2 · Personal Finance, Banking y Credit — hecha
1. **Qué se implementó**
   - **Mis finanzas**:
     - Primera configuración y moneda principal.
     - Ingresos y gastos con categorías propias y categorización automática que aprende de tus cambios.
     - Presupuestos mensuales por categoría, con aviso al excederse.
     - Flujo de caja de 12 meses y comparación mensual y anual.
     - Pagos recurrentes y suscripciones, con detección automática en los movimientos y los próximos 30 días.
     - Fondo de emergencia.
     - **Financial Health Score**: 4 componentes con pesos y método visibles; sin datos suficientes no se calcula.
   - **Banking**:
     - Cuentas bancarias, de ahorro, de efectivo, tarjetas y otras.
     - Saldos e historial mensual.
     - Importación CSV con mapeo de columnas, coma decimal, fechas DD/MM o MM/DD y vista previa.
     - Detección de duplicados al importar y de posibles duplicados ya registrados.
     - Movimientos inusuales (mediana y desviación absoluta).
     - Conversión de monedas mostrando la tasa usada; el importe original no cambia.
   - **Credit** (amplía Deudas):
     - Tipo de deuda y día de pago.
     - Meses, intereses y costo total por deuda.
     - Calendario de obligaciones.
     - Simulador de pago anticipado.
     - Evolución de la deuda pendiente con avalancha y bola de nieve.
     - Aviso cuando siguen siendo los datos de ejemplo.
   - **Intelligence**: "Analiza mi situación financiera completa…".
     - Pide un permiso específico.
     - Lee finanzas, deudas, cartera y metas.
     - Responde en los 10 apartados pedidos, con los datos usados y los que faltan.
   - **Integración**:
     - Tarjeta "Mis finanzas" en Lucioni Daily.
     - Categoría My Finances en Lucioni Pro.
     - "Finanzas" en la barra móvil.
     - Entrada en el menú del logo.
2. **Reutilizado**:
   - Sesiones, planes, auditoría y límites (`lib/core.js`).
   - Tipos de cambio BCE/BCRP.
   - El motor `dSim` de Deudas, sin un segundo motor.
   - El Copilot y sus permisos.
   - El diseño y los gráficos compartidos (`L30`).
3. **Ampliado**:
   - Deudas → Lucioni Credit.
   - Copilot: permisos por módulo.
   - Exportación de datos: incluye las finanzas.
   - Planes: límites de cuentas y movimientos.
4. **Archivos**:
   - Nuevos: `vercel/api/finance.js`, `src/v33.js`, `src/v33.css`, `src/v33_patch.py`, `INVENTARIO_Y_PLAN.md`, `test/finance-api.test.mjs`, `test/ui-finance.test.cjs`.
   - Modificados: `vercel/lib/core.js`, `vercel/api/account.js`, `vercel/vercel.json`, `src/v29.js` (barra móvil), `src/v32.js` (permisos por módulo), `build.sh`, `test/mock-server.mjs`, `test/ui-pro.test.cjs`.
5. **Datos**: `users/<uid>/fin/meta.json` y `users/<uid>/fin/tx-<año>.json`, versionados con `v: 1`.
6. **Proveedores**: ninguno nuevo. Open Banking queda pendiente y documentado.
7. **Pruebas**:
   - Finanzas en el servidor: 22 de 22.
   - Cálculos, interfaz, importación, Credit, IA y móvil: 39 de 39.
   - Regresión: servidor 41, plataforma 27, Pro 41, chat con fuentes, video y rendimiento, todo sin fallos.
   - Comprobado en producción: la función de finanzas está desplegada (responde 405 a GET, como debe).
8. **Pendiente y problemas conocidos**:
   - Open Banking.
   - Cargar varios años antiguos de una vez: hoy se cargan el año actual y los dos anteriores.
   - Detección de suscripciones con montos que cambian.
   - Las pruebas que registran muchas cuentas seguidas chocan con el límite de 8 registros cada 10 minutos por IP. Es correcto en producción; en pruebas, basta reiniciar el servidor local.
9. **Para producción**: nada adicional. Funciona con la configuración actual de Vercel (Blob y `AUTH_SECRET`).

**Próxima fase (3)**: Wealth (patrimonio neto con cuentas, inversiones, deudas e inmuebles), Estate (reutilizando el motor de Credit para hipotecas) y Retirement (reutilizando el Monte Carlo de Metas).

## Entrega 4 — Complete Financial Platform, Fase 3: Wealth, Estate y Retirement (16 nov 2026)

Despliegue: `dpl_5beYP67XjFJPKjDXhr8FBzzVVeCm`. Pruebas: `bash test/run-all.sh` corre todo, reiniciando el servidor local entre grupos.

1. **Qué se implementó**
   - **Patrimonio neto (Wealth)**, en Mis finanzas → Patrimonio neto:
     - Activos: cuentas y efectivo, inversiones, inmuebles y otros.
     - Deudas: tarjetas, préstamos de Credit e hipotecas.
     - Liquidez y relación entre deuda y activos.
     - Detalle por partida con su importe original y la tasa usada.
     - Una foto diaria guardada en el servidor que forma el historial (empieza el primer día que se abre).
     - Si falta un tipo de cambio, la partida no se suma, se avisa y no se guarda la foto.
   - **Inmuebles (Estate)**:
     - Tipo, uso, país y ciudad.
     - Precio de compra con su fecha y gastos de compra.
     - Valoraciones propias o tasaciones, con su historial y gráfico.
     - Alquiler y ocupación; mantenimiento, cuota de edificio, predial y seguro.
     - Hipoteca: préstamo inicial, saldo, TEA y cuota, amortizada con el motor de Credit.
     - Rentabilidad bruta y neta, flujo mensual, cash-on-cash, patrimonio en el inmueble, revalorización anual y comparación entre inmuebles, con la metodología visible.
     - Se distinguen siempre el precio de compra, el valor declarado y la tasación. No hay estimador automático de precios: no existe un proveedor con licencia para todos los países.
     - Una hipoteca marcada "ya está en Deudas" no se resta dos veces.
   - **Jubilación (Retirement)**:
     - Edades actual, de retiro y final; ahorro, aporte, ingreso deseado y pensión.
     - Perfil o rendimiento y volatilidad propios, e inflación.
     - Todo en dinero de hoy.
     - Probabilidad de que el dinero alcance, ingreso sostenible con 85% de probabilidad, capital al jubilarse (mediana y rango) y escenarios pesimista, base y optimista.
     - Abanico por edad y comparación de 5 edades de retiro.
     - Supuestos y límites visibles.
     - Funciona sin cuenta y se sincroniza con ella.
   - **Integración**:
     - Patrimonio neto en Lucioni Daily.
     - Wealth, Estate y Retirement en Lucioni Pro.
     - El análisis completo del Copilot incluye patrimonio, inmuebles y jubilación.
2. **Reutilizado**:
   - El motor Monte Carlo de Metas (`gSim`). Se **amplió** con una fase de retiro opcional en lugar de crear otro motor; una prueba confirma que Metas sigue dando los mismos resultados.
   - La amortización de Credit para las hipotecas.
   - Cuentas y tipos de cambio de Banking, y la cartera (`pfCalc`).
   - Permisos, límites y almacenamiento de `finance.js`.
3. **Ampliado**:
   - `gSim`: fase de retiro, probabilidad de agotarse y mes de agotamiento.
   - `lines30`: formato del eje horizontal.
   - Mis finanzas: pestañas de patrimonio, separadas de las del día a día.
   - Copilot: permiso y datos de los nuevos módulos.
4. **Archivos**:
   - Nuevos: `src/v34.js`, `src/v34.css`, `src/v34_patch.py`, `test/ui-phase3.test.cjs`, `test/run-all.sh`.
   - Modificados: `vercel/api/finance.js`, `vercel/lib/core.js` (límite de inmuebles: Free 2, Premium 50), `src/v19.js`, `src/v30.js`, `src/v33.js`, `build.sh`, `test/ui-finance.test.cjs`.
5. **Datos**: `users/<uid>/fin/estate.json` y `users/<uid>/fin/wealth.json` (`v: 1`); el plan de jubilación se guarda en el estado sincronizado (`ret`). La exportación y el borrado de la cuenta ya los cubren (todo `users/<uid>/`).
6. **Proveedores**: ninguno nuevo. La valuación automática de inmuebles queda pendiente: requiere un proveedor por país.
7. **Pruebas** (suite completa sin fallos):
   - Fase 3: 34 de 34. Incluye la rentabilidad de un caso calculado a mano (bruta 7,20%, neta 6,08%, cash-on-cash 3,56%), el patrimonio neto (255.125 − 108.500 = 146.625), la tasa real, que el Monte Carlo sin volatilidad coincida con el cálculo exacto, la compatibilidad de Metas, validación y aislamiento en el servidor, interfaz y móvil.
   - Regresión: servidor 41, finanzas 22, plataforma 27, Pro 41, finanzas e interfaz 39, chat, video y rendimiento.
8. **Pendiente y conocido**:
   - En un móvil de gama media simulado (CPU 4 veces más lenta), el cálculo de jubilación tiene una tarea de hasta unos 750 ms. Las edades de retiro se calculan de a una para no congelar la página.
   - El historial de patrimonio comienza el primer día de uso; no se reconstruye hacia atrás.
9. **Para producción**: nada adicional.

**Próxima fase (4)**: Global Economy. Necesita una fuente de indicadores con licencia: el Banco Mundial no pide clave; FRED necesita `FRED_API_KEY` gratuita.

## Entrega 5 — Herramientas de bróker y efectos de precio (16 nov 2026)

Pedido: "añade más cosas profesionales de Brokers, efectos suaves y profesionales". Se amplió lo existente (simulador, ficha, Terminal, Watchtower); no se creó un segundo simulador ni otro sistema de alertas.

### Hecho
- **Gráfico profesional** (vista `chart`, desde la ficha de cada acción y Lucioni Pro → Markets): velas OHLC reales de Nasdaq (`/api/market?ohlc=SYM&range=3m|6m|1y|2y|5y`; semanales a partir de 2 años), línea opcional, volumen, SMA 20/50/200, EMA 20, Bollinger 20·2, RSI 14 (Wilder), MACD 12·26·9 y ATR 14. Retícula con lectura de apertura, máximo, mínimo, cierre y volumen; estadísticas del período; fuente y temporalidad visibles. Si no hay historial, lo dice y no dibuja nada inventado.
- **Niveles de precio → alertas**: se marca un nivel con un clic y se convierte en alerta de Watchtower (por encima o por debajo), respetando el límite de alertas del plan.
- **Boleta avanzada del simulador** (dinero ficticio): mercado, límite, stop, **stop-límite**, **trailing stop** (en %), **bracket con OCO** (objetivo y stop enlazados), vigencia **GTC o solo hoy**, **comisiones** configurables (sin comisión, US$1 fija, 0,10 % o 0,25 %) descontadas del efectivo, y vista previa con costo, comisión, efectivo restante y riesgo:beneficio. El botón se bloquea y explica el motivo si falta efectivo o acciones.
- **Efectos**: destello verde o rojo cuando cambia un precio (Terminal y boleta), transición suave de cifras, velas que aparecen escalonadas y línea que se dibuja. Todo se desactiva con "reducir movimiento".

### Pruebas
`test/ui-broker.test.cjs` (33 correctas): indicadores contra valores conocidos, gráfico, niveles → alerta, stop-límite (se arma por encima del límite y se ejecuta al volver), trailing (sube y no baja; vende al cruzar), bracket con OCO, vencimiento del día, comisión, validación de efectivo, móvil sin desborde y sin errores de consola. La batería completa (`bash test/run-all.sh`) pasa.

### Desplegado
`dpl_8bdbGSKwsXtiFZp8XBFm7FVPNN6n`. Verificado en producción: `?ohlc=AAPL&range=1y` devuelve 252 velas diarias reales de Nasdaq.

## Entrega 6 — Complete Financial Platform, Fase 4: Global Economy (16 nov 2026)

Auditoría previa: no existía un módulo macroeconómico. El Terminal ya tenía índices, divisas (BCE y BCRP) y materias primas; Economía global se agrega como módulo nuevo, enlazado desde el Terminal, Lucioni Pro y el Copilot, sin duplicar esos datos.

### Hecho
- **Servidor `vercel/api/macro.js`** (público, solo lectura, con caché en CDN). Cada respuesta trae fuente, enlace, unidad, frecuencia y fecha; si una fuente falla devuelve error, nunca valores de relleno.
  - `?panel=1` y `?hist=<k>&c=PE,US`: 9 indicadores anuales de 21 economías desde el **FMI (World Economic Outlook)**: inflación, crecimiento del PIB real, PIB nominal, PIB per cápita, desempleo, deuda pública, resultado fiscal, cuenta corriente (% del PIB y US$). Se separa el último dato observado de la estimación del año en curso y se marca desde qué año hay proyección.
  - `?rates=1`: tasas de política monetaria de 17 bancos centrales desde el **BIS** (diaria + 3 años mensual), con último movimiento, comparación con hace un año y aviso de dato antiguo. Los países del euro usan la tasa del BCE.
  - `?curve=1`: curva del **Tesoro de EE.UU.** (13 plazos) hoy, hace 1 mes y hace 1 año; spread 10A−2A diario y 10A−3M.
  - `?conf=1`: confianza del consumidor, confianza empresarial manufacturera e indicador adelantado (CLI) mensuales de 19 economías desde la **OCDE** (formato SDMX-XML).
  - `?cal=1`: calendario con las reuniones del **FOMC** (página oficial de la Reserva Federal, marca las que traen proyecciones SEP) y, con `FRED_API_KEY`, las publicaciones de FRED (IPC, empleo, PIB, PCE, ventas minoristas, producción industrial, confianza…).
  - `?us=1`: datos mensuales de EE.UU. desde FRED (IPC general y subyacente, desempleo, nóminas, fondos federales, producción industrial, ventas minoristas, confianza de Michigan). Sin clave responde `blocked: FRED_API_KEY`.
- **Vista Economía global** (`macro`, id `economia`): Resumen por país (tarjetas con año, estimación, puesto entre 21 y fuente; tasa del banco central con su último movimiento; lectura de tasa real calculada con reglas fijas), Comparar países (ranking animado con barras divergentes para valores negativos, último dato o estimación, historial de hasta 6 países con tramo proyectado punteado, 10/20 años/todo, descarga CSV con fuente por fila), Bancos centrales (tabla ordenable con mini gráfico de 3 años y resumen del ciclo global), Curva de rendimientos, Confianza y ciclo, Calendario (estado de cada fuente) y EE.UU. mensual.
- **Integraciones**: categoría *Economy* en Lucioni Pro, botón en el Terminal y el Copilot responde preguntas como "¿cómo está la inflación en Perú y Chile?" con datos del FMI y el BIS citados (sin pedir permiso: son datos públicos).

### Bloqueos documentados
- **Banco Mundial**: su firewall bloquea las peticiones desde los servidores de Vercel (respuesta 502 con página "waf-block"; con agente de navegador la conexión se cuelga). Probado el 16-nov-2026. Se reemplazó por el FMI, que cubre los mismos indicadores principales con estimaciones más recientes.
- **BLS** (calendario de EE.UU.): responde 403 a servidores. El calendario completo de EE.UU. queda disponible al agregar `FRED_API_KEY`.
- **Exportación CSV de la OCDE**: devuelve 500; se usa el formato XML, que funciona.
- Perú y Argentina no están en la base de confianza de la OCDE; la app lo indica.

### Pruebas
`test/ui-macro.test.cjs` (46 correctas). El servidor de pruebas reproduce los formatos reales de cada fuente (JSON del FMI, CSV del BIS y del Tesoro, SDMX-XML de la OCDE, HTML de la Reserva Federal, 403 del BLS) para ejecutar los analizadores reales. Cubre: separación observado/estimado, último movimiento de tasas, BCE compartido, parámetros inválidos, bloqueos informados, todas las pestañas, ranking, historial, CSV, orden de tablas, errores con Reintentar, Copilot, Lucioni Pro y móvil sin desborde. La batería completa pasa.

### Desplegado
`dpl_55tcTu9XT7B7GpvzHZpm9AG1ndJv`. Verificado en producción: panel del FMI, historial de PIB de Perú y EE.UU., tasas del BIS, curva del Tesoro, OCDE y calendario del FOMC con datos reales.

## Entrega 7 — Complete Financial Platform, Fase 5: Intelligence Network (16 nov 2026)

Auditoría previa: ya existían el Copilot (v32) con herramientas por intención (cartera, sector, simulación, mercado, finanzas y macro), la cuota diaria de IA por plan y el registro de tokens en `ai.js`. Faltaba una capa única que leyera los módulos con permiso verificado en el servidor y produjera un informe completo. No se creó otro chatbot: el Copilot enruta el análisis completo a esta capa y las demás preguntas siguen igual.

### Hecho
- **Servidor `vercel/api/intel.js`** (requiere sesión; el uid sale siempre del token firmado):
  - `consent.get` / `consent.set`: permiso **por módulo** guardado en `users/<uid>/intel/consent.json`, con fecha y registro en la auditoría. Módulos: Finanzas y banca, Deudas, Patrimonio, Inversiones, Inmuebles, Jubilación, Metas (sensibles: requieren permiso) y Economía global (pública).
  - `report`: lee en el servidor solo los módulos autorizados (403 `consent_required` si falta alguno), calcula los datos de forma determinista (promedios de 6 meses sin transferencias, tasa de ahorro, liquidez, fondo de emergencia, suscripciones, presupuestos, deuda total, TEA ponderada, meses para pagar, cuotas sobre ingreso, patrimonio y su cambio, cartera valorizada con precios de mercado, concentración, inmuebles con tasación, hipoteca y renta, proyección de jubilación, metas, inflación y tasa del país), detecta señales por reglas, datos faltantes y datos desactualizados, y simula escenarios (recorte de gasto, prepago de la deuda más cara, caída de 20% de la bolsa, inflación sobre el efectivo, más aporte para la jubilación).
  - La IA (Gemini, modo JSON) solo redacta: el servidor elimina citas a datos inexistentes, quita HTML, descarta plazos inválidos y **marca como "cifra no verificada"** toda frase con un número que no está en los datos. Si la IA falla, el informe se entrega igual con el análisis calculado y sin texto inventado, y no se cobra la cuota.
  - Cada dato lleva tipo (**hecho, estimación o simulación**), fecha y fuente.
  - `log`: registro de cada uso y error de IA (módulos, modelo, tokens, duración, estado) en `users/<uid>/intel/log.json`, más el uso del día. `reports`: últimos 10 informes.
  - Cuota: informes completos por día (`intelDaily`: Free 3, Premium 30; configurable en `PLAN_LIMITS`) además de la cuota general de IA.
  - La exportación de datos incluye permisos, registro e informes; el borrado de la cuenta los elimina.
- **Cliente (v37)**: el Copilot detecta pedidos de análisis completo ("Analiza mi situación financiera completa…") y muestra la tarjeta de permisos por módulo, el progreso por módulo y el **informe de 10 secciones**: resumen ejecutivo, datos utilizados, situación actual, fortalezas, riesgos, oportunidades, escenarios, recomendaciones educativas con plazo, datos faltantes (con botón para completarlos) y fuentes y fechas. Las citas llevan al dato exacto. Exporta a PDF. Hoja "Permisos y registro" para conceder o retirar permisos, ver el uso del día, el registro de IA y abrir informes anteriores. Accesos: acción del Copilot y Lucioni Pro → Intelligence.

### Pruebas
- `test/intel-api.test.mjs` (32 correctas): permisos por módulo, auditoría, informe con datos reales de todos los módulos, tipos de dato, escenarios, validación de la salida de la IA (citas, HTML, cifras no verificadas, plazos), aislamiento entre usuarios, revocación, fallo de la IA sin texto inventado, registro, cuota y exportación.
- `test/ui-intel.test.cjs` (19 correctas): sin cuenta, permiso, progreso, 10 secciones, citas navegables, PDF, hoja de permisos y registro, revocación aplicada en el servidor, informes anteriores, que las demás preguntas sigan en el Copilot normal y móvil sin desborde.
- Se actualizaron dos pruebas anteriores por el cambio esperado (la pregunta de análisis completo ahora va a Intelligence Network; el Copilot tiene 7 acciones). La batería completa pasa.

### Pendiente o limitado
- El informe completo con IA real en producción requiere iniciar sesión; se verificó contra el servidor de pruebas y el endpoint está desplegado. Conviene que el dueño genere un informe real y revise la redacción.
- "Resumen de documentos" queda para la Fase 7 (Document Vault).

### Desplegado
`dpl_D6XTam4isScXwU2Djx7dbu1oPUGd`.

## Entrega 8 — Complete Financial Platform, Fase 6: Strategy Lab (16 nov 2026)

Auditoría previa: existían el Backtest de cartera (v23: 5 años de cierres semanales reales, aportes mensuales, rebalanceo anual, comparación con el S&P 500; la simulación estaba escrita dentro del botón, sin costos ni señales), el riesgo de cartera (volatilidad, beta y correlación con `stats30`, `corr30` y `beta30`) y los indicadores técnicos `LCH` (v35). Se extrajo un **motor único `LBT`** y el Backtest clásico ahora corre sobre él: no hay motores paralelos.

### Hecho
- **Motor `LBT`** (puro, probado aparte): activos con pesos, inversión inicial y aportes mensuales; rebalanceo sin, mensual, trimestral, anual o por banda de tolerancia; reglas de entrada y salida combinables (todas o alguna) con medias móviles, cruces de medias, RSI, momentum y caída desde el máximo; costos (comisión %, deslizamiento % y comisión fija por operación); rendimiento opcional del efectivo. Métricas: valor final, aportado, CAGR por tiempo, volatilidad, Sharpe, Sortino, caída máxima y su duración, rendimiento por año, beta y correlación con el índice de comparación, costos pagados, número de operaciones, rotación y tiempo invertido.
- **Sin sesgo de anticipación**: la señal de la semana t usa solo cierres hasta t−1 y se ejecuta al cierre de t. Los indicadores sin datos suficientes (calentamiento) nunca dan señal.
- **Sesgo de supervivencia y limitaciones documentados en cada backtest**: período real, fuente (Nasdaq, cierres semanales, solo precio, sin dividendos), costos y total pagado, regla de ejecución, rebalanceo, que se eligen activos que existen hoy, y que no incluye impuestos ni tipo de cambio. El índice de comparación usa los mismos aportes y costos.
- **Vista Strategy Lab** (`lab`): editor con plantillas (60/40, Todo el mundo, Tendencia de 40 semanas, Momentum 6 meses, Comprar en caídas por RSI, Mi cartera real), resultados con evolución, caídas, rendimiento por año, últimas operaciones, matriz de correlación entre activos (Correlation Lab) y supuestos; descarga CSV (curva + supuestos) e informe PDF.
- **Guardar, versiones y comparación**: hasta 20 estrategias con 15 versiones cada una, sincronizadas con la cuenta (clave `slab` del estado); comparar dos versiones (qué parámetros cambiaron y sus resultados) y comparar hasta 4 estrategias en el mismo período.
- Accesos: Lucioni Pro → Analysis y botón "Abrir en Strategy Lab" en el Backtest clásico.

### Problemas encontrados y corregidos
- **Señales falsas durante el calentamiento**: en JavaScript `precio > null` es verdadero, así que una regla "precio sobre su media de 40 semanas" compraba en la semana 1. Ahora una condición sin datos nunca se cumple; hay una prueba para esto.
- **Funciones que se volvían globales**: el código de la app no corre en modo estricto, por lo que una `function` declarada dentro de un bloque `{ }` se vuelve global. Los módulos v36 (Economía global) y v37 (Intelligence Network), ya desplegados, declaraban nombres genéricos (`render`, `hist`, `run`, `wire`…) que podían pisar funciones de otros módulos, como el buscador del menú o el pintado de la lista de empresas. Se encerró cada módulo (v36, v37 y v38) en su propia función y se agregó una prueba que verifica que la navegación, la lista de empresas y el buscador del menú siguen intactos.

### Pruebas
`test/ui-lab.test.cjs` (27 correctas): motor contra valores conocidos (comprar y mantener exacto, CAGR, costos, aportes, sin anticipación, calentamiento, rebalanceo anual y por banda, caída máxima, activo sin historial), editor, plantillas, métricas, supuestos, versiones, matriz de correlación, CSV, PDF, comparación de versiones y de estrategias, Backtest clásico sobre `LBT`, funciones globales intactas y móvil. La batería completa pasa.

### Desplegado
`dpl_EtEBPg49XeBbnG3qfoDsovGBoogy`.

## Entrega 9 — Complete Financial Platform, Fase 7: Document Vault y Tax & Compliance (16 nov 2026)

Auditoría previa: no existía almacenamiento de documentos. Las herramientas fiscales existentes eran "Impuestos y lotes" (Mesa del inversor: tasa estimada 5%, ganancia por lote, cosecha de pérdidas) y "Costo real desde Perú" (retención 30% de EE.UU. e impuesto 5%). Se amplían enlazándolas a un registro de reglas con fuente; no se duplicaron cálculos. Se usó un solo endpoint nuevo (`vault.js`) porque el plan de Vercel permite 12 funciones.

### Hecho
- **Servidor `vercel/api/vault.js`** (sesión obligatoria; uid de la sesión firmada):
  - Subida de PDF, PNG, JPG y WEBP hasta 3 MB, validada por tipo **y por contenido** (bytes mágicos: un PNG con nombre .pdf se rechaza); límites por plan (Free 25 documentos / 50 MB; Premium 300 / 1 GB, configurables en `PLAN_LIMITS` con `docs` y `docMB`).
  - Archivos privados en `users/<uid>/docs/<id>/v<n>`; nunca se exponen URLs de almacenamiento; descarga solo con la sesión del dueño. **Historial de versiones** (hasta 20 por documento).
  - **OCR y extracción con IA** (Gemini lee el PDF o la imagen): texto, título, emisor, fecha, vencimiento, importes y resumen. El servidor limpia HTML, valida fechas reales, monedas ISO e importes, y guarda el resultado como **"sugerido"**; el usuario lo corrige y confirma (**"revisado"**). El texto del documento se trata como datos, no como instrucciones. Cada lectura queda en el registro de uso de IA y consume la cuota diaria.
  - Búsqueda en nombre, categoría, etiquetas, notas, datos y texto reconocido, con fragmento. Recordatorios por vencimiento (días de anticipación por documento). Auditoría de subidas, revisiones y borrados. La exportación de datos incluye los datos de los documentos (sin rutas internas); el borrado de la cuenta los elimina.
  - `GET ?tax=1`: **registro de reglas fiscales** (`vercel/lib/tax-rules.js`) con jurisdicción, base legal, fuente oficial, vigencia, fecha de revisión, estado e historial de cambios.
- **Reglas cargadas (12, Perú y EE.UU.)**: dividendos peruanos 5% (con historial 4,1% → 6,8% → 5%), ganancia por venta de valores 5% efectivo, fuente extranjera (rango 8%–30%, por verificar), intereses de depósitos (exoneración por verificar), ITF 0,005%, UIT 2025 S/ 5.350, UIT 2026 (sin valor: se ingresa desde El Peruano), declaración anual (fecha según cronograma SUNAT), retención de 30% de EE.UU., ganancias de no residentes en EE.UU., impuesto a la herencia de EE.UU. (exención US$ 60.000) y vigencia del W-8BEN. **Las reglas que cambian o vencen se marcan "por verificar" y no llevan una cifra inventada.**
- **Document Vault** (vista `vault`): subida por arrastre, lectura con IA opcional al subir, uso del plan, vencimientos y recordatorios, filtros por categoría (estados de cuenta, informes de inversión, comprobantes, contratos, inmuebles, impuestos), búsqueda, ficha con vista previa, datos editables, texto reconocido, versiones, descarga y borrado. Aviso diario de documentos por vencer.
- **Tax & Compliance** (vista `tax`): resumen con alertas (reglas por verificar, revisiones antiguas, novedades del registro), calendario (declaración anual registrada por ti, vencimiento del W-8BEN, publicación de la UIT y vencimientos de tus documentos), reglas por jurisdicción con fuente e historial, simulador de dos escenarios (cada línea cita su regla; lo no verificado se muestra como rango; tipo de cambio del BCRP o ingresado), registro de eventos fiscales con documento de respaldo, **registro de supuestos** de cada escenario guardado (entradas, tipo de cambio, versión de reglas) e **informe educativo en PDF**.
- **Integraciones**: "Costo real desde Perú" y "Impuestos y lotes" enlazan a la regla y su fuente; Intelligence Network agrega el módulo **Documentos** (con permiso): cantidades por categoría, vencimientos y resúmenes; los datos revisados cuentan como hechos y los sugeridos como estimaciones. El Gemini compartido pasó a `vercel/lib/gemini.js` (Intelligence y Vault usan el mismo).

### Pruebas
- `test/vault-api.test.mjs` (31 correctas): reglas con fuente y sin cifras inventadas, validación por contenido, límites, versiones, extracción revisable y limpia, búsqueda, aislamiento entre usuarios, registro de IA, auditoría, Intelligence con documentos, exportación y borrado completo.
- `test/ui-vault.test.cjs` (29 correctas): subida con y sin IA, revisión, búsqueda, versiones, descarga, borrado, alertas, reglas, historial, calendario (W-8BEN y documentos), simulador con valores conocidos, registro de supuestos, eventos, informe, enlace desde las herramientas existentes y móvil.
- Se actualizaron pruebas anteriores por cambios esperados (9 módulos de permisos en Intelligence; 9 categorías en Lucioni Pro). La batería completa pasa.

### Pendiente
- Los recordatorios son dentro de la app (al entrar). Avisos por correo requieren configurar `RESEND_API_KEY` y una tarea programada.
- Las reglas deben revisarse al menos una vez al año (la app avisa si una revisión tiene más de 365 días). La UIT 2026 y el cronograma de la declaración deben registrarse desde la fuente oficial.

### Desplegado
`dpl_6gsfnC4rKLJcsEPXPpnZ2SZWuDck`. Verificado en producción: `/api/vault?tax=1` devuelve las 12 reglas.

## Entrega 10 — Complete Financial Platform, Fase 8: Life Planner (17 nov 2026)

Auditoría previa: existía **Lucioni Goals / Metas** (v19): metas sincronizadas con la cuenta (`GOALS`, clave `goals`), probabilidad por Monte Carlo (`gSim`), aporte para 80% (`gNeeded`), ajuste por inflación y perfiles de riesgo; Retirement (v34) ya usaba el mismo motor. Life Planner **amplía Metas**: usa las mismas metas y el mismo motor; no hay un segundo sistema de metas.

### Hecho
- **Metas ampliadas**: nuevos tipos (Vehículo y Patrimonio objetivo) y, en el mismo formulario, prioridad (alta, media, baja), dependencia ("empieza después de" otra meta), fuente del dinero (liquidez, inversiones aparte u otra) y vínculos con el **plan de jubilación** (capital necesario, ahorro, aporte y fecha calculados con el mismo método de Retirement) o con el **patrimonio neto** (último registro de Mis finanzas). Se conservan los ids y todo se sincroniza con la cuenta.
- **Motor `LP40`** (puro y probado): aporte necesario con rentabilidad esperada (el ahorro actual crece todo el plazo; los aportes empiezan cuando termina la meta previa), detección de dependencias circulares, conversión de metas en dólares, y **reparto mes a mes** de la capacidad de ahorro por prioridad y fecha: cuando una meta termina, su aporte pasa a las demás.
- **Vista Life Planner** (`plan`): aporte necesario hoy y en el mes más exigente (con el criterio de Metas: 80% de probabilidad), capacidad de ahorro (promedio de ingresos menos gastos de Mis finanzas o un monto ingresado), faltante o margen, **liquidez libre** después de apartar las metas que salen de tu liquidez y cuántos meses de gasto cubre; prioridades y financiamiento; **línea de tiempo** con esperas, dependencias y fechas de uso; **impacto en la liquidez mensual** (aportes comprometidos frente a la capacidad); **escenarios** pesimista, base y optimista por meta y el efecto de una capacidad 20% menor; **comparación** de metas ordenable (prioridad, fecha, probabilidad, aporte) con progreso, aporte actual y necesario, dependencia y estado.
- Accesos: botón en Metas y Lucioni Pro → My Finances. Intelligence Network ya lee las metas con permiso.

### Problemas encontrados y corregidos
- **Reparto estático**: la primera versión asignaba la capacidad una sola vez, así que una meta dependiente "reservaba" dinero meses antes de empezar y dejaba sin fondos a otras que sí cabían. Se cambió a reparto mes a mes; hay una prueba con valores conocidos.
- **Criterio distinto al de Metas**: el aporte calculado con la rentabilidad media dejaba cada meta financiada en ~50% de probabilidad. Ahora usa el mismo criterio de Metas (80%) y el mismo Monte Carlo (700 escenarios).

### Pruebas
`test/ui-planner.test.cjs` (25 correctas): aporte sin y con rentabilidad (llega exacto al objetivo), ahorro suficiente, meta que empieza más tarde, dependencia, prioridades, reparto mes a mes, ciclos, dólares, vista (capacidad, reparto, línea de tiempo, escenarios, liquidez, comparación), formulario de Metas con los campos nuevos, vínculo con jubilación y móvil. La batería completa pasa.

### Desplegado
`dpl_7nUbp16YgcHxDBari14pFNJExFn5`.

## Entrega 11 — Complete Financial Platform, Fase 9: Premium e internacionalización (17 nov 2026)

Auditoría previa: Premium ya existía (Entrega 1): planes Free y Premium con límites en el servidor, prueba de 7 días sin tarjeta, pagos preparados (inactivos sin claves) y hoja de plan con condiciones de la prueba. Faltaba que la comparación mostrara los módulos nuevos, un panel de uso y un límite en el servidor para Strategy Lab. La internacionalización existía para Lucioni Daily y la navegación (español e inglés, unas 60 claves), con moneda de presentación, país y zona horaria en el perfil.

### Hecho — Premium
- **Límites en el servidor** (`PLANS` en `lib/core.js`, configurables con `PLAN_LIMITS`): IA por día, informes de Intelligence, Deep Research, Academy Advanced, alertas, documentos y espacio, **estrategias guardadas (nuevo: Free 3, Premium 20)**, cuentas, movimientos, inmuebles y carteras.
- **Strategy Lab limitado sin borrar datos**: el servidor conserva siempre las estrategias que ya existían (por ejemplo, al volver de Premium a Free) y solo rechaza las nuevas por encima del límite, avisando en la respuesta (`limited`). La app avisa antes de guardar.
- **Hoja de plan**: comparación Free/Premium generada desde los límites que devuelve el servidor (no escrita a mano) y **panel "Tu uso"** (consultas e informes de hoy, documentos, estrategias y alertas). Se mantiene la información de la prueba de 7 días y del vencimiento.

### Hecho — Internacionalización
- **Idiomas**: español e inglés; **portugués en vista previa** (base de portada y navegación más frases de los módulos). Agregar un idioma = agregar un diccionario. Una capa de traducción cubre títulos, pestañas, botones, etiquetas y descripciones de los módulos construidos después (Economía global, Strategy Lab, Intelligence, Vault, Tax, Life Planner, Gráfico profesional, Mis finanzas), la navegación y todo Lucioni Pro. El cambio a inglés o portugués se aplica sin recargar.
- **Formato por país**: el idioma decide las palabras y el país, el formato de números, fechas y moneda (por ejemplo, España `1.234.567,89 €`, Brasil `pt-BR`); la hora se muestra en la zona horaria del perfil.
- **Disponibilidad por país** en el perfil: qué funciona en cada país y qué no (reglas fiscales solo Perú y EE.UU.; tipo de cambio oficial del sol solo Perú; sin conexión bancaria automática en ningún país; pago de Premium dependiente del proveedor).
- **Moneda original y tasa**: en Mis finanzas cada movimiento conserva su monto y moneda originales; si la cuenta está en otra moneda se muestra además la conversión a la moneda base con la tasa usada, su fuente y su fecha. Monedas de presentación: USD, EUR, PEN y GBP.

### Cobertura y pendientes (honesto)
- Traducido al inglés: navegación, Lucioni Daily, Lucioni Pro y la interfaz fija de los módulos nuevos (~320 frases). **Sin traducir todavía**: textos generados dinámicamente con cifras, herramientas antiguas (v16–v28), lecciones de Academy y respuestas de la IA (la IA responde en español). El portugués es una vista previa.
- El pago de Premium sigue inactivo hasta configurar Stripe; el precio de renovación, la fecha de cobro y la cancelación se muestran desde Stripe cuando esté activo.

### Pruebas
`test/ui-i18n.test.cjs` (23 correctas): límites definidos por el servidor, Strategy Lab sin borrado al bajar de plan, perfil en portugués, español sin cambios, inglés en módulos y Pro, portugués y formato de Brasil, España con formato es-ES, aviso de límite, disponibilidad por país, comparación y uso en la hoja de plan, monto original con tasa. La batería completa pasa.

### Desplegado
`dpl_EPZSqVtNnje6Z9iTo8NDthiTnwDj`.

## Entrega 13 — Ajustes: cabecera y pagos con Mercado Pago (17 nov 2026)

- **Cabecera**: la insignia "Beta" se cortaba debajo de "Lucioni Capital" en pantallas medianas. Ahora va en la misma línea y, por debajo de 1180 px, se oculta para no cortar el nombre (los comentarios siguen disponibles en el pie, en Lucioni Pro y en el perfil). Verificado de 360 a 1920 px.
- **Pagos**: Stripe no acepta empresas del Perú. Se agregó **Mercado Pago** como proveedor principal: suscripción mensual en soles (API de suscripciones `preapproval`), notificaciones con firma `x-signature` verificada, el estado se consulta siempre a la API de Mercado Pago (el cuerpo de la notificación no decide el plan), cancelación desde la app sin nuevos cobros y con Premium hasta el fin del periodo pagado, y vuelta a Free al vencer sin borrar datos. La pantalla de plan muestra precio en soles, renovación mensual, próximo cobro y cómo cancelar. Stripe se conserva como alternativa para otros países.
- **Pruebas**: `test/billing-mp.test.cjs` (18 correctas) con la API de Mercado Pago simulada en el servidor de pruebas. La batería completa pasa. **No se probó con una cuenta real de Mercado Pago**: hace falta configurar las claves y hacer un pago de prueba con las credenciales de prueba de Mercado Pago antes de cobrar.
- Desplegado: `dpl_68C4SmgC6bbtELKr6GUSGi3XjPvN`.

## Lo que necesita el dueño (variables en Vercel → Settings → Environment Variables)

| Para | Variables | Estado |
|---|---|---|
| Rotar la clave de IA | `GEMINI_API_KEY` | Recomendado (se compartió por chat) |
| Correos de recuperación y verificación | `RESEND_API_KEY` + `MAIL_FROM`, o `SMTP_USER` + `SMTP_PASS` | Sin configurar |
| Pagos de Premium (Perú) | Cuenta de **Mercado Pago** Perú → credenciales de producción: `MP_ACCESS_TOKEN`; en Webhooks, la URL `https://lucioni-capital.vercel.app/api/billing?mp=1` con el evento **Planes y suscripciones**, y su clave secreta en `MP_WEBHOOK_SECRET`; el precio mensual en soles en `PREMIUM_PRICE_PEN` (ej. `29.90`). Stripe queda solo como alternativa para otros países (`BILLING_PROVIDER=stripe`). | Sin configurar |
| Métricas de producto | `ADMIN_EMAILS` (correos de administradores) | Sin configurar |
| Límites de planes | `PLAN_LIMITS` (opcional, JSON; incluye `intelDaily`, `docs`, `docMB` y `strategies`) | Valores por defecto |
| Traducciones | Revisar el inglés y completar el portugués (`src/v41.js`) | Inglés parcial; portugués en vista previa |
| Reglas fiscales | Registrar la UIT 2026 y revisar el registro cada año (`vercel/lib/tax-rules.js`) | Pendiente de revisión anual |
| Economía global: datos mensuales de EE.UU. y calendario completo | `FRED_API_KEY` (gratuita en fred.stlouisfed.org) | Sin configurar; el resto del módulo funciona sin clave |
| Identificación ante la SEC | `SEC_USER_AGENT` (opcional) | Genérico |
| Legal | Política de privacidad y términos; revisión regulatoria por país | Pendiente |
| Datos de mercado con licencia | Contratar un proveedor con derechos de redistribución | Pendiente |

## Próxima entrega propuesta
1. Varias carteras con comparación contra índices y alertas (Premium).
2. Modos de Intelligence: Tutor, Portfolio Analyst, Stock Research con selector y conversaciones guardadas.
3. Traducción completa al inglés y lecciones en inglés.
4. Verificación de correo y lista de sesiones/dispositivos.
5. Panel de métricas para administradores.
