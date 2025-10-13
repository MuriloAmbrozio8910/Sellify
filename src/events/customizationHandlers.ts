/**
 * Handlers para o sistema de personalização dinâmica
 */

import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import {
  saveCustomization,
  loadCustomization,
  getCustomizationOrDefault,
  applyCustomizationToEmbed,
  createCustomButtons,
  CustomizationData
} from '../utils/customization';
import { logger } from '../utils/logger';

// Armazenamento temporário de customizações em edição (por guild)
const tempCustomizations: Map<string, CustomizationData> = new Map();

/**
 * Get temporary customization for editing
 */
function getTempCustomization(guildId: string, type: string): CustomizationData {
  const key = `${guildId}:${type}`;
  if (!tempCustomizations.has(key)) {
    tempCustomizations.set(key, {});
  }
  return tempCustomizations.get(key)!;
}

/**
 * Update temporary customization
 */
function updateTempCustomization(guildId: string, type: string, updates: Partial<CustomizationData>) {
  const key = `${guildId}:${type}`;
  const current = getTempCustomization(guildId, type);
  tempCustomizations.set(key, { ...current, ...updates });
}

/**
 * Handler principal para botões de customização
 */
export async function handleCustomizationButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;
  
  // Extrair tipo de customização do customId (ex: customize_ticket_title -> ticket)
  const match = customId.match(/customize_(\w+)_(\w+)/);
  if (!match) return;
  
  const [, type, action] = match;
  
  switch (action) {
    case 'title':
      await handleCustomizeTitle(interaction, type);
      break;
    case 'description':
      await handleCustomizeDescription(interaction, type);
      break;
    case 'color':
      await handleCustomizeColor(interaction, type);
      break;
    case 'author':
      await handleCustomizeAuthor(interaction, type);
      break;
    case 'fields':
      await handleCustomizeFields(interaction, type);
      break;
    case 'footer':
      await handleCustomizeFooter(interaction, type);
      break;
    case 'image':
      await handleCustomizeImage(interaction, type);
      break;
    case 'thumbnail':
      await handleCustomizeThumbnail(interaction, type);
      break;
    case 'buttons':
      await handleCustomizeButtons(interaction, type);
      break;
    case 'config':
      await handleCustomizeConfig(interaction, type);
      break;
    case 'preview':
      await handlePreview(interaction, type);
      break;
    case 'save':
      await handleSave(interaction, type);
      break;
  }
}

/**
 * Customizar Título
 */
async function handleCustomizeTitle(interaction: ButtonInteraction, type: string) {
  const modal = new ModalBuilder()
    .setCustomId(`customize_modal_${type}_title`)
    .setTitle('📝 Personalizar Título');

  const titleInput = new TextInputBuilder()
    .setCustomId('title')
    .setLabel('Título do Embed')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Digite o título...')
    .setRequired(false)
    .setMaxLength(256);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput)
  );

  await interaction.showModal(modal);
}

/**
 * Customizar Descrição
 */
async function handleCustomizeDescription(interaction: ButtonInteraction, type: string) {
  const modal = new ModalBuilder()
    .setCustomId(`customize_modal_${type}_description`)
    .setTitle('📄 Personalizar Descrição');

  const descInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Descrição do Embed')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Digite a descrição...')
    .setRequired(false)
    .setMaxLength(4000);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(descInput)
  );

  await interaction.showModal(modal);
}

/**
 * Customizar Cor
 */
async function handleCustomizeColor(interaction: ButtonInteraction, type: string) {
  const modal = new ModalBuilder()
    .setCustomId(`customize_modal_${type}_color`)
    .setTitle('🎨 Personalizar Cor');

  const colorInput = new TextInputBuilder()
    .setCustomId('color')
    .setLabel('Cor do Embed (HEX)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('#5865F2')
    .setRequired(false)
    .setMaxLength(7);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput)
  );

  await interaction.showModal(modal);
}

/**
 * Customizar Autor
 */
async function handleCustomizeAuthor(interaction: ButtonInteraction, type: string) {
  const modal = new ModalBuilder()
    .setCustomId(`customize_modal_${type}_author`)
    .setTitle('👤 Personalizar Autor');

  const nameInput = new TextInputBuilder()
    .setCustomId('author_name')
    .setLabel('Nome do Autor')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Digite o nome...')
    .setRequired(false)
    .setMaxLength(256);

  const iconInput = new TextInputBuilder()
    .setCustomId('author_icon')
    .setLabel('URL do Ícone do Autor')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://...')
    .setRequired(false);

  const urlInput = new TextInputBuilder()
    .setCustomId('author_url')
    .setLabel('URL do Autor')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://...')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(iconInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(urlInput)
  );

  await interaction.showModal(modal);
}

/**
 * Customizar Campos
 */
