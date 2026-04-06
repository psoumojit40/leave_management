/**
 * Date utility functions for the leave management system
 */

// Helper to construct YYYY-MM-DD without timezone shifting
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
}): string {
  if (!dateString) return 'N/A';
  try {
    // Adding 'T00:00:00' forces local date interpretation to prevent "day-before" bugs
    const date = new Date(`${dateString}T00:00:00`);
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    return dateString;
  }
}

/**
 * Calculate the number of days between two dates (inclusive)
 */
export function calculateDaysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  try {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return Math.max(0, diffDays);
  } catch (error) {
    return 0;
  }
}

/**
 * Get the first day of the month for a given date
 */
export function getFirstDayOfMonth(dateString: string): string {
  try {
    const date = new Date(`${dateString}T00:00:00`);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return toLocalDateString(firstDay);
  } catch (error) {
    return dateString;
  }
}

/**
 * Get the last day of the month for a given date
 */
export function getLastDayOfMonth(dateString: string): string {
  try {
    const date = new Date(`${dateString}T00:00:00`);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return toLocalDateString(lastDay);
  } catch (error) {
    return dateString;
  }
}

/**
 * Configuration for Leave Types (Centralized to keep logic DRY)
 */
const LEAVE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  vacation: { label: 'Vacation', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  sick: { label: 'Sick Leave', color: 'bg-red-100 text-red-700 border-red-200' },
  personal: { label: 'Personal Leave', color: 'bg-green-100 text-green-700 border-green-200' },
  bereavement: { label: 'Bereavement', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  maternity: { label: 'Maternity', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  paternity: { label: 'Paternity', color: 'bg-pink-100 text-pink-700 border-pink-200' },
};

export function getLeaveTypeDisplayName(type: string): string {
  return LEAVE_TYPE_CONFIG[type.toLowerCase()]?.label || type;
}

export function getLeaveTypeColorClass(type: string): string {
  return LEAVE_TYPE_CONFIG[type.toLowerCase()]?.color || 'bg-gray-100 text-gray-700 border-gray-200';
}

/**
 * Format hours to readable string
 */
export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}