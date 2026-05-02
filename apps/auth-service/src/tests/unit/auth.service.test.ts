import { AuthService } from '../../services/auth.service';
import { UserRepository } from '../../repositories/user.repository';
import { TokenRepository } from '../../repositories/token.repository';
import { hashPassword, verifyPassword } from '../../utils/crypto';
import { AuthProvider, Role } from '../../../prisma/client';

jest.mock('../../repositories/user.repository');
jest.mock('../../repositories/token.repository');
jest.mock('../../utils/crypto');
jest.mock('../../utils/token');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenRepository: jest.Mocked<TokenRepository>;

  beforeEach(() => {
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    tokenRepository = new TokenRepository() as jest.Mocked<TokenRepository>;
    authService = new AuthService(userRepository, tokenRepository);
  });

  describe('signup', () => {
    it('should create a new user and return auth response', async () => {
      const signupInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      userRepository.create.mockResolvedValue({
        id: 'user-id',
        email: signupInput.email,
        name: signupInput.name,
        role: Role.user,
        provider: AuthProvider.local,
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hashedPassword',
        avatarUrl: null,
        providerId: null,
        isEmailVerified: false,
        lastLoginAt: null,
        deletedAt: null,
      });

      const result = await authService.signup(signupInput);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(signupInput.email);
      expect(userRepository.create).toHaveBeenCalled();
      expect(result.user.email).toBe(signupInput.email);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw ConflictError if email exists', async () => {
      const signupInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      userRepository.findByEmail.mockResolvedValue({ id: 'existing' } as any);

      await expect(authService.signup(signupInput)).rejects.toThrow('Email already in use');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id',
        email: loginInput.email,
        passwordHash: 'hashedPassword',
        role: Role.user,
        name: 'Test User',
      };

      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      (verifyPassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginInput);

      expect(result.user.id).toBe(mockUser.id);
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw UnauthorizedError with invalid password', async () => {
      const loginInput = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      userRepository.findByEmail.mockResolvedValue({ passwordHash: 'hashed' } as any);
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginInput)).rejects.toThrow('Invalid credentials');
    });
  });
});
