# Prompt para o Claude — finalizar FH Foods

Você está assumindo o projeto FH Foods. Leia primeiro AGENTS.md, roadmap.md e este documento; examine o código real antes de alterar. Não declare o sistema pronto para produção sem testar os fluxos e verificar infraestrutura. Nunca peça nem grave chaves privadas no chat, repositório ou frontend.

## Produto e decisões do responsável
- Plataforma para estabelecimentos alimentícios, com mensalidade base de R$ 65,90. Não presumir franquia de pedidos, preço de implantação ou planos adicionais: não foram aprovados.
- Este projeto é um modelo atualmente especializado em pizzas. Cada cliente recebe uma cópia e ambiente isolado; personalizações podem divergir. NÃO transformar esta instância em várias lojas sem autorização e isolamento integral de dados.
- Nome da plataforma: FH Foods. Nome/logotipo da loja são configuráveis. Sem emojis, sem balões em volta de palavras. Preserve o visual existente.
- Mensalidades das LOJAS: Mercado Pago, apenas Pix e cartão de crédito. Não confundir com pagamento de pedidos de comida ou com clube de pizzas dos consumidores.
- Após exatamente 72 horas do vencimento, bloquear operações no servidor e mostrar manutenção técnica ao público, sem divulgar inadimplência. A direção continua acessando assinatura e login.
- Frontend é não confiável: validar identidade, papéis, licença, preço, moeda, vencimento, cupons, créditos, disponibilidade e recursos no servidor/banco.
- Responsável pediu para deixar credenciais e conexões externas para você finalizar. Nenhuma cobrança real foi ativada nesta etapa.

