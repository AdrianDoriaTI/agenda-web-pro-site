// Configuração do site. Estrutura pensada para a versão final (D4/D12):
// "Cadastrar minha barbearia" é o botão principal; o WhatsApp é o secundário.
// Para voltar o WhatsApp a principal, basta `cadastroLiberado: false`.

const SISTEMA = 'https://www.agendawebpro.com.br';

/** Caminho do site (base do Astro, ex.: /barbearias/), sempre com barra no fim. */
export const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

export const site = {
  // Marca do produto: aparece no cabeçalho.
  marca: 'Agenda Web Pro',
  segmento: 'Barbearias',
  // Quem faz: aparece só no rodapé.
  nome: 'Adrian Doria',
  descritor: 'Sistemas web e automação',
  produto: 'Sistema Web',

  // Número de exemplo no repositório público; o real fica só no deploy.
  // O número NUNCA é exibido no site (só dentro do link). Não colocar em texto visível.
  whatsappNumero: '5500000000000',
  whatsappMensagem: 'Olá! Vi o Agenda Web Pro para barbearias e quero saber mais.',

  // Teste grátis anunciado no site (0 = não mostrar).
  testeGratisDias: 7,
  // Preço por mês. Este site vende só o Plano Essencial (D31).
  precoEssencial: 50,

  cadastroLiberado: true,
  cadastroUrl: `${SISTEMA}/cadastro`,

  // Sistema real, aberto a partir da página (exemplo funcionando).
  sistemaVisivel: false,
  sistemaUrl: `${SISTEMA}/barbeariad`,
} as const;

export const whatsappHref = `https://wa.me/${site.whatsappNumero}?text=${encodeURIComponent(site.whatsappMensagem)}`;

export type Acao = { rotulo: string; rotuloCurto: string; href: string; tipo: 'cadastro' | 'whatsapp' };

const cadastro: Acao = {
  rotulo: 'Cadastrar minha barbearia',
  rotuloCurto: 'Cadastrar',
  href: site.cadastroUrl,
  tipo: 'cadastro',
};
const whatsapp: Acao = { rotulo: 'WhatsApp', rotuloCurto: 'WhatsApp', href: whatsappHref, tipo: 'whatsapp' };

const cadastroAtivo = site.cadastroLiberado && site.cadastroUrl !== '';

/** Slot primário (cheio) e secundário (contorno). Nunca dois botões brigando. */
export const acaoPrimaria: Acao = cadastroAtivo ? cadastro : whatsapp;
export const acaoSecundaria: Acao | null = cadastroAtivo ? whatsapp : null;
/** Contato por WhatsApp sempre disponível (rodapé e bloco final), em qualquer configuração. */
export const acaoWhatsapp: Acao = whatsapp;
