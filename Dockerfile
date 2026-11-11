# Imagem do quiz + admin (Next.js, output: 'standalone'). Mesmo modelo do quiz OAB.
#   docker build -t quiz-carreiras-juridicas .
# Todas as variáveis (Supabase, admin, serviço de PDF, S3) são lidas em RUNTIME:
# passar com -e/--env-file/task definition. Ver docs/DEPLOY.md.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
