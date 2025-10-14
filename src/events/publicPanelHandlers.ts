/**
 * Handlers para painéis públicos (botões para usuários finais)
 */

import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { supabase } from '../utils/supabase';
import { COLORS, EMOJIS, formatters } from '../utils/designSystem';
import { logger } from '../utils/logger';

/**
 * Handler principal para botões públicos
 */
export async function handlePublicPanelButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  try {
    if (customId === 'public_catalog') {
      await handlePublicCatalog(interaction);
    }
    else if (customId === 'public_my_orders') {
      await handlePublicMyOrders(interaction);
    }
    else if (customId === 'public_coupons') {
      await handlePublicCoupons(interaction);
    }
    else if (customId === 'public_create_ticket') {
      await handlePublicCreateTicket(interaction);
    }
    else if (customId === 'public_my_tickets') {
      await handlePublicMyTickets(interaction);
    }
    else if (customId === 'public_faq') {
      await handlePublicFAQ(interaction);
    }
    else if (customId === 'public_create_review') {
      await handlePublicCreateReview(interaction);
    }
    else if (customId === 'public_view_reviews') {
      await handlePublicViewReviews(interaction);
    }
  } catch (error) {
    logger.error(`Erro no handler público: ${error}`);
    
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({
        content: `${EMOJIS.ERROR} Ocorreu um erro ao processar sua solicitação. Tente novamente!`
      });
    } else {
      await interaction.reply({
        content: `${EMOJIS.ERROR} Ocorreu um erro ao processar sua solicitação. Tente novamente!`,
        flags: 64
      });
    }
  }
}

/**
 * Catálogo Público
 */
async function handlePublicCatalog(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('guild_id', interaction.guildId!)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error || !products || products.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.WARNING)
      .setTitle(`${EMOJIS.WARNING} Catálogo Vazio`)
      .setDescription(
        'No momento não temos produtos disponíveis.\n\n' +
        `${EMOJIS.INFO} Volte em breve para conferir novidades!`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  const { formatCurrency } = await import('../utils/payments');
  const { getOrCreateGuildConfig } = await import('../utils/supabase');
  const config = await getOrCreateGuildConfig(interaction.guildId!);

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.PRODUCTS} Catálogo de Produtos`)
    .setDescription(
      `**${products.length}** produtos disponíveis\n\n` +
      `Clique em "Ver Detalhes" para mais informações sobre cada produto.`
    )
    .setFooter({ text: `Total de ${products.length} produtos` })
    .setTimestamp();

  // Adicionar produtos ao embed (máximo 10)
  const productsToShow = products.slice(0, 10);
  for (const product of productsToShow) {
    const price = formatCurrency(product.price, config.currency);
    const stock = product.stock_quantity !== null ? `${EMOJIS.SUCCESS} Em estoque` : `${EMOJIS.INFO} Estoque ilimitado`;
    
    embed.addFields({
      name: `${EMOJIS.PRODUCTS} ${product.name}`,
      value: 
        `**Preço:** ${price}\n` +
        `**Status:** ${stock}\n` +
        `${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}`,
      inline: false
    });
  }

  if (products.length > 10) {
    embed.addFields({
      name: '\u200b',
      value: `${EMOJIS.INFO} *Mostrando 10 de ${products.length} produtos*`,
      inline: false
    });
  }

  // Botão para comprar
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('public_start_purchase')
        .setLabel('Iniciar Compra')
        .setStyle(ButtonStyle.Success)
        .setEmoji(EMOJIS.CART),
      new ButtonBuilder()
        .setCustomId('public_my_orders')
        .setLabel('Meus Pedidos')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📦')
    );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

/**
 * Meus Pedidos
 */
async function handlePublicMyOrders(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const { data: orders, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('guild_id', interaction.guildId!)
    .eq('user_id', interaction.user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !orders || orders.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`${EMOJIS.INFO} Sem Pedidos`)
      .setDescription(
        'Você ainda não fez nenhuma compra.\n\n' +
        `${EMOJIS.PRODUCTS} Clique em "Ver Catálogo" para começar!`
      )
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('public_catalog')
          .setLabel('Ver Catálogo')
          .setStyle(ButtonStyle.Success)
          .setEmoji(EMOJIS.PRODUCTS)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
    return;
  }

  const { formatCurrency } = await import('../utils/payments');
  const { getOrCreateGuildConfig } = await import('../utils/supabase');
  const config = await getOrCreateGuildConfig(interaction.guildId!);

  const embed = new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle(`${EMOJIS.CART} Meus Pedidos`)
    .setDescription(
      `Você tem **${orders.length}** pedidos registrados.\n\n` +
      `${EMOJIS.INFO} *Mostrando os 10 mais recentes*`
    )
    .setTimestamp();

  for (const order of orders) {
    const statusEmoji = order.status === 'completed' ? EMOJIS.SUCCESS : 
                       order.status === 'pending' ? EMOJIS.LOADING :
                       order.status === 'cancelled' ? EMOJIS.ERROR : '❓';

    const statusText = order.status === 'completed' ? 'Concluído' :
                      order.status === 'pending' ? 'Pendente' :
                      order.status === 'cancelled' ? 'Cancelado' : order.status;

    embed.addFields({
      name: `${statusEmoji} Pedido #${order.id.slice(0, 8)}`,
      value:
        `**Valor:** ${formatCurrency(order.amount, config.currency)}\n` +
        `**Status:** ${statusText}\n` +
        `**Data:** ${formatters.relativeTime(new Date(order.created_at))}`,
      inline: true
    });
  }

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('public_catalog')
        .setLabel('Comprar Mais')
        .setStyle(ButtonStyle.Success)
        .setEmoji(EMOJIS.PRODUCTS),
      new ButtonBuilder()
        .setCustomId('public_create_review')
        .setLabel('Avaliar Compra')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(EMOJIS.REVIEWS)
    );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

