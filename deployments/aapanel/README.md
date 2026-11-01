# Sertec Flow na OVH com aaPanel

Cópia da branch preview de mozartsilvarep-hash/sertec-flow, commit b98e1defb0e089d4505712d89ee9e137fd0935cd.
O código e o visual originais foram preservados. A aplicação ainda contém a marca Plane.
A configuração adicional constrói as imagens a partir deste código, sem substituir a aplicação por imagens prontas do Plane.

## Preparação

Servidor Linux com Docker Engine, plugin Docker Compose v2, OpenSSL e aaPanel com Nginx. O build inclui várias aplicações Node, Python e Go; reserve recursos e espaço para as imagens. Capacidade necessária deve ser medida com sua carga real.
Aponte o DNS do domínio para a OVH. No aaPanel, crie o site com esse domínio, configure o certificado HTTPS e o redirecionamento HTTP para HTTPS.

Extraia o pacote em /opt/sertec-flow. Execute no terminal do servidor:

```bash
cd /opt/sertec-flow
bash deployments/aapanel/configure.sh flow.sertecsolution.com.br
docker compose --env-file .env.aapanel -f docker-compose.aapanel.yml config --quiet
docker compose --env-file .env.aapanel -f docker-compose.aapanel.yml build
docker compose --env-file .env.aapanel -f docker-compose.aapanel.yml up -d plane-db plane-redis plane-mq plane-minio
docker compose --env-file .env.aapanel -f docker-compose.aapanel.yml run --rm migrator
docker compose --env-file .env.aapanel -f docker-compose.aapanel.yml up -d
docker compose --env-file .env.aapanel -f docker-compose.aapanel.yml ps
```

Use seu domínio real no primeiro comando. O gerador não sobrescreve um arquivo existente.
As senhas ficam em .env.aapanel; preserve esse arquivo com acesso restrito e fora do Git.

## Proxy do aaPanel

Use deployments/aapanel/nginx.conf no bloco HTTPS do domínio. Substitua o location / existente, valide o Nginx e recarregue pelo painel. Não abra a porta 8088 no firewall: ela está vinculada a 127.0.0.1. O proxy interno distribui /api, /auth, /god-mode, /spaces, /live e uploads aos serviços corretos. WebSocket precisa dos headers do exemplo.

## Primeiro acesso e conferência

Acesse https://SEU-DOMINIO/god-mode/ e conclua a configuração inicial da instância. Configure SMTP na administração para convites e recuperação de senha. Verifique login, criação de projeto, upload/download e colaboração em duas sessões.
Se houver erro, consulte:

```bash
docker compose --env-file .env.aapanel -f docker-compose.aapanel.yml logs --tail=100 api worker live proxy
curl -I -H 'Host: SEU-DOMINIO' http://127.0.0.1:8088/
```

Faça backup do PostgreSQL, volumes de uploads e arquivo de configuração antes de atualizações. Não execute down -v em uma instalação com dados: esse comando remove volumes.

## Estado da validação

Código baixado e configuração adicional revisada estaticamente. Este ambiente de preparação não tem Docker; build, migrações, Nginx e fluxo funcional ainda precisam ser verificados na OVH. O pacote não foi publicado nem instalado em servidor remoto.
LICENSE.txt e COPYRIGHT.txt originais foram preservados.

## Assinaturas Sertec Flow

Os planos individuais, a configuração do Mercado Pago e a homologação comercial estão descritos em [docs/SERTEC_SUBSCRIPTIONS.md](../../docs/SERTEC_SUBSCRIPTIONS.md). A ativação de cobrança e bloqueio por assinatura exige as verificações desse guia; o arquivo gerado mantém o modo comercial desligado por padrão.
