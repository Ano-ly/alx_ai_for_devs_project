'use client';

import { useState, useEffect } from 'react';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastState extends ToastProps {
  id: string;
  visible: boolean;
}

const toastQueue: ToastState[] = [];
let listeners: ((toasts: ToastState[]) => void)[] = [];

const addToast = (toast: ToastProps) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastState = {
    ...toast,
    id,
    visible: true,
    duration: toast.duration || 5000,
  };
  
  toastQueue.push(newToast);
  notifyListeners();
  
  // Auto dismiss
  setTimeout(() => {
    dismissToast(id);
  }, newToast.duration);
  
  return id;
};

const dismissToast = (id: string) => {
  const index = toastQueue.findIndex(t => t.id === id);
  if (index !== -1) {
    toastQueue[index].visible = false;
    notifyListeners();
    
    // Remove from queue after animation
    setTimeout(() => {
      const removeIndex = toastQueue.findIndex(t => t.id === id);
      if (removeIndex !== -1) {
        toastQueue.splice(removeIndex, 1);
        notifyListeners();
      }
    }, 300);
  }
};

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toastQueue]));
};

export const toast = (props: ToastProps) => {
  return addToast(props);
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  
  useEffect(() => {
    const handleToastsChange = (newToasts: ToastState[]) => {
      setToasts([...newToasts]);
    };
    
    listeners.push(handleToastsChange);
    handleToastsChange(toastQueue);
    
    return () => {
      listeners = listeners.filter(l => l !== handleToastsChange);
    };
  }, []);
  
  return {
    toasts,
    toast: addToast,
    dismiss: dismissToast,
  };
}

export function Toaster() {
  const { toasts, dismiss } = useToast();
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            ${toast.visible ? 'animate-in fade-in slide-in-from-right-5' : 'animate-out fade-out slide-out-to-right-5'}
            ${toast.variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : 'bg-background border'}
            rounded-md border shadow-lg p-4 transition-all duration-300
          `}
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              {toast.title && <div className="font-semibold">{toast.title}</div>}
              {toast.description && <div className="text-sm opacity-90 mt-1">{toast.description}</div>}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-sm opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}