import { useEffect, useRef, useState } from "react";

type TurnstileTheme = "auto" | "light" | "dark";

type TurnstileWidgetProps = {
  value: string;
  onChange: (token: string) => void;
  resetSignal?: number;
  theme?: TurnstileTheme;
};

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: TurnstileTheme;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

async function loadTurnstileScript() {
  if (window.turnstile) return;
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const selector =
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]';
    const existing = document.querySelector<HTMLScriptElement>(selector);

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

async function getSiteKey() {
  const response = await fetch("/api/security-config", {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) return "";

  const data = (await response.json()) as { turnstileSiteKey?: string };
  return data.turnstileSiteKey ?? "";
}

export function TurnstileWidget({
  value: _value,
  onChange,
  resetSignal,
  theme = "auto",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [siteKey, setSiteKey] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getSiteKey()
      .then((key) => {
        if (!cancelled) {
          setSiteKey(key);
          setUnavailable(!key);
        }
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile || !containerRef.current || widgetIdRef.current) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token) => onChange(token),
          "expired-callback": () => onChange(""),
          "error-callback": () => onChange(""),
        });
      })
      .catch(() => setUnavailable(true));

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onChange, siteKey, theme]);

  useEffect(() => {
    onChange("");
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [onChange, resetSignal]);

  if (unavailable) {
    return (
      <p className="text-xs font-semibold text-red-500">
        Validacao de seguranca indisponivel.
      </p>
    );
  }

  if (!siteKey) return null;

  return <div ref={containerRef} className="min-h-[65px]" />;
}
