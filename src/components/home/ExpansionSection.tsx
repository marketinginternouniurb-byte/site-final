import { Link } from '@tanstack/react-router';
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageUrl } from "@/lib/images";
import { MapPin, Loader2, ArrowRight, CheckCircle2, History, Award, ExternalLink } from "lucide-react";

const LEGACY_PROJECTS = [
  { id: "leg-1", title: "Dona Augusta", location: "Cariacica - ES", image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop", link: "https://universalurbanismo.com/lote/dona-augusta/", year: "Legado", status: "100% Vendido" },
  { id: "leg-2", title: "Loteamento Universo", location: "Cariacica - ES", image_url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800&auto=format&fit=crop", link: "https://universalurbanismo.com/lote/universo/", year: "Legado", status: "100% Vendido" },
  { id: "leg-3", title: "Vista de Vitória", location: "Cariacica - ES", image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop", link: "https://universalurbanismo.com/lote/vista-de-vioria/", year: "Legado", status: "100% Vendido" },
  { id: "leg-4", title: "Vista da Ilha", location: "Vila Velha - ES", image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop", link: "https://universalurbanismo.com/lote/vista-da-ilha/", year: "Legado", status: "100% Vendido" }
];

export default function ExpansionSection() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (!error && data) setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const getProgressColor = (percent: number) => {
    if (percent <= 35) return "#EF4444"; 
    if (percent <= 65) return "#FFD700"; 
    return "#123AAA"; 
  };

  if (loading) return (
    <div className="flex justify-center items-center p-32 bg-[#FAF9F6]">
      <Loader2 className="animate-spin text-[#123AAA]" size={32} />
    </div>
  );

  return (
    <section id="ancora-lotes" className="py-24 px-6 relative overflow-hidden bg-[#FAF9F6] scroll-mt-20 antialiased">
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url('https://ftalrdptjbzmpxjgbzpq.supabase.co/storage/v1/object/public/project-images/Toalha.png')`, backgroundSize: 'cover' }}></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF9F6]/90 via-transparent to-[#FAF9F6]/90"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        <header className="text-center mb-20 flex justify-center w-full">
          <h2 className="flex flex-row flex-nowrap items-center justify-center gap-x-3 sm:gap-x-4 text-[#123AAA]" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight leading-tight whitespace-nowrap">
              Nossa Presença em
            </span>
            <span className="italic font-normal text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-none whitespace-nowrap">
              Expansão
            </span>
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {projects.map((p) => {
            const media = Math.round(((p.progresso_agua || 0) + (p.progresso_saneamento || 0) + (p.progresso_pavimentacao || 0) + (p.progresso_energia || 0)) / 4);
            const barColor = getProgressColor(media);
            const isPreLaunch = p.status?.toUpperCase() === "PRÉ-LANÇAMENTO";

            return (
              <div key={p.id} className="group relative flex flex-col bg-white rounded-[32px] p-2.5 border border-white shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url('https://ftalrdptjbzmpxjgbzpq.supabase.co/storage/v1/object/public/project-images/Toalha%20(1).png')`, backgroundSize: 'cover' }}></div>

                <div className="relative h-44 rounded-[20px] overflow-hidden bg-gray-100 z-10 shadow-sm">
                  <img src={getOptimizedImageUrl(p.image_url, { width: 700 })} alt={p.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105" />
                  
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border-l-4 border-[#FFD700]">
                    <span className="text-[#123AAA] text-[8px] font-black uppercase tracking-widest">{p.status}</span>
                  </div>

                  {isPreLaunch && (
                    <div className="absolute top-3 right-3 bg-[#FFD700] px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 border border-white/20">
                      <CheckCircle2 size={12} className="text-[#123AAA]" />
                      <span className="text-[#123AAA] text-[10px] font-black uppercase tracking-widest">FACILITA</span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-5 flex-grow flex flex-col relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-[#123AAA] uppercase italic tracking-tighter mb-1 line-clamp-1">{p.title}</h3>
                    <div className="flex items-center gap-1.5 text-black font-bold text-[10px] uppercase tracking-widest opacity-70">
                      <MapPin size={12} className="text-black" /> {p.area || p.location}
                    </div>
                  </div>

                  {media > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#123AAA]">
                        <span>Evolução da Obra</span>
                        <span>{media}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500 rounded-full" 
                          style={{ width: `${media}%`, backgroundColor: barColor }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-6 pt-4 border-t border-slate-100">
                    <div className="flex flex-col flex-1">
                      <span className="text-[9px] text-[#123AAA] font-black uppercase tracking-widest mb-1">Lotes</span>
                      <span className="text-2xl font-black text-[#123AAA] leading-none">{p.lotes_totais}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-100 pl-6 flex-1">
                      <span className="text-[9px] text-[#123AAA] font-black uppercase tracking-widest mb-1">Disp.</span>
                      <span className="text-2xl font-black text-[#123AAA] leading-none">{p.lotes_disponiveis}</span>
                    </div>
                  </div>

                  {/* AJUSTE AQUI: O 'as any' cala o erro do TypeScript e força a rota a abrir perfeitamente */}
                  <Link 
                    to={"/empreendimento/$id" as any}
                    params={{ id: p.id } as any}
                    className="w-full py-4 bg-[#123AAA] rounded-xl flex items-center justify-center gap-3 hover:bg-blue-900 border-none cursor-pointer mt-auto transition-all shadow-md text-center no-underline"
                  >
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Explorar Ativo</span>
                    <ArrowRight size={16} className="text-[#FFD700]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-20 border-t border-[#123AAA]/10">
          <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4 text-center md:text-left">
            <div>
              <div className="flex items-center gap-2 text-[#123AAA]/60 mb-2 justify-center md:justify-start">
                <History size={20} /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Patrimônio Universal</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-[#123AAA]" style={{ fontFamily: "'Playfair Display', serif" }}>História em <span className="italic font-normal">Movimento</span></h2>
            </div>
          </header>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {LEGACY_PROJECTS.map((p) => (
              <div key={p.id} onClick={() => window.open(p.link, "_blank")} className="group relative bg-white rounded-[24px] p-2 border border-slate-50 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1">
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url('https://ftalrdptjbzmpxjgbzpq.supabase.co/storage/v1/object/public/project-images/Toalha%20(1).png')`, backgroundSize: 'cover' }}></div>
                <div className="relative h-40 rounded-[18px] overflow-hidden z-10">
                  <img src={getOptimizedImageUrl(p.image_url, { width: 500 })} alt={p.title} loading="lazy" decoding="async" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors duration-500">
                    <div className="bg-[#123AAA]/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#FFD700]/30 shadow-2xl flex items-center gap-1.5">
                      <Award size={12} className="text-[#FFD700]" /><span className="text-white text-[8px] font-black uppercase tracking-widest">{p.status}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 z-10 flex-grow flex flex-col justify-between bg-white/80">
                  <h3 className="text-sm font-black text-[#123AAA] uppercase tracking-tighter mb-1 line-clamp-1">{p.title}</h3>
                  <div className="flex items-center gap-1.5 text-[9px] text-black font-bold opacity-60">
                    <MapPin size={10} /> {p.location}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#123AAA]/40 uppercase tracking-widest">{p.year}</span>
                    <ExternalLink size={14} className="text-[#123AAA]/30 group-hover:text-[#FFD700] transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
