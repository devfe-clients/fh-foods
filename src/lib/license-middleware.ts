import { createMiddleware } from '@tanstack/react-start';

export const licensedOperation = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const { getDb } = await import('@/lib/firebase-admin');
  const db = getDb();
  const snap = await db.collection('store_license').doc('main').get();
  const license = snap.data();
  if (!license || license['mode'] === 'suspended') throw new Error('Estabelecimento em manutenção');
  return next();
});