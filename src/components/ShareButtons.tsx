"use client";

import { useState } from "react";

export function ShareButtons({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);
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

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "The Spectrum", text, url });
      } catch {}
    }
  }

  return (
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
  );
}
