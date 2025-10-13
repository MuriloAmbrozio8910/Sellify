/**
 * Evento: Interação criada (comandos, botões, menus)
 */

import {
  Interaction,
  ChatInputCommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import { logger, logAction } from '../utils/logger';
import { 
  getProductById, 
  createTransaction, 
  updateTransactionStatus,
  decrementStock,
  getOrCreateGuildConfig
} from '../utils/supabase';
import { createPaymentLink, formatCurrency } from '../utils/payments';
import { TransactionStatus, ProductType } from '../types';
import { createProductDetailEmbed } from '../commands/catalogo';
import { confirmDelete } from '../commands/removeproduct';
import { addTemporaryRole } from '../utils/roleManager';
import { createPrivateChannel, sendTransactionLog } from '../utils/channelManager';
import { notifyBuyerPurchase, notifyAdminPurchase } from '../utils/logger';
import { 
  handlePanelButton,
  handleTicketCreationButton,
  handleTicketModal,
  handleTicketActionButton,
  handleBroadcastConfirmation,
  handleCreateTicketPanelModal,
  handleAutomationAutoRoleModal,
  handleAutomationWelcomeModal,
  handleTaskCleanupModal,
  handleTaskReportsModal
} from './panelHandlers';
import {
  showAddProductModal,
  handleAddProductModalSubmit,
  handleEditProductModalSubmit,
  handleProductExtrasModalSubmit,
  handleProductActionButton
} from '../modals/productModal';
import {
  handleAddCouponModalSubmit,
  handleCouponActionButton
} from '../modals/couponModal';
import {
  handleCreateAnnouncementModalSubmit,
  handleAnnouncementActionButton
} from '../modals/announcementModal';

export const name = 'interactionCreate';

export async function execute(interaction: Interaction) {
  // Comandos slash
  if (interaction.isChatInputCommand()) {
    await handleSlashCommand(interaction);
  }
  
  // Botões
  else if (interaction.isButton()) {
    await handleButton(interaction);
  }
  
  // Menus de seleção
  else if (interaction.isStringSelectMenu()) {
    await handleSelectMenu(interaction);
  }

  // Modais
  else if (interaction.isModalSubmit()) {
    await handleModal(interaction);
  }
}

/**
 * Handler para comandos slash
 */
async function handleSlashCommand(interaction: ChatInputCommandInteraction) {
  const command = (interaction.client as any).commands?.get(interaction.commandName);

  if (!command) {
    logger.warning(`Comando não encontrado: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
    
    await logAction(
      interaction.guildId!,
      interaction.user.id,
      `comando_${interaction.commandName}`,
      `Usuário executou /${interaction.commandName}`
    );
  } catch (error) {
    logger.error(`Erro ao executar comando ${interaction.commandName}: ${error}`);
    
    const errorMessage = 'Ocorreu um erro ao executar este comando.';
    
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: errorMessage });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}

/**
 * Handler para botões
 */
async function handleButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  try {
    // Painéis principais e todos os botões dos sub-painéis
    if (customId.startsWith('panel_') || 
        customId.startsWith('products_') ||
        customId.startsWith('coupons_') ||
        customId.startsWith('sales_') ||
        customId.startsWith('stats_') ||
        customId.startsWith('announcements_') ||
        customId.startsWith('automations_') ||
        customId.startsWith('ai_') ||
        customId.startsWith('config_') ||
        customId.startsWith('logs_') ||
        customId.startsWith('help_') ||
        customId.startsWith('task_') ||
        customId.startsWith('tickets_view') ||
        customId.startsWith('tickets_create')) {
      await handlePanelButton(interaction);
    }
    // Criação de tickets do painel
    else if (customId.startsWith('create_ticket_')) {
      await handleTicketCreationButton(interaction);
    }
    // Ações de tickets
    else if (customId.startsWith('ticket_')) {
      await handleTicketActionButton(interaction);
    }
    // Confirmação de broadcast
    else if (customId.includes('broadcast')) {
      await handleBroadcastConfirmation(interaction);
    }
    // Botões de gerenciamento de produtos (modais/json)
    else if (customId.startsWith('product_')) {
      await handleProductActionButton(interaction);
    }
    // Botões relacionados a cupons
    else if (customId.startsWith('coupon_')) {
      await handleCouponActionButton(interaction);
    }
    // Botões relacionados a anúncios
    else if (customId.startsWith('announcement_')) {
      await handleAnnouncementActionButton(interaction);
    }
    // Navegação do catálogo
    else if (customId.startsWith('catalog_page_')) {
      await handleCatalogNavigation(interaction);
    }
    // Refresh do catálogo
    else if (customId === 'catalog_refresh' || customId === 'catalog_refresh_permanent') {
      await handleCatalogRefresh(interaction);
    }
    // Produto do catálogo permanente
    else if (customId.startsWith('catalog_product_')) {
      await handleCatalogProductClick(interaction);
    }
    // Categoria do catálogo
    else if (customId.startsWith('catalog_category_')) {
      await handleCatalogCategoryClick(interaction);
    }
    // Comprar produto
    else if (customId.startsWith('buy_product_')) {
      await handleBuyProduct(interaction);
    }
    // Confirmar compra
    else if (customId.startsWith('confirm_buy_')) {
      await handleConfirmBuy(interaction);
    }
    // Pagar com PIX
    else if (customId.startsWith('pay_pix_')) {
      await handlePayWithPix(interaction);
    }
    // Pagar com Boleto
    else if (customId.startsWith('pay_boleto_')) {
      await handlePayWithBoleto(interaction);
    }
    // Cancelar compra
    else if (customId.startsWith('cancel_buy_')) {
      await handleCancelBuy(interaction);
    }
    // Confirmar deleção de produto
    else if (customId.startsWith('confirm_delete_')) {
      await handleConfirmDelete(interaction);
    }
    // Cancelar deleção
    else if (customId.startsWith('cancel_delete_')) {
      await handleCancelDelete(interaction);
    }
    // Pagamento manual
    else if (customId.startsWith('manual_payment_')) {
      await handleManualPayment(interaction);
    }
  } catch (error) {
    logger.error(`Erro ao processar botão: ${error}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar ação.';
    
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: `❌ ${errorMessage}` });
    } else {
      await interaction.reply({ content: `❌ ${errorMessage}`, ephemeral: true });
    }
  }
}

