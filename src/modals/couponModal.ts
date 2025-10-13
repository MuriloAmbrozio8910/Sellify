/**
 * Modal de criação de cupom
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder
} from 'discord.js';
import { createCoupon, getActiveProducts } from '../utils/supabase';
import { formatCurrency } from '../utils/payments';
import { logger } from '../utils/logger';

const ADD_COUPON_MODAL_ID = 'addcoupon_modal';

type CouponTriggerInteraction = ChatInputCommandInteraction | ButtonInteraction;

interface CouponPayload {
  code: string;
  discountPercent?: number;
  discountFixed?: number;
  maxUses?: number;
  expiresAt?: Date;
}

function buildCouponModal(): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId(ADD_COUPON_MODAL_ID)
    .setTitle('🎟️ Criar Cupom');

  const codeInput = new TextInputBuilder()
    .setCustomId('coupon_code')
    .setLabel('Código do cupom')
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: PROMO10')
    .setMaxLength(25);

  const discountPercentInput = new TextInputBuilder()
    .setCustomId('coupon_discount_percent')
    .setLabel('Desconto percentual (1-100)')
    .setRequired(false)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 15');

  const discountFixedInput = new TextInputBuilder()
    .setCustomId('coupon_discount_fixed')
    .setLabel('Desconto fixo em R$')
    .setRequired(false)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 20.00');

  const maxUsesInput = new TextInputBuilder()
    .setCustomId('coupon_max_uses')
    .setLabel('Limite de usos (vazio = ilimitado)')
    .setRequired(false)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 100');

  const expiresInput = new TextInputBuilder()
    .setCustomId('coupon_expires')
    .setLabel('Expira em (DD/MM/YYYY)')
    .setRequired(false)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 31/12/2025');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(codeInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(discountPercentInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(discountFixedInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(maxUsesInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(expiresInput)
  );

  return modal;
}

function parseCouponPayload(interaction: ModalSubmitInteraction): CouponPayload | { error: string } {
  const code = interaction.fields.getTextInputValue('coupon_code').trim().toUpperCase();
  const percentRaw = interaction.fields.getTextInputValue('coupon_discount_percent')?.trim();
  const fixedRaw = interaction.fields.getTextInputValue('coupon_discount_fixed')?.trim();
  const maxUsesRaw = interaction.fields.getTextInputValue('coupon_max_uses')?.trim();
  const expiresRaw = interaction.fields.getTextInputValue('coupon_expires')?.trim();

  let discountPercent: number | undefined;
  if (percentRaw) {
    const parsed = Number.parseInt(percentRaw, 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 100) {
      return { error: '❌ Desconto percentual inválido. Use um número entre 1 e 100.' };
    }
    discountPercent = parsed;
  }

  let discountFixed: number | undefined;
  if (fixedRaw) {
    const parsed = Number.parseFloat(fixedRaw.replace(',', '.'));
    if (Number.isNaN(parsed) || parsed <= 0) {
      return { error: '❌ Desconto fixo inválido. Use um número maior que 0.' };
    }
    discountFixed = Number.parseFloat(parsed.toFixed(2));
  }

  if (!discountPercent && !discountFixed) {
    return { error: '❌ Informe pelo menos um tipo de desconto (percentual ou fixo).' };
  }

  let maxUses: number | undefined;
  if (maxUsesRaw) {
    const parsed = Number.parseInt(maxUsesRaw, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      return { error: '❌ Limite de usos inválido. Use um número inteiro maior ou igual a 1.' };
    }
    maxUses = parsed;
  }

  let expiresAt: Date | undefined;
  if (expiresRaw) {
    const [day, month, year] = expiresRaw.split('/').map(Number);
    if (!day || !month || !year) {
      return { error: '❌ Data inválida. Use o formato DD/MM/YYYY.' };
    }

    expiresAt = new Date(year, month - 1, day, 23, 59, 59);
    if (Number.isNaN(expiresAt.getTime())) {
      return { error: '❌ Data inválida. Verifique o formato (DD/MM/YYYY).' };
    }

    if (expiresAt <= new Date()) {
      return { error: '❌ A data de expiração deve ser no futuro.' };
    }
  }

  return {
    code,
    discountPercent,
    discountFixed,
    maxUses,
    expiresAt
  };
}

async function presentCouponModal(interaction: CouponTriggerInteraction) {
  const modal = buildCouponModal();
  await interaction.showModal(modal);
}

export async function showAddCouponModal(interaction: CouponTriggerInteraction) {
  await presentCouponModal(interaction);
}

export async function handleAddCouponModalSubmit(interaction: ModalSubmitInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({ content: '❌ Esta ação só pode ser usada em um servidor.', ephemeral: true });
    return;
  }

  const payload = parseCouponPayload(interaction);
  if ('error' in payload) {
    await interaction.reply({ content: payload.error, ephemeral: true });
    return;
  }

  await interaction.deferReply({ flags: 64 });

  try {
    const coupon = await createCoupon({
      guild_id: interaction.guildId,
      code: payload.code,
      discount_percent: payload.discountPercent,
      discount_fixed: payload.discountFixed,
      max_uses: payload.maxUses,
      expires_at: payload.expiresAt,
      is_active: true
    });

    logger.success(`Cupom criado: ${coupon.code}`);

    const discountDescription = coupon.discount_percent
      ? `${coupon.discount_percent}%`
      : formatCurrency(coupon.discount_fixed!);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎉 Cupom criado!')
      .addFields(
        { name: 'Código', value: coupon.code, inline: true },
        { name: 'Desconto', value: discountDescription, inline: true },
        { name: 'Usos', value: coupon.max_uses ? String(coupon.max_uses) : 'Ilimitado', inline: true }
      )
      .setTimestamp();

    if (coupon.expires_at) {
      embed.addFields({
        name: 'Expira em',
        value: new Date(coupon.expires_at).toLocaleDateString('pt-BR'),
        inline: true
      });
    }

    const actionsRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('coupon_add_another')
          .setLabel('Criar outro cupom')
          .setStyle(ButtonStyle.Success)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('coupon_view_catalog')
          .setLabel('Ver catálogo')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📦')
      );

    await interaction.editReply({ embeds: [embed], components: [actionsRow] });
  } catch (error) {
    logger.error(`Erro ao criar cupom: ${error}`);
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    await interaction.editReply({ content: `❌ Erro ao criar cupom: ${message}` });
  }
}

export async function handleCouponActionButton(interaction: ButtonInteraction) {
  const { customId } = interaction;

  if (customId === 'coupon_add_another') {
    await showAddCouponModal(interaction);
    return;
  }

  if (customId === 'coupon_view_catalog') {
    await interaction.deferReply({ flags: 64 });

    try {
      const products = await getActiveProducts(interaction.guildId!);
      if (products.length === 0) {
        await interaction.editReply({ content: '📦 Nenhum produto ativo. Crie um antes de compartilhar o catálogo.' });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🛒 Catálogo de Produtos')
        .setDescription('Use `/catalogo` para enviar o catálogo completo.')
        .setTimestamp();

      for (const product of products.slice(0, 5)) {
        embed.addFields({
          name: product.name,
          value: `${formatCurrency(product.price)} | ID: \`${product.id.slice(0, 8)}\``,
          inline: false
        });
      }

      if (products.length > 5) {
        embed.setFooter({ text: `Mostrando 5 de ${products.length} produtos` });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido.';
      await interaction.editReply({ content: `❌ Erro ao carregar catálogo: ${message}` });
    }

    return;
  }
}
