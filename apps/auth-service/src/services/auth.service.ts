import { OAuth2Client } from 'google-auth-library';
import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { hashPassword, verifyPassword, hashToken } from '../utils/crypto';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors';
import { SignupInput, LoginInput, GoogleAuthInput } from '../utils/validation';
import { env } from '../config/env';
import { AuthProvider, Role } from '../../prisma/client';

export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository
  ) {
    this.googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }

  async signup(input: SignupInput) {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.userRepository.create({
      email: input.email,
      passwordHash,
      name: input.name,
      role: Role.user,
      provider: AuthProvider.local,
    });

    return this.generateAuthResponse(user);
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    return this.generateAuthResponse(user);
  }

  async googleAuth(input: GoogleAuthInput) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: input.idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub) {
        throw new BadRequestError('Invalid Google token');
      }

      let user = await this.userRepository.findByProvider(AuthProvider.google, payload.sub);

      if (!user) {
        // Create user if doesn't exist
        user = await this.userRepository.create({
          email: payload.email,
          name: payload.name || 'Google User',
          avatarUrl: payload.picture,
          provider: AuthProvider.google,
          providerId: payload.sub,
          isEmailVerified: payload.email_verified || false,
          role: Role.user,
        });
      } else {
        await this.userRepository.update(user.id, { lastLoginAt: new Date() });
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new UnauthorizedError('Google authentication failed');
    }
  }

  async refresh(refreshToken: string, deviceInfo?: string, ipAddress?: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const hashedToken = hashToken(refreshToken);

      const storedToken = await this.tokenRepository.findByToken(hashedToken);
      if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Rotate refresh token (optional but recommended)
      await this.tokenRepository.revoke(storedToken.id);
      
      return this.generateAuthResponse(user, deviceInfo, ipAddress);
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    const hashedToken = hashToken(refreshToken);
    const storedToken = await this.tokenRepository.findByToken(hashedToken);
    if (storedToken) {
      await this.tokenRepository.revoke(storedToken.id);
    }
  }

  async logoutAll(userId: string) {
    await this.tokenRepository.revokeAllForUser(userId);
  }

  private async generateAuthResponse(user: any, deviceInfo?: string, ipAddress?: string) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.tokenRepository.create({
      userId: user.id,
      token: hashToken(refreshToken),
      expiresAt,
      deviceInfo,
      ipAddress,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }
}
