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
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '❌ Você precisa ser administrador para editar produtos.',
      flags: 64
    });
    return;
  }

  const productId = interaction.options.getString('id', true);

  const product = await getProductById(productId);
  if (!product || product.guild_id !== interaction.guildId) {
    await interaction.reply({
      content: '❌ Produto não encontrado ou pertence a outro servidor.',
      flags: 64
    });
    return;
  }

  await showEditProductModal(interaction, product);
}
