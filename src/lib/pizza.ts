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

/* ===== Relatórios financeiros (regras puras) ===== */
export type FinOrder={total:number|string;discount?:number|string;created_at:string;status?:string;is_demo?:boolean;delivery_method?:string;items?:unknown;payment_method?:string|null;payment_status?:string;payment_fee?:number|null;inventory_missing?:string[]};
export type FinExpense={amount:number|string;category?:string;spent_on:string};
const WEEKDAYS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
export function financeReport(orders:FinOrder[],expenses:FinExpense[],products:{id:string;cost?:number|string}[],period:string){
  const valid=orders.filter(o=>o.status!=='cancelado');
  const cur=valid.filter(o=>o.created_at.startsWith(period));
  const net=cur.reduce((n,o)=>n+Number(o.total),0);
  const discounts=cur.reduce((n,o)=>n+Number(o.discount??0),0);
  const gross=net+discounts;
  const cost=new Map(products.map(p=>[p.id,Number(p.cost??0)]));
  let cmv=0;const prod:Record<string,{qty:number;revenue:number;margin:number}>={};
  for(const o of cur){if(!Array.isArray(o.items))continue;for(const raw of o.items){const i=raw as Record<string,unknown>;const q=Number(i['quantity']??0),unit=Number(i['unitPrice']??0),c=Number(i['unitCost']??cost.get(String(i['productId']))??0)*q;cmv+=c;const k=String(i['name']??'Item');const r=(prod[k]??={qty:0,revenue:0,margin:0});r.qty+=q;r.revenue+=unit*q;r.margin+=unit*q-c;}}
  const exp=expenses.filter(e=>e.spent_on.startsWith(period));const opex=exp.reduce((n,e)=>n+Number(e.amount),0);
  const byCategory:Record<string,number>={};exp.forEach(e=>{const k=e.category||'Outros';byCategory[k]=(byCategory[k]??0)+Number(e.amount);});
  const profit=net-cmv-opex;
  const weekday=WEEKDAYS.map(name=>({name,total:0,count:0}));const hours=Array.from({length:24},(_,h)=>({hour:h,total:0,count:0}));const days:Record<string,number>={};const channels:Record<string,number>={};
  for(const o of cur){const d=new Date(o.created_at);const t=Number(o.total);const w=weekday[d.getDay()],h=hours[d.getHours()];if(w){w.total+=t;w.count++;}if(h){h.total+=t;h.count++;}const day=o.created_at.slice(0,10);days[day]=(days[day]??0)+t;const ch=o.delivery_method||'outro';channels[ch]=(channels[ch]??0)+t;}
  const months:{month:string;total:number}[]=[];const base=new Date(`${period}-01T12:00:00Z`);for(let i=5;i>=0;i--){const m=new Date(base);m.setUTCMonth(m.getUTCMonth()-i);const key=m.toISOString().slice(0,7);months.push({month:key,total:valid.filter(o=>o.created_at.startsWith(key)).reduce((n,o)=>n+Number(o.total),0)});}
  const sorted=Object.entries(prod).map(([name,v])=>({name,...v})).sort((a,b)=>b.revenue-a.revenue);const totalRev=sorted.reduce((n,p)=>n+p.revenue,0);let acc=0;
  const abc=sorted.map(p=>{acc+=p.revenue;const share=totalRev?acc/totalRev:0;return {...p,cls:(share<=0.8||acc===p.revenue?'A':share<=0.95?'B':'C') as 'A'|'B'|'C'};});
  const prev=months[4]?.total??0;const growth=prev?(net-prev)/prev*100:null;
  const ticket=cur.length?net/cur.length:0;
  const dayList=Object.entries(days).sort((a,b)=>b[1]-a[1]);
  const bestWeekday=[...weekday].sort((a,b)=>b.total-a.total)[0]??{name:'—',total:0,count:0};const worstWeekday=[...weekday].filter(w=>w.count).sort((a,b)=>a.total-b.total)[0];
  const peak=[...hours].sort((a,b)=>b.total-a.total)[0]??{hour:0,total:0,count:0};
  const bestMonth=[...months].sort((a,b)=>b.total-a.total)[0]??{month:period,total:0};
  const insights:string[]=[];
  if(!cur.length)insights.push('Sem vendas no período. Registre pedidos para gerar análises.');
  else{
    if(growth!==null)insights.push(growth>=0?`Faturamento ${growth.toFixed(1)}% acima do mês anterior. Mantenha as ações que funcionaram.`:`Faturamento ${Math.abs(growth).toFixed(1)}% abaixo do mês anterior. Considere um cupom de retorno para clientes inativos.`);
    if(worstWeekday&&worstWeekday.name!==bestWeekday.name)insights.push(`${worstWeekday.name} é o dia mais fraco. Uma promoção exclusiva nesse dia pode equilibrar a semana.`);
    insights.push(`Pico às ${String(peak.hour).padStart(2,'0')}h: reforce a equipe e a massa pronta nesse horário.`);
    const gm=net?(net-cmv)/net*100:0;if(cmv>0&&gm<60)insights.push(`Margem bruta de ${gm.toFixed(1)}%: revise custos de insumos ou preços dos itens de menor margem.`);
    if(gross&&discounts/gross>0.1)insights.push(`Descontos consomem ${(discounts/gross*100).toFixed(1)}% do bruto. Avalie limitar cupons.`);
    if(net&&opex/net>0.4)insights.push(`Despesas representam ${(opex/net*100).toFixed(1)}% da receita. Revise as maiores categorias de gasto.`);
    const low=[...sorted].filter(p=>p.revenue>0).sort((a,b)=>a.margin/a.revenue-b.margin/b.revenue)[0];if(low&&cmv>0)insights.push(`${low.name} tem a menor margem do cardápio.`);
    if(ticket>0)insights.push(`Ticket médio de R$ ${ticket.toFixed(2).replace('.',',')}. Sugira bebida ou borda recheada para aumentá-lo.`);
  }
  return {gross,discounts,net,cmv,opex,profit,margin:net?profit/net*100:0,ticket,count:cur.length,growth,byCategory,weekday,hours,months,abc,channels,bestDay:dayList[0]??null,worstDay:dayList[dayList.length-1]??null,bestWeekday,peak,bestMonth,insights};
}

