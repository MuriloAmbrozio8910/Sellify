# 🎨 Sistema de Personalização Dinâmica

## Visão Geral

O bot agora possui um **sistema completo de personalização visual** que permite customizar QUALQUER embed, botão ou modal através de uma interface interativa.

## ✨ Características

- ✅ **100% Personalizável** - Todos os textos, cores, imagens e botões
- ✅ **Interface Interativa** - Modais e botões amigáveis
- ✅ **Pré-visualização** - Veja as mudanças antes de salvar
- ✅ **Banco de Dados** - Configurações salvas por servidor
- ✅ **Sistema Modular** - Fácil de estender para novas funcionalidades

---

## 📦 Instalação

### 1. Criar Tabela no Banco de Dados

Execute o SQL no Supabase:

```sql
CREATE TABLE IF NOT EXISTS customizations (
  guild_id TEXT NOT NULL,
  customization_type TEXT NOT NULL,
  customization_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (guild_id, customization_type)
);

CREATE INDEX idx_customizations_guild ON customizations(guild_id);
CREATE INDEX idx_customizations_type ON customizations(customization_type);
```

### 2. Compilar e Reiniciar

```bash
npm run build
npm start
```

---

## 🎯 Como Usar

### Para Administradores

#### 1. **Personalizar Sistema de Tickets**

```
/ticket setup
```

