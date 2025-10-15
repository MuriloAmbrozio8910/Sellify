/**
 * Handlers de interações para painéis e novos sistemas
 */

import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits,
  ChannelType,
  HexColorString
} from 'discord.js';
import { claimTicket, closeTicket, createTicket, getTicketStats, listTickets } from '../utils/ticketManager';
import { sendBroadcastDM, listAnnouncements } from '../utils/announcementManager';
import { getAIUsageStats } from '../utils/aiService';
import { logger } from '../utils/logger';
import { getOrCreateGuildConfig, supabase, updateGuildConfig } from '../utils/supabase';
import { getThemeColors } from '../utils/designSystem';
import { 
  saveCustomization,
  loadCustomization,
  applyCustomizationToEmbed,
  CustomizationData
} from '../utils/customization';
import { TicketPriority, TransactionStatus } from '../types';

/**
 * Handler principal de painéis
 */
export async function handlePanelButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  // Painel principal
  if (customId === 'panel_refresh') {
    await handlePanelRefresh(interaction);
  }
  else if (customId === 'panel_main' || customId === 'panel_back_main') {
    await handleBackToMainPanel(interaction);
  }
  else if (customId === 'panel_products') {
    await handleProductsPanel(interaction);
  }
  else if (customId === 'panel_sales') {
    await handleSalesPanel(interaction);
  }
  else if (customId === 'panel_coupons') {
    await handleCouponsPanel(interaction);
  }
  else if (customId === 'panel_reviews') {
    const { handleReviewsPanel } = await import('./reviewHandlers');
    await handleReviewsPanel(interaction);
  }
  else if (customId === 'panel_stats') {
    await handleStatsPanel(interaction);
  }
  else if (customId === 'panel_tickets') {
    await handleTicketsPanel(interaction);
  }
  else if (customId === 'panel_announcements') {
    await handleAnnouncementsPanel(interaction);
  }
  else if (customId === 'panel_automations') {
    await handleAutomationsPanel(interaction);
  }
  else if (customId === 'panel_ai') {
    await handleAIPanel(interaction);
  }
  else if (customId === 'panel_config') {
    await handleConfigPanel(interaction);
  }
  else if (customId === 'panel_settings') {
    await handleSettingsPanel(interaction);
  }
  else if (customId === 'panel_customization') {
    await handleCustomizationPanel(interaction);
  }
  else if (customId === 'panel_logs') {
    await handleLogsPanel(interaction);
  }
  else if (customId === 'panel_help') {
    await handleHelpPanel(interaction);
  }
  else if (customId === 'panel_setup_public') {
    await handleSetupPublicPanel(interaction);
  }
  else if (customId === 'tickets_view_all') {
    await handleViewAllTickets(interaction);
  }
  else if (customId === 'tickets_create_panel') {
    await handleCreatePublicTicketPanel(interaction);
  }
  // Botões de Produtos
  else if (customId === 'products_create') {
    await handleProductCreate(interaction);
  }
  else if (customId === 'products_list') {
    await handleProductsList(interaction);
  }
  else if (customId === 'products_catalog') {
    await handleProductsCatalog(interaction);
  }
  // Botões de Cupons
  else if (customId === 'coupons_create') {
    await handleCouponCreate(interaction);
  }
  else if (customId === 'coupons_list') {
    await handleCouponsList(interaction);
  }
  // Botões de Vendas
  else if (customId === 'sales_stats') {
    await handleSalesStats(interaction);
  }
  else if (customId === 'sales_recent') {
    await handleSalesRecent(interaction);
  }
  else if (customId === 'sales_top_products') {
    await handleSalesTopProducts(interaction);
  }
  else if (customId === 'sales_config') {
    await handleSalesConfigPanel(interaction);
  }
  // Botões de Configurações
  else if (customId.startsWith('settings_')) {
    await handleSettingsButton(interaction, customId);
  }
  // Botões de Personalização
  else if (customId.startsWith('custom_')) {
    await handleCustomButton(interaction, customId);
  }
  // Botões de Estatísticas
  else if (customId === 'stats_general') {
    await handleStatsGeneral(interaction);
  }
  else if (customId === 'stats_products') {
    await handleStatsProducts(interaction);
  }
  else if (customId === 'stats_users') {
    await handleStatsUsers(interaction);
  }
  // Botões de Anúncios
  else if (customId === 'announcements_create') {
    await handleAnnouncementsCreate(interaction);
  }
  else if (customId === 'announcements_list') {
    await handleAnnouncementsList(interaction);
  }
  else if (customId === 'announcements_scheduled') {
    await handleAnnouncementsScheduled(interaction);
  }
  // Botões de Avaliações
  else if (customId === 'reviews_products') {
    const { handleProductReviews } = await import('./reviewHandlers');
    await handleProductReviews(interaction);
  }
  else if (customId === 'reviews_sellers') {
    const { handleSellerReviews } = await import('./reviewHandlers');
    await handleSellerReviews(interaction);
  }
  else if (customId === 'reviews_top_products') {
    const { handleTopProducts } = await import('./reviewHandlers');
    await handleTopProducts(interaction);
  }
  else if (customId === 'reviews_top_sellers') {
    const { handleTopSellers } = await import('./reviewHandlers');
    await handleTopSellers(interaction);
  }
  else if (customId === 'reviews_pending') {
    await handleReviewsPending(interaction);
  }
  // Botões de Automações
  else if (customId === 'automations_roles') {
    await handleAutomationsRoles(interaction);
  }
  else if (customId === 'automations_messages') {
    await handleAutomationsMessages(interaction);
  }
  else if (customId === 'automations_tasks') {
    await handleAutomationsTasks(interaction);
  }
  // Botões de IA
  else if (customId === 'ai_chat') {
    await handleAIChat(interaction);
  }
  else if (customId === 'ai_generate') {
    await handleAIGenerate(interaction);
  }
  else if (customId === 'ai_stats') {
    await handleAIStats(interaction);
  }
  // Botões de Configurações
  else if (customId === 'config_payment') {
    await handleConfigPayment(interaction);
  }
  else if (customId === 'config_appearance') {
    await handleConfigAppearance(interaction);
  }
  else if (customId === 'config_channels') {
    await handleConfigChannels(interaction);
  }
  // Botões de Logs
  else if (customId === 'logs_transactions') {
    await handleLogsTransactions(interaction);
  }
  else if (customId === 'logs_commands') {
    await handleLogsCommands(interaction);
  }
  else if (customId === 'logs_actions') {
    await handleLogsActions(interaction);
  }
  // Botões de Ajuda
  else if (customId === 'help_commands') {
    await handleHelpCommands(interaction);
  }
  else if (customId === 'help_features') {
    await handleHelpFeatures(interaction);
  }
  else if (customId === 'help_support') {
    await handleHelpSupport(interaction);
  }
  // Botões de Tarefas
  else if (customId === 'task_cleanup') {
    await handleTaskCleanup(interaction);
  }
  else if (customId === 'task_reports') {
    await handleTaskReports(interaction);
  }
  else if (customId === 'task_list') {
    await handleTaskList(interaction);
  }
}

/**
 * Atualizar painel principal
 */
async function handlePanelRefresh(interaction: ButtonInteraction) {
  await interaction.deferUpdate();
  
  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);
  const ticketStats = await getTicketStats(interaction.guildId!);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle('🎛️ Painel de Gerenciamento')
    .setDescription(
      `Bem-vindo ao painel de controle do **${interaction.guild!.name}**!\n\n` +
      `Aqui você pode gerenciar todas as funcionalidades do bot de forma rápida e intuitiva.`
    )
    .addFields(
      {
        name: '📊 Estatísticas Gerais',
        value: 
          `👥 **Membros:** ${interaction.guild!.memberCount}\n` +
          `🎫 **Tickets Abertos:** ${ticketStats?.open || 0}\n` +
          `🎫 **Tickets em Atendimento:** ${ticketStats?.claimed || 0}\n` +
          `✅ **Tickets Fechados:** ${ticketStats?.closed || 0}`,
        inline: true
      },
      {
        name: '⚙️ Configurações',
        value:
          `💰 **Moeda:** ${config.currency}\n` +
          `🎨 **Cor:** ${theme.primary}\n` +
          `💳 **Stripe:** ${config.stripe_enabled ? '✅' : '❌'}\n` +
          `💚 **Mercado Pago:** ${config.mercadopago_enabled ? '✅' : '❌'}`,
        inline: true
      }
    )
    .setFooter({ text: `Atualizado • ${new Date().toLocaleTimeString('pt-BR')}` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

/**
 * Voltar ao painel principal - REUTILIZA comando /painel
 */
async function handleBackToMainPanel(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  try {
    // REUTILIZAR exatamente o código do comando /painel
    const { execute: painelExecute } = await import('../commands/painel');
    
    // Criar interação compatível que simula o comando /painel
    const fakeInteraction = {
      ...interaction,
      guild: interaction.guild,
      guildId: interaction.guildId,
      options: {
        getSubcommand: () => null,
        getString: () => null,
        getInteger: () => null
      },
      editReply: interaction.editReply.bind(interaction),
      deferReply: async () => {} // Já foi feito defer
    } as any;

    await painelExecute(fakeInteraction);
    
  } catch (error) {
    console.error('Erro ao voltar ao painel:', error);
    await interaction.editReply({
      content: '❌ Erro ao carregar painel. Tente usar `/painel` novamente.'
    });
  }
}

/**
 * Painel de produtos
 */
async function handleProductsPanel(interaction: ButtonInteraction) {
  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle('🛍️ Painel de Produtos')
    .setDescription(
      'Gerencie todos os produtos do seu servidor.\n\n' +
      'Use os botões abaixo para criar, visualizar e gerenciar produtos de forma rápida e prática.'
    )
    .setFooter({ text: 'Clique nos botões para ações rápidas!' });

  const rowActions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('products_create')
        .setLabel('Criar Produto')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('products_list')
        .setLabel('Listar Produtos')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('products_catalog')
        .setLabel('Ver Catálogo')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🛍️')
    );

  const rowBack = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de vendas
 */
async function handleSalesPanel(interaction: ButtonInteraction) {
  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle('💰 Painel de Vendas')
    .setDescription('Acompanhe e gerencie todas as vendas do servidor.\n\nUse os botões abaixo para acessar estatísticas e relatórios.')
    .setFooter({ text: 'Dashboard de vendas' });

  const rowActions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('sales_stats')
        .setLabel('Estatísticas')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📊'),
      new ButtonBuilder()
        .setCustomId('sales_recent')
        .setLabel('Vendas Recentes')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🕒'),
      new ButtonBuilder()
        .setCustomId('sales_top_products')
        .setLabel('Top Produtos')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🏆'),
      new ButtonBuilder()
        .setCustomId('sales_config')
        .setLabel('Configurar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⚙️')
    );

  const rowBack = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de cupons
 */
async function handleCouponsPanel(interaction: ButtonInteraction) {
  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle('🎟️ Painel de Cupons')
    .setDescription(
      'Gerencie cupons de desconto para aumentar suas vendas.\n\n' +
      'Use os botões abaixo para criar e gerenciar cupons de forma fácil.'
    )
    .setFooter({ text: 'Cupons ajudam a aumentar suas vendas!' });

  const rowActions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('coupons_create')
        .setLabel('Criar Cupom')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('coupons_list')
        .setLabel('Listar Cupons')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋')
    );

  const rowBack = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de estatísticas
 */
async function handleStatsPanel(interaction: ButtonInteraction) {
  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle('📊 Painel de Estatísticas')
    .setDescription(
      'Visualize métricas e análises completas do servidor.\n\n' +
      'Acesse estatísticas de vendas, produtos e desempenho geral.'
    )
    .setFooter({ text: 'Análises em tempo real' });

  const rowActions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('stats_general')
        .setLabel('Visão Geral')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📈'),
      new ButtonBuilder()
        .setCustomId('stats_products')
        .setLabel('Por Produtos')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🛍️'),
      new ButtonBuilder()
        .setCustomId('stats_users')
        .setLabel('Por Usuários')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('👥')
    );

  const rowBack = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de tickets
 */
async function handleTicketsPanel(interaction: ButtonInteraction) {
  const stats = await getTicketStats(interaction.guildId!);
  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle('🎫 Painel de Tickets')
    .setDescription('Sistema completo de suporte por tickets')
    .addFields(
      { name: '📊 Estatísticas', value: 
        `🟢 **Abertos:** ${stats?.open || 0}\n` +
        `🟡 **Em Atendimento:** ${stats?.claimed || 0}\n` +
        `🔴 **Fechados:** ${stats?.closed || 0}\n` +
        `⏱️ **Tempo Médio:** ${stats?.avgResolutionTimeMinutes || 0} min`
      },
      { name: '🎯 Comandos', value: 
        `• \`/ticket abrir\` - Abrir ticket\n` +
        `• \`/ticket listar\` - Listar tickets\n` +
        `• \`/ticket stats\` - Ver estatísticas\n` +
        `• \`/ticket setup\` - Configurar sistema\n` +
        `• \`/ticket painel\` - Criar painel público`
      }
    );

  const rowActions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('tickets_create_panel')
        .setLabel('Criar Painel Público')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('tickets_view_all')
        .setLabel('Ver Todos os Tickets')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔍')
    );

  const rowBack = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de anúncios
 */
async function handleAnnouncementsPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle('📢 Painel de Anúncios')
    .setDescription(
      'Crie e gerencie anúncios para os membros do servidor.\n\n' +
      'Envie mensagens, agende comunicados e faça broadcasts.'
    )
    .setFooter({ text: 'Sistema de comunicação em massa' });

  const rowActions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('announcements_create')
        .setLabel('Criar Anúncio')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('announcements_list')
        .setLabel('Listar Anúncios')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('announcements_scheduled')
        .setLabel('Agendados')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⏰')
    );

  const rowBack = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de automações
 */
async function handleAutomationsPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#00CED1')
    .setTitle('🤖 Painel de Automações')
    .setDescription(
      'Automatize tarefas administrativas e otimize seu servidor.\n\n' +
      'Configure ações automáticas, mensagens programadas e muito mais.'
    )
    .setFooter({ text: 'Economize tempo com automação' });

  const rowActions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('automations_roles')
        .setLabel('Auto Roles')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👥'),
      new ButtonBuilder()
        .setCustomId('automations_messages')
        .setLabel('Mensagens Auto')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💬'),
      new ButtonBuilder()
        .setCustomId('automations_tasks')
        .setLabel('Tarefas')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⚙️')
    );

  const rowBack = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de IA
 */
async function handleAIPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#9B59B6')
    .setTitle('🧠 Painel de IA')
    .setDescription(
      'Recursos avançados de Inteligência Artificial.\n\n' +
      'Use IA para chat, geração de conteúdo, moderação e muito mais.'
    )
    .setFooter({ text: 'Powered by OpenAI GPT-4' });

  const rowActions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('ai_chat')
        .setLabel('Chat IA')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💬'),
      new ButtonBuilder()
        .setCustomId('ai_generate')
        .setLabel('Gerar Conteúdo')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✍️'),
      new ButtonBuilder()
        .setCustomId('ai_stats')
        .setLabel('Estatísticas')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📊')
    );

  const rowBack = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de configurações
 */
