import { licensedOperation } from './license-middleware';
import { settlementSchema } from './pizza';
import { createServerFn } from '@tanstack/react-start';
import { requireFirebaseAuth } from '@/integrations/firebase/auth-middleware';
import { z } from 'zod';
const productSchema = z.object({ id: z.string().optional(), name: z.string().trim().min(1).max(100), description: z.string().max(1000), category: z.enum(['Clássicas', 'Autorais', 'Doces', 'Bebidas']), price: z.number().min(0).max(10000), image_key: z.string().max(40), image_url: z.string().max(1000), video_url: z.string().max(1000), cost: z.number().min(0).max(10000).default(0), active: z.boolean(), featured: z.boolean() });
export const getAdmin = createServerFn({ method: 'GET' }).middleware([requireFirebaseAuth, licensedOperation]).handler(async ({ context }) => {
  const isAdmin = context.isAdmin;
  const isStaff = context.isStaff;
  const { getAdminAuth } = await import('@/lib/firebase-admin');
  const userRecord = await getAdminAuth().getUser(context.userId);
  const profile = { id: context.userId, display_name: userRecord.displayName ?? '', email: userRecord.email ?? '' };
  const { getDb } = await import('@/lib/firebase-admin');
  const db = getDb();
  const [tablesSnap, callsSnap] = await Promise.all([
    db.collection('dining_tables').orderBy('label').get(),
    db.collection('waiter_calls').where('resolved_at', '==', null).orderBy('created_at').get(),
  ]);
  const tables = tablesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Record<string, any>));
  const calls = callsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Record<string, any>));
  const empty = { profile, products: [] as Record<string, any>[], orders: [] as Record<string, any>[], expenses: [] as Record<string, any>[], coupons: [] as Record<string, any>[], drafts: [] as Record<string, any>[], tables, calls };  if (!isAdmin && !isStaff) return { allowed: false as const, role: null, ...empty };
  const ordersSnap = await db.collection('orders').orderBy('created_at', 'desc').limit(isAdmin ? 1000 : 200).get();
  const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Record<string, any>));
  if (!isAdmin) return { allowed: true as const, role: 'staff' as const, ...empty, orders };
  const [productsSnap, expensesSnap, couponsSnap, draftsSnap] = await Promise.all([
    db.collection('products').orderBy('sort_order').get(),
    db.collection('expenses').orderBy('spent_on', 'desc').get(),
    db.collection('coupons').get(),
    db.collection('checkout_drafts').where('converted', '==', false).orderBy('updated_at', 'desc').limit(100).get(),
  ]);
  return {
    allowed: true as const,
    role: 'admin' as const,
    profile,
    products: productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Record<string, any>)),
    orders,
    expenses: expensesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Record<string, any>)),
    coupons: couponsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Record<string, any>)),
    drafts: draftsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Record<string, any>)),
    tables,
    calls,
  };
});
function requireDirector(context:{isAdmin:boolean}){if(!context.isAdmin)throw new Error('Apenas diretores podem fazer isso');}
export const listTeam = createServerFn({ method: 'GET' }).middleware([requireFirebaseAuth, licensedOperation]).handler(async ({ context }) => {
  requireDirector(context);
  const { getAdminAuth } = await import('@/lib/firebase-admin');
  const adminAuth = getAdminAuth();
  const listResult = await adminAuth.listUsers(200);
  return listResult.users.map(u => {
    const claims = u.customClaims ?? {};
    return {
      id: u.uid,
      email: u.email ?? '',
      name: u.displayName ?? '',
      role: claims['admin'] ? 'admin' : claims['staff'] ? 'staff' : 'nenhum',
      self: u.uid === context.userId,
    };
  });
});

export const setTeamRole = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ userId: z.string(), role: z.enum(['admin', 'staff', 'nenhum']) }).parse(input))
  .handler(async ({ data, context }) => {
    requireDirector(context);
    if (data.userId === context.userId) throw new Error('Você não pode alterar o próprio acesso');
    const { getAdminAuth } = await import('@/lib/firebase-admin');
    const claims = data.role === 'admin' ? { admin: true, staff: false } : data.role === 'staff' ? { admin: false, staff: true } : { admin: false, staff: false };
    await getAdminAuth().setCustomUserClaims(data.userId, claims);
    return true;
  });
export const saveProduct = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    requireDirector(context);
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const { id, ...values } = data;
    if (id) {
      await db.collection('products').doc(id).set(values, { merge: true });
    } else {
      await db.collection('products').add(values);
    }
    return true;
  });

export const deleteProduct = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    requireDirector(context);
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    await db.collection('products').doc(data.id).delete();
    return true;
  });

export const saveSettings = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ establishment_name: z.string().trim().min(1).max(70), logo_url: z.string().max(1000).refine(v => !v || v.startsWith('https://'), 'Use uma imagem HTTPS'), is_open: z.boolean(), demo_mode: z.boolean(), opens_at: z.string().regex(/^\d{2}:\d{2}$/), closes_at: z.string().regex(/^\d{2}:\d{2}$/), daily_goal: z.number().positive(), monthly_goal: z.number().positive(), loyalty_enabled: z.boolean(), points_per_real: z.number().min(0).max(100), reward_points: z.number().int().min(1), reward_value: z.number().min(0), share_cart_enabled: z.boolean(), dine_in_enabled: z.boolean(), whatsapp_number: z.string().regex(/^\d{0,13}$/) }).parse(input))
  .handler(async ({ data, context }) => {
    requireDirector(context);
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    await db.collection('store_settings').doc('main').update(data);
    return true;
  });

