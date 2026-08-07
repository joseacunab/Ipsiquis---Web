import { useState, type FormEvent } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginProps {
  errorPermiso?: string | null;
}

function mensajeError(codigo: string): string {
  switch (codigo) {
    case 'auth/invalid-credential':
    case 'auth/invalid-email':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Probá de nuevo en unos minutos.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Revisá tu internet.';
    default:
      return 'No se pudo iniciar sesión. Intentá de nuevo.';
  }
}

export default function Login({ errorPermiso }: LoginProps) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const manejarEnvio = async (e: FormEvent) => {
    e.preventDefault();
    setErrorEnvio(null);
    setEnviando(true);
    try {
      await signInWithEmailAndPassword(auth, correo, contrasena);
    } catch (error) {
      setErrorEnvio(mensajeError((error as { code?: string }).code ?? ''));
    } finally {
      setEnviando(false);
    }
  };

  const mensaje = errorEnvio ?? errorPermiso ?? null;

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex items-center justify-center p-5">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-btn bg-primary flex items-center justify-center">
            <Heart size={22} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-text-primary dark:text-white">iPsiquis</span>
          <span className="text-sm text-text-muted dark:text-gray-400">Panel de Administración</span>
        </div>

        <form onSubmit={manejarEnvio} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Correo</label>
            <input
              type="email"
              required
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              className="input-field"
              placeholder="tu@correo.com"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Contraseña</label>
            <input
              type="password"
              required
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {mensaje && (
            <div className="px-3 py-2.5 rounded-btn bg-error-light text-error text-sm font-medium">
              {mensaje}
            </div>
          )}

          <button type="submit" disabled={enviando} className="btn-primary w-full flex items-center justify-center gap-2">
            {enviando && <Loader2 size={18} className="animate-spin" />}
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
