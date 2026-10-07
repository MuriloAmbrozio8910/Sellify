/**
 * Script para verificar variáveis de ambiente
 */

import { config } from 'dotenv';
config();

interface EnvCheck {
  name: string;
  required: boolean;
  description: string;
}

const envChecks: EnvCheck[] = [
  { name: 'DISCORD_TOKEN', required: true, description: 'Token do bot Discord' },
  { name: 'DISCORD_CLIENT_ID', required: true, description: 'Client ID do Discord' },
  { name: 'SUPABASE_URL', required: true, description: 'URL do projeto Supabase' },
  { name: 'SUPABASE_SECRET_KEY', required: false, description: 'Chave secreta do servidor Supabase' },
  { name: 'SUPABASE_SERVICE_KEY', required: false, description: 'Service role key do Supabase' },
  { name: 'STRIPE_SECRET_KEY', required: false, description: 'Chave secreta do Stripe' },
  { name: 'STRIPE_WEBHOOK_SECRET', required: false, description: 'Secret do webhook Stripe' },
  { name: 'MERCADOPAGO_ACCESS_TOKEN', required: false, description: 'Token do Mercado Pago' },
  { name: 'WEBHOOK_PORT', required: false, description: 'Porta do servidor de webhooks' },
  { name: 'WEBHOOK_URL', required: false, description: 'URL pública dos webhooks' }
];

function checkEnv() {
  console.log('🔍 Verificando variáveis de ambiente...\n');

  let hasErrors = !Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY);
  if (hasErrors) console.log('Configure SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_KEY (somente servidor).');
  let hasWarnings = false;

  for (const check of envChecks) {
    const value = process.env[check.name];
    const status = value ? '✅' : (check.required ? '❌' : '⚠️ ');

    if (check.required && !value) {
      hasErrors = true;
      console.log(`${status} ${check.name} (OBRIGATÓRIO)`);
      console.log(`   ${check.description}`);
      console.log(`   Status: NÃO CONFIGURADO\n`);
    } else if (!value) {
      hasWarnings = true;
      console.log(`${status} ${check.name} (opcional)`);
      console.log(`   ${check.description}`);
      console.log(`   Status: Não configurado\n`);
    } else {
      console.log(`${status} ${check.name}`);
      console.log(`   ${check.description}`);
      console.log(`   Status: Configurado ✓\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (hasErrors) {
    console.log('❌ ERRO: Variáveis obrigatórias não configuradas!');
    console.log('   Configure o arquivo .env antes de iniciar o bot.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  AVISO: Algumas variáveis opcionais não configuradas.');
    console.log('   O bot funcionará, mas com funcionalidades limitadas.\n');
  } else {
    console.log('✅ Todas as variáveis estão configuradas!\n');
  }
}

checkEnv();
