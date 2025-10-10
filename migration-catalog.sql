-- Migration: Adicionar suporte para catálogo permanente
-- Execute este script no SQL Editor do Supabase

-- Adicionar colunas para catálogo permanente na tabela guild_configs
ALTER TABLE guild_configs 
ADD COLUMN IF NOT EXISTS catalog_channel_id TEXT,
ADD COLUMN IF NOT EXISTS catalog_message_id TEXT;

-- Comentário sobre as colunas
COMMENT ON COLUMN guild_configs.catalog_channel_id IS 'ID do canal onde o catálogo permanente está fixado';
COMMENT ON COLUMN guild_configs.catalog_message_id IS 'ID da mensagem do catálogo permanente';
