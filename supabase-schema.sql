-- Schema SQL para Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de configurações dos servidores
CREATE TABLE IF NOT EXISTS guild_configs (
    guild_id TEXT PRIMARY KEY,
    sales_category_id TEXT,
    log_channel_id TEXT,
    catalog_channel_id TEXT,
    catalog_message_id TEXT,
    admin_role_id TEXT,
    embed_color TEXT DEFAULT '#5865F2',
    welcome_message TEXT,
    purchase_message TEXT,
    currency TEXT DEFAULT 'BRL',
    stripe_enabled BOOLEAN DEFAULT false,
    mercadopago_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de credenciais de pagamento por servidor
CREATE TABLE IF NOT EXISTS payment_credentials (
    guild_id TEXT NOT NULL REFERENCES guild_configs(guild_id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'mercadopago')),
    api_key TEXT NOT NULL,
    webhook_secret TEXT,
    additional_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (guild_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_payment_credentials_provider ON payment_credentials(provider);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('unique', 'subscription')),
    image_url TEXT,
    stock INTEGER,
    role_id TEXT,
    channel_id TEXT,
    delivery_content TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_products_guild_id ON products(guild_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    user_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'mercadopago', 'manual')),
    payment_id TEXT,
    subscription_id TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para transações
CREATE INDEX IF NOT EXISTS idx_transactions_guild_id ON transactions(guild_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Tabela de cupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    code TEXT NOT NULL,
    discount_percent INTEGER,
    discount_fixed DECIMAL(10, 2),
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(guild_id, code)
);

-- Índices para cupons
CREATE INDEX IF NOT EXISTS idx_coupons_guild_id ON coupons(guild_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Tabela de feedbacks de produtos
CREATE TABLE IF NOT EXISTS product_feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    user_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- Índices para feedbacks
CREATE INDEX IF NOT EXISTS idx_feedbacks_product_id ON product_feedbacks(product_id);

-- Tabela de logs de acesso
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    product_id UUID REFERENCES products(id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_logs_guild_id ON access_logs(guild_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON access_logs(created_at);

-- Tabela de roles temporárias
CREATE TABLE IF NOT EXISTS temporary_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para roles temporárias
CREATE INDEX IF NOT EXISTS idx_temp_roles_guild_id ON temporary_roles(guild_id);
CREATE INDEX IF NOT EXISTS idx_temp_roles_expires_at ON temporary_roles(expires_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_guild_configs_updated_at BEFORE UPDATE ON guild_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_credentials_updated_at BEFORE UPDATE ON payment_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security) - Opcional, mas recomendado
ALTER TABLE guild_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_credentials ENABLE ROW LEVEL SECURITY;

-- Políticas para service_role (acesso total)
CREATE POLICY "Service role has full access to guild_configs" ON guild_configs
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to products" ON products
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to transactions" ON transactions
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to coupons" ON coupons
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to product_feedbacks" ON product_feedbacks
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to access_logs" ON access_logs
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to temporary_roles" ON temporary_roles
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to payment_credentials" ON payment_credentials
    FOR ALL USING (true);

-- Views úteis

-- View de estatísticas de produtos
CREATE OR REPLACE VIEW product_stats AS
SELECT 
    p.id,
    p.name,
    p.guild_id,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as total_sales,
    SUM(t.amount) FILTER (WHERE t.status = 'completed') as total_revenue,
    AVG(f.rating) as average_rating,
    COUNT(DISTINCT f.id) as total_reviews
FROM products p
LEFT JOIN transactions t ON p.id = t.product_id
LEFT JOIN product_feedbacks f ON p.id = f.product_id
GROUP BY p.id, p.name, p.guild_id;

-- View de estatísticas de servidor
CREATE OR REPLACE VIEW guild_stats AS
SELECT 
    p.guild_id,
    COUNT(DISTINCT p.id) FILTER (WHERE p.is_active = true) as active_products,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as total_transactions,
    SUM(t.amount) FILTER (WHERE t.status = 'completed') as total_revenue,
    COUNT(DISTINCT t.user_id) FILTER (WHERE t.status = 'completed') as unique_customers
FROM products p
LEFT JOIN transactions t ON p.id = t.product_id
GROUP BY p.guild_id;

COMMENT ON TABLE guild_configs IS 'Configurações específicas de cada servidor Discord';
COMMENT ON TABLE products IS 'Produtos disponíveis para venda';
COMMENT ON TABLE transactions IS 'Transações e compras realizadas';
COMMENT ON TABLE coupons IS 'Cupons de desconto';
COMMENT ON TABLE product_feedbacks IS 'Avaliações de produtos pelos usuários';
COMMENT ON TABLE access_logs IS 'Logs de acesso e ações dos usuários';
COMMENT ON TABLE temporary_roles IS 'Roles temporárias concedidas por assinaturas';
COMMENT ON TABLE payment_credentials IS 'Credenciais de provedores de pagamento configuradas por servidor';
