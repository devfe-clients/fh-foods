import {createFileRoute,Link} from '@tanstack/react-router';
import {useEffect,useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {Button} from '@/components/ui/button';
import {head} from '@/lib/pizza';
export const Route=createFileRoute('/reset-password')({head:()=>head('Redefinir senha','Defina uma nova senha para seu acesso à pizzaria.'),component:Reset});
function Reset(){const [password,setPassword]=useState('');const [recovery,setRecovery]=useState(false);const [message,setMessage]=useState('');useEffect(()=>{setRecovery(window.location.hash.includes('type=recovery'));},[]);return <main className="auth-page"><form className="auth-form" onSubmit={async e=>{e.preventDefault();if(!recovery)return;const {error}=await supabase.auth.updateUser({password});setMessage(error?error.message:'Senha atualizada. Você já pode entrar.');}}><h1>Uma nova senha.</h1>{recovery?<><label className="field">Nova senha<input required type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/></label><Button type="submit">Salvar nova senha</Button></>:<p>Abra o link recebido por e-mail para redefinir sua senha.</p>}<p role="status" className="mt-4">{message}</p><Button asChild variant="link" className="mt-5"><Link to="/auth">Voltar ao acesso</Link></Button></form></main>}
