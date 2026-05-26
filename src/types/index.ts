export type Nivel =
  | 'Iniciação Cristã 1'
  | 'Iniciação Cristã 2'
  | 'Iniciação Cristã 3'
  | 'Primeira Eucaristia'
  | 'Pós-Eucaristia 1'
  | 'Pós-Eucaristia 2'
  | 'Crisma 1'
  | 'Crisma 2';

export interface Catequizando {
  id: string;
  nome: string;
  dataNascimento: string;
  turmaId: string;
  responsavel: string;
  telefoneResponsavel: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  createdAt: string;
}

export interface Catequista {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nivel: string;
  turmasIds: string[];
  observacoes?: string;
  createdAt: string;
}

export interface Turma {
  id: string;
  nome: string;
  nivel: Nivel;
  catequistaId: string;
  horario: string;
  sala?: string;
  anoLetivo: string;
  createdAt: string;
}

export interface RegistroPresenca {
  id: string;
  turmaId: string;
  data: string;
  presencas: { catequizandoId: string; presente: boolean; justificativa?: string }[];
  observacoes?: string;
  createdAt: string;
}

export type TipoLancamento = 'receita' | 'despesa';
export type CategoriaCaixa =
  | 'Mensalidade'
  | 'Doação'
  | 'Material'
  | 'Evento'
  | 'Alimentação'
  | 'Transporte'
  | 'Outros';

export interface LancamentoCaixa {
  id: string;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  data: string;
  categoria: CategoriaCaixa;
  turmaId?: string;
  observacoes?: string;
  createdAt: string;
}