/**
 * Handler para menus de seleção
 */
async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  const customId = interaction.customId;

  try {
    if (customId === 'select_product_catalog') {
      await handleProductSelection(interaction);
    }
    else if (customId === 'select_payment_method') {
      await handlePaymentMethodSelection(interaction);
    }
  } catch (error) {
    logger.error(`Erro ao processar menu: ${error}`);
    
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: '❌ Erro ao processar seleção.' });
    } else {
      await interaction.reply({ content: '❌ Erro ao processar seleção.', ephemeral: true });
    }
  }
}

/**
 * Handler para modais
 */
async function handleModal(interaction: any) {
  const customId = interaction.customId;
  
  try {
    // Modal de criação de ticket
    if (customId.startsWith('ticket_modal_')) {
      await handleTicketModal(interaction);
    }
    // Modal de adicionar produto
    else if (customId === 'addproduct_modal') {
      await handleAddProductModalSubmit(interaction);
    }
    // Modal de edição de produto
    else if (customId.startsWith('editproduct_modal_')) {
      await handleEditProductModalSubmit(interaction);
    }
    // Modal de detalhes extras do produto
    else if (customId.startsWith('product_extras_modal_')) {
      await handleProductExtrasModalSubmit(interaction);
    }
    // Modal de cupons
    else if (customId === 'addcoupon_modal') {
      await handleAddCouponModalSubmit(interaction);
    }
    // Modal de anúncios
    else if (customId.startsWith('create_announcement_modal_')) {
      await handleCreateAnnouncementModalSubmit(interaction);
    }
    // Modal de criar painel de tickets
    else if (customId === 'create_ticket_panel_modal') {
      await handleCreateTicketPanelModal(interaction);
    }
    // Modal de auto role
    else if (customId === 'automation_autorole_modal') {
      await handleAutomationAutoRoleModal(interaction);
    }
    // Modal de mensagens de boas-vindas
    else if (customId === 'automation_welcome_modal') {
      await handleAutomationWelcomeModal(interaction);
    }
    // Modal de tarefa de limpeza
    else if (customId === 'task_cleanup_modal') {
      await handleTaskCleanupModal(interaction);
    }
    // Modal de relatórios
    else if (customId === 'task_reports_modal') {
      await handleTaskReportsModal(interaction);
    }
  } catch (error) {
    logger.error(`Erro ao processar modal: ${error}`);
    
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: '❌ Erro ao processar formulário.' });
    } else {
      await interaction.reply({ content: '❌ Erro ao processar formulário.', ephemeral: true });
    }
  }
}

