import { useState, useEffect, useCallback } from 'react';
import type {
  Catequizando, Catequista, Turma, RegistroPresenca, LancamentoCaixa
} from '../types';

function load<T>(key: string, def: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch { return def; }
}

function save<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

function useCollection<T extends { id: string }>(key: string) {
  const [items, setItems] = useState<T[]>(() => load<T[]>(key, []));

  useEffect(() => { save(key, items); }, [key, items]);

  const add = useCallback((item: T) => setItems(p => [...p, item]), []);
  const update = useCallback((item: T) =>
    setItems(p => p.map(x => x.id === item.id ? item : x)), []);
  const remove = useCallback((id: string) =>
    setItems(p => p.filter(x => x.id !== id)), []);

  return { items, add, update, remove };
}

export function useCatequizandos() {
  return useCollection<Catequizando>('catequizandos');
}

export function useCatequistas() {
  return useCollection<Catequista>('catequistas');
}

export function useTurmas() {
  return useCollection<Turma>('turmas');
}

export function usePresencas() {
  return useCollection<RegistroPresenca>('presencas');
}

export function useLancamentos() {
  return useCollection<LancamentoCaixa>('lancamentos');
}
