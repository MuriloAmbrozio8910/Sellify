/**
 * Handlers para o sistema de avaliações
 */

import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

/**
 * Painel principal de avaliações
 */
export async function handleReviewsPanel(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  const { data: productReviews } = await supabase
    .from('product_reviews')
    .select('*, products(name)')
    .eq('guild_id', interaction.guildId!)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: sellerReviews } = await supabase
    .from('seller_reviews')
    .select('*')
    .eq('guild_id', interaction.guildId!)
    .order('created_at', { ascending: false })
    .limit(5);

  // Estatísticas gerais
  const { data: productStats } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('guild_id', interaction.guildId!);

  const { data: sellerStats } = await supabase
    .from('seller_reviews')
    .select('rating')
    .eq('guild_id', interaction.guildId!);

  const avgProductRating = productStats && productStats.length > 0
    ? (productStats.reduce((sum, r) => sum + r.rating, 0) / productStats.length).toFixed(1)
    : '0.0';

  const avgSellerRating = sellerStats && sellerStats.length > 0
    ? (sellerStats.reduce((sum, r) => sum + r.rating, 0) / sellerStats.length).toFixed(1)
    : '0.0';

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('⭐ Painel de Avaliações')
    .setDescription(
      `**Sistema de feedback e qualidade**\n\n` +
      `Gerencie as avaliações de produtos e atendimento do seu servidor.`
    )
    .addFields(
      {
        name: '📊 Estatísticas Gerais',
        value:
          `🛍️ **Produtos:** ${productStats?.length || 0} avaliações (★ ${avgProductRating})\n` +
          `👤 **Vendedores:** ${sellerStats?.length || 0} avaliações (★ ${avgSellerRating})`,
        inline: false
      },
      {
        name: '🆕 Últimas Avaliações de Produtos',
        value: productReviews && productReviews.length > 0
          ? productReviews.slice(0, 3).map(r => {
              const stars = '⭐'.repeat(r.rating);
              const productName = (r.products as any)?.name || 'Produto';
              return `${stars} **${productName}**\n"${r.comment?.substring(0, 50) || 'Sem comentário'}..."`;
            }).join('\n\n')
          : '`Nenhuma avaliação ainda`',
        inline: true
      },
      {
        name: '🆕 Últimas Avaliações de Atendimento',
        value: sellerReviews && sellerReviews.length > 0
          ? sellerReviews.slice(0, 3).map(r => {
              const stars = '⭐'.repeat(r.rating);
              return `${stars} <@${r.seller_id}>\n"${r.comment?.substring(0, 50) || 'Sem comentário'}..."`;
            }).join('\n\n')
          : '`Nenhuma avaliação ainda`',
        inline: true
      }
    )
    .setFooter({ text: 'Avaliações ajudam a melhorar o serviço' })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('reviews_products')
        .setLabel('Produtos')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🛍️'),
      new ButtonBuilder()
        .setCustomId('reviews_sellers')
        .setLabel('Vendedores')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👤'),
      new ButtonBuilder()
        .setCustomId('reviews_pending')
        .setLabel('Pendentes')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⏳')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('reviews_top_products')
        .setLabel('Top Produtos')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🏆'),
      new ButtonBuilder()
        .setCustomId('reviews_top_sellers')
        .setLabel('Top Vendedores')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🌟'),
      new ButtonBuilder()
        .setCustomId('panel_main')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row1, row2]
  });
}

/**
 * Ver avaliações de produtos
 */
export async function handleProductReviews(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('*, products(name, image_url)')
    .eq('guild_id', interaction.guildId!)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(10);

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('🛍️ Avaliações de Produtos')
    .setDescription('Veja o que os clientes estão dizendo sobre seus produtos');

  if (!reviews || reviews.length === 0) {
    embed.addFields({
      name: '📭 Nenhuma avaliação',
      value: 'Ainda não há avaliações de produtos.'
    });
  } else {
    for (const review of reviews.slice(0, 5)) {
      const stars = '⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
      const product = review.products as any;
      const userName = review.is_anonymous ? '👤 Anônimo' : `<@${review.user_id}>`;

      embed.addFields({
        name: `${stars} ${product?.name || 'Produto'}`,
        value:
          `**Por:** ${userName}\n` +
          `**Comentário:** ${review.comment || '*Sem comentário*'}\n` +
          `**Data:** <t:${Math.floor(new Date(review.created_at).getTime() / 1000)}:R>`,
        inline: false
      });
    }

    if (reviews.length > 5) {
      embed.setFooter({ text: `Mostrando 5 de ${reviews.length} avaliações` });
    }
  }

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_reviews')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row]
  });
}

/**
 * Ver avaliações de vendedores
 */
