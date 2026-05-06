import { prisma } from '../config/prisma';
import type { Prisma } from '@prisma/client';

export class MatchRepository {
  async findAll(params: {
    sportType?: string;
    format?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    skip?: number;
    take?: number;
  }) {
    const { sportType, format, status, startDate, endDate, skip = 0, take = 20 } = params;

    const where: Prisma.MatchWhereInput = {};

    if (sportType) where.sportType = sportType as any;
    if (status) where.status = status as any;
    if (format) {
      where.cricketData = {
        format: format as any
      };
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    const [total, items] = await Promise.all([
      prisma.match.count({ where }),
      prisma.match.findMany({
        where,
        include: {
          cricketData: true,
          participants: true,
          innings: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return { total, items };
  }

  async findById(id: string) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        cricketData: true,
        participants: true,
        innings: true,
      },
    });
  }

  async create(data: any) {
    // This is a simplified creation for now, focusing on Cricket as requested
    return prisma.match.create({
      data: {
        title: data.title,
        sportType: 'cricket',
        status: 'scheduled',
        createdBy: data.createdBy,
        startTime: data.startTime ? new Date(data.startTime) : null,
        cricketData: {
          create: {
            format: data.format || 't20',
            totalOvers: data.totalOvers || 20,
          },
        },
        participants: {
          create: data.participants?.map((p: any) => ({
            participantType: p.type || 'team',
            participantId: p.id,
            role: p.role,
          })) || [],
        },
      },
      include: {
        cricketData: true,
        participants: true,
      },
    });
  }
}
