import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MaintenanceOrder } from '../types/manutencao';
import { parseManutencaoFile } from '../utils/parseManutencao';

interface ManutencaoContextType {
  orders: MaintenanceOrder[];
  fileName: string;
  importedAt: string;
  loading: boolean;
  error: string;
  importFile: (file: File) => void;
  clearData: () => void;
}

const ManutencaoContext = createContext<ManutencaoContextType>(null!);

export function ManutencaoProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<MaintenanceOrder[]>([]);
  const [fileName, setFileName] = useState('');
  const [importedAt, setImportedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const importFile = (file: File) => {
    setLoading(true);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = parseManutencaoFile(content);
        if (parsed.length === 0) {
          setError('Nenhuma ordem encontrada. Verifique se o arquivo é um relatório MI0402.');
        } else {
          setOrders(parsed);
          setFileName(file.name);
          setImportedAt(new Date().toLocaleString('pt-BR'));
        }
      } catch {
        setError('Erro ao processar o arquivo. Verifique o formato.');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Erro ao ler o arquivo.');
      setLoading(false);
    };
    reader.readAsText(file, 'windows-1252');
  };

  const clearData = () => {
    setOrders([]);
    setFileName('');
    setImportedAt('');
    setError('');
  };

  return (
    <ManutencaoContext.Provider
      value={{ orders, fileName, importedAt, loading, error, importFile, clearData }}
    >
      {children}
    </ManutencaoContext.Provider>
  );
}

export function useManutencao() {
  return useContext(ManutencaoContext);
}
