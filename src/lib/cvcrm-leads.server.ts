type CvcrmEnv = {
  CVCRM_EMAIL?: string;
  CVCRM_API_EMAIL?: string;
  CVCRM_TOKEN?: string;
  CVCRM_API_TOKEN?: string;
  CVCRM_DOMAIN?: string;
  CVCRM_SUBDOMAIN?: string;
  CVCRM_BASE_URL?: string;
  CVCRM_ORIGEMCV?: string;
  LEAD_ALLOWED_ORIGINS?: string;
  LEAD_FORM_SECRET?: string;
  LEAD_RATE_LIMIT_MAX?: string;
  LEAD_RATE_LIMIT_WINDOW_MS?: string;
  LEAD_DRY_RUN?: string;
  DRY_RUN?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_TIMEOUT_MS?: string;
  LEAD_CVCRM_TIMEOUT_MS?: string;
};

type SiteLeadPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  origin?: string;
  conversion?: string;
  page?: string;
  campos_adicionais?: Record<string, unknown>;
  website?: string;
  company?: string;
  turnstileToken?: string;
};

type SecurityContext = {
  hasValidSecret: boolean;
  requestId: string;
  headers: Record<string, string>;
};

const TURNSTILE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function asEnv(env: unknown): CvcrmEnv {
  return (env ?? {}) as CvcrmEnv;
}

function cleanText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function cleanPhone(value: unknown): string | undefined {
  const phone = cleanText(value)?.replace(/\D/g, "");
  return phone && phone.length > 0 ? phone.slice(0, 15) : undefined;
}

function getNumberEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isEnabled(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes((value ?? "").toLowerCase());
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createRequestId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function buildJsonHeaders(request: Request, env: CvcrmEnv, requestId: string): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-request-id": requestId,
    vary: "Origin",
  };
  const origin = request.headers.get("origin")?.replace(/\/$/, "");

  if (origin && parseAllowedOrigins(env, request).has(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-methods"] = "POST, OPTIONS";
    headers["access-control-allow-headers"] = "content-type, x-lead-secret";
    headers["access-control-max-age"] = "600";
  }

  return headers;
}

function validatePayload(payload: SiteLeadPayload): string[] {
  const errors: string[] = [];
  const name = cleanText(payload.name);
  const email = cleanText(payload.email);
  const message = cleanText(payload.message);
  const page = cleanText(payload.page);

  if (name && (name.length < 2 || name.length > 120)) {
    errors.push("Nome invalido.");
  }

  if (email && (!isValidEmail(email) || email.length > 220)) {
    errors.push("E-mail invalido.");
  }

  if (message && message.length > 1500) {
    errors.push("Mensagem muito longa.");
  }

  if (page && page.length > 160) {
    errors.push("Pagina de origem invalida.");
  }

  return errors;
}

function parseAllowedOrigins(env: CvcrmEnv, request: Request): Set<string> {
  const allowed = new Set<string>();
  const requestOrigin = new URL(request.url).origin;
  allowed.add(requestOrigin);

  for (const origin of (env.LEAD_ALLOWED_ORIGINS ?? "").split(",")) {
    const trimmed = origin.trim().replace(/\/$/, "");
    if (trimmed) allowed.add(trimmed);
  }

  return allowed;
}

function getOriginToCheck(request: Request): string | undefined {
  const origin = request.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  return undefined;
}

async function secretMatches(received: string | null, expected: string | undefined): Promise<boolean> {
  if (!received || !expected) return false;

  const encoder = new TextEncoder();
  const [receivedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(received)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);

  const receivedBytes = new Uint8Array(receivedHash);
  const expectedBytes = new Uint8Array(expectedHash);
  if (receivedBytes.length !== expectedBytes.length) return false;

  let diff = 0;
  for (let i = 0; i < receivedBytes.length; i += 1) {
    diff |= receivedBytes[i] ^ expectedBytes[i];
  }
  return diff === 0;
}

