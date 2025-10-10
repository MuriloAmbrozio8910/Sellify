/**
 * Tipos TypeScript para o sistema de vendas Discord
 */

import { Collection } from 'discord.js';

// Tipo de produto
export enum ProductType {
  UNIQUE = 'unique',
  SUBSCRIPTION = 'subscription'
}

// Status de transação
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

// Produto
export interface Product {
  id: string;
  guild_id: string;
  name: string;
  description: string;
  price: number;
  type: ProductType;
  image_url?: string;
  stock?: number;
  role_id?: string; // Role que será dada ao comprador
  channel_id?: string; // Canal privado a ser criado
  delivery_content?: string; // Conteúdo digital a ser entregue
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Transação/Compra
export interface Transaction {
  id: string;
  guild_id: string;
  product_id: string;
  user_id: string;
  amount: number;
  status: TransactionStatus;
  payment_provider: 'stripe' | 'mercadopago' | 'manual';
  payment_id?: string;
  subscription_id?: string;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export type PaymentProvider = 'stripe' | 'mercadopago';

export interface PaymentCredential {
  guild_id: string;
  provider: PaymentProvider;
  api_key: string;
  webhook_secret?: string;
  additional_config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Configurações do servidor
export interface GuildConfig {
  guild_id: string;
  sales_category_id?: string; // Categoria para canais de vendas
  log_channel_id?: string; // Canal de logs
  catalog_channel_id?: string; // Canal do catálogo permanente
  catalog_message_id?: string; // ID da mensagem do catálogo
  admin_role_id?: string; // Role de admin
  embed_color: string; // Cor dos embeds
  welcome_message?: string;
  purchase_message?: string;
  currency: string; // BRL, USD, etc
  stripe_enabled: boolean;
  mercadopago_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

// Cupom de desconto
export interface Coupon {
  id: string;
  guild_id: string;
  code: string;
  discount_percent?: number;
  discount_fixed?: number;
  max_uses?: number;
  current_uses: number;
  expires_at?: Date;
  is_active: boolean;
  created_at: Date;
}

// Feedback de produto
export interface ProductFeedback {
  id: string;
  guild_id: string;
  product_id: string;
  user_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: Date;
}

// Log de acesso
export interface AccessLog {
  id: string;
  guild_id: string;
  user_id: string;
  product_id?: string;
  action: string;
  details?: string;
  created_at: Date;
}

// Role temporária
export interface TemporaryRole {
  id: string;
  guild_id: string;
  user_id: string;
  role_id: string;
  expires_at: Date;
  created_at: Date;
}

// Dados de paginação para catálogo
export interface CatalogPage {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

// Comando Discord customizado
export interface Command {
  name: string;
  description: string;
  options?: any[];
  execute: (interaction: any) => Promise<void>;
}

// Cliente Discord estendido
export interface ExtendedClient {
  commands: Collection<string, Command>;
  login(token: string): Promise<string>;
}

// Dados do webhook de pagamento
export interface PaymentWebhookData {
  provider: 'stripe' | 'mercadopago';
  transaction_id: string;
  status: TransactionStatus;
  amount: number;
  customer_id: string;
  product_id?: string;
  metadata?: any;
}

// Notificação
export interface Notification {
  guild_id: string;
  user_id?: string;
  channel_id?: string;
  title: string;
  description: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  thumbnail?: string;
  image?: string;
}

// Sistema de Tickets
export enum TicketStatus {
  OPEN = 'open',
  CLAIMED = 'claimed',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface SupportTicket {
  id: string;
  guild_id: string;
  user_id: string;
  channel_id: string;
  moderator_id?: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  created_at: Date;
  claimed_at?: Date;
  closed_at?: Date;
  updated_at: Date;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message_content: string;
  created_at: Date;
}

export interface TicketConfig {
  guild_id: string;
  ticket_category_id?: string;
  support_role_id?: string;
  log_channel_id?: string;
  welcome_message?: string;
  auto_notify_moderators: boolean;
  max_open_tickets_per_user: number;
  created_at: Date;
  updated_at: Date;
}

// Sistema de Anúncios
export enum AnnouncementStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENT = 'sent',
  CANCELLED = 'cancelled'
}

export interface Announcement {
  id: string;
  guild_id: string;
  title: string;
  content: string;
  color: string;
  image_url?: string;
  thumbnail_url?: string;
  created_by: string;
  target_role_id?: string;
  channel_id?: string;
  scheduled_for?: Date;
  sent_at?: Date;
  status: AnnouncementStatus;
  message_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Sistema de IA
export enum AIInteractionType {
  CHAT = 'chat',
  CONTENT_GENERATION = 'content_generation',
  IMAGE_GENERATION = 'image_generation',
  MODERATION = 'moderation',
  AUTOMATION = 'automation'
}

export interface AIInteraction {
  id: string;
  guild_id: string;
  user_id: string;
  channel_id?: string;
  interaction_type: AIInteractionType;
  prompt: string;
  response?: string;
  tokens_used?: number;
  cost_estimate?: number;
  created_at: Date;
}

// Automações
export enum AutomationType {
  MESSAGE = 'message',
  ROLE_ASSIGNMENT = 'role_assignment',
  CHANNEL_CLEANUP = 'channel_cleanup',
  ANNOUNCEMENT = 'announcement',
  CUSTOM = 'custom'
}

export interface ScheduledAutomation {
  id: string;
  guild_id: string;
  automation_type: AutomationType;
  target_channel_id?: string;
  target_role_id?: string;
  content?: string;
  cron_schedule?: string;
  is_active: boolean;
  last_run?: Date;
  next_run?: Date;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// Notificações de Moderador
export enum ModNotificationType {
  NEW_TICKET = 'new_ticket',
  TICKET_CLAIMED = 'ticket_claimed',
  TICKET_CLOSED = 'ticket_closed',
  TICKET_MESSAGE = 'ticket_message'
}

export interface ModeratorNotification {
  id: string;
  guild_id: string;
  moderator_id: string;
  ticket_id?: string;
  notification_type: ModNotificationType;
  is_read: boolean;
  created_at: Date;
}
