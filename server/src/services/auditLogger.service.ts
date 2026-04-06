import { AuditLog } from '../models/AuditLog.model';
import { User } from '../models/User.model';

export const logAudit = async (
  actorId: string,
  actorName: string,
  action: string,
  targetId?: string,
  targetType?: string,
  targetName?: string,
  description?: string,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    // Create audit log entry
    const auditLog = new AuditLog({
      actorId,
      actorName,
      action,
      targetId: targetId || undefined,
      targetType: targetType || undefined,
      targetName: targetName || undefined,
      description: description || undefined,
      timestamp: new Date(),
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined,
    });
    
    await auditLog.save();
    
    // In a production environment, you might also send this to a logging service
    // or external audit system
    console.log(`AUDIT LOG: ${actorName} performed ${action} on ${targetType || 'unknown'} ${targetName || ''} (ID: ${targetId || 'N/A'})`);
    
    return auditLog;
  } catch (error) {
    // If audit logging fails, we don't want to break the main functionality
    // Just log the error to console
    console.error('Failed to create audit log:', error);
    // Don't throw the error to avoid disrupting the main operation
  }
};