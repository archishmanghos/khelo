import type { Request, Response } from 'express';
import { scoringService } from '../services/scoring.service';
import type { ApiResponse, Innings, Ball, HealthCheckResponse } from '@khelo/types';
import { nowISO } from '@khelo/utils';
import { config } from '../config';

export const scoringController = {
  health(_req: Request, res: Response<HealthCheckResponse>) {
    res.json({
      service: config.name,
      status: 'healthy',
      version: '0.1.0',
      uptime: process.uptime(),
      timestamp: nowISO(),
    });
  },

  getInningsByMatch(req: Request, res: Response<ApiResponse<Innings[]>>) {
    const innings = scoringService.getInningsByMatch(req.params.matchId as string);
    res.json({ success: true, data: innings, timestamp: nowISO() });
  },

  createInnings(req: Request, res: Response<ApiResponse<Innings>>) {
    const { matchId, battingTeamId, bowlingTeamId, number } = req.body;
    const innings = scoringService.createInnings(matchId, battingTeamId, bowlingTeamId, number);
    res.status(201).json({ success: true, data: innings, timestamp: nowISO() });
  },

  recordBall(req: Request, res: Response<ApiResponse<Ball>>) {
    const ball = scoringService.recordBall(req.params.inningsId as string, req.body);
    if (!ball) {
      res.status(400).json({ success: false, error: 'Invalid innings or innings not in progress', timestamp: nowISO() });
      return;
    }
    res.json({ success: true, data: ball, timestamp: nowISO() });
  },
};
