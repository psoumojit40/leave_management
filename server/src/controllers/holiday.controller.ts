import { Request, Response, NextFunction } from 'express';
// Added .js extensions and imported IUser for typing
import { Holiday } from '../models/Holiday.model.js';
import { IUser } from '../models/User.model.js';
import { logAudit } from '../services/auditLogger.service.js';

// Define AuthRequest to satisfy TypeScript for req.user
interface AuthRequest extends Request {
  user?: IUser;
}

export const getHolidays = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, startDate, endDate } = req.query;
    const filter: any = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }
    
    const holidays = await Holiday.find(filter).sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    next(error);
  }
};

export const getHolidayById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }
    res.json(holiday);
  } catch (error) {
    next(error);
  }
};

// Fixed function name and used AuthRequest
export const createHoliday = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, date, type, description } = req.body;

    // Safety check for req.user
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const holiday = new Holiday({
      name,
      date: new Date(date),
      type,
      description,
    });
    
    await holiday.save();
    
    // Log audit
    await logAudit(
      req.user._id.toString(),
      req.user.name,
      'Holiday Created',
      holiday._id.toString(),
      'Holiday',
      `Holiday created: ${holiday.name} on ${holiday.date.toISOString().split('T')[0]}`
    );
    
    res.status(201).json(holiday);
  } catch (error) {
    next(error);
  }
};

export const updateHoliday = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }
    
    const { name, date, type, description } = req.body;
    
    if (name !== undefined) holiday.name = name;
    if (date !== undefined) holiday.date = new Date(date);
    if (type !== undefined) holiday.type = type;
    if (description !== undefined) holiday.description = description;
    
    await holiday.save();
    
    await logAudit(
      req.user._id.toString(),
      req.user.name,
      'Holiday Updated',
      holiday._id.toString(),
      'Holiday',
      `Holiday updated: ${holiday.name}`
    );
    
    res.json(holiday);
  } catch (error) {
    next(error);
  }
};

export const deleteHoliday = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }
    
    await holiday.deleteOne();
    
    await logAudit(
      req.user._id.toString(),
      req.user.name,
      'Holiday Deleted',
      holiday._id.toString(),
      'Holiday',
      `Holiday deleted: ${holiday.name}`
    );
    
    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    next(error);
  }
};