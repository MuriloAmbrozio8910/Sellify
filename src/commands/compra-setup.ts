/**
 * Comando: /compra-setup
 * Personalização do sistema de compras
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('compra-setup')
  .setDescription('🎨 Personalizar aparência do sistema de compras')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#2ECC71')
    .setTitle('🎨 Painel de Personalização - Sistema de Compras')
    .setDescription(
      'Personalize completamente a aparência das telas de compra e pagamento.\n\n' +
      '**Use os botões abaixo para customizar:**'
    )
    .addFields(
      { name: '💳 Tela de Compra', value: 'Título, descrição, cor', inline: true },
      { name: '🔘 Botões de Pagamento', value: 'PIX, Boleto, Cartão', inline: true },
      { name: '🏷️ Campos', value: 'Produto, preço, detalhes', inline: true },
      { name: '📝 Rodapé', value: 'Mensagens de segurança', inline: true },
      { name: '✅ Confirmação', value: 'Mensagem de sucesso', inline: true },
      { name: '🎯 Variáveis', value: '{product_name}, {price}, {user}', inline: true }
    )
    .setFooter({ text: 'Sistema de Personalização Dinâmica' })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('customize_purchase_title')
        .setLabel('Título')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝'),
      new ButtonBuilder()
        .setCustomId('customize_purchase_description')
        .setLabel('Descrição')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📄'),
      new ButtonBuilder()
        .setCustomId('customize_purchase_color')
        .setLabel('Cor')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎨')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('customize_purchase_fields')
        .setLabel('Campos')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🏷️'),
      new ButtonBuilder()
        .setCustomId('customize_purchase_footer')
        .setLabel('Rodapé')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📝'),
      new ButtonBuilder()
        .setCustomId('customize_purchase_buttons')
        .setLabel('Botões')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔘')
    );

  const row3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('customize_purchase_image')
        .setLabel('Imagem')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🖼️'),
      new ButtonBuilder()
        .setCustomId('customize_purchase_thumbnail')
        .setLabel('Thumbnail')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🔳')
    );

  const row4 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('customize_purchase_preview')
        .setLabel('👁️ Pré-visualizar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('customize_purchase_save')
        .setLabel('💾 Salvar Tudo')
        .setStyle(ButtonStyle.Success)
    );

  await interaction.reply({
    embeds: [embed],
    components: [row1, row2, row3, row4],
    ephemeral: true
  });
}