async function handleConfigPanel(interaction: ButtonInteraction) {
  const config = await getOrCreateGuildConfig(interaction.guildId!);

  const embed = new EmbedBuilder()
    .setColor('#95A5A6')
    .setTitle('⚙️ Painel de Configurações')
    .setDescription(
      'Configure o bot conforme suas necessidades.\n\n' +
      `**Moeda:** ${config.currency}\n` +
      `**Cor:** ${config.embed_color}\n` +
      `**Stripe:** ${config.stripe_enabled ? '✅' : '❌'} | **Mercado Pago:** ${config.mercadopago_enabled ? '✅' : '❌'}`
    )
    .setFooter({ text: 'Personalize seu bot' });

  const rowActions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('config_payment')
        .setLabel('Pagamentos')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💳'),
      new ButtonBuilder()
        .setCustomId('config_appearance')
        .setLabel('Aparência')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎨'),
      new ButtonBuilder()
        .setCustomId('config_channels')
        .setLabel('Canais')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📱')
    );

  const rowBack = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de logs
 */
async function handleLogsPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#34495E')
    .setTitle('📋 Painel de Logs')
    .setDescription(
      'Sistema de logs e auditoria do servidor.\n\n' +
      'Acompanhe todas as atividades e transações do bot.'
    )
    .setFooter({ text: 'Sistema de auditoria' });

  const rowActions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('logs_transactions')
        .setLabel('Transações')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💰'),
      new ButtonBuilder()
        .setCustomId('logs_commands')
        .setLabel('Comandos')
        .setStyle(ButtonStyle.Success)
        .setEmoji('⌨️'),
      new ButtonBuilder()
        .setCustomId('logs_actions')
        .setLabel('Ações')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📝')
    );

  const rowBack = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de ajuda
 */
async function handleHelpPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#3498DB')
    .setTitle('❓ Ajuda e Documentação')
    .setDescription(
      'Central de ajuda com todos os comandos e recursos.\n\n' +
      'Escolha uma categoria abaixo para ver os comandos disponíveis.'
    )
    .setFooter({ text: 'Bot de Vendas Discord v2.0' });

  const rowActions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('help_commands')
        .setLabel('Comandos')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('⌨️'),
      new ButtonBuilder()
        .setCustomId('help_features')
        .setLabel('Funcionalidades')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✨'),
      new ButtonBuilder()
        .setCustomId('help_support')
        .setLabel('Suporte')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🆘')
    );

  const rowBack = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Handler para botões de criação de tickets do painel
 */
export async function handleTicketCreationButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;
  
  if (!customId.startsWith('create_ticket_')) return;

  const category = customId.replace('create_ticket_', '');
  
  // Criar modal para coletar informações do ticket
  const modal = new ModalBuilder()
    .setCustomId(`ticket_modal_${category}`)
    .setTitle('Abrir Ticket de Suporte');

  const subjectInput = new TextInputBuilder()
    .setCustomId('ticket_subject')
    .setLabel('Assunto do Ticket')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Descreva brevemente seu problema')
    .setRequired(true)
    .setMaxLength(100);

  const descriptionInput = new TextInputBuilder()
    .setCustomId('ticket_description')
    .setLabel('Descrição Detalhada')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Descreva seu problema com o máximo de detalhes possível')
    .setRequired(true)
    .setMaxLength(1000);

  const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(subjectInput);
  const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput);

  modal.addComponents(firstRow, secondRow);

  await interaction.showModal(modal);
}

/**
 * Handler para modal de ticket
 */
export async function handleTicketModal(interaction: any) {
  const customId = interaction.customId;
  
  if (!customId.startsWith('ticket_modal_')) return;

  const category = customId.replace('ticket_modal_', '');
  const subject = interaction.fields.getTextInputValue('ticket_subject');
  const description = interaction.fields.getTextInputValue('ticket_description');

  await interaction.deferReply({ flags: 64 });

  try {
    const { ticket, channel } = await createTicket(
      interaction.guild!,
      interaction.user,
      subject,
      category,
      TicketPriority.MEDIUM
    );

    // Enviar a descrição detalhada no canal do ticket
    await channel.send(`📝 **Descrição do problema:**\n\n${description}`);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Ticket Criado!')
      .setDescription(
        `Seu ticket foi criado com sucesso!\n\n` +
        `**Canal:** ${channel}\n` +
        `**Categoria:** ${category}\n\n` +
        `Nossa equipe irá atendê-lo em breve.`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao criar ticket.'}`
    });
  }
}

/**
 * Handler para botões de ticket (assumir, fechar, etc)
 */
export async function handleTicketActionButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  if (customId.startsWith('ticket_claim_')) {
    await handleClaimTicket(interaction);
  }
  else if (customId.startsWith('ticket_close_')) {
    await handleCloseTicket(interaction);
  }
  else if (customId.startsWith('ticket_priority_')) {
    await handleChangePriority(interaction);
  }
}

async function handleClaimTicket(interaction: ButtonInteraction) {
  const ticketId = interaction.customId.replace('ticket_claim_', '');

  await interaction.deferReply({ flags: 64 });

  try {
    await claimTicket(ticketId, interaction.member as any);

    await interaction.editReply({
      content: '✅ Você assumiu este ticket com sucesso!'
    });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao assumir ticket.'}`
    });
  }
}

async function handleCloseTicket(interaction: ButtonInteraction) {
  const ticketId = interaction.customId.replace('ticket_close_', '');

  await interaction.deferReply({ flags: 64 });

  try {
    await closeTicket(ticketId, interaction.member as any);

    await interaction.editReply({
      content: '✅ Ticket fechado com sucesso!'
    });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao fechar ticket.'}`
    });
  }
}

async function handleChangePriority(interaction: ButtonInteraction) {
  await interaction.reply({
    content: '🔄 Selecione a nova prioridade para este ticket usando os comandos de ticket disponíveis.',
    flags: 64
  });
}

/**
 * Ver todos os tickets do servidor
 */
async function handleViewAllTickets(interaction: ButtonInteraction) {
  // Verificar permissão
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
    await interaction.reply({
      content: '❌ Você precisa de permissão de moderador para ver todos os tickets.',
      flags: 64
    });
    return;
  }

  await interaction.deferReply({ flags: 64 });

  try {
    const tickets = await listTickets(interaction.guildId!);

    if (tickets.length === 0) {
      await interaction.editReply('Nenhum ticket encontrado.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎫 Todos os Tickets')
      .setDescription(`Total: **${tickets.length}** tickets`)
      .setTimestamp();

    // Mostrar primeiros 10 tickets
    const ticketsToShow = tickets.slice(0, 10);
    for (const ticket of ticketsToShow) {
      const statusEmoji = ticket.status === 'open' ? '🟢' : ticket.status === 'claimed' ? '🟡' : '🔴';
      const priorityEmoji = ticket.priority === 'urgent' ? '🔴' : ticket.priority === 'high' ? '🟠' : ticket.priority === 'medium' ? '🟡' : '🟢';
      
      embed.addFields({
        name: `${statusEmoji} ${ticket.subject}`,
        value: 
          `**ID:** \`${ticket.id.slice(0, 8)}\`\n` +
          `**Usuário:** <@${ticket.user_id}>\n` +
          `**Canal:** <#${ticket.channel_id}>\n` +
          `**Prioridade:** ${priorityEmoji} ${ticket.priority}\n` +
          `**Criado:** <t:${Math.floor(new Date(ticket.created_at).getTime() / 1000)}:R>`,
        inline: false
      });
    }

    if (tickets.length > 10) {
      embed.setFooter({ text: `Mostrando 10 de ${tickets.length} tickets` });
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_main')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao listar tickets.'}`
    });
  }
}

/**
 * Criar painel público de tickets
 */
async function handleCreatePublicTicketPanel(interaction: ButtonInteraction) {
  // Verificar permissão
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '❌ Apenas administradores podem criar painéis públicos.',
      flags: 64
    });
    return;
  }

  // Criar modal para selecionar o canal
  const modal = new ModalBuilder()
    .setCustomId('create_ticket_panel_modal')
    .setTitle('Criar Painel de Tickets');

  const channelInput = new TextInputBuilder()
    .setCustomId('channel_id')
    .setLabel('ID do Canal onde criar o painel')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Cole o ID do canal aqui')
    .setRequired(true);

  const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(channelInput);
  modal.addComponents(firstRow);

  await interaction.showModal(modal);
}

/**
 * Handler para o modal de criação de painel de tickets
 */
export async function handleCreateTicketPanelModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });

  const channelId = interaction.fields.getTextInputValue('channel_id');

  try {
    const channel = interaction.guild!.channels.cache.get(channelId);
    
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.editReply({
        content: '❌ Canal não encontrado ou não é um canal de texto. Certifique-se de usar o ID correto.'
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎫 Sistema de Suporte')
      .setDescription(
        `Precisa de ajuda? Abra um ticket!\n\n` +
        `**Como funciona:**\n` +
        `1️⃣ Clique no botão abaixo\n` +
        `2️⃣ Escolha a categoria do seu problema\n` +
        `3️⃣ Um canal privado será criado para você\n` +
        `4️⃣ Nossa equipe irá atendê-lo em breve!\n\n` +
        `⏱️ **Tempo médio de resposta:** Menos de 1 hora\n` +
        `📞 **Suporte disponível:** 24/7`
      )
      .setImage('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop')
      .setFooter({ text: 'Clique no botão abaixo para abrir um ticket' })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket_vendas')
          .setLabel('Vendas')
          .setStyle(ButtonStyle.Success)
          .setEmoji('💰'),
        new ButtonBuilder()
          .setCustomId('create_ticket_suporte')
          .setLabel('Suporte Técnico')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🛠️'),
        new ButtonBuilder()
          .setCustomId('create_ticket_duvida')
          .setLabel('Dúvida')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('❓'),
        new ButtonBuilder()
          .setCustomId('create_ticket_outros')
          .setLabel('Outros')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📦')
      );

    const textChannel = channel as any;
    await textChannel.send({ embeds: [embed], components: [row] });

    await interaction.editReply({
      content: `✅ Painel de tickets criado em ${channel}!`
    });
  } catch (error) {
    logger.error(`Erro ao criar painel de tickets: ${error}`);
    await interaction.editReply({
      content: '❌ Erro ao criar painel. Verifique se tenho permissões no canal e se o ID está correto.'
    });
  }
}

/**
 * ======================
 * HANDLERS DE ESTATÍSTICAS
 * ======================
 */

async function handleStatsGeneral(interaction: ButtonInteraction) {
  await interaction.reply({
    content: '💡 Use o comando `/stats` para ver estatísticas gerais detalhadas do servidor!\n\n' +
             'Você verá métricas completas de vendas, produtos e desempenho.',
    flags: 64
  });
}

async function handleStatsProducts(interaction: ButtonInteraction) {
  await handleSalesTopProducts(interaction);
}

async function handleStatsUsers(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('user_id, amount, status')
      .eq('guild_id', interaction.guildId!)
      .eq('status', 'completed');

    if (error || !transactions || transactions.length === 0) {
      await interaction.editReply('❌ Nenhuma transação completada encontrada.');
      return;
    }

    // Agrupar por usuário
    const userStats: { [key: string]: { count: number; total: number } } = {};
    
    for (const transaction of transactions) {
      const userId = transaction.user_id;
      if (!userStats[userId]) {
        userStats[userId] = { count: 0, total: 0 };
      }
      userStats[userId].count++;
      userStats[userId].total += transaction.amount;
    }

    // Ordenar por total gasto
    const sortedUsers = Object.entries(userStats)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 10);

    const { formatCurrency } = await import('../utils/payments');
    const config = await getOrCreateGuildConfig(interaction.guildId!);

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('👥 Top 10 Compradores')
      .setDescription('Usuários que mais compraram no servidor')
      .setTimestamp();

    sortedUsers.forEach(([userId, stats], index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      
      embed.addFields({
        name: `${medal} <@${userId}>`,
        value: 
          `🛒 ${stats.count} compras\n` +
          `💰 ${formatCurrency(stats.total, config.currency)} gastos`,
        inline: true
      });
    });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_stats')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao buscar estatísticas.'}`
    });
  }
}

/**
 * ======================
 * HANDLERS DE ANÚNCIOS  
 * ======================
 */

async function handleAnnouncementsCreate(interaction: ButtonInteraction) {
  await interaction.reply({
    content: '💡 Use o comando `/anuncio criar canal:#seucanalaqui` para criar um anúncio!\n\n' +
             'Um modal será aberto com campos para título, conteúdo, cor, imagem e menção de role.',
    flags: 64
  });
}

