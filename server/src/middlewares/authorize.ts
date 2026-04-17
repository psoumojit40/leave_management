import { Request, Response, NextFunction } from 'express';

// Using ...roles allows you to pass arguments cleanly like: authorize('manager', 'admin')
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user.role}) is not authorized to access this resource` 
      });
    }

    next();
  };
};