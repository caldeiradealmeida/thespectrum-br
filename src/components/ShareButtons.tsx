"use client";

import { useState } from "react";

export function ShareButtons({ url, label, resultId }: { url: string; label: string; resultId: string }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const text = `Meu perfil no The Spectrum: ${label}. Descubra o seu:`;
  const enc = encodeURIComponent;
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
    { name: "X", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { name: "Threads", href: `https://www.threads.net/intent/post?text=${enc(`${text} ${url}`)}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  /**
   * Instagram não aceita compartilhamento por link. Geramos a imagem no
   * servidor e, no celular, abrimos a folha de compartilhamento nativa com o
   * arquivo (que lista Instagram Stories/Feed). Sem suporte, baixamos o PNG.
   */
  async function shareImage(format: "story" | "feed" | "square") {
    setBusy(format);
    try {
      const res = await fetch(`/r/${resultId}/card?f=${format}`);
      const blob = await res.blob();
      const file = new File([blob], `thespectrum-${format}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "The Spectrum", text: `${text} ${url}` });
          return;
        } catch {
          /* usuário cancelou ou o app não aceitou; cai no download */
        }
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } finally {
      setBusy(null);
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "The Spectrum", text, url });
      } catch {}
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            {l.name}
          </a>
        ))}
        <button type="button" onClick={copy} className="btn btn-ghost btn-sm">
          {copied ? "Link copiado ✓" : "Copiar link"}
        </button>
        <span className="sm:hidden">
          <button type="button" onClick={nativeShare} className="btn btn-primary btn-sm">
            Compartilhar…
          </button>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted mr-1">Imagem para Instagram:</span>
        <button type="button" onClick={() => shareImage("story")} disabled={busy !== null} className="btn btn-ghost btn-sm">
          {busy === "story" ? "Gerando…" : "Stories (9:16)"}
        </button>
        <button type="button" onClick={() => shareImage("feed")} disabled={busy !== null} className="btn btn-ghost btn-sm">
          {busy === "feed" ? "Gerando…" : "Feed (4:5)"}
        </button>
        <button type="button" onClick={() => shareImage("square")} disabled={busy !== null} className="btn btn-ghost btn-sm">
          {busy === "square" ? "Gerando…" : "Quadrada (1:1)"}
        </button>
      </div>
    </div>
  );
}
