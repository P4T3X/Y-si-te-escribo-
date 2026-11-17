# Auditoría técnica de Lucioni Capital — Fase 0

Fecha: 16 de noviembre de 2026 · Alcance: código real del proyecto, funciones desplegadas en https://lucioni-capital.vercel.app

## 1. Tecnología detectada

| Área | Lo que hay realmente |
|---|---|
| Frontend | Una sola página HTML (sin framework). JavaScript sin módulos, ~12.000 líneas, armado por scripts de parche (`src/v*_patch.py`, `patch3.py`) que concatenan la base (`appv2.js` → `part3.js`) y los módulos `v16.js`–`v29.js`. CSS en el mismo HTML. |
| Librerías | GSAP 3 + ScrollTrigger (animación), React 18 + Remotion 4 (reproductor de video y animación de entrada), empaquetadas con esbuild. No hay Next.js, Vite, Supabase ni Firebase. |
| Backend | Funciones serverless de Vercel en Node (`vercel/api/*.js`), sin framework. |
| Base de datos | Vercel Blob privado, como almacén de documentos JSON por usuario (`users/<uid>/profile.json`, `state.json`, `audit.json`). No hay base relacional. |
| Autenticación | Propia: correo + contraseña con scrypt (N=16384) y sal; sesiones firmadas con HMAC-SHA256 (`AUTH_SECRET`), 30 días; códigos de recuperación hasheados; restablecimiento por correo (Resend o SMTP, **aún sin configurar**). |
| IA | Google Gemini (`GEMINI_API_KEY`) desde el servidor; modelo `gemini-3.1-flash-lite` con alternativas. La búsqueda de Google integrada no está disponible con la clave gratuita (responde 429). |
| Datos financieros | API pública no oficial de Nasdaq (cotizaciones, históricos, analistas, noticias), SEC EDGAR (13F, 8-K, XBRL), Cámara de EE. UU. (operaciones de congresistas), BCRP (USD/PEN), BCE (EUR, GBP). |
| Hosting | Vercel, proyecto `lucioni-capital`, despliegue por API (`deploy.sh`). Cron diario de ideas a las 13:17 UTC. |
| Versión artifact | La misma app en un solo archivo para Claude (`dist/lucioni-capital.html`); ahí no hay servidor: IA por Claude, sin datos de mercado en vivo. |

## 2. Estado real de las funciones

| # | Función | Estado | Notas |
|---|---|---|---|
| 1 | Generador de carteras con IA | Funciona | Usa candidatos reales (ETFs y acciones con cotización) y elimina tickers inventados por la IA. |
| 2 | Empresas y cotizaciones | Funciona, datos reales | +600 empresas de Nasdaq; pueden tener retraso. |
| 3 | Ideas de inversión | Funciona, datos reales | Caché diaria en Blob. |
| 4 | Cartera real | Funciona | Una sola cartera; precios en vivo. |
| 5 | Mercado simulado | **Simulado** | Precios generados; está rotulado como simulación. |
| 6 | Simulador de cartera ($10.000) | Funciona, precios simulados | Órdenes de mercado, límite y stop. |
| 7 | Diario de inversión | Funciona | Local + sincronizado con la cuenta. |
| 8 | Lucio Bot | Funciona | Rival simulado. |
| 9 | Retos y logros | Funcionaba, **premiaba operar más** | Corregido en esta entrega (ver progreso). |
| 10 | Planificación / Metas | Funciona | Monte Carlo con 700 escenarios; supuestos visibles. |
| 11 | Monte Carlo | Funciona | Supone rendimientos normales: advertencia añadida en Academy. |
| 12 | Rebalanceo | Funciona | En Mesa del inversor. |
| 13 | Calculadoras | Funcionan | Interés compuesto, costos desde Perú, backtest con 5 años reales. |
| 14 | Mesa del inversor (11) | Funciona | Datos SEC y Cámara reales. |
| 15 | Centro de aprendizaje | Glosario y fichas | Ampliado con Lucioni Academy. |
| 16 | Trivia | Funciona | — |
| 17 | Descubre acciones | Funciona | — |
| 18 | Asistente educativo (Asesor) | Funciona | Con fuentes numeradas, gráficos y proyección. |
| 19 | Búsqueda global | Funciona | Ctrl+K. |
| 20 | Niveles / XP | Funciona | XP y niveles locales, sincronizados. |
| — | Deudas e inversión | Funciona | — |

## 3. Problemas encontrados

