const DEFAULT_EMBED_COLOR: HexColorString = '#5865F2';

function normalizeHexColor(color?: string | null): HexColorString {
  if (color && /^#[0-9A-F]{6}$/i.test(color)) {
    return color.toUpperCase() as HexColorString;
  }

  return DEFAULT_EMBED_COLOR;
}

/**
 * Comando /config - Configurar bot no servidor
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
  CategoryChannel,
  HexColorString
} from 'discord.js';
import {
  getOrCreateGuildConfig,
  updateGuildConfig,
  upsertPaymentCredential,
  deletePaymentCredential,
  getPaymentCredential
} from '../utils/supabase';
import { createSalesCategory, createLogChannel } from '../utils/channelManager';
import { logger } from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('configurar')
  .setDescription('Configurar o bot de vendas')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(subcommand =>
    subcommand
      .setName('view')
      .setDescription('Ver configurações atuais')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('setup')
      .setDescription('Configuração inicial automática')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('logchannel')
      .setDescription('Definir canal de logs')
      .addChannelOption(option =>
        option
          .setName('canal')
          .setDescription('Canal onde os logs serão enviados')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('category')
      .setDescription('Definir categoria para canais de vendas')
      .addChannelOption(option =>
        option
          .setName('categoria')
          .setDescription('Categoria para criar canais de vendas')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('color')
      .setDescription('Definir cor dos embeds')
      .addStringOption(option =>
        option
          .setName('hex')
          .setDescription('Cor em hexadecimal (ex: #5865F2)')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('currency')
      .setDescription('Definir moeda padrão')
      .addStringOption(option =>
        option
          .setName('moeda')
          .setDescription('Código da moeda (BRL, USD, EUR)')
          .setRequired(true)
          .addChoices(
            { name: 'Real Brasileiro (BRL)', value: 'BRL' },
            { name: 'Dólar Americano (USD)', value: 'USD' },
            { name: 'Euro (EUR)', value: 'EUR' }
          )
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('payment')
      .setDescription('Ativar/desativar métodos de pagamento')
      .addBooleanOption(option =>
        option
          .setName('stripe')
          .setDescription('Ativar Stripe')
          .setRequired(false)
      )
      .addBooleanOption(option =>
        option
          .setName('mercadopago')
          .setDescription('Ativar Mercado Pago')
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('payment-set')
      .setDescription('Configurar credenciais de pagamento para este servidor')
      .addStringOption(option =>
        option
          .setName('provider')
          .setDescription('Selecione o provedor (stripe ou mercadopago)')
          .setRequired(true)
          .addChoices(
            { name: 'Stripe', value: 'stripe' },
            { name: 'Mercado Pago', value: 'mercadopago' }
          )
      )
      .addStringOption(option =>
        option
          .setName('api_key')
          .setDescription('Chave/API key do provedor')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('webhook_secret')
          .setDescription('Secret do webhook (obrigatório para Stripe)')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('extra')
          .setDescription('JSON com configurações extras (opcional)')
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('payment-delete')
      .setDescription('Remover credenciais de pagamento do servidor')
      .addStringOption(option =>
        option
          .setName('provider')
          .setDescription('Provedor cujas credenciais serão removidas')
          .setRequired(true)
          .addChoices(
            { name: 'Stripe', value: 'stripe' },
            { name: 'Mercado Pago', value: 'mercadopago' }
          )
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const subcommand = interaction.options.getSubcommand();
    const config = await getOrCreateGuildConfig(interaction.guildId!);

    switch (subcommand) {
      case 'view':
        await handleView(interaction, config);
        break;
      case 'setup':
        await handleSetup(interaction, config);
        break;
      case 'logchannel':
        await handleLogChannel(interaction, config);
        break;
      case 'category':
        await handleCategory(interaction, config);
        break;
      case 'color':
        await handleColor(interaction, config);
        break;
      case 'currency':
        await handleCurrency(interaction, config);
        break;
      case 'payment':
        await handlePayment(interaction, config);
        break;
      case 'payment-set':
        await handlePaymentSet(interaction);
        break;
      case 'payment-delete':
        await handlePaymentDelete(interaction);
        break;
    }
  } catch (error) {
    logger.error(`Erro no comando config: ${error}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await interaction.editReply({
      content: `❌ Erro: ${errorMessage}`
    });
  }
}

async function handleView(interaction: ChatInputCommandInteraction, config: any) {
  const embedColor = normalizeHexColor(config.embed_color);

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle('⚙️ Configurações do Bot de Vendas')
    .setDescription('Configurações atuais do servidor')
    .addFields(
      {
        name: '📊 Canal de Logs',
        value: config.log_channel_id ? `<#${config.log_channel_id}>` : '❌ Não configurado',
        inline: true
      },
      {
        name: '📁 Categoria de Vendas',
        value: config.sales_category_id ? `<#${config.sales_category_id}>` : '❌ Não configurado',
        inline: true
      },
      {
        name: '🎨 Cor dos Embeds',
        value: config.embed_color,
        inline: true
      },
      {
        name: '💰 Moeda',
        value: config.currency,
        inline: true
      },
      {
        name: '💳 Stripe',
        value: config.stripe_enabled ? '✅ Ativado' : '❌ Desativado',
        inline: true
      },
      {
        name: '💳 Mercado Pago',
        value: config.mercadopago_enabled ? '✅ Ativado' : '❌ Desativado',
        inline: true
      }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleSetup(interaction: ChatInputCommandInteraction, config: any) {
  const guild = interaction.guild!;

  // Criar categoria de vendas
  const category = await createSalesCategory(guild);
  
  // Criar canal de logs
  const logChannel = await createLogChannel(guild);

  // Atualizar configuração
  await updateGuildConfig(guild.id, {
    sales_category_id: category.id,
    log_channel_id: logChannel.id
  });

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('✅ Configuração Inicial Concluída!')
    .setDescription('O bot foi configurado automaticamente.')
    .addFields(
      { name: '📁 Categoria', value: category.name, inline: true },
      { name: '📊 Canal de Logs', value: `<#${logChannel.id}>`, inline: true }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
  logger.success(`Setup automático concluído no servidor ${guild.name}`);
}

async function handleLogChannel(interaction: ChatInputCommandInteraction, config: any) {
  const channel = interaction.options.getChannel('canal', true) as TextChannel;

  await updateGuildConfig(interaction.guildId!, {
    log_channel_id: channel.id
  });

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('✅ Canal de Logs Configurado')
    .setDescription(`O canal de logs foi definido como <#${channel.id}>`)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleCategory(interaction: ChatInputCommandInteraction, config: any) {
  const category = interaction.options.getChannel('categoria', true) as CategoryChannel;

  await updateGuildConfig(interaction.guildId!, {
    sales_category_id: category.id
  });

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('✅ Categoria Configurada')
    .setDescription(`A categoria de vendas foi definida como **${category.name}**`)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleColor(interaction: ChatInputCommandInteraction, config: any) {
  const hex = interaction.options.getString('hex', true);

  // Validar formato hex
  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    await interaction.editReply('❌ Formato de cor inválido. Use o formato: #RRGGBB');
    return;
  }

  const normalizedHex = hex.toUpperCase() as HexColorString;

  await updateGuildConfig(interaction.guildId!, {
    embed_color: normalizedHex
  });

  const embed = new EmbedBuilder()
    .setColor(normalizedHex)
    .setTitle('✅ Cor Atualizada')
    .setDescription(`A cor dos embeds foi alterada para **${hex}**`)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleCurrency(interaction: ChatInputCommandInteraction, config: any) {
  const currency = interaction.options.getString('moeda', true);

  await updateGuildConfig(interaction.guildId!, {
    currency
  });

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('✅ Moeda Atualizada')
    .setDescription(`A moeda padrão foi alterada para **${currency}**`)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handlePayment(interaction: ChatInputCommandInteraction, config: any) {
  const stripe = interaction.options.getBoolean('stripe');
  const mercadopago = interaction.options.getBoolean('mercadopago');

  const updates: any = {};
  if (stripe !== null) updates.stripe_enabled = stripe;
  if (mercadopago !== null) updates.mercadopago_enabled = mercadopago;

  await updateGuildConfig(interaction.guildId!, updates);

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('✅ Métodos de Pagamento Atualizados')
    .setTimestamp();

  const fields = [];
  if (stripe !== null) {
    fields.push({
      name: '💳 Stripe',
      value: stripe ? '✅ Ativado' : '❌ Desativado',
      inline: true
    });
  }
  if (mercadopago !== null) {
    fields.push({
      name: '💳 Mercado Pago',
      value: mercadopago ? '✅ Ativado' : '❌ Desativado',
      inline: true
    });
  }

  embed.addFields(fields);
  await interaction.editReply({ embeds: [embed] });
}

async function handlePaymentSet(interaction: ChatInputCommandInteraction) {
  const provider = interaction.options.getString('provider', true) as 'stripe' | 'mercadopago';
  const apiKey = interaction.options.getString('api_key', true);
  const webhookSecret = interaction.options.getString('webhook_secret');
  const extraRaw = interaction.options.getString('extra');

  if (!apiKey || apiKey.length < 10) {
    await interaction.editReply('❌ API key inválida.');
    return;
  }

  let additionalConfig: Record<string, any> | undefined;
  if (extraRaw) {
    try {
      additionalConfig = JSON.parse(extraRaw);
    } catch {
      await interaction.editReply('❌ JSON inválido no campo extra.');
      return;
    }
  }

  if (provider === 'stripe' && !webhookSecret) {
    await interaction.editReply('❌ Stripe requer o campo webhook_secret (Signing Secret).');
    return;
  }

  const saved = await upsertPaymentCredential({
    guild_id: interaction.guildId!,
    provider,
    api_key: apiKey,
    webhook_secret: webhookSecret ?? undefined,
    additional_config: additionalConfig ?? {}
  });

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('✅ Credenciais atualizadas')
    .setDescription(`As credenciais de **${provider}** foram salvas para este servidor.`)
    .setTimestamp();

  if (provider === 'stripe') {
    embed.addFields({
      name: 'Webhook',
      value: webhookSecret ? '✅ Secret configurado' : '⚠️ Secret não informado'
    });
  }

  if (saved.additional_config && Object.keys(saved.additional_config).length > 0) {
    embed.addFields({
      name: 'Config extra',
      value: '✅ JSON salvo'
    });
  }

  embed.addFields({
    name: 'Ative com',
    value: `Use o comando \`/config payment ${provider}:true\` para habilitar este provedor.`
  });

  await interaction.editReply({ embeds: [embed] });
}

async function handlePaymentDelete(interaction: ChatInputCommandInteraction) {
  const provider = interaction.options.getString('provider', true) as 'stripe' | 'mercadopago';

  const existing = await getPaymentCredential(interaction.guildId!, provider);

  if (!existing) {
    await interaction.editReply(`⚠️ Não há credenciais de **${provider}** para remover.`);
    return;
  }

  await deletePaymentCredential(interaction.guildId!, provider);

  const embed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('🗑️ Credenciais removidas')
    .setDescription(`As credenciais de **${provider}** foram removidas.`)
    .setFooter({ text: 'Não esqueça de desativar o método, se necessário.' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
