import React, { useEffect, useState } from "react";
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

      {/* Balão de fala do mascote */}
      <div style={{
        position: 'fixed',
        bottom: '130px',
        right: '100px',
        backgroundColor: '#1B3FA0',
        color: '#fff',
        borderRadius: '16px 16px 4px 16px',
        padding: '10px 14px',
        zIndex: 9999,
        pointerEvents: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        maxWidth: '150px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#F5C400', marginBottom: '4px' }}>
          LOTTI
        </div>
        <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '1.4' }}>
          Encontre seu lote ideal! 😊
        </div>
        {/* Ponteiro do balão */}
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          right: '20px',
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '0px solid transparent',
          borderTop: '10px solid #1B3FA0',
        }} />
      </div>

      {/* Mascote maior e mais acima */}
      <img
        src="https://site-final.marketing-internouniurb.workers.dev/mascote-universal.png"
        alt="Lotti"
        style={{
          position: 'fixed',
          bottom: '55px',
          right: '85px',
          width: '140px',
          height: '140px',
          objectFit: 'contain',
          zIndex: 9998,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
