/**
 * Gerenciador de canais do Discord
 */

import {
  Guild,
  ChannelType,
  PermissionFlagsBits,
  TextChannel,
  CategoryChannel,
  EmbedBuilder
} from 'discord.js';
import { Product, Transaction } from '../types';

/**
 * Cria canal privado para uma compra
 */
export async function createPrivateChannel(
  guild: Guild,
  userId: string,
  product: Product,
  transaction: Transaction,
  categoryId?: string
): Promise<TextChannel> {
  try {
    const channelName = `compra-${transaction.id.slice(0, 8)}`;

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId || null,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: userId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles
          ]
        }
      ]
    });

    // Enviar mensagem de boas-vindas
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎉 Compra Realizada com Sucesso!')
      .setDescription(`Obrigado por sua compra, <@${userId}>!`)
      .addFields(
        { name: '📦 Produto', value: product.name, inline: true },
        { name: '💰 Valor', value: `R$ ${product.price.toFixed(2)}`, inline: true },
        { name: '🆔 ID da Transação', value: transaction.id, inline: false }
      )
      .setTimestamp();

    if (product.delivery_content) {
      embed.addFields({
        name: '📥 Conteúdo',
        value: product.delivery_content,
        inline: false
      });
    }

    await channel.send({ embeds: [embed] });

    console.log(`✅ Canal privado criado: ${channelName}`);
    return channel;
  } catch (error) {
    console.error('Erro ao criar canal privado:', error);
    throw error;
  }
}

/**
 * Cria categoria de vendas
 */
export async function createSalesCategory(guild: Guild): Promise<CategoryChannel> {
  try {
    const category = await guild.channels.create({
      name: '🛒 VENDAS',
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        }
      ]
    });

    console.log(`✅ Categoria de vendas criada: ${category.name}`);
    return category;
  } catch (error) {
    console.error('Erro ao criar categoria de vendas:', error);
    throw error;
  }
}

/**
 * Cria canal de logs
 */
export async function createLogChannel(guild: Guild): Promise<TextChannel> {
  try {
    const channel = await guild.channels.create({
      name: '📊-vendas-log',
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        }
      ]
    });

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📊 Canal de Logs de Vendas')
      .setDescription('Todas as transações e atividades de vendas serão registradas aqui.')
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    console.log(`✅ Canal de logs criado: ${channel.name}`);
    return channel;
  } catch (error) {
    console.error('Erro ao criar canal de logs:', error);
    throw error;
  }
}

/**
 * Envia log de transação
 */
export async function sendTransactionLog(
  guild: Guild,
  logChannelId: string,
  transaction: Transaction,
  product: Product,
  userTag: string
): Promise<void> {
  try {
    const channel = await guild.channels.fetch(logChannelId) as TextChannel;
    if (!channel) return;

    const statusEmoji = {
      pending: '⏳',
      completed: '✅',
      failed: '❌',
      refunded: '↩️',
      cancelled: '🚫'
    };

    const embed = new EmbedBuilder()
      .setColor(transaction.status === 'completed' ? '#00FF00' : '#FFA500')
      .setTitle(`${statusEmoji[transaction.status]} Nova Transação`)
      .addFields(
        { name: '👤 Comprador', value: userTag, inline: true },
        { name: '📦 Produto', value: product.name, inline: true },
        { name: '💰 Valor', value: `R$ ${transaction.amount.toFixed(2)}`, inline: true },
        { name: '📊 Status', value: transaction.status.toUpperCase(), inline: true },
        { name: '💳 Método', value: transaction.payment_provider, inline: true },
        { name: '🆔 ID', value: transaction.id, inline: true }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Erro ao enviar log de transação:', error);
  }
}

/**
 * Adiciona permissão de visualização para um usuário em um canal
 */
export async function addChannelPermission(
  channel: TextChannel,
  userId: string
): Promise<void> {
  try {
    await channel.permissionOverwrites.create(userId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });

    console.log(`✅ Permissão adicionada ao canal ${channel.name} para usuário ${userId}`);
  } catch (error) {
    console.error('Erro ao adicionar permissão ao canal:', error);
    throw error;
  }
}

/**
 * Cria canal privado de compra (ticket) - antes do pagamento
 */
export async function createPurchaseTicketChannel(
  guild: Guild,
  userId: string,
  productName: string,
  categoryId?: string
): Promise<TextChannel> {
  try {
    const timestamp = Date.now().toString(36).slice(-6);
    const channelName = `🛒・${productName.toLowerCase().replace(/\s+/g, '-').substring(0, 20)}-${timestamp}`;

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId || null,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: userId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks
          ]
        }
      ]
    });

    console.log(`✅ Canal de compra criado: ${channelName}`);
    return channel;
  } catch (error) {
    console.error('Erro ao criar canal de compra:', error);
    throw error;
  }
}

/**
 * Deleta canal após um tempo (em ms)
 */
export async function deleteChannelAfterDelay(
  channel: TextChannel,
  delayMs: number = 300000 // 5 minutos padrão
): Promise<void> {
  setTimeout(async () => {
    try {
      await channel.delete();
      console.log(`✅ Canal ${channel.name} deletado automaticamente`);
    } catch (error) {
      console.error(`Erro ao deletar canal ${channel.name}:`, error);
    }
  }, delayMs);
}
