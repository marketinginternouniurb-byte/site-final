import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import FooterSection from "@/components/home/FooterSection";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Carrega o Typebot em modo headless (sem botão nativo)
    const script = document.createElement("script");
    script.type = "module";
    script.innerHTML = `
      import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.3/dist/web.js';
      Typebot.initBubble({
        typebot: 'lotti-final-whats-app-sem-pergunta-web-com-telefone-r5u6gcg',
        apiHost: 'https://typebot.co',
        theme: {
          button: {
            size: 'medium',
            backgroundColor: 'transparent',
            customIconSrc: 'https://site-final.marketing-internouniurb.workers.dev/mascote-universal.png',
          },
        },
      });
      window.__typebotOpen = () => {
        window.dispatchEvent(new CustomEvent('open-typebot'));
      };
    `;
    document.body.appendChild(script);

    // Mostra o botão após 1s
    const timer = setTimeout(() => setVisible(true), 1000);

    return () => {
      document.body.removeChild(script);
      clearTimeout(timer);
    };
  }, []);

  const handleOpen = () => {
    // Clica no botão nativo do Typebot (escondido) para abrir o chat
    const typebotBtn = document.querySelector('typebot-bubble')?.shadowRoot?.querySelector('button');
    if (typebotBtn) typebotBtn.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <FooterSection />

      {/* Botão customizado Lotti */}
      {visible && (
        <div
          onClick={handleOpen}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
          }}
        >
          {/* Container de texto */}
          <div style={{
            backgroundColor: '#1B3FA0',
            color: '#fff',
            borderRadius: '20px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 700,
            lineHeight: '1.3',
            maxWidth: '160px',
            textAlign: 'center',
            letterSpacing: '0.3px',
          }}>
            Encontre seu<br />lote ideal!
          </div>

          {/* Mascote */}
          <img
            src="https://site-final.marketing-internouniurb.workers.dev/mascote-universal.png"
            alt="Lotti"
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              transform: 'translateY(-8px)', // leve flutuação
            }}
          />
        </div>
      )}
    </div>
  );
}
