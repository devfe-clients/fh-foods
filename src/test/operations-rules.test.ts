import {describe,it,expect} from 'vitest';
import {demandEstimate,deliveryFee,platformFee,scheduleValid,kitchenReady,clubCreditValue} from '@/lib/pizza';
describe('operação',()=>{
 it('até 3 pedidos: 25–40 minutos',()=>expect(demandEstimate(3)).toMatchObject({min:25,max:40}));
 it('4 a 7 pedidos: 40–60 minutos',()=>{expect(demandEstimate(4)).toMatchObject({min:40,max:60});expect(demandEstimate(7)).toMatchObject({min:40,max:60});});
 it('8 pedidos: 60–85 minutos',()=>expect(demandEstimate(8)).toMatchObject({min:60,max:85}));
 it('libera para cozinha 35 minutos antes',()=>expect(kitchenReady('2026-10-18T22:00:00Z',new Date('2026-10-18T21:25:00Z').getTime())).toBe(true));
 it('não libera 36 minutos antes',()=>expect(kitchenReady('2026-10-18T22:00:00Z',new Date('2026-10-18T21:24:00Z').getTime())).toBe(false));
 it('agendamento fora do horário é recusado',()=>expect(scheduleValid('2026-10-18T18:00:00Z','18:00','23:00',new Date('2026-10-18T12:00:00Z'))).toBe(false));
 it('agendamento no horário é aceito',()=>expect(scheduleValid('2026-10-18T22:00:00Z','18:00','23:00',new Date('2026-10-18T12:00:00Z'))).toBe(true));
 it('frete grátis no mínimo cadastrado',()=>{expect(deliveryFee(120,10,120)).toBe(0);expect(deliveryFee(119.99,10,120)).toBe(10);});
 it('zero desativa frete grátis por valor',()=>expect(deliveryFee(120,10,0)).toBe(10));
 it('clube com frete grátis não paga taxa',()=>expect(deliveryFee(10,12,0,true)).toBe(0));
});
describe('contrato FH Foods',()=>{
 it('5% da mensalidade por assinante ativo',()=>expect(platformFee([100,80],'per_subscriber',5,999)).toBe(9));
 it('mensalidade fixa não depende da base',()=>expect(platformFee([100,80],'monthly',5,150)).toBe(150));
 it('percentual negociado substitui 5%',()=>expect(platformFee([100,80],'per_subscriber',3,0)).toBe(5.4));
});
describe('cotas de pizza',()=>{
 const products=[{id:'a',price:60},{id:'b',price:80}];
 it('cota cobre pizza grande, não adicionais',()=>expect(clubCreditValue([{productId:'a',size:'Grande',quantity:1,unitPrice:72}],products,['a'])).toEqual({credits:1,discount:60}));
 it('meio a meio exige ambos sabores elegíveis',()=>expect(clubCreditValue([{productId:'a',secondId:'b',size:'Grande',quantity:1,unitPrice:80}],products,['a'])).toEqual({credits:0,discount:0}));
});