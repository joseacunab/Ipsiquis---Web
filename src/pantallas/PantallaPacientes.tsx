import { useState, useMemo } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Plus, Search, Edit2, Trash2, X, Save, Users, Mail, Phone, IdCard } from 'lucide-react';
import type { Paciente } from '../modelos/tipos';
import { crearPaciente, actualizarPaciente, eliminarPaciente } from '../servicios/firestore';
import { formatearFecha } from '../utilidades/ayudantes';

interface PantallaPacientesProps {
  pacientes: Paciente[];
  onNotificar: (mensaje: string, tipo: 'success' | 'error') => void;
  onConfirmar: (opts: { titulo: string; mensaje: string; onConfirmar: () => void; peligroso?: boolean }) => void;
}

function generarId() { return 'pac-' + Math.random().toString(36).slice(2, 9); }

export default function PantallaPacientes({ pacientes, onNotificar, onConfirmar }: PantallaPacientesProps) {
  const [busqueda, setBusqueda] = useState('');
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Paciente | null>(null);
  const [guardando, setGuardando] = useState(false);

  const filtrados = useMemo(() => pacientes.filter(p =>
    (p.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.correo ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.dni ?? '').toLowerCase().includes(busqueda.toLowerCase())
  ), [pacientes, busqueda]);

  const crearPacienteHandler = async (datos: { nombre: string; correo: string; dni: string; telefono: string }) => {
    // TODO: esto debería llamar a la Cloud Function `crearPaciente` (crea la
    // cuenta en Firebase Auth con el UID como id del doc y devuelve una
    // contraseña temporal) en vez de guardar el documento directo acá.
    const nuevo: Paciente = {
      id: generarId(),
      nombre: datos.nombre,
      correo: datos.correo,
      dni: datos.dni,
      telefono: datos.telefono || null,
      contrasenaTemporal: false,
      activo: true,
      creadoEn: Timestamp.now(),
    };
    setGuardando(true);
    try {
      await crearPaciente(nuevo);
      setCreando(false);
      onNotificar('Paciente creado', 'success');
    } catch (error) {
      onNotificar(`No se pudo crear el paciente: ${(error as Error).message}`, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async (patch: { nombre: string; telefono: string | null; activo: boolean }) => {
    if (!editando) return;
    const actualizado: Paciente = { ...editando, ...patch };
    setGuardando(true);
    try {
      await actualizarPaciente(actualizado);
      setEditando(null);
      onNotificar('Paciente actualizado', 'success');
    } catch (error) {
      onNotificar(`No se pudo actualizar el paciente: ${(error as Error).message}`, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPacienteHandler = (id: string) => {
    onConfirmar({
      titulo: 'Eliminar paciente',
      mensaje: '¿Estás seguro? Esta acción no se puede deshacer.',
      peligroso: true,
      onConfirmar: async () => {
        try {
          await eliminarPaciente(id);
          onNotificar('Paciente eliminado', 'success');
        } catch (error) {
          onNotificar(`No se pudo eliminar el paciente: ${(error as Error).message}`, 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Pacientes</h1>
          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Gestiona los pacientes registrados en la app.</p>
        </div>
        <button onClick={() => setCreando(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nuevo Paciente
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre, correo o DNI..." className="input-field pl-10" />
        </div>
      </div>

      {creando && (
        <PacienteFormularioCreacion guardando={guardando} onGuardar={crearPacienteHandler} onCancelar={() => setCreando(false)} />
      )}
      {editando && (
        <PacienteFormularioEdicion paciente={editando} guardando={guardando} onGuardar={guardarEdicion} onCancelar={() => setEditando(null)} />
      )}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider dark:border-dark-border text-left">
                <th className="px-4 py-3 text-xs font-semibold text-text-muted dark:text-gray-400 uppercase">Nombre</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted dark:text-gray-400 uppercase">Correo</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted dark:text-gray-400 uppercase">DNI</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted dark:text-gray-400 uppercase">Teléfono</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted dark:text-gray-400 uppercase">Activo</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted dark:text-gray-400 uppercase">Fecha de alta</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} className="border-b border-divider dark:border-dark-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text-primary dark:text-white">{p.nombre}</td>
                  <td className="px-4 py-3 text-text-secondary dark:text-gray-300 flex items-center gap-1.5"><Mail size={12} className="text-text-muted dark:text-gray-500" /> {p.correo}</td>
                  <td className="px-4 py-3 text-text-secondary dark:text-gray-300">{p.dni}</td>
                  <td className="px-4 py-3 text-text-secondary dark:text-gray-300">{p.telefono || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-chip ${p.activo ? 'bg-success-light text-success dark:bg-success/15' : 'bg-error-light text-error dark:bg-error/15'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted dark:text-gray-400">{formatearFecha(p.creadoEn)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setEditando(p)} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors" title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => eliminarPacienteHandler(p.id)} className="p-2 rounded-btn hover:bg-error-light text-text-muted hover:text-error dark:text-gray-400 dark:hover:bg-error/15 transition-colors" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && (
            <div className="text-center py-12 text-text-muted dark:text-gray-500">
              <Users size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No se encontraron pacientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PacienteFormularioCreacion({ guardando, onGuardar, onCancelar }: { guardando: boolean; onGuardar: (datos: { nombre: string; correo: string; dni: string; telefono: string }) => void; onCancelar: () => void }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');

  const puedeGuardar = nombre.trim() && correo.trim() && dni.trim() && !guardando;

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">Nuevo Paciente</h2>
          <button onClick={onCancelar} className="text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} className="input-field" placeholder="Nombre completo" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Correo</label>
            <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} className="input-field" placeholder="correo@ejemplo.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">DNI</label>
            <input value={dni} onChange={e => setDni(e.target.value)} className="input-field" placeholder="DNI" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Teléfono (opcional)</label>
            <input value={telefono} onChange={e => setTelefono(e.target.value)} className="input-field" placeholder="Teléfono" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-divider dark:border-dark-border">
          <button onClick={onCancelar} className="btn-secondary">Cancelar</button>
          <button disabled={!puedeGuardar} onClick={() => onGuardar({ nombre: nombre.trim(), correo: correo.trim(), dni: dni.trim(), telefono: telefono.trim() })} className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"><Save size={16} /> Guardar</button>
        </div>
      </div>
    </div>
  );
}

function PacienteFormularioEdicion({ paciente, guardando, onGuardar, onCancelar }: { paciente: Paciente; guardando: boolean; onGuardar: (patch: { nombre: string; telefono: string | null; activo: boolean }) => void; onCancelar: () => void }) {
  const [nombre, setNombre] = useState(paciente.nombre);
  const [telefono, setTelefono] = useState(paciente.telefono ?? '');
  const [activo, setActivo] = useState(paciente.activo);

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">Editar Paciente</h2>
          <button onClick={onCancelar} className="text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs text-text-muted dark:text-gray-400">
            <span className="flex items-center gap-1"><Mail size={12} /> {paciente.correo}</span>
            <span className="flex items-center gap-1"><IdCard size={12} /> {paciente.dni}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase mb-1.5">Teléfono</label>
            <input value={telefono} onChange={e => setTelefono(e.target.value)} className="input-field" placeholder="Teléfono" />
          </div>
          <div className="flex items-center justify-between border border-border rounded-btn p-3 dark:border-dark-border">
            <span className="text-sm font-medium text-text-primary dark:text-white flex items-center gap-2"><Phone size={14} className="text-text-muted dark:text-gray-400" /> Paciente activo</span>
            <button onClick={() => setActivo(a => !a)} className={`w-11 h-6 rounded-full transition-colors relative ${activo ? 'bg-success' : 'bg-border dark:bg-dark-border'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${activo ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-divider dark:border-dark-border">
          <button onClick={onCancelar} className="btn-secondary">Cancelar</button>
          <button onClick={() => onGuardar({ nombre: nombre.trim(), telefono: telefono.trim() || null, activo })} disabled={guardando} className="btn-primary flex items-center gap-2 disabled:opacity-60"><Save size={16} /> Guardar</button>
        </div>
      </div>
    </div>
  );
}
