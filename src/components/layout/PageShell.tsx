import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import FooterSection from "@/components/home/FooterSection";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Move o botão nativo do Typebot para fora da tela (invisível mas clicável)
    const style = document.createElement("style");
    style.innerHTML = `
      typebot-bubble {
        position: fixed !important;
        bottom: -9999px !important;
        right: -9999px !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    const script = document.createElement("script");
    script.type = "module";
    script.innerHTML = `
      import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.3/dist/web.js';
      window.__typebot = await Typebot.initBubble({
        typebot: 'lotti-final-whats-app-sem-pergunta-web-com-telefone-r5u6gcg',
        apiHost: 'https://typebot.co',
        theme: {
          button: {
            size: 'medium',
            backgroundColor: 'transparent',
          },
        },
      });
    `;
    document.body.appendChild(script);

    const timer = setTimeout(() => setVisible(true), 1500);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(style);
      clearTimeout(timer);
    };
  }, []);

  const handleOpen = () => {
    // Usa a API do Typebot diretamente
    try {
      (window as any).Typebot?.open();
    } catch {
      // Fallback: clica no botão nativo mesmo offscreen
      const typebotEl = document.querySelector('typebot-bubble') as any;
      if (typebotEl?.shadowRoot) {
        const btn = typebotEl.shadowRoot.querySelector('button');
        if (btn) {
          typebotEl.style.cssText = '';
          btn.click();
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <FooterSection />

      {visible && (
        <div
          onClick={handleOpen}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            cursor: 'pointer',
            filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.3))',
          }}
        >
          {/* Mascote à esquerda, elevado */}
          <img
            src="https://site-final.marketing-internouniurb.workers.dev/mascote-universal.png"
            alt="Lotti"
            style={{
              width: '110px',
              height: '110px',
              objectFit: 'contain',
              transform: 'translateY(-16px)',
              zIndex: 2,
            }}
          />

          {/* Botão amarelo */}
          <div style={{
            backgroundColor: '#F5C400',
            borderRadius: '50px',
            padding: '14px 20px 14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '3px solid #1B3FA0',
            minWidth: '180px',
          }}>
            <div style={{
              backgroundColor: '#1B3FA0',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.03 2 11c0 2.62 1.19 4.98 3.07 6.61L4 22l4.62-1.54C9.96 20.81 10.97 21 12 21c5.52 0 10-4.03 10-9S17.52 2 12 2z" fill="#F5C400"/>
              </svg>
            </div>
            <div>
              <div style={{
                color: '#1B3FA0',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                LOTTI
              </div>
              <div style={{
                color: '#1B3FA0',
                fontSize: '13px',
                fontWeight: 800,
                lineHeight: '1.3',
              }}>
                Encontre seu<br />lote ideal!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
