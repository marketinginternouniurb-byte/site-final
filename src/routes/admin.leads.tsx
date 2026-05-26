import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/admin/leads")({ component: AdminLeads });

const STATUSES = ["novo", "em_atendimento", "convertido", "perdido"] as const;

function AdminLeads() {
  const qc = useQueryClient();
  const { data: leads } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "novo" | "em_atendimento" | "convertido" | "perdido" }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Status atualizado"); qc.invalidateQueries({ queryKey: ["admin-leads"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="font-poppins text-3xl font-bold mb-1">Leads</h1>
      <p className="text-muted-foreground mb-6">Contatos recebidos pelo site.</p>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><th className="p-3">Nome</th><th className="p-3">Contato</th><th className="p-3">Mensagem</th><th className="p-3">Status</th><th className="p-3">Data</th><th></th></tr>
          </thead>
          <tbody>
            {leads?.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum lead ainda.</td></tr>}
            {leads?.map((l: any) => (
              <tr key={l.id} className="border-t border-border align-top">
                <td className="p-3 font-semibold">{l.name}</td>
                <td className="p-3 text-xs">
                  <p>{l.email}</p>
                  <p className="text-muted-foreground">{l.phone}</p>
                </td>
                <td className="p-3 text-xs max-w-xs truncate">{l.message}</td>
                <td className="p-3">
                  <select value={l.status} onChange={(e) => updateStatus.mutate({ id: l.id, status: e.target.value as any })} className="px-2 py-1 rounded border border-border bg-background text-xs">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{fmtDate(l.created_at)}</td>
                <td className="p-3">
                  {l.phone && (
                    <a href={`https://wa.me/55${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-green-600 text-xs">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
