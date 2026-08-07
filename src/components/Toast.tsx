import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};
const colors = {
  success: 'bg-success text-white',
  error: 'bg-error text-white',
  warning: 'bg-warning text-white',
  info: 'bg-accent text-white',
};

export default function Toast({ toasts, onDismiss }: ToastProps) {
  useEffect(() => {
    toasts.forEach(t => {
      const timer = setTimeout(() => onDismiss(t.id), 3500);
      return () => clearTimeout(timer);
    });
  }, [toasts, onDismiss]);

  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={`${colors[t.type]} px-4 py-3 rounded-card shadow-card flex items-center gap-3 min-w-[280px] animate-fade-in`}>
            <Icon size={18} />
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button onClick={() => onDismiss(t.id)} className="opacity-80 hover:opacity-100"><X size={16} /></button>
          </div>
        );
      })}
    </div>
  );
}
