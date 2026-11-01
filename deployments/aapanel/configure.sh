#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
command -v openssl >/dev/null
[[ $# -eq 1 && "$1" =~ ^[A-Za-z0-9][A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]] || { echo 'Uso: bash deployments/aapanel/configure.sh flow.seudominio.com.br'; exit 1; }
[[ ! -e .env.aapanel ]] || { echo '.env.aapanel já existe; preservado.'; exit 1; }
umask 077
DB_PASS=$(openssl rand -hex 24)
MQ_PASS=$(openssl rand -hex 24)
S3_PASS=$(openssl rand -hex 24)
SECRET=$(openssl rand -hex 48)
LIVE_SECRET=$(openssl rand -hex 48)
cat > .env.aapanel <<EOF
APP_DOMAIN=$1
WEB_URL=https://$1
CORS_ALLOWED_ORIGINS=https://$1
DEBUG=0
SERTEC_REQUIRE_SUBSCRIPTION=0
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
MERCADOPAGO_COLLECTOR_ID=
MERCADOPAGO_LIVE_MODE=0
LISTEN_HTTP_PORT=8088
SITE_ADDRESS=:80
TRUSTED_PROXIES=private_ranges
CERT_EMAIL=
CERT_ACME_CA=https://acme-v02.api.letsencrypt.org/directory
CERT_ACME_DNS=
POSTGRES_USER=sertec
POSTGRES_DB=sertec
POSTGRES_PASSWORD=$DB_PASS
DATABASE_URL=postgresql://sertec:$DB_PASS@plane-db:5432/sertec
RABBITMQ_USER=sertec
RABBITMQ_PASSWORD=$MQ_PASS
RABBITMQ_VHOST=sertec
AMQP_URL=amqp://sertec:$MQ_PASS@plane-mq:5672/sertec
AWS_ACCESS_KEY_ID=sertec-storage
AWS_SECRET_ACCESS_KEY=$S3_PASS
AWS_S3_ENDPOINT_URL=http://plane-minio:9000
AWS_S3_BUCKET_NAME=uploads
USE_MINIO=1
MINIO_ENDPOINT_SSL=0
FILE_SIZE_LIMIT=5242880
SECRET_KEY=$SECRET
LIVE_SERVER_SECRET_KEY=$LIVE_SECRET
EOF
echo '.env.aapanel criado com credenciais aleatórias. Agora valide e construa o Compose conforme README.'
