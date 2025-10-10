-- Migração: Sistema de Tickets e Anúncios
-- Execute este script no SQL Editor do Supabase para adicionar as novas funcionalidades

-- Tabela de tickets de suporte
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    moderator_id TEXT, -- Moderador que assumiu o ticket
    subject TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'claimed', 'closed')) DEFAULT 'open',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    category TEXT, -- Categoria do ticket (vendas, suporte, dúvida, etc)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    claimed_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_guild_id ON support_tickets(guild_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_moderator_id ON support_tickets(moderator_id);

-- Tabela de mensagens de tickets (para histórico)
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    message_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

-- Tabela de anúncios
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    color TEXT DEFAULT '#5865F2',
    image_url TEXT,
    thumbnail_url TEXT,
    created_by TEXT NOT NULL, -- User ID de quem criou
    target_role_id TEXT, -- Se nulo, envia para todos
    channel_id TEXT, -- Canal onde será enviado
    scheduled_for TIMESTAMP WITH TIME ZONE, -- Se nulo, envia imediatamente
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')) DEFAULT 'draft',
    message_id TEXT, -- ID da mensagem enviada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_guild_id ON announcements(guild_id);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_scheduled_for ON announcements(scheduled_for);

-- Tabela de configurações de tickets
CREATE TABLE IF NOT EXISTS ticket_config (
    guild_id TEXT PRIMARY KEY REFERENCES guild_configs(guild_id) ON DELETE CASCADE,
    ticket_category_id TEXT, -- Categoria onde tickets serão criados
    support_role_id TEXT, -- Role de suporte/moderador
    log_channel_id TEXT, -- Canal de logs de tickets
    welcome_message TEXT DEFAULT 'Olá! Um membro da equipe irá atendê-lo em breve. Descreva seu problema com detalhes.',
    auto_notify_moderators BOOLEAN DEFAULT true, -- Notificar moderadores online automaticamente
    max_open_tickets_per_user INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações de moderadores
CREATE TABLE IF NOT EXISTS moderator_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('new_ticket', 'ticket_claimed', 'ticket_closed', 'ticket_message')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mod_notifications_moderator_id ON moderator_notifications(moderator_id);
CREATE INDEX IF NOT EXISTS idx_mod_notifications_is_read ON moderator_notifications(is_read);

-- Tabela de histórico de IA
CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    channel_id TEXT,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('chat', 'content_generation', 'image_generation', 'moderation', 'automation')),
    prompt TEXT NOT NULL,
    response TEXT,
    tokens_used INTEGER,
    cost_estimate DECIMAL(10, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_guild_id ON ai_interactions(guild_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at);

-- Tabela de automações agendadas
CREATE TABLE IF NOT EXISTS scheduled_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    automation_type TEXT NOT NULL CHECK (automation_type IN ('message', 'role_assignment', 'channel_cleanup', 'announcement', 'custom')),
    target_channel_id TEXT,
    target_role_id TEXT,
    content TEXT,
    cron_schedule TEXT, -- Cron expression para agendamento
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automations_guild_id ON scheduled_automations(guild_id);
CREATE INDEX IF NOT EXISTS idx_automations_is_active ON scheduled_automations(is_active);
CREATE INDEX IF NOT EXISTS idx_automations_next_run ON scheduled_automations(next_run);

-- Triggers para updated_at
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_config_updated_at BEFORE UPDATE ON ticket_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON scheduled_automations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderator_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to tickets" ON support_tickets FOR ALL USING (true);
CREATE POLICY "Service role full access to ticket_messages" ON ticket_messages FOR ALL USING (true);
CREATE POLICY "Service role full access to announcements" ON announcements FOR ALL USING (true);
CREATE POLICY "Service role full access to ticket_config" ON ticket_config FOR ALL USING (true);
CREATE POLICY "Service role full access to moderator_notifications" ON moderator_notifications FOR ALL USING (true);
CREATE POLICY "Service role full access to ai_interactions" ON ai_interactions FOR ALL USING (true);
CREATE POLICY "Service role full access to scheduled_automations" ON scheduled_automations FOR ALL USING (true);

-- Views úteis
CREATE OR REPLACE VIEW ticket_stats AS
SELECT 
    guild_id,
    COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
    COUNT(*) FILTER (WHERE status = 'claimed') as claimed_tickets,
    COUNT(*) FILTER (WHERE status = 'closed') as closed_tickets,
    COUNT(DISTINCT moderator_id) FILTER (WHERE moderator_id IS NOT NULL) as active_moderators,
    AVG(EXTRACT(EPOCH FROM (closed_at - created_at))) FILTER (WHERE closed_at IS NOT NULL) as avg_resolution_time_seconds
FROM support_tickets
GROUP BY guild_id;

COMMENT ON TABLE support_tickets IS 'Sistema de tickets de suporte';
COMMENT ON TABLE ticket_messages IS 'Histórico de mensagens dos tickets';
COMMENT ON TABLE announcements IS 'Sistema de anúncios e notificações programadas';
COMMENT ON TABLE ticket_config IS 'Configurações do sistema de tickets por servidor';
COMMENT ON TABLE moderator_notifications IS 'Notificações para moderadores';
COMMENT ON TABLE ai_interactions IS 'Histórico de interações com IA';
COMMENT ON TABLE scheduled_automations IS 'Automações agendadas do servidor';
