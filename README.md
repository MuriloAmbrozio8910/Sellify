# 🛍️ Sellify Bot - Sistema Completo de Vendas para Discord

Bot profissional de vendas automáticas com sistema de tickets, cupons, assinaturas, personalização visual completa e muito mais.

---

## 📋 Índice

- [Características](#-características)
- [Instalação](#-instalação)
- [Configuração Inicial](#-configuração-inicial)
- [Comandos](#-comandos)
- [Sistema de Personalização](#-sistema-de-personalização)
- [Banco de Dados](#-banco-de-dados)
- [Funcionalidades Detalhadas](#-funcionalidades-detalhadas)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Características

### 🛒 **Sistema de Vendas**
- ✅ Vendas automáticas via Discord
- ✅ Pagamentos via Mercado Pago e Stripe
- ✅ PIX, Boleto e Cartão de Crédito
- ✅ Entrega automática de produtos
- ✅ Sistema de assinaturas (recorrente)
- ✅ Controle de estoque
- ✅ Cupons de desconto
- ✅ Logs completos de transações

### 🎫 **Sistema de Tickets**
- ✅ Tickets de suporte
- ✅ Categorias personalizadas
- ✅ Role de suporte configurável
- ✅ Canal de logs
- ✅ Notificações automáticas
- ✅ Limite de tickets por usuário
- ✅ Estatísticas completas

### 🎨 **Personalização Visual**
- ✅ **100% personalizável** - Todos os textos, cores e imagens
- ✅ Interface interativa com botões e modais
- ✅ Pré-visualização antes de salvar
- ✅ Variáveis dinâmicas
- ✅ Templates por sistema (Tickets, Anúncios, Catálogo, Compras)

### 📢 **Sistema de Anúncios**
- ✅ Anúncios imediatos e agendados
- ✅ Broadcast por DM
- ✅ Filtro por roles
- ✅ Histórico de anúncios

### 🤖 **Inteligência Artificial**
- ✅ Chatbot integrado
- ✅ Moderação automática
- ✅ Assistente virtual
- ✅ Integração com OpenAI/Anthropic

### 🔧 **Automação**
- ✅ Auto-roles para novos membros
- ✅ Mensagens de boas-vindas
- ✅ Limpeza automática de mensagens
- ✅ Relatórios automáticos

### ⭐ **Sistema de Avaliações**
- ✅ Avaliação de produtos (1-5 estrelas)
- ✅ Avaliação de vendedores/atendentes
- ✅ Comentários e feedback
- ✅ Rankings e estatísticas
- ✅ Top 10 produtos e vendedores
- ✅ Sistema de aprovação
- ✅ Avaliações anônimas

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 16.x ou superior
- npm ou yarn
- Conta no Supabase
- Conta no Mercado Pago e/ou Stripe (opcional)
- Bot do Discord criado

### Passo 1: Clonar e Instalar Dependências

```bash
# Clonar repositório
git clone <url-do-repo>
cd "Sellify Bot"

# Instalar dependências
npm install
```

### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Discord
DISCORD_TOKEN=seu_token_do_bot
DISCORD_CLIENT_ID=id_do_cliente
DISCORD_GUILD_ID=id_do_servidor_principal

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_anon

# Pagamentos (Opcional)
MERCADO_PAGO_ACCESS_TOKEN=seu_token
STRIPE_SECRET_KEY=sua_chave_secreta
STRIPE_WEBHOOK_SECRET=seu_webhook_secret

# IA (Opcional)
OPENAI_API_KEY=sua_chave_openai
ANTHROPIC_API_KEY=sua_chave_anthropic
```

### Passo 3: Configurar Banco de Dados

Execute os scripts SQL na pasta `database/migrations/` no Supabase:

```bash
# Ordem de execução:
1. create_tables.sql
2. create_customizations_table.sql
3. create_reviews_table.sql
```

### Passo 4: Compilar e Executar

```bash
# Compilar TypeScript
npm run build

# Registrar comandos no Discord
npm run deploy

# Iniciar bot
npm start

# Modo desenvolvimento (auto-reload)
npm run dev
```

---

## ⚙️ Configuração Inicial

### 1. Configurar Bot

```bash
/configurar setup
```

Isso criará automaticamente:
- Categoria de vendas
- Canal de logs
- Roles necessárias

### 2. Configurar Pagamentos

```bash
/configurar payment-set

# Mercado Pago
Provider: mercadopago
Access Token: SEU_TOKEN

# Stripe
Provider: stripe
Secret Key: SUA_SECRET_KEY
Webhook Secret: SEU_WEBHOOK_SECRET
```

### 3. Configurar Tickets

```bash
/ticket config

# Configure:
📁 Categoria - Onde os tickets serão criados
👥 Role de Suporte - Quem pode gerenciar
📋 Canal de Logs - Registro de ações
💬 Mensagem - Boas-vindas personalizada
🔔 Notificações - Alertar moderadores
📊 Limite - Tickets por usuário
```

### 4. Adicionar Produtos

```bash
/adicionar-produto

# Preencha:
- Nome do produto
- Descrição
- Preço
- Estoque (opcional)
- URL da imagem (opcional)
- Role a dar (opcional)
- Tipo: único ou assinatura
```

---

## 📝 Comandos

### Produtos e Vendas

| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/adicionar-produto` | Adicionar produto ao catálogo | Admin |
| `/editar-produto [id]` | Editar produto existente | Admin |
| `/remover-produto [id]` | Remover produto | Admin |
| `/catalogo ver [página]` | Ver catálogo de produtos | Todos |
| `/meus-pedidos` | Ver suas compras | Todos |
| `/avaliar produto` | Avaliar produto comprado | Todos |

### Cupons

| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/adicionar-cupom` | Criar cupom de desconto | Admin |

### Avaliações

| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/avaliar produto` | Avaliar produto que você comprou | Todos |
| `/avaliar vendedor [usuário] [categoria]` | Avaliar vendedor/atendente | Todos |

### Tickets

| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/ticket abrir [assunto]` | Abrir ticket de suporte | Todos |
| `/ticket listar` | Listar tickets | Admin |
| `/ticket stats` | Estatísticas de tickets | Admin |
| `/ticket config` | Configurar sistema de tickets | Admin |
| `/ticket setup` | Personalizar aparência | Admin |
| `/ticket painel [canal]` | Criar painel de tickets | Admin |

### Anúncios

| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/anuncio criar [canal]` | Criar anúncio | Admin |
| `/anuncio agendar` | Agendar anúncio | Admin |
| `/anuncio listar` | Listar anúncios | Admin |
| `/anuncio cancelar [id]` | Cancelar anúncio agendado | Admin |
| `/anuncio broadcast` | Enviar DM em massa | Admin |
| `/anuncio setup` | Personalizar aparência | Admin |

### Configuração

| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/configurar view` | Ver configurações atuais | Admin |
| `/configurar setup` | Configuração inicial | Admin |
| `/configurar currency [moeda]` | Definir moeda | Admin |
| `/configurar payment-set` | Configurar pagamento | Admin |
| `/configurar payment-delete` | Remover configuração | Admin |

### Personalização

| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/ticket setup` | Personalizar tickets | Admin |
| `/anuncio setup` | Personalizar anúncios | Admin |
| `/catalogo setup` | Personalizar catálogo | Admin |

### Gerenciamento

| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/painel` | Painel de controle interativo | Admin |
| `/estatisticas` | Estatísticas de vendas | Admin |

### Inteligência Artificial

| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/ia chat [mensagem]` | Conversar com IA | Todos |
| `/ia assistente` | Assistente virtual | Admin |
| `/ia moderar [texto]` | Moderar conteúdo | Admin |

---

## 🎨 Sistema de Personalização

O bot possui um sistema completo de personalização visual. Você pode customizar **TUDO** sem tocar em código!

### Como Personalizar

Execute o comando de setup do sistema que deseja personalizar:

```bash
# Personalizar Tickets
/ticket setup

# Personalizar Anúncios
/anuncio setup

# Personalizar Catálogo
/catalogo setup
```

### O Que Pode Ser Personalizado

#### 📝 Textos
- Título do embed
- Descrição
- Mensagens personalizadas

#### 🎨 Visual
- Cor do embed (HEX)
- Imagem grande (banner)
- Thumbnail (ícone)

#### 👤 Informações
- Autor (nome, ícone, URL)
- Rodapé (texto e ícone)
- Timestamp

#### 🏷️ Campos
- Adicionar campos personalizados
- Nome e valor configuráveis
- Inline ou empilhados

#### 🔘 Botões
- Texto personalizado
- Estilo (Primary, Secondary, Success, Danger)
- Emoji customizado

### Variáveis Dinâmicas

Use variáveis para conteúdo dinâmico:

#### Tickets
- `{user}` - Usuário que abriu
- `{ticket_id}` - ID do ticket
- `{category}` - Categoria

#### Anúncios
- `{user}` - Criador do anúncio
- `{date}` - Data de criação
- `{server}` - Nome do servidor

#### Catálogo
- `{page}` - Página atual
- `{total}` - Total de páginas
- `{count}` - Número de produtos

#### Compras
- `{product_name}` - Nome do produto
- `{product_price}` - Preço
- `{user}` - Comprador

### Exemplo de Uso

```bash
# 1. Executar comando
/ticket setup

# 2. Clicar nos botões para personalizar:
📝 Título → "🎫 Suporte Premium 24/7"
📄 Descrição → "Nossa equipe está pronta para ajudar!"
🎨 Cor → #FFD700
👤 Autor → "Equipe de Suporte" + logo.png
🏷️ Campo → "⏰ Horário" | "24 horas por dia"
📝 Rodapé → "Tempo médio de resposta: 5 minutos"
🔘 Botão → "✨ Abrir Chamado VIP" (success)

# 3. Pré-visualizar
Clique em "👁️ Pré-visualizar"

# 4. Salvar
Clique em "💾 Salvar Tudo"
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

#### `products`
Catálogo de produtos
```sql
- id (uuid)
- guild_id (text)
- name (text)
- description (text)
- price (numeric)
- stock (integer)
- type (text) - 'one_time' ou 'subscription'
- role_id (text)
- image_url (text)
- is_active (boolean)
```

#### `transactions`
Histórico de vendas
```sql
- id (uuid)
- guild_id (text)
- user_id (text)
- product_id (uuid)
- amount (numeric)
- status (text)
- payment_method (text)
- payment_id (text)
- created_at (timestamp)
```

#### `coupons`
Cupons de desconto
```sql
- id (uuid)
- guild_id (text)
- code (text)
- discount_type (text)
- discount_value (numeric)
- max_uses (integer)
- current_uses (integer)
- is_active (boolean)
```

#### `tickets`
Sistema de tickets
```sql
- id (uuid)
- guild_id (text)
- user_id (text)
- channel_id (text)
- subject (text)
- category (text)
- priority (text)
- status (text)
- assigned_to (text)
- created_at (timestamp)
- closed_at (timestamp)
```

#### `ticket_config`
Configurações de tickets
```sql
- guild_id (text)
- ticket_category_id (text)
- support_role_id (text)
- log_channel_id (text)
- welcome_message (text)
- auto_notify_moderators (boolean)
- max_open_tickets_per_user (integer)
```

#### `customizations`
Personalizações visuais
```sql
- guild_id (text)
- customization_type (text)
- customization_data (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `announcements`
Sistema de anúncios
```sql
- id (uuid)
- guild_id (text)
- created_by (text)
- title (text)
- content (text)
- channel_id (text)
- status (text)
- scheduled_for (timestamp)
```

#### `automation_config`
Configurações de automação
```sql
- guild_id (text)
- config_type (text)
- config_data (jsonb)
- updated_at (timestamp)
```

#### `automation_tasks`
Tarefas agendadas
```sql
- id (uuid)
- guild_id (text)
- task_type (text)
- channel_id (text)
- config (jsonb)
- interval_hours (integer)
- next_run (timestamp)
- is_active (boolean)
```

#### `product_reviews`
Avaliações de produtos
```sql
- id (uuid)
- guild_id (text)
- product_id (uuid)
- user_id (text)
- transaction_id (uuid)
- rating (integer) - 1 a 5 estrelas
- comment (text)
- is_anonymous (boolean)
- is_approved (boolean)
- created_at (timestamp)
```

#### `seller_reviews`
Avaliações de vendedores
```sql
- id (uuid)
- guild_id (text)
- seller_id (text)
- reviewer_id (text)
- ticket_id (uuid)
- transaction_id (uuid)
- rating (integer) - 1 a 5 estrelas
- comment (text)
- category (text) - support, sales, general
- is_anonymous (boolean)
- is_approved (boolean)
- created_at (timestamp)
```

---

## 🛠️ Funcionalidades Detalhadas

### Sistema de Avaliações

#### Avaliações de Produtos
- ⭐ Clientes podem avaliar produtos comprados (1-5 estrelas)
- 💬 Comentários opcionais
- 👤 Opção de avaliação anônima
- 📊 Estatísticas e rankings
- 🏆 Top 10 produtos mais bem avaliados
- ✅ Sistema de aprovação por moderadores

#### Avaliações de Vendedores
- ⭐ Avaliação de atendentes e vendedores (1-5 estrelas)
- 📝 Feedback sobre suporte, vendas ou atendimento geral
- 🎫 Vinculado a tickets e transações
- 🌟 Ranking de melhores vendedores
- 💼 Categorias: Suporte, Vendas, Geral

#### Como Funciona

**Para Clientes:**
```bash
# Avaliar produto após compra
/avaliar produto
→ Selecione produto
→ Dê nota de 1-5 estrelas
→ Adicione comentário (opcional)

# Avaliar vendedor/atendente
/avaliar vendedor @vendedor categoria:suporte
→ Dê nota de 1-5 estrelas
→ Escreva feedback
```

**Para Administradores:**
```bash
# Acessar painel de avaliações
/painel → ⭐ Avaliações

# Ver avaliações de produtos
→ 🛍️ Produtos

# Ver avaliações de vendedores
→ 👤 Vendedores

# Ver rankings
→ 🏆 Top Produtos
→ 🌟 Top Vendedores
```

### Sistema de Pagamentos

#### Mercado Pago
- ✅ PIX instantâneo
- ✅ Boleto bancário
- ✅ Cartão de crédito
- ✅ Webhooks automáticos
- ✅ Confirmação em tempo real

#### Stripe
- ✅ Cartão de crédito internacional
- ✅ Assinaturas recorrentes
- ✅ Gestão de cancelamentos
- ✅ Webhooks automáticos

### Sistema de Entrega

#### Produtos Digitais
- Entrega automática via DM
- Canal privado temporário
- Role automática (se configurada)

#### Assinaturas
- Renovação automática mensal
- Role temporária
- Notificações de renovação
- Cancelamento automático se falhar

### Sistema de Logs

Todos os eventos são registrados:
- 📝 Vendas completas
- ❌ Vendas canceladas
- 🎫 Tickets abertos/fechados
- 📢 Anúncios enviados
- ⚙️ Configurações alteradas
- 🔄 Assinaturas renovadas

### Sistema de Automação

#### Auto-Roles
Atribuir role automaticamente para novos membros

```bash
/painel → Automações → Auto-Roles
```

#### Mensagens de Boas-vindas
Enviar mensagem quando alguém entra

```bash
/painel → Automações → Boas-vindas
```

#### Limpeza Automática
Deletar mensagens antigas automaticamente

```bash
/painel → Automações → Tarefas → Limpeza
```

#### Relatórios Automáticos
Relatórios de vendas automáticos (diário/semanal/mensal)

```bash
/painel → Automações → Tarefas → Relatórios
```

---

## 📊 Estatísticas

### Ver Estatísticas de Vendas

```bash
/estatisticas
```

**Você verá:**
- 💰 Total de vendas
- 🛒 Número de transações
- 📈 Ticket médio
- 👥 Top compradores
- 📦 Produtos mais vendidos
- 📅 Vendas por período

### Ver Estatísticas de Tickets

```bash
/ticket stats
```

**Você verá:**
- 📈 Total de tickets
- 🟢 Tickets abertos
- 🟡 Em atendimento
- 🔴 Fechados
- ⏱️ Tempo médio de resolução
- 📊 Taxa de resolução

---

## 🎯 Fluxo de Uso Típico

### Para Administradores

```bash
# 1. Configuração Inicial
/configurar setup

# 2. Configurar Pagamento
/configurar payment-set

# 3. Adicionar Produtos
/adicionar-produto

# 4. Configurar Tickets
/ticket config

# 5. Personalizar Visual (opcional)
/ticket setup
/catalogo setup

# 6. Criar Painéis
/ticket painel canal:#suporte
/catalogo ver

# 7. Gerenciar
/painel (painel interativo)
/estatisticas (ver vendas)
```

### Para Usuários

```bash
# 1. Ver Produtos
/catalogo ver

# 2. Comprar
(Clique no botão do produto no catálogo)

# 3. Abrir Ticket
/ticket abrir assunto:Dúvida

# 4. Ver Compras
/meus-pedidos
```

---

## 🔧 Troubleshooting

### Bot não responde

**Causa:** Token inválido ou bot offline

**Solução:**
```bash
# Verificar .env
DISCORD_TOKEN=seu_token_correto

# Reiniciar bot
npm start
```

### Erro ao adicionar produto

**Causa:** Tabelas não criadas no Supabase

**Solução:**
```bash
# Execute os scripts SQL no Supabase
database/migrations/create_tables.sql
```

### Pagamento não funciona

**Causa:** Credenciais não configuradas

**Solução:**
```bash
/configurar payment-set
# Configure Mercado Pago ou Stripe
```

### Tickets não são criados na categoria

**Causa:** Categoria não configurada

**Solução:**
```bash
/ticket config
# Configure a categoria desejada
```

### Customização não aparece

**Causa:** Não salvou as alterações

**Solução:**
```bash
# Sempre clicar em "💾 Salvar Tudo" após personalizar
```

### Erro "Cannot find module"

**Causa:** Não compilou após mudanças

**Solução:**
```bash
npm run build
npm start
```

---

## 🚨 Segurança

### Boas Práticas

✅ **NUNCA** commite o arquivo `.env`
✅ Use variáveis de ambiente para credenciais
✅ Configure permissões corretas no Discord
✅ Use roles específicas para admin
✅ Ative logs de segurança
✅ Monitore transações suspeitas

### Permissões Necessárias do Bot

- ✅ Gerenciar Canais
- ✅ Gerenciar Roles
- ✅ Gerenciar Mensagens
- ✅ Enviar Mensagens
- ✅ Incorporar Links
- ✅ Adicionar Reações
- ✅ Ler Histórico de Mensagens

---

## 📈 Atualizações

### Versão Atual: 1.0.0

**Recursos:**
- ✅ Sistema completo de vendas
- ✅ Tickets de suporte
- ✅ Personalização visual 100%
- ✅ Cupons de desconto
- ✅ Assinaturas
- ✅ Automação
- ✅ IA integrada
- ✅ Anúncios programados

---

## 💡 Dicas e Truques

### 1. Use Variáveis para Dinamismo
```
Rodapé: "Enviado por {user} em {date}"
→ Atualiza automaticamente!
```

### 2. Pré-visualize Sempre
```
Antes de salvar, use "👁️ Pré-visualizar"
→ Veja exatamente como ficará
```

### 3. Organize com Categorias
```
Crie categorias no Discord:
📦 PRODUTOS
🎫 TICKETS
📊 LOGS
→ Mantém tudo organizado
```

### 4. Use Cupons Estrategicamente
```
PRIMEIRA-COMPRA → 10% de desconto
VIP2024 → 20% de desconto
NATAL → 30% de desconto (limitado)
```

### 5. Configure Logs
```
Canal de logs mostra TUDO que acontece
→ Auditoria completa
```

### 6. Use o Painel Interativo
```
/painel
→ Acesso rápido a tudo
```

---

## 🆘 Suporte

### Documentação
- Todos os comandos possuem descrições detalhadas
- Use `/comando --help` para mais informações

### Comunidade
- Abra issues no GitHub para bugs
- Pull requests são bem-vindos!

---

## 📜 Licença

Este projeto é de código aberto. Use, modifique e distribua livremente.

---

## 🎉 Agradecimentos

Desenvolvido com ❤️ para facilitar vendas no Discord.

**Tecnologias utilizadas:**
- Discord.js
- TypeScript
- Supabase
- Mercado Pago API
- Stripe API
- OpenAI API

---

**🚀 Pronto para vender? Configure seu bot agora!**

```bash
npm install
npm run build
npm run deploy
npm start
```

**💎 Boa sorte com suas vendas!**
