"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/tracking";

/** Registra page_view anônimo no nosso backend (sem pixel, sem cookie). */
export function PageTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    const resultId = pathname.startsWith("/r/") ? pathname.split("/")[2] : undefined;
    track(resultId ? "result_view" : "page_view", { resultId });
  }, [pathname]);
  return null;
}
