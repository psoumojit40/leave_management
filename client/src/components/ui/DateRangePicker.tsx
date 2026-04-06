'use client'; // FIX 1: Directive for hooks

import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';

interface DateRangePickerProps {
  onChange: (startDate: string | null, endDate: string | null) => void;
  startDate: string | null;
  endDate: string | null;
  className?: string;
}

export default function DateRangePicker({
  onChange,
  startDate,
  endDate,
  className = '',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // FIX 2: Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateChange = (date: string) => {
    if (!startDate || (startDate && endDate)) {
      onChange(date, null);
    } else if (date < startDate) {
      // If user picks a date before the start date, make it the new start date
      onChange(date, null);
    } else {
      onChange(startDate, date);
      setIsOpen(false); // Auto-close when range is complete
    }
  };

  // Helper logic for styling
  const isSelected = (date: string) => date === startDate || date === endDate;
  const isInRange = (date: string) => !!startDate && !!endDate && date >= startDate && date <= endDate;
  const isHovered = (date: string) => !!hoveredDate && !!startDate && !endDate && date >= startDate && date <= hoveredDate;

  // Calendar Logic for April 2026 (Example month)
  const daysInMonth = 30; // April has 30 days
  const startDayOffset = 3; // April 1, 2026 is a Wednesday (index 3)
  
  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startDayOffset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  return (
    <div className={`${className} relative`} ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm hover:border-indigo-400 transition-all"
      >
        <div className="flex items-center text-gray-700">
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
          {!startDate ? (
            <span className="text-gray-400">Select date range...</span>
          ) : (
            <span className="font-medium">
              {startDate} {endDate ? ` — ${endDate}` : '(Select end date)'}
            </span>
          )}
        </div>
        
        <div className="flex items-center">
          {startDate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null, null);
              }}
              className="p-1 hover:bg-gray-100 rounded-full mr-1"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 origin-top-left rounded-xl bg-white p-4 shadow-xl ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">April 2026</span>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Select Leave Dates</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 uppercase mb-2">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="h-9 w-9" />;

              const dateStr = `2026-04-${day.toString().padStart(2, '0')}`;
              const active = isSelected(dateStr);
              const range = isInRange(dateStr);
              const hovering = isHovered(dateStr);

              return (
                <button
                  key={dateStr}
                  type="button"
                  onMouseEnter={() => setHoveredDate(dateStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onClick={() => handleDateChange(dateStr)}
                  className={`
                    h-9 w-9 rounded-lg text-xs font-semibold transition-all
                    ${active ? 'bg-indigo-600 text-white shadow-md scale-110 z-10' : ''}
                    ${range ? 'bg-indigo-100 text-indigo-700 rounded-none' : ''}
                    ${hovering ? 'bg-indigo-50 text-indigo-600' : ''}
                    ${!active && !range && !hovering ? 'text-gray-700 hover:bg-gray-100' : ''}
                    ${active && dateStr === startDate && endDate ? 'rounded-r-none' : ''}
                    ${active && dateStr === endDate ? 'rounded-l-none' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
            <p className="text-[10px] text-gray-400 italic">Click two dates to set range</p>
          </div>
        </div>
      )}
    </div>
  );
}