async function handleCustomizeFields(interaction: ButtonInteraction, type: string) {
  const modal = new ModalBuilder()
    .setCustomId(`customize_modal_${type}_fields`)
    .setTitle('🏷️ Adicionar Campo');

  const nameInput = new TextInputBuilder()
    .setCustomId('field_name')
    .setLabel('Nome do Campo')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Suporte')
    .setRequired(true)
    .setMaxLength(256);

  const valueInput = new TextInputBuilder()
    .setCustomId('field_value')
    .setLabel('Valor do Campo')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Ex: Estamos disponíveis 24/7')
    .setRequired(true)
    .setMaxLength(1024);

  const inlineInput = new TextInputBuilder()
    .setCustomId('field_inline')
    .setLabel('Inline? (sim/nao)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('nao')
    .setRequired(false)
    .setValue('nao');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(valueInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(inlineInput)
  );

  await interaction.showModal(modal);
}

/**
 * Customizar Rodapé
 */
async function handleCustomizeFooter(interaction: ButtonInteraction, type: string) {
  const modal = new ModalBuilder()
    .setCustomId(`customize_modal_${type}_footer`)
    .setTitle('📝 Personalizar Rodapé');

  const textInput = new TextInputBuilder()
    .setCustomId('footer_text')
    .setLabel('Texto do Rodapé')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Digite o texto...')
    .setRequired(false)
    .setMaxLength(2048);

  const iconInput = new TextInputBuilder()
    .setCustomId('footer_icon')
    .setLabel('URL do Ícone do Rodapé')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://...')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(textInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(iconInput)
  );

  await interaction.showModal(modal);
}

/**
 * Customizar Imagem
 */
async function handleCustomizeImage(interaction: ButtonInteraction, type: string) {
  const modal = new ModalBuilder()
    .setCustomId(`customize_modal_${type}_image`)
    .setTitle('🖼️ Personalizar Imagem');

  const imageInput = new TextInputBuilder()
    .setCustomId('image_url')
    .setLabel('URL da Imagem')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://...')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput)
  );

  await interaction.showModal(modal);
}

/**
 * Customizar Thumbnail
 */
async function handleCustomizeThumbnail(interaction: ButtonInteraction, type: string) {
  const modal = new ModalBuilder()
    .setCustomId(`customize_modal_${type}_thumbnail`)
    .setTitle('🔳 Personalizar Thumbnail');

  const thumbnailInput = new TextInputBuilder()
    .setCustomId('thumbnail_url')
    .setLabel('URL da Thumbnail')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://...')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(thumbnailInput)
  );

  await interaction.showModal(modal);
}

/**
 * Customizar Botões
 */
async function handleCustomizeButtons(interaction: ButtonInteraction, type: string) {
  const modal = new ModalBuilder()
    .setCustomId(`customize_modal_${type}_buttons`)
    .setTitle('🔘 Adicionar Botão');

  const labelInput = new TextInputBuilder()
    .setCustomId('button_label')
    .setLabel('Texto do Botão')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Abrir Ticket')
    .setRequired(true)
    .setMaxLength(80);

  const customIdInput = new TextInputBuilder()
    .setCustomId('button_customid')
    .setLabel('Custom ID do Botão')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: create_ticket_suporte')
    .setRequired(true);

  const styleInput = new TextInputBuilder()
    .setCustomId('button_style')
    .setLabel('Estilo (primary/secondary/success/danger)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('primary')
    .setRequired(false)
    .setValue('primary');

  const emojiInput = new TextInputBuilder()
    .setCustomId('button_emoji')
    .setLabel('Emoji (opcional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('🎫')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(labelInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(customIdInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(styleInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(emojiInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configurações Gerais
 */
async function handleCustomizeConfig(interaction: ButtonInteraction, type: string) {
  const modal = new ModalBuilder()
    .setCustomId(`customize_modal_${type}_config`)
    .setTitle('⚙️ Configurações Gerais');

  const timestampInput = new TextInputBuilder()
    .setCustomId('timestamp')
    .setLabel('Mostrar timestamp? (sim/nao)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('sim')
    .setRequired(false)
    .setValue('sim');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(timestampInput)
  );

  await interaction.showModal(modal);
}

/**
 * Pré-visualizar
 */
async function handlePreview(interaction: ButtonInteraction, type: string) {
  await interaction.deferReply({ flags: 64 });

  try {
    const customization = getTempCustomization(interaction.guildId!, type);
    
    if (Object.keys(customization).length === 0) {
      await interaction.editReply({
        content: '❌ Nenhuma customização foi feita ainda. Use os botões acima para personalizar.'
      });
      return;
    }

    const embed = new EmbedBuilder();
    applyCustomizationToEmbed(embed, customization);

    const buttons = createCustomButtons(customization);

    await interaction.editReply({
      content: '**👁️ Pré-visualização:**',
      embeds: [embed],
      components: buttons.length > 0 ? [
        new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(0, 5))
      ] : []
    });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ Erro ao gerar pré-visualização: ${error.message}`
    });
  }
}

/**
 * Salvar Customização
 */
async function handleSave(interaction: ButtonInteraction, type: string) {
  await interaction.deferReply({ flags: 64 });

  try {
    const customization = getTempCustomization(interaction.guildId!, type);
    
    if (Object.keys(customization).length === 0) {
      await interaction.editReply({
        content: '❌ Nenhuma customização foi feita. Use os botões para personalizar antes de salvar.'
      });
      return;
    }

    await saveCustomization(interaction.guildId!, type, customization);

    // Limpar customização temporária
    const key = `${interaction.guildId!}:${type}`;
    tempCustomizations.delete(key);

    await interaction.editReply({
      content: `✅ **Customização salva com sucesso!**\n\n` +
               `Tipo: \`${type}\`\n` +
               `As alterações serão aplicadas automaticamente.`
    });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ Erro ao salvar customização: ${error.message}\n\n` +
               `**Nota:** A tabela \`customizations\` precisa existir no banco de dados.`
    });
  }
}

