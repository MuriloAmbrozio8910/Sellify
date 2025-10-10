# 🔧 Troubleshooting & FAQ

Soluções para problemas comuns e perguntas frequentes.

## 🚨 Problemas Comuns

### 1. Bot não conecta / Fica offline

**Sintomas:**
- Bot não aparece online no Discord
- Erro: "Incorrect login details"

**Soluções:**

✅ **Verificar token:**
```bash
npm run test:env
```

✅ **Regenerar token:**
1. Acesse Discord Developer Portal
2. Vá em "Bot"
3. Clique em "Reset Token"
4. Copie o novo token para `.env`

✅ **Verificar intents:**
- Ative todas as intents necessárias no Developer Portal
- Bot → Privileged Gateway Intents → Ative tudo

✅ **Verificar .env:**
```env
DISCORD_TOKEN=seu_token_aqui  # Sem aspas, sem espaços
```

---

### 2. Comandos não aparecem no Discord

**Sintomas:**
- Comandos não aparecem ao digitar `/`
- Erro: "Application did not respond"

**Soluções:**

✅ **Registrar comandos:**
```bash
npm run deploy-commands
```

✅ **Aguardar propagação:**
- Comandos globais: até 1 hora
- Comandos de servidor: instantâneo

✅ **Forçar para um servidor específico:**
```typescript
// Em deploy-commands.ts, temporariamente use:
Routes.applicationGuildCommands(clientId, guildId)
// Em vez de:
Routes.applicationCommands(clientId)
```

✅ **Kick e re-adicione o bot:**
- Remove o bot do servidor
- Adicione novamente com as permissões corretas

---

### 3. Erro de permissões

**Sintomas:**
- "Missing Permissions"
- "DiscordAPIError: Missing Access"

**Soluções:**

✅ **Verificar permissões do bot:**
- Role do bot deve estar no topo (abaixo apenas de roles de admin)
- Bot precisa de permissão "Administrator" ou permissões específicas

✅ **Permissões necessárias:**
- Manage Roles
- Manage Channels
- Send Messages
- Embed Links
- Read Message History
- Add Reactions

✅ **Verificar hierarquia de roles:**
- Bot não pode gerenciar roles acima da sua própria role

---

### 4. Banco de dados não conecta

**Sintomas:**
- Erro: "Connection refused"
- Erro: "Invalid API key"

**Soluções:**

✅ **Verificar URL e keys:**
```bash
npm run test:env
```

✅ **Verificar Supabase:**
- Projeto está ativo?
- URL está correta?
- Key não expirou?

✅ **RLS (Row Level Security):**
```sql
-- Desabilitar temporariamente para teste
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

✅ **Service Role Key:**
- Use `SUPABASE_SERVICE_KEY` para operações do bot
- `SUPABASE_KEY` (anon) é para o dashboard

---

### 5. Webhooks não funcionam

**Sintomas:**
- Pagamentos não confirmam automaticamente
- Erro 401/403 no webhook

**Soluções:**

✅ **Verificar URL pública:**
```bash
# Teste local com ngrok
ngrok http 3000
# Use a URL https://xxx.ngrok.io nos webhooks
```

✅ **Verificar webhook secret:**
```env
STRIPE_WEBHOOK_SECRET=whsec_...  # Deve corresponder ao Stripe
```

✅ **Testar webhook manualmente:**
```bash
curl -X POST http://localhost:3000/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'
```

✅ **Logs do servidor:**
```bash
# Ver logs do webhook
docker-compose logs -f
# ou
npm run webhook
```

✅ **Stripe CLI (desenvolvimento):**
```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

---

### 6. Pagamentos não confirmam

**Sintomas:**
- Usuário pagou mas não recebeu o produto
- Transação fica "pending"

**Soluções:**

✅ **Verificar logs:**
```bash
docker-compose logs -f bot
```

✅ **Verificar transação no banco:**
```sql
SELECT * FROM transactions 
WHERE user_id = 'USER_ID' 
ORDER BY created_at DESC 
LIMIT 5;
```

✅ **Confirmar manualmente:**
```sql
UPDATE transactions 
SET status = 'completed', 
    payment_id = 'manual_confirm'
WHERE id = 'TRANSACTION_ID';
```

✅ **Re-entregar produto:**
```typescript
// Use o deliveryHandler manualmente
import { deliverProduct } from './webhooks/deliveryHandler';
await deliverProduct(guildId, userId, product, transactionId);
```

---

### 7. Roles não são adicionadas

**Sintomas:**
- Compra concluída mas role não foi dada
- Erro: "Missing Permissions"

**Soluções:**

✅ **Hierarquia de roles:**
- Role do bot DEVE estar ACIMA da role que ele vai dar
- Arraste a role do bot para cima nas configurações do servidor

✅ **Verificar role existe:**
- Role configurada no produto existe?
- ID da role está correto?

✅ **Adicionar manualmente:**
```typescript
// No Discord
// Servidor → Membros → Usuário → + → Selecione a role
```

✅ **Logs:**
```bash
# Verificar erros
grep "role" logs/bot.log
```

---

### 8. Canal privado não é criado

**Sintomas:**
- Compra concluída mas canal não aparece
- Erro: "Missing Permissions"

**Soluções:**

✅ **Verificar configuração:**
```
/config view
```
- `sales_category_id` está configurado?

✅ **Permissões necessárias:**
- Manage Channels
- View Channel

✅ **Criar categoria:**
```
/config setup
# ou
/config category categoria: Vendas
```

