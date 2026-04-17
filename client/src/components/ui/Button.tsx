'use client';

import { ComponentPropsWithoutRef } from 'react';

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
  type = 'button', // Default to 'button', but will be overridden by 'submit' when passed
  ...props 
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
      // We pass the type explicitly here
      type={type}
      // We combine classes
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      // Ensure the button is disabled during loading OR if disabled prop is true
      disabled={disabled || loading}
      // Spread remaining props (aria-labels, id, etc.)
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <span className="inline-block animate-spin rounded-full border-2 border-t-transparent border-current w-4 h-4"></span>
          <span className="ml-2">Please wait...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}