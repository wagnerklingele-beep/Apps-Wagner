// Service Request (Solicitação de Serviço)
export type SolicitacaoStatus = 'pendente' | 'aprovada' | 'rejeitada' | 'convertida';
export type OrdemInternaStatus = 'nao_planejada' | 'planejada' | 'liberada';
export type TipoManutencao = 'corretiva' | 'preventiva' | 'preditiva' | 'melhoria';
export type TipoRecurso = 'munck' | 'plataforma_elevatoria' | 'hxh_terceiro' | 'outro';

export interface Solicitacao {
  id: string;                    // SS-YYYY-NNNN
  criadaEm: string;              // ISO date
  criadaPor: string;             // name
  macro: string;                 // macro ID (e.g., "51")
  tag: string;                   // TAG ID
  tagDescricao: string;
  equipamento: string;           // equipment ID
  equipamentoDescricao: string;
  familia: string;
  centroCusto: string;
  descricao: string;             // service description
  prioridade: number;            // 100, 200, 300, 400, 500, 600, 700, 800
  tipoManutencao: TipoManutencao;
  observacoes: string;
  status: SolicitacaoStatus;
  aprovacoes: Aprovacao[];
  motivoRejeicao?: string;
  ordemInternaId?: string;       // linked internal order
}

export interface Aprovacao {
  aprovadorId: string;
  aprovadorNome: string;
  dataAcao: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  comentario: string;
}

export interface Aprovador {
  id: string;                    // unique
  nome: string;
  email: string;
  equipes: string[];             // team codes they approve (e.g., ["01-MP-01", "01-MP-02"])
  ativo: boolean;
}

export interface TarefaPlanejada {
  seq: number;
  descricao: string;
  especialidades: EspecialidadeTarefa[];
}

export interface EspecialidadeTarefa {
  codigo: string;   // MEC, EIA, SOL, CLD, etc.
  descricao: string;
  homens: number;
  horas: number;
}

export interface MaterialOrdem {
  id: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  origem: 'componente' | 'adicional';
  codigoComponente?: string;
}

export interface RecursoAdicional {
  id: string;
  tipo: TipoRecurso;
  descricao: string;
  quantidade: number;
  unidade: string;
  observacao: string;
}

export interface OrdemInterna {
  id: string;                    // OM-YYYY-NNNN
  solicitacaoId: string;
  criadaEm: string;
  status: OrdemInternaStatus;
  macro: string;
  tag: string;
  tagDescricao: string;
  equipamento: string;
  equipamentoDescricao: string;
  familia: string;
  centroCusto: string;
  descricao: string;
  prioridade: number;
  tipoManutencao: TipoManutencao;
  planejadaEm?: string;
  planejadaPor?: string;
  tarefas: TarefaPlanejada[];
  materiais: MaterialOrdem[];
  recursos: RecursoAdicional[];
  observacoes: string;
}
