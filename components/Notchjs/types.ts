export type ToastType = 'success' | 'error' | 'loading' | 'info' | 'warning';

export type ToastPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

export interface ToastData {
  id: string;
  type: ToastType;
  message?: string;
  duration?: number; // In ms
  position?: ToastPosition;
}

export interface ToastContextType {
  toast: (payload: Omit<ToastData, 'id'>) => string;
  update: (id: string, payload: Partial<Omit<ToastData, 'id'>>) => void;
  dismiss: (id: string) => void;
}
