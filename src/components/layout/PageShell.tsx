import React, { useEffect } from "react";
import Navbar from "./Navbar";
import FooterSection from "@/components/home/FooterSection";

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  useEffect(() => {
    const TYPEBOT_VERSION = "lotti-avatar-v5";

    if (localStorage.getItem("lotti-typebot-version") !== TYPEBOT_VERSION) {
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

      localStorage.setItem("lotti-typebot-version", TYPEBOT_VERSION);
    }

    const script = document.createElement("script");
    script.type = "module";
    script.innerHTML = `
      import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js?v=lotti-avatar-v5';

      Typebot.initBubble({
        typebot: 'lotti-final-whats-app-sem-pergunta-web-com-telefone-r5u6gcg',
        apiHost: 'https://typebot.co',
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
     
