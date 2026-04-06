import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model.js';
import jwt from 'jsonwebtoken';
// import { sendEmail } from '../services/email.service.js';
// import { logAudit } from '../services/auditLogger.service.js';
import { config } from '../config/env.js';

interface TokenPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
}

// 1. REGISTER
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, role, employeeId, managerId, dob, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: role || 'employee',
      department,
      employeeId: role === 'employee' ? employeeId : undefined,
      managerId: role === 'manager' ? managerId : undefined,
      dob: role === 'employee' ? dob : undefined,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, department: user.department },
      config.jwtSecret as string,
      { expiresIn: config.jwtExpiresIn as any }
    );

    console.log(`TEST MODE: Skip welcome email to ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. LOGIN (With Admin 123456 Bypass and ID Search)
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loginId, password, role } = req.body;

    // --- ADMIN BYPASS (Updated password to 6 characters) ---
    if (role === 'admin' && loginId.toUpperCase() === 'ADMIN' && password === '123456') {
      const token = jwt.sign(
        { id: 'admin_root', firstName: 'System', lastName: 'Admin', email: 'admin@system.com', role: 'admin', department: 'Management' },
        config.jwtSecret as string,
        { expiresIn: config.jwtExpiresIn as any }
      );
      return res.json({
        message: 'Admin Login successful (Bypass Mode)',
        token,
        user: {
          id: 'admin_root',
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@system.com',
          department: 'Management',
          role: 'admin'
        }
      });
    }

    // --- DB SEARCH (Email or ID) ---
    const user = await User.findOne({
      role: role,
      $or: [
        { email: loginId.toLowerCase() },
        { employeeId: loginId },
        { managerId: loginId }
      ]
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials or inactive account' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, department: user.department },
      config.jwtSecret as string,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department, // ✅ Now properly returned for all users
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. LOGOUT
export const logout = (req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
};

// 4. REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: 'Token required' });

    const decoded = jwt.verify(token, config.jwtSecret as string) as TokenPayload;
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: 'User not found' });

    const newToken = jwt.sign(
      { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, department: user.department },
      config.jwtSecret as string,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.json({
      token: newToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department, // ✅ Added for refresh state
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// 5. FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'Check your email for reset link' });

    const resetToken = jwt.sign({ id: user._id }, config.jwtSecret as string, { expiresIn: '1h' });

    console.log(`TEST MODE: Reset link for ${email}: ${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.json({ message: 'Check your email (console for test mode) for reset link' });
  } catch (error) {
    next(error);
  }
};

// 6. RESET PASSWORD
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, config.jwtSecret as string) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};