# Dockerfile para o bot Discord
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY src ./src

# Build TypeScript
RUN npm run build

# Imagem de produção
FROM node:20-alpine

WORKDIR /app

# Copiar dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copiar build
COPY --from=builder /app/dist ./dist

# Expor porta do webhook
EXPOSE 3000

# Variáveis de ambiente (sobrescrever no runtime)
ENV NODE_ENV=production

# Iniciar bot
CMD ["node", "dist/index.js"]
