import {describe,it,expect} from 'vitest';
import {itemPrice,checkoutSchema,withinHours} from '@/lib/pizza';
describe('Pizza configuration',()=>{
 it('accepts two flavors in a single pizza',()=>expect(itemPrice(55.9,69.9,'Grande','Tradicional')).toBe(69.9));
 it('adds the garlic crust to the pizza',()=>expect(itemPrice(49.9,undefined,'Grande','Pão de alho')).toBe(69.8));
 it('allows checkout without any payment token',()=>{const result=checkoutSchema.safeParse({name:'Cliente Teste',phone:'11987654321',address:'',method:'retirada',coupon:'',items:[{productId:'10000000-0000-4000-8000-000000000001',size:'Grande',crust:'Tradicional',quantity:1,notes:''}]});expect(result.success).toBe(true);});
});

describe('Order acceptance hours',()=>{it('accepts during configured opening hours',()=>expect(withinHours('18:00','23:00','20:00')).toBe(true));it('refuses outside configured opening hours',()=>expect(withinHours('18:00','23:00','17:00')).toBe(false));});
