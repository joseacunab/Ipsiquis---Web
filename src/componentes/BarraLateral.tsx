import { LayoutDashboard, Tag, ClipboardList, Dumbbell, FileText, PhoneCall, Users, UserCircle, Heart, LogOut, Settings } from 'lucide-react';
import type { Seccion } from '../modelos/tipos';

const itemsNavegacion: { key: Seccion; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Panel', icon: LayoutDashboard },
  { key: 'categorias', label: 'Categorías', icon: Tag },
  { key: 'tests', label: 'Pruebas', icon: ClipboardList },
  { key: 'ejercicios', label: 'Ejercicios', icon: Dumbbell },
  { key: 'articulosBlog', label: 'Artículos', icon: FileText },
  { key: 'lineasEmergencia', label: 'Líneas de Emergencia', icon: PhoneCall },
  { key: 'pacientes', label: 'Pacientes', icon: Users },
  { key: 'perfil', label: 'Mi Perfil', icon: UserCircle },
  { key: 'configuracion', label: 'Configuración', icon: Settings },
];

interface BarraLateralProps {
  activa: Seccion;
  onCambiar: (s: Seccion) => void;
  colapsado: boolean;
  onCerrarSesion: () => void;
}

export default function BarraLateral({ activa, onCambiar, colapsado, onCerrarSesion }: BarraLateralProps) {
  return (
    <aside className={`fixed left-0 top-0 h-full bg-primary dark:bg-dark-bg text-text-inverse z-30 transition-all duration-300 shadow-sidebar flex flex-col ${colapsado ? 'w-20' : 'w-64'}`}>
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-btn bg-accent flex items-center justify-center flex-shrink-0">
          <Heart size={18} className="text-white" />
        </div>
        {!colapsado && <span className="font-bold text-lg tracking-tight">iPsiquis</span>}
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {itemsNavegacion.map(item => {
          const estaActiva = activa === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onCambiar(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-btn text-sm font-medium transition-all ${
                estaActiva
                  ? 'bg-white/15 text-white dark:bg-white/20'
                  : 'text-white/60 hover:text-white hover:bg-white/10 dark:text-gray-400 dark:hover:text-white'
              }`}
              title={colapsado ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!colapsado && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onCerrarSesion}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-btn text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 dark:text-gray-400 dark:hover:text-white transition-all ${colapsado ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!colapsado && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