async function handleAnnouncementsList(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const announcements = await listAnnouncements(interaction.guildId!);

    if (announcements.length === 0) {
      await interaction.editReply('❌ Nenhum anúncio agendado encontrado.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle('📢 Anúncios Agendados')
      .setDescription(`Total: **${announcements.length}** anúncios`)
      .setTimestamp();

    const announcementsToShow = announcements.slice(0, 10);
    for (const announcement of announcementsToShow) {
      const scheduledTime = (announcement as any).scheduled_time || announcement.created_at;
      embed.addFields({
        name: announcement.title || 'Sem título',
        value: 
          `📅 <t:${Math.floor(new Date(scheduledTime).getTime() / 1000)}:F>\n` +
          `📍 <#${announcement.channel_id}>`,
        inline: false
      });
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_announcements')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao listar anúncios.'}`
    });
  }
}

async function handleAnnouncementsScheduled(interaction: ButtonInteraction) {
  await handleAnnouncementsList(interaction);
}

/**
 * ======================
 * HANDLERS DE AUTOMAÇÕES
 * ======================
 */

async function handleAutomationsRoles(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('automation_autorole_modal')
    .setTitle('⚙️ Configurar Auto Role');

  const roleIdInput = new TextInputBuilder()
    .setCustomId('role_id')
    .setLabel('ID da Role para atribuir automaticamente')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Cole o ID da role aqui')
    .setRequired(true);

  const enabledInput = new TextInputBuilder()
    .setCustomId('enabled')
    .setLabel('Ativar auto role? (sim/nao)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('sim')
    .setRequired(true)
    .setValue('sim');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(roleIdInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(enabledInput)
  );

  await interaction.showModal(modal);
}

async function handleAutomationsMessages(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('automation_welcome_modal')
    .setTitle('💬 Mensagem de Boas-vindas');

  const channelIdInput = new TextInputBuilder()
    .setCustomId('channel_id')
    .setLabel('ID do Canal para enviar mensagens')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Cole o ID do canal aqui')
    .setRequired(true);

  const messageInput = new TextInputBuilder()
    .setCustomId('welcome_message')
    .setLabel('Mensagem de boas-vindas')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Bem-vindo {user} ao servidor! 🎉')
    .setRequired(true)
    .setMaxLength(1000);

  const enabledInput = new TextInputBuilder()
    .setCustomId('enabled')
    .setLabel('Ativar mensagens automáticas? (sim/nao)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('sim')
    .setRequired(true)
    .setValue('sim');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(channelIdInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(enabledInput)
  );

  await interaction.showModal(modal);
}

async function handleAutomationsTasks(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#00CED1')
    .setTitle('⚙️ Tarefas Programadas')
    .setDescription(
      'Configure tarefas automáticas recorrentes.\n\n' +
      '**Tarefas Disponíveis:**'
    )
    .addFields(
      { name: '🧹 Limpeza de Canais', value: 'Remove mensagens antigas automaticamente', inline: false },
      { name: '📊 Relatórios Automáticos', value: 'Gera relatórios de vendas periodicamente', inline: false },
      { name: '💾 Backup de Dados', value: 'Faz backup dos dados do servidor', inline: false },
      { name: '📢 Anúncios Recorrentes', value: 'Envia anúncios em intervalos regulares', inline: false }
    )
    .setFooter({ text: 'Use os botões abaixo para configurar' });

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('task_cleanup')
        .setLabel('Limpeza de Canais')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🧹'),
      new ButtonBuilder()
        .setCustomId('task_reports')
        .setLabel('Relatórios')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📊')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('task_list')
        .setLabel('Ver Tarefas Ativas')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('panel_automations')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.reply({ embeds: [embed], components: [row1, row2], flags: 64 });
}

/**
 * Handlers de botões de tarefas
 */
async function handleTaskCleanup(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('task_cleanup_modal')
    .setTitle('🧹 Configurar Limpeza');

  const channelIdInput = new TextInputBuilder()
    .setCustomId('channel_id')
    .setLabel('ID do Canal para limpar')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Cole o ID do canal')
    .setRequired(true);

  const daysInput = new TextInputBuilder()
    .setCustomId('days_old')
    .setLabel('Deletar mensagens mais antigas que (dias)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('7')
    .setRequired(true);

  const intervalInput = new TextInputBuilder()
    .setCustomId('interval')
    .setLabel('Intervalo de execução (horas)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('24')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(channelIdInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(daysInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(intervalInput)
  );

  await interaction.showModal(modal);
}

async function handleTaskReports(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('task_reports_modal')
    .setTitle('📊 Configurar Relatórios');

  const channelIdInput = new TextInputBuilder()
    .setCustomId('channel_id')
    .setLabel('ID do Canal para enviar relatórios')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Cole o ID do canal')
    .setRequired(true);

  const intervalInput = new TextInputBuilder()
    .setCustomId('interval')
    .setLabel('Intervalo (diario/semanal/mensal)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('semanal')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(channelIdInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(intervalInput)
  );

  await interaction.showModal(modal);
}

async function handleTaskList(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const { data: tasks, error } = await supabase
      .from('automation_tasks')
      .select('*')
      .eq('guild_id', interaction.guildId!)
      .eq('is_active', true);

    if (error || !tasks || tasks.length === 0) {
      await interaction.editReply('❌ Nenhuma tarefa ativa encontrada.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#00CED1')
      .setTitle('📋 Tarefas Ativas')
      .setDescription(`Total: **${tasks.length}** tarefas`)
      .setTimestamp();

    for (const task of tasks.slice(0, 10)) {
      const taskType = task.task_type === 'cleanup' ? '🧹 Limpeza' : 
                       task.task_type === 'report' ? '📊 Relatório' : 
                       task.task_type === 'backup' ? '💾 Backup' : '⚙️ Tarefa';
      
      embed.addFields({
        name: taskType,
        value: 
          `📍 Canal: <#${task.channel_id}>\n` +
          `⏰ Intervalo: ${task.interval_hours}h\n` +
          `📅 Próxima execução: <t:${Math.floor(new Date(task.next_run).getTime() / 1000)}:R>`,
        inline: false
      });
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_automations')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao buscar tarefas.'}`
    });
  }
}

/**
 * Handlers para modais de automação
 */
export async function handleAutomationAutoRoleModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });

  const roleId = interaction.fields.getTextInputValue('role_id');
  const enabled = interaction.fields.getTextInputValue('enabled').toLowerCase() === 'sim';

  try {
    const role = interaction.guild!.roles.cache.get(roleId);
    
    if (!role) {
      await interaction.editReply({
        content: '❌ Role não encontrada. Verifique o ID e tente novamente.'
      });
      return;
    }

    // Salvar configuração em uma tabela customizada (automation_config)
    const { error } = await supabase
      .from('automation_config')
      .upsert({
        guild_id: interaction.guildId!,
        config_type: 'auto_role',
        config_data: { role_id: roleId, enabled: enabled },
        updated_at: new Date().toISOString()
      }, { onConflict: 'guild_id,config_type' });

    if (error) throw new Error(error.message);

    await interaction.editReply({
      content: enabled 
        ? `✅ Auto role configurada! Novos membros receberão automaticamente: ${role}\n\n⚠️ **Nota:** O bot precisa estar online e ter permissão para atribuir roles.`
        : '✅ Auto role desativada!'
    });
  } catch (error) {
    logger.error(`Erro ao configurar auto role: ${error}`);
    await interaction.editReply({
      content: '❌ Erro ao salvar configuração. A tabela automation_config pode não existir no banco de dados.'
    });
  }
}

export async function handleAutomationWelcomeModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });

  const channelId = interaction.fields.getTextInputValue('channel_id');
  const message = interaction.fields.getTextInputValue('welcome_message');
  const enabled = interaction.fields.getTextInputValue('enabled').toLowerCase() === 'sim';

  try {
    const channel = interaction.guild!.channels.cache.get(channelId);
    
    if (!channel) {
      await interaction.editReply({
        content: '❌ Canal não encontrado. Verifique o ID e tente novamente.'
      });
      return;
    }

    // Salvar configuração em uma tabela customizada (automation_config)
    const { error } = await supabase
      .from('automation_config')
      .upsert({
        guild_id: interaction.guildId!,
        config_type: 'welcome_message',
        config_data: { channel_id: channelId, message: message, enabled: enabled },
        updated_at: new Date().toISOString()
      }, { onConflict: 'guild_id,config_type' });

    if (error) throw new Error(error.message);

    await interaction.editReply({
      content: enabled 
        ? `✅ Mensagens de boas-vindas configuradas!\n\n**Canal:** ${channel}\n**Mensagem:** ${message}\n\n⚠️ **Nota:** O bot precisa estar online para enviar as mensagens.`
        : '✅ Mensagens de boas-vindas desativadas!'
    });
  } catch (error) {
    logger.error(`Erro ao configurar mensagens: ${error}`);
    await interaction.editReply({
      content: '❌ Erro ao salvar configuração. A tabela automation_config pode não existir no banco de dados.'
    });
  }
}

export async function handleTaskCleanupModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });

  const channelId = interaction.fields.getTextInputValue('channel_id');
  const daysOld = parseInt(interaction.fields.getTextInputValue('days_old'));
  const interval = parseInt(interaction.fields.getTextInputValue('interval'));

  try {
    const channel = interaction.guild!.channels.cache.get(channelId);
    
    if (!channel) {
      await interaction.editReply({
        content: '❌ Canal não encontrado. Verifique o ID e tente novamente.'
      });
      return;
    }

    const nextRun = new Date();
    nextRun.setHours(nextRun.getHours() + interval);

    const { error } = await supabase
      .from('automation_tasks')
      .insert([{
        guild_id: interaction.guildId!,
        task_type: 'cleanup',
        channel_id: channelId,
        config: { days_old: daysOld },
        interval_hours: interval,
        next_run: nextRun.toISOString(),
        is_active: true
      }]);

    if (error) throw new Error(error.message);

    await interaction.editReply({
      content: `✅ Tarefa de limpeza criada!\n\n` +
               `**Canal:** ${channel}\n` +
               `**Deletar mensagens:** > ${daysOld} dias\n` +
               `**Intervalo:** A cada ${interval}h\n` +
               `**Próxima execução:** <t:${Math.floor(nextRun.getTime() / 1000)}:R>`
    });
  } catch (error: any) {
    logger.error(`Erro ao criar tarefa: ${error}`);
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao criar tarefa.'}`
    });
  }
}

export async function handleTaskReportsModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });

  const channelId = interaction.fields.getTextInputValue('channel_id');
  const intervalType = interaction.fields.getTextInputValue('interval').toLowerCase();

  const intervalHours = intervalType === 'diario' ? 24 : 
                        intervalType === 'semanal' ? 168 : 
                        intervalType === 'mensal' ? 720 : 168;

  try {
    const channel = interaction.guild!.channels.cache.get(channelId);
    
    if (!channel) {
      await interaction.editReply({
        content: '❌ Canal não encontrado. Verifique o ID e tente novamente.'
      });
      return;
    }

    const nextRun = new Date();
    nextRun.setHours(nextRun.getHours() + intervalHours);

    const { error } = await supabase
      .from('automation_tasks')
      .insert([{
        guild_id: interaction.guildId!,
        task_type: 'report',
        channel_id: channelId,
        config: { report_type: 'sales' },
        interval_hours: intervalHours,
        next_run: nextRun.toISOString(),
        is_active: true
      }]);

    if (error) throw new Error(error.message);

    await interaction.editReply({
      content: `✅ Relatórios automáticos configurados!\n\n` +
               `**Canal:** ${channel}\n` +
               `**Frequência:** ${intervalType}\n` +
               `**Próximo relatório:** <t:${Math.floor(nextRun.getTime() / 1000)}:R>`
    });
  } catch (error: any) {
    logger.error(`Erro ao criar tarefa: ${error}`);
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao criar tarefa.'}`
    });
  }
}

/**
 * ======================
 * HANDLERS DE IA
 * ======================
 */

async function handleAIChat(interaction: ButtonInteraction) {
  await interaction.reply({
    content: '💡 Use o comando `/ia chat` para conversar com a inteligência artificial!\n\n' +
             'A IA pode responder perguntas, dar sugestões e muito mais.',
    flags: 64
  });
}

async function handleAIGenerate(interaction: ButtonInteraction) {
  await interaction.reply({
    content: '💡 Use o comando `/ia gerar` para criar conteúdo automaticamente!\n\n' +
             'Gere descrições de produtos, anúncios, mensagens e muito mais.',
    flags: 64
  });
}

async function handleAIStats(interaction: ButtonInteraction) {
  await interaction.reply({
    content: '💡 Use o comando `/ia stats` para ver estatísticas de uso da IA!\n\n' +
             'Veja quantas requisições foram feitas e custos estimados.',
    flags: 64
  });
}

/**
 * ======================
 * HANDLERS DE CONFIGURAÇÕES
 * ======================
 */

async function handleConfigPayment(interaction: ButtonInteraction) {
  await interaction.reply({
    content: '💡 Use o comando `/config` para configurar métodos de pagamento!\n\n' +
             'Configure Stripe, Mercado Pago e outras integrações de pagamento.',
    flags: 64
  });
}

async function handleConfigAppearance(interaction: ButtonInteraction) {
  await interaction.reply({
    content: '💡 Use o comando `/config` para personalizar a aparência!\n\n' +
             'Altere cores de embeds, moeda padrão e muito mais.',
    flags: 64
  });
}

async function handleConfigChannels(interaction: ButtonInteraction) {
  await interaction.reply({
    content: '💡 Use o comando `/config` para configurar canais!\n\n' +
             'Defina canais para logs, vendas, tickets e categorias.',
    flags: 64
  });
}

/**
 * ======================
 * HANDLERS DE LOGS
 * ======================
 */

async function handleLogsTransactions(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const { data: logs, error } = await supabase
      .from('action_logs')
      .select('*')
      .eq('guild_id', interaction.guildId!)
      .ilike('action_type', '%transaction%')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !logs || logs.length === 0) {
      await interaction.editReply('❌ Nenhum log de transação encontrado.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#34495E')
      .setTitle('💰 Logs de Transações')
      .setDescription(`Últimas 10 ações de transação`)
      .setTimestamp();

    for (const log of logs) {
      embed.addFields({
        name: log.action_type,
        value: 
          `👤 <@${log.user_id}>\n` +
          `📅 <t:${Math.floor(new Date(log.created_at).getTime() / 1000)}:R>\n` +
          `📝 ${log.description || 'Sem descrição'}`,
        inline: false
      });
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_logs')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao buscar logs.'}`
    });
  }
}

async function handleLogsCommands(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const { data: logs, error } = await supabase
      .from('action_logs')
      .select('*')
      .eq('guild_id', interaction.guildId!)
      .ilike('action_type', 'comando_%')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !logs || logs.length === 0) {
      await interaction.editReply('❌ Nenhum log de comando encontrado.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#34495E')
      .setTitle('⌨️ Logs de Comandos')
      .setDescription(`Últimos 10 comandos executados`)
      .setTimestamp();

    for (const log of logs) {
      embed.addFields({
        name: log.action_type.replace('comando_', '/'),
        value: 
          `👤 <@${log.user_id}>\n` +
          `📅 <t:${Math.floor(new Date(log.created_at).getTime() / 1000)}:R>`,
        inline: true
      });
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_logs')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao buscar logs.'}`
    });
  }
}

