# SerTec Flow — base Kan

Esta cópia local personaliza o Kan para a SerTec Solutions. Não é atualização automática da instalação Plane existente e não inclui migração dos seus dados.

## O que mudou

- Logo oficial SerTec, Outfit e Montserrat locais, cores azul e laranja.
- Página inicial própria, login/cadastro com a marca e apresentação dos planos.
- Português brasileiro como padrão, usando o catálogo atual pt-BR; preservação de preferências de idioma e migração da preferência antiga ptbr.
- Botões, navegação, títulos, ícone, manifesto e criação de espaço personalizados.
- Página /sobre e pacote de código correspondente em /source/sertec-flow-source.zip.
- Funcionalidades de quadros, listas, cartões, comentários, etiquetas e anexos continuam sendo as do Kan; as regras de acesso upstream foram preservadas.

## Ainda não está pronto para vender acesso

A página /planos apresenta R$ 39,90 por mês e R$ 399,90 por ano. Ela informa que as contratações estão indisponíveis. O checkout Mercado Pago, a recorrência no cartão, o Pix manual, o painel de vendas e a regra comercial de um espaço privado por assinante ainda não foram portados do Plane. O Kan permite colaboração e quadros públicos; antes de vender o plano individual é necessário implementar e testar as restrições correspondentes no backend. Não basta esconder botões.

## Desenvolvimento

Use Node compatível com package.json e pnpm 9.14.2. Copie .env.example para .env e configure PostgreSQL, BETTER_AUTH_SECRET e NEXT_PUBLIC_BASE_URL para o ambiente local. Consulte README.md para as demais opções upstream. Não use credenciais de produção nos testes.

```sh
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm dev:next
```

Antes de publicar, execute pnpm lint, pnpm typecheck, pnpm test e pnpm build com dependências e banco de teste disponíveis. Valide cadastro, login por senha/e-mail, recuperação, criação de quadro, movimentação de cartões e autorização entre contas distintas. Não use o banco da instalação atual para esse teste.

## Código-fonte e licença

LICENSE e avisos upstream foram preservados. Esta personalização não transforma o Kan em software proprietário sem obrigações de licença. As fontes têm seus avisos OFL em apps/web/public/fonts. O pacote acessível pela página Sobre é gerado por:

```sh
python tools/package-source.py
```

Gere novamente após qualquer alteração e antes de produzir a imagem de implantação, para que o download corresponda à versão publicada. O script usa o inventário Git e exclui arquivos .env que não sejam exemplos; revise o conteúdo antes de distribuir.

## Implantação

A OVH não foi alterada. Prepare e valide uma instalação separada, com nome de projeto Compose, banco, volumes e porta próprios. A mudança do domínio flow.sertecsolution.com.br e a migração de dados são etapas posteriores. Não execute comandos de limpeza global do Docker.

## Verificações desta entrega

- 12 testes de idioma e middleware passaram com Vitest.
- Catálogos Lingui extraídos e compilados; mensagens novas e pendências do catálogo pt-BR preenchidas.
- Prévia estática das páginas reais inicial/planos inspecionada em 1440 e 390 pixels, sem rolagem horizontal; navegação inicial → planos validada. A prévia usa adaptadores para Next/Lingui, não é teste de login ou backend.
- Instalação pnpm bloqueada por EPERM ao criar links de workspace no Windows. Cópias locais ignoradas pelo Git permitiram executar testes e lint.
- Build Turbopack interrompido pelo worker nativo (3221225501); alternativa webpack interrompida por EPERM ao criar diretórios em .next/server/pages/api. Em nova tentativa, a restrição ocorreu no diretório download. A geração dos tipos de rotas passou; a compilação final precisa de confirmação em Linux.
- Typecheck completo da aplicação passou após as correções; a configuração compartilhada de ESLint também passou na checagem de tipos. O auxiliar de planos de parceiros foi movido para fora da pasta de APIs, corrigindo uma rota inválida.
- Lint dos arquivos alterados: nenhum erro no frontend; permanecem 23 erros preexistentes nas APIs legadas de parceiros (configuração de ambiente e um argumento sem tipo seguro). Essa integração não foi habilitada nem adaptada para Mercado Pago.
- Cadastro, sessão, isolamento entre contas e pagamentos não foram homologados. Esta entrega é uma base de desenvolvimento, não uma publicação pronta para venda.

## Validação em Linux

O workflow **SerTec - validar nova base** (.github/workflows/sertec-validate.yml) prepara dependências, executa os testes, gera o pacote de código correspondente, compila e verifica tipos/lint. Depois de colocar esta cópia em um repositório da SerTec, ele será executado a cada envio para a branch sertec/kan; também possui disparo manual. Ele não publica imagens, não acessa a OVH e não altera bancos de produção. O workflow foi preparado, mas ainda não foi executado no GitHub.
