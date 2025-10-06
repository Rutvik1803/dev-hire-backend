import config from '../config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = config.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = config.REFRESH_TOKEN_SECRET;

//Hash a password
export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

//Compare a password with a hash
export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

// Create JWT tokens
export const createTokens = (userId: number, role: string) => {
  const accessToken = jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, role }, REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Verify JWT token
export const verifyToken = (token: string, type: 'access' | 'refresh') => {
  const secret = type === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
  try {
    return jwt.verify(token, secret!);
  } catch (err) {
    return null;
  }
};
