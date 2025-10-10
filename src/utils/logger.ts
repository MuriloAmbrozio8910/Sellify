/**
 * Sistema de logs e notificações
 */

import { Client, EmbedBuilder, TextChannel, Guild } from 'discord.js';
import { Notification } from '../types';
import { createAccessLog } from './supabase';

/**
 * Envia notificação para um canal ou usuário
 */
export async function sendNotification(
  client: Client,
  notification: Notification
): Promise<void> {
  try {
    const embed = new EmbedBuilder()
      .setColor(notification.color || 0x5865F2)
      .setTitle(notification.title)
      .setDescription(notification.description)
      .setTimestamp();

    if (notification.fields) {
      embed.addFields(notification.fields);
    }

    if (notification.thumbnail) {
      embed.setThumbnail(notification.thumbnail);
    }

    if (notification.image) {
      embed.setImage(notification.image);
    }

    // Enviar para canal
    if (notification.channel_id) {
      const channel = await client.channels.fetch(notification.channel_id) as TextChannel;
      if (channel) {
        await channel.send({ embeds: [embed] });
      }
    }

    // Enviar DM para usuário
    if (notification.user_id) {
      try {
        const user = await client.users.fetch(notification.user_id);
        await user.send({ embeds: [embed] });
      } catch (error) {
        console.error('Não foi possível enviar DM ao usuário:', error);
      }
    }
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}

/**
 * Registra ação no log
 */
export async function logAction(
  guildId: string,
  userId: string,
  action: string,
  details?: string,
  productId?: string
): Promise<void> {
  try {
    await createAccessLog({
      guild_id: guildId,
      user_id: userId,
      action,
      details,
      product_id: productId
    });

    console.log(`📝 Log: [${guildId}] ${userId} - ${action}`);
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
}

/**
 * Envia notificação de compra para admin
 */
export async function notifyAdminPurchase(
  client: Client,
  guild: Guild,
  logChannelId: string,
  buyerTag: string,
  productName: string,
  amount: number,
  transactionId: string
): Promise<void> {
  await sendNotification(client, {
    guild_id: guild.id,
    channel_id: logChannelId,
    title: '💰 Nova Compra Realizada!',
    description: `Um novo produto foi comprado no servidor.`,
    color: 0x00FF00,
    fields: [
      { name: '👤 Comprador', value: buyerTag, inline: true },
      { name: '📦 Produto', value: productName, inline: true },
      { name: '💵 Valor', value: `R$ ${amount.toFixed(2)}`, inline: true },
      { name: '🆔 ID da Transação', value: transactionId, inline: false }
    ]
  });
}

/**
 * Envia notificação de compra para comprador
 */
export async function notifyBuyerPurchase(
  client: Client,
  userId: string,
  guildId: string,
  productName: string,
  amount: number,
  deliveryContent?: string
): Promise<void> {
  const fields = [
    { name: '📦 Produto', value: productName, inline: true },
    { name: '💰 Valor Pago', value: `R$ ${amount.toFixed(2)}`, inline: true }
  ];

  if (deliveryContent) {
    fields.push({
      name: '📥 Conteúdo/Acesso',
      value: deliveryContent,
      inline: false
    });
  }

  await sendNotification(client, {
    guild_id: guildId,
    user_id: userId,
    title: '🎉 Compra Confirmada!',
    description: 'Sua compra foi processada com sucesso!',
    color: 0x00FF00,
    fields
  });
}

/**
 * Envia notificação de estoque baixo
 */
export async function notifyLowStock(
  client: Client,
  guildId: string,
  logChannelId: string,
  productName: string,
  currentStock: number
): Promise<void> {
  if (currentStock > 5) return; // Só notifica se estoque <= 5

  await sendNotification(client, {
    guild_id: guildId,
    channel_id: logChannelId,
    title: '⚠️ Estoque Baixo',
    description: `O produto **${productName}** está com estoque baixo!`,
    color: 0xFFA500,
    fields: [
      { name: '📦 Produto', value: productName, inline: true },
      { name: '📊 Estoque Atual', value: currentStock.toString(), inline: true }
    ]
  });
}

/**
 * Envia notificação de assinatura expirando
 */
export async function notifySubscriptionExpiring(
  client: Client,
  userId: string,
  guildId: string,
  productName: string,
  daysRemaining: number
): Promise<void> {
  await sendNotification(client, {
    guild_id: guildId,
    user_id: userId,
    title: '⏰ Assinatura Expirando',
    description: `Sua assinatura do produto **${productName}** está próxima do vencimento.`,
    color: 0xFFA500,
    fields: [
      { name: '📦 Produto', value: productName, inline: true },
      { name: '⏳ Dias Restantes', value: daysRemaining.toString(), inline: true }
    ]
  });
}

/**
 * Console log colorido
 */
export const logger = {
  info: (message: string) => console.log(`\x1b[36m[INFO]\x1b[0m ${message}`),
  success: (message: string) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`),
  warning: (message: string) => console.log(`\x1b[33m[WARNING]\x1b[0m ${message}`),
  error: (message: string) => console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`),
  debug: (message: string) => console.log(`\x1b[35m[DEBUG]\x1b[0m ${message}`)
};
