/**
 * Sistema de Personalização Dinâmica
 * Permite customizar qualquer embed, botão ou modal do bot
 */

import { supabase } from './supabase';
import { EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { logger } from './logger';

export interface CustomizationData {
  // Embed
  title?: string;
  description?: string;
  color?: string;
  author_name?: string;
  author_icon?: string;
  author_url?: string;
  footer_text?: string;
  footer_icon?: string;
  image_url?: string;
  thumbnail_url?: string;
  timestamp?: boolean;
  
  // Fields
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  
  // Buttons
  buttons?: Array<{
    customId: string;
    label: string;
    style: string;
    emoji?: string;
    disabled?: boolean;
  }>;
  
  // Configurações específicas
  config?: Record<string, any>;
}

/**
 * Salvar customização no banco de dados
 */
export async function saveCustomization(
  guildId: string,
  type: string, // 'ticket', 'product', 'panel', etc
  data: CustomizationData
): Promise<void> {
  try {
    const { error } = await supabase
      .from('customizations')
      .upsert({
        guild_id: guildId,
        customization_type: type,
        customization_data: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'guild_id,customization_type' });

    if (error) throw new Error(error.message);
    
    logger.info(`Customização salva: ${type} para guild ${guildId}`);
  } catch (error) {
    logger.error(`Erro ao salvar customização: ${error}`);
    throw error;
  }
}

/**
 * Carregar customização do banco de dados
 */
export async function loadCustomization(
  guildId: string,
  type: string
): Promise<CustomizationData | null> {
  try {
    const { data, error } = await supabase
      .from('customizations')
      .select('customization_data')
      .eq('guild_id', guildId)
      .eq('customization_type', type)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Não encontrado
      throw new Error(error.message);
    }

    return data?.customization_data || null;
  } catch (error) {
    logger.error(`Erro ao carregar customização: ${error}`);
    return null;
  }
}

/**
 * Aplicar customização a um EmbedBuilder
 */
export function applyCustomizationToEmbed(
  embed: EmbedBuilder,
  customization: CustomizationData
): EmbedBuilder {
  if (customization.title) {
    embed.setTitle(customization.title);
  }
  
  if (customization.description) {
    embed.setDescription(customization.description);
  }
  
  if (customization.color) {
    embed.setColor(customization.color as any);
  }
  
  if (customization.author_name) {
    embed.setAuthor({
      name: customization.author_name,
      iconURL: customization.author_icon,
      url: customization.author_url
    });
  }
  
  if (customization.footer_text) {
    embed.setFooter({
      text: customization.footer_text,
      iconURL: customization.footer_icon
    });
  }
  
  if (customization.image_url) {
    embed.setImage(customization.image_url);
  }
  
  if (customization.thumbnail_url) {
    embed.setThumbnail(customization.thumbnail_url);
  }
  
  if (customization.timestamp) {
    embed.setTimestamp();
  }
  
  if (customization.fields && customization.fields.length > 0) {
    embed.addFields(customization.fields);
  }
  
  return embed;
}

/**
 * Criar botões a partir de customização
 */
export function createCustomButtons(customization: CustomizationData): ButtonBuilder[] {
  if (!customization.buttons || customization.buttons.length === 0) {
    return [];
  }
  
  return customization.buttons.map(btn => {
    const button = new ButtonBuilder()
      .setCustomId(btn.customId)
      .setLabel(btn.label)
      .setStyle(getButtonStyle(btn.style));
    
    if (btn.emoji) {
      button.setEmoji(btn.emoji);
    }
    
    if (btn.disabled) {
      button.setDisabled(btn.disabled);
    }
    
    return button;
  });
}

/**
 * Converter string de estilo para ButtonStyle
 */
function getButtonStyle(style: string): ButtonStyle {
  switch (style.toLowerCase()) {
    case 'primary':
      return ButtonStyle.Primary;
    case 'secondary':
      return ButtonStyle.Secondary;
    case 'success':
      return ButtonStyle.Success;
    case 'danger':
      return ButtonStyle.Danger;
    case 'link':
      return ButtonStyle.Link;
    default:
      return ButtonStyle.Primary;
  }
}

/**
 * Valores padrão para diferentes tipos de customização
 */
