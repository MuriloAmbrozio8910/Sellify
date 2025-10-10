/**
 * Script para limpar dados de teste do banco
 */

import { config } from 'dotenv';
config();

import { supabase } from '../src/utils/supabase';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function cleanup() {
  console.log('⚠️  ATENÇÃO: Este script irá REMOVER dados do banco de dados!\n');
  
  rl.question('Digite "CONFIRMAR" para prosseguir: ', async (answer) => {
    if (answer !== 'CONFIRMAR') {
      console.log('❌ Operação cancelada.');
      process.exit(0);
    }

    try {
      console.log('\n🧹 Iniciando limpeza...\n');

      // Limpar produtos de teste
      console.log('1️⃣ Removendo produtos de teste...');
      const { data: products, error: productsError } = await supabase
        .from('products')
        .delete()
        .eq('guild_id', 'TEST_GUILD_ID');
      
      if (productsError) throw productsError;
      console.log('✅ Produtos de teste removidos\n');

      // Limpar transações de teste
      console.log('2️⃣ Removendo transações de teste...');
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .delete()
        .eq('guild_id', 'TEST_GUILD_ID');
      
      if (transactionsError) throw transactionsError;
      console.log('✅ Transações de teste removidas\n');

      // Limpar logs de teste
      console.log('3️⃣ Removendo logs de teste...');
      const { data: logs, error: logsError } = await supabase
        .from('access_logs')
        .delete()
        .eq('guild_id', 'TEST_GUILD_ID');
      
      if (logsError) throw logsError;
      console.log('✅ Logs de teste removidos\n');

      console.log('🎉 Limpeza concluída com sucesso!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      process.exit(1);
    }
  });
}

cleanup();
