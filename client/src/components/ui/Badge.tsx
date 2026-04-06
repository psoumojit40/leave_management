import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  className?: string;
  children: React.ReactNode;
  dot?: boolean; // New: Optional dot for "Status" badges
}

const variantClasses = {
  primary: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  secondary: 'border-gray-200 bg-gray-100 text-gray-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  outline: 'border-gray-300 bg-transparent text-gray-600',
};

const dotClasses = {
  primary: 'bg-indigo-400',
  secondary: 'bg-gray-400',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  outline: 'bg-gray-300',
};

export default function Badge({
  variant = 'secondary',
  className = '',
  children,
  dot = false,
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors';
  
  // Safe lookup for classes
  const currentVariant = variantClasses[variant] || variantClasses.secondary;
  const currentDot = dotClasses[variant] || dotClasses.secondary;

  return (
    <span className={`${baseClasses} ${currentVariant} ${className}`}>
      {dot && (
        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${currentDot}`} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}