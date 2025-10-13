-- Tabela de Customizações
-- Armazena todas as personalizações visuais do bot por servidor

CREATE TABLE IF NOT EXISTS customizations (
  guild_id TEXT NOT NULL,
  customization_type TEXT NOT NULL,
  customization_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (guild_id, customization_type)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_customizations_guild ON customizations(guild_id);
CREATE INDEX IF NOT EXISTS idx_customizations_type ON customizations(customization_type);

-- Comentários
COMMENT ON TABLE customizations IS 'Armazena personalizações visuais de embeds, botões e configurações do bot';
COMMENT ON COLUMN customizations.guild_id IS 'ID do servidor Discord';
COMMENT ON COLUMN customizations.customization_type IS 'Tipo de customização (ticket, product, panel, announcement, etc)';
COMMENT ON COLUMN customizations.customization_data IS 'Dados JSON da customização (título, descrição, cores, campos, botões, etc)';

-- Exemplo de estrutura do customization_data:
/*
{
  "title": "🎫 Sistema de Tickets",
  "description": "Abra um ticket para suporte",
  "color": "#5865F2",
  "author_name": "Equipe de Suporte",
  "author_icon": "https://...",
  "author_url": "https://...",
  "footer_text": "Estamos aqui para ajudar!",
  "footer_icon": "https://...",
  "image_url": "https://...",
  "thumbnail_url": "https://...",
  "timestamp": true,
  "fields": [
    {
      "name": "Horário",
      "value": "24/7 disponível",
      "inline": true
    }
  ],
  "buttons": [
    {
      "customId": "create_ticket_suporte",
      "label": "Abrir Ticket",
      "style": "primary",
      "emoji": "🎫"
    }
  ],
  "config": {
    "category_id": "123456789",
    "support_role_id": "987654321"
  }
}
*/
