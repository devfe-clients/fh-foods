import {useState} from 'react';
import {useQuery,useMutation} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {Star,Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {reviewOrder,reviewState} from '@/lib/operations.functions';
export function OrderReview({id,token,delivered}:{id:string;token:string;delivered:boolean}){
 const call=useServerFn(reviewOrder);const [scores,setScores]=useState({dough:0,temperature:0,flavor:0});const [message,setMessage]=useState('');
 const state=useQuery({queryKey:['review-state',id,token],queryFn:()=>reviewState({data:{orderId:id,token}})});
 const mutation=useMutation({mutationFn:call,onSuccess:()=>state.refetch()});
 if(!state.data)return null;
 if(!delivered)return state.data.scheduledAt?<p className="text-primary mt-6">Agendado para {new Date(state.data.scheduledAt).toLocaleString('pt-BR')}</p>:null;
 if(state.data.reviewed||mutation.isSuccess)return <div className="review-entry mt-8"><Check className="text-success"/><h2 className="text-2xl mt-3">Obrigado pela sua avaliação.</h2><p className="text-sm text-muted-foreground mt-2">Seu recado foi enviado à direção da casa.</p></div>;
 return <form className="admin-section" onSubmit={e=>{e.preventDefault();mutation.mutate({data:{orderId:id,token,...scores,message}});}}><h2>Como foi sua fornada?</h2><p className="text-sm text-muted-foreground mb-5">Avaliação privada para a direção da pizzaria.</p>{([['dough','Ponto da massa'],['temperature','Temperatura'],['flavor','Sabor']] as const).map(([key,label])=><fieldset key={key} className="review-rating"><legend>{label}</legend><div className="flex gap-1">{[1,2,3,4,5].map(n=><Button key={n} type="button" size="icon" variant="ghost" aria-label={`${label}: ${n} estrelas`} aria-pressed={scores[key]===n} onClick={()=>setScores({...scores,[key]:n})}><Star className={n<=scores[key]?'text-primary fill-current':'text-muted-foreground'}/></Button>)}</div></fieldset>)}<label className="field">Recado para a cozinha (opcional)<textarea maxLength={1000} value={message} onChange={e=>setMessage(e.target.value)}/></label>{mutation.error&&<p role="alert" className="form-error">{mutation.error.message}</p>}<Button type="submit" className="mt-5" disabled={mutation.isPending||Object.values(scores).some(s=>s===0)}>{mutation.isPending?'Enviando…':'Enviar avaliação'}</Button></form>;
}