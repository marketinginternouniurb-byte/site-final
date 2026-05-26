import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Bootstrap: cria o primeiro admin SE não houver nenhum admin no sistema.
export const bootstrapFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; password: string; full_name: string }) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(8).max(72),
        full_name: z.string().min(2).max(120),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if ((count ?? 0) > 0) {
      throw new Error("Já existe um administrador. Peça para ele criar sua conta.");
    }

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Falha ao criar usuário");

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleErr) throw new Error(roleErr.message);

    return { ok: true };
  });

// Verifica se já existe pelo menos um admin (público, usado pelo login)
export const hasAnyAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");
  return { hasAdmin: (count ?? 0) > 0 };
});

// Admin: convida (cria) um novo corretor / admin
export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; password: string; full_name: string; role: "admin" | "corretor" }) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(8).max(72),
        full_name: z.string().min(2).max(120),
        role: z.enum(["admin", "corretor"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: roleCheck } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleCheck) throw new Error("Apenas administradores podem criar usuários.");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Falha ao criar usuário");

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: data.role });
    if (roleErr) throw new Error(roleErr.message);

    return { ok: true, userId: created.user.id };
  });

// Admin: lista todos os usuários do sistema com seus papéis
export const listStaffUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roleCheck } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleCheck) throw new Error("Apenas administradores.");

    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name, phone");
    const { data: usersList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });

    const map = new Map<string, { id: string; email: string; full_name: string | null; phone: string | null; roles: string[] }>();
    for (const u of usersList?.users ?? []) {
      const p = profiles?.find((x) => x.id === u.id);
      map.set(u.id, { id: u.id, email: u.email ?? "", full_name: p?.full_name ?? null, phone: p?.phone ?? null, roles: [] });
    }
    for (const r of roles ?? []) {
      const existing = map.get(r.user_id);
      if (existing) existing.roles.push(r.role);
    }
    return Array.from(map.values()).filter((u) => u.roles.length > 0);
  });

// Admin: remove um usuário
export const deleteStaffUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: roleCheck } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleCheck) throw new Error("Apenas administradores.");
    if (data.userId === context.userId) throw new Error("Você não pode remover a si mesmo.");

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
