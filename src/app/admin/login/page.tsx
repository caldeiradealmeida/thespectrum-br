import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminToken, checkPassword, isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

async function login(formData: FormData) {
  "use server";
  const pw = String(formData.get("password") ?? "");
  if (!checkPassword(pw)) redirect("/admin/login?erro=1");
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminToken()!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin");
}

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { erro } = await searchParams;
  const configured = !!process.env.ADMIN_PASSWORD;
  return (
    <div className="max-w-sm mx-auto pt-16">
      <p className="kicker mb-3">Área restrita</p>
      <h1 className="text-3xl font-black text-navy m-0 mb-6">Painel do The Spectrum</h1>
      {!configured ? (
        <p className="text-amber">
          Defina <code>ADMIN_PASSWORD</code> nas variáveis de ambiente para habilitar o painel.
        </p>
      ) : (
        <form action={login} className="card p-6 grid gap-4">
          <label className="grid gap-1.5">
            <span className="font-bold text-navy text-sm">Senha</span>
            <input type="password" name="password" required autoFocus className="border border-rule rounded-md p-3 bg-white" />
          </label>
          {erro && <p className="text-sm text-amber m-0">Senha incorreta.</p>}
          <button className="btn btn-primary">Entrar</button>
        </form>
      )}
    </div>
  );
}
