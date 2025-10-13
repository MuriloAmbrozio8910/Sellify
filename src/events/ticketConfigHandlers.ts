/**
 * Handlers para configuração funcional do sistema de tickets
 */

import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder
} from 'discord.js';
import { upsertTicketConfig } from '../utils/ticketManager';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

/**
 * Handler principal para botões de configuração de tickets
 */
export async function handleTicketConfigButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  switch (customId) {
    case 'config_ticket_category':
      await handleConfigCategory(interaction);
      break;
    case 'config_ticket_support_role':
      await handleConfigSupportRole(interaction);
      break;
    case 'config_ticket_log_channel':
      await handleConfigLogChannel(interaction);
      break;
    case 'config_ticket_welcome_message':
      await handleConfigWelcomeMessage(interaction);
      break;
    case 'config_ticket_notifications':
      await handleConfigNotifications(interaction);
      break;
    case 'config_ticket_limit':
      await handleConfigLimit(interaction);
      break;
    case 'config_ticket_view':
      await handleViewConfig(interaction);
      break;
  }
}

/**
 * Configurar Categoria
 */
async function handleConfigCategory(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_config_ticket_category')
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
 * Configurar Role de Suporte
 */
async function handleConfigSupportRole(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_config_ticket_support_role')
    .setTitle('👥 Configurar Role de Suporte');

  const roleInput = new TextInputBuilder()
    .setCustomId('role_id')
    .setLabel('ID da Role')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Clique com botão direito na role > Copiar ID')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(roleInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configurar Canal de Logs
 */
async function handleConfigLogChannel(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_config_ticket_log_channel')
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
 * Configurar Mensagem de Boas-vindas
 */
async function handleConfigWelcomeMessage(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_config_ticket_welcome_message')
    .setTitle('💬 Mensagem de Boas-vindas');

  const messageInput = new TextInputBuilder()
    .setCustomId('welcome_message')
    .setLabel('Mensagem')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Olá! Nossa equipe responderá em breve...')
    .setRequired(false)
    .setMaxLength(2000);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configurar Notificações
 */
async function handleConfigNotifications(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_config_ticket_notifications')
    .setTitle('🔔 Configurar Notificações');

  const notifyInput = new TextInputBuilder()
    .setCustomId('auto_notify')
    .setLabel('Notificar moderadores automaticamente? (sim/nao)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('sim')
    .setRequired(true)
    .setValue('sim');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(notifyInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configurar Limite de Tickets
 */
async function handleConfigLimit(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_config_ticket_limit')
    .setTitle('📊 Limite de Tickets');

  const limitInput = new TextInputBuilder()
    .setCustomId('max_tickets')
    .setLabel('Máximo de tickets abertos por usuário')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('3')
    .setRequired(true)
    .setValue('3');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(limitInput)
  );

  await interaction.showModal(modal);
}

/**
 * Ver Configuração Atual
 */
async function handleViewConfig(interaction: ButtonInteraction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const { data, error } = await supabase
      .from('ticket_config')
      .select('*')
      .eq('guild_id', interaction.guildId!)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📄 Configuração Atual do Sistema de Tickets')
      .setTimestamp();

    if (!data) {
      embed.setDescription('❌ Nenhuma configuração encontrada. Use os botões acima para configurar.');
    } else {
      const fields = [];

      if (data.ticket_category_id) {
        const category = interaction.guild!.channels.cache.get(data.ticket_category_id);
        fields.push({
          name: '📁 Categoria',
          value: category ? category.name : `ID: ${data.ticket_category_id}`,
          inline: true
        });
      }

      if (data.support_role_id) {
        fields.push({
          name: '👥 Role de Suporte',
          value: `<@&${data.support_role_id}>`,
          inline: true
        });
      }

      if (data.log_channel_id) {
        fields.push({
          name: '📋 Canal de Logs',
          value: `<#${data.log_channel_id}>`,
          inline: true
        });
      }

      if (data.welcome_message) {
        fields.push({
          name: '💬 Mensagem de Boas-vindas',
          value: data.welcome_message.substring(0, 100) + (data.welcome_message.length > 100 ? '...' : ''),
          inline: false
        });
      }

      fields.push({
        name: '🔔 Notificações Automáticas',
        value: data.auto_notify_moderators ? '✅ Ativado' : '❌ Desativado',
        inline: true
      });

      fields.push({
        name: '📊 Limite por Usuário',
        value: data.max_open_tickets_per_user?.toString() || '3 (padrão)',
        inline: true
      });

      if (fields.length > 0) {
        embed.addFields(fields);
        embed.setDescription('✅ Sistema de tickets configurado');
      } else {
        embed.setDescription('⚠️ Algumas configurações ainda não foram definidas.');
      }
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
 * Handler para modais de configuração de tickets
 */
export async function handleTicketConfigModal(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  const customId = interaction.customId;

  try {
    switch (customId) {
      case 'modal_config_ticket_category':
        const categoryId = interaction.fields.getTextInputValue('category_id');
        const category = interaction.guild!.channels.cache.get(categoryId);

        if (!category || category.type !== 4) { // 4 = Category
          await interaction.editReply({
            content: '❌ Categoria não encontrada. Verifique o ID e certifique-se de que é uma categoria.'
          });
          return;
        }

        await upsertTicketConfig(interaction.guildId!, {
          ticket_category_id: categoryId
        });

        await interaction.editReply({
          content: `✅ Categoria configurada: **${category.name}**\n\nOs novos tickets serão criados nesta categoria.`
        });
        break;

      case 'modal_config_ticket_support_role':
        const roleId = interaction.fields.getTextInputValue('role_id');
        const role = interaction.guild!.roles.cache.get(roleId);

        if (!role) {
          await interaction.editReply({
            content: '❌ Role não encontrada. Verifique o ID.'
          });
          return;
        }

        await upsertTicketConfig(interaction.guildId!, {
          support_role_id: roleId
        });

        await interaction.editReply({
          content: `✅ Role de suporte configurada: ${role}\n\nMembros com esta role poderão ver todos os tickets.`
        });
        break;

      case 'modal_config_ticket_log_channel':
        const channelId = interaction.fields.getTextInputValue('channel_id');
        const channel = interaction.guild!.channels.cache.get(channelId);

        if (!channel || !channel.isTextBased()) {
          await interaction.editReply({
            content: '❌ Canal não encontrado. Verifique o ID e certifique-se de que é um canal de texto.'
          });
          return;
        }

        await upsertTicketConfig(interaction.guildId!, {
          log_channel_id: channelId
        });

        await interaction.editReply({
          content: `✅ Canal de logs configurado: ${channel}\n\nTodas as ações de tickets serão registradas neste canal.`
        });
        break;

      case 'modal_config_ticket_welcome_message':
        const message = interaction.fields.getTextInputValue('welcome_message');

        await upsertTicketConfig(interaction.guildId!, {
          welcome_message: message || undefined
        });

        await interaction.editReply({
          content: message
            ? `✅ Mensagem de boas-vindas configurada:\n\n"${message}"`
            : '✅ Mensagem de boas-vindas removida.'
        });
        break;

      case 'modal_config_ticket_notifications':
        const autoNotify = interaction.fields.getTextInputValue('auto_notify').toLowerCase() === 'sim';

        await upsertTicketConfig(interaction.guildId!, {
          auto_notify_moderators: autoNotify
        });

        await interaction.editReply({
          content: autoNotify
            ? '✅ Notificações automáticas ativadas!\n\nModeradoras com a role de suporte serão notificados quando novos tickets forem abertos.'
            : '✅ Notificações automáticas desativadas.'
        });
        break;

      case 'modal_config_ticket_limit':
        const maxTickets = parseInt(interaction.fields.getTextInputValue('max_tickets'));

        if (isNaN(maxTickets) || maxTickets < 1 || maxTickets > 10) {
          await interaction.editReply({
            content: '❌ Valor inválido. O limite deve ser entre 1 e 10.'
          });
          return;
        }

        await upsertTicketConfig(interaction.guildId!, {
          max_open_tickets_per_user: maxTickets
        });

        await interaction.editReply({
          content: `✅ Limite configurado: **${maxTickets} tickets** por usuário.\n\nUsuários não poderão abrir mais tickets do que este limite.`
        });
        break;
    }
  } catch (error: any) {
    logger.error(`Erro ao processar configuração: ${error}`);
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao salvar configuração.'}`
    });
  }
}
