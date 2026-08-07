import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Dumbbell, Clock, X, Save, ChevronDown, ChevronUp, ChevronsUp, ChevronsDown, ListOrdered } from 'lucide-react';
import type { Ejercicio, Categoria } from '../types';
import { crearEjercicio, actualizarEjercicio, eliminarEjercicio, moverEjercicio, siguienteOrden } from '../dataLayer';

interface ExercisesManagerProps {
  ejercicios: Ejercicio[];
  categorias: Categoria[];
  onNotificar: (mensaje: string, tipo: 'success' | 'error') => void;
  onConfirmar: (opts: { titulo: string; mensaje: string; onConfirmar: () => void; peligroso?: boolean }) => void;
}

function generarId() { return 'ex-' + Math.random().toString(36).slice(2, 9); }

function ejercicioVacio(orden: number, categoriaId: string): Ejercicio {
  return { id: generarId(), titulo: '', descripcion: '', categoriaId, duracion: '10 min', autor: 'Ps. Juan M. S', orden, procedimiento: '' };
}

export default function ExercisesManager({ ejercicios, categorias, onNotificar, onConfirmar }: ExercisesManagerProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('all');
  const [editando, setEditando] = useState<Ejercicio | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const categoriasOrdenadas = useMemo(() => [...categorias].sort((a, b) => a.orden - b.orden), [categorias]);
  const tituloCategoria = (id: string) => categorias.find(c => c.id === id)?.titulo || 'Sin categoría';

  const ordenados = useMemo(() => [...ejercicios].sort((a, b) => a.orden - b.orden), [ejercicios]);
  const filtrados = useMemo(() => {
    return ordenados.filter(e => {
      const coincideBusqueda = (e.titulo ?? '').toLowerCase().includes(busqueda.toLowerCase()) || (e.descripcion ?? '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = filtroCategoria === 'all' || e.categoriaId === filtroCategoria;
      return coincideBusqueda && coincideCategoria;
    });
  }, [ordenados, busqueda, filtroCategoria]);

  const guardarEjercicio = async (ejercicio: Ejercicio) => {
    const existe = ejercicios.some(e => e.id === ejercicio.id);
    setGuardando(true);
    try {
      await (existe ? actualizarEjercicio(ejercicio) : crearEjercicio(ejercicio));
      setEditando(null);
      setMostrarFormulario(false);
      onNotificar(existe ? 'Ejercicio actualizado' : 'Ejercicio creado', 'success');
    } catch (error) {
      onNotificar(`No se pudo guardar el ejercicio: ${(error as Error).message}`, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarEjercicioHandler = (id: string) => {
    onConfirmar({
      titulo: 'Eliminar ejercicio',
      mensaje: '¿Estás seguro? Esta acción no se puede deshacer.',
      peligroso: true,
      onConfirmar: async () => {
        try {
          await eliminarEjercicio(id);
          onNotificar('Ejercicio eliminado', 'success');
        } catch (error) {
          onNotificar(`No se pudo eliminar el ejercicio: ${(error as Error).message}`, 'error');
        }
      }
    });
  };

  const mover = async (id: string, direccion: -1 | 1) => {
    const idx = ordenados.findIndex(e => e.id === id);
    const destino = idx + direccion;
    if (destino < 0 || destino >= ordenados.length) return;
    try {
      await moverEjercicio(ordenados[idx], ordenados[destino]);
    } catch (error) {
      onNotificar(`No se pudo reordenar: ${(error as Error).message}`, 'error');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Ejercicios Terapéuticos</h1>
          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Gestiona ejercicios de respiración, mindfulness, TCC y más.</p>
        </div>
        <button onClick={() => { setEditando(ejercicioVacio(siguienteOrden(ejercicios), categoriasOrdenadas[0]?.id || '')); setMostrarFormulario(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nuevo Ejercicio</button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar ejercicio..." className="input-field pl-10" />
          </div>
          <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="select-field md:w-48">
            <option value="all">Todas las categorías</option>
            {categoriasOrdenadas.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
          </select>
        </div>
      </div>

      {mostrarFormulario && editando && (
        <ExerciseFormulario ejercicio={editando} categorias={categoriasOrdenadas} guardando={guardando} onGuardar={guardarEjercicio} onCancelar={() => { setMostrarFormulario(false); setEditando(null); }} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtrados.map((ex, i) => (
          <div key={ex.id} className="card card-hover p-0 overflow-hidden flex flex-col">
            <div className="p-4 flex-1">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="w-10 h-10 rounded-btn flex items-center justify-center flex-shrink-0 text-white bg-accent-light">
                  <Dumbbell size={18} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => mover(ex.id, -1)} disabled={i === 0} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none" title="Subir"><ChevronsUp size={16} /></button>
                  <button onClick={() => mover(ex.id, 1)} disabled={i === filtrados.length - 1} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none" title="Bajar"><ChevronsDown size={16} /></button>
                  <button onClick={() => { setEditando(ex); setMostrarFormulario(true); }} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => eliminarEjercicioHandler(ex.id)} className="p-2 rounded-btn hover:bg-error-light text-text-muted hover:text-error dark:text-gray-400 dark:hover:bg-error/15 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="text-sm font-bold text-text-primary dark:text-white leading-snug mb-1">{ex.titulo}</h3>
              <p className="text-xs text-text-secondary dark:text-gray-300 line-clamp-2 mb-3">{ex.descripcion}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-chip bg-surface-alt text-text-muted dark:bg-dark-surface-alt dark:text-gray-400">{tituloCategoria(ex.categoriaId)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-muted dark:text-gray-400">
                <span className="flex items-center gap-1"><Clock size={12} /> {ex.duracion}</span>
                <span className="flex items-center gap-1"><ListOrdered size={12} /> {(ex.procedimiento ?? '').split('\n').filter(Boolean).length} líneas</span>
              </div>
            </div>
            <div className="px-4 pb-3">
              <button onClick={() => setExpandidoId(expandidoId === ex.id ? null : ex.id)} className="w-full text-xs font-medium text-accent hover:text-primary-dark dark:hover:text-accent-light flex items-center justify-center gap-1 py-2 rounded-btn hover:bg-accent-soft dark:hover:bg-accent/15 transition-colors">
                {expandidoId === ex.id ? <><ChevronUp size={14} /> Ver menos</> : <><ChevronDown size={14} /> Ver procedimiento</>}
              </button>
            </div>
            {expandidoId === ex.id && (
              <div className="px-4 pb-4 border-t border-divider dark:border-dark-border bg-surface-alt/50 dark:bg-dark-surface-alt/50">
                <div className="mt-3 text-xs text-text-secondary dark:text-gray-300 whitespace-pre-wrap">{ex.procedimiento || 'Este ejercicio aún no tiene procedimiento.'}</div>
              </div>
            )}
          </div>
        ))}
        {filtrados.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted dark:text-gray-500">
            <Dumbbell size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No se encontraron ejercicios</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseFormulario({ ejercicio: inicial, categorias, guardando, onGuardar, onCancelar }: { ejercicio: Ejercicio; categorias: Categoria[]; guardando: boolean; onGuardar: (e: Ejercicio) => void; onCancelar: () => void }) {
  const [ex, setEx] = useState<Ejercicio>({ ...inicial });
  const actualizar = (patch: Partial<Ejercicio>) => setEx(prev => ({ ...prev, ...patch }));

  const [pasos, setPasos] = useState<string[]>(() => {
    const lineas = (inicial.procedimiento ?? '').split('\n').filter(l => l.trim() !== '');
    return lineas.length > 0 ? lineas : [''];
  });

  const actualizarPasos = (nuevosPasos: string[]) => {
    setPasos(nuevosPasos);
    actualizar({ procedimiento: nuevosPasos.filter(p => p.trim() !== '').join('\n') });
  };

  const cambiarPaso = (idx: number, valor: string) => actualizarPasos(pasos.map((p, i) => i === idx ? valor : p));
  const agregarPaso = () => actualizarPasos([...pasos, '']);
  const eliminarPaso = (idx: number) => actualizarPasos(pasos.length > 1 ? pasos.filter((_, i) => i !== idx) : ['']);

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">{inicial.titulo ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h2>
          <button onClick={onCancelar} className="text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Título</label>
              <input value={ex.titulo} onChange={e => actualizar({ titulo: e.target.value })} className="input-field" placeholder="Ej. Respiración Diafragmática" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Duración</label>
              <input value={ex.duracion} onChange={e => actualizar({ duracion: e.target.value })} className="input-field" placeholder="Ej. 10 min" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Descripción</label>
            <textarea value={ex.descripcion} onChange={e => actualizar({ descripcion: e.target.value })} className="textarea-field" rows={2} placeholder="Describe brevemente el ejercicio..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Categoría</label>
              <select value={ex.categoriaId} onChange={e => actualizar({ categoriaId: e.target.value })} className="select-field">
                {categorias.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Autor</label>
              <input value={ex.autor} onChange={e => actualizar({ autor: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Procedimiento</label>
            <p className="text-xs text-text-muted dark:text-gray-500 mb-1.5">Agrega, edita o elimina los pasos del ejercicio.</p>
            <div className="space-y-2">
              {pasos.map((paso, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-9 flex items-center justify-center text-xs font-semibold text-text-muted dark:text-gray-500 flex-shrink-0">{idx + 1}</span>
                  <input
                    value={paso}
                    onChange={e => cambiarPaso(idx, e.target.value)}
                    className="input-field flex-1"
                    placeholder={`Paso ${idx + 1}...`}
                  />
                  <button
                    type="button"
                    onClick={() => eliminarPaso(idx)}
                    disabled={pasos.length === 1 && !paso}
                    className="p-2 rounded-btn hover:bg-error-light text-text-muted hover:text-error dark:text-gray-400 dark:hover:bg-error/15 transition-colors disabled:opacity-30 disabled:pointer-events-none flex-shrink-0"
                    title="Eliminar paso"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={agregarPaso}
              className="mt-2 text-xs font-medium text-accent hover:text-primary-dark dark:hover:text-accent-light flex items-center gap-1 py-2 px-3 rounded-btn hover:bg-accent-soft dark:hover:bg-accent/15 transition-colors"
            >
              <Plus size={14} /> Agregar paso
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-divider dark:border-dark-border">
          <button onClick={onCancelar} className="btn-secondary">Cancelar</button>
          <button onClick={() => onGuardar(ex)} disabled={guardando} className="btn-primary flex items-center gap-2 disabled:opacity-60"><Save size={16} /> Guardar</button>
        </div>
      </div>
    </div>
  );
}
