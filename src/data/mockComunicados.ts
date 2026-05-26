import { Comunicado } from '../types';

export const mockComunicados: Comunicado[] = [
  {
    id: 'com1',
    titulo: 'Encontro Obrigatório de Pais — 1ª Eucaristia',
    conteudo:
      'Prezados pais e responsáveis,\n\nInformamos que haverá um encontro OBRIGATÓRIO no dia 10 de junho, às 19h30, na sala paroquial.\n\nNeste encontro abordaremos:\n• Calendário da 1ª Eucaristia\n• Orientações sobre a cerimônia\n• Material necessário\n• Dúvidas e perguntas\n\nA presença é fundamental para garantir a participação do seu filho na cerimônia. Em caso de impossibilidade, entrar em contato previamente com a coordenação.',
    data: '2026-05-25',
    autor: 'Coordenação de Catequese',
    destinatarios: ['1ª Eucaristia'],
    lido: false,
    tipo: 'urgente',
  },
  {
    id: 'com2',
    titulo: 'Calendário do 2º Semestre 2026',
    conteudo:
      'Segue o calendário completo do segundo semestre de 2026:\n\n📅 Datas importantes:\n• 4 de junho: Corpus Christi — sem aula\n• 12 de julho: Celebração da 1ª Eucaristia (10h)\n• 21 de junho: Retiro de Crisma\n• 2 de agosto: Sacramento do Crisma (10h)\n• Recesso de julho: 13 a 26 de julho\n\nAs aulas semanais continuam normalmente nos demais sábados. Dúvidas, entrar em contato com a secretaria paroquial.',
    data: '2026-05-20',
    autor: 'Coordenação de Catequese',
    destinatarios: ['Todos'],
    lido: true,
    tipo: 'informativo',
  },
  {
    id: 'com3',
    titulo: 'Material Didático — Apostila Disponível',
    conteudo:
      'As apostilas do segundo semestre já estão disponíveis para retirada na secretaria da paróquia.\n\nHorário de funcionamento:\n• Segunda a Sexta: 9h às 12h e 14h às 18h\n• Sábado: 8h às 12h\n\nValor: R$ 15,00 (cobre custos de impressão)\n\nFavor retirar até o dia 07 de junho para garantir o material nas primeiras aulas.',
    data: '2026-05-18',
    autor: 'Secretaria Paroquial',
    destinatarios: ['Todos'],
    lido: false,
    tipo: 'aviso',
  },
  {
    id: 'com4',
    titulo: 'Retiro de Crisma — Informações',
    conteudo:
      'O Retiro de Crisma acontecerá no dia 21 de junho, sábado, das 8h às 17h30.\n\nLocal: Casa de Retiro São José (Rua das Flores, 123 — confirmar no mapa)\n\nO que trazer:\n• Lanche para o dia (almoço será fornecido)\n• Roupas confortáveis\n• Bíblia e caderno\n• Toalha e necessidades pessoais\n• Boa disposição!\n\nA participação no retiro é obrigatória para receber o Sacramento do Crisma. Confirmar presença até 15 de junho.',
    data: '2026-05-15',
    autor: 'Coordenação de Crisma',
    destinatarios: ['Crisma'],
    lido: true,
    tipo: 'aviso',
  },
  {
    id: 'com5',
    titulo: 'Parabéns pela dedicação!',
    conteudo:
      'Queridos catequizandos, pais e catequistas,\n\nA coordenação de catequese da nossa paróquia quer agradecer e parabenizar a todos pela dedicação e comprometimento neste semestre.\n\nVer o crescimento espiritual de cada criança e jovem é uma bênção. Que Deus abençoe cada família!\n\nCom carinho,\nCoordenação de Catequese',
    data: '2026-05-10',
    autor: 'Pe. Carlos Eduardo',
    destinatarios: ['Todos'],
    lido: true,
    tipo: 'informativo',
  },
];
