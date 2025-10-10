# 🏗️ Arquitetura do Sistema

Visão técnica completa da arquitetura do Discord Sales Bot.

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        DISCORD API                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                     DISCORD BOT                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Commands   │  │    Events    │  │  Interactions│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────┬─────────────────┬──────────────────┬───────────┘
            │                 │                  │
            ▼                 ▼                  ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
│   Supabase DB    │  │   Payments   │  │  Webhook Server  │
│  (PostgreSQL)    │  │ Stripe/MP    │  │   (Express)      │
└──────────────────┘  └──────────────┘  └──────────────────┘
            │                 │                  │
            └─────────────────┴──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Dashboard Web   │
                    │   (Next.js)      │
                    └──────────────────┘
```

## 🔧 Componentes Principais

### 1. Discord Bot (Node.js + TypeScript)

**Responsabilidades:**
- Gerenciar comandos slash
- Processar interações (botões, menus)
- Gerenciar roles e canais
- Enviar notificações
- Integrar com banco de dados

**Tecnologias:**
- discord.js v14
- TypeScript
- Node.js 20+

**Fluxo de execução:**
```
1. Cliente inicia (index.ts)
2. Carrega comandos (commands/)
3. Carrega eventos (events/)
4. Conecta ao Discord
5. Aguarda interações
6. Processa e responde
```

---

### 2. Banco de Dados (Supabase/PostgreSQL)

**Responsabilidades:**
- Armazenar produtos
- Registrar transações
- Gerenciar configurações
- Manter logs
- Views de estatísticas

**Schema:**
```
guild_configs ──┐
                │
products ───────┼──> transactions
    │           │         │
    ├───────────┼──> product_feedbacks
    │           │
    └───────────┼──> temporary_roles
                │
coupons ────────┤
                │
access_logs ────┘
```

**Recursos:**
- Row Level Security (RLS)
- Triggers automáticos
- Views otimizadas
- Indexes para performance

---

### 3. Sistema de Pagamentos

**Providers suportados:**
- Stripe (global)
- Mercado Pago (Brasil)

**Fluxo de pagamento:**
```
1. Usuário clica "Comprar"
2. Bot cria transação (status: pending)
3. Bot gera link de pagamento
4. Usuário completa pagamento
5. Webhook recebe notificação
6. Bot atualiza transação (status: completed)
7. Bot entrega produto automaticamente
```

**Segurança:**
- Webhook signatures verificadas
- Validação de metadata
- Idempotency keys
- Retry logic

---

### 4. Servidor de Webhooks (Express)

**Responsabilidades:**
- Receber notificações de pagamento
- Validar assinaturas
- Processar eventos
- Triggerar entregas

**Endpoints:**
```
POST /webhooks/stripe          - Webhook Stripe
POST /webhooks/mercadopago     - Webhook Mercado Pago
GET  /success                  - Página de sucesso
GET  /cancel                   - Página de cancelamento
GET  /health                   - Health check
```

**Middleware:**
- Raw body parser (Stripe)
- JSON parser (Mercado Pago)
- Error handling
- Logging

---

### 5. Sistema de Entrega (Delivery Handler)

**Processo de entrega:**
```
┌─────────────────────────────────┐
│   Pagamento Confirmado          │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   1. Adicionar Role             │
│      - Permanente (único)       │
│      - Temporária (assinatura)  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   2. Criar Canal Privado        │
│      - Permissões exclusivas    │
│      - Mensagem de boas-vindas  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   3. Enviar DM ao Comprador     │
│      - Conteúdo digital         │
│      - Links de acesso          │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   4. Notificar Admins           │
│      - Log de transação         │
│      - Canal configurado        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   5. Decrementar Estoque        │
│      - Atualizar banco          │
│      - Alertar se baixo         │
└─────────────────────────────────┘
```

---

### 6. Dashboard Web (Next.js)

**Responsabilidades:**
- Visualizar estatísticas
- Gerenciar produtos (futuro)
- Ver transações
- Analytics

**Tecnologias:**
- Next.js 14
- React 18
- Tailwind CSS
- Recharts (gráficos)

**Páginas:**
- `/` - Dashboard principal
- `/products` - Gerenciar produtos (futuro)
- `/transactions` - Histórico (futuro)
- `/analytics` - Métricas (futuro)

---

## 🔄 Fluxos Principais

### Fluxo 1: Criar Produto

```
Admin usa /addproduct
        ↓
