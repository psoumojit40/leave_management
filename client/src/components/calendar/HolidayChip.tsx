import { Flag, Building2, Info } from 'lucide-react';

interface HolidayChipProps {
  name: string;
  date: string; // Expected format: 'YYYY-MM-DD'
  type: 'Public Holiday' | 'Company Holiday' | 'Observance';
  className?: string;
}

// 1. Configuration object for cleaner styling and icon management
const TYPE_CONFIG = {
  'Public Holiday': {
    styles: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Flag,
  },
  'Company Holiday': {
    styles: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: Building2,
  },
  'Observance': {
    styles: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Info,
  },
};

export default function HolidayChip({
  name,
  date,
  type,
  className = '',
}: HolidayChipProps) {
  // Select config based on type, fallback to Observance if type is somehow invalid
  const config = TYPE_CONFIG[type] || TYPE_CONFIG['Observance'];
  const Icon = config.icon;

  // Format the date (e.g., "Apr 10")
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      title={`${type}: ${name}`}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
        text-xs font-bold border transition-all hover:shadow-sm
        ${config.styles} 
        ${className}
      `}
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      
      <span className="truncate max-w-[120px]">{name}</span>
      
      <span className="ml-1 pl-1.5 border-l border-current opacity-60">
        {formattedDate}
      </span>
    </div>
  );
}