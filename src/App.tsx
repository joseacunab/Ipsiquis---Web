import { useState, useCallback, useEffect } from 'react';
import { Menu, Bell, Search, Sun, Moon, Loader2 } from 'lucide-react';
import type { Seccion, Test, Ejercicio, ArticuloBlog, PerfilPsicologo, Categoria, LineaEmergencia, Paciente, ConfiguracionApp } from './modelos/tipos';
import {
  suscribirCategorias, suscribirTests, suscribirEjercicios, suscribirArticulos,
  suscribirLineasEmergencia, suscribirPacientes, suscribirPerfil, suscribirConfiguracionApp,
} from './servicios/firestore';
import { useTema } from './hooks/useTema';
import { useAdminAuth } from './hooks/useAdminAuth';
import PantallaLogin from './pantallas/PantallaLogin';
import BarraLateral from './componentes/BarraLateral';
import PantallaDashboard from './pantallas/PantallaDashboard';
import PantallaCategorias from './pantallas/PantallaCategorias';
import PantallaTests from './pantallas/PantallaTests';
import PantallaEjercicios from './pantallas/PantallaEjercicios';
import PantallaArticulosBlog from './pantallas/PantallaArticulosBlog';
import PantallaLineasEmergencia from './pantallas/PantallaLineasEmergencia';
import PantallaPacientes from './pantallas/PantallaPacientes';
import PantallaPerfil from './pantallas/PantallaPerfil';
import PantallaConfiguracion from './pantallas/PantallaConfiguracion';
import Notificacion, { type ItemNotificacion } from './componentes/Notificacion';
import ModalConfirmacion from './componentes/ModalConfirmacion';

function App() {
  const { tema, alternarTema } = useTema();
  const { estado, errorPermiso, cerrarSesion } = useAdminAuth();
  const [seccion, setSeccion] = useState<Seccion>('dashboard');
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  const [notificaciones, setNotificaciones] = useState<ItemNotificacion[]>([]);
  const [confirmacion, setConfirmacion] = useState<{ titulo: string; mensaje: string; textoConfirmar?: string; textoCancelar?: string; peligroso?: boolean; onConfirmar: () => void; onCancelar: () => void } | null>(null);

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

  const mostrarNotificacion = useCallback((mensaje: string, tipo: ItemNotificacion['tipo']) => {
    const id = Math.random().toString(36).slice(2, 9);
    setNotificaciones(prev => [...prev, { id, mensaje, tipo }]);
  }, []);

  const descartarNotificacion = useCallback((id: string) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  }, []);

  const mostrarConfirmacion = useCallback((opts: { titulo: string; mensaje: string; onConfirmar: () => void; peligroso?: boolean }) => {
    setConfirmacion({
      titulo: opts.titulo,
      mensaje: opts.mensaje,
      peligroso: opts.peligroso,
      onCancelar: () => setConfirmacion(null),
      onConfirmar: () => { opts.onConfirmar(); setConfirmacion(null); },
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
    return <PantallaLogin errorPermiso={errorPermiso} />;
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
      <BarraLateral activa={seccion} onCambiar={setSeccion} colapsado={sidebarColapsado} onCerrarSesion={cerrarSesion} />

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
              onClick={alternarTema}
              className="p-2 rounded-btn hover:bg-surface-alt text-text-muted hover:text-text-primary dark:hover:bg-dark-surface-alt dark:text-gray-400 dark:hover:text-white transition-colors"
              title={tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {tema === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
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
            <PantallaDashboard
              categorias={categorias} tests={tests} ejercicios={ejercicios} articulos={articulos}
              lineasEmergencia={lineasEmergencia} pacientes={pacientes} onNavegar={setSeccion}
              onNotificar={mostrarNotificacion}
            />
          )}
          {seccion === 'categorias' && (
            <PantallaCategorias categorias={categorias} onNotificar={mostrarNotificacion} onConfirmar={mostrarConfirmacion} />
          )}
          {seccion === 'tests' && (
            <PantallaTests tests={tests} categorias={categorias} onNotificar={mostrarNotificacion} onConfirmar={mostrarConfirmacion} />
          )}
          {seccion === 'ejercicios' && (
            <PantallaEjercicios ejercicios={ejercicios} categorias={categorias} onNotificar={mostrarNotificacion} onConfirmar={mostrarConfirmacion} />
          )}
          {seccion === 'articulosBlog' && (
            <PantallaArticulosBlog articulos={articulos} categorias={categorias} onNotificar={mostrarNotificacion} onConfirmar={mostrarConfirmacion} />
          )}
          {seccion === 'lineasEmergencia' && (
            <PantallaLineasEmergencia lineas={lineasEmergencia} onNotificar={mostrarNotificacion} onConfirmar={mostrarConfirmacion} />
          )}
          {seccion === 'pacientes' && (
            <PantallaPacientes pacientes={pacientes} onNotificar={mostrarNotificacion} onConfirmar={mostrarConfirmacion} />
          )}
          {seccion === 'perfil' && perfil && (
            <PantallaPerfil perfil={perfil} onNotificar={mostrarNotificacion} />
          )}
          {seccion === 'configuracion' && (
            <PantallaConfiguracion configuracion={configuracionApp} onNotificar={mostrarNotificacion} />
          )}
        </main>
      </div>

      {/* Overlays globales */}
      <Notificacion notificaciones={notificaciones} onDescartar={descartarNotificacion} />
      {confirmacion && (
        <ModalConfirmacion
          titulo={confirmacion.titulo}
          mensaje={confirmacion.mensaje}
          textoConfirmar={confirmacion.textoConfirmar}
          textoCancelar={confirmacion.textoCancelar}
          peligroso={confirmacion.peligroso}
          onConfirmar={confirmacion.onConfirmar}
          onCancelar={confirmacion.onCancelar}
        />
      )}
    </div>
  );
}

export default App;
