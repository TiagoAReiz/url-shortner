FROM node:24-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

# NEXT_PUBLIC_* são embutidas no bundle em tempo de build, por isso entram como build args.
ARG NEXT_PUBLIC_API_URL=http://localhost
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN npm run build

# --- runtime: só o servidor standalone ---
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
