/**
 * Modais de Produto - Criar e Editar produtos via formulário
 */

import {
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { createProduct } from '../utils/supabase';
import { ProductType } from '../types';
import { logger } from '../utils/logger';

/**
 * Mostrar modal para adicionar produto
 */
export async function showAddProductModal(interaction: ChatInputCommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('addproduct_modal')
    .setTitle('📦 Adicionar Novo Produto');

  const nameInput = new TextInputBuilder()
    .setCustomId('product_name')
    .setLabel('Nome do Produto')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Curso de Discord.js')
    .setRequired(true)
    .setMaxLength(100);

  const descriptionInput = new TextInputBuilder()
    .setCustomId('product_description')
    .setLabel('Descrição do Produto')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Descreva o produto em detalhes...')
    .setRequired(true)
    .setMaxLength(1000);

  const priceInput = new TextInputBuilder()
    .setCustomId('product_price')
    .setLabel('Preço (apenas números, ex: 97.90)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('97.90')
    .setRequired(true)
    .setMaxLength(10);

  const imageInput = new TextInputBuilder()
    .setCustomId('product_image')
    .setLabel('URL da Imagem (opcional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://exemplo.com/imagem.png')
    .setRequired(false);

  const extraInput = new TextInputBuilder()
    .setCustomId('product_extra')
    .setLabel('Extras (tipo:unique ou subscription, estoque)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('tipo:unique, estoque:100')
    .setRequired(false);

  const rows = [
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(priceInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(extraInput),
  ];

  modal.addComponents(rows);

  await interaction.showModal(modal);
}

/**
 * Handler para quando o modal é submetido
 */
export async function handleAddProductModalSubmit(interaction: ModalSubmitInteraction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    // Pegar valores do modal
    const name = interaction.fields.getTextInputValue('product_name');
    const description = interaction.fields.getTextInputValue('product_description');
    const priceStr = interaction.fields.getTextInputValue('product_price');
    const image_url = interaction.fields.getTextInputValue('product_image') || undefined;
    const extraStr = interaction.fields.getTextInputValue('product_extra') || '';

    // Parse do preço
    const price = parseFloat(priceStr.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      await interaction.editReply({
        content: '❌ Preço inválido. Use apenas números e ponto/vírgula para decimais. Ex: 97.90'
      });
      return;
    }

    // Parse dos extras
    let type: ProductType = ProductType.UNIQUE;
    let stock: number | undefined = undefined;

    if (extraStr) {
      const extras = extraStr.split(',').map(e => e.trim());
      for (const extra of extras) {
        const [key, value] = extra.split(':').map(s => s.trim());
        if (key === 'tipo' && value === 'subscription') {
          type = ProductType.SUBSCRIPTION;
        } else if (key === 'estoque') {
          const stockNum = parseInt(value);
          if (!isNaN(stockNum) && stockNum >= 0) {
            stock = stockNum;
          }
        }
      }
    }

    // Criar produto
    const product = await createProduct({
      guild_id: interaction.guildId!,
      name,
      description,
      price,
      type,
      image_url,
      stock,
      is_active: true
    });

    logger.success(`Produto criado: ${product.name} (${product.id})`);

    // Embed de confirmação
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Produto Criado com Sucesso!')
      .setDescription(`O produto **${product.name}** foi adicionado ao catálogo.`)
      .addFields(
        { name: '💰 Preço', value: `R$ ${product.price.toFixed(2)}`, inline: true },
        { name: '📦 Tipo', value: type === ProductType.UNIQUE ? 'Único' : 'Assinatura', inline: true },
        { name: '🆔 ID', value: product.id.slice(0, 8), inline: true }
      )
      .setTimestamp();

    if (product.image_url) {
      embed.setThumbnail(product.image_url);
    }

    if (product.stock !== null && product.stock !== undefined) {
      embed.addFields({ name: '📊 Estoque', value: product.stock.toString(), inline: true });
    }

    // Botões de ação
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`view_catalog`)
          .setLabel('Ver Catálogo')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📋'),
        new ButtonBuilder()
          .setCustomId(`addproduct_again`)
          .setLabel('Adicionar Outro')
          .setStyle(ButtonStyle.Success)
          .setEmoji('➕')
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    logger.error(`Erro ao criar produto: ${error}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await interaction.editReply({
      content: `❌ Erro ao criar produto: ${errorMessage}`
    });
  }
}
