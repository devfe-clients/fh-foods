import {useBrand} from './brand';
import {Link} from '@tanstack/react-router';
import {ShoppingBag,Flame,ArrowUpRight} from 'lucide-react';
import {useCart} from './cart-context';
import {Button} from '@/components/ui/button';
export function Header(){const {name,logo}=useBrand();const {items,table}=useCart();return <header className="site-header"><Link to="/" className="wordmark">{logo?<img src={logo} alt="" className="brand-logo"/>:<Flame size={25}/>}<span>{name}<span className="wordmark-sub">SABOREIE DO MELHOR</span></span></Link><nav className="desktop-nav"><Link to="/">O cardápio</Link><Link to="/" hash="montador">Meio a meio</Link>{table&&<Link to="/mesa/$id" params={{id:table.id}}>Comanda · {table.label}</Link>}<Link to="/auth">Área da equipe <ArrowUpRight size={13}/></Link></nav><Button variant="outline" asChild className="bag-link"><Link to="/carrinho"><ShoppingBag size={17}/><span>Seu pedido</span><span className="bag-count">{items.reduce((n,i)=>n+i.quantity,0)}</span></Link></Button></header>}
