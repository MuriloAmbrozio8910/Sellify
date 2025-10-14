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
  // Comando deprecado - redirecionar para o painel
  const { showDeprecationMessage } = await import('./deprecated');
  await showDeprecationMessage(
    interaction,
    'adicionar-cupom',
    'Criar Cupom',
    'Cupons'
  );
}
