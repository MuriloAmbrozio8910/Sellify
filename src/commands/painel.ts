/**
 * Comando: /painel
 * Painel de gerenciamento interativo moderno
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
import { COLORS, EMOJIS, formatters, DIVIDERS } from '../utils/designSystem';

export const data = new SlashCommandBuilder()
  .setName('painel')
  .setDescription('🎛️ Painel de gerenciamento interativo do servidor')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ flags: 64 }); // 64 = Ephemeral

    const guildId = interaction.guildId!;
    const config = await getOrCreateGuildConfig(guildId);
    const ticketStats = await getTicketStats(guildId);

    // Buscar estatísticas de vendas
    const { supabase } = await import('../utils/supabase');
    const { data: salesData, error: salesError } = await supabase
      .from('transactions')
      .select('amount, status')
      .eq('guild_id', guildId)
      .eq('status', 'completed');

    if (salesError) {
      console.error('Erro ao buscar vendas:', salesError);
    }

    const totalSales = salesData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const salesCount = salesData?.length || 0;

    // Buscar produtos ativos
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('guild_id', guildId)
      .eq('is_active', true);

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError);
    }

    const productsCount = productsData?.length || 0;

    const { formatCurrency } = await import('../utils/payments');

    // Calcular estatísticas
    const onlineMembers = interaction.guild!.members.cache.filter(m => m.presence?.status !== 'offline').size;
    const botMembers = interaction.guild!.members.cache.filter(m => m.user.bot).size;
    const humanMembers = interaction.guild!.memberCount - botMembers;

    // Embed principal moderno e elegante
    const embed = new EmbedBuilder()
      .setColor(COLORS.PRIMARY)
      .setAuthor({ 
        name: `Painel de Gerenciamento • ${interaction.guild!.name}`,
        iconURL: interaction.guild!.iconURL() || undefined
      })
      .setTitle(`${EMOJIS.SPARKLES} Bem-vindo, ${interaction.user.username}!`)
      .setDescription(
        `${EMOJIS.INFO} **Central de Controle do Sellify**\n` +
        `Gerencie todos os aspectos do seu servidor de forma intuitiva e profissional.\n\n` +
        `${DIVIDERS.THIN}`
      )
      .addFields(
        {
          name: `${EMOJIS.STATS} Estatísticas em Tempo Real`,
          value: '\u200b',
          inline: false
        },
        {
          name: `${EMOJIS.USER} Comunidade`,
          value: 
            `**${formatters.number(humanMembers)}** membros\n` +
            `${EMOJIS.SUCCESS} **${formatters.number(onlineMembers)}** online\n` +
            `${EMOJIS.ROBOT} **${formatters.number(botMembers)}** bots`,
          inline: true
        },
        {
          name: `${EMOJIS.MONEY} Vendas`,
          value:
            `**${formatCurrency(totalSales, config.currency)}** receita\n` +
            `${EMOJIS.CHART} **${formatters.number(salesCount)}** transações\n` +
            `${EMOJIS.PRODUCTS} **${formatters.number(productsCount)}** produtos`,
          inline: true
        },
        {
          name: `${EMOJIS.SUPPORT} Suporte`,
          value:
            `${EMOJIS.PENDING} **${ticketStats?.open || 0}** abertos\n` +
            `${EMOJIS.LOADING} **${ticketStats?.claimed || 0}** em atendimento\n` +
            `${EMOJIS.DONE} **${ticketStats?.closed || 0}** resolvidos`,
          inline: true
        },
        {
          name: '\u200b',
          value: `${DIVIDERS.THIN}\n${EMOJIS.ROCKET} **Acesso Rápido às Funcionalidades**`,
          inline: false
        }
      )
      .setThumbnail(interaction.guild!.iconURL())
      .setFooter({ 
        text: `Sistema Sellify v2.0 • Última atualização`,
        iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' // Placeholder
      })
      .setTimestamp();

    // Linha 1: Gestão de Vendas
    const row1 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_products')
          .setLabel('Produtos')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(EMOJIS.PRODUCTS),
        new ButtonBuilder()
          .setCustomId('panel_sales')
          .setLabel('Vendas')
          .setStyle(ButtonStyle.Success)
          .setEmoji(EMOJIS.SALES),
        new ButtonBuilder()
          .setCustomId('panel_coupons')
          .setLabel('Cupons')
          .setStyle(ButtonStyle.Success)
          .setEmoji(EMOJIS.COUPONS),
        new ButtonBuilder()
          .setCustomId('panel_reviews')
          .setLabel('Avaliações')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(EMOJIS.REVIEWS)
      );

    // Linha 2: Suporte e Comunicação
    const row2 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_tickets')
          .setLabel('Tickets')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(EMOJIS.TICKETS),
        new ButtonBuilder()
          .setCustomId('panel_announcements')
          .setLabel('Anúncios')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(EMOJIS.ANNOUNCEMENT),
        new ButtonBuilder()
          .setCustomId('panel_automations')
          .setLabel('Automação')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(EMOJIS.ROBOT),
        new ButtonBuilder()
          .setCustomId('panel_ai')
          .setLabel('IA & Assistente')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(EMOJIS.AI)
      );

    // Linha 3: Análise e Ferramentas
    const row3 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_stats')
          .setLabel('Estatísticas')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(EMOJIS.STATS),
        new ButtonBuilder()
          .setCustomId('panel_logs')
          .setLabel('Logs')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(EMOJIS.LOG),
        new ButtonBuilder()
          .setCustomId('panel_settings')
          .setLabel('Configurações')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(EMOJIS.SETTINGS),
        new ButtonBuilder()
          .setCustomId('panel_customization')
          .setLabel('Personalização')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🎨')
      );

    // Linha 4: Ações Rápidas
    const row4 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('panel_refresh')
          .setLabel('Atualizar Painel')
          .setStyle(ButtonStyle.Success)
          .setEmoji(EMOJIS.REFRESH)
      );

    await interaction.editReply({
      embeds: [embed],
      components: [row1, row2, row3, row4]
    });
  } catch (error) {
    console.error('Erro no comando painel:', error);
    
    const errorEmbed = new EmbedBuilder()
      .setColor(COLORS.DANGER)
      .setTitle(`${EMOJIS.ERROR} Erro ao Carregar Painel`)
      .setDescription(
        `Ocorreu um erro ao carregar o painel de gerenciamento.\n\n` +
        `${EMOJIS.INFO} **O que fazer:**\n` +
        `• Aguarde alguns segundos e tente novamente\n` +
        `• Verifique se o bot tem as permissões necessárias\n` +
        `• Entre em contato com o suporte se o erro persistir`
      )
      .setFooter({ text: 'Sistema Sellify v2.0' })
      .setTimestamp();
    
    if (interaction.deferred) {
      await interaction.editReply({ embeds: [errorEmbed], components: [] });
    } else {
      await interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
  }
}
