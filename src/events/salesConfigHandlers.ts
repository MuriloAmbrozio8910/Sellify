/**
 * Handlers para configuração interativa do sistema de vendas
 */

import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  HexColorString
} from 'discord.js';
import { updateGuildConfig, getOrCreateGuildConfig } from '../utils/supabase';
import { logger } from '../utils/logger';

/**
 * Handler principal para botões de configuração de vendas
 */
export async function handleSalesConfigButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  switch (customId) {
    case 'config_sales_category':
      await handleConfigCategory(interaction);
      break;
    case 'config_sales_log_channel':
      await handleConfigLogChannel(interaction);
      break;
    case 'config_sales_currency':
      await handleConfigCurrency(interaction);
      break;
    case 'config_sales_color':
      await handleConfigColor(interaction);
      break;
    case 'config_sales_payment':
      await handleConfigPayment(interaction);
      break;
    case 'config_sales_view':
      await handleViewConfig(interaction);
      break;
  }
}

/**
 * Configurar Categoria de Vendas
 */
async function handleConfigCategory(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_config_sales_category')
    .setTitle('📁 Configurar Categoria');

  const categoryInput = new TextInputBuilder()
    .setCustomId('category_id')
    .setLabel('ID da Categoria')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Clique com botão direito na categoria > Copiar ID')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(categoryInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configurar Canal de Logs
 */
async function handleConfigLogChannel(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_config_sales_log_channel')
    .setTitle('📋 Configurar Canal de Logs');

  const channelInput = new TextInputBuilder()
    .setCustomId('channel_id')
    .setLabel('ID do Canal')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Clique com botão direito no canal > Copiar ID')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(channelInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configurar Moeda
 */
async function handleConfigCurrency(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_config_sales_currency')
    .setTitle('💰 Configurar Moeda');

  const currencyInput = new TextInputBuilder()
    .setCustomId('currency')
    .setLabel('Código da moeda (BRL, USD, EUR)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('BRL')
    .setRequired(true)
    .setMaxLength(3)
    .setMinLength(3);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(currencyInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configurar Cor dos Embeds
 */
async function handleConfigColor(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_config_sales_color')
    .setTitle('🎨 Configurar Cor');

  const colorInput = new TextInputBuilder()
    .setCustomId('color')
    .setLabel('Cor em hexadecimal (ex: #5865F2)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('#5865F2')
    .setRequired(true)
    .setMaxLength(7)
    .setMinLength(7);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configurar Métodos de Pagamento
 */
async function handleConfigPayment(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_config_sales_payment')
    .setTitle('💳 Métodos de Pagamento');

  const stripeInput = new TextInputBuilder()
    .setCustomId('stripe_enabled')
    .setLabel('Ativar Stripe? (sim/nao)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('sim')
    .setRequired(true);

  const mercadopagoInput = new TextInputBuilder()
    .setCustomId('mercadopago_enabled')
    .setLabel('Ativar Mercado Pago? (sim/nao)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('sim')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(stripeInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(mercadopagoInput)
  );

  await interaction.showModal(modal);
}

/**
 * Ver Configuração Atual
 */
async function handleViewConfig(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const config = await getOrCreateGuildConfig(interaction.guildId!);

    const embed = new EmbedBuilder()
      .setColor((config.embed_color || '#5865F2') as HexColorString)
      .setTitle('📄 Configuração Atual do Sistema de Vendas')
      .setTimestamp();

    const fields = [];

    if (config.sales_category_id) {
      const category = interaction.guild!.channels.cache.get(config.sales_category_id);
      fields.push({
        name: '📁 Categoria de Vendas',
        value: category ? category.name : `ID: ${config.sales_category_id}`,
        inline: true
      });
    }

    if (config.log_channel_id) {
      fields.push({
        name: '📋 Canal de Logs',
        value: `<#${config.log_channel_id}>`,
        inline: true
      });
    }

    fields.push({
      name: '💰 Moeda',
      value: config.currency || 'BRL',
      inline: true
    });

    fields.push({
      name: '🎨 Cor dos Embeds',
      value: config.embed_color || '#5865F2',
      inline: true
    });

    fields.push({
      name: '💳 Stripe',
      value: config.stripe_enabled ? '✅ Ativado' : '❌ Desativado',
      inline: true
    });

    fields.push({
      name: '💚 Mercado Pago',
      value: config.mercadopago_enabled ? '✅ Ativado' : '❌ Desativado',
      inline: true
    });

    if (fields.length > 0) {
      embed.addFields(fields);
      embed.setDescription('✅ Sistema de vendas configurado');
    } else {
      embed.setDescription('⚠️ Algumas configurações ainda não foram definidas.');
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    logger.error(`Erro ao buscar configuração: ${error}`);
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao buscar configuração.'}`
    });
  }
}

/**
 * Handler para modais de configuração de vendas
 */
export async function handleSalesConfigModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });

  const customId = interaction.customId;

  try {
    switch (customId) {
      case 'modal_config_sales_category':
        const categoryId = interaction.fields.getTextInputValue('category_id');
        const category = interaction.guild!.channels.cache.get(categoryId);

        if (!category || category.type !== 4) { // 4 = Category
          await interaction.editReply({
            content: '❌ Categoria não encontrada. Verifique o ID e certifique-se de que é uma categoria.'
          });
          return;
        }

        await updateGuildConfig(interaction.guildId!, {
          sales_category_id: categoryId
        });

        await interaction.editReply({
          content: `✅ Categoria configurada: **${category.name}**\n\nOs canais de vendas serão criados nesta categoria.`
        });
        break;

      case 'modal_config_sales_log_channel':
        const channelId = interaction.fields.getTextInputValue('channel_id');
        const channel = interaction.guild!.channels.cache.get(channelId);

        if (!channel || !channel.isTextBased()) {
          await interaction.editReply({
            content: '❌ Canal não encontrado. Verifique o ID e certifique-se de que é um canal de texto.'
          });
          return;
        }

        await updateGuildConfig(interaction.guildId!, {
          log_channel_id: channelId
        });

        await interaction.editReply({
          content: `✅ Canal de logs configurado: ${channel}\n\nTodas as transações serão registradas neste canal.`
        });
        break;

      case 'modal_config_sales_currency':
        const currency = interaction.fields.getTextInputValue('currency').toUpperCase();

        const validCurrencies = ['BRL', 'USD', 'EUR'];
        if (!validCurrencies.includes(currency)) {
          await interaction.editReply({
            content: '❌ Moeda inválida. Use: BRL, USD ou EUR'
          });
          return;
        }

        await updateGuildConfig(interaction.guildId!, {
          currency
        });

        await interaction.editReply({
          content: `✅ Moeda configurada: **${currency}**\n\nTodos os preços serão exibidos nesta moeda.`
        });
        break;

      case 'modal_config_sales_color':
        const color = interaction.fields.getTextInputValue('color').toUpperCase();

        // Validar formato hex
        if (!/^#[0-9A-F]{6}$/i.test(color)) {
          await interaction.editReply({
            content: '❌ Formato de cor inválido. Use o formato: #RRGGBB (ex: #5865F2)'
          });
          return;
        }

        await updateGuildConfig(interaction.guildId!, {
          embed_color: color
        });

        const colorEmbed = new EmbedBuilder()
          .setColor(color as HexColorString)
          .setTitle('✅ Cor Atualizada')
          .setDescription(`A cor dos embeds foi alterada para **${color}**`)
          .setTimestamp();

        await interaction.editReply({ embeds: [colorEmbed] });
        break;

      case 'modal_config_sales_payment':
        const stripeEnabled = interaction.fields.getTextInputValue('stripe_enabled').toLowerCase() === 'sim';
        const mercadopagoEnabled = interaction.fields.getTextInputValue('mercadopago_enabled').toLowerCase() === 'sim';

        await updateGuildConfig(interaction.guildId!, {
          stripe_enabled: stripeEnabled,
          mercadopago_enabled: mercadopagoEnabled
        });

        await interaction.editReply({
          content: 
            `✅ Métodos de pagamento atualizados!\n\n` +
            `💳 **Stripe:** ${stripeEnabled ? '✅ Ativado' : '❌ Desativado'}\n` +
            `💚 **Mercado Pago:** ${mercadopagoEnabled ? '✅ Ativado' : '❌ Desativado'}\n\n` +
            `⚠️ **Lembre-se:** Configure as credenciais com \`/configurar payment-set\``
        });
        break;
    }
  } catch (error: any) {
    logger.error(`Erro ao processar configuração de vendas: ${error}`);
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao salvar configuração.'}`
    });
  }
}
