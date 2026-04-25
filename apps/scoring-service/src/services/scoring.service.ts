import type { Ball, Innings, Extras } from '@khelo/types';
import { generateId, nowISO } from '@khelo/utils';
import { getEventBus } from '@khelo/event-bus';
import { createLogger } from '@khelo/logger';

const logger = createLogger({ service: 'scoring-service' });

// In-memory store
const inningsStore = new Map<string, Innings>();

function emptyExtras(): Extras {
  return { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 };
}

export const scoringService = {
  getInnings(inningsId: string): Innings | undefined {
    return inningsStore.get(inningsId);
  },

  getInningsByMatch(matchId: string): Innings[] {
    return Array.from(inningsStore.values()).filter((i) => i.matchId === matchId);
  },

  createInnings(matchId: string, battingTeamId: string, bowlingTeamId: string, number: number): Innings {
    const id = generateId();
    const now = nowISO();

    const innings: Innings = {
      id,
      matchId,
      number,
      battingTeamId,
      bowlingTeamId,
      status: 'in-progress',
      overs: [],
      totalRuns: 0,
      totalWickets: 0,
      totalExtras: emptyExtras(),
      oversCompleted: 0,
      ballsInCurrentOver: 0,
      createdAt: now,
      updatedAt: now,
    };

    inningsStore.set(id, innings);

    getEventBus().publish({
      id: generateId(),
      type: 'innings.started',
      source: 'scoring-service',
      payload: innings,
      timestamp: now,
    });

    logger.info(`Innings ${number} started for match ${matchId}`);
    return innings;
  },

  recordBall(inningsId: string, ballData: Partial<Ball>): Ball | undefined {
    const innings = inningsStore.get(inningsId);
    if (!innings || innings.status !== 'in-progress') return undefined;

    const ball: Ball = {
      id: generateId(),
      inningsId,
      overNumber: innings.oversCompleted,
      ballNumber: innings.ballsInCurrentOver + 1,
      batsmanId: ballData.batsmanId || '',
      bowlerId: ballData.bowlerId || '',
      nonStrikerId: ballData.nonStrikerId || '',
      runs: ballData.runs || { batsmanRuns: 0, extraRuns: 0, totalRuns: 0 },
      isWicket: ballData.isWicket || false,
      wicket: ballData.wicket,
      isExtra: ballData.isExtra || false,
      extraType: ballData.extraType,
      shotType: ballData.shotType,
      commentary: ballData.commentary,
      timestamp: nowISO(),
    };

    // Update innings totals
    innings.totalRuns += ball.runs.totalRuns;
    if (ball.isWicket) innings.totalWickets++;

    // Track legal deliveries
    const isLegalDelivery = !ball.isExtra || (ball.extraType !== 'wide' && ball.extraType !== 'no-ball');
    if (isLegalDelivery) {
      innings.ballsInCurrentOver++;
    }

    // Over complete?
    if (innings.ballsInCurrentOver >= 6) {
      innings.oversCompleted++;
      innings.ballsInCurrentOver = 0;

      getEventBus().publish({
        id: generateId(),
        type: 'over.completed',
        source: 'scoring-service',
        payload: { inningsId, overNumber: innings.oversCompleted },
        timestamp: nowISO(),
      });
    }

    innings.updatedAt = nowISO();
    inningsStore.set(inningsId, innings);

    getEventBus().publish({
      id: generateId(),
      type: 'ball.bowled',
      source: 'scoring-service',
      payload: { ball, innings },
      timestamp: nowISO(),
    });

    if (ball.isWicket) {
      getEventBus().publish({
        id: generateId(),
        type: 'wicket.fallen',
        source: 'scoring-service',
        payload: { ball, innings },
        timestamp: nowISO(),
      });
    }

    logger.debug(`Ball recorded: ${ball.overNumber}.${ball.ballNumber} — ${ball.runs.totalRuns} runs`, {
      inningsId,
    });

    return ball;
  },
};
