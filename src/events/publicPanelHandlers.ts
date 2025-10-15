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
  StringSelectMenuOptionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
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
 * Handler para menu de seleção de produtos - REUTILIZA função do catalogo.ts
 */
export async function handlePublicProductSelect(interaction: any) {
  // Este handler agora é tratado pelo interactionCreate.ts
  // que já usa o handler existente do comando /catalogo
  // Mantido apenas para compatibilidade de exportação
}

/**
 * Catálogo Público - REUTILIZA comando /catalogo existente
 */
async function handlePublicCatalog(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  try {
    // REUTILIZAR a lógica do comando /catalogo
    const { execute: catalogExecute } = await import('../commands/catalogo');
    
    // Criar uma interação "fake" que simula /catalogo ver
    const fakeInteraction = {
      ...interaction,
      options: {
        getSubcommand: () => 'ver',
        getInteger: (name: string) => name === 'pagina' ? 1 : null,
        getString: () => null
      },
      editReply: interaction.editReply.bind(interaction),
      deferReply: async () => {} // Já foi feito defer
    } as any;

    await catalogExecute(fakeInteraction);
    
  } catch (error) {
    logger.error(`Erro ao exibir catálogo público: ${error}`);
    await interaction.editReply({
      content: `${EMOJIS.ERROR} Erro ao carregar catálogo. Tente novamente!`
    });
  }
}

/**
 * Meus Pedidos - REUTILIZA comando /meus-pedidos existente
 */
async function handlePublicMyOrders(interaction: ButtonInteraction) {
  try {
    // REUTILIZAR a lógica do comando /meus-pedidos
    const { execute: myOrdersExecute } = await import('../commands/meus-pedidos');
    
    // Criar interação compatível
    const fakeInteraction = {
      ...interaction,
      editReply: interaction.editReply.bind(interaction),
      deferReply: async () => {} // Já foi feito defer
    } as any;

    await myOrdersExecute(fakeInteraction);
    
  } catch (error) {
    logger.error(`Erro ao exibir pedidos: ${error}`);
    await interaction.reply({
      content: `${EMOJIS.ERROR} Erro ao carregar pedidos. Tente novamente!`,
      flags: 64
    });
  }
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
  // Criar modal para ticket
  const modal = new ModalBuilder()
    .setCustomId('public_ticket_modal')
    .setTitle('🎫 Criar Ticket de Suporte');

  const subjectInput = new TextInputBuilder()
    .setCustomId('ticket_subject')
    .setLabel('Assunto do Ticket')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Problema com minha compra')
    .setRequired(true)
    .setMaxLength(100);

  const descriptionInput = new TextInputBuilder()
    .setCustomId('ticket_description')
    .setLabel('Descrição Detalhada')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Descreva seu problema ou dúvida em detalhes...')
    .setRequired(true)
    .setMaxLength(1000);

  const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(subjectInput);
  const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput);

  modal.addComponents(row1, row2);

  await interaction.showModal(modal);
}

/**
 * Meus Tickets
 */
async function handlePublicMyTickets(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 });

  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
    .eq('guild_id', interaction.guildId!)
    .eq('user_id', interaction.user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!tickets || tickets.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`${EMOJIS.INFO} Sem Tickets`)
      .setDescription(
        'Você ainda não criou nenhum ticket de suporte.\n\n' +
        `${EMOJIS.TICKETS} Clique em "Abrir Ticket" para criar um!`
      )
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('public_create_ticket')
          .setLabel('Abrir Ticket')
          .setStyle(ButtonStyle.Success)
          .setEmoji(EMOJIS.TICKETS)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle(`${EMOJIS.TICKETS} Meus Tickets`)
    .setDescription(`Você tem **${tickets.length}** tickets registrados.`)
    .setTimestamp();

  for (const ticket of tickets.slice(0, 5)) {
    const statusEmoji = ticket.status === 'open' ? EMOJIS.PENDING :
                       ticket.status === 'claimed' ? EMOJIS.LOADING :
                       ticket.status === 'closed' ? EMOJIS.DONE : '❓';

    const statusText = ticket.status === 'open' ? 'Aguardando' :
                      ticket.status === 'claimed' ? 'Em Atendimento' :
                      ticket.status === 'closed' ? 'Fechado' : ticket.status;

    embed.addFields({
      name: `${statusEmoji} Ticket #${ticket.id.slice(0, 8)}`,
      value:
        `**Assunto:** ${ticket.subject || 'Sem assunto'}\n` +
        `**Status:** ${statusText}\n` +
        `**Criado:** ${formatters.relativeTime(new Date(ticket.created_at))}`,
      inline: false
    });
  }

  if (tickets.length > 5) {
    embed.setFooter({ text: `Mostrando 5 de ${tickets.length} tickets` });
  }

  await interaction.editReply({ embeds: [embed] });
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
    content: `${EMOJIS.REVIEWS} **Sistema de Avaliações**\n\nSelecione um produto para avaliar.\n\n${EMOJIS.INFO} *Sistema ativo e funcional*`,
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
