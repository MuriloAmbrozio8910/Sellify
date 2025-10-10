/**
 * Integração com sistemas de pagamento (Stripe e Mercado Pago)
 */

import Stripe from 'stripe';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Product, PaymentProvider } from '../types';
import { getPaymentCredential } from './supabase';

const STRIPE_API_VERSION = '2023-10-16';

type StripeClientCacheKey = string;

interface CachedStripeClient {
  client: Stripe;
  apiKey: string;
}

interface CachedMercadoPagoClients {
  config: MercadoPagoConfig;
  preference: Preference;
  payment: Payment;
  accessToken: string;
}

const stripeClientCache = new Map<StripeClientCacheKey, CachedStripeClient>();
const mercadoPagoClientCache = new Map<string, CachedMercadoPagoClients>();

async function getStripeClient(guildId: string): Promise<Stripe> {
  const credential = await getPaymentCredential(guildId, 'stripe');
  if (!credential) {
    throw new Error('Stripe não configurado para este servidor. Use /config payment para cadastrar.');
  }

  const cacheKey = `${guildId}:${credential.api_key}`;
  const cached = stripeClientCache.get(cacheKey);
  if (cached && cached.apiKey === credential.api_key) {
    return cached.client;
  }

  const client = new Stripe(credential.api_key, { apiVersion: STRIPE_API_VERSION });
  stripeClientCache.set(cacheKey, { client, apiKey: credential.api_key });
  return client;
}

async function getMercadoPagoClients(guildId: string): Promise<CachedMercadoPagoClients> {
  const credential = await getPaymentCredential(guildId, 'mercadopago');
  if (!credential) {
    throw new Error('Mercado Pago não configurado para este servidor. Use /config payment para cadastrar.');
  }

  const cacheKey = `${guildId}:${credential.api_key}`;
  const cached = mercadoPagoClientCache.get(cacheKey);
  if (cached && cached.accessToken === credential.api_key) {
    return cached;
  }

  const config = new MercadoPagoConfig({ accessToken: credential.api_key });
  const preference = new Preference(config);
  const payment = new Payment(config);

  const clients: CachedMercadoPagoClients = {
    config,
    preference,
    payment,
    accessToken: credential.api_key
  };

  mercadoPagoClientCache.set(cacheKey, clients);
  return clients;
}

/**
 * STRIPE
 */

// Criar sessão de checkout do Stripe
export async function createStripeCheckoutSession(
  product: Product,
  userId: string,
  transactionId: string
): Promise<string> {
  try {
    const stripeClient = await getStripeClient(product.guild_id);

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.image_url ? [product.image_url] : []
            },
            unit_amount: Math.round(product.price * 100) // Stripe usa centavos
          },
          quantity: 1
        }
      ],
      mode: product.type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${process.env.WEBHOOK_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEBHOOK_URL}/cancel`,
      metadata: {
        transaction_id: transactionId,
        product_id: product.id,
        guild_id: product.guild_id,
        user_id: userId
      }
    });

    return session.url || '';
  } catch (error) {
    console.error('Erro ao criar sessão Stripe:', error);
    throw new Error('Falha ao criar link de pagamento Stripe');
  }
}

// Criar link de pagamento Stripe para assinatura
export async function createStripeSubscription(
  product: Product,
  userId: string,
  transactionId: string
): Promise<string> {
  try {
    const stripeClient = await getStripeClient(product.guild_id);

    // Criar ou buscar cliente
    const customersSearch = await stripeClient.customers.search({
      query: `metadata['discord_user_id']:'${userId}'`,
      limit: 1
    });

    let customer;
    if (customersSearch.data.length > 0) {
      customer = customersSearch.data[0];
    } else {
      customer = await stripeClient.customers.create({
        metadata: {
          discord_user_id: userId,
          guild_id: product.guild_id
        }
      });
    }

    // Criar sessão de checkout para assinatura
    const session = await stripeClient.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: product.name,
              description: product.description
            },
            unit_amount: Math.round(product.price * 100),
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.WEBHOOK_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEBHOOK_URL}/cancel`,
      metadata: {
        transaction_id: transactionId,
        product_id: product.id,
        guild_id: product.guild_id,
        user_id: userId
      }
    });

    return session.url || '';
  } catch (error) {
    console.error('Erro ao criar assinatura Stripe:', error);
    throw new Error('Falha ao criar assinatura Stripe');
  }
}

