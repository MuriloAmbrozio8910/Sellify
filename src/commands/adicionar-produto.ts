/**
 * Comando /addproduct - Adicionar novo produto (com Modal)
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits
} from 'discord.js';
import { showAddProductModal } from '../modals/productModal';

export const data = new SlashCommandBuilder()
  .setName('adicionar-produto')
  .setDescription('Adicionar novo produto ao catálogo')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
  // Comando deprecado - redirecionar para o painel
  const { showDeprecationMessage } = await import('./deprecated');
  await showDeprecationMessage(
    interaction,
    'adicionar-produto',
    'Criar Produto',
    'Produtos'
  );
}
