# 📋 Padronização de Comandos - Sellify Bot

## 🎯 Filosofia de Design

### Comandos Slash (/)
Usados para ações que requerem:
- ✏️ Entrada direta de dados complexos
- 🔐 Permissões administrativas específicas
- 📊 Consultas com parâmetros
- 🚀 Inicialização de sistemas

### Botões Interativos
Usados para:
- ⚡ Ações rápidas e frequentes
- 📱 Navegação em menus
- ✅ Confirmações e seleções
- 🎨 Customizações guiadas

---

## 🗂️ Categorização de Comandos

### 🛡️ ADMINISTRAÇÃO (Slash Commands)
| Comando | Uso | Justificativa |
|---------|-----|---------------|
| `/painel` | Painel administrativo completo | Hub central - acessa tudo via botões |
| `/configurar` | Configurações gerais | **DEPRECADO** - usar painel interativo |

### 🛍️ PRODUTOS (Painéis Interativos)
| Ação | Método | Acesso |
|------|--------|--------|
| Criar produto | Modal via painel | `/painel` → Produtos → Criar |
| Editar produto | Modal via painel | `/painel` → Produtos → Listar → Editar |
| Remover produto | Botão + confirmação | `/painel` → Produtos → Listar → Remover |
| Listar produtos | Painel com paginação | `/painel` → Produtos → Listar |

**Comandos a REMOVER:**
- ❌ `/adicionar-produto` → usar painel
- ❌ `/editar-produto` → usar painel
- ❌ `/remover-produto` → usar painel

### 🎟️ CUPONS (Painéis Interativos)
| Ação | Método | Acesso |
|------|--------|--------|
| Criar cupom | Modal via painel | `/painel` → Cupons → Criar |
| Listar cupons | Painel interativo | `/painel` → Cupons → Listar |

**Comandos a REMOVER:**
- ❌ `/adicionar-cupom` → usar painel

### 📢 ANÚNCIOS (Híbrido)
| Comando | Uso | Justificativa |
|---------|-----|---------------|
| `/anuncio criar` | Criar anúncio imediato | Requer canal como parâmetro |
| Panel: Anúncios | Gerenciar, agendar, listar | Ações administrativas via botões |

**Manter:** `/anuncio` com subcomandos simplificados
**Remover subcomandos:** agendar, listar, cancelar, setup → mover para painel

### 🛒 CATÁLOGO (Usuários)
| Comando | Uso | Justificativa |
|---------|-----|---------------|
| `/catalogo` | Ver produtos disponíveis | Comando público para compradores |

**Manter:** `/catalogo` - comando público essencial

### ⭐ AVALIAÇÕES (Usuários)
| Comando | Uso | Justificativa |
|---------|-----|---------------|
| `/avaliar` | Sistema de avaliações | Interação do cliente |

**Manter:** `/avaliar` - ação do usuário final

### 📦 PEDIDOS (Usuários)
| Comando | Uso | Justificativa |
|---------|-----|---------------|
| `/meus-pedidos` | Consultar compras | Self-service do cliente |

**Manter:** `/meus-pedidos` - essencial para clientes

### 🎫 TICKETS (Híbrido)
| Comando | Uso | Método |
|---------|-----|--------|
| `/ticket` | Configurar sistema | Admin via subcomandos |
| Painel Tickets | Criar, gerenciar | Usuários via botões |

**Reformular:** Manter `/ticket` apenas para setup inicial, resto via painel

### 🧠 INTELIGÊNCIA ARTIFICIAL (Slash)
| Comando | Uso | Justificativa |
|---------|-----|---------------|
| `/ia chat` | Conversa com IA | Requer input de texto |
| `/ia gerar` | Gerar conteúdo | Requer especificações |

**Manter:** `/ia` - requer entrada complexa de texto

### 📊 ESTATÍSTICAS (Painel)
**Comando a REMOVER:**
- ❌ `/estatisticas` → usar `/painel` → Estatísticas

---

## 🎨 Design System Moderno

### Cores Padronizadas
```typescript
const COLORS = {
  PRIMARY: '#5865F2',      // Discord Blurple
  SUCCESS: '#57F287',      // Verde vibrante
  DANGER: '#ED4245',       // Vermelho
  WARNING: '#FEE75C',      // Amarelo
  INFO: '#00D9FF',         // Cyan
  PREMIUM: '#FFD700',      // Dourado
  NEUTRAL: '#2F3136',      // Cinza escuro
  ACCENT: '#EB459E'        // Rosa
};
```

### Emojis Padronizados
```typescript
const EMOJIS = {
  // Ações
  CREATE: '➕',
  EDIT: '✏️',
  DELETE: '🗑️',
  VIEW: '👁️',
  REFRESH: '🔄',
  BACK: '◀️',
  NEXT: '▶️',
  
  // Status
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  LOADING: '⏳',
  
  // Categorias
  PRODUCTS: '🛍️',
  SALES: '💰',
  COUPONS: '🎟️',
  STATS: '📊',
  TICKETS: '🎫',
  REVIEWS: '⭐',
  AI: '🧠',
  SETTINGS: '⚙️'
};
```

### Hierarquia Visual
1. **Título**: Emoji + Título em negrito
2. **Descrição**: Texto claro e conciso
3. **Campos**: Máximo 6 por embed
4. **Botões**: Máximo 5 por linha, 5 linhas por mensagem
5. **Footer**: Timestamp + informação contextual

---

## 📱 Responsividade

### Desktop
- Embeds com imagens e thumbnails
- Botões com labels completos
- Até 3 botões por linha

### Mobile
- Embeds sem imagens pesadas
- Labels de botões concisos
- Máximo 2 botões por linha para facilitar toque

---

## ✅ Lista de Implementação

### Fase 1: Deprecar Comandos Redundantes
- [ ] Remover `/adicionar-produto`
- [ ] Remover `/editar-produto`
- [ ] Remover `/remover-produto`
- [ ] Remover `/adicionar-cupom`
- [ ] Remover `/estatisticas`
- [ ] Simplificar `/anuncio`
- [ ] Simplificar `/ticket`

### Fase 2: Modernizar Painéis
- [ ] Redesign do painel principal
- [ ] Painel de produtos completo
- [ ] Painel de vendas melhorado
- [ ] Painel de cupons
- [ ] Painel de anúncios
- [ ] Painel de tickets

### Fase 3: Padronizar UI/UX
- [ ] Aplicar design system
- [ ] Padronizar mensagens de feedback
- [ ] Criar componentes reutilizáveis
- [ ] Implementar loading states
- [ ] Adicionar animações sutis (emojis animados)

### Fase 4: Testes e Validação
- [ ] Testar todos os fluxos
- [ ] Validar responsividade
- [ ] Revisar acessibilidade
- [ ] Documentar mudanças