function getRateLimitKey(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function checkRateLimit(request: Request, env: CvcrmEnv): boolean {
  const limit = getNumberEnv(env.LEAD_RATE_LIMIT_MAX, 12);
  const windowMs = getNumberEnv(env.LEAD_RATE_LIMIT_WINDOW_MS, 60_000);
  const now = Date.now();
  const key = getRateLimitKey(request);
  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  current.count += 1;
  return current.count <= limit;
}

function logLeadEvent(status: string, request: Request, requestId: string, payload?: SiteLeadPayload) {
  console.log(
    JSON.stringify({
      event: "lead_submission",
      status,
      requestId,
      origin: request.headers.get("origin") ?? null,
      page: cleanText(payload?.page) ?? null,
      hasEmail: Boolean(cleanText(payload?.email)),
      hasMessage: Boolean(cleanText(payload?.message)),
      userAgent: request.headers.get("user-agent")?.slice(0, 120) ?? null,
    }),
  );
}

function hasAllowedContentType(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.toLowerCase().includes("application/json");
}

function hasTooManyFields(payload: SiteLeadPayload): boolean {
  return Object.keys(payload).length > 16;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function validateTurnstile(
  request: Request,
  env: CvcrmEnv,
  payload: SiteLeadPayload,
  requestId: string,
): Promise<boolean> {
  const token = cleanText(payload.turnstileToken);
  if (!token || token.length > 4096 || !env.TURNSTILE_SECRET_KEY) {
    logLeadEvent(token ? "turnstile_not_configured" : "turnstile_missing", request, requestId, payload);
    return false;
  }

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) body.set("remoteip", ip);

  try {
    const response = await fetchWithTimeout(
      TURNSTILE_SITEVERIFY_URL,
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      },
      getNumberEnv(env.TURNSTILE_TIMEOUT_MS, 5_000),
    );
    const result = (await response.json()) as { success?: boolean };
    return response.ok && result.success === true;
  } catch {
    logLeadEvent("turnstile_error", request, requestId, payload);
    return false;
  }
}

async function validateRequestSecurity(
  request: Request,
  env: CvcrmEnv,
  requestId: string,
): Promise<SecurityContext | Response> {
  const headers = buildJsonHeaders(request, env, requestId);

  if (!hasAllowedContentType(request)) {
    logLeadEvent("invalid_content_type", request, requestId);
    return Response.json({ error: "Content-Type invalido." }, { status: 415, headers });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 20_000) {
    logLeadEvent("payload_too_large", request, requestId);
    return Response.json({ error: "Payload muito grande." }, { status: 413, headers });
  }

  const allowedOrigins = parseAllowedOrigins(env, request);
  const originToCheck = getOriginToCheck(request);
  const hasAllowedOrigin = originToCheck ? allowedOrigins.has(originToCheck) : false;
  const hasValidSecret = await secretMatches(request.headers.get("x-lead-secret"), env.LEAD_FORM_SECRET);

  if ((!originToCheck || !hasAllowedOrigin) && !hasValidSecret) {
    logLeadEvent(originToCheck ? "blocked_origin" : "missing_origin", request, requestId);
    return Response.json({ error: "Origem nao autorizada." }, { status: 403, headers });
  }

  if (!checkRateLimit(request, env)) {
    logLeadEvent("rate_limited", request, requestId);
    return Response.json({ error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429, headers });
  }

  return { hasValidSecret, requestId, headers };
}

function buildCvcrmUrl(env: CvcrmEnv): string | undefined {
  if (env.CVCRM_BASE_URL) {
    return `${env.CVCRM_BASE_URL.replace(/\/$/, "")}/api/v1/comercial/leads`;
  }

  const cvcrmDomain = cleanText(env.CVCRM_DOMAIN) ?? cleanText(env.CVCRM_SUBDOMAIN);
  if (cvcrmDomain) {
    return `https://${cvcrmDomain}.cvcrm.com.br/api/v1/comercial/leads`;
  }

  return undefined;
}

function buildCvcrmPayload(payload: SiteLeadPayload) {
  const email = cleanText(payload.email);
  const telefone = cleanPhone(payload.phone);
  const nome = cleanText(payload.name) ?? "Lead do site";
  const origem = cleanText(payload.origin) ?? "Site";
  const conversao = cleanText(payload.conversion) ?? "Formulario do site";
  const message = cleanText(payload.message);
  const page = cleanText(payload.page);

  const camposAdicionais: Record<string, unknown> = {
    canal: origem,
    pagina_origem: page,
    mensagem: message,
    ...(payload.campos_adicionais ?? {}),
  };

  Object.keys(camposAdicionais).forEach((key) => {
    if (camposAdicionais[key] === undefined || camposAdicionais[key] === "") {
      delete camposAdicionais[key];
    }
  });

  return {
    nome,
    email,
    telefone,
    telefone_ddi: telefone ? "+55" : undefined,
    modulo: "Site",
    origem,
    conversao,
    midia: "site",
    permitir_alteracao: true,
    campos_adicionais: camposAdicionais,
    interacoes: message
      ? [
          {
            tipo: "A",
            descricao: `Mensagem enviada pelo site: ${message}`,
          },
        ]
      : undefined,
  };
}

