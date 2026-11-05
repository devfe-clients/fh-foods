import {createFileRoute} from '@tanstack/react-router';
import {Header} from '@/components/pizzeria/header';
import {Footer} from '@/components/pizzeria/footer';
import {head} from '@/lib/pizza';
export const Route=createFileRoute('/privacidade')({head:()=>head('Política de privacidade','Como a FH Foods coleta, usa e protege seus dados pessoais.'),component:Privacy});
function Privacy(){return <><Header/><main className="page-body legal"><span className="eyebrow text-primary">FH FOODS</span><h1 className="page-title mt-3">Política de privacidade</h1>
<h2>1. Dados coletados</h2><p>Coletamos nome, telefone, endereço de entrega e os itens do pedido, apenas quando você finaliza uma compra.</p>
<h2>2. Finalidade</h2><p>Usamos esses dados para preparar, entregar e acompanhar seu pedido, e para somar pontos de fidelidade ao seu telefone quando o programa estiver ativo.</p>
<h2>3. Compartilhamento</h2><p>Seus dados não são vendidos nem compartilhados com terceiros para publicidade.</p>
<h2>4. Seus direitos (LGPD)</h2><p>Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento, entrando em contato com a pizzaria.</p>
<h2>5. Armazenamento local</h2><p>Guardamos no seu navegador apenas a sua escolha sobre estes termos e o carrinho da sessão atual.</p></main><Footer/></>}
