# 🚀 Guia de Setup Rápido

Este guia vai te ajudar a configurar o bot em **menos de 15 minutos**.

## ✅ Checklist Rápida

- [ ] Node.js 20+ instalado
- [ ] Conta Discord Developer
- [ ] Projeto Supabase criado
- [ ] Conta Stripe ou Mercado Pago (opcional)

## 📋 Passo a Passo

### 1. Instalar Dependências (2 min)

```bash
npm install
```

### 2. Configurar Discord Bot (3 min)

1. Acesse: https://discord.com/developers/applications
2. Clique em "New Application"
3. Dê um nome ao seu bot
4. Vá em "Bot" → "Reset Token" → Copie o token
5. Ative as intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Vá em "OAuth2" → "URL Generator"
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Administrator`
7. Use a URL gerada para adicionar ao servidor

### 3. Configurar Supabase (5 min)

1. Acesse: https://supabase.com
2. Crie um novo projeto
3. Aguarde o projeto ser criado
4. Copie:
   - Project URL
   - `anon public` key
   - `service_role` key (Settings → API)
5. Vá em SQL Editor
6. Execute o conteúdo de `supabase-schema.sql`

### 4. Configurar Variáveis de Ambiente (2 min)

```bash
cp .env.example .env
```

Edite `.env` e adicione:
```env
DISCORD_TOKEN=seu_token_aqui
DISCORD_CLIENT_ID=seu_client_id
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_anon
SUPABASE_SERVICE_KEY=sua_service_key
```

**Teste a configuração:**
```bash
npm run test:env
```

### 5. Registrar Comandos (1 min)

```bash
npm run deploy-commands
```

Aguarde a mensagem de sucesso.

### 6. Iniciar o Bot (1 min)

```bash
npm run dev
```

Você deve ver:
```
✅ Bot online como SeuBot#1234
📊 Conectado a 1 servidor(es)
🌐 Servidor de webhooks rodando na porta 3000
```

## 🎯 Primeiros Passos no Discord

### 1. Configure o bot no servidor
```
/config setup
```

### 2. Adicione seu primeiro produto
```
/addproduct
```

### 3. Veja o catálogo
```
/catalogo
```

## 💳 Configurar Pagamentos (Opcional)

**⚠️ Novo:** Agora cada servidor Discord pode ter suas próprias credenciais de pagamento!

### Stripe

1. Acesse: https://dashboard.stripe.com
2. Pegue sua API key: Developers → API Keys (`sk_test_...` ou `sk_live_...`)
3. Configure webhook:
   - Endpoint: `https://seu-dominio.com/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `payment_intent.succeeded`, `invoice.paid`
4. Copie o **Signing Secret** do webhook (`whsec_...`)

5. **Configure no Discord (por servidor):**
```
/config payment-set provider:stripe api_key:sk_test_... webhook_secret:whsec_...
```

6. Ative o método:
```
/config payment stripe:true
```

### Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers
2. Crie uma aplicação
3. Copie o **Access Token** (TEST ou PROD)
4. Configure notificações:
   - URL: `https://seu-dominio.com/webhooks/mercadopago`
   - Eventos: `payment`

5. **Configure no Discord (por servidor):**
```
/config payment-set provider:mercadopago api_key:APP-...
```

6. Ative o método:
```
/config payment mercadopago:true
```

### Remover Credenciais

Para remover as credenciais de um provedor:
```
/config payment-delete provider:stripe
```

## 🐳 Deploy Rápido com Docker

```bash
# 1. Configure .env
cp .env.example .env

# 2. Build e start
docker-compose up -d

# 3. Ver logs
docker-compose logs -f
```

## 🌐 Expor Webhooks Localmente

Para testes locais, use [ngrok](https://ngrok.com/):

```bash
# Instalar ngrok
brew install ngrok  # macOS
# ou baixe em: https://ngrok.com/download

# Expor porta 3000
ngrok http 3000

# Use a URL gerada (ex: https://abc123.ngrok.io)
# nos webhooks do Stripe/Mercado Pago
```

## 🧪 Testar o Sistema

### Verificar configuração
```bash
npm run test:env
```

### Simular uma compra
```bash
npm run test:purchase
```

### Ver estatísticas
No Discord: `/stats`

### Ver suas compras
No Discord: `/myorders`

## 📊 Dashboard Web (Opcional)

```bash
cd dashboard
cp .env.example .env
# Configure as variáveis
npm install
npm run dev
```

Acesse: http://localhost:3001

## ❓ Problemas Comuns

### Bot não aparece online
- ✅ Verifique o token no .env
- ✅ Confirme que as intents estão ativas

### Comandos não aparecem
- ✅ Execute `npm run deploy-commands`
- ✅ Aguarde alguns minutos
- ✅ Kick e re-adicione o bot

### Erro de permissões
- ✅ Bot precisa de permissões de Administrator
- ✅ Role do bot deve estar acima das roles que ele gerencia

### Webhook não funciona
- ✅ Use ngrok para testes locais
- ✅ Verifique se a porta 3000 está aberta
- ✅ Confirme o webhook secret no .env

## 🎉 Pronto!

Seu bot está funcionando! Agora você pode:

1. ✅ Adicionar produtos: `/addproduct`
2. ✅ Criar cupons: `/addcoupon`
3. ✅ Ver estatísticas: `/stats`
4. ✅ Configurar aparência: `/config`

## 📚 Próximos Passos

- [ ] Leia o README.md completo
- [ ] Configure pagamentos reais
- [ ] Personalize as mensagens
- [ ] Configure o dashboard
- [ ] Faça deploy em produção

## 💬 Precisa de Ajuda?

- 📖 Documentação: README.md
- 🐛 Issues: GitHub Issues
- 💡 Dicas: Veja os comentários no código

---

**Tempo estimado total: 10-15 minutos** ⏱️