export async function handleSellerReviews(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  const { data: reviews } = await supabase
    .from('seller_reviews')
    .select('*')
    .eq('guild_id', interaction.guildId!)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(10);

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('👤 Avaliações de Vendedores')
    .setDescription('Feedback sobre o atendimento da equipe');

  if (!reviews || reviews.length === 0) {
    embed.addFields({
      name: '📭 Nenhuma avaliação',
      value: 'Ainda não há avaliações de vendedores.'
    });
  } else {
    for (const review of reviews.slice(0, 5)) {
      const stars = '⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
      const reviewerName = review.is_anonymous ? '👤 Anônimo' : `<@${review.reviewer_id}>`;
      const categoryEmoji = review.category === 'support' ? '🎫' : review.category === 'sales' ? '💰' : '📝';

      embed.addFields({
        name: `${stars} ${categoryEmoji} <@${review.seller_id}>`,
        value:
          `**Avaliado por:** ${reviewerName}\n` +
          `**Comentário:** ${review.comment || '*Sem comentário*'}\n` +
          `**Data:** <t:${Math.floor(new Date(review.created_at).getTime() / 1000)}:R>`,
        inline: false
      });
    }

    if (reviews.length > 5) {
      embed.setFooter({ text: `Mostrando 5 de ${reviews.length} avaliações` });
    }
  }

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_reviews')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row]
  });
}

/**
 * Top produtos mais bem avaliados
 */
export async function handleTopProducts(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  const { data: topProducts } = await supabase
    .rpc('get_top_rated_products', { p_guild_id: interaction.guildId! })
    .limit(10);

  // Fallback caso a RPC não exista
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('product_id, rating, products(name, image_url)')
    .eq('guild_id', interaction.guildId!)
    .eq('is_approved', true);

  const productRatings: any = {};
  if (reviews) {
    reviews.forEach(r => {
      if (!productRatings[r.product_id]) {
        productRatings[r.product_id] = {
          product: r.products,
          ratings: [],
          total: 0,
          count: 0
        };
      }
      productRatings[r.product_id].ratings.push(r.rating);
      productRatings[r.product_id].total += r.rating;
      productRatings[r.product_id].count++;
    });
  }

  const sorted = Object.entries(productRatings)
    .map(([id, data]: [string, any]) => ({
      id,
      name: data.product?.name || 'Produto',
      average: data.total / data.count,
      count: data.count
    }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 10);

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🏆 Top 10 Produtos Mais Bem Avaliados')
    .setDescription('Os produtos com melhor avaliação dos clientes');

  if (sorted.length === 0) {
    embed.addFields({
      name: '📭 Sem dados',
      value: 'Ainda não há avaliações suficientes.'
    });
  } else {
    sorted.forEach((product, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const stars = '⭐'.repeat(Math.round(product.average));

      embed.addFields({
        name: `${medal} ${product.name}`,
        value: `${stars} **${product.average.toFixed(1)}** / 5.0 (${product.count} avaliações)`,
        inline: true
      });
    });
  }

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_reviews')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row]
  });
}

/**
 * Top vendedores mais bem avaliados
 */
export async function handleTopSellers(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  const { data: reviews } = await supabase
    .from('seller_reviews')
    .select('seller_id, rating')
    .eq('guild_id', interaction.guildId!)
    .eq('is_approved', true);

  const sellerRatings: any = {};
  if (reviews) {
    reviews.forEach(r => {
      if (!sellerRatings[r.seller_id]) {
        sellerRatings[r.seller_id] = { total: 0, count: 0 };
      }
      sellerRatings[r.seller_id].total += r.rating;
      sellerRatings[r.seller_id].count++;
    });
  }

  const sorted = Object.entries(sellerRatings)
    .map(([id, data]: [string, any]) => ({
      id,
      average: data.total / data.count,
      count: data.count
    }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 10);

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🌟 Top 10 Vendedores Mais Bem Avaliados')
    .setDescription('Membros com melhor avaliação no atendimento');

  if (sorted.length === 0) {
    embed.addFields({
      name: '📭 Sem dados',
      value: 'Ainda não há avaliações suficientes.'
    });
  } else {
    sorted.forEach((seller, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const stars = '⭐'.repeat(Math.round(seller.average));

      embed.addFields({
        name: `${medal} <@${seller.id}>`,
        value: `${stars} **${seller.average.toFixed(1)}** / 5.0 (${seller.count} avaliações)`,
        inline: true
      });
    });
  }

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('panel_reviews')
        .setLabel('◀️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    embeds: [embed],
    components: [row]
  });
}

/**
 * Modal para avaliar produto
 */
