/**
 * Design System - Sellify Bot
 * Sistema de design moderno e padronizado
 */

import { HexColorString } from 'discord.js';
import { GuildConfig } from '../types';

/**
 * Paleta de cores moderna e consistente
 */
export const COLORS = {
  // Principais
  PRIMARY: '#5865F2' as HexColorString,      // Discord Blurple
  SECONDARY: '#4752C4' as HexColorString,    // Blurple escuro
  
  // Estados
  SUCCESS: '#57F287' as HexColorString,      // Verde vibrante
  DANGER: '#ED4245' as HexColorString,       // Vermelho
  WARNING: '#FEE75C' as HexColorString,      // Amarelo
  INFO: '#00D9FF' as HexColorString,         // Cyan
  
  // Especiais
  PREMIUM: '#FFD700' as HexColorString,      // Dourado
  ACCENT: '#EB459E' as HexColorString,       // Rosa
  
  // Neutros
  DARK: '#2F3136' as HexColorString,         // Cinza escuro
  DARKER: '#202225' as HexColorString,       // Cinza mais escuro
  LIGHT: '#B9BBBE' as HexColorString,        // Cinza claro
  
  // Categorias
  PRODUCTS: '#9B59B6' as HexColorString,     // Roxo
  SALES: '#2ECC71' as HexColorString,        // Verde
  COUPONS: '#F39C12' as HexColorString,      // Laranja
  STATS: '#3498DB' as HexColorString,        // Azul
  TICKETS: '#E91E63' as HexColorString,      // Rosa forte
  REVIEWS: '#FF9800' as HexColorString,      // Laranja queimado
  AI: '#00BCD4' as HexColorString,           // Cyan escuro
  SETTINGS: '#607D8B' as HexColorString      // Azul acinzentado
} as const;

/**
 * Emojis padronizados para consistência visual
 */
export const EMOJIS = {
  // Ações principais
  CREATE: '✨',
  ADD: '➕',
  EDIT: '✏️',
  DELETE: '🗑️',
  VIEW: '👁️',
  SEARCH: '🔍',
  REFRESH: '🔄',
  DOWNLOAD: '⬇️',
  UPLOAD: '⬆️',
  
  // Navegação
  BACK: '◀️',
  NEXT: '▶️',
  UP: '⬆️',
  DOWN: '⬇️',
  HOME: '🏠',
  MENU: '📋',
  
  // Status
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  LOADING: '⏳',
  PENDING: '🕐',
  DONE: '✔️',
  
  // Categorias
  PRODUCTS: '🛍️',
  SALES: '💰',
  MONEY: '💵',
  CART: '🛒',
  COUPONS: '🎟️',
  STATS: '📊',
  CHART: '📈',
  TICKETS: '🎫',
  SUPPORT: '🆘',
  REVIEWS: '⭐',
  STAR: '⭐',
  AI: '🧠',
  ROBOT: '🤖',
  SETTINGS: '⚙️',
  CONFIG: '🔧',
  
  // Elementos
  CATEGORY: '📁',
  CHANNEL: '📱',
  ROLE: '👥',
  USER: '👤',
  MESSAGE: '💬',
  NOTIFICATION: '🔔',
  ANNOUNCEMENT: '📢',
  LOG: '📋',
  CALENDAR: '📅',
  CLOCK: '🕐',
  
  // Pagamento
  CARD: '💳',
  PIX: '💚',
  BOLETO: '🎫',
  STRIPE: '💎',
  MERCADOPAGO: '💙',
  
  // Outros
  PREMIUM: '👑',
  GIFT: '🎁',
  TROPHY: '🏆',
  FIRE: '🔥',
  ROCKET: '🚀',
  SPARKLES: '✨',
  LOCK: '🔒',
  UNLOCK: '🔓'
} as const;

/**
 * Mensagens de feedback padronizadas
 */
export const MESSAGES = {
  SUCCESS: {
    CREATED: (item: string) => `${EMOJIS.SUCCESS} ${item} criado com sucesso!`,
    UPDATED: (item: string) => `${EMOJIS.SUCCESS} ${item} atualizado com sucesso!`,
    DELETED: (item: string) => `${EMOJIS.SUCCESS} ${item} removido com sucesso!`,
    SAVED: (item: string) => `${EMOJIS.SUCCESS} ${item} salvo com sucesso!`,
    SENT: (item: string) => `${EMOJIS.SUCCESS} ${item} enviado com sucesso!`,
    COMPLETED: (action: string) => `${EMOJIS.SUCCESS} ${action} concluído com sucesso!`
  },
  ERROR: {
    NOT_FOUND: (item: string) => `${EMOJIS.ERROR} ${item} não encontrado.`,
    INVALID: (item: string) => `${EMOJIS.ERROR} ${item} inválido.`,
    PERMISSION: `${EMOJIS.ERROR} Você não tem permissão para fazer isso.`,
    FAILED: (action: string) => `${EMOJIS.ERROR} Falha ao ${action}.`,
    REQUIRED: (field: string) => `${EMOJIS.ERROR} ${field} é obrigatório.`,
    GENERIC: `${EMOJIS.ERROR} Ocorreu um erro. Tente novamente.`
  },
  WARNING: {
    CONFIRM: (action: string) => `${EMOJIS.WARNING} Tem certeza que deseja ${action}?`,
    LIMIT: (limit: number) => `${EMOJIS.WARNING} Limite de ${limit} atingido.`,
    TEMPORARY: `${EMOJIS.WARNING} Esta é uma ação temporária.`,
    BETA: `${EMOJIS.WARNING} Esta funcionalidade está em beta.`
  },
  INFO: {
    PROCESSING: `${EMOJIS.LOADING} Processando...`,
    LOADING: `${EMOJIS.LOADING} Carregando...`,
    EMPTY: (item: string) => `${EMOJIS.INFO} Nenhum ${item} encontrado.`,
    HELP: (command: string) => `${EMOJIS.INFO} Use \`${command}\` para mais informações.`
  }
} as const;

