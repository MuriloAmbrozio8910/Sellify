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
import { showCreateAnnouncementModal } from '../modals/announcementModal';

export const data = new SlashCommandBuilder()
  .setName('anuncio')
  .setDescription('📢 Sistema de anúncios e notificações')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(subcommand =>
    subcommand
      .setName('criar')
      .setDescription('Criar um novo anúncio')
      .addChannelOption(option =>
        option
          .setName('canal')
          .setDescription('Canal onde o anúncio será enviado')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
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
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('setup')
      .setDescription('🎨 Personalizar aparência dos anúncios')
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
    case 'setup':
      await handleSetupAnnouncement(interaction);
      break;
  }
}

async function handleCreateAnnouncement(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel('canal', true);
  await showCreateAnnouncementModal(interaction, channel.id);
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

async function handleSetupAnnouncement(interaction: ChatInputCommandInteraction) {
  // Verificar permissão
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '❌ Apenas administradores podem personalizar anúncios.',
      ephemeral: true
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor('#E74C3C')
    .setTitle('🎨 Painel de Personalização - Anúncios')
    .setDescription(
      'Personalize completamente a aparência dos seus anúncios.\n\n' +
      '**Use os botões abaixo para customizar:**'
    )
    .addFields(
      { name: '🎨 Visual', value: 'Título, descrição, cores, imagens', inline: true },
      { name: '👤 Autor', value: 'Definir autor do anúncio', inline: true },
      { name: '🏷️ Campos', value: 'Adicionar campos informativos', inline: true },
      { name: '📝 Rodapé', value: 'Personalizar rodapé', inline: true },
      { name: '🖼️ Imagens', value: 'Banner e thumbnail', inline: true },
      { name: '📢 Variáveis', value: '{user}, {date}, {server}', inline: true }
    )
    .setFooter({ text: 'Sistema de Personalização Dinâmica' })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('customize_announcement_title')
        .setLabel('Título')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝'),
      new ButtonBuilder()
        .setCustomId('customize_announcement_description')
        .setLabel('Descrição')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📄'),
      new ButtonBuilder()
        .setCustomId('customize_announcement_color')
        .setLabel('Cor')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎨')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('customize_announcement_author')
        .setLabel('Autor')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('👤'),
      new ButtonBuilder()
        .setCustomId('customize_announcement_fields')
        .setLabel('Campos')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🏷️'),
      new ButtonBuilder()
        .setCustomId('customize_announcement_footer')
        .setLabel('Rodapé')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📝')
    );

  const row3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('customize_announcement_image')
        .setLabel('Imagem')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🖼️'),
      new ButtonBuilder()
        .setCustomId('customize_announcement_thumbnail')
        .setLabel('Thumbnail')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🔳')
    );

  const row4 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('customize_announcement_preview')
        .setLabel('👁️ Pré-visualizar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('customize_announcement_save')
        .setLabel('💾 Salvar Tudo')
        .setStyle(ButtonStyle.Success)
    );

  await interaction.reply({
    embeds: [embed],
    components: [row1, row2, row3, row4],
    ephemeral: true
  });
}
