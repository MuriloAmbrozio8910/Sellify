/**
 * Servidor de webhooks para receber notificações de pagamento
 */

import express, { Request, Response } from 'express';
import { handleStripeWebhook } from './stripeWebhook';
import { handleMercadoPagoWebhook } from './mercadoPagoWebhook';
import { logger } from '../utils/logger';

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3000;

// Middleware para Stripe (raw body necessário)
app.post('/webhooks/stripe', 
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// Middleware para Mercado Pago
app.use(express.json());

app.post('/webhooks/mercadopago', handleMercadoPagoWebhook);

// Rotas de sucesso/falha
app.get('/success', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Compra Realizada</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        h1 { font-size: 48px; margin-bottom: 20px; }
        p { font-size: 20px; }
        .emoji { font-size: 80px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">🎉</div>
        <h1>Compra Realizada com Sucesso!</h1>
        <p>Seu pagamento foi processado.</p>
        <p>Você receberá acesso ao produto em instantes no Discord.</p>
        <p style="margin-top: 30px; font-size: 16px;">Pode fechar esta janela.</p>
      </div>
    </body>
    </html>
  `);
});

app.get('/cancel', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Compra Cancelada</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        h1 { font-size: 48px; margin-bottom: 20px; }
        p { font-size: 20px; }
        .emoji { font-size: 80px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">❌</div>
        <h1>Compra Cancelada</h1>
        <p>Seu pagamento foi cancelado.</p>
        <p>Você pode tentar novamente quando quiser.</p>
        <p style="margin-top: 30px; font-size: 16px;">Pode fechar esta janela.</p>
      </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
export function startWebhookServer() {
  app.listen(PORT, () => {
    logger.success(`🌐 Servidor de webhooks rodando na porta ${PORT}`);
    logger.info(`📡 Stripe webhook: http://localhost:${PORT}/webhooks/stripe`);
    logger.info(`📡 Mercado Pago webhook: http://localhost:${PORT}/webhooks/mercadopago`);
  });
}

// Se executado diretamente
if (require.main === module) {
  startWebhookServer();
}