async function parseBody(request: Request): Promise<SiteLeadPayload | "too_large" | undefined> {
  try {
    const text = await request.text();
    if (text.length > 20_000) return "too_large";
    return JSON.parse(text) as SiteLeadPayload;
  } catch {
    return undefined;
  }
}

export async function handleCvcrmLeadRequest(request: Request, envInput: unknown): Promise<Response> {
  const env = asEnv(envInput);
  const requestId = createRequestId();
  const responseHeaders = buildJsonHeaders(request, env, requestId);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405, headers: responseHeaders });
  }

  const security = await validateRequestSecurity(request, env, requestId);
  if (security instanceof Response) return security;

  const payload = await parseBody(request);
  if (payload === "too_large") {
    logLeadEvent("payload_too_large", request, requestId);
    return Response.json({ error: "Payload muito grande." }, { status: 413, headers: security.headers });
  }

  if (!payload) {
    logLeadEvent("invalid_json", request, requestId);
    return Response.json({ error: "JSON invalido." }, { status: 400, headers: security.headers });
  }

  if (cleanText(payload.website) || cleanText(payload.company)) {
    logLeadEvent("honeypot", request, requestId, payload);
    return Response.json({ ok: true }, { status: 202, headers: security.headers });
  }

  if (hasTooManyFields(payload)) {
    logLeadEvent("too_many_fields", request, requestId, payload);
    return Response.json({ error: "Payload invalido." }, { status: 400, headers: security.headers });
  }

  const validationErrors = validatePayload(payload);
  if (validationErrors.length > 0) {
    logLeadEvent("validation_error", request, requestId, payload);
    return Response.json({ error: validationErrors.join(" ") }, { status: 400, headers: security.headers });
  }

  if (!security.hasValidSecret && !(await validateTurnstile(request, env, payload, requestId))) {
    return Response.json(
      { error: "Validacao de seguranca obrigatoria." },
      { status: env.TURNSTILE_SECRET_KEY ? 403 : 500, headers: security.headers },
    );
  }

  const cvcrmPayload = buildCvcrmPayload(payload);
  if (!cvcrmPayload.email && !cvcrmPayload.telefone) {
    logLeadEvent("missing_contact", request, requestId, payload);
    return Response.json(
      { error: "Informe e-mail ou telefone para cadastrar o lead." },
      { status: 400, headers: security.headers },
    );
  }

  if (isEnabled(env.LEAD_DRY_RUN) || isEnabled(env.DRY_RUN)) {
    logLeadEvent("dry_run", request, requestId, payload);
    return Response.json({ ok: true, dryRun: true }, { status: 200, headers: security.headers });
  }

  const cvcrmUrl = buildCvcrmUrl(env);
  const cvcrmEmail = cleanText(env.CVCRM_EMAIL) ?? cleanText(env.CVCRM_API_EMAIL);
  const cvcrmToken = cleanText(env.CVCRM_TOKEN) ?? cleanText(env.CVCRM_API_TOKEN);
  if (!cvcrmUrl || !cvcrmEmail || !cvcrmToken) {
    logLeadEvent("missing_cvcrm_credentials", request, requestId, payload);
    return Response.json(
      { error: "Credenciais CVCRM nao configuradas no ambiente." },
      { status: 500, headers: security.headers },
    );
  }

  let cvcrmResponse: Response;
  try {
    cvcrmResponse = await fetchWithTimeout(
      cvcrmUrl,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          email: cvcrmEmail,
          token: cvcrmToken,
          ...(env.CVCRM_ORIGEMCV ? { origemcv: env.CVCRM_ORIGEMCV } : {}),
        },
        body: JSON.stringify(cvcrmPayload),
      },
      getNumberEnv(env.LEAD_CVCRM_TIMEOUT_MS, 12_000),
    );
  } catch {
    logLeadEvent("cvcrm_timeout", request, requestId, payload);
    return Response.json(
      { error: "Falha temporaria ao cadastrar lead no CVCRM." },
      { status: 504, headers: security.headers },
    );
  }

  const responseText = await cvcrmResponse.text();
  let responseBody: unknown = responseText;
  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseBody = responseText;
  }

  if (!cvcrmResponse.ok) {
    console.error("CVCRM lead error", {
      status: cvcrmResponse.status,
      bodyType: typeof responseBody,
      requestId,
    });
    logLeadEvent("cvcrm_error", request, requestId, payload);

    return Response.json(
      { error: "Falha ao cadastrar lead no CVCRM." },
      { status: cvcrmResponse.status, headers: security.headers },
    );
  }

  logLeadEvent("success", request, requestId, payload);
  return Response.json({ ok: true, data: responseBody }, { status: 200, headers: security.headers });
}
