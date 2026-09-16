import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Acesso ao /admin: uma senha (ADMIN_PASSWORD) → cookie httpOnly com um HMAC
 * da senha. Sem a variável, o /admin fica fechado.
 */
export const ADMIN_COOKIE = "sp_admin";

function secret(): string | null {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

export function adminToken(): string | null {
  const s = secret();
  if (!s) return null;
  return createHmac("sha256", s).update("spectrum-admin-v1").digest("hex");
}

export function checkPassword(input: string): boolean {
  const s = secret();
  if (!s) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(s);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const expected = adminToken();
  if (!expected) return false;
  const jar = await cookies();
  const got = jar.get(ADMIN_COOKIE)?.value;
  if (!got || got.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}
