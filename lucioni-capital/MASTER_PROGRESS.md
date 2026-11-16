# MASTER_PROGRESS — Lucioni Capital

Registro real de lo terminado y lo pendiente. "Hecho" significa implementado **y** probado; lo que no se pudo probar se dice.

Producción: https://lucioni-capital.vercel.app · Despliegue de esta entrega: `dpl_uqrzod1USVrkrJLFojp46KBT1msv`

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

## Lo que necesita el dueño (variables en Vercel → Settings → Environment Variables)

| Para | Variables | Estado |
|---|---|---|
| Rotar la clave de IA | `GEMINI_API_KEY` | Recomendado (se compartió por chat) |
| Correos de recuperación y verificación | `RESEND_API_KEY` + `MAIL_FROM`, o `SMTP_USER` + `SMTP_PASS` | Sin configurar |
| Pagos de Premium | `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `PREMIUM_PRICE_LABEL` (ej. "US$ 7,99 al mes") y el webhook `https://lucioni-capital.vercel.app/api/billing?webhook=1` con los eventos `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed` | Sin configurar; antes elegir proveedor según la entidad legal |
| Métricas de producto | `ADMIN_EMAILS` (correos de administradores) | Sin configurar |
| Límites de planes | `PLAN_LIMITS` (opcional, JSON) | Valores por defecto |
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
