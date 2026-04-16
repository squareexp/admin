'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { X, Check, Loader2, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { ToastData } from './types';
import { cn } from '@/libs/utils'; // Assuming standard utils for tailwind merge

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const icons = {
  success: Check,
  error: AlertCircle,
  loading: Loader2,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'bg-zinc-900 border-zinc-800 text-white',
  error: 'bg-red-500 text-white border-red-600',
  loading: 'bg-blue-500 text-white border-blue-600',
  info: 'bg-zinc-900 text-white border-zinc-800',
  warning: 'bg-yellow-500 text-black border-yellow-600',
};

export const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [isExpanding, setIsExpanding] = useState(true);

  const Icon = icons[toast.type];

  // Entrance animation
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const icon = iconRef.current;

    if (!container || !content || !icon) return;

    // Only run entrance animation once
    if (container.hasAttribute('data-animated')) return;
    container.setAttribute('data-animated', 'true');


    // Initial state: A small ball
    gsap.set(container, {
      width: 40,
      height: 40,
      borderRadius: '50%',
      opacity: 0,
      scale: 0.5,
      padding: 0
    });
    
    gsap.set(content, { opacity: 0, x: -10 });
    gsap.set(icon, { scale: 0, rotation: -90 });

    const tl = gsap.timeline({
      onComplete: () => {
        setIsExpanding(false);
      }
    });

    // 1. Appear as a ball and bounce a bit
    tl.to(container, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(1.7)',
    })
    // 2. Expand to "Notch" (wider)
    .to(container, {
      width: 'auto',
      height: 'auto',
      borderRadius: '24px', // Notch style radius
      padding: '0.75rem 1.25rem', // Add padding
      duration: 0.5,
      ease: 'elastic.out(1, 0.6)',
    }, '-=0.1')
    // 3. Show Icon with pop
    .to(icon, {
      scale: 1,
      rotation: 0,
      duration: 0.4,
      ease: 'back.out(2)',
    }, '-=0.4')
    // 4. Reveal text
    .to(content, {
      opacity: 1,
      x: 0,
      duration: 0.3,
      ease: 'power2.out',
    }, '-=0.3');

  }, []);

  // Animate icon change (e.g. loading -> success)
  useEffect(() => {
     if (isExpanding) return; // handled by main intro
     
     const icon = iconRef.current;
     if (icon) {
         gsap.fromTo(icon, 
             { scale: 0.5 }, 
             { scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
         );
     }
  }, [toast.type, isExpanding]);

  // Auto dismiss logic
  useEffect(() => {
    if (toast.type !== 'loading') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.type, toast.duration]);

  const handleDismiss = () => {
    const container = containerRef.current;
    if (!container) return;

    gsap.to(container, {
      opacity: 0,
      y: -20,
      scale: 0.9,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => onDismiss(toast.id),
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center gap-3 shadow-lg border relative overflow-hidden pointer-events-auto transition-colors duration-500",
        colors[toast.type],
        // Initial tight sizing for the 'ball' state is handled by GSAP, 
        // but we set basic items-center justify-center for that phase
        "justify-center min-w-10 min-h-10" 
      )}
      style={{
        transformOrigin: "center top"
      }}
    >
      <div ref={iconRef} className="shrink-0 flex items-center justify-center">
        {toast.type === 'loading' ? (
          <Icon className="w-5 h-5 animate-spin" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>

      {/* Content wrapper - hidden initially */}
      <div ref={contentRef} className="whitespace-nowrap font-medium text-sm pr-1">
        {toast.message || (toast.type === 'loading' ? 'Loading...' : '')}
      </div>

      {toast.type !== 'loading' && (
         <button onClick={handleDismiss} className="absolute right-0 top-0 bottom-0 px-2 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center bg-transparent border-none">
            <X size={14} />
         </button>
      )}
    </div>
  );
};
