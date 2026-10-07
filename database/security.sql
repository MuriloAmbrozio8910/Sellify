-- Aplicar depois do schema e dos scripts complementares, em um banco do projeto.
-- Corrige as políticas antigas sem remover registros. Requer PostgreSQL 15+.
DO $$
DECLARE t text; p record;
BEGIN
  FOREACH t IN ARRAY ARRAY['guild_configs','payment_credentials','products','transactions','coupons','product_feedbacks','access_logs','temporary_roles','support_tickets','ticket_messages','announcements','ticket_config','moderator_notifications','ai_interactions','scheduled_automations','product_reviews','seller_reviews','customizations'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
      END LOOP;
      EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
      EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    END IF;
  END LOOP;
  FOREACH t IN ARRAY ARRAY['product_stats','guild_stats','product_ratings_summary','seller_ratings_summary'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', t);
      EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
      EXECUTE format('GRANT SELECT ON public.%I TO service_role', t);
    END IF;
  END LOOP;
END $$;
