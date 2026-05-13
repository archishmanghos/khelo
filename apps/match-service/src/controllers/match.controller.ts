import type { Request, Response } from 'express';
import { matchService } from '../services/match.service';
import type { ApiResponse, HealthCheckResponse } from '@khelo/types';
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

  async getAll(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { sportType, format, status, startDate, endDate, skip, take } = req.query;
      const result = await matchService.getAll({
        sportType,
        format,
        status,
        startDate,
        endDate,
        skip: skip ? parseInt(skip as string) : undefined,
        take: take ? parseInt(take as string) : undefined,
      });
      res.json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
        },
        timestamp: nowISO(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: nowISO(),
      });
    }
  },

  async getById(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const match = await matchService.getById(req.params.id as string);
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: nowISO(),
      });
    }
  },

  async create(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: User ID not found in token',
          timestamp: nowISO(),
        });
        return;
      }

      const match = await matchService.create({
        ...req.body,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: match,
        message: 'Match created successfully',
        timestamp: nowISO(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: nowISO(),
      });
    }
  },

  async update(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const match = await matchService.update(req.params.id as string, req.body);
      res.json({
        success: true,
        data: match,
        timestamp: nowISO(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: nowISO(),
      });
    }
  },

  async start(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const match = await matchService.startMatch(req.params.id as string);
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: nowISO(),
      });
    }
  },
};
