import { licensedOperation } from './license-middleware';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { checkoutSchema, itemSchema, itemPrice, withinHours, earnedPoints, redeemable, scheduleValid, deliveryFee, clubCreditValue } from './pizza';
type Product = Record<string, any> & { id: string; name: string; price: number; active: boolean };
async function loadCatalog(): Promise<{ products: Product[]; settings: Record<string, any> }> {
  const { getDb } = await import('@/lib/firebase-admin');
  const db = getDb();
  const [productsSnap, settingsSnap] = await Promise.all([
    db.collection('products').orderBy('sort_order').get(),
    db.collection('store_settings').doc('main').get(),
  ]);
  const settings = settingsSnap.data() as Record<string, any>;
  if (!settings) throw new Error('Não foi possível carregar o cardápio');
  const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  return { products, settings };
}
/** Recalcula nome e preço de cada item a partir do catálogo do servidor; nunca confia no valor vindo do navegador. */
function priceLines(products: Product[], items: z.infer<typeof itemSchema>[]) {
  return items.map(item => {
    const first = products.find(p => p.id === item.productId);
    const second = products.find(p => p.id === item.secondId);
    const drink = products.find(p => p.id === item.drinkId);
    if (!first) throw new Error('Produto indisponível');
    if (!first.active || (item.secondId && !second?.active) || (item.drinkId && !drink?.active)) throw new Error('Produto indisponível');
    return { ...item, name: second ? `${first.name} + ${second.name}` : first.name, unitPrice: itemPrice(Number(first.price), second ? Number(second.price) : undefined, item.size, item.crust, drink ? Number(drink.price) : 0) };
  });
}
export const getCatalog = createServerFn({ method: 'GET' }).middleware([licensedOperation]).handler(async () => loadCatalog());
export const placeOrder=createServerFn({method:'POST'}).middleware([licensedOperation]).inputValidator(input=>checkoutSchema.parse(input)).handler(async({data})=>{
 const catalog = await loadCatalog(), st = catalog.settings as Record<string, any>;
 const now=new Date();const time=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
 if(data.scheduledAt){if(!st['scheduling_enabled']||data.method==='mesa'||!scheduleValid(data.scheduledAt,st['opens_at'],st['closes_at'],now))throw new Error('Escolha um horário de funcionamento, entre uma hora e sete dias a partir de agora');}
 else if(!st['demo_mode']&&(!st['is_open']||!withinHours(st['opens_at'],st['closes_at'],time)))throw new Error('A loja está fechada para pedidos imediatos. Escolha um agendamento.');
  const { getDb } = await import('@/lib/firebase-admin');
  const db = getDb();

  if (data.method === 'mesa') {
    if (!st['dine_in_enabled'] || !data.tableId) throw new Error('Mesa indisponível');
    const tableSnap = await db.collection('dining_tables').doc(data.tableId).get();
    if (!tableSnap.data()?.['active']) throw new Error('Mesa indisponível');
  }

  const lines = priceLines(catalog.products, data.items);
  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  let discount = 0, fee = 0, zoneName = '', vip = false;

  // Clube desativado no modo demo simples — ignora useClub
  if (data.coupon) {
    const couponSnap = await db.collection('coupons')
      .where('code', '==', data.coupon.toUpperCase())
      .where('active', '==', true)
      .limit(1)
      .get();
    const c = couponSnap.docs[0]?.data();
    if (!c || subtotal < Number(c['minimum']) || (c['expires_on'] && c['expires_on'] < now.toISOString().slice(0, 10))) {
      throw new Error('Cupom inválido');
    }
    discount = Math.round(subtotal * c['percentage']) / 100;
  }

  if (data.method === 'entrega' && st['delivery_zones_enabled']) {
    if (!data.zoneId) throw new Error('Selecione um bairro atendido');
    const zoneSnap = await db.collection('delivery_zones').doc(data.zoneId).get();
    const zone = zoneSnap.data();
    if (!zone || !zone['active']) throw new Error('Bairro não atendido');
    zoneName = zone['name'];
    fee = deliveryFee(subtotal, Number(zone['fee']), Number(st['free_delivery_minimum']), false);
  }

  const total = Math.round((subtotal - discount + fee) * 100) / 100;

  // Número sequencial simples: conta pedidos existentes + 1
  const countSnap = await db.collection('orders').count().get();
  const orderNumber = (countSnap.data().count ?? 0) + 1;

  const reviewToken = crypto.randomUUID();
  const sanitizedLines = lines.map(line => ({
    ...line,
    secondId: line.secondId ?? null,
    drinkId: line.drinkId ?? null,
    notes: line.notes ?? '',
  }));

  const orderRef = await db.collection('orders').add({
    number: orderNumber,
    customer_name: data.name,
    phone: data.phone,
    address: data.method === 'entrega' ? data.address : '',
    delivery_method: data.method,
    table_id: data.method === 'mesa' ? (data.tableId ?? null) : null,
    dining_session_id: null,
    people: data.people,
    items: sanitizedLines,
    subtotal,
    total,
    discount,
    delivery_fee: fee,
    delivery_zone: zoneName,
    is_demo: st['demo_mode'] ?? true,
    points_earned: 0,
    points_redeemed: 0,
    club_credits_used: 0,
    vip,
    status: 'recebido',
    review_token: reviewToken,
    scheduled_at: data.scheduledAt ?? null,
    created_at: now.toISOString(),
    status_updated_at: now.toISOString(),
  });

  if (data.phone) {
    const draftsSnap = await db.collection('checkout_drafts')
      .where('phone', '==', data.phone).limit(1).get();
    const doc = draftsSnap.docs[0];
    if (doc) {
      await doc.ref.update({ converted: true, updated_at: now.toISOString() });
    }
  }

  return {
    id: orderRef.id,
    number: orderNumber,
    total,
    is_demo: st['demo_mode'] ?? true,
    points_earned: 0,
    people: data.people,
    review_token: reviewToken,
    scheduled_at: data.scheduledAt ?? null,
    delivery_fee: fee,
    club_credits_used: 0,
    lines,
  };
});
export const trackOrder = createServerFn({ method: 'GET' }).middleware([licensedOperation])
  .inputValidator(input => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const snap = await db.collection('orders').doc(data.id).get();
    if (!snap.exists) return null;
    const order = { id: snap.id, ...snap.data() };
    return order;
  });
