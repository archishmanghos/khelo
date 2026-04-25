#!/usr/bin/env bash
set -e

# Ensure we are in the project root
cd "$(dirname "$0")/../.."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏏 Starting Khelo Development Environment...${NC}"

# Handle graceful shutdown on Ctrl+C
cleanup() {
  echo -e "\n${BLUE}Stopping development environment...${NC}"
  # Note: we let Turbo stop the apps automatically on SIGINT
  # If we want to completely stop docker we would uncomment this:
  # docker compose -f infrastructure/docker/docker-compose.dev.yml stop
  echo -e "${GREEN}Developer note: Docker containers are left running. Use cleanup.sh to stop them entirely.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${GREEN}1/2 Ensuring Docker infrastructure is running...${NC}"
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

echo -e "${GREEN}2/2 Starting Turborepo dev pipeline...${NC}"
# This runs 'npm run dev' on all apps as defined in turbo.json
# We set concurrency to 20 to allow all our persistent microservices to run simultaneously
npx turbo run dev --concurrency=20

# Turborepo handles parallel execution and multiplexes the output gracefully.
