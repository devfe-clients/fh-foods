export const BASE_MONTHLY_PRICE = 65.90;
export const LICENSE_GRACE_HOURS = 72;
export type LicenseMode = 'demonstration' | 'active' | 'suspended';
export function licenseState(mode: string, dueAt: string | null, now = Date.now()) {
  if (mode === 'demonstration') return { blocked: false, state: 'demonstration' as const, blocksAt: null };
  const due = dueAt ? Date.parse(dueAt) : NaN;
  const blocksAt = Number.isFinite(due) ? new Date(due + LICENSE_GRACE_HOURS * 3600000).toISOString() : null;
  if (mode !== 'active' || !blocksAt || now >= Date.parse(blocksAt)) return { blocked: true, state: 'blocked' as const, blocksAt };
  return { blocked: false, state: now >= due ? 'grace' as const : 'active' as const, blocksAt };
}