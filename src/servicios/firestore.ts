import {
  collection, doc, onSnapshot, orderBy, query, setDoc, deleteDoc, writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Test, Ejercicio, ArticuloBlog, PerfilPsicologo, Categoria, LineaEmergencia, Paciente, ConfiguracionApp } from '../modelos/tipos';

/* ────────────────────  colecciones de Firestore  ──────────────────── */

const COL_CATEGORIAS = 'categorias';
const COL_TESTS = 'tests';
const COL_EJERCICIOS = 'ejercicios';
const COL_ARTICULOS = 'articulosBlog';
const COL_LINEAS_EMERGENCIA = 'lineasEmergencia';
const COL_PACIENTES = 'pacientes';
const COL_PERFIL = 'perfil';
const DOC_PERFIL = 'principal';
const COL_CONFIGURACION = 'configuracion';
const DOC_CONFIGURACION_APP = 'app';

/* ────────────────────  helpers genéricos  ──────────────────── */

function suscribirColeccionOrdenada<T>(nombreColeccion: string, campoOrden: string, direccion: 'asc' | 'desc', cb: (items: T[]) => void, onError?: (error: Error) => void): Unsubscribe {
  const q = query(collection(db, nombreColeccion), orderBy(campoOrden, direccion));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ ...(d.data() as T), id: d.id })));
  }, onError);
}

async function guardarDocumento<T extends { id: string }>(nombreColeccion: string, item: T): Promise<void> {
  await setDoc(doc(db, nombreColeccion, item.id), item);
}

async function eliminarDocumento(nombreColeccion: string, id: string): Promise<void> {
  await deleteDoc(doc(db, nombreColeccion, id));
}

async function intercambiarOrden(nombreColeccion: string, a: { id: string; orden: number }, b: { id: string; orden: number }): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, nombreColeccion, a.id), { orden: b.orden });
  batch.update(doc(db, nombreColeccion, b.id), { orden: a.orden });
  await batch.commit();
}

export function siguienteOrden(items: { orden: number }[]): number {
  return items.length ? Math.max(...items.map(i => i.orden)) + 1 : 1;
}

/* ────────────────────  categorías  ──────────────────── */

export function suscribirCategorias(cb: (categorias: Categoria[]) => void, onError?: (error: Error) => void): Unsubscribe {
  return suscribirColeccionOrdenada<Categoria>(COL_CATEGORIAS, 'orden', 'asc', cb, onError);
}
export function crearCategoria(categoria: Categoria) { return guardarDocumento(COL_CATEGORIAS, categoria); }
export function actualizarCategoria(categoria: Categoria) { return guardarDocumento(COL_CATEGORIAS, categoria); }
export function eliminarCategoria(id: string) { return eliminarDocumento(COL_CATEGORIAS, id); }
export function moverCategoria(a: Categoria, b: Categoria) { return intercambiarOrden(COL_CATEGORIAS, a, b); }

/* ────────────────────  tests  ──────────────────── */

export function suscribirTests(cb: (tests: Test[]) => void, onError?: (error: Error) => void): Unsubscribe {
  return suscribirColeccionOrdenada<Test>(COL_TESTS, 'orden', 'asc', cb, onError);
}
export function crearTest(test: Test) { return guardarDocumento(COL_TESTS, test); }
export function actualizarTest(test: Test) { return guardarDocumento(COL_TESTS, test); }
export function eliminarTest(id: string) { return eliminarDocumento(COL_TESTS, id); }
export function moverTest(a: Test, b: Test) { return intercambiarOrden(COL_TESTS, a, b); }

/* ────────────────────  ejercicios  ──────────────────── */

export function suscribirEjercicios(cb: (ejercicios: Ejercicio[]) => void, onError?: (error: Error) => void): Unsubscribe {
  return suscribirColeccionOrdenada<Ejercicio>(COL_EJERCICIOS, 'orden', 'asc', cb, onError);
}
export function crearEjercicio(ejercicio: Ejercicio) { return guardarDocumento(COL_EJERCICIOS, ejercicio); }
export function actualizarEjercicio(ejercicio: Ejercicio) { return guardarDocumento(COL_EJERCICIOS, ejercicio); }
export function eliminarEjercicio(id: string) { return eliminarDocumento(COL_EJERCICIOS, id); }
export function moverEjercicio(a: Ejercicio, b: Ejercicio) { return intercambiarOrden(COL_EJERCICIOS, a, b); }