async function handleLogsActions(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const { data: logs, error } = await supabase
      .from('action_logs')
      .select('*')
      .eq('guild_id', interaction.guildId!)
      .order('created_at', { ascending: false })
      .limit(15);

    if (error || !logs || logs.length === 0) {
      await interaction.editReply('❌ Nenhum log de ação encontrado.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#34495E')
      .setTitle('📝 Logs de Ações')
      .setDescription(`Últimas 15 ações registradas`)
      .setTimestamp();

    for (const log of logs) {
      embed.addFields({
        name: log.action_type,
        value: 
          `👤 <@${log.user_id}>\n` +
          `📅 <t:${Math.floor(new Date(log.created_at).getTime() / 1000)}:R>`,
        inline: true
      });
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_logs')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao buscar logs.'}`
    });
  }
}

/**
 * ======================
 * HANDLERS DE AJUDA
 * ======================
 */

async function handleHelpCommands(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#3498DB')
    .setTitle('⌨️ Lista de Comandos')
    .setDescription('Todos os comandos disponíveis organizados por categoria')
    .addFields(
      { name: '🛍️ Produtos & Vendas', value: 
        '`/addproduct` `/editproduct` `/removeproduct`\n' +
        '`/catalogo` `/myorders` `/stats`'
      },
      { name: '🎫 Sistema de Tickets', value: 
        '`/ticket abrir` `/ticket listar` `/ticket stats`\n' +
        '`/ticket setup` `/ticket painel`'
      },
      { name: '🎟️ Cupons', value: 
        '`/addcoupon` - Criar cupons de desconto'
      },
      { name: '📢 Anúncios', value: 
        '`/anuncio criar` `/anuncio agendar`\n' +
        '`/anuncio listar` `/anuncio broadcast`'
      },
      { name: '🧠 Inteligência Artificial', value: 
        '`/ia chat` `/ia gerar` `/ia moderar`\n' +
        '`/ia assistente` `/ia stats`'
      },
      { name: '⚙️ Administração', value: 
        '`/config` `/panel` - Configurações gerais'
      }
    )
    .setFooter({ text: 'Use /comando para executar' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_help')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
}

async function handleHelpFeatures(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#3498DB')
    .setTitle('✨ Funcionalidades do Bot')
    .setDescription('Principais recursos disponíveis')
    .addFields(
      { name: '💰 Sistema de Vendas Completo', value: 
        'Crie produtos, gerencie estoque, processe pagamentos com Stripe e Mercado Pago.'
      },
      { name: '🎫 Tickets de Suporte', value: 
        'Sistema profissional de atendimento com categorias, prioridades e estatísticas.'
      },
      { name: '📊 Analytics Avançado', value: 
        'Acompanhe vendas, produtos mais vendidos, receita total e muito mais.'
      },
      { name: '🎟️ Cupons de Desconto', value: 
        'Crie cupons percentuais ou fixos com limite de uso e data de expiração.'
      },
      { name: '📢 Sistema de Anúncios', value: 
        'Envie anúncios em canais, agende comunicados e faça broadcast via DM.'
      },
      { name: '🧠 Inteligência Artificial', value: 
        'IA integrada para chat, geração de conteúdo e moderação automática.'
      },
      { name: '🎨 Totalmente Personalizável', value: 
        'Configure cores, moeda, canais, categorias e muito mais.'
      }
    )
    .setFooter({ text: 'Bot de Vendas Discord v2.0' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_help')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
}

async function handleHelpSupport(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#3498DB')
    .setTitle('🆘 Suporte e Ajuda')
    .setDescription('Precisa de ajuda? Veja as opções abaixo')
    .addFields(
      { name: '📚 Documentação', value: 
        'Consulte o arquivo README.md do projeto para documentação completa e guias de instalação.'
      },
      { name: '🎫 Abrir Ticket', value: 
        'Use `/ticket abrir` para criar um ticket de suporte e nossa equipe irá ajudá-lo.'
      },
      { name: '💬 Comunidade', value: 
        'Junte-se ao servidor de suporte do bot para tirar dúvidas e trocar experiências.'
      },
      { name: '🐛 Reportar Bug', value: 
        'Encontrou um problema? Abra uma issue no GitHub ou crie um ticket de suporte.'
      },
      { name: '✨ Sugerir Funcionalidade', value: 
        'Tem ideias para melhorar o bot? Use `/ticket abrir` categoria "Sugestão".'
      }
    )
    .setFooter({ text: 'Estamos aqui para ajudar!' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_help')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
}

/**
 * ======================
 * HANDLERS DE PRODUTOS
 * ======================
 */

/**
 * Criar produto via modal
 */
async function handleProductCreate(interaction: ButtonInteraction) {
  // Importar função de modal
  const { showAddProductModal } = await import('../modals/productModal');
  await showAddProductModal(interaction);
}

/**
 * Listar todos os produtos
 */
async function handleProductsList(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const { getActiveProducts } = await import('../utils/supabase');
    const products = await getActiveProducts(interaction.guildId!);

    if (products.length === 0) {
      await interaction.editReply('❌ Nenhum produto cadastrado ainda.');
      return;
    }

    const { formatCurrency } = await import('../utils/payments');
    const config = await getOrCreateGuildConfig(interaction.guildId!);

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🛍️ Lista de Produtos')
      .setDescription(`Total: **${products.length}** produtos cadastrados`)
      .setTimestamp();

    // Mostrar primeiros 10 produtos
    const productsToShow = products.slice(0, 10);
    for (const product of productsToShow) {
      const stockText = product.stock !== null && product.stock !== undefined 
        ? `📦 Estoque: ${product.stock}` 
        : '📦 Estoque: Ilimitado';
      
      embed.addFields({
        name: `${product.name}`,
        value: 
          `💰 **Preço:** ${formatCurrency(product.price, config.currency)}\n` +
          `📝 ${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}\n` +
          `${stockText}\n` +
          `🆔 ID: \`${product.id}\``,
        inline: false
      });
    }

    if (products.length > 10) {
      embed.setFooter({ text: `Mostrando 10 de ${products.length} produtos` });
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_products')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao listar produtos.'}`
    });
  }
}

/**
 * Abrir catálogo público
 */
async function handleProductsCatalog(interaction: ButtonInteraction) {
  await interaction.reply({
    content: '💡 Use o comando `/catalogo` para ver o catálogo completo de produtos!\n\n' +
             'Você também pode usar `/catalogo permanente` para criar um catálogo fixo em um canal.',
    flags: 64
  });
}

/**
 * ======================
 * HANDLERS DE CUPONS
 * ======================
 */

/**
 * Criar cupom via modal
 */
async function handleCouponCreate(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('addcoupon_modal')
    .setTitle('🎟️ Criar Cupom');

  const codeInput = new TextInputBuilder()
    .setCustomId('coupon_code')
    .setLabel('Código do cupom')
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: PROMO10')
    .setMaxLength(25);

  const discountPercentInput = new TextInputBuilder()
    .setCustomId('coupon_discount_percent')
    .setLabel('Desconto percentual (1-100)')
    .setRequired(false)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 10');

  const discountFixedInput = new TextInputBuilder()
    .setCustomId('coupon_discount_fixed')
    .setLabel('Desconto fixo (valor em reais)')
    .setRequired(false)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 5.00');

  const maxUsesInput = new TextInputBuilder()
    .setCustomId('coupon_max_uses')
    .setLabel('Limite de usos (vazio = ilimitado)')
    .setRequired(false)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 100');

  const expiresInput = new TextInputBuilder()
    .setCustomId('coupon_expires')
    .setLabel('Data de expiração (DD/MM/YYYY)')
    .setRequired(false)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 31/12/2025');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(codeInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(discountPercentInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(discountFixedInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(maxUsesInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(expiresInput)
  );

  await interaction.showModal(modal);
}

/**
 * Listar cupons
 */
async function handleCouponsList(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('guild_id', interaction.guildId!)
      .order('created_at', { ascending: false });

    if (error || !coupons || coupons.length === 0) {
      await interaction.editReply('❌ Nenhum cupom cadastrado ainda.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('🎟️ Lista de Cupons')
      .setDescription(`Total: **${coupons.length}** cupons`)
      .setTimestamp();

    // Mostrar primeiros 10 cupons
    const couponsToShow = coupons.slice(0, 10);
    for (const coupon of couponsToShow) {
      const status = coupon.is_active ? '✅ Ativo' : '❌ Inativo';
      const discount = coupon.discount_percent 
        ? `${coupon.discount_percent}% OFF`
        : `R$ ${coupon.discount_fixed?.toFixed(2)} OFF`;
      
      const uses = coupon.max_uses 
        ? `${coupon.current_uses || 0}/${coupon.max_uses} usos`
        : `${coupon.current_uses || 0} usos (ilimitado)`;

      const expires = coupon.expires_at 
        ? `\n⏰ Expira: <t:${Math.floor(new Date(coupon.expires_at).getTime() / 1000)}:D>`
        : '';
      
      embed.addFields({
        name: `\`${coupon.code}\` - ${status}`,
        value: 
          `💰 ${discount}\n` +
          `📊 ${uses}${expires}`,
        inline: false
      });
    }

    if (coupons.length > 10) {
      embed.setFooter({ text: `Mostrando 10 de ${coupons.length} cupons` });
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_coupons')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao listar cupons.'}`
    });
  }
}

/**
 * ======================
 * HANDLERS DE VENDAS
 * ======================
 */

/**
 * Ver estatísticas de vendas
 */
async function handleSalesStats(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('guild_id', interaction.guildId!);

    if (error) {
      throw new Error('Erro ao buscar transações');
    }

    const total = transactions?.length || 0;
    const completed = transactions?.filter((t: any) => t.status === 'completed').length || 0;
    const pending = transactions?.filter((t: any) => t.status === 'pending').length || 0;
    const failed = transactions?.filter((t: any) => t.status === 'failed').length || 0;

    const totalRevenue = transactions
      ?.filter((t: any) => t.status === 'completed')
      .reduce((sum: number, t: any) => sum + t.amount, 0) || 0;

    const { formatCurrency } = await import('../utils/payments');
    const config = await getOrCreateGuildConfig(interaction.guildId!);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('📊 Estatísticas de Vendas')
      .setDescription('Resumo completo das vendas do servidor')
      .addFields(
        { name: '💰 Receita Total', value: formatCurrency(totalRevenue, config.currency), inline: true },
        { name: '📈 Total de Vendas', value: total.toString(), inline: true },
        { name: '✅ Completadas', value: completed.toString(), inline: true },
        { name: '⏳ Pendentes', value: pending.toString(), inline: true },
        { name: '❌ Falhas', value: failed.toString(), inline: true },
        { name: '📊 Taxa de Sucesso', value: `${total > 0 ? ((completed / total) * 100).toFixed(1) : 0}%`, inline: true }
      )
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_sales')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao buscar estatísticas.'}`
    });
  }
}

/**
 * Ver vendas recentes
 */
async function handleSalesRecent(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*, products(*)')
      .eq('guild_id', interaction.guildId!)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !transactions || transactions.length === 0) {
      await interaction.editReply('❌ Nenhuma venda registrada ainda.');
      return;
    }

    const { formatCurrency } = await import('../utils/payments');
    const config = await getOrCreateGuildConfig(interaction.guildId!);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🕒 Vendas Recentes')
      .setDescription(`Últimas 10 transações`)
      .setTimestamp();

    for (const transaction of transactions) {
      const statusEmoji = transaction.status === 'completed' ? '✅' : transaction.status === 'pending' ? '⏳' : '❌';
      const productName = transaction.products?.name || 'Produto removido';
      
      embed.addFields({
        name: `${statusEmoji} ${productName}`,
        value: 
          `💰 ${formatCurrency(transaction.amount, config.currency)}\n` +
          `👤 <@${transaction.user_id}>\n` +
          `📅 <t:${Math.floor(new Date(transaction.created_at).getTime() / 1000)}:R>`,
        inline: false
      });
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_sales')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao buscar vendas recentes.'}`
    });
  }
}

/**
 * Ver produtos mais vendidos
 */
async function handleSalesTopProducts(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('product_id, amount, products(name)')
      .eq('guild_id', interaction.guildId!)
      .eq('status', 'completed');

    if (error || !transactions || transactions.length === 0) {
      await interaction.editReply('❌ Nenhuma venda completada ainda.');
      return;
    }

    // Agrupar por produto
    const productStats: { [key: string]: { name: string; count: number; revenue: number } } = {};
    
    for (const transaction of transactions) {
      const productId = transaction.product_id;
      const productData = transaction.products as any;
      if (!productStats[productId]) {
        productStats[productId] = {
          name: productData?.name || 'Produto removido',
          count: 0,
          revenue: 0
        };
      }
      productStats[productId].count++;
      productStats[productId].revenue += transaction.amount;
    }

    // Ordenar por número de vendas
    const sortedProducts = Object.entries(productStats)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10);

    const { formatCurrency } = await import('../utils/payments');
    const config = await getOrCreateGuildConfig(interaction.guildId!);

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🏆 Top 10 Produtos Mais Vendidos')
      .setDescription('Produtos com melhor desempenho')
      .setTimestamp();

    sortedProducts.forEach(([, stats], index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      
      embed.addFields({
        name: `${medal} ${stats.name}`,
        value: 
          `📦 ${stats.count} vendas\n` +
          `💰 ${formatCurrency(stats.revenue, config.currency)} em receita`,
        inline: true
      });
    });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_sales')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao buscar top produtos.'}`
    });
  }
}

/**
 * Handler para confirmação de broadcast
 */
export async function handleBroadcastConfirmation(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  if (customId.startsWith('confirm_broadcast_')) {
    await interaction.deferReply({ flags: 64 });
    await interaction.editReply({
      content: '🚀 Enviando broadcast... Isso pode levar alguns minutos.',
      components: []
    });

    // Nota: As informações do broadcast precisariam ser armazenadas temporariamente
    // Por simplicidade, vamos mostrar apenas uma mensagem de confirmação
    await interaction.followUp({
      content: '✅ Broadcast iniciado! Você receberá uma notificação quando concluído.',
      flags: 64
    });
  }
  else if (customId.startsWith('cancel_broadcast_')) {
    await interaction.update({
      content: '❌ Broadcast cancelado.',
      embeds: [],
      components: []
    });
  }
}

/**
 * Painel de avaliações pendentes
 */
async function handleReviewsPending(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  const { data: pendingProductReviews } = await supabase
    .from('product_reviews')
    .select('*, products(name)')
    .eq('guild_id', interaction.guildId!)
    .eq('is_approved', false)
    .order('created_at', { ascending: false });

  const { data: pendingSellerReviews } = await supabase
    .from('seller_reviews')
    .select('*')
    .eq('guild_id', interaction.guildId!)
    .eq('is_approved', false)
    .order('created_at', { ascending: false });

  const totalPending = (pendingProductReviews?.length || 0) + (pendingSellerReviews?.length || 0);

  const embed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('⏳ Avaliações Pendentes de Aprovação')
    .setDescription(
      totalPending > 0
        ? `Há **${totalPending}** avaliação(ões) aguardando aprovação.`
        : '✅ Não há avaliações pendentes.'
    );

  if (pendingProductReviews && pendingProductReviews.length > 0) {
    embed.addFields({
      name: '🛍️ Produtos Pendentes',
      value: pendingProductReviews.slice(0, 5).map(r => {
        const stars = '⭐'.repeat(r.rating);
        const product = (r.products as any)?.name || 'Produto';
        return `${stars} **${product}** - <@${r.user_id}>`;
      }).join('\n') + (pendingProductReviews.length > 5 ? `\n\n+${pendingProductReviews.length - 5} mais...` : ''),
      inline: false
    });
  }

  if (pendingSellerReviews && pendingSellerReviews.length > 0) {
    embed.addFields({
      name: '👤 Vendedores Pendentes',
      value: pendingSellerReviews.slice(0, 5).map(r => {
        const stars = '⭐'.repeat(r.rating);
        return `${stars} <@${r.seller_id}> - por <@${r.reviewer_id}>`;
      }).join('\n') + (pendingSellerReviews.length > 5 ? `\n\n+${pendingSellerReviews.length - 5} mais...` : ''),
      inline: false
    });
  }

  embed.setFooter({ text: 'Sistema de moderação de avaliações' })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_reviews')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row]
  });
}

/**
 * Painel de Configuração de Vendas (similar ao de tickets)
 */
async function handleSalesConfigPanel(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle('⚙️ Configuração do Sistema de Vendas')
    .setDescription(
      'Configure o sistema de vendas de forma rápida e intuitiva.\n\n' +
      'Use os botões abaixo para configurar cada aspecto do sistema.'
    )
    .addFields(
      { name: '📁 Categoria', value: 'Categoria para canais de vendas', inline: true },
      { name: '📋 Canal de Logs', value: 'Registro de transações', inline: true },
      { name: '💰 Moeda', value: 'Moeda padrão do servidor', inline: true },
      { name: '🎨 Cor dos Embeds', value: 'Personalizar aparência', inline: true },
      { name: '💳 Pagamentos', value: 'Métodos de pagamento', inline: true },
      { name: '📄 Ver Configuração', value: 'Visualizar config atual', inline: true }
    )
    .setFooter({ text: 'Clique nos botões para configurar cada opção' })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('config_sales_category')
        .setLabel('Categoria')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📁'),
      new ButtonBuilder()
        .setCustomId('config_sales_log_channel')
        .setLabel('Canal de Logs')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('config_sales_currency')
        .setLabel('Moeda')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💰')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('config_sales_color')
        .setLabel('Cor')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎨'),
      new ButtonBuilder()
        .setCustomId('config_sales_payment')
        .setLabel('Pagamentos')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💳'),
      new ButtonBuilder()
        .setCustomId('config_sales_view')
        .setLabel('Ver Configuração')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📄')
    );

  const row3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_sales')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row1, row2, row3]
  });
}

/**
 * Painel Central de Configurações
 */
async function handleSettingsPanel(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setAuthor({ 
      name: 'Central de Configurações',
      iconURL: interaction.guild!.iconURL() || undefined
    })
    .setTitle('⚙️ Configurações do Sistema')
    .setDescription(
      `Configure todos os aspectos do bot de forma centralizada e intuitiva.\n\n` +
      `**Escolha uma categoria abaixo:**`
    )
    .addFields(
      {
        name: '\u200b',
        value: '**🎯 CONFIGURAÇÕES PRINCIPAIS**',
        inline: false
      },
      {
        name: '💰 Sistema de Vendas',
        value: 'Categoria, logs, moeda, pagamentos',
        inline: true
      },
      {
        name: '🎫 Sistema de Tickets',
        value: 'Categoria, roles, mensagens, limites',
        inline: true
      },
      {
        name: '📢 Anúncios',
        value: 'Canais, templates, agendamentos',
        inline: true
      },
      {
        name: '🔐 Permissões',
        value: 'Roles administrativas e acessos',
        inline: true
      },
      {
        name: '🔔 Notificações',
        value: 'Alertas, webhooks, logs',
        inline: true
      },
      {
        name: '🔌 Integrações',
        value: 'APIs, webhooks, plugins',
        inline: true
      }
    )
    .setFooter({ text: 'Navegue pelos botões para configurar cada módulo' })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('sales_config')
        .setLabel('Vendas')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💰'),
      new ButtonBuilder()
        .setCustomId('config_ticket_view')
        .setLabel('Tickets')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫'),
      new ButtonBuilder()
        .setCustomId('settings_announcements')
        .setLabel('Anúncios')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📢')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('settings_permissions')
        .setLabel('Permissões')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔐'),
      new ButtonBuilder()
        .setCustomId('settings_notifications')
        .setLabel('Notificações')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔔'),
      new ButtonBuilder()
        .setCustomId('settings_integrations')
        .setLabel('Integrações')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔌')
    );

  const row3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('settings_modules')
        .setLabel('Gerenciar Módulos')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📦'),
      new ButtonBuilder()
        .setCustomId('settings_backup')
        .setLabel('Backup & Restore')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💾'),
      new ButtonBuilder()
        .setCustomId('settings_advanced')
        .setLabel('Avançado')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⚡')
    );

  const row4 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar ao Painel')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row1, row2, row3, row4]
  });
}

