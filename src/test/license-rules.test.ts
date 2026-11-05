import { describe, it, expect } from 'vitest';
import { BASE_MONTHLY_PRICE, licenseState } from '@/lib/license-rules';
describe('assinatura FH Foods', () => {
  const due = '2026-11-10T03:00:00.000Z';
  it('mensalidade base escolhida: R$ 65,90', () => expect(BASE_MONTHLY_PRICE).toBe(65.90));
  it('permite uso durante os três dias de tolerância', () => expect(licenseState('active', due, Date.parse('2026-11-13T02:59:59Z'))).toMatchObject({ blocked: false, state: 'grace' }));
  it('bloqueia ao completar 72 horas de atraso', () => expect(licenseState('active', due, Date.parse('2026-11-13T03:00:00Z'))).toMatchObject({ blocked: true, blocksAt: '2026-11-13T03:00:00.000Z' }));
  it('recusa licença comercial sem vencimento', () => expect(licenseState('active', null).blocked).toBe(true));
  it('suspensão prevalece sobre vencimento futuro', () => expect(licenseState('suspended', '2099-01-01T00:00:00Z').blocked).toBe(true));
  it('demonstração não representa licença paga', () => expect(licenseState('demonstration', null).state).toBe('demonstration'));
});