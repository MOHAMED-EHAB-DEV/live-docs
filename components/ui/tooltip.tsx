"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useFloating } from '@/hooks/useFloating';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip = ({ children, content, position = 'top', className }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  
  const positionMap = {
    top: "top-center",
    bottom: "bottom-center",
    left: "left",
    right: "right"
  } as const;
  
  useFloating(triggerRef, contentRef, isVisible, positionMap[position] || "top-center", 8);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div 
      ref={triggerRef}
      className="relative inline-flex cursor-default"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && mounted && createPortal(
        <div
          ref={contentRef}
          className={cn(
            "fixed z-[150] px-3 py-1.5 text-xs font-medium text-blue-100 bg-dark-400 rounded-lg shadow-xl pointer-events-none whitespace-nowrap",
            "animate-in fade-in zoom-in-95 duration-200",
            className
          )}
          style={{ visibility: 'hidden' }}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
};
