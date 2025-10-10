/**
 * Comando /addcoupon - Criar cupom de desconto
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from 'discord.js';
import { createCoupon } from '../utils/supabase';
import { logger } from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('addcoupon')
  .setDescription('Criar um cupom de desconto')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option
      .setName('codigo')
      .setDescription('Código do cupom (ex: PROMO10)')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName('desconto_percentual')
      .setDescription('Desconto percentual (ex: 10 para 10%)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(100)
  )
  .addNumberOption(option =>
    option
      .setName('desconto_fixo')
      .setDescription('Desconto fixo em reais')
      .setRequired(false)
      .setMinValue(0.01)
  )
  .addIntegerOption(option =>
    option
      .setName('max_usos')
      .setDescription('Número máximo de usos (deixe vazio para ilimitado)')
      .setRequired(false)
      .setMinValue(1)
  )
  .addIntegerOption(option =>
    option
      .setName('dias_validade')
      .setDescription('Dias de validade (deixe vazio para sem expiração)')
      .setRequired(false)
      .setMinValue(1)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const codigo = interaction.options.getString('codigo', true).toUpperCase();
    const descontoPercentual = interaction.options.getInteger('desconto_percentual');
    const descontoFixo = interaction.options.getNumber('desconto_fixo');
    const maxUsos = interaction.options.getInteger('max_usos');
    const diasValidade = interaction.options.getInteger('dias_validade');

    // Validar que pelo menos um tipo de desconto foi fornecido
    if (!descontoPercentual && !descontoFixo) {
      await interaction.editReply('❌ Você deve fornecer um desconto percentual ou fixo.');
      return;
    }

    // Calcular data de expiração
    let expiresAt: Date | undefined;
    if (diasValidade) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + diasValidade);
    }

    // Criar cupom
    const coupon = await createCoupon({
      guild_id: interaction.guildId!,
      code: codigo,
      discount_percent: descontoPercentual || undefined,
      discount_fixed: descontoFixo || undefined,
      max_uses: maxUsos || undefined,
      expires_at: expiresAt,
      is_active: true
    });

    logger.success(`Cupom criado: ${coupon.code}`);

    // Criar embed de confirmação
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Cupom Criado com Sucesso!')
      .setDescription(`O cupom **${coupon.code}** foi criado.`)
      .addFields(
        { name: '🎟️ Código', value: coupon.code, inline: true }
      );

    if (coupon.discount_percent) {
      embed.addFields({ 
        name: '📊 Desconto', 
        value: `${coupon.discount_percent}%`, 
        inline: true 
      });
    } else if (coupon.discount_fixed) {
      embed.addFields({ 
        name: '💰 Desconto', 
        value: `R$ ${coupon.discount_fixed.toFixed(2)}`, 
        inline: true 
      });
    }

    if (coupon.max_uses) {
      embed.addFields({ 
        name: '🔢 Usos Máximos', 
        value: coupon.max_uses.toString(), 
        inline: true 
      });
    } else {
      embed.addFields({ 
        name: '🔢 Usos', 
        value: 'Ilimitado', 
        inline: true 
      });
    }

    if (coupon.expires_at) {
      embed.addFields({ 
        name: '⏰ Expira em', 
        value: new Date(coupon.expires_at).toLocaleDateString('pt-BR'), 
        inline: true 
      });
    } else {
      embed.addFields({ 
        name: '⏰ Validade', 
        value: 'Sem expiração', 
        inline: true 
      });
    }

    embed.setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(`Erro ao criar cupom: ${error}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await interaction.editReply({
      content: `❌ Erro ao criar cupom: ${errorMessage}`
    });
  }
}
