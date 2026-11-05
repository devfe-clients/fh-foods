import {describe,it,expect} from 'vitest';
import {earnedPoints,redeemable} from '@/lib/pizza';
describe('fidelidade',()=>{
 it('1 ponto por real, arredondado para baixo',()=>expect(earnedPoints(69.9,1)).toBe(69));
 it('resgate exige pontos suficientes',()=>{expect(redeemable(99,100,true)).toBe(false);expect(redeemable(100,100,true)).toBe(true);});
 it('programa desativado bloqueia resgate',()=>expect(redeemable(500,100,false)).toBe(false));
});
