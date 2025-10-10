/**
 * Evento: Bot pronto
 */

import { Client, ActivityType } from 'discord.js';
import { logger } from '../utils/logger';
import cron from 'node-cron';
import { checkAndRemoveExpiredRoles } from '../utils/roleManager';

export const name = 'ready';
export const once = true;

export async function execute(client: Client) {
  logger.success(`✅ Bot online como ${client.user?.tag}`);
  logger.info(`📊 Conectado a ${client.guilds.cache.size} servidor(es)`);

  // Definir status do bot com rotação
  logger.info('Definindo status do bot...');
  
  const statusList = [
    { name: `Vendendo em ${client.guilds.cache.size} servidores`, type: ActivityType.Watching },
    { name: '/setup-catalog | Catálogo Permanente', type: ActivityType.Playing },
    { name: 'PIX e Boleto Instantâneo', type: ActivityType.Watching },
    { name: '/catalogo | Sistema de Vendas', type: ActivityType.Playing }
  ];

  let currentStatus = 0;

  // Definir status inicial
  client.user?.setPresence({
    activities: [statusList[0]],
    status: 'online'
  });

  // Rotacionar status a cada 15 segundos
  setInterval(() => {
    currentStatus = (currentStatus + 1) % statusList.length;
    client.user?.setPresence({
      activities: [statusList[currentStatus]],
      status: 'online'
    });
  }, 15000); // 15 segundos



  // Agendar verificação de roles temporárias a cada hora
  cron.schedule('0 * * * *', async () => {
    logger.info('🔄 Verificando roles temporárias expiradas...');
    
    for (const guild of client.guilds.cache.values()) {
      try {
        const removed = await checkAndRemoveExpiredRoles(guild);
        if (removed > 0) {
          logger.success(`Removidas ${removed} role(s) expirada(s) do servidor ${guild.name}`);
        }
      } catch (error) {
        logger.error(`Erro ao verificar roles no servidor ${guild.name}: ${error}`);
      }
    }
  });

  logger.success('🤖 Bot totalmente inicializado e pronto para uso!');
}
