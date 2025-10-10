# ⚡ Quick Start - 10 Minutos

Guia super rápido para ter o bot funcionando em **10 minutos**.

## 🎯 Checklist Antes de Começar

Certifique-se de ter:
- ✅ Node.js 20+ instalado
- ✅ Conta Discord (óbvio 😄)
- ✅ 10 minutos livres

## 🚀 Setup em 6 Passos

### 1️⃣ Clone e Instale (2 min)

```bash
# Já está na pasta do projeto
npm install
```

### 2️⃣ Configure Discord Bot (2 min)

1. Acesse: https://discord.com/developers/applications
2. Clique **"New Application"**
3. Nome: `MeuBotVendas`
4. Vá em **"Bot"** → Clique **"Reset Token"**
5. **Copie o token** (você vai precisar!)
6. Ative as **3 intents** em "Privileged Gateway Intents"
7. Vá em **"OAuth2"** → **"URL Generator"**
   - Scopes: `bot` + `applications.commands`
   - Permissions: `Administrator`
8. **Copie a URL** e abra no navegador
9. **Adicione o bot** ao seu servidor de teste

### 3️⃣ Configure Supabase (3 min)

1. Acesse: https://supabase.com
2. Clique **"New Project"**
3. Preencha:
   - Nome: `discord-sales`
   - Database Password: (crie uma senha forte)
   - Region: (escolha mais próximo)
4. Aguarde criar (~2 min tomando café ☕)
5. Quando pronto:
   - Vá em **Settings** → **API**
   - Copie: **Project URL**
   - Copie: **anon public** key
   - Copie: **service_role** key (⚠️ mantenha secreto!)
6. Vá em **SQL Editor**
7. Clique **"New Query"**
8. Abra o arquivo `supabase-schema.sql` deste projeto
9. **Copie todo o conteúdo** e cole no SQL Editor
10. Clique **"Run"** (ou F5)

### 4️⃣ Configure .env (1 min)

```bash
cp .env.example .env
```

Abra `.env` e preencha:

```env
# Discord (do passo 2)
DISCORD_TOKEN=cole_seu_token_aqui
DISCORD_CLIENT_ID=cole_seu_client_id_aqui

# Supabase (do passo 3)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=sua_chave_anon
SUPABASE_SERVICE_KEY=sua_chave_service

# Webhook
WEBHOOK_PORT=3000
WEBHOOK_URL=http://localhost:3000
```

**⚠️ Importante:** 
- Sem aspas nos valores
- Sem espaços extras
- Client ID: clique no bot no Discord Developer Portal e copie o ID

### 5️⃣ Registre os Comandos (30 seg)

```bash
npm run deploy-commands
```

Você deve ver:
```
✅ addproduct
✅ catalogo
✅ config
... (mais comandos)
```

### 6️⃣ Inicie o Bot! (30 seg)

```bash
npm run dev
```

Você deve ver:
```
✅ Bot online como MeuBotVendas#1234
📊 Conectado a 1 servidor(es)
🌐 Servidor de webhooks rodando na porta 3000
```

## 🎉 Pronto! Agora teste no Discord

### Primeiro Comando: Setup Automático

No seu servidor Discord, digite:
```
/config setup
```

O bot vai criar automaticamente:
- ✅ Categoria de vendas
- ✅ Canal de logs
- ✅ Configurações padrão

### Segundo Comando: Adicionar Produto

```
/addproduct
```

Preencha:
- **nome:** Produto de Teste
- **descricao:** Meu primeiro produto!
- **preco:** 10.00
- **tipo:** único

Clique Enter e veja a magia acontecer! ✨

### Terceiro Comando: Ver Catálogo

```
/catalogo
```

Você vai ver seu produto lindo no catálogo! 🎨

## 🧪 Testar Compra (Simulação)

Como ainda não configurou pagamentos reais, vamos simular:

```bash
npm run test:purchase
```

Isso vai:
1. Criar produto de teste
2. Criar transação
3. Simular pagamento
4. Confirmar entrega

## ✅ Checklist de Sucesso

Você completou o setup se:
- [ ] Bot aparece online no Discord
- [ ] Comandos aparecem ao digitar `/`
- [ ] `/config setup` funcionou
- [ ] `/addproduct` criou um produto
- [ ] `/catalogo` mostra o produto
- [ ] Não há erros no terminal

