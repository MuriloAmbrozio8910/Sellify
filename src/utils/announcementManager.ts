/**
 * Gerenciador de Anúncios e Notificações
 */

import {
  Guild,
  TextChannel,
  EmbedBuilder,
  Role,
  User
} from 'discord.js';
import { supabase } from './supabase';
import { Announcement, AnnouncementStatus } from '../types';
import { logger } from './logger';
import cron from 'node-cron';

// Armazenar tarefas agendadas
const scheduledTasks = new Map<string, cron.ScheduledTask>();

/**
 * Criar anúncio
 */
export async function createAnnouncement(
  guildId: string,
  createdBy: string,
  data: {
    title: string;
    content: string;
    color?: string;
    image_url?: string;
    thumbnail_url?: string;
    target_role_id?: string;
    channel_id?: string;
    scheduled_for?: Date;
  }
): Promise<Announcement> {
  const status = data.scheduled_for ? AnnouncementStatus.SCHEDULED : AnnouncementStatus.DRAFT;

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({
      guild_id: guildId,
      created_by: createdBy,
      title: data.title,
      content: data.content,
      color: data.color || '#5865F2',
      image_url: data.image_url,
      thumbnail_url: data.thumbnail_url,
      target_role_id: data.target_role_id,
      channel_id: data.channel_id,
      scheduled_for: data.scheduled_for?.toISOString(),
      status
    })
    .select()
    .single();

  if (error || !announcement) {
    throw new Error('Erro ao criar anúncio.');
  }

  // Se foi agendado, configurar tarefa cron
  if (data.scheduled_for) {
    scheduleAnnouncement(announcement.id, data.scheduled_for);
  }

  logger.info(`Anúncio criado: ${announcement.id} - Status: ${status}`);
  return announcement as Announcement;
}

/**
 * Enviar anúncio imediatamente
 */
