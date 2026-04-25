#!/usr/bin/env bash
set -e

# Ensure we are in the project root
cd "$(dirname "$0")/../.."

# Default values
DEFAULT_TYPE="node-ts"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Parse args
FAST_MODE=false
APP_NAME=""
PORT=""

while getopts "f:" opt; do
  case $opt in
    f)
      FAST_MODE=true
      APP_NAME="$OPTARG"
      PORT="${!OPTIND}"
      ;;
    \?)
      echo -e "${RED}Invalid option: -$OPTARG${NC}" >&2
      exit 1
      ;;
  esac
done

if [ "$FAST_MODE" = false ]; then
  echo -e "${BLUE}🏗️  Khelo App Generator${NC}"
  echo -e "-------------------------"
  
  read -p "App Name (e.g., auth-service): " APP_NAME
  read -p "Type [node-ts]: " APP_TYPE
  APP_TYPE=${APP_TYPE:-$DEFAULT_TYPE}
  read -p "Port (e.g., 3005): " PORT
else
  APP_TYPE=$DEFAULT_TYPE
  if [ -z "$APP_NAME" ] || [ -z "$PORT" ]; then
    echo -e "${RED}Usage: ./generate-app.sh -f <app-name> <port>${NC}"
    exit 1
  fi
fi

APP_DIR="apps/$APP_NAME"

if [ -d "$APP_DIR" ]; then
  echo -e "${RED}Error: Directory $APP_DIR already exists!${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Generating $APP_NAME (Type: $APP_TYPE) on Port: $PORT...${NC}"

# Create directories
mkdir -p "$APP_DIR/src/config"
mkdir -p "$APP_DIR/src/controllers"
mkdir -p "$APP_DIR/src/services"
mkdir -p "$APP_DIR/src/routes"
mkdir -p "$APP_DIR/src/middleware"

# ─── package.json ─────────────────────────────────────────────────────────────
cat > "$APP_DIR/package.json" <<EOF
{
  "name": "@khelo/$APP_NAME",
  "version": "0.1.0",
  "private": true,
  "description": "Auto-generated Khelo service",
  "scripts": {
    "build": "tsc -b",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "lint": "eslint src/ --ext .ts",
    "lint:fix": "eslint src/ --ext .ts --fix",
    "test": "echo 'No tests yet'",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "@khelo/types": "*",
    "@khelo/logger": "*",
    "@khelo/utils": "*",
    "@khelo/event-bus": "*",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "helmet": "^8.0.0",
    "compression": "^1.7.5"
  },
  "devDependencies": {
    "@khelo/config": "*",
    "@types/compression": "^1.7.5",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^22.12.0",
    "@typescript-eslint/eslint-plugin": "^8.20.0",
    "@typescript-eslint/parser": "^8.20.0",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^9.1.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3"
  }
}
EOF

# ─── tsconfig.json ────────────────────────────────────────────────────────────
cat > "$APP_DIR/tsconfig.json" <<EOF
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
EOF

# ─── .eslintrc.js ─────────────────────────────────────────────────────────────
cat > "$APP_DIR/.eslintrc.js" <<EOF
module.exports = require('@khelo/config/eslint-config');
EOF

# ─── Dockerfile ───────────────────────────────────────────────────────────────
cat > "$APP_DIR/Dockerfile" <<EOF
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/$APP_NAME/ ./apps/$APP_NAME/
RUN npm ci --workspace=@khelo/$APP_NAME
RUN npx turbo run build --filter=@khelo/$APP_NAME

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/$APP_NAME/dist ./dist
COPY --from=builder /app/apps/$APP_NAME/package.json ./
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE $PORT
CMD ["node", "dist/index.js"]
EOF

# ─── .env.example ─────────────────────────────────────────────────────────────
cat > "$APP_DIR/.env.example" <<EOF
PORT=$PORT
NODE_ENV=development
LOG_LEVEL=debug
EOF

cat > "$APP_DIR/.env" <<EOF
PORT=$PORT
NODE_ENV=development
LOG_LEVEL=debug
EOF

# ─── Source Code Boiletplate ──────────────────────────────────────────────────

cat > "$APP_DIR/src/index.ts" <<EOF
import express from 'express';
import { createLogger } from '@khelo/logger';

const logger = createLogger({ service: '$APP_NAME', level: 'debug' });
const app = express();
const port = process.env.PORT || $PORT;

app.get('/api/v1/health', (_req, res) => {
  res.json({ service: '$APP_NAME', status: 'healthy', timestamp: new Date().toISOString() });
});

const server = app.listen(port, () => {
  logger.info(\`🏏 $APP_NAME running on port \${port}\`);
});

const shutdown = (signal: string) => {
  logger.info(\`\${signal} received — shutting down\`);
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
EOF

# ─── Finalize ─────────────────────────────────────────────────────────────────

echo -e "${GREEN}✓ Bootstrapped $APP_NAME at apps/$APP_NAME${NC}"
echo -e "${YELLOW}Running npm install...${NC}"
npm install --silent

echo -e "${GREEN}✓ Done. To start the app individually run:${NC}"
echo -e "${BLUE}cd apps/$APP_NAME && npm run dev${NC}"
