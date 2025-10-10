/**
 * Comando /editproduct - Editar produto existente
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from 'discord.js';
import { getProductById, updateProduct } from '../utils/supabase';
import { logger } from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('editproduct')
  .setDescription('Editar um produto existente')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option
      .setName('id')
      .setDescription('ID do produto a ser editado')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('nome')
      .setDescription('Novo nome do produto')
      .setRequired(false)
  )
  .addStringOption(option =>
    option
      .setName('descricao')
      .setDescription('Nova descrição do produto')
      .setRequired(false)
  )
  .addNumberOption(option =>
    option
      .setName('preco')
      .setDescription('Novo preço do produto')
      .setRequired(false)
      .setMinValue(0.01)
  )
  .addStringOption(option =>
    option
      .setName('imagem')
      .setDescription('Nova URL da imagem')
      .setRequired(false)
  )
  .addIntegerOption(option =>
    option
      .setName('estoque')
      .setDescription('Nova quantidade em estoque')
      .setRequired(false)
      .setMinValue(0)
  )
  .addRoleOption(option =>
    option
      .setName('role')
      .setDescription('Nova role a ser dada ao comprador')
      .setRequired(false)
  )
  .addStringOption(option =>
    option
      .setName('conteudo')
      .setDescription('Novo conteúdo digital a ser entregue')
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const productId = interaction.options.getString('id', true);

    // Buscar produto
    const product = await getProductById(productId);
    if (!product) {
      await interaction.editReply('❌ Produto não encontrado.');
      return;
    }

    // Verificar se o produto pertence ao servidor
    if (product.guild_id !== interaction.guildId) {
      await interaction.editReply('❌ Este produto não pertence a este servidor.');
      return;
    }

    // Coletar atualizações
    const updates: any = {};
    
    const nome = interaction.options.getString('nome');
    if (nome) updates.name = nome;

    const descricao = interaction.options.getString('descricao');
    if (descricao) updates.description = descricao;

    const preco = interaction.options.getNumber('preco');
    if (preco !== null) updates.price = preco;

    const imagem = interaction.options.getString('imagem');
    if (imagem) updates.image_url = imagem;

    const estoque = interaction.options.getInteger('estoque');
    if (estoque !== null) updates.stock = estoque;

    const role = interaction.options.getRole('role');
    if (role) updates.role_id = role.id;

    const conteudo = interaction.options.getString('conteudo');
    if (conteudo) updates.delivery_content = conteudo;

    if (Object.keys(updates).length === 0) {
      await interaction.editReply('❌ Nenhuma alteração foi especificada.');
      return;
    }

    // Atualizar produto
    const updatedProduct = await updateProduct(productId, updates);

    logger.success(`Produto atualizado: ${updatedProduct.name} (${updatedProduct.id})`);

    // Criar embed de confirmação
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Produto Atualizado!')
      .setDescription(`O produto **${updatedProduct.name}** foi atualizado com sucesso.`)
      .addFields(
        { name: '💰 Preço', value: `R$ ${updatedProduct.price.toFixed(2)}`, inline: true },
        { name: '📦 Tipo', value: updatedProduct.type === 'unique' ? 'Único' : 'Assinatura', inline: true }
      )
      .setTimestamp();

    if (updatedProduct.image_url) {
      embed.setThumbnail(updatedProduct.image_url);
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(`Erro ao editar produto: ${error}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await interaction.editReply({
      content: `❌ Erro ao editar produto: ${errorMessage}`
    });
  }
}
