# 🤖 Discord Sales Bot

Sistema completo de vendas para Discord com suporte a pagamentos, assinaturas, roles automáticas e painel web administrativo.

## ✨ Funcionalidades

### 🛍️ Sistema de Vendas
- ✅ Gerenciamento completo de produtos (criar, editar, remover)
- ✅ Produtos únicos e assinaturas recorrentes
- ✅ Controle de estoque
- ✅ Catálogo interativo com navegação por botões
- ✅ Sistema de cupons de desconto
- ✅ Múltiplos métodos de pagamento (Stripe e Mercado Pago)

### 💳 Pagamentos
- ✅ Integração com Stripe (cartão de crédito)
- ✅ Integração com Mercado Pago (PIX, boleto, cartão)
- ✅ Webhooks para confirmação automática
- ✅ Pagamento manual (admin confirma)
- ✅ Sistema de assinaturas com renovação automática

### 🎭 Automação Discord
- ✅ Roles automáticas para compradores
- ✅ Roles temporárias para assinaturas
- ✅ Criação de canais privados por compra
- ✅ Notificações DM para compradores
- ✅ Logs detalhados para admins
- ✅ Alertas de estoque baixo

### 🎫 Sistema de Tickets
- ✅ Criação de tickets com categorias e prioridades
- ✅ Painel interativo para abertura de tickets
- ✅ Sistema de assumir tickets por moderadores
- ✅ Notificações automáticas para moderadores online
- ✅ Canais privados para cada ticket
- ✅ Estatísticas e tempo médio de resolução
- ✅ Sistema de fechamento com logs

### 📢 Anúncios e Notificações
- ✅ Criação de anúncios com embeds personalizados
- ✅ Agendamento automático de anúncios
- ✅ Sistema de broadcast DM em massa
- ✅ Targeting por roles específicas
- ✅ Anúncios com imagens e cores customizáveis
- ✅ Gerenciamento completo (criar, agendar, cancelar, listar)

### 🧠 Inteligência Artificial
- ✅ Chat inteligente com contexto
- ✅ Geração automática de conteúdo (anúncios, posts, emails)
- ✅ Moderação automática de conteúdo
- ✅ Assistente administrativo para tarefas complexas
- ✅ Análise de sentimento
- ✅ Sugestões de respostas para tickets
- ✅ Estatísticas de uso e custos de IA

### 🎛️ Painel de Gerenciamento
- ✅ Painel interativo com botões e navegação moderna
- ✅ Interface unificada para todas as funcionalidades
- ✅ Atalhos rápidos para ações comuns
- ✅ Estatísticas em tempo real
- ✅ Design moderno e intuitivo

### 📊 Dashboard Web
- ✅ Painel web com Next.js + Tailwind CSS
- ✅ Estatísticas em tempo real
- ✅ Histórico de transações
- ✅ Gerenciamento de produtos via interface web
- ✅ Visualização de métricas e relatórios

### 🔧 Configuração
- ✅ Multitenant (suporte para múltiplos servidores)
- ✅ Configurações personalizadas por servidor
- ✅ Setup automático via comando
- ✅ Cores e mensagens customizáveis

## 🚀 Instalação

### Pré-requisitos
- Node.js 20+
- Conta Discord Developer
- Projeto Supabase
- Conta Stripe e/ou Mercado Pago (opcional)

### 1. Clone o repositório
```bash
git clone <url-do-repo>
cd discord-sales-bot
```

### 2. Instale as dependências
```bash
# Bot
npm install

# Dashboard (opcional)
cd dashboard
npm install
cd ..
```

### 3. Configure o Discord Bot

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação
3. Vá em "Bot" e crie um bot
4. Copie o token do bot
5. Em "OAuth2" > "URL Generator":
   - Selecione scope: `bot` e `applications.commands`
   - Selecione permissões: `Administrator` (ou permissões específicas)
6. Use a URL gerada para adicionar o bot ao seu servidor

### 4. Configure o Supabase

