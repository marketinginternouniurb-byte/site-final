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
        theme: {
          button: {
            backgroundColor: '#F5C400',
            customIconSrc: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMkgyQzEuNDUgMiAxIDIuNDUgMSAzVjE3QzEgMTcuNTUgMS40NSAxOCAyIDE4SDZWMjJMMTAgMThIMjBDMjAuNTUgMTggMjEgMTcuNTUgMjEgMTdWM0MyMSAyLjQ1IDIwLjU1IDIgMjAgMloiIGZpbGw9IiMxQjNGQTAiLz48L3N2Zz4=',
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

      {/* Wrapper fixo — tudo alinhado junto no canto */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none',
        gap: '4px',
      }}>
        {/* Balão de fala */}
        <div style={{
          backgroundColor: '#1B3FA0',
          color: '#fff',
          borderRadius: '16px 16px 4px 16px',
          padding: '10px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          maxWidth: '160px',
          textAlign: 'center',
          marginRight: '10px',
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#F5C400',
            marginBottom: '4px',
          }}>
            LOTTI
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: '1.4' }}>
            Encontre seu lote ideal! 😊
          </div>
        </div>

        {/* Mascote alinhado com o botão do Typebot */}
        <img
          src="https://site-final.marketing-internouniurb.workers.dev/mascote-universal.png"
          alt="Lotti"
          style={{
            width: '130px',
            height: '130px',
            objectFit: 'contain',
            marginRight: '8px',
          }}
        />
      </div>
    </div>
  );
}
