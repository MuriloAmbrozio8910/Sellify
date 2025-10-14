/**
 * Comando /editproduct - Editar produto existente
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits
} from 'discord.js';
import { getProductById } from '../utils/supabase';
import { showEditProductModal } from '../modals/productModal';

export const data = new SlashCommandBuilder()
  .setName('editar-produto')
  .setDescription('Editar um produto existente')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option
      .setName('id')
      .setDescription('ID do produto a ser editado')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  // Comando deprecado - redirecionar para o painel
  const { showDeprecationMessage } = await import('./deprecated');
  await showDeprecationMessage(
    interaction,
    'editar-produto',
    'Listar Produtos → Editar',
    'Produtos'
  );
}
