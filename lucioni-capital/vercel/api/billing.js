// Lucioni Capital — pagos de Premium.
// Proveedor principal: Mercado Pago (opera en el Perú; suscripciones mensuales en soles). Stripe queda como alternativa para otros países.
// Mercado Pago se activa con: MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET y PREMIUM_PRICE_PEN (por ejemplo 29.90). Opcional: BILLING_PROVIDER=stripe.
// El navegador nunca decide el plan: solo las notificaciones verificadas del proveedor cambian la suscripción,
// y en Mercado Pago el estado se vuelve a consultar en su API antes de aplicarlo.
import crypto from 'node:crypto';
import { send, err, body, rawBody, verify, bearer, readJSON, writeJSON, entitlements, audit, limited, ipOf, TRIAL_DAYS, billingProvider, priceLabel } from '../lib/core.js';

const KEY = process.env.STRIPE_SECRET_KEY || '', PRICE = process.env.STRIPE_PRICE_ID || '', WH = process.env.STRIPE_WEBHOOK_SECRET || '';
const APP_URL = (process.env.APP_URL || 'https://lucioni-capital.vercel.app').replace(/\/$/, '');
const provider = billingProvider, enabled = () => !!provider();

/* ---------- Mercado Pago ---------- */
async function mp(path, payload, method = 'POST') {
  const r = await fetch('https://api.mercadopago.com' + path, { method, headers: { authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN, 'content-type': 'application/json' }, body: method === 'GET' ? undefined : JSON.stringify(payload) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.message || 'mercadopago'), { status: r.status }); return j;
}
/* firma de Mercado Pago: cabecera x-signature "ts=...,v1=..." = HMAC-SHA256 de "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" con la clave secreta */
export function verifyMP(headers, dataId, secret, now = Math.floor(Date.now() / 1000)) {
  const sig = String(headers['x-signature'] || ''), rid = String(headers['x-request-id'] || ''); if (!sig || !secret || !dataId) return false;
  const p = Object.fromEntries(sig.split(',').map(x => x.split('=')).filter(x => x.length === 2).map(([a, b]) => [a.trim(), b.trim()]));
  const ts = p.ts, v1 = p.v1; if (!ts || !v1) return false;
  const tsN = +ts > 1e12 ? Math.floor(+ts / 1000) : +ts; if (!tsN || Math.abs(now - tsN) > 600) return false;
  const want = crypto.createHmac('sha256', secret).update(`id:${String(dataId).toLowerCase()};request-id:${rid};ts:${ts};`).digest('hex');
  return v1.length === want.length && crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(want));
}
/* estado de la suscripción de Mercado Pago → estado del usuario */
async function applyMP(pre) {
  const uid = String(pre.external_reference || ''); if (!/^[a-f0-9]{40}$/.test(uid)) return null;
  const u = await readJSON(`users/${uid}/profile.json`); if (!u) return null;
  const map = { authorized: 'active', paused: 'past_due', cancelled: 'canceled', pending: 'pending' }, st = map[pre.status] || 'canceled';
  const next = pre.next_payment_date ? Date.parse(pre.next_payment_date) : null;
  u.sub = { ...(u.sub || {}), source: 'mercadopago', subscription: pre.id, trialUsed: true, status: st, periodEnd: next || u.sub?.periodEnd || null, price: pre.auto_recurring?.transaction_amount ?? null, currency: pre.auto_recurring?.currency_id || 'PEN' };
  await writeJSON(`users/${uid}/profile.json`, u); await audit(uid, 'subscription_' + st); return u;
}

function form(obj, pre = '', out = []) {
  for (const [k, v] of Object.entries(obj)) { if (v == null) continue; const key = pre ? `${pre}[${k}]` : k;
    if (typeof v === 'object') form(v, key, out); else out.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(v))); }
  return out.join('&');
}
async function stripe(path, params, method = 'POST') {
  const r = await fetch('https://api.stripe.com/v1/' + path, { method, headers: { authorization: 'Bearer ' + KEY, 'content-type': 'application/x-www-form-urlencoded' }, body: method === 'GET' ? undefined : form(params) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.error?.message || 'stripe'), { status: r.status }); return j;
}

