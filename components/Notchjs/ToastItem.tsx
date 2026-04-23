'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { X, Check, Loader2, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { ToastData } from './types';
import { cn } from '@/lib/utils';

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

/**
 * Icon color is the sole visual indicator of state.
 * The container stays muted/frosted — matching the app's dark aesthetic.
 */
const iconColors = {
  success: 'text-white',
  error: 'text-red-400',
  loading: 'text-white/40',
  info: 'text-white/60',
  warning: 'text-amber-400',
};

export const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [isExpanding, setIsExpanding] = useState(true);

  const Icon = icons[toast.type];

  // Entrance animation: starts as a pill/ball, expands to full notch
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const icon = iconRef.current;

    if (!container || !content || !icon) return;
    if (container.hasAttribute('data-animated')) return;
    container.setAttribute('data-animated', 'true');

    // Initial "dot" state
    gsap.set(container, {
      width: 36,
      height: 36,
      borderRadius: '50%',
      opacity: 0,
      scale: 0.6,
      padding: 0,
    });
    gsap.set(content, { opacity: 0, x: -8 });
    gsap.set(icon, { scale: 0, rotation: -90 });

    const tl = gsap.timeline({ onComplete: () => setIsExpanding(false) });

    // 1. Appear as dot
    tl.to(container, {
      opacity: 1,
      scale: 1,
      duration: 0.35,
      ease: 'back.out(1.7)',
    })
    // 2. Expand to notch pill
    .to(container, {
      width: 'auto',
      height: 'auto',
      borderRadius: '999px',
      padding: '0.45rem 1rem',
      duration: 0.45,
      ease: 'elastic.out(1, 0.65)',
    }, '-=0.05')
    // 3. Icon pops in
    .to(icon, {
      scale: 1,
      rotation: 0,
      duration: 0.35,
      ease: 'back.out(2)',
    }, '-=0.4')
    // 4. Text fades in
    .to(content, {
      opacity: 1,
      x: 0,
      duration: 0.25,
      ease: 'power2.out',
    }, '-=0.25');
  }, []);

  // Re-animate icon when state changes (e.g. loading → success)
  useEffect(() => {
    if (isExpanding) return;
    const icon = iconRef.current;
    if (icon) {
      gsap.fromTo(icon, { scale: 0.5 }, { scale: 1, duration: 0.4, ease: 'back.out(1.7)' });
    }
  }, [toast.type, isExpanding]);

  // Auto-dismiss (not for loading state)
  useEffect(() => {
    if (toast.type !== 'loading') {
      const timer = setTimeout(() => handleDismiss(), toast.duration ?? 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.type, toast.duration]);

  const handleDismiss = () => {
    const container = containerRef.current;
    if (!container) return;
    gsap.to(container, {
      opacity: 0,
      y: -16,
      scale: 0.88,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => onDismiss(toast.id),
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        // Muted frosted-glass base — state is communicated only by the icon
        "relative flex items-center justify-center gap-2.5 overflow-hidden",
        "rounded-full border border-white/10 bg-white/5 text-white/60",
        "shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md",
        "pointer-events-auto min-w-9 min-h-9",
      )}
      style={{ transformOrigin: "center top" }}
    >
      {/* Icon — this is the ONLY color indicator */}
      <div ref={iconRef} className={cn("shrink-0 flex items-center justify-center", iconColors[toast.type])}>
        {toast.type === 'loading' ? (
          <Icon className="w-4 h-4 animate-spin" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </div>

      {/* Message text */}
      <div ref={contentRef} className="whitespace-nowrap text-[11px] font-medium tracking-wide text-white/70 pr-1">
        {toast.message ?? (toast.type === 'loading' ? 'Loading…' : '')}
      </div>

      {/* Dismiss button — visible on hover */}
      {toast.type !== 'loading' && (
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-2.5 opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
          aria-label="Dismiss"
        >
          <X size={12} className="text-white/50 transition-transform group-hover:scale-110 group-hover:text-white" />
        </button>
      )}
    </div>
  );
};
