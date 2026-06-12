import React, { useEffect } from "react";
import Navbar from "./Navbar";
import FooterSection from "@/components/home/FooterSection";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  useEffect(() => {
    const TYPEBOT_VERSION = "lotti-avatar-v4";

    const createSessionId = () => {
      if (window.crypto?.randomUUID) {
        return `lotti-site-${TYPEBOT_VERSION}-${window.crypto.randomUUID()}`;
      }

      return `lotti-site-${TYPEBOT_VERSION}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
    };

    const storedVersion = localStorage.getItem("lotti-typebot-version");
    let sessionId = localStorage.getItem("lotti-typebot-session-id");

    if (storedVersion !== TYPEBOT_VERSION || !sessionId) {
      Object.keys(localStorage).forEach((key) => {
        if (key.toLowerCase().includes("typebot")) {
          localStorage.removeItem(key);
        }
      });

      Object.keys(sessionStorage).forEach((key) => {
        if (key.toLowerCase().includes("typebot")) {
          sessionStorage.removeItem(key);
        }
      });

      sessionId = createSessionId();
      localStorage.setItem("lotti-typebot-version", TYPEBOT_VERSION);
      localStorage.setItem("lotti-typebot-session-id", sessionId);
    }

    const script = document.createElement("script");
    script.type = "module";
    script.innerHTML = `
      import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js?v=${TYPEBOT_VERSION}';

      Typebot.unmount();

      Typebot.initBubble({
        typebot: 'lotti-final-whats-app-sem-pergunta-web-com-telefone-r5u6gcg',
        apiHost: 'https://typebot.co',
        sessionId: '${sessionId}',
        theme: {
          button: {
            backgroundColor: '#F5C400',
            customIconSrc: 'data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M21%2015a4%204%200%200%201-4%204H8l-5%203V7a4%204%200%200%201%204-4h10a4%204%200%200%201%204%204v8Z%22%20stroke%3D%22%231B3FA0%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M8%209h8M8%2013h5%22%20stroke%3D%22%231B3FA0%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E',
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

      <div
        style={{
          position: "fixed",
          right: "22px",
          bottom: "96px",
          zIndex: 9998,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "relative",
            backgroundColor: "#1B3FA0",
            color: "#fff",
            borderRadius: "16px 16px 4px 16px",
            padding: "10px 14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            width: "160px",
            textAlign: "center",
            marginBottom: "42px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "#F5C400",
              marginBottom: "4px",
            }}
          >
            LOTTI
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              lineHeight: "1.35",
            }}
          >
            Encontre seu lote ideal! 😊
          </div>

          <span
            style={{
              position: "absolute",
              right: "-5px",
              bottom: "18px",
              width: "12px",
              height: "12px",
              backgroundColor: "#1B3FA0",
              borderRadius: "2px",
              transform: "rotate(45deg)",
            }}
          />
        </div>

        <img
          src="/mascote-universal.png?v=4"
          alt="Lotti"
          style={{
            width: "112px",
            height: "112px",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}
