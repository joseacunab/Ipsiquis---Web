import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, FileText, Clock, HelpCircle, X, ChevronDown, ChevronUp, Save, ChevronsUp, ChevronsDown } from 'lucide-react';
import type { Test, Pregunta, Categoria } from '../types';
import { crearTest, actualizarTest, eliminarTest, moverTest, siguienteOrden } from '../dataLayer';

interface TestsManagerProps {
  tests: Test[];
  categorias: Categoria[];
  onNotificar: (mensaje: string, tipo: 'success' | 'error') => void;
  onConfirmar: (opts: { titulo: string; mensaje: string; onConfirmar: () => void; peligroso?: boolean }) => void;
}

function generarId() { return 'test-' + Math.random().toString(36).slice(2, 9); }

function testVacio(orden: number, categoriaId: string): Test {
  return {
    id: generarId(), titulo: '', descripcion: '', categoriaId, duracion: '5 min', cantidadItems: 0,
    autor: 'Ps. Juan M. S', orden, preguntas: [],
  };
}

export default function TestsManager({ tests, categorias, onNotificar, onConfirmar }: TestsManagerProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('all');
  const [editando, setEditando] = useState<Test | null>(null);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const categoriasOrdenadas = useMemo(() => [...categorias].sort((a, b) => a.orden - b.orden), [categorias]);
  const tituloCategoria = (id: string) => categorias.find(c => c.id === id)?.titulo || 'Sin categoría';

  const ordenados = useMemo(() => [...tests].sort((a, b) => a.orden - b.orden), [tests]);
  const filtrados = useMemo(() => {
    return ordenados.filter(t => {
      const coincideBusqueda = (t.titulo ?? '').toLowerCase().includes(busqueda.toLowerCase()) || (t.descripcion ?? '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = filtroCategoria === 'all' || t.categoriaId === filtroCategoria;
      return coincideBusqueda && coincideCategoria;
    });
  }, [ordenados, busqueda, filtroCategoria]);

  const guardarTest = async (test: Test) => {
    const existe = tests.some(t => t.id === test.id);
    setGuardando(true);
    try {
      await (existe ? actualizarTest(test) : crearTest(test));
      setEditando(null);
      setMostrarFormulario(false);
      onNotificar(existe ? 'Prueba actualizada' : 'Prueba creada', 'success');
    } catch (error) {
      onNotificar(`No se pudo guardar la prueba: ${(error as Error).message}`, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarTestHandler = (id: string) => {
    onConfirmar({
      titulo: 'Eliminar prueba',
      mensaje: '¿Estás seguro? Esta acción no se puede deshacer.',
      peligroso: true,
      onConfirmar: async () => {
        try {
          await eliminarTest(id);
          onNotificar('Prueba eliminada', 'success');
        } catch (error) {
          onNotificar(`No se pudo eliminar la prueba: ${(error as Error).message}`, 'error');
        }
      }
    });
  };

  const mover = async (id: string, direccion: -1 | 1) => {
    const idx = ordenados.findIndex(t => t.id === id);
    const destino = idx + direccion;
    if (destino < 0 || destino >= ordenados.length) return;
    try {
      await moverTest(ordenados[idx], ordenados[destino]);
    } catch (error) {
      onNotificar(`No se pudo reordenar: ${(error as Error).message}`, 'error');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Pruebas Psicométricas</h1>
          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Gestiona tests de ansiedad, depresión y estrés.</p>
        </div>
        <button onClick={() => { setEditando(testVacio(siguienteOrden(tests), categoriasOrdenadas[0]?.id || '')); setMostrarFormulario(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nueva Prueba
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar prueba..." className="input-field pl-10" />
          </div>
          <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="select-field md:w-48">
            <option value="all">Todas las categorías</option>
            {categoriasOrdenadas.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
          </select>
        </div>
      </div>

      {mostrarFormulario && editando && (
        <TestFormulario test={editando} categorias={categoriasOrdenadas} guardando={guardando} onGuardar={guardarTest} onCancelar={() => { setMostrarFormulario(false); setEditando(null); }} />
      )}

      <div className="space-y-3">
        {filtrados.map((test, i) => (
          <div key={test.id} className="card p-0 overflow-hidden">
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-btn flex items-center justify-center flex-shrink-0 bg-accent-light text-white">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-text-primary dark:text-white truncate">{test.titulo}</span>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted dark:text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={12} /> {test.duracion}</span>
                  <span className="flex items-center gap-1"><HelpCircle size={12} /> {test.cantidadItems} preguntas</span>
                  <span className="bg-surface-alt dark:bg-dark-surface-alt px-2 py-0.5 rounded-chip text-text-secondary dark:text-gray-300">{tituloCategoria(test.categoriaId)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => mover(test.id, -1)} disabled={i === 0} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none" title="Subir">
                  <ChevronsUp size={16} />
                </button>
                <button onClick={() => mover(test.id, 1)} disabled={i === filtrados.length - 1} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none" title="Bajar">
                  <ChevronsDown size={16} />
                </button>
                <button onClick={() => { setEditando(test); setMostrarFormulario(true); }} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors" title="Editar">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => eliminarTestHandler(test.id)} className="p-2 rounded-btn hover:bg-error-light text-text-muted hover:text-error dark:text-gray-400 dark:hover:bg-error/15 transition-colors" title="Eliminar">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setExpandidoId(expandidoId === test.id ? null : test.id)} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors">
                  {expandidoId === test.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>
            {expandidoId === test.id && (
              <div className="px-4 pb-4 border-t border-divider dark:border-dark-border bg-surface-alt/50 dark:bg-dark-surface-alt/50">
                <p className="text-sm text-text-secondary dark:text-gray-300 mt-3">{test.descripcion}</p>
                <div className="mt-3">
                  <span className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wide">Preguntas</span>
                  <div className="space-y-2 mt-2">
                    {test.preguntas.map((p, idx) => (
                      <div key={idx} className="bg-surface border border-border rounded-btn p-3 dark:bg-dark-surface dark:border-dark-border">
                        <div className="text-xs font-bold text-primary dark:text-accent-light">{idx + 1}. {p.texto}</div>
                        <div className="text-xs text-text-muted dark:text-gray-400 mt-1">{p.opciones.join(' · ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtrados.length === 0 && (
          <div className="text-center py-12 text-text-muted dark:text-gray-500">
            <FileText size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No se encontraron pruebas</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TestFormulario({ test: inicial, categorias, guardando, onGuardar, onCancelar }: { test: Test; categorias: Categoria[]; guardando: boolean; onGuardar: (t: Test) => void; onCancelar: () => void }) {
  const [test, setTest] = useState<Test>({ ...inicial });
  const [tabActiva, setTabActiva] = useState<'info' | 'preguntas'>('info');

  const actualizar = (patch: Partial<Test>) => setTest(prev => ({ ...prev, ...patch }));

  const agregarPregunta = () => {
    const p: Pregunta = { texto: '', opciones: ['', '', '', ''] };
    setTest(prev => ({ ...prev, preguntas: [...prev.preguntas, p], cantidadItems: prev.preguntas.length + 1 }));
  };

  const actualizarPregunta = (idx: number, patch: Partial<Pregunta>) => {
    const preguntas = [...test.preguntas];
    preguntas[idx] = { ...preguntas[idx], ...patch };
    setTest(prev => ({ ...prev, preguntas }));
  };

  const eliminarPregunta = (idx: number) => {
    const preguntas = test.preguntas.filter((_, i) => i !== idx);
    setTest(prev => ({ ...prev, preguntas, cantidadItems: preguntas.length }));
  };

  const actualizarOpcion = (pIdx: number, oIdx: number, valor: string) => {
    const preguntas = [...test.preguntas];
    const opciones = [...preguntas[pIdx].opciones];
    opciones[oIdx] = valor;
    preguntas[pIdx] = { ...preguntas[pIdx], opciones };
    setTest(prev => ({ ...prev, preguntas }));
  };

  const agregarOpcion = (pIdx: number) => {
    const preguntas = [...test.preguntas];
    preguntas[pIdx] = { ...preguntas[pIdx], opciones: [...preguntas[pIdx].opciones, ''] };
    setTest(prev => ({ ...prev, preguntas }));
  };

  const eliminarOpcion = (pIdx: number, oIdx: number) => {
    const preguntas = [...test.preguntas];
    preguntas[pIdx] = { ...preguntas[pIdx], opciones: preguntas[pIdx].opciones.filter((_, i) => i !== oIdx) };
    setTest(prev => ({ ...prev, preguntas }));
  };

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">{inicial.titulo ? 'Editar Prueba' : 'Nueva Prueba'}</h2>
          <button onClick={onCancelar} className="text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white"><X size={20} /></button>
        </div>
        <div className="flex gap-2 mb-4 border-b border-divider dark:border-dark-border pb-2">
          {(['info', 'preguntas'] as const).map(tab => (
            <button key={tab} onClick={() => setTabActiva(tab)} className={`tab-btn ${tabActiva === tab ? 'active' : 'inactive'}`}>
              {tab === 'info' ? 'Información' : 'Preguntas'}
            </button>
          ))}
        </div>

        {tabActiva === 'info' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Título</label>
              <input value={test.titulo} onChange={e => actualizar({ titulo: e.target.value })} className="input-field" placeholder="Ej. GAD-7: Escala de Ansiedad Generalizada" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Descripción</label>
              <textarea value={test.descripcion} onChange={e => actualizar({ descripcion: e.target.value })} className="textarea-field" rows={3} placeholder="Describe el propósito y alcance de la prueba..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Categoría</label>
                <select value={test.categoriaId} onChange={e => actualizar({ categoriaId: e.target.value })} className="select-field">
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Duración</label>
                <input value={test.duracion} onChange={e => actualizar({ duracion: e.target.value })} className="input-field" placeholder="Ej. 5-7 min" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Autor</label>
                <input value={test.autor} onChange={e => actualizar({ autor: e.target.value })} className="input-field" />
              </div>
            </div>
          </div>
        )}

        {tabActiva === 'preguntas' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {test.preguntas.map((p, i) => (
              <div key={i} className="border border-border rounded-btn p-4 bg-surface-alt/30 dark:border-dark-border dark:bg-dark-surface-alt/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-accent bg-accent-soft dark:bg-accent/15 dark:text-accent-light px-2 py-0.5 rounded-chip">Pregunta {i + 1}</span>
                  <button onClick={() => eliminarPregunta(i)} className="text-error hover:text-red-700 text-xs ml-auto">Eliminar</button>
                </div>
                <input value={p.texto} onChange={e => actualizarPregunta(i, { texto: e.target.value })} className="input-field mb-3" placeholder="Texto de la pregunta" />
                <div className="space-y-2">
                  {p.opciones.map((opcion, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <input value={opcion} onChange={e => actualizarOpcion(i, j, e.target.value)} className="input-field text-sm py-2" placeholder={`Opción ${j + 1}`} />
                      <button onClick={() => eliminarOpcion(i, j)} className="text-error hover:text-red-700"><X size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => agregarOpcion(i)} className="text-xs text-accent hover:text-primary-dark dark:hover:text-accent-light font-medium flex items-center gap-1"><Plus size={12} /> Agregar opción</button>
                </div>
              </div>
            ))}
            <button onClick={agregarPregunta} className="btn-secondary w-full flex items-center justify-center gap-2"><Plus size={16} /> Agregar Pregunta</button>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-divider dark:border-dark-border">
          <button onClick={onCancelar} className="btn-secondary">Cancelar</button>
          <button onClick={() => onGuardar(test)} disabled={guardando} className="btn-primary flex items-center gap-2 disabled:opacity-60"><Save size={16} /> Guardar</button>
        </div>
      </div>
    </div>
  );
}
