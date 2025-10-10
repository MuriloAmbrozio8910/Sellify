/**
 * Cliente Supabase e funções de banco de dados
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
loadEnv();

import {
  Product,
  Transaction,
  GuildConfig,
  Coupon,
  ProductFeedback,
  AccessLog,
  TemporaryRole,
  ProductType,
  TransactionStatus,
  PaymentProvider,
  PaymentCredential
} from '../types';

// Inicializar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY!;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

const paymentCredentialCache = new Map<string, PaymentCredential | null>();

function buildCacheKey(guildId: string, provider: PaymentProvider) {
  return `${guildId}:${provider}`;
}

function cacheCredentials(credential: PaymentCredential) {
  const key = buildCacheKey(credential.guild_id, credential.provider);
  paymentCredentialCache.set(key, credential);
}

export async function getPaymentCredential(
  guildId: string,
  provider: PaymentProvider
): Promise<PaymentCredential | null> {
  const cacheKey = buildCacheKey(guildId, provider);
  const cached = paymentCredentialCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const { data, error } = await supabase
    .from('payment_credentials')
    .select('*')
    .eq('guild_id', guildId)
    .eq('provider', provider)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erro ao buscar credenciais de pagamento: ${error.message}`);
  }

  if (!data) {
    paymentCredentialCache.set(cacheKey, null);
    return null;
  }

  const credential = data as PaymentCredential;
  cacheCredentials(credential);
  return credential;
}

export async function upsertPaymentCredential(
  credential: Omit<PaymentCredential, 'created_at' | 'updated_at'>
): Promise<PaymentCredential> {
  const { data, error } = await supabase
    .from('payment_credentials')
    .upsert(
      {
        ...credential,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'guild_id,provider' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao salvar credenciais de pagamento: ${error.message}`);
  }

  const saved = data as PaymentCredential;
  cacheCredentials(saved);

  return saved;
}

export async function deletePaymentCredential(
  guildId: string,
  provider: PaymentProvider
): Promise<void> {
  const { error } = await supabase
    .from('payment_credentials')
    .delete()
    .eq('guild_id', guildId)
    .eq('provider', provider);

  if (error) {
    throw new Error(`Erro ao remover credenciais de pagamento: ${error.message}`);
  }

  paymentCredentialCache.delete(buildCacheKey(guildId, provider));
}

export async function listPaymentCredentialsByProvider(
  provider: PaymentProvider
): Promise<PaymentCredential[]> {
  const { data, error } = await supabase
    .from('payment_credentials')
    .select('*')
    .eq('provider', provider);

  if (error) {
    throw new Error(`Erro ao listar credenciais de pagamento: ${error.message}`);
  }

  const credentials = (data ?? []) as PaymentCredential[];
  for (const credential of credentials) {
    cacheCredentials(credential);
  }

  return credentials;
}

/**
 * PRODUTOS
 */

// Criar produto
export async function createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar produto: ${error.message}`);
  return data;
}

// Buscar produto por ID
export async function getProductById(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) return null;
  return data;
}

// Listar produtos ativos de um servidor
export async function getActiveProducts(guildId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('guild_id', guildId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao listar produtos: ${error.message}`);
  return data || [];
}

// Atualizar produto
export async function updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar produto: ${error.message}`);
  return data;
}

// Remover produto (soft delete)
export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) throw new Error(`Erro ao remover produto: ${error.message}`);
}

// Decrementar estoque
export async function decrementStock(productId: string): Promise<Product> {
  const product = await getProductById(productId);
  if (!product) throw new Error('Produto não encontrado');
  
  if (product.stock !== null && product.stock !== undefined) {
    if (product.stock <= 0) throw new Error('Produto sem estoque');
    return await updateProduct(productId, { stock: product.stock - 1 });
  }
  
  return product;
}

/**
 * TRANSAÇÕES
 */

// Criar transação
export async function createTransaction(transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar transação: ${error.message}`);
  return data;
}

// Buscar transação por ID
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (error) return null;
  return data;
}

// Buscar transação por payment_id
export async function getTransactionByPaymentId(paymentId: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('payment_id', paymentId)
    .single();

  if (error) return null;
  return data;
}