/**
 * Configurações de layout responsivo
 */
export const LAYOUT = {
  // Embeds
  EMBED: {
    MAX_TITLE_LENGTH: 256,
    MAX_DESCRIPTION_LENGTH: 4096,
    MAX_FIELDS: 25,
    MAX_FIELD_NAME_LENGTH: 256,
    MAX_FIELD_VALUE_LENGTH: 1024,
    MAX_FOOTER_LENGTH: 2048,
    MAX_AUTHOR_LENGTH: 256
  },
  
  // Botões
  BUTTONS: {
    MAX_PER_ROW: 5,
    MAX_ROWS: 5,
    MAX_LABEL_LENGTH: 80,
    DESKTOP_PER_ROW: 3,
    MOBILE_PER_ROW: 2
  },
  
  // Paginação
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 25
  }
} as const;

/**
 * Estilos de botão padronizados
 */
export const BUTTON_STYLES = {
  PRIMARY: 'Primary',      // Ações principais (azul)
  SUCCESS: 'Success',      // Ações positivas (verde)
  DANGER: 'Danger',        // Ações destrutivas (vermelho)
  SECONDARY: 'Secondary',  // Ações secundárias (cinza)
  LINK: 'Link'            // Links externos
} as const;

/**
 * Helper para criar divisórias visuais
 */
export const DIVIDERS = {
  THIN: '─'.repeat(40),
  THICK: '═'.repeat(40),
  DOTTED: '·'.repeat(40),
  DOUBLE: '━'.repeat(40)
} as const;

/**
 * Formatadores utilitários
 */
export const formatters = {
  /**
   * Formata número com separador de milhares
   */
  number: (num: number): string => {
    return num.toLocaleString('pt-BR');
  },
  
  /**
   * Formata porcentagem
   */
  percentage: (value: number, total: number): string => {
    const percent = total === 0 ? 0 : (value / total) * 100;
    return `${percent.toFixed(1)}%`;
  },
  
  /**
   * Formata data relativa
   */
  relativeTime: (date: Date): string => {
    const timestamp = Math.floor(date.getTime() / 1000);
    return `<t:${timestamp}:R>`;
  },
  
  /**
   * Formata data completa
   */
  fullDate: (date: Date): string => {
    const timestamp = Math.floor(date.getTime() / 1000);
    return `<t:${timestamp}:F>`;
  },
  
  /**
   * Trunca texto com reticências
   */
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },
  
  /**
   * Cria barra de progresso visual
   */
  progressBar: (current: number, total: number, length: number = 10): string => {
    const filled = Math.round((current / total) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
};

/**
 * Templates de embed prontos
 */
export const embedTemplates = {
  /**
   * Template para mensagem de sucesso
   */
  success: (title: string, description: string) => ({
    color: COLORS.SUCCESS,
    title: `${EMOJIS.SUCCESS} ${title}`,
    description,
    timestamp: new Date().toISOString()
  }),
  
  /**
   * Template para mensagem de erro
   */
  error: (title: string, description: string) => ({
    color: COLORS.DANGER,
    title: `${EMOJIS.ERROR} ${title}`,
    description,
    timestamp: new Date().toISOString()
  }),
  
  /**
   * Template para mensagem de aviso
   */
  warning: (title: string, description: string) => ({
    color: COLORS.WARNING,
    title: `${EMOJIS.WARNING} ${title}`,
    description,
    timestamp: new Date().toISOString()
  }),
  
  /**
   * Template para mensagem informativa
   */
  info: (title: string, description: string) => ({
    color: COLORS.INFO,
    title: `${EMOJIS.INFO} ${title}`,
    description,
    timestamp: new Date().toISOString()
  })
};

/**
 * Validações comuns
 */
export const validators = {
  /**
   * Valida cor hexadecimal
   */
  isValidHex: (color: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(color);
  },
  
  /**
   * Valida ID do Discord
   */
  isValidSnowflake: (id: string): boolean => {
    return /^\d{17,19}$/.test(id);
  },
  
  /**
   * Valida URL
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Resolve cores de tema a partir da configuração do servidor,
 * aplicando fallbacks para garantir valores válidos.
 */
export const getThemeColors = (config: Partial<GuildConfig>) => {
  const primary = (config.theme_primary_color || config.embed_color || COLORS.ACCENT) as HexColorString;
  const success = (config.theme_success_color || COLORS.SUCCESS) as HexColorString;
  const danger = (config.theme_danger_color || COLORS.DANGER) as HexColorString;
  return { primary, success, danger };
};
