# 🏏 Khelo — Real-Time Sports Scoring Platform

A production-grade, event-driven modular monolith for real-time sports scoring, built with Node.js, TypeScript, Turborepo, and Angular.

## 🏗️ Architecture Architecture

Khelo is designed as a **Modular Monolith** with a clear migration path to Microservices. 

- **Domain Isolation:** Each core domain (`match`, `scoring`, `stats`) is built as a completely separate Express application.
- **Inter-service Communication:** Services do not directly call each other's REST APIs. Instead, they communicate strictly via the `@khelo/event-bus`.
- **Event-Driven:** Every major action (like a ball being bowled) emits a domain event. The `stats-service` and `realtime-gateway` listen and react to these events.
- **Gateway Pattern:** 
  - An Nginx `api-gateway` routes standard REST requests.
  - A Socket.io `realtime-gateway` manages WebSocket connections and pushes events to specific match rooms.
- **Future Scale (Kafka):** The `InMemoryEventBus` is an abstraction. By implementing the `IEventBus` interface, it can be seamlessly swapped for a Kafka or Redis Streams adapter when scaling demands true microservices.

## 📂 Folder Structure

```
├── apps/
│   ├── api-gateway/      # Nginx reverse proxy (REST router)
│   ├── match-service/    # Port 3001: CRUD for matches, teams, players
│   ├── scoring-service/  # Port 3002: Ball-by-ball scoring engine
│   ├── stats-service/    # Port 3003: Aggregates live stats via events
│   ├── realtime-gateway/ # Port 3004: Socket.io server bridging events to WS
│   └── web/              # Angular standalone frontend (Port 4200)
│
├── packages/
│   ├── config/           # Shared ESLint, Prettier, tsconfig
│   ├── event-bus/        # Pub/Sub abstraction (InMemory → future Kafka)
│   ├── logger/           # Centralized Winston logger
│   ├── types/            # Complete Cricket Domain Types (Match, Ball, ScoreCard)
│   └── utils/            # Math, ID gen, Date helpers, Validation
│
└── infrastructure/
    ├── docker/           # Dev & Prod Compose files
    └── scripts/          # Setup, dev, and app generator scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- npm (v10+)
- Docker & Docker Compose

### One-Command Setup

The easiest way to bootstrap the entire project is using the included bash script. It will install dependencies, copy environment variables, and start the Docker infrastructure.

```bash
chmod +x ./infrastructure/scripts/setup.sh
./infrastructure/scripts/setup.sh
```

### Development Workflow

To start all backend services, the frontend, and ensure Docker is running, use:

```bash
./infrastructure/scripts/dev.sh
```

This runs `npx turbo run dev` under the hood, starting everything in parallel with hot-reloading enabled.

- **API Base:** `http://localhost:3000/api/v1/...`
- **Frontend:** `http://localhost:4200`

### Cleaning Up

To stop Docker containers, clear Turbo caches, and prune the environment:

```bash
./infrastructure/scripts/cleanup.sh
```

## 🛠️ App Generator

Adding a new backend service is standardized. Use the generator script to scaffold a new Turbo-compatible app instantly.

```bash
# Interactive mode
./infrastructure/scripts/generate-app.sh

# Fast mode (Skip prompts)
./infrastructure/scripts/generate-app.sh -f auth-service 3005
```

This will create `apps/auth-service/` complete with Express boilerplate, Dockerfile, `package.json`, and proper Typescript/ESLint configurations.

## 🐳 Docker Production Setup

The monorepo includes a production-ready `docker-compose.prod.yml` that builds optimized, multi-stage alpine images for every node application. 

It includes resource constraints (CPU/Memory limits) and expects production environment variables (like heavy PostgreSQL passwords) to be set.

```bash
export DB_PASSWORD=my_secure_prod_password
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build
```
