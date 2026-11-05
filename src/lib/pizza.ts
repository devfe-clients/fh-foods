import { z } from 'zod';
import pepperoni from '@/assets/pizza-hero.jpg';
import margherita from '@/assets/margherita.jpg';
import calabresa from '@/assets/calabresa.jpg';
export const images: {pepperoni:string;margherita:string;calabresa:string;[key:string]:string} = { pepperoni,margherita,calabresa };
export const money = (value:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
export const head = (title:string,description:string) => ({meta:[{title:`${title} | FH Foods`},{name:'description',content:description},{property:'og:title',content:`${title} | FH Foods`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]});
export const itemSchema = z.object({productId:z.string().min(1),secondId:z.string().min(1).optional(),size:z.enum(['Broto','Grande','Família']),crust:z.enum(['Tradicional','Catupiry','Pão de alho']),drinkId:z.string().min(1).optional(),quantity:z.number().int().min(1).max(20),notes:z.string().max(500)});
export type CartItem = z.infer<typeof itemSchema> & {key:string;name:string;image:string;unitPrice:number};
export const checkoutSchema = z.object({name:z.string().trim().min(3,'Informe seu nome').max(100),phone:z.union([z.string().regex(/^\d{10,11}$/,'Informe um telefone com DDD'),z.literal('')]),address:z.string().trim().max(300),method:z.enum(['retirada','entrega','mesa']),tableId:z.string().min(1).optional(),zoneId:z.string().min(1).optional(),scheduledAt:z.string().datetime().optional(),clubId:z.string().min(1).optional(),clubToken:z.string().min(1).optional(),useClub:z.boolean().default(false),people:z.number().int().min(1).max(30).default(1),coupon:z.string().trim().max(30),redeem:z.boolean().optional(),items:z.array(itemSchema).min(1).max(30)})
  .refine(x=>x.method!=='entrega'||x.address.length>=8,{message:'Informe o endereço completo',path:['address']})
  .refine(x=>x.method==='mesa'||x.phone.length>0,{message:'Informe um telefone com DDD',path:['phone']})
  .refine(x=>x.method!=='mesa'||!!x.tableId,{message:'Mesa não identificada',path:['tableId']});
/** Valor por pessoa, arredondado para cima no centavo para a conta sempre fechar. */
export function splitBill(total:number,people:number){const n=Math.max(1,Math.floor(people));return Math.ceil(Math.round(total*100)/n)/100;}
export function waLink(phone:string,text:string){const digits=phone.replace(/\D/g,'');const to=digits?(digits.length<=11?`55${digits}`:digits):'';return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;}
type OrderLike={phone:string;customer_name:string;total:number|string;created_at:string;status:string};
export function customerStats(orders:OrderLike[],now=new Date()){const map=new Map<string,{phone:string;name:string;orders:number;spent:number;last:string}>();for(const o of orders){if(o.status==='cancelado'||!o.phone)continue;const c=map.get(o.phone)??{phone:o.phone,name:o.customer_name,orders:0,spent:0,last:o.created_at};c.orders++;c.spent=Math.round((c.spent+Number(o.total))*100)/100;if(o.created_at>c.last){c.last=o.created_at;c.name=o.customer_name;}map.set(o.phone,c);}return [...map.values()].map(c=>({...c,ticket:Math.round(c.spent/c.orders*100)/100,daysAway:Math.floor((now.getTime()-new Date(c.last).getTime())/86400000)})).sort((a,b)=>b.spent-a.spent);}
export function itemPrice(first:number,second:number|undefined,size:string,crust:string,drink=0){ const multiplier=size==='Broto'?0.75:size==='Família'?1.25:1; return Math.round((Math.max(first,second??0)*multiplier+(crust==='Catupiry'?12:crust==='Pão de alho'?19.9:0)+drink)*100)/100; }
export function withinHours(opens:string,closes:string,time:string){return opens<=closes?time>=opens&&time<closes:time>=opens||time<closes;}

export const orderSteps=['recebido','preparando','em rota','entregue'] as const;
export const allStatuses=['recebido','preparando','pronto','em rota','entregue','cancelado'] as const;
export type OrderStatus=typeof allStatuses[number];
export const statusLabel=(s:string)=>({recebido:'Pedido confirmado',preparando:'Preparando',pronto:'Pronto para retirada','em rota':'Em rota de entrega',entregue:'Entregue','concluído':'Entregue',cancelado:'Cancelado'} as Record<string,string>)[s]??s;
export function earnedPoints(total:number,perReal:number){return Math.max(0,Math.floor(total*perReal));}
export function redeemable(points:number,rewardPoints:number,enabled:boolean){return enabled&&rewardPoints>0&&points>=rewardPoints;}

export const FAVORITE_KEY='fhtech:favorite';

export const serviceReviewSchema=z.object({orderId:z.string().min(1),token:z.string().min(1),courtesy:z.number().int().min(1).max(5),speed:z.number().int().min(1).max(5),experience:z.number().int().min(1).max(5),message:z.string().trim().max(1000)});
export const settlementSchema=z.object({id:z.string().min(1),sessionId:z.string().min(1),subtotal:z.number().min(0),servicePercentage:z.number().min(0).max(100),people:z.number().int().min(1).max(30)});
export function billTotals(subtotal:number,servicePercentage:number){const service=Math.round(subtotal*servicePercentage)/100;return {subtotal,service,total:Math.round((subtotal+service)*100)/100};}

export function demandEstimate(count:number,mode='auto'){const level=mode==='auto'?(count>=8?'overload':count>=4?'busy':'normal'):mode;return level==='overload'?{min:60,max:85,level}:level==='busy'?{min:40,max:60,level}:{min:25,max:40,level:'normal'};}
export function deliveryFee(subtotal:number,fee:number,freeMinimum:number,clubFree=false){return clubFree||(freeMinimum>0&&subtotal>=freeMinimum)?0:fee;}
export function platformFee(prices:number[],mode:string,percentage:number,monthly:number){return Math.round((mode==='monthly'?monthly:prices.reduce((n,p)=>n+p,0)*percentage/100)*100)/100;}
export function scheduleValid(iso:string,opens:string,closes:string,now=new Date()){const at=new Date(iso);const delta=at.getTime()-now.getTime();if(!Number.isFinite(delta)||delta<60*60000||delta>7*86400000)return false;const time=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',hour12:false}).format(at);return withinHours(opens,closes,time);}
export function kitchenReady(scheduled:string|null,now=Date.now()){return !scheduled||new Date(scheduled).getTime()<=now+35*60000;}
export function clubCreditValue(lines:{productId:string;secondId?:string|undefined;size:string;quantity:number;unitPrice:number}[],products:{id:string;price:number}[],eligible:string[]){let credits=0,discount=0;for(const line of lines){if(line.size!=='Grande'||!eligible.includes(line.productId)||(line.secondId&&!eligible.includes(line.secondId)))continue;const first=products.find(p=>p.id===line.productId);const second=products.find(p=>p.id===line.secondId);if(!first)continue;credits+=line.quantity;discount+=Math.max(Number(first.price),Number(second?.price??0))*line.quantity;}return {credits,discount:Math.round(discount*100)/100};}