1. Crie um projeto em [Supabase](https://supabase.com)
2. Copie a URL do projeto e a chave `anon/public`
3. No SQL Editor, execute o arquivo `supabase-schema.sql`
4. Configure as políticas RLS conforme necessário

### 5. Configure variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
# Discord
DISCORD_TOKEN=seu_token_aqui
DISCORD_CLIENT_ID=seu_client_id_aqui

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_anon
SUPABASE_SERVICE_KEY=sua_service_role_key

# Stripe (opcional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mercado Pago (opcional)
MERCADOPAGO_ACCESS_TOKEN=seu_token

# Webhook
WEBHOOK_PORT=3000
WEBHOOK_URL=https://seu-dominio.com
```

### 6. Registre os comandos slash

```bash
npm run deploy-commands
```

### 7. Inicie o bot

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

### 8. Inicie o dashboard (opcional)

```bash
cd dashboard
cp .env.example .env
# Configure as variáveis
npm run dev
```

## 🐳 Deploy com Docker

### Build e run
```bash
docker-compose up -d
```

### Logs
```bash
docker-compose logs -f
```

### Stop
```bash
docker-compose down
```

## 📝 Comandos Disponíveis

### 🎛️ Painel de Gerenciamento
- `/panel` - Painel interativo com todas as funcionalidades

### 🛍️ Vendas e Produtos
- `/addproduct` - Adicionar novo produto
- `/editproduct` - Editar produto existente
- `/removeproduct` - Remover produto
- `/addcoupon` - Criar cupom de desconto
- `/catalogo` - Ver catálogo de produtos
- `/myorders` - Ver suas compras (usuário)
- `/stats` - Ver estatísticas de vendas

### 🎫 Sistema de Tickets
- `/ticket abrir` - Abrir novo ticket de suporte
- `/ticket listar` - Listar tickets (moderadores)
- `/ticket stats` - Ver estatísticas de tickets
- `/ticket setup` - Configurar sistema de tickets
- `/ticket painel` - Criar painel público de tickets

### 📢 Anúncios
- `/anuncio criar` - Criar e enviar anúncio imediatamente
- `/anuncio agendar` - Agendar anúncio para data futura
- `/anuncio listar` - Listar anúncios criados
- `/anuncio cancelar` - Cancelar anúncio agendado
- `/anuncio broadcast` - Enviar DM em massa (use com cuidado)

### 🧠 Inteligência Artificial
- `/ia chat` - Conversar com IA
- `/ia gerar` - Gerar conteúdo automaticamente
- `/ia moderar` - Analisar conteúdo com moderação IA
- `/ia assistente` - Assistente para tarefas administrativas
- `/ia stats` - Ver estatísticas de uso de IA

### ⚙️ Configuração
- `/config` - Configurar bot no servidor

## 🔧 Configuração do Servidor

### Setup Automático
```
/config setup
```
Este comando criará automaticamente:
- Categoria de vendas
- Canal de logs
- Configurações padrão

### Configurações Manuais
```
/config logchannel #canal - Define canal de logs
/config category categoria - Define categoria de vendas
/config color #5865F2 - Define cor dos embeds
/config currency BRL - Define moeda
/config payment stripe:true - Ativa Stripe
```

## 💡 Exemplos de Uso

### Criar um Produto
```
/addproduct
  nome: Curso de Discord.js
  descricao: Aprenda a criar bots incríveis
  preco: 97.00
  tipo: único
  imagem: https://example.com/curso.png
  role: @Aluno
```

### Criar uma Assinatura
```
/addproduct
  nome: Assinatura Premium
  descricao: Acesso VIP por 30 dias
  preco: 29.90
  tipo: assinatura
  role: @VIP
```

### Criar Cupom
```
/addcoupon
  codigo: PROMO10
  desconto_percentual: 10
  max_usos: 100
  dias_validade: 30
```

### Configurar Sistema de Tickets
```
/ticket setup
  categoria: @Tickets
  role_suporte: @Moderador
  canal_logs: #logs-tickets
  notificar_mods: true
```

### Criar Painel de Tickets
```
/ticket painel
  canal: #suporte
```

### Criar Anúncio
```
/anuncio criar
  titulo: 🎉 Nova Funcionalidade!
  conteudo: Estamos felizes em anunciar nossa nova feature de IA!
  canal: #anuncios
  mencionar_role: @everyone
  cor: #FF6B6B
```

### Agendar Anúncio
```
/anuncio agendar
  titulo: Promoção de Final de Ano
  conteudo: Aproveite 50% de desconto em todos os produtos!
  canal: #anuncios
  data_hora: 31/12/2024 23:59
```

### Gerar Conteúdo com IA
```
/ia gerar
  tipo: Anúncio
  especificacoes: Anúncio para um curso de programação Python, público-alvo iniciantes, tom entusiasmado
```

### Chat com IA
```
/ia chat
  mensagem: Como posso melhorar o engajamento no meu servidor Discord?
```

### Moderar Conteúdo
```
/ia moderar
  texto: [texto para analisar]
```

## 🔄 Webhooks

### Configurar Stripe Webhook

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Adicione endpoint: `https://seu-dominio.com/webhooks/stripe`
3. Eventos necessários:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.paid`
   - `customer.subscription.deleted`
4. Copie o webhook secret para `.env`

### Configurar Mercado Pago Webhook

1. Acesse configurações da aplicação Mercado Pago
2. Configure URL de notificação: `https://seu-dominio.com/webhooks/mercadopago`
3. Eventos: `payment`

## 🧪 Testes

### Simular Compra (Desenvolvimento)
Execute o arquivo de teste:
```bash
npm run test:purchase
```

### Testar Webhooks Localmente
Use [ngrok](https://ngrok.com/) para expor seu servidor local:
```bash
ngrok http 3000
```
Use a URL gerada nos webhooks do Stripe/Mercado Pago.

## 📊 Estrutura do Projeto

```
discord-sales-bot/
├── src/
│   ├── commands/        # Comandos slash
│   │   ├── addproduct.ts
│   │   ├── catalogo.ts
│   │   ├── config.ts
│   │   └── ...
│   ├── events/          # Eventos Discord
│   │   ├── ready.ts
│   │   ├── interactionCreate.ts
│   │   └── guildCreate.ts
│   ├── utils/           # Utilidades
│   │   ├── supabase.ts
│   │   ├── payments.ts
│   │   ├── roleManager.ts
│   │   ├── channelManager.ts
│   │   └── logger.ts
│   ├── webhooks/        # Handlers de webhooks
│   │   ├── server.ts
│   │   ├── stripeWebhook.ts
│   │   ├── mercadoPagoWebhook.ts
│   │   └── deliveryHandler.ts
│   ├── types/           # Tipos TypeScript
│   │   └── index.ts
│   ├── index.ts         # Arquivo principal
│   └── deploy-commands.ts
├── dashboard/           # Painel web Next.js
│   ├── app/
│   ├── components/
│   └── ...
├── supabase-schema.sql  # Schema do banco
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## 🛡️ Segurança

- ✅ Service role key do Supabase em variável de ambiente
- ✅ Validação de webhooks com assinaturas
- ✅ Row Level Security (RLS) no Supabase
- ✅ Roles temporárias com expiração automática
- ✅ Logs detalhados de todas as ações

## 🔍 Troubleshooting

### Bot não conecta
- Verifique se o token está correto
- Confirme que todas as intents necessárias estão habilitadas

### Comandos não aparecem
- Execute `npm run deploy-commands`
- Aguarde até 1 hora para propagação global
- Force comandos por servidor adicionando GUILD_ID

### Webhooks não funcionam
- Verifique se a URL está acessível publicamente
- Confirme o webhook secret no .env
- Verifique logs do servidor de webhooks

### Pagamentos não confirmam
- Teste webhooks localmente com ngrok
- Verifique logs do Stripe/Mercado Pago
- Confirme que os eventos corretos estão configurados

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar documentação

## 📄 Licença

MIT License - veja LICENSE para detalhes.

## 💬 Suporte

- Documentação: Este README
- Issues: Use o GitHub Issues
- Discord: [Seu servidor de suporte]

## 🎯 Roadmap

- [x] Sistema de tickets ✅
- [x] Sistema de anúncios ✅
- [x] Painel de gerenciamento interativo ✅
- [x] Integração com IA (OpenAI) ✅
- [x] Sistema de notificações automáticas ✅
- [ ] Sistema de afiliados
- [ ] Integração com PayPal
- [ ] Painel de analytics avançado
- [ ] API REST para integrações
- [ ] Sistema de gamificação
- [ ] Multi-idioma
- [ ] Sistema de reviews e avaliações de produtos
- [ ] Integração com mais provedores de pagamento
- [ ] Sistema de cashback e rewards

## 📚 Recursos Adicionais

- [Discord.js Guide](https://discordjs.guide/)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe API](https://stripe.com/docs/api)
- [Mercado Pago API](https://www.mercadopago.com.br/developers)

---

Desenvolvido com ❤️ para a comunidade Discord
