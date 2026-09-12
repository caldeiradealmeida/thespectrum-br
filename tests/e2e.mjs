// Fluxo ponta a ponta contra `next start` (sem Supabase: armazenamento em memória).
// Uso: node tests/e2e.mjs [baseUrl] [screenshotDir]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const shots = process.argv[3] ?? null;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const shot = async (name) => shots && page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });

await page.goto(base);
await shot("01-landing");
await page.click("text=Fazer o teste");
await page.waitForURL("**/teste");
await page.check("input[type=checkbox]");
await page.click("button:has-text('Começar')");
await shot("02-quiz");

// Responde as 24: alterna entre 2 e 6 para gerar um perfil não-centrista.
for (let i = 0; i < 24; i++) {
  const v = i % 3 === 0 ? 6 : i % 3 === 1 ? 2 : 5;
  await page.click(`.likert button:nth-child(${v})`);
  await page.waitForTimeout(220);
}
await page.waitForSelector("text=Duas perguntas opcionais");
await page.selectOption("select >> nth=0", "SP");
await page.click("button:has-text('Ver meu resultado')");
await page.waitForURL("**/r/**");
await shot("03-resultado");

const label = await page.locator("h1").first().innerText();
console.log("label:", label);
const id = page.url().split("/r/")[1];

// OG image
const og = await page.request.get(`${base}/r/${id}/opengraph-image`);
console.log("og status:", og.status(), og.headers()["content-type"]);
if (shots) {
  const fs = await import("node:fs");
  fs.writeFileSync(`${shots}/04-og.png`, Buffer.from(await og.body()));
}

// Camada 2
await page.fill("input[type=email]", "teste@example.com");
await page.click("button:has-text('Liberar meu relatório completo')");
await page.waitForSelector("text=Relatório completo", { timeout: 60000 });
await shot("05-relatorio");
const report = await page.locator(".prose-report").innerText();
console.log("report chars:", report.length, "| starts:", report.slice(0, 60).replace(/\n/g, " "));

// Link compartilhado em navegador limpo: deve mostrar camada 1 e o convite (não o relatório).
const ctx2 = await browser.newContext();
const p2 = await ctx2.newPage();
await p2.goto(`${base}/r/${id}`);
const hasInvite = await p2.locator("text=Quer entender o porquê?").count();
console.log("visitante anônimo vê convite:", hasInvite === 1);
await p2.goto(`${base}/r/naoexiste`);
console.log("404 para id inválido:", (await p2.locator("text=404").count()) > 0 || (await p2.title()).includes("404"));

// Mobile
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto(`${base}/r/${id}`);
await (shots && m.screenshot({ path: `${shots}/06-mobile-resultado.png`, fullPage: true }));
await m.goto(`${base}/teste`);
await (shots && m.screenshot({ path: `${shots}/07-mobile-quiz.png`, fullPage: true }));

await browser.close();
console.log("OK");
