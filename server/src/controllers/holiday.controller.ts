import { Request, Response } from 'express';
import { Holiday } from '../models/Holiday.model.js';

export const getHolidays = async (req: Request, res: Response) => {
  try {
    // Sort by date so they appear in order on the calendar
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: "Error fetching holidays" });
  }
};

export const createHoliday = async (req: Request, res: Response) => {
  try {
    
    let { name, date, type, duration } = req.body;

    if (type === 'Public Holiday') type = 'Public';
    if (type === 'Company Holiday') type = 'Company';

    const holiday = new Holiday({ name, date, type, duration });
    await holiday.save();
    
    res.status(201).json(holiday);
  } catch (error: any) {
    // 🛡️ DUPLICATE CATCH: If you try to save two holidays on the exact same day
    if (error.code === 11000) {
      return res.status(400).json({ message: "A holiday already exists on this exact date. Please choose another date." });
    }
    res.status(400).json({ message: error.message || "Database rejected the holiday." });
  }
};

export const deleteHoliday = async (req: Request, res: Response) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id);
    res.json({ message: "Holiday removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting holiday" });
  }
};

// ✅ UPDATE HOLIDAY: Allows manager to modify existing records
export const updateHoliday = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, date, type } = req.body;

    const updatedHoliday = await Holiday.findByIdAndUpdate(
      id,
      { 
        name, 
        date: date ? new Date(date) : undefined, 
        type 
      },
      { new: true, runValidators: true } // 'new' returns the modified document
    );

    if (!updatedHoliday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json({ message: "Holiday updated successfully", holiday: updatedHoliday });
  } catch (error: any) {
    // Catch unique constraint errors (e.g., trying to move a holiday to a date that already has one)
    if (error.code === 11000) {
      return res.status(400).json({ message: "A holiday already exists on this date." });
    }
    res.status(500).json({ message: "Error updating holiday" });
  }
};