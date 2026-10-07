-- ========================================
-- SISTEMA DE AVALIAÇÕES
-- ========================================

-- Tabela de Avaliações de Produtos
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Avaliações de Vendedores/Atendentes
CREATE TABLE IF NOT EXISTS seller_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id TEXT NOT NULL,
  seller_id TEXT NOT NULL, -- ID do membro que foi avaliado
  reviewer_id TEXT NOT NULL, -- ID de quem fez a avaliação
  ticket_id TEXT, -- ID do ticket (sem FK pois tabela pode não existir)
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  category TEXT, -- 'support', 'sales', 'general'
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_guild ON product_reviews(guild_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_seller_reviews_seller ON seller_reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_guild ON seller_reviews(guild_id);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_category ON seller_reviews(category);

-- View para estatísticas de produtos
CREATE OR REPLACE VIEW product_ratings_summary WITH (security_invoker = true) AS
SELECT
  product_id,
  COUNT(*) as total_reviews,
  AVG(rating)::NUMERIC(3,2) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_stars,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_stars,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_stars,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
FROM product_reviews
WHERE is_approved = TRUE
GROUP BY product_id;

-- View para estatísticas de vendedores
CREATE OR REPLACE VIEW seller_ratings_summary WITH (security_invoker = true) AS
SELECT
  seller_id,
  guild_id,
  category,
  COUNT(*) as total_reviews,
  AVG(rating)::NUMERIC(3,2) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_stars,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_stars,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_stars,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
FROM seller_reviews
WHERE is_approved = TRUE
GROUP BY seller_id, guild_id, category;

-- Comentários
COMMENT ON TABLE product_reviews IS 'Avaliações de produtos pelos compradores';
COMMENT ON TABLE seller_reviews IS 'Avaliações de vendedores e atendentes';

COMMENT ON COLUMN product_reviews.rating IS 'Nota de 1 a 5 estrelas';
COMMENT ON COLUMN product_reviews.is_anonymous IS 'Se a avaliação deve ser anônima';
COMMENT ON COLUMN product_reviews.is_approved IS 'Se a avaliação foi aprovada por moderador';

COMMENT ON COLUMN seller_reviews.category IS 'Categoria: support (suporte), sales (vendas), general (geral)';

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.product_reviews FROM anon, authenticated;
GRANT ALL ON public.product_reviews TO service_role;

ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.seller_reviews FROM anon, authenticated;
GRANT ALL ON public.seller_reviews TO service_role;