// Atualizar status da transação
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  paymentId?: string
): Promise<Transaction> {
  const updates: any = { status, updated_at: new Date().toISOString() };
  if (paymentId) updates.payment_id = paymentId;

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar transação: ${error.message}`);
  return data;
}

// Listar transações de um usuário
export async function getUserTransactions(guildId: string, userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao listar transações: ${error.message}`);
  return data || [];
}

/**
 * CONFIGURAÇÕES DO SERVIDOR
 */

// Buscar ou criar configuração do servidor
export async function getOrCreateGuildConfig(guildId: string): Promise<GuildConfig> {
  let { data, error } = await supabase
    .from('guild_configs')
    .select('*')
    .eq('guild_id', guildId)
    .single();

  if (error || !data) {
    // Criar configuração padrão
    const defaultConfig: Omit<GuildConfig, 'created_at' | 'updated_at'> = {
      guild_id: guildId,
      embed_color: '#5865F2',
      currency: 'BRL',
      stripe_enabled: false,
      mercadopago_enabled: false
    };

    const { data: newData, error: insertError } = await supabase
      .from('guild_configs')
      .insert([defaultConfig])
      .select()
      .single();

    if (insertError) throw new Error(`Erro ao criar configuração: ${insertError.message}`);
    return newData;
  }

  return data;
}

// Atualizar configuração do servidor
export async function updateGuildConfig(guildId: string, updates: Partial<GuildConfig>): Promise<GuildConfig> {
  const { data, error } = await supabase
    .from('guild_configs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('guild_id', guildId)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar configuração: ${error.message}`);
  return data;
}

/**
 * CUPONS
 */

// Criar cupom
export async function createCoupon(couponData: Omit<Coupon, 'id' | 'created_at' | 'current_uses'>): Promise<Coupon> {
  const { data, error } = await supabase
    .from('coupons')
    .insert([{ ...couponData, current_uses: 0 }])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar cupom: ${error.message}`);
  return data;
}

// Validar e usar cupom
export async function validateAndUseCoupon(guildId: string, code: string): Promise<Coupon> {
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('guild_id', guildId)
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !coupon) throw new Error('Cupom inválido ou expirado');

  // Verificar limite de usos
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    throw new Error('Cupom atingiu o limite de usos');
  }

  // Verificar expiração
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    throw new Error('Cupom expirado');
  }

  // Incrementar uso
  await supabase
    .from('coupons')
    .update({ current_uses: coupon.current_uses + 1 })
    .eq('id', coupon.id);

  return coupon;
}

/**
 * FEEDBACK
 */

// Criar feedback
export async function createFeedback(feedbackData: Omit<ProductFeedback, 'id' | 'created_at'>): Promise<ProductFeedback> {
  const { data, error } = await supabase
    .from('product_feedbacks')
    .insert([feedbackData])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar feedback: ${error.message}`);
  return data;
}

// Buscar média de avaliações de um produto
export async function getProductAverageRating(productId: string): Promise<number> {
  const { data, error } = await supabase
    .from('product_feedbacks')
    .select('rating')
    .eq('product_id', productId);

  if (error || !data || data.length === 0) return 0;

  const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
  return sum / data.length;
}

/**
 * LOGS
 */

// Criar log de acesso
export async function createAccessLog(logData: Omit<AccessLog, 'id' | 'created_at'>): Promise<void> {
  await supabase.from('access_logs').insert([logData]);
}

/**
 * ROLES TEMPORÁRIAS
 */

// Criar role temporária
export async function createTemporaryRole(roleData: Omit<TemporaryRole, 'id' | 'created_at'>): Promise<TemporaryRole> {
  const { data, error } = await supabase
    .from('temporary_roles')
    .insert([roleData])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar role temporária: ${error.message}`);
  return data;
}

// Buscar roles temporárias expiradas
export async function getExpiredTemporaryRoles(): Promise<TemporaryRole[]> {
  const { data, error } = await supabase
    .from('temporary_roles')
    .select('*')
    .lt('expires_at', new Date().toISOString());

  if (error) return [];
  return data || [];
}

// Remover role temporária
export async function removeTemporaryRole(roleId: string): Promise<void> {
  await supabase.from('temporary_roles').delete().eq('id', roleId);
}
