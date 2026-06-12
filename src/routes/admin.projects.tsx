import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, X, Loader2, Save, MapPin, Map, LinkIcon } from "lucide-react";

type PropertyStatus = "A Venda" | "Em Obras" | "Entregue";

const EMPTY_FORM = {
  title: "",
  area: "",
  status: "A Venda" as PropertyStatus,
  description: "",
  image_url: "",
  planta_url: "",
  cvcrm_url: "",
  video_url: "",
  is_facilita: false,
  lotes_totais: 0,
  lotes_disponiveis: 0,
  progresso_agua: 0,
  progresso_saneamento: 0,
  progresso_pavimentacao: 0,
  progresso_energia: 0,
};

export const Route = createFileRoute("/admin/projects")({
  component: AdminProjects,
});

function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (error: any) {
      toast.error("Erro ao carregar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(id: string) {
    if (!window.confirm("Deseja excluir este empreendimento?")) return;

    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (!error) {
      toast.success("Removido com sucesso!");
      fetchProjects();
    }
  }

  function resetForm() {
    setIsEditing(null);
    setFormData({ ...EMPTY_FORM });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload: any = {
      ...formData,
      planta_url: formData.planta_url || null,
      cvcrm_url: formData.cvcrm_url || null,
      video_url: formData.video_url || null,
    };

    try {
      if (isEditing) {
        const { error } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", isEditing);

        if (error) throw error;
        toast.success("Empreendimento atualizado!");
      } else {
        const { error } = await supabase.from("properties").insert([payload]);

        if (error) throw error;
        toast.success("Novo projeto publicado!");
      }