export function showReviewProductModal(interaction: any, productId: string, transactionId: string) {
  const modal = new ModalBuilder()
    .setCustomId(`review_product_modal_${productId}_${transactionId}`)
    .setTitle('⭐ Avaliar Produto');

  const ratingInput = new TextInputBuilder()
    .setCustomId('rating')
    .setLabel('Nota (1 a 5 estrelas)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('5')
    .setRequired(true)
    .setMinLength(1)
    .setMaxLength(1);

  const commentInput = new TextInputBuilder()
    .setCustomId('comment')
    .setLabel('Comentário (opcional)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('O que você achou do produto?')
    .setRequired(false)
    .setMaxLength(500);

  const anonymousInput = new TextInputBuilder()
    .setCustomId('anonymous')
    .setLabel('Avaliação anônima? (sim/nao)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('nao')
    .setRequired(false)
    .setValue('nao');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(ratingInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(commentInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(anonymousInput)
  );

  return modal;
}

/**
 * Modal para avaliar vendedor
 */
export function showReviewSellerModal(sellerId: string, category: string) {
  const modal = new ModalBuilder()
    .setCustomId(`review_seller_modal_${sellerId}_${category}`)
    .setTitle('⭐ Avaliar Vendedor');

  const ratingInput = new TextInputBuilder()
    .setCustomId('rating')
    .setLabel('Nota (1 a 5 estrelas)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('5')
    .setRequired(true)
    .setMinLength(1)
    .setMaxLength(1);

  const commentInput = new TextInputBuilder()
    .setCustomId('comment')
    .setLabel('Comentário')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Como foi o atendimento?')
    .setRequired(true)
    .setMaxLength(500);

  const anonymousInput = new TextInputBuilder()
    .setCustomId('anonymous')
    .setLabel('Avaliação anônima? (sim/nao)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('nao')
    .setRequired(false)
    .setValue('nao');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(ratingInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(commentInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(anonymousInput)
  );

  return modal;
}

/**
 * Processar avaliação de vendedor
 */
export async function handleSellerReviewModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });

  const [, , , sellerId, category] = interaction.customId.split('_');
  const rating = parseInt(interaction.fields.getTextInputValue('rating'));
  const comment = interaction.fields.getTextInputValue('comment');
  const anonymous = interaction.fields.getTextInputValue('anonymous').toLowerCase() === 'sim';

  if (rating < 1 || rating > 5 || isNaN(rating)) {
    await interaction.editReply({
      content: '❌ A nota deve ser um número de 1 a 5.'
    });
    return;
  }

  try {
    const { error } = await supabase
      .from('seller_reviews')
      .insert({
        guild_id: interaction.guildId!,
        seller_id: sellerId,
        reviewer_id: interaction.user.id,
        rating,
        comment,
        category,
        is_anonymous: anonymous
      });

    if (error) throw error;

    const stars = '⭐'.repeat(rating);
    await interaction.editReply({
      content:
        `✅ **Avaliação enviada com sucesso!**\n\n` +
        `${stars} ${rating}/5 para <@${sellerId}>\n\n` +
        `"${comment}"\n\n` +
        `Obrigado pelo seu feedback!`
    });

    logger.info(`Avaliação de vendedor criada por ${interaction.user.tag}`);
  } catch (error: any) {
    logger.error(`Erro ao salvar avaliação: ${error}`);
    await interaction.editReply({
      content: '❌ Erro ao salvar avaliação. Tente novamente mais tarde.'
    });
  }
}

/**
 * Processar avaliação de produto
 */
export async function handleProductReviewModal(interaction: any) {
  await interaction.deferReply({ flags: 64 });

  const [, , , productId, transactionId] = interaction.customId.split('_');
  const rating = parseInt(interaction.fields.getTextInputValue('rating'));
  const comment = interaction.fields.getTextInputValue('comment');
  const anonymous = interaction.fields.getTextInputValue('anonymous').toLowerCase() === 'sim';

  if (rating < 1 || rating > 5 || isNaN(rating)) {
    await interaction.editReply({
      content: '❌ A nota deve ser um número de 1 a 5.'
    });
    return;
  }

  try {
    const { error } = await supabase
      .from('product_reviews')
      .insert({
        guild_id: interaction.guildId!,
        product_id: productId,
        user_id: interaction.user.id,
        transaction_id: transactionId,
        rating,
        comment: comment || null,
        is_anonymous: anonymous
      });

    if (error) throw error;

    const stars = '⭐'.repeat(rating);
    await interaction.editReply({
      content:
        `✅ **Avaliação enviada com sucesso!**\n\n` +
        `${stars} ${rating}/5\n` +
        `${comment ? `\n"${comment}"\n` : ''}` +
        `\nObrigado pelo seu feedback!`
    });

    logger.info(`Avaliação de produto criada por ${interaction.user.tag}`);
  } catch (error: any) {
    logger.error(`Erro ao salvar avaliação: ${error}`);
    await interaction.editReply({
      content: '❌ Erro ao salvar avaliação. Tente novamente mais tarde.'
    });
  }
}