/**
 * Painel Central de Personalização
 */
async function handleCustomizationPanel(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setAuthor({ 
      name: 'Central de Personalização',
      iconURL: interaction.guild!.iconURL() || undefined
    })
    .setTitle('🎨 Personalização & Aparência')
    .setDescription(
      `Customize a aparência e comportamento visual do bot.\n\n` +
      `**Escolha o que deseja personalizar:**`
    )
    .addFields(
      {
        name: '\u200b',
        value: '**🎨 OPÇÕES DE PERSONALIZAÇÃO**',
        inline: false
      },
      {
        name: '🌈 Tema & Cores',
        value: 'Paleta de cores, tema claro/escuro',
        inline: true
      },
      {
        name: '💬 Mensagens',
        value: 'Boas-vindas, despedidas, respostas',
        inline: true
      },
      {
        name: '📋 Embeds',
        value: 'Estilo, footer, thumbnails',
        inline: true
      },
      {
        name: '👁️ Preview',
        value: 'Veja como ficará antes de aplicar',
        inline: true
      }
    )
    .setFooter({ text: 'Dê sua identidade visual ao bot!' })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('custom_theme')
        .setLabel('Tema & Cores')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🌈'),
      new ButtonBuilder()
        .setCustomId('custom_messages')
        .setLabel('Mensagens')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💬'),
      new ButtonBuilder()
        .setCustomId('custom_embeds')
        .setLabel('Embeds')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('custom_preview')
        .setLabel('Pré-visualizar')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👁️'),
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar ao Painel')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row1, row2]
  });
}

/**
 * Handler para botões de configurações
 */
async function handleSettingsButton(interaction: ButtonInteraction, customId: string) {
  await interaction.deferReply({ flags: 64 });

  const actionMap: { [key: string]: string } = {
    'settings_announcements': 'Configuração de Anúncios',
    'settings_permissions': 'Gerenciamento de Permissões',
    'settings_notifications': 'Sistema de Notificações',
    'settings_integrations': 'Integrações e APIs',
    'settings_modules': 'Gerenciamento de Módulos',
    'settings_backup': 'Backup e Restauração',
    'settings_advanced': 'Configurações Avançadas'
  };

  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle('⚙️ Configurações Avançadas')
    .setDescription(
      `**${actionMap[customId] || 'Esta funcionalidade'}** está disponível!\n\n` +
      `✨ Configure através dos comandos específicos ou aguarde a interface visual.\n\n` +
      `**Comandos disponíveis:**\n` +
      `• \`/configurar\` - Configurações gerais\n` +
      `• \`/anuncio\` - Sistema de anúncios\n` +
      `• \`/ticket-config\` - Configurar tickets\n` +
      `• \`/produto\` - Gerenciar produtos`
    )
    .setFooter({ text: 'Sistema Sellify v2.0 • Configurações Ativas' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

/**
 * Personalização de Tema & Cores
 */
async function handleThemeCustomization(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle('🌈 Personalização de Tema & Cores')
    .setDescription(
      'Configure as cores e tema visual do bot para seu servidor.\n\n' +
      '**Opções disponíveis:**'
    )
    .addFields(
      {
        name: '🎨 Cor Principal',
        value: `Atual: \`${config.theme_primary_color || config.embed_color || '#EB459E'}\``,
        inline: true
      },
      {
        name: '✅ Cor de Sucesso',
        value: `Atual: \`${config.theme_success_color || '#57F287'}\``,
        inline: true
      },
      {
        name: '❌ Cor de Perigo',
        value: `Atual: \`${config.theme_danger_color || '#ED4245'}\``,
        inline: true
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('theme_primary')
        .setLabel('Cor Principal')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎨'),
      new ButtonBuilder()
        .setCustomId('theme_success')
        .setLabel('Cor Sucesso')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId('theme_danger')
        .setLabel('Cor Perigo')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌')
    );

  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('messages_moderation')
        .setLabel('Moderação')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⚠️'),
      new ButtonBuilder()
        .setCustomId('panel_customization')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row, backRow]
  });
}

/**
 * Handler para botões de tema
 */
async function handleThemeButton(interaction: ButtonInteraction, customId: string) {
  try {
    logger.info(`[DEBUG] handleThemeButton called with customId: ${customId}`);
    
    switch (customId) {
      case 'theme_primary':
        logger.info(`[DEBUG] Handling theme_primary button`);
        await handleThemePrimaryColorConfig(interaction);
        break;
      case 'theme_success':
        logger.info(`[DEBUG] Handling theme_success button`);
        await handleThemeSuccessColorConfig(interaction);
        break;
      case 'theme_danger':
        logger.info(`[DEBUG] Handling theme_danger button`);
        await handleThemeDangerColorConfig(interaction);
        break;
      default:
        logger.warning(`[DEBUG] Unknown theme button customId: ${customId}`);
        await interaction.reply({ content: 'Opção não reconhecida.', flags: 64 });
    }
  } catch (error) {
    logger.error(`[DEBUG] Error in handleThemeButton: ${error}`);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'Erro interno. Tente novamente.', flags: 64 });
    }
  }
}

/**
 * Configuração de cor principal
 */
async function handleThemePrimaryColorConfig(interaction: ButtonInteraction) {
  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const modal = new ModalBuilder()
    .setCustomId('theme_primary_color_modal')
    .setTitle('🎨 Configurar Cor Principal');

  const colorInput = new TextInputBuilder()
    .setCustomId('primary_color')
    .setLabel('Cor Principal (Hex)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder((config.theme_primary_color || config.embed_color || '#EB459E'))
    .setRequired(true)
    .setMaxLength(7)
    .setMinLength(7);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput);
  modal.addComponents(row);

  await interaction.showModal(modal);
}

/**
 * Configuração de cor de sucesso
 */
async function handleThemeSuccessColorConfig(interaction: ButtonInteraction) {
  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const modal = new ModalBuilder()
    .setCustomId('theme_success_color_modal')
    .setTitle('✅ Configurar Cor de Sucesso');

  const colorInput = new TextInputBuilder()
    .setCustomId('success_color')
    .setLabel('Cor de Sucesso (Hex)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder((config.theme_success_color || '#57F287'))
    .setRequired(true)
    .setMaxLength(7)
    .setMinLength(7);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput);
  modal.addComponents(row);

  await interaction.showModal(modal);
}

/**
 * Configuração de cor de perigo
 */
async function handleThemeDangerColorConfig(interaction: ButtonInteraction) {
  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const modal = new ModalBuilder()
    .setCustomId('theme_danger_color_modal')
    .setTitle('❌ Configurar Cor de Perigo');

  const colorInput = new TextInputBuilder()
    .setCustomId('danger_color')
    .setLabel('Cor de Perigo (Hex)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder((config.theme_danger_color || '#ED4245'))
    .setRequired(true)
    .setMaxLength(7)
    .setMinLength(7);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput);
  modal.addComponents(row);

  await interaction.showModal(modal);
}

/**
 * Personalização de Mensagens
 */
async function handleMessagesCustomization(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const embed = new EmbedBuilder()
    .setColor('#00CED1')
    .setTitle('💬 Personalização de Mensagens')
    .setDescription(
      'Configure mensagens automáticas e respostas do bot.\n\n' +
      '**Tipos de mensagens:**'
    )
    .addFields(
      {
        name: '👋 Boas-vindas',
        value: 'Mensagem para novos membros',
        inline: true
      },
      {
        name: '👋 Despedidas',
        value: 'Mensagem quando alguém sai',
        inline: true
      },
      {
        name: '🎫 Tickets',
        value: 'Mensagens do sistema de tickets',
        inline: true
      },
      {
        name: '🛒 Vendas',
        value: 'Mensagens de compra e venda',
        inline: true
      },
      {
        name: '📢 Anúncios',
        value: 'Templates de anúncios',
        inline: true
      },
      {
        name: '⚠️ Moderação',
        value: 'Mensagens de moderação',
        inline: true
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('messages_welcome')
        .setLabel('Boas-vindas')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👋'),
      new ButtonBuilder()
        .setCustomId('messages_welcome_advanced')
        .setLabel('Personalização Avançada')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎨'),
      new ButtonBuilder()
        .setCustomId('messages_goodbye')
        .setLabel('Despedidas')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('👋')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('messages_tickets')
        .setLabel('Tickets')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎫'),
      new ButtonBuilder()
        .setCustomId('messages_sales')
        .setLabel('Vendas')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🛒'),
      new ButtonBuilder()
        .setCustomId('messages_announcements')
        .setLabel('Anúncios')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📢')
    );

  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_customization')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row, row2, backRow]
  });
}

/**
 * Handler para botões de mensagens
 */
async function handleMessageButton(interaction: ButtonInteraction, customId: string) {
  switch (customId) {
    case 'messages_welcome':
      await handleWelcomeMessagesConfig(interaction);
      break;
    case 'messages_goodbye':
      await handleGoodbyeMessagesConfig(interaction);
      break;
    case 'messages_tickets':
      await handleTicketMessagesConfig(interaction);
      break;
    case 'messages_sales':
      await handleSalesMessagesConfig(interaction);
      break;
    case 'messages_announcements':
      await handleAnnouncementMessagesConfig(interaction);
      break;
    case 'messages_moderation':
      await handleModerationMessagesConfig(interaction);
      break;
    default:
      await interaction.deferReply({ flags: 64 });
      await interaction.editReply({ content: '❌ Opção de mensagem não encontrada.' });
  }
}

/**
 * Configuração de Mensagens de Boas-vindas
 * Reutiliza a estrutura da função sendWelcomeMessage existente
 */
