/**
 * Comando /removeproduct - Remover produto
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { getProductById, deleteProduct } from '../utils/supabase';
import { logger } from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('remover-produto')
  .setDescription('Remover um produto do catálogo')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option
      .setName('id')
      .setDescription('ID do produto a ser removido')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ flags: 64 });

    const productId = interaction.options.getString('id', true);

    // Buscar produto
    const product = await getProductById(productId);
    if (!product) {
      await interaction.editReply('❌ Produto não encontrado.');
      return;
    }

    // Verificar se o produto pertence ao servidor
    if (product.guild_id !== interaction.guildId) {
      await interaction.editReply('❌ Este produto não pertence a este servidor.');
      return;
    }

    // Criar embed de confirmação
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('⚠️ Confirmar Remoção')
      .setDescription(`Tem certeza que deseja remover o produto **${product.name}**?`)
      .addFields(
        { name: '💰 Preço', value: `R$ ${product.price.toFixed(2)}`, inline: true },
        { name: '🆔 ID', value: product.id, inline: true }
      )
      .setFooter({ text: 'Esta ação não pode ser desfeita!' })
      .setTimestamp();

    if (product.image_url) {
      embed.setThumbnail(product.image_url);
    }

    // Botões de confirmação
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_delete_${productId}`)
          .setLabel('Sim, Remover')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🗑️'),
        new ButtonBuilder()
          .setCustomId(`cancel_delete_${productId}`)
          .setLabel('Cancelar')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('❌')
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    logger.error(`Erro ao remover produto: ${error}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await interaction.editReply({
      content: `❌ Erro ao remover produto: ${errorMessage}`
    });
  }
}

/**
 * Função auxiliar para executar a remoção confirmada
 */
export async function confirmDelete(productId: string): Promise<void> {
  await deleteProduct(productId);
  logger.success(`Produto removido: ${productId}`);
}
