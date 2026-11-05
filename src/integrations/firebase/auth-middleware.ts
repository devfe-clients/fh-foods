import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';

export const requireFirebaseAuth = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const authorization = getRequestHeader('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) throw new Error('Não autenticado');

  const { getAdminAuth } = await import('@/lib/firebase-admin');
  const decoded = await getAdminAuth().verifyIdToken(token);

  return next({
    context: {
      userId: decoded.uid,
      isAdmin: decoded['admin'] === true,
      isStaff: decoded['staff'] === true,
    },
  });
});