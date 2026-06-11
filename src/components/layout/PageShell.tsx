import React, { useEffect } from "react";
import Navbar from "./Navbar";
import FooterSection from "@/components/home/FooterSection";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.innerHTML = `
      import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.3/dist/web.js';
      Typebot.initBubble({
        typebot: 'lotti-final-whats-app-sem-pergunta-web-com-telefone-r5u6gcg',
        apiHost: 'https://typebot.co',
        previewMessage: {
          message: 'Olá! Posso te ajudar a encontrar o lote ideal 😊',
          autoShowDelay: 4000,
        },
        theme: {
          button: {
            backgroundColor: 'transparent',
            size: 'large',
          },
        },
      });
    `;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <FooterSection />
    </div>
  );
}
