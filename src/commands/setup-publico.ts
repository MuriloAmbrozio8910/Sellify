/**
 * Comando /setup-publico
 * Cria painéis públicos com botões para usuários interagirem
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel
} from 'discord.js';
import { COLORS, EMOJIS } from '../utils/designSystem';

export const data = new SlashCommandBuilder()
  .setName('setup-publico')
  .setDescription('🎯 Cria painéis públicos com botões para usuários')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption(option =>
    option
      .setName('canal')
      .setDescription('Canal onde o painel será enviado')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('tipo')
      .setDescription('Tipo de painel a criar')
      .setRequired(true)
      .addChoices(
        { name: '🛍️ Painel de Compras (Catálogo + Pedidos)', value: 'shopping' },
        { name: '🆘 Painel de Suporte (Tickets + FAQ)', value: 'support' },
        { name: '⭐ Painel de Avaliações', value: 'reviews' },
        { name: '🎯 Painel Completo (Tudo)', value: 'complete' }
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ flags: 64 });

    const channel = interaction.options.getChannel('canal', true) as TextChannel;
    const tipo = interaction.options.getString('tipo', true);

    // Verificar permissões no canal
    if (!channel.permissionsFor(interaction.guild!.members.me!)?.has(['SendMessages', 'EmbedLinks'])) {
      await interaction.editReply({
        content: `${EMOJIS.ERROR} Não tenho permissão para enviar mensagens no canal ${channel}!`
      });
      return;
    }

    let embed: EmbedBuilder;
    let rows: ActionRowBuilder<ButtonBuilder>[];

    switch (tipo) {
      case 'shopping':
        ({ embed, rows } = createShoppingPanel(interaction.guild!.name));
        break;
      case 'support':
        ({ embed, rows } = createSupportPanel(interaction.guild!.name));
        break;
      case 'reviews':
        ({ embed, rows } = createReviewsPanel(interaction.guild!.name));
        break;
      case 'complete':
        ({ embed, rows } = createCompletePanel(interaction.guild!.name));
        break;
      default:
        await interaction.editReply('❌ Tipo de painel inválido!');
        return;
    }

    // Enviar painel no canal
    await channel.send({
      embeds: [embed],
      components: rows
    });

    // Confirmar criação
    const confirmEmbed = new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle(`${EMOJIS.SUCCESS} Painel Criado com Sucesso!`)
      .setDescription(
        `O painel foi enviado no canal ${channel}.\n\n` +
        `${EMOJIS.INFO} **Agora seus usuários podem:**\n` +
        `• Interagir via botões (sem precisar digitar comandos)\n` +
        `• Acessar todas as funcionalidades de forma visual\n` +
        `• Ter uma experiência moderna e intuitiva`
      )
      .setFooter({ text: 'Sistema Sellify v2.0 • 100% Interativo' })
      .setTimestamp();

    await interaction.editReply({ embeds: [confirmEmbed] });

  } catch (error) {
    console.error('Erro ao criar painel público:', error);
    await interaction.editReply({
      content: `${EMOJIS.ERROR} Erro ao criar painel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    });
  }
}

/**
 * Painel de Compras (Catálogo + Pedidos)
 */
