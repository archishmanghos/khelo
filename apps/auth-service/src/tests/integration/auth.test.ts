import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import routes from '../../routes';
import { errorMiddleware } from '../../middleware/error.middleware';
import prisma from '../../config/prisma';

const app = express();
app.use(express.json());
app.use(cookieParser('test-secret'));
app.use('/api/v1', routes);
app.use(errorMiddleware);

// Mock Prisma
jest.mock('../../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: userData.email,
        name: userData.name,
        role: 'user',
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.get('Set-Cookie')).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });
  });
});
