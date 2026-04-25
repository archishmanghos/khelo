import type { Request, Response } from 'express';
import { statsService } from '../services/stats.service';
import type { ApiResponse, HealthCheckResponse } from '@khelo/types';
import { nowISO } from '@khelo/utils';
import { config } from '../config';

export const statsController = {
  health(_req: Request, res: Response<HealthCheckResponse>) {
    res.json({
      service: config.name,
      status: 'healthy',
      version: '0.1.0',
      uptime: process.uptime(),
      timestamp: nowISO(),
    });
  },

  getLeaderboard(req: Request, res: Response<ApiResponse>) {
    const category = (req.query.category as 'runs' | 'wickets') || 'runs';
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const data = statsService.getLeaderboard(category, limit);
    res.json({ success: true, data, timestamp: nowISO() });
  },

  getPlayerStats(req: Request, res: Response<ApiResponse>) {
    const stats = statsService.getPlayerStats(req.params.playerId as string);
    if (!stats) {
      res.status(404).json({ success: false, error: 'Player stats not found', timestamp: nowISO() });
      return;
    }
    res.json({ success: true, data: stats, timestamp: nowISO() });
  },

  getPlayerBatting(req: Request, res: Response<ApiResponse>) {
    const summary = statsService.getBattingSummary(req.params.playerId as string);
    if (!summary) {
      res.status(404).json({ success: false, error: 'Player not found', timestamp: nowISO() });
      return;
    }
    res.json({ success: true, data: summary, timestamp: nowISO() });
  },

  getPlayerBowling(req: Request, res: Response<ApiResponse>) {
    const summary = statsService.getBowlingSummary(req.params.playerId as string);
    if (!summary) {
      res.status(404).json({ success: false, error: 'Player not found', timestamp: nowISO() });
      return;
    }
    res.json({ success: true, data: summary, timestamp: nowISO() });
  },
};
