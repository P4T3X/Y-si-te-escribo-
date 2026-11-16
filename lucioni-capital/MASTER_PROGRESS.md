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

## Lo que necesita el dueño (variables en Vercel → Settings → Environment Variables)

| Para | Variables | Estado |
|---|---|---|
| Rotar la clave de IA | `GEMINI_API_KEY` | Recomendado (se compartió por chat) |
| Correos de recuperación y verificación | `RESEND_API_KEY` + `MAIL_FROM`, o `SMTP_USER` + `SMTP_PASS` | Sin configurar |
| Pagos de Premium | `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `PREMIUM_PRICE_LABEL` (ej. "US$ 7,99 al mes") y el webhook `https://lucioni-capital.vercel.app/api/billing?webhook=1` con los eventos `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed` | Sin configurar; antes elegir proveedor según la entidad legal |
| Métricas de producto | `ADMIN_EMAILS` (correos de administradores) | Sin configurar |
| Límites de planes | `PLAN_LIMITS` (opcional, JSON) | Valores por defecto |
| Identificación ante la SEC | `SEC_USER_AGENT` (opcional) | Genérico |
| Legal | Política de privacidad y términos; revisión regulatoria por país | Pendiente |
| Datos de mercado con licencia | Contratar un proveedor con derechos de redistribución | Pendiente |

## Próxima entrega propuesta
1. Varias carteras con comparación contra índices y alertas (Premium).
2. Modos de Intelligence: Tutor, Portfolio Analyst, Stock Research con selector y conversaciones guardadas.
3. Traducción completa al inglés y lecciones en inglés.
4. Verificación de correo y lista de sesiones/dispositivos.
5. Panel de métricas para administradores.
