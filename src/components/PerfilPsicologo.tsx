import { useState } from 'react';
import { User, Mail, Phone, MapPin, Award, GraduationCap, Briefcase, Globe, Plus, X, Save, CheckCircle, FolderKanban, Sparkles } from 'lucide-react';
import type { PerfilPsicologo } from '../types';
import { IconoInstagram, IconoYoutube, IconoLinkedin } from '../iconos';
import { guardarPerfil } from '../dataLayer';

interface PerfilPsicologoProps {
  perfil: PerfilPsicologo;
  onNotificar: (mensaje: string, tipo: 'success' | 'error') => void;
}

function reordenar<T extends { orden: number }>(lista: T[]): T[] {
  return (lista ?? []).map((item, i) => ({ ...item, orden: i + 1 }));
}

export default function PerfilPsicologoManager({ perfil: inicial, onNotificar }: PerfilPsicologoProps) {
  const [perfil, setPerfil] = useState<PerfilPsicologo>({ ...inicial });
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [tabActiva, setTabActiva] = useState<'personal' | 'profesional' | 'proyectos' | 'redes'>('personal');

  const actualizar = (patch: Partial<PerfilPsicologo>) => setPerfil(prev => ({ ...prev, ...patch }));

  const guardar = async () => {
    const perfilOrdenado: PerfilPsicologo = {
      ...perfil,
      formacion: reordenar(perfil.formacion),
      experiencia: reordenar(perfil.experiencia),
      proyectos: reordenar(perfil.proyectos),
    };
    setGuardando(true);
    try {
      await guardarPerfil(perfilOrdenado);
      setPerfil(perfilOrdenado);
      setEditando(false);
      onNotificar('Perfil actualizado correctamente', 'success');
    } catch (error) {
      onNotificar(`No se pudo guardar el perfil: ${(error as Error).message}`, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const tabs = [
    { key: 'personal' as const, label: 'Personal', icon: User },
    { key: 'profesional' as const, label: 'Profesional', icon: Briefcase },
    { key: 'proyectos' as const, label: 'Proyectos', icon: FolderKanban },
    { key: 'redes' as const, label: 'Redes', icon: Globe },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Mi Perfil Profesional</h1>
          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Gestiona tu información visible para los usuarios de la app.</p>
        </div>
        <div className="flex gap-2">
          {editando ? (
            <>
              <button onClick={() => { setPerfil({ ...inicial }); setEditando(false); }} className="btn-secondary">Cancelar</button>
              <button onClick={guardar} disabled={guardando} className="btn-primary flex items-center gap-2 disabled:opacity-60"><Save size={16} /> Guardar Cambios</button>
            </>
          ) : (
            <button onClick={() => setEditando(true)} className="btn-primary flex items-center gap-2"><EditIcon size={16} /> Editar Perfil</button>
          )}
        </div>
      </div>

      <div className="card p-5 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-surface-alt border-2 border-border overflow-hidden flex items-center justify-center flex-shrink-0 dark:bg-dark-surface-alt dark:border-dark-border">
          <User size={32} className="text-text-muted dark:text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">{perfil.nombre}</h2>
          <p className="text-sm text-accent font-medium">{perfil.titulo}</p>
          {perfil.insigniaTrayectoria && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-accent bg-accent-soft dark:bg-accent/15 dark:text-accent-light px-2 py-0.5 rounded-chip">
              <Sparkles size={10} /> {perfil.insigniaTrayectoria}
            </span>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-muted dark:text-gray-400">
            <span className="flex items-center gap-1"><Mail size={12} /> {perfil.contacto.email}</span>
            <span className="flex items-center gap-1"><Phone size={12} /> {perfil.contacto.telefono}</span>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex gap-1 border-b border-divider dark:border-dark-border px-4 pt-3 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setTabActiva(tab.key)} className={`tab-btn flex items-center gap-1.5 whitespace-nowrap ${tabActiva === tab.key ? 'active' : 'inactive'}`}>
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
        <div className="p-5">
          {tabActiva === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Nombre</label>
                  <input value={perfil.nombre} onChange={e => actualizar({ nombre: e.target.value })} disabled={!editando} className="input-field disabled:bg-surface-alt disabled:text-text-muted dark:disabled:bg-dark-surface-alt dark:disabled:text-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Título</label>
                  <input value={perfil.titulo} onChange={e => actualizar({ titulo: e.target.value })} disabled={!editando} className="input-field disabled:bg-surface-alt disabled:text-text-muted dark:disabled:bg-dark-surface-alt dark:disabled:text-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Insignia de trayectoria</label>
                  <input value={perfil.insigniaTrayectoria} onChange={e => actualizar({ insigniaTrayectoria: e.target.value })} disabled={!editando} className="input-field disabled:bg-surface-alt disabled:text-text-muted dark:disabled:bg-dark-surface-alt dark:disabled:text-gray-500" placeholder="Ej. 25+ años de trayectoria" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Email</label>
                  <input value={perfil.contacto.email} onChange={e => actualizar({ contacto: { ...perfil.contacto, email: e.target.value } })} disabled={!editando} className="input-field disabled:bg-surface-alt disabled:text-text-muted dark:disabled:bg-dark-surface-alt dark:disabled:text-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Teléfono</label>
                  <input value={perfil.contacto.telefono} onChange={e => actualizar({ contacto: { ...perfil.contacto, telefono: e.target.value } })} disabled={!editando} className="input-field disabled:bg-surface-alt disabled:text-text-muted dark:disabled:bg-dark-surface-alt dark:disabled:text-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">WhatsApp</label>
                  <input value={perfil.contacto.whatsapp} onChange={e => actualizar({ contacto: { ...perfil.contacto, whatsapp: e.target.value } })} disabled={!editando} className="input-field disabled:bg-surface-alt disabled:text-text-muted dark:disabled:bg-dark-surface-alt dark:disabled:text-gray-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Dirección</label>
                  <input value={perfil.contacto.direccion} onChange={e => actualizar({ contacto: { ...perfil.contacto, direccion: e.target.value } })} disabled={!editando} className="input-field disabled:bg-surface-alt disabled:text-text-muted dark:disabled:bg-dark-surface-alt dark:disabled:text-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Biografía</label>
                <textarea value={perfil.biografia} onChange={e => actualizar({ biografia: e.target.value })} disabled={!editando} className="textarea-field disabled:bg-surface-alt disabled:text-text-muted dark:disabled:bg-dark-surface-alt dark:disabled:text-gray-500" rows={4} />
              </div>
              <ListaDeChips
                titulo="Especializaciones"
                items={perfil.especializaciones}
                editando={editando}
                placeholder="+ Especialización"
                onCambiar={especializaciones => actualizar({ especializaciones })}
              />
              <ListaDeChips
                titulo="Áreas de intervención"
                items={perfil.areasIntervencion}
                editando={editando}
                placeholder="+ Área"
                onCambiar={areasIntervencion => actualizar({ areasIntervencion })}
              />
            </div>
          )}

          {tabActiva === 'profesional' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wide">Membresías</span>
                  {editando && <button onClick={() => actualizar({ membresias: [...perfil.membresias, ''] })} className="text-xs text-accent hover:text-primary-dark dark:hover:text-accent-light font-medium flex items-center gap-1"><Plus size={12} /> Agregar</button>}
                </div>
                <div className="space-y-2">
                  {perfil.membresias.map((membresia, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Award size={16} className="text-accent flex-shrink-0" />
                      {editando ? (
                        <input value={membresia} onChange={e => { const m = [...perfil.membresias]; m[i] = e.target.value; actualizar({ membresias: m }); }} className="input-field text-sm py-2 flex-1" />
                      ) : (
                        <span className="text-sm text-text-primary dark:text-white">{membresia}</span>
                      )}
                      {editando && <button onClick={() => actualizar({ membresias: perfil.membresias.filter((_, idx) => idx !== i) })} className="text-error hover:text-red-700"><X size={14} /></button>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wide">Formación</span>
                  {editando && <button onClick={() => actualizar({ formacion: [...perfil.formacion, { titulo: '', institucion: '', ubicacion: '', orden: perfil.formacion.length + 1 }] })} className="text-xs text-accent hover:text-primary-dark dark:hover:text-accent-light font-medium flex items-center gap-1"><Plus size={12} /> Agregar formación</button>}
                </div>
                <div className="space-y-3">
                  {perfil.formacion.map((item, i) => (
                    <div key={i} className="border border-border rounded-btn p-4 bg-surface-alt/30 dark:border-dark-border dark:bg-dark-surface-alt/30">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-text-muted dark:text-gray-400 flex items-center gap-1"><GraduationCap size={12} /> Título</label>
                          <input value={item.titulo} onChange={e => { const f = [...perfil.formacion]; f[i] = { ...f[i], titulo: e.target.value }; actualizar({ formacion: f }); }} disabled={!editando} className="input-field text-sm py-2 mt-1 disabled:bg-surface-alt dark:disabled:bg-dark-surface-alt" />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted dark:text-gray-400">Institución</label>
                          <input value={item.institucion} onChange={e => { const f = [...perfil.formacion]; f[i] = { ...f[i], institucion: e.target.value }; actualizar({ formacion: f }); }} disabled={!editando} className="input-field text-sm py-2 mt-1 disabled:bg-surface-alt dark:disabled:bg-dark-surface-alt" />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted dark:text-gray-400 flex items-center gap-1"><MapPin size={12} /> Ubicación</label>
                          <input value={item.ubicacion} onChange={e => { const f = [...perfil.formacion]; f[i] = { ...f[i], ubicacion: e.target.value }; actualizar({ formacion: f }); }} disabled={!editando} className="input-field text-sm py-2 mt-1 disabled:bg-surface-alt dark:disabled:bg-dark-surface-alt" />
                        </div>
                      </div>
                      {editando && <button onClick={() => actualizar({ formacion: perfil.formacion.filter((_, idx) => idx !== i) })} className="text-error text-xs mt-2 flex items-center gap-1"><X size={12} /> Eliminar</button>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wide">Experiencia</span>
                  {editando && <button onClick={() => actualizar({ experiencia: [...perfil.experiencia, { cargo: '', organizacion: '', ubicacion: '', descripcion: '', orden: perfil.experiencia.length + 1 }] })} className="text-xs text-accent hover:text-primary-dark dark:hover:text-accent-light font-medium flex items-center gap-1"><Plus size={12} /> Agregar experiencia</button>}
                </div>
                <div className="space-y-3">
                  {perfil.experiencia.map((item, i) => (
                    <div key={i} className="border border-border rounded-btn p-4 bg-surface-alt/30 dark:border-dark-border dark:bg-dark-surface-alt/30">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-text-muted dark:text-gray-400">Cargo</label>
                          <input value={item.cargo} onChange={e => { const x = [...perfil.experiencia]; x[i] = { ...x[i], cargo: e.target.value }; actualizar({ experiencia: x }); }} disabled={!editando} className="input-field text-sm py-2 mt-1 disabled:bg-surface-alt dark:disabled:bg-dark-surface-alt" />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted dark:text-gray-400">Organización</label>
                          <input value={item.organizacion} onChange={e => { const x = [...perfil.experiencia]; x[i] = { ...x[i], organizacion: e.target.value }; actualizar({ experiencia: x }); }} disabled={!editando} className="input-field text-sm py-2 mt-1 disabled:bg-surface-alt dark:disabled:bg-dark-surface-alt" />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted dark:text-gray-400 flex items-center gap-1"><MapPin size={12} /> Ubicación</label>
                          <input value={item.ubicacion} onChange={e => { const x = [...perfil.experiencia]; x[i] = { ...x[i], ubicacion: e.target.value }; actualizar({ experiencia: x }); }} disabled={!editando} className="input-field text-sm py-2 mt-1 disabled:bg-surface-alt dark:disabled:bg-dark-surface-alt" placeholder="Opcional" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="text-xs text-text-muted dark:text-gray-400">Descripción</label>
                        <textarea value={item.descripcion} onChange={e => { const x = [...perfil.experiencia]; x[i] = { ...x[i], descripcion: e.target.value }; actualizar({ experiencia: x }); }} disabled={!editando} className="textarea-field text-sm mt-1 disabled:bg-surface-alt dark:disabled:bg-dark-surface-alt" rows={2} />
                      </div>
                      {editando && <button onClick={() => actualizar({ experiencia: perfil.experiencia.filter((_, idx) => idx !== i) })} className="text-error text-xs mt-2 flex items-center gap-1"><X size={12} /> Eliminar</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tabActiva === 'proyectos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wide">Proyectos</span>
                {editando && <button onClick={() => actualizar({ proyectos: [...perfil.proyectos, { nombre: '', descripcion: '', orden: perfil.proyectos.length + 1 }] })} className="text-xs text-accent hover:text-primary-dark dark:hover:text-accent-light font-medium flex items-center gap-1"><Plus size={12} /> Agregar proyecto</button>}
              </div>
              {perfil.proyectos.map((proyecto, i) => (
                <div key={i} className="border border-border rounded-btn p-4 bg-surface-alt/30 dark:border-dark-border dark:bg-dark-surface-alt/30">
                  <div>
                    <label className="text-xs text-text-muted dark:text-gray-400">Nombre</label>
                    <input value={proyecto.nombre} onChange={e => { const p = [...perfil.proyectos]; p[i] = { ...p[i], nombre: e.target.value }; actualizar({ proyectos: p }); }} disabled={!editando} className="input-field text-sm py-2 mt-1 disabled:bg-surface-alt dark:disabled:bg-dark-surface-alt" />
                  </div>
                  <div className="mt-2">
                    <label className="text-xs text-text-muted dark:text-gray-400">Descripción</label>
                    <textarea value={proyecto.descripcion} onChange={e => { const p = [...perfil.proyectos]; p[i] = { ...p[i], descripcion: e.target.value }; actualizar({ proyectos: p }); }} disabled={!editando} className="textarea-field text-sm mt-1 disabled:bg-surface-alt dark:disabled:bg-dark-surface-alt" rows={2} />
                  </div>
                  {editando && <button onClick={() => actualizar({ proyectos: perfil.proyectos.filter((_, idx) => idx !== i) })} className="text-error text-xs mt-2 flex items-center gap-1"><X size={12} /> Eliminar</button>}
                </div>
              ))}
              {perfil.proyectos.length === 0 && !editando && (
                <p className="text-sm text-text-muted dark:text-gray-500">Todavía no hay proyectos cargados.</p>
              )}
            </div>
          )}

          {tabActiva === 'redes' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5 flex items-center gap-1.5"><Globe size={12} /> Sitio web</label>
                <input value={perfil.redesSociales.sitioWeb} onChange={e => actualizar({ redesSociales: { ...perfil.redesSociales, sitioWeb: e.target.value } })} disabled={!editando} className="input-field disabled:bg-surface-alt disabled:text-text-muted dark:disabled:bg-dark-surface-alt dark:disabled:text-gray-500" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5 flex items-center gap-1.5"><IconoInstagram size={12} /> Instagram</label>
                <input value={perfil.redesSociales.instagram} onChange={e => actualizar({ redesSociales: { ...perfil.redesSociales, instagram: e.target.value } })} disabled={!editando} className="input-field disabled:bg-surface-alt disabled:text-text-muted dark:disabled:bg-dark-surface-alt dark:disabled:text-gray-500" placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5 flex items-center gap-1.5"><IconoYoutube size={12} /> YouTube</label>
                <input value={perfil.redesSociales.youtube} onChange={e => actualizar({ redesSociales: { ...perfil.redesSociales, youtube: e.target.value } })} disabled={!editando} className="input-field disabled:bg-surface-alt disabled:text-text-muted dark:disabled:bg-dark-surface-alt dark:disabled:text-gray-500" placeholder="https://youtube.com/..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5 flex items-center gap-1.5"><IconoLinkedin size={12} /> LinkedIn</label>
                <input value={perfil.redesSociales.linkedin} onChange={e => actualizar({ redesSociales: { ...perfil.redesSociales, linkedin: e.target.value } })} disabled={!editando} className="input-field disabled:bg-surface-alt disabled:text-text-muted dark:disabled:bg-dark-surface-alt dark:disabled:text-gray-500" placeholder="https://linkedin.com/in/..." />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ListaDeChips({ titulo, items, editando, placeholder, onCambiar }: { titulo: string; items: string[]; editando: boolean; placeholder: string; onCambiar: (items: string[]) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">{titulo}</label>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="text-xs font-medium bg-accent-soft text-accent dark:bg-accent/15 dark:text-accent-light px-2.5 py-1 rounded-chip flex items-center gap-1">
            <CheckCircle size={10} /> {item}
            {editando && <button onClick={() => onCambiar(items.filter((_, idx) => idx !== i))} className="hover:text-primary-dark dark:hover:text-accent-light"><X size={10} /></button>}
          </span>
        ))}
        {editando && (
          <input
            className="input-field w-40 py-1.5 text-xs"
            placeholder={placeholder}
            onKeyDown={e => {
              const valor = (e.target as HTMLInputElement).value.trim();
              if (e.key === 'Enter' && valor) {
                onCambiar([...items, valor]);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

function EditIcon({ size, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
