"use client";

import { useState } from "react";
import { EDUCATION, VOTE_2022 } from "@/lib/demographics";
import { track } from "@/lib/tracking";

/**
 * Bloco opcional depois do resultado. Tudo declarado pela pessoa, tudo
 * pulável, propósito explícito. Não pergunta intenção de voto para 2026
 * (isso configuraria pesquisa eleitoral, que exige registro no TSE).
 */
export function Demographics({ resultId, initial }: { resultId: string; initial: { education: string | null; vote2022: string | null } }) {
  const [education, setEducation] = useState(initial.education ?? "");
  const [vote, setVote] = useState(initial.vote2022 ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(initial.education || initial.vote2022 ? "saved" : "idle");

  async function save() {
    setState("saving");
    try {
      const res = await fetch("/api/demographics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resultId, education: education || null, vote2022: vote || null }),
      });
      if (!res.ok) throw new Error();
      track("demographics_saved", { resultId });
      setState("saved");
    } catch {
      setState("error");
    }
  }

  const select = "border border-rule rounded-md p-3 bg-white w-full";

  return (
    <div className="quiet p-5 sm:p-6">
      <p className="kicker mb-1">Opcional · ajuda a comparar perfis</p>
      <p className="m-0 mb-4 text-sm leading-relaxed text-navy-soft">
        Duas perguntas para cruzar resultados por escolaridade e por voto passado. Anônimo: ficam ligadas só ao código
        deste resultado, nunca a você.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="grid gap-1.5">
          <span className="font-bold text-navy text-sm">Escolaridade</span>
          <select value={education} onChange={(e) => setEducation(e.target.value)} className={select}>
            <option value="">Prefiro não informar</option>
            {Object.entries(EDUCATION).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="font-bold text-navy text-sm">Em quem votou no 2º turno de 2022?</span>
          <select value={vote} onChange={(e) => setVote(e.target.value)} className={select}>
            <option value="">Prefiro não informar</option>
            {Object.entries(VOTE_2022).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button type="button" className="btn btn-ghost btn-sm" onClick={save} disabled={state === "saving" || (!education && !vote)}>
          {state === "saving" ? "Salvando…" : state === "saved" ? "Atualizar" : "Salvar"}
        </button>
        {state === "saved" && <span className="text-sm text-navy-soft">Obrigado — salvo.</span>}
        {state === "error" && <span className="text-sm text-amber">Não deu certo. Tente de novo.</span>}
      </div>
    </div>
  );
}
