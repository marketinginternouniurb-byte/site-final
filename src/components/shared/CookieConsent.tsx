import { useEffect, useState } from "react";
import { Cookie, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import {
  COOKIE_CONSENT_EVENT,
  defaultCookieConsent,
  readCookieConsent,
  saveCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent";

const categoryCopy = [
  {
    key: "necessary" as const,
    title: "Essenciais",
    text: "Mantêm segurança, login administrativo, preferências de privacidade e funções básicas do site.",
  },
  {
    key: "analytics" as const,
    title: "Analytics",
    text: "Reservado para ferramentas de medição. Só funciona com autorização expressa.",
  },
  {
    key: "marketing" as const,
    title: "Marketing",
    text: "Autoriza recursos externos de atendimento e campanha, como o chat Lotti/Typebot. Só funciona com autorização expressa.",
  },
];

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [consentRecorded, setConsentRecorded] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentPreferences>(defaultCookieConsent);

  useEffect(() => {
    setMounted(true);

    const saved = readCookieConsent();
    if (saved) {
      setPreferences(saved);
      setConsentRecorded(true);
    } else {
      setVisible(true);
    }

    const openPreferences = () => {
      const current = readCookieConsent();
      setPreferences(current ?? defaultCookieConsent());
      setConsentRecorded(Boolean(current));
      setCustomizing(true);
      setVisible(true);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, openPreferences);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, openPreferences);
  }, []);

  const persist = (next: CookieConsentPreferences) => {
    saveCookieConsent(next);
    setPreferences(next);
    setConsentRecorded(true);
    setVisible(false);
    setCustomizing(false);
  };

  const acceptAll = () =>
    persist({
      ...defaultCookieConsent(),
      analytics: true,
      marketing: true,
    });

  const necessaryOnly = () => persist(defaultCookieConsent());

  const saveCustom = () =>
    persist({
      ...preferences,
      necessary: true,
    });

  if (!mounted) return null;

  if (!visible) {
    if (!consentRecorded) return null;

    return (
      <button
        type="button"
        onClick={() => {
          setPreferences(readCookieConsent() ?? defaultCookieConsent());
          setCustomizing(true);
          setVisible(true);
        }}
        className="fixed bottom-4 left-4 z-[9999] inline-flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-[#FFD700]/60 bg-[#123AAA] px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_16px_45px_rgba(0,0,0,0.35)] transition hover:bg-[#0d2c82] sm:bottom-6 sm:left-6"
      >
        <Cookie size={16} className="shrink-0 text-[#FFD700]" />
        <span>Cookies</span>
      </button>
    );
  }

  return (
    <section
      aria-label="Preferências de cookies"
      className="fixed inset-x-0 bottom-0 z-[9999] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="relative mx-auto flex max-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-col overflow-y-auto rounded-3xl border-2 border-[#FFD700]/45 bg-[#123AAA] text-white shadow-[0_24px_90px_rgba(0,0,0,0.5)] sm:max-h-[calc(100vh-3rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem]">
          <div className="p-5 sm:p-7">
            <div className="flex items-start gap-3 sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFD700] text-[#123AAA]">
                <Cookie size={23} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#FFD700]">
                  Privacidade e cookies
                </p>
                <h2 className="mt-1 text-lg font-black leading-tight sm:text-2xl">
                  Controle seus dados de navegação
                </h2>
              </div>
            </div>

            <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-white/80 sm:text-base">
              Usamos cookies essenciais para funcionamento e segurança. Cookies de analytics e marketing ficam bloqueados por padrão e só serão ativados com a sua autorização.
            </p>

            {customizing && (
              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                {categoryCopy.map((category) => {
                  const checked = category.key === "necessary" ? true : preferences[category.key];

                  return (
                    <label
                      key={category.key}
                      className="flex min-h-[132px] flex-col rounded-2xl border border-white/15 bg-white/[0.06] p-4"
                    >
                      <span className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-sm font-black uppercase tracking-wider text-white">
                          {category.title}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={category.key === "necessary"}
                          onChange={(event) =>
                            setPreferences((current) => ({
                              ...current,
                              [category.key]: event.target.checked,
                            }))
                          }
                          className="h-5 w-5 shrink-0 accent-[#FFD700]"
                        />
                      </span>
                      <span className="text-xs font-medium leading-relaxed text-white/70">
                        {category.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-3 border-t border-white/15 bg-[#0b2f91] p-5 sm:p-6 lg:border-l lg:border-t-0">
            {customizing ? (
              <>
                <button
                  type="button"
                  onClick={saveCustom}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD700] px-5 py-4 text-sm font-black uppercase tracking-widest text-[#123AAA] transition hover:bg-[#ffe45c]"
                >
                  <ShieldCheck size={17} />
                  Salvar escolhas
                </button>
                <button
                  type="button"
                  onClick={necessaryOnly}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 px-5 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Somente essenciais
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD700] px-5 py-4 text-sm font-black uppercase tracking-widest text-[#123AAA] transition hover:bg-[#ffe45c]"
                >
                  <ShieldCheck size={17} />
                  Aceitar todos
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizing(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 px-5 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <SlidersHorizontal size={17} />
                  Revisar cookies
                </button>
                <button
                  type="button"
                  onClick={necessaryOnly}
                  className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-widest text-white/75 transition hover:text-white"
                >
                  Somente essenciais
                </button>
              </>
            )}

            <a
              href="/politica-de-privacidade"
              className="text-center text-[11px] font-bold uppercase tracking-widest text-[#FFD700] hover:underline"
            >
              Política de Privacidade
            </a>
          </div>
        </div>

        {consentRecorded && (
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Fechar preferências de cookies"
            className="absolute right-5 top-5 text-white/70 transition hover:text-white sm:right-7 sm:top-7"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </section>
  );
}
