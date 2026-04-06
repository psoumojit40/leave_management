'use client';

// import { ReactNode } from 'react';

import { ComponentPropsWithoutRef } from 'react';

// Using ComponentPropsWithoutRef<'button'> automatically includes 
// type, onClick, disabled, className, and all other standard button props
interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props // Spreads all other button attributes (id, title, aria-labels, etc.)
}: ButtonProps) {
  
  const baseClasses = 'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';
  
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus-visible:ring-indigo-500 shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus-visible:ring-gray-500',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus-visible:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500 shadow-sm',
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-5',
    lg: 'h-12 px-8 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          {/* FIX: border-current ensures the spinner matches the text color of the variant */}
          <span className="inline-block animate-spin rounded-full border-2 border-t-transparent border-current w-4 h-4"></span>
          <span className="ml-2">Please wait...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}