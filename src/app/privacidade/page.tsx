import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Como o The Spectrum trata seus dados, conforme a LGPD.",
};

const CONTACT = process.env.NEXT_PUBLIC_PRIVACY_CONTACT ?? "contato@caldeiragrowth.com";

export default function PrivacidadePage() {
  return (
    <article className="max-w-2xl mx-auto pt-8 sm:pt-14 leading-relaxed">
      <p className="kicker mb-3">Política de privacidade · versão 1</p>
      <h1 className="text-3xl sm:text-4xl font-black text-navy m-0 mb-6">Opinião política é dado sensível. Eis o que fazemos com ela.</h1>

      <h2 className="text-xl font-bold text-navy mt-8 mb-2">O que coletamos</h2>
      <p>
        <strong className="text-navy">Ao fazer o teste:</strong> suas 24 respostas, os três escores calculados, o rótulo do
        perfil, a versão do instrumento e a data. Opcionalmente, se você informar, seu estado e sua faixa etária. Nada
        disso é ligado a nome, e-mail, endereço IP ou identificador de dispositivo. O resultado recebe um código aleatório
        que só quem tem o link conhece.
      </p>
      <p>
        <strong className="text-navy">Se você pedir o relatório completo:</strong> seu e-mail e a sua escolha de receber ou
        não novidades. O e-mail é guardado numa tabela separada das respostas, ligado apenas ao código do resultado, e
        nunca é exibido na página pública.
      </p>
      <p>
        <strong className="text-navy">O que não coletamos:</strong> endereço IP, geolocalização, cookies de rastreamento,
        pixels de redes sociais ou identificadores de publicidade. O único cookie usado guarda, no seu navegador, a
        liberação do relatório do seu próprio resultado.
      </p>

      <h2 className="text-xl font-bold text-navy mt-8 mb-2">Base legal e finalidade</h2>
      <p>
        Suas respostas revelam opinião política e, por isso, são dados pessoais sensíveis nos termos do art. 5º, II, e
        art. 11 da Lei 13.709/2018 (LGPD). O tratamento se baseia no seu consentimento específico e destacado, dado ao
        iniciar o teste, para a finalidade de calcular e exibir o seu resultado e, de forma agregada e anônima, calibrar o
        instrumento. O e-mail é tratado com base no consentimento para envio do relatório e, se marcado, de comunicações
        do The Spectrum.
      </p>

      <h2 className="text-xl font-bold text-navy mt-8 mb-2">Compartilhamento</h2>
      <p>
        Não vendemos, alugamos nem cedemos dados a terceiros. Os dados ficam armazenados em provedor de nuvem na região de
        São Paulo. Para redigir o relatório completo, as respostas (sem e-mail, sem nome, sem código do resultado) são
        enviadas a um provedor de modelo de linguagem, que não as usa para treinamento. Se um dia publicarmos análises
        agregadas, elas nunca permitirão identificar uma pessoa.
      </p>

      <h2 className="text-xl font-bold text-navy mt-8 mb-2">Seus direitos</h2>
      <p>
        Você pode pedir a confirmação, o acesso, a correção ou a exclusão dos seus dados, e revogar o consentimento, a
        qualquer momento, escrevendo para <a href={`mailto:${CONTACT}`} className="text-navy underline">{CONTACT}</a>. Para
        localizar um resultado, informe o código do link (a parte depois de <code>/r/</code>). Respondemos em até 15 dias.
      </p>

      <h2 className="text-xl font-bold text-navy mt-8 mb-2">Retenção</h2>
      <p>
        Respostas e escores são mantidos, de forma anônima, enquanto servirem à calibração do instrumento. E-mails sem
        consentimento para novidades são apagados 12 meses após o envio do relatório.
      </p>

      <h2 className="text-xl font-bold text-navy mt-8 mb-2">Responsável</h2>
      <p>
        The Spectrum, um projeto de Denis Caldeira de Almeida / Caldeira Growth. Contato do encarregado:{" "}
        <a href={`mailto:${CONTACT}`} className="text-navy underline">{CONTACT}</a>.
      </p>
    </article>
  );
}