/**
 * Cupons Disponíveis
 */
async function handlePublicCoupons(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('guild_id', interaction.guildId!)
    .eq('is_active', true)
    .gte('valid_until', new Date().toISOString())
    .order('discount_value', { ascending: false });

  if (error || !coupons || coupons.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`${EMOJIS.COUPONS} Sem Cupons Disponíveis`)
      .setDescription(
        'No momento não há cupons de desconto disponíveis.\n\n' +
        `${EMOJIS.INFO} Fique de olho para não perder promoções futuras!`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.WARNING)
    .setTitle(`${EMOJIS.COUPONS} Cupons Disponíveis`)
    .setDescription(
      `Temos **${coupons.length}** cupons ativos!\n\n` +
      `${EMOJIS.INFO} Use o código na hora da compra para obter desconto.`
    )
    .setTimestamp();

  for (const coupon of coupons) {
    const discount = coupon.discount_type === 'percentage' 
      ? `${coupon.discount_value}% OFF`
      : `R$ ${coupon.discount_value.toFixed(2)} OFF`;

    const validUntil = new Date(coupon.valid_until);
    const uses = coupon.max_uses ? `${coupon.current_uses || 0}/${coupon.max_uses} usos` : 'Usos ilimitados';

    embed.addFields({
      name: `${EMOJIS.COUPONS} ${coupon.code}`,
      value:
        `**Desconto:** ${discount}\n` +
        `**Válido até:** ${validUntil.toLocaleDateString('pt-BR')}\n` +
        `**Usos:** ${uses}`,
      inline: true
    });
  }

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('public_catalog')
        .setLabel('Ver Catálogo')
        .setStyle(ButtonStyle.Success)
        .setEmoji(EMOJIS.PRODUCTS)
    );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

/**
 * Criar Ticket
 */
async function handlePublicCreateTicket(interaction: ButtonInteraction) {
  await interaction.reply({
    content: `${EMOJIS.TICKETS} **Sistema de Tickets**\n\nEsta funcionalidade abrirá um modal para você criar um ticket de suporte.\n\n${EMOJIS.INFO} *Em desenvolvimento*`,
    flags: 64
  });
}

/**
 * Meus Tickets
 */
async function handlePublicMyTickets(interaction: ButtonInteraction) {
  await interaction.reply({
    content: `${EMOJIS.INFO} **Meus Tickets**\n\nAqui você verá todos os seus tickets de suporte.\n\n${EMOJIS.LOADING} *Em desenvolvimento*`,
    flags: 64
  });
}

/**
 * FAQ
 */
async function handlePublicFAQ(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.INFO} Perguntas Frequentes (FAQ)`)
    .setDescription('Respostas para as dúvidas mais comuns:')
    .addFields(
      {
        name: '❓ Como fazer uma compra?',
        value: 'Clique em "Ver Catálogo" → escolha um produto → siga as instruções de pagamento.',
        inline: false
      },
      {
        name: '❓ Como usar um cupom?',
        value: 'Durante o processo de compra, insira o código do cupom no campo indicado.',
        inline: false
      },
      {
        name: '❓ Como acompanhar meu pedido?',
        value: 'Clique em "Meus Pedidos" para ver o status de todas as suas compras.',
        inline: false
      },
      {
        name: '❓ Posso cancelar uma compra?',
        value: 'Entre em contato com o suporte através de um ticket para solicitar cancelamento.',
        inline: false
      },
      {
        name: '❓ Como avaliar uma compra?',
        value: 'Clique em "Avaliar Compra" e selecione o produto que deseja avaliar.',
        inline: false
      }
    )
    .setFooter({ text: 'Ainda com dúvidas? Abra um ticket de suporte!' })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('public_create_ticket')
        .setLabel('Abrir Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji(EMOJIS.TICKETS)
    );

  await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
}

/**
 * Criar Avaliação
 */
async function handlePublicCreateReview(interaction: ButtonInteraction) {
  await interaction.reply({
    content: `${EMOJIS.REVIEWS} **Sistema de Avaliações**\n\nSelecione um produto para avaliar.\n\n${EMOJIS.INFO} *Em desenvolvimento*`,
    flags: 64
  });
}

/**
 * Ver Avaliações
 */
async function handlePublicViewReviews(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('guild_id', interaction.guildId!)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !reviews || reviews.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`${EMOJIS.INFO} Sem Avaliações`)
      .setDescription(
        'Ainda não há avaliações publicadas.\n\n' +
        `${EMOJIS.SPARKLES} Seja o primeiro a avaliar!`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.WARNING)
    .setTitle(`${EMOJIS.REVIEWS} Avaliações dos Clientes`)
    .setDescription(`**${reviews.length}** avaliações positivas`)
    .setTimestamp();

  for (const review of reviews.slice(0, 5)) {
    const stars = '⭐'.repeat(review.rating);
    embed.addFields({
      name: `${stars} (${review.rating}/5)`,
      value: `*"${review.comment}"*\n— <@${review.user_id}>`,
      inline: false
    });
  }

  await interaction.editReply({ embeds: [embed] });
}
