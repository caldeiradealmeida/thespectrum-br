import type { Metadata } from "next";
import { AXES, QUESTIONS, INSTRUMENT_VERSION } from "@/lib/instrument";
import { CENTER_BAND } from "@/lib/scoring";

export const metadata: Metadata = {
  title: "Metodologia",
  description: "Como o The Spectrum calcula o seu posicionamento: três eixos, 24 afirmações, chaveamento balanceado.",
};

export default function MetodologiaPage() {
  return (
    <article className="max-w-2xl mx-auto pt-8 sm:pt-14 leading-relaxed">
      <p className="kicker mb-3">Metodologia · instrumento v{INSTRUMENT_VERSION}</p>
      <h1 className="text-3xl sm:text-4xl font-black text-navy m-0 mb-6">Como o resultado é calculado</h1>

      <h2 className="text-xl font-bold text-navy mt-8 mb-2">Por que três eixos</h2>
      <p>
        A política brasileira não cabe numa linha de esquerda a direita. Boa parte do eleitorado combina posições que uma
        régua única obrigaria a somar e cancelar: menos Estado na economia e mais Estado na segurança, ou programas sociais
        com valores conservadores. O The Spectrum separa três dimensões que, na pesquisa em ciência política sobre o
        Brasil, aparecem de forma consistente como independentes entre si.
      </p>
      <ul className="pl-5">
        {AXES.map((a) => (
          <li key={a.id} className="mb-2">
            <strong className="text-navy">{a.name}</strong> — {a.question}{" "}
            <span className="text-muted">
              ({a.negativePole} ↔ {a.positivePole})
            </span>
          </li>
        ))}
      </ul>
      <p>
        O eixo de globalismo e nacionalismo, comum em testes feitos para os Estados Unidos e a Europa, foi deixado de fora
        por ter baixa relevância na disputa brasileira. Em seu lugar entra o eixo de instituições e segurança, que hoje
        separa perfis que os outros dois eixos não distinguem.
      </p>

      <h2 className="text-xl font-bold text-navy mt-8 mb-2">As afirmações</h2>
      <p>
        São {QUESTIONS.length} afirmações, {QUESTIONS.length / AXES.length} por eixo, respondidas numa escala de 1 (discordo
        totalmente) a 7 (concordo totalmente). Cada afirmação trata de um único tema e usa exemplos brasileiros concretos.
        Em cada eixo, metade das afirmações é formulada em uma direção e metade na direção oposta. Isso neutraliza a
        tendência de concordar com tudo: quem marca &ldquo;concordo&rdquo; em todas as afirmações termina exatamente no
        centro dos três eixos.
      </p>

      <h2 className="text-xl font-bold text-navy mt-8 mb-2">O cálculo</h2>
      <p>
        Cada resposta é convertida para um valor entre −1 e +1 (o 4, neutro, vale 0) e multiplicada pela direção da
        afirmação. A média das oito afirmações de um eixo, multiplicada por 100, é o seu escore naquele eixo, de −100 a
        +100. Escores entre −{CENTER_BAND} e +{CENTER_BAND} são tratados como centro; o rótulo do perfil combina o lado de cada
        eixo em nomes descritivos, sem &ldquo;extrema&rdquo; nem &ldquo;radical&rdquo;.
      </p>
      <p>
        A comparação com outros participantes (&ldquo;mais para o lado X que N% das pessoas&rdquo;) usa a distribuição real
        de quem já respondeu, e só aparece quando há pelo menos 30 respostas.
      </p>

      <h2 className="text-xl font-bold text-navy mt-8 mb-2">Limites</h2>
      <p>
        Este é um instrumento de autoconhecimento, não uma pesquisa eleitoral nem um diagnóstico. A amostra de quem
        responde não é representativa da população brasileira. As afirmações estão em fase de calibração: à medida que as
        respostas se acumulam, itens que não discriminam bem serão revisados, e a versão do instrumento ficará registrada
        em cada resultado para que comparações no tempo continuem válidas.
      </p>

      <h2 className="text-xl font-bold text-navy mt-8 mb-2">O relatório completo</h2>
      <p>
        O relatório da segunda camada é redigido por um modelo de linguagem a partir das suas 24 respostas, com instruções
        para não julgar, não inventar fatos, não recomendar voto e sugerir apenas leituras de uma lista revisada por
        pessoas. Ele complementa os números; não os substitui.
      </p>
    </article>
  );
}
