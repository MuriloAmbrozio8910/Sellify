# Dockerfile para o dashboard Next.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build Next.js
RUN npm run build

# Imagem de produção
FROM node:20-alpine

WORKDIR /app

# Copiar dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copiar build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Expor porta
EXPOSE 3001

ENV NODE_ENV=production

# Iniciar Next.js
CMD ["npm", "start"]
