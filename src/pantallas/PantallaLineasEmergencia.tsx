import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, ChevronUp, ChevronDown, PhoneCall } from 'lucide-react';
import type { LineaEmergencia } from '../modelos/tipos';
import { OPCIONES_ICONOS, IconoPorNombre } from '../constantes/iconos';
import { crearLineaEmergencia, actualizarLineaEmergencia, eliminarLineaEmergencia, moverLineaEmergencia, siguienteOrden } from '../servicios/firestore';

interface PantallaLineasEmergenciaProps {
  lineas: LineaEmergencia[];
  onNotificar: (mensaje: string, tipo: 'success' | 'error') => void;
  onConfirmar: (opts: { titulo: string; mensaje: string; onConfirmar: () => void; peligroso?: boolean }) => void;
}

function generarId() { return 'linea-' + Math.random().toString(36).slice(2, 9); }

function lineaVacia(orden: number): LineaEmergencia {
  return { id: generarId(), nombre: '', numero: '', descripcion: '', icono: 'phone', orden };
}

export default function PantallaLineasEmergencia({ lineas, onNotificar, onConfirmar }: PantallaLineasEmergenciaProps) {
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState<LineaEmergencia | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const ordenadas = useMemo(() => [...lineas].sort((a, b) => a.orden - b.orden), [lineas]);
  const filtradas = useMemo(() => ordenadas.filter(l =>
    (l.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase()) || (l.numero ?? '').toLowerCase().includes(busqueda.toLowerCase())
  ), [ordenadas, busqueda]);

  const guardarLinea = async (linea: LineaEmergencia) => {
    const existe = lineas.some(l => l.id === linea.id);
    setGuardando(true);
    try {
      await (existe ? actualizarLineaEmergencia(linea) : crearLineaEmergencia(linea));
      setEditando(null);
      setMostrarFormulario(false);
      onNotificar(existe ? 'Línea actualizada' : 'Línea creada', 'success');
    } catch (error) {
      onNotificar(`No se pudo guardar la línea: ${(error as Error).message}`, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarLineaHandler = (id: string) => {
    onConfirmar({
      titulo: 'Eliminar línea de emergencia',
      mensaje: '¿Estás seguro? Esta acción no se puede deshacer.',
      peligroso: true,
      onConfirmar: async () => {
        try {
          await eliminarLineaEmergencia(id);
          onNotificar('Línea eliminada', 'success');
        } catch (error) {
          onNotificar(`No se pudo eliminar la línea: ${(error as Error).message}`, 'error');
        }
      }
    });
  };

  const mover = async (id: string, direccion: -1 | 1) => {
    const idx = ordenadas.findIndex(l => l.id === id);
    const destino = idx + direccion;
    if (destino < 0 || destino >= ordenadas.length) return;
    try {
      await moverLineaEmergencia(ordenadas[idx], ordenadas[destino]);
    } catch (error) {
      onNotificar(`No se pudo reordenar: ${(error as Error).message}`, 'error');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Líneas de Emergencia</h1>
          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Números de contacto para situaciones de crisis.</p>
        </div>
        <button onClick={() => { setEditando(lineaVacia(siguienteOrden(lineas))); setMostrarFormulario(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nueva Línea
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar línea..." className="input-field pl-10" />
        </div>
      </div>

      {mostrarFormulario && editando && (
        <LineaFormulario linea={editando} guardando={guardando} onGuardar={guardarLinea} onCancelar={() => { setMostrarFormulario(false); setEditando(null); }} />
      )}

      <div className="space-y-3">
        {filtradas.map((linea, i) => (
          <div key={linea.id} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-btn bg-error-light text-error dark:bg-error/15 flex items-center justify-center flex-shrink-0">
              <IconoPorNombre nombre={linea.icono} size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary dark:text-white truncate">{linea.nombre}</span>
                <span className="text-xs font-semibold text-accent">{linea.numero}</span>
              </div>
              <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5 truncate">{linea.descripcion}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => mover(linea.id, -1)} disabled={i === 0} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none" title="Subir">
                <ChevronUp size={16} />
              </button>
              <button onClick={() => mover(linea.id, 1)} disabled={i === filtradas.length - 1} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none" title="Bajar">
                <ChevronDown size={16} />
              </button>
              <button onClick={() => { setEditando(linea); setMostrarFormulario(true); }} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors" title="Editar">
                <Edit2 size={16} />
              </button>
              <button onClick={() => eliminarLineaHandler(linea.id)} className="p-2 rounded-btn hover:bg-error-light text-text-muted hover:text-error dark:text-gray-400 dark:hover:bg-error/15 transition-colors" title="Eliminar">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filtradas.length === 0 && (
          <div className="text-center py-12 text-text-muted dark:text-gray-500">
            <PhoneCall size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No se encontraron líneas de emergencia</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LineaFormulario({ linea: inicial, guardando, onGuardar, onCancelar }: { linea: LineaEmergencia; guardando: boolean; onGuardar: (l: LineaEmergencia) => void; onCancelar: () => void }) {
  const [linea, setLinea] = useState<LineaEmergencia>({ ...inicial });
  const actualizar = (patch: Partial<LineaEmergencia>) => setLinea(prev => ({ ...prev, ...patch }));

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">{inicial.nombre ? 'Editar Línea' : 'Nueva Línea'}</h2>
          <button onClick={onCancelar} className="text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Nombre</label>
            <input value={linea.nombre} onChange={e => actualizar({ nombre: e.target.value })} className="input-field" placeholder="Ej. Línea de Prevención del Suicidio" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Número</label>
            <input type="tel" value={linea.numero} onChange={e => actualizar({ numero: e.target.value })} className="input-field" placeholder="Ej. 135" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Descripción</label>
            <textarea value={linea.descripcion} onChange={e => actualizar({ descripcion: e.target.value })} className="textarea-field" rows={2} placeholder="Describe brevemente cuándo usar esta línea..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Ícono</label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-btn bg-error-light text-error dark:bg-error/15 flex items-center justify-center flex-shrink-0">
                <IconoPorNombre nombre={linea.icono} size={18} />
              </div>
              <select value={linea.icono} onChange={e => actualizar({ icono: e.target.value as LineaEmergencia['icono'] })} className="select-field flex-1">
                {OPCIONES_ICONOS.map(nombre => <option key={nombre} value={nombre}>{nombre}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-divider dark:border-dark-border">
          <button onClick={onCancelar} className="btn-secondary">Cancelar</button>
          <button onClick={() => onGuardar(linea)} disabled={guardando} className="btn-primary flex items-center gap-2 disabled:opacity-60"><Save size={16} /> Guardar</button>
        </div>
      </div>
    </div>
  );
}
