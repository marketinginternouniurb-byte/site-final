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
            backgroundColor: '#F5C400',
            customIconSrc: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgNEg4QzUuOCA0IDQgNS44IDQgOFYzNkw0IDQ0TDEyIDM2SDQwQzQyLjIgMzYgNDQgMzQuMiA0NCAzMlY4QzQ0IDUuOCA0Mi4yIDQgNDAgNFoiIGZpbGw9IiMxQjNGQTAiLz48L3N2Zz4=',
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
      <main className="flex-grow">{children}</main>
      <FooterSection />

      {/* Mascote fixo ao lado do botão do Typebot */}
      <img
        src="https://site-final.marketing-internouniurb.workers.dev/mascote-universal.png"
        alt="Lotti"
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '90px', // posicionado à esquerda do botão do Typebot
          width: '110px',
          height: '110px',
          objectFit: 'contain',
          zIndex: 9998,
          pointerEvents: 'none', // não interfere nos cliques
        }}
      />
    </div>
  );
}
