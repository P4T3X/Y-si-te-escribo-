# ¿Y si te escribo? — cómo subirla a internet

## Qué hay aquí
- `public/` → la app (pantallas, animaciones, logo, ícono, PWA instalable).
- `netlify/functions/` → el servidor: cuentas con correo y contraseña, guardado de datos y la IA.
- La API key de Anthropic **vive solo en el servidor**; nunca va dentro de la app.

## 1. Consigue tu API key de Anthropic
1. Entra a https://console.anthropic.com y crea una cuenta.
2. Agrega saldo (Billing). Cada uso de IA cuesta centavos; con el modelo Haiku es muy barato.
3. En "API Keys" crea una clave y cópiala (empieza con `sk-ant-`).

## 2. Súbela a Netlify (gratis)
1. Crea una cuenta en https://app.netlify.com
2. Sube esta carpeta a un repositorio de GitHub y en Netlify elige "Add new site → Import from Git"
   (o usa la Netlify CLI: `npm i -g netlify-cli`, luego `netlify deploy --prod` dentro de la carpeta).
3. En Netlify: **Site configuration → Environment variables**, agrega:
   - `ANTHROPIC_API_KEY` = tu clave `sk-ant-...`
   - `JWT_SECRET` = una frase larga y secreta inventada (ej. 40 letras al azar)
   - (Solo si activas la verificación) `RESEND_API_KEY` = clave de https://resend.com (gratis hasta 3.000 correos al mes). Sirve para mandar el código de verificación al correo.
   - `EMAIL_FROM` = remitente, ej. `¿Y si te escribo? <hola@tudominio.com>`. Ojo: con la cuenta gratis de Resend, sin dominio propio, solo puedes mandarte correos a ti mismo (remitente `onboarding@resend.dev`). Para mandar a cualquier usuario necesitas verificar un dominio en Resend (un dominio .com cuesta unos 10 USD al año).
   - Opcionales: `AI_MODEL` (por defecto `claude-haiku-5-5`; pon `claude-sonnet-5-5` para respuestas más finas pero más caras) y `DAILY_LIMIT` (usos de IA por usuario al día, por defecto 40).
4. Vuelve a desplegar ("Deploys → Trigger deploy"). Listo: la app funciona en `https://tu-sitio.netlify.app`.

Los datos (cuentas, crushes, favoritos, XP) se guardan en Netlify Blobs, incluido en el plan gratis.

## Verificación por correo (apagada)
Ahora cualquiera entra solo con correo y contraseña, sin código.
Si algún día quieres pedir código por correo, agrega en Netlify `REQUIRE_EMAIL_VERIFY=1` y configura `RESEND_API_KEY` y `EMAIL_FROM` (ver arriba). El código ya está listo.

## 3. Play Store (Android)
La app ya es una PWA (instalable). Para la Play Store:
1. Entra a https://www.pwabuilder.com y pega la URL de tu sitio.
2. Elige "Package for stores → Android" y descarga el paquete (.aab).
3. Crea una cuenta de desarrollador en Google Play Console (pago único de 25 USD) y sube el .aab.
4. Sigue las instrucciones de PWABuilder para el archivo `assetlinks.json` (va en `public/.well-known/`).

## 4. App Store (iPhone)
Apple pide cuenta de desarrollador (99 USD/año) y suele rechazar apps que son "solo una web".
Mientras tanto, en iPhone se puede instalar desde Safari: Compartir → "Agregar a inicio".

## Antes de publicar en tiendas
- Necesitas una página de **Política de privacidad** (las tiendas la piden) que explique que se guardan correo, notas y que las capturas se envían a la IA para analizarlas.
- Pon la clasificación de edad en 17+ / Adultos: es una app de citas y coqueteo.