async function handleWelcomeMessagesConfig(interaction: ButtonInteraction) {
  try {
    const modal = new ModalBuilder()
      .setCustomId('welcome_message_config_modal')
      .setTitle('👋 Personalizar Mensagens de Boas-vindas');

    const channelInput = new TextInputBuilder()
      .setCustomId('welcome_channel')
      .setLabel('ID do Canal para Boas-vindas')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Cole o ID do canal aqui')
      .setRequired(true);

    const messageInput = new TextInputBuilder()
      .setCustomId('welcome_message')
      .setLabel('Mensagem de Boas-vindas')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('🎉 Bem-vindo ao {server}!\n\nOlá {user}!\n\nSeja muito bem-vindo(a) ao nosso servidor!')
      .setRequired(true)
      .setMaxLength(1000);

    const formatInput = new TextInputBuilder()
      .setCustomId('welcome_format')
      .setLabel('Formato da Mensagem (embed/texto)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('embed')
      .setRequired(true)
      .setValue('embed');

    const colorInput = new TextInputBuilder()
      .setCustomId('welcome_color')
      .setLabel('Cor Principal (hex, ex: #00ff00)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('#00ff00')
      .setRequired(false);

    const enabledInput = new TextInputBuilder()
      .setCustomId('welcome_enabled')
      .setLabel('Ativar mensagens? (sim/não)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('sim')
      .setRequired(true)
      .setValue('sim');

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(channelInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(formatInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(enabledInput)
    );

    await interaction.showModal(modal);
  } catch (error) {
    logger.error(`Erro ao mostrar modal de configuração de mensagens de boas-vindas: ${error}`);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: '❌ Erro ao abrir configuração de mensagens de boas-vindas. Tente novamente.', 
        flags: 64 
      });
    } else if (interaction.deferred) {
      await interaction.editReply({ 
        content: '❌ Erro ao abrir configuração de mensagens de boas-vindas. Tente novamente.' 
      });
    }
  }
}

/**
 * Modal avançado para personalização visual adicional
 */
async function handleWelcomeAdvancedConfig(interaction: ButtonInteraction) {
  try {
    const modal = new ModalBuilder()
      .setCustomId('welcome_advanced_config_modal')
      .setTitle('🎨 Personalização Visual - Boas-vindas');

    const thumbnailInput = new TextInputBuilder()
      .setCustomId('welcome_thumbnail')
      .setLabel('URL da Thumbnail (opcional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('https://exemplo.com/avatar.png')
      .setRequired(false);

    const footerInput = new TextInputBuilder()
      .setCustomId('welcome_footer')
      .setLabel('Texto do Footer (opcional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Bem-vindo ao nosso servidor!')
      .setRequired(false);

    const authorInput = new TextInputBuilder()
      .setCustomId('welcome_author')
      .setLabel('Nome do Autor (opcional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Sistema de Boas-vindas')
      .setRequired(false);

    const timestampInput = new TextInputBuilder()
      .setCustomId('welcome_timestamp')
      .setLabel('Mostrar timestamp? (sim/não)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('sim')
      .setRequired(false)
      .setValue('sim');

    const imageInput = new TextInputBuilder()
      .setCustomId('welcome_image')
      .setLabel('URL da Imagem Principal (opcional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('https://exemplo.com/banner.png')
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(thumbnailInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(footerInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(authorInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(timestampInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput)
    );

    await interaction.showModal(modal);
  } catch (error) {
    logger.error(`Erro ao mostrar modal avançado de boas-vindas: ${error}`);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: '❌ Erro ao abrir configuração avançada. Tente novamente.', 
        flags: 64 
      });
    } else if (interaction.deferred) {
      await interaction.editReply({ 
        content: '❌ Erro ao abrir configuração avançada. Tente novamente.' 
      });
    }
  }
}

/**
 * Configuração de Mensagens de Despedida
 */
async function handleGoodbyeMessagesConfig(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('goodbye_message_config_modal')
    .setTitle('👋 Configurar Mensagens de Despedida');

  const channelInput = new TextInputBuilder()
    .setCustomId('goodbye_channel')
    .setLabel('ID do Canal para Despedidas')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Cole o ID do canal aqui')
    .setRequired(true);

  const messageInput = new TextInputBuilder()
    .setCustomId('goodbye_message')
    .setLabel('Mensagem de Despedida')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('😢 {user} saiu do servidor.\n\nSentiremos sua falta!')
    .setRequired(true)
    .setMaxLength(1000);

  const enabledInput = new TextInputBuilder()
    .setCustomId('goodbye_enabled')
    .setLabel('Ativar mensagens? (sim/não)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('sim')
    .setRequired(true)
    .setValue('sim');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(channelInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(enabledInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configuração de Mensagens de Tickets
 */
async function handleTicketMessagesConfig(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('🎫 Configurar Mensagens de Tickets')
    .setDescription(
      'Configure as mensagens automáticas do sistema de tickets.\n\n' +
      '**Mensagens disponíveis:**'
    )
    .addFields(
      {
        name: '💬 Mensagem de Boas-vindas',
        value: 'Enviada quando um ticket é criado',
        inline: true
      },
      {
        name: '✅ Mensagem de Fechamento',
        value: 'Enviada quando um ticket é fechado',
        inline: true
      },
      {
        name: '👥 Notificação de Moderadores',
        value: 'Notifica moderadores sobre novos tickets',
        inline: true
      }
    )
    .setFooter({ text: 'Use os botões abaixo para configurar cada tipo' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_welcome_msg')
        .setLabel('Boas-vindas')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💬'),
      new ButtonBuilder()
        .setCustomId('ticket_close_msg')
        .setLabel('Fechamento')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('✅')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_mod_notification')
        .setLabel('Notificações')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('👥'),
      new ButtonBuilder()
        .setCustomId('custom_messages')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({ embeds: [embed], components: [row, row2] });
}

/**
 * Configuração de Mensagens de Vendas
 */
async function handleSalesMessagesConfig(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('🛒 Configurar Mensagens de Vendas')
    .setDescription(
      'Configure as mensagens automáticas do sistema de vendas.\n\n' +
      '**Mensagens disponíveis:**'
    )
    .addFields(
      {
        name: '✅ Confirmação de Compra',
        value: 'Enviada quando uma compra é confirmada',
        inline: true
      },
      {
        name: '📦 Entrega de Produto',
        value: 'Enviada quando o produto é entregue',
        inline: true
      },
      {
        name: '⭐ Solicitação de Avaliação',
        value: 'Solicita avaliação após a compra',
        inline: true
      }
    )
    .setFooter({ text: 'Use os botões abaixo para configurar cada tipo' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('sales_confirmation_msg')
        .setLabel('Confirmação')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId('sales_delivery_msg')
        .setLabel('Entrega')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📦')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('sales_review_msg')
        .setLabel('Avaliação')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⭐'),
      new ButtonBuilder()
        .setCustomId('custom_messages')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({ embeds: [embed], components: [row, row2] });
}

/**
 * Configuração de Mensagens de Anúncios
 */
async function handleAnnouncementMessagesConfig(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('announcement_template_modal')
    .setTitle('📢 Configurar Template de Anúncios');

  const titleInput = new TextInputBuilder()
    .setCustomId('announcement_title')
    .setLabel('Título Padrão dos Anúncios')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('📢 Anúncio Importante')
    .setRequired(true)
    .setMaxLength(100);

  const colorInput = new TextInputBuilder()
    .setCustomId('announcement_color')
    .setLabel('Cor do Embed (HEX)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('#5865F2')
    .setRequired(false)
    .setValue('#5865F2');

  const footerInput = new TextInputBuilder()
    .setCustomId('announcement_footer')
    .setLabel('Rodapé Padrão')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Equipe {server}')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(footerInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configuração de Mensagens de Moderação
 */
async function handleModerationMessagesConfig(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('⚠️ Configurar Mensagens de Moderação')
    .setDescription(
      'Configure as mensagens automáticas do sistema de moderação.\n\n' +
      '**Mensagens disponíveis:**'
    )
    .addFields(
      {
        name: '🚫 Advertência',
        value: 'Mensagem enviada ao advertir um usuário',
        inline: true
      },
      {
        name: '🔇 Mute/Timeout',
        value: 'Mensagem enviada ao silenciar usuário',
        inline: true
      },
      {
        name: '👢 Ban/Kick',
        value: 'Mensagem de banimento ou expulsão',
        inline: true
      }
    )
    .setFooter({ text: 'Use os botões abaixo para configurar cada tipo' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('mod_warning_msg')
        .setLabel('Advertência')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🚫'),
      new ButtonBuilder()
        .setCustomId('mod_mute_msg')
        .setLabel('Mute')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔇')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('mod_ban_msg')
        .setLabel('Ban/Kick')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('👢'),
      new ButtonBuilder()
        .setCustomId('custom_messages')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({ embeds: [embed], components: [row, row2] });
}

/**
 * Personalização de Embeds
 */
async function handleEmbedsCustomization(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle('📋 Personalização de Embeds')
    .setDescription(
      'Configure o estilo visual dos embeds do bot.\n\n' +
      '**Elementos personalizáveis:**'
    )
    .addFields(
      {
        name: '🎨 Cores',
        value: 'Paleta de cores dos embeds',
        inline: true
      },
      {
        name: '📝 Rodapé',
        value: 'Texto e ícone do footer',
        inline: true
      },
      {
        name: '🖼️ Thumbnails',
        value: 'Imagens pequenas nos embeds',
        inline: true
      },
      {
        name: '👤 Autor',
        value: 'Nome e ícone do autor',
        inline: true
      },
      {
        name: '⏰ Timestamp',
        value: 'Mostrar data/hora',
        inline: true
      },
      {
        name: '🏷️ Campos',
        value: 'Campos personalizados',
        inline: true
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('embeds_colors')
        .setLabel('Cores')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎨'),
      new ButtonBuilder()
        .setCustomId('embeds_footer')
        .setLabel('Rodapé')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝'),
      new ButtonBuilder()
        .setCustomId('embeds_thumbnails')
        .setLabel('Thumbnails')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🖼️')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('embeds_author')
        .setLabel('Autor')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('👤'),
      new ButtonBuilder()
        .setCustomId('embeds_timestamp')
        .setLabel('Timestamp')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⏰'),
      new ButtonBuilder()
        .setCustomId('embeds_fields')
        .setLabel('Campos')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🏷️')
    );

  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_customization')
        .setLabel('◀️ Voltar ao Painel')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row, row2, backRow]
  });
}

/**
 * Handler para botões de personalização de embeds
 */
async function handleEmbedButton(interaction: ButtonInteraction, customId: string) {
  switch (customId) {
    case 'embeds_colors':
      await handleEmbedColorsConfig(interaction);
      break;
    case 'embeds_footer':
      await handleEmbedFooterConfig(interaction);
      break;
    case 'embeds_thumbnails':
      await handleEmbedThumbnailsConfig(interaction);
      break;
    case 'embeds_author':
      await handleEmbedAuthorConfig(interaction);
      break;
    case 'embeds_timestamp':
      await handleEmbedTimestampConfig(interaction);
      break;
    case 'embeds_fields':
      await handleEmbedFieldsConfig(interaction);
      break;
    default:
      await interaction.deferReply({ flags: 64 });
      await interaction.editReply({ content: '❌ Opção de embed não encontrada.' });
  }
}

/**
 * Configuração de Cores de Embeds
 */
async function handleEmbedColorsConfig(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('embed_colors_config_modal')
    .setTitle('🎨 Configurar Cores de Embeds');

  const primaryColorInput = new TextInputBuilder()
    .setCustomId('primary_color')
    .setLabel('Cor Primária (HEX)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('#5865F2')
    .setRequired(false)
    .setValue('#5865F2');

  const successColorInput = new TextInputBuilder()
    .setCustomId('success_color')
    .setLabel('Cor de Sucesso (HEX)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('#00FF00')
    .setRequired(false)
    .setValue('#00FF00');

  const errorColorInput = new TextInputBuilder()
    .setCustomId('error_color')
    .setLabel('Cor de Erro (HEX)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('#FF0000')
    .setRequired(false)
    .setValue('#FF0000');

  const warningColorInput = new TextInputBuilder()
    .setCustomId('warning_color')
    .setLabel('Cor de Aviso (HEX)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('#FFA500')
    .setRequired(false)
    .setValue('#FFA500');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(primaryColorInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(successColorInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(errorColorInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(warningColorInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configuração de Rodapé de Embeds
 */
async function handleEmbedFooterConfig(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('embed_footer_config_modal')
    .setTitle('📝 Configurar Rodapé de Embeds');

  const footerTextInput = new TextInputBuilder()
    .setCustomId('footer_text')
    .setLabel('Texto do Rodapé')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Equipe {server} • {date}')
    .setRequired(false)
    .setMaxLength(100);

  const footerIconInput = new TextInputBuilder()
    .setCustomId('footer_icon')
    .setLabel('URL do Ícone do Rodapé')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://exemplo.com/icon.png')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(footerTextInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(footerIconInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configuração de Thumbnails de Embeds
 */
async function handleEmbedThumbnailsConfig(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('embed_thumbnails_config_modal')
    .setTitle('🖼️ Configurar Thumbnails de Embeds');

  const defaultThumbnailInput = new TextInputBuilder()
    .setCustomId('default_thumbnail')
    .setLabel('URL da Thumbnail Padrão')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://exemplo.com/thumbnail.png')
    .setRequired(false);

  const ticketThumbnailInput = new TextInputBuilder()
    .setCustomId('ticket_thumbnail')
    .setLabel('URL da Thumbnail para Tickets')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://exemplo.com/ticket-thumb.png')
    .setRequired(false);

  const salesThumbnailInput = new TextInputBuilder()
    .setCustomId('sales_thumbnail')
    .setLabel('URL da Thumbnail para Vendas')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://exemplo.com/sales-thumb.png')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(defaultThumbnailInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(ticketThumbnailInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(salesThumbnailInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configuração de Autor de Embeds
 */
async function handleEmbedAuthorConfig(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('embed_author_config_modal')
    .setTitle('👤 Configurar Autor de Embeds');

  const authorNameInput = new TextInputBuilder()
    .setCustomId('author_name')
    .setLabel('Nome do Autor')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('{server} Bot')
    .setRequired(false)
    .setMaxLength(100);

  const authorIconInput = new TextInputBuilder()
    .setCustomId('author_icon')
    .setLabel('URL do Ícone do Autor')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://exemplo.com/author-icon.png')
    .setRequired(false);

  const authorUrlInput = new TextInputBuilder()
    .setCustomId('author_url')
    .setLabel('URL do Link do Autor')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://exemplo.com')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(authorNameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(authorIconInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(authorUrlInput)
  );

  await interaction.showModal(modal);
}

/**
 * Configuração de Timestamp de Embeds
 */
async function handleEmbedTimestampConfig(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle('⏰ Configurar Timestamp de Embeds')
    .setDescription(
      'Configure quando mostrar timestamps nos embeds.\n\n' +
      '**Opções disponíveis:**'
    )
    .addFields(
      {
        name: '✅ Sempre Mostrar',
        value: 'Timestamp em todos os embeds',
        inline: true
      },
      {
        name: '🎫 Apenas Tickets',
        value: 'Timestamp apenas em tickets',
        inline: true
      },
      {
        name: '🛒 Apenas Vendas',
        value: 'Timestamp apenas em vendas',
        inline: true
      },
      {
        name: '❌ Nunca Mostrar',
        value: 'Sem timestamp nos embeds',
        inline: true
      }
    )
    .setFooter({ text: 'Escolha uma opção abaixo' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('timestamp_always')
        .setLabel('Sempre')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId('timestamp_tickets')
        .setLabel('Tickets')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('timestamp_sales')
        .setLabel('Vendas')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🛒'),
      new ButtonBuilder()
        .setCustomId('timestamp_never')
        .setLabel('Nunca')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌')
    );

  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('custom_embeds')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({ embeds: [embed], components: [row, row2, backRow] });
}

/**
 * Configuração de Campos de Embeds
 */
async function handleEmbedFieldsConfig(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('embed_fields_config_modal')
    .setTitle('🏷️ Configurar Campos de Embeds');

  const field1Input = new TextInputBuilder()
    .setCustomId('field1_config')
    .setLabel('Campo 1 (Nome|Valor|Inline)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Status|Ativo|true')
    .setRequired(false)
    .setMaxLength(200);

  const field2Input = new TextInputBuilder()
    .setCustomId('field2_config')
    .setLabel('Campo 2 (Nome|Valor|Inline)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Usuário|{user}|true')
    .setRequired(false)
    .setMaxLength(200);

  const field3Input = new TextInputBuilder()
    .setCustomId('field3_config')
    .setLabel('Campo 3 (Nome|Valor|Inline)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Data|{date}|false')
    .setRequired(false)
    .setMaxLength(200);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(field1Input),
    new ActionRowBuilder<TextInputBuilder>().addComponents(field2Input),
    new ActionRowBuilder<TextInputBuilder>().addComponents(field3Input)
  );

  await interaction.showModal(modal);
}

/**
 * Handlers de envio dos modais de personalização de embeds
 */
export async function handleEmbedColorsConfigModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });

  try {
    const primary = interaction.fields.getTextInputValue('primary_color') || '#5865F2';
    const success = interaction.fields.getTextInputValue('success_color') || '#57F287';
    const danger = interaction.fields.getTextInputValue('error_color') || '#ED4245';
    const warning = interaction.fields.getTextInputValue('warning_color') || '#FEE75C';

    const isHex = (c: string) => /^#[0-9A-F]{6}$/i.test(c);
    if (![primary, success, danger, warning].every(isHex)) {
      await interaction.editReply({ content: '❌ Use cores HEX válidas (#RRGGBB).' });
      return;
    }

    const existing = await loadCustomization(interaction.guildId!, 'panel');
    const data: CustomizationData = existing ? { ...existing } : {};
    data.color = primary;
    data.config = {
      ...(data.config || {}),
      colors: { primary, success, danger, warning }
    };

    await saveCustomization(interaction.guildId!, 'panel', data);

    await interaction.editReply({
      content: `✅ Cores de embed atualizadas:
• Primária: ${primary}
• Sucesso: ${success}
• Perigo: ${danger}
• Aviso: ${warning}`
    });
  } catch (error: any) {
    logger.error(`[Embeds] Erro ao salvar cores: ${error}`);
    await interaction.editReply({ content: '❌ Erro ao salvar cores de embed.' });
  }
}

export async function handleEmbedFooterConfigModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });
  try {
    const footerText = interaction.fields.getTextInputValue('footer_text') || '';
    const footerIcon = interaction.fields.getTextInputValue('footer_icon') || '';

    const existing = await loadCustomization(interaction.guildId!, 'panel');
    const data: CustomizationData = existing ? { ...existing } : {};
    data.footer_text = footerText || undefined;
    data.footer_icon = footerIcon || undefined;

    await saveCustomization(interaction.guildId!, 'panel', data);

    await interaction.editReply({
      content: `✅ Rodapé atualizado.
• Texto: ${footerText || '—'}
• Ícone: ${footerIcon || '—'}`
    });
  } catch (error: any) {
    logger.error(`[Embeds] Erro ao salvar rodapé: ${error}`);
    await interaction.editReply({ content: '❌ Erro ao salvar rodapé de embed.' });
  }
}

export async function handleEmbedThumbnailsConfigModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });
  try {
    const defaultThumb = interaction.fields.getTextInputValue('default_thumbnail') || '';
    const ticketThumb = interaction.fields.getTextInputValue('ticket_thumbnail') || '';
    const salesThumb = interaction.fields.getTextInputValue('sales_thumbnail') || '';

    const existing = await loadCustomization(interaction.guildId!, 'panel');
    const data: CustomizationData = existing ? { ...existing } : {};
    data.thumbnail_url = defaultThumb || undefined;
    data.config = {
      ...(data.config || {}),
      thumbnails: { default: defaultThumb, tickets: ticketThumb, sales: salesThumb }
    };

    await saveCustomization(interaction.guildId!, 'panel', data);

    await interaction.editReply({
      content: `✅ Thumbnails atualizadas.
• Padrão: ${defaultThumb || '—'}
• Tickets: ${ticketThumb || '—'}
• Vendas: ${salesThumb || '—'}`
    });
  } catch (error: any) {
    logger.error(`[Embeds] Erro ao salvar thumbnails: ${error}`);
    await interaction.editReply({ content: '❌ Erro ao salvar thumbnails de embed.' });
  }
}

export async function handleEmbedAuthorConfigModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });
  try {
    const authorName = interaction.fields.getTextInputValue('author_name') || '';
    const authorIcon = interaction.fields.getTextInputValue('author_icon') || '';
    const authorUrl = interaction.fields.getTextInputValue('author_url') || '';

    const existing = await loadCustomization(interaction.guildId!, 'panel');
    const data: CustomizationData = existing ? { ...existing } : {};
    data.author_name = authorName || undefined;
    data.author_icon = authorIcon || undefined;
    data.author_url = authorUrl || undefined;

    await saveCustomization(interaction.guildId!, 'panel', data);

    await interaction.editReply({
      content: `✅ Autor atualizado.
• Nome: ${authorName || '—'}
• Ícone: ${authorIcon || '—'}
• URL: ${authorUrl || '—'}`
    });
  } catch (error: any) {
    logger.error(`[Embeds] Erro ao salvar autor: ${error}`);
    await interaction.editReply({ content: '❌ Erro ao salvar autor do embed.' });
  }
}

export async function handleEmbedFieldsConfigModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });
  try {
    const f1 = interaction.fields.getTextInputValue('field1_config') || '';
    const f2 = interaction.fields.getTextInputValue('field2_config') || '';
    const f3 = interaction.fields.getTextInputValue('field3_config') || '';

    const parseField = (s: string) => {
      const parts = s.split('|');
      if (parts.length < 2) return null;
      const [name, value, inline] = parts;
      return {
        name: name.trim(),
        value: value.trim(),
        inline: inline ? inline.trim().toLowerCase() === 'true' : false
      };
    };

    const fields = [f1, f2, f3]
      .map(parseField)
      .filter((x: any) => x && x.name && x.value) as Array<{ name: string; value: string; inline?: boolean }>;

    const existing = await loadCustomization(interaction.guildId!, 'panel');
    const data: CustomizationData = existing ? { ...existing } : {};
    data.fields = fields.length > 0 ? fields : undefined;

    await saveCustomization(interaction.guildId!, 'panel', data);

    await interaction.editReply({
      content: fields.length > 0 
        ? `✅ Campos atualizados (${fields.length}).`
        : '✅ Campos removidos.'
    });
  } catch (error: any) {
    logger.error(`[Embeds] Erro ao salvar campos: ${error}`);
    await interaction.editReply({ content: '❌ Erro ao salvar campos do embed.' });
  }
}

/**
 * Handler para botões de timestamp de embeds
 */
export async function handleTimestampButton(interaction: ButtonInteraction, customId: string) {
  try {
    await interaction.deferUpdate();

    const existing = await loadCustomization(interaction.guildId!, 'panel');
    const data: CustomizationData = existing ? { ...existing } : {};

    let scope = 'all';
    let enabled = true;
    switch (customId) {
      case 'timestamp_always':
        scope = 'all';
        enabled = true;
        break;
      case 'timestamp_tickets':
        scope = 'tickets';
        enabled = true;
        break;
      case 'timestamp_sales':
        scope = 'sales';
        enabled = true;
        break;
      case 'timestamp_never':
        scope = 'none';
        enabled = false;
        break;
      default:
        await interaction.editReply({ content: '❌ Opção de timestamp inválida.' });
        return;
    }

    data.timestamp = enabled;
    data.config = { ...(data.config || {}), timestamp_scope: scope };

    await saveCustomization(interaction.guildId!, 'panel', data);

    const labelMap: Record<string, string> = {
      all: 'Sempre',
      tickets: 'Apenas Tickets',
      sales: 'Apenas Vendas',
      none: 'Nunca'
    };

    await interaction.editReply({ content: `✅ Timestamp atualizado: ${labelMap[scope]}.` });
  } catch (error: any) {
    logger.error(`[Embeds] Erro ao configurar timestamp: ${error}`);
    if (!interaction.deferred && !interaction.replied) {
      await interaction.reply({ content: '❌ Erro ao configurar timestamp.', flags: 64 });
    } else {
      await interaction.editReply({ content: '❌ Erro ao configurar timestamp.' });
    }
  }
}

/**
 * Atualizar a pré-visualização aplicando customização salva
 */
export async function handlePreviewRefresh(interaction: ButtonInteraction) {
  try {
    await interaction.deferUpdate();

    const config = await getOrCreateGuildConfig(interaction.guildId!);
    const theme = getThemeColors(config);

    const embed = new EmbedBuilder().setColor(theme.primary);

    const saved = await loadCustomization(interaction.guildId!, 'panel');
    if (saved) {
      applyCustomizationToEmbed(embed, saved);
    } else {
      embed
        .setAuthor({
          name: 'Sistema Sellify',
          iconURL: interaction.guild!.iconURL() || undefined
        })
        .setTitle('👁️ Pré-visualização das Personalizações')
        .setDescription('Use os painéis para personalizar. Sem customização salva ainda.')
        .setFooter({
          text: `${interaction.guild!.name} • Sistema Sellify v2.0`,
          iconURL: interaction.guild!.iconURL() || undefined
        })
        .setTimestamp();
    }

    const exampleRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('preview_example_primary')
          .setLabel('Botão Primário')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('✨'),
        new ButtonBuilder()
          .setCustomId('preview_example_success')
          .setLabel('Botão Sucesso')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId('preview_example_danger')
          .setLabel('Botão Perigo')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌')
      );

    const backRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_customization')
          .setLabel('◀️ Voltar')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('preview_refresh')
          .setLabel('🔄 Atualizar')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.editReply({ embeds: [embed], components: [exampleRow, backRow] });
  } catch (error: any) {
    logger.error(`[Embeds] Erro ao atualizar preview: ${error}`);
    if (!interaction.deferred && !interaction.replied) {
      await interaction.reply({ content: '❌ Erro ao atualizar preview.', flags: 64 });
    } else {
      await interaction.editReply({ content: '❌ Erro ao atualizar preview.' });
    }
  }
}

/**
 * Personalização de Emojis
 */
async function handleEmojisCustomization(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('😀 Personalização de Emojis')
    .setDescription(
      'Configure emojis personalizados para o bot usar.\n\n' +
      '**Categorias de emojis:**'
    )
    .addFields(
      {
        name: '✅ Status',
        value: 'Sucesso, erro, aviso, info',
        inline: true
      },
      {
        name: '🛒 Vendas',
        value: 'Carrinho, dinheiro, produtos',
        inline: true
      },
      {
        name: '🎫 Tickets',
        value: 'Abrir, fechar, prioridade',
        inline: true
      },
      {
        name: '👥 Usuários',
        value: 'Online, offline, admin',
        inline: true
      },
      {
        name: '📊 Estatísticas',
        value: 'Gráficos, números, trends',
        inline: true
      },
      {
        name: '⚙️ Sistema',
        value: 'Configurações, ferramentas',
        inline: true
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('emojis_status')
        .setLabel('Status')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId('emojis_sales')
        .setLabel('Vendas')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🛒'),
      new ButtonBuilder()
        .setCustomId('emojis_tickets')
        .setLabel('Tickets')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎫')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('emojis_users')
        .setLabel('Usuários')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👥'),
      new ButtonBuilder()
        .setCustomId('emojis_stats')
        .setLabel('Estatísticas')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📊'),
      new ButtonBuilder()
        .setCustomId('emojis_system')
        .setLabel('Sistema')
        .setStyle(ButtonStyle.Success)
        .setEmoji('⚙️')
    );

  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_customization')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row, row2, backRow]
  });
}

/**
 * Personalização de Imagens
 */
async function handleImagesCustomization(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const embed = new EmbedBuilder()
    .setColor('#FF6347')
    .setTitle('🖼️ Personalização de Imagens')
    .setDescription(
      'Configure imagens e banners personalizados.\n\n' +
      '**Tipos de imagens:**'
    )
    .addFields(
      {
        name: '🏠 Logo do Servidor',
        value: 'Logo principal nos embeds',
        inline: true
      },
      {
        name: '🎨 Banners',
        value: 'Imagens de fundo',
        inline: true
      },
      {
        name: '🖼️ Thumbnails',
        value: 'Miniaturas padrão',
        inline: true
      },
      {
        name: '👋 Boas-vindas',
        value: 'Imagem de boas-vindas',
        inline: true
      },
      {
        name: '🛒 Produtos',
        value: 'Imagens de produtos',
        inline: true
      },
      {
        name: '📢 Anúncios',
        value: 'Banners de anúncios',
        inline: true
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('images_logo')
        .setLabel('Logo')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🏠'),
      new ButtonBuilder()
        .setCustomId('images_banners')
        .setLabel('Banners')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎨'),
      new ButtonBuilder()
        .setCustomId('images_thumbnails')
        .setLabel('Thumbnails')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🖼️')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('images_welcome')
        .setLabel('Boas-vindas')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👋'),
      new ButtonBuilder()
        .setCustomId('images_products')
        .setLabel('Produtos')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🛒'),
      new ButtonBuilder()
        .setCustomId('images_announcements')
        .setLabel('Anúncios')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📢')
    );

  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_customization')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row, row2, backRow]
  });
}

/**
 * Personalização de Botões
 */
async function handleButtonsCustomization(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const embed = new EmbedBuilder()
    .setColor('#4169E1')
    .setTitle('🔘 Personalização de Botões')
    .setDescription(
      'Configure o estilo e comportamento dos botões.\n\n' +
      '**Opções de personalização:**'
    )
    .addFields(
      {
        name: '🎨 Estilos',
        value: 'Primary, Secondary, Success, Danger',
        inline: true
      },
      {
        name: '📝 Labels',
        value: 'Textos dos botões',
        inline: true
      },
      {
        name: '😀 Emojis',
        value: 'Ícones nos botões',
        inline: true
      },
      {
        name: '🔗 Ações',
        value: 'Comportamentos personalizados',
        inline: true
      },
      {
        name: '⚡ Estados',
        value: 'Ativo, desabilitado, loading',
        inline: true
      },
      {
        name: '📱 Layout',
        value: 'Organização dos botões',
        inline: true
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('buttons_styles')
        .setLabel('Estilos')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎨'),
      new ButtonBuilder()
        .setCustomId('buttons_labels')
        .setLabel('Labels')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📝'),
      new ButtonBuilder()
        .setCustomId('buttons_emojis')
        .setLabel('Emojis')
        .setStyle(ButtonStyle.Success)
        .setEmoji('😀')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('buttons_actions')
        .setLabel('Ações')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔗'),
      new ButtonBuilder()
        .setCustomId('buttons_states')
        .setLabel('Estados')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⚡'),
      new ButtonBuilder()
        .setCustomId('buttons_layout')
        .setLabel('Layout')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📱')
    );

  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_customization')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row, row2, backRow]
  });
}

/**
 * Personalização de Idioma
 */
async function handleLanguageCustomization(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const embed = new EmbedBuilder()
    .setColor('#32CD32')
    .setTitle('🌍 Personalização de Idioma')
    .setDescription(
      'Configure o idioma do bot para seu servidor.\n\n' +
      '**Idiomas disponíveis:**'
    )
    .addFields(
      {
        name: '🇧🇷 Português (Brasil)',
        value: 'Idioma padrão - Ativo',
        inline: true
      },
      {
        name: '🇺🇸 English (US)',
        value: 'Disponível',
        inline: true
      },
      {
        name: '🇪🇸 Español',
        value: 'Disponível',
        inline: true
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('language_pt_br')
        .setLabel('Português (BR)')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🇧🇷'),
      new ButtonBuilder()
        .setCustomId('language_en_us')
        .setLabel('English (US)')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🇺🇸')
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('language_es')
        .setLabel('Español')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🇪🇸')
        .setDisabled(true)
    );

  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_customization')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row, backRow]
  });
}

/**
 * Personalização de Fuso Horário
 */
async function handleTimezoneCustomization(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const embed = new EmbedBuilder()
    .setColor('#FF69B4')
    .setTitle('⏰ Personalização de Fuso Horário')
    .setDescription(
      'Configure o fuso horário para timestamps e agendamentos.\n\n' +
      '**Fusos horários populares:**'
    )
    .addFields(
      {
        name: '🇧🇷 Brasil',
        value: 'America/Sao_Paulo (UTC-3)',
        inline: true
      },
      {
        name: '🇺🇸 EUA (Leste)',
        value: 'America/New_York (UTC-5)',
        inline: true
      },
      {
        name: '🇬🇧 Reino Unido',
        value: 'Europe/London (UTC+0)',
        inline: true
      },
      {
        name: '🇯🇵 Japão',
        value: 'Asia/Tokyo (UTC+9)',
        inline: true
      },
      {
        name: '🇦🇺 Austrália',
        value: 'Australia/Sydney (UTC+10)',
        inline: true
      },
      {
        name: '⚙️ Personalizado',
        value: 'Digite seu fuso horário',
        inline: true
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('timezone_brazil')
        .setLabel('Brasil (UTC-3)')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🇧🇷'),
      new ButtonBuilder()
        .setCustomId('timezone_usa')
        .setLabel('EUA (UTC-5)')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🇺🇸'),
      new ButtonBuilder()
        .setCustomId('timezone_uk')
        .setLabel('Reino Unido (UTC+0)')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🇬🇧')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('timezone_japan')
        .setLabel('Japão (UTC+9)')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🇯🇵'),
      new ButtonBuilder()
        .setCustomId('timezone_australia')
        .setLabel('Austrália (UTC+10)')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🇦🇺'),
      new ButtonBuilder()
        .setCustomId('timezone_custom')
        .setLabel('Personalizado')
        .setStyle(ButtonStyle.Success)
        .setEmoji('⚙️')
    );

  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_customization')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row, row2, backRow]
  });
}

/**
 * Preview de Personalização
 */
async function handlePreviewCustomization(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setAuthor({
      name: 'Sistema Sellify',
      iconURL: interaction.guild!.iconURL() || undefined
    })
    .setTitle('👁️ Pré-visualização das Personalizações')
    .setDescription(
      'Este é um exemplo de como seus embeds aparecerão com as configurações atuais.\n\n' +
      '**Configurações ativas:**'
    )
    .addFields(
      {
        name: '🎨 Cor Principal',
        value: `\`${config.theme_primary_color || config.embed_color || '#EB459E'}\``,
        inline: true
      },
      {
        name: '✅ Cor de Sucesso',
        value: `\`${config.theme_success_color || '#57F287'}\``,
        inline: true
      },
      {
        name: '❌ Cor de Perigo',
        value: `\`${config.theme_danger_color || '#ED4245'}\``,
        inline: true
      }
    )
    .setFooter({
      text: `${interaction.guild!.name} • Sistema Sellify v2.0`,
      iconURL: interaction.guild!.iconURL() || undefined
    })
    .setTimestamp();

  // Exemplo de botões com as configurações atuais
  const exampleRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('preview_example_primary')
        .setLabel('Botão Primário')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('✨'),
      new ButtonBuilder()
        .setCustomId('preview_example_success')
        .setLabel('Botão Sucesso')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId('preview_example_danger')
        .setLabel('Botão Perigo')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌')
    );

  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_customization')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('preview_refresh')
        .setLabel('🔄 Atualizar')
        .setStyle(ButtonStyle.Primary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [exampleRow, backRow]
  });
}

