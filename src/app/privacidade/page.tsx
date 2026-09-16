import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Como o The Spectrum trata seus dados, conforme a LGPD.",
};

const CONTACT = process.env.NEXT_PUBLIC_PRIVACY_CONTACT ?? "contato@caldeiragrowth.com";

export default function PrivacidadePage() {
  return (
    <article className="max-w-2xl mx-auto pt-8 sm:pt-14 leading-relaxed">
      <p className="kicker mb-3">Política de privacidade · versão 2 · atualizada em 16/09/2026</p>
      <h1 className="text-3xl sm:text-4xl font-black text-navy m-0 mb-6">Opinião política é dado sensível. Eis o que fazemos com ela.</h1>

      <h2 className="text-xl font-bold text-navy mt-8 mb-2">O que coletamos</h2>
      <p>
        <strong className="text-navy">Ao fazer o teste:</strong> suas 24 respostas, os três escores calculados, o rótulo do
        perfil, a versão do instrumento e a data. Opcionalmente, se você informar, seu estado, sua faixa etária, como você
        mesmo se define de esquerda a direita, sua escolaridade e seu voto no 2º turno de 2022 — todas perguntas que você
        pode pular. Nada disso é ligado a nome, e-mail, endereço IP ou identificador de dispositivo. O resultado recebe um
        código aleatório que só quem tem o link conhece.
      </p>
      <p>
        <strong className="text-navy">Se você pedir o relatório completo:</strong> seu e-mail e a sua escolha de receber ou
        não novidades. O e-mail é guardado numa tabela separada das respostas, ligado apenas ao código do resultado, e
        nunca é exibido na página pública.
      </p>
      <p>
        <strong className="text-navy">Medição de uso:</strong> registramos eventos anônimos de navegação (abriu a página,
        começou o teste, concluiu, pediu o relatório, clicou em compartilhar), a origem do acesso (por exemplo, o
        parâmetro <code>utm_source</code> de um anúncio ou o site de onde veio) e se o aparelho é celular ou computador.
        Esses eventos não têm IP, não têm identificador do aparelho e usam um código aleatório que dura só enquanto a aba
        está aberta.
      </p>
      <p>
        <strong className="text-navy">Pixel da Meta (com o seu consentimento):</strong> para medir se os anúncios no
        Facebook e no Instagram trazem pessoas que concluem o teste, carregamos o pixel da Meta <em>apenas</em> na página
        inicial e na página do teste, e só depois que você aceita no aviso exibido. Ele registra que a página foi aberta,
        que o teste começou e que foi concluído — nunca as respostas, os escores, o perfil ou a página do resultado, onde
        o pixel não é carregado. Recusar não muda nada na sua experiência. A escolha fica gravada num cookie por 6 meses e
        pode ser revista apagando os cookies do site. A Meta é controladora independente dos dados que o pixel dela coleta;
        veja a política de dados da Meta.
      </p>
      <p>
        <strong className="text-navy">O que não coletamos:</strong> endereço IP, geolocalização, gravação de tela ou de
        sessão, identificadores de publicidade fora do pixel descrito acima. Além do cookie de consentimento, o único
        cookie usado guarda, no seu navegador, a liberação do relatório do seu próprio resultado.
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
