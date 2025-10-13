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
  .setName('painel')
  .setDescription('🎛️ Painel de gerenciamento interativo do servidor')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId!;
  const config = await getOrCreateGuildConfig(guildId);
  const ticketStats = await getTicketStats(guildId);

  // Buscar estatísticas de vendas
  const { supabase } = await import('../utils/supabase');
  const { data: salesData } = await supabase
    .from('transactions')
    .select('amount, status')
    .eq('guild_id', guildId)
    .eq('status', 'completed');

  const totalSales = salesData?.reduce((sum, t) => sum + t.amount, 0) || 0;
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
    .setThumbnail(interaction.guild!.iconURL() || '')
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
