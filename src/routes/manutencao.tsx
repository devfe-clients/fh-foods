import { createFileRoute, Link } from '@tanstack/react-router';
import { Wrench, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { head } from '@/lib/pizza';
export const Route = createFileRoute('/manutencao')({ head: () => ({ ...head('Manutenção temporária', 'O estabelecimento está temporariamente em manutenção.'), meta: [...head('Manutenção temporária', 'O estabelecimento está temporariamente em manutenção.').meta, { name: 'robots', content: 'noindex' }] }), component: Maintenance });
export function Maintenance() {
  return <main className="auth-page"><section className="auth-form"><span className="wordmark">FH FOODS</span><Wrench className="text-primary mt-12" size={36}/><h1>Voltamos em breve.</h1><p>Estamos em manutenção técnica temporária. Agradecemos sua compreensão.</p><Button asChild variant="outline" className="mt-8"><Link to="/auth">Acesso da equipe <ArrowRight/></Link></Button><nav className="flex flex-wrap gap-5 mt-8 text-sm text-muted-foreground"><Link to="/termos">Termos de uso</Link><Link to="/privacidade">Privacidade</Link></nav></section></main>;
}