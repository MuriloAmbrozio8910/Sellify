/**
 * Handler de webhook do Stripe com credenciais dinâmicas por servidor
 */

import { Request, Response } from 'express';
import Stripe from 'stripe';
import {
  updateTransactionStatus,
  getProductById,
  decrementStock,
  getPaymentCredential
} from '../utils/supabase';
import { TransactionStatus } from '../types';
import { logger } from '../utils/logger';
import { deliverProduct } from './deliveryHandler';

const STRIPE_API_VERSION = '2023-10-16';

type StripeContext = {
  client: Stripe;
  webhookSecret: string;
};

const stripeContextCache = new Map<string, StripeContext>();

async function getStripeContext(guildId: string): Promise<StripeContext> {
  const cached = stripeContextCache.get(guildId);
  if (cached) {
    return cached;
  }

  const credential = await getPaymentCredential(guildId, 'stripe');
  if (!credential) {
    throw new Error(`Stripe não configurado para o servidor ${guildId}`);
  }

  if (!credential.webhook_secret) {
    throw new Error(`Webhook secret do Stripe não configurado para o servidor ${guildId}`);
  }

  const client = new Stripe(credential.api_key, { apiVersion: STRIPE_API_VERSION });
  const context: StripeContext = {
    client,
    webhookSecret: credential.webhook_secret
  };

  stripeContextCache.set(guildId, context);
  return context;
}

function ensureBuffer(body: unknown): Buffer {
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (typeof body === 'string') {
    return Buffer.from(body, 'utf8');
  }
  return Buffer.from(JSON.stringify(body ?? {}));
}

function extractGuildId(rawBody: Buffer): string | null {
  try {
    const payload = JSON.parse(rawBody.toString('utf8'));
    const metadata = payload?.data?.object?.metadata;
    if (!metadata) {
      return null;
    }
    return metadata.guild_id ?? metadata.guildId ?? null;
  } catch (error) {
    logger.error(`Erro ao extrair guild_id do payload Stripe: ${error}`);
    return null;
  }
}

async function dispatchStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    default:
      logger.info(`Evento Stripe não tratado: ${event.type}`);
  }
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    logger.error('Stripe signature header ausente.');
    return res.status(400).send('Webhook Error: signature missing');
  }

  const rawBody = ensureBuffer(req.body);
  const guildId = extractGuildId(rawBody);

  if (!guildId) {
    logger.error('Guild ID não encontrado no webhook do Stripe.');
    return res.status(400).send('Webhook Error: guild_id missing');
  }

  try {
    const { client, webhookSecret } = await getStripeContext(guildId);
    const event = client.webhooks.constructEvent(rawBody, signature, webhookSecret);

    logger.info(`📥 Stripe webhook recebido (${guildId}): ${event.type}`);

    await dispatchStripeEvent(event);
    return res.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Erro ao processar webhook Stripe (${guildId}): ${message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Checkout concluído
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata) {
    logger.warning('Checkout do Stripe sem metadata.');
    return;
  }

  const transactionId = metadata.transaction_id;
  const productId = metadata.product_id;
  const guildId = metadata.guild_id ?? metadata.guildId;
  const userId = metadata.user_id;

  if (!transactionId || !productId || !guildId || !userId) {
    logger.warning('Metadata do Stripe incompleta para concluir checkout.');
    return;
  }

  logger.info(`✅ Checkout concluído - Transaction: ${transactionId}`);

  await updateTransactionStatus(
    transactionId,
    TransactionStatus.COMPLETED,
    session.id
  );

  const product = await getProductById(productId);
  if (!product) {
    logger.error(`Produto não encontrado: ${productId}`);
    return;
  }

  if (product.stock !== null && product.stock !== undefined) {
    await decrementStock(productId);
  }

  await deliverProduct(guildId, userId, product, transactionId);

  logger.success(`🎉 Produto entregue: ${product.name} para usuário ${userId}`);
}

/**
 * Pagamento bem-sucedido
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.success(`💰 Pagamento bem-sucedido: ${paymentIntent.id}`);
  // Lógica adicional se necessário
}

/**
 * Pagamento falhou
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.warning(`❌ Pagamento falhou: ${paymentIntent.id}`);
  
  // Buscar transação relacionada e atualizar status
  const metadata = paymentIntent.metadata;
  if (metadata && metadata.transaction_id) {
    await updateTransactionStatus(
      metadata.transaction_id,
      TransactionStatus.FAILED
    );
  }
}

/**
 * Invoice pago (assinaturas)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  logger.success(`📄 Invoice pago: ${invoice.id}`);
  
  if (invoice.subscription) {
    // Renovação de assinatura
    logger.info(`🔄 Assinatura renovada: ${invoice.subscription}`);
    // Aqui você pode implementar lógica para renovar acesso
  }
}

/**
 * Falha no pagamento de invoice
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  logger.warning(`❌ Falha no pagamento de invoice: ${invoice.id}`);
  // Notificar usuário sobre falha no pagamento
}

/**
 * Assinatura cancelada
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logger.info(`🚫 Assinatura cancelada: ${subscription.id}`);
  
  const metadata = subscription.metadata;
  if (metadata && metadata.user_id && metadata.guild_id && metadata.product_id) {
    // Remover acesso do usuário
    // Implementar lógica de remoção de roles/acesso
    logger.info(`Removendo acesso do usuário ${metadata.user_id}`);
  }
}