// Verificar pagamento do Stripe
export async function verifyStripePayment(guildId: string, sessionId: string): Promise<any> {
  try {
    const stripeClient = await getStripeClient(guildId);
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Erro ao verificar pagamento Stripe:', error);
    throw error;
  }
}

// Cancelar assinatura do Stripe
export async function cancelStripeSubscription(guildId: string, subscriptionId: string): Promise<void> {
  try {
    const stripeClient = await getStripeClient(guildId);
    await stripeClient.subscriptions.cancel(subscriptionId);
    console.log(`✅ Assinatura Stripe cancelada: ${subscriptionId}`);
  } catch (error) {
    console.error('Erro ao cancelar assinatura Stripe:', error);
    throw error;
  }
}

/**
 * MERCADO PAGO
 */

// Criar preferência de pagamento Mercado Pago
export async function createMercadoPagoPreference(
  product: Product,
  userId: string,
  transactionId: string
): Promise<string> {
  try {
    const { preference } = await getMercadoPagoClients(product.guild_id);

    const preferencePayload = {
      items: [
        {
          id: product.id,
          title: product.name,
          description: product.description,
          picture_url: product.image_url,
          quantity: 1,
          unit_price: product.price,
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: `${process.env.WEBHOOK_URL}/mp-success`,
        failure: `${process.env.WEBHOOK_URL}/mp-failure`,
        pending: `${process.env.WEBHOOK_URL}/mp-pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.WEBHOOK_URL}/webhooks/mercadopago`,
      metadata: {
        transaction_id: transactionId,
        product_id: product.id,
        guild_id: product.guild_id,
        user_id: userId
      }
    };

    const response = await preference.create({
      body: preferencePayload
    });

    return response.init_point || '';
  } catch (error) {
    console.error('Erro ao criar preferência Mercado Pago:', error);
    throw new Error('Falha ao criar link de pagamento Mercado Pago');
  }
}

// Verificar pagamento do Mercado Pago
export async function verifyMercadoPagoPayment(guildId: string, paymentId: string): Promise<any> {
  try {
    const { payment } = await getMercadoPagoClients(guildId);

    const paymentResult = await payment.get({
      id: paymentId
    });

    return paymentResult;
  } catch (error) {
    console.error('Erro ao verificar pagamento Mercado Pago:', error);
    throw error;
  }
}

/**
 * FUNÇÕES GENÉRICAS
 */

// Criar link de pagamento (escolhe automaticamente o provider)
export async function createPaymentLink(
  product: Product,
  userId: string,
  transactionId: string,
  provider: PaymentProvider = 'stripe'
): Promise<string> {
  if (provider === 'stripe') {
    if (product.type === 'subscription') {
      return await createStripeSubscription(product, userId, transactionId);
    } else {
      return await createStripeCheckoutSession(product, userId, transactionId);
    }
  } else if (provider === 'mercadopago') {
    return await createMercadoPagoPreference(product, userId, transactionId);
  }

  throw new Error('Provider de pagamento não suportado');
}

// Calcular desconto
export interface DiscountResult {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

export function calculateDiscount(
  price: number,
  discountPercent?: number,
  discountFixed?: number
): DiscountResult {
  let discountAmount = 0;

  if (discountPercent) {
    discountAmount = price * (discountPercent / 100);
  } else if (discountFixed) {
    discountAmount = discountFixed;
  }

  const finalPrice = Math.max(0, price - discountAmount);

  return {
    originalPrice: price,
    discountAmount,
    finalPrice
  };
}

// Formatar valor em BRL
export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(value);
}

// Gerar código de transação único
export function generateTransactionCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `TXN-${timestamp}-${random}`.toUpperCase();
}
