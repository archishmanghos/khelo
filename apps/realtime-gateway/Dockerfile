FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/realtime-gateway/ ./apps/realtime-gateway/
RUN npm ci --workspace=@khelo/realtime-gateway
RUN npx turbo run build --filter=@khelo/realtime-gateway

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/realtime-gateway/dist ./dist
COPY --from=builder /app/apps/realtime-gateway/package.json ./
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3004
CMD ["node", "dist/index.js"]
