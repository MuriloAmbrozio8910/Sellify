/**
 * Comando: /avaliar
 * Permite usuários avaliarem produtos e vendedores
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('avaliar')
  .setDescription('⭐ Avaliar produtos ou vendedores')
  .addSubcommand(subcommand =>
    subcommand
      .setName('produto')
      .setDescription('Avaliar um produto que você comprou')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('vendedor')
      .setDescription('Avaliar um vendedor/atendente')
      .addUserOption(option =>
        option
          .setName('usuario')
          .setDescription('Vendedor que deseja avaliar')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('categoria')
          .setDescription('Categoria do atendimento')
          .addChoices(
            { name: '🎫 Suporte', value: 'support' },
            { name: '💰 Vendas', value: 'sales' },
            { name: '📝 Geral', value: 'general' }
          )
          .setRequired(true)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'produto') {
    await handleRateProduct(interaction);
  } else if (subcommand === 'vendedor') {
    await handleRateSeller(interaction);
  }
}

/**
 * Avaliar produto
 */
async function handleRateProduct(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ flags: 64 });

  // Buscar produtos que o usuário comprou
  const { data: purchases } = await supabase
    .from('transactions')
    .select('id, product_id, products(name, image_url)')
    .eq('guild_id', interaction.guildId!)
    .eq('user_id', interaction.user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10);

  if (!purchases || purchases.length === 0) {
    await interaction.editReply({
      content: '❌ Você ainda não comprou nenhum produto neste servidor.'
    });
    return;
  }

  // Verificar quais já foram avaliados
  const { data: existingReviews } = await supabase
    .from('product_reviews')
    .select('transaction_id')
    .eq('user_id', interaction.user.id)
    .eq('guild_id', interaction.guildId!);

  const reviewedIds = new Set(existingReviews?.map(r => r.transaction_id) || []);
  const unreviewed = purchases.filter(p => !reviewedIds.has(p.id));

  if (unreviewed.length === 0) {
    await interaction.editReply({
      content: '✅ Você já avaliou todos os seus produtos! Obrigado pelo feedback.'
    });
    return;
  }

  // Criar menu de seleção
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_product_to_review')
    .setPlaceholder('Selecione um produto para avaliar')
    .addOptions(
      unreviewed.slice(0, 25).map(purchase => {
        const product = purchase.products as any;
        return new StringSelectMenuOptionBuilder()
          .setLabel(product?.name || 'Produto')
          .setDescription('Clique para avaliar')
          .setValue(`${purchase.product_id}|${purchase.id}`)
          .setEmoji('⭐');
      })
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(selectMenu);

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('⭐ Avaliar Produto')
    .setDescription(
      `Você tem **${unreviewed.length} produto(s)** para avaliar.\n\n` +
      `Selecione um produto abaixo para deixar sua avaliação.`
    )
    .setFooter({ text: 'Sua opinião é muito importante!' });

  await interaction.editReply({
    embeds: [embed],
    components: [row]
  });
}

/**
 * Avaliar vendedor
 */
async function handleRateSeller(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ flags: 64 });

  const seller = interaction.options.getUser('usuario', true);
  const category = interaction.options.getString('categoria', true);

  if (seller.id === interaction.user.id) {
    await interaction.editReply({
      content: '❌ Você não pode avaliar a si mesmo.'
    });
    return;
  }

  if (seller.bot) {
    await interaction.editReply({
      content: '❌ Você não pode avaliar bots.'
    });
    return;
  }

  // Verificar se já avaliou este vendedor recentemente
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const { data: recentReview } = await supabase
    .from('seller_reviews')
    .select('id')
    .eq('guild_id', interaction.guildId!)
    .eq('seller_id', seller.id)
    .eq('reviewer_id', interaction.user.id)
    .gte('created_at', oneDayAgo.toISOString())
    .single();

  if (recentReview) {
    await interaction.editReply({
      content: '⏳ Você já avaliou este vendedor recentemente. Aguarde 24 horas para avaliar novamente.'
    });
    return;
  }

  // Criar modal de avaliação
  const { showReviewSellerModal } = await import('../events/reviewHandlers');
  const modal = showReviewSellerModal(seller.id, category);
  await interaction.showModal(modal);
}
