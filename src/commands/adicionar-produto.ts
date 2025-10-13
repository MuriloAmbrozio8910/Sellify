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
  // Verificar permissão de administrador
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '❌ Você precisa de permissão de administrador para adicionar produtos.',
      ephemeral: true
    });
    return;
  }

  // Mostrar modal para entrada de dados
  await showAddProductModal(interaction);
}
