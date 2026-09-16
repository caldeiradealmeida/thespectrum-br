/**
 * Rastreamento próprio, anônimo e compatível com a LGPD.
 *
 * - Sem IP, sem user-agent completo, sem cookie persistente.
 * - `session_id` é aleatório e vive só na aba (sessionStorage).
 * - UTMs são lidas na primeira página e guardadas na aba, para atribuir a
 *   conclusão do teste à campanha de origem.
 * - Nunca envia respostas nem escores: só o nome do evento e o id público do
 *   resultado (que já é o do link).
 *
 * O Meta Pixel é tratado à parte, em `MetaPixel.tsx`, e só roda com
 * consentimento explícito e apenas nas páginas de entrada.
 */

export type EventName =
  | "page_view"
  | "quiz_start"
  | "quiz_complete"
  | "result_view"
  | "teaser_click"
  | "sticky_click"
  | "unlock"
  | "share_click"
  | "demographics_saved";

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

const SESSION_KEY = "sp:session";
const UTM_KEY = "sp:utm";

function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {}
}

export function sessionId(): string {
  let id = safeGet(SESSION_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    safeSet(SESSION_KEY, id);
  }
  return id;
}

/** Lê as UTMs da URL atual (se houver) e persiste na aba; senão devolve as guardadas. */
export function attribution(): Attribution {
  if (typeof window === "undefined") return { utm_source: null, utm_medium: null, utm_campaign: null };
  const params = new URLSearchParams(window.location.search);
  const fromUrl: Attribution = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };
  if (fromUrl.utm_source || fromUrl.utm_medium || fromUrl.utm_campaign) {
    safeSet(UTM_KEY, JSON.stringify(fromUrl));
    return fromUrl;
  }
  // Sem UTM: se veio de fora do site, guarda o domínio de origem como fonte.
  const stored = safeGet(UTM_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Attribution;
    } catch {}
  }
  let source: string | null = null;
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host && host !== window.location.hostname) source = host.replace(/^(www|l|lm)\./, "");
    }
  } catch {}
  const fallback: Attribution = { utm_source: source, utm_medium: source ? "referral" : null, utm_campaign: null };
  safeSet(UTM_KEY, JSON.stringify(fallback));
  return fallback;
}

export function device(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia?.("(max-width: 640px)").matches ? "mobile" : "desktop";
}

/** Envia um evento ao nosso próprio backend. Nunca lança. */
export function track(event: EventName, extra: { resultId?: string; meta?: Record<string, unknown> } = {}) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      event,
      session_id: sessionId(),
      result_id: extra.resultId ?? null,
      path: window.location.pathname,
      ...attribution(),
      device: device(),
      meta: extra.meta ?? null,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/events", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch {}
}

// ------------------------------------------------------------ Consentimento

export type Consent = "granted" | "denied" | null;
const CONSENT_KEY = "sp_consent";

export function getConsent(): Consent {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)sp_consent=(granted|denied)/);
  return (m?.[1] as Consent) ?? null;
}

export function setConsent(value: Exclude<Consent, null>) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 180; // 6 meses
  document.cookie = `${CONSENT_KEY}=${value}; path=/; max-age=${maxAge}; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
  window.dispatchEvent(new CustomEvent("sp:consent", { detail: value }));
}

/** Páginas em que o Meta Pixel pode rodar: só as de entrada, nunca o resultado. */
export const PIXEL_PATHS = ["/", "/teste"];

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Dispara evento no Pixel se ele estiver carregado (i.e., com consentimento). */
export function pixelTrack(name: string, params: Record<string, unknown> = {}, eventId?: string) {
  try {
    window.fbq?.("track", name, params, eventId ? { eventID: eventId } : undefined);
  } catch {}
}
