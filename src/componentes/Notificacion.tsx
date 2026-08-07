import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ItemNotificacion {
  id: string;
  mensaje: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
}

interface NotificacionProps {
  notificaciones: ItemNotificacion[];
  onDescartar: (id: string) => void;
}

const iconos = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};
const colores = {
  success: 'bg-success text-white',
  error: 'bg-error text-white',
  warning: 'bg-warning text-white',
  info: 'bg-accent text-white',
};

export default function Notificacion({ notificaciones, onDescartar }: NotificacionProps) {
  useEffect(() => {
    notificaciones.forEach(n => {
      const timer = setTimeout(() => onDescartar(n.id), 3500);
      return () => clearTimeout(timer);
    });
  }, [notificaciones, onDescartar]);

  if (!notificaciones.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {notificaciones.map(n => {
        const Icon = iconos[n.tipo];
        return (
          <div key={n.id} className={`${colores[n.tipo]} px-4 py-3 rounded-card shadow-card flex items-center gap-3 min-w-[280px] animate-fade-in`}>
            <Icon size={18} />
            <span className="text-sm font-medium flex-1">{n.mensaje}</span>
            <button onClick={() => onDescartar(n.id)} className="opacity-80 hover:opacity-100"><X size={16} /></button>
          </div>
        );
      })}
    </div>
  );
}
