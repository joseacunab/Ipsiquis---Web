import type { Timestamp } from 'firebase/firestore';

export function formatearFecha(ts: Timestamp | null | undefined): string {
  if (!ts) return '—';
  return ts.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
