import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, FileText, X, Save, Clock, BookOpen, ArrowLeft, ChevronsUp, ChevronsDown, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { ArticuloBlog, Categoria } from '../modelos/tipos';
import { crearArticulo, actualizarArticulo, eliminarArticulo, moverArticulo, siguienteOrden } from '../servicios/firestore';

interface PantallaArticulosBlogProps {
  articulos: ArticuloBlog[];
  categorias: Categoria[];
  onNotificar: (mensaje: string, tipo: 'success' | 'error') => void;
  onConfirmar: (opts: { titulo: string; mensaje: string; onConfirmar: () => void; peligroso?: boolean }) => void;
}

function generarId() { return 'art-' + Math.random().toString(36).slice(2, 9); }

function articuloVacio(orden: number, categoriaId: string): ArticuloBlog {
  return { id: generarId(), titulo: '', extracto: '', contenido: '', categoriaId, tiempoLectura: '5 min', orden };
}

async function subirImagenArticulo(archivo: File): Promise<string> {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const respuesta = await fetch('/api/subir-imagen', {
    method: 'POST',
    headers: { 'X-Clave-Subida': import.meta.env.VITE_CLAVE_SUBIDA_IMAGENES },
    body: formData,
  });
  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '');
    throw new Error(detalle || `Error ${respuesta.status} al subir la imagen`);
  }
  const datos = await respuesta.json();
  return datos.url as string;
}

