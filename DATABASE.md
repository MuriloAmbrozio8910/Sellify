# 🗄️ Estrutura do Banco de Dados

Documentação completa do schema do banco de dados Supabase.

## 📊 Visão Geral

O bot utiliza **7 tabelas principais** e **2 views** para gerenciar todo o sistema de vendas.

```
┌─────────────────┐
│  guild_configs  │ ← Configurações dos servidores
└─────────────────┘

┌─────────────────┐
│    products     │ ← Produtos disponíveis
└─────────────────┘
         │
         ├─────────────────────────┐
         │                         │
┌────────▼────────┐     ┌──────────▼────────┐
│  transactions   │     │ product_feedbacks │
└─────────────────┘     └───────────────────┘

┌─────────────────┐     ┌──────────────────┐
│     coupons     │     │   access_logs    │
└─────────────────┘     └──────────────────┘

┌─────────────────┐
│ temporary_roles │
└─────────────────┘
```

---

## 📋 Tabelas

### 1. `guild_configs`
Configurações específicas de cada servidor Discord.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `guild_id` | TEXT (PK) | ID do servidor Discord |
| `sales_category_id` | TEXT | ID da categoria para canais de venda |
| `log_channel_id` | TEXT | ID do canal de logs |
| `admin_role_id` | TEXT | ID da role de admin |
| `embed_color` | TEXT | Cor dos embeds (hex) |
| `welcome_message` | TEXT | Mensagem de boas-vindas |
| `purchase_message` | TEXT | Mensagem de compra |
| `currency` | TEXT | Moeda (BRL, USD, EUR) |
| `stripe_enabled` | BOOLEAN | Stripe ativo |
| `mercadopago_enabled` | BOOLEAN | Mercado Pago ativo |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Índices:**
- Primary Key: `guild_id`

**Exemplo:**
```json
{
  "guild_id": "123456789",
  "log_channel_id": "987654321",
  "embed_color": "#5865F2",
  "currency": "BRL",
  "stripe_enabled": true,
  "mercadopago_enabled": false
}
```

---

### 2. `products`
Produtos disponíveis para venda.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID (PK) | ID único do produto |
| `guild_id` | TEXT | ID do servidor |
| `name` | TEXT | Nome do produto |
| `description` | TEXT | Descrição detalhada |
| `price` | DECIMAL(10,2) | Preço em reais |
| `type` | TEXT | `unique` ou `subscription` |
| `image_url` | TEXT | URL da imagem |
| `stock` | INTEGER | Estoque (null = ilimitado) |
| `role_id` | TEXT | ID da role a conceder |
| `channel_id` | TEXT | ID do canal a criar |
| `delivery_content` | TEXT | Conteúdo a entregar |
| `is_active` | BOOLEAN | Produto ativo |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Índices:**
- Primary Key: `id`
- Index: `guild_id`
- Index: `is_active`

**Constraints:**
- `type` IN ('unique', 'subscription')

**Exemplo:**
```json
{
  "id": "abc-123-def",
  "guild_id": "123456789",
  "name": "Curso de Discord.js",
  "description": "Aprenda a criar bots",
  "price": 197.00,
  "type": "unique",
  "stock": 100,
  "role_id": "111222333",
  "is_active": true
}
```

---

### 3. `transactions`
Histórico de todas as transações.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID (PK) | ID único da transação |
| `guild_id` | TEXT | ID do servidor |
| `product_id` | UUID (FK) | ID do produto |
| `user_id` | TEXT | ID do usuário Discord |
| `amount` | DECIMAL(10,2) | Valor pago |
| `status` | TEXT | Status da transação |
| `payment_provider` | TEXT | Stripe/Mercado Pago/Manual |
| `payment_id` | TEXT | ID do pagamento externo |
| `subscription_id` | TEXT | ID da assinatura (se houver) |
| `expires_at` | TIMESTAMP | Data de expiração (assinaturas) |
| `created_at` | TIMESTAMP | Data da compra |
| `updated_at` | TIMESTAMP | Última atualização |

**Índices:**
- Primary Key: `id`
- Index: `guild_id`
- Index: `user_id`
- Index: `payment_id`
- Index: `status`
- Foreign Key: `product_id` → `products.id`

**Constraints:**
- `status` IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')
- `payment_provider` IN ('stripe', 'mercadopago', 'manual')

**Status:**
- `pending` - Aguardando pagamento
- `completed` - Pagamento confirmado
- `failed` - Pagamento falhou
- `refunded` - Reembolsado
- `cancelled` - Cancelado

**Exemplo:**
```json
{
  "id": "txn-789",
  "guild_id": "123456789",
  "product_id": "abc-123",
  "user_id": "555666777",
  "amount": 197.00,
  "status": "completed",
  "payment_provider": "stripe",
  "payment_id": "pi_abc123"
}
```