/* ────────────────────  artículos de blog  ──────────────────── */

export function suscribirArticulos(cb: (articulos: ArticuloBlog[]) => void, onError?: (error: Error) => void): Unsubscribe {
  return suscribirColeccionOrdenada<ArticuloBlog>(COL_ARTICULOS, 'orden', 'asc', cb, onError);
}
export function crearArticulo(articulo: ArticuloBlog) { return guardarDocumento(COL_ARTICULOS, articulo); }
export function actualizarArticulo(articulo: ArticuloBlog) { return guardarDocumento(COL_ARTICULOS, articulo); }
export function eliminarArticulo(id: string) { return eliminarDocumento(COL_ARTICULOS, id); }
export function moverArticulo(a: ArticuloBlog, b: ArticuloBlog) { return intercambiarOrden(COL_ARTICULOS, a, b); }

/* ────────────────────  líneas de emergencia  ──────────────────── */

export function suscribirLineasEmergencia(cb: (lineas: LineaEmergencia[]) => void, onError?: (error: Error) => void): Unsubscribe {
  return suscribirColeccionOrdenada<LineaEmergencia>(COL_LINEAS_EMERGENCIA, 'orden', 'asc', cb, onError);
}
export function crearLineaEmergencia(linea: LineaEmergencia) { return guardarDocumento(COL_LINEAS_EMERGENCIA, linea); }
export function actualizarLineaEmergencia(linea: LineaEmergencia) { return guardarDocumento(COL_LINEAS_EMERGENCIA, linea); }
export function eliminarLineaEmergencia(id: string) { return eliminarDocumento(COL_LINEAS_EMERGENCIA, id); }
export function moverLineaEmergencia(a: LineaEmergencia, b: LineaEmergencia) { return intercambiarOrden(COL_LINEAS_EMERGENCIA, a, b); }

/* ────────────────────  pacientes  ──────────────────── */

export function suscribirPacientes(cb: (pacientes: Paciente[]) => void, onError?: (error: Error) => void): Unsubscribe {
  return suscribirColeccionOrdenada<Paciente>(COL_PACIENTES, 'creadoEn', 'desc', cb, onError);
}
export function crearPaciente(paciente: Paciente) { return guardarDocumento(COL_PACIENTES, paciente); }
export function actualizarPaciente(paciente: Paciente) { return guardarDocumento(COL_PACIENTES, paciente); }
export function eliminarPaciente(id: string) { return eliminarDocumento(COL_PACIENTES, id); }

/* ────────────────────  perfil del psicólogo  ──────────────────── */

export function suscribirPerfil(cb: (perfil: PerfilPsicologo | null) => void, onError?: (error: Error) => void): Unsubscribe {
  return onSnapshot(doc(db, COL_PERFIL, DOC_PERFIL), snap => {
    if (!snap.exists()) { cb(null); return; }
    const data = snap.data() as Partial<PerfilPsicologo>;
    // El documento puede provenir de una versión anterior sin estos campos.
    cb({
      ...data,
      membresias: data.membresias ?? [],
      especializaciones: data.especializaciones ?? [],
      areasIntervencion: data.areasIntervencion ?? [],
      formacion: data.formacion ?? [],
      experiencia: data.experiencia ?? [],
      proyectos: data.proyectos ?? [],
    } as PerfilPsicologo);
  }, onError);
}
export async function guardarPerfil(perfil: PerfilPsicologo): Promise<void> {
  await setDoc(doc(db, COL_PERFIL, DOC_PERFIL), perfil);
}

/* ────────────────────  configuración global de la app móvil  ──────────────────── */

export function suscribirConfiguracionApp(cb: (config: ConfiguracionApp | null) => void, onError?: (error: Error) => void): Unsubscribe {
  return onSnapshot(doc(db, COL_CONFIGURACION, DOC_CONFIGURACION_APP), snap => {
    cb(snap.exists() ? (snap.data() as ConfiguracionApp) : null);
  }, onError);
}
export async function establecerTemaApp(tema: ConfiguracionApp['tema']): Promise<void> {
  await setDoc(doc(db, COL_CONFIGURACION, DOC_CONFIGURACION_APP), { tema }, { merge: true });
}
