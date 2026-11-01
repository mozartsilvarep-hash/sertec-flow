# Sertec Flow — assinaturas individuais

## Planos e telas

- Individual mensal: R$ 39,90, um mês calendário de acesso.
- Individual anual: R$ 399,90, doze meses calendário de acesso.
- `/`: autenticação existente, com identidade Sertec Flow.
- `/assinatura/`: escolha do plano, cartão recorrente ou Pix manual, período disponível, histórico e cancelamento da renovação.
- `/vendas/`: somente administradores da instância; receita bruta no mês, assinantes ativos, pagamentos aprovados e busca/paginação de clientes. Valores sem dados fictícios; taxas não descontadas.

## Configuração do servidor

Aplicar migrações e reconstruir API/web/worker. Em `.env.aapanel`, preencher somente no servidor:

```dotenv
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
MERCADOPAGO_COLLECTOR_ID=
MERCADOPAGO_LIVE_MODE=0
SERTEC_REQUIRE_SUBSCRIPTION=0
```

O collector ID é a identificação da conta vendedora, não a chave pública da aplicação. Nunca enviar credenciais pelo chat nem colocá-las no Git. O checkout fica indisponível enquanto faltarem token, segredo de webhook ou identificação do vendedor. `WEB_URL` deve ser a URL HTTPS pública correta.

Cadastrar `https://flow.sertecsolution.com.br/api/billing/webhook/` em Suas integrações no Mercado Pago. Ativar eventos `payment`, `subscription_preapproval` e `subscription_authorized_payment`. O webhook exige `data.id` na query string e valida `x-signature`/`x-request-id`; consulta o recurso diretamente na API com o token da conta vendedora. O retorno do navegador não libera acesso.

Cartão usa `/preapproval` com status inicial `pending`, checkout hospedado e recorrência mensal/anual. A vinculação do cartão nunca libera acesso sem pagamento aprovado. Pix usa Checkout Pro e compra um período sem renovação automática. A disponibilidade dos métodos e fluxos precisa ser homologada na conta vendedora. Não há coleta de números de cartão nesta aplicação.

Pagamento aprovado deve coincidir com preço contratado, BRL, vendedor e modo teste/produção. Notificações repetidas não estendem o acesso. Estornos e contestações retiram o período relacionado; o histórico é recalculado em ordem de aprovação. Cancelar renovação mantém períodos já pagos. Reembolsos são executados no Mercado Pago, não neste painel.

## Homologação antes de vender

1. Fazer backup do banco, uploads e configuração; aplicar migrações.
2. Usar contas e credenciais de teste do Mercado Pago. Conferir mensal e anual, Pix, cartão, retorno pendente/recusado, primeiro pagamento e renovação.
3. Conferir webhook sem assinatura, duplicado, fora de ordem, pagamento de valor errado, estorno e contestação. Conferir cancelamento e tentativas de outra conta acessar histórico/vendas/espaço.
4. Testar duas contas reais separadas; confirmar ausência de acesso cruzado por API, tokens, links públicos e colaboração ao vivo. Testar o bloqueio de contas vencidas. A funcionalidade comercial não deve ser ativada antes dessas verificações no stack completo.
5. Somente após homologação, configurar credenciais de produção, `MERCADOPAGO_LIVE_MODE=1` e `SERTEC_REQUIRE_SUBSCRIPTION=1`, recriando os containers que usam essas variáveis. Manter o painel de entrega de webhooks monitorado; falhas precisam de reenvio pelo Mercado Pago.

Com `SERTEC_REQUIRE_SUBSCRIPTION=1`, clientes sem período pago recebem HTTP 402 nas APIs do produto e são direcionados à assinatura. Um espaço individual é criado no primeiro pagamento; convites, novas áreas de trabalho e API pública são bloqueados para o uso individual. Administradores da instância mantêm acesso de operação. Instalações anteriores permanecem com o bloqueio desligado até a migração comercial ser validada.

Definir termos comerciais, política de privacidade, contato de suporte e procedimentos de reembolso antes do lançamento. Esses textos não foram inventados.

## Testes

Testes focados podem rodar com as dependências da API e SQLite:

```bash
cd apps/api
DJANGO_SETTINGS_MODULE=plane.billing.tests.settings uv run python -m django test plane.billing.tests --verbosity 2
DJANGO_SETTINGS_MODULE=plane.billing.tests.settings uv run python -m django makemigrations billing --check --dry-run
```

Os testes de cobrança isolam a provisão de Workspace e o papel de administrador; não substituem testes PostgreSQL, autenticação completa, Nginx, MinIO, colaboração ou transações concorrentes de produção.

## Referências oficiais

- https://www.mercadopago.com.br/developers/pt/reference/online-payments/subscriptions/create-preapproval/post
- https://www.mercadopago.com.br/developers/pt/docs/subscriptions/additional-content/your-integrations/notifications/webhooks
