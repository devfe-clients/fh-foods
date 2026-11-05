import { licensedOperation } from './license-middleware';
import { createServerFn } from '@tanstack/react-start';
import { requireFirebaseAuth } from '@/integrations/firebase/auth-middleware';
import { z } from 'zod';
import { demandEstimate, platformFee, serviceReviewSchema } from './pizza';
function director(context:{isAdmin:boolean}){if(!context.isAdmin)throw new Error('Acesso exclusivo da direção');}
export const getOperations = createServerFn({ method: 'GET' }).middleware([licensedOperation]).handler(async () => {
  const { getDb } = await import('@/lib/firebase-admin');
  const db = getDb();
  const [settingsSnap, zonesSnap, activeOrdersSnap] = await Promise.all([
    db.collection('store_settings').doc('main').get(),
    db.collection('delivery_zones').where('active', '==', true).orderBy('name').get(),
    db.collection('orders').where('status', 'in', ['recebido', 'preparando']).get(),
  ]);
  const settings = settingsSnap.data();
  if (!settings) throw new Error('Não foi possível consultar a operação');
  const queueCount = activeOrdersSnap.size;
  return {
    settings,
    zones: zonesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    plans: [],
    wait: demandEstimate(queueCount, settings['demand_mode']),
  };
});
export const getOperationsAdmin = createServerFn({ method: 'GET' }).middleware([requireFirebaseAuth, licensedOperation]).handler(async ({ context }) => {
  director(context);
  const { getDb } = await import('@/lib/firebase-admin');
  const db = getDb();
  const [settingsSnap, zonesSnap, ordersSnap, serviceReviewsSnap, sessionsSnap] = await Promise.all([
    db.collection('store_settings').doc('main').get(),
    db.collection('delivery_zones').orderBy('name').get(),
    db.collection('orders').orderBy('created_at', 'desc').limit(1000).get(),
    db.collection('service_reviews').orderBy('created_at', 'desc').limit(1000).get(),
    db.collection('dining_sessions').orderBy('started_at', 'desc').limit(1000).get(),
  ]);
  return {
    settings: settingsSnap.data(),
    zones: zonesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    plans: [],
    members: [],
    reviews: [],
    serviceReviews: serviceReviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    sessions: sessionsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    jobs: [],
    orders: ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    contract: null,
    operator: false,
    mrr: 0,
    fee: 0,
  };
});
export const saveOperations = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ scheduling_enabled: z.boolean(), delivery_zones_enabled: z.boolean(), free_delivery_minimum: z.number().min(0).max(100000), demand_mode: z.enum(['auto', 'normal', 'busy', 'overload']), club_enabled: z.boolean(), auto_print_enabled: z.boolean(), paper_width: z.union([z.literal(58), z.literal(80)]) }).parse(input))
  .handler(async ({ data, context }) => {
    director(context);
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    await db.collection('store_settings').doc('main').update(data);
    return true;
  });

export const saveZone = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ id: z.string().optional(), name: z.string().trim().min(2).max(80), fee: z.number().min(0).max(1000), active: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    director(context);
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const { id, ...values } = data;
    if (id) {
      await db.collection('delivery_zones').doc(id).set(values, { merge: true });
    } else {
      await db.collection('delivery_zones').add(values);
    }
    return true;
  });
export const savePlan = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ id: z.string().optional(), name: z.string(), monthly_price: z.number(), pizza_quota: z.number(), eligible_product_ids: z.array(z.string()), free_delivery: z.boolean(), priority: z.boolean(), active: z.boolean() }).parse(input))
  .handler(async () => { throw new Error('Clube não disponível nesta versão de demonstração'); });

export const saveContract = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ billing_mode: z.enum(['per_subscriber', 'monthly']), percentage: z.number(), monthly_fee: z.number(), agreed: z.boolean() }).parse(input))
  .handler(async () => { throw new Error('Contrato não disponível nesta versão de demonstração'); });

export const cancelMember = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ id: z.string() }).parse(input))
  .handler(async () => { throw new Error('Clube não disponível nesta versão de demonstração'); });

export const myClub = createServerFn({ method: 'GET' }).middleware([requireFirebaseAuth, licensedOperation])
  .handler(async () => null);

