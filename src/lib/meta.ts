import "server-only";
import { createHash } from "node:crypto";

/**
 * Meta Conversions API — envia do servidor o evento de conclusão do teste.
 *
 * O que vai: nome do evento, id de deduplicação (o mesmo do Pixel no
 * navegador), URL da página de origem e os cookies _fbp/_fbc que o próprio
 * Pixel gravou — só quando a pessoa consentiu. O que NUNCA vai: escores,
 * respostas, rótulo do perfil, IP, e-mail.
 *
 * Sem META_PIXEL_ID / META_CAPI_TOKEN, a função é um no-op.
 */

export interface CapiInput {
  eventName: "Lead" | "CompleteRegistration" | "ViewContent";
  eventId: string;
  sourceUrl: string;
  cookies: string | null; // header Cookie da requisição
  userAgent: string | null;
  email?: string | null; // só no desbloqueio (camada 2), com consentimento
}

function cookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m?.[1];
}

export async function sendCapiEvent(input: CapiInput): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID ?? process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return;
  if (cookie(input.cookies, "sp_consent") !== "granted") return;

  const user_data: Record<string, unknown> = {};
  const fbp = cookie(input.cookies, "_fbp");
  const fbc = cookie(input.cookies, "_fbc");
  if (fbp) user_data.fbp = fbp;
  if (fbc) user_data.fbc = fbc;
  if (input.userAgent) user_data.client_user_agent = input.userAgent;
  if (input.email) user_data.em = [createHash("sha256").update(input.email.trim().toLowerCase()).digest("hex")];

  const payload = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.sourceUrl,
        action_source: "website",
        user_data,
      },
    ],
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.warn("[meta capi]", res.status, await res.text());
  } catch (err) {
    console.warn("[meta capi] falha", err);
  }
}
