import { useMemo, useState } from 'react';
import { ClipboardList, Dumbbell, FileText, Users, Tag, PhoneCall, ArrowUpRight, Calendar, Layers, Sparkles, Loader2 } from 'lucide-react';
import type { Test, Ejercicio, ArticuloBlog, Categoria, LineaEmergencia, Paciente, Seccion } from '../modelos/tipos';
import { sembrarDatosIniciales } from '../modelos/datosSemilla';
import { formatearFecha } from '../utilidades/ayudantes';

interface PantallaDashboardProps {
  categorias: Categoria[];
  tests: Test[];
  ejercicios: Ejercicio[];
  articulos: ArticuloBlog[];
  lineasEmergencia: LineaEmergencia[];
  pacientes: Paciente[];
  onNavegar: (seccion: Seccion) => void;
  onNotificar: (mensaje: string, tipo: 'success' | 'error') => void;
}

export default function PantallaDashboard({ categorias, tests, ejercicios, articulos, lineasEmergencia, pacientes, onNavegar, onNotificar }: PantallaDashboardProps) {
  const [sembrando, setSembrando] = useState(false);

  const sembrar = async () => {
    setSembrando(true);
    try {
      await sembrarDatosIniciales();
      onNotificar('Datos de ejemplo cargados', 'success');
    } catch (error) {
      onNotificar(`No se pudieron cargar los datos de ejemplo: ${(error as Error).message}`, 'error');
    } finally {
      setSembrando(false);
    }
  };

  const stats = useMemo(() => ({
    totalCategorias: categorias.length,
    totalTests: tests.length,
    totalEjercicios: ejercicios.length,
    totalArticulos: articulos.length,
    totalLineasEmergencia: lineasEmergencia.length,
    totalPacientes: pacientes.length,
    pacientesActivos: pacientes.filter(p => p.activo).length,
  }), [categorias, tests, ejercicios, articulos, lineasEmergencia, pacientes]);

  const pacientesRecientes = useMemo(() =>
    [...pacientes].sort((a, b) => (b.creadoEn?.toMillis() ?? 0) - (a.creadoEn?.toMillis() ?? 0)).slice(0, 8),
    [pacientes]
  );

  const resumenPorCategoria = useMemo(() => {
    const ordenadas = [...categorias].sort((a, b) => a.orden - b.orden);
    return ordenadas.map(c => ({
      categoria: c,
      cantidad: tests.filter(t => t.categoriaId === c.id).length + ejercicios.filter(e => e.categoriaId === c.id).length + articulos.filter(a => a.categoriaId === c.id).length,
    }));
  }, [categorias, tests, ejercicios, articulos]);

  const maximoResumen = Math.max(1, ...resumenPorCategoria.map(r => r.cantidad));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-white">Panel de Administración</h1>
        <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Bienvenido de vuelta, Ps. Juan. Resumen de tu plataforma.</p>
      </div>

      {categorias.length === 0 && (
        <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-accent/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-btn bg-accent-soft text-accent dark:bg-accent/15 dark:text-accent-light flex items-center justify-center flex-shrink-0"><Sparkles size={18} /></div>
            <div>
              <div className="text-sm font-bold text-text-primary dark:text-white">Todavía no hay datos en Firestore</div>
              <div className="text-xs text-text-muted dark:text-gray-400">Podés cargar categorías, tests, ejercicios y artículos de ejemplo para arrancar.</div>
            </div>
          </div>
          <button onClick={sembrar} disabled={sembrando} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {sembrando ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Sembrar datos de ejemplo
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Categorías', value: stats.totalCategorias, icon: Tag, color: 'bg-accent-soft text-accent dark:bg-accent/15 dark:text-accent-light', seccion: 'categorias' as const },
          { label: 'Pruebas Psicométricas', value: stats.totalTests, icon: ClipboardList, color: 'bg-accent-soft text-accent dark:bg-accent/15 dark:text-accent-light', seccion: 'tests' as const },
          { label: 'Ejercicios Terapéuticos', value: stats.totalEjercicios, icon: Dumbbell, color: 'bg-success-light text-success dark:bg-success/15', seccion: 'ejercicios' as const },
          { label: 'Artículos de Blog', value: stats.totalArticulos, icon: FileText, color: 'bg-warning-light text-warning dark:bg-warning/15', seccion: 'articulosBlog' as const },
        ].map((card, i) => (
          <button key={i} onClick={() => onNavegar(card.seccion)} className="card card-hover p-5 text-left">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-btn ${card.color} flex items-center justify-center`}>
                <card.icon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-text-muted dark:text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary dark:text-white">{card.value}</div>
            <div className="text-sm text-text-muted dark:text-gray-400 mt-1">{card.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <button onClick={() => onNavegar('lineasEmergencia')} className="card card-hover p-5 text-left flex items-center gap-4">
          <div className="w-10 h-10 rounded-btn bg-error-light text-error dark:bg-error/15 flex items-center justify-center flex-shrink-0"><PhoneCall size={20} /></div>
          <div>
            <div className="text-2xl font-bold text-text-primary dark:text-white">{stats.totalLineasEmergencia}</div>
            <div className="text-sm text-text-muted dark:text-gray-400">Líneas de Emergencia</div>
          </div>
        </button>
        <button onClick={() => onNavegar('pacientes')} className="card card-hover p-5 text-left flex items-center gap-4">
          <div className="w-10 h-10 rounded-btn bg-primary/10 text-primary dark:bg-white/10 dark:text-white flex items-center justify-center flex-shrink-0"><Users size={20} /></div>
          <div>
            <div className="text-2xl font-bold text-text-primary dark:text-white">{stats.totalPacientes}</div>
            <div className="text-sm text-text-muted dark:text-gray-400">Pacientes · {stats.pacientesActivos} activos</div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text-primary dark:text-white flex items-center gap-2"><Calendar size={18} className="text-accent" /> Pacientes Recientes</h2>
          </div>
          <div className="space-y-3">
            {pacientesRecientes.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-btn hover:bg-surface-alt dark:hover:bg-dark-surface-alt transition-colors">
                <div className="w-9 h-9 rounded-btn flex items-center justify-center bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                  <Users size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary dark:text-white truncate">{p.nombre}</div>
                  <div className="text-xs text-text-muted dark:text-gray-400">{p.correo} · {formatearFecha(p.creadoEn)}</div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-chip ${p.activo ? 'bg-success-light text-success dark:bg-success/15' : 'bg-error-light text-error dark:bg-error/15'}`}>
                  {p.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
            {pacientesRecientes.length === 0 && (
              <p className="text-sm text-text-muted dark:text-gray-500 text-center py-6">Todavía no hay pacientes registrados.</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-text-primary dark:text-white flex items-center gap-2 mb-4"><Layers size={18} className="text-accent" /> Contenido por Categoría</h2>
          <div className="space-y-4">
            {resumenPorCategoria.map(({ categoria, cantidad }) => (
              <div key={categoria.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-text-primary dark:text-white">{categoria.titulo}</span>
                  <span className="text-text-muted dark:text-gray-400">{cantidad}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-alt dark:bg-dark-surface-alt overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(cantidad / maximoResumen) * 100}%` }} />
                </div>
              </div>
            ))}
            {resumenPorCategoria.length === 0 && (
              <p className="text-sm text-text-muted dark:text-gray-500">Todavía no hay categorías.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
