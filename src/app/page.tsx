import Link from "next/link";
import { AXES, QUESTIONS } from "@/lib/instrument";
import { AxisBar } from "@/components/AxisBar";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <section className="pt-10 sm:pt-20 pb-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="kicker mb-4">Teste de posicionamento político · Brasil 2026</p>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black leading-[1.05] text-navy tracking-tight m-0">
            Onde você está no mapa político brasileiro?
          </h1>
          <p className="text-lg sm:text-xl text-navy-soft leading-relaxed mt-6 mb-8 max-w-xl">
            Vinte e quatro afirmações sobre o Brasil real — impostos, Bolsa Família, armas, aborto, STF, urnas —
            e uma resposta honesta em três eixos, sem rótulo de &ldquo;extrema&rdquo; nem cadastro para ver o resultado.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/teste" className="btn btn-primary text-lg px-7 py-4">
              Fazer o teste
            </Link>
            <span className="text-sm text-muted">{QUESTIONS.length} afirmações · cerca de 5 minutos · gratuito</span>
          </div>
        </div>

        {/* Amostra de resultado */}
        <div className="card p-6 sm:p-7">
          <p className="kicker mb-1">Exemplo de resultado</p>
          <p className="text-2xl font-black text-navy m-0">Liberal pragmático de ordem</p>
          <div className="rule my-4" />
          {AXES.map((axis, i) => (
            <AxisBar key={axis.id} axis={axis} score={[38, -8, 27][i]} compact />
          ))}
          <p className="text-xs text-muted mt-3 mb-0">
            Perfil ilustrativo. O seu sai com uma imagem própria para compartilhar.
          </p>
        </div>
      </section>

      {/* Eixos */}
      <section className="py-12 rule">
        <p className="kicker mb-2">Três eixos, não uma linha</p>
        <h2 className="text-2xl sm:text-3xl font-black text-navy m-0 mb-3 max-w-2xl">
          Esquerda e direita não cabem numa régua só.
        </h2>
        <p className="text-navy-soft max-w-2xl leading-relaxed mb-8">
          Muita gente quer menos Estado na economia e mais Estado na segurança. Outra tanta defende programas sociais e
          valores conservadores. Um único eixo esconde isso. Três eixos mostram.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {AXES.map((axis) => (
            <div key={axis.id} className="card p-6">
              <p className="kicker mb-2">{axis.name}</p>
              <p className="font-bold text-navy text-lg leading-snug m-0 mb-3">{axis.question}</p>
              <p className="text-sm text-muted m-0">
                <span className="font-bold text-navy-soft">{axis.negativePole}</span> ↔{" "}
                <span className="font-bold text-navy-soft">{axis.positivePole}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona / confiança */}
      <section className="py-12 rule grid gap-8 md:grid-cols-2">
        <div>
          <p className="kicker mb-2">Como funciona</p>
          <h2 className="text-2xl font-black text-navy m-0 mb-4">Duas camadas, você escolhe até onde ir.</h2>
          <p className="leading-relaxed text-navy-soft">
            <strong className="text-navy">Na hora, sem pedir nada:</strong> sua posição nos três eixos, um nome para o
            seu perfil e uma imagem pronta para compartilhar.
          </p>
          <p className="leading-relaxed text-navy-soft">
            <strong className="text-navy">Se quiser ir além, com seu e-mail:</strong> um relatório personalizado que
            cruza suas respostas, aponta as tensões do seu perfil, apresenta o melhor argumento de quem pensa o oposto e
            sugere três leituras.
          </p>
        </div>
        <div className="callout p-7">
          <p className="kicker mb-2" style={{ color: "var(--accent)" }}>
            Privacidade
          </p>
          <h3 className="text-xl font-bold m-0 mb-3">Opinião política é dado sensível. Tratamos como tal.</h3>
          <p className="leading-relaxed m-0 opacity-90">
            Não há pixel de redes sociais, não guardamos seu endereço IP e nunca ligamos publicamente seu e-mail às suas
            respostas. Os dados agregados servem apenas para calibrar o instrumento.{" "}
            <Link href="/privacidade" className="underline">
              Leia a política completa
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-12 rule text-center">
        <Link href="/teste" className="btn btn-primary text-lg px-8 py-4">
          Começar agora
        </Link>
      </section>
    </div>
  );
}
