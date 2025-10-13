/**
 * Modais e ações de Produto - criação, edição e atalhos
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import {
  createProduct,
  updateProduct,
  getActiveProducts,
  getProductById
} from '../utils/supabase';
import { Product, ProductType } from '../types';
import { logger } from '../utils/logger';
import { formatCurrency } from '../utils/payments';

const ADD_PRODUCT_MODAL_ID = 'addproduct_modal';
const EDIT_PRODUCT_MODAL_PREFIX = 'editproduct_modal_';
const EXTRAS_PRODUCT_MODAL_PREFIX = 'product_extras_modal_';

type ModalTriggerInteraction = ChatInputCommandInteraction | ButtonInteraction;

interface ProductBasicsPayload {
  name: string;
  description: string;
  price: number;
  type: ProductType;
  stock?: number;
}

interface ProductExtrasPayload {
  image_url?: string;
  role_id?: string;
  delivery_content?: string;
}

function isButton(interaction: ModalTriggerInteraction): interaction is ButtonInteraction {
  return interaction instanceof ButtonInteraction;
}

function buildProductModal(customId: string, title: string, defaults?: Partial<Product>): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title);

  const nameInput = new TextInputBuilder()
    .setCustomId('product_name')
    .setLabel('Nome do Produto')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Curso de Discord.js')
    .setRequired(true)
    .setMaxLength(100);

  if (defaults?.name) {
    nameInput.setValue(defaults.name);
  }

  const descriptionInput = new TextInputBuilder()
    .setCustomId('product_description')
    .setLabel('Descrição do Produto')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Descreva o produto em detalhes...')
    .setRequired(true)
    .setMaxLength(1000);

  if (defaults?.description) {
    descriptionInput.setValue(defaults.description);
  }

  const priceInput = new TextInputBuilder()
    .setCustomId('product_price')
    .setLabel('Preço (ex: 97.90)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Apenas números, com ponto ou vírgula')
    .setRequired(true)
    .setMaxLength(12);

  if (typeof defaults?.price === 'number') {
    priceInput.setValue(defaults.price.toString());
  }

  const typeInput = new TextInputBuilder()
    .setCustomId('product_type')
    .setLabel('Tipo (unique ou subscription)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(15)
    .setValue(defaults?.type === ProductType.SUBSCRIPTION ? 'subscription' : 'unique');

  const stockInput = new TextInputBuilder()
    .setCustomId('product_stock')
    .setLabel('Estoque (deixe vazio para ilimitado)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 100')
    .setRequired(false)
    .setMaxLength(10);

  if (defaults?.stock !== null && typeof defaults?.stock !== 'undefined') {
    stockInput.setValue(defaults.stock.toString());
  }

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(priceInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(typeInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(stockInput)
  );

  return modal;
}

function buildExtrasModal(product: Product): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId(`${EXTRAS_PRODUCT_MODAL_PREFIX}${product.id}`)
    .setTitle('🎯 Detalhes Extras do Produto');

  const imageInput = new TextInputBuilder()
    .setCustomId('product_image')
    .setLabel('URL da imagem (opcional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://exemplo.com/imagem.png')
    .setRequired(false)
    .setMaxLength(200);

  if (product.image_url) {
    imageInput.setValue(product.image_url);
  }

  const roleInput = new TextInputBuilder()
    .setCustomId('product_role')
    .setLabel('ID ou menção da role (opcional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: @Compradores')
    .setRequired(false)
    .setMaxLength(100);

  if (product.role_id) {
    roleInput.setValue(`<@&${product.role_id}>`);
  }

  const deliveryInput = new TextInputBuilder()
    .setCustomId('product_delivery')
    .setLabel('Conteúdo de entrega (opcional)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Link, código ou mensagem enviada após a compra.')
    .setRequired(false)
    .setMaxLength(1000);

  if (product.delivery_content) {
    deliveryInput.setValue(product.delivery_content);
  }

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(roleInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(deliveryInput)
  );

  return modal;
}

function parsePrice(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  const price = Number.parseFloat(normalized);
  if (Number.isNaN(price) || price <= 0) {
    return null;
  }
  return Number.parseFloat(price.toFixed(2));
}

function parseProductType(raw: string): ProductType | null {
  const normalized = raw.trim().toLowerCase();
  if (['unique', 'unico', 'único', 'one'].includes(normalized)) {
    return ProductType.UNIQUE;
  }
  if (['subscription', 'assinatura', 'recorrente', 'sub'].includes(normalized)) {
    return ProductType.SUBSCRIPTION;
  }
  return null;
}

function parseStock(raw: string): number | undefined | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  const value = Number.parseInt(trimmed, 10);
  if (Number.isNaN(value) || value < 0) {
    return null;
  }

  return value;
}

function parseRole(raw: string): string | undefined | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  const mentionMatch = trimmed.match(/^<@&(\d+)>$/);
  if (mentionMatch) {
    return mentionMatch[1];
  }

  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function mapBasics(interaction: ModalSubmitInteraction): ProductBasicsPayload | { error: string } {
  const name = interaction.fields.getTextInputValue('product_name').trim();
  const description = interaction.fields.getTextInputValue('product_description').trim();
  const priceRaw = interaction.fields.getTextInputValue('product_price');
  const typeRaw = interaction.fields.getTextInputValue('product_type');
  const stockRaw = interaction.fields.getTextInputValue('product_stock');

  const price = parsePrice(priceRaw);
  if (price === null) {
    return { error: '❌ Preço inválido. Use apenas números (ex: 97.90).' };
  }

  const type = parseProductType(typeRaw);
  if (!type) {
    return { error: '❌ Tipo inválido. Use "unique" ou "subscription".' };
  }

  const stockParsed = parseStock(stockRaw);
  if (stockParsed === null) {
    return { error: '❌ Estoque inválido. Use apenas números inteiros maiores ou iguais a zero.' };
  }

  return {
    name,
    description,
    price,
    type,
    stock: stockParsed
  };
}

function mapExtras(interaction: ModalSubmitInteraction): ProductExtrasPayload | { error: string } {
  const imageRaw = interaction.fields.getTextInputValue('product_image')?.trim() ?? '';
  const roleRaw = interaction.fields.getTextInputValue('product_role')?.trim() ?? '';
  const deliveryRaw = interaction.fields.getTextInputValue('product_delivery')?.trim() ?? '';

  let image_url: string | undefined;
  if (imageRaw) {
    if (!/^https?:\/\//i.test(imageRaw)) {
      return { error: '❌ URL da imagem inválida. Use uma URL que comece com http:// ou https://.' };
    }
    image_url = imageRaw;
  }

  let role_id: string | undefined;
  if (roleRaw) {
    const roleParsed = parseRole(roleRaw);
    if (roleParsed === null) {
      return { error: '❌ Role inválida. Mencione a role ou informe o ID numérico.' };
    }
    role_id = roleParsed;
  }

  const delivery_content = deliveryRaw || undefined;

  return {
    image_url,
    role_id,
    delivery_content
  };
}

function buildProductSummaryEmbed(product: Product, title: string): EmbedBuilder {
  const typeLabel = product.type === ProductType.SUBSCRIPTION ? '🔄 Assinatura' : '🛍️ Compra Única';
  const stockLabel = product.stock !== null && typeof product.stock !== 'undefined'
    ? `${product.stock} unidade(s)`
    : 'Ilimitado';

  const embed = new EmbedBuilder()
    .setColor('#00B894')
    .setTitle(title)
    .setDescription(product.description)
    .addFields(
      { name: '💡 Produto', value: product.name, inline: true },
      { name: '💰 Preço', value: formatCurrency(product.price), inline: true },
      { name: '📦 Tipo', value: typeLabel, inline: true },
      { name: '📊 Estoque', value: stockLabel, inline: true }
    )
    .setFooter({ text: `ID: ${product.id}` })
    .setTimestamp();

  if (product.image_url) {
    embed.setThumbnail(product.image_url);
  }

  if (product.role_id) {
    embed.addFields({ name: '🎭 Role atribuída', value: `<@&${product.role_id}>`, inline: true });
  }

  if (product.delivery_content) {
    embed.addFields({ name: '📦 Entrega automática', value: product.delivery_content.substring(0, 1024) });
  }

  return embed;
}

function buildCatalogPreviewEmbed(products: Product[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('🛒 Catálogo (visualização rápida)')
    .setDescription('Use `/catalogo` para ver o catálogo completo.')
    .setTimestamp();

  if (products.length === 0) {
    embed.setDescription('Nenhum produto ativo no momento.');
    return embed;
  }

  for (const product of products.slice(0, 5)) {
    const typeLabel = product.type === ProductType.SUBSCRIPTION ? '🔄 Assinatura' : '🛍️ Único';
    const stockLabel = product.stock !== null && typeof product.stock !== 'undefined'
      ? `${product.stock} unidades`
      : 'Ilimitado';

    embed.addFields({
      name: `${product.name} — ${formatCurrency(product.price)}`,
      value: `${typeLabel} | 📊 ${stockLabel} | 🆔 \`${product.id.slice(0, 8)}\``,
      inline: false
    });
  }

  return embed;
}

async function presentModal(interaction: ModalTriggerInteraction, modal: ModalBuilder) {
  if (isButton(interaction)) {
    await interaction.showModal(modal);
  } else {
    await interaction.showModal(modal);
  }
}

export async function showAddProductModal(interaction: ModalTriggerInteraction) {
  const modal = buildProductModal(ADD_PRODUCT_MODAL_ID, '📦 Novo Produto');
  await presentModal(interaction, modal);
}

export async function showEditProductModal(
  interaction: ModalTriggerInteraction,
  product: Product
) {
  const modal = buildProductModal(`${EDIT_PRODUCT_MODAL_PREFIX}${product.id}`, '✏️ Editar Produto', product);
  await presentModal(interaction, modal);
}

async function showExtrasModal(interaction: ModalTriggerInteraction, product: Product) {
  const modal = buildExtrasModal(product);
  await presentModal(interaction, modal);
}

export async function handleAddProductModalSubmit(interaction: ModalSubmitInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({ content: '❌ Esta ação só pode ser usada dentro de um servidor.', ephemeral: true });
    return;
  }

  const basics = mapBasics(interaction);
  if ('error' in basics) {
    await interaction.reply({ content: basics.error, ephemeral: true });
    return;
  }

  await interaction.deferReply({ flags: 64 });

  try {
    const product = await createProduct({
      guild_id: interaction.guildId,
      name: basics.name,
      description: basics.description,
      price: basics.price,
      type: basics.type,
      stock: basics.stock,
      is_active: true
    });

    logger.success(`Produto criado: ${product.name} (${product.id})`);

    const embed = buildProductSummaryEmbed(product, '✅ Produto criado com sucesso!');

    const actionsRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('product_add_another')
          .setLabel('Adicionar outro')
          .setStyle(ButtonStyle.Success)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('product_view_catalog')
          .setLabel('Ver catálogo')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📋'),
        new ButtonBuilder()
          .setCustomId(`product_edit_extras_${product.id}`)
          .setLabel('Detalhes extras')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🎯')
      );

    await interaction.editReply({ embeds: [embed], components: [actionsRow] });
  } catch (error) {
    logger.error(`Erro ao criar produto: ${error}`);
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    await interaction.editReply({ content: `❌ Erro ao criar produto: ${message}` });
  }
}

export async function handleEditProductModalSubmit(interaction: ModalSubmitInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({ content: '❌ Esta ação só pode ser usada dentro de um servidor.', ephemeral: true });
    return;
  }

  if (!interaction.customId.startsWith(EDIT_PRODUCT_MODAL_PREFIX)) {
    return;
  }

  const productId = interaction.customId.replace(EDIT_PRODUCT_MODAL_PREFIX, '');
  const product = await getProductById(productId);

  if (!product || product.guild_id !== interaction.guildId) {
    await interaction.reply({ content: '❌ Produto não encontrado ou pertence a outro servidor.', ephemeral: true });
    return;
  }

  const basics = mapBasics(interaction);
  if ('error' in basics) {
    await interaction.reply({ content: basics.error, ephemeral: true });
    return;
  }

  await interaction.deferReply({ flags: 64 });

  try {
    const updated = await updateProduct(productId, {
      name: basics.name,
      description: basics.description,
      price: basics.price,
      type: basics.type,
      stock: basics.stock
    });

    const embed = buildProductSummaryEmbed(updated, '✏️ Produto atualizado!');
    const actionsRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`product_edit_extras_${updated.id}`)
          .setLabel('Editar detalhes extras')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🎯'),
        new ButtonBuilder()
          .setCustomId('product_view_catalog')
          .setLabel('Ver catálogo')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📋')
      );

    await interaction.editReply({ embeds: [embed], components: [actionsRow] });
  } catch (error) {
    logger.error(`Erro ao atualizar produto: ${error}`);
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    await interaction.editReply({ content: `❌ Erro ao atualizar produto: ${message}` });
  }
}

export async function handleProductExtrasModalSubmit(interaction: ModalSubmitInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({ content: '❌ Esta ação só pode ser usada dentro de um servidor.', ephemeral: true });
    return;
  }

  if (!interaction.customId.startsWith(EXTRAS_PRODUCT_MODAL_PREFIX)) {
    return;
  }

  const productId = interaction.customId.replace(EXTRAS_PRODUCT_MODAL_PREFIX, '');
  const product = await getProductById(productId);

  if (!product || product.guild_id !== interaction.guildId) {
    await interaction.reply({ content: '❌ Produto não encontrado ou pertence a outro servidor.', ephemeral: true });
    return;
  }

  const extras = mapExtras(interaction);
  if ('error' in extras) {
    await interaction.reply({ content: extras.error, ephemeral: true });
    return;
  }

  await interaction.deferReply({ flags: 64 });

  try {
    const updated = await updateProduct(productId, {
      image_url: extras.image_url,
      role_id: extras.role_id,
      delivery_content: extras.delivery_content
    });

    const embed = buildProductSummaryEmbed(updated, '🎯 Detalhes do produto atualizados!');
    const actionsRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`product_edit_extras_${updated.id}`)
          .setLabel('Editar novamente')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('♻️'),
        new ButtonBuilder()
          .setCustomId('product_view_catalog')
          .setLabel('Ver catálogo')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📋')
      );

    await interaction.editReply({ embeds: [embed], components: [actionsRow] });
  } catch (error) {
    logger.error(`Erro ao salvar detalhes extras: ${error}`);
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    await interaction.editReply({ content: `❌ Erro ao salvar detalhes extras: ${message}` });
  }
}

export async function handleProductActionButton(interaction: ButtonInteraction) {
  const { customId } = interaction;

  if (customId === 'product_add_another') {
    await showAddProductModal(interaction);
    return;
  }

  if (customId === 'product_view_catalog') {
    await interaction.deferReply({ flags: 64 });

    try {
      const products = await getActiveProducts(interaction.guildId!);
      const embed = buildCatalogPreviewEmbed(products);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error(`Erro ao listar catálogo: ${error}`);
      const message = error instanceof Error ? error.message : 'Erro desconhecido.';
      await interaction.editReply({ content: `❌ Erro ao carregar catálogo: ${message}` });
    }

    return;
  }

  if (customId.startsWith('product_edit_extras_')) {
    const productId = customId.replace('product_edit_extras_', '');
    const product = await getProductById(productId);

    if (!product || product.guild_id !== interaction.guildId) {
      await interaction.reply({ content: '❌ Produto não encontrado ou pertence a outro servidor.', ephemeral: true });
      return;
    }

    await showExtrasModal(interaction, product);
  }
}
