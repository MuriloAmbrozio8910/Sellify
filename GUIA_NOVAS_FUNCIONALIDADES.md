# 🚀 Guia de Novas Funcionalidades

Este guia apresenta as novas funcionalidades implementadas no bot.

## 📋 Índice

1. [Painel de Gerenciamento](#painel-de-gerenciamento)
2. [Sistema de Tickets](#sistema-de-tickets)
3. [Sistema de Anúncios](#sistema-de-anúncios)
4. [Inteligência Artificial](#inteligência-artificial)
5. [Configuração Inicial](#configuração-inicial)

---

## 🎛️ Painel de Gerenciamento

### Comando Principal
```
/panel
```

### O que é?
Um painel interativo centralizado com botões para acessar todas as funcionalidades do bot de forma rápida e intuitiva.

### Recursos
- 📊 Visualização de estatísticas em tempo real
- 🛍️ Acesso rápido a produtos e vendas
- 🎫 Gestão de tickets
- 📢 Gerenciamento de anúncios
- 🧠 Recursos de IA
- ⚙️ Configurações do servidor

### Como Usar
1. Execute `/panel` em qualquer canal
2. Clique nos botões para navegar entre diferentes painéis
3. Use o botão "Atualizar" para recarregar as estatísticas

---

## 🎫 Sistema de Tickets

### Configuração Inicial

#### 1. Configurar o Sistema
```
/ticket setup
  categoria: Selecione uma categoria para tickets
  role_suporte: Selecione a role de moderadores
  canal_logs: Selecione canal de logs
  notificar_mods: true
```

#### 2. Criar Painel Público
```
/ticket painel
  canal: #suporte
```

Isso criará um painel bonito no canal escolhido onde usuários podem clicar em botões para abrir tickets.

### Para Usuários

#### Abrir Ticket via Comando
```
/ticket abrir
  assunto: Problema com pagamento
  categoria: Vendas
  prioridade: Média
```

#### Abrir Ticket via Painel
1. Vá ao canal com o painel de tickets
2. Clique em um dos botões (Vendas, Suporte, Dúvida, etc)
3. Preencha o formulário que aparece
4. Um canal privado será criado automaticamente

### Para Moderadores

#### Assumir Ticket
No canal do ticket, clique no botão "✋ Assumir Ticket"

#### Fechar Ticket
No canal do ticket, clique no botão "🔒 Fechar Ticket"

#### Ver Todos os Tickets
```
/ticket listar
  status: [opcional: open, claimed, closed]
```

#### Estatísticas
```
/ticket stats
```

### Recursos Avançados
- ✅ Notificação automática para moderadores online
- ✅ Sistema de prioridades (Baixa, Média, Alta, Urgente)
- ✅ Categorização de tickets
- ✅ Tempo médio de resolução
- ✅ Histórico completo

---

## 📢 Sistema de Anúncios

### Criar Anúncio Imediato

```
/anuncio criar
  titulo: 🎉 Grande Promoção!
  conteudo: Todos os produtos com 30% de desconto hoje!
  canal: #anuncios
  mencionar_role: @Clientes (ou deixe vazio para @everyone)
  cor: #FF6B6B
  imagem: https://url-da-imagem.com/banner.png
```

O anúncio será enviado imediatamente com um embed bonito.

### Agendar Anúncio

```
/anuncio agendar
  titulo: Black Friday está chegando!
  conteudo: Prepare-se para as melhores ofertas do ano!
  canal: #anuncios
  data_hora: 29/11/2024 00:00
  mencionar_role: @everyone
```

O bot enviará automaticamente na data/hora especificada.

### Gerenciar Anúncios

#### Listar Anúncios
```
/anuncio listar
  status: [opcional: draft, scheduled, sent, cancelled]
```

#### Cancelar Anúncio Agendado
```
/anuncio cancelar
  id: [ID do anúncio]
```

### Broadcast DM (Use com Cuidado!)

```
/anuncio broadcast
  titulo: Mensagem Importante
  conteudo: Mudanças importantes no servidor...
  role_alvo: @VIP (ou deixe vazio para todos)
```

**⚠️ ATENÇÃO:** Isso enviará DM para todos os membros! Use apenas quando realmente necessário.

### Boas Práticas
- ✅ Use cores atraentes mas profissionais
- ✅ Adicione imagens relevantes
- ✅ Seja claro e objetivo no conteúdo
- ✅ Agende anúncios para horários de pico
- ❌ Não abuse do broadcast DM

---

## 🧠 Inteligência Artificial

### Configuração
Adicione sua chave da OpenAI no arquivo `.env`:
```
OPENAI_API_KEY=sk-your_openai_api_key
```

### 1. Chat Inteligente

```
/ia chat
  mensagem: Como posso aumentar as vendas no meu servidor?
```

A IA responderá com sugestões personalizadas e inteligentes.

### 2. Geração de Conteúdo

#### Gerar Anúncio
```
/ia gerar
  tipo: Anúncio
  especificacoes: Anúncio para promoção de Black Friday, produtos digitais, tom urgente e empolgante
```

#### Gerar Descrição de Produto
```
/ia gerar
  tipo: Descrição de Produto
  especificacoes: Curso completo de Python para iniciantes, 40 horas, certificado incluso
```

#### Gerar Mensagem de Boas-vindas
```
/ia gerar
  tipo: Mensagem de Boas-vindas
  especificacoes: Servidor de vendas de cursos online, tom amigável e profissional
```

#### Gerar Email
```
/ia gerar
  tipo: Email
  especificacoes: Email de confirmação de compra, agradecer cliente, tom profissional
```

#### Gerar Post para Redes Sociais
```
/ia gerar
  tipo: Post para Redes Sociais
  especificacoes: Divulgar novo curso de JavaScript, público iniciantes, tom motivacional
```

### 3. Moderação Automática

```
/ia moderar
  texto: [texto para analisar]
```

A IA analisará o conteúdo e detectará:
- Discurso de ódio
- Assédio
- Conteúdo sexual inapropriado
- Violência
- Auto-mutilação
- E muito mais

Retorna:
- ✅/❌ Aprovado ou sinalizado
- Categorias detectadas
- Nível de severidade (baixa, média, alta)

### 4. Assistente Administrativo

```
/ia assistente
  tarefa: Quero organizar um evento de lançamento de produto no servidor
```

A IA quebrará a tarefa em etapas acionáveis:
1. Criar canal de evento
2. Preparar anúncios
3. Configurar roles
4. Etc.

### 5. Estatísticas de Uso

```
/ia stats
  dias: 30
```

Visualize:
- Total de interações
- Tokens usados
- Custo estimado (em USD)
- Uso por tipo de interação

### Casos de Uso Práticos

#### Criar Campanha Completa
1. Use `/ia gerar tipo:Anúncio` para criar o texto
2. Use `/anuncio criar` com o texto gerado
3. Use `/ia gerar tipo:Post` para divulgar nas redes
4. Agende follow-ups com `/anuncio agendar`

#### Melhorar Produto
1. Use `/ia chat` para pedir sugestões de melhoria
2. Use `/ia gerar tipo:Descrição de Produto` para nova descrição
3. Use `/editproduct` para atualizar

#### Gerenciar Tickets com IA
Ao responder um ticket complexo, use `/ia chat` para obter sugestões de resposta profissional.

---

## ⚙️ Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

Isso instalará a nova dependência `openai` automaticamente.

### 2. Executar Migração do Banco

No Supabase SQL Editor, execute:
```sql
-- Execute o arquivo migration-tickets-announcements.sql
```

Isso criará todas as tabelas necessárias:
- `support_tickets`
- `ticket_messages`
- `ticket_config`
- `announcements`
- `moderator_notifications`
- `ai_interactions`
- `scheduled_automations`

### 3. Configurar Variáveis de Ambiente

Atualize seu `.env`:
```env
# Discord
DISCORD_TOKEN=seu_token
DISCORD_CLIENT_ID=seu_client_id

# Supabase
SUPABASE_URL=sua_url
SUPABASE_KEY=sua_key
SUPABASE_SERVICE_KEY=sua_service_key

# Webhooks
WEBHOOK_PORT=3000
WEBHOOK_URL=https://seu-dominio.com

# OpenAI (NOVO!)
OPENAI_API_KEY=sk-sua_chave_openai
```

### 4. Registrar Novos Comandos

```bash
npm run deploy-commands
```

Isso registrará os novos comandos:
- `/panel`
- `/ticket`
- `/anuncio`
- `/ia`

### 5. Iniciar o Bot

```bash
npm run dev
```

Ou em produção:
```bash
npm run build
npm start
```

### 6. Configurar no Discord

#### Configurar Tickets
```
/ticket setup
```

#### Criar Painel de Tickets
```
/ticket painel canal:#suporte
```

#### Testar Funcionalidades
1. Abra o painel: `/panel`
2. Crie um ticket de teste: `/ticket abrir`
3. Teste a IA: `/ia chat mensagem:Olá!`
4. Crie um anúncio: `/anuncio criar`

---

## 🎨 Personalização

### Cores dos Embeds

Todas as cores são configuráveis:
- Painel: `#5865F2` (azul Discord)
- Tickets: `#5865F2`
- Anúncios: Customizável por anúncio
- IA: `#9B59B6` (roxo)
- Sucesso: `#00FF00`
- Erro: `#FF0000`
- Alerta: `#FFA500`

### Mensagens Customizadas

#### Ticket Welcome Message
```
/ticket setup welcome_message:"Sua mensagem personalizada aqui"
```

### Emojis

Todos os emojis são customizáveis no código. Busque por:
- 🎛️ - Painel
- 🎫 - Tickets
- 📢 - Anúncios
- 🧠 - IA
- ✅ - Sucesso
- ❌ - Erro

---

## 📊 Melhores Práticas

### Sistema de Tickets
1. ✅ Configure uma categoria específica
2. ✅ Defina uma role de suporte clara
3. ✅ Ative notificações automáticas
4. ✅ Revise estatísticas semanalmente
5. ✅ Feche tickets inativos
6. ✅ Use categorias para organizar

### Sistema de Anúncios
1. ✅ Agende anúncios importantes
2. ✅ Use imagens atraentes
3. ✅ Segmente por roles quando apropriado
4. ✅ Evite spam
5. ✅ Mantenha consistência visual
6. ❌ Não abuse do broadcast DM

### Inteligência Artificial
1. ✅ Use prompts claros e específicos
2. ✅ Revise sempre o conteúdo gerado
3. ✅ Monitore custos com `/ia stats`
4. ✅ Use moderação automática proativamente
5. ⚠️ Custo estimado: ~$0.03 por 1000 tokens (GPT-4)

---

## 🚨 Troubleshooting

### Tickets não estão sendo criados
- Verifique se executou a migração do banco
- Confirme que o bot tem permissões para criar canais
- Verifique se a categoria existe

### Anúncios agendados não estão sendo enviados
- O bot precisa estar online na hora agendada
- Verifique logs do console
- O scheduler verifica a cada minuto

### IA não está funcionando
- Verifique se `OPENAI_API_KEY` está configurada
- Confirme que a chave é válida
- Verifique se tem créditos na conta OpenAI

### Notificações de moderadores não funcionam
- Verifique se a role de suporte está configurada
- Confirme que moderadores têm DM aberta
- Verifique se `auto_notify_moderators` está true

---

## 💡 Dicas Avançadas

### Combinar Funcionalidades

#### Campanha Automatizada
1. Use IA para gerar conteúdo
2. Agende anúncio
3. Configure ticket de vendas
4. Use painel para monitorar

#### Fluxo de Suporte Completo
1. Painel de tickets para usuários
2. Notificação automática para mods
3. IA para sugerir respostas
4. Logs automáticos

#### Gestão Eficiente
1. Use `/panel` como hub central
2. Configure shortcuts com bookmarks
3. Monitore stats diariamente
4. Automatize anúncios recorrentes

---

## 📈 Métricas para Acompanhar

### Tickets
- Tempo médio de resolução
- Taxa de fechamento
- Tickets por categoria
- Satisfação do cliente

### Anúncios
- Taxa de engajamento
- Alcance por role
- Horários de melhor performance

### IA
- Tokens usados
- Custo mensal
- Tipos de uso mais comuns
- Economia de tempo

---

## 🎯 Próximos Passos

Após configurar tudo:

1. ✅ Treine sua equipe nos novos comandos
2. ✅ Configure painéis em canais apropriados
3. ✅ Defina processos para tickets
4. ✅ Crie templates de anúncios
5. ✅ Experimente diferentes prompts de IA
6. ✅ Monitore e ajuste configurações
7. ✅ Colete feedback dos usuários

---

## 🆘 Suporte

Precisa de ajuda?
- 📚 Consulte README.md
- 🐛 Reporte bugs via GitHub Issues
- 💬 Entre em contato com o desenvolvedor

---

**Desenvolvido com ❤️ para melhorar a experiência do seu servidor Discord**