---

### 9. Estoque não decrementa

**Sintomas:**
- Vendas acontecem mas estoque não diminui
- Produto vende mais que o estoque

**Soluções:**

✅ **Verificar no código:**
```typescript
// Em stripeWebhook.ts e mercadoPagoWebhook.ts
await decrementStock(product_id);
```

✅ **Verificar banco:**
```sql
SELECT id, name, stock 
FROM products 
WHERE stock IS NOT NULL;
```

✅ **Atualizar manualmente:**
```sql
UPDATE products 
SET stock = stock - 1 
WHERE id = 'PRODUCT_ID';
```

---

### 10. Erro de TypeScript / Build

**Sintomas:**
- `npm run build` falha
- Erros de tipos

**Soluções:**

✅ **Limpar e reinstalar:**
```bash
rm -rf node_modules dist
npm install
npm run build
```

✅ **Verificar versão do Node:**
```bash
node --version  # Deve ser 20+
```

✅ **Atualizar dependências:**
```bash
npm update
```

---

## ❓ FAQ

### Como testar pagamentos sem pagar de verdade?

**Stripe:**
- Use chaves de teste (`sk_test_...`)
- Cartão de teste: `4242 4242 4242 4242`
- Qualquer CVC e data futura

**Mercado Pago:**
- Use credenciais de teste
- CPF de teste: 123.456.789-09

### Como fazer backup do banco?

```bash
# Via Supabase
supabase db dump > backup.sql

# Restaurar
psql -h db.project.supabase.co -U postgres < backup.sql
```

### Como migrar para outro servidor?

```bash
# 1. Exportar dados
npm run export-data

# 2. Importar no novo servidor
npm run import-data

# 3. Atualizar guild_id nas configurações
```

### Como adicionar novo método de pagamento?

1. Crie handler em `src/webhooks/`
2. Adicione rota em `src/webhooks/server.ts`
3. Implemente em `src/utils/payments.ts`
4. Atualize tipos em `src/types/index.ts`

### Como customizar mensagens?

Edite diretamente nos arquivos:
- `src/commands/` - Mensagens dos comandos
- `src/webhooks/deliveryHandler.ts` - Mensagem de entrega
- `src/events/` - Mensagens de eventos

### Como adicionar um novo comando?

1. Crie arquivo em `src/commands/novocomando.ts`
2. Implemente `data` e `execute`
3. Execute `npm run deploy-commands`
4. Reinicie o bot

**Exemplo:**
```typescript
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('teste')
  .setDescription('Comando de teste');

export async function execute(interaction) {
  await interaction.reply('Funcionando!');
}
```

### Como remover dados de teste?

```bash
npm run cleanup
```

Ou manualmente:
```sql
DELETE FROM transactions WHERE guild_id = 'TEST_GUILD_ID';
DELETE FROM products WHERE guild_id = 'TEST_GUILD_ID';
```

### Como escalar para muitos servidores?

- ✅ Use PostgreSQL connection pooling
- ✅ Implemente cache com Redis
- ✅ Use sharding do Discord.js
- ✅ Deploy em múltiplas instâncias
- ✅ Use load balancer

### Como implementar multi-idioma?

1. Crie arquivo `src/i18n/translations.ts`
2. Detecte idioma do servidor
3. Use traduções nos comandos e mensagens

### Quanto custa rodar o bot?

**Gratuito:**
- Discord: Grátis
- Supabase: Tier grátis (500MB storage, 50MB database)
- Desenvolvimento local: Grátis

**Produção:**
- VPS (Railway/Render): $5-20/mês
- Supabase Pro: $25/mês (se necessário)
- Stripe/Mercado Pago: Taxa por transação (~3-5%)

---

## 🐛 Debug Avançado

### Modo Debug

```typescript
// Em src/index.ts
client.on('debug', console.log);
client.on('warn', console.warn);
```

### Ver todas as interações

```typescript
// Em src/events/interactionCreate.ts
console.log('Interaction:', interaction.type, interaction.customId);
```

### Testar sem Discord

```bash
npm run test:purchase  # Simula compra completa
```

### Logs estruturados

```typescript
import { logger } from './utils/logger';

logger.debug('Detalhes técnicos');
logger.info('Informação geral');
logger.warning('Aviso importante');
logger.error('Erro crítico');
```

---

## 📞 Suporte

### Antes de pedir ajuda:

1. ✅ Leia este documento
2. ✅ Verifique logs: `docker-compose logs -f`
3. ✅ Teste variáveis: `npm run test:env`
4. ✅ Veja documentação oficial do Discord.js

### Informações úteis para suporte:

- Versão do Node.js
- Sistema operacional
- Mensagem de erro completa
- Logs relevantes
- Passos para reproduzir

### Links úteis:

- Discord.js: https://discord.js.org
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- Mercado Pago: https://www.mercadopago.com.br/developers

---

## 🔍 Checklist de Diagnóstico

Quando algo não funciona:

- [ ] Bot está online?
- [ ] Comandos estão registrados?
- [ ] .env está configurado corretamente?
- [ ] Permissões do bot estão corretas?
- [ ] Banco de dados está acessível?
- [ ] Webhooks estão configurados?
- [ ] Logs mostram algum erro?
- [ ] Firewall não está bloqueando?
- [ ] Versões das dependências estão corretas?

---

**💡 Dica:** 90% dos problemas são resolvidos verificando .env, permissões e logs!
