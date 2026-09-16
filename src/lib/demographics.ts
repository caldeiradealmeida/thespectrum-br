/** Opções do bloco opcional de perfil. Rótulos em pt-BR para a UI e o /admin. */
export const EDUCATION = {
  fundamental: "Ensino fundamental",
  medio: "Ensino médio",
  superior: "Ensino superior",
  pos: "Pós-graduação",
} as const;

export const VOTE_2022 = {
  lula: "Lula",
  bolsonaro: "Bolsonaro",
  branco_nulo: "Branco / nulo",
  nao_votei: "Não votei",
  prefiro_nao_dizer: "Prefiro não dizer",
} as const;

export const AGES = ["16-24", "25-34", "35-44", "45-59", "60+"] as const;

export const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"] as const;

/** Autoposicionamento 1–7 (esquerda → direita), perguntado antes do resultado. */
export const SELF_PLACEMENT_LABELS: Record<number, string> = {
  1: "Esquerda",
  2: "Centro-esquerda",
  3: "Um pouco à esquerda",
  4: "Centro",
  5: "Um pouco à direita",
  6: "Centro-direita",
  7: "Direita",
};
