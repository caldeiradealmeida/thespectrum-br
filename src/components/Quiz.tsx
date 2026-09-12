"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AXES, QUESTIONS, SCALE_LABELS, SCALE_MAX, SCALE_MIN, Question } from "@/lib/instrument";

const STORAGE_KEY = "spectrum:answers:v1";

/** Intercala os eixos (E1, C1, I1, E2, …) para a experiência não ficar monotemática. */
function interleave(): Question[] {
  const byAxis = AXES.map((a) => QUESTIONS.filter((q) => q.axis === a.id));
  const out: Question[] = [];
  const n = Math.max(...byAxis.map((l) => l.length));
  for (let i = 0; i < n; i++) for (const list of byAxis) if (list[i]) out.push(list[i]);
  return out;
}

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const AGES = ["16-24", "25-34", "35-44", "45-59", "60+"];

export function Quiz() {
  const router = useRouter();
  const order = useMemo(() => interleave(), []);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"intro" | "quiz" | "extra" | "sending">("intro");
  const [consent, setConsent] = useState(false);
  const [uf, setUf] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restaura progresso (por conveniência; falha silenciosa se storage bloqueado).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, number>;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restauração única após hidratação
        setAnswers(saved);
        const firstMissing = order.findIndex((q) => !(q.id in saved));
        setIndex(firstMissing === -1 ? order.length - 1 : firstMissing);
      }
    } catch {}
    setHydrated(true);
  }, [order]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {}
  }, [answers, hydrated]);

  const current = order[index];
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / order.length) * 100);

  const choose = useCallback(
    (value: number) => {
      setAnswers((prev) => ({ ...prev, [current.id]: value }));
      window.setTimeout(() => {
        if (index + 1 < order.length) setIndex(index + 1);
        else setPhase("extra");
      }, 160);
    },
    [current, index, order.length],
  );

  // Atalhos de teclado 1–7 e seta para voltar.
  useEffect(() => {
    if (phase !== "quiz") return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= SCALE_MIN && n <= SCALE_MAX) choose(n);
      if (e.key === "ArrowLeft" && index > 0) setIndex(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, index, phase]);

  async function submit() {
    setPhase("sending");
    setError(null);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers, uf: uf || null, ageRange: age || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
      router.push(`/r/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado. Tente de novo.");
      setPhase("extra");
    }
  }

  if (!hydrated) return null;

  if (phase === "intro") {
    return (
      <div className="max-w-xl mx-auto pt-8 sm:pt-16">
        <p className="kicker mb-3">Antes de começar</p>
        <h1 className="text-3xl font-black text-navy m-0 mb-3">Como responder</h1>
        <p className="text-navy-soft leading-relaxed">
          Você verá {order.length} afirmações sobre o Brasil. Para cada uma, marque de 1 (discordo totalmente) a 7
          (concordo totalmente). Não existe resposta certa: responda pelo que você pensa, não pelo que acha que deveria
          pensar. Leva cerca de cinco minutos.
        </p>
        <div className="card p-6 mt-6 grid gap-4">
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            <span>
              Autorizo o uso das minhas respostas, que revelam opinião política, para calcular e exibir meu resultado e,
              de forma anônima e agregada, calibrar o teste. Nenhum dado de identificação é coletado nesta etapa.{" "}
              <a href="/privacidade" className="underline text-navy" target="_blank" rel="noopener">
                Política de privacidade
              </a>
              .
            </span>
          </label>
          <button className="btn btn-primary" disabled={!consent} onClick={() => setPhase("quiz")}>
            {answered > 0 ? "Continuar de onde parei" : "Começar"}
          </button>
        </div>
      </div>
    );
  }

  if (phase !== "quiz") {
    const complete = order.every((q) => q.id in answers);
    return (
      <div className="max-w-xl mx-auto pt-8 sm:pt-16">
        <p className="kicker mb-3">Quase lá</p>
        <h1 className="text-3xl font-black text-navy m-0 mb-3">Duas perguntas opcionais</h1>
        <p className="text-navy-soft leading-relaxed mb-6">
          Servem só para comparar seu resultado com pessoas do seu estado e da sua faixa etária. Você pode pular.
        </p>
        <div className="card p-6 grid gap-5">
          <label className="grid gap-1.5">
            <span className="font-bold text-navy text-sm">Estado</span>
            <select value={uf} onChange={(e) => setUf(e.target.value)} className="border border-rule rounded-md p-3 bg-white">
              <option value="">Prefiro não informar</option>
              {UFS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="font-bold text-navy text-sm">Faixa etária</span>
            <select value={age} onChange={(e) => setAge(e.target.value)} className="border border-rule rounded-md p-3 bg-white">
              <option value="">Prefiro não informar</option>
              {AGES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="text-sm text-red-700 m-0">{error}</p>}
          {!complete && (
            <p className="text-sm text-amber m-0">
              Faltam respostas.{" "}
              <button className="underline" onClick={() => { setPhase("quiz"); setIndex(order.findIndex((q) => !(q.id in answers))); }}>
                Voltar para completar
              </button>
            </p>
          )}
          <button className="btn btn-primary" disabled={!complete || phase === "sending"} onClick={submit}>
            {phase === "sending" ? "Calculando…" : "Ver meu resultado"}
          </button>
        </div>
      </div>
    );
  }

  const axis = AXES.find((a) => a.id === current.axis)!;
  const selected = answers[current.id];

  return (
    <div className="max-w-2xl mx-auto pt-6 sm:pt-12">
      {/* Progresso */}
      <div className="flex items-center justify-between text-sm text-muted mb-2">
        <span>
          {index + 1} de {order.length}
        </span>
        <span className="kicker" style={{ fontSize: "0.68rem" }}>
          {axis.name}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-cream-deep overflow-hidden mb-8" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-navy transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="card p-6 sm:p-10" key={current.id}>
        <p className="text-2xl sm:text-[1.7rem] font-bold text-navy leading-snug m-0 mb-8 min-h-[4.5rem]">{current.text}</p>

        <div className="likert" role="radiogroup" aria-label="Seu grau de concordância">
          {Array.from({ length: SCALE_MAX - SCALE_MIN + 1 }, (_, i) => i + SCALE_MIN).map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={selected === v}
              aria-label={SCALE_LABELS[v]}
              title={SCALE_LABELS[v]}
              onClick={() => choose(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted mt-2">
          <span>Discordo totalmente</span>
          <span>Concordo totalmente</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5">
        <button className="btn btn-ghost btn-sm" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          ← Voltar
        </button>
        <span className="text-xs text-muted hidden sm:inline">Dica: teclas 1 a 7 respondem</span>
        {selected && index + 1 < order.length ? (
          <button className="btn btn-ghost btn-sm" onClick={() => setIndex(index + 1)}>
            Próxima →
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
