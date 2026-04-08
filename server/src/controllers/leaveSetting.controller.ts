import { Request, Response, NextFunction } from 'express';
import { LeaveSetting } from '../models/LeaveSetting.model.js';

// 1. GET ALL SETTINGS (Used by Employee Dropdown & Manager Modal)
export const getLeaveSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Fetches all active settings, sorted by creation date
    const settings = await LeaveSetting.find({ isActive: true }).sort({ createdAt: 1 });
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// 2. CREATE NEW CATEGORY (Used by "New Category" Modal)
export const createLeaveSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, defaultDays, color } = req.body;
    
    // Check if it already exists to prevent duplicates
    const existing = await LeaveSetting.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: `${name} already exists.` });
    }

    const newSetting = new LeaveSetting({ name, defaultDays, color });
    await newSetting.save();
    
    res.status(201).json({ message: 'Category created successfully', newSetting });
  } catch (error) {
    next(error);
  }
};

// 3. BULK UPDATE QUOTAS (Used by "Edit Quotas" Modal)
export const updateLeaveQuotas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quotas } = req.body; // Expects an array: [{ name: "Sick", defaultDays: 12 }, ...]

    // Loop through and update the days for each category
    for (const quota of quotas) {
      await LeaveSetting.findOneAndUpdate(
        { name: quota.name },
        { defaultDays: quota.defaultDays }
      );
    }
    
    res.json({ message: 'Quotas updated successfully' });
  } catch (error) {
    next(error);
  }
};

// 4. SEED DEFAULTS (A quick helper to populate your DB for the first time)
export const seedDefaultSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await LeaveSetting.countDocuments();
    if (count === 0) {
      const defaultSettings = [
        { name: 'Annual Leave', defaultDays: 24, color: 'bg-blue-500' },
        { name: 'Sick Leave', defaultDays: 10, color: 'bg-red-500' },
        { name: 'Personal Leave', defaultDays: 10, color: 'bg-amber-500' },
        { name: 'Bereavement', defaultDays: 5, color: 'bg-gray-600' },
        { name: 'Maternity Leave', defaultDays: 182, color: 'bg-pink-500' },
        { name: 'Paternity Leave', defaultDays: 14, color: 'bg-cyan-500' },
        { name: 'Special Leave', defaultDays: 5, color: 'bg-purple-500' }
      ];
      await LeaveSetting.insertMany(defaultSettings);
      return res.json({ message: 'Database seeded with default leave categories!' });
    }
    res.json({ message: 'Settings already exist. No need to seed.' });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE CATEGORY
export const deleteLeaveSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const deletedSetting = await LeaveSetting.findByIdAndDelete(id);
    
    if (!deletedSetting) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};