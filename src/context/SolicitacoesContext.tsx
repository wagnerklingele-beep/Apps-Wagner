import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type {
  Solicitacao, Aprovador, OrdemInterna,
  TarefaPlanejada, MaterialOrdem, RecursoAdicional,
} from '../types/solicitacoes';

const SEED_APROVADORES: Aprovador[] = [
  {
    id: 'apr-001',
    nome: 'Carlos Eduardo Ferreira',
    email: 'carlos.ferreira@empresa.com.br',
    equipes: ['01-MP-01', '01-MP-02'],
    ativo: true,
  },
  {
    id: 'apr-002',
    nome: 'Marcos Antônio Rodrigues',
    email: 'marcos.rodrigues@empresa.com.br',
    equipes: ['01-EL-01', '01-EL-02'],
    ativo: true,
  },
  {
    id: 'apr-003',
    nome: 'Ana Paula Nascimento',
    email: 'ana.nascimento@empresa.com.br',
    equipes: ['01-MP-01', '01-EL-01', '01-IN-01'],
    ativo: true,
  },
];

interface SolicitacoesContextType {
  solicitacoes: Solicitacao[];
  aprovadores: Aprovador[];
  ordensInternas: OrdemInterna[];
  criarSolicitacao: (data: Omit<Solicitacao, 'id' | 'criadaEm' | 'status' | 'aprovacoes'>) => void;
  aprovarSolicitacao: (id: string, aprovadorId: string, comentario: string) => void;
  rejeitarSolicitacao: (id: string, aprovadorId: string, motivo: string) => void;
  converterParaOrdem: (solicitacaoId: string) => OrdemInterna;
  salvarAprovador: (a: Omit<Aprovador, 'id'>) => void;
  editarAprovador: (id: string, a: Partial<Aprovador>) => void;
  removerAprovador: (id: string) => void;
  salvarPlanejamento: (
    ordemId: string,
    data: {
      tarefas: TarefaPlanejada[];
      materiais: MaterialOrdem[];
      recursos: RecursoAdicional[];
      planejadaPor: string;
      observacoes: string;
    }
  ) => void;
  liberarOrdem: (ordemId: string) => void;
}

const SolicitacoesContext = createContext<SolicitacoesContextType>(null!);

