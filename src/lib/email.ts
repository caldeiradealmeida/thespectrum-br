import "server-only";
import { Resend } from "resend";

/**
 * Envio do e-mail da camada 2. Sem RESEND_API_KEY o envio é apenas logado —
 * o relatório continua acessível na tela pelo link com token.
 */
export async function sendReportEmail(input: { to: string; resultUrl: string; label: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "The Spectrum <nao-responda@thespectrum.com.br>";
  const html = `
  <div style="font-family:Lato,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1F2735;background:#F5F2EA;padding:32px">
    <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6B7488;margin:0 0 12px">The Spectrum</p>
    <h1 style="font-size:24px;line-height:1.25;margin:0 0 16px;color:#2C3A57">Seu relatório completo está pronto</h1>
    <p style="font-size:16px;line-height:1.55">Seu perfil foi classificado como <strong>${escapeHtml(input.label)}</strong>. O relatório com a leitura dos três eixos, as tensões do seu perfil, o melhor argumento do outro lado e três leituras está no link abaixo.</p>
    <p style="margin:28px 0"><a href="${input.resultUrl}" style="background:#2C3A57;color:#fff;text-decoration:none;padding:14px 22px;border-radius:6px;font-weight:700;display:inline-block">Abrir meu relatório</a></p>
    <p style="font-size:13px;color:#6B7488;line-height:1.5">Este link é pessoal. Guardamos seu e-mail apenas para enviar este relatório e, se você autorizou, novidades do The Spectrum. Nunca associamos publicamente seu e-mail às suas respostas. <a href="${input.resultUrl.split("/r/")[0]}/privacidade" style="color:#425273">Política de privacidade</a>.</p>
  </div>`;

  if (!key) {
    console.info(`[spectrum] RESEND_API_KEY ausente — e-mail não enviado para ${input.to}. Link: ${input.resultUrl}`);
    return { sent: false as const };
  }
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: `Seu relatório The Spectrum: ${input.label}`,
    html,
  });
  if (error) {
    console.error("[spectrum] erro ao enviar e-mail", error);
    return { sent: false as const };
  }
  return { sent: true as const };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
