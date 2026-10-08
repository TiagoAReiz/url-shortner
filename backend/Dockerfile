FROM node:24-slim
WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY tsconfig*.json nest-cli.json prisma.config.ts ./
COPY src ./src
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
# Atualiza o schema do banco e sobe a API.
CMD ["sh", "-c", "npx prisma db update --confirm mydb && node dist/main"]
