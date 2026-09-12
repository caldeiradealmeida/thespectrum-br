/**
 * Instrumento brasileiro do The Spectrum — versão 1.
 *
 * Três eixos, oito itens por eixo, escala Likert de 7 pontos.
 * Metade dos itens de cada eixo é formulada em cada direção (chaveamento
 * balanceado) para reduzir viés de aquiescência. O teste em
 * `instrument.test.ts` garante esse balanceamento.
 *
 * Convenção de sinal do escore (−100 … +100):
 *   econ          −  Estado / redistribuição      +  mercado / menos Estado
 *   costumes      −  progressista                 +  conservador
 *   instituicoes  −  garantista / institucional   +  ordem / punitivista
 *
 * `key = +1` significa que concordar com a afirmação empurra o escore para o
 * polo positivo; `key = −1`, para o polo negativo.
 */

export const INSTRUMENT_VERSION = 1;

export type AxisId = "econ" | "costumes" | "instituicoes";

export interface Axis {
  id: AxisId;
  name: string;
  short: string;
  negativePole: string;
  positivePole: string;
  question: string;
  negativeDescription: string;
  positiveDescription: string;
  centerDescription: string;
}

export const AXES: Axis[] = [
  {
    id: "econ",
    name: "Economia",
    short: "Econ.",
    negativePole: "Estado",
    positivePole: "Mercado",
    question: "Quem deve conduzir a economia: o Estado ou o mercado?",
    negativeDescription:
      "Você vê o Estado como instrumento central para reduzir desigualdades: tributação progressiva, empresas públicas estratégicas e programas sociais como investimento, não como gasto.",
    positiveDescription:
      "Você confia mais no mercado do que no governo para gerar prosperidade: menos impostos, menos regulação, privatizações e um Estado que interfere o mínimo possível.",
    centerDescription:
      "Você combina os dois lados: aceita um Estado presente em áreas essenciais e, ao mesmo tempo, valoriza a eficiência e a liberdade do mercado em outras.",
  },
  {
    id: "costumes",
    name: "Costumes",
    short: "Cost.",
    negativePole: "Progressista",
    positivePole: "Conservador",
    question: "Quanto a sociedade deve mudar seus valores e tradições?",
    negativeDescription:
      "Você defende a ampliação de direitos individuais e a mudança de normas sociais: autonomia sobre o próprio corpo, diversidade, políticas de reparação e separação entre religião e Estado.",
    positiveDescription:
      "Você valoriza a tradição, a família e a religião como pilares da sociedade, e vê com cautela mudanças rápidas nos costumes e a intervenção do Estado nesses temas.",
    centerDescription:
      "Você não se filia a um bloco: apoia algumas mudanças de costumes e resiste a outras, avaliando tema a tema em vez de por princípio.",
  },
  {
    id: "instituicoes",
    name: "Instituições e segurança",
    short: "Inst.",
    negativePole: "Garantista",
    positivePole: "Ordem",
    question: "Como o Estado deve exercer sua força: com limites ou com mão dura?",
    negativeDescription:
      "Você prioriza os limites ao poder: direitos e garantias valem para todos, o Judiciário e o sistema eleitoral merecem confiança, e a força do Estado precisa de controle externo.",
    positiveDescription:
      "Você prioriza a ordem: penas mais duras, mais autonomia para a polícia, direito às armas e desconfiança de instituições que, na sua visão, protegem mais o criminoso do que o cidadão.",
    centerDescription:
      "Você quer as duas coisas — segurança efetiva e respeito às garantias — e tende a julgar caso a caso quando elas entram em conflito.",
  },
];

export interface Question {
  id: string;
  axis: AxisId;
  key: 1 | -1;
  text: string;
  /** Tema curto usado no relatório e no alinhamento com candidatos. */
  topic: string;
}

