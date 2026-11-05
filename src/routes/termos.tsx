import {createFileRoute} from '@tanstack/react-router';
import {Header} from '@/components/pizzeria/header';
import {Footer} from '@/components/pizzeria/footer';
import {head} from '@/lib/pizza';
export const Route=createFileRoute('/termos')({head:()=>head('Termos de uso','Condições para usar o cardápio e fazer pedidos na FH Foods.'),component:Terms});
function Terms(){return <><Header/><main className="page-body legal"><span className="eyebrow text-primary">FH FOODS</span><h1 className="page-title mt-3">Termos de uso</h1>
<h2>1. Sobre o serviço</h2><p>Este cardápio digital permite escolher produtos, montar pizzas e registrar pedidos para retirada ou entrega.</p>
<h2>2. Pedidos</h2><p>Os valores exibidos no carrinho são confirmados no momento do pedido. Pedidos só são aceitos dentro do horário de funcionamento informado pela casa. Durante o período de demonstração, nenhum pagamento é cobrado.</p>
<h2>3. Cupons e fidelidade</h2><p>Cupons e pontos de fidelidade seguem as regras vigentes no momento do pedido, podem ter validade e valor mínimo, e não são convertidos em dinheiro. A casa pode encerrar o programa de fidelidade a qualquer momento.</p>
<h2>4. Responsabilidades</h2><p>O cliente deve informar nome, telefone e endereço corretos. A casa não se responsabiliza por atrasos causados por dados incorretos.</p>
<h2>5. Contato</h2><p>Dúvidas podem ser tratadas diretamente com a pizzaria pelo telefone ou WhatsApp da casa.</p></main><Footer/></>}