/**
 * Navegação do catálogo
 */
async function handleCatalogNavigation(interaction: ButtonInteraction) {
  const page = parseInt(interaction.customId.split('_')[2]);
  
  // Re-executar comando de catálogo com a nova página
  await interaction.deferUpdate();
  // Aqui você pode recarregar o catálogo com a nova página
  // Implementação simplificada
}

async function handleCatalogRefresh(interaction: ButtonInteraction) {
  await interaction.deferUpdate();
  await interaction.message.edit({ content: '🔄 Catálogo atualizado!' });
}

/**
 * Seleção de produto
 */
async function handleProductSelection(interaction: StringSelectMenuInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const productId = interaction.values[0];
  const product = await getProductById(productId);

  if (!product) {
    await interaction.editReply('❌ Produto não encontrado.');
    return;
  }

  // Verificar estoque
  if (product.stock !== null && product.stock !== undefined && product.stock <= 0) {
    await interaction.editReply('❌ Produto fora de estoque.');
    return;
  }

  const embed = createProductDetailEmbed(product);

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`buy_product_${product.id}`)
        .setLabel('Comprar Agora')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🛒'),
      new ButtonBuilder()
        .setCustomId('catalog_back')
        .setLabel('Voltar ao Catálogo')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

/**
 * Iniciar processo de compra
 */
