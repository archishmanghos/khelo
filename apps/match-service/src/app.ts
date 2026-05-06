import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from './routes';
import { errorHandler, requestLogger } from './middleware';

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

export default app;
