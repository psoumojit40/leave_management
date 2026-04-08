'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

// 1. Define the Interface for Events
interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  color: string;
  type: 'leave' | 'holiday';
}

// 2. Interface for a single Day cell
interface DayData {
  date: string;
  dayNumber: number;
  events: CalendarEvent[];
  isToday: boolean;
  isSelected: boolean;
}

export default function TeamCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Track which month we are looking at
  const [viewDate, setViewDate] = useState(new Date());

  // ✅ Helper to get YYYY-MM-DD in local time
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const data: CalendarEvent[] = [
          { id: 1, title: 'Alice Johnson - Vacation', start: '2026-04-10', end: '2026-04-15', color: 'bg-blue-100 text-blue-800', type: 'leave' },
          { id: 2, title: 'Bob Smith - Sick Leave', start: '2026-04-12', end: '2026-04-12', color: 'bg-red-100 text-red-800', type: 'leave' },
          { id: 3, title: 'Carol Davis - Personal Leave', start: '2026-04-18', end: '2026-04-19', color: 'bg-green-100 text-green-800', type: 'leave' },
          { id: 4, title: 'Company Holiday', start: '2026-04-20', end: '2026-04-20', color: 'bg-indigo-100 text-indigo-800', type: 'holiday' },
        ];
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // 3. Group events by date (Fixed for local time)
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      // Split to avoid timezone shift on the input strings
      const [sYear, sMonth, sDay] = event.start.split('-').map(Number);
      const [eYear, eMonth, eDay] = event.end.split('-').map(Number);
      
      const start = new Date(sYear, sMonth - 1, sDay);
      const end = new Date(eYear, eMonth - 1, eDay);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateString = formatLocalDate(d);
        if (!map[dateString]) map[dateString] = [];
        map[dateString].push(event);
      }
    });
    return map;
  }, [events]);

  // 4. Generate the Month Grid (Fixed for local time highlight)
  const { weeks, monthLabel } = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // ✅ FIX: Use local date formatting for "Today"
    const todayStr = formatLocalDate(new Date());

    const monthWeeks: (DayData | null)[][] = [];
    let dayCounter = 1;

    for (let i = 0; i < 6; i++) {
      const week: (DayData | null)[] = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startingDay) || dayCounter > daysInMonth) {
          week.push(null);
        } else {
          // ✅ FIX: Use local date constructor and formatter
          const dateObj = new Date(year, month, dayCounter);
          const dateStr = formatLocalDate(dateObj);
          
          week.push({
            date: dateStr,
            dayNumber: dayCounter,
            events: eventsByDate[dateStr] || [],
            isToday: dateStr === todayStr,
            isSelected: dateStr === selectedDate,
          });
          dayCounter++;
        }
      }
      monthWeeks.push(week);
      if (dayCounter > daysInMonth) break;
    }

    return { 
      weeks: monthWeeks, 
      monthLabel: viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
    };
  }, [viewDate, eventsByDate, selectedDate]);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  if (loading) {
    return (
      <div className="h-[450px] flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-sm text-gray-400 font-medium">Loading Calendar...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-900">{monthLabel}</h2>
        </div>
        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => setViewDate(new Date())} className="px-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded">
            Today
          </button>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1">
        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden">
          {weeks.flat().map((day, idx) => (
            <div 
              key={day ? day.date : `empty-${idx}`}
              onClick={() => day && setSelectedDate(day.date)}
              className={`min-h-[70px] bg-white p-1 relative transition-colors ${
                !day ? 'bg-gray-50/50' : 'cursor-pointer hover:bg-indigo-50/30'
              } ${day?.isSelected ? 'ring-2 ring-inset ring-indigo-500 bg-indigo-50/50' : ''}`}
            >
              {day && (
                <>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    day.isToday ? 'bg-indigo-600 text-white' : 'text-gray-400'
                  }`}>
                    {day.dayNumber}
                  </span>
                  <div className="mt-1 space-y-1">
                    {day.events.slice(0, 2).map(event => (
                      <div key={event.id} className={`text-[9px] px-1 py-0.5 rounded-sm truncate font-medium border ${event.color} border-current opacity-80`}>
                        {event.title.split(' - ')[0]}
                      </div>
                    ))}
                    {day.events.length > 2 && (
                      <div className="text-[8px] text-gray-400 font-bold pl-1">+{day.events.length - 2} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Selected Details Drawer */}
        {selectedDate && (
          <div className="mt-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg animate-in slide-in-from-bottom-2">
            <p className="text-xs font-bold text-indigo-900 mb-2">
              {new Date(selectedDate.replace(/-/g, '/')).toLocaleDateString('en-US', { dateStyle: 'full' })}
            </p>
            {eventsByDate[selectedDate]?.length > 0 ? (
              <div className="space-y-1.5">
                {eventsByDate[selectedDate].map(event => (
                  <div key={event.id} className="flex items-center text-xs">
                    <div className={`w-2 h-2 rounded-full mr-2 ${event.color.split(' ')[0]}`} />
                    <span className="font-medium text-gray-700">{event.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 italic">No events scheduled.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}