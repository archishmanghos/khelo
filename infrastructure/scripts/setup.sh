#!/usr/bin/env bash
set -e

# Ensure we are in the project root
cd "$(dirname "$0")/../.."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏏 Setting up Khelo Monorepo 🏏${NC}\n"

# 1. Check Prereqs
echo -e "${YELLOW}Checking prerequisites...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed. Aborting.${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed. Aborting.${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed. Aborting.${NC}"; exit 1; }
echo -e "${GREEN}Prerequisites OK${NC}\n"

# 2. Install dependencies
echo -e "${YELLOW}Installing npm dependencies...${NC}"
npm install
echo -e "${GREEN}Dependencies installed${NC}\n"

# 3. Setup .env files
echo -e "${YELLOW}Copying .env.example files...${NC}"
for file in $(find apps -name ".env.example"); do
  target="${file%.example}"
  if [ ! -f "$target" ]; then
    cp "$file" "$target"
    echo "  Created: $target"
  else
    echo "  Skipped (already exists): $target"
  fi
done
echo -e "${GREEN}.env files ready${NC}\n"

# 4. Start Docker Infra (Postgres, Redis, Nginx)
echo -e "${YELLOW}Starting Development Infrastructure...${NC}"
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
echo -e "${GREEN}Docker services running${NC}\n"

# 5. Build Shared Packages
echo -e "${YELLOW}Building shared packages via Turbo...${NC}"
npx turbo run build --filter="./packages/*"
echo -e "${GREEN}Shared packages built${NC}\n"

echo -e "=========================================================="
echo -e "${GREEN}🎉 Setup Complete! 🎉${NC}"
echo -e "You can now run: ${BLUE}./infrastructure/scripts/dev.sh${NC} to start all apps."
echo -e "=========================================================="
