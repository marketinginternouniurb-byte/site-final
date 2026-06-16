import { createFileRoute, useParams, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { getOptimizedImageUrl } from '@/lib/images';
import { absoluteUrl } from '@/lib/site-url';
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
  head: ({ params }) => ({
    meta: [
      { title: "Empreendimento - Universal Urbanismo" },
      {
        name: "description",
        content: "Conheca detalhes, disponibilidade e infraestrutura do empreendimento Universal Urbanismo.",
      },
      { property: "og:title", content: "Empreendimento Universal Urbanismo" },
      {
        property: "og:description",
        content: "Veja fotos, mapa 3D, lotes disponiveis e informacoes do empreendimento.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl(`/empreendimento/${params.id}`) }],
  }),
  component: ProjectDetails,
});

const FALLBACK_PROJECT_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

type ImageObject = {
  url?: string | null;
  foto?: string | null;
  imagem?: string | null;
  arquivo?: string | null;
  caminho?: string | null;
  link?: string | null;
};

type ImageValue = string | ImageObject | null | undefined;

type ProjectBaseData = Partial<Omit<PropertyRow, "gallery" | "id" | "status">> & {
  id?: string | number | null;
  title?: string | null;
  image_url?: string | null;
  planta_url?: string | null;
  gallery?: ImageValue[] | null;
  status?: string | null;
  descricao?: string | null;
  video_url?: string | null;
  cvcrm_id?: string | number | null;
  lotes_disponiveis?: number | null;
  lotes_totais?: number | null;
  progresso_agua?: number | null;
  progresso_saneamento?: number | null;
  progresso_pavimentacao?: number | null;
  progresso_energia?: number | null;
};

type CvcrmProject = {
  idempreendimento?: string | number | null;
  nome?: string | null;
  situacao?: string | null;
  cidade?: string | null;
  descricao?: string | null;
  foto_destaque?: ImageValue;
  foto?: ImageValue;
  imagem?: ImageValue;
  imagem_principal?: ImageValue;
  url_foto?: ImageValue;
  foto_url?: ImageValue;
  capa?: ImageValue;
  banner?: ImageValue;
};

type CvcrmUnit = {
  id?: string | number | null;
  label?: string | number | null;
  status?: string | null;
  situacao?: string | null;
  situacao_comercial?: string | null;
  status_comercial?: string | null;
  subbloco?: string | null;
  quadra?: string | null;
  bloco?: string | null;
};

type CvcrmData = {
  project?: CvcrmProject | null;
  gallery?: ImageValue[] | null;
  stats?: {
    available?: number | null;
    total?: number | null;
  } | null;
  units?: CvcrmUnit[] | null;
};

type ProjectDetailsState = ProjectBaseData & {
  id?: string | number | null;
  title?: string | null;
  status?: string | null;
  location?: string | null;
  description?: string | null;
  image_url: string;
  planta_url?: string | null;
  gallery: ImageValue[];
  unidades: CvcrmUnit[];
  cv_id?: string | number | null;
};

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

function isAvailableUnit(unit: CvcrmUnit) {
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

function isManualMapImage(url?: string | null) {
  if (!url) return false;

  const value = url.toLowerCase();
  return (
    value.includes("/plantas/") ||
    value.includes("cvcrm-mapa") ||
    value.includes("planta-") ||
    value.includes("mapa-")
  );
}

function getImageUrlFromValue(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;

  if (typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  for (const key of ["url", "foto", "imagem", "arquivo", "caminho", "link"]) {
    const field = record[key];
    if (typeof field === "string" && field.trim()) {
      return field;
    }
  }

  return null;
}

function getCvcrmProjectImage(cvProject: CvcrmProject, gallery: ImageValue[] = []) {
  const direct =
    cvProject?.foto_destaque ||
    cvProject?.foto ||
    cvProject?.imagem ||
    cvProject?.imagem_principal ||
    cvProject?.url_foto ||
    cvProject?.foto_url ||
    cvProject?.capa ||
    cvProject?.banner;

  return getImageUrlFromValue(direct) || getImageUrlFromValue(gallery[0]);
}

function ProjectDetails() {
  const { id } = useParams({ from: '/empreendimento/$id' });
  const [project, setProject] = useState<ProjectDetailsState | null>(null);
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

      const baseData = (dbData ?? {}) as ProjectBaseData;

      // 2. Buscar dados em tempo real do CVCRM via Edge Function
      let cvData: CvcrmData | null = null;
      const cvcrmId = getCvcrmId(
        baseData.cvcrm_url ||
          (baseData.cvcrm_id !== undefined && baseData.cvcrm_id !== null
            ? String(baseData.cvcrm_id)
            : null)
      );

      try {
        if (cvcrmId) {
          const { data: funcData, error: funcError } = await supabase.functions.invoke('sync-projects', {
            method: 'POST',
            body: { id: cvcrmId }
          });
          if (!funcError) cvData = funcData as CvcrmData;
        }
      } catch (e) {
        console.error("Erro ao buscar dados do CVCRM:", e);
      }

      if (!dbError || cvData) {
        const cvProject = cvData?.project || {};
        const gallery: ImageValue[] =
          Array.isArray(cvData?.gallery) && cvData.gallery.length > 0
            ? cvData.gallery
            : Array.isArray(baseData.gallery)
              ? baseData.gallery
              : [];
        const cvcrmImage = getCvcrmProjectImage(cvProject, gallery);
        const configuredImage = baseData.image_url || baseData.image;
        const dbImage = isManualMapImage(configuredImage) ? null : configuredImage;
        const manualMapImage =
          baseData.planta_url || (isManualMapImage(configuredImage) ? configuredImage : null);
        
        // Mesclar dados do banco local com os dados em tempo real do CVCRM
        setProject({
          ...baseData,
          id: baseData.id || cvProject.idempreendimento,
          title: cvProject.nome || baseData.title,
          status: cvProject.situacao || baseData.status,
          location: cvProject.cidade || baseData.location,
          description: cvProject.descricao || baseData.description,
          image_url: cvcrmImage || dbImage || FALLBACK_PROJECT_IMAGE,
          planta_url: manualMapImage,
          cvcrm_url: baseData.cvcrm_url,
          gallery,
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
    : project?.video_url ?? undefined;

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
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Voltar aos Lançamentos
            </span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="flex flex-col gap-8">
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-4 border-white aspect-square w-full bg-slate-100">
                <img
                  src={getOptimizedImageUrl(project.image_url, { width: 1200, quality: 82 })}
                  alt={project.title ?? "Empreendimento"}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-6 left-6 bg-[#123AAA] text-white px-6 py-2 rounded-2xl shadow-xl border border-white/20 backdrop-blur-md">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    {project.status}
                  </span>
                </div>
              </div>

              {youtubeEmbedUrl && (
                <div className="space-y-3">
                  <div className="relative rounded-[40px] overflow-hidden shadow-xl border-4 border-white aspect-video w-full bg-slate-900">
                    <iframe
                      src={youtubeEmbedUrl}
                      title={`Vídeo do empreendimento ${project.title}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>

                  <a
                    href={youtubeWatchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[#123AAA] hover:text-[#0a2570] font-black uppercase tracking-widest text-[10px] no-underline"
                  >
                    <PlayCircle size={15} />
                    Abrir vídeo no YouTube
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}

            </div>

            <div className="space-y-8 lg:sticky lg:top-32">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#FFD700] text-[#123AAA] px-4 py-1.5 rounded-lg mb-6 font-bold text-[11px] uppercase tracking-widest shadow-sm antialiased">
                  <Building2 size={14} />
                  Empreendimento Premium
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#123AAA] uppercase tracking-tight leading-[1.1] mb-4 break-words">
                  {project.title}
                </h1>

                <div className="flex items-center gap-2 text-[#123AAA]/60 font-bold uppercase text-xs">
                  <MapPin size={16} className="text-[#FFD700]" />
                  {project.area || project.location}
                </div>
              </div>

              {(project.descricao || project.description) && (
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#123AAA]/5 space-y-4">
                  <h3 className="text-[#123AAA] font-black text-[11px] md:text-xs uppercase tracking-wider flex items-center gap-3 border-b border-gray-100 pb-4 mb-2 antialiased">
                    <Info size={16} className="text-[#FFD700]" />
                    Sobre o Projeto
                  </h3>

                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap font-medium antialiased">
                    {project.descricao || project.description}
                  </p>
                </div>
              )}

              {/* Galeria de Fotos Dinâmica */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#123AAA]/5 space-y-6">
                  <h3 className="text-[#123AAA] font-black text-[11px] md:text-xs uppercase tracking-wider flex items-center gap-3 border-b border-gray-100 pb-4 mb-4 antialiased">
                    <Building2 size={16} className="text-[#FFD700]" />
                    Galeria do Empreendimento
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.gallery.map((item, idx) => {
                      const imgUrl = getImageUrlFromValue(item);
                      if (!imgUrl) return null;
                      return (
                        <div key={idx} className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group cursor-pointer" onClick={() => window.open(imgUrl, '_blank')}>
                          <img 
                            src={imgUrl} 
                            alt={`Foto ${idx + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#123AAA]/5 space-y-6">
                <h3 className="text-[#123AAA] font-black text-[11px] md:text-xs uppercase tracking-wider flex items-center gap-3 border-b border-gray-100 pb-4 mb-4 antialiased">
                  <HardHat size={16} className="text-[#FFD700]" />
                  Infraestrutura e Obras
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProgressItem
                    label="Rede de Água"
                    value={project.progresso_agua}
                    icon={<Droplets size={16} />}
                  />
                  <ProgressItem
                    label="Energia Elétrica"
                    value={project.progresso_energia}
                    icon={<Lightbulb size={16} />}
                  />
                  <ProgressItem
                    label="Esgotamento"
                    value={project.progresso_saneamento}
                    icon={<Pickaxe size={16} />}
                  />
                  <ProgressItem
                    label="Pavimentação"
                    value={project.progresso_pavimentacao}
                    icon={<Ruler size={16} />}
                  />
                </div>
              </div>

              {/* Seção de Mapa 3D e Agendamento */}
              {(project.planta_url || project.unidades?.length > 0) && (
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#123AAA]/5 space-y-6">
                  <h3 className="text-[#123AAA] font-black text-[11px] md:text-xs uppercase tracking-wider flex items-center gap-3 border-b border-gray-100 pb-4 mb-4 antialiased">
                    <MapPin size={16} className="text-[#FFD700]" />
                    Mapa 3D de Disponibilidades
                  </h3>
                  
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                    {project.planta_url ? (
                      <img
                        src={getOptimizedImageUrl(project.planta_url, { width: 1400, quality: 84 })}
                        alt={`Mapa do empreendimento ${project.title}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain bg-white"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-black uppercase tracking-widest text-slate-400">
                        Planta nao cadastrada
                      </div>
                    )}
                  </div>

                  {project.planta_url && (
                    <a
                      href={project.planta_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[#123AAA] hover:text-[#0a2570] font-black uppercase tracking-widest text-[10px] no-underline"
                    >
                      Ver planta em tamanho real
                      <ExternalLink size={13} />
                    </a>
                  )}

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#123AAA]/60">
                      Selecione um lote disponível para agendar visita:
                    </label>
                    <select 
                      className="w-full p-4 rounded-xl border-2 border-[#123AAA]/10 bg-slate-50 font-bold text-[#123AAA] text-sm focus:border-[#FFD700] outline-none transition-all"
                      onChange={(e) => {
                        const lote = e.target.value;
                        if (lote) {
                          window.open(`https://wa.me/552728880001?text=${encodeURIComponent(
                            `Olá! Tenho interesse em agendar uma visita para o lote ${lote} no empreendimento ${project.title}`
                          )}`, '_blank');
                        }
                      }}
                    >
                      <option value="">Ver lotes disponíveis...</option>
                      {project.unidades?.filter(isAvailableUnit).map((u) => (
                        <option key={u.id || u.label} value={String(u.label ?? "")}>
                          {String(u.label ?? "Lote")} - Disponivel
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`https://wa.me/552728880001?text=${encodeURIComponent(
                    `Olá! Tenho interesse no empreendimento ${project.title}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-[#123AAA] text-white text-center py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#0a2570] transition-all shadow-xl flex items-center justify-center gap-3 no-underline"
                >
                  Falar com Especialista
                </a>

                <div className="bg-white border-2 border-[#123AAA]/10 px-6 py-3 rounded-xl flex flex-col justify-center items-center min-w-[140px]">
                  <span className="text-[9px] font-black text-[#123AAA]/40 uppercase text-center">
                    Lotes Disp.
                  </span>
                  <span className="text-xl font-black text-[#123AAA] mt-0.5">
                    {project.lotes_disponiveis}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}

function ProgressItem({
  label,
  value,
  icon,
}: {
  label: string;
  value?: number | null;
  icon: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#123AAA]/70">
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
        <span>{value || 0}%</span>
      </div>

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FFD700] transition-all duration-1000 rounded-full"
          style={{ width: `${value || 0}%` }}
        />
      </div>
    </div>
  );
}
