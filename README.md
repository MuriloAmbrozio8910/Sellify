# Sellify

Bot de vendas e atendimento para Discord, escrito em TypeScript. O trabalho está concentrado em painéis com botões e modais, cadastro de produtos, cupons, pedidos e tickets. Os dados ficam no Supabase; as integrações de pagamento usam Stripe e Mercado Pago.

## O que existe no código

- Catálogo, produtos, estoque, cupons e histórico de pedidos.
- Tickets, configuração de canais e cargos de suporte.
- Personalização de embeds e anúncios imediatos ou agendados.
- Integração com OpenAI e registro de interações.
- Handlers de checkout, webhooks e entrega de produtos.

## Preparação

Use Node.js 20 ou superior e uma aplicação de bot no Discord. Instale com `npm ci`, copie `.env.example` para `.env` e configure `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `SUPABASE_URL` e a chave secreta do Supabase. `SUPABASE_SERVICE_KEY` mantém compatibilidade com a chave legada service_role. Essas chaves são exclusivas do servidor.

Em um projeto Supabase de teste, aplique nesta ordem:

1. `supabase-schema.sql`.
2. `migration-catalog.sql` e `migration-tickets-announcements.sql`.
3. Os três scripts em `database/migrations/`.
4. `database/security.sql`, que restringe tabelas e views ao backend.

Os scripts SQL são parte do setup manual, não de um sistema automático de migrações. Para um banco existente, revise o efeito sobre as políticas antes de executar o script de segurança.

```sh
npm run test:env
npm run build
npm run deploy-commands
npm start
```

O token precisa dos intents utilizados em `src/index.ts`. Configure o bot em um servidor de teste antes de trabalhar com clientes. As credenciais de pagamento são cadastradas por servidor pelos painéis do bot; as variáveis Stripe/Mercado Pago antigas não são usadas como fallback pelo fluxo atual.

## Estrutura

`src/commands/` registra comandos; `src/events/` e `src/modals/` tratam interações. `src/utils/` contém acesso ao banco, pagamentos e serviços auxiliares. `src/webhooks/` recebe notificações de pagamento. `dashboard/` contém um painel Next.js experimental.

## Estado atual

Este é um projeto em desenvolvimento. O painel web ainda não tem autenticação nem autorização por servidor e deve ser usado apenas com um banco de demonstração. O fluxo Mercado Pago precisa de revisão de assinatura e roteamento de notificações. Renovações de assinatura, revogação de acesso e idempotência de entrega também precisam de validação antes de uso comercial. O código não representa uma solução pronta para processar pagamentos reais.

Credenciais de pagamento são armazenadas na tabela `payment_credentials`; limite acesso ao backend e evite dados reais em testes. Não publique `.env`, logs ou dumps. A política de segurança está em [SECURITY.md](SECURITY.md).

## Licença

MIT. Consulte [LICENSE](LICENSE).
