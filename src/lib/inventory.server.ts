import type { Firestore, Transaction } from 'firebase-admin/firestore';
import { inventoryDemand, assertStock } from './pizza';
import type { Recipe } from './commerce';

type Line = { productId:string; secondId?:string|null|undefined; drinkId?:string|null|undefined; size:string; quantity:number };
/** All reads happen before writes; consumed quantities are saved on the order for exact reversal. */
export async function prepareInventory(db:Firestore,tx:Transaction,lines:Line[],demo:boolean){
  if(demo)return {demand:{} as Record<string,number>,missing:[] as string[],costs:lines.map(()=>null),write:()=>{}};
  const keys=[...new Set(lines.flatMap(l=>[`${l.productId}_${l.size}`,...(l.secondId?[`${l.secondId}_${l.size}`]:[]),...(l.drinkId?[`${l.drinkId}_Grande`]:[])]))];
  const recipes:Recipe[]=[];
  for(const key of keys){const s=await tx.get(db.collection('recipes').doc(key));if(s.exists)recipes.push({id:s.id,...s.data()} as Recipe);}
  const {demand,missing}=inventoryDemand(lines,recipes);const stock:Record<string,number>={},cost:Record<string,number>={};
  for(const key of Object.keys(demand)){const s=await tx.get(db.collection('ingredients').doc(key));if(!s.exists)throw new Error('Insumo da ficha técnica não encontrado');stock[key]=Number(s.data()?.['stock']??0);cost[key]=Number(s.data()?.['unitCost']??0);}
  assertStock(demand,stock);
  const costs=lines.map(l=>{const one=inventoryDemand([{...l,quantity:1}],recipes);return one.missing.length?null:Math.round(Object.entries(one.demand).reduce((n,[id,q])=>n+q*(cost[id]??0),0)*100)/100;});
  return {demand,missing,costs,write:()=>{for(const [key,q] of Object.entries(demand))tx.update(db.collection('ingredients').doc(key),{stock:Math.round(((stock[key]??0)-q)*1000000)/1000000});}};
}