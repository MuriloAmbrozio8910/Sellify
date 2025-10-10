/**
 * Gerenciador de Sistema de Tickets
 */

import {
  Guild,
  TextChannel,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  User,
  GuildMember
} from 'discord.js';
import { supabase } from './supabase';
import { TicketStatus, TicketPriority, SupportTicket, ModNotificationType } from '../types';
import { logger } from './logger';

/**
 * Criar um novo ticket de suporte
 */
export async function createTicket(
  guild: Guild,
  user: User,
  subject: string,
  category?: string,
  priority: TicketPriority = TicketPriority.MEDIUM
): Promise<{ ticket: SupportTicket; channel: TextChannel }> {
  // Buscar configuração de tickets
  const config = await getTicketConfig(guild.id);
  
  // Verificar limite de tickets abertos
  const openTickets = await getUserOpenTickets(guild.id, user.id);
  if (openTickets.length >= (config?.max_open_tickets_per_user || 3)) {
    throw new Error(`Você já possui ${openTickets.length} tickets abertos. Feche algum antes de abrir outro.`);
  }

  // Criar canal do ticket
  const ticketNumber = await getNextTicketNumber(guild.id);
  const channelName = `ticket-${ticketNumber}-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: config?.ticket_category_id || undefined,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles
        ]
      }
    ]
  });

  // Adicionar permissão para role de suporte, se configurada
  if (config?.support_role_id) {
    await channel.permissionOverwrites.create(config.support_role_id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
      AttachFiles: true,
      ManageMessages: true
    });
  }

  // Criar ticket no banco
  const { data: ticketData, error } = await supabase
    .from('support_tickets')
    .insert({
      guild_id: guild.id,
      user_id: user.id,
      channel_id: channel.id,
      subject,
      category,
      priority,
      status: TicketStatus.OPEN
    })
    .select()
    .single();

  if (error || !ticketData) {
    await channel.delete();
    throw new Error('Erro ao criar ticket no banco de dados.');
  }

  // Enviar mensagem de boas-vindas
  const welcomeEmbed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`🎫 Ticket #${ticketNumber} - ${subject}`)
    .setDescription(
      `Olá ${user}!\n\n` +
      (config?.welcome_message || 'Um membro da equipe irá atendê-lo em breve. Descreva seu problema com detalhes.') +
      `\n\n**Assunto:** ${subject}\n` +
      `**Categoria:** ${category || 'Geral'}\n` +
      `**Prioridade:** ${getPriorityEmoji(priority)} ${priority.toUpperCase()}`
    )
    .setFooter({ text: `Ticket criado por ${user.tag}`, iconURL: user.displayAvatarURL() })
    .setTimestamp();

  const actionRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_claim_${ticketData.id}`)
        .setLabel('Assumir Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('✋'),
      new ButtonBuilder()
        .setCustomId(`ticket_close_${ticketData.id}`)
        .setLabel('Fechar Ticket')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId(`ticket_priority_${ticketData.id}`)
        .setLabel('Alterar Prioridade')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⚡')
    );

  await channel.send({
    content: `${user}`,
    embeds: [welcomeEmbed],
    components: [actionRow]
  });

  // Notificar moderadores online
  if (config?.auto_notify_moderators) {
    await notifyOnlineModerators(guild, ticketData, config.support_role_id);
  }

  // Log no canal de logs
  if (config?.log_channel_id) {
    await logTicketAction(guild, config.log_channel_id, 'criado', ticketData, user);
  }

  logger.info(`Ticket #${ticketNumber} criado por ${user.tag} no servidor ${guild.name}`);

  return { ticket: ticketData as SupportTicket, channel };
}

/**
 * Assumir um ticket (moderador)
 */