export function SolicitacoesProvider({ children }: { children: ReactNode }) {
  const [solicitacoes, setSolicitacoes] = useLocalStorage<Solicitacao[]>('manut_solicitacoes', []);
  const [aprovadores, setAprovadores] = useLocalStorage<Aprovador[]>('manut_aprovadores', SEED_APROVADORES);
  const [ordensInternas, setOrdensInternas] = useLocalStorage<OrdemInterna[]>('manut_ordens_internas', []);

  function gerarIdSolicitacao(): string {
    const year = new Date().getFullYear();
    const existing = solicitacoes.filter(s => s.id.startsWith(`SS-${year}-`));
    const n = existing.length + 1;
    return `SS-${year}-${String(n).padStart(4, '0')}`;
  }

  function gerarIdOrdem(): string {
    const year = new Date().getFullYear();
    const existing = ordensInternas.filter(o => o.id.startsWith(`OM-${year}-`));
    const n = existing.length + 1;
    return `OM-${year}-${String(n).padStart(4, '0')}`;
  }

  const criarSolicitacao = (data: Omit<Solicitacao, 'id' | 'criadaEm' | 'status' | 'aprovacoes'>) => {
    const nova: Solicitacao = {
      ...data,
      id: gerarIdSolicitacao(),
      criadaEm: new Date().toISOString(),
      status: 'pendente',
      aprovacoes: [],
    };
    setSolicitacoes(prev => [nova, ...prev]);
  };

  const aprovarSolicitacao = (id: string, aprovadorId: string, comentario: string) => {
    const apr = aprovadores.find(a => a.id === aprovadorId);
    if (!apr) return;
    setSolicitacoes(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        const novaAprovacao = {
          aprovadorId,
          aprovadorNome: apr.nome,
          dataAcao: new Date().toISOString(),
          status: 'aprovada' as const,
          comentario,
        };
        return {
          ...s,
          status: 'aprovada' as const,
          aprovacoes: [...s.aprovacoes, novaAprovacao],
        };
      })
    );
  };

  const rejeitarSolicitacao = (id: string, aprovadorId: string, motivo: string) => {
    const apr = aprovadores.find(a => a.id === aprovadorId);
    if (!apr) return;
    setSolicitacoes(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        const novaAprovacao = {
          aprovadorId,
          aprovadorNome: apr.nome,
          dataAcao: new Date().toISOString(),
          status: 'rejeitada' as const,
          comentario: motivo,
        };
        return {
          ...s,
          status: 'rejeitada' as const,
          motivoRejeicao: motivo,
          aprovacoes: [...s.aprovacoes, novaAprovacao],
        };
      })
    );
  };

  const converterParaOrdem = (solicitacaoId: string): OrdemInterna => {
    const ss = solicitacoes.find(s => s.id === solicitacaoId);
    if (!ss) throw new Error('Solicitação não encontrada');

    const novaOrdem: OrdemInterna = {
      id: gerarIdOrdem(),
      solicitacaoId: ss.id,
      criadaEm: new Date().toISOString(),
      status: 'nao_planejada',
      macro: ss.macro,
      tag: ss.tag,
      tagDescricao: ss.tagDescricao,
      equipamento: ss.equipamento,
      equipamentoDescricao: ss.equipamentoDescricao,
      familia: ss.familia,
      centroCusto: ss.centroCusto,
      descricao: ss.descricao,
      prioridade: ss.prioridade,
      tipoManutencao: ss.tipoManutencao,
      tarefas: [],
      materiais: [],
      recursos: [],
      observacoes: ss.observacoes,
    };

    setOrdensInternas(prev => [novaOrdem, ...prev]);
    setSolicitacoes(prev =>
      prev.map(s =>
        s.id === solicitacaoId
          ? { ...s, status: 'convertida' as const, ordemInternaId: novaOrdem.id }
          : s
      )
    );

    return novaOrdem;
  };

  const salvarAprovador = (a: Omit<Aprovador, 'id'>) => {
    const novo: Aprovador = {
      ...a,
      id: `apr-${Date.now()}`,
    };
    setAprovadores(prev => [...prev, novo]);
  };

  const editarAprovador = (id: string, a: Partial<Aprovador>) => {
    setAprovadores(prev =>
      prev.map(apr => (apr.id === id ? { ...apr, ...a } : apr))
    );
  };

  const removerAprovador = (id: string) => {
    setAprovadores(prev => prev.filter(a => a.id !== id));
  };

  const salvarPlanejamento = (
    ordemId: string,
    data: {
      tarefas: TarefaPlanejada[];
      materiais: MaterialOrdem[];
      recursos: RecursoAdicional[];
      planejadaPor: string;
      observacoes: string;
    }
  ) => {
    setOrdensInternas(prev =>
      prev.map(o => {
        if (o.id !== ordemId) return o;
        return {
          ...o,
          status: 'planejada' as const,
          tarefas: data.tarefas,
          materiais: data.materiais,
          recursos: data.recursos,
          planejadaPor: data.planejadaPor,
          planejadaEm: new Date().toISOString(),
          observacoes: data.observacoes,
        };
      })
    );
  };

  const liberarOrdem = (ordemId: string) => {
    setOrdensInternas(prev =>
      prev.map(o =>
        o.id === ordemId ? { ...o, status: 'liberada' as const } : o
      )
    );
  };

  return (
    <SolicitacoesContext.Provider
      value={{
        solicitacoes,
        aprovadores,
        ordensInternas,
        criarSolicitacao,
        aprovarSolicitacao,
        rejeitarSolicitacao,
        converterParaOrdem,
        salvarAprovador,
        editarAprovador,
        removerAprovador,
        salvarPlanejamento,
        liberarOrdem,
      }}
    >
      {children}
    </SolicitacoesContext.Provider>
  );
}

export function useSolicitacoes() {
  return useContext(SolicitacoesContext);
}

export default SolicitacoesProvider;
