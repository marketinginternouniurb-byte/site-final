export const COOKIE_CONSENT_EVENT = "universal:open-cookie-preferences";

export type CookieCategory = "necessary" | "analytics" | "marketing";

export interface CookieConsentPreferences {
  version: string;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

const STORAGE_KEY = "universal_cookie_consent";
const COOKIE_NAME = "universal_cookie_consent";
const CONSENT_VERSION = "2026-05-26-v3";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

export const defaultCookieConsent = (): CookieConsentPreferences => ({
  version: CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date().toISOString(),
});

export function readCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CookieConsentPreferences>;
    if (parsed.version !== CONSENT_VERSION) return null;

    return {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveCookieConsent(preferences: CookieConsentPreferences) {
  if (typeof window === "undefined") return;

  const next = {
    ...preferences,
    necessary: true,
    updatedAt: new Date().toISOString(),
  } satisfies CookieConsentPreferences;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify({
    v: next.version,
    a: next.analytics,
    m: next.marketing,
    t: next.updatedAt,
  }))}; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax`;

  if (!next.analytics) {
    removeCookie("_ga");
    removeCookie("_gid");
    removeCookie("_gat");
  }

  if (!next.marketing) {
    removeCookie("_fbp");
    removeCookie("fr");
  }

  window.dispatchEvent(new CustomEvent("universal:cookie-consent-updated", { detail: next }));
}

export function hasCookieConsent(category: Exclude<CookieCategory, "necessary">) {
  const preferences = readCookieConsent();
  return Boolean(preferences?.[category]);
}

export function openCookiePreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT));
}

function removeCookie(name: string) {
  if (typeof window === "undefined") return;

  const host = window.location.hostname;
  const domains = [host, `.${host}`];
  const expires = "Thu, 01 Jan 1970 00:00:00 GMT";

  document.cookie = `${name}=; path=/; expires=${expires}; SameSite=Lax`;
  for (const domain of domains) {
    document.cookie = `${name}=; path=/; domain=${domain}; expires=${expires}; SameSite=Lax`;
  }
}