export const saveCoupon = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ id: z.string().optional(), code: z.string().trim().min(2).max(30).transform(s => s.toUpperCase()), percentage: z.number().int().min(1).max(100), minimum: z.number().min(0), active: z.boolean(), expires_on: z.string().nullable() }).parse(input))
  .handler(async ({ data, context }) => {
    requireDirector(context);
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const { id, ...values } = data;
    if (id) {
      await db.collection('coupons').doc(id).set(values, { merge: true });
    } else {
      await db.collection('coupons').add(values);
    }
    return true;
  });

export const addExpense = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ description: z.string().trim().min(1).max(100), category: z.string().max(50), amount: z.number().positive(), spent_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(input))
  .handler(async ({ data, context }) => {
    requireDirector(context);
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    await db.collection('expenses').add({ ...data, created_at: new Date().toISOString() });
    return true;
  });

export const updateOrder = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ id: z.string(), status: z.enum(['recebido', 'preparando', 'pronto', 'em rota', 'entregue', 'cancelado']) }).parse(input))
  .handler(async ({ data, context }) => {
    if (!context.isAdmin && !context.isStaff) throw new Error('Acesso exclusivo da equipe');
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    await db.collection('orders').doc(data.id).update({ status: data.status, status_updated_at: new Date().toISOString() });
    return true;
  });

export const signMedia = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ path: z.string().max(200) }).parse(input))
  .handler(async ({ data, context }) => {
    requireDirector(context);
    // Storage do Firebase não está em uso; retorna a URL direta se já for pública
    if (data.path.startsWith('https://')) return data.path;
    throw new Error('Storage não configurado neste plano');
  });

export const saveTable = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ label: z.string().trim().min(1).max(30) }).parse(input))
  .handler(async ({ data, context }) => {
    requireDirector(context);
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    await db.collection('dining_tables').add({ label: data.label, active: true, current_session_id: null, session_started_at: null });
    return true;
  });

export const deleteTable = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    requireDirector(context);
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    await db.collection('dining_tables').doc(data.id).delete();
    return true;
  });

/** Fecha a comanda: novos pedidos da mesa começam do zero e os chamados abertos são encerrados. */
export const closeTable = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => settlementSchema.parse(input))
  .handler(async ({ data, context }) => {
    requireDirector(context);
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const tableSnap = await db.collection('dining_tables').doc(data.id).get();
    const table = tableSnap.data();
    if (!table) throw new Error('Mesa não encontrada');
    const sessionId = table['current_session_id'];
    if (sessionId) {
      await db.collection('dining_sessions').doc(sessionId).update({
        closed_at: new Date().toISOString(),
        subtotal: data.subtotal,
        service_percentage: data.servicePercentage,
        people: data.people,
      });
    }
    // Reabre a mesa para novos pedidos
    await db.collection('dining_tables').doc(data.id).update({
      current_session_id: null,
      session_started_at: null,
    });
    // Encerra chamados abertos desta mesa
    const callsSnap = await db.collection('waiter_calls')
      .where('table_id', '==', data.id)
      .where('resolved_at', '==', null)
      .get();
    const batch = db.batch();
    for (const doc of callsSnap.docs) {
      batch.update(doc.ref, { resolved_at: new Date().toISOString() });
    }
    await batch.commit();
    return true;
  });

export const getTableBill = createServerFn({ method: 'GET' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!context.isAdmin && !context.isStaff) throw new Error('Acesso exclusivo da equipe');
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const tableSnap = await db.collection('dining_tables').doc(data.id).get();
    const table = tableSnap.data();
    if (!table?.['current_session_id']) throw new Error('Comanda indisponível');
    const [ordersSnap, settingsSnap] = await Promise.all([
      db.collection('orders')
        .where('dining_session_id', '==', table['current_session_id'])
        .orderBy('created_at')
        .get(),
      db.collection('store_settings').doc('main').get(),
    ]);
    const settings = settingsSnap.data();
    const orders = ordersSnap.docs
      .map(d => ({ id: d.id, ...d.data() } as Record<string, any>))
      .filter(o => o['status'] !== 'cancelado');
    return {
      table: { id: data.id, ...table },
      orders,
      subtotal: orders.reduce((n, o) => n + Number(o['total']), 0),
      width: settings?.['paper_width'] ?? 80,
      name: settings?.['establishment_name'] ?? 'FH Foods',
      canClose: context.isAdmin,
    };
  });

export const resolveCall = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth, licensedOperation])
  .inputValidator(input => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!context.isAdmin && !context.isStaff) throw new Error('Acesso exclusivo da equipe');
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    await db.collection('waiter_calls').doc(data.id).update({ resolved_at: new Date().toISOString() });
    return true;
  });