export const defaultCustomizations: Record<string, CustomizationData> = {
  ticket: {
    title: '🎫 Sistema de Tickets',
    description: 'Clique no botão abaixo para abrir um ticket de suporte.',
    color: '#5865F2',
    footer_text: 'Nossa equipe está pronta para ajudar!',
    timestamp: true,
    buttons: [
      {
        customId: 'create_ticket_suporte',
        label: 'Abrir Ticket',
        style: 'primary',
        emoji: '🎫'
      }
    ]
  },
  product: {
    title: '🛍️ Catálogo de Produtos',
    description: 'Confira nossos produtos disponíveis!',
    color: '#00FF00',
    footer_text: 'Vendas automáticas via Discord',
    timestamp: true
  },
  catalog: {
    title: '🛒 Catálogo',
    description: 'Navegue pelos nossos produtos e faça sua compra com segurança!',
    color: '#3498DB',
    footer_text: 'Página {page} de {total} • {count} produtos disponíveis',
    thumbnail_url: '',
    timestamp: true,
    buttons: [
      {
        customId: 'catalog_refresh',
        label: 'Atualizar',
        style: 'secondary',
        emoji: '🔄'
      }
    ]
  },
  purchase: {
    title: '💳 Confirmar Compra',
    description: 'Revise os detalhes da sua compra antes de finalizar.',
    color: '#2ECC71',
    footer_text: 'Pagamento seguro via Mercado Pago',
    timestamp: true,
    fields: [
      {
        name: '📦 Produto',
        value: '{product_name}',
        inline: true
      },
      {
        name: '💰 Preço',
        value: '{product_price}',
        inline: true
      }
    ],
    buttons: [
      {
        customId: 'pay_pix',
        label: 'Pagar com PIX',
        style: 'success',
        emoji: '💳'
      },
      {
        customId: 'pay_boleto',
        label: 'Pagar com Boleto',
        style: 'primary',
        emoji: '🧾'
      },
      {
        customId: 'cancel_buy',
        label: 'Cancelar',
        style: 'danger',
        emoji: '❌'
      }
    ]
  },
  announcement: {
    title: '📢 Anúncio Importante',
    description: 'Mensagem para todos os membros do servidor.',
    color: '#E74C3C',
    author_name: 'Administração',
    author_icon: '',
    footer_text: 'Enviado por {user} • {date}',
    timestamp: true,
    fields: []
  },
  panel: {
    title: '⚙️ Painel de Controle',
    description: 'Gerencie seu servidor com facilidade.',
    color: '#9B59B6',
    footer_text: 'Bot de Vendas Discord',
    timestamp: true
  }
};

/**
 * Obter customização com fallback para valores padrão
 */
export async function getCustomizationOrDefault(
  guildId: string,
  type: string
): Promise<CustomizationData> {
  const custom = await loadCustomization(guildId, type);
  return custom || defaultCustomizations[type] || {};
}

/**
 * Deletar customização
 */
export async function deleteCustomization(
  guildId: string,
  type: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('customizations')
      .delete()
      .eq('guild_id', guildId)
      .eq('customization_type', type);

    if (error) throw new Error(error.message);
    
    logger.info(`Customização deletada: ${type} para guild ${guildId}`);
  } catch (error) {
    logger.error(`Erro ao deletar customização: ${error}`);
    throw error;
  }
}

/**
 * Listar todas as customizações de uma guild
 */
export async function listCustomizations(guildId: string): Promise<Array<{
  type: string;
  data: CustomizationData;
  updated_at: string;
}>> {
  try {
    const { data, error } = await supabase
      .from('customizations')
      .select('customization_type, customization_data, updated_at')
      .eq('guild_id', guildId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map(item => ({
      type: item.customization_type,
      data: item.customization_data,
      updated_at: item.updated_at
    }));
  } catch (error) {
    logger.error(`Erro ao listar customizações: ${error}`);
    return [];
  }
}

/**
 * Processar variáveis dinâmicas em textos
 * Substitui {variable} pelos valores fornecidos
 */
export function processVariables(text: string, variables: Record<string, any>): string {
  let processed = text;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    processed = processed.replace(regex, String(value));
  }
  
  return processed;
}

/**
 * Aplicar variáveis a toda a customização
 */
export function applyVariablesToCustomization(
  customization: CustomizationData,
  variables: Record<string, any>
): CustomizationData {
  const processed = { ...customization };
  
  if (processed.title) {
    processed.title = processVariables(processed.title, variables);
  }
  
  if (processed.description) {
    processed.description = processVariables(processed.description, variables);
  }
  
  if (processed.footer_text) {
    processed.footer_text = processVariables(processed.footer_text, variables);
  }
  
  if (processed.author_name) {
    processed.author_name = processVariables(processed.author_name, variables);
  }
  
  if (processed.fields) {
    processed.fields = processed.fields.map(field => ({
      ...field,
      name: processVariables(field.name, variables),
      value: processVariables(field.value, variables)
    }));
  }
  
  return processed;
}
