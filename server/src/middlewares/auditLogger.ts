import { Request, Response, NextFunction } from 'express';
import { logAudit } from '../services/auditLogger.service.js';

export const auditLogger = async (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', async () => {
    if (req.user) {
      try {
        // ✅ FIX: Check for firstName, fall back to old 'name' field if necessary
        const nameToLog = req.user.firstName || (req.user as any).name || 'Unknown';

        await logAudit(
          req.user._id.toString(),
          nameToLog,
          `${req.method} ${req.originalUrl}`,
          undefined, // ✅ FIX: Use undefined instead of "N/A"
          'System',
          `Status: ${res.statusCode}`
        );
      } catch (error) {
        console.error('Middleware Audit Error:', error);
      }
    }
  });
  next();
};