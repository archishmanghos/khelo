import type { Match } from '@khelo/types';
import { generateId, nowISO } from '@khelo/utils';
import { getEventBus } from '@khelo/event-bus';
import { createLogger } from '@khelo/logger';

const logger = createLogger({ service: 'match-service' });

// In-memory store — swap for PostgreSQL repository later
const matches = new Map<string, Match>();

export const matchService = {
  getAll(): Match[] {
    return Array.from(matches.values());
  },

  getById(id: string): Match | undefined {
    return matches.get(id);
  },

  create(data: Partial<Match>): Match {
    const id = generateId();
    const now = nowISO();

    const match: Match = {
      id,
      title: data.title || 'Untitled Match',
      format: data.format || 'T20',
      status: 'scheduled',
      venue: data.venue || 'TBD',
      teamA: data.teamA || { id: generateId(), name: 'Team A', shortName: 'TA', players: [], createdAt: now, updatedAt: now },
      teamB: data.teamB || { id: generateId(), name: 'Team B', shortName: 'TB', players: [], createdAt: now, updatedAt: now },
      innings: [],
      scheduledAt: data.scheduledAt || now,
      createdAt: now,
      updatedAt: now,
    };

    matches.set(id, match);

    // Publish event
    const eventBus = getEventBus();
    eventBus.publish({
      id: generateId(),
      type: 'match.created',
      source: 'match-service',
      payload: match,
      timestamp: now,
    });

    logger.info(`Match created: ${match.title}`, { matchId: id });
    return match;
  },

  update(id: string, data: Partial<Match>): Match | undefined {
    const match = matches.get(id);
    if (!match) return undefined;

    const updated = { ...match, ...data, id, updatedAt: nowISO() };
    matches.set(id, updated);

    logger.info(`Match updated: ${updated.title}`, { matchId: id });
    return updated;
  },

  startMatch(id: string): Match | undefined {
    const match = matches.get(id);
    if (!match) return undefined;

    const updated: Match = {
      ...match,
      status: 'live',
      startedAt: nowISO(),
      updatedAt: nowISO(),
    };
    matches.set(id, updated);

    const eventBus = getEventBus();
    eventBus.publish({
      id: generateId(),
      type: 'match.started',
      source: 'match-service',
      payload: updated,
      timestamp: nowISO(),
    });

    logger.info(`Match started: ${updated.title}`, { matchId: id });
    return updated;
  },
};
