import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Um teste de 24 afirmações que posiciona você em três eixos da política brasileira: Economia, Costumes e Instituições. Sem cadastro, sem rastreadores.",
  openGraph: {
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="px-5 sm:px-8 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-2 no-underline">
              <span className="font-black text-navy text-lg tracking-tight">The Spectrum</span>
              <span className="kicker hidden sm:inline">Brasil</span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/metodologia" className="text-navy-soft hover:text-navy">
                Metodologia
              </Link>
              <Link href="/teste" className="btn btn-primary btn-sm">
                Fazer o teste
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 px-5 sm:px-8 pb-16">{children}</main>
        <footer className="rule px-5 sm:px-8 py-8 text-sm text-muted">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="m-0">
              © {new Date().getFullYear()} The Spectrum · um projeto de Denis Caldeira. Não vendemos nem compartilhamos sua posição política.
            </p>
            <div className="flex gap-4">
              <Link href="/metodologia" className="hover:text-navy">
                Metodologia
              </Link>
              <Link href="/privacidade" className="hover:text-navy">
                Privacidade
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
