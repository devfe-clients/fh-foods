import {createFileRoute,Link,useNavigate} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';
import {ArrowRight} from 'lucide-react';
import {Header} from '@/components/pizzeria/header';
import {Footer} from '@/components/pizzeria/footer';
import {Button} from '@/components/ui/button';
import {useCart} from '@/components/pizzeria/cart-context';
import {head,money,images} from '@/lib/pizza';
import {getSharedCart} from '@/lib/pizzeria.functions';
export const Route=createFileRoute('/c/$id')({head:()=>{const h=head('Carrinho compartilhado','Veja o pedido montado e aprove antes de fechar.');return {meta:[...h.meta,{name:'robots',content:'noindex'}]};},component:Shared});
function Shared(){const {id}=Route.useParams();const {replace}=useCart();const navigate=useNavigate();const {data,isPending}=useQuery({queryKey:['shared',id],queryFn:()=>getSharedCart({data:{id}})});
if(isPending)return <><Header/><main className="page-body">Abrindo o carrinho…</main></>;
if(!data)return <><Header/><main className="page-body"><h1 className="page-title">Este link não está disponível.</h1><Button asChild className="mt-6"><Link to="/">Ver o cardápio</Link></Button></main><Footer/></>;
const total=data.reduce((n,i)=>n+i.unitPrice*i.quantity,0);
return <><Header/><main className="page-body"><span className="eyebrow text-primary">MONTADO PARA VOCÊ</span><h1 className="page-title mt-3">Aprova este pedido?</h1><div className="cart-layout"><div>{data.map(i=><article className="cart-line" key={i.key}><img src={i.image||images[i.imageKey]||images.margherita} alt={i.name}/><div><h3>{i.quantity} × {i.name}</h3><p>{i.size} · {i.crust}</p>{i.notes&&<p>{i.notes}</p>}</div><div>{money(i.unitPrice*i.quantity)}</div></article>)}</div><aside className="order-summary"><div className="summary-row text-lg"><span>Total</span><span>{money(total)}</span></div><Button className="w-full mt-6 h-11" onClick={()=>{replace(data.map(({imageKey,...i})=>({...i,image:i.image||images[imageKey]||images.margherita})));navigate({to:'/carrinho'});}}>Aprovar e seguir <ArrowRight/></Button></aside></div></main><Footer/></>}
