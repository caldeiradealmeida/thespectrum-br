"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getConsent, PIXEL_PATHS, setConsent } from "@/lib/tracking";

/**
 * Banner de consentimento para o Meta Pixel. Aparece só nas páginas em que
 * o pixel pode rodar (entrada e teste) e só até a pessoa decidir.
 * Recusar é tão fácil quanto aceitar — exigência da LGPD e da boa educação.
 */
export function Consent({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depende de cookie, só no cliente
    setShow(PIXEL_PATHS.includes(pathname) && getConsent() === null);
  }, [enabled, pathname]);

  if (!show) return null;

  function decide(v: "granted" | "denied") {
    setConsent(v);
    setShow(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Consentimento de medição"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-3xl mx-auto card p-4 sm:p-5 shadow-[0_8px_32px_rgba(31,39,53,0.14)] flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="m-0 text-sm leading-relaxed flex-1">
          Usamos o pixel da Meta <strong className="text-navy">só nas páginas de entrada</strong>, para saber se os
          anúncios trazem gente que conclui o teste. Ele nunca vê suas respostas nem seu resultado.{" "}
          <a href="/privacidade" className="underline text-navy">
            Saiba mais
          </a>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => decide("denied")}>
            Recusar
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => decide("granted")}>
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