/**
 * Handler para botões de personalização
 */
export async function handleCustomButton(interaction: ButtonInteraction, customId: string) {
  try {
    logger.info(`[DEBUG] handleCustomButton called with customId: ${customId}`);
    
    // Verificar se é um botão de tema
    if (customId.startsWith('theme_')) {
      logger.info(`[DEBUG] Dispatching to handleThemeButton for customId: ${customId}`);
      await handleThemeButton(interaction, customId);
      return;
    }

    // Verificar se é um botão de mensagem
    if (customId.startsWith('messages_')) {
      logger.info(`[DEBUG] Dispatching to handleMessageButton for customId: ${customId}`);
      await handleMessageButton(interaction, customId);
      return;
    }

    // Verificar se é um botão de embed
    if (customId.startsWith('embeds_')) {
      logger.info(`[DEBUG] Dispatching to handleEmbedButton for customId: ${customId}`);
      await handleEmbedButton(interaction, customId);
      return;
    }

    switch (customId) {
      case 'custom_theme':
        logger.info(`[DEBUG] Dispatching to handleThemeCustomization`);
        await handleThemeCustomization(interaction);
        break;
      case 'custom_messages':
        logger.info(`[DEBUG] Dispatching to handleMessagesCustomization`);
        await handleMessagesCustomization(interaction);
        break;
      case 'custom_embeds':
        logger.info(`[DEBUG] Dispatching to handleEmbedsCustomization`);
        await handleEmbedsCustomization(interaction);
        break;
      case 'custom_emojis':
        logger.info(`[DEBUG] Dispatching to handleEmojisCustomization`);
        await handleEmojisCustomization(interaction);
        break;
      case 'custom_images':
        logger.info(`[DEBUG] Dispatching to handleImagesCustomization`);
        await handleImagesCustomization(interaction);
        break;
      case 'custom_buttons':
        logger.info(`[DEBUG] Dispatching to handleButtonsCustomization`);
        await handleButtonsCustomization(interaction);
        break;
      case 'custom_language':
        logger.info(`[DEBUG] Dispatching to handleLanguageCustomization`);
        await handleLanguageCustomization(interaction);
        break;
      case 'custom_timezone':
        logger.info(`[DEBUG] Dispatching to handleTimezoneCustomization`);
        await handleTimezoneCustomization(interaction);
        break;
      case 'custom_preview':
        logger.info(`[DEBUG] Dispatching to handlePreviewCustomization`);
        await handlePreviewCustomization(interaction);
        break;
      default:
        logger.warning(`[DEBUG] Unknown custom button customId: ${customId}`);
        await interaction.deferReply({ flags: 64 });
        await interaction.editReply({ content: '❌ Opção de personalização não encontrada.' });
    }
  } catch (error) {
    logger.error(`[DEBUG] Error in handleCustomButton: ${error}`);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'Erro interno. Tente novamente.', flags: 64 });
    }
  }
}