---

### 4. `coupons`
Cupons de desconto.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID (PK) | ID único do cupom |
| `guild_id` | TEXT | ID do servidor |
| `code` | TEXT | Código do cupom |
| `discount_percent` | INTEGER | Desconto em % |
| `discount_fixed` | DECIMAL(10,2) | Desconto fixo em R$ |
| `max_uses` | INTEGER | Usos máximos |
| `current_uses` | INTEGER | Usos atuais |
| `expires_at` | TIMESTAMP | Data de expiração |
| `is_active` | BOOLEAN | Cupom ativo |
| `created_at` | TIMESTAMP | Data de criação |

**Índices:**
- Primary Key: `id`
- Index: `guild_id`
- Index: `code`
- Unique: (`guild_id`, `code`)

**Exemplo:**
```json
{
  "id": "coupon-456",
  "guild_id": "123456789",
  "code": "PROMO20",
  "discount_percent": 20,
  "max_uses": 100,
  "current_uses": 47,
  "is_active": true
}
```

---

### 5. `product_feedbacks`
Avaliações de produtos pelos usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID (PK) | ID único do feedback |
| `guild_id` | TEXT | ID do servidor |
| `product_id` | UUID (FK) | ID do produto |
| `user_id` | TEXT | ID do usuário |
| `rating` | INTEGER | Nota de 1 a 5 |
| `comment` | TEXT | Comentário (opcional) |
| `created_at` | TIMESTAMP | Data da avaliação |

**Índices:**
- Primary Key: `id`
- Index: `product_id`
- Unique: (`product_id`, `user_id`)
- Foreign Key: `product_id` → `products.id`

**Constraints:**
- `rating` BETWEEN 1 AND 5

**Exemplo:**
```json
{
  "id": "fb-999",
  "product_id": "abc-123",
  "user_id": "555666777",
  "rating": 5,
  "comment": "Excelente curso!"
}
```

---

### 6. `access_logs`
Logs de acesso e ações dos usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID (PK) | ID único do log |
| `guild_id` | TEXT | ID do servidor |
| `user_id` | TEXT | ID do usuário |
| `product_id` | UUID | ID do produto (opcional) |
| `action` | TEXT | Ação realizada |
| `details` | TEXT | Detalhes adicionais |
| `created_at` | TIMESTAMP | Data da ação |

**Índices:**
- Primary Key: `id`
- Index: `guild_id`
- Index: `user_id`
- Index: `created_at`

**Exemplo:**
```json
{
  "id": "log-111",
  "guild_id": "123456789",
  "user_id": "555666777",
  "action": "compra_realizada",
  "details": "Produto: Curso de Discord.js",
  "created_at": "2024-01-15 10:30:00"
}
```

---

### 7. `temporary_roles`
Roles temporárias (assinaturas).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID (PK) | ID único |
| `guild_id` | TEXT | ID do servidor |
| `user_id` | TEXT | ID do usuário |
| `role_id` | TEXT | ID da role |
| `expires_at` | TIMESTAMP | Data de expiração |
| `created_at` | TIMESTAMP | Data de criação |

**Índices:**
- Primary Key: `id`
- Index: `guild_id`
- Index: `expires_at`

**Exemplo:**
```json
{
  "id": "role-888",
  "guild_id": "123456789",
  "user_id": "555666777",
  "role_id": "999888777",
  "expires_at": "2024-02-15 10:30:00"
}
```

---

## 📊 Views (Estatísticas)

### `product_stats`
Estatísticas agregadas por produto.

```sql
SELECT 
  p.id,
  p.name,
  p.guild_id,
  COUNT(DISTINCT t.id) as total_sales,
  SUM(t.amount) as total_revenue,
  AVG(f.rating) as average_rating,
  COUNT(DISTINCT f.id) as total_reviews
FROM products p
LEFT JOIN transactions t ON p.id = t.product_id AND t.status = 'completed'
LEFT JOIN product_feedbacks f ON p.id = f.product_id
GROUP BY p.id
```

**Campos:**
- `id` - ID do produto
- `name` - Nome do produto
- `guild_id` - ID do servidor
- `total_sales` - Total de vendas
- `total_revenue` - Receita total
- `average_rating` - Nota média
- `total_reviews` - Total de avaliações

---

### `guild_stats`
Estatísticas agregadas por servidor.

```sql
SELECT 
  p.guild_id,
  COUNT(DISTINCT p.id) as active_products,
  COUNT(DISTINCT t.id) as total_transactions,
  SUM(t.amount) as total_revenue,
  COUNT(DISTINCT t.user_id) as unique_customers
FROM products p
LEFT JOIN transactions t ON p.id = t.product_id AND t.status = 'completed'
WHERE p.is_active = true
GROUP BY p.guild_id
```