export const getLoyalty = createServerFn({ method: 'POST' }).middleware([licensedOperation])
  .inputValidator(input => z.object({ phone: z.string().regex(/^\d{10,11}$/) }).parse(input))
  .handler(async ({ data }) => {
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const settingsSnap = await db.collection('store_settings').doc('main').get();
    if (!settingsSnap.data()?.['loyalty_enabled']) return { points: 0 };
    const accSnap = await db.collection('loyalty_accounts')
      .where('phone', '==', data.phone).limit(1).get();
    return { points: accSnap.docs[0]?.data()?.['points'] ?? 0 };
  });
/** Guarda carrinhos que chegaram ao checkout para a equipe recuperar quem desistiu. */
export const saveCheckoutDraft = createServerFn({ method: 'POST' }).middleware([licensedOperation])
  .inputValidator(input => z.object({ name: z.string().trim().max(100), phone: z.string().regex(/^\d{10,11}$/), items: z.array(itemSchema).min(1).max(30) }).parse(input))
  .handler(async ({ data }) => {
    const catalog = await loadCatalog();
    const lines = priceLines(catalog.products, data.items);
    const total = Math.round(lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0) * 100) / 100;
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const existing = await db.collection('checkout_drafts').where('phone', '==', data.phone).limit(1).get();
    const payload = { phone: data.phone, customer_name: data.name, items: lines.map(l => ({ name: l.name, quantity: l.quantity })), total, converted: false, updated_at: new Date().toISOString() };
    const doc = existing.docs[0];
    if (!doc) {
      await db.collection('checkout_drafts').add(payload);
    } else {
      await doc.ref.update(payload);
    }
    return true;
  });
