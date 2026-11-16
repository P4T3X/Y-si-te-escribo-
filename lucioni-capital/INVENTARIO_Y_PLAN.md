# Lucioni Capital — Inventario completo y plan de integración (Complete Financial Platform)

Fecha: 16 de noviembre de 2026. Fase 1 del master prompt "Complete Financial Platform". Todo lo listado se verificó en el código (`src/`, `vercel/api/`), no por nombre.

## 1. Arquitectura real (sin cambios de tecnología)

- **Frontend**: una página HTML sin framework; módulos `src/v16.js`…`src/v33.js` concatenados por `build.sh`. GSAP en línea; React + Remotion se cargan en diferido solo para video.
- **Backend**: funciones serverless de Vercel en Node (`vercel/api/*.js`) con servicios compartidos en `vercel/lib/core.js`: sesiones HMAC, almacenamiento, planes y permisos, auditoría y límites.
- **Datos**: Vercel Blob privado, en documentos JSON por usuario bajo `users/<uid>/`; el `uid` sale siempre de la sesión firmada.
- **Decisión**: se mantiene esta arquitectura. Cambiar de framework o de base de datos no aporta nada que bloquee estas fases. La migración a Postgres (Neon en Vercel) queda propuesta para cuando haya consultas entre usuarios o un volumen que Blob no sostenga (§5).

## 2. Inventario por categoría

### 1. Existente y funcional
| Función pedida | Dónde vive | Notas |
|---|---|---|
| AI Portfolio Generator | `appv2.js` `runAI` + `v22.js` | Solo propone tickers reales; descarta los inventados |
| Portfolio Tracking | `v17.js` (Mi cartera real) | Precios en vivo de Nasdaq |
| $10,000 Virtual Investment Simulator | simulador base (`appv2.js`, `part3.js`) | Órdenes de mercado, límite y stop |
| Monte Carlo Financial Planning | `v19.js` (Metas) + herramienta `mc` | 700 escenarios; supuestos visibles |
| Rebalancing | herramienta `reb` + Mesa → Rebalanceo | — |
| Valuation Tools | `v18.js` (DCF en la ficha) | DDM y comparables: pendiente (Strategy/Valuation) |
| Investment Diary | `part3.js` (DIA) | Base del futuro Journal Pro |
| Lucio Bot | `appv2.js` / `part3.js` | Rival simulado |
| Learning Center | Aprende + Lucioni Academy (`v29.js`, `api/academy.js`) | Ruta Advanced validada en servidor |
| Trivia, Challenges, Achievements | `part3.js`, `v29.js` | Los retos premian aprender, no operar |
| Investment Research | Deep Research (`v31.js`), Ideas (`v16.js`) | Fuentes Nasdaq y SEC |
| Stock Discovery | Descubre (cartas) | — |
| Investor Desk | Mesa del inversor (`v20.js`), 11 herramientas | — |
| Financial Calculators | Herramientas (`part3.js`, `v23.js`) | — |
| Global Search | Ctrl+K (`openCmd`) | — |
| Investment Analysis | Riesgo de cartera (`v18.js`) + Copilot (`v32.js`) | Beta, Sharpe, aporte al riesgo |
| Deudas | `v21.js` | Avalancha, bola de nieve, invertir y mixto, con Monte Carlo |

### 2. Existente, pero necesita mejoras
- **Deudas**: le faltaban tipo, día de pago, calendario, costo total por deuda y pago anticipado. → **Ampliado en esta entrega como Lucioni Credit**, con el mismo motor `dSim`.
- **Metas** (`v19.js`): le faltan dependencias entre objetivos e impacto en liquidez. → Life Planner (Fase 8), ampliando Metas.
- **Navegación**: había demasiadas entradas sueltas. → Lucioni Pro por categorías y barra móvil (Finanzas en lugar de Patrimonio, que pasa a "Más").

### 3. Existente, pero incompleto
- **Patrimonio neto**: solo existe la cartera de inversiones; faltan cuentas, deudas e inmuebles juntos. → Wealth (Fase 3), que ahora puede leer Banking y Credit.
- **Herramientas fiscales**: la Mesa calcula el impuesto sobre ganancias de forma educativa, pero sin fuente oficial por jurisdicción ni fecha de vigencia. → Tax & Compliance (Fase 7).
- **Backtester y riesgo**: existen por separado (`bt`, `v18`, Copilot). → Strategy Lab (Fase 6) los une, sin un motor paralelo.

### 4. Solo visual o con datos de demostración
- **Mercado simulado**: los precios son generados. Está rotulado como simulación y se mantiene, con fines educativos.
- **Datos de ejemplo de Deudas** (`DB0`): el formulario arranca con dos deudas de ejemplo. Ahora Lucioni Credit avisa cuando siguen siendo las de ejemplo y no las cuenta en la salud financiera ni en la IA.
- **Tu cartera en video**: es un render real con Remotion, sin datos de mercado propios.

