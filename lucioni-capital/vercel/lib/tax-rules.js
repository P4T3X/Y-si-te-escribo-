// Lucioni Tax & Compliance — registro de reglas fiscales (educativo).
// Cada regla tiene jurisdicción, base legal, fuente oficial, fecha de vigencia y fecha de revisión.
// status: 'vigente' = verificada en la fecha de revisión; 'verificar' = cambia con frecuencia o tiene plazo de vencimiento:
// la app la muestra sin cifra o como rango y pide confirmarla en la fuente oficial. No se inventan valores.
// Al cambiar una regla: actualizar value/effective, agregar el valor anterior a history, mover reviewed y subir TAX_VERSION.

export const TAX_VERSION = '2026-11-16';
const REV = '2026-11-16';
const SUNAT = 'https://orientacion.sunat.gob.pe';
export const RULES = [
  { id: 'pe-div', jur: 'PE', cat: 'Dividendos', title: 'Dividendos de empresas peruanas a personas naturales domiciliadas', value: 5, unit: '% (retención definitiva)',
    applies: 'Dividendos y otras formas de distribución de utilidades recibidos por personas naturales domiciliadas en el Perú.',
    basis: 'TUO de la Ley del Impuesto a la Renta (D.S. 179-2004-EF), art. 52-A; tasa fijada por el D. Leg. 1261', src: SUNAT, effective: '2017-01-01', reviewed: REV, status: 'vigente',
    history: [{ from: '2015-01-01', to: '2016-12-31', value: 6.8, basis: 'Ley 30296' }, { from: '2003-01-01', to: '2014-12-31', value: 4.1, basis: 'Ley del Impuesto a la Renta' }] },
  { id: 'pe-gain', jur: 'PE', cat: 'Ganancias de capital', title: 'Ganancia por venta de acciones y otros valores (persona natural domiciliada, fuente peruana)', value: 5, unit: '% efectivo sobre la ganancia (6,25% sobre la renta neta, luego de deducir 20%)',
    applies: 'Rentas de capital de segunda categoría por enajenación de valores.',
    basis: 'TUO de la Ley del Impuesto a la Renta, arts. 36 y 52-A', src: SUNAT, effective: '2017-01-01', reviewed: REV, status: 'vigente',
    note: 'Existen exoneraciones temporales para ciertas ventas en la Bolsa de Valores de Lima (Ley 30341 y modificatorias) con requisitos y fechas de vencimiento: verifica su vigencia en SUNAT antes de aplicarlas.', history: [] },
  { id: 'pe-foreign', jur: 'PE', cat: 'Fuente extranjera', title: 'Ganancias y dividendos de fuente extranjera (persona natural domiciliada)', value: null, range: [8, 30], unit: '% (escala progresiva de rentas del trabajo y de fuente extranjera)',
    applies: 'Rentas de fuente extranjera, por ejemplo dividendos y ventas de acciones en bolsas del exterior. Hay excepciones, como valores inscritos en el Registro Público del Mercado de Valores del Perú.',
    basis: 'TUO de la Ley del Impuesto a la Renta, arts. 51 y 53', src: SUNAT, effective: null, reviewed: REV, status: 'verificar',
    note: 'El tratamiento depende del tipo de valor y de dónde se negocia. Se muestra como rango: confirma tu caso con SUNAT o con un contador.', history: [] },
  { id: 'pe-int', jur: 'PE', cat: 'Intereses', title: 'Intereses de depósitos en el sistema financiero peruano (persona natural)', value: null, unit: 'exoneración con plazo de vencimiento',
    applies: 'Intereses de cuentas y depósitos en entidades del sistema financiero nacional.', basis: 'TUO de la Ley del Impuesto a la Renta, art. 19 (exoneraciones prorrogadas periódicamente)', src: SUNAT, effective: null, reviewed: REV, status: 'verificar',
    note: 'Las exoneraciones del art. 19 tienen fecha de término y suelen prorrogarse por ley. Verifica que siga vigente en el año que declaras.', history: [] },
  { id: 'pe-itf', jur: 'PE', cat: 'Transacciones', title: 'Impuesto a las Transacciones Financieras (ITF)', value: 0.005, unit: '% de cada operación gravada',
    applies: 'Depósitos, retiros y transferencias en el sistema financiero, con exoneraciones (por ejemplo, entre cuentas del mismo titular en la misma entidad).', basis: 'Ley 28194 y modificatorias', src: SUNAT, effective: '2011-04-01', reviewed: REV, status: 'vigente', history: [] },
  { id: 'pe-uit-2025', jur: 'PE', cat: 'Unidad Impositiva Tributaria', title: 'UIT 2025', value: 5350, unit: 'soles', applies: 'Valor de referencia para límites, deducciones y tramos durante 2025.',
    basis: 'D.S. 260-2024-EF', src: 'https://busquedas.elperuano.pe', effective: '2025-01-01', reviewed: REV, status: 'vigente', history: [] },
  { id: 'pe-uit-2026', jur: 'PE', cat: 'Unidad Impositiva Tributaria', title: 'UIT 2026', value: null, unit: 'soles', applies: 'Valor de referencia para 2026.',
    basis: 'Decreto supremo que se publica cada diciembre', src: 'https://busquedas.elperuano.pe', effective: '2026-01-01', reviewed: REV, status: 'verificar',
    note: 'Lucioni Capital todavía no registra el valor oficial: ingrésalo desde el decreto publicado en El Peruano para usarlo en tus cálculos.', history: [] },
  { id: 'pe-annual', jur: 'PE', cat: 'Calendario', title: 'Declaración jurada anual del Impuesto a la Renta', value: null, unit: 'fecha según el último dígito del RUC',
    applies: 'Personas naturales obligadas a declarar (por ejemplo, con rentas de capital o de fuente extranjera).', basis: 'Cronograma aprobado cada año por resolución de superintendencia de SUNAT', src: SUNAT, effective: null, reviewed: REV, status: 'verificar',
    note: 'SUNAT publica el cronograma cada año; suele vencer entre fines de marzo e inicios de abril. Registra tu fecha exacta para que el calendario te avise.', history: [] },
  { id: 'us-div', jur: 'US', cat: 'Dividendos', title: 'Retención sobre dividendos de fuente estadounidense a no residentes sin convenio', value: 30, unit: '% retenido en la fuente',
    applies: 'Dividendos de empresas y ETF de EE.UU. pagados a no residentes de países sin convenio tributario con EE.UU. (el Perú no tiene convenio).', basis: 'Internal Revenue Code, secs. 871 y 1441; IRS Publication 515', src: 'https://www.irs.gov/publications/p515', effective: null, reviewed: REV, status: 'vigente', history: [] },
  { id: 'us-gain', jur: 'US', cat: 'Ganancias de capital', title: 'Ganancias de capital de no residentes en EE.UU.', value: 0, unit: '% en EE.UU. por regla general',
    applies: 'Venta de acciones de EE.UU. por no residentes que no estuvieron presentes 183 días o más en EE.UU. en el año.', basis: 'IRS Publication 519 (Nonresident aliens)', src: 'https://www.irs.gov/publications/p519', effective: null, reviewed: REV, status: 'vigente',
    note: 'No pagarlo en EE.UU. no exime de declararlo en el Perú.', history: [] },
  { id: 'us-estate', jur: 'US', cat: 'Herencia', title: 'Impuesto a la herencia de EE.UU. para no residentes', value: 60000, unit: 'US$ de exención sobre activos situados en EE.UU.',
    applies: 'Acciones de empresas de EE.UU. y otros activos situados en EE.UU. de no residentes fallecidos.', basis: 'IRS: Some nonresidents with U.S. assets must file estate tax returns', src: 'https://www.irs.gov/individuals/international-taxpayers/some-nonresidents-with-us-assets-must-file-estate-tax-returns', effective: null, reviewed: REV, status: 'vigente', history: [] },
  { id: 'us-w8', jur: 'US', cat: 'Formularios', title: 'Vigencia del formulario W-8BEN', value: 3, unit: 'años calendario siguientes a la firma',
    applies: 'Formulario que tu bróker pide para certificar que no eres residente en EE.UU.; vence el último día del tercer año calendario siguiente a la firma.', basis: 'IRS: Instructions for Form W-8BEN', src: 'https://www.irs.gov/forms-pubs/about-form-w-8-ben', effective: null, reviewed: REV, status: 'vigente', history: [] },
];
export const CHANGELOG = [{ v: '2026-11-16', text: 'Registro inicial: 12 reglas del Perú y EE.UU. con base legal y fuente oficial.' }];
