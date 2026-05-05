FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/auth-service/ ./apps/auth-service/
RUN npm ci --workspace=@khelo/auth-service
RUN npx turbo run build --filter=@khelo/auth-service

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/auth-service/dist ./dist
COPY --from=builder /app/apps/auth-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3005
CMD ["node", "dist/index.js"]
