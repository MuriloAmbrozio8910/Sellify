/**
 * Evento: Bot adicionado a um servidor
 */

import { Guild, EmbedBuilder } from 'discord.js';
import { getOrCreateGuildConfig } from '../utils/supabase';
import { logger } from '../utils/logger';

export const name = 'guildCreate';

export async function execute(guild: Guild) {
  logger.success(`➕ Bot adicionado ao servidor: ${guild.name} (${guild.id})`);

  // Criar configuração padrão para o servidor
  await getOrCreateGuildConfig(guild.id);

  // Tentar enviar mensagem de boas-vindas
  try {
    const systemChannel = guild.systemChannel;
    if (systemChannel) {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🎉 Obrigado por me adicionar!')
        .setDescription(
          '**Sistema de Vendas Discord**\n\n' +
          'Eu sou um bot completo para gerenciar vendas de produtos e assinaturas no seu servidor!\n\n' +
          '**🚀 Para começar:**\n' +
          '1. Use `/config setup` para configuração automática\n' +
          '2. Use `/addproduct` para adicionar produtos\n' +
          '3. Use `/catalogo` para ver o catálogo\n' +
          '4. Use `/config view` para ver todas as configurações\n\n' +
          '**💡 Recursos:**\n' +
          '• Sistema de pagamentos (Stripe/Mercado Pago)\n' +
          '• Roles automáticas para compradores\n' +
          '• Canais privados para vendas\n' +
          '• Sistema de assinaturas\n' +
          '• Logs detalhados\n' +
          '• Cupons de desconto\n' +
          '• E muito mais!\n\n' +
          '**📚 Precisa de ajuda?**\n' +
          'Use `/config view` para ver o status atual da configuração.'
        )
        .setThumbnail(guild.client.user?.displayAvatarURL() || '')
        .setFooter({ text: 'Configure o bot usando /config setup' })
        .setTimestamp();

      await systemChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    logger.warning('Não foi possível enviar mensagem de boas-vindas');
  }
}
