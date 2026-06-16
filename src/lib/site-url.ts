const FALLBACK_SITE_URL = "https://site-final2.marketing-internouniurb.workers.dev";

function normalizeSiteUrl(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return FALLBACK_SITE_URL;
  return trimmed.replace(/\/+$/, "");
}

export const SITE_URL = normalizeSiteUrl(
  import.meta.env.VITE_PUBLIC_SITE_URL || import.meta.env.VITE_SITE_URL,
);

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