### 5. No existía y se desarrolla
Personal Finance, Banking (**hecho en esta entrega**), Estate, Wealth, Retirement, Global Economy (hecho), Intelligence Network (hecho), Strategy Lab (hecho), Document Vault (hecho), Tax & Compliance ampliado (hecho), Life Planner e Intelligence Network. El análisis financiero completo del Copilot ya está hecho en esta entrega; queda ampliarlo con los módulos futuros.

## 3. Plan de integración (qué se reutiliza en cada módulo)
| Módulo | Reutiliza | Nuevo | Fase |
|---|---|---|---|
| Personal Finance | Sesiones, planes, auditoría (`core.js`); tipos de cambio BCE/BCRP (`market.js`) | `api/finance.js`, `v33.js` | 2 ✔ |
| Banking | Mismo almacenamiento que Personal Finance | Cuentas, saldos, CSV, duplicados, inusuales | 2 ✔ |
| Credit | Motor `dSim` y datos `DBT` de Deudas | Detalle, calendario, prepago, evolución | 2 ✔ |
| Wealth | Cartera (`pfCalc`), cuentas (Banking), deudas (Credit) | Patrimonio neto e historial | 3 ✔ |
| Estate | Wealth | Inmuebles, hipotecas (motor de Credit), rentabilidad | 3 ✔ |
| Retirement | Motor Monte Carlo de Metas (ampliado) | Fase de retiro, inflación y edades | 3 ✔ |
| Global Economy | Terminal, BCE y BCRP | ✔ Hecho: FMI, BIS, Tesoro de EE.UU., OCDE y FOMC sin clave; FRED opcional (`FRED_API_KEY`). El Banco Mundial bloquea a Vercel | 4 ✔ |
| Intelligence Network | Copilot `v32` (intents con permiso por módulo) | Más módulos y sesiones guardadas | 5 |
| Strategy Lab | Backtest `bt`, riesgo `v18`, cálculos del Copilot | Reglas, versiones, comisiones | 6 |
| Document Vault | Blob privado por usuario | Subida, OCR, extracción revisable | 7 |
| Tax & Compliance | Mesa → Impuestos | Reglas con fuente oficial y vigencia | 7 |
| Life Planner | Metas (`v19`) | Prioridades, dependencias, liquidez | 8 |

## 4. Seguridad aplicada a los módulos nuevos
- El `uid` sale siempre de la sesión firmada; ninguna petición acepta el id de otro usuario. Hay prueba automática: un segundo usuario no puede leer, modificar ni borrar movimientos ajenos aunque conozca sus ids.
- Validación completa en el servidor:
  - fechas reales (no se acepta el 30 de febrero);
  - monedas ISO, montos acotados y cuentas existentes;
  - limpieza de HTML en los textos;
  - límites por plan: Free 5 cuentas y 3.000 movimientos por año; Premium 50 y 50.000.
- Límite de 120 operaciones por minuto y usuario, y de 300 por IP.
- Archivos de importación: solo CSV o TXT de hasta 2 MB, leídos en el navegador; el servidor vuelve a validar cada fila.
- No se piden ni se guardan credenciales bancarias, ni se mueve dinero.
- La exportación de datos incluye las finanzas, y al eliminar la cuenta se borra todo `users/<uid>/` (comprobado por prueba).

## 5. Base de datos (Blob) y equivalencia con el esquema propuesto
| Entidad pedida | Hoy | Archivo |
|---|---|---|
| users, user_profiles | sí | `users/<uid>/profile.json` |
| financial_accounts, budgets, recurring_payments, categorías, reglas | sí | `users/<uid>/fin/meta.json` |
| account_transactions, income_records, expense_records | sí (un registro con signo: + ingreso, − gasto) | `users/<uid>/fin/tx-<año>.json` |
| debts, debt_payments | sí (debts); los pagos se simulan, no se registran | estado sincronizado (`debt`) |
| financial_goals | sí | estado sincronizado (`goals`) |
| ai_usage | sí | `usage/<uid>/<día>.json` |
| audit_logs | sí | `users/<uid>/audit.json` |
| properties, retirement_scenarios, financial_documents, document_extractions, economic_indicators, data_sources, notifications | no | fases 3 a 7 |

Para no duplicar, los ingresos y gastos son un solo registro de movimiento con signo y categoría (`inc`, `exp` o `tr` para transferencias). Los archivos llevan `"v": 1` para versionar el esquema; una migración futura leerá la versión y convertirá los datos sin perderlos.

## 6. Integraciones: reales y pendientes
| Integración | Estado |
|---|---|
| Nasdaq (mercados), SEC EDGAR, BCRP, BCE | Reales |
| Gemini (IA) | Real |
| Open Banking | **Pendiente**: necesita proveedor y contrato por país. Candidatos a evaluar: Belvo (Latinoamérica), Plaid (EE. UU. y Canadá), TrueLayer o GoCardless (Europa y Reino Unido). Mientras tanto: registro manual e importación CSV |
| OCR (Document Vault) | Pendiente (Fase 7) |
| Indicadores macroeconómicos | Hecho (Fase 4) con FMI, BIS, Tesoro, OCDE y Reserva Federal. FRED (`FRED_API_KEY`) agrega EE.UU. mensual y calendario completo |
| Pagos (Stripe) | Preparado, inactivo sin claves |
