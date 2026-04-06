// server/src/middlewares/authorize.ts
import { Request, Response, NextFunction } from 'express';

export const authorize = (roles: string[]) => { // FIX: Define as string[]
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user.role}) is not authorized to access this resource` 
      });
    }

    next();
  };
};