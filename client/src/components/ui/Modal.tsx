'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

export default function Modal({
  children,
  open,
  onClose,
  title,
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // 1. Handle Scroll Locking & Escape Key
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, onClose]);

  // 2. Handle Click Outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!open) return null;

  // 3. Portals: This injects the modal at the end of <body> to avoid z-index issues
  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`
          relative w-full max-w-lg bg-white rounded-2xl shadow-2xl 
          flex flex-col max-h-[90vh] overflow-hidden 
          animate-in zoom-in-95 slide-in-from-bottom-4 duration-300
          ${className}
        `}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">
            {title || 'Action Required'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            aria-label="Close Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}