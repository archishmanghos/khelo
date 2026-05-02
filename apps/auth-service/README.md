# Khelo Auth Service

Production-grade authentication and authorization service for the Khelo modular sports scoring platform.

## Overview
This service provides secure user authentication using JWT and Google OAuth 2.0. It follows Clean Architecture principles, ensuring scalability and ease of maintenance.

## Key Features
- **Email + Password Authentication**: Secure signup and login with Argon2 hashing.
- **Google OAuth 2.0**: Seamless SSO integration.
- **JWT Mechanism**: Short-lived access tokens and long-lived refresh tokens (stored hashed).
- **RBAC (Role-Based Access Control)**: Middleware-driven route protection for `user` and `admin` roles.
- **Security**: Rate limiting, HTTP-only cookies, Helmet security headers, and Zod validation.

## Architecture
- **Controllers**: Handle HTTP layer, request/response formatting.
- **Services**: Contain business logic and orchestrate repositories.
- **Repositories**: Direct interaction with PostgreSQL via Prisma ORM.
- **Middlewares**: Centralized authentication, authorization, and error handling.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Setup environment variables:
   Copy `.env.example` to `.env` and fill in the values.
   ```bash
   cp .env.example .env
   ```
3. Initialize Database & Generate Client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
   *Note: The client is generated locally to `prisma/client` to ensure IDE compatibility.*
4. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables
| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for access tokens |
| `REFRESH_TOKEN_SECRET` | Secret key for refresh tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `COOKIE_SECRET` | Secret for signing cookies |

## API Documentation
The API is documented using Swagger. Once the service is running, visit:
`http://localhost:3005/docs`

## Running Tests
Run unit and integration tests using Jest:
```bash
npm test
```

## Future Scalability
- **Microservice Extraction**: Designed as a standalone module that can be easily moved to its own repository or container.
- **Event-Driven**: Can be extended to emit events (e.g., `user.created`) to other services via the monorepo's event bus.
- **Multi-Tenant Ready**: User table can be extended for multi-tenancy if needed.
