import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, ChevronUp, ChevronDown, Tag } from 'lucide-react';
import type { Categoria } from '../types';
import { OPCIONES_ICONOS, IconoPorNombre } from '../iconos';
import { crearCategoria, actualizarCategoria, eliminarCategoria, moverCategoria, siguienteOrden } from '../dataLayer';

interface CategoriasManagerProps {
  categorias: Categoria[];
  onNotificar: (mensaje: string, tipo: 'success' | 'error') => void;
  onConfirmar: (opts: { titulo: string; mensaje: string; onConfirmar: () => void; peligroso?: boolean }) => void;
}

function generarId() { return 'cat-' + Math.random().toString(36).slice(2, 9); }

function categoriaVacia(orden: number): Categoria {
  return { id: generarId(), titulo: '', descripcion: '', icono: 'tag', orden };
}

export default function CategoriasManager({ categorias, onNotificar, onConfirmar }: CategoriasManagerProps) {
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const ordenadas = useMemo(() => [...categorias].sort((a, b) => a.orden - b.orden), [categorias]);
  const filtradas = useMemo(() => ordenadas.filter(c =>
    (c.titulo ?? '').toLowerCase().includes(busqueda.toLowerCase()) || (c.descripcion ?? '').toLowerCase().includes(busqueda.toLowerCase())
  ), [ordenadas, busqueda]);

  const guardarCategoria = async (categoria: Categoria) => {
    const existe = categorias.some(c => c.id === categoria.id);
    setGuardando(true);
    try {
      await (existe ? actualizarCategoria(categoria) : crearCategoria(categoria));
      setEditando(null);
      setMostrarFormulario(false);
      onNotificar(existe ? 'Categoría actualizada' : 'Categoría creada', 'success');
    } catch (error) {
      onNotificar(`No se pudo guardar la categoría: ${(error as Error).message}`, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCategoriaHandler = (id: string) => {
    onConfirmar({
      titulo: 'Eliminar categoría',
      mensaje: '¿Estás seguro? Los tests, ejercicios y artículos que la usan quedarán sin categoría.',
      peligroso: true,
      onConfirmar: async () => {
        try {
          await eliminarCategoria(id);
          onNotificar('Categoría eliminada', 'success');
        } catch (error) {
          onNotificar(`No se pudo eliminar la categoría: ${(error as Error).message}`, 'error');
        }
      }
    });
  };

  const mover = async (id: string, direccion: -1 | 1) => {
    const idx = ordenadas.findIndex(c => c.id === id);
    const destino = idx + direccion;
    if (destino < 0 || destino >= ordenadas.length) return;
    try {
      await moverCategoria(ordenadas[idx], ordenadas[destino]);
    } catch (error) {
      onNotificar(`No se pudo reordenar: ${(error as Error).message}`, 'error');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Categorías</h1>
          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Agrupan tests, ejercicios y artículos de blog.</p>
        </div>
        <button onClick={() => { setEditando(categoriaVacia(siguienteOrden(categorias))); setMostrarFormulario(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nueva Categoría
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar categoría..." className="input-field pl-10" />
        </div>
      </div>

      {mostrarFormulario && editando && (
        <CategoriaFormulario categoria={editando} guardando={guardando} onGuardar={guardarCategoria} onCancelar={() => { setMostrarFormulario(false); setEditando(null); }} />
      )}

      <div className="space-y-3">
        {filtradas.map((categoria, i) => (
          <div key={categoria.id} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-btn bg-accent-soft text-accent dark:bg-accent/15 dark:text-accent-light flex items-center justify-center flex-shrink-0">
              <IconoPorNombre nombre={categoria.icono} size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-text-primary dark:text-white truncate">{categoria.titulo}</span>
              <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5 truncate">{categoria.descripcion}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => mover(categoria.id, -1)} disabled={i === 0} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none" title="Subir">
                <ChevronUp size={16} />
              </button>
              <button onClick={() => mover(categoria.id, 1)} disabled={i === filtradas.length - 1} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none" title="Bajar">
                <ChevronDown size={16} />
              </button>
              <button onClick={() => { setEditando(categoria); setMostrarFormulario(true); }} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors" title="Editar">
                <Edit2 size={16} />
              </button>
              <button onClick={() => eliminarCategoriaHandler(categoria.id)} className="p-2 rounded-btn hover:bg-error-light text-text-muted hover:text-error dark:text-gray-400 dark:hover:bg-error/15 transition-colors" title="Eliminar">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filtradas.length === 0 && (
          <div className="text-center py-12 text-text-muted dark:text-gray-500">
            <Tag size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No se encontraron categorías</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoriaFormulario({ categoria: inicial, guardando, onGuardar, onCancelar }: { categoria: Categoria; guardando: boolean; onGuardar: (c: Categoria) => void; onCancelar: () => void }) {
  const [categoria, setCategoria] = useState<Categoria>({ ...inicial });
  const actualizar = (patch: Partial<Categoria>) => setCategoria(prev => ({ ...prev, ...patch }));

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">{inicial.titulo ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <button onClick={onCancelar} className="text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Título</label>
            <input value={categoria.titulo} onChange={e => actualizar({ titulo: e.target.value })} className="input-field" placeholder="Ej. Ansiedad" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Descripción</label>
            <textarea value={categoria.descripcion} onChange={e => actualizar({ descripcion: e.target.value })} className="textarea-field" rows={3} placeholder="Describe brevemente la categoría..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Ícono</label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-btn bg-accent-soft text-accent dark:bg-accent/15 dark:text-accent-light flex items-center justify-center flex-shrink-0">
                <IconoPorNombre nombre={categoria.icono} size={18} />
              </div>
              <select value={categoria.icono} onChange={e => actualizar({ icono: e.target.value as Categoria['icono'] })} className="select-field flex-1">
                {OPCIONES_ICONOS.map(nombre => <option key={nombre} value={nombre}>{nombre}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-divider dark:border-dark-border">
          <button onClick={onCancelar} className="btn-secondary">Cancelar</button>
          <button onClick={() => onGuardar(categoria)} disabled={guardando} className="btn-primary flex items-center gap-2 disabled:opacity-60"><Save size={16} /> Guardar</button>
        </div>
      </div>
    </div>
  );
}
