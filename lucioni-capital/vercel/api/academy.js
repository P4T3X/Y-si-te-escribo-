// Lucioni Academy — lecciones educativas. La ruta avanzada se entrega solo a cuentas Premium o en prueba (verificado aquí).
import { send, err, verify, bearer, readJSON, entitlements } from '../lib/core.js';

const STARTER = [
  { id: 's1', t: 'Qué es invertir', min: 3, body: [
    'Invertir es poner dinero en algo que puede generar ingresos o ganar valor con el tiempo: una parte de una empresa (acción), un préstamo a un gobierno o empresa (bono) o un fondo que reúne muchos de ellos.',
    'A diferencia del ahorro en una cuenta, una inversión puede bajar de valor. A cambio, a largo plazo suele ofrecer más rendimiento que el efectivo. Esa relación entre riesgo y rendimiento esperado es la base de todo lo demás.',
    'Antes de invertir conviene tener un fondo de emergencia (entre 3 y 6 meses de gastos) y no tener deudas caras, como las de tarjeta de crédito.'],
    q: [{ q: '¿Qué conviene tener antes de empezar a invertir?', o: ['Un fondo de emergencia', 'Un préstamo para invertir más', 'Una sola acción de moda'], a: 0, why: 'El fondo de emergencia evita tener que vender inversiones en un mal momento.' },
        { q: 'Una inversión, a diferencia de una cuenta de ahorro…', o: ['Tiene ganancias garantizadas', 'Puede bajar de valor', 'No tiene ningún riesgo'], a: 1, why: 'Todo activo de inversión puede perder valor; por eso se espera un rendimiento mayor.' }] },
  { id: 's2', t: 'Cómo funciona la bolsa', min: 4, body: [
    'La bolsa es un mercado organizado donde compradores y vendedores intercambian acciones, bonos y fondos. Ejemplos: la Bolsa de Nueva York (NYSE), el Nasdaq y la Bolsa de Valores de Lima (BVL).',
    'El precio se forma por oferta y demanda: si hay más interesados en comprar que en vender, el precio sube. Las noticias, los resultados de las empresas y las tasas de interés influyen en esas decisiones.',
    'Para operar necesitas un intermediario autorizado (una sociedad agente de bolsa o un bróker). En Perú, estas entidades son supervisadas por la Superintendencia del Mercado de Valores (SMV).'],
    q: [{ q: '¿Qué determina el precio de una acción en la bolsa?', o: ['El gobierno lo fija cada día', 'La oferta y la demanda', 'El tamaño de la oficina de la empresa'], a: 1, why: 'El precio es el punto en que compradores y vendedores se ponen de acuerdo.' },
        { q: 'En Perú, ¿quién supervisa a las sociedades agentes de bolsa?', o: ['La SMV', 'La SUNAT', 'El INEI'], a: 0, why: 'La Superintendencia del Mercado de Valores supervisa a los intermediarios del mercado de valores.' }] },
  { id: 's3', t: 'Qué son las acciones', min: 3, body: [
    'Una acción es una parte de la propiedad de una empresa. Si compras una acción de una empresa con 1.000 millones de acciones, eres dueño de una milmillonésima parte.',
    'Ganas de dos formas: si el precio sube (ganancia de capital) o si la empresa reparte parte de sus utilidades (dividendos). No todas las empresas pagan dividendos.',
    'Comprar una sola empresa concentra el riesgo: si a esa empresa le va mal, tu inversión lo sufre completa.'],
    q: [{ q: '¿Cuáles son las dos fuentes de ganancia de una acción?', o: ['Intereses fijos y comisiones', 'Subida de precio y dividendos', 'Bonos y depósitos'], a: 1, why: 'El rendimiento de una acción viene de su precio y de los dividendos que reparta.' }] },
  { id: 's4', t: 'ETFs: muchas empresas en una', min: 3, body: [
    'Un ETF (fondo cotizado) es un fondo que compra muchos activos a la vez y cotiza en bolsa como una acción. Por ejemplo, un ETF del S&P 500 reúne a unas 500 grandes empresas de EE. UU.',
    'Su ventaja principal es la diversificación inmediata y, en muchos casos, costos bajos. El costo anual se llama ratio de gastos (expense ratio): un 0,03% significa 3 dólares al año por cada 10.000 invertidos.',
    'Un ETF no elimina el riesgo del mercado: si todo el mercado cae, el ETF también cae.'],
    q: [{ q: 'Un ratio de gastos de 0,10% sobre US$10.000 cuesta al año…', o: ['US$1', 'US$10', 'US$100'], a: 1, why: '0,10% de 10.000 es 10.' },
        { q: '¿Un ETF diversificado puede bajar de valor?', o: ['No, nunca', 'Sí, si cae el mercado', 'Solo los fines de semana'], a: 1, why: 'La diversificación reduce el riesgo de una empresa, no el del mercado completo.' }] },
  { id: 's5', t: 'Riesgo y volatilidad', min: 4, body: [
    'La volatilidad mide cuánto sube y baja el precio de un activo. Se suele expresar como desviación estándar anual de sus rendimientos.',
    'Más volatilidad no significa peor inversión, pero sí caminos más accidentados: un activo con 40% de volatilidad anual puede tener años muy buenos y caídas fuertes.',
    'La caída máxima (drawdown) es la pérdida desde un pico hasta el punto más bajo. Preguntarte si soportarías ver tu cartera caer 30% te ayuda a elegir cuánto riesgo asumir.'],
    q: [{ q: '¿Qué mide la caída máxima (drawdown)?', o: ['La comisión del bróker', 'La pérdida desde un pico hasta el mínimo siguiente', 'El dividendo anual'], a: 1, why: 'El drawdown muestra la peor caída que habrías vivido.' }] },
  { id: 's6', t: 'Diversificar', min: 3, body: [
    'Diversificar es repartir tu dinero entre activos que no se mueven igual: distintas empresas, sectores, países y tipos de activo (acciones, bonos, efectivo).',
    'Funciona porque cuando un activo cae, otro puede mantenerse o subir. Lo que importa es que tengan baja correlación entre ellos.',
    'Tener 10 acciones del mismo sector no es diversificar mucho: suelen caer juntas.'],
    q: [{ q: '¿Qué cartera está mejor diversificada?', o: ['10 bancos peruanos', 'Un ETF global de acciones y uno de bonos', 'Una sola tecnológica'], a: 1, why: 'Combina miles de empresas de varios países con otro tipo de activo.' }] },
  { id: 's7', t: 'Interés compuesto', min: 3, body: [
    'El interés compuesto es ganar rendimiento sobre rendimientos anteriores. Con 7% anual, US$1.000 se convierten en unos US$1.967 en 10 años y en unos US$3.870 en 20 años (1,07^20 ≈ 3,87).',
    'El tiempo es el factor más potente: empezar antes, aunque sea con poco, suele pesar más que aportar mucho más tarde.',
    'Los costos también se componen: una comisión de 2% anual reduce mucho el resultado final frente a una de 0,1%.'],
    q: [{ q: 'US$1.000 al 7% anual compuesto durante 20 años son aproximadamente…', o: ['US$1.140', 'US$2.400', 'US$3.870'], a: 2, why: '1.000 × 1,07^20 ≈ 3.870.' }] },
];

