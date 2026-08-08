import type { Timestamp } from 'firebase/firestore';

export const NOMBRES_ICONOS = [
  'home', 'clipboardList', 'dumbbell', 'bookOpen', 'userCircle', 'chevronLeft',
  'arrowLeft', 'chevronRight', 'arrowRight', 'clipboardCheck', 'messageCircle',
  'phone', 'award', 'graduationCap', 'briefcase', 'mail', 'mapPin', 'globe',
  'instagram', 'youtube', 'linkedin', 'clock', 'checkCircle', 'check',
  'alertTriangle', 'alertCircle', 'heart', 'users', 'bookmark', 'listOrdered',
  'tag', 'brain', 'frown', 'zap', 'barChart', 'listChecks', 'user', 'x', 'rotateCcw',
  // Temática de psicología / bienestar
  'brainCircuit', 'heartPulse', 'smile', 'meh', 'handHeart', 'heartHandshake',
  'puzzle', 'lightbulb', 'sunrise', 'moon', 'cloudRain', 'waves', 'wind',
  'leaf', 'sprout', 'scale', 'shieldCheck', 'ear', 'footprints', 'bed',
  'coffee', 'notebookPen', 'messageCircleHeart', 'speech', 'activity',
  'sparkles', 'target', 'compass', 'infinity', 'glasses', 'sofa',
] as const;

export type NombreIcono = typeof NOMBRES_ICONOS[number];

export interface Pregunta {
  texto: string;
  opciones: string[];
}

export interface Test {
  id: string;
  titulo: string;
  descripcion: string;
  categoriaId: string;
  duracion: string;
  cantidadItems: number;
  autor: string;
  orden: number;
  preguntas: Pregunta[];
}

export interface Ejercicio {
  id: string;
  titulo: string;
  descripcion: string;
  categoriaId: string;
  duracion: string;
  autor: string;
  procedimiento: string;
  orden: number;
}

export interface ArticuloBlog {
  id: string;
  titulo: string;
  extracto: string;
  contenido: string;
  categoriaId: string;
  tiempoLectura: string;
  orden: number;
  imagenUrl?: string;
}

export interface Categoria {
  id: string;
  titulo: string;
  descripcion: string;
  icono: NombreIcono;
  orden: number;
}

export interface LineaEmergencia {
  id: string;
  nombre: string;
  numero: string;
  descripcion: string;
  icono: NombreIcono;
  orden: number;
}

export interface Paciente {
  id: string;
  nombre: string;
  correo: string;
  dni: string;
  telefono: string | null;
  contrasenaTemporal: boolean;
  activo: boolean;
  creadoEn: Timestamp | null;
}

export interface PerfilPsicologo {
  id: string;
  nombre: string;
  titulo: string;
  biografia: string;
  insigniaTrayectoria: string;
  membresias: string[];
  especializaciones: string[];
  areasIntervencion: string[];
  contacto: {
    email: string;
    telefono: string;
    whatsapp: string;
    direccion: string;
  };
  redesSociales: {
    sitioWeb: string;
    instagram: string;
    youtube: string;
    linkedin: string;
  };
  formacion: { titulo: string; institucion: string; ubicacion: string; orden: number }[];
  experiencia: { cargo: string; organizacion: string; ubicacion: string; descripcion: string; orden: number }[];
  proyectos: { nombre: string; descripcion: string; orden: number }[];
  createdAt: string;
}

export interface ConfiguracionApp {
  tema: 'light' | 'dark';
}

export type Seccion = 'dashboard' | 'categorias' | 'tests' | 'ejercicios' | 'articulosBlog' | 'lineasEmergencia' | 'pacientes' | 'perfil' | 'configuracion';
