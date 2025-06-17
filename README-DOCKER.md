
# Docker Deployment Guide

Este guia explica como executar a aplicação Company Flow Control em uma VM Windows usando Docker.

## Pré-requisitos

1. **Docker Desktop for Windows** instalado e em execução
   - Download: https://www.docker.com/products/docker-desktop/
   - Certifique-se de que o Docker Desktop está rodando

2. **Git** (opcional, para clonar o repositório)

## Como executar

### Método 1: Scripts automatizados (Recomendado)

1. **Iniciar a aplicação:**
   ```batch
   docker-start.bat
   ```

2. **Parar a aplicação:**
   ```batch
   docker-stop.bat
   ```

3. **Ver logs:**
   ```batch
   docker-logs.bat
   ```

4. **Reconstruir a aplicação:**
   ```batch
   docker-rebuild.bat
   ```

### Método 2: Comandos Docker manuais

1. **Construir e iniciar:**
   ```bash
   docker-compose up --build -d
   ```

2. **Parar:**
   ```bash
   docker-compose down
   ```

3. **Ver logs:**
   ```bash
   docker-compose logs -f app
   ```

## Acesso à aplicação

Após iniciar com sucesso, a aplicação estará disponível em:
- **URL:** http://localhost:3000

## Configuração do Supabase

A aplicação utiliza Supabase como backend. Certifique-se de que:

1. As configurações do Supabase em `src/integrations/supabase/client.ts` estão corretas
2. As URLs de redirecionamento no Supabase incluem:
   - http://localhost:3000
   - A URL do seu servidor de produção (se aplicável)

## Estrutura de arquivos Docker

- `Dockerfile` - Configuração da imagem Docker
- `docker-compose.yml` - Orquestração dos serviços
- `docker-start.bat` - Script para iniciar a aplicação
- `docker-stop.bat` - Script para parar a aplicação
- `docker-logs.bat` - Script para visualizar logs
- `docker-rebuild.bat` - Script para reconstruir a aplicação
- `.dockerignore` - Arquivos ignorados pelo Docker

## Solução de problemas

### Docker não está rodando
```
ERROR: Docker is not installed or not running.
```
**Solução:** Instale o Docker Desktop e certifique-se de que está em execução.

### Porta 3000 já está em uso
**Solução:** Pare outros serviços na porta 3000 ou modifique a porta no `docker-compose.yml`.

### Erro de build
**Solução:** Execute `docker-rebuild.bat` para reconstruir a aplicação do zero.

### Problemas de conectividade
**Solução:** Verifique se as configurações do Supabase estão corretas e se a VM tem acesso à internet.

## Comandos úteis

- **Ver containers rodando:** `docker ps`
- **Ver todas as imagens:** `docker images`
- **Limpar containers parados:** `docker container prune`
- **Limpar imagens não utilizadas:** `docker image prune`

## Logs e monitoramento

Os logs da aplicação podem ser visualizados com:
```bash
docker-compose logs -f app
```

Para logs em tempo real, use o script `docker-logs.bat`.