export const QUESTIONS: Question[] = [
  // ---------------------------------------------------------------- Economia
  { id: "E1", axis: "econ", key: 1, topic: "Privatizações", text: "Privatizar estatais como os Correios e a Petrobras traria mais eficiência ao país." },
  { id: "E2", axis: "econ", key: -1, topic: "Tributação de fortunas", text: "Grandes fortunas e dividendos deveriam pagar mais imposto para financiar serviços públicos." },
  { id: "E3", axis: "econ", key: 1, topic: "Carga tributária", text: "Reduzir impostos, mesmo que isso signifique cortar programas do governo, faria a economia crescer mais." },
  { id: "E4", axis: "econ", key: -1, topic: "Programas sociais", text: "Programas como o Bolsa Família são um investimento necessário, não um gasto a ser cortado." },
  { id: "E5", axis: "econ", key: 1, topic: "Leis trabalhistas", text: "As leis trabalhistas brasileiras protegem demais o trabalhador e dificultam a criação de empregos." },
  { id: "E6", axis: "econ", key: -1, topic: "Empresas estratégicas", text: "O Estado deve manter empresas estratégicas sob controle público, mesmo que elas custem mais." },
  { id: "E7", axis: "econ", key: 1, topic: "Regulação", text: "Com menos regulação, o mercado resolve os problemas melhor do que o governo." },
  { id: "E8", axis: "econ", key: -1, topic: "Redistribuição de renda", text: "Redistribuir renda é essencial para reduzir a desigualdade no Brasil." },

  // ---------------------------------------------------------------- Costumes
  { id: "C1", axis: "costumes", key: 1, topic: "Família tradicional", text: "A família tradicional é a base da sociedade e deve ser protegida pelas leis." },
  { id: "C2", axis: "costumes", key: -1, topic: "Aborto", text: "Uma mulher deve poder interromper a gravidez nas primeiras semanas, se assim decidir." },
  { id: "C3", axis: "costumes", key: 1, topic: "Drogas", text: "O uso recreativo de drogas, incluindo a maconha, deve continuar proibido." },
  { id: "C4", axis: "costumes", key: -1, topic: "Cotas", text: "Cotas raciais e sociais nas universidades são justas e devem continuar." },
  { id: "C5", axis: "costumes", key: 1, topic: "Religião e Estado", text: "Valores religiosos têm um papel legítimo nas decisões públicas e nas leis." },
  { id: "C6", axis: "costumes", key: -1, topic: "Educação e diversidade", text: "As escolas devem ensinar sobre diversidade sexual e de gênero." },
  { id: "C7", axis: "costumes", key: 1, topic: "Ambiente e agro", text: "A preservação ambiental não pode travar o crescimento do agronegócio e da mineração." },
  { id: "C8", axis: "costumes", key: -1, topic: "Direitos LGBT", text: "Casais do mesmo sexo devem ter exatamente os mesmos direitos, incluindo o de adotar." },

  // ------------------------------------------------ Instituições e segurança
  { id: "I1", axis: "instituicoes", key: 1, topic: "Maioridade penal", text: "Reduzir a maioridade penal para 16 anos ajudaria a combater a criminalidade." },
  { id: "I2", axis: "instituicoes", key: -1, topic: "Controle da polícia", text: "A polícia precisa de mais controle externo sobre o uso da força, não de mais liberdade." },
  { id: "I3", axis: "instituicoes", key: 1, topic: "Armas", text: "O cidadão sem antecedentes deve ter facilidade para comprar e portar armas." },
  { id: "I4", axis: "instituicoes", key: -1, topic: "STF", text: "O Supremo Tribunal Federal é essencial para proteger a democracia, mesmo quando decide contra a maioria." },
  { id: "I5", axis: "instituicoes", key: 1, topic: "Forças Armadas", text: "Em crises graves, as Forças Armadas podem ter um papel na garantia da ordem interna." },
  { id: "I6", axis: "instituicoes", key: -1, topic: "Urnas e eleições", text: "A urna eletrônica é confiável e o resultado das eleições deve ser respeitado." },
  { id: "I7", axis: "instituicoes", key: 1, topic: "Penas", text: "Penas mais duras e prisões mais rigorosas são a forma mais eficaz de reduzir o crime." },
  { id: "I8", axis: "instituicoes", key: -1, topic: "Direitos humanos", text: "Direitos humanos valem para todos, inclusive para quem cometeu crimes." },
];

export const SCALE_MIN = 1;
export const SCALE_MAX = 7;
export const SCALE_LABELS: Record<number, string> = {
  1: "Discordo totalmente",
  2: "Discordo",
  3: "Discordo um pouco",
  4: "Neutro",
  5: "Concordo um pouco",
  6: "Concordo",
  7: "Concordo totalmente",
};

export function questionById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}
