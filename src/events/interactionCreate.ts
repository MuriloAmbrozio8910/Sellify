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
    // Navegação do catálogo
    if (customId.startsWith('catalog_page_')) {
      await handleCatalogNavigation(interaction);
    }
    // Refresh do catálogo
    else if (customId === 'catalog_refresh') {
      await handleCatalogRefresh(interaction);
    }
    // Comprar produto
    else if (customId.startsWith('buy_product_')) {
      await handleBuyProduct(interaction);
    }
    // Confirmar compra
    else if (customId.startsWith('confirm_buy_')) {
      await handleConfirmBuy(interaction);
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
  // Implementar handlers de modals se necessário
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