### P0 — críticos y seguridad
1. **El código fuente no estaba en el repositorio.** Solo existía en un contenedor temporal y como HTML compilado en Vercel. → **Corregido**: todo el código, scripts de build y pruebas viven ahora en `lucioni-capital/`.
2. **Sin cabeceras de seguridad** (CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy). → **Corregido** en `vercel/vercel.json`.
3. **La IA no tenía límite por usuario**, solo 15 por minuto por IP. → **Corregido**: cuota diaria por plan verificada en el servidor y registro de tokens por usuario.
4. **Eliminar la cuenta dejaba archivos** (auditoría, uso). → **Corregido**: se borra todo lo que empieza por `users/<uid>/` y `usage/<uid>/`.
5. La clave de Gemini se compartió por chat en una conversación anterior. → **Pendiente del dueño**: rotarla en Google AI Studio y actualizar `GEMINI_API_KEY` en Vercel.

### P1 — funciones esenciales
- No había planes Free/Premium, prueba ni pagos → **implementado** (pagos listos, inactivos hasta configurar Stripe).
- No había exportación de datos → **implementado**.
- No había preferencias de idioma, moneda, país ni zona horaria → **implementado**.
- Los retos daban XP por número de compras y operaciones → **corregido**.
- Verificación de correo → **pendiente**: requiere configurar el envío de correos (Resend o SMTP).

### P2 — experiencia y rendimiento
- Todo se carga al abrir: 1,3 MB en una sola página, de los cuales 622 KB eran React/Remotion solo para el video. → **Mejorado**: en la web ese paquete se carga en segundo plano (la página pasó a 0,87 MB; arranque en móvil de gama media simulado: 6,4 s → 5,3 s).
- La arquitectura por parches dificulta el mantenimiento → **recomendación**: migrar por etapas a módulos ES con esbuild (ver §5).
- Navegación con muchas entradas → **mejorado** con una barra inferior en el móvil y un menú "Más" con todas las secciones.

### P3 — futuro
Carteras múltiples en la interfaz, alertas con notificaciones push, informes PDF, portugués, precios regionales, panel de métricas para administradores.

## 4. Riesgos

- **Proveedor de datos:** la API de Nasdaq que usa la app no es oficial ni tiene contrato de redistribución. Para un producto comercial hay que contratar un proveedor con licencia (por ejemplo Polygon, Twelve Data, Intrinio o Refinitiv) y revisar sus condiciones de redistribución y retraso. Hasta entonces la app lo indica como "puede tener retraso".
- **Regulación:** la app es educativa. No es una sociedad agente de bolsa ni está supervisada por la SMV; el aviso se muestra en la pantalla de Premium, en Academy y en el manual de marca. Antes de cobrar en cada país hay que confirmar con un abogado local que el contenido no constituye asesoría de inversión regulada.
- **Privacidad:** tratamiento de datos personales en Perú (Ley 29733), UE/Reino Unido (RGPD) y otros mercados: falta publicar la política de privacidad y los términos. La analítica requiere consentimiento y no guarda datos personales.
- **Pagos:** Stripe requiere una entidad legal en un país soportado; hasta donde sé, Perú no está en la lista de países donde Stripe abre cuentas directamente (verificarlo en stripe.com/global antes de decidir). Alternativas: entidad en EE. UU. (Stripe Atlas), Paddle o Lemon Squeezy (actúan como comerciante registrado y gestionan impuestos), o Mercado Pago para Latinoamérica.
- **Blob como base de datos:** suficiente para la escala actual, pero sin consultas ni transacciones. Con miles de usuarios activos conviene migrar a Postgres (Neon en Vercel) con el esquema de §5.

## 5. Arquitectura propuesta

Módulos lógicos ya presentes en el código:

| Módulo | Dónde vive hoy |
|---|---|
| User Core | `api/account.js`, `lib/core.js` (sesiones, perfil, preferencias, exportación, eliminación) |
| Market Engine | `api/market.js`, `api/sec.js` |
| Portfolio Engine | `src/v17.js` (cálculos separados de la vista en `pfCalc`) |
| Lucioni Intelligence | `api/ai.js` (cuota, modos, defensa contra instrucciones en fuentes) + `src/v28.js` (investigación con fuentes) |
| Simulation Engine | simulador base + `v19.js` (metas Monte Carlo) |
| Learning Engine | `api/academy.js` + `src/v29.js` |
| Engagement Engine | XP, niveles, retos, racha (`src/v29.js`) |
| Billing Engine | `lib/core.js` (planes y permisos) + `api/billing.js` (Stripe) |
| Notification Engine | Recordatorios dentro de la app (configurables). Push: pendiente. |
| Analytics Engine | `api/event.js` (agregados sin datos personales) |

Esquema recomendado cuando se migre a Postgres: `users`, `profiles`, `user_preferences`, `subscriptions`, `trial_events`, `portfolios`, `portfolio_assets`, `transactions`, `watchlists`, `market_snapshots`, `ai_conversations`, `ai_usage`, `lessons`, `learning_progress`, `challenges`, `achievements`, `notifications`, `audit_logs`. Cada tabla privada llevaría `user_id` con índice y una política de acceso que filtre por el usuario de la sesión. Las migraciones se harían con scripts reversibles (`up`/`down`), y antes de la primera se exportaría todo el contenido de Blob.
