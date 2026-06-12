import { createFileRoute, useParams, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getOptimizedImageUrl } from '@/lib/images';
import {
  MapPin,
  Loader2,
  ArrowLeft,
  Droplets,
  Lightbulb,
  Pickaxe,
  Ruler,
  Building2,
  Info,
  HardHat,
  PlayCircle,
  ExternalLink,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import FooterSection from '@/components/home/FooterSection';

export const Route = createFileRoute('/empreendimento/$id')({
  component: ProjectDetails,
});

function getYouTubeId(input?: string | null) {
  if (!input) return null;

  const value = input.trim();

  // Aceita o ID puro: dQw4w9WgXcQ
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);

    // youtube.com/watch?v=ID
    const watchId = url.searchParams.get('v');
    if (watchId && /^[a-zA-Z0-9_-]{11}$/.test(watchId)) {
      return watchId;
    }

    // youtu.be/ID
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return id;
      }
    }

    // youtube.com/embed/ID, /shorts/ID, /live/ID
    const parts = url.pathname.split('/').filter(Boolean);
    const markerIndex = parts.findIndex((part) =>
      ['embed', 'shorts', 'live'].includes(part)
    );

    if (markerIndex >= 0) {
      const id = parts[markerIndex + 1];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return id;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function getCvcrmId(input?: string | null) {
  if (!input) return null;

  const value = input.trim();
  if (/^\d+$/.test(value)) return value;

  try {
    const url = new URL(value);
    const queryId =
      url.searchParams.get('idempreendimento') ||
      url.searchParams.get('idEmpreendimento') ||
      url.searchParams.get('id');

    if (queryId) return queryId;

    return url.pathname.split('/').filter(Boolean).at(-1) ?? null;
  } catch {
    const match = value.match(/\d+/);
    return match?.[0] ?? null;
  }
}

function normalizeText(value?: string | null) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isAvailableUnit(unit: any) {
  const status = normalizeText(
    unit?.status ||
      unit?.situacao ||
      unit?.situacao_comercial ||
      unit?.status_comercial
  );

  return (
    status.includes("disponivel") ||
    status.includes("liberado") ||
    status.includes("a venda") ||
    status.includes("venda")
  );
}

function ProjectDetails() {
  const { id } = useParams({ from: '/empreendimento/$id' });
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);

      // 1. Buscar dados básicos do Supabase (para manter compatibilidade com o que já existe)
      const { data: dbData, error: dbError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      // 2. Buscar dados em tempo real do CVCRM via Edge Function
      let cvData = null;
      const cvcrmId = getCvcrmId((dbData as any)?.cvcrm_url || (dbData as any)?.cvcrm_id);

      try {
        if (cvcrmId) {
          const { data: funcData, error: funcError } = await supabase.functions.invoke('sync-projects', {
            method: 'POST',
            body: { id: cvcrmId }
          });
          if (!funcError) cvData = funcData;
        }
      } catch (e) {
        console.error("Erro ao buscar dados do CVCRM:", e);
      }

      if (!dbError || cvData) {
        const baseData = dbData || {};
        const cvProject = cvData?.project || {};
        
        // Mesclar dados do banco local com os dados em tempo real do CVCRM
        setProject({
          ...baseData,
          id: baseData.id || cvProject.idempreendimento,
          title: cvProject.nome || baseData.title,
          status: cvProject.situacao || baseData.status,
          location: cvProject.cidade || baseData.location,
          description: cvProject.descricao || baseData.description,
          image_url: cvProject.foto_destaque || baseData.image_url,
          planta_url: baseData.planta_url,
          cvcrm_url: baseData.cvcrm_url,
          gallery: cvData?.gallery?.length > 0 ? cvData.gallery : (baseData.gallery || []),
          lotes_disponiveis: cvData?.stats?.available ?? baseData.lotes_disponiveis,
          lotes_totais: cvData?.stats?.total ?? baseData.lotes_totais,
          unidades: cvData?.units ?? [],
          cv_id: cvProject.idempreendimento || cvcrmId
        });
      }

      setLoading(false);
    };

    fetchProjectData();
    window.scrollTo(0, 0);
  }, [id]);

  const youtubeId = useMemo(
    () => getYouTubeId(project?.video_url),
    [project?.video_url]
  );

  const youtubeEmbedUrl = useMemo(() => {
    if (!youtubeId) return null;

    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
    });

    return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
  }, [youtubeId]);

  const youtubeWatchUrl = youtubeId
    ? `https://www.youtube.com/watch?v=${youtubeId}`
    : project?.video_url;

  const cvcrmMapUrl = useMemo(() => {
    if (!project?.cv_id && !project?.cvcrm_url) return null;

    if (project?.cvcrm_url && /^https?:\/\//i.test(project.cvcrm_url)) {
      return project.cvcrm_url;
    }

    return `https://universal.cvcrm.com.br/mapa-disponibilidade/${project.cv_id || project.cvcrm_url}`;
  }, [project?.cv_id, project?.cvcrm_url]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="animate-spin text-[#123AAA] mb-4" size={48} />
        <p className="text-[#123AAA] font-bold uppercase tracking-widest text-xs">
          A carregar Ativo...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6] p-6 text-center">
        <h2 className="text-2xl font-black text-[#123AAA] mb-4">
          EMPREENDIMENTO NÃO ENCONTRADO
        </h2>

        <Link
          to="/"
          className="text-[#FFD700] bg-[#123AAA] px-8 py-3 rounded-xl font-bold uppercase text-xs no-underline"
        >
          Voltar à página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] antialiased">
      <Navbar />

      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="flex items-center gap-2 text-[#123AAA]/60 hover:text-[#123AAA] mb-8 transition-colors group no-underline w-fit"
          >
            <ArrowLeft
              size={20}
