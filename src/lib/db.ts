import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { customAlphabet } from "nanoid";
import { Answers, Scores } from "./scoring";

/**
 * Camada de persistência. Em produção usa Supabase (service role, só no
 * servidor). Sem as variáveis de ambiente, cai num armazenamento em memória
 * — suficiente para desenvolvimento local e para o build, mas os dados somem
 * a cada reinício.
 */

const nano = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 8);
export const newId = () => nano();
export const newToken = () => customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 24)();

export interface ResultRow {
  id: string;
  created_at: string;
  instrument_version: number;
  econ: number;
  costumes: number;
  instituicoes: number;
  label: string;
  unlock_token: string;
  uf: string | null;
  age_range: string | null;
}

export interface Percentiles {
  n: number;
  econ_pct: number | null;
  costumes_pct: number | null;
  instituicoes_pct: number | null;
}

export interface Store {
  createResult(input: {
    id: string;
    version: number;
    scores: Scores;
    label: string;
    token: string;
    answers: Answers;
    uf?: string | null;
    ageRange?: string | null;
  }): Promise<void>;
  getResult(id: string): Promise<ResultRow | null>;
  getAnswers(id: string): Promise<Answers>;
  addUnlock(input: { resultId: string; email: string; consentUpdates: boolean }): Promise<void>;
  hasUnlock(resultId: string): Promise<boolean>;
  saveReport(resultId: string, reportMd: string, model: string): Promise<void>;
  getReport(resultId: string): Promise<string | null>;
  percentiles(scores: Scores): Promise<Percentiles>;
}

// ----------------------------------------------------------------- Supabase

function supabaseStore(client: SupabaseClient): Store {
  return {
    async createResult({ id, version, scores, label, token, answers, uf, ageRange }) {
      const { error } = await client.from("spectrum_results").insert({
        id,
        instrument_version: version,
        econ: scores.econ,
        costumes: scores.costumes,
        instituicoes: scores.instituicoes,
        label,
        unlock_token: token,
        uf: uf ?? null,
        age_range: ageRange ?? null,
      });
      if (error) throw error;
      const rows = Object.entries(answers).map(([question_id, value]) => ({ result_id: id, question_id, value }));
      const { error: e2 } = await client.from("spectrum_responses").insert(rows);
      if (e2) throw e2;
    },
    async getResult(id) {
      const { data, error } = await client.from("spectrum_results").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return (data as ResultRow) ?? null;
    },
    async getAnswers(id) {
      const { data, error } = await client.from("spectrum_responses").select("question_id,value").eq("result_id", id);
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r) => [r.question_id as string, r.value as number]));
    },
    async addUnlock({ resultId, email, consentUpdates }) {
      const { error } = await client.from("spectrum_unlocks").insert({
        result_id: resultId,
        email,
        consent_updates: consentUpdates,
      });
      if (error) throw error;
    },
    async hasUnlock(resultId) {
      const { count, error } = await client
        .from("spectrum_unlocks")
        .select("id", { count: "exact", head: true })
        .eq("result_id", resultId);
      if (error) throw error;
      return (count ?? 0) > 0;
    },
    async saveReport(resultId, reportMd, model) {
      const { error } = await client.from("spectrum_reports").upsert({ result_id: resultId, report_md: reportMd, model });
      if (error) throw error;
    },
    async getReport(resultId) {
      const { data, error } = await client.from("spectrum_reports").select("report_md").eq("result_id", resultId).maybeSingle();
      if (error) throw error;
      return data?.report_md ?? null;
    },
    async percentiles(scores) {
      const { data, error } = await client.rpc("spectrum_percentiles", {
        e: scores.econ,
        c: scores.costumes,
        i: scores.instituicoes,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return {
        n: Number(row?.n ?? 0),
        econ_pct: row?.econ_pct == null ? null : Number(row.econ_pct),
        costumes_pct: row?.costumes_pct == null ? null : Number(row.costumes_pct),
        instituicoes_pct: row?.instituicoes_pct == null ? null : Number(row.instituicoes_pct),
      };
    },
  };
}

// ------------------------------------------------------------------ Memória

function memoryStore(): Store {
  const g = globalThis as unknown as { __spectrumMem?: ReturnType<typeof init> };
  function init() {
    return {
      results: new Map<string, ResultRow>(),
      answers: new Map<string, Answers>(),
      unlocks: new Map<string, { email: string; consentUpdates: boolean }[]>(),
      reports: new Map<string, string>(),
    };
  }
  const mem = (g.__spectrumMem ??= init());
  const pct = (all: number[], v: number) =>
    all.length ? Math.round((100 * all.filter((x) => x < v).length) / all.length) : null;
  return {
    async createResult({ id, version, scores, label, token, answers, uf, ageRange }) {
      mem.results.set(id, {
        id,
        created_at: new Date().toISOString(),
        instrument_version: version,
        econ: scores.econ,
        costumes: scores.costumes,
        instituicoes: scores.instituicoes,
        label,
        unlock_token: token,
        uf: uf ?? null,
        age_range: ageRange ?? null,
      });
      mem.answers.set(id, { ...answers });
    },
    async getResult(id) {
      return mem.results.get(id) ?? null;
    },
    async getAnswers(id) {
      return mem.answers.get(id) ?? {};
    },
    async addUnlock({ resultId, email, consentUpdates }) {
      const list = mem.unlocks.get(resultId) ?? [];
      list.push({ email, consentUpdates });
      mem.unlocks.set(resultId, list);
    },
    async hasUnlock(resultId) {
      return (mem.unlocks.get(resultId)?.length ?? 0) > 0;
    },
    async saveReport(resultId, reportMd) {
      mem.reports.set(resultId, reportMd);
    },
    async getReport(resultId) {
      return mem.reports.get(resultId) ?? null;
    },
    async percentiles(scores) {
      const all = [...mem.results.values()];
      return {
        n: all.length,
        econ_pct: pct(all.map((r) => r.econ), scores.econ),
        costumes_pct: pct(all.map((r) => r.costumes), scores.costumes),
        instituicoes_pct: pct(all.map((r) => r.instituicoes), scores.instituicoes),
      };
    },
  };
}

let store: Store | null = null;

export function getStore(): Store {
  if (store) return store;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    store = supabaseStore(createClient(url, key, { auth: { persistSession: false } }));
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn("[spectrum] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes — usando armazenamento em memória.");
    }
    store = memoryStore();
  }
  return store;
}
