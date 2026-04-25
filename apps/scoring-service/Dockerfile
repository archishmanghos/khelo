FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/scoring-service/ ./apps/scoring-service/
RUN npm ci --workspace=@khelo/scoring-service
RUN npx turbo run build --filter=@khelo/scoring-service

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/scoring-service/dist ./dist
COPY --from=builder /app/apps/scoring-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3002
CMD ["node", "dist/index.js"]
