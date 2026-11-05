import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { licenseState } from './license-rules';

export const getLicenseStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.rpc('license_allows_operation');
  return { blocked: !!error || data !== true };
});

export const getBilling = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [role, operator] = await Promise.all([
    context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' }),
    context.supabase.from('platform_operators').select('user_id').eq('user_id', context.userId).maybeSingle(),
  ]);
  if (role.error || operator.error || (!role.data && !operator.data)) throw new Error('Acesso exclusivo da direção ou FH Foods');
  const [license, invoices, audit] = await Promise.all([
    context.supabase.from('store_license').select('*').eq('id', 1).single(),
    context.supabase.from('platform_invoices').select('id,amount,due_at,state,method,paid_at,created_at').order('created_at', { ascending: false }).limit(50),
    operator.data ? context.supabase.from('license_audit').select('id,reason,created_at,next_state').order('created_at', { ascending: false }).limit(20) : Promise.resolve({ data: [], error: null }),
  ]);
  if (license.error || invoices.error || audit.error || !license.data) throw new Error('Não foi possível consultar a assinatura');
  return { license: license.data, status: licenseState(license.data.mode, license.data.due_at), operator: !!operator.data, invoices: invoices.data ?? [], audit: audit.data ?? [], paymentsReady: false as const };
});

export const configureLicense = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ mode: z.enum(['demonstration', 'active', 'suspended']), dueAt: z.string().datetime().nullable(), price: z.number().positive().max(100000), reason: z.string().trim().min(5).max(500) }).refine(v => v.mode !== 'active' || !!v.dueAt, 'Informe o vencimento').parse(input))
  .handler(async ({ data, context }) => {
    // PostgreSQL clears irrelevant dates for non-commercial modes. Generated RPC
    // types do not represent nullable arguments, so send a valid sentinel date.
    const { error } = await context.supabase.rpc('configure_store_license', { _mode: data.mode, _due: data.dueAt ?? '1970-01-01T00:00:00.000Z', _price: data.price, _reason: data.reason });
    if (error) throw new Error('A licença só pode ser alterada por um operador FH Foods autorizado');
    return true;
  });