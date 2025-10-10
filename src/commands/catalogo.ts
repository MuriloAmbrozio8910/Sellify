/**
 * Comando /catalogo - Exibir catálogo de produtos
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { getActiveProducts } from '../utils/supabase';
import { Product } from '../types';
import { formatCurrency } from '../utils/payments';
import { logger } from '../utils/logger';

const PRODUCTS_PER_PAGE = 5;

export const data = new SlashCommandBuilder()
  .setName('catalogo')
  .setDescription('Ver o catálogo de produtos disponíveis')
  .addIntegerOption(option =>
    option
      .setName('pagina')
      .setDescription('Número da página')
      .setRequired(false)
      .setMinValue(1)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply();

    const page = interaction.options.getInteger('pagina') || 1;
    const products = await getActiveProducts(interaction.guildId!);

    if (products.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🛒 Catálogo Vazio')
        .setDescription('Não há produtos disponíveis no momento.')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Paginação
    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const pageProducts = products.slice(startIndex, endIndex);

    // Criar embed do catálogo
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🛒 Catálogo de Produtos')
      .setDescription(`Navegue pelos produtos disponíveis e faça sua compra!\n\n**Total de produtos:** ${products.length}`)
      .setFooter({ text: `Página ${currentPage} de ${totalPages}` })
      .setTimestamp();

    // Adicionar produtos à página
    for (const product of pageProducts) {
      const stockText = product.stock !== null && product.stock !== undefined
        ? `📊 **Estoque:** ${product.stock}`
        : '📊 **Estoque:** Ilimitado';
      
      const typeText = product.type === 'subscription' 
        ? '🔄 Assinatura Mensal' 
        : '🛍️ Compra Única';

      embed.addFields({
        name: `${product.name} - ${formatCurrency(product.price)}`,
        value: `${product.description}\n\n${typeText} | ${stockText}\n🆔 ID: \`${product.id}\``,
        inline: false
      });
    }

    // Criar menu de seleção de produtos
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_product_catalog')
      .setPlaceholder('Selecione um produto para ver detalhes');

    for (const product of pageProducts) {
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(product.name)
          .setDescription(`${formatCurrency(product.price)} - ${product.type === 'subscription' ? 'Assinatura' : 'Único'}`)
          .setValue(product.id)
          .setEmoji(product.type === 'subscription' ? '🔄' : '🛍️')
      );
    }

    const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(selectMenu);

    // Botões de navegação
    const navigationRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`catalog_page_${currentPage - 1}`)
          .setLabel('◀ Anterior')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 1),
        new ButtonBuilder()
          .setCustomId(`catalog_refresh`)
          .setLabel('🔄 Atualizar')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`catalog_page_${currentPage + 1}`)
          .setLabel('Próximo ▶')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === totalPages)
      );

    await interaction.editReply({
      embeds: [embed],
      components: [selectRow, navigationRow]
    });

    logger.info(`Catálogo exibido para ${interaction.user.tag} - Página ${currentPage}`);
  } catch (error) {
    logger.error(`Erro ao exibir catálogo: ${error}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await interaction.editReply({
      content: `❌ Erro ao carregar catálogo: ${errorMessage}`
    });
  }
}

/**
 * Função auxiliar para criar embed de detalhes do produto
 */
export function createProductDetailEmbed(product: Product): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`🛍️ ${product.name}`)
    .setDescription(product.description)
    .addFields(
      { name: '💰 Preço', value: formatCurrency(product.price), inline: true },
      { 
        name: '📦 Tipo', 
        value: product.type === 'subscription' ? '🔄 Assinatura Mensal' : '🛍️ Compra Única', 
        inline: true 
      }
    )
    .setTimestamp();

  if (product.image_url) {
    embed.setImage(product.image_url);
  }

  if (product.stock !== null && product.stock !== undefined) {
    const stockEmoji = product.stock > 10 ? '✅' : product.stock > 0 ? '⚠️' : '❌';
    embed.addFields({ 
      name: '📊 Estoque', 
      value: `${stockEmoji} ${product.stock} unidades`, 
      inline: true 
    });
  } else {
    embed.addFields({ name: '📊 Estoque', value: '♾️ Ilimitado', inline: true });
  }

  if (product.role_id) {
    embed.addFields({ 
      name: '🎭 Acesso', 
      value: `Você receberá a role <@&${product.role_id}>`, 
      inline: false 
    });
  }

  return embed;
}
