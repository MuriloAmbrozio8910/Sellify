/**
 * Bot Discord - Sistema de Vendas
 * Arquivo principal de inicialização
 */

import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';
import { logger } from './utils/logger';
import { setDiscordClient } from './webhooks/deliveryHandler';
import { startWebhookServer } from './webhooks/server';
import { initializeAnnouncementScheduler } from './utils/announcementManager';

// Carregar variáveis de ambiente
config();

// Validar variáveis de ambiente essenciais
const requiredEnvVars = ['DISCORD_TOKEN', 'SUPABASE_URL', 'SUPABASE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`❌ Variável de ambiente ${envVar} não encontrada!`);
    logger.error('Configure o arquivo .env antes de iniciar o bot.');
    process.exit(1);
  }
}

// Criar cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ]
});

// Coleção de comandos
(client as any).commands = new Collection();

/**
 * Carregar comandos
 */
async function loadCommands() {
  const commandsPath = join(__dirname, 'commands');
  // Em produção, carregar apenas .js; em desenvolvimento, .ts
  const fileExtension = process.env.NODE_ENV === 'production' ? '.js' : '.ts';
  const commandFiles = readdirSync(commandsPath).filter(file => 
    file.endsWith(fileExtension)
  );

  logger.info(`📦 Carregando ${commandFiles.length} comando(s)...`);

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(filePath);

    if ('data' in command && 'execute' in command) {
      (client as any).commands.set(command.data.name, command);
      logger.success(`✅ Comando carregado: ${command.data.name}`);
    } else {
      logger.warning(`⚠️ Comando em ${file} está faltando "data" ou "execute"`);
    }
  }
}

/**
 * Carregar eventos
 */
async function loadEvents() {
  const eventsPath = join(__dirname, 'events');
  // Em produção, carregar apenas .js; em desenvolvimento, .ts
  const fileExtension = process.env.NODE_ENV === 'production' ? '.js' : '.ts';
  const eventFiles = readdirSync(eventsPath).filter(file => 
    file.endsWith(fileExtension)
  );

  logger.info(`📦 Carregando ${eventFiles.length} evento(s)...`);

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = await import(filePath);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }

    logger.success(`✅ Evento carregado: ${event.name}`);
  }
}

/**
 * Inicializar bot
 */
async function initialize() {
  try {
    logger.info('🚀 Inicializando bot...');

    // Carregar comandos e eventos
    await loadCommands();
    await loadEvents();

    // Registrar cliente Discord no delivery handler
    setDiscordClient(client);

    // Iniciar servidor de webhooks
    if (process.env.WEBHOOK_PORT) {
      startWebhookServer();
    } else {
      logger.warning('⚠️ WEBHOOK_PORT não configurado. Servidor de webhooks não iniciado.');
    }

    // Inicializar scheduler de anúncios
    initializeAnnouncementScheduler(client);

    // Login no Discord
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    logger.error(`❌ Erro ao inicializar bot: ${error}`);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (error: Error) => {
  logger.error(`❌ Unhandled Rejection: ${error.message}`);
  console.error(error);
});

process.on('uncaughtException', (error: Error) => {
  logger.error(`❌ Uncaught Exception: ${error.message}`);
  console.error(error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Desligando bot...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Desligando bot...');
  client.destroy();
  process.exit(0);
});

// Iniciar
initialize();
