import { Prisma, RefreshToken } from '../../prisma/client';
import prisma from '../config/prisma';

export class TokenRepository {
  async create(data: Prisma.RefreshTokenUncheckedCreateInput): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return prisma.refreshToken.findMany({ where: { userId } });
  }

  async revoke(id: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  }

  async revokeAllForUser(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async deleteExpired(): Promise<Prisma.BatchPayload> {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
