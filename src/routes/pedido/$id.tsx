import {ServiceReview} from '@/components/pizzeria/service-review';
import {createFileRoute,Link} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';
import {Check,ChefHat,Bike,Home,Receipt,X,MessageCircle} from 'lucide-react';
import {Header} from '@/components/pizzeria/header';
import {Footer} from '@/components/pizzeria/footer';
import {Button} from '@/components/ui/button';
import {head,money,statusLabel,waLink} from '@/lib/pizza';
import {OrderReview} from '@/components/pizzeria/order-review';
import {trackOrder,getCatalog} from '@/lib/pizzeria.functions';
export const Route=createFileRoute('/pedido/$id')({validateSearch:(s:Record<string,unknown>)=>({avaliacao:typeof s['avaliacao']==='string'?s['avaliacao']:undefined}),head:()=>({...head('Acompanhe seu pedido','Veja em tempo real o andamento do seu pedido.'),meta:[...head('Acompanhe seu pedido','Veja em tempo real o andamento do seu pedido.').meta,{name:'robots',content:'noindex'}]}),component:Track});
type TrackData={delivery_method:string;status:string;number:number;status_updated_at:string;total:number};
type CatalogSettings={whatsapp_number:string};
type CatalogData={settings:CatalogSettings};
function Track(){const {id}=Route.useParams();const {avaliacao}=Route.useSearch();const token=avaliacao??'';const {data,isPending,error}=useQuery<TrackData>({queryKey:['track',id],queryFn:()=>trackOrder({data:{id}}) as unknown as Promise<TrackData>,refetchInterval:5000});const {data:catalog}=useQuery<CatalogData>({queryKey:['catalog'],queryFn:()=>getCatalog() as unknown as Promise<CatalogData>});
if(isPending)return <><Header/><main className="page-body">Buscando seu pedido…</main></>;
if(error||!data)return <><Header/><main className="page-body"><h1 className="page-title">Pedido não encontrado.</h1><Button asChild className="mt-6"><Link to="/">Voltar ao cardápio</Link></Button></main><Footer/></>;
const delivery=data.delivery_method==='entrega';const steps=[{k:'recebido',icon:Receipt},{k:'preparando',icon:ChefHat},delivery?{k:'em rota',icon:Bike}:{k:'pronto',icon:Home},{k:'entregue',icon:Check}];const st=data.status==='concluído'?'entregue':data.status;const current=steps.findIndex(s=>s.k===st);
if(st==='entregue'||st==='cancelado'){try{const raw=localStorage.getItem('fh_active_order');if(raw&&JSON.parse(raw).id===id)localStorage.removeItem('fh_active_order');}catch{}}
const shareUrl=`${typeof window!=='undefined'?window.location.origin:''}/pedido/${id}`;const shareText=`Olá! Acompanhe comigo meu pedido #${data.number} na FH Foods: ${shareUrl}`;const contactText=`Olá, FH Foods! Tenho uma dúvida sobre o meu pedido #${data.number}.`;
return <><Header/><main className="page-body"><span className="eyebrow text-primary">PEDIDO #{data.number}</span><h1 className="page-title mt-3">{statusLabel(st)}.</h1><p className="text-sm text-muted-foreground mt-3">Atualiza automaticamente · última mudança às {new Date(data.status_updated_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</p>
{st==='cancelado'?<div className="track-card mt-8"><X/> Este pedido foi cancelado pela casa.</div>:<ol className="track-steps">{steps.map((s,i)=><li key={s.k} className={i<=current?'track-done':''} aria-current={i===current?'step':undefined}><span className="track-icon"><s.icon size={20}/></span><strong>{s.k==='entregue'&&!delivery?'Retirado':statusLabel(s.k)}</strong></li>)}</ol>}
<div className="track-card mt-8"><div className="summary-row"><span>{delivery?'Entrega':'Retirada na casa'}</span><span>{money(Number(data.total))}</span></div></div>
<div className="flex flex-wrap gap-3 mt-6"><Button variant="outline" asChild><a href={waLink('',shareText)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/>Enviar no WhatsApp</a></Button>{catalog?.settings.whatsapp_number&&<Button variant="outline" asChild><a href={waLink(catalog.settings.whatsapp_number,contactText)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/>Falar com a pizzaria</a></Button>}</div>
{/^[0-9a-f-]{36}$/i.test(token)&&<><OrderReview id={id} token={token} delivered={st==='entregue'}/><ServiceReview orderId={id} token={token}/></>}</main><Footer/></>}
