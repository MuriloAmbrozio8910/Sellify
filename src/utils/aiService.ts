/**
 * Serviço de IA usando OpenAI
 * Funções para chat, geração de conteúdo e automação
 */

import OpenAI from 'openai';
import { supabase } from './supabase';
import { AIInteractionType } from '../types';
import { logger } from './logger';

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

// Inicializar cliente OpenAI
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY não configurada. Adicione-a ao arquivo .env');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Chat inteligente com contexto
 */
export async function chatWithAI(
  guildId: string,
  userId: string,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const client = getOpenAIClient();
  
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt || 'Você é um assistente útil e amigável de um servidor Discord de vendas. Seja educado, profissional e prestativo.'
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  try {
    const completion = await client.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Registrar interação
    await logAIInteraction(
      guildId,
      userId,
      AIInteractionType.CHAT,
      prompt,
      response,
      tokensUsed
    );

    return response;
  } catch (error) {
    logger.error(`Erro ao chamar OpenAI: ${error}`);
    throw new Error('Não foi possível processar sua solicitação de IA.');
  }
}

/**
 * Gerar conteúdo (mensagens, posts, descrições)
 */
export async function generateContent(
  guildId: string,
  userId: string,
  contentType: 'announcement' | 'product_description' | 'welcome_message' | 'email' | 'post',
  specifications: string
): Promise<string> {
  const client = getOpenAIClient();

  const systemPrompts = {
    announcement: 'Você é um especialista em criar anúncios impactantes para servidores Discord. Crie mensagens profissionais, envolventes e claras.',
    product_description: 'Você é um copywriter especializado em produtos digitais. Crie descrições persuasivas e atraentes que destacam benefícios.',
    welcome_message: 'Você é um especialista em mensagens de boas-vindas para comunidades Discord. Crie mensagens calorosas e informativas.',
    email: 'Você é um especialista em email marketing. Crie emails profissionais e persuasivos.',
    post: 'Você é um criador de conteúdo para redes sociais. Crie posts envolventes e virais.'
  };

  try {
    const completion = await client.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompts[contentType]
        },
        {
          role: 'user',
          content: `Crie um ${contentType} com as seguintes especificações:\n\n${specifications}\n\nRetorne apenas o conteúdo, sem explicações adicionais.`
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    const response = completion.choices[0]?.message?.content || 'Não foi possível gerar o conteúdo.';
    const tokensUsed = completion.usage?.total_tokens || 0;

    await logAIInteraction(
      guildId,
      userId,
      AIInteractionType.CONTENT_GENERATION,
      `${contentType}: ${specifications}`,
      response,
      tokensUsed
    );

    return response;
  } catch (error) {
    logger.error(`Erro ao gerar conteúdo: ${error}`);
    throw new Error('Não foi possível gerar o conteúdo solicitado.');
  }
}

/**
 * Analisar sentimento de mensagem
 */
export async function analyzeSentiment(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  requires_moderation: boolean;
}> {
  const client = getOpenAIClient();

  try {
    const completion = await client.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Você é um analisador de sentimento. Analise o texto e retorne um JSON com: sentiment (positive/negative/neutral), confidence (0-1), e requires_moderation (true/false se contém conteúdo inapropriado).'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 100
    });

    const response = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(response);
  } catch (error) {
    logger.error(`Erro ao analisar sentimento: ${error}`);
    return { sentiment: 'neutral', confidence: 0, requires_moderation: false };
  }
}

/**
 * Sugerir resposta automática para ticket
 */
export async function suggestTicketResponse(
  ticketSubject: string,
  ticketMessages: string[],
  category?: string
): Promise<string> {
  const client = getOpenAIClient();

  const context = ticketMessages.join('\n');

  try {
    const completion = await client.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Você é um agente de suporte experiente. Analise o ticket e sugira uma resposta profissional, útil e empática. Seja direto e objetivo.'
        },
        {
          role: 'user',
          content: `Assunto do ticket: ${ticketSubject}\nCategoria: ${category || 'Geral'}\n\nHistórico:\n${context}\n\nSugira uma resposta apropriada:`
        }
      ],
      temperature: 0.6,
      max_tokens: 500
    });

    return completion.choices[0]?.message?.content || 'Não foi possível gerar uma sugestão.';
  } catch (error) {
    logger.error(`Erro ao sugerir resposta: ${error}`);
    throw new Error('Não foi possível sugerir uma resposta.');
  }
}

/**
 * Gerar tarefas administrativas automaticamente
 */
