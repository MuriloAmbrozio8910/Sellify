/**
 * Handler de entrega de produtos após pagamento
 */

import { Client } from 'discord.js';
import { Product } from '../types';
import { getOrCreateGuildConfig } from '../utils/supabase';
import { addTemporaryRole } from '../utils/roleManager';
import { createPrivateChannel, sendTransactionLog } from '../utils/channelManager';
import { notifyBuyerPurchase, notifyAdminPurchase, notifyLowStock } from '../utils/logger';
import { logger } from '../utils/logger';

let discordClient: Client | null = null;

/**
 * Registrar cliente Discord
 */
export function setDiscordClient(client: Client) {
  discordClient = client;
}

/**
 * Entregar produto ao comprador
 */
export async function deliverProduct(
  guildId: string,
  userId: string,
  product: Product,
  transactionId: string
): Promise<void> {
  if (!discordClient) {
    logger.error('Cliente Discord não registrado no deliveryHandler');
    return;
  }

  try {
    const guild = await discordClient.guilds.fetch(guildId);
    const config = await getOrCreateGuildConfig(guildId);
    const user = await discordClient.users.fetch(userId);

    logger.info(`🚀 Iniciando entrega do produto ${product.name} para ${user.tag}`);

    // 1. Adicionar role se configurado
    if (product.role_id) {
      try {
        if (product.type === 'subscription') {
          // Role temporária de 30 dias para assinaturas
          await addTemporaryRole(guild, userId, product.role_id, 30);
          logger.success(`✅ Role temporária adicionada (30 dias)`);
        } else {
          // Role permanente para compras únicas
          const member = await guild.members.fetch(userId);
          await member.roles.add(product.role_id);
          logger.success(`✅ Role permanente adicionada`);
        }
      } catch (error) {
        logger.error(`Erro ao adicionar role: ${error}`);
      }
    }

    // 2. Criar canal privado se configurado
    if (config.sales_category_id) {
      try {
        const transaction = {
          id: transactionId,
          guild_id: guildId,
          product_id: product.id,
          user_id: userId,
          amount: product.price,
          status: 'completed' as any,
          payment_provider: 'stripe' as any,
          created_at: new Date(),
          updated_at: new Date()
        };

        await createPrivateChannel(guild, userId, product, transaction, config.sales_category_id);
        logger.success(`✅ Canal privado criado`);
      } catch (error) {
        logger.error(`Erro ao criar canal privado: ${error}`);
      }
    }

    // 3. Enviar DM com informações do produto
    try {
      await notifyBuyerPurchase(
        discordClient,
        userId,
        guildId,
        product.name,
        product.price,
        product.delivery_content
      );
      logger.success(`✅ DM enviada ao comprador`);
    } catch (error) {
      logger.warning(`Não foi possível enviar DM ao comprador: ${error}`);
    }

    // 4. Notificar admins
    if (config.log_channel_id) {
      try {
        await notifyAdminPurchase(
          discordClient,
          guild,
          config.log_channel_id,
          user.tag,
          product.name,
          product.price,
          transactionId
        );
        logger.success(`✅ Admins notificados`);
      } catch (error) {
        logger.error(`Erro ao notificar admins: ${error}`);
      }
    }

    // 5. Verificar estoque baixo
    if (product.stock !== null && product.stock !== undefined && config.log_channel_id) {
      try {
        await notifyLowStock(
          discordClient,
          guildId,
          config.log_channel_id,
          product.name,
          product.stock
        );
      } catch (error) {
        logger.error(`Erro ao verificar estoque: ${error}`);
      }
    }

    logger.success(`🎉 Entrega do produto ${product.name} concluída com sucesso!`);
  } catch (error) {
    logger.error(`Erro crítico na entrega do produto: ${error}`);
    throw error;
  }
}

/**
 * Remover acesso de produto (cancelamento/reembolso)
 */
export async function revokeProductAccess(
  guildId: string,
  userId: string,
  product: Product
): Promise<void> {
  if (!discordClient) {
    logger.error('Cliente Discord não registrado no deliveryHandler');
    return;
  }

  try {
    const guild = await discordClient.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);

    // Remover role se existir
    if (product.role_id) {
      await member.roles.remove(product.role_id);
      logger.success(`✅ Role removida do usuário ${member.user.tag}`);
    }

    // Notificar usuário
    try {
      const user = await discordClient.users.fetch(userId);
      await user.send(
        `⚠️ Seu acesso ao produto **${product.name}** foi removido.\n\n` +
        `Se você acredita que isso é um erro, entre em contato com os administradores do servidor.`
      );
    } catch (error) {
      logger.warning('Não foi possível enviar DM ao usuário');
    }

    logger.success(`🚫 Acesso revogado: ${product.name} do usuário ${userId}`);
  } catch (error) {
    logger.error(`Erro ao revogar acesso: ${error}`);
    throw error;
  }
}
