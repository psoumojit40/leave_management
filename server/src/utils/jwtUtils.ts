import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (payload: Object, expiresIn: string = config.jwtExpiresIn): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};