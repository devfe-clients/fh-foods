import {createFileRoute,Link} from '@tanstack/react-router';
import {queryOptions,useSuspenseQuery,useQuery,useMutation} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {useEffect,useState} from 'react';
import {auth} from '@/lib/firebase';
import {onAuthStateChanged} from 'firebase/auth';
import {getOperations,myClub,enrollDemoClub} from '@/lib/operations.functions';
import {getCatalog} from '@/lib/pizzeria.functions';
import {head,money} from '@/lib/pizza';
import {Header} from '@/components/pizzeria/header';
import {Footer} from '@/components/pizzeria/footer';
import {Button} from '@/components/ui/button';
import {Check,ArrowRight} from 'lucide-react';
import {getAuthHeader} from '@/lib/firebase-auth-header';

type ClubPlan = {
  id: string;
  name: string;
  monthly_price: number | string;
  pizza_quota: number;
  eligible_product_ids: string[];
  free_delivery: boolean;
  priority: boolean;
};
type ClubSettings = { club_enabled: boolean; demo_mode: boolean };
type OperationsData = { settings: ClubSettings; plans: ClubPlan[]; zones: unknown[] };
type MemberData = { credits: number; period_end: string; is_demo: boolean; id: string; redemption_token: string };
type CatalogProduct = { id: string; name: string; price: number | string };

const options=queryOptions<OperationsData>({queryKey:['operations'],queryFn:()=>getOperations() as unknown as Promise<OperationsData>});
export const Route=createFileRoute('/clube')({head:()=>head('Clube FH Foods','Pizzas mensais, benefícios e os planos do Clube FH Foods.'),loader:({context})=>context.queryClient.ensureQueryData(options),component:Club});
function Club(){const {data}=useSuspenseQuery(options);const [signed,setSigned]=useState(false),[phone,setPhone]=useState('');const mine=useServerFn(myClub),join=useServerFn(enrollDemoClub);useEffect(()=>{return onAuthStateChanged(auth,user=>setSigned(!!user));},[]);const member=useQuery<MemberData|null>({queryKey:['my-club'],queryFn:async()=>{const headers=await getAuthHeader();return mine({headers}) as unknown as Promise<MemberData|null>;},enabled:signed});
const catalog=useQuery<{products:CatalogProduct[]}>({queryKey:['catalog'],queryFn:()=>getCatalog() as unknown as Promise<{products:CatalogProduct[]}>});const mutation=useMutation({mutationFn:join,onSuccess:()=>member.refetch()});return <><Header/><main className="page-body"><span className="eyebrow text-primary">UMA BOA RAZÃO PARA VOLTAR</span><h1 className="page-title mt-4">Clube FH Foods.</h1>{!data.settings.club_enabled?<p className="text-muted-foreground">O clube ainda não está disponível nesta casa.</p>:<>{member.data?<div className="review-entry"><h2 className="text-2xl">Sua próxima fornada está garantida.</h2><p className="mt-3">{member.data.credits} cotas disponíveis · até {new Date(member.data.period_end).toLocaleDateString('pt-BR')}{member.data.is_demo?' · Demonstração sem cobrança':''}</p><Button className="mt-5" asChild><Link to="/">Escolher pizzas <ArrowRight/></Link></Button></div>:<>{signed?<label className="field max-w-sm">Telefone com DDD<input value={phone} type="tel" maxLength={20} onChange={e=>setPhone(e.target.value)}/></label>:<Button variant="outline" asChild><Link to="/auth" onClick={()=>sessionStorage.setItem('fhtech-auth-return','/clube')}>Entrar para participar</Link></Button>}<div className="club-plan-grid mt-8">{data.plans.map(p=>{const eligible=catalog.data?.products.filter(x=>p.eligible_product_ids.includes(x.id))??[];const min=eligible.length?Math.min(...eligible.map(x=>Number(x.price)))*p.pizza_quota:0;return <article className="club-plan" key={p.id}><h2>{p.name}</h2><strong className="text-3xl block mt-4">{money(Number(p.monthly_price))}<small className="text-sm text-muted-foreground"> / mês</small></strong><ul className="my-6 space-y-3 text-sm"><li><Check className="inline mr-2"/>{p.pizza_quota} pizzas grandes por mês</li>{p.free_delivery&&<li><Check className="inline mr-2"/>Frete grátis nos bairros atendidos</li>}{p.priority&&<li><Check className="inline mr-2"/>Prioridade no forno</li>}</ul><p className="text-xs text-muted-foreground">{eligible.map(x=>x.name).join(' · ')}</p>{min>Number(p.monthly_price)&&<p className="text-primary text-sm mt-4">Economia de pelo menos {money(min-Number(p.monthly_price))} nas pizzas.</p>}<p className="text-xs text-muted-foreground mt-4">Pizzas grandes; bordas e bebidas à parte. Cotas não acumulam. Benefícios durante o período ativo, sem acúmulo com cupons ou pontos.</p><Button className="w-full mt-5" disabled={!signed||mutation.isPending||!data.settings.demo_mode||!/^[0-9]{10,11}$/.test(phone.replace(/\D/g,''))} onClick={()=>mutation.mutate({data:{planId:p.id,phone:phone.replace(/\D/g,'')}})}>{data.settings.demo_mode?'Participar da demonstração':'Adesões em breve'}</Button></article>;})}</div>{!data.plans.length&&<p className="empty-state">Os planos estão sendo preparados pela casa.</p>}{data.settings.demo_mode&&<p className="text-xs text-muted-foreground mt-6">Demonstração: nenhuma cobrança ou renovação automática.</p>}</>}{mutation.error&&<p role="alert" className="form-error">{(mutation.error as Error).message}</p>}</>}</main><Footer/></>;
}