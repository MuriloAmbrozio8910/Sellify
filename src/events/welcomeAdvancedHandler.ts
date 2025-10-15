import { logger } from '../utils/logger';
import { getOrCreateGuildConfig, updateGuildConfig } from '../utils/supabase';

/**
 * Handler para modal avançado de personalização visual
 */
export async function handleWelcomeAdvancedConfigModal(interaction: any) {
  try {
    await interaction.deferReply({ flags: 64 });

    const thumbnail = interaction.fields.getTextInputValue('welcome_thumbnail') || '';
    const footer = interaction.fields.getTextInputValue('welcome_footer') || '';
    const author = interaction.fields.getTextInputValue('welcome_author') || '';
    const timestamp = interaction.fields.getTextInputValue('welcome_timestamp').toLowerCase() === 'sim';
    const image = interaction.fields.getTextInputValue('welcome_image') || '';

    // Validar URLs se fornecidas
    const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    
    if (thumbnail && !urlRegex.test(thumbnail)) {
      await interaction.editReply({
        content: '❌ URL da thumbnail inválida. Use uma URL válida de imagem.'
      });
      return;
    }

    if (image && !urlRegex.test(image)) {
      await interaction.editReply({
        content: '❌ URL da imagem principal inválida. Use uma URL válida de imagem.'
      });
      return;
    }

    // Buscar configuração existente
    const guildConfig = await getOrCreateGuildConfig(interaction.guildId!);
    let existingConfig: any = {};
    
    // Verificar se já existe uma configuração de welcome_message
    if (guildConfig.welcome_message) {
      try {
        existingConfig = JSON.parse(guildConfig.welcome_message);
      } catch (error) {
        logger.error(`Erro ao parsear configuração existente: ${error}`);
        // Se não conseguir parsear, manter configuração vazia
        existingConfig = {};
      }
    }

    // Verificar se existe configuração básica de welcome
    if (!existingConfig || Object.keys(existingConfig).length === 0) {
      await interaction.editReply({
        content: '❌ Configure primeiro as mensagens de boas-vindas básicas antes de personalizar visualmente.\n\nUse o botão "Boas-vindas" para definir canal, mensagem e configurações básicas.'
      });
      return;
    }

    // Mesclar apenas as configurações visuais
    const updatedConfig = {
      ...existingConfig,
      thumbnail: thumbnail || existingConfig.thumbnail || '',
      footer: footer || existingConfig.footer || '',
      author: author || existingConfig.author || '',
      timestamp: timestamp,
      image: image || existingConfig.image || ''
    };

    // Atualizar configuração
    await updateGuildConfig(interaction.guildId!, {
      welcome_message: JSON.stringify(updatedConfig)
    });

    await interaction.editReply({
      content: `✅ Personalização visual configurada com sucesso!\n\n**🖼️ Thumbnail:** ${thumbnail || 'Não definida'}\n**📝 Footer:** ${footer || 'Não definido'}\n**👤 Autor:** ${author || 'Não definido'}\n**⏰ Timestamp:** ${timestamp ? 'Ativado' : 'Desativado'}\n**🖼️ Imagem:** ${image || 'Não definida'}`
    });
  } catch (error) {
    logger.error(`Erro ao configurar personalização visual: ${error}`);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ Erro ao salvar personalização visual. Tente novamente.',
        flags: 64
      });
    } else {
      await interaction.editReply({
        content: '❌ Erro ao salvar personalização visual. Tente novamente.'
      });
    }
  }
}