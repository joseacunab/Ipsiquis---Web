import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../servicios/firebase';
import type { Test, Ejercicio, ArticuloBlog, PerfilPsicologo, Categoria, LineaEmergencia } from './tipos';

/*
 * Datos de ejemplo para arrancar un proyecto de Firestore vacío. Se escriben
 * una sola vez con sembrarDatosIniciales(), llamado a mano desde el botón
 * "Sembrar datos de ejemplo" del Panel (solo visible si no hay categorías
 * todavía, para no pisar datos reales).
 */

const CATEGORIAS_SEMILLA: Categoria[] = [
  { id: 'ansiedad', titulo: 'Ansiedad', descripcion: 'Pruebas, ejercicios y artículos relacionados con la ansiedad.', icono: 'brain', orden: 1 },
  { id: 'depresion', titulo: 'Depresión', descripcion: 'Pruebas, ejercicios y artículos relacionados con la depresión.', icono: 'frown', orden: 2 },
  { id: 'estres', titulo: 'Estrés', descripcion: 'Pruebas, ejercicios y artículos relacionados con el estrés.', icono: 'zap', orden: 3 },
];

const TESTS_SEMILLA: Test[] = [
  {
    id: 'gad-7', titulo: 'GAD-7: Escala de Ansiedad Generalizada',
    descripcion: 'Evalúa la severidad de los síntomas de ansiedad generalizada durante las últimas 2 semanas.',
    categoriaId: 'ansiedad', duracion: '2-3 min', cantidadItems: 7, autor: 'Ps. Juan M. S', orden: 1,
    preguntas: Array.from({length:7},(_,i)=>({
      texto: `Pregunta ${i+1} sobre ansiedad generalizada`,
      opciones: ['Nunca','Varios días','Más de la mitad de los días','Casi todos los días']
    })),
  },
  {
    id: 'phq-9', titulo: 'PHQ-9: Cuestionario de Salud del Paciente',
    descripcion: 'Herramienta de cribado y diagnóstico para la depresión mayor con 9 ítems.',
    categoriaId: 'depresion', duracion: '2-3 min', cantidadItems: 9, autor: 'Ps. Juan M. S', orden: 2,
    preguntas: Array.from({length:9},(_,i)=>({
      texto: `Pregunta ${i+1} sobre estado de ánimo (PHQ-9)`,
      opciones: ['Nunca','Varios días','Más de la mitad de los días','Casi todos los días']
    })),
  },
  {
    id: 'pss-10', titulo: 'PSS-10: Escala de Estrés Percibido',
    descripcion: '10 ítems para evaluar cuánto las situaciones de la vida se perciben como estresantes.',
    categoriaId: 'estres', duracion: '2-3 min', cantidadItems: 10, autor: 'Ps. Juan M. S', orden: 3,
    preguntas: Array.from({length:10},(_,i)=>({
      texto: `Pregunta ${i+1} sobre estrés percibido`,
      opciones: ['Nunca','Casi nunca','A veces','Frecuentemente','Muy frecuentemente']
    })),
  },
];

const EJERCICIOS_SEMILLA: Ejercicio[] = [
  { id: 'ex-a-01', titulo: 'Respiración Diafragmática', descripcion: 'Técnica de respiración abdominal para activar la relajación parasimpática.', categoriaId: 'ansiedad', duracion: '5 min', autor: 'Ps. Juan M. S', orden: 1, procedimiento: 'Respiración 4-7-8 adaptada para principiantes.\nSiéntate con la espalda recta o acuéstate\nColoca una mano en el pecho y otra en el abdomen\nInhala profundamente por la nariz contando 4 segundos\nMantén la respiración 2 segundos\nExhala lentamente por la boca 6 segundos' },
  { id: 'ex-d-01', titulo: 'Diario de Pensamientos Automáticos', descripcion: 'Registra situaciones, pensamientos y emociones para identificar patrones cognitivos.', categoriaId: 'depresion', duracion: '10 min', autor: 'Ps. Juan M. S', orden: 2, procedimiento: 'Ejercicio de registro cognitivo basado en la TCC.\nIdentifica una situación reciente difícil\nEscribe el pensamiento automático que tuviste\nClasifica la emoción y su intensidad (0-100)\nGenera una respuesta alternativa más balanceada\nReevalúa la intensidad de la emoción' },
  { id: 'ex-s-01', titulo: 'Planificación del Tiempo y Prioridades', descripcion: 'Organiza tu día usando la matriz de Eisenhower para reducir la sobrecarga.', categoriaId: 'estres', duracion: '15 min', autor: 'Ps. Juan M. S', orden: 3, procedimiento: 'Técnica de gestión del tiempo basada en urgencia e importancia.\nLista todas las tareas pendientes\nClasifica cada tarea en la matriz: urgente/importante\nPrioriza: importante+urgente primero\nElimina o delega lo no importante\nProgramea bloques de tiempo para cada categoría' },
];

