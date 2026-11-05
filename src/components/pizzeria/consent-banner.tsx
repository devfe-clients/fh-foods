import {useEffect,useState} from 'react';
import {Link} from '@tanstack/react-router';
import {Button} from '@/components/ui/button';
const KEY='fhtech-consent';
export function ConsentBanner(){const [show,setShow]=useState(false);useEffect(()=>{if(!localStorage.getItem(KEY))setShow(true);},[]);if(!show)return null;const decide=(v:string)=>{localStorage.setItem(KEY,v);setShow(false);};return <aside className="consent-banner" role="dialog" aria-label="Termos e privacidade"><p>Usamos seus dados apenas para preparar e entregar seus pedidos. Leia os <Link to="/termos">termos de uso</Link> e a <Link to="/privacidade">política de privacidade</Link>.</p><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={()=>decide('recusado')}>Agora não</Button><Button size="sm" onClick={()=>decide('aceito')}>Aceitar</Button></div></aside>}
