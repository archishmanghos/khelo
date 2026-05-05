import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import { createLogger } from '@khelo/logger';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import routes from './routes';
import { swaggerSpec } from './config/swagger';

const logger = createLogger({ service: 'auth-service', level: 'debug' });
const app = express();
const port = env.PORT;

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: true, // In production, specify origins
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.COOKIE_SECRET));

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/health', (_req, res) => {
  res.json({ service: 'auth-service', status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/v1', authLimiter, routes);

// Error Handling
app.use(errorMiddleware);

const server = app.listen(port, () => {
  logger.info(`🏏 auth-service running on port ${port}`);
  logger.info(`📖 Documentation available at http://localhost:${port}/docs`);
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received — shutting down`);
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
