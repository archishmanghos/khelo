import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { config } from './config';
import { createLogger } from '@khelo/logger';
import { getEventBus } from '@khelo/event-bus';
import { nowISO } from '@khelo/utils';
import type { DomainEvent, EventType } from '@khelo/types';

const logger = createLogger({ service: config.name, level: config.logLevel });

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── Health check ────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    service: config.name,
    status: 'healthy',
    version: '0.1.0',
    uptime: process.uptime(),
    timestamp: nowISO(),
    connections: io.engine.clientsCount,
  });
});

// ─── Socket.io connection handling ───────────────────────────────────────────

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join a match room
  socket.on('match:join', ({ matchId }: { matchId: string }) => {
    socket.join(`match:${matchId}`);
    logger.debug(`Client ${socket.id} joined match room: ${matchId}`);
    socket.emit('match:joined', { matchId, timestamp: nowISO() });
  });

  // Leave a match room
  socket.on('match:leave', ({ matchId }: { matchId: string }) => {
    socket.leave(`match:${matchId}`);
    logger.debug(`Client ${socket.id} left match room: ${matchId}`);
  });

  socket.on('disconnect', (reason) => {
    logger.info(`Client disconnected: ${socket.id} (${reason})`);
  });
});

// ─── Event Bus → Socket.io Bridge ───────────────────────────────────────────

const eventBus = getEventBus();

// Forward scoring events to match rooms
function bridgeEvent(eventType: EventType, socketEvent: string) {
  eventBus.subscribe(eventType, (event: DomainEvent) => {
    const payload = event.payload as Record<string, unknown>;
    const matchId = (payload.matchId as string) ||
      ((payload.innings as Record<string, unknown>)?.matchId as string) ||
      ((payload.match as Record<string, unknown>)?.id as string);

    if (matchId) {
      io.to(`match:${matchId}`).emit(socketEvent, {
        ...payload,
        timestamp: event.timestamp,
      });
      logger.debug(`Broadcast ${socketEvent} to match:${matchId}`);
    } else {
      // Broadcast globally if no matchId
      io.emit(socketEvent, { ...payload, timestamp: event.timestamp });
    }
  });
}

// Wire up event-to-socket bridges
bridgeEvent('ball.bowled', 'ball:update');
bridgeEvent('wicket.fallen', 'wicket:alert');
bridgeEvent('over.completed', 'over:completed');
bridgeEvent('match.started', 'match:update');
bridgeEvent('match.completed', 'match:update');
bridgeEvent('innings.started', 'innings:update');
bridgeEvent('innings.completed', 'innings:update');
bridgeEvent('scorecard.updated', 'score:update');
bridgeEvent('stats.updated', 'stats:update');
bridgeEvent('milestone.reached', 'milestone:alert');

logger.info('Event bus → Socket.io bridge initialized');

// ─── Start Server ────────────────────────────────────────────────────────────

server.listen(config.port, () => {
  logger.info(`🏏 ${config.name} running on port ${config.port} [${config.env}]`);
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received — shutting down`);
  io.close(() => {
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
  setTimeout(() => { logger.error('Forced shutdown'); process.exit(1); }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
