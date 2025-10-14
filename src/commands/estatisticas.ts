/**
 * Comando /stats - Estatísticas de vendas
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from 'discord.js';
import { supabase } from '../utils/supabase';
import { formatCurrency } from '../utils/payments';
import { logger } from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('estatisticas')
  .setDescription('Ver estatísticas de vendas do servidor')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
  // Comando deprecado - redirecionar para o painel
  const { showDeprecationMessage } = await import('./deprecated');
  await showDeprecationMessage(
    interaction,
    'estatisticas',
    'Ver Estatísticas',
    'Estatísticas'
  );
  
  /* Código original mantido para referência
  try {
    await interaction.deferReply({ flags: 64 });

    const guildId = interaction.guildId!;

    // Buscar estatísticas gerais
    const { data: stats } = await supabase
      .from('guild_stats')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    // Buscar produtos mais vendidos
    const { data: topProducts } = await supabase
      .from('product_stats')
      .select('*')
      .eq('guild_id', guildId)
      .order('total_sales', { ascending: false })
      .limit(5);

    // Buscar transações recentes
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('guild_id', guildId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5);

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📊 Estatísticas de Vendas')
      .setDescription(`Estatísticas do servidor **${interaction.guild?.name}**`)
      .setTimestamp();

    // Estatísticas gerais
    if (stats) {
      embed.addFields(
        { 
          name: '📦 Produtos Ativos', 
          value: stats.active_products?.toString() || '0', 
          inline: true 
        },
        { 
          name: '💳 Total de Vendas', 
          value: stats.total_transactions?.toString() || '0', 
          inline: true 
        },
        { 
          name: '👥 Clientes Únicos', 
          value: stats.unique_customers?.toString() || '0', 
          inline: true 
        },
        { 
          name: '💰 Receita Total', 
          value: formatCurrency(parseFloat(stats.total_revenue) || 0), 
          inline: true 
        }
      );
    } else {
      embed.addFields({ 
        name: '📊 Estatísticas', 
        value: 'Nenhuma venda realizada ainda.', 
        inline: false 
      });
    }

    // Top produtos
    if (topProducts && topProducts.length > 0) {
      const topProductsText = topProducts
        .map((p, i) => `${i + 1}. **${p.name}** - ${p.total_sales} vendas (${formatCurrency(parseFloat(p.total_revenue) || 0)})`)
        .join('\n');
      
      embed.addFields({ 
        name: '🏆 Top 5 Produtos', 
        value: topProductsText, 
        inline: false 
      });
    }

    // Transações recentes
    if (recentTransactions && recentTransactions.length > 0) {
      const recentText = recentTransactions
        .map(t => `• <@${t.user_id}> - ${formatCurrency(t.amount)} - <t:${Math.floor(new Date(t.created_at).getTime() / 1000)}:R>`)
        .join('\n');
      
      embed.addFields({ 
        name: '🕐 Últimas 5 Vendas', 
        value: recentText, 
        inline: false 
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(`Erro ao buscar estatísticas: ${error}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await interaction.editReply({
      content: `❌ Erro ao buscar estatísticas: ${errorMessage}`
    });
  }
  */
}
