import { useState } from 'react';
import { Sun, Moon, AlertTriangle, Loader2, Settings } from 'lucide-react';
import type { ConfiguracionApp } from '../modelos/tipos';
import { establecerTemaApp } from '../servicios/firestore';

interface PantallaConfiguracionProps {
  configuracion: ConfiguracionApp | null;
  onNotificar: (mensaje: string, tipo: 'success' | 'error') => void;
}

export default function PantallaConfiguracion({ configuracion, onNotificar }: PantallaConfiguracionProps) {
  const [guardando, setGuardando] = useState(false);
  const tema = configuracion?.tema ?? 'light';
  const esOscuro = tema === 'dark';

  const cambiarTema = async () => {
    const nuevoTema = esOscuro ? 'light' : 'dark';
    setGuardando(true);
    try {
      await establecerTemaApp(nuevoTema);
      onNotificar(`Tema de la app cambiado a ${nuevoTema === 'dark' ? 'oscuro' : 'claro'}`, 'success');
    } catch (error) {
      onNotificar(`No se pudo cambiar el tema: ${(error as Error).message}`, 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-white">Configuración</h1>
        <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Ajustes globales de la app móvil de pacientes.</p>
      </div>

      <div className="card p-5 max-w-xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-btn flex items-center justify-center flex-shrink-0 text-white bg-accent-light">
            <Settings size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary dark:text-white">Tema de la app móvil</h2>
            <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">Controla si la app de los pacientes se muestra en modo claro u oscuro.</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 p-4 rounded-btn bg-surface-alt dark:bg-dark-surface-alt">
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary dark:text-white">
            {esOscuro ? <Moon size={18} /> : <Sun size={18} />}
            <span>{esOscuro ? 'Oscuro' : 'Claro'}</span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={esOscuro}
            onClick={cambiarTema}
            disabled={guardando}
            className={`relative inline-flex h-7 w-14 flex-shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
              esOscuro ? 'bg-primary dark:bg-white/25' : 'bg-border dark:bg-dark-border'
            }`}
          >
            <span className="sr-only">Cambiar tema de la app móvil</span>
            {guardando ? (
              <Loader2 size={14} className="absolute left-1/2 -translate-x-1/2 animate-spin text-white" />
            ) : (
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  esOscuro ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            )}
          </button>
        </div>

        <div className="flex items-start gap-2 mt-4 text-xs text-text-muted dark:text-gray-500">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-warning" />
          <p>Este cambio se aplica de inmediato a la app de <strong>todos los pacientes</strong>, no es una vista previa. Los pacientes no pueden modificarlo por su cuenta.</p>
        </div>
      </div>
    </div>
  );
}
