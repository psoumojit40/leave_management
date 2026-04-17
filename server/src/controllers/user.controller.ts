import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User.model.js';
import { logAudit } from '../services/auditLogger.service.js';

// Define AuthRequest to tell TS that req.user exists from the authenticate middleware
interface AuthRequest extends Request {
  user?: IUser;
}

// 1. GET ALL USERS (Used by the Team Hub)
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, isActive, department } = req.query;

    // Base filter: Exclude 'admin' from general team views
    const filter: any = { role: { $ne: 'admin' } };

    // Optional query filters
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password') // 🛡️ Security: Never send passwords
      .sort({ firstName: 1 }); // Sort alphabetically

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// 2. GET USER BY ID
export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Authorization check: Only self, Manager, or Admin can see details
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

// 3. CREATE USER (Admin Only)
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create users' });
    }

    const { firstName, lastName, email, password, role, department, employeeId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({
      firstName,
      lastName,
      email,
      password, // Pre-save hook in User.model.ts will hash this
      role: role || 'employee',
      department,
      employeeId
    });

    await user.save();

    // Audit Log: Using firstName since 'name' field is removed
    await logAudit(
      req.user._id.toString(),
      req.user.firstName,
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

// 4. UPDATE USER
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { firstName, lastName, email, role, department, isActive, password } = req.body;
    const isSelfUpdate = req.params.id === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSelfUpdate && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Admin-only critical updates
    if (isAdmin) {
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });
        user.email = email;
      }
      if (role !== undefined) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      if (password && password !== '') user.password = password; // Will be hashed by pre-save
    }

    // Common updates
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (department !== undefined) user.department = department;

    await user.save();

    await logAudit(
      req.user._id.toString(),
      req.user.firstName,
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

// 5. DELETE USER (Admin Only)
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
      req.user.firstName,
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

// 6. GET CURRENT USER
export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};