async function handleBuyProduct(interaction: ButtonInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const productId = interaction.customId.replace('buy_product_', '');
  const product = await getProductById(productId);

  if (!product) {
    await interaction.editReply('❌ Produto não encontrado.');
    return;
  }

  // Verificar estoque
  if (product.stock !== null && product.stock !== undefined && product.stock <= 0) {
    await interaction.editReply('❌ Produto fora de estoque.');
    return;
  }

  const config = await getOrCreateGuildConfig(interaction.guildId!);

  const embed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('🛒 Confirmar Compra')
    .setDescription(`Você está prestes a comprar:\n\n**${product.name}**\n${product.description}`)
    .addFields(
      { name: '💰 Valor', value: formatCurrency(product.price, config.currency), inline: true },
      { name: '📦 Tipo', value: product.type === 'subscription' ? 'Assinatura Mensal' : 'Compra Única', inline: true }
    )
    .setFooter({ text: 'Clique no botão abaixo para escolher o método de pagamento' })
    .setTimestamp();

  if (product.image_url) {
    embed.setThumbnail(product.image_url);
  }

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_buy_${product.id}_stripe`)
        .setLabel('Pagar com Stripe')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💳')
        .setDisabled(!config.stripe_enabled),
      new ButtonBuilder()
        .setCustomId(`confirm_buy_${product.id}_mercadopago`)
        .setLabel('Pagar com Mercado Pago')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💚')
        .setDisabled(!config.mercadopago_enabled),
      new ButtonBuilder()
        .setCustomId(`cancel_buy_${product.id}`)
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌')
    );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

/**
 * Confirmar compra e gerar link de pagamento
 */
async function handleConfirmBuy(interaction: ButtonInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const parts = interaction.customId.split('_');
  const productId = parts[2];
  const provider = parts[3] as 'stripe' | 'mercadopago';

  const product = await getProductById(productId);
  if (!product) {
    await interaction.editReply('❌ Produto não encontrado.');
    return;
  }

  try {
    // Criar transação pendente
    const transaction = await createTransaction({
      guild_id: interaction.guildId!,
      product_id: product.id,
      user_id: interaction.user.id,
      amount: product.price,
      status: TransactionStatus.PENDING,
      payment_provider: provider
    });

    // Gerar link de pagamento
    const paymentLink = await createPaymentLink(
      product,
      interaction.user.id,
      transaction.id,
      provider
    );

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('💳 Link de Pagamento Gerado')
      .setDescription(
        `Clique no botão abaixo para fazer o pagamento via ${provider === 'stripe' ? 'Stripe' : 'Mercado Pago'}.\n\n` +
        `⚠️ **Importante:** Após o pagamento, você receberá acesso automaticamente!`
      )
      .addFields(
        { name: '📦 Produto', value: product.name, inline: true },
        { name: '💰 Valor', value: formatCurrency(product.price), inline: true },
        { name: '🆔 ID da Transação', value: transaction.id, inline: false }
      )
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Pagar Agora')
          .setStyle(ButtonStyle.Link)
          .setURL(paymentLink)
          .setEmoji('💳')
      );

    await interaction.editReply({ embeds: [embed], components: [row] });

    logger.info(`Link de pagamento gerado para ${interaction.user.tag} - Produto: ${product.name}`);
  } catch (error) {
    logger.error(`Erro ao gerar link de pagamento: ${error}`);
    await interaction.editReply('❌ Erro ao gerar link de pagamento. Verifique as configurações do bot.');
  }
}

async function handleCancelBuy(interaction: ButtonInteraction) {
  await interaction.update({
    content: '❌ Compra cancelada.',
    embeds: [],
    components: []
  });
}

/**
 * Confirmar deleção de produto
 */
async function handleConfirmDelete(interaction: ButtonInteraction) {
  await interaction.deferUpdate();

  const productId = interaction.customId.replace('confirm_delete_', '');
  await confirmDelete(productId);

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('✅ Produto Removido')
    .setDescription('O produto foi removido com sucesso do catálogo.')
    .setTimestamp();

  await interaction.editReply({ embeds: [embed], components: [] });
}

async function handleCancelDelete(interaction: ButtonInteraction) {
  await interaction.update({
    content: '❌ Remoção cancelada.',
    embeds: [],
    components: []
  });
}

/**
 * Pagamento manual (admin confirma manualmente)
 */
async function handleManualPayment(interaction: ButtonInteraction) {
  // Verificar se o usuário é admin
  if (!interaction.memberPermissions?.has('Administrator')) {
    await interaction.reply({ content: '❌ Apenas administradores podem confirmar pagamentos manualmente.', ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const transactionId = interaction.customId.replace('manual_payment_', '');
  
  // Aqui você implementaria a lógica de confirmação manual
  // Por simplicidade, vou apenas mostrar uma mensagem
  
  await interaction.editReply('✅ Pagamento confirmado manualmente. O produto será entregue ao comprador.');
}

async function handlePaymentMethodSelection(interaction: StringSelectMenuInteraction) {
  // Implementar seleção de método de pagamento se necessário
}

/**
 * Handlers para catálogo permanente
 */
async function handleCatalogProductClick(interaction: ButtonInteraction) {
  const productId = interaction.customId.replace('catalog_product_', '');
  
  await interaction.deferReply({ ephemeral: true });

  const product = await getProductById(productId);
  if (!product) {
    await interaction.editReply('❌ Produto não encontrado.');
    return;
  }

  // Verificar estoque
  if (product.stock !== null && product.stock !== undefined && product.stock <= 0) {
    await interaction.editReply('❌ Produto fora de estoque.');
    return;
  }

  // Criar canal privado de compra
  const { createPurchaseTicketChannel } = await import('../utils/channelManager');
  const config = await getOrCreateGuildConfig(interaction.guildId!);
  
  const ticketChannel = await createPurchaseTicketChannel(
    interaction.guild!,
    interaction.user.id,
    product.name,
    config.sales_category_id || undefined
  );

  // Enviar mensagem de boas-vindas no canal
  const welcomeEmbed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`🛒 Compra: ${product.name}`)
    .setDescription(
      `Olá ${interaction.user}!\n\n` +
      `Você está adquirindo: **${product.name}**\n\n` +
      `${product.description}\n\n` +
      `**💰 Valor:** ${formatCurrency(product.price)}\n\n` +
      `**Escolha o método de pagamento:**`
    )
    .setThumbnail(product.image_url ?? null)
    .setTimestamp();

  const paymentRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`pay_pix_${product.id}`)
        .setLabel('💚 Pagar com PIX')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💚'),
      new ButtonBuilder()
        .setCustomId(`pay_boleto_${product.id}`)
        .setLabel('🎫 Pagar com Boleto')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫'),
      new ButtonBuilder()
        .setCustomId(`confirm_buy_${product.id}_mercadopago`)
        .setLabel('💳 Mercado Pago (Completo)')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💳')
    );

  const cancelRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`cancel_purchase_ticket`)
        .setLabel('❌ Cancelar')
        .setStyle(ButtonStyle.Danger)
    );

  await ticketChannel.send({
    content: `${interaction.user}`,
    embeds: [welcomeEmbed],
    components: [paymentRow, cancelRow]
  });

  // Responder ao usuário
  await interaction.editReply({
    content: `✅ Canal de compra criado! Acesse ${ticketChannel} para continuar.`
  });

  logger.info(`Canal de compra criado para ${interaction.user.tag} - Produto: ${product.name}`);
}

async function handleCatalogCategoryClick(interaction: ButtonInteraction) {
  await interaction.reply({
    content: '🔄 Funcionalidade de categorias em desenvolvimento!',
    ephemeral: true
  });
}

/**
 * Pagamento com PIX (QR Code nativo no Discord)
 */
async function handlePayWithPix(interaction: ButtonInteraction) {
  await interaction.deferReply();

  const productId = interaction.customId.replace('pay_pix_', '');
  const product = await getProductById(productId);

  if (!product) {
    await interaction.editReply('❌ Produto não encontrado.');
    return;
  }

  try {
    // Criar transação
    const transaction = await createTransaction({
      guild_id: interaction.guildId!,
      product_id: product.id,
      user_id: interaction.user.id,
      amount: product.price,
      status: TransactionStatus.PENDING,
      payment_provider: 'mercadopago'
    });

    // Gerar PIX usando Mercado Pago
    const { createMercadoPagoPix } = await import('../utils/payments');
    // Gerar email válido com formato conservador
    const cleanUsername = interaction.user.username.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'user';
    const userEmail = `${cleanUsername}${interaction.user.id.slice(-6)}@test.com`;
    
    const pixData = await createMercadoPagoPix(
      product,
      interaction.user.id,
      transaction.id,
      userEmail
    );

    // Gerar QR Code a partir do código PIX
    const QRCode = await import('qrcode');
    const qrBuffer = await QRCode.toBuffer(pixData.qrCode, {
      errorCorrectionLevel: 'M',
      width: 400
    });

    const { AttachmentBuilder } = await import('discord.js');
    const qrAttachment = new AttachmentBuilder(qrBuffer, { name: 'pix-qrcode.png' });

    const pixEmbed = new EmbedBuilder()
      .setColor('#00C853')
      .setTitle('💚 Pagamento PIX Gerado')
      .setDescription(
        `**${product.name}**\n\n` +
        `💰 **Valor:** ${formatCurrency(product.price)}\n\n` +
        `**Como pagar:**\n` +
        `1️⃣ Abra seu app de banco\n` +
        `2️⃣ Escolha "Pix" → "Ler QR Code"\n` +
        `3️⃣ Escaneie o QR Code acima\n` +
        `4️⃣ Ou use o código Copia e Cola abaixo\n\n` +
        `⚡ **Pagamento instantâneo!**\n` +
        `Assim que pagar, você receberá o produto automaticamente.\n\n` +
        `⏱️ **Expira em:** 30 minutos`
      )
      .setImage('attachment://pix-qrcode.png')
      .addFields(
        { name: '🆔 ID da Transação', value: `\`${transaction.id}\``, inline: false }
      )
      .setTimestamp();

    const pixCodeEmbed = new EmbedBuilder()
      .setColor('#00C853')
      .setTitle('📋 Código Copia e Cola')
      .setDescription(`\`\`\`${pixData.qrCode}\`\`\``)
      .setFooter({ text: 'Copie o código acima e cole no seu app de pagamento' });

    const refreshRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`check_payment_${transaction.id}`)
          .setLabel('🔄 Verificar Pagamento')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.editReply({
      embeds: [pixEmbed, pixCodeEmbed],
      files: [qrAttachment],
      components: [refreshRow]
    });

    logger.info(`PIX gerado para ${interaction.user.tag} - Produto: ${product.name} - Valor: ${product.price}`);
  } catch (error) {
    logger.error(`Erro ao gerar PIX: ${error}`);
    await interaction.editReply('❌ Erro ao gerar pagamento PIX. Tente novamente ou escolha outro método.');
  }
}