Um painel interativo aparecerá com botões para customizar:
- 📝 **Título** - Título do embed
- 📄 **Descrição** - Texto principal
- 🎨 **Cor** - Cor em HEX (#5865F2)
- 👤 **Autor** - Nome, ícone e URL do autor
- 🏷️ **Campos** - Adicionar campos personalizados
- 📝 **Rodapé** - Texto e ícone do rodapé
- 🖼️ **Imagem** - Imagem grande no embed
- 🔳 **Thumbnail** - Imagem pequena no canto
- 🔘 **Botões** - Customizar texto e estilo dos botões
- ⚙️ **Configurações** - Opções gerais
- 👁️ **Pré-visualizar** - Ver como ficará
- 💾 **Salvar** - Salvar todas as alterações

#### 2. **Fluxo de Personalização**

1. Execute o comando (`/ticket setup`)
2. Clique nos botões para editar cada elemento
3. Preencha os modais com suas preferências
4. Clique em **👁️ Pré-visualizar** para ver o resultado
5. Clique em **💾 Salvar Tudo** para aplicar

---

## 🛠️ Tipos de Customização Disponíveis

### Atualmente Implementado

- ✅ **ticket** - Sistema de tickets (via `/ticket setup`)

### Fácil de Adicionar

Para adicionar personalização em qualquer comando:

```typescript
import { getCustomizationOrDefault, applyCustomizationToEmbed } from '../utils/customization';

// Carregar customização
const customization = await getCustomizationOrDefault(guildId, 'seu_tipo');

// Aplicar ao embed
const embed = new EmbedBuilder();
applyCustomizationToEmbed(embed, customization);
```

---

## 📚 Exemplos de Uso

### Exemplo 1: Customizar Título e Descrição

1. `/ticket setup`
2. Clique em **📝 Título**
3. Digite: `🎟️ Central de Atendimento`
4. Clique em **📄 Descrição**
5. Digite: `Nossa equipe está pronta para ajudar você 24/7!`
6. **👁️ Pré-visualizar** → **💾 Salvar**

### Exemplo 2: Adicionar Campos Personalizados

1. `/ticket setup`
2. Clique em **🏷️ Campos**
3. Preencha:
   - **Nome:** `⏰ Horário`
   - **Valor:** `24 horas, 7 dias por semana`
   - **Inline:** `sim`
4. Repita para adicionar mais campos
5. **💾 Salvar**

### Exemplo 3: Personalizar Botões

1. `/ticket setup`
2. Clique em **🔘 Botões**
3. Preencha:
   - **Texto:** `Abrir Chamado`
   - **Custom ID:** `create_ticket_suporte`
   - **Estilo:** `success`
   - **Emoji:** `📞`
4. **💾 Salvar**

---

## 🎨 Opções de Personalização

### Cores (HEX)

- `#5865F2` - Azul Discord
- `#00FF00` - Verde
- `#FF0000` - Vermelho
- `#FFD700` - Dourado
- `#9B59B6` - Roxo
- Use qualquer cor HEX válida!

### Estilos de Botão

- `primary` - Azul
- `secondary` - Cinza
- `success` - Verde
- `danger` - Vermelho

### Campos Inline

- `sim` - Campos lado a lado
- `nao` - Campos empilhados

---

## 🔧 Para Desenvolvedores

### Estrutura de Dados

```typescript
interface CustomizationData {
  // Visual
  title?: string;
  description?: string;
  color?: string;
  
  // Autor
  author_name?: string;
  author_icon?: string;
  author_url?: string;
  
  // Rodapé
  footer_text?: string;
  footer_icon?: string;
  
  // Imagens
  image_url?: string;
  thumbnail_url?: string;
  
  // Outros
  timestamp?: boolean;
  
  // Campos
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  
  // Botões
  buttons?: Array<{
    customId: string;
    label: string;
    style: string;
    emoji?: string;
  }>;
  
  // Config específica
  config?: Record<string, any>;
}
```

### Adicionar Novo Tipo de Customização

#### 1. Adicionar valor padrão em `customization.ts`:

```typescript
export const defaultCustomizations: Record<string, CustomizationData> = {
  // ... existentes
  meu_novo_tipo: {
    title: '🆕 Meu Novo Tipo',
    description: 'Descrição padrão',
    color: '#5865F2',
    buttons: [
      {
        customId: 'meu_botao',
        label: 'Clique Aqui',
        style: 'primary'
      }
    ]
  }
};
```

#### 2. Criar comando ou modificar existente:

```typescript
// No seu comando
const customization = await getCustomizationOrDefault(guildId, 'meu_novo_tipo');

const embed = new EmbedBuilder();
applyCustomizationToEmbed(embed, customization);

const buttons = createCustomButtons(customization);
```

#### 3. Adicionar painel de setup (opcional):

```typescript
// Adicionar subcomando
.addSubcommand(subcommand =>
  subcommand
    .setName('setup')
    .setDescription('🎨 Personalizar [Seu Sistema]')
)

// No handler
async function handleSetup(interaction) {
  // Copie a estrutura de handleSetupTickets em ticket.ts
  // Troque 'ticket' pelo seu tipo
}
```

---

## 🌟 Funcionalidades Avançadas

### Sistema de Templates

Você pode criar templates pré-configurados:

```typescript
// Em customization.ts
export const templates = {
  profissional: {
    color: '#2C3E50',
    footer_text: 'Suporte Profissional',
    timestamp: true
  },
  divertido: {
    color: '#FF69B4',
    footer_text: '✨ Feito com amor!',
    timestamp: false
  }
};
```

### Variáveis Dinâmicas

Suporte para variáveis nos textos:

```typescript
description: 'Bem-vindo {user}! Você é o membro #{memberCount}!'

// Ao aplicar:
const processedDescription = customization.description
  ?.replace('{user}', interaction.user.toString())
  ?.replace('{memberCount}', guild.memberCount.toString());
```

---

## ⚠️ Notas Importantes

### Limites do Discord

- **Título:** Máximo 256 caracteres
- **Descrição:** Máximo 4096 caracteres
- **Campos:** Máximo 25 campos
- **Footer:** Máximo 2048 caracteres
- **Botões:** Máximo 5 por row, 5 rows por mensagem

### URLs de Imagens

- Devem começar com `http://` ou `https://`
- Formatos suportados: PNG, JPG, GIF, WEBP
- Tamanho recomendado: Até 8MB

### Cores HEX

- Formato: `#RRGGBB`
- Exemplo válido: `#5865F2`
- Exemplo inválido: `5865F2` (falta #)

---

## 🐛 Troubleshooting

### "Erro ao salvar customização"

- Verifique se a tabela `customizations` existe no Supabase
- Execute o SQL de criação da tabela

### "Imagem não aparece"

- Verifique se a URL é válida e acessível
- Teste a URL no navegador
- Certifique-se que começa com `https://`

### "Botão não funciona"

- Verifique se o `customId` corresponde a um handler existente
- Confirme que o handler está registrado em `interactionCreate.ts`

---

## 🚀 Roadmap

### Próximas Funcionalidades

- [ ] Sistema de templates visuais
- [ ] Importar/exportar customizações
- [ ] Preview ao vivo enquanto edita
- [ ] Copiar customização entre servidores
- [ ] Histórico de alterações
- [ ] Customização de comandos
- [ ] Customização de modais
- [ ] Temas globais (Dark/Light)

---

## 📞 Suporte

Se encontrar algum problema ou tiver sugestões:

1. Abra um ticket no servidor
2. Use `/ticket abrir categoria:bug`
3. Descreva o problema detalhadamente

---

## 🎉 Exemplos de Uso Real

### Servidor de Vendas
```
Título: 💎 Loja Premium
Descrição: Produtos exclusivos com entrega instantânea!
Cor: #FFD700
Botões: "🛒 Ver Produtos" (success)
```

### Servidor de Suporte
```
Título: 🆘 Central de Ajuda
Descrição: Nossa equipe técnica está pronta para resolver qualquer problema.
Cor: #3498DB
Campos: Horário | 24/7 (inline)
Botões: "📝 Abrir Ticket" (primary)
```

### Servidor de Comunidade
```
Título: 🎮 Bem-vindo à Comunidade!
Descrição: Junte-se a milhares de gamers!
Cor: #E74C3C
Image: Banner da comunidade
Botões: "✅ Aceitar Regras" (success)
```

---

**Desenvolvido com ❤️ | Sistema de Personalização Dinâmica v1.0**