/* firma de Stripe: cabecera "t=...,v1=..." = HMAC-SHA256 de "t.cuerpo" con el secreto del webhook; tolerancia de 5 min */
export function verifySig(raw, header, secret, now = Math.floor(Date.now() / 1000)) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(String(header).split(',').map(x => x.split('=')).filter(x => x.length === 2).map(([a, b]) => [a.trim(), b.trim()]));
  const sigs = String(header).split(',').filter(x => x.trim().startsWith('v1=')).map(x => x.trim().slice(3));
  const t = parseInt(parts.t, 10); if (!t || Math.abs(now - t) > 300 || !sigs.length) return false;
  const want = crypto.createHmac('sha256', secret).update(t + '.' + raw.toString('utf8')).digest('hex');
  return sigs.some(s => s.length === want.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(want)));
}

/* aplica el estado de una suscripción de Stripe al usuario */
async function applySub(uid, sub) {
  const u = await readJSON(`users/${uid}/profile.json`); if (!u) return;
  const st = sub.status; // trialing | active | past_due | canceled | unpaid | incomplete | incomplete_expired
  u.sub = { ...(u.sub || {}), source: 'stripe', customer: sub.customer, subscription: sub.id, trialUsed: true,
    status: st === 'trialing' ? 'trialing' : st === 'active' ? (sub.cancel_at_period_end ? 'canceled' : 'active') : st === 'past_due' ? 'past_due' : 'canceled',
    trialEnd: sub.trial_end ? sub.trial_end * 1000 : u.sub?.trialEnd || null, periodEnd: sub.current_period_end ? sub.current_period_end * 1000 : (sub.items?.data?.[0]?.current_period_end || 0) * 1000 || null };
  await writeJSON(`users/${uid}/profile.json`, u); await audit(uid, 'subscription_' + u.sub.status);
}

