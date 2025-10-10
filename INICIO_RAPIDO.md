# 🚀 Início Rápido - Bot Sellify v2.0

## ⚡ Setup em 5 Minutos

### 1️⃣ Instalar Dependências (30 segundos)
```bash
cd "/Users/Murilo/Desktop/Sellify/Sellify Bot"
npm install
```

### 2️⃣ Executar Migração do Banco (2 minutos)

1. Acesse [Supabase](https://supabase.com)
2. Abra seu projeto
3. Vá em **SQL Editor**
4. Abra o arquivo `migration-tickets-announcements.sql`
5. Copie todo o conteúdo
6. Cole no SQL Editor
7. Clique em **Run**

✅ 7 tabelas criadas com sucesso!

### 3️⃣ Configurar OpenAI (1 minuto)

1. Acesse [OpenAI](https://platform.openai.com/api-keys)
2. Crie uma API Key
3. Copie a chave
4. Edite o arquivo `.env`:

```env
OPENAI_API_KEY=sk-sua_chave_aqui
```

💡 **Dica:** Se não quiser usar IA agora, deixe em branco. O bot funcionará normalmente, apenas os comandos `/ia` não funcionarão.

### 4️⃣ Registrar Comandos (30 segundos)
```bash
npm run deploy-commands
```

Aguarde a mensagem: ✅ Successfully registered application commands.

### 5️⃣ Iniciar o Bot (10 segundos)
```bash
npm run dev
```

Aguarde: ✅ Bot está online!

---

## 🎯 Primeiros Passos no Discord

### Passo 1: Abrir o Painel
```
/panel
```

Você verá o painel principal com todos os botões.

### Passo 2: Configurar Tickets

```
/ticket setup
  categoria: Crie/selecione uma categoria "Tickets"
  role_suporte: @Moderador (ou sua role de moderação)
  canal_logs: #logs (ou qualquer canal de logs)
  notificar_mods: true
```

### Passo 3: Criar Painel de Tickets

```
/ticket painel
  canal: #suporte (ou canal onde usuários podem pedir ajuda)
```

Agora usuários podem clicar nos botões para abrir tickets!

### Passo 4: Testar Anúncios

```
/anuncio criar
  titulo: 🎉 Teste de Anúncio
  conteudo: O sistema de anúncios está funcionando!
  canal: #anuncios
  cor: #5865F2
```

### Passo 5: Testar IA (Opcional)

```
/ia chat
  mensagem: Olá! Você está funcionando?
```

Se configurou a OpenAI, receberá uma resposta inteligente.

---

## 📱 Comandos Essenciais

### Gerenciamento
- `/panel` - Painel principal
- `/config` - Configurações

### Produtos
- `/addproduct` - Adicionar produto
- `/catalogo` - Ver catálogo

### Tickets
- `/ticket abrir` - Abrir ticket
- `/ticket listar` - Ver todos tickets
- `/ticket stats` - Estatísticas

### Anúncios
- `/anuncio criar` - Criar anúncio
- `/anuncio agendar` - Agendar anúncio

### IA
- `/ia chat` - Conversar
- `/ia gerar` - Gerar conteúdo
- `/ia moderar` - Moderar texto

---

## ❓ FAQ

### O bot não está respondendo aos comandos
- Execute `npm run deploy-commands` novamente
- Aguarde até 1 hora para comandos globais
- Verifique se o bot tem permissões

### Erro ao criar ticket
- Certifique-se que executou a migração do banco
- Verifique se o bot pode criar canais
- Confirme que a categoria existe

### IA não funciona
- Verifique se `OPENAI_API_KEY` está no `.env`
- Confirme que a chave é válida
- Verifique se tem créditos na OpenAI

### Anúncios agendados não enviam
- O bot precisa estar online na hora agendada
- Verifique o formato da data: DD/MM/YYYY HH:MM
- Confira logs do console

---

## 📚 Próximos Passos

1. ✅ Leia `GUIA_NOVAS_FUNCIONALIDADES.md` - Guia completo
2. ✅ Leia `CHANGELOG.md` - Todas as mudanças
3. ✅ Leia `IMPLEMENTACAO_COMPLETA.md` - Detalhes técnicos
4. ✅ Configure produtos com `/addproduct`
5. ✅ Personalize cores e mensagens com `/config`
6. ✅ Treine sua equipe nos novos comandos
7. ✅ Comece a usar!

---

## 🆘 Suporte

Problemas?
- 📖 Consulte os guias na pasta do projeto
- 🐛 Reporte bugs via GitHub Issues
- 💬 Entre em contato com o desenvolvedor

---

## 🎉 Pronto!

Seu bot está configurado e pronto para uso!

**Comandos principais para começar:**
```
/panel          → Ver painel principal
/ticket painel  → Criar painel de tickets
/anuncio criar  → Criar primeiro anúncio
/ia chat        → Testar IA
```

**Boa sorte com suas vendas!** 🚀
