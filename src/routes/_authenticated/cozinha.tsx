import {TableCalls} from '@/components/pizzeria/table-bill';
import {createFileRoute,Link} from '@tanstack/react-router';
import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {ArrowLeft,BellRing,Receipt,Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {AutoPrinter} from '@/components/pizzeria/auto-printer';
import {head,kitchenReady,statusLabel,type OrderStatus} from '@/lib/pizza';
import {getAdmin,updateOrder,resolveCall} from '@/lib/admin.functions';
import {getAuthHeader} from '@/lib/firebase-auth-header';
import {withAuth} from '@/lib/with-auth';
import {toast} from 'sonner';
export const Route=createFileRoute('/_authenticated/cozinha')({head:()=>head('Cozinha','Painel de preparo dos pedidos da FH Foods.'),component:Kitchen});
const columns:{key:OrderStatus;title:string}[]=[{key:'recebido',title:'Novos'},{key:'preparando',title:'No forno'},{key:'pronto',title:'Prontos'},{key:'em rota',title:'Em rota'}];
function next(status:string,method:string):OrderStatus|null{if(status==='recebido')return 'preparando';if(status==='preparando')return method==='entrega'?'em rota':'pronto';if(status==='pronto'||status==='em rota')return 'entregue';return null;}
function minutes(since:string){return Math.max(0,Math.floor((Date.now()-new Date(since).getTime())/60000));}
type Json=string|number|boolean|null|{[key:string]:Json|undefined}|Json[];
type KitchenOrder={id:string;number:number;status:string;scheduled_at:string|null;vip:boolean;created_at:string;delivery_method:string;table_id:string|null;customer_name:string;items:Json};
type CallRow={created_at:string;id:string;kind:string;resolved_at:string|null;table_id:string};
type TableRow={active:boolean;created_at:string;current_session_id:string|null;id:string;label:string;session_started_at:string};
type KitchenData={allowed:boolean;orders:KitchenOrder[];calls:CallRow[];tables:TableRow[]};
function Kitchen(){const client=useQueryClient();const fetchAdmin=useServerFn(getAdmin);const save=useServerFn(updateOrder);const resolve=useServerFn(resolveCall);const {data,isPending}=useQuery<KitchenData>({queryKey:['admin'],queryFn:async()=>{const headers=await getAuthHeader();return fetchAdmin({headers}) as unknown as Promise<KitchenData>;},refetchInterval:5000});const m=useMutation({mutationFn:async(a:()=>Promise<unknown>)=>a(),onSuccess:()=>client.invalidateQueries({queryKey:['admin']}),onError:e=>toast.error(e.message)});
if(isPending)return <div className="auth-page">Acendendo o forno…</div>;if(!data?.allowed)return <div className="auth-page"><p>Seu acesso à cozinha ainda não foi liberado.</p></div>;
const tableName=(id:string|null)=>data.tables.find(t=>t.id===id)?.label;
return <div className="kds"><header className="kds-top"><Button variant="ghost" asChild><Link to="/gestao"><ArrowLeft/>Gestão</Link></Button><h1>Cozinha</h1><AutoPrinter/></header><TableCalls calls={data.calls} tables={data.tables}/><div className="kds-board">{columns.map(col=>{const list=data.orders.filter(o=>o.status===col.key&&kitchenReady(o.scheduled_at)).sort((a,b)=>Number(b.vip)-Number(a.vip)||a.created_at.localeCompare(b.created_at));return <section key={col.key} className="kds-col"><h2>{col.title} <span>{list.length}</span></h2>{list.map(o=>{const n=next(o.status,o.delivery_method);const late=minutes(o.created_at)>=25;return <article key={o.id} className={`kds-card${late?' kds-late':''}`}><div className="summary-row"><strong>#{o.number}{o.vip?' · CLUBE VIP':''}</strong><span>{minutes(o.created_at)} min</span></div><p className="text-xs text-muted-foreground">{o.delivery_method==='mesa'?tableName(o.table_id)??'Mesa':o.delivery_method==='entrega'?'Entrega':'Retirada'} · {o.customer_name}</p><ul>{(Array.isArray(o.items)?o.items:[]).map((raw,k)=>{const i=raw as {name?:string;quantity?:number;size?:string;crust?:string;notes?:string};return <li key={k}><strong>{i.quantity}×</strong> {i.name}<small>{i.size} · {i.crust}</small>{i.notes&&<em>{i.notes}</em>}</li>;})}</ul>{n&&<Button className="w-full" onClick={()=>m.mutate(()=>withAuth(h=>save({data:{id:o.id,status:n},headers:h})))}>{statusLabel(n)}</Button>}</article>;})}</section>;})}</div></div>}