## Stack e funcionalidades existentes
React 19, TanStack Start/Router, Tailwind v4, TypeScript, Zod e Lovable Cloud (PostgreSQL, auth, armazenamento privado e RLS). Execução de servidor em Worker, não servidor Node convencional. Preserve bootstrap e limites server/client. App usa createServerFn para operações internas; callbacks externos ficam em src/routes/api/public/*. Nunca importar cliente privilegiado no topo de módulos acessíveis ao cliente.

Já existem catálogo, montador meio a meio, carrinho/checkout de demonstração, favoritos, divisão de conta, compartilhamento opcional, pedidos/acompanhar status, cozinha, salão/mesas/QR, chamados, conferência e encerramento atômico da comanda, pré-conta não fiscal, avaliações privadas, fidelidade, financeiro, catálogo/mídia, equipe, bairros/taxas, agendamento, fila de impressão e clube demonstrativo. Funcionários acessam pedidos/cozinha; direção acessa financeiro e configurações. Operadores da plataforma são uma allowlist separada.

## O que foi concluído nesta etapa
- Marca pública FH Foods, inclusive nome padrão da loja, mantendo identificações técnicas antigas de armazenamento para não apagar preferências.
- /assinatura (direção e operador), /manutencao, link na gestão. Pix/cartão aparecem desativados e não simulam pagamentos.
- src/lib/license-rules.ts: preço base e tolerância de 72h.
- src/lib/license-middleware.ts: checagem server-side aplicada às funções de catálogo, pedidos, gestão, clube, avaliações e impressão.
- src/lib/license.functions.ts: status público somente booleano, consulta privada de assinatura e configuração exclusiva do operador.
- Banco: store_license, license_audit, platform_invoices; licença em demonstração explícita. configure_store_license é uma alteração atômica com auditoria e checagem da allowlist. Diretor não pode estender a própria licença nem marcar fatura paga.
- license_allows_operation, assert_store_license, políticas restritivas nas tabelas operacionais, guards nas RPCs e gatilhos de escrita inclusive para operações privilegiadas. Datas ausentes de licença comercial falham fechadas.
- Migrações 0008 e 0009; manter histórico e não editar arquivos gerados.
- 44 testes passando. Verificação autenticada: tela R$ 65,90, licença vencida bloqueia / e redireciona /gestao para /assinatura; consulta direta de produtos retorna zero linhas e RPC de status recusa com 42501. Modelo RESTAURADO para demonstração após teste. Auditoria registra a verificação.

## Pendência principal: Mercado Pago completo
Ainda NÃO existem integração de cobrança, endpoint de webhook, agendamento de faturas, confirmação/reconciliação de pagamentos, estornos ou renovação automática. Não é somente colar chaves.

1. Consulte a documentação atual oficial do Mercado Pago. Confirme suporte, tarifas e elegibilidade da conta para Pix e cartão. Pix comum NÃO é débito recorrente automático; confirme disponibilidade específica de Pix Automático antes de prometer recorrência. Se indisponível, emita nova cobrança Pix a cada período; cartão pode usar recorrência somente quando suportada e consentida.
2. Defina com o responsável a conta recebedora da FH Foods, identificação de cada instância e um fluxo seguro de integração. Ambiente isolado por loja não deve exigir que a loja receba a mensalidade da plataforma em sua própria conta. Um serviço central de cobrança é opção futura, não implementado.
3. Guarde credenciais usando o armazenamento seguro/connector suportado, nunca em .env versionado. Só peça public key se realmente necessária para tokenização; access token e segredo de webhook permanecem no servidor. Não peça senha ou service-role key de Cloud: não estão disponíveis ao usuário.
4. Crie emissão de cobrança autenticada, disponível com loja bloqueada apenas para direção/operador. Valor vem da licença/fatura no servidor; moeda BRL; referências vinculadas à instância e período. Não aceite valor, paid/status ou período fornecido pelo navegador.
5. Pix: QR/copia-e-cola, vencimento, status e erro/expiração. Cartão: checkout/tokenização oficial, sem armazenar PAN/CVV. Rejeitar boleto/débito/outros meios. Adequar testes ao produto real do Mercado Pago escolhido.
6. Crie webhook sob /api/public/mercado-pago/webhook com validação da assinatura conforme documentação ATUAL, request-id, timestamp e proteção contra replay. Endpoint público deve verificar autenticidade antes de processar. Nunca ativar endpoint que aceite confirmação sem assinatura. Publicar URL estável somente com consentimento do responsável.
7. Após assinatura válida, consultar pagamento no provedor com credencial server-side. Validar recebedor, referência, método, amount, moeda e status aprovado. Webhook não é prova suficiente sozinho. Atualizar fatura + licença atomicamente, com idempotência por pagamento/evento e período: notificações repetidas não podem acrescentar meses. Definir vencimento por ciclo mensal/calendário (não assumir 30 dias), fuso America/Sao_Paulo e política de atrasos/reembolsos com o responsável.
8. Implementar reconciliação autenticada/agendada para pagamentos perdidos e auditoria. Sem liberar loja por retorno do checkout, query string ou sucesso visual. Eventos inválidos não renovam nada. Tratar chargeback/estorno conforme política comercial aprovada.
9. Cobrir tests: Pix/cartão aprovados, pendente/recusado, adulteração de valor/moeda/referência/recebedor, duplicidade, replay, usuário funcionário, diretor tentando alterar licença, limite das 72h, pagamento enquanto bloqueado e reativação lendo resultado na interface.
10. Só então habilitar botões e substituir paymentsReady=false. Não ligar cobrança real do clube de consumidores junto: isso é outra integração e contrato.

## Outras pendências externas e produção
- Cloudflare/domínio: NÃO configurados. Falta domínio escolhido, acesso do proprietário e publicação. Verificar compatibilidade de DNS/proxy do hosting escolhido; configurar HTTPS, WAF/rate limits conforme plano, proteção de callbacks, logs e regras de cache. Não cachear auth, RPCs, pedidos, licença ou dados pessoais. Não inventar garantia de WAF gratuito, disponibilidade, proteção ilimitada ou segurança absoluta. Cloudflare não substitui validação ou autorização.
- Banco: atual está funcional no Lovable Cloud. Troca para outro PostgreSQL continua aguardando escolha/hospedagem/credenciais. Não foi feita migração para Neon/VPS etc. Trocar banco não é só mudar URL: auth, RLS, RPCs, gatilhos, armazenamento privado e clientes precisam de portabilidade. Preservar transações e isolamento. Usar conexão/pooling compatível com Worker. Fazer backup, migração ensaiada, restauração e rollback antes de produção. Não usar Drizzle ORM: projeto usa migrações SQL e cliente existente.
- Impressão física depende de impressora e navegador da cozinha configurado; fila existente não prova saída física. Pré-conta não é documento fiscal.
- Revisar textos legais com razão social, contato, responsabilidades da loja/FH Foods, retenção, recuperação de carrinhos e consentimentos aplicáveis. Política atual é modelo, não parecer jurídico.
- Segurança e operação: executar auditoria atual de RLS/grants/RPCs/storage, testes de permissões de diretor/funcionário/operador, limites/rate limiting de endpoints públicos, alertas, backups/restore, carga e custos reais. Privacidade de pontos por telefone e recuperação de carrinhos merecem revisão antes de lançamento. URLs de mídia já assinadas podem continuar acessíveis até expirar; bloqueio de licença não revoga arquivos já baixados/cacheados.
- O painel de assinaturas hoje pertence a cada cópia da loja, não existe console central de várias lojas. Se o responsável quiser centralizar cobrança/licenças, planeje serviço de controle verificado entre instâncias; não introduza segredo compartilhado no navegador.

## Forma de trabalho
Descreva o que consegue configurar e o que precisa do responsável; não exponha segredos. Preserve pedidos de demonstração e nunca crie cobranças reais de teste sem aprovação. Teste e informe exatamente o verificado e o pendente. Não diga que bancos, bibliotecas, backend ou Cloudflare impedem 100% das vulnerabilidades/travamentos. O custo mensal de R$ 65,90 tem margem NÃO comprovada: medir um piloto com faturas reais e suporte.