export function feeTotals(total:number,percentage:number,fixed:number){const fee=Math.min(total,Math.round((total*percentage/100+fixed)*100)/100);return {fee,net:Math.round((total-fee)*100)/100};}
export function breakEven(fixed:number,revenue:number,variableCosts:number,ticket:number){const contribution=revenue>0?(revenue-variableCosts)/revenue:0;const target=contribution>0?Math.round(fixed/contribution*100)/100:null;return {contribution,target,orders:target!==null&&ticket>0?Math.ceil(target/ticket):null};}
export function menuEngineering(rows:{name:string;qty:number;revenue:number;margin:number}[]){const qty=rows.length?rows.reduce((n,r)=>n+r.qty,0)/rows.length:0;const sold=rows.reduce((n,r)=>n+r.qty,0);const margin=sold?rows.reduce((n,r)=>n+r.margin,0)/sold:0;return rows.map(r=>{const popular=r.qty>=qty,profitable=(r.qty?r.margin/r.qty:0)>=margin;return {...r,group:popular?(profitable?'Estrela':'Cavalo de batalha'):(profitable?'Quebra-cabeça':'Baixa rentabilidade')};});}
export function driverBalance(count:number,daily:number,perDelivery:number,collected:number){const payout=Math.round((daily+count*perDelivery)*100)/100;return {payout,collected,balance:Math.round((payout-collected)*100)/100};}
export function inventoryDemand(lines:{productId:string;secondId?:string|null|undefined;drinkId?:string|null|undefined;size:string;quantity:number}[],recipes:{productId:string;size:string;ingredients:{ingredientId:string;quantity:number}[]}[]){const demand=new Map<string,number>();const missing=new Set<string>();for(const l of lines){const portions=[{id:l.productId,size:l.size,q:l.quantity*(l.secondId?.length?0.5:1)},...(l.secondId?[{id:l.secondId,size:l.size,q:l.quantity*0.5}]:[]),...(l.drinkId?[{id:l.drinkId,size:'Grande',q:l.quantity}]:[])];for(const p of portions){const recipe=recipes.find(r=>r.productId===p.id&&r.size===p.size);if(!recipe){missing.add(`${p.id} (${p.size})`);continue;}for(const i of recipe.ingredients)demand.set(i.ingredientId,Math.round(((demand.get(i.ingredientId)??0)+i.quantity*p.q)*1000000)/1000000);}}return {demand:Object.fromEntries(demand),missing:[...missing]};}
export function assertStock(demand:Record<string,number>,stock:Record<string,number>){for(const [id,q] of Object.entries(demand))if(q>(stock[id]??0))throw new Error('Estoque insuficiente para este pedido');}