**Campos:**
- `guild_id` - ID do servidor
- `active_products` - Produtos ativos
- `total_transactions` - Total de transações
- `total_revenue` - Receita total
- `unique_customers` - Clientes únicos

---

## 🔒 Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas para `service_role`:

```sql
CREATE POLICY "Service role has full access" ON [table]
FOR ALL USING (true);
```

Para produção, considere adicionar políticas mais restritivas:

```sql
-- Exemplo: Usuários só veem suas próprias transações
CREATE POLICY "Users can view own transactions" ON transactions
FOR SELECT USING (auth.uid()::text = user_id);
```

---

## 🔄 Triggers

### Atualizar `updated_at`
Todas as tabelas com `updated_at` têm um trigger:

```sql
CREATE TRIGGER update_[table]_updated_at 
BEFORE UPDATE ON [table]
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 📈 Queries Úteis

### Top 10 produtos mais vendidos
```sql
SELECT 
  p.name,
  COUNT(t.id) as sales,
  SUM(t.amount) as revenue
FROM products p
JOIN transactions t ON p.id = t.product_id
WHERE t.status = 'completed'
GROUP BY p.id, p.name
ORDER BY sales DESC
LIMIT 10;
```

### Usuários com mais compras
```sql
SELECT 
  user_id,
  COUNT(*) as total_purchases,
  SUM(amount) as total_spent
FROM transactions
WHERE status = 'completed'
GROUP BY user_id
ORDER BY total_spent DESC
LIMIT 10;
```

### Vendas por dia (últimos 30 dias)
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as sales,
  SUM(amount) as revenue
FROM transactions
WHERE status = 'completed'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Produtos com estoque baixo
```sql
SELECT name, stock
FROM products
WHERE is_active = true
  AND stock IS NOT NULL
  AND stock <= 5
ORDER BY stock ASC;
```

### Cupons mais usados
```sql
SELECT 
  code,
  current_uses,
  max_uses,
  ROUND(current_uses::numeric / NULLIF(max_uses, 0) * 100, 2) as usage_percent
FROM coupons
WHERE is_active = true
ORDER BY current_uses DESC;
```

---

## 🛠️ Manutenção

### Backup
```bash
# Via Supabase CLI
supabase db dump > backup.sql

# Restaurar
supabase db reset
psql -h db.project.supabase.co -U postgres -d postgres < backup.sql
```

### Limpar logs antigos (> 90 dias)
```sql
DELETE FROM access_logs
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Remover roles temporárias expiradas
```sql
DELETE FROM temporary_roles
WHERE expires_at < NOW();
```

### Arquivar transações antigas
```sql
-- Criar tabela de arquivo
CREATE TABLE transactions_archive (LIKE transactions INCLUDING ALL);

-- Mover transações antigas
INSERT INTO transactions_archive
SELECT * FROM transactions
WHERE created_at < NOW() - INTERVAL '1 year';

-- Remover da tabela principal
DELETE FROM transactions
WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## 📊 Monitoramento

### Tamanho das tabelas
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Contagem de registros
```sql
SELECT 
  'products' as table, COUNT(*) as count FROM products
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'coupons', COUNT(*) FROM coupons
UNION ALL
SELECT 'feedbacks', COUNT(*) FROM product_feedbacks
UNION ALL
SELECT 'logs', COUNT(*) FROM access_logs
UNION ALL
SELECT 'temp_roles', COUNT(*) FROM temporary_roles;
```

---

## 🔍 Debugging

### Ver transações pendentes há mais de 1 hora
```sql
SELECT 
  t.*,
  p.name as product_name
FROM transactions t
JOIN products p ON t.product_id = p.id
WHERE t.status = 'pending'
  AND t.created_at < NOW() - INTERVAL '1 hour';
```

### Produtos sem vendas
```sql
SELECT p.*
FROM products p
LEFT JOIN transactions t ON p.id = t.product_id AND t.status = 'completed'
WHERE p.is_active = true
  AND t.id IS NULL;
```

### Usuários com pagamentos falhados
```sql
SELECT 
  user_id,
  COUNT(*) as failed_payments
FROM transactions
WHERE status = 'failed'
GROUP BY user_id
HAVING COUNT(*) > 2;
```

---

## 📝 Notas

- Use `service_role` key apenas no backend
- Sempre use prepared statements
- Mantenha backups regulares
- Monitore o tamanho do banco
- Limpe logs periodicamente
- Indexe queries lentas

---

**💡 Dica:** Use o Supabase Studio para visualizar e editar dados facilmente!
