"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getConsent, PIXEL_PATHS } from "@/lib/tracking";

/**
 * Carrega o Meta Pixel apenas (a) com consentimento e (b) nas páginas de
 * entrada. Na página de resultado o script nem é injetado — a Meta nunca
 * recebe a URL /r/<id> nem qualquer coisa que revele o perfil.
 */
export function MetaPixel({ pixelId }: { pixelId: string | undefined }) {
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    if (!pixelId || !PIXEL_PATHS.includes(pathname)) return;

    function boot() {
      if (getConsent() !== "granted") return;
      if (!loaded.current) {
        loaded.current = true;
        const w = window as unknown as { fbq?: unknown; _fbq?: unknown };
        if (!w.fbq) {
          // Bootstrap oficial do pixel, sem eval.
          const s = document.createElement("script");
          s.async = true;
          s.src = "https://connect.facebook.net/en_US/fbevents.js";
          const q = function (this: unknown, ...args: unknown[]) {
            const f = q as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] };
            if (f.callMethod) f.callMethod(...args);
            else f.queue.push(args);
          } as unknown as { queue: unknown[]; loaded: boolean; version: string; push: unknown };
          q.queue = [];
          q.loaded = true;
          q.version = "2.0";
          q.push = q;
          w.fbq = q;
          w._fbq = q;
          document.head.appendChild(s);
        }
        // Sem "eventos automáticos" nem advanced matching: só o que mandamos.
        window.fbq?.("set", "autoConfig", false, pixelId);
        window.fbq?.("init", pixelId);
      }
      window.fbq?.("track", "PageView");
    }

    boot();
    const onConsent = () => boot();
    window.addEventListener("sp:consent", onConsent);
    return () => window.removeEventListener("sp:consent", onConsent);
  }, [pixelId, pathname]);

  return null;
}
