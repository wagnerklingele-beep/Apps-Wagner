import { Chamada } from '../types';

export const mockChamadas: Chamada[] = [
  {
    id: 'ch1',
    data: '2026-05-24',
    turma: '1ª Eucaristia',
    licaoId: 'l1',
    presencas: [
      { catequizandoId: 'c1', presente: true },
      { catequizandoId: 'c2', presente: true },
      { catequizandoId: 'c3', presente: false },
      { catequizandoId: 'c4', presente: true },
      { catequizandoId: 'c5', presente: true },
      { catequizandoId: 'c6', presente: false },
      { catequizandoId: 'c7', presente: false },
      { catequizandoId: 'c15', presente: true },
    ],
  },
  {
    id: 'ch2',
    data: '2026-05-24',
    turma: 'Crisma',
    licaoId: 'l6',
    presencas: [
      { catequizandoId: 'c8', presente: true },
      { catequizandoId: 'c9', presente: true },
      { catequizandoId: 'c10', presente: true },
      { catequizandoId: 'c11', presente: false },
      { catequizandoId: 'c12', presente: true },
      { catequizandoId: 'c13', presente: true },
      { catequizandoId: 'c14', presente: false },
    ],
  },
  {
    id: 'ch3',
    data: '2026-05-17',
    turma: '1ª Eucaristia',
    presencas: [
      { catequizandoId: 'c1', presente: true },
      { catequizandoId: 'c2', presente: false },
      { catequizandoId: 'c3', presente: true },
      { catequizandoId: 'c4', presente: true },
      { catequizandoId: 'c5', presente: true },
      { catequizandoId: 'c6', presente: true },
      { catequizandoId: 'c7', presente: false },
      { catequizandoId: 'c15', presente: true },
    ],
  },
  {
    id: 'ch4',
    data: '2026-05-17',
    turma: 'Crisma',
    presencas: [
      { catequizandoId: 'c8', presente: true },
      { catequizandoId: 'c9', presente: false },
      { catequizandoId: 'c10', presente: true },
      { catequizandoId: 'c11', presente: true },
      { catequizandoId: 'c12', presente: true },
      { catequizandoId: 'c13', presente: false },
      { catequizandoId: 'c14', presente: true },
    ],
  },
];
