import { useState, useCallback, useEffect } from 'react';
import { Menu, Bell, Search, Sun, Moon, Loader2 } from 'lucide-react';
import type { Seccion, Test, Ejercicio, ArticuloBlog, PerfilPsicologo, Categoria, LineaEmergencia, Paciente, ConfiguracionApp } from './types';
import {
  suscribirCategorias, suscribirTests, suscribirEjercicios, suscribirArticulos,
  suscribirLineasEmergencia, suscribirPacientes, suscribirPerfil, suscribirConfiguracionApp,
} from './dataLayer';
import { useTheme } from './hooks/useTheme';
import { useAdminAuth } from './hooks/useAdminAuth';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CategoriasManager from './components/CategoriasManager';
import TestsManager from './components/TestsManager';
import ExercisesManager from './components/ExercisesManager';
import ArticulosBlogManager from './components/ArticulosBlogManager';
import LineasEmergenciaManager from './components/LineasEmergenciaManager';
import PacientesManager from './components/PacientesManager';
import PerfilPsicologoManager from './components/PerfilPsicologo';
import ConfiguracionManager from './components/ConfiguracionManager';
import Toast, { type ToastItem } from './components/Toast';
import ConfirmModal from './components/ConfirmModal';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { estado, errorPermiso, cerrarSesion } = useAdminAuth();
  const [seccion, setSeccion] = useState<Seccion>('dashboard');
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmacion, setConfirmacion] = useState<{ title: string; message: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void } | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [articulos, setArticulos] = useState<ArticuloBlog[]>([]);
  const [lineasEmergencia, setLineasEmergencia] = useState<LineaEmergencia[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [perfil, setPerfil] = useState<PerfilPsicologo | null>(null);
  const [configuracionApp, setConfiguracionApp] = useState<ConfiguracionApp | null>(null);

  // Cada colección tiene su propia bandera: la app no se muestra hasta que
  // TODAS terminaron su primera carga (evita filtrar/renderizar con datos
  // parciales cuando categorías y la entidad correspondiente llegan en
  // momentos distintos, ya que los fetches de Firestore corren en paralelo
  // sin garantía de orden).
  const [cargas, setCargas] = useState({
    categorias: false, tests: false, ejercicios: false, articulos: false,
    lineasEmergencia: false, pacientes: false, perfil: false, configuracionApp: false,
  });
  const marcarCargado = useCallback((clave: keyof typeof cargas) => {
    setCargas(prev => prev[clave] ? prev : { ...prev, [clave]: true });
  }, []);
  const cargando = Object.values(cargas).some(c => !c);

  const mostrarNotificacion = useCallback((mensaje: string, tipo: ToastItem['type']) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message: mensaje, type: tipo }]);
  }, []);

  const descartarNotificacion = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const mostrarConfirmacion = useCallback((opts: { titulo: string; mensaje: string; onConfirmar: () => void; peligroso?: boolean }) => {
    setConfirmacion({
      title: opts.titulo,
      message: opts.mensaje,
      danger: opts.peligroso,
      onCancel: () => setConfirmacion(null),
      onConfirm: () => { opts.onConfirmar(); setConfirmacion(null); },
    });
  }, []);

  useEffect(() => {
    if (estado !== 'autorizado') return;
    const alError = (nombre: string, clave: keyof typeof cargas) => (error: Error) => {
      mostrarNotificacion(`Error al cargar ${nombre}: ${error.message}`, 'error');
      marcarCargado(clave);
    };
    const bajas = [
      suscribirCategorias(items => { setCategorias(items); marcarCargado('categorias'); }, alError('categorías', 'categorias')),
      suscribirTests(items => { setTests(items); marcarCargado('tests'); }, alError('pruebas', 'tests')),
      suscribirEjercicios(items => { setEjercicios(items); marcarCargado('ejercicios'); }, alError('ejercicios', 'ejercicios')),
      suscribirArticulos(items => { setArticulos(items); marcarCargado('articulos'); }, alError('artículos', 'articulos')),
      suscribirLineasEmergencia(items => { setLineasEmergencia(items); marcarCargado('lineasEmergencia'); }, alError('líneas de emergencia', 'lineasEmergencia')),
      suscribirPacientes(items => { setPacientes(items); marcarCargado('pacientes'); }, alError('pacientes', 'pacientes')),
      suscribirPerfil(item => { setPerfil(item); marcarCargado('perfil'); }, alError('el perfil', 'perfil')),
      suscribirConfiguracionApp(item => { setConfiguracionApp(item); marcarCargado('configuracionApp'); }, alError('la configuración', 'configuracionApp')),
    ];
    return () => bajas.forEach(baja => baja());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  useEffect(() => {
    const alRedimensionar = () => { if (window.innerWidth < 768) setSidebarColapsado(true); else setSidebarColapsado(false); };
    alRedimensionar();
    window.addEventListener('resize', alRedimensionar);
    return () => window.removeEventListener('resize', alRedimensionar);
  }, []);

  const anchoSidebar = sidebarColapsado ? 80 : 256;

  const tituloPagina: Record<Seccion, string> = {
    dashboard: 'Panel',
    categorias: 'Categorías',
    tests: 'Pruebas Psicométricas',
    ejercicios: 'Ejercicios Terapéuticos',
    articulosBlog: 'Artículos de Blog',
    lineasEmergencia: 'Líneas de Emergencia',
    pacientes: 'Pacientes',
    perfil: 'Mi Perfil Profesional',
    configuracion: 'Configuración',
  };

  if (estado === 'verificando') {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-muted dark:text-gray-400">
          <Loader2 size={32} className="animate-spin text-accent" />
          <span className="text-sm font-medium">Verificando sesión...</span>
        </div>
      </div>
    );
  }

  if (estado === 'sinSesion') {
    return <Login errorPermiso={errorPermiso} />;
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-muted dark:text-gray-400">
          <Loader2 size={32} className="animate-spin text-accent" />
          <span className="text-sm font-medium">Cargando datos desde Firestore...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex">
      <Sidebar activa={seccion} onCambiar={setSeccion} colapsado={sidebarColapsado} onCerrarSesion={cerrarSesion} />

      <div className="flex-1 flex flex-col transition-all duration-300" style={{ marginLeft: anchoSidebar }}>
        {/* Encabezado */}
        <header className="h-16 bg-surface dark:bg-dark-surface border-b border-divider dark:border-dark-border flex items-center justify-between px-5 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarColapsado(!sidebarColapsado)} className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors md:hidden">
              <Menu size={20} />
            </button>
            <span className="font-semibold text-sm text-text-primary dark:text-white hidden md:inline">{tituloPagina[seccion]}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
              <input className="pl-9 pr-3 py-2 rounded-btn bg-surface-alt text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 w-56 transition-all dark:bg-dark-surface-alt dark:text-white dark:placeholder:text-gray-500" placeholder="Buscar en el panel..." />
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="relative p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary overflow-hidden flex items-center justify-center border-2 border-accent/20">
              <span className="text-xs font-bold text-white">JM</span>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-5 md:p-6">
          {seccion === 'dashboard' && (
            <Dashboard
              categorias={categorias} tests={tests} ejercicios={ejercicios} articulos={articulos}
              lineasEmergencia={lineasEmergencia} pacientes={pacientes} onNavegar={setSeccion}
              onNotificar={mostrarNotificacion}
            />
          )}
          {seccion === 'categorias' && (
            <CategoriasManager categorias={categorias} onNotificar={mostrarNotificacion} onConfirmar={mostrarConfirmacion} />
          )}
          {seccion === 'tests' && (
            <TestsManager tests={tests} categorias={categorias} onNotificar={mostrarNotificacion} onConfirmar={mostrarConfirmacion} />
          )}
          {seccion === 'ejercicios' && (
            <ExercisesManager ejercicios={ejercicios} categorias={categorias} onNotificar={mostrarNotificacion} onConfirmar={mostrarConfirmacion} />
          )}
          {seccion === 'articulosBlog' && (
            <ArticulosBlogManager articulos={articulos} categorias={categorias} onNotificar={mostrarNotificacion} onConfirmar={mostrarConfirmacion} />
          )}
          {seccion === 'lineasEmergencia' && (
            <LineasEmergenciaManager lineas={lineasEmergencia} onNotificar={mostrarNotificacion} onConfirmar={mostrarConfirmacion} />
          )}
          {seccion === 'pacientes' && (
            <PacientesManager pacientes={pacientes} onNotificar={mostrarNotificacion} onConfirmar={mostrarConfirmacion} />
          )}
          {seccion === 'perfil' && perfil && (
            <PerfilPsicologoManager perfil={perfil} onNotificar={mostrarNotificacion} />
          )}
          {seccion === 'configuracion' && (
            <ConfiguracionManager configuracion={configuracionApp} onNotificar={mostrarNotificacion} />
          )}
        </main>
      </div>

      {/* Overlays globales */}
      <Toast toasts={toasts} onDismiss={descartarNotificacion} />
      {confirmacion && (
        <ConfirmModal
          title={confirmacion.title}
          message={confirmacion.message}
          confirmLabel={confirmacion.confirmLabel}
          cancelLabel={confirmacion.cancelLabel}
          danger={confirmacion.danger}
          onConfirm={confirmacion.onConfirm}
          onCancel={confirmacion.onCancel}
        />
      )}
    </div>
  );
}

export default App;
