# 📖 Exemplos Práticos de Uso

Este arquivo contém exemplos reais de como usar o bot em diferentes cenários.

## 🎯 Cenário 1: Vender um Curso Digital

### Criar o Produto
```
/addproduct
  nome: Curso Completo de Discord.js
  descricao: Aprenda a criar bots profissionais do zero
  preco: 197.00
  tipo: único
  imagem: https://i.imgur.com/exemplo.png
  role: @Aluno
  conteudo: Acesse o curso em: https://curso.exemplo.com/acesso
```

### Criar Cupom de Lançamento
```
/addcoupon
  codigo: LANCAMENTO50
  desconto_percentual: 50
  max_usos: 100
  dias_validade: 7
```

### Resultado
- ✅ Cliente compra o curso
- ✅ Recebe role @Aluno automaticamente
- ✅ Recebe DM com link de acesso
- ✅ Admin recebe notificação da venda

---

## 🎮 Cenário 2: Assinatura VIP Mensal

### Criar Produto de Assinatura
```
/addproduct
  nome: VIP Premium
  descricao: Acesso exclusivo a canais VIP e benefícios
  preco: 29.90
  tipo: assinatura
  role: @VIP
```

### Configurar Canal Exclusivo
1. Crie um canal `#vip-lounge`
2. Configure permissões: apenas @VIP pode ver
3. A role será dada automaticamente na compra

### Resultado
- ✅ Cliente assina mensalmente
- ✅ Recebe role @VIP por 30 dias
- ✅ Renovação automática via Stripe
- ✅ Role removida se não renovar

---

## 📦 Cenário 3: Produto com Estoque Limitado

### Criar Produto Limitado
```
/addproduct
  nome: Pack de Skins Exclusivas
  descricao: Apenas 50 unidades disponíveis!
  preco: 49.90
  tipo: único
  estoque: 50
  conteudo: Códigos: SKIN-ABC123, SKIN-DEF456
```

### Monitorar Estoque
```
/stats
```

### Resultado
- ✅ Estoque decrementado a cada venda
- ✅ Notificação quando estoque ≤ 5
- ✅ Produto automaticamente indisponível em estoque 0

---

## 🎁 Cenário 4: Promoção Relâmpago

### Cupom de 24h
```
/addcoupon
  codigo: FLASH24
  desconto_percentual: 30
  max_usos: 50
  dias_validade: 1
```

### Anunciar no Discord
```
📢 PROMOÇÃO RELÂMPAGO!

Use o cupom FLASH24 para 30% OFF
⏰ Válido por apenas 24 horas!
🎫 Limitado a 50 usos

Use /catalogo para ver os produtos!
```

---

## 👥 Cenário 5: Produto com Canal Privado

### Criar Produto com Suporte
```
/addproduct
  nome: Mentoria 1:1
  descricao: Sessão de mentoria personalizada
  preco: 297.00
  tipo: único
```

### Configuração Adicional
1. Configure categoria de vendas: `/config category`
2. O bot criará canal privado automaticamente
3. Canal terá permissões apenas para comprador + admins

### Resultado
- ✅ Canal privado `compra-abc123` criado
- ✅ Apenas comprador e admins têm acesso
- ✅ Mensagem de boas-vindas automática

---

## 🏆 Cenário 6: Sistema de Níveis/Tiers

### Tier Básico
```
/addproduct
  nome: Acesso Básico
  descricao: Acesso a canais básicos
  preco: 9.90
  tipo: assinatura
  role: @Básico
```

### Tier Premium
```
/addproduct
  nome: Acesso Premium
  descricao: Acesso a todos os canais + extras
  preco: 29.90
  tipo: assinatura
  role: @Premium
```

### Tier Elite
```
/addproduct
  nome: Acesso Elite
  descricao: Acesso total + mentoria
  preco: 99.90
  tipo: assinatura
  role: @Elite
```

---

## 💰 Cenário 7: Bundle de Produtos

### Criar Bundle
```
/addproduct
  nome: Pack Completo
  descricao: Curso + Mentoria + Acesso VIP (Economize 40%)
  preco: 397.00
  tipo: único
  role: @Pack Completo
  conteudo: 
    ✅ Curso: https://curso.com/acesso
    ✅ Mentoria: Agende em #mentoria
    ✅ VIP: Acesso imediato aos canais
```

### Cupom de Bundle
```
/addcoupon
  codigo: BUNDLE10
  desconto_percentual: 10
  max_usos: 20
```

---

## 📊 Cenário 8: Análise de Vendas

### Ver Estatísticas Gerais
```
/stats
```

