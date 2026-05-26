import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Award, Building2, Menu, Phone, ShieldCheck, Users, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuFixed, setIsMenuFixed] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isFacilitaPage = pathname === "/facilita";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navIsWhite = isScrolled || isFacilitaPage;
  const logoSrc = isFacilitaPage ? "/facilita-logo-cropped.png" : "/logo-universal.svg";
  const logoAlt = isFacilitaPage ? "Universal Facilita" : "Universal Urbanismo";

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          navIsWhite
            ? "border-b border-[#123AAA]/10 bg-white py-3 shadow-lg"
            : "border-b border-white/10 bg-white/40 py-5 backdrop-blur-sm sm:py-6"
        }`}
      >
        <div className="container relative mx-auto flex items-center justify-between px-5 sm:px-6">
          <div className="h-12 w-12" />

          <Link
            to="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center transition hover:opacity-85"
            aria-label={logoAlt}
          >
            <img
              src={logoSrc}
              alt={logoAlt}
              className={`object-contain transition-all duration-300 ${
                isFacilitaPage
                  ? "h-14 max-w-[260px] sm:h-16 sm:max-w-[320px]"
                  : isScrolled
                    ? "h-14 drop-shadow-[0_4px_15px_rgba(255,255,255,0.5)]"
                    : "h-24 drop-shadow-[0_4px_15px_rgba(255,255,255,0.5)] sm:h-32"
              }`}
            />
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuFixed((current) => !current)}
              aria-label={isMenuFixed ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuFixed}
              className={`rounded-xl border p-3 shadow-lg transition-all duration-300 ${
                isMenuFixed ? "border-[#FFD700] bg-[#FFD700]" : "border-[#FFD700]/40 bg-[#123AAA]/85"
              }`}
            >
              {isMenuFixed ? (
                <X className="h-8 w-8 text-[#123AAA]" strokeWidth={3} />
              ) : (
                <Menu className="h-8 w-8 text-[#FFD700]" strokeWidth={2.5} />
              )}
            </button>

            <div
              className={`absolute right-0 top-full mt-4 w-[min(18rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-3xl border-2 border-[#FFD700]/30 bg-[#123AAA] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 ${
                isMenuFixed ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
              }`}
            >
              <div className="flex flex-col gap-5 p-6 sm:p-8">
                <a
                  href="/#ancora-lotes"
                  onClick={() => setIsMenuFixed(false)}
                  className="group flex items-center gap-4 text-white transition-colors hover:text-[#FFD700]"
                >
                  <span className="rounded-lg bg-white/5 p-2 transition-colors group-hover:bg-[#FFD700]/20">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest">Empreendimentos</span>
                </a>

                <Link
                  to="/sobre"
                  onClick={() => setIsMenuFixed(false)}
                  className="group flex items-center gap-4 text-white transition-colors hover:text-[#FFD700]"
                >
                  <span className="rounded-lg bg-white/5 p-2 transition-colors group-hover:bg-[#FFD700]/20">
                    <Users className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest">Sobre Nós</span>
                </Link>

                <Link
                  to="/contato"
                  onClick={() => setIsMenuFixed(false)}
                  className="group flex items-center gap-4 text-white transition-colors hover:text-[#FFD700]"
                >
                  <span className="rounded-lg bg-white/5 p-2 transition-colors group-hover:bg-[#FFD700]/20">
                    <Phone className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest">Contato</span>
                </Link>

                <Link
                  to="/politica-de-privacidade"
                  onClick={() => setIsMenuFixed(false)}
                  className="group flex items-center gap-4 text-white transition-colors hover:text-[#FFD700]"
                >
                  <span className="rounded-lg bg-white/5 p-2 transition-colors group-hover:bg-[#FFD700]/20">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest">Privacidade e LGPD</span>
                </Link>

                <div className="h-px bg-white/10" />

                <Link
                  to="/universal-facilita"
                  onClick={() => setIsMenuFixed(false)}
                 className="flex min-h-[88px] items-center justify-center rounded-2xl bg-white p-4 transition-transform hover:scale-[1.03]"
                  aria-label="Universal Facilita"
                >
                  <img
                    src="/facilita-logo-cropped.png"
                    alt="Universal Facilita"
                    className="h-16 w-full object-contain"
                  />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-3 border-t border-[#FFD700]/20 bg-[#FFD700]/10 p-5">
                <Award className="h-5 w-5 text-[#FFD700]" />
                <p className="text-[12px] font-black uppercase tracking-[0.15em] text-[#FFD700]">
                  51 Anos de Tradição
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isMenuFixed && <div className="fixed inset-0 z-40" onClick={() => setIsMenuFixed(false)} />}
    </>
  );
}