Command handler valida dados
        ↓
Cria produto no Supabase
        ↓
Retorna confirmação com botões
        ↓
Admin pode editar/remover
```

### Fluxo 2: Compra com Stripe

```
Usuário: /catalogo
        ↓
Seleciona produto
        ↓
Clica "Comprar Agora"
        ↓
Escolhe "Pagar com Stripe"
        ↓
Bot cria transação (pending)
        ↓
Bot cria sessão Stripe
        ↓
Usuário redireciona para Stripe
        ↓
Usuário completa pagamento
        ↓
Stripe envia webhook
        ↓
Webhook handler valida
        ↓
Atualiza transação (completed)
        ↓
Delivery handler entrega produto
        ↓
Usuário recebe role + DM + canal
```

### Fluxo 3: Assinatura

```
Usuário compra assinatura
        ↓
Recebe role temporária (30 dias)
        ↓
Stripe cobra mensalmente
        ↓
Webhook "invoice.paid"
        ↓
Bot renova role por +30 dias
        ↓
[Se cancelar]
        ↓
Webhook "subscription.deleted"
        ↓
Bot remove role automaticamente
```

### Fluxo 4: Cupom de Desconto

```
Bot gera link de pagamento
        ↓
Verifica se há cupom aplicado
        ↓
Valida cupom (ativo, não expirado, usos)
        ↓
Calcula desconto
        ↓
Aplica ao preço final
        ↓
Incrementa usos do cupom
        ↓
Link gerado com preço descontado
```

---

## 🗂️ Estrutura de Arquivos

```
discord-sales-bot/
│
├── src/
│   ├── commands/              # Comandos slash
│   │   ├── addproduct.ts
│   │   ├── catalogo.ts
│   │   ├── config.ts
│   │   ├── editproduct.ts
│   │   ├── removeproduct.ts
│   │   ├── addcoupon.ts
│   │   ├── stats.ts
│   │   └── myorders.ts
│   │
│   ├── events/                # Eventos Discord
│   │   ├── ready.ts
│   │   ├── interactionCreate.ts
│   │   └── guildCreate.ts
│   │
│   ├── utils/                 # Utilidades
│   │   ├── supabase.ts        # CRUD banco de dados
│   │   ├── payments.ts        # Integração pagamentos
│   │   ├── roleManager.ts     # Gerenciar roles
│   │   ├── channelManager.ts  # Gerenciar canais
│   │   └── logger.ts          # Sistema de logs
│   │
│   ├── webhooks/              # Sistema de webhooks
│   │   ├── server.ts          # Servidor Express
│   │   ├── stripeWebhook.ts   # Handler Stripe
│   │   ├── mercadoPagoWebhook.ts  # Handler MP
│   │   └── deliveryHandler.ts # Entrega de produtos
│   │
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   │
│   ├── index.ts               # Entry point
│   └── deploy-commands.ts     # Deploy slash commands
│
├── dashboard/                 # Painel web (Next.js)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   └── package.json
│
├── scripts/                   # Scripts utilitários
│   ├── test-purchase.ts
│   ├── cleanup-db.ts
│   └── check-env.ts
│
├── supabase-schema.sql        # Schema do banco
├── Dockerfile                 # Docker bot
├── docker-compose.yml         # Orquestração
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🔐 Segurança

### Camadas de Segurança

