/**
 * Handler de webhook do Mercado Pago com credenciais dinâmicas por servidor
 */

import { Request, Response } from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { 
  updateTransactionStatus,
  getProductById,
  decrementStock,
  getPaymentCredential
} from '../utils/supabase';
import { TransactionStatus } from '../types';
import { logger } from '../utils/logger';
import { deliverProduct } from './deliveryHandler';

type MercadoPagoContext = {
  payment: Payment;
};

const mercadoPagoContextCache = new Map<string, MercadoPagoContext>();

async function getMercadoPagoContext(guildId: string): Promise<MercadoPagoContext> {
  const cached = mercadoPagoContextCache.get(guildId);
  if (cached) {
    return cached;
  }

  const credential = await getPaymentCredential(guildId, 'mercadopago');
  if (!credential) {
    throw new Error(`Mercado Pago não configurado para o servidor ${guildId}`);
  }

  const config = new MercadoPagoConfig({ accessToken: credential.api_key });
  const payment = new Payment(config);

  const context: MercadoPagoContext = { payment };
  mercadoPagoContextCache.set(guildId, context);
  return context;
}

export async function handleMercadoPagoWebhook(req: Request, res: Response) {
  const { type, data } = req.body;

  logger.info(`📥 Mercado Pago webhook recebido: ${type}`);

  try {
    if (type === 'payment' && data?.id) {
      await handlePaymentNotification(data.id);
    }

    res.status(200).send('OK');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Erro ao processar webhook Mercado Pago: ${message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Processar notificação de pagamento
 */
async function handlePaymentNotification(paymentId: string) {
  let guildId: string | null = null;

  try {
    const tempResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`);
    if (!tempResponse.ok) {
      logger.error(`Erro ao buscar pagamento ${paymentId} do Mercado Pago (pré-validação): ${tempResponse.status}`);
      return;
    }

    const tempData: any = await tempResponse.json();
    const metadata = tempData?.metadata;

    if (!metadata) {
      logger.warning('Metadata não encontrado no pagamento do Mercado Pago');
      return;
    }

    const transactionId = metadata.transaction_id;
    const productId = metadata.product_id;
    guildId = metadata.guild_id ?? metadata.guildId;
    const userId = metadata.user_id;

    if (!transactionId || !productId || !guildId || !userId) {
      logger.warning('Metadata do Mercado Pago incompleta.');
      return;
    }

    const { payment } = await getMercadoPagoContext(guildId);
    const paymentResult = await payment.get({ id: paymentId });
    const paymentData = paymentResult;

    logger.info(`💳 Status do pagamento ${paymentId}: ${paymentData.status}`);

    switch (paymentData.status) {
      case 'approved':
        await handleApprovedPayment(transactionId, productId, guildId, userId, paymentId);
        break;

      case 'rejected':
      case 'cancelled':
        await updateTransactionStatus(transactionId, TransactionStatus.FAILED);
        logger.warning(`❌ Pagamento rejeitado/cancelado: ${paymentId}`);
        break;

      case 'refunded':
        await updateTransactionStatus(transactionId, TransactionStatus.REFUNDED);
        logger.info(`↩️ Pagamento reembolsado: ${paymentId}`);
        break;

      case 'pending':
      case 'in_process':
        logger.info(`⏳ Pagamento pendente: ${paymentId}`);
        break;

      default:
        logger.info(`Status não tratado: ${paymentData.status}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Erro ao processar notificação de pagamento (${guildId ?? 'unknown'}): ${message}`);
    throw error;
  }
}

/**
 * Processar pagamento aprovado
 */
async function handleApprovedPayment(
  transactionId: string,
  productId: string,
  guildId: string,
  userId: string,
  paymentId: string
) {
  logger.success(`✅ Pagamento aprovado - Transaction: ${transactionId}`);

  // Atualizar transação
  await updateTransactionStatus(
    transactionId,
    TransactionStatus.COMPLETED,
    paymentId
  );

  // Buscar produto
  const product = await getProductById(productId);
  if (!product) {
    logger.error(`Produto não encontrado: ${productId}`);
    return;
  }

  // Decrementar estoque se necessário
  if (product.stock !== null && product.stock !== undefined) {
    await decrementStock(productId);
  }

  // Entregar produto
  await deliverProduct(guildId, userId, product, transactionId);

  logger.success(`🎉 Produto entregue: ${product.name} para usuário ${userId}`);
}
