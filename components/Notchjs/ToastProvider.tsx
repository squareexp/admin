'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ToastContextType, ToastData, ToastPosition } from './types';
import { ToastItem } from './ToastItem';
import { v4 as uuidv4 } from 'uuid'; // You might need to install uuid or use a simple random string generator

// Simple ID generator if uuid is not available
const generateId = () => Math.random().toString(36).substring(2, 9);

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useNotchToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useNotchToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((payload: Omit<ToastData, 'id'>) => {
    const id = generateId();
    setToasts((prev) => [...prev, { ...payload, id, position: payload.position || 'top-center' }]);
    return id;
  }, []);

  const update = useCallback((id: string, payload: Partial<Omit<ToastData, 'id'>>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...payload } : t)));
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Group toasts by position
  const toastsByPosition = useMemo(() => {
    const grouped: Record<ToastPosition, ToastData[]> = {
      'top-left': [],
      'top-center': [],
      'top-right': [],
      'bottom-left': [],
      'bottom-center': [],
      'bottom-right': [],
    };

    toasts.forEach((t) => {
      if (grouped[t.position || 'top-center']) {
        grouped[t.position || 'top-center'].push(t);
      }
    });

    return grouped;
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ toast, update, dismiss }}>
      {children}
      
      {/* Toast Containers */}
      <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col justify-between">
         {/* Top Row */}
         <div className="flex justify-between items-start p-4">
            {/* Top Left */}
            <div className="flex flex-col gap-2 items-start w-[350px]">
               {toastsByPosition['top-left'].map((t) => (
                  <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
               ))}
            </div>
            
            {/* Top Center */}
            <div className="flex flex-col gap-2 items-center w-[350px]">
               {toastsByPosition['top-center'].map((t) => (
                  <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
               ))}
            </div>

            {/* Top Right */}
            <div className="flex flex-col gap-2 items-end w-[350px]">
               {toastsByPosition['top-right'].map((t) => (
                  <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
               ))}
            </div>
         </div>

         {/* Bottom Row */}
         <div className="flex justify-between items-end p-4">
            {/* Bottom Left */}
            <div className="flex flex-col gap-2 items-start w-[350px]">
               {toastsByPosition['bottom-left'].map((t) => (
                  <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
               ))}
            </div>
            
            {/* Bottom Center */}
            <div className="flex flex-col gap-2 items-center w-[350px]">
               {toastsByPosition['bottom-center'].map((t) => (
                  <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
               ))}
            </div>

            {/* Bottom Right */}
            <div className="flex flex-col gap-2 items-end w-[350px]">
               {toastsByPosition['bottom-right'].map((t) => (
                  <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
               ))}
            </div>
         </div>
      </div>
    </ToastContext.Provider>
  );
};
