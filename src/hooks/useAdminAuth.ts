import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export type EstadoAuth = 'verificando' | 'sinSesion' | 'autorizado';

export function useAdminAuth() {
  const [estado, setEstado] = useState<EstadoAuth>('verificando');
  const [errorPermiso, setErrorPermiso] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async user => {
      if (!user) {
        setEstado('sinSesion');
        return;
      }
      try {
        console.log('[useAdminAuth] proyecto:', auth.app.options.projectId);
        console.log('[useAdminAuth] uid recibido de onAuthStateChanged:', JSON.stringify(user.uid), 'len=', user.uid.length);
        const snap = await getDoc(doc(db, 'administradores', user.uid));
        console.log('[useAdminAuth] snap.exists():', snap.exists(), 'snap.id:', snap.id, 'snap.data():', snap.data());
        if (!snap.exists()) {
          await signOut(auth);
          setErrorPermiso('Esta cuenta no tiene permisos de administrador');
          setEstado('sinSesion');
          return;
        }
        setErrorPermiso(null);
        setEstado('autorizado');
      } catch (error) {
        console.error('[useAdminAuth] error en getDoc:', error, 'code:', (error as { code?: string }).code);
        await signOut(auth);
        setErrorPermiso('No se pudo verificar el permiso de administrador');
        setEstado('sinSesion');
      }
    });
  }, []);

  const cerrarSesion = useCallback(() => signOut(auth), []);

  return { estado, errorPermiso, cerrarSesion };
}
