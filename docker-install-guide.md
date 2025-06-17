
# Guia de Instalação do Docker no Windows

## Passo a passo para instalar Docker Desktop no Windows

### 1. Requisitos do sistema
- Windows 10 64-bit: Pro, Enterprise, ou Education (Build 16299 ou posterior)
- Windows 11 64-bit
- Hyper-V e Containers Windows features habilitados
- Pelo menos 4GB de RAM

### 2. Download e instalação

1. Acesse: https://www.docker.com/products/docker-desktop/
2. Clique em "Download for Windows"
3. Execute o instalador `Docker Desktop Installer.exe`
4. Siga o assistente de instalação
5. Reinicie o computador quando solicitado

### 3. Configuração inicial

1. **Inicie o Docker Desktop** após a instalação
2. **Aceite os termos de serviço**
3. **Configure as preferências** (opcional):
   - Recursos (CPU, Memória)
   - Redes
   - Docker Engine

### 4. Verificação da instalação

Abra o Prompt de Comando ou PowerShell e execute:

```batch
docker --version
docker-compose --version
```

Você deve ver algo como:
```
Docker version 20.10.x, build xxxxx
docker-compose version 1.29.x, build xxxxx
```

### 5. Teste básico

Execute um container de teste:
```batch
docker run hello-world
```

Se aparecer uma mensagem de sucesso, o Docker está funcionando corretamente.

### 6. Solução de problemas comuns

#### WSL 2 não instalado
Se aparecer erro sobre WSL 2:
1. Abra PowerShell como administrador
2. Execute: `wsl --install`
3. Reinicie o computador
4. Inicie o Docker Desktop novamente

#### Hyper-V não habilitado
1. Abra "Ativar ou desativar recursos do Windows"
2. Marque "Hyper-V" e "Containers"
3. Reinicie o computador

#### Problemas de performance
1. Ajuste a alocação de recursos no Docker Desktop
2. Recomendado: pelo menos 2GB de RAM para o Docker

### 7. Configuração para produção

Para uso em servidor/produção:
1. Configure o Docker para iniciar automaticamente
2. Ajuste os recursos conforme necessário
3. Configure logs e monitoramento
4. Considere usar Docker Swarm ou Kubernetes para alta disponibilidade

### Links úteis
- Documentação oficial: https://docs.docker.com/desktop/windows/
- Troubleshooting: https://docs.docker.com/desktop/windows/troubleshoot/
- WSL 2: https://docs.microsoft.com/en-us/windows/wsl/install
