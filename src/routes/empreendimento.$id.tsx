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

function ProjectDetails() {
  const { id } = useParams({ from: '/empreendimento/$id' });
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (!error) {
        setProject(data);
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
                  alt={project.title}
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
  value: number;
  icon: any;
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