export async function generateAdminTasks(
  guildId: string,
  userId: string,
  taskDescription: string
): Promise<{ tasks: string[]; instructions: string }> {
  const client = getOpenAIClient();

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente administrativo para servidores Discord. Quebre tarefas complexas em etapas simples e acionáveis. Retorne um JSON com "tasks" (array de strings) e "instructions" (string com instruções gerais).'
        },
        {
          role: 'user',
          content: `Tarefa administrativa: ${taskDescription}\n\nQuebre isso em etapas acionáveis.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0]?.message?.content || '{"tasks":[], "instructions":""}';
    const parsed = JSON.parse(response);

    await logAIInteraction(
      guildId,
      userId,
      AIInteractionType.AUTOMATION,
      taskDescription,
      JSON.stringify(parsed),
      completion.usage?.total_tokens || 0
    );

    return parsed;
  } catch (error) {
    logger.error(`Erro ao gerar tarefas: ${error}`);
    throw new Error('Não foi possível gerar tarefas administrativas.');
  }
}

/**
 * Moderar conteúdo automaticamente
 */
export async function moderateContent(text: string): Promise<{
  flagged: boolean;
  categories: string[];
  severity: 'low' | 'medium' | 'high';
}> {
  const client = getOpenAIClient();

  try {
    const moderation = await client.moderations.create({
      input: text
    });

    const result = moderation.results[0];
    const flagged = result.flagged;
    
    const categories: string[] = [];
    let highestScore = 0;

    if (result.categories.hate) categories.push('Discurso de ódio');
    if (result.categories['hate/threatening']) categories.push('Ameaças');
    if (result.categories.harassment) categories.push('Assédio');
    if (result.categories['harassment/threatening']) categories.push('Assédio com ameaças');
    if (result.categories['self-harm']) categories.push('Auto-mutilação');
    if (result.categories['self-harm/intent']) categories.push('Intenção de auto-mutilação');
    if (result.categories['self-harm/instructions']) categories.push('Instruções de auto-mutilação');
    if (result.categories.sexual) categories.push('Conteúdo sexual');
    if (result.categories['sexual/minors']) categories.push('Conteúdo sexual envolvendo menores');
    if (result.categories.violence) categories.push('Violência');
    if (result.categories['violence/graphic']) categories.push('Violência gráfica');

    // Calcular severidade baseado nos scores
    Object.values(result.category_scores).forEach(score => {
      if (score > highestScore) highestScore = score;
    });

    let severity: 'low' | 'medium' | 'high' = 'low';
    if (highestScore > 0.8) severity = 'high';
    else if (highestScore > 0.5) severity = 'medium';

    return { flagged, categories, severity };
  } catch (error) {
    logger.error(`Erro ao moderar conteúdo: ${error}`);
    return { flagged: false, categories: [], severity: 'low' };
  }
}

/**
 * Registrar interação de IA no banco
 */
async function logAIInteraction(
  guildId: string,
  userId: string,
  interactionType: AIInteractionType,
  prompt: string,
  response: string,
  tokensUsed: number
): Promise<void> {
  try {
    // Estimativa aproximada usando DEFAULT_OPENAI_MODEL
    const costPer1kTokens = 0.002; // USD
    const costEstimate = (tokensUsed / 1000) * costPer1kTokens;

    await supabase.from('ai_interactions').insert({
      guild_id: guildId,
      user_id: userId,
      interaction_type: interactionType,
      prompt,
      response,
      tokens_used: tokensUsed,
      cost_estimate: costEstimate
    });
  } catch (error) {
    logger.error(`Erro ao registrar interação de IA: ${error}`);
  }
}

/**
 * Obter estatísticas de uso de IA
 */
export async function getAIUsageStats(guildId: string, days: number = 30) {
  const { data, error } = await supabase
    .from('ai_interactions')
    .select('*')
    .eq('guild_id', guildId)
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    logger.error(`Erro ao buscar stats de IA: ${error}`);
    return null;
  }

  const totalInteractions = data.length;
  const totalTokens = data.reduce((sum, item) => sum + (item.tokens_used || 0), 0);
  const totalCost = data.reduce((sum, item) => sum + (item.cost_estimate || 0), 0);

  const byType = data.reduce((acc, item) => {
    acc[item.interaction_type] = (acc[item.interaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalInteractions,
    totalTokens,
    totalCost: totalCost.toFixed(2),
    byType,
    period: `${days} dias`
  };
}
