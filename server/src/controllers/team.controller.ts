import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { TeamInvitation } from '../models/TeamInvitation.model.js';
import { User, IUser } from '../models/User.model.js';
import { logAudit } from '../services/auditLogger.service.js';

interface AuthRequest extends Request {
  user?: IUser;
}

// 1. MANAGER: Send Invitation
export const sendTeamInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.body;
    if (!req.user || req.user.role !== 'manager') return res.status(403).json({ message: 'Only managers can invite' });

    const existingInvite = await TeamInvitation.findOne({
      sender: req.user._id,
      recipient: employeeId,
      status: 'pending'
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'Invitation already pending' });
    }

    const invitation = new TeamInvitation({
      sender: req.user._id,
      recipient: employeeId,
    });

    await invitation.save();
    res.status(201).json({ message: 'Invitation sent successfully!' });
  } catch (error: any) {
    next(error);
  }
};

// 2. EMPLOYEE: Get My Invitations
export const getMyInvitations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invitations = await TeamInvitation.find({ 
      recipient: req.user?._id, 
      status: 'pending' 
    }).populate('sender', 'firstName lastName department email');
    
    res.json(invitations);
  } catch (error) {
    next(error);
  }
};

// 3. EMPLOYEE: Accept/Reject
export const respondToInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { invitationId, action } = req.body;
    const invite = await TeamInvitation.findById(invitationId);

    if (!invite || invite.recipient.toString() !== req.user?._id.toString()) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // THE FIX: Delete any previous 'accepted' or 'rejected' records between 
    // these two exact people to prevent the MongoDB Duplicate Key error.
    await TeamInvitation.deleteMany({
      sender: invite.sender,
      recipient: invite.recipient,
      status: { $in: ['accepted', 'rejected'] }
    });

    // Now it is safe to save the new status!
    invite.status = action;
    await invite.save();

    if (action === 'accepted') {
      // Update the user's manager
      await User.findByIdAndUpdate(req.user._id, { assignedManager: invite.sender });
      
      // Auto-delete other pending invites (safer than updating to 'rejected' due to unique indexes)
      await TeamInvitation.deleteMany({ 
        recipient: req.user._id, 
        status: 'pending', 
        _id: { $ne: invite._id } 
      });
    }

    res.json({ message: `Invitation ${action}` });
  } catch (error) {
    console.error(">>> CRASH IN respondToInvitation:", error);
    next(error);
  }
};

// 4. MANAGER & EMPLOYEE: Get My Team
export const getMyTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.user.role === 'manager' || req.user.role === 'admin') {
      // 🧑‍💼 Manager: Return my team, and set myself as the manager
      const team = await User.find({ assignedManager: req.user._id })
        .select('-password')
        .sort({ firstName: 1 });
      return res.json({ team, manager: req.user });
    } else {
      // 🧑‍💻 Employee: Return coworkers AND the actual manager's profile
      if (!req.user.assignedManager) {
        return res.json({ team: [], manager: null });
      }
      
      const team = await User.find({ 
        assignedManager: req.user.assignedManager,
        _id: { $ne: req.user._id } 
      })
      .select('-password')
      .sort({ firstName: 1 });

      // Fetch the actual manager's details
      const manager = await User.findById(req.user.assignedManager).select('-password');
      
      return res.json({ team, manager });
    }
  } catch (error) {
    next(error);
  }
};

// 5. MANAGER: Get Unassigned Employees
export const getUnassignedEmployees = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const employees = await User.find({
      _id: { $ne: req.user._id },
      role: 'employee',
      isActive: true,
      $or: [
        { assignedManager: { $exists: false } },
        { assignedManager: null }
      ]
    }).select('firstName lastName department employeeId email role');

    const pendingInvites = await TeamInvitation.find({
      sender: req.user._id,
      status: 'pending'
    });

    const employeesWithStatus = employees.map(emp => {
      const invite = pendingInvites.find(i => i.recipient.toString() === emp._id.toString());
      return {
        ...emp.toObject(),
        invitationStatus: invite ? 'pending' : 'none'
      };
    });

    res.json(employeesWithStatus);
  } catch (error) {
    next(error);
  }
};

// 6. MANAGER/ADMIN: Force Assign/Remove (Bypass Invites)
export const updateTeamAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId, action } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const employee = await User.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (action === 'add') {
      employee.assignedManager = req.user._id;
    } else {
      employee.assignedManager = undefined;
    }

    await employee.save();

    await logAudit(
      req.user._id.toString(),
      req.user.firstName,
      action === 'add' ? 'Team Member Added' : 'Team Member Removed',
      employee._id.toString(),
      'User',
      `${action === 'add' ? 'Added' : 'Removed'} ${employee.firstName} to team`
    );

    res.json({ message: `Successfully ${action === 'add' ? 'added' : 'removed'} member.` });
  } catch (error) {
    next(error);
  }
};

// 7. MANAGER/ADMIN: Get Everyone in my Department
export const getDepartmentMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Find all users who have the exact same department as the manager
    const departmentMembers = await User.find({ 
      department: req.user.department 
    })
    .select('-password')
    .sort({ role: -1, firstName: 1 }); // Sorts Managers first, then alphabetically

    res.json(departmentMembers);
  } catch (error) {
    next(error);
  }
};

// 1b. MANAGER: Cancel Pending Invitation
export const cancelTeamInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.body;
    if (!req.user || req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Only managers can cancel invites' });
    }

    // Find and delete the exact pending invitation
    const deletedInvite = await TeamInvitation.findOneAndDelete({
      sender: req.user._id,
      recipient: employeeId,
      status: 'pending'
    });

    if (!deletedInvite) {
      return res.status(404).json({ message: 'Pending invitation not found' });
    }

    res.json({ message: 'Invitation cancelled successfully!' });
  } catch (error: any) {
    next(error);
  }
};