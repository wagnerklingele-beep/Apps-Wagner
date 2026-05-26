import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Catequizando, Chamada, Comunicado } from '../types';
import { mockCatequizandos } from '../data/mockCatequizandos';
import { mockComunicados } from '../data/mockComunicados';
import { mockChamadas } from '../data/mockChamadas';

interface AppContextType {
  catequizandos: Catequizando[];
  chamadas: Chamada[];
  comunicados: Comunicado[];
  addCatequizando: (c: Catequizando) => void;
  saveChamada: (chamada: Chamada) => void;
  marcarComunicadoLido: (id: string) => void;
  addComunicado: (com: Comunicado) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [catequizandos, setCatequizandos] = useState<Catequizando[]>(mockCatequizandos);
  const [chamadas, setChamadas] = useState<Chamada[]>(mockChamadas);
  const [comunicados, setComunicados] = useState<Comunicado[]>(mockComunicados);

  const addCatequizando = (c: Catequizando) => {
    setCatequizandos(prev => [...prev, c]);
  };

  const saveChamada = (chamada: Chamada) => {
    setChamadas(prev => {
      const exists = prev.findIndex(ch => ch.id === chamada.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = chamada;
        return updated;
      }
      return [...prev, chamada];
    });
  };

  const marcarComunicadoLido = (id: string) => {
    setComunicados(prev =>
      prev.map(com => (com.id === id ? { ...com, lido: true } : com))
    );
  };

  const addComunicado = (com: Comunicado) => {
    setComunicados(prev => [com, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        catequizandos,
        chamadas,
        comunicados,
        addCatequizando,
        saveChamada,
        marcarComunicadoLido,
        addComunicado,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
