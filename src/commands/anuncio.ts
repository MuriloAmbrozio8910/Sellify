/**
 * Comando: /anuncio
 * Sistema de anúncios e notificações programadas
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { createAnnouncement, sendAnnouncement, cancelAnnouncement, listAnnouncements, sendBroadcastDM } from '../utils/announcementManager';
import { AnnouncementStatus } from '../types';

export const data = new SlashCommandBuilder()
  .setName('anuncio')
  .setDescription('📢 Sistema de anúncios e notificações')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(subcommand =>
    subcommand
      .setName('criar')
      .setDescription('Criar um novo anúncio')
      .addStringOption(option =>
        option
          .setName('titulo')
          .setDescription('Título do anúncio')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('conteudo')
          .setDescription('Conteúdo do anúncio')
          .setRequired(true)
      )
      .addChannelOption(option =>
        option
          .setName('canal')
          .setDescription('Canal onde o anúncio será enviado')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
      .addRoleOption(option =>
        option
          .setName('mencionar_role')
          .setDescription('Role para mencionar (deixe vazio para @everyone)')
      )
      .addStringOption(option =>
        option
          .setName('cor')
          .setDescription('Cor do embed (ex: #FF5733)')
      )
      .addStringOption(option =>
        option
          .setName('imagem')
          .setDescription('URL da imagem')
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('agendar')
      .setDescription('Agendar um anúncio para envio futuro')
      .addStringOption(option =>
        option
          .setName('titulo')
          .setDescription('Título do anúncio')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('conteudo')
          .setDescription('Conteúdo do anúncio')
          .setRequired(true)
      )
      .addChannelOption(option =>
        option
          .setName('canal')
          .setDescription('Canal onde o anúncio será enviado')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('data_hora')
          .setDescription('Data e hora (formato: DD/MM/YYYY HH:MM)')
          .setRequired(true)
      )
      .addRoleOption(option =>
        option
          .setName('mencionar_role')
          .setDescription('Role para mencionar')
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('listar')
      .setDescription('Listar anúncios criados')
      .addStringOption(option =>
        option
          .setName('status')
          .setDescription('Filtrar por status')
          .addChoices(
            { name: '📝 Rascunho', value: 'draft' },
            { name: '⏰ Agendado', value: 'scheduled' },
            { name: '✅ Enviado', value: 'sent' },
            { name: '❌ Cancelado', value: 'cancelled' }
          )
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('cancelar')
      .setDescription('Cancelar um anúncio agendado')
      .addStringOption(option =>
        option
          .setName('id')
          .setDescription('ID do anúncio')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('broadcast')
      .setDescription('Enviar DM para todos os membros (use com cuidado!)')
      .addStringOption(option =>
        option
          .setName('titulo')
          .setDescription('Título da mensagem')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('conteudo')
          .setDescription('Conteúdo da mensagem')
          .setRequired(true)
      )
      .addRoleOption(option =>
        option
          .setName('role_alvo')
          .setDescription('Enviar apenas para membros com esta role (deixe vazio para todos)')
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case 'criar':
      await handleCreateAnnouncement(interaction);
      break;
    case 'agendar':
      await handleScheduleAnnouncement(interaction);
      break;
    case 'listar':
      await handleListAnnouncements(interaction);
      break;
    case 'cancelar':
      await handleCancelAnnouncement(interaction);
      break;
    case 'broadcast':
      await handleBroadcast(interaction);
      break;
  }
}

async function handleCreateAnnouncement(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const title = interaction.options.getString('titulo', true);
  const content = interaction.options.getString('conteudo', true);
  const channel = interaction.options.getChannel('canal', true);
  const role = interaction.options.getRole('mencionar_role');
  const color = interaction.options.getString('cor') || '#5865F2';
  const imageUrl = interaction.options.getString('imagem');

  try {
    const announcement = await createAnnouncement(
      interaction.guildId!,
      interaction.user.id,
      {
        title,
        content,
        channel_id: channel.id,
        target_role_id: role?.id,
        color,
        image_url: imageUrl || undefined
      }
    );

    // Enviar imediatamente
    await sendAnnouncement(announcement.id, interaction.guild!);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Anúncio Criado e Enviado!')
      .setDescription(`O anúncio foi enviado em ${channel}`)
      .addFields(
        { name: 'Título', value: title, inline: false },
        { name: 'Canal', value: channel.toString(), inline: true },
        { name: 'ID', value: announcement.id, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao criar anúncio.'}`
    });
  }
}

async function handleScheduleAnnouncement(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const title = interaction.options.getString('titulo', true);
  const content = interaction.options.getString('conteudo', true);
  const channel = interaction.options.getChannel('canal', true);
  const dateTimeStr = interaction.options.getString('data_hora', true);
  const role = interaction.options.getRole('mencionar_role');

  try {
    // Parse data e hora
    const [dateStr, timeStr] = dateTimeStr.split(' ');
    const [day, month, year] = dateStr.split('/').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    const scheduledDate = new Date(year, month - 1, day, hour, minute);

    if (scheduledDate <= new Date()) {
      await interaction.editReply({
        content: '❌ A data e hora devem ser no futuro!'
      });
      return;
    }

    const announcement = await createAnnouncement(
      interaction.guildId!,
      interaction.user.id,
      {
        title,
        content,
        channel_id: channel.id,
        target_role_id: role?.id,
        scheduled_for: scheduledDate
      }
    );

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('⏰ Anúncio Agendado!')
      .setDescription(`O anúncio será enviado automaticamente na data e hora especificadas.`)
      .addFields(
        { name: 'Título', value: title, inline: false },
        { name: 'Canal', value: channel.toString(), inline: true },
        { name: 'Data/Hora', value: scheduledDate.toLocaleString('pt-BR'), inline: true },
        { name: 'ID', value: announcement.id, inline: true }
      )
      .setFooter({ text: 'Use /anuncio cancelar para cancelar este agendamento' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao agendar anúncio. Verifique o formato da data (DD/MM/YYYY HH:MM).'}`
    });
  }
}

async function handleListAnnouncements(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const statusFilter = interaction.options.getString('status') as AnnouncementStatus | null;

  try {
    const announcements = await listAnnouncements(interaction.guildId!, statusFilter || undefined);

    if (announcements.length === 0) {
      await interaction.editReply('Nenhum anúncio encontrado.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📢 Anúncios ${statusFilter ? `- ${statusFilter.toUpperCase()}` : ''}`)
      .setDescription(`Total: **${announcements.length}** anúncios`)
      .setTimestamp();

    // Mostrar primeiros 10
    const toShow = announcements.slice(0, 10);
    for (const announcement of toShow) {
      const statusEmoji = announcement.status === AnnouncementStatus.SENT ? '✅' : 
                         announcement.status === AnnouncementStatus.SCHEDULED ? '⏰' :
                         announcement.status === AnnouncementStatus.CANCELLED ? '❌' : '📝';

      embed.addFields({
        name: `${statusEmoji} ${announcement.title}`,
        value: 
          `**ID:** \`${announcement.id.slice(0, 8)}\`\n` +
          `**Status:** ${announcement.status}\n` +
          `**Canal:** <#${announcement.channel_id}>\n` +
          `**Criado:** <t:${Math.floor(new Date(announcement.created_at).getTime() / 1000)}:R>` +
          (announcement.scheduled_for ? `\n**Agendado para:** <t:${Math.floor(new Date(announcement.scheduled_for).getTime() / 1000)}:F>` : ''),
        inline: false
      });
    }

    if (announcements.length > 10) {
      embed.setFooter({ text: `Mostrando 10 de ${announcements.length} anúncios` });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao listar anúncios.'}`
    });
  }
}

async function handleCancelAnnouncement(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const announcementId = interaction.options.getString('id', true);

  try {
    await cancelAnnouncement(announcementId);

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('❌ Anúncio Cancelado')
      .setDescription(`O anúncio \`${announcementId.slice(0, 8)}\` foi cancelado com sucesso.`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao cancelar anúncio. Verifique se o ID está correto e se o anúncio está agendado.'}`
    });
  }
}

async function handleBroadcast(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const title = interaction.options.getString('titulo', true);
  const content = interaction.options.getString('conteudo', true);
  const targetRole = interaction.options.getRole('role_alvo');

  // Confirmação
  const confirmEmbed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('⚠️ Confirmação de Broadcast')
    .setDescription(
      `Você está prestes a enviar uma mensagem DM para ${targetRole ? `todos os membros com a role ${targetRole}` : 'TODOS os membros do servidor'}.\n\n` +
      `**Título:** ${title}\n` +
      `**Conteúdo:** ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}\n\n` +
      `**⚠️ ATENÇÃO:** Esta ação não pode ser desfeita e pode resultar em muitos membros bloqueando o bot!`
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_broadcast_${interaction.id}`)
        .setLabel('Confirmar Envio')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId(`cancel_broadcast_${interaction.id}`)
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❌')
    );

  await interaction.editReply({
    embeds: [confirmEmbed],
    components: [row]
  });

  // Nota: O handler do botão será implementado no interactionCreate
}
