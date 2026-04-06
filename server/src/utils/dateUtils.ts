/**
 * Date utility functions for the leave management system
 */

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
}): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Calculate the number of days between two dates (inclusive)
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 * @returns Number of days
 */
export function calculateDaysBetween(startDate: string, endDate: string): number {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Convert to UTC to avoid timezone issues
    const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    
    // Calculate difference in days and add 1 to make it inclusive
    const diffTime = endUTC - startUTC;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return Math.max(0, diffDays); // Ensure non-negative
  } catch (error) {
    console.error('Error calculating days between dates:', error);
    return 0;
  }
}

/**
 * Check if a date is a weekend
 * @param dateString - Date string (YYYY-MM-DD)
 * @returns True if the date is a weekend (Saturday or Sunday)
 */
export function isWeekend(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  } catch (error) {
    console.error('Error checking if date is weekend:', error);
    return false;
  }
}

/**
 * Get the first day of the month for a given date
 * @param dateString - Date string (YYYY-MM-DD)
 * @returns First day of the month as string (YYYY-MM-DD)
 */
export function getFirstDayOfMonth(dateString: string): string {
  try {
    const date = new Date(dateString);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error getting first day of month:', error);
    return dateString;
  }
}

/**
 * Get the last day of the month for a given date
 * @param dateString - Date string (YYYY-MM-DD)
 * @returns Last day of the month as string (YYYY-MM-DD)
 */
export function getLastDayOfMonth(dateString: string): string {
  try {
    const date = new Date(dateString);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error getting last day of month:', error);
    return dateString;
  }
}

/**
 * Format a duration in hours to a readable string
 * @param hours - Number of hours
 * @returns Formatted duration string (e.g., "8h", "4h 30m")
 */
export function formatDuration(hours: number): string {
  if (hours === 0) return '0h';
  
  const fullHours = Math.floor(hours);
  const minutes = Math.round((hours - fullHours) * 60);
  
  if (minutes === 0) {
    return `${fullHours}h`;
  } else {
    return `${fullHours}h ${minutes}m`;
  }
}

/**
 * Get leave type display name
 * @param leaveType - Leave type key
 * @returns Display name for the leave type
 */
export function getLeaveTypeDisplayName(leaveType: string): string {
  const leaveTypes: Record<string, string> = {
    vacation: 'Vacation',
    sick: 'Sick Leave',
    personal: 'Personal Leave',
    bereavement: 'Bereavement Leave',
    maternity: 'Maternity Leave',
    paternity: 'Paternity Leave',
    jury: 'Jury Duty',
    military: 'Military Leave',
  };
  
  return leaveTypes[leaveType.toLowerCase()] || leaveType;
}

/**
 * Get leave type color class
 * @param leaveType - Leave type key
 * @returns Tailwind CSS color class
 */
export function getLeaveTypeColorClass(leaveType: string): string {
  const colors: Record<string, string> = {
    vacation: 'bg-blue-100 text-blue-800',
    sick: 'bg-red-100 text-red-800',
    personal: 'bg-green-100 text-green-800',
    bereavement: 'bg-purple-100 text-purple-800',
    maternity: 'bg-pink-100 text-pink-800',
    paternity: 'bg-pink-100 text-pink-800',
    jury: 'bg-yellow-100 text-yellow-800',
    military: 'bg-indigo-100 text-indigo-800',
  };
  
  return colors[leaveType.toLowerCase()] || 'bg-gray-100 text-gray-800';
}