1. **Discord Bot Token**
   - Nunca commitar no git
   - Usar variáveis de ambiente
   - Regenerar se exposto

2. **Supabase Service Key**
   - Apenas no backend
   - Nunca expor ao frontend
   - RLS habilitado

3. **Webhook Signatures**
   - Validar todas as requisições
   - Stripe: stripe.webhooks.constructEvent
   - Mercado Pago: validar signature

4. **Database Security**
   - Row Level Security (RLS)
   - Prepared statements
   - Input validation

5. **Rate Limiting**
   - Implementar em produção
   - Proteger endpoints sensíveis

---

## 📈 Performance

### Otimizações

1. **Database Indexes**
   - guild_id em todas as tabelas
   - payment_id em transactions
   - created_at em logs

2. **Connection Pooling**
   - Supabase já gerencia
   - Reusar conexões

3. **Caching** (futuro)
   - Redis para produtos
   - Cache de configurações
   - Invalidar em updates

4. **Async/Await**
   - Operações não-bloqueantes
   - Promises paralelas quando possível

---

## 🚀 Escalabilidade

### Escalar Horizontalmente

```
┌─────────────┐
│ Load Balancer│
└──────┬───────┘
       │
   ┌───┴────┬────────┬─────────┐
   │        │        │         │
┌──▼──┐  ┌──▼──┐  ┌──▼──┐  ┌──▼──┐
│Bot 1│  │Bot 2│  │Bot 3│  │Bot 4│
└──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘
   │        │        │         │
   └────────┴────────┴─────────┘
              │
        ┌─────▼──────┐
        │  Supabase  │
        └────────────┘
```

### Sharding (Discord.js)

```typescript
const manager = new ShardingManager('./dist/index.js', {
  totalShards: 'auto',
  token: process.env.DISCORD_TOKEN
});

manager.spawn();
```

### Database Scaling

- Read replicas para reads
- Connection pooling
- Particionamento por guild_id
- Archive de dados antigos

---

## 🔄 CI/CD Pipeline (Sugerido)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm test
      - name: Deploy to production
        run: |
          # Deploy para Railway/Render/Heroku
```

---

## 📊 Monitoramento

### Métricas Importantes

- **Uptime do bot**
- **Latência de comandos**
- **Taxa de erro**
- **Transações por hora**
- **Uso de memória**
- **Database queries/s**

### Ferramentas Sugeridas

- Sentry (error tracking)
- DataDog (monitoring)
- Grafana (visualização)
- Discord webhooks (alertas)

---

## 🧪 Testes

### Níveis de Teste

1. **Unit Tests**
   - Testar funções individuais
   - Mock de dependencies

2. **Integration Tests**
   - Testar fluxos completos
   - Database real (test)

3. **E2E Tests**
   - Simular usuário real
   - Testar UI completa

### Exemplo de Teste

```typescript
describe('Product Creation', () => {
  it('should create product successfully', async () => {
    const product = await createProduct({
      guild_id: 'test',
      name: 'Test Product',
      price: 10.00,
      type: 'unique',
      is_active: true
    });
    
    expect(product.id).toBeDefined();
    expect(product.name).toBe('Test Product');
  });
});
```

---

## 🔮 Roadmap Técnico

### Fase 1 (Atual)
- ✅ CRUD de produtos
- ✅ Sistema de pagamentos
- ✅ Webhooks
- ✅ Entrega automática
- ✅ Dashboard básico

### Fase 2 (Próxima)
- [ ] Testes automatizados
- [ ] Cache com Redis
- [ ] API REST
- [ ] Sistema de tickets
- [ ] Analytics avançado

### Fase 3 (Futuro)
- [ ] Machine Learning (previsões)
- [ ] Multi-idioma
- [ ] Mobile app
- [ ] Sistema de afiliados
- [ ] Marketplace

---

**💡 Esta arquitetura foi projetada para ser modular, escalável e fácil de manter!**