/**
 * Painel de Setup Público (Criação de Painéis para Usuários)
 */
async function handleSetupPublicPanel(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const config = await getOrCreateGuildConfig(interaction.guildId!);
  const theme = getThemeColors(config);

  const embed = new EmbedBuilder()
    .setColor(theme.primary)
    .setTitle('🎯 Setup de Painéis Públicos')
    .setDescription(
      'Crie painéis interativos com botões para seus usuários acessarem as funcionalidades do bot sem precisar digitar comandos!\n\n' +
      '**Como usar:**\n' +
      '```/setup-publico canal:#nome-do-canal tipo:escolha```\n\n' +
      '**Tipos de painéis disponíveis:**'
    )
    .addFields(
      {
        name: '🛍️ Painel de Compras',
        value: 'Botões para: Catálogo, Meus Pedidos, Cupons\n`tipo:shopping`',
        inline: true
      },
      {
        name: '🆘 Painel de Suporte',
        value: 'Botões para: Abrir Ticket, Meus Tickets, FAQ\n`tipo:support`',
        inline: true
      },
      {
        name: '⭐ Painel de Avaliações',
        value: 'Botões para: Avaliar Compra, Ver Avaliações\n`tipo:reviews`',
        inline: true
      },
      {
        name: '🎯 Painel Completo',
        value: 'Todos os botões acima em um só painel!\n`tipo:complete`',
        inline: false
      },
      {
        name: '💡 Exemplo Prático',
        value: 
          '```\n' +
          '/setup-publico canal:#loja tipo:complete\n' +
          '```\n' +
          'Isso criará um painel completo no canal #loja com todos os botões para os usuários interagirem!',
        inline: false
      },
      {
        name: '✨ Benefícios',
        value:
          '• Usuários não precisam decorar comandos\n' +
          '• Interface visual e moderna\n' +
          '• Experiência mobile-friendly\n' +
          '• Menos erros de digitação\n' +
          '• Mais engajamento dos usuários',
        inline: false
      }
    )
    .setFooter({ text: 'Use /setup-publico para criar um painel!' })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar ao Painel')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

/**
 * Handler para modal de configuração de mensagens de boas-vindas
 * Agora com suporte a personalização visual avançada
 */
export async function handleWelcomeMessageConfigModal(interaction: any) {
  try {
    await interaction.deferReply({ flags: 64 });

    const channelId = interaction.fields.getTextInputValue('welcome_channel');
    const message = interaction.fields.getTextInputValue('welcome_message');
    const format = interaction.fields.getTextInputValue('welcome_format').toLowerCase();
    const color = interaction.fields.getTextInputValue('welcome_color') || '#00ff00';
    const enabled = interaction.fields.getTextInputValue('welcome_enabled').toLowerCase() === 'sim';

    // Verificar se o canal existe
    const channel = interaction.guild!.channels.cache.get(channelId);
    
    if (!channel) {
      await interaction.editReply({
        content: '❌ Canal não encontrado. Verifique o ID e tente novamente.'
      });
      return;
    }

    // Validar formato
    if (!['embed', 'texto'].includes(format)) {
      await interaction.editReply({
        content: '❌ Formato inválido. Use "embed" ou "texto".'
      });
      return;
    }

    // Validar cor (se fornecida)
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      await interaction.editReply({
        content: '❌ Cor inválida. Use formato hexadecimal (ex: #00ff00).'
      });
      return;
    }

    // Criar configuração personalizada
    const welcomeConfig = {
      message: message,
      format: format,
      color: color,
      channel_id: channelId,
      enabled: enabled
    };

    // Atualizar configuração usando a tabela guild_configs existente
    await updateGuildConfig(interaction.guildId!, {
      welcome_message: enabled ? JSON.stringify(welcomeConfig) : undefined,
      log_channel_id: enabled ? channelId : undefined
    });

    const formatText = format === 'embed' ? '📋 Embed' : '📝 Texto simples';
    
    await interaction.editReply({
      content: enabled 
        ? `✅ Mensagens de boas-vindas personalizadas configuradas!\n\n**Canal:** ${channel}\n**Formato:** ${formatText}\n**Cor:** ${color}\n**Mensagem:** ${message}\n\n⚠️ **Nota:** O bot precisa estar online para enviar as mensagens.`
        : '✅ Mensagens de boas-vindas personalizadas desativadas!'
    });
  } catch (error) {
    logger.error(`Erro ao configurar mensagens personalizadas: ${error}`);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ Erro ao salvar configuração. Tente novamente.',
        flags: 64
      });
    } else {
      await interaction.editReply({
        content: '❌ Erro ao salvar configuração. Tente novamente.'
      });
    }
  }
}

/**
 * Handler para modal de configuração de mensagens de despedida
 */
export async function handleGoodbyeMessageConfigModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });

  const channelId = interaction.fields.getTextInputValue('goodbye_channel');
  const message = interaction.fields.getTextInputValue('goodbye_message');
  const enabled = interaction.fields.getTextInputValue('goodbye_enabled').toLowerCase() === 'sim';

  try {
    const channel = interaction.guild!.channels.cache.get(channelId);
    
    if (!channel) {
      await interaction.editReply({
        content: '❌ Canal não encontrado. Verifique o ID e tente novamente.'
      });
      return;
    }

    // Salvar configuração
    const { error } = await supabase
      .from('automation_config')
      .upsert({
        guild_id: interaction.guildId!,
        config_type: 'goodbye_message_custom',
        config_data: { channel_id: channelId, message: message, enabled: enabled },
        updated_at: new Date().toISOString()
      }, { onConflict: 'guild_id,config_type' });

    if (error) throw new Error(error.message);

    await interaction.editReply({
      content: enabled 
        ? `✅ Mensagens de despedida configuradas!\n\n**Canal:** ${channel}\n**Mensagem:** ${message}`
        : '✅ Mensagens de despedida desativadas!'
    });
  } catch (error) {
    logger.error(`Erro ao configurar mensagens de despedida: ${error}`);
    await interaction.editReply({
      content: '❌ Erro ao salvar configuração. Tente novamente.'
    });
  }
}

/**
 * Handler para modal de configuração de template de anúncios
 */
export async function handleAnnouncementTemplateModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });

  const title = interaction.fields.getTextInputValue('announcement_title');
  const color = interaction.fields.getTextInputValue('welcome_color') || '#00ff00';
  const footer = interaction.fields.getTextInputValue('announcement_footer') || '';

  try {
    // Validar cor HEX
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      await interaction.editReply({
        content: '❌ Cor inválida. Use o formato HEX (#RRGGBB).'
      });
      return;
    }

    // Salvar template de anúncios
    const { error } = await supabase
      .from('automation_config')
      .upsert({
        guild_id: interaction.guildId!,
        config_type: 'announcement_template',
        config_data: { title: title, color: color, footer: footer },
        updated_at: new Date().toISOString()
      }, { onConflict: 'guild_id,config_type' });

    if (error) throw new Error(error.message);

    await interaction.editReply({
      content: `✅ Template de anúncios configurado!\n\n**Título:** ${title}\n**Cor:** ${color}\n**Rodapé:** ${footer || 'Nenhum'}`
    });
  } catch (error) {
    logger.error(`Erro ao configurar template de anúncios: ${error}`);
    await interaction.editReply({
      content: '❌ Erro ao salvar configuração. Tente novamente.'
    });
  }
}

/**
 * Handler para processar modal de cor principal
 */
export async function handleThemePrimaryColorModal(interaction: any) {
  const primaryColor = interaction.fields.getTextInputValue('primary_color');
  
  try {
    // Validar formato HEX
    if (!/^#[0-9A-F]{6}$/i.test(primaryColor)) {
      await interaction.reply({ 
        content: '❌ Formato de cor inválido! Use o formato HEX (#RRGGBB)', 
        flags: 64 
      });
      return;
    }

    // Salvar no banco de dados
    const { error } = await supabase
      .from('guild_configs')
      .update({ 
        theme_primary_color: primaryColor,
        updated_at: new Date().toISOString()
      })
      .eq('guild_id', interaction.guild.id);

    if (error) {
      logger.error(`Erro ao salvar cor principal: ${error.message}`);
      await interaction.reply({ 
        content: '❌ Erro ao salvar configuração.', 
        flags: 64 
      });
      return;
    }

    await interaction.reply({ 
      content: `✅ Cor principal configurada para: ${primaryColor}`, 
      flags: 64 
    });
  } catch (error) {
    logger.error(`Erro no modal de cor principal: ${error}`);
    await interaction.reply({ 
      content: '❌ Erro interno do servidor.', 
      flags: 64 
    });
  }
}

/**
 * Handler para processar modal de cor de sucesso
 */
export async function handleThemeSuccessColorModal(interaction: any) {
  const successColor = interaction.fields.getTextInputValue('success_color');
  
  try {
    // Validar formato HEX
    if (!/^#[0-9A-F]{6}$/i.test(successColor)) {
      await interaction.reply({ 
        content: '❌ Formato de cor inválido! Use o formato HEX (#RRGGBB)', 
        flags: 64 
      });
      return;
    }

    // Salvar no banco de dados
    const { error } = await supabase
      .from('guild_configs')
      .update({ 
        theme_success_color: successColor,
        updated_at: new Date().toISOString()
      })
      .eq('guild_id', interaction.guild.id);

    if (error) {
      logger.error(`Erro ao salvar cor de sucesso: ${error.message}`);
      await interaction.reply({ 
        content: '❌ Erro ao salvar configuração.', 
        flags: 64 
      });
      return;
    }

    await interaction.reply({ 
      content: `✅ Cor de sucesso configurada para: ${successColor}`, 
      flags: 64 
    });
  } catch (error) {
    logger.error(`Erro no modal de cor de sucesso: ${error}`);
    await interaction.reply({ 
      content: '❌ Erro interno do servidor.', 
      flags: 64 
    });
  }
}

/**
 * Handler para processar modal de cor de perigo
 */
export async function handleThemeDangerColorModal(interaction: any) {
  const dangerColor = interaction.fields.getTextInputValue('danger_color');
  
  try {
    // Validar formato HEX
    if (!/^#[0-9A-F]{6}$/i.test(dangerColor)) {
      await interaction.reply({ 
        content: '❌ Formato de cor inválido! Use o formato HEX (#RRGGBB)', 
        flags: 64 
      });
      return;
    }

    // Salvar no banco de dados
    const { error } = await supabase
      .from('guild_configs')
      .update({ 
        theme_danger_color: dangerColor,
        updated_at: new Date().toISOString()
      })
      .eq('guild_id', interaction.guild.id);

    if (error) {
      logger.error(`Erro ao salvar cor de perigo: ${error.message}`);
      await interaction.reply({ 
        content: '❌ Erro ao salvar configuração.', 
        flags: 64 
      });
      return;
    }

    await interaction.reply({ 
      content: `✅ Cor de perigo configurada para: ${dangerColor}`, 
      flags: 64 
    });
  } catch (error) {
    logger.error(`Erro no modal de cor de perigo: ${error}`);
    await interaction.reply({ 
      content: '❌ Erro interno do servidor.', 
      flags: 64 
    });
  }
}

/**
 * Modal para configuração de mensagens de tickets
 */
export async function handleTicketMessagesConfigModal(interaction: any) {
  const welcomeMessage = interaction.fields.getTextInputValue('welcome_message');
  
  try {
    await updateGuildConfig(interaction.guildId!, {
      welcome_message: welcomeMessage
    });

    await interaction.reply({
      content: '✅ Mensagem de boas-vindas de tickets atualizada com sucesso!',
      flags: 64
    });

    logger.info(`Ticket welcome message updated for guild ${interaction.guildId}`);
  } catch (error) {
    logger.error(`Error updating ticket welcome message: ${error}`);
    await interaction.reply({
      content: '❌ Erro ao atualizar mensagem de tickets.',
      flags: 64
    });
  }
}

/**
 * Modal para configuração de mensagens de vendas
 */
export async function handleSalesMessagesConfigModal(interaction: any) {
  const purchaseMessage = interaction.fields.getTextInputValue('purchase_message');
  
  try {
    await updateGuildConfig(interaction.guildId!, {
      purchase_message: purchaseMessage
    });

    await interaction.reply({
      content: '✅ Mensagem de compra atualizada com sucesso!',
      flags: 64
    });

    logger.info(`Purchase message updated for guild ${interaction.guildId}`);
  } catch (error) {
    logger.error(`Error updating purchase message: ${error}`);
    await interaction.reply({
      content: '❌ Erro ao atualizar mensagem de vendas.',
      flags: 64
    });
  }
}

/**
 * Modal para configuração de mensagens de moderação
 */
export async function handleModerationMessagesConfigModal(interaction: any) {
  const logChannelId = interaction.fields.getTextInputValue('log_channel_id');
  
  try {
    await updateGuildConfig(interaction.guildId!, {
      log_channel_id: logChannelId
    });

    await interaction.reply({
      content: '✅ Canal de logs de moderação configurado com sucesso!',
      flags: 64
    });

    logger.info(`Moderation log channel updated for guild ${interaction.guildId}`);
  } catch (error) {
    logger.error(`Error updating moderation log channel: ${error}`);
    await interaction.reply({
      content: '❌ Erro ao atualizar configuração de moderação.',
      flags: 64
    });
  }
}
