import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import FooterSection from "@/components/home/FooterSection";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
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
      Typebot.initBubble({
        typebot: 'lotti-final-whats-app-sem-pergunta-web-com-telefone-r5u6gcg',
        apiHost: 'https://typebot.co',
        theme: {
          button: {
            backgroundColor: 'transparent',
            size: 'medium',
          },
        },
      });
      window.__openTypebot = () => Typebot.open();
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
    (window as any).__openTypebot?.();
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
            filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.3))',
          }}
        >
          <img
            src="https://site-final.marketing-internouniurb.workers.dev/mascote-universal.png"
            alt="Lotti"
            style={{
              width: '130px',
              height: '130px',
              objectFit: 'contain',
              transform: 'translateY(-20px)',
              zIndex: 2,
              flexShrink: 0,
            }}
          />

          <div style={{
            backgroundColor: '#F5C400',
            borderRadius: '50px',
            padding: '14px 22px 14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '3px solid #1B3FA0',
            minWidth: '185px',
          }}>
            <div style={{
              backgroundColor: '#1B3FA0',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="#F5C400"/>
              </svg>
            </div>
            <div>
              <div style={{
                color: '#1B3FA0',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.8px',
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
