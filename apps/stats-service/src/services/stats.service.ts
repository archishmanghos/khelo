import type { BattingEntry, BowlingEntry, DomainEvent } from '@khelo/types';
import { getEventBus } from '@khelo/event-bus';
import { generateId, nowISO, calculateStrikeRate, calculateEconomy } from '@khelo/utils';
import { createLogger } from '@khelo/logger';

const logger = createLogger({ service: 'stats-service' });

// In-memory aggregated stats
interface PlayerStats {
  playerId: string;
  matches: number;
  batting: { runs: number; balls: number; fours: number; sixes: number; highScore: number; innings: number; notOuts: number };
  bowling: { overs: number; balls: number; runs: number; wickets: number; maidens: number; bestFigures: string };
}

const playerStats = new Map<string, PlayerStats>();

function initPlayerStats(playerId: string): PlayerStats {
  return {
    playerId,
    matches: 0,
    batting: { runs: 0, balls: 0, fours: 0, sixes: 0, highScore: 0, innings: 0, notOuts: 0 },
    bowling: { overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0, bestFigures: '0/0' },
  };
}

export const statsService = {
  getPlayerStats(playerId: string): PlayerStats | undefined {
    return playerStats.get(playerId);
  },

  getAllPlayerStats(): PlayerStats[] {
    return Array.from(playerStats.values());
  },

  getLeaderboard(category: 'runs' | 'wickets', limit = 10): PlayerStats[] {
    const all = Array.from(playerStats.values());
    if (category === 'runs') {
      return all.sort((a, b) => b.batting.runs - a.batting.runs).slice(0, limit);
    }
    return all.sort((a, b) => b.bowling.wickets - a.bowling.wickets).slice(0, limit);
  },

  processBallEvent(event: DomainEvent) {
    const { ball } = event.payload as { ball: { batsmanId: string; bowlerId: string; runs: { batsmanRuns: number; totalRuns: number }; isWicket: boolean } };
    if (!ball) return;

    // Update batsman stats
    const batsmanStats = playerStats.get(ball.batsmanId) || initPlayerStats(ball.batsmanId);
    batsmanStats.batting.runs += ball.runs.batsmanRuns;
    batsmanStats.batting.balls += 1;
    if (ball.runs.batsmanRuns === 4) batsmanStats.batting.fours++;
    if (ball.runs.batsmanRuns === 6) batsmanStats.batting.sixes++;
    playerStats.set(ball.batsmanId, batsmanStats);

    // Update bowler stats
    const bowlerStats = playerStats.get(ball.bowlerId) || initPlayerStats(ball.bowlerId);
    bowlerStats.bowling.runs += ball.runs.totalRuns;
    bowlerStats.bowling.balls += 1;
    if (bowlerStats.bowling.balls >= 6) {
      bowlerStats.bowling.overs++;
      bowlerStats.bowling.balls = 0;
    }
    if (ball.isWicket) bowlerStats.bowling.wickets++;
    playerStats.set(ball.bowlerId, bowlerStats);

    // Publish stats update
    getEventBus().publish({
      id: generateId(),
      type: 'stats.updated',
      source: 'stats-service',
      payload: { batsmanId: ball.batsmanId, bowlerId: ball.bowlerId },
      timestamp: nowISO(),
    });
  },

  /**
   * Subscribe to event-bus for live updates.
   * Called once at service startup.
   */
  init() {
    const eventBus = getEventBus();
    eventBus.subscribe('ball.bowled', (event) => {
      statsService.processBallEvent(event);
    });
    logger.info('Stats service subscribed to scoring events');
  },

  getBattingSummary(playerId: string): Partial<BattingEntry> | null {
    const stats = playerStats.get(playerId);
    if (!stats) return null;
    return {
      playerId,
      runs: stats.batting.runs,
      balls: stats.batting.balls,
      fours: stats.batting.fours,
      sixes: stats.batting.sixes,
      strikeRate: calculateStrikeRate(stats.batting.runs, stats.batting.balls),
    };
  },

  getBowlingSummary(playerId: string): Partial<BowlingEntry> | null {
    const stats = playerStats.get(playerId);
    if (!stats) return null;
    return {
      playerId,
      overs: stats.bowling.overs,
      runs: stats.bowling.runs,
      wickets: stats.bowling.wickets,
      economy: calculateEconomy(stats.bowling.runs, stats.bowling.overs, stats.bowling.balls),
    };
  },
};
