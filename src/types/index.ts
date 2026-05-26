export interface Catequizando {
  id: string;
  nome: string;
  dataNascimento: string;
  turma: string;
  responsavel: string;
  telefone: string;
  email?: string;
  ativo: boolean;
}

export interface Presenca {
  catequizandoId: string;
  presente: boolean;
}

export interface Chamada {
  id: string;
  data: string;
  turma: string;
  licaoId?: string;
  presencas: Presenca[];
}

export interface Licao {
  id: string;
  titulo: string;
  fase: string;
  numero: number;
  objetivo: string;
  conteudo: string;
  oracao?: string;
  atividade?: string;
  versiculoBiblico?: string;
  duracao: number;
}

export interface EventoAgenda {
  id: string;
  titulo: string;
  descricao?: string;
  data: string;
  hora?: string;
  tipo: 'aula' | 'sacramento' | 'evento' | 'retiro' | 'feriado';
  turma?: string;
}

export interface Comunicado {
  id: string;
  titulo: string;
  conteudo: string;
  data: string;
  autor: string;
  destinatarios: string[];
  lido: boolean;
  tipo: 'aviso' | 'urgente' | 'informativo';
}

export type RootStackParamList = {
  MainTabs: undefined;
  LicaoDetalhe: { licao: Licao };
  CatequizandoDetalhe: { catequizando: Catequizando };
  AdicionarCatequizando: undefined;
  Chamada: { turma: string; data: string };
  NovoComunicado: undefined;
};

export type TabParamList = {
  Home: undefined;
  Licoes: undefined;
  Catequizandos: undefined;
  Agenda: undefined;
  Comunicados: undefined;
};
