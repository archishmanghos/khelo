import argon2 from 'argon2';
import crypto from 'crypto';

export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password);
};

export const verifyPassword = async (hash: string, password: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

