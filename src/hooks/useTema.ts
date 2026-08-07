import { useEffect, useState } from 'react';

export type Tema = 'light' | 'dark';

// Se mantiene el valor original de la clave para no perder la preferencia ya guardada en el navegador.
const STORAGE_KEY = 'ipsiquis-theme';

function obtenerTemaInicial(): Tema {
  return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(obtenerTemaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'dark');
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  const alternarTema = () => setTema(prev => (prev === 'dark' ? 'light' : 'dark'));

  return { tema, alternarTema };
}
