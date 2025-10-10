/**
 * Comando: /panel
 * Painel de gerenciamento interativo com botões e formulários
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} from 'discord.js';
import { getTicketStats } from '../utils/ticketManager';
import { getOrCreateGuildConfig } from '../utils/supabase';

export const data = new SlashCommandBuilder()
  .setName('panel')
  .setDescription('🎛️ Painel de gerenciamento interativo do servidor')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId!;
  const config = await getOrCreateGuildConfig(guildId);
  const ticketStats = await getTicketStats(guildId);

  // Embed principal do painel
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
          `🎨 **Cor dos Embeds:** ${config.embed_color}\n` +
          `💳 **Stripe:** ${config.stripe_enabled ? '✅' : '❌'}\n` +
          `💚 **Mercado Pago:** ${config.mercadopago_enabled ? '✅' : '❌'}`,
        inline: true
      },
      {
        name: '📝 Ações Rápidas',
        value: 'Use os botões abaixo para acessar diferentes painéis.',
        inline: false
      }
    )
    .setFooter({ text: `Painel do ${interaction.guild!.name}`, iconURL: interaction.guild!.iconURL() || undefined })
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

  await interaction.editReply({
    embeds: [embed],
    components: [row1, row2, row3]
  });
}
