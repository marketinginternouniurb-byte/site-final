import React from "react";
import Navbar from "./Navbar";
// Caminho relativo para buscar o Footer na pasta vizinha 'home'
import FooterSection from "@/components/home/FooterSection"; 

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      {/* Menu fixo no topo de todas as páginas */}
      <Navbar />

      {/* Área onde o conteúdo de cada página (como o Index) vai aparecer */}
      <main className="flex-grow">
        {children}
      </main>

      {/* O Rodapé agora é automático: apareceu no Shell, apareceu no site todo */}
      <FooterSection />
    </div>
  );
}