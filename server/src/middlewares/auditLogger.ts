import { Request, Response, NextFunction } from 'express';
// Don't forget the .js here too!
import { logAudit } from '../services/auditLogger.service.js';

export const auditLogger = async (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', async () => {
    // Only log if the user was authenticated by your auth middleware
    if (req.user) {
      try {
        await logAudit(
          req.user._id.toString(),
          req.user.name,
          `${req.method} ${req.originalUrl}`,
          'N/A',
          'System',
          `Status: ${res.statusCode}`
        );
      } catch (error) {
        console.error('Audit log failed:', error);
      }
    }
  });
  next();
};