import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { listStaffUsers, inviteUser, deleteStaffUser } from "@/lib/admin-users.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/usuarios")({ component: AdminUsers });

function AdminUsers() {
  const qc = useQueryClient();
  const list = useServerFn(listStaffUsers);
  const invite = useServerFn(inviteUser);
  const del = useServerFn(deleteStaffUser);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "corretor" as "admin" | "corretor" });

  const { data: users } = useQuery({ queryKey: ["staff-users"], queryFn: () => list() });

  const create = useMutation({
    mutationFn: () => invite({ data: form }),
    onSuccess: () => { toast.success("Usuário criado!"); qc.invalidateQueries({ queryKey: ["staff-users"] }); setOpen(false); setForm({ email: "", password: "", full_name: "", role: "corretor" }); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (userId: string) => del({ data: { userId } }),
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["staff-users"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div><h1 className="font-poppins text-3xl font-bold">Usuários</h1><p className="text-muted-foreground">Admins e corretores com acesso ao painel.</p></div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-secondary font-bold"><Plus className="w-4 h-4" /> Novo usuário</button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">Nome</th><th className="p-3">Email</th><th className="p-3">Papéis</th><th></th></tr></thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 font-semibold">{u.full_name ?? "—"}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  {u.roles.map((r) => <span key={r} className="px-2 py-0.5 rounded-full bg-primary/20 text-xs mr-1">{r}</span>)}
                </td>
                <td className="p-3 text-right"><button onClick={() => confirm("Remover usuário?") && remove.mutate(u.id)}><Trash2 className="w-4 h-4 text-destructive" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between mb-4"><h2 className="font-poppins font-bold text-xl">Novo usuário</h2><button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
              <input required placeholder="Nome completo" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              <input required type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              <input required type="password" minLength={8} placeholder="Senha (mín. 8)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                <option value="corretor">Corretor</option>
                <option value="admin">Admin</option>
              </select>
              <button disabled={create.isPending} className="w-full py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold disabled:opacity-50">{create.isPending ? "Criando…" : "Criar"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
