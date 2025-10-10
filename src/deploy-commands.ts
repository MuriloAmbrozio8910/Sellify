/**
 * Script para registrar comandos slash no Discord
 */

import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';

config();

const commands: any[] = [];
const commandsPath = join(__dirname, 'commands');
const fileExtension = process.env.NODE_ENV === 'production' ? '.js' : '.ts';
const commandFiles = readdirSync(commandsPath).filter(file => 
  file.endsWith(fileExtension)
);

// Carregar comandos
async function loadCommands() {
  console.log('📦 Carregando comandos...');
  
  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(filePath);
    
    if ('data' in command) {
      commands.push(command.data.toJSON());
      console.log(`✅ ${command.data.name}`);
    }
  }
  
  console.log(`\n📊 Total: ${commands.length} comando(s)\n`);
}

// Registrar comandos
async function deployCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!token || !clientId) {
    console.error('❌ DISCORD_TOKEN ou DISCORD_CLIENT_ID não encontrado no .env');
    process.exit(1);
  }

  const rest = new REST().setToken(token);

  try {
    await loadCommands();

    console.log('🚀 Registrando comandos slash...');

    // Registrar comandos globalmente
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    ) as any[];

    console.log(`✅ ${data.length} comando(s) registrado(s) com sucesso!`);
    console.log('\n📝 Comandos registrados:');
    data.forEach(cmd => console.log(`   • /${cmd.name}`));
    
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
    process.exit(1);
  }
}

deployCommands();