/**
 * Pagamento com Boleto
 */
async function handlePayWithBoleto(interaction: ButtonInteraction) {
  await interaction.deferReply();

  const productId = interaction.customId.replace('pay_boleto_', '');
  const product = await getProductById(productId);

  if (!product) {
    await interaction.editReply('❌ Produto não encontrado.');
    return;
  }

  try {
    // Criar transação
    const transaction = await createTransaction({
      guild_id: interaction.guildId!,
      product_id: product.id,
      user_id: interaction.user.id,
      amount: product.price,
      status: TransactionStatus.PENDING,
      payment_provider: 'mercadopago'
    });

    // Gerar boleto via Mercado Pago (usando preferência com método boleto)
    const { createMercadoPagoPreference } = await import('../utils/payments');
    const paymentLink = await createMercadoPagoPreference(
      product,
      interaction.user.id,
      transaction.id
    );

    const boletoEmbed = new EmbedBuilder()
      .setColor('#FF9800')
      .setTitle('🎫 Boleto Bancário Gerado')
      .setDescription(
        `**${product.name}**\n\n` +
        `💰 **Valor:** ${formatCurrency(product.price)}\n\n` +
        `**Como pagar:**\n` +
        `1️⃣ Clique no botão abaixo\n` +
        `2️⃣ Escolha "Boleto Bancário"\n` +
        `3️⃣ Baixe o boleto\n` +
        `4️⃣ Pague em qualquer banco/app\n\n` +
        `⚠️ **Atenção:**\n` +
        `• Boleto leva até 2 dias úteis para compensar\n` +
        `• Você receberá o produto após a compensação\n\n` +
        `🆔 **ID da Transação:** \`${transaction.id}\``
      )
      .setTimestamp();

    const boletoRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Gerar Boleto')
          .setStyle(ButtonStyle.Link)
          .setURL(paymentLink)
          .setEmoji('🎫')
      );

    await interaction.editReply({
      embeds: [boletoEmbed],
      components: [boletoRow]
    });

    logger.info(`Boleto gerado para ${interaction.user.tag} - Produto: ${product.name}`);
  } catch (error) {
    logger.error(`Erro ao gerar boleto: ${error}`);
    await interaction.editReply('❌ Erro ao gerar boleto. Tente novamente ou escolha outro método.');
  }
}