## 🚨 Algo deu errado?

### Bot não conecta?
```bash
npm run test:env
```
Isso vai verificar se todas as variáveis estão corretas.

### Comandos não aparecem?
1. Aguarde 5 minutos (cache do Discord)
2. Kick o bot e adicione novamente
3. Execute `npm run deploy-commands` novamente

### Erro no Supabase?
1. Verifique se executou o `supabase-schema.sql`
2. Confirme se copiou a **service_role** key (não a anon)
3. Tente desabilitar RLS temporariamente

## 📚 Próximos Passos

Agora que está funcionando:

1. **Leia o README.md** - Documentação completa
2. **Configure Stripe/MP** - Para pagamentos reais
3. **Customize** - Cores, mensagens, etc
4. **Adicione produtos reais** - Seu catálogo
5. **Faça deploy** - Docker em produção

## 💡 Dicas Rápidas

### Criar vários produtos rapidamente
```
/addproduct nome: Produto1 descricao: Desc1 preco: 10 tipo: único
/addproduct nome: Produto2 descricao: Desc2 preco: 20 tipo: único
/addproduct nome: VIP descricao: Assinatura preco: 29.90 tipo: assinatura
```

### Ver estatísticas
```
/stats
```

### Ver suas compras
```
/myorders
```

### Configurar cores
```
/config color hex: #FF0000
```

## 🎨 Personalização Rápida

### Mudar cor dos embeds
```
/config color hex: #00FF00
```

### Definir moeda
```
/config currency moeda: BRL
```

### Configurar logs
```
/config logchannel canal: #vendas-log
```

## 🔥 Comandos Mais Usados

```bash
# Desenvolvimento
npm run dev              # Iniciar bot
npm run deploy-commands  # Atualizar comandos
npm run test:env        # Verificar .env

# Testes
npm run test:purchase   # Simular compra
npm run cleanup         # Limpar dados teste

# Produção
npm run build           # Build TypeScript
npm start               # Iniciar produção
```

## 📊 Dashboard Web (Opcional)

Quer ver estatísticas bonitas? Configure o dashboard:

```bash
cd dashboard
cp .env.example .env
# Edite .env com suas credenciais Supabase
npm install
npm run dev
```

Acesse: http://localhost:3001

## 🐳 Docker (Opcional)

Prefere Docker? Fácil:

```bash
docker-compose up -d
```

Ver logs:
```bash
docker-compose logs -f
```

Parar:
```bash
docker-compose down
```

## 🎯 Checklist de Produção

Antes de ir para produção:

- [ ] Configurou variáveis de ambiente de produção
- [ ] Testou todos os comandos
- [ ] Configurou Stripe/Mercado Pago
- [ ] Testou webhooks com ngrok
- [ ] Configurou domínio para webhooks
- [ ] Backups automáticos do Supabase
- [ ] Monitoramento configurado
- [ ] Leu TROUBLESHOOTING.md

## 🏆 Você Conseguiu! 

Se chegou até aqui, seu bot está funcionando! 🎉

**O que você tem agora:**
- ✅ Bot Discord funcionando
- ✅ Banco de dados configurado
- ✅ Sistema de produtos
- ✅ Catálogo interativo
- ✅ Sistema de configuração
- ✅ Base para adicionar pagamentos

**Próximos passos:**
1. Explore os comandos
2. Adicione produtos reais
3. Configure pagamentos
4. Customize visual
5. Faça deploy

## 📞 Precisa de Ajuda?

- 📖 **README.md** - Documentação completa
- 🔧 **TROUBLESHOOTING.md** - Soluções de problemas
- 💡 **EXAMPLES.md** - Exemplos práticos
- 📚 **COMMANDS.md** - Referência de comandos

## ⏱️ Tempo Real de Setup

- Setup básico: **~10 minutos**
- Com dashboard: **+5 minutos**
- Com Docker: **+3 minutos**
- Pagamentos: **+10 minutos**
- Deploy: **+15 minutos**

**Total completo:** ~45 minutos para produção!

---

**🚀 Agora é só usar e vender! Boa sorte com seu bot de vendas!**

*PS: Não esqueça de dar uma ⭐ no projeto se gostou!*
