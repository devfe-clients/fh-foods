import { z } from 'zod';
import { itemSchema, itemPrice } from './pizza';
export type CatalogProduct = Record<string, any> & { id:string; name:string; price:number; active:boolean };
export async function loadCatalog():Promise<{products:CatalogProduct[];settings:Record<string,any>}>{
  const {getDb}=await import('./firebase-admin');const db=getDb();
  const [products,settings]=await Promise.all([db.collection('products').orderBy('sort_order').get(),db.collection('store_settings').doc('main').get()]);
  const st=settings.data();if(!st)throw new Error('Não foi possível carregar o cardápio');
  return {products:products.docs.map(d=>({id:d.id,...d.data()} as CatalogProduct)),settings:st};
}
export function priceLines(products:CatalogProduct[],items:z.infer<typeof itemSchema>[]){return items.map(item=>{
  const first=products.find(p=>p.id===item.productId),second=products.find(p=>p.id===item.secondId),drink=products.find(p=>p.id===item.drinkId);
  if(!first?.active||(item.secondId&&!second?.active)||(item.drinkId&&!drink?.active))throw new Error('Produto indisponível');
  if(second&&(first['category']==='Bebidas'||second['category']==='Bebidas'))throw new Error('Meio a meio disponível apenas para pizzas');
  if(drink&&drink['category']!=='Bebidas')throw new Error('Selecione uma bebida válida');
  return {...item,name:second?`${first.name} + ${second.name}`:first.name,unitPrice:first['category']==='Bebidas'?Number(first.price):itemPrice(Number(first.price),second?Number(second.price):undefined,item.size,item.crust,drink?Number(drink.price):0)};
});}