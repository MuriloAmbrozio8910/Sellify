/**
 * Comando /setup-catalog - Criar catálogo fixo permanente em um canal
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  TextChannel,
  PermissionFlagsBits
} from 'discord.js';
import { getActiveProducts, updateGuildConfig } from '../utils/supabase';
import { formatCurrency } from '../utils/payments';
import { logger } from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('setup-catalog')
  .setDescription('Configurar catálogo permanente em um canal')
  .addChannelOption(option =>
    option
      .setName('canal')
      .setDescription('Canal onde o catálogo será fixado')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel('canal') as TextChannel;
    
    if (!channel) {
      await interaction.editReply('❌ Canal inválido.');
      return;
    }

    // Buscar produtos ativos
    const products = await getActiveProducts(interaction.guildId!);

    if (products.length === 0) {
      await interaction.editReply('❌ Não há produtos cadastrados. Adicione produtos antes de configurar o catálogo.');
      return;
    }

    // Criar embed principal do catálogo
    const catalogEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🛒 Catálogo de Produtos')
      .setDescription(
        '**Bem-vindo à nossa loja!**\n\n' +
        'Clique em um dos botões abaixo para ver os produtos disponíveis e fazer sua compra.\n\n' +
        '💳 **Métodos de pagamento aceitos:**\n' +
        '• PIX (Aprovação instantânea)\n' +
        '• Boleto Bancário\n' +
        '• Cartão de Crédito\n\n' +
        '✨ **Como comprar:**\n' +
        '1. Clique na categoria desejada\n' +
        '2. Um canal privado será criado para você\n' +
        '3. Escolha o método de pagamento\n' +
        '4. Receba seu produto automaticamente!'
      )
      .setThumbnail(interaction.guild?.iconURL() || undefined)
      .setFooter({ text: `${products.length} produto(s) disponível(is)` })
      .setTimestamp();

    // Agrupar produtos por categoria (usando primeira palavra do nome como categoria)
    const categories = new Map<string, typeof products>();
    
    products.forEach(product => {
      // Simplificado: usar type como categoria
      const category = product.type === 'subscription' ? '🔄 Assinaturas' : '🛍️ Produtos';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(product);
    });

    // Criar botões por categoria
    const buttons: ButtonBuilder[] = [];
    let buttonIndex = 0;

    for (const [categoryName, categoryProducts] of categories) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`catalog_category_${buttonIndex}`)
          .setLabel(`${categoryName} (${categoryProducts.length})`)
          .setStyle(ButtonStyle.Primary)
          .setEmoji(categoryName.includes('Assinatura') ? '🔄' : '🛍️')
      );
      buttonIndex++;
    }

    // Adicionar botão de produtos individuais
    const individualButtons: ButtonBuilder[] = [];
    
    // Limitar a 5 produtos principais
    const topProducts = products.slice(0, 5);
    topProducts.forEach(product => {
      individualButtons.push(
        new ButtonBuilder()
          .setCustomId(`catalog_product_${product.id}`)
          .setLabel(`${product.name} - ${formatCurrency(product.price)}`)
          .setStyle(ButtonStyle.Success)
          .setEmoji('🛒')
      );
    });

    // Organizar botões em rows (max 5 por row)
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    
    // Row 1: Categorias
    if (buttons.length > 0) {
      const categoryRow = new ActionRowBuilder<ButtonBuilder>();
      buttons.slice(0, 5).forEach(btn => categoryRow.addComponents(btn));
      rows.push(categoryRow);
    }

    // Rows subsequentes: Produtos individuais (5 por row)
    for (let i = 0; i < individualButtons.length; i += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      individualButtons.slice(i, i + 5).forEach(btn => row.addComponents(btn));
      rows.push(row);
    }

    // Adicionar row de atualização
    const refreshRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('catalog_refresh_permanent')
          .setLabel('🔄 Atualizar Catálogo')
          .setStyle(ButtonStyle.Secondary)
      );
    rows.push(refreshRow);

    // Enviar mensagem no canal
    const message = await channel.send({
      embeds: [catalogEmbed],
      components: rows
    });

    // Fixar mensagem
    await message.pin();

    // Salvar ID da mensagem do catálogo na configuração
    await updateGuildConfig(interaction.guildId!, {
      catalog_channel_id: channel.id,
      catalog_message_id: message.id
    });

    const successEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Catálogo Configurado!')
      .setDescription(
        `O catálogo permanente foi criado em ${channel}!\n\n` +
        `A mensagem foi fixada e os clientes podem começar a comprar imediatamente.`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [successEmbed] });

    logger.info(`Catálogo permanente configurado no canal ${channel.name} por ${interaction.user.tag}`);
  } catch (error) {
    logger.error(`Erro ao configurar catálogo: ${error}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await interaction.editReply({
      content: `❌ Erro ao configurar catálogo: ${errorMessage}`
    });
  }
}
