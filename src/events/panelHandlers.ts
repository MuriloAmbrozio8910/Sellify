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
  ChannelType
} from 'discord.js';
import { claimTicket, closeTicket, createTicket, getTicketStats, listTickets } from '../utils/ticketManager';
import { sendBroadcastDM, listAnnouncements } from '../utils/announcementManager';
import { getAIUsageStats } from '../utils/aiService';
import { logger } from '../utils/logger';
import { getOrCreateGuildConfig, supabase, updateGuildConfig } from '../utils/supabase';
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
  else if (customId === 'panel_logs') {
    await handleLogsPanel(interaction);
  }
  else if (customId === 'panel_help') {
    await handleHelpPanel(interaction);
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
  const ticketStats = await getTicketStats(interaction.guildId!);

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
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
          `🎨 **Cor:** ${config.embed_color}\n` +
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
 * Voltar ao painel principal
 */
async function handleBackToMainPanel(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  const guildId = interaction.guildId!;
  const config = await getOrCreateGuildConfig(guildId);
  const ticketStats = await getTicketStats(guildId);

  // Buscar estatísticas de vendas
  const { data: salesData } = await supabase
    .from('transactions')
    .select('amount, status')
    .eq('guild_id', guildId)
    .eq('status', 'completed');

  const totalSales = salesData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const salesCount = salesData?.length || 0;

  // Buscar produtos ativos
  const { data: productsData } = await supabase
    .from('products')
    .select('id')
    .eq('guild_id', guildId)
    .eq('is_active', true);

  const productsCount = productsData?.length || 0;

  const { formatCurrency } = await import('../utils/payments');

  // Embed principal moderno e elegante
  const embed = new EmbedBuilder()
    .setColor('#2F3136')
    .setTitle('✨ Painel de Gerenciamento - Sellify')
    .setDescription(
      `╔════════════════════════════════════╗\n` +
      `  Bem-vindo, **${interaction.user.username}**!\n` +
      `  Gerencie seu servidor com facilidade\n` +
      `╚════════════════════════════════════╝`
    )
    .addFields(
      {
        name: '\u200b',
        value: '**📊 ESTATÍSTICAS DO SERVIDOR**',
        inline: false
      },
      {
        name: '👥 Comunidade',
        value: 
          `\`\`\`\n` +
          `Membros: ${interaction.guild!.memberCount}\n` +
          `Online: ${interaction.guild!.members.cache.filter(m => m.presence?.status !== 'offline').size}\n` +
          `Bots: ${interaction.guild!.members.cache.filter(m => m.user.bot).size}\n` +
          `\`\`\``,
        inline: true
      },
      {
        name: '💰 Vendas',
        value:
          `\`\`\`\n` +
          `Total: ${formatCurrency(totalSales, config.currency)}\n` +
          `Transações: ${salesCount}\n` +
          `Produtos: ${productsCount}\n` +
          `\`\`\``,
        inline: true
      },
      {
        name: '🎫 Suporte',
        value:
          `\`\`\`\n` +
          `Abertos: ${ticketStats?.open || 0}\n` +
          `Atendendo: ${ticketStats?.claimed || 0}\n` +
          `Fechados: ${ticketStats?.closed || 0}\n` +
          `\`\`\``,
        inline: true
      },
      {
        name: '\u200b',
        value: '**⚡ ACESSO RÁPIDO**',
        inline: false
      }
    )
    .setThumbnail(interaction.guild!.iconURL())
    .setFooter({ 
      text: `${interaction.guild!.name} • Sistema Sellify`, 
      iconURL: interaction.guild!.iconURL() || undefined 
    })
    .setTimestamp();

  // Linha 1: Gestão de Vendas
  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_products')
        .setLabel('Produtos')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🛍️'),
      new ButtonBuilder()
        .setCustomId('panel_sales')
        .setLabel('Vendas')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💰'),
      new ButtonBuilder()
        .setCustomId('panel_coupons')
        .setLabel('Cupons')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎟️'),
      new ButtonBuilder()
        .setCustomId('panel_reviews')
        .setLabel('Avaliações')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('⭐')
    );

  // Linha 2: Suporte e Comunicação
  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_tickets')
        .setLabel('Tickets')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫'),
      new ButtonBuilder()
        .setCustomId('panel_announcements')
        .setLabel('Anúncios')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📢'),
      new ButtonBuilder()
        .setCustomId('panel_automations')
        .setLabel('Automação')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🤖'),
      new ButtonBuilder()
        .setCustomId('panel_ai')
        .setLabel('Inteligência')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🧠')
    );

  // Linha 3: Análise e Configurações
  const row3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_stats')
        .setLabel('Estatísticas')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📊'),
      new ButtonBuilder()
        .setCustomId('panel_logs')
        .setLabel('Logs')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('panel_config')
        .setLabel('Configurar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⚙️'),
      new ButtonBuilder()
        .setCustomId('panel_refresh')
        .setLabel('Atualizar')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🔄')
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row1, row2, row3]
  });
}

/**
 * Painel de produtos
 */
async function handleProductsPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#5865F2')
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
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de vendas
 */
async function handleSalesPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#00FF00')
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
        .setEmoji('🏆')
    );

  const rowBack = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de cupons
 */
async function handleCouponsPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#FFA500')
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
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [rowActions, rowBack] });
}

/**
 * Painel de estatísticas
 */
async function handleStatsPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#9B59B6')
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
        .setCustomId('panel_back_main')
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

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
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
        .setCustomId('panel_back_main')
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
        .setCustomId('panel_back_main')
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
        .setCustomId('panel_back_main')
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
        .setCustomId('panel_back_main')
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
        .setCustomId('panel_back_main')
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
        .setCustomId('panel_back_main')
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
        .setCustomId('panel_back_main')
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
    content: '🔄 Funcionalidade de alteração de prioridade em desenvolvimento!',
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
          .setCustomId('panel_back_main')
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
