import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog")({ component: AdminBlog });

const empty = { title: "", slug: "", excerpt: "", content: "", category: "", image: "", published: false };

function AdminBlog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<any>(null);

  const { data: posts } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (p: any) => {
      const slug = (p.slug || p.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const payload = { ...p, slug, published_at: p.published ? new Date().toISOString() : null };
      if (editing) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Salvo"); qc.invalidateQueries({ queryKey: ["admin-blog"] }); setOpen(false); setEditing(null); setForm(empty); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("blog_posts").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Excluído"); qc.invalidateQueries({ queryKey: ["admin-blog"] }); },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="font-poppins text-3xl font-bold">Blog</h1><p className="text-muted-foreground">Posts do blog.</p></div>
        <button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-secondary font-bold"><Plus className="w-4 h-4" /> Novo post</button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">Título</th><th className="p-3">Categoria</th><th className="p-3">Status</th><th></th></tr></thead>
          <tbody>
            {posts?.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-semibold cursor-pointer" onClick={() => { setEditing(p); setForm(p); setOpen(true); }}>{p.title}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.published ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{p.published ? "publicado" : "rascunho"}</span></td>
                <td className="p-3 text-right"><button onClick={() => confirm("Excluir?") && del.mutate(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between mb-4"><h2 className="font-poppins font-bold text-xl">{editing ? "Editar" : "Novo"} post</h2><button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-3">
              <Field label="Título"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="inp" /></Field>
              <Field label="Slug (opcional)"><input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="inp" /></Field>
              <Field label="Categoria"><input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className="inp" /></Field>
              <Field label="Imagem (URL)"><input value={form.image ?? ""} onChange={(e) => setForm({ ...form, image: e.target.value })} className="inp" /></Field>
              <Field label="Resumo"><textarea rows={2} value={form.excerpt ?? ""} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="inp" /></Field>
              <Field label="Conteúdo"><textarea rows={8} value={form.content ?? ""} onChange={(e) => setForm({ ...form, content: e.target.value })} className="inp" /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publicado</label>
              <button disabled={save.isPending} className="w-full py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold disabled:opacity-50">Salvar</button>
            </form>
          </div>
        </div>
      )}
      <style>{`.inp{width:100%;padding:.5rem .75rem;border:1px solid hsl(var(--border));border-radius:.5rem;background:hsl(var(--background));font-size:.875rem}`}</style>
    </div>
  );
}

function Field({ label, children }: any) {
  return <div><label className="text-xs font-semibold block mb-1">{label}</label>{children}</div>;
}
