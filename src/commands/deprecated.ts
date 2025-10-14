/**
 * Comandos Deprecados
 * Redireciona usuários para o novo sistema de painéis
 */

import {
  ChatInputCommandInteraction,
  EmbedBuilder
} from 'discord.js';
import { COLORS, EMOJIS } from '../utils/designSystem';

/**
 * Mensagem padrão para comandos deprecados
 */
export async function showDeprecationMessage(
  interaction: ChatInputCommandInteraction,
  oldCommand: string,
  newPath: string,
  category: string
) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.WARNING)
    .setTitle(`${EMOJIS.WARNING} Comando Atualizado`)
    .setDescription(
      `O comando \`/${oldCommand}\` foi **movido para o painel interativo** para melhorar sua experiência!\n\n` +
      `${EMOJIS.SPARKLES} **Nova forma de acessar:**\n` +
      `\`\`\`\n/painel → ${category} → ${newPath}\n\`\`\``
    )
    .addFields(
      {
        name: `${EMOJIS.ROCKET} Por que mudamos?`,
        value: 
          `• Interface mais intuitiva e visual\n` +
          `• Navegação facilitada com botões\n` +
          `• Acesso rápido a múltiplas funções\n` +
          `• Menos comandos para decorar`,
        inline: false
      },
      {
        name: `${EMOJIS.INFO} Como usar agora?`,
        value: 
          `1. Digite \`/painel\`\n` +
          `2. Clique no botão **${category}**\n` +
          `3. Escolha a ação desejada\n\n` +
          `É mais rápido e fácil! ${EMOJIS.SPARKLES}`,
        inline: false
      }
    )
    .setFooter({ 
      text: 'Este comando será removido em breve. Atualize seus hábitos!' 
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], flags: 64 });
}

/**
 * Categorias e redirecionamentos
 */
export const DEPRECATION_MAP = {
  'adicionar-produto': {
    category: 'Produtos',
    newPath: 'Criar Produto',
    description: 'Criar novo produto no catálogo'
  },
  'editar-produto': {
    category: 'Produtos',
    newPath: 'Listar Produtos → Editar',
    description: 'Editar produto existente'
  },
  'remover-produto': {
    category: 'Produtos',
    newPath: 'Listar Produtos → Remover',
    description: 'Remover produto do catálogo'
  },
  'adicionar-cupom': {
    category: 'Cupons',
    newPath: 'Criar Cupom',
    description: 'Criar cupom de desconto'
  },
  'estatisticas': {
    category: 'Estatísticas',
    newPath: 'Ver Estatísticas',
    description: 'Visualizar estatísticas do servidor'
  }
} as const;
