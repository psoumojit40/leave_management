'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (start: string | null, end: string | null) => void;
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // ✅ NEW: State to track which month the user is currently LOOKING at
  const [viewDate, setViewDate] = useState(startDate ? new Date(startDate) : new Date());
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ NEW: Navigation Functions
  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Calendar Math
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Adjust for local timezone offset so string matches clicked date exactly
    const dateString = new Date(clickedDate.getTime() - (clickedDate.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];

    if (!startDate || (startDate && endDate)) {
      onChange(dateString, null); // Start new selection
    } else {
      const start = new Date(startDate);
      if (clickedDate < start) {
        onChange(dateString, null); // Clicked before start, make it new start
      } else {
        onChange(startDate, dateString); // Set end date
        setIsOpen(false); // Auto-close when range is complete
      }
    }
  };

  const renderCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateString = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];
      
      let isSelected = false;
      let isInRange = false;
      let isStart = dateString === startDate;
      let isEnd = dateString === endDate;

      if (startDate && endDate) {
        isSelected = dateString === startDate || dateString === endDate;
        isInRange = dateString > startDate && dateString < endDate;
      } else if (startDate) {
        isSelected = dateString === startDate;
      }

      // Today logic to prevent picking past dates (optional, based on your rules)
      const today = new Date().toISOString().split('T')[0];
      const isPast = dateString < today;

      days.push(
        <button
          key={day}
          type="button"
          disabled={isPast}
          onClick={() => handleDateClick(day)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-indigo-50'}
            ${isSelected ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' : ''}
            ${isInRange ? 'bg-indigo-50 text-indigo-600' : ''}
            ${!isSelected && !isInRange && !isPast ? 'text-gray-700' : ''}
          `}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-gray-300 p-3 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
      >
        <div className="flex items-center gap-3 text-gray-600">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-sm">
            {startDate ? `${startDate} ${endDate ? ` — ${endDate}` : ''}` : 'Select Date Range'}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-100 shadow-xl rounded-2xl z-50 w-[320px] animate-in fade-in zoom-in-95 duration-200">
          
          {/* ✅ NEW: Month Navigation Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-bold text-lg">
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-1">
              <button 
                type="button" 
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                type="button" 
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
        </div>
      )}
    </div>
  );
}