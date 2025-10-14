/**
 * Modal para criar anúncios
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  ChannelType,
  TextChannel
} from 'discord.js';
import { createAnnouncement, sendAnnouncement } from '../utils/announcementManager';
import { logger } from '../utils/logger';

const CREATE_ANNOUNCEMENT_MODAL_ID = 'create_announcement_modal';

type AnnouncementTriggerInteraction = ChatInputCommandInteraction | ButtonInteraction;

interface AnnouncementPayload {
  title: string;
  content: string;
  channelId: string;
  color?: string;
  imageUrl?: string;
  roleId?: string;
}

function buildAnnouncementModal(channelId: string): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId(`${CREATE_ANNOUNCEMENT_MODAL_ID}_${channelId}`)
    .setTitle('📢 Criar Anúncio');

  const titleInput = new TextInputBuilder()
    .setCustomId('announcement_title')
    .setLabel('Título do Anúncio')
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Novidades desta semana!')
    .setMaxLength(100);

  const contentInput = new TextInputBuilder()
    .setCustomId('announcement_content')
    .setLabel('Conteúdo')
    .setRequired(true)
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Escreva o conteúdo do anúncio...')
    .setMaxLength(2000);

  const colorInput = new TextInputBuilder()
    .setCustomId('announcement_color')
    .setLabel('Cor do embed (opcional, ex: #5865F2)')
    .setRequired(false)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('#5865F2')
    .setMaxLength(7);

  const imageInput = new TextInputBuilder()
    .setCustomId('announcement_image')
    .setLabel('URL da Imagem (opcional)')
    .setRequired(false)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://exemplo.com/imagem.png')
    .setMaxLength(200);

  const roleInput = new TextInputBuilder()
    .setCustomId('announcement_role')
    .setLabel('Role para mencionar (opcional)')
    .setRequired(false)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: @everyone ou ID da role')
    .setMaxLength(50);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(roleInput)
  );

  return modal;
}

function parseAnnouncementPayload(
  interaction: ModalSubmitInteraction
): AnnouncementPayload | { error: string } {
  const title = interaction.fields.getTextInputValue('announcement_title').trim();
  const content = interaction.fields.getTextInputValue('announcement_content').trim();
  const colorRaw = interaction.fields.getTextInputValue('announcement_color')?.trim();
  const imageUrl = interaction.fields.getTextInputValue('announcement_image')?.trim();
  const roleRaw = interaction.fields.getTextInputValue('announcement_role')?.trim();

  // Extract channel ID from custom ID
  const channelId = interaction.customId.replace(`${CREATE_ANNOUNCEMENT_MODAL_ID}_`, '');

  let color: string | undefined;
  if (colorRaw) {
    if (!/^#[0-9A-F]{6}$/i.test(colorRaw)) {
      return { error: '❌ Cor inválida. Use o formato hexadecimal: #RRGGBB (ex: #5865F2)' };
    }
    color = colorRaw;
  }

  let roleId: string | undefined;
  if (roleRaw) {
    if (roleRaw.toLowerCase() === '@everyone' || roleRaw === 'everyone') {
      roleId = interaction.guildId!;
    } else {
      const mentionMatch = roleRaw.match(/^<@&(\d+)>$/);
      if (mentionMatch) {
        roleId = mentionMatch[1];
      } else if (/^\d+$/.test(roleRaw)) {
        roleId = roleRaw;
      } else {
        return { error: '❌ Role inválida. Use @everyone, mencione a role ou forneça o ID numérico.' };
      }
    }
  }

  return {
    title,
    content,
    channelId,
    color,
    imageUrl: imageUrl || undefined,
    roleId
  };
}

export async function showCreateAnnouncementModal(
  interaction: AnnouncementTriggerInteraction,
  channelId: string
) {
  const modal = buildAnnouncementModal(channelId);
  await interaction.showModal(modal);
}

export async function handleCreateAnnouncementModalSubmit(interaction: ModalSubmitInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({ content: '❌ Esta ação só pode ser usada em um servidor.', flags: 64 });
    return;
  }

  const payload = parseAnnouncementPayload(interaction);
  if ('error' in payload) {
    await interaction.reply({ content: payload.error, flags: 64 });
    return;
  }

  await interaction.deferReply({ flags: 64 });

  try {
    // Validate channel
    const channel = await interaction.guild!.channels.fetch(payload.channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.editReply({ content: '❌ Canal inválido ou não é um canal de texto.' });
      return;
    }

    // Create announcement
    const announcement = await createAnnouncement(
      interaction.guildId,
      interaction.user.id,
      {
        title: payload.title,
        content: payload.content,
        channel_id: payload.channelId,
        target_role_id: payload.roleId,
        color: payload.color || '#5865F2',
        image_url: payload.imageUrl
      }
    );

    // Send immediately
    await sendAnnouncement(announcement.id, interaction.guild!);

    logger.success(`Anúncio criado e enviado: ${announcement.title}`);

    // Limitar título para evitar erro do Discord (limite de 1024 chars para value)
    const titlePreview = payload.title.length > 1000 
      ? payload.title.substring(0, 997) + '...' 
      : payload.title;

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Anúncio enviado!')
      .addFields(
        { name: 'Título', value: titlePreview, inline: false },
        { name: 'Canal', value: `<#${payload.channelId}>`, inline: true },
        { name: 'ID', value: announcement.id.slice(0, 8), inline: true }
      )
      .setTimestamp();

    if (payload.roleId) {
      const roleMention = payload.roleId === interaction.guildId ? '@everyone' : `<@&${payload.roleId}>`;
      embed.addFields({ name: 'Mencionou', value: roleMention, inline: true });
    }

    const actionsRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`announcement_create_another_${payload.channelId}`)
          .setLabel('Criar outro')
          .setStyle(ButtonStyle.Success)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('announcement_list')
          .setLabel('Listar anúncios')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📋')
      );

    await interaction.editReply({ embeds: [embed], components: [actionsRow] });
  } catch (error) {
    logger.error(`Erro ao criar anúncio: ${error}`);
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    await interaction.editReply({ content: `❌ Erro ao criar anúncio: ${message}` });
  }
}

export async function handleAnnouncementActionButton(interaction: ButtonInteraction) {
  const { customId } = interaction;

  if (customId.startsWith('announcement_create_another_')) {
    const channelId = customId.replace('announcement_create_another_', '');
    await showCreateAnnouncementModal(interaction, channelId);
    return;
  }

  if (customId === 'announcement_list') {
    await interaction.deferReply({ flags: 64 });

    try {
      const { listAnnouncements } = await import('../utils/announcementManager');
      const announcements = await listAnnouncements(interaction.guildId!);

      if (announcements.length === 0) {
        await interaction.editReply({ content: '📢 Nenhum anúncio encontrado.' });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📢 Anúncios do Servidor')
        .setDescription(`Total: **${announcements.length}** anúncios`)
        .setTimestamp();

      for (const announcement of announcements.slice(0, 5)) {
        const statusEmoji = announcement.status === 'sent' ? '✅' : 
                           announcement.status === 'scheduled' ? '⏰' :
                           announcement.status === 'cancelled' ? '❌' : '📝';

        // Limitar título para evitar erro do Discord (limite de 256 chars para name)
        const titlePreview = announcement.title.length > 200 
          ? announcement.title.substring(0, 197) + '...' 
          : announcement.title;

        embed.addFields({
          name: `${statusEmoji} ${titlePreview}`,
          value: `**Status:** ${announcement.status}\n**Canal:** <#${announcement.channel_id}>\n**ID:** \`${announcement.id.slice(0, 8)}\``,
          inline: false
        });
      }

      if (announcements.length > 5) {
        embed.setFooter({ text: `Mostrando 5 de ${announcements.length} anúncios` });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido.';
      await interaction.editReply({ content: `❌ Erro ao listar anúncios: ${message}` });
    }

    return;
  }
}
