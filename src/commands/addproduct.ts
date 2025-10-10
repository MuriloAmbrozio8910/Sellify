/**
 * Comando /addproduct - Adicionar novo produto
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { createProduct } from '../utils/supabase';
import { ProductType } from '../types';
import { logger } from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('addproduct')
  .setDescription('Adicionar um novo produto ao catálogo')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option
      .setName('nome')
      .setDescription('Nome do produto')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('descricao')
      .setDescription('Descrição do produto')
      .setRequired(true)
  )
  .addNumberOption(option =>
    option
      .setName('preco')
      .setDescription('Preço do produto (em reais)')
      .setRequired(true)
      .setMinValue(0.01)
  )
  .addStringOption(option =>
    option
      .setName('tipo')
      .setDescription('Tipo do produto')
      .setRequired(true)
      .addChoices(
        { name: 'Único', value: 'unique' },
        { name: 'Assinatura', value: 'subscription' }
      )
  )
  .addStringOption(option =>
    option
      .setName('imagem')
      .setDescription('URL da imagem do produto')
      .setRequired(false)
  )
  .addIntegerOption(option =>
    option
      .setName('estoque')
      .setDescription('Quantidade em estoque (deixe vazio para ilimitado)')
      .setRequired(false)
      .setMinValue(0)
  )
  .addRoleOption(option =>
    option
      .setName('role')
      .setDescription('Role que será dada ao comprador')
      .setRequired(false)
  )
  .addStringOption(option =>
    option
      .setName('conteudo')
      .setDescription('Conteúdo digital a ser entregue (link, código, etc)')
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const nome = interaction.options.getString('nome', true);
    const descricao = interaction.options.getString('descricao', true);
    const preco = interaction.options.getNumber('preco', true);
    const tipo = interaction.options.getString('tipo', true) as ProductType;
    const imagem = interaction.options.getString('imagem');
    const estoque = interaction.options.getInteger('estoque');
    const role = interaction.options.getRole('role');
    const conteudo = interaction.options.getString('conteudo');

    // Criar produto no banco de dados
    const product = await createProduct({
      guild_id: interaction.guildId!,
      name: nome,
      description: descricao,
      price: preco,
      type: tipo,
      image_url: imagem || undefined,
      stock: estoque || undefined,
      role_id: role?.id || undefined,
      delivery_content: conteudo || undefined,
      is_active: true
    });

    logger.success(`Produto criado: ${product.name} (${product.id})`);

    // Criar embed de confirmação
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Produto Criado com Sucesso!')
      .setDescription(`O produto **${product.name}** foi adicionado ao catálogo.`)
      .addFields(
        { name: '💰 Preço', value: `R$ ${product.price.toFixed(2)}`, inline: true },
        { name: '📦 Tipo', value: tipo === 'unique' ? 'Único' : 'Assinatura', inline: true },
        { name: '🆔 ID', value: product.id, inline: true }
      )
      .setTimestamp();

    if (product.image_url) {
      embed.setThumbnail(product.image_url);
    }

    if (product.stock !== null && product.stock !== undefined) {
      embed.addFields({ name: '📊 Estoque', value: product.stock.toString(), inline: true });
    }

    if (role) {
      embed.addFields({ name: '👥 Role', value: `<@&${role.id}>`, inline: true });
    }

    // Botões de ação
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`edit_product_${product.id}`)
          .setLabel('Editar')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('✏️'),
        new ButtonBuilder()
          .setCustomId(`toggle_product_${product.id}`)
          .setLabel('Desativar')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔄'),
        new ButtonBuilder()
          .setCustomId(`delete_product_${product.id}`)
          .setLabel('Remover')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🗑️')
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    logger.error(`Erro ao criar produto: ${error}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await interaction.editReply({
      content: `❌ Erro ao criar produto: ${errorMessage}`
    });
  }
}
