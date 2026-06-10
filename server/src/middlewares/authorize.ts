import { Request, Response, NextFunction } from 'express';

// 1. Define the custom request interface so TypeScript knows 'user' exists
interface AuthRequest extends Request {
  user?: any; // You can replace 'any' with your IUser interface if you want strict typing!
}

// Using ...roles allows you to pass arguments cleanly like: authorize('manager', 'admin')
export const authorize = (...roles: string[]) => {
  // 2. Change 'req: Request' to 'req: AuthRequest'
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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