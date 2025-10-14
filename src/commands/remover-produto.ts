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
  // Comando deprecado - redirecionar para o painel
  const { showDeprecationMessage } = await import('./deprecated');
  await showDeprecationMessage(
    interaction,
    'remover-produto',
    'Listar Produtos → Remover',
    'Produtos'
  );
}

/**
 * Função auxiliar para executar a remoção confirmada
 */
export async function confirmDelete(productId: string): Promise<void> {
  await deleteProduct(productId);
  logger.success(`Produto removido: ${productId}`);
}