/**
 * Handler para modais de customização
 */
export async function handleCustomizationModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });

  const customId = interaction.customId;
  const match = customId.match(/customize_modal_(\w+)_(\w+)/);
  
  if (!match) {
    await interaction.editReply({ content: '❌ Modal inválido.' });
    return;
  }

  const [, type, field] = match;

  try {
    switch (field) {
      case 'title':
        const title = interaction.fields.getTextInputValue('title');
        if (title) updateTempCustomization(interaction.guildId!, type, { title });
        break;
        
      case 'description':
        const description = interaction.fields.getTextInputValue('description');
        if (description) updateTempCustomization(interaction.guildId!, type, { description });
        break;
        
      case 'color':
        const color = interaction.fields.getTextInputValue('color');
        if (color) updateTempCustomization(interaction.guildId!, type, { color });
        break;
        
      case 'author':
        const authorName = interaction.fields.getTextInputValue('author_name');
        const authorIcon = interaction.fields.getTextInputValue('author_icon');
        const authorUrl = interaction.fields.getTextInputValue('author_url');
        updateTempCustomization(interaction.guildId!, type, {
          author_name: authorName || undefined,
          author_icon: authorIcon || undefined,
          author_url: authorUrl || undefined
        });
        break;
        
      case 'fields':
        const fieldName = interaction.fields.getTextInputValue('field_name');
        const fieldValue = interaction.fields.getTextInputValue('field_value');
        const fieldInline = interaction.fields.getTextInputValue('field_inline').toLowerCase() === 'sim';
        
        const current = getTempCustomization(interaction.guildId!, type);
        const fields = current.fields || [];
        fields.push({ name: fieldName, value: fieldValue, inline: fieldInline });
        updateTempCustomization(interaction.guildId!, type, { fields });
        break;
        
      case 'footer':
        const footerText = interaction.fields.getTextInputValue('footer_text');
        const footerIcon = interaction.fields.getTextInputValue('footer_icon');
        updateTempCustomization(interaction.guildId!, type, {
          footer_text: footerText || undefined,
          footer_icon: footerIcon || undefined
        });
        break;
        
      case 'image':
        const imageUrl = interaction.fields.getTextInputValue('image_url');
        if (imageUrl) updateTempCustomization(interaction.guildId!, type, { image_url: imageUrl });
        break;
        
      case 'thumbnail':
        const thumbnailUrl = interaction.fields.getTextInputValue('thumbnail_url');
        if (thumbnailUrl) updateTempCustomization(interaction.guildId!, type, { thumbnail_url: thumbnailUrl });
        break;
        
      case 'buttons':
        const buttonLabel = interaction.fields.getTextInputValue('button_label');
        const buttonCustomId = interaction.fields.getTextInputValue('button_customid');
        const buttonStyle = interaction.fields.getTextInputValue('button_style') || 'primary';
        const buttonEmoji = interaction.fields.getTextInputValue('button_emoji');
        
        const currentB = getTempCustomization(interaction.guildId!, type);
        const buttons = currentB.buttons || [];
        buttons.push({
          customId: buttonCustomId,
          label: buttonLabel,
          style: buttonStyle,
          emoji: buttonEmoji || undefined
        });
        updateTempCustomization(interaction.guildId!, type, { buttons });
        break;
        
      case 'config':
        const timestamp = interaction.fields.getTextInputValue('timestamp').toLowerCase() === 'sim';
        updateTempCustomization(interaction.guildId!, type, { timestamp });
        break;
    }

    await interaction.editReply({
      content: `✅ **${field}** atualizado com sucesso!\n\n` +
               `Use o botão **👁️ Pré-visualizar** para ver as mudanças.\n` +
               `Quando terminar, clique em **💾 Salvar Tudo**.`
    });
  } catch (error: any) {
    logger.error(`Erro ao processar modal de customização: ${error}`);
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao processar customização.'}`
    });
  }
}
