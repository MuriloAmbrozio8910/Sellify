/**
 * Comando /myorders - Ver minhas compras
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js';
import { getUserTransactions, getProductById } from '../utils/supabase';
import { formatCurrency } from '../utils/payments';
import { logger } from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('meus-pedidos')
  .setDescription('Ver suas compras neste servidor');

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ flags: 64 });

    const transactions = await getUserTransactions(
      interaction.guildId!,
      interaction.user.id
    );

    if (transactions.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('📦 Suas Compras')
        .setDescription('Você ainda não realizou nenhuma compra neste servidor.')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📦 Suas Compras')
      .setDescription(`Você tem **${transactions.length}** compra(s) neste servidor.`)
      .setTimestamp();

    // Mostrar até 10 transações
    const displayTransactions = transactions.slice(0, 10);

    for (const transaction of displayTransactions) {
      const product = await getProductById(transaction.product_id);
      const productName = product?.name || 'Produto desconhecido';
      
      const statusEmoji = {
        pending: '⏳',
        completed: '✅',
        failed: '❌',
        refunded: '↩️',
        cancelled: '🚫'
      };

      const statusText = {
        pending: 'Pendente',
        completed: 'Concluído',
        failed: 'Falhou',
        refunded: 'Reembolsado',
        cancelled: 'Cancelado'
      };

      const date = new Date(transaction.created_at);
      const timestamp = Math.floor(date.getTime() / 1000);

      embed.addFields({
        name: `${statusEmoji[transaction.status]} ${productName}`,
        value: 
          `**Valor:** ${formatCurrency(transaction.amount)}\n` +
          `**Status:** ${statusText[transaction.status]}\n` +
          `**Data:** <t:${timestamp}:F>\n` +
          `**ID:** \`${transaction.id}\``,
        inline: false
      });
    }

    if (transactions.length > 10) {
      embed.setFooter({ 
        text: `Mostrando 10 de ${transactions.length} compras` 
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(`Erro ao buscar compras: ${error}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await interaction.editReply({
      content: `❌ Erro ao buscar suas compras: ${errorMessage}`
    });
  }
}