export const enrollDemoClub = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ planId: z.string(), phone: z.string() }).parse(input))
  .handler(async () => { throw new Error('Clube não disponível nesta versão de demonstração'); });
export const reviewOrder = createServerFn({ method: 'POST' }).middleware([licensedOperation])
  .inputValidator(input => z.object({ orderId: z.string(), token: z.string(), dough: z.number().int().min(1).max(5), temperature: z.number().int().min(1).max(5), flavor: z.number().int().min(1).max(5), message: z.string().trim().max(1000) }).parse(input))
  .handler(async ({ data }) => {
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const orderSnap = await db.collection('orders').doc(data.orderId).get();
    const order = orderSnap.data();
    if (!order || order['review_token'] !== data.token) throw new Error('Avaliação já enviada ou pedido ainda não entregue');
    if (order['status'] !== 'entregue') throw new Error('Avaliação disponível somente após a entrega');
    const existingSnap = await db.collection('order_reviews').where('order_id', '==', data.orderId).limit(1).get();
    if (!existingSnap.empty) throw new Error('Avaliação já enviada');
    await db.collection('order_reviews').add({ order_id: data.orderId, dough: data.dough, temperature: data.temperature, flavor: data.flavor, message: data.message, created_at: new Date().toISOString() });
    return true;
  });

export const reviewState = createServerFn({ method: 'GET' }).middleware([licensedOperation])
  .inputValidator(input => z.object({ orderId: z.string(), token: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const orderSnap = await db.collection('orders').doc(data.orderId).get();
    const order = orderSnap.data();
    if (!order || order['review_token'] !== data.token) return null;
    const reviewSnap = await db.collection('order_reviews').where('order_id', '==', data.orderId).limit(1).get();
    const scheduledAt = order['scheduled_at'] ?? null;
    return { reviewed: !reviewSnap.empty, scheduledAt };
  });

export const claimPrint = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ device: z.string() }).parse(input))
  .handler(async () => null);

export const finishPrint = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ job: z.string(), device: z.string(), success: z.boolean() }).parse(input))
  .handler(async () => true);

export const requeuePrint = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ job: z.string() }).parse(input))
  .handler(async () => true);

export const reviewService = createServerFn({ method: 'POST' }).middleware([licensedOperation])
  .inputValidator(input => serviceReviewSchema.parse(input))
  .handler(async ({ data }) => {
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const orderSnap = await db.collection('orders').doc(data.orderId).get();
    const order = orderSnap.data();
    if (!order || order['review_token'] !== data.token || order['delivery_method'] !== 'mesa' || order['status'] === 'cancelado') {
      throw new Error('Avaliação já enviada ou comanda ainda não elegível');
    }
    if (!order['dining_session_id']) throw new Error('Comanda não encontrada');
    const existingSnap = await db.collection('service_reviews').where('session_id', '==', order['dining_session_id']).limit(1).get();
    if (!existingSnap.empty) throw new Error('Avaliação já enviada');
    await db.collection('service_reviews').add({ session_id: order['dining_session_id'], order_id: data.orderId, courtesy: data.courtesy, speed: data.speed, experience: data.experience, message: data.message, created_at: new Date().toISOString() });
    return true;
  });

export const serviceReviewState = createServerFn({ method: 'GET' }).middleware([licensedOperation])
  .inputValidator(input => z.object({ orderId: z.string(), token: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const orderSnap = await db.collection('orders').doc(data.orderId).get();
    const order = orderSnap.data();
    if (!order || order['review_token'] !== data.token || order['delivery_method'] !== 'mesa' || order['status'] === 'cancelado') return null;
    if (!order['dining_session_id']) return null;
    const [sessionSnap, reviewSnap] = await Promise.all([
      db.collection('dining_sessions').doc(order['dining_session_id']).get(),
      db.collection('service_reviews').where('session_id', '==', order['dining_session_id']).limit(1).get(),
    ]);
    const session = sessionSnap.data();
    return { eligible: !!(session?.['bill_requested_at'] || session?.['closed_at']), reviewed: !reviewSnap.empty };
  });