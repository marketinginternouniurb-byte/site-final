import { useState } from "react";
import { MapPin, Phone, Mail, Instagram, Facebook, Music2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { openCookiePreferences } from "@/lib/cookie-consent";

export default function FooterSection() {
  const [email, setEmail] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [sending, setSending] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedPrivacy) {
      alert("Para continuar, aceite a Política de Privacidade e LGPD.");
      return;
    }

    setSending(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    setSending(false);

    if (error) {
      alert("Não foi possível concluir sua inscrição. Tente novamente.");
      return;
    }

    alert("Inscrição realizada com sucesso!");
    setEmail("");
    setAcceptedPrivacy(false);
  };

  return (
    <footer className="relative bg-[#123AAA] text-white pt-20 pb-10 overflow-hidden border-t border-white/5 mt-auto">
      
      {/* TEXTURA DE FUNDO (Toalha) */}
      <div 
        className="absolute inset-0 z-0 opacity-5 mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: `url('https://ftalrdptjbzmpxjgbzpq.supabase.co/storage/v1/object/public/project-images/Toalha.png')`, 
          backgroundSize: 'cover'
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Ajustado o grid de colunas para dar mais espaço ao bloco da esquerda e evitar invasão */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 items-start">
          
          {/* COLUNA 1: LOGO E REDES SOCIAIS (Ocupa 3 de 12 espaços) */}
          <div className="md:col-span-3 space-y-10">
            <img 
              src="https://ftalrdptjbzmpxjgbzpq.supabase.co/storage/v1/object/public/project-images/1.3.svg" 
              alt="Universal Urbanismo" 
              className="h-14 w-auto object-contain brightness-0 invert" 
            />
            
            <div className="space-y-4">
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] antialiased">
                Siga a Universal
              </p>
              <div className="flex gap-4">
                <a href="https://instagram.com/universalurbanismo" target="_blank" rel="noreferrer" className="p-2.5 rounded-full border border-white/10 hover:bg-[#FFD700] hover:text-[#123AAA] transition-all duration-300">
                  <Instagram size={18} />
                </a>
                <a href="https://facebook.com/universalurbanismo" target="_blank" rel="noreferrer" className="p-2.5 rounded-full border border-white/10 hover:bg-[#FFD700] hover:text-[#123AAA] transition-all duration-300">
                  <Facebook size={18} />
                </a>
                <a href="https://tiktok.com/@universal_urbanismo" target="_blank" rel="noreferrer" className="p-2.5 rounded-full border border-white/10 hover:bg-[#FFD700] hover:text-[#123AAA] transition-all duration-300">
                  <Music2 size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* COLUNA 2: ATENDIMENTO (Aumentado para 4 de 12 espaços para proteger o e-mail longo) */}
          <div className="md:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-4 bg-[#FFD700]"></div>
              <h4 className="text-[#FFD700] font-bold text-[10px] uppercase tracking-[0.3em]">Atendimento</h4>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin size={18} className="text-[#FFD700] shrink-0 mt-1" />
                <p className="text-sm font-bold text-white/90 leading-snug">
                  Villagio Limoeiro - Torre Sul<br/>
                  <span className="text-white/60 font-medium">Serra - ES</span>
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Phone size={18} className="text-[#FFD700] shrink-0" />
                <p className="text-sm font-bold text-white/90">(27) 2888-0001</p>
              </div>
              
              <div className="flex items-center gap-4">
                <Mail size={18} className="text-[#FFD700] shrink-0" />
                <p className="text-sm font-bold border-b border-white/10 pb-0.5 hover:border-[#FFD700] transition-colors cursor-pointer whitespace-nowrap">
                  contato@universalurbanismo.com.br
                </p>
              </div>
            </div>
          </div>

          {/* COLUNA 3: CAPTAÇÃO DE E-MAIL (Ocupa os 5 espaços restantes do grid) */}
          <div className="md:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-4 bg-[#FFD700]"></div>
                <h4 className="text-white/90 font-bold text-[11px] uppercase tracking-[0.15em] antialiased">
                  Oportunidades de Investimento
                </h4>
              </div>
              <p className="text-white/60 text-xs font-medium leading-relaxed max-w-md">
                Receba novidades exclusivas e lançamentos de lotes direto da fonte.
              </p>
            </div>
            
            <form onSubmit={handleEmailSubmit} className="group relative max-w-md w-full space-y-3">
              <div className="relative flex items-center">
                <Mail className="absolute left-5 text-white/30 group-focus-within:text-[#FFD700] transition-colors duration-300" size={18} />
                
                <input 
                  type="email" 
                  required
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] backdrop-blur-md border border-white/20 rounded-2xl py-4.5 pl-14 pr-24 text-sm font-medium placeholder:text-white/30 focus:outline-none focus:border-[#FFD700]/50 focus:bg-white/[0.07] transition-all duration-300"
                />

                <button 
                  type="submit"
                  disabled={sending}
                  className="absolute right-2 top-2 bottom-2 px-5 bg-[#FFD700] text-[#123AAA] rounded-xl font-black text-[10px] uppercase tracking-tighter shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer"
                >
                  {sending ? "..." : "Enviar"} <Send size={14} />
                </button>
              </div>

              <label className="flex items-start gap-3 text-[10px] text-white/50 leading-relaxed">
                <input
                  type="checkbox"
                  required
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#FFD700]"
                />
                <span>
                  Li e aceito o tratamento dos meus dados para receber novidades
                  da Universal, conforme a{" "}
                  <a
                    href="/politica-de-privacidade"
                    className="text-[#FFD700] font-bold hover:underline"
                  >
                    Política de Privacidade e LGPD
                  </a>
                  .
                </span>
              </label>
            </form>

            {/* Resolvido o atropelamento: Isolado com margem de segurança */}
            <div className="pt-2 text-white/50">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] antialiased">
                O seu futuro começa aqui
              </p>
            </div>
          </div>

        </div>

        {/* BARRA FINAL */}
        <div className="pt-10 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-8 font-sans">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-white/60 font-medium text-[11px] tracking-wide antialiased">
              © {new Date().getFullYear()} Universal Urbanismo
            </p>
            <div className="px-3 py-1 border border-[#FFD700]/40 rounded text-[#FFD700] font-semibold text-[11px] tracking-wider antialiased">
              CRECI-ES 12243-J
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 text-white/70 font-medium text-[11px] tracking-wide antialiased">
            <p>Desde 1974 construindo o amanhã</p>
            <a href="/politica-de-privacidade" className="hover:text-[#FFD700] transition-colors">
              Política de Privacidade e LGPD
            </a>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="hover:text-[#FFD700] transition-colors"
            >
              Revisar cookies
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
