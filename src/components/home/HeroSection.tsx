import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";

export default function HeroSection() {
  const handleScrollToProjects = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("ancora-lotes");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
        style={{ backgroundImage: "url('/lote-vista.webp')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="container relative z-10 mx-auto mt-16 flex flex-col items-center px-6 text-center antialiased">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-5xl"
        >
          <h1 className="mb-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
            A credibilidade que constrói
            <br />
            <span className="bg-gradient-to-r from-[#FFD700] to-[#FFa500] bg-clip-text text-transparent">
              o seu futuro há 51 anos.
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-3xl text-xl font-medium leading-relaxed text-gray-100 opacity-90 md:text-2xl">
            Conquiste o seu espaço com a segurança da Universal Urbanismo. Condições exclusivas de lançamento direto com a loteadora, <span className="font-bold text-[#FFD700]">sem entrada imediata.</span>
          </p>

          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <a
              href="/universal-simplifica"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#FFD700] px-8 py-4 text-sm font-black uppercase tracking-widest text-[#123AAA] shadow-[0_15px_35px_rgba(255,215,0,0.4)] transition-all hover:scale-105 hover:bg-[#e6bd00] active:scale-95 sm:w-auto"
            >
              Universal Simplifica <ArrowRight className="h-5 w-5 stroke-[3]" />
            </a>

            <button
              onClick={handleScrollToProjects}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-white/50 bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-[#123AAA] sm:w-auto"
            >
              Nossos Empreendimentos <MapPin className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