const ADVANCED = [
  { id: 'a1', t: 'Estados financieros en 10 minutos', min: 6, body: [
    'El estado de resultados muestra ingresos, costos y utilidad neta en un período. El balance muestra lo que la empresa tiene (activos), lo que debe (pasivos) y lo que queda para los accionistas (patrimonio). El flujo de caja muestra el dinero que realmente entra y sale.',
    'Una empresa puede tener utilidad contable y aun así quemar caja. Por eso se mira el flujo de caja libre: flujo operativo menos inversiones en activos (capex).',
    'En EE. UU. estos datos se publican en los formularios 10-K (anual) y 10-Q (trimestral) en SEC EDGAR, que es la fuente primaria.'],
    q: [{ q: 'Flujo de caja libre =', o: ['Ingresos − impuestos', 'Flujo operativo − capex', 'Activos − pasivos'], a: 1, why: 'Es la caja que queda después de mantener e invertir en el negocio.' }] },
  { id: 'a2', t: 'Ratios de valoración', min: 6, body: [
    'P/E (precio/utilidad): cuánto pagas por cada dólar de utilidad anual. Un P/E de 20 equivale a un rendimiento de utilidades de 5% (1/20).',
    'PEG = P/E ÷ crecimiento esperado de utilidades (en %). Ajusta el P/E por crecimiento; valores cercanos a 1 se consideran razonables como referencia, no como regla.',
    'EV/EBITDA compara el valor de toda la empresa (capitalización + deuda − caja) con su resultado operativo antes de depreciación. Es útil para comparar empresas con distinta deuda. Ningún ratio sirve solo: compáralo con su historia y con competidores del mismo sector.'],
    q: [{ q: 'Un P/E de 25 implica un rendimiento de utilidades de…', o: ['2,5%', '4%', '25%'], a: 1, why: '1/25 = 0,04 = 4%.' },
        { q: '¿Por qué EV/EBITDA y no solo P/E al comparar empresas?', o: ['Porque incluye la deuda', 'Porque ignora las ventas', 'Porque es más alto'], a: 0, why: 'El valor de empresa suma la deuda neta, así compara negocios con distinta estructura de capital.' }] },
  { id: 'a3', t: 'Flujo de caja descontado (DCF)', min: 7, body: [
    'Un DCF estima el valor de hoy de los flujos de caja futuros. Cada flujo se divide entre (1 + tasa de descuento)^años.',
    'La tasa de descuento refleja el riesgo y el costo de oportunidad (a menudo el WACC). El valor terminal, que resume los flujos después del horizonte proyectado, suele ser la mayor parte del resultado.',
    'Pequeños cambios en el crecimiento o en la tasa cambian mucho el valor: trata un DCF como un rango de escenarios, no como un número exacto.'],
    q: [{ q: 'Si subes la tasa de descuento, el valor del DCF…', o: ['Sube', 'Baja', 'No cambia'], a: 1, why: 'Descontar a una tasa mayor reduce el valor presente de los flujos futuros.' }] },
  { id: 'a4', t: 'Correlación y construcción de carteras', min: 6, body: [
    'La correlación va de −1 a 1 y mide cuánto se mueven juntos dos activos. Combinar activos con correlación baja reduce la volatilidad de la cartera sin reducir en la misma medida el rendimiento esperado.',
    'La volatilidad de una cartera de dos activos depende de sus pesos, de sus volatilidades y de su correlación, no solo del promedio de volatilidades.',
    'Ojo: en las crisis las correlaciones entre acciones tienden a subir, justo cuando más se necesita la diversificación.'],
    q: [{ q: 'Dos activos con correlación −1…', o: ['Se mueven siempre en sentido opuesto', 'Se mueven exactamente igual', 'No tienen relación'], a: 0, why: 'La correlación −1 es una relación inversa perfecta.' }] },
  { id: 'a5', t: 'Riesgo ajustado: Sharpe y drawdown', min: 5, body: [
    'El ratio de Sharpe = (rendimiento de la cartera − tasa libre de riesgo) ÷ volatilidad. Mide cuánto rendimiento extra obtienes por cada unidad de riesgo.',
    'Dos carteras con el mismo rendimiento no son iguales si una tuvo el doble de volatilidad. El Sortino es parecido pero solo penaliza la volatilidad a la baja.',
    'Complementa siempre con la caída máxima: un buen Sharpe histórico no garantiza que el futuro sea igual.'],
    q: [{ q: 'Rendimiento 9%, tasa libre de riesgo 4%, volatilidad 10%: el Sharpe es…', o: ['0,5', '0,9', '1,3'], a: 0, why: '(9 − 4) ÷ 10 = 0,5.' }] },
  { id: 'a6', t: 'Rebalanceo', min: 4, body: [
    'Con el tiempo, los activos que más suben ganan peso y tu cartera se vuelve más riesgosa de lo que elegiste. Rebalancear es volver a los pesos objetivo.',
    'Dos métodos comunes: por calendario (por ejemplo, cada año) o por bandas (cuando un activo se desvía más de ±5 puntos de su objetivo).',
    'Cada venta puede generar impuestos y comisiones; usar los aportes nuevos para comprar lo que quedó bajo es una forma de rebalancear con menos costo.'],
    q: [{ q: '¿Qué hace el rebalanceo con el riesgo de la cartera?', o: ['Lo devuelve al nivel elegido', 'Siempre lo aumenta', 'Lo elimina por completo'], a: 0, why: 'Restaura la mezcla de riesgo que definiste al inicio.' }] },
  { id: 'a7', t: 'Simulación Monte Carlo', min: 5, body: [
    'Una simulación Monte Carlo genera miles de trayectorias posibles con supuestos de rendimiento y volatilidad, y muestra la distribución de resultados.',
    'Sirve para hablar de probabilidades ("en el 90% de los escenarios…") en lugar de una sola cifra. Sus resultados dependen totalmente de los supuestos: si el rendimiento supuesto es optimista, todo el abanico lo será.',
    'Los modelos simples suponen rendimientos normales e independientes; los mercados reales tienen caídas más extremas que eso.'],
    q: [{ q: 'El principal límite de un Monte Carlo es…', o: ['Que es muy lento', 'Que depende de los supuestos que le das', 'Que solo sirve para bonos'], a: 1, why: 'La salida es tan buena como los supuestos de rendimiento, volatilidad y distribución.' }] },
  { id: 'a8', t: 'Gestión del riesgo y tamaño de posición', min: 5, body: [
    'Define antes de comprar cuánto estás dispuesto a perder en una posición. Una regla usada por muchos operadores es no arriesgar más del 1–2% del capital total en una sola idea.',
    'Tamaño de posición = riesgo aceptado en dinero ÷ distancia hasta tu punto de salida (stop). Arriesgar 100 con un stop a 5 por acción da 20 acciones.',
    'Limita la concentración: una sola acción por encima del 10–20% de la cartera domina el resultado total.'],
    q: [{ q: 'Arriesgas US$200 y tu stop está US$4 por debajo de la compra: ¿cuántas acciones?', o: ['20', '50', '800'], a: 1, why: '200 ÷ 4 = 50 acciones.' }] },
];

const strip = l => ({ id: l.id, t: l.t, min: l.min });
export default async function handler(req, res) {
  const q = new URL(req.url, 'http://x').searchParams, track = q.get('track') || 'starter', id = q.get('lesson');
  if (track === 'starter') {
    if (!id) return send(res, 200, { track, lessons: STARTER.map(strip) });
    const l = STARTER.find(x => x.id === id); return l ? send(res, 200, { track, lesson: l }) : err(res, 404, 'nf', 'Lección no encontrada.');
  }
  if (track !== 'advanced') return err(res, 400, 'track', 'Ruta no válida.');
  if (!id) return send(res, 200, { track, lessons: ADVANCED.map(strip), premium: true });
  const uid = verify(bearer(req)); if (!uid) return err(res, 401, 'session', 'Inicia sesión para ver la ruta avanzada.');
  const u = await readJSON(`users/${uid}/profile.json`);
  if (!u || !entitlements(u).limits.academyAdvanced) return err(res, 402, 'premium_required', 'La ruta avanzada es parte de Premium. Puedes probarla gratis 7 días.');
  const l = ADVANCED.find(x => x.id === id); return l ? send(res, 200, { track, lesson: l }) : err(res, 404, 'nf', 'Lección no encontrada.');
}