const ARTICULOS_SEMILLA: ArticuloBlog[] = [
  { id: 'art-01', titulo: 'Entendiendo la Ansiedad: Guía para Pacientes', extracto: 'Descubre qué es la ansiedad, cómo se manifiesta y qué puedes hacer para manejarla.', contenido: 'Artículo completo sobre ansiedad...', categoriaId: 'ansiedad', tiempoLectura: '8 min', orden: 1 },
  { id: 'art-04', titulo: 'Depresión: Señales de Alerta', extracto: 'Aprende a reconocer las señales tempranas de la depresión y cuándo buscar ayuda.', contenido: 'Artículo completo sobre depresión...', categoriaId: 'depresion', tiempoLectura: '7 min', orden: 2 },
  { id: 'art-02', titulo: '5 Estrategias para Dormir Mejor', extracto: 'Consejos prácticos basados en evidencia para mejorar la higiene del sueño.', contenido: 'Artículo completo sobre sueño...', categoriaId: 'estres', tiempoLectura: '5 min', orden: 3 },
];

const LINEAS_EMERGENCIA_SEMILLA: LineaEmergencia[] = [
  { id: 'linea-01', nombre: 'Línea de Prevención del Suicidio', numero: '135', descripcion: 'Atención telefónica gratuita las 24 horas para crisis emocionales.', icono: 'phone', orden: 1 },
  { id: 'linea-02', nombre: 'Emergencias Médicas', numero: '911', descripcion: 'Para situaciones de riesgo inmediato para tu vida o la de otra persona.', icono: 'alertCircle', orden: 2 },
];

const PERFIL_SEMILLA: PerfilPsicologo = {
  id: 'psy-01',
  nombre: 'Juan M. S',
  titulo: 'Psicología Clínica - Trastornos de Ansiedad y Depresión',
  biografia: 'Psicólogo clínico con más de 10 años de experiencia en el tratamiento de trastornos de ansiedad y depresión.',
  insigniaTrayectoria: '10+ años de trayectoria',
  membresias: ['Cédula Profesional de Psicología', 'Miembro de la Asociación Mexicana de Psicología'],
  especializaciones: ['Terapia Cognitivo-Conductual (TCC)', 'Terapia de Aceptación y Compromiso (ACT)'],
  areasIntervencion: ['Ansiedad', 'Depresión'],
  contacto: { email: 'juan.ms@ipsiquis.com', telefono: '+52 55 1234 5678', whatsapp: '+52 55 1234 5678', direccion: '' },
  redesSociales: { sitioWeb: '', instagram: '', youtube: '', linkedin: '' },
  formacion: [{ titulo: 'Licenciatura en Psicología', institucion: 'Universidad Nacional Autónoma de México (UNAM)', ubicacion: 'Ciudad de México', orden: 1 }],
  experiencia: [{ cargo: 'Psicólogo Clínico', organizacion: 'Centro de Salud Mental UNAM', ubicacion: 'Ciudad de México', descripcion: 'Atención clínica individual y grupal.', orden: 1 }],
  proyectos: [],
  createdAt: new Date().toISOString().split('T')[0],
};

export async function firestoreEstaVacio(): Promise<boolean> {
  const snap = await getDocs(collection(db, 'categorias'));
  return snap.empty;
}

export async function sembrarDatosIniciales(): Promise<void> {
  const batch = writeBatch(db);
  CATEGORIAS_SEMILLA.forEach(c => batch.set(doc(db, 'categorias', c.id), c));
  TESTS_SEMILLA.forEach(t => batch.set(doc(db, 'tests', t.id), t));
  EJERCICIOS_SEMILLA.forEach(e => batch.set(doc(db, 'ejercicios', e.id), e));
  ARTICULOS_SEMILLA.forEach(a => batch.set(doc(db, 'articulosBlog', a.id), a));
  LINEAS_EMERGENCIA_SEMILLA.forEach(l => batch.set(doc(db, 'lineasEmergencia', l.id), l));
  batch.set(doc(db, 'perfil', 'principal'), PERFIL_SEMILLA);
  await batch.commit();
}
