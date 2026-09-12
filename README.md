# The Spectrum — Brasil

Teste de posicionamento político em três eixos (Economia, Costumes, Instituições e segurança), reconstruído para a realidade brasileira. Substitui a versão Flask de 2024.

## Como está organizado

```
src/lib/instrument.ts     eixos e as 24 afirmações (chaveamento balanceado)
src/lib/scoring.ts        cálculo dos escores, rótulos, posições fortes
src/lib/instrument.test.ts testes do instrumento e da pontuação (vitest)
src/lib/db.ts             persistência (Supabase; cai para memória sem env)
src/lib/report.ts         relatório da camada 2 (IA com fallback determinístico)
src/lib/readings.ts       lista curada de leituras (a IA só recomenda daqui)
src/lib/candidates.ts     alinhamento com candidaturas 2026 — RASCUNHO, desligado
src/lib/email.ts          e-mail com o link do relatório (Resend)
src/app/                  landing, /teste, /r/[id] (+ imagem OG), /metodologia, /privacidade
src/app/api/results       POST: grava respostas e devolve id
src/app/api/unlock        POST: e-mail + consentimento → gera relatório, envia e-mail, libera cookie
tests/e2e.mjs             fluxo ponta a ponta com Playwright
supabase/migrations/      schema (já aplicado no projeto caldeira-cgi)
```

## Camadas do produto

1. **Resultado imediato, sem cadastro** — rótulo, três escores, descrição por eixo, comparação com participantes (quando n ≥ 30), link e imagem para compartilhar.
2. **Relatório completo, com e-mail** — texto personalizado (IA), tensões do perfil, melhor argumento do outro lado, três leituras. Opcionalmente, proximidade com candidaturas (`CANDIDATES_ENABLED=true`, só depois de revisar os dados).
3. **Camada paga** — não implementada de propósito; entra depois do primeiro turno, oferecida a quem já liberou a camada 2.

## Rodando

```bash
npm install
cp .env.example .env.local   # preencha ao menos SUPABASE_SERVICE_ROLE_KEY
npm run dev                  # http://localhost:3000
npm test                     # testes do instrumento
npm run build && npm start   # produção local
node tests/e2e.mjs           # fluxo completo (com o servidor rodando)
```

Sem `SUPABASE_*` o app funciona com armazenamento em memória (bom para testar; os dados somem ao reiniciar). Sem `ANTHROPIC_API_KEY` o relatório usa o template. Sem `RESEND_API_KEY` o e-mail não é enviado, mas o relatório aparece na tela.

## Deploy na Vercel

1. Crie um projeto novo a partir desta pasta (ou aponte o projeto `thespectrum` para este repositório).
2. Configure as variáveis de `.env.example` em *Settings → Environment Variables*.
3. `NEXT_PUBLIC_SITE_URL` deve ser o domínio final, para que a imagem de compartilhamento e os links por e-mail apontem certo.

## Banco

Tabelas no projeto Supabase `caldeira-cgi` (schema `public`, prefixo `spectrum_`): `spectrum_results`, `spectrum_responses`, `spectrum_unlocks`, `spectrum_reports`, e a função `spectrum_percentiles(e, c, i)`. RLS está ligado sem políticas públicas: só o servidor, com a chave service_role, acessa. IP e geolocalização não são gravados.

## Antes de publicar

- Revisar as 24 afirmações e os nomes de perfil em `src/lib/instrument.ts` / `scoring.ts`.
- Revisar `src/lib/candidates.ts` com fontes (programas no DivulgaCand/TSE) antes de ligar `CANDIDATES_ENABLED`.
- Definir o e-mail de contato LGPD (`NEXT_PUBLIC_PRIVACY_CONTACT`) e o remetente do Resend com domínio verificado.
- Trocar o domínio em `NEXT_PUBLIC_SITE_URL`.

## Decisões registradas

- Sem pixels de terceiros, sem IP, sem geolocalização: opinião política é dado sensível (LGPD art. 5º, II).
- Rótulos sem "extrema"/"radical".
- Chaveamento balanceado com teste automático — o erro de inversão da versão de 2024 não pode voltar.
- Escala 7 pontos, 8 itens por eixo; cortes de centro em ±20 até haver dados para calibrar.
- Respostas individuais são persistidas com a versão do instrumento, para recalibrar sem perder histórico.