export async function sendAnnouncement(
  announcementId: string,
  guild: Guild
): Promise<void> {
  const { data: announcement, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', announcementId)
    .single();

  if (error || !announcement) {
    throw new Error('Anúncio não encontrado.');
  }

  if (announcement.status === AnnouncementStatus.SENT) {
    throw new Error('Este anúncio já foi enviado.');
  }

  if (announcement.status === AnnouncementStatus.CANCELLED) {
    throw new Error('Este anúncio foi cancelado.');
  }

  // Buscar canal
  const channel = guild.channels.cache.get(announcement.channel_id) as TextChannel;
  if (!channel) {
    throw new Error('Canal não encontrado.');
  }

  // Criar embed com limitações do Discord
  const title = announcement.title.length > 256 
    ? announcement.title.substring(0, 253) + '...' 
    : announcement.title;
  
  const description = announcement.content.length > 4096 
    ? announcement.content.substring(0, 4093) + '...' 
    : announcement.content;

  const embed = new EmbedBuilder()
    .setColor(announcement.color || '#5865F2')
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  if (announcement.image_url) {
    embed.setImage(announcement.image_url);
  }

  if (announcement.thumbnail_url) {
    embed.setThumbnail(announcement.thumbnail_url);
  }

  // Determinar menção
  let mention = '';
  if (announcement.target_role_id) {
    const role = guild.roles.cache.get(announcement.target_role_id);
    if (role) {
      mention = role.toString();
    }
  } else {
    mention = '@everyone';
  }

  // Enviar mensagem
  const message = await channel.send({
    content: mention,
    embeds: [embed]
  });

  // Atualizar no banco
  await supabase
    .from('announcements')
    .update({
      status: AnnouncementStatus.SENT,
      sent_at: new Date().toISOString(),
      message_id: message.id
    })
    .eq('id', announcementId);

  logger.info(`Anúncio ${announcementId} enviado no canal ${channel.name}`);
}

/**
 * Agendar anúncio
 */
function scheduleAnnouncement(announcementId: string, scheduledFor: Date) {
  const now = new Date();
  const delay = scheduledFor.getTime() - now.getTime();

  if (delay <= 0) {
    // Se já passou da hora, enviar imediatamente
    logger.warning(`Anúncio ${announcementId} agendado para o passado. Enviando imediatamente.`);
    return;
  }

  // Agendar com setTimeout
  const timeout = setTimeout(async () => {
    try {
      // Buscar guild (precisaria ter acesso ao client aqui)
      // Por enquanto, vamos usar cron job para verificar periodicamente
      logger.info(`Hora de enviar anúncio ${announcementId}`);
    } catch (error) {
      logger.error(`Erro ao enviar anúncio agendado: ${error}`);
    }
  }, delay);

  logger.info(`Anúncio ${announcementId} agendado para ${scheduledFor.toISOString()}`);
}

/**
 * Cancelar anúncio
 */
export async function cancelAnnouncement(announcementId: string): Promise<void> {
  const { error } = await supabase
    .from('announcements')
    .update({
      status: AnnouncementStatus.CANCELLED
    })
    .eq('id', announcementId)
    .eq('status', AnnouncementStatus.SCHEDULED);

  if (error) {
    throw new Error('Erro ao cancelar anúncio ou anúncio já foi enviado.');
  }

  // Cancelar tarefa agendada se existir
  const task = scheduledTasks.get(announcementId);
  if (task) {
    task.stop();
    scheduledTasks.delete(announcementId);
  }

  logger.info(`Anúncio ${announcementId} cancelado.`);
}

/**
 * Listar anúncios
 */
export async function listAnnouncements(
  guildId: string,
  status?: AnnouncementStatus
) {
  let query = supabase
    .from('announcements')
    .select('*')
    .eq('guild_id', guildId);

  if (status) {
    query = query.eq('status', status);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new Error('Erro ao listar anúncios.');
  }

  return data as Announcement[];
}

/**
 * Enviar notificação direta para todos os membros
 */
export async function sendBroadcastDM(
  guild: Guild,
  title: string,
  content: string,
  targetRoleId?: string
): Promise<{ sent: number; failed: number }> {
  let members = guild.members.cache;

  // Filtrar por role se especificada
  if (targetRoleId) {
    const role = guild.roles.cache.get(targetRoleId);
    if (role) {
      members = role.members;
    }
  }

  // Limitar tamanhos para evitar erro do Discord
  const safeTitle = title.length > 256 ? title.substring(0, 253) + '...' : title;
  const safeContent = content.length > 4096 ? content.substring(0, 4093) + '...' : content;

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(safeTitle)
    .setDescription(safeContent)
    .setFooter({ text: `Enviado de ${guild.name}` })
    .setTimestamp();

  let sent = 0;
  let failed = 0;

  for (const [, member] of members) {
    if (member.user.bot) continue;

    try {
      await member.send({ embeds: [embed] });
      sent++;
      // Pequeno delay para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      failed++;
    }
  }

  logger.info(`Broadcast enviado: ${sent} enviados, ${failed} falhas`);
  return { sent, failed };
}

/**
 * Criar notificação de boas-vindas automática
 */
export async function sendWelcomeMessage(
  guild: Guild,
  channelId: string,
  newMember: User
): Promise<void> {
  const channel = guild.channels.cache.get(channelId) as TextChannel;
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle(`🎉 Bem-vindo ao ${guild.name}!`)
    .setDescription(
      `Olá ${newMember}!\n\n` +
      `Seja muito bem-vindo(a) ao nosso servidor!\n\n` +
      `🔹 Leia as regras\n` +
      `🔹 Apresente-se\n` +
      `🔹 Divirta-se!`
    )
    .setThumbnail(newMember.displayAvatarURL())
    .setFooter({ text: `Membro #${guild.memberCount}` })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

/**
 * Criar anúncio de promoção/evento
 */
export async function createEventAnnouncement(
  guild: Guild,
  channelId: string,
  data: {
    title: string;
    description: string;
    eventDate: Date;
    imageUrl?: string;
    roleToMention?: string;
  }
): Promise<void> {
  const channel = guild.channels.cache.get(channelId) as TextChannel;
  if (!channel) throw new Error('Canal não encontrado.');

  // Limitar tamanhos para evitar erro do Discord
  const safeTitle = data.title.length > 250 
    ? data.title.substring(0, 247) + '...' 
    : data.title;
  
  const safeDescription = data.description.length > 4096 
    ? data.description.substring(0, 4093) + '...' 
    : data.description;

  const embed = new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle(`🎊 ${safeTitle}`)
    .setDescription(safeDescription)
    .addFields(
      { name: '📅 Data', value: data.eventDate.toLocaleString('pt-BR'), inline: true },
      { name: '⏰ Faltam', value: getTimeUntil(data.eventDate), inline: true }
    )
    .setTimestamp();

  if (data.imageUrl) {
    embed.setImage(data.imageUrl);
  }

  let mention = data.roleToMention ? `<@&${data.roleToMention}>` : '@everyone';

  await channel.send({ content: mention, embeds: [embed] });
}

/**
 * Calcular tempo até evento
 */
function getTimeUntil(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff <= 0) return 'O evento já começou!';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Inicializar sistema de anúncios agendados
 * Verificar a cada minuto se há anúncios para enviar
 */
export function initializeAnnouncementScheduler(client: any) {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Buscar anúncios agendados para agora
      const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .eq('status', AnnouncementStatus.SCHEDULED)
        .lte('scheduled_for', now.toISOString());

      if (!announcements || announcements.length === 0) return;

      for (const announcement of announcements) {
        try {
          const guild = client.guilds.cache.get(announcement.guild_id);
          if (guild) {
            await sendAnnouncement(announcement.id, guild);
          }
        } catch (error) {
          logger.error(`Erro ao enviar anúncio agendado ${announcement.id}: ${error}`);
        }
      }
    } catch (error) {
      logger.error(`Erro no scheduler de anúncios: ${error}`);
    }
  });

  logger.info('Scheduler de anúncios iniciado');
}
