import "./lib/error-capture";

import { handleCvcrmLeadRequest } from "./lib/cvcrm-leads.server";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type RuntimeEnv = {
  PUBLIC_SITE_URL?: string;
  SITE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_URL?: string;
  VITE_PUBLIC_SITE_URL?: string;
  VITE_SITE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  PUBLIC_TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
  VITE_TURNSTILE_SITE_KEY?: string;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
const DEFAULT_TURNSTILE_SITE_KEY = "0x4AAAAAADlM-kb3xZFLVUpS";
const DEFAULT_SITE_URL = "https://site-final2.marketing-internouniurb.workers.dev";

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

function publicConfigResponse(envInput: unknown): Response {
  const env = (envInput ?? {}) as RuntimeEnv;
  const turnstileSiteKey =
    env.TURNSTILE_SITE_KEY ||
    env.VITE_TURNSTILE_SITE_KEY ||
    env.PUBLIC_TURNSTILE_SITE_KEY ||
    env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    DEFAULT_TURNSTILE_SITE_KEY;

  return Response.json(
    {
      turnstileSiteKey,
    },
    {
      headers: {
        "cache-control": "no-store",
        "strict-transport-security": "max-age=31536000; includeSubDomains",
        "x-content-type-options": "nosniff",
      },
    },
  );
}

function resolveSiteUrl(envInput: unknown, request: Request) {
  const env = (envInput ?? {}) as RuntimeEnv;
  const configured =
    env.PUBLIC_SITE_URL ||
    env.VITE_PUBLIC_SITE_URL ||
    env.SITE_URL ||
    env.VITE_SITE_URL;
  const fallback = new URL(request.url).origin || DEFAULT_SITE_URL;
  return (configured || fallback || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function fetchPublicProjectIds(envInput: unknown): Promise<string[]> {
  const env = (envInput ?? {}) as RuntimeEnv;
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const anonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) return [];

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/properties?select=id&order=created_at.desc`,
      {
        headers: {
          apikey: anonKey,
          authorization: `Bearer ${anonKey}`,
        },
      },
    );

    if (!response.ok) return [];
    const rows = (await response.json()) as Array<{ id?: string | number | null }>;
    return rows
      .map((row) => row.id)
      .filter((id): id is string | number => id !== null && id !== undefined)
      .map(String);
  } catch (error) {
    console.warn("Nao foi possivel montar sitemap dinamico de empreendimentos.", error);
    return [];
  }
}

async function sitemapResponse(request: Request, envInput: unknown): Promise<Response> {
  const siteUrl = resolveSiteUrl(envInput, request);
  const today = new Date().toISOString().slice(0, 10);
  const staticRoutes = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/sobre", changefreq: "monthly", priority: "0.8" },
    { path: "/contato", changefreq: "monthly", priority: "0.8" },
    { path: "/facilita", changefreq: "monthly", priority: "0.7" },
    { path: "/universal-facilita", changefreq: "monthly", priority: "0.7" },
    { path: "/politica-de-privacidade", changefreq: "yearly", priority: "0.5" },
  ];
  const projectRoutes = (await fetchPublicProjectIds(envInput)).map((id) => ({
    path: `/empreendimento/${encodeURIComponent(id)}`,
    changefreq: "daily",
    priority: "0.8",
  }));
  const urls = [...staticRoutes, ...projectRoutes]
    .map(
      (route) => `  <url>
    <loc>${xmlEscape(`${siteUrl}${route.path}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    )
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: {
      "cache-control": "public, max-age=900",
      "content-type": "application/xml; charset=utf-8",
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "x-content-type-options": "nosniff",
    },
  });
}

function robotsResponse(request: Request, envInput: unknown): Response {
  const siteUrl = resolveSiteUrl(envInput, request);
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\n\nSitemap: ${siteUrl}/sitemap.xml\n`, {
    headers: {
      "cache-control": "public, max-age=900",
      "content-type": "text/plain; charset=utf-8",
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "x-content-type-options": "nosniff",
    },
  });
}

function applySecurityHeaders(request: Request, response: Response): Response {
  const url = new URL(request.url);
  const headers = new Headers(response.headers);

  headers.set("x-content-type-options", "nosniff");
  headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set(
    "permissions-policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
  );
  headers.set("x-frame-options", "SAMEORIGIN");

  const cspReportOnly = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https:",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://challenges.cloudflare.com https://typebot.co https://*.typebot.co",
    "connect-src 'self' https://*.supabase.co https://typebot.co https://*.typebot.co https://challenges.cloudflare.com",
    "frame-src 'self' https://challenges.cloudflare.com https://typebot.co https://*.typebot.co https://www.youtube.com https://www.youtube-nocookie.com",
    "upgrade-insecure-requests",
  ].join("; ");

  headers.set("content-security-policy", cspReportOnly);
  headers.set("content-security-policy-report-only", cspReportOnly);

  if (url.pathname.startsWith("/admin") || url.pathname === "/login") {
    headers.set("cache-control", "no-store");
    headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/send-lead-to-cvcrm") {
        return await handleCvcrmLeadRequest(request, env);
      }
      if (url.pathname === "/api/security-config") {
        return publicConfigResponse(env);
      }
      if (url.pathname === "/robots.txt") {
        return robotsResponse(request, env);
      }
      if (url.pathname === "/sitemap.xml") {
        return await sitemapResponse(request, env);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return applySecurityHeaders(request, await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(request, brandedErrorResponse());
    }
  },
};
