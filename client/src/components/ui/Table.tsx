'use client';

import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

// Main Table Wrapper
export default function Table({ children, className = '' }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
      <table className={`min-w-full divide-y divide-gray-200 bg-white ${className}`}>
        {children}
      </table>
    </div>
  );
}

// Table Header
export function TableHeader({ children, className = '' }: TableProps) {
  return <thead className={`bg-gray-50/50 ${className}`}>{children}</thead>;
}

// Table Body
export function TableBody({ children, className = '' }: TableProps) {
  return <tbody className={`divide-y divide-gray-100 bg-white ${className}`}>{children}</tbody>;
}

// Table Row
export function TableRow({ children, className = '' }: TableProps) {
  return <tr className={`hover:bg-gray-50/80 transition-colors ${className}`}>{children}</tr>;
}

// Table Head Cell (TH)
export function TableHead({ children, className = '' }: TableProps) {
  return (
    <th 
      scope="col" 
      className={`px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest ${className}`}
    >
      {children}
    </th>
  );
}

// Table Data Cell (TD)
export function TableCell({ children, className = '' }: TableProps) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-600 ${className}`}>
      {children}
    </td>
  );
}