function createShoppingPanel(guildName: string) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.PRODUCTS} Central de Compras`)
    .setDescription(
      `Bem-vindo à loja do **${guildName}**! ${EMOJIS.SPARKLES}\n\n` +
      `Aqui você pode visualizar nossos produtos, fazer pedidos e acompanhar suas compras.\n\n` +
      `**Clique nos botões abaixo para começar:**`
    )
    .addFields(
      {
        name: `${EMOJIS.PRODUCTS} Ver Catálogo`,
        value: 'Navegue por todos os produtos disponíveis',
        inline: true
      },
      {
        name: `${EMOJIS.CART} Meus Pedidos`,
        value: 'Consulte suas compras e histórico',
        inline: true
      },
      {
        name: `${EMOJIS.COUPONS} Cupons`,
        value: 'Veja cupons de desconto disponíveis',
        inline: true
      }
    )
    .setFooter({ text: 'Sistema de vendas automatizado • Sellify Bot' })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('public_catalog')
        .setLabel('Ver Catálogo')
        .setStyle(ButtonStyle.Success)
        .setEmoji(EMOJIS.PRODUCTS),
      new ButtonBuilder()
        .setCustomId('public_my_orders')
        .setLabel('Meus Pedidos')
        .setStyle(ButtonStyle.Primary)
        .setEmoji(EMOJIS.CART),
      new ButtonBuilder()
        .setCustomId('public_coupons')
        .setLabel('Cupons Disponíveis')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(EMOJIS.COUPONS)
    );

  return { embed, rows: [row1] };
}

/**
 * Painel de Suporte (Tickets + FAQ)
 */
function createSupportPanel(guildName: string) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle(`${EMOJIS.SUPPORT} Central de Suporte`)
    .setDescription(
      `Precisa de ajuda? Estamos aqui para você! ${EMOJIS.SUCCESS}\n\n` +
      `Crie um ticket ou consulte nossa FAQ para soluções rápidas.\n\n` +
      `**Escolha uma opção abaixo:**`
    )
    .addFields(
      {
        name: `${EMOJIS.TICKETS} Abrir Ticket`,
        value: 'Suporte personalizado com nossa equipe',
        inline: true
      },
      {
        name: `${EMOJIS.INFO} FAQ`,
        value: 'Perguntas frequentes e respostas',
        inline: true
      },
      {
        name: `${EMOJIS.ANNOUNCEMENT} Status`,
        value: 'Veja o status dos seus tickets',
        inline: true
      }
    )
    .setFooter({ text: 'Tempo médio de resposta: 2 horas • Sellify Bot' })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('public_create_ticket')
        .setLabel('Abrir Ticket')
        .setStyle(ButtonStyle.Success)
        .setEmoji(EMOJIS.TICKETS),
      new ButtonBuilder()
        .setCustomId('public_my_tickets')
        .setLabel('Meus Tickets')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('public_faq')
        .setLabel('Ver FAQ')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(EMOJIS.INFO)
    );

  return { embed, rows: [row1] };
}

/**
 * Painel de Avaliações
 */
function createReviewsPanel(guildName: string) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.WARNING)
    .setTitle(`${EMOJIS.REVIEWS} Central de Avaliações`)
    .setDescription(
      `Sua opinião é muito importante para nós! ${EMOJIS.SPARKLES}\n\n` +
      `Avalie suas compras e ajude outros clientes a escolherem os melhores produtos.\n\n` +
      `**Clique para avaliar:**`
    )
    .addFields(
      {
        name: `${EMOJIS.REVIEWS} Avaliar Compra`,
        value: 'Avalie produtos que você comprou',
        inline: true
      },
      {
        name: `${EMOJIS.STATS} Ver Avaliações`,
        value: 'Confira avaliações de outros clientes',
        inline: true
      }
    )
    .setFooter({ text: 'Obrigado pelo seu feedback! • Sellify Bot' })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('public_create_review')
        .setLabel('Avaliar Compra')
        .setStyle(ButtonStyle.Success)
        .setEmoji(EMOJIS.REVIEWS),
      new ButtonBuilder()
        .setCustomId('public_view_reviews')
        .setLabel('Ver Avaliações')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👁️')
    );

  return { embed, rows: [row1] };
}

/**
 * Painel Completo (Todas as funcionalidades)
 */
function createCompletePanel(guildName: string) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle(`${EMOJIS.SPARKLES} Central ${guildName}`)
    .setDescription(
      `Bem-vindo! Aqui você encontra tudo que precisa. ${EMOJIS.ROCKET}\n\n` +
      `**Use os botões abaixo para navegar:**`
    )
    .addFields(
      {
        name: `${EMOJIS.PRODUCTS} Compras`,
        value: 'Catálogo, pedidos e cupons',
        inline: true
      },
      {
        name: `${EMOJIS.SUPPORT} Suporte`,
        value: 'Tickets e ajuda',
        inline: true
      },
      {
        name: `${EMOJIS.REVIEWS} Avaliações`,
        value: 'Avalie suas compras',
        inline: true
      }
    )
    .setFooter({ text: 'Sistema 100% interativo • Sellify Bot' })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('public_catalog')
        .setLabel('Catálogo')
        .setStyle(ButtonStyle.Success)
        .setEmoji(EMOJIS.PRODUCTS),
      new ButtonBuilder()
        .setCustomId('public_my_orders')
        .setLabel('Meus Pedidos')
        .setStyle(ButtonStyle.Primary)
        .setEmoji(EMOJIS.CART),
      new ButtonBuilder()
        .setCustomId('public_create_ticket')
        .setLabel('Suporte')
        .setStyle(ButtonStyle.Primary)
        .setEmoji(EMOJIS.TICKETS)
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('public_create_review')
        .setLabel('Avaliar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(EMOJIS.REVIEWS),
      new ButtonBuilder()
        .setCustomId('public_coupons')
        .setLabel('Cupons')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(EMOJIS.COUPONS),
      new ButtonBuilder()
        .setCustomId('public_faq')
        .setLabel('FAQ')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(EMOJIS.INFO)
    );

  return { embed, rows: [row1, row2] };
}
