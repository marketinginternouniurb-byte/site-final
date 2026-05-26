import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Star, Trash2, Plus, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/depoimentos")({ component: AdminTestimonials });

function AdminTestimonials() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", rating: 5, text: "", approved: true });

  const { data } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => (await supabase.from("testimonials").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("testimonials").insert(form); if (error) throw error; },
    onSuccess: () => { toast.success("Criado"); qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });
  const toggle = useMutation({
    mutationFn: async ({ id, approved }: any) => { const { error } = await supabase.from("testimonials").update({ approved }).eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-testimonials"] }),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("testimonials").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-testimonials"] }),
  });

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div><h1 className="font-poppins text-3xl font-bold">Depoimentos</h1><p className="text-muted-foreground">Modere depoimentos de clientes.</p></div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-secondary font-bold"><Plus className="w-4 h-4" /> Novo</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.map((t: any) => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex justify-between mb-2">
              <div>
                <p className="font-bold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
              <div className="flex gap-1">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}</div>
            </div>
            <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => toggle.mutate({ id: t.id, approved: !t.approved })} className={`text-xs px-2 py-1 rounded-full ${t.approved ? "bg-green-100 text-green-700" : "bg-muted"}`}>
                <Check className="w-3 h-3 inline" /> {t.approved ? "Aprovado" : "Pendente"}
              </button>
              <button onClick={() => confirm("Excluir?") && del.mutate(t.id)} className="text-xs text-destructive"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between mb-4"><h2 className="font-poppins font-bold text-xl">Novo depoimento</h2><button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
              <input required placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              <input placeholder="Profissão" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              <textarea required rows={4} placeholder="Depoimento" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.approved} onChange={(e) => setForm({ ...form, approved: e.target.checked })} /> Aprovado</label>
              <button className="w-full py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold">Salvar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