export default function PantallaArticulosBlog({ articulos, categorias, onNotificar, onConfirmar }: PantallaArticulosBlogProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('all');
  const [editando, setEditando] = useState<ArticuloBlog | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [viendoArticulo, setViendoArticulo] = useState<ArticuloBlog | null>(null);
  const [guardando, setGuardando] = useState(false);

  const categoriasOrdenadas = useMemo(() => [...categorias].sort((a, b) => a.orden - b.orden), [categorias]);
  const tituloCategoria = (id: string) => categorias.find(c => c.id === id)?.titulo || 'Sin categoría';

  const ordenados = useMemo(() => [...articulos].sort((a, b) => a.orden - b.orden), [articulos]);
  const filtrados = useMemo(() => {
    return ordenados.filter(a => {
      const coincideBusqueda = (a.titulo ?? '').toLowerCase().includes(busqueda.toLowerCase()) || (a.extracto ?? '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = filtroCategoria === 'all' || a.categoriaId === filtroCategoria;
      return coincideBusqueda && coincideCategoria;
    });
  }, [ordenados, busqueda, filtroCategoria]);

  const guardarArticulo = async (articulo: ArticuloBlog) => {
    const existe = articulos.some(a => a.id === articulo.id);
    setGuardando(true);
    console.log('[ArticulosBlog] Objeto a guardar en Firestore:', articulo);
    try {
      await (existe ? actualizarArticulo(articulo) : crearArticulo(articulo));
      setEditando(null);
      setMostrarFormulario(false);
      onNotificar(existe ? 'Artículo actualizado' : 'Artículo creado', 'success');
    } catch (error) {
      onNotificar(`No se pudo guardar el artículo: ${(error as Error).message}`, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarArticuloHandler = (id: string) => {
    onConfirmar({
      titulo: 'Eliminar artículo',
      mensaje: '¿Estás seguro? Esta acción no se puede deshacer.',
      peligroso: true,
      onConfirmar: async () => {
        try {
          await eliminarArticulo(id);
          onNotificar('Artículo eliminado', 'success');
        } catch (error) {
          onNotificar(`No se pudo eliminar el artículo: ${(error as Error).message}`, 'error');
        }
      }
    });
  };

  const mover = async (id: string, direccion: -1 | 1) => {
    const idx = ordenados.findIndex(a => a.id === id);
    const destino = idx + direccion;
    if (destino < 0 || destino >= ordenados.length) return;
    try {
      await moverArticulo(ordenados[idx], ordenados[destino]);
    } catch (error) {
      onNotificar(`No se pudo reordenar: ${(error as Error).message}`, 'error');
    }
  };

  if (viendoArticulo) {
    return <ArticuloDetalle articulo={viendoArticulo} tituloCategoria={tituloCategoria(viendoArticulo.categoriaId)} onVolver={() => setViendoArticulo(null)} />;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Artículos de Blog</h1>
          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Gestiona contenido psicoeducativo para tus usuarios.</p>
        </div>
        <button onClick={() => { setEditando(articuloVacio(siguienteOrden(articulos), categoriasOrdenadas[0]?.id || '')); setMostrarFormulario(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nuevo Artículo</button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar artículo..." className="input-field pl-10" />
          </div>
          <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="select-field md:w-48">
            <option value="all">Todas las categorías</option>
            {categoriasOrdenadas.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
          </select>
        </div>
      </div>

      {mostrarFormulario && editando && (
        <ArticuloFormulario articulo={editando} categorias={categoriasOrdenadas} guardando={guardando} onGuardar={guardarArticulo} onCancelar={() => { setMostrarFormulario(false); setEditando(null); }} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtrados.map((art, i) => (
          <div key={art.id} className="card card-hover p-0 overflow-hidden flex flex-col">
            {art.imagenUrl && (
              <img src={art.imagenUrl} alt={art.titulo} className="w-full h-[130px] object-cover rounded-t-card" />
            )}
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-chip bg-accent">{tituloCategoria(art.categoriaId)}</span>
                <span className="text-xs text-text-muted dark:text-gray-400 flex items-center gap-1"><Clock size={10} /> {art.tiempoLectura}</span>
              </div>
              <h3 className="text-sm font-bold text-text-primary dark:text-white leading-snug mb-1">{art.titulo}</h3>
              <p className="text-xs text-text-secondary dark:text-gray-300 line-clamp-2 mb-3">{art.extracto}</p>
              <div className="flex items-center gap-1 mt-auto pt-3 border-t border-divider dark:border-dark-border">
                <button onClick={() => setViendoArticulo(art)} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors" title="Ver artículo">
                  <BookOpen size={16} />
                </button>
                <button onClick={() => mover(art.id, -1)} disabled={i === 0} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none" title="Subir"><ChevronsUp size={16} /></button>
                <button onClick={() => mover(art.id, 1)} disabled={i === filtrados.length - 1} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none" title="Bajar"><ChevronsDown size={16} /></button>
                <button onClick={() => { setEditando(art); setMostrarFormulario(true); }} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => eliminarArticuloHandler(art.id)} className="p-2 rounded-btn hover:bg-error-light text-text-muted hover:text-error dark:text-gray-400 dark:hover:bg-error/15 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        {filtrados.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted dark:text-gray-500">
            <FileText size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No se encontraron artículos</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ArticuloDetalle({ articulo, tituloCategoria, onVolver }: { articulo: ArticuloBlog; tituloCategoria: string; onVolver: () => void }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={onVolver} className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white transition-colors">
        <ArrowLeft size={16} /> Volver a Artículos
      </button>

      {articulo.imagenUrl && (
        <img src={articulo.imagenUrl} alt={articulo.titulo} className="w-full h-[300px] object-cover rounded-card" />
      )}

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-white px-2.5 py-1 rounded-chip bg-accent">{tituloCategoria}</span>
          <span className="text-xs text-text-muted dark:text-gray-400 flex items-center gap-1"><Clock size={12} /> {articulo.tiempoLectura}</span>
        </div>

        <h1 className="text-2xl font-bold text-text-primary dark:text-white mb-2">{articulo.titulo}</h1>
        <p className="text-sm text-text-secondary dark:text-gray-300 mb-5 pb-5 border-b border-divider dark:border-dark-border">{articulo.extracto}</p>

        <div className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {articulo.contenido || 'Este artículo aún no tiene contenido.'}
        </div>
      </div>
    </div>
  );
}

function ArticuloFormulario({ articulo: inicial, categorias, guardando, onGuardar, onCancelar }: { articulo: ArticuloBlog; categorias: Categoria[]; guardando: boolean; onGuardar: (a: ArticuloBlog) => void; onCancelar: () => void }) {
  const [art, setArt] = useState<ArticuloBlog>({ ...inicial });
  const actualizar = (patch: Partial<ArticuloBlog>) => setArt(prev => ({ ...prev, ...patch }));

  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string | null>(inicial.imagenUrl ?? null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);

  const manejarSeleccionImagen = (archivo: File | null) => {
    setArchivoImagen(archivo);
    setErrorImagen(null);
    setPreviewImagen(archivo ? URL.createObjectURL(archivo) : (inicial.imagenUrl ?? null));
  };

  const manejarGuardar = async () => {
    if (!archivoImagen) {
      onGuardar(art);
      return;
    }
    setSubiendoImagen(true);
    setErrorImagen(null);
    try {
      const imagenUrl = await subirImagenArticulo(archivoImagen);
      console.log('[ArticulosBlog] URL recibida de /api/subir-imagen:', imagenUrl);
      onGuardar({ ...art, imagenUrl });
    } catch (error) {
      setErrorImagen(`No se pudo subir la imagen: ${(error as Error).message}`);
    } finally {
      setSubiendoImagen(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">{inicial.titulo ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
          <button onClick={onCancelar} className="text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Título</label>
              <input value={art.titulo} onChange={e => actualizar({ titulo: e.target.value })} className="input-field" placeholder="Título del artículo" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Categoría</label>
              <select value={art.categoriaId} onChange={e => actualizar({ categoriaId: e.target.value })} className="select-field">
                {categorias.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Imagen</label>
            <div className="flex items-center gap-4">
              {previewImagen ? (
                <img src={previewImagen} alt="Vista previa" className="w-20 h-20 rounded-btn object-cover border border-divider dark:border-dark-border" />
              ) : (
                <div className="w-20 h-20 rounded-btn border border-dashed border-divider dark:border-dark-border flex items-center justify-center text-text-muted dark:text-gray-500">
                  <ImageIcon size={20} />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => manejarSeleccionImagen(e.target.files?.[0] ?? null)}
                  className="block w-full text-xs text-text-muted dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-btn file:border-0 file:text-xs file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90 file:cursor-pointer cursor-pointer"
                />
                {errorImagen && <p className="text-xs text-error mt-1.5">{errorImagen}</p>}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Extracto</label>
            <textarea value={art.extracto} onChange={e => actualizar({ extracto: e.target.value })} className="textarea-field" rows={2} placeholder="Breve descripción para listados..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Contenido</label>
            <textarea value={art.contenido} onChange={e => actualizar({ contenido: e.target.value })} className="textarea-field" rows={6} placeholder="Contenido completo del artículo..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Tiempo de lectura</label>
            <input value={art.tiempoLectura} onChange={e => actualizar({ tiempoLectura: e.target.value })} className="input-field" placeholder="Ej. 5 min" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-divider dark:border-dark-border">
          <button onClick={onCancelar} className="btn-secondary">Cancelar</button>
          <button onClick={manejarGuardar} disabled={guardando || subiendoImagen} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {subiendoImagen ? <><Loader2 size={16} className="animate-spin" /> Subiendo imagen...</> : <><Save size={16} /> Guardar</>}
          </button>
        </div>
      </div>
    </div>
  );
}
