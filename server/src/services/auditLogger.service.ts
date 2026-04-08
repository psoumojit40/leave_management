import { AuditLog } from '../models/AuditLog.model.js';
import mongoose from 'mongoose';

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
    // ✅ FIX 1: Strict Sanitization
    // If targetId is "N/A", null, or an invalid ID string, we discard it entirely.
    const cleanTargetId = (targetId && mongoose.Types.ObjectId.isValid(targetId)) 
      ? new mongoose.Types.ObjectId(targetId) 
      : undefined;

    // ✅ FIX 2: Handle missing firstName
    // If actorName is undefined (because the user still has 'name' in DB), we use a fallback.
    const finalActorName = actorName || "Unknown User";

    const auditLog = new AuditLog({
      actorId,
      actorName: finalActorName, 
      action,
      targetId: cleanTargetId,
      targetType: targetType || 'System',
      targetName: targetName || undefined,
      description: description || undefined,
      timestamp: new Date(),
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined,
    });
    
    await auditLog.save();
    console.log(`[AUDIT SUCCESS] ${finalActorName} -> ${action}`);
    
    return auditLog;
  } catch (error: any) {
    // ✅ FIX 3: Do not throw
    // If the audit log fails, we just log it to the console so the main app doesn't crash.
    console.error('AUDIT LOGGING FAILED (Background):', error.message);
  }
};