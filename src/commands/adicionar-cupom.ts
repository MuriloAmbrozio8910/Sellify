/**
 * Comando /addcoupon - Criar cupom de desconto
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits
} from 'discord.js';
import { showAddCouponModal } from '../modals/couponModal';

export const data = new SlashCommandBuilder()
  .setName('adicionar-cupom')
  .setDescription('Criar um cupom de desconto')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '❌ Você precisa ser administrador para criar cupons.',
      flags: 64
    });
    return;
  }

  await showAddCouponModal(interaction);
}
