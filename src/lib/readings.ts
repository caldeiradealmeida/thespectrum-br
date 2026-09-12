import { AxisId } from "./instrument";

/**
 * Lista curada de leituras. O relatório por IA só pode recomendar títulos
 * daqui — isso evita livros inventados. `lean` indica de que lado do eixo o
 * livro argumenta ("neg" / "pos") ou se é uma leitura de síntese ("center").
 */
export interface Reading {
  title: string;
  author: string;
  axis: AxisId;
  lean: "neg" | "center" | "pos";
  why: string;
}

export const READINGS: Reading[] = [
  // Economia — Estado
  { title: "Formação Econômica do Brasil", author: "Celso Furtado", axis: "econ", lean: "neg", why: "A leitura clássica do desenvolvimento brasileiro pela ótica do papel do Estado." },
  { title: "O Capital no Século XXI", author: "Thomas Piketty", axis: "econ", lean: "neg", why: "A tese de que a desigualdade cresce sem intervenção redistributiva." },
  { title: "A Elite do Atraso", author: "Jessé Souza", axis: "econ", lean: "neg", why: "Crítica à leitura liberal da desigualdade brasileira." },
  { title: "O Valor de Tudo", author: "Mariana Mazzucato", axis: "econ", lean: "neg", why: "Argumenta que o Estado cria valor e não apenas corrige falhas de mercado." },
  // Economia — síntese
  { title: "Boa Economia para Tempos Difíceis", author: "Abhijit Banerjee e Esther Duflo", axis: "econ", lean: "center", why: "O que a evidência diz sobre imigração, comércio e crescimento, sem dogma." },
  { title: "Brasil: Uma Biografia", author: "Lilia Schwarcz e Heloisa Starling", axis: "econ", lean: "center", why: "Contexto histórico para entender por que o Brasil discute o que discute." },
  // Economia — Mercado
  { title: "A Lanterna na Popa", author: "Roberto Campos", axis: "econ", lean: "pos", why: "Memórias do principal liberal brasileiro do século XX." },
  { title: "O Caminho da Servidão", author: "Friedrich Hayek", axis: "econ", lean: "pos", why: "O argumento fundador contra o planejamento central." },
  { title: "Capitalismo e Liberdade", author: "Milton Friedman", axis: "econ", lean: "pos", why: "A defesa clássica de que liberdade econômica e política andam juntas." },
  { title: "Por que as Nações Fracassam", author: "Daron Acemoglu e James Robinson", axis: "econ", lean: "pos", why: "Instituições inclusivas e mercados como motor da prosperidade." },

  // Costumes — progressista
  { title: "Raízes do Brasil", author: "Sérgio Buarque de Holanda", axis: "costumes", lean: "center", why: "O 'homem cordial' e as raízes culturais do público e do privado no Brasil." },
  { title: "Pequeno Manual Antirracista", author: "Djamila Ribeiro", axis: "costumes", lean: "neg", why: "Introdução curta ao debate sobre raça e políticas de reparação." },
  { title: "Casa-Grande & Senzala", author: "Gilberto Freyre", axis: "costumes", lean: "center", why: "Leitura fundadora, e controversa, da formação social brasileira." },
  { title: "A Mente Moralista", author: "Jonathan Haidt", axis: "costumes", lean: "center", why: "Por que progressistas e conservadores não se entendem — e o que cada lado enxerga." },
  { title: "Reflexões sobre a Revolução em França", author: "Edmund Burke", axis: "costumes", lean: "pos", why: "A origem do conservadorismo moderno: a tradição como sabedoria acumulada." },
  { title: "Como Ser um Conservador", author: "Roger Scruton", axis: "costumes", lean: "pos", why: "A defesa contemporânea mais legível dos valores conservadores." },
  { title: "O Mínimo que Você Precisa Saber para Não Ser um Idiota", author: "Olavo de Carvalho", axis: "costumes", lean: "pos", why: "Referência da nova direita brasileira nos costumes; leitura de contraponto para progressistas." },
  { title: "Sobre a Liberdade", author: "John Stuart Mill", axis: "costumes", lean: "neg", why: "O princípio do dano: o limite legítimo da sociedade sobre o indivíduo." },

  // Instituições — garantista
  { title: "Como as Democracias Morrem", author: "Steven Levitsky e Daniel Ziblatt", axis: "instituicoes", lean: "neg", why: "Como instituições e normas seguram — ou não — a erosão democrática." },
  { title: "Os Donos do Poder", author: "Raymundo Faoro", axis: "instituicoes", lean: "center", why: "O patrimonialismo como chave para o Estado brasileiro." },
  { title: "Limites da Democracia", author: "Marcos Nobre", axis: "instituicoes", lean: "neg", why: "Diagnóstico do impasse político brasileiro desde 2013." },
  { title: "O Povo Contra a Democracia", author: "Yascha Mounk", axis: "instituicoes", lean: "center", why: "A tensão entre vontade popular e direitos individuais." },
  // Instituições — ordem
  { title: "Segurança Pública para Virar o Jogo", author: "Ilona Szabó e Melina Risso", axis: "instituicoes", lean: "neg", why: "Evidências sobre o que reduz e o que não reduz a violência no Brasil." },
  { title: "A Ordem Política nas Sociedades em Mudança", author: "Samuel Huntington", axis: "instituicoes", lean: "pos", why: "A tese de que ordem precede liberdade nas sociedades em transformação." },
  { title: "Thinking About Crime", author: "James Q. Wilson", axis: "instituicoes", lean: "pos", why: "A base intelectual das políticas de punição certa e rápida." },
];
