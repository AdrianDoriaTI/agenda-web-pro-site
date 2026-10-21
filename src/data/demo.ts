// Dados da demonstração. 100% fictícios, os mesmos do protótipo /propostas
// (decisão de 2026-10-08). Nada aqui pode ser dado real de cliente.

export const barbearia = {
  nome: 'Barbearia Exemplo',
  // Sem endereço real: a demo mostra só o link de localização.
  localizacao: 'Localização',
  instagram: '@barbeariaexemplo',
} as const;

export const barbeiros = ['Rafael', 'Caio'] as const;

export type Servico = { nome: string; preco: number; duracao?: string };
export const servicos: Servico[] = [
  { nome: 'Corte', preco: 30 },
  { nome: 'Barba', preco: 20 },
  { nome: 'Corte + Barba', preco: 45, duracao: '1h' },
  { nome: 'Sobrancelha', preco: 10 },
  { nome: 'Corte infantil', preco: 25, duracao: '1h' },
];

/** Grade do dia de exemplo: manhã e tarde (a pausa de almoço é a lacuna). */
export const horarios = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
];
export const ocupados = ['09:00', '15:00', '16:30'];

/** O que o cliente de exemplo escolhe no Momento 1. */
export const escolha = {
  cliente: 'Bruno',
  barbeiro: 'Caio',
  diaIndex: 1, // Amanhã
  hora: '14:30',
  servico: 'Corte + Barba',
} as const;

const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const dd = (n: number) => String(n).padStart(2, '0');

/** Próximos dias a partir de `base` (Hoje, Amanhã, Sex…). Usado no build e atualizado no navegador. */
export function diasDemo(base: Date, n = 8) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    return {
      rotulo: i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : SEMANA[d.getDay()],
      data: `${dd(d.getDate())}/${dd(d.getMonth() + 1)}`,
    };
  });
}

export const reais = (v: number) => `R$ ${v}`;

/** Momento 1 — o cliente agenda (DESIGN §5.4). Texto da legenda = equivalente acessível da tela. */
export const momento1 = [
  {
    titulo: 'Escolhe o dia',
    texto: 'Abre o link da sua barbearia e vê os próximos dias. Sem baixar aplicativo.',
  },
  {
    titulo: 'Escolhe o horário',
    texto: 'Só aparecem os horários livres. O que já está ocupado fica riscado.',
  },
  {
    titulo: 'Escolhe o serviço e reserva',
    texto: 'Vê o preço antes de reservar e coloca só o nome.',
  },
  {
    titulo: 'Acompanha os horários',
    texto: 'Ele mesmo remarca ou cancela, sem precisar te chamar.',
  },
] as const;

/* ---------- Painel do barbeiro (Momento 2) ---------- */

export type Atendimento = { hora: string; ate?: string; nome: string; servico: string; preco: number; barbeiro: string; origem: 'Site' | 'Manual'; tel?: string };

/** Hoje: o próximo e os seguintes (mesmos do protótipo /propostas). */
export const hoje = {
  atendimentos: 6,
  previsto: 195,
  proximo: { hora: '15:00', nome: 'Leandro', servico: 'Corte', preco: 30, barbeiro: 'Caio', origem: 'Site', tel: '79 9 0000-0103' } as Atendimento,
  eta: 'em 20 min',
  depois: [
    { hora: '16:30', nome: 'Dario', servico: 'Corte infantil', preco: 25, barbeiro: 'Rafael', origem: 'Manual' },
    { hora: '17:30', nome: 'Marcos', servico: 'Barba', preco: 20, barbeiro: 'Caio', origem: 'Site', tel: '79 9 0000-0105' },
  ] as Atendimento[],
};

/** Agenda de amanhã: ocupados e bloqueados (o resto fica livre). */
export const agenda = {
  ocupados: ['08:00', '09:30', '10:00', '14:30', '16:00'],
  bloqueados: ['18:00', '18:30'],
  previsto: 160,
};

/** Financeiro do mês (exemplo). Soma: 1.440 + 900 = 2.340; comissão do Caio 40% = 360. */
export const financeiro = {
  periodo: '01/10 a 31/10',
  total: 2340,
  realizado: 1620,
  aRealizar: 720,
  atendimentos: 58,
  comissoes: 360,
  barbearia: 1980,
  semanas: [520, 610, 580, 490, 140],
  barbeiros: [
    { nome: 'Rafael', responsavel: true, total: 1440, atendimentos: 36, comissao: 0 },
    { nome: 'Caio', responsavel: false, total: 900, atendimentos: 22, comissao: 40 },
  ],
};

export const milhar = (v: number) => v.toLocaleString('pt-BR');

/** Momento 2 — o barbeiro gerencia. */
export const momento2 = [
  {
    titulo: 'Hoje',
    texto: 'Abre o painel e já vê o próximo cliente, em quanto tempo e o que vai fazer.',
  },
  {
    titulo: 'Agenda',
    texto: 'O dia inteiro em uma tela: livre, ocupado e bloqueado. Feche o dia ou bloqueie horários quando precisar.',
  },
  {
    titulo: 'Financeiro',
    texto: 'Quanto entrou no mês, a comissão de cada barbeiro e o que fica na barbearia.',
  },
] as const;