**Output:**
```
📊 Estatísticas de Vendas

📦 Produtos Ativos: 12
💳 Total de Vendas: 347
👥 Clientes Únicos: 198
💰 Receita Total: R$ 28,456.80

🏆 Top 5 Produtos:
1. VIP Premium - 89 vendas (R$ 2,661.10)
2. Curso Discord.js - 67 vendas (R$ 13,199.00)
3. Pack Completo - 45 vendas (R$ 17,865.00)
```

### Ver Suas Compras
```
/myorders
```

---

## 🔧 Cenário 9: Configuração Personalizada

### Cores do Servidor
```
/config color #FF0000
```

### Canal de Logs
```
/config logchannel #vendas-log
```

### Ativar Pagamentos
```
/config payment stripe:true mercadopago:true
```

### Ver Todas as Configurações
```
/config view
```

---

## 🎨 Cenário 10: Produto Personalizado

### Serviço de Design
```
/addproduct
  nome: Logo Profissional
  descricao: Logo personalizada em até 48h
  preco: 150.00
  tipo: único
  conteudo: Envie suas preferências no canal #design-requests
```

### Workflow
1. Cliente compra
2. Canal privado é criado
3. Designer entra no canal
4. Trabalho é entregue no canal privado
5. Canal arquivado após conclusão

---

## 🚀 Cenário 11: Lançamento de Produto

### Pré-Lançamento (1 semana antes)
```
/addcoupon
  codigo: EARLY50
  desconto_percentual: 50
  max_usos: 30
  dias_validade: 7
```

**Anúncio:**
```
🎉 PRÉ-LANÇAMENTO!

Novo produto chegando!
🎟️ Use EARLY50 para 50% OFF
👥 Apenas 30 vagas
⏰ Válido por 7 dias

Seja um dos primeiros!
```

### Lançamento (Dia D)
```
/addproduct
  nome: [Novo Produto]
  descricao: [Descrição completa]
  preco: 197.00
  tipo: único
  estoque: 100
```

### Pós-Lançamento (1 semana depois)
```
/addcoupon
  codigo: LAUNCH20
  desconto_percentual: 20
  max_usos: 50
  dias_validade: 3
```

---

## 📱 Cenário 12: Integração com Outros Sistemas

### Webhooks Personalizados
Você pode criar webhooks customizados para integrar com outros sistemas:

```typescript
// Exemplo: Enviar para sistema externo após venda
export async function deliverProduct(guildId, userId, product, transactionId) {
  // Entrega padrão do bot
  await standardDelivery();
  
  // Integração customizada
  await axios.post('https://seu-sistema.com/api/nova-venda', {
    userId,
    productId: product.id,
    transactionId
  });
}
```

---

## 💡 Dicas Avançadas

### 1. Combo de Cupons
Não é possível combinar cupons, mas você pode criar cupons progressivos:
- `PROMO10` - 10% OFF
- `PROMO20` - 20% OFF (somente para clientes VIP)
- `PROMO30` - 30% OFF (Black Friday)

### 2. Gamificação
Use roles temporárias para criar senso de urgência:
```
/addproduct tipo:assinatura
# Role VIP por 30 dias
# Renovação manual ou automática
```

### 3. Upsell no DM
Personalize a mensagem de entrega para incluir ofertas:
```typescript
delivery_content: `
Parabéns pela compra!
Acesse: https://link.com

💡 Aproveite 20% OFF no Premium:
Use o cupom UPGRADE20
`
```

### 4. Scarcity (Escassez)
```
/addproduct estoque:10
# "Apenas 10 unidades!"
```

### 5. Social Proof
Use o canal de logs público para mostrar vendas:
```
✅ João acabou de comprar VIP Premium!
✅ Maria acabou de comprar Curso Completo!
```

---

## 🎯 Templates Prontos

### Template: E-book
```
/addproduct
  nome: E-book: [Título]
  descricao: [Descrição do conteúdo]
  preco: 27.00
  tipo: único
  conteudo: Download: [link-do-pdf]
```

### Template: Mentoria
```
/addproduct
  nome: Mentoria [Tema]
  descricao: Sessão de 1h via Discord
  preco: 197.00
  tipo: único
  conteudo: Agende em: [link-calendly]
```

### Template: Acesso Vitalício
```
/addproduct
  nome: Acesso Vitalício
  descricao: Uma vez e para sempre
  preco: 497.00
  tipo: único
  role: @Vitalício
```

### Template: Trial Gratuito
```
/addproduct
  nome: Trial 7 Dias
  descricao: Teste grátis por 7 dias
  preco: 0.01
  tipo: único
  role: @Trial
```
(Use role temporária de 7 dias)

---

**💡 Lembre-se:** Estes são apenas exemplos! Adapte conforme suas necessidades.
