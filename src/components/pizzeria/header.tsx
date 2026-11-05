import {useBrand} from './brand';
import {Link} from '@tanstack/react-router';
import {ShoppingBag,Flame,ArrowUpRight,ChefHat,X} from 'lucide-react';
import {useCart} from './cart-context';
import {Button} from '@/components/ui/button';
import {useEffect,useState} from 'react';

type ActiveOrder={id:string;number:number;token:string;createdAt:string};
const ORDER_KEY='fh_active_order';
const TTL_MS=12*60*60*1000;

export function Header(){
  const {name,logo}=useBrand();
  const {items,table}=useCart();
  const [order,setOrder]=useState<ActiveOrder|null>(null);
  const [dismissed,setDismissed]=useState(false);
  useEffect(()=>{
    try{
      const raw=localStorage.getItem(ORDER_KEY);
      if(!raw)return;
      const parsed=JSON.parse(raw) as ActiveOrder;
      if(Date.now()-new Date(parsed.createdAt).getTime()<TTL_MS)setOrder(parsed);
      else localStorage.removeItem(ORDER_KEY);
    }catch{}
  },[]);
  const orderHref=order?`/pedido/${order.id}${order.token?`?avaliacao=${order.token}`:''}`:'/';
  return <>
    {order&&!dismissed&&<div className="active-order-banner"><ChefHat size={15}/><span>Seu pedido <strong>#{order.number}</strong> está em andamento</span><Button variant="link" size="sm" asChild className="active-order-link"><Link to="/pedido/$id" params={{id:order.id}} search={{ avaliacao: order.token || undefined }}
>Acompanhar</Link></Button><button aria-label="Fechar" className="active-order-close" onClick={()=>setDismissed(true)}><X size={13}/></button></div>}
    <header className="site-header"><Link to="/" className="wordmark">{logo?<img src={logo} alt="" className="brand-logo"/>:<Flame size={25}/>}<span>{name}<span className="wordmark-sub">SABOREIE DO MELHOR</span></span></Link><nav className="desktop-nav"><Link to="/">O cardápio</Link><Link to="/" hash="montador">Meio a meio</Link>{table&&<Link to="/mesa/$id" params={{id:table.id}}>Comanda · {table.label}</Link>}<Link to="/auth">Área da equipe <ArrowUpRight size={13}/></Link></nav><Button variant="outline" asChild className="bag-link"><Link to="/carrinho"><ShoppingBag size={17}/><span>Seu pedido</span><span className="bag-count">{items.reduce((n,i)=>n+i.quantity,0)}</span></Link></Button></header>
  </>
}