export async function claimTicket(
  ticketId: string,
  moderator: GuildMember
): Promise<void> {
  const { data: ticket, error: fetchError } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (fetchError || !ticket) {
    throw new Error('Ticket não encontrado.');
  }

  if (ticket.status === TicketStatus.CLOSED) {
    throw new Error('Este ticket já está fechado.');
  }

  if (ticket.moderator_id && ticket.moderator_id !== moderator.id) {
    throw new Error('Este ticket já foi assumido por outro moderador.');
  }

  const { error: updateError } = await supabase
    .from('support_tickets')
    .update({
      moderator_id: moderator.id,
      status: TicketStatus.CLAIMED,
      claimed_at: new Date().toISOString()
    })
    .eq('id', ticketId);

  if (updateError) {
    throw new Error('Erro ao assumir ticket.');
  }

  // Notificar usuário
  const channel = moderator.guild.channels.cache.get(ticket.channel_id) as TextChannel;
  if (channel) {
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setDescription(`✅ **${moderator.user.tag}** assumiu este ticket e irá ajudá-lo em breve!`)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  }

  // Criar notificação
  await createModeratorNotification(
    ticket.guild_id,
    moderator.id,
    ticketId,
    ModNotificationType.TICKET_CLAIMED
  );

  logger.info(`Ticket ${ticketId} assumido por ${moderator.user.tag}`);
}

/**
 * Fechar ticket
 */
