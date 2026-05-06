import { MatchRepository } from '../repositories/match.repository';
import { generateId, nowISO } from '@khelo/utils';
import { getEventBus } from '@khelo/event-bus';
import { createLogger } from '@khelo/logger';

const logger = createLogger({ service: 'match-service' });
const matchRepository = new MatchRepository();

export const matchService = {
  async getAll(params: any) {
    return matchRepository.findAll(params);
  },

  async getById(id: string) {
    return matchRepository.findById(id);
  },

  async create(data: any) {
    const match = await matchRepository.create(data);

    // Publish event
    const eventBus = getEventBus();
    eventBus.publish({
      id: generateId(),
      type: 'match.created',
      source: 'match-service',
      payload: match,
      timestamp: nowISO(),
    });

    logger.info(`Match created: ${match.title}`, { matchId: match.id });
    return match;
  },

  async update(id: string, data: any) {
    // Basic update logic for now
    logger.info(`Match update requested: ${id}`, { data });
    return { id, ...data };
  },

  async startMatch(id: string) {
    logger.info(`Match start requested: ${id}`);
    return { id, status: 'live' };
  },
};
