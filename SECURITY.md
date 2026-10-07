# Segurança

Use um projeto Supabase e credenciais de teste separados de produção. Chaves secretas ficam apenas no processo do bot. O painel Next.js recebe somente uma chave publicável e não deve consultar dados reais enquanto não existir autorização por servidor.

`database/security.sql` remove políticas antigas das tabelas do Sellify e revoga acesso de anon/authenticated. A aplicação do script em um banco já existente exige revisar políticas específicas desse ambiente. Mudanças no GitHub não alteram automaticamente um banco em produção.

Antes de operar vendas, valide assinatura dos webhooks, isolamento por servidor, idempotência, estoque e entrega. Os handlers Mercado Pago e os fluxos de assinatura ainda precisam desse trabalho. Não use o repositório como garantia de segurança para produção.

Se uma credencial for commitada, revogue-a no provedor, atualize o ambiente e avalie a remoção do histórico. Não inclua a chave em issues ou relatórios.