export default async function handler(req, res) {
  const q = new URL(req.url, 'http://x').searchParams;
  if (req.method === 'GET') return send(res, 200, { enabled: enabled(), provider: provider(), price: priceLabel(), trialDays: TRIAL_DAYS });
  if (req.method !== 'POST') return err(res, 405, 'method', 'Método no permitido.');

  /* ---- notificación de Mercado Pago ---- */
  if (q.get('mp') === '1') {
    if (!process.env.MP_WEBHOOK_SECRET || !process.env.MP_ACCESS_TOKEN) return err(res, 503, 'not_configured', 'Notificaciones sin configurar.');
    const b = await body(req), id = String(b?.data?.id || q.get('data.id') || '').replace(/[^\w-]/g, '');
    if (!verifyMP(req.headers, id, process.env.MP_WEBHOOK_SECRET)) return err(res, 400, 'signature', 'Firma inválida.');
    if (!/preapproval/.test(String(b.type || b.topic || ''))) return send(res, 200, { ok: true, ignored: true });
    let pre; try { pre = await mp('/preapproval/' + id, null, 'GET'); } catch { return err(res, 502, 'mercadopago', 'No se pudo consultar la suscripción.'); }
    await applyMP(pre); return send(res, 200, { ok: true });
  }
  /* ---- webhook de Stripe ---- */
  if (q.get('webhook') === '1') {
    if (!WH) return err(res, 503, 'not_configured', 'Webhook sin configurar.');
    const raw = await rawBody(req);
    if (!verifySig(raw, req.headers['stripe-signature'], WH)) return err(res, 400, 'signature', 'Firma inválida.');
    let ev; try { ev = JSON.parse(raw.toString('utf8')); } catch { return err(res, 400, 'json', 'Cuerpo inválido.'); }
    const seen = `billing/events/${String(ev.id).replace(/[^\w-]/g, '')}.json`;
    if (await readJSON(seen)) return send(res, 200, { ok: true, duplicate: true }); // idempotente
    const o = ev.data?.object || {};
    if (ev.type === 'checkout.session.completed' && o.client_reference_id && o.customer) {
      await writeJSON(`billing/customers/${o.customer}.json`, { uid: o.client_reference_id });
      if (o.subscription && KEY) { const sub = await stripe('subscriptions/' + o.subscription, null, 'GET').catch(() => null); if (sub) await applySub(o.client_reference_id, sub); }
    }
    if (/^customer\.subscription\.(created|updated|deleted)$/.test(ev.type)) {
      const m = await readJSON(`billing/customers/${o.customer}.json`);
      if (m?.uid) await applySub(m.uid, ev.type.endsWith('deleted') ? { ...o, status: 'canceled' } : o);
    }
    if (ev.type === 'invoice.payment_failed') { const m = await readJSON(`billing/customers/${o.customer}.json`); if (m?.uid) await audit(m.uid, 'payment_failed'); }
    await writeJSON(seen, { t: Date.now(), type: ev.type });
    return send(res, 200, { ok: true });
  }

  if (!enabled()) return err(res, 503, 'billing_off', 'Los pagos de Premium aún no están activos. Puedes usar la prueba gratuita de 7 días.');
  const uid = verify(bearer(req)); if (!uid) return err(res, 401, 'session', 'Inicia sesión para continuar.');
  const u = await readJSON(`users/${uid}/profile.json`); if (!u) return err(res, 401, 'session', 'La cuenta ya no existe.');
  const b = await body(req);
  if (limited('bill:' + uid + ipOf(req), 10)) return err(res, 429, 'rate', 'Demasiados intentos. Espera unos minutos.');
  try {
    if (provider() === 'mercadopago') {
      if (b.action === 'checkout') {
        if (entitlements(u).status === 'active') return err(res, 409, 'already', 'Ya tienes Premium activo.');
        const pre = await mp('/preapproval', { reason: 'Lucioni Capital Premium (mensual)', external_reference: uid, payer_email: u.email, back_url: `${APP_URL}/#premium?ok=1`, status: 'pending',
          auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: Math.round(+process.env.PREMIUM_PRICE_PEN * 100) / 100, currency_id: 'PEN' } });
        u.sub = { ...(u.sub || {}), pendingSub: pre.id }; await writeJSON(`users/${uid}/profile.json`, u); await audit(uid, 'checkout_started');
        return send(res, 200, { url: pre.init_point });
      }
      if (b.action === 'cancel_paid') {
        if (u.sub?.source !== 'mercadopago' || !u.sub?.subscription) return err(res, 409, 'no_subscription', 'No tienes una suscripción de pago.');
        const pre = await mp('/preapproval/' + u.sub.subscription, { status: 'cancelled' }, 'PUT'); const nu = await applyMP({ ...pre, status: 'cancelled', external_reference: uid, next_payment_date: pre.next_payment_date || (u.sub.periodEnd ? new Date(u.sub.periodEnd).toISOString() : null) });
        return send(res, 200, { ok: true, sub: nu ? entitlements(nu) : null });
      }
      return err(res, 400, 'action', 'Acción no válida.');
    }
    if (b.action === 'checkout') {
      if (entitlements(u).status === 'active') return err(res, 409, 'already', 'Ya tienes Premium activo.');
      const s = await stripe('checkout/sessions', { mode: 'subscription', client_reference_id: uid, customer_email: u.sub?.customer ? undefined : u.email, customer: u.sub?.customer || undefined,
        line_items: { 0: { price: PRICE, quantity: 1 } }, allow_promotion_codes: 'true',
        subscription_data: u.sub?.trialUsed ? undefined : { trial_period_days: TRIAL_DAYS },
        success_url: `${APP_URL}/#premium?ok=1`, cancel_url: `${APP_URL}/#premium` });
      await audit(uid, 'checkout_started');
      return send(res, 200, { url: s.url });
    }
    if (b.action === 'portal') {
      if (!u.sub?.customer) return err(res, 409, 'no_customer', 'Aún no tienes una suscripción de pago.');
      const s = await stripe('billing_portal/sessions', { customer: u.sub.customer, return_url: `${APP_URL}/#perfil` });
      return send(res, 200, { url: s.url });
    }
    return err(res, 400, 'action', 'Acción no válida.');
  } catch (e) { return err(res, 502, 'payments', 'No se pudo conectar con el sistema de pagos.'); }
}
