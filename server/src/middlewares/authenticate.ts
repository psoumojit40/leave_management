import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User, IUser } from '../models/User.model.js';

// Extend Express Request type globally within this file
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface TokenPayload {
  id: string;
  role: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer') 
      ? req.headers.authorization.split(' ')[1] 
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // FIX: Cast secret as string to avoid "Secret | null" error
    const decoded = jwt.verify(token, config.jwtSecret as string) as TokenPayload;

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or deactivated' });
    }

    req.user = user; // Now recognized globally thanks to 'declare global'
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};