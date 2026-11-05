import {describe,it,expect} from 'vitest';
import {splitBill,customerStats,checkoutSchema,waLink} from '@/lib/pizza';
const item={productId:'00000000-0000-4000-8000-000000000001',size:'Grande' as const,crust:'Tradicional' as const,quantity:1,notes:''};
describe('racha-pizza',()=>{
  it('divide por pessoa',()=>expect(splitBill(89.6,4)).toBe(22.4));
  it('arredonda para cima para a conta fechar',()=>expect(splitBill(100,3)).toBe(33.34));
});
describe('pedido na mesa',()=>{
  it('mesa dispensa telefone e endereço',()=>expect(checkoutSchema.safeParse({name:'Ana Lima',phone:'',address:'',method:'mesa',tableId:'00000000-0000-4000-8000-000000000002',coupon:'',items:[item]}).success).toBe(true));
  it('mesa sem identificação é recusada',()=>expect(checkoutSchema.safeParse({name:'Ana Lima',phone:'',address:'',method:'mesa',coupon:'',items:[item]}).success).toBe(false));
  it('retirada continua exigindo telefone',()=>expect(checkoutSchema.safeParse({name:'Ana Lima',phone:'',address:'',method:'retirada',coupon:'',items:[item]}).success).toBe(false));
});
describe('clientes',()=>{
  it('soma gasto, conta pedidos e ignora cancelados',()=>{const s=customerStats([{phone:'11999990000',customer_name:'Ana',total:50,created_at:'2026-10-01T20:00:00Z',status:'entregue'},{phone:'11999990000',customer_name:'Ana',total:30,created_at:'2026-10-05T20:00:00Z',status:'entregue'},{phone:'11999990000',customer_name:'Ana',total:99,created_at:'2026-10-06T20:00:00Z',status:'cancelado'}],new Date('2026-10-15T20:00:00Z'));expect(s[0]).toMatchObject({orders:2,spent:80,ticket:40,daysAway:10});});
  it('WhatsApp recebe DDI do Brasil',()=>expect(waLink('(11) 99999-0000','oi')).toBe('https://wa.me/5511999990000?text=oi'));
});
