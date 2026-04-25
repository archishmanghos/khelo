FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/stats-service/ ./apps/stats-service/
RUN npm ci --workspace=@khelo/stats-service
RUN npx turbo run build --filter=@khelo/stats-service

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/stats-service/dist ./dist
COPY --from=builder /app/apps/stats-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3003
CMD ["node", "dist/index.js"]
