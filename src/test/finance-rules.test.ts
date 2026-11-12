import {describe,it,expect} from 'vitest';
import {financeReport} from '@/lib/pizza';
describe('financeReport',()=>{
  it('DRE: lucro = receita líquida - CMV - despesas, ignora cancelados',()=>{
    const r=financeReport([{total:100,discount:10,created_at:'2026-11-03T20:00:00',items:[{productId:'p',quantity:2,unitPrice:50,name:'X'}]},{total:999,created_at:'2026-11-03T20:00:00',status:'cancelado'}],[{amount:20,spent_on:'2026-11-05'}],[{id:'p',cost:15}],'2026-11');
    expect(r.gross).toBe(110);expect(r.cmv).toBe(30);expect(r.profit).toBe(50);
  });
});
