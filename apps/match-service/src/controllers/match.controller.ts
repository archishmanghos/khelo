import type { Request, Response } from 'express';
import { matchService } from '../services/match.service';
import type { ApiResponse, Match, HealthCheckResponse } from '@khelo/types';
import { nowISO } from '@khelo/utils';
import { config } from '../config';

export const matchController = {
  health(_req: Request, res: Response<HealthCheckResponse>) {
    res.json({
      service: config.name,
      status: 'healthy',
      version: '0.1.0',
      uptime: process.uptime(),
      timestamp: nowISO(),
    });
  },

  getAll(_req: Request, res: Response<ApiResponse<Match[]>>) {
    const matches = matchService.getAll();
    res.json({
      success: true,
      data: matches,
      timestamp: nowISO(),
    });
  },

  getById(req: Request, res: Response<ApiResponse<Match>>) {
    const match = matchService.getById(req.params.id as string);
    if (!match) {
      res.status(404).json({
        success: false,
        error: 'Match not found',
        timestamp: nowISO(),
      });
      return;
    }
    res.json({
      success: true,
      data: match,
      timestamp: nowISO(),
    });
  },

  create(req: Request, res: Response<ApiResponse<Match>>) {
    const match = matchService.create(req.body);
    res.status(201).json({
      success: true,
      data: match,
      message: 'Match created successfully',
      timestamp: nowISO(),
    });
  },

  update(req: Request, res: Response<ApiResponse<Match>>) {
    const match = matchService.update(req.params.id as string, req.body);
    if (!match) {
      res.status(404).json({
        success: false,
        error: 'Match not found',
        timestamp: nowISO(),
      });
      return;
    }
    res.json({
      success: true,
      data: match,
      timestamp: nowISO(),
    });
  },

  start(req: Request, res: Response<ApiResponse<Match>>) {
    const match = matchService.startMatch(req.params.id as string);
    if (!match) {
      res.status(404).json({
        success: false,
        error: 'Match not found',
        timestamp: nowISO(),
      });
      return;
    }
    res.json({
      success: true,
      data: match,
      message: 'Match started',
      timestamp: nowISO(),
    });
  },
};
