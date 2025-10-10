/**
 * Comando: /ticket
 * Sistema completo de tickets de suporte
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType
} from 'discord.js';
import { createTicket, listTickets, getTicketStats, upsertTicketConfig } from '../utils/ticketManager';
import { TicketPriority, TicketStatus } from '../types';

export const data = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('🎫 Sistema de tickets de suporte')
  .addSubcommand(subcommand =>
    subcommand
      .setName('abrir')
      .setDescription('Abrir um novo ticket de suporte')
      .addStringOption(option =>
        option
          .setName('assunto')
          .setDescription('Assunto do ticket')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('categoria')
          .setDescription('Categoria do ticket')
          .addChoices(
            { name: '💰 Vendas', value: 'vendas' },
            { name: '🛠️ Suporte Técnico', value: 'suporte' },
            { name: '❓ Dúvida', value: 'duvida' },
            { name: '🐛 Bug/Problema', value: 'bug' },
            { name: '💡 Sugestão', value: 'sugestao' },
            { name: '📦 Outros', value: 'outros' }
          )
      )
      .addStringOption(option =>
        option
          .setName('prioridade')
          .setDescription('Prioridade do ticket')
          .addChoices(
            { name: '🟢 Baixa', value: 'low' },
            { name: '🟡 Média', value: 'medium' },
            { name: '🟠 Alta', value: 'high' },
            { name: '🔴 Urgente', value: 'urgent' }
          )
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('listar')
      .setDescription('Listar tickets do servidor (apenas moderadores)')
      .addStringOption(option =>
        option
          .setName('status')
          .setDescription('Filtrar por status')
          .addChoices(
            { name: '🟢 Abertos', value: 'open' },
            { name: '🟡 Em Atendimento', value: 'claimed' },
            { name: '🔴 Fechados', value: 'closed' }
          )
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('stats')
      .setDescription('Ver estatísticas de tickets (apenas moderadores)')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('setup')
      .setDescription('Configurar sistema de tickets (apenas administradores)')
      .addChannelOption(option =>
        option
          .setName('categoria')
          .setDescription('Categoria onde tickets serão criados')
          .addChannelTypes(ChannelType.GuildCategory)
      )
      .addRoleOption(option =>
        option
          .setName('role_suporte')
          .setDescription('Role de suporte/moderadores')
      )
      .addChannelOption(option =>
        option
          .setName('canal_logs')
          .setDescription('Canal para logs de tickets')
          .addChannelTypes(ChannelType.GuildText)
      )
      .addBooleanOption(option =>
        option
          .setName('notificar_mods')
          .setDescription('Notificar moderadores automaticamente?')
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('painel')
      .setDescription('Criar painel de abertura de tickets (apenas administradores)')
      .addChannelOption(option =>
        option
          .setName('canal')
          .setDescription('Canal onde o painel será criado')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case 'abrir':
      await handleOpenTicket(interaction);
      break;
    case 'listar':
      await handleListTickets(interaction);
      break;
    case 'stats':
      await handleTicketStats(interaction);
      break;
    case 'setup':
      await handleSetupTickets(interaction);
      break;
    case 'painel':
      await handleCreatePanel(interaction);
      break;
  }
}

async function handleOpenTicket(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const subject = interaction.options.getString('assunto', true);
  const category = interaction.options.getString('categoria') || undefined;
  const priority = (interaction.options.getString('prioridade') as TicketPriority) || TicketPriority.MEDIUM;

  try {
    const { ticket, channel } = await createTicket(
      interaction.guild!,
      interaction.user,
      subject,
      category,
      priority
    );

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Ticket Criado com Sucesso!')
      .setDescription(
        `Seu ticket foi criado!\n\n` +
        `📝 **Assunto:** ${subject}\n` +
        `📂 **Categoria:** ${category || 'Geral'}\n` +
        `⚡ **Prioridade:** ${priority.toUpperCase()}\n\n` +
        `Acesse: ${channel}`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao criar ticket.'}`
    });
  }
}

async function handleListTickets(interaction: ChatInputCommandInteraction) {
  // Verificar permissão
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
    await interaction.reply({
      content: '❌ Você precisa de permissão de moderador para ver todos os tickets.',
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const statusFilter = interaction.options.getString('status') as TicketStatus | null;

  try {
    const tickets = await listTickets(interaction.guildId!, statusFilter || undefined);

    if (tickets.length === 0) {
      await interaction.editReply('Nenhum ticket encontrado.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🎫 Tickets ${statusFilter ? `- ${statusFilter.toUpperCase()}` : ''}`)
      .setDescription(`Total: **${tickets.length}** tickets`)
      .setTimestamp();

    // Mostrar primeiros 10 tickets
    const ticketsToShow = tickets.slice(0, 10);
    for (const ticket of ticketsToShow) {
      const statusEmoji = ticket.status === TicketStatus.OPEN ? '🟢' : ticket.status === TicketStatus.CLAIMED ? '🟡' : '🔴';
      const priorityEmoji = ticket.priority === TicketPriority.URGENT ? '🔴' : ticket.priority === TicketPriority.HIGH ? '🟠' : ticket.priority === TicketPriority.MEDIUM ? '🟡' : '🟢';
      
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

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao listar tickets.'}`
    });
  }
}

async function handleTicketStats(interaction: ChatInputCommandInteraction) {
  // Verificar permissão
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
    await interaction.reply({
      content: '❌ Você precisa de permissão de moderador para ver estatísticas.',
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const stats = await getTicketStats(interaction.guildId!);

    if (!stats) {
      await interaction.editReply('Nenhum dado de ticket disponível.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📊 Estatísticas de Tickets')
      .addFields(
        { name: '📈 Total de Tickets', value: stats.total.toString(), inline: true },
        { name: '🟢 Abertos', value: stats.open.toString(), inline: true },
        { name: '🟡 Em Atendimento', value: stats.claimed.toString(), inline: true },
        { name: '🔴 Fechados', value: stats.closed.toString(), inline: true },
        { name: '⏱️ Tempo Médio de Resolução', value: `${stats.avgResolutionTimeMinutes} minutos`, inline: true },
        { name: '📊 Taxa de Resolução', value: `${((stats.closed / stats.total) * 100).toFixed(1)}%`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao buscar estatísticas.'}`
    });
  }
}

async function handleSetupTickets(interaction: ChatInputCommandInteraction) {
  // Verificar permissão
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '❌ Apenas administradores podem configurar o sistema de tickets.',
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const category = interaction.options.getChannel('categoria');
  const supportRole = interaction.options.getRole('role_suporte');
  const logChannel = interaction.options.getChannel('canal_logs');
  const notifyMods = interaction.options.getBoolean('notificar_mods');

  try {
    const config: any = {};

    if (category) config.ticket_category_id = category.id;
    if (supportRole) config.support_role_id = supportRole.id;
    if (logChannel) config.log_channel_id = logChannel.id;
    if (notifyMods !== null) config.auto_notify_moderators = notifyMods;

    await upsertTicketConfig(interaction.guildId!, config);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Sistema de Tickets Configurado')
      .setDescription('As configurações foram salvas com sucesso!')
      .addFields(
        category ? { name: '📁 Categoria', value: category.toString(), inline: true } : { name: '📁 Categoria', value: 'Não alterada', inline: true },
        supportRole ? { name: '👥 Role de Suporte', value: supportRole.toString(), inline: true } : { name: '👥 Role de Suporte', value: 'Não alterada', inline: true },
        logChannel ? { name: '📋 Canal de Logs', value: logChannel.toString(), inline: true } : { name: '📋 Canal de Logs', value: 'Não alterado', inline: true },
        notifyMods !== null ? { name: '🔔 Notificar Moderadores', value: notifyMods ? '✅ Sim' : '❌ Não', inline: true } : { name: '🔔 Notificar Moderadores', value: 'Não alterado', inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao configurar sistema de tickets.'}`
    });
  }
}

async function handleCreatePanel(interaction: ChatInputCommandInteraction) {
  // Verificar permissão
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '❌ Apenas administradores podem criar painéis.',
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.options.getChannel('canal', true);

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

  try {
    const textChannel = interaction.guild!.channels.cache.get(channel.id) as any;
    await textChannel.send({ embeds: [embed], components: [row] });

    await interaction.editReply({
      content: `✅ Painel de tickets criado em ${channel}!`
    });
  } catch (error) {
    await interaction.editReply({
      content: '❌ Erro ao criar painel. Verifique se tenho permissões no canal.'
    });
  }
}
