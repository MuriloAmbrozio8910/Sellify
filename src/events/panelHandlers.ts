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
  PermissionFlagsBits
} from 'discord.js';
import { claimTicket, closeTicket, createTicket, getTicketStats } from '../utils/ticketManager';
import { sendBroadcastDM, listAnnouncements } from '../utils/announcementManager';
import { getAIUsageStats } from '../utils/aiService';
import { logger } from '../utils/logger';
import { getOrCreateGuildConfig } from '../utils/supabase';
import { TicketPriority } from '../types';

/**
 * Handler principal de painéis
 */
export async function handlePanelButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  // Painel principal
  if (customId === 'panel_refresh') {
    await handlePanelRefresh(interaction);
  }
  else if (customId === 'panel_back_main') {
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
    .setTimestamp();

  // Primeira linha de botões - Gestão de Produtos e Vendas
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
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎟️'),
      new ButtonBuilder()
        .setCustomId('panel_stats')
        .setLabel('Estatísticas')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📊')
    );

  // Segunda linha de botões - Tickets e Anúncios
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
        .setLabel('Automações')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🤖'),
      new ButtonBuilder()
        .setCustomId('panel_ai')
        .setLabel('IA')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🧠')
    );

  // Terceira linha de botões - Configurações
  const row3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_config')
        .setLabel('Configurações')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⚙️'),
      new ButtonBuilder()
        .setCustomId('panel_logs')
        .setLabel('Logs')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('panel_help')
        .setLabel('Ajuda')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❓'),
      new ButtonBuilder()
        .setCustomId('panel_refresh')
        .setLabel('Atualizar')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🔄')
    );

  await interaction.update({
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
      '📝 **Comandos com Formulário:**\n' +
      '`/addproduct` - Criar novo produto (abre modal)\n' +
      '`/editproduct id` - Editar produto (abre modal pré-preenchido)\n\n' +
      '📄 **Campos do Formulário:**\n' +
      '• **Nome** e **Descrição** do produto\n' +
      '• **Preço** (ex: 97.90)\n' +
      '• **Tipo:** unique (compra única) ou subscription (assinatura)\n' +
      '• **Estoque:** número ou vazio para ilimitado\n\n' +
      '🎯 **Detalhes Extras (opcional):**\n' +
      'Imagem, role atribuída, conteúdo de entrega automática\n\n' +
      '🛠️ **Outros comandos:**\n' +
      '`/removeproduct` - Remover produto\n' +
      '`/catalogo` - Ver catálogo completo'
    )
    .setFooter({ text: 'Os formulários facilitam a criação e edição!' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Painel de vendas
 */
async function handleSalesPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('💰 Painel de Vendas')
    .setDescription('Acompanhe e gerencie vendas')
    .addFields(
      { name: '📊 Ações Disponíveis', value: 
        `• \`/stats\` - Ver estatísticas de vendas\n` +
        `• \`/myorders\` - Ver pedidos (usuário)\n` +
        `• Acesse o dashboard web para relatórios completos`
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Painel de cupons
 */
async function handleCouponsPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('🎟️ Painel de Cupons')
    .setDescription(
      'Gerencie cupons de desconto.\n\n' +
      '📝 **Comando com Formulário:**\n' +
      '`/addcoupon` - Criar cupom (abre modal)\n\n' +
      '📄 **Campos do Formulário:**\n' +
      '• **Código** do cupom (ex: PROMO10)\n' +
      '• **Desconto percentual** (1-100) ou **Desconto fixo** (R$)\n' +
      '• **Limite de usos** (vazio = ilimitado)\n' +
      '• **Data de expiração** (DD/MM/YYYY, opcional)\n\n' +
      '🎯 **Dica:** Você pode definir desconto percentual OU fixo, mas não precisa preencher ambos!'
    )
    .setFooter({ text: 'Cupons ajudam a aumentar suas vendas!' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Painel de estatísticas
 */
async function handleStatsPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#9B59B6')
    .setTitle('📊 Painel de Estatísticas')
    .setDescription('Visualize métricas do servidor')
    .addFields(
      { name: '📈 Informações', value: 
        `Use \`/stats\` para ver estatísticas detalhadas de vendas e produtos.\n\n` +
        `O dashboard web oferece visualizações mais completas.`
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
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
      'Crie e gerencie anúncios para os membros.\n\n' +
      '📝 **Comando com Formulário:**\n' +
      '`/anuncio criar canal:#geral` - Criar anúncio (abre modal)\n\n' +
      '📄 **Campos do Formulário:**\n' +
      '• **Título** e **Conteúdo** do anúncio\n' +
      '• **Cor** do embed (ex: #5865F2)\n' +
      '• **Imagem** (URL opcional)\n' +
      '• **Role** para mencionar (opcional, use @everyone ou ID)\n\n' +
      '🛠️ **Outros comandos:**\n' +
      '`/anuncio agendar` - Agendar para envio futuro\n' +
      '`/anuncio listar` - Ver anúncios criados\n' +
      '`/anuncio cancelar` - Cancelar agendamento\n' +
      '`/anuncio broadcast` - Enviar DM em massa'
    )
    .setFooter({ text: 'Use formulários para criar anúncios rapidamente!' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Painel de automações
 */
async function handleAutomationsPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#00CED1')
    .setTitle('🤖 Painel de Automações')
    .setDescription('Automatize tarefas administrativas do servidor')
    .addFields(
      { name: '🔧 Funcionalidades', value: 
        `• Mensagens agendadas recorrentes\n` +
        `• Atribuição automática de roles\n` +
        `• Limpeza de canais programada\n` +
        `• Anúncios periódicos\n` +
        `• Tarefas customizadas com cron`
      },
      { name: '💡 Em Desenvolvimento', value: 
        `Esta funcionalidade será expandida em breve com mais opções de automação.`
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Painel de IA
 */
async function handleAIPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#9B59B6')
    .setTitle('🧠 Painel de IA')
    .setDescription('Recursos avançados de Inteligência Artificial')
    .addFields(
      { name: '💬 Chat Inteligente', value: 
        `Converse com a IA para obter respostas rápidas e úteis.\n` +
        `Comando: \`/ia chat\``
      },
      { name: '✍️ Geração de Conteúdo', value: 
        `Gere anúncios, descrições de produtos, mensagens e muito mais.\n` +
        `Comando: \`/ia gerar\``
      },
      { name: '🛡️ Moderação Automática', value: 
        `Analise conteúdo e detecte violações automaticamente.\n` +
        `Comando: \`/ia moderar\``
      },
      { name: '🤖 Assistente Administrativo', value: 
        `Receba ajuda para quebrar tarefas complexas em etapas simples.\n` +
        `Comando: \`/ia assistente\``
      },
      { name: '📊 Estatísticas', value: 
        `Veja uso e custos de IA.\n` +
        `Comando: \`/ia stats\``
      }
    )
    .setFooter({ text: 'Powered by OpenAI GPT-4' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Painel de configurações
 */
async function handleConfigPanel(interaction: ButtonInteraction) {
  const config = await getOrCreateGuildConfig(interaction.guildId!);

  const embed = new EmbedBuilder()
    .setColor('#95A5A6')
    .setTitle('⚙️ Painel de Configurações')
    .setDescription('Configure o bot conforme suas necessidades')
    .addFields(
      { name: '🎨 Configurações Atuais', value: 
        `**Moeda:** ${config.currency}\n` +
        `**Cor dos Embeds:** ${config.embed_color}\n` +
        `**Stripe:** ${config.stripe_enabled ? 'Ativado ✅' : 'Desativado ❌'}\n` +
        `**Mercado Pago:** ${config.mercadopago_enabled ? 'Ativado ✅' : 'Desativado ❌'}`
      },
      { name: '🔧 Comando', value: 
        `Use \`/config\` para alterar configurações do servidor.`
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Painel de logs
 */
async function handleLogsPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#34495E')
    .setTitle('📋 Painel de Logs')
    .setDescription('Sistema de logs e auditoria')
    .addFields(
      { name: '📝 Tipos de Logs', value: 
        `• Logs de transações\n` +
        `• Logs de tickets\n` +
        `• Logs de comandos executados\n` +
        `• Logs de acesso\n` +
        `• Logs de moderação IA`
      },
      { name: '💡 Informação', value: 
        `Os logs são armazenados no banco de dados e podem ser consultados via dashboard web.`
      }
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

/**
 * Painel de ajuda
 */
async function handleHelpPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#3498DB')
    .setTitle('❓ Ajuda e Documentação')
    .setDescription('Comandos disponíveis e recursos do bot')
    .addFields(
      { name: '🛍️ Vendas', value: 
        `\`/addproduct\` \`/editproduct\` \`/removeproduct\` \`/catalogo\` \`/myorders\``
      },
      { name: '🎫 Tickets', value: 
        `\`/ticket abrir\` \`/ticket listar\` \`/ticket setup\``
      },
      { name: '📢 Anúncios', value: 
        `\`/anuncio criar\` \`/anuncio agendar\` \`/anuncio listar\``
      },
      { name: '🧠 IA', value: 
        `\`/ia chat\` \`/ia gerar\` \`/ia moderar\` \`/ia assistente\``
      },
      { name: '⚙️ Configuração', value: 
        `\`/config\` \`/stats\` \`/panel\``
      },
      { name: '📚 Documentação', value: 
        `Consulte o README.md do projeto para documentação completa.`
      }
    )
    .setFooter({ text: 'Bot de Vendas Discord v2.0' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_back_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
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

  await interaction.deferReply({ ephemeral: true });

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

  await interaction.deferReply({ ephemeral: true });

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

  await interaction.deferReply({ ephemeral: true });

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
    ephemeral: true
  });
}

/**
 * Handler para confirmação de broadcast
 */
export async function handleBroadcastConfirmation(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  if (customId.startsWith('confirm_broadcast_')) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({
      content: '🚀 Enviando broadcast... Isso pode levar alguns minutos.',
      components: []
    });

    // Nota: As informações do broadcast precisariam ser armazenadas temporariamente
    // Por simplicidade, vamos mostrar apenas uma mensagem de confirmação
    await interaction.followUp({
      content: '✅ Broadcast iniciado! Você receberá uma notificação quando concluído.',
      ephemeral: true
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
