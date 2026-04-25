FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/match-service/ ./apps/match-service/

RUN npm ci --workspace=@khelo/match-service
RUN npx turbo run build --filter=@khelo/match-service

# ─── Production ───────────────────────────────────────────────────────────────

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/match-service/dist ./dist
COPY --from=builder /app/apps/match-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]
