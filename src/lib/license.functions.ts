import { createServerFn } from '@tanstack/react-start';
import { requireFirebaseAuth } from '@/integrations/firebase/auth-middleware';
import { z } from 'zod';
import { licenseState } from './license-rules';

export const getLicenseStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const { getDb } = await import('@/lib/firebase-admin');
  const db = getDb();
  const snap = await db.collection('store_license').doc('main').get();
  const license = snap.data();
  return { blocked: !license || license['mode'] === 'suspended' };
});

export const getBilling = createServerFn({ method: 'GET' }).middleware([requireFirebaseAuth]).handler(async ({ context }) => {
  if (!context.isAdmin) throw new Error('Acesso exclusivo da direção');
  const { getDb } = await import('@/lib/firebase-admin');
  const db = getDb();
  const snap = await db.collection('store_license').doc('main').get();
  const license = snap.data();
  if (!license) throw new Error('Não foi possível consultar a assinatura');
  return {
    license,
    status: licenseState(license['mode'], license['due_at'] ?? null),
    operator: false,
    invoices: [],
    audit: [],
    paymentsReady: false as const,
  };
});

export const configureLicense = createServerFn({ method: 'POST' }).middleware([requireFirebaseAuth])
  .inputValidator(input => z.object({ mode: z.enum(['demonstration', 'active', 'suspended']), dueAt: z.string().datetime().nullable(), price: z.number().positive().max(100000), reason: z.string().trim().min(5).max(500) }).refine(v => v.mode !== 'active' || !!v.dueAt, 'Informe o vencimento').parse(input))
  .handler(async ({ data, context }) => {
    if (!context.isAdmin) throw new Error('A licença só pode ser alterada por um operador FH Foods autorizado');
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    await db.collection('store_license').doc('main').update({
      mode: data.mode,
      due_at: data.dueAt ?? null,
      monthly_price: data.price,
    });
    return true;
  });