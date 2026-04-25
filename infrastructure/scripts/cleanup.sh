#!/usr/bin/env bash

# Ensure we are in the project root
cd "$(dirname "$0")/../.."

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${YELLOW}🏏 Cleaning up Khelo infrastructure and caches...${NC}\n"

echo -e "1/3 Stopping and removing Docker containers..."
docker compose -f infrastructure/docker/docker-compose.dev.yml down -v

echo -e "\n2/3 Cleaning Turbo caches and node_modules in workspaces..."
npm run clean

echo -e "\n3/3 Pruning unused Docker resources..."
docker system prune -f

echo -e "\n${GREEN}Cleanup complete. The workspace is fresh.${NC}"
echo -e "To start again: ${YELLOW}./infrastructure/scripts/setup.sh${NC}"