export async function closeTicket(
  ticketId: string,
  closedBy: GuildMember,
  reason?: string
): Promise<void> {
  const { data: ticket, error: fetchError } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (fetchError || !ticket) {
    throw new Error('Ticket não encontrado.');
  }

  if (ticket.status === TicketStatus.CLOSED) {
    throw new Error('Este ticket já está fechado.');
  }

  const { error: updateError } = await supabase
    .from('support_tickets')
    .update({
      status: TicketStatus.CLOSED,
      closed_at: new Date().toISOString()
    })
    .eq('id', ticketId);

  if (updateError) {
    throw new Error('Erro ao fechar ticket.');
  }

  const channel = closedBy.guild.channels.cache.get(ticket.channel_id) as TextChannel;
  if (channel) {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🔒 Ticket Fechado')
      .setDescription(
        `Este ticket foi fechado por **${closedBy.user.tag}**.\n\n` +
        (reason ? `**Motivo:** ${reason}\n\n` : '') +
        `O canal será deletado em 10 segundos.`
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    // Deletar canal após 10 segundos
    setTimeout(async () => {
      try {
        await channel.delete();
      } catch (error) {
        logger.error(`Erro ao deletar canal do ticket: ${error}`);
      }
    }, 10000);
  }

  // Notificar moderador
  if (ticket.moderator_id) {
    await createModeratorNotification(
      ticket.guild_id,
      ticket.moderator_id,
      ticketId,
      ModNotificationType.TICKET_CLOSED
    );
  }

  logger.info(`Ticket ${ticketId} fechado por ${closedBy.user.tag}`);
}

/**
 * Buscar configuração de tickets
 */
export async function getTicketConfig(guildId: string) {
  const { data } = await supabase
    .from('ticket_config')
    .select('*')
    .eq('guild_id', guildId)
    .single();

  return data;
}

/**
 * Criar/atualizar configuração de tickets
 */
export async function upsertTicketConfig(
  guildId: string,
  config: Partial<{
    ticket_category_id: string;
    support_role_id: string;
    log_channel_id: string;
    welcome_message: string;
    auto_notify_moderators: boolean;
    max_open_tickets_per_user: number;
  }>
) {
  const { error } = await supabase
    .from('ticket_config')
    .upsert({
      guild_id: guildId,
      ...config
    });

  if (error) {
    throw new Error('Erro ao salvar configuração de tickets.');
  }
}

/**
 * Buscar tickets abertos de um usuário
 */
async function getUserOpenTickets(guildId: string, userId: string) {
  const { data } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .in('status', [TicketStatus.OPEN, TicketStatus.CLAIMED]);

  return data || [];
}

/**
 * Obter próximo número de ticket
 */
async function getNextTicketNumber(guildId: string): Promise<number> {
  const { count } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('guild_id', guildId);

  return (count || 0) + 1;
}

/**
 * Notificar moderadores online
 */
async function notifyOnlineModerators(
  guild: Guild,
  ticket: any,
  supportRoleId?: string
) {
  if (!supportRoleId) return;

  const role = guild.roles.cache.get(supportRoleId);
  if (!role) return;

  // Buscar membros online com a role de suporte
  const members = role.members.filter(member => 
    member.presence?.status === 'online' || member.presence?.status === 'idle'
  );

  for (const [, member] of members) {
    try {
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🆕 Novo Ticket de Suporte')
        .setDescription(
          `Um novo ticket foi aberto e precisa de atenção!\n\n` +
          `**Assunto:** ${ticket.subject}\n` +
          `**Categoria:** ${ticket.category || 'Geral'}\n` +
          `**Prioridade:** ${getPriorityEmoji(ticket.priority)} ${ticket.priority.toUpperCase()}\n\n` +
          `Clique no canal: <#${ticket.channel_id}>`
        )
        .setTimestamp();

      await member.send({ embeds: [embed] });

      // Criar notificação no banco
      await createModeratorNotification(
        guild.id,
        member.id,
        ticket.id,
        ModNotificationType.NEW_TICKET
      );
    } catch (error) {
      // Ignorar se não puder enviar DM
    }
  }
}

/**
 * Criar notificação para moderador
 */
async function createModeratorNotification(
  guildId: string,
  moderatorId: string,
  ticketId: string,
  type: ModNotificationType
) {
  await supabase.from('moderator_notifications').insert({
    guild_id: guildId,
    moderator_id: moderatorId,
    ticket_id: ticketId,
    notification_type: type
  });
}

/**
 * Log de ação de ticket
 */
async function logTicketAction(
  guild: Guild,
  logChannelId: string,
  action: string,
  ticket: any,
  user: User
) {
  const channel = guild.channels.cache.get(logChannelId) as TextChannel;
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`📋 Ticket ${action}`)
    .addFields(
      { name: 'Usuário', value: `${user.tag} (${user.id})`, inline: true },
      { name: 'Assunto', value: ticket.subject, inline: true },
      { name: 'Canal', value: `<#${ticket.channel_id}>`, inline: true }
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

/**
 * Obter emoji de prioridade
 */
function getPriorityEmoji(priority: TicketPriority): string {
  const emojis = {
    [TicketPriority.LOW]: '🟢',
    [TicketPriority.MEDIUM]: '🟡',
    [TicketPriority.HIGH]: '🟠',
    [TicketPriority.URGENT]: '🔴'
  };
  return emojis[priority] || '⚪';
}

/**
 * Listar todos os tickets de um servidor
 */
export async function listTickets(
  guildId: string,
  status?: TicketStatus
) {
  let query = supabase
    .from('support_tickets')
    .select('*')
    .eq('guild_id', guildId);

  if (status) {
    query = query.eq('status', status);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new Error('Erro ao listar tickets.');
  }

  return data as SupportTicket[];
}

/**
 * Obter estatísticas de tickets
 */
export async function getTicketStats(guildId: string) {
  const { data } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('guild_id', guildId);

  if (!data) return null;

  const total = data.length;
  const open = data.filter(t => t.status === TicketStatus.OPEN).length;
  const claimed = data.filter(t => t.status === TicketStatus.CLAIMED).length;
  const closed = data.filter(t => t.status === TicketStatus.CLOSED).length;

  // Calcular tempo médio de resolução
  const closedTickets = data.filter(t => t.closed_at);
  let avgResolutionTime = 0;
  if (closedTickets.length > 0) {
    const totalTime = closedTickets.reduce((sum, ticket) => {
      const created = new Date(ticket.created_at).getTime();
      const closed = new Date(ticket.closed_at!).getTime();
      return sum + (closed - created);
    }, 0);
    avgResolutionTime = totalTime / closedTickets.length / 1000 / 60; // em minutos
  }

  return {
    total,
    open,
    claimed,
    closed,
    avgResolutionTimeMinutes: Math.round(avgResolutionTime)
  };
}
