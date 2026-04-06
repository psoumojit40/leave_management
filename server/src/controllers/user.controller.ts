import { Request, Response, NextFunction } from 'express';
// FIX 1: Added .js extensions
import { User, IUser } from '../models/User.model.js';
import bcrypt from 'bcryptjs';
import { logAudit } from '../services/auditLogger.service.js';

// FIX 2: Define AuthRequest to tell TS that req.user exists
interface AuthRequest extends Request {
  user?: IUser;
}

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, isActive } = req.query;
    const filter: any = {};
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Safety check for middleware
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Authorization check
    const isOwner = user._id.toString() === req.user._id.toString();
    const isPrivileged = req.user.role === 'manager' || req.user.role === 'admin';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create users' });
    }

    const { name, email, password, role, department } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    
    // FIX 3: REMOVED manual hashing. Let the User.model.ts pre-save hook do it.
    const user = new User({
      name,
      email,
      password, 
      role: role || 'employee',
      department,
    });
    
    await user.save();
    
    await logAudit(
      req.user._id.toString(),
      req.user.name,
      'User Created',
      user._id.toString(),
      'User',
      `New user created: ${user.email} with role ${user.role}`
    );
    
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { name, email, role, department, isActive, password } = req.body;
    const isSelfUpdate = req.params.id === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSelfUpdate && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    // FIX 4: Use .findById() + .save() instead of findByIdAndUpdate
    // This ensures that if a password is changed, the pre-save hook hashes it.
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email && isAdmin) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email already exists' });
      user.email = email;
    }

    // Apply updates
    if (name !== undefined) user.name = name;
    if (department !== undefined) user.department = department;
    
    if (isAdmin) {
      if (role !== undefined) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      if (password && password !== '') user.password = password;
    }

    await user.save();

    await logAudit(
      req.user._id.toString(),
      req.user.name,
      isAdmin ? 'User Updated' : 'User Updated (Self)',
      user._id.toString(),
      'User',
      `User updated: ${user.email}`
    );

    const userResponse = user.toObject();
    delete (userResponse as any).password;
    res.json(userResponse);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete users' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await logAudit(
      req.user._id.toString(),
      req.user.name,
      'User Deleted',
      user._id.toString(),
      'User',
      `User deleted: ${user.email}`
    );
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};