import {describe,it,expect} from 'vitest';
import {billTotals,serviceReviewSchema,settlementSchema} from '@/lib/pizza';
describe('conferência de conta',()=>{
 it('serviço opcional desligado preserva o consumo',()=>expect(billTotals(100,0)).toEqual({subtotal:100,service:0,total:100}));
 it('serviço de 10% acrescenta 10 a uma conta de 100',()=>expect(billTotals(100,10)).toEqual({subtotal:100,service:10,total:110}));
 it('encerramento exige a sessão conferida',()=>expect(settlementSchema.safeParse({id:'11111111-1111-4111-8111-111111111111',subtotal:100,servicePercentage:0,people:1}).success).toBe(false));
});
describe('avaliação do salão',()=>{
 const valid={orderId:'11111111-1111-4111-8111-111111111111',token:'22222222-2222-4222-8222-222222222222',courtesy:5,speed:4,experience:3,message:''};
 it('aceita notas de 1 a 5',()=>expect(serviceReviewSchema.safeParse(valid).success).toBe(true));
 it('rejeita nota zero',()=>expect(serviceReviewSchema.safeParse({...valid,courtesy:0}).success).toBe(false));
 it('rejeita nota acima de cinco',()=>expect(serviceReviewSchema.safeParse({...valid,speed:6}).success).toBe(false));
 it('exige token separado do pedido',()=>expect(serviceReviewSchema.safeParse({...valid,token:undefined}).success).toBe(false));
});