export const createSharedCart = createServerFn({ method: 'POST' }).middleware([licensedOperation])
  .inputValidator(input => z.object({ items: z.array(itemSchema).min(1).max(30) }).parse(input))
  .handler(async ({ data }) => {
    const catalog = await loadCatalog();
    if (!catalog.settings['share_cart_enabled']) throw new Error('Compartilhamento de carrinho desativado');
    priceLines(catalog.products, data.items);
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const ref = await db.collection('shared_carts').add({ items: data.items, created_at: new Date().toISOString() });
    return ref.id;
  });
export const getSharedCart = createServerFn({ method: 'GET' }).middleware([licensedOperation])
  .inputValidator(input => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const catalog = await loadCatalog();
    if (!catalog.settings['share_cart_enabled']) return null;
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const snap = await db.collection('shared_carts').doc(data.id).get();
    if (!snap.exists) return null;
    const row = snap.data();
    const parsed = z.array(itemSchema).safeParse(row?.['items']);
    if (!parsed.success) return null;
    try {
      return priceLines(catalog.products, parsed.data).map(l => {
        const p = catalog.products.find(x => x.id === l.productId);
        if (!p) throw new Error('Produto indisponível');
        return { ...l, key: crypto.randomUUID(), image: (p['image_url'] as string) || '', imageKey: p['image_key'] as string };
      });
    } catch { return null; }
  });
export const getTable = createServerFn({ method: 'GET' }).middleware([licensedOperation])
  .inputValidator(input => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const catalog = await loadCatalog();
    if (!catalog.settings['dine_in_enabled']) return null;
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const tableSnap = await db.collection('dining_tables').doc(data.id).get();
    const table = tableSnap.data();
    if (!table?.['active']) return null;
    const sessionStart: string = table['session_started_at'] ?? '1970-01-01T00:00:00.000Z';
    const [ordersSnap, callsSnap] = await Promise.all([
      db.collection('orders')
        .where('table_id', '==', data.id)
        .where('created_at', '>=', sessionStart)
        .get(),
      db.collection('waiter_calls')
        .where('table_id', '==', data.id)
        .where('resolved_at', '==', null)
        .get(),
    ]);
    const orders = ordersSnap.docs
      .map(d => ({ id: d.id, ...d.data() } as Record<string, any>))
      .filter(o => o['status'] !== 'cancelado')
      .sort((a, b) => a['created_at'] > b['created_at'] ? 1 : -1);
    return {
      id: data.id,
      label: table['label'],
      orders: orders.map(o => ({
        id: o['id'],
        number: o['number'],
        status: o['status'],
        total: Number(o['total']),
        items: (Array.isArray(o['items']) ? o['items'] : []).map((i: Record<string, unknown>) => ({
          name: String(i['name'] ?? ''),
          quantity: Number(i['quantity'] ?? 1),
        })),
      })),
      pending: callsSnap.docs.map(d => d.data()['kind']),
    };
  });
export const callWaiter = createServerFn({ method: 'POST' }).middleware([licensedOperation])
  .inputValidator(input => z.object({ tableId: z.string().min(1), kind: z.enum(['garcom', 'conta']) }).parse(input))
  .handler(async ({ data }) => {
    const catalog = await loadCatalog();
    if (!catalog.settings['dine_in_enabled']) throw new Error('Atendimento na mesa desativado');
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const tableSnap = await db.collection('dining_tables').doc(data.tableId).get();
    const table = tableSnap.data();
    if (!table?.['active']) throw new Error('Mesa indisponível');
    if (data.kind === 'conta' && table['current_session_id']) {
      const sessionSnap = await db.collection('dining_sessions').doc(table['current_session_id']).get();
      if (sessionSnap.exists && !sessionSnap.data()?.['bill_requested_at']) {
        await sessionSnap.ref.update({ bill_requested_at: new Date().toISOString() });
      }
    }
    const openCallsSnap = await db.collection('waiter_calls')
      .where('table_id', '==', data.tableId)
      .where('kind', '==', data.kind)
      .where('resolved_at', '==', null)
      .limit(1)
      .get();
    if (openCallsSnap.empty) {
      await db.collection('waiter_calls').add({ table_id: data.tableId, kind: data.kind, resolved_at: null, created_at: new Date().toISOString() });
    }
    return true;
  });
