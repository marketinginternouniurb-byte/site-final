import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/perfil")({
  component: AdminProfile,
});

function AdminProfile() {
  const { user, roles } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [pwd, setPwd] = useState({ next: "", confirm: "" });

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name ?? "", phone: profile.phone ?? "" });
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update(form).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Perfil atualizado"); qc.invalidateQueries({ queryKey: ["my-profile"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const changePwd = useMutation({
    mutationFn: async () => {
      if (pwd.next.length < 8) throw new Error("Senha precisa ter ao menos 8 caracteres");
      if (pwd.next !== pwd.confirm) throw new Error("As senhas não conferem");
      const { error } = await supabase.auth.updateUser({ password: pwd.next });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Senha atualizada"); setPwd({ next: "", confirm: "" }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-poppins text-3xl font-bold mb-1">Meu Perfil</h1>
      <p className="text-muted-foreground mb-8">Suas informações de acesso.</p>

      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wider">E-mail</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
          <div className="flex gap-1">
            {roles.map((r) => (
              <span key={r} className="px-2 py-0.5 rounded-full bg-primary/20 text-xs font-semibold">{r}</span>
            ))}
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1">Nome completo</label>
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Telefone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <button disabled={save.isPending} className="px-5 py-2 rounded-lg bg-secondary text-secondary-foreground font-bold disabled:opacity-50">
            {save.isPending ? "Salvando…" : "Salvar"}
          </button>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-poppins font-bold text-lg mb-4">Alterar senha</h2>
        <form onSubmit={(e) => { e.preventDefault(); changePwd.mutate(); }} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1">Nova senha</label>
            <input
              type="password"
              minLength={8}
              required
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Confirmar nova senha</label>
            <input
              type="password"
              minLength={8}
              required
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <button disabled={changePwd.isPending} className="px-5 py-2 rounded-lg bg-primary text-secondary font-bold disabled:opacity-50">
            {changePwd.isPending ? "Atualizando…" : "Atualizar senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
