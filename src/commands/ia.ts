/**
 * Comando: /ia
 * Comandos avançados de IA
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} from 'discord.js';
import {
  chatWithAI,
  generateContent,
  moderateContent,
  getAIUsageStats,
  suggestTicketResponse
} from '../utils/aiService';

export const data = new SlashCommandBuilder()
  .setName('ia')
  .setDescription('🧠 Comandos de IA avançados')
  .addSubcommand(subcommand =>
    subcommand
      .setName('chat')
      .setDescription('Conversar com a IA')
      .addStringOption(option =>
        option
          .setName('mensagem')
          .setDescription('Sua mensagem para a IA')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('gerar')
      .setDescription('Gerar conteúdo automaticamente')
      .addStringOption(option =>
        option
          .setName('tipo')
          .setDescription('Tipo de conteúdo')
          .setRequired(true)
          .addChoices(
            { name: '📢 Anúncio', value: 'announcement' },
            { name: '📦 Descrição de Produto', value: 'product_description' },
            { name: '👋 Mensagem de Boas-vindas', value: 'welcome_message' },
            { name: '📧 Email', value: 'email' },
            { name: '📱 Post para Redes Sociais', value: 'post' }
          )
      )
      .addStringOption(option =>
        option
          .setName('especificacoes')
          .setDescription('Descreva o que você quer gerar')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('moderar')
      .setDescription('Analisar conteúdo com moderação de IA')
      .addStringOption(option =>
        option
          .setName('texto')
          .setDescription('Texto para analisar')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('stats')
      .setDescription('Ver estatísticas de uso de IA (apenas administradores)')
      .addIntegerOption(option =>
        option
          .setName('dias')
          .setDescription('Número de dias para análise')
          .setMinValue(1)
          .setMaxValue(90)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('assistente')
      .setDescription('Assistente administrativo com IA')
      .addStringOption(option =>
        option
          .setName('tarefa')
          .setDescription('Descreva a tarefa administrativa que precisa fazer')
          .setRequired(true)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case 'chat':
      await handleChat(interaction);
      break;
    case 'gerar':
      await handleGenerate(interaction);
      break;
    case 'moderar':
      await handleModerate(interaction);
      break;
    case 'stats':
      await handleStats(interaction);
      break;
    case 'assistente':
      await handleAssistant(interaction);
      break;
  }
}

async function handleChat(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const message = interaction.options.getString('mensagem', true);

  try {
    const response = await chatWithAI(
      interaction.guildId!,
      interaction.user.id,
      message
    );

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTitle('💬 Chat com IA')
      .addFields(
        { name: '📝 Você disse:', value: message, inline: false },
        { name: '🤖 IA respondeu:', value: response, inline: false }
      )
      .setFooter({ text: 'Powered by OpenAI' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao processar chat com IA.'}`
    });
  }
}

async function handleGenerate(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const type = interaction.options.getString('tipo', true) as any;
  const specifications = interaction.options.getString('especificacoes', true);

  try {
    const content = await generateContent(
      interaction.guildId!,
      interaction.user.id,
      type,
      specifications
    );

    const typeNames: Record<string, string> = {
      announcement: '📢 Anúncio',
      product_description: '📦 Descrição de Produto',
      welcome_message: '👋 Mensagem de Boas-vindas',
      email: '📧 Email',
      post: '📱 Post'
    };

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle(`✨ ${typeNames[type]} Gerado`)
      .setDescription('A IA gerou o seguinte conteúdo para você:')
      .addFields(
        { name: '📋 Especificações', value: specifications.substring(0, 200), inline: false },
        { name: '✍️ Conteúdo Gerado', value: content.substring(0, 1000), inline: false }
      )
      .setFooter({ text: 'Você pode copiar e editar este conteúdo conforme necessário' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    // Se o conteúdo for muito longo, enviar o restante em mensagens separadas
    if (content.length > 1000) {
      const remaining = content.substring(1000);
      for (let i = 0; i < remaining.length; i += 2000) {
        await interaction.followUp({
          content: `\`\`\`${remaining.substring(i, i + 2000)}\`\`\``,
          ephemeral: false
        });
      }
    }
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao gerar conteúdo.'}`
    });
  }
}

async function handleModerate(interaction: ChatInputCommandInteraction) {
  // Verificar permissão
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
    await interaction.reply({
      content: '❌ Você precisa de permissão de moderador para usar este comando.',
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const text = interaction.options.getString('texto', true);

  try {
    const result = await moderateContent(text);

    const severityColors: Record<string, number> = {
      low: 0x00FF00,
      medium: 0xFFA500,
      high: 0xFF0000
    };

    const embed = new EmbedBuilder()
      .setColor(result.flagged ? severityColors[result.severity] : 0x00FF00)
      .setTitle(result.flagged ? '⚠️ Conteúdo Sinalizado' : '✅ Conteúdo Aprovado')
      .setDescription(
        result.flagged
          ? `Este conteúdo foi sinalizado pela moderação de IA.\n\n**Severidade:** ${result.severity.toUpperCase()}`
          : 'Este conteúdo não apresenta problemas.'
      )
      .addFields(
        { name: '📝 Texto Analisado', value: text.substring(0, 200), inline: false }
      );

    if (result.flagged && result.categories.length > 0) {
      embed.addFields({
        name: '🚫 Categorias Detectadas',
        value: result.categories.join('\n'),
        inline: false
      });
    }

    embed.setFooter({ text: 'Análise realizada por OpenAI Moderation API' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao moderar conteúdo.'}`
    });
  }
}

async function handleStats(interaction: ChatInputCommandInteraction) {
  // Verificar permissão
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '❌ Apenas administradores podem ver estatísticas de IA.',
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const days = interaction.options.getInteger('dias') || 30;

  try {
    const stats = await getAIUsageStats(interaction.guildId!, days);

    if (!stats) {
      await interaction.editReply('Nenhum dado de uso de IA disponível.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📊 Estatísticas de Uso de IA')
      .setDescription(`Período: **${stats.period}**`)
      .addFields(
        { name: '💬 Total de Interações', value: stats.totalInteractions.toString(), inline: true },
        { name: '🎯 Total de Tokens', value: stats.totalTokens.toLocaleString(), inline: true },
        { name: '💰 Custo Estimado', value: `$${stats.totalCost}`, inline: true }
      );

    // Adicionar breakdown por tipo
    let breakdown = '';
    for (const [type, count] of Object.entries(stats.byType)) {
      const typeEmojis: Record<string, string> = {
        chat: '💬',
        content_generation: '✍️',
        image_generation: '🎨',
        moderation: '🛡️',
        automation: '🤖'
      };
      breakdown += `${typeEmojis[type] || '📌'} ${type}: ${count}\n`;
    }

    if (breakdown) {
      embed.addFields({ name: '📈 Por Tipo de Uso', value: breakdown, inline: false });
    }

    embed.setFooter({ text: 'Dados baseados no histórico de interações' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao buscar estatísticas.'}`
    });
  }
}

async function handleAssistant(interaction: ChatInputCommandInteraction) {
  // Verificar permissão
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({
      content: '❌ Você precisa de permissão de gerenciamento para usar o assistente administrativo.',
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply();

  const task = interaction.options.getString('tarefa', true);

  try {
    const { generateAdminTasks } = await import('../utils/aiService');
    const result = await generateAdminTasks(
      interaction.guildId!,
      interaction.user.id,
      task
    );

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🤖 Assistente Administrativo')
      .setDescription(
        `**Tarefa:** ${task}\n\n` +
        `**Instruções Gerais:**\n${result.instructions}`
      )
      .setFooter({ text: 'Assistente administrativo powered by IA' })
      .setTimestamp();

    if (result.tasks && result.tasks.length > 0) {
      let taskList = '';
      result.tasks.forEach((t, index) => {
        taskList += `${index + 1}. ${t}\n`;
      });

      embed.addFields({
        name: '📋 Etapas Sugeridas',
        value: taskList.substring(0, 1024),
        inline: false
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ ${error.message || 'Erro ao processar tarefa administrativa.'}`
    });
  }
}
