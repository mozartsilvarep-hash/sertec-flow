# Imagens Sertec Flow fora da OVH

A compilação do frontend excedeu o builder limitado a 2 GiB na OVH compartilhada. Este fluxo transfere a compilação para runners hospedados do GitHub. Não instala runner na OVH e não recebe credenciais SSH, aaPanel ou Mercado Pago.

## Construir

1. Mesclar este workflow na branch padrão `preview`.
2. Abrir Actions → **Sertec Flow - imagens OVH** → Run workflow → branch `preview`.
3. Aguardar os seis jobs concluírem com sucesso. Cada imagem tem seu próprio runner Linux amd64; no máximo dois jobs executam simultaneamente.
4. Guardar a tag `sha-<SHA completo do commit executado>`, presente no resumo dos jobs. Nenhuma tag `latest` é usada. Só implantar quando as seis imagens da mesma execução estiverem disponíveis.

O workflow usa o GITHUB_TOKEN temporário para publicar no GHCR. Não requer Docker Hub nem token pessoal no repositório. As Actions estão fixadas por SHA. Não há implantação automática ou gatilho em push/PR.

## Permitir o download

Pacotes novos no GHCR podem nascer privados, mesmo em repositório público. Após o build, conferir os seis pacotes `sertec-flow-frontend`, `sertec-flow-admin`, `sertec-flow-space`, `sertec-flow-live`, `sertec-flow-backend` e `sertec-flow-proxy`.

Para download sem login na OVH, o proprietário precisa torná-los públicos nas configurações de cada pacote. Isso publica somente as imagens do código já público; não incluir configurações ou credenciais do servidor nos builds. Como alternativa, manter os pacotes privados e autenticar a OVH usando credencial de leitura, inserida diretamente no terminal, nunca pelo chat.

## Preparar a OVH

Preservar `.env.aapanel`, `LISTEN_HTTP_PORT=18089` e os demais projetos. Não repetir o gerador de credenciais. Antes de atualizar o checkout, verificar `git status --short`: a alteração local de `.dockerignore` feita durante a preparação pode precisar ser guardada separadamente; este commit já contém a mesma exclusão.

O arquivo `docker-compose.aapanel.images.yml` é um override: remove os blocos de build com `!reset` e mantém banco, volumes, rede e publicação localhost do Compose base. Requer Compose >= 2.24.4; o Compose 5.3.1 diagnosticado na OVH atende.

Somente depois de confirmar as imagens e atualizar os arquivos do projeto, definir na sessão:

```bash
export SERTEC_IMAGE_TAG=sha-COLE_O_SHA_COMPLETO_DA_EXECUCAO
docker compose -p sertec-flow-ovh --env-file .env.aapanel \
  -f docker-compose.aapanel.yml -f docker-compose.aapanel.images.yml config --quiet
docker compose -p sertec-flow-ovh --env-file .env.aapanel \
  -f docker-compose.aapanel.yml -f docker-compose.aapanel.images.yml pull
```

Esses comandos validam e baixam; não iniciam a aplicação. O download ainda usa disco e rede: acompanhar `df -h /` antes/depois. Não executar prune global. O cache local do build falho permanece para remoção específica posterior, se necessária.

A inicialização continuará em etapa separada: primeiro limites de memória/CPU por serviço compatíveis com a capacidade restante, depois banco e dependências, migrações e testes locais; por último backup e ajuste do vhost exclusivo do Flow no Nginx. Manter cobrança e bloqueio comercial desativados até homologação. Não executar `up` antes dessa revisão.

## Validação desta configuração

Workflow e override revisados estruturalmente. As imagens só serão consideradas construídas quando os jobs realmente concluírem. Não houve execução de build remoto nem mudança na OVH durante a preparação deste arquivo.
