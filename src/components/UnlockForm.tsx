"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function UnlockForm({ resultId }: { resultId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resultId, email, consentUpdates: consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível liberar o relatório.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado.");
      setState("error");
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-1.5">
        <span className="font-bold text-sm">Seu e-mail</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          className="rounded-md p-3 bg-white text-ink border border-rule"
        />
      </label>
      <label className="flex items-start gap-2 text-sm opacity-90">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>Quero receber novidades do The Spectrum por e-mail (opcional).</span>
      </label>
      <p className="text-xs opacity-80 m-0 leading-relaxed">
        Usamos seu e-mail para enviar o link deste relatório. Ele fica guardado separado das suas respostas e nunca é
        exibido publicamente. Você pode pedir a exclusão a qualquer momento.{" "}
        <Link href="/privacidade" className="underline">
          Política de privacidade
        </Link>
        .
      </p>
      {error && <p className="text-sm text-amber m-0">{error}</p>}
      <button className="btn btn-primary" disabled={state === "sending"} style={{ background: "#fff", color: "var(--navy)" }}>
        {state === "sending" ? "Preparando seu relatório…" : "Liberar meu relatório completo"}
      </button>
    </form>
  );
}
