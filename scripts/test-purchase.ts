/**
 * Script de teste para simular uma compra completa
 */

import { config } from 'dotenv';
config();

import {
  createProduct,
  createTransaction,
  getProductById,
  updateTransactionStatus
} from '../src/utils/supabase';
import { ProductType, TransactionStatus } from '../src/types';

async function testPurchase() {
  console.log('🧪 Iniciando teste de compra...\n');

  try {
    // 1. Criar produto de teste
    console.log('1️⃣ Criando produto de teste...');
    const product = await createProduct({
      guild_id: 'TEST_GUILD_ID',
      name: 'Produto de Teste',
      description: 'Este é um produto de teste para validação do sistema',
      price: 49.90,
      type: ProductType.UNIQUE,
      stock: 10,
      is_active: true
    });
    console.log(`✅ Produto criado: ${product.id}`);
    console.log(`   Nome: ${product.name}`);
    console.log(`   Preço: R$ ${product.price}\n`);

    // 2. Criar transação
    console.log('2️⃣ Criando transação...');
    const transaction = await createTransaction({
      guild_id: 'TEST_GUILD_ID',
      product_id: product.id,
      user_id: 'TEST_USER_ID',
      amount: product.price,
      status: TransactionStatus.PENDING,
      payment_provider: 'stripe'
    });
    console.log(`✅ Transação criada: ${transaction.id}`);
    console.log(`   Status: ${transaction.status}\n`);

    // 3. Simular pagamento aprovado
    console.log('3️⃣ Simulando confirmação de pagamento...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedTransaction = await updateTransactionStatus(
      transaction.id,
      TransactionStatus.COMPLETED,
      'test_payment_123'
    );
    console.log(`✅ Pagamento confirmado!`);
    console.log(`   Status: ${updatedTransaction.status}`);
    console.log(`   Payment ID: ${updatedTransaction.payment_id}\n`);

    // 4. Verificar produto
    console.log('4️⃣ Verificando produto...');
    const productCheck = await getProductById(product.id);
    console.log(`✅ Produto verificado:`);
    console.log(`   Estoque: ${productCheck?.stock}\n`);

    console.log('🎉 Teste de compra concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   Produto ID: ${product.id}`);
    console.log(`   Transação ID: ${transaction.id}`);
    console.log(`   Status Final: ${updatedTransaction.status}`);

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  }
}

// Executar teste
testPurchase()
  .then(() => {
    console.log('\n✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
