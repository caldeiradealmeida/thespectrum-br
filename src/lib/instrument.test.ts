import { describe, expect, it } from "vitest";
import { AXES, QUESTIONS, SCALE_MAX, SCALE_MIN } from "./instrument";
import { Answers, computeScores, isComplete, profileLabel, side } from "./scoring";

function fill(value: number): Answers {
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, value]));
}

describe("instrumento", () => {
  it("tem 8 itens por eixo", () => {
    for (const axis of AXES) {
      expect(QUESTIONS.filter((q) => q.axis === axis.id)).toHaveLength(8);
    }
  });

  it("tem chaveamento balanceado (4 positivos e 4 negativos por eixo)", () => {
    for (const axis of AXES) {
      const items = QUESTIONS.filter((q) => q.axis === axis.id);
      const pos = items.filter((q) => q.key === 1).length;
      const neg = items.filter((q) => q.key === -1).length;
      expect(pos, `${axis.id} positivos`).toBe(4);
      expect(neg, `${axis.id} negativos`).toBe(4);
    }
  });

  it("não tem ids ou textos duplicados", () => {
    const ids = new Set(QUESTIONS.map((q) => q.id));
    const texts = new Set(QUESTIONS.map((q) => q.text));
    expect(ids.size).toBe(QUESTIONS.length);
    expect(texts.size).toBe(QUESTIONS.length);
  });

  it("evita itens de duas ideias (double-barreled) óbvios", () => {
    // Heurística: " e " ligando duas orações com verbo é suspeito; aqui
    // apenas garantimos que nenhum item usa ' e também ' ou ' e/ou '.
    for (const q of QUESTIONS) {
      expect(q.text).not.toMatch(/ e também | e\/ou /);
    }
  });
});

describe("pontuação", () => {
  it("respostas neutras dão 0 em todos os eixos", () => {
    const s = computeScores(fill(4));
    expect(s).toEqual({ econ: 0, costumes: 0, instituicoes: 0 });
    expect(profileLabel(s)).toBe("Centrista");
  });

  it("concordar com tudo dá 0 (o chaveamento balanceado anula a aquiescência)", () => {
    const s = computeScores(fill(SCALE_MAX));
    expect(s).toEqual({ econ: 0, costumes: 0, instituicoes: 0 });
  });

  it("perfil extremo positivo chega a +100 e negativo a −100", () => {
    const pos: Answers = Object.fromEntries(
      QUESTIONS.map((q) => [q.id, q.key === 1 ? SCALE_MAX : SCALE_MIN]),
    );
    const neg: Answers = Object.fromEntries(
      QUESTIONS.map((q) => [q.id, q.key === 1 ? SCALE_MIN : SCALE_MAX]),
    );
    expect(computeScores(pos)).toEqual({ econ: 100, costumes: 100, instituicoes: 100 });
    expect(computeScores(neg)).toEqual({ econ: -100, costumes: -100, instituicoes: -100 });
    expect(profileLabel(computeScores(pos))).toBe("Liberal-conservador de ordem");
    expect(profileLabel(computeScores(neg))).toBe("Progressista garantista");
  });

  it("a direção de cada item bate com o polo declarado", () => {
    // Concordar totalmente com um item de chave +1 deve mover o eixo para o polo positivo.
    for (const q of QUESTIONS) {
      const answers = { ...fill(4), [q.id]: SCALE_MAX };
      const s = computeScores(answers);
      expect(Math.sign(s[q.axis])).toBe(q.key);
    }
  });

  it("isComplete exige todas as respostas válidas", () => {
    expect(isComplete(fill(4))).toBe(true);
    const partial = fill(4);
    delete partial["E1"];
    expect(isComplete(partial)).toBe(false);
    expect(isComplete({ ...fill(4), E1: 9 })).toBe(false);
  });

  it("side respeita a faixa de centro", () => {
    expect(side(-19)).toBe("center");
    expect(side(-20)).toBe("neg");
    expect(side(20)).toBe("pos");
  });
});
