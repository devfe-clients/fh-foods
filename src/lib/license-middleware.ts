import { createMiddleware } from '@tanstack/react-start';

// Handler code is server-only; privileged client is never imported at module scope.
export const licensedOperation = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.rpc('license_allows_operation');
  if (error || data !== true) throw new Error('Estabelecimento em manutenção');
  return next();
});