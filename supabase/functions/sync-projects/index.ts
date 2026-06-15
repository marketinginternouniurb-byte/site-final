import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://site-final2.marketing-internouniurb.workers.dev",
  "https://site-final.marketing-internouniurb.workers.dev",
  "http://localhost:5173",
  "http://localhost:4173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin")?.replace(/\/$/, "") || "";
  const configured = (Deno.env.get("SYNC_ALLOWED_ORIGINS") || "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const allowedOrigins = configured.length > 0 ? configured : DEFAULT_ALLOWED_ORIGINS;
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
  };
}

function normalizeText(value?: string | null) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isAvailableUnit(unit: any) {
  const status = normalizeText(
    unit?.situacao ||
      unit?.status ||
      unit?.situacao_comercial ||
      unit?.status_comercial ||
      unit?.disponibilidade
  );

  return (
    status.includes("disponivel") ||
    status.includes("liberado") ||
    status.includes("a venda") ||
    status.includes("venda")
  );
}

function getArrayPayload(payload: any) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.dados)) return payload.dados;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.unidades)) return payload.unidades;
  if (Array.isArray(payload?.lotes)) return payload.lotes;
  if (Array.isArray(payload?.empreendimentos)) return payload.empreendimentos;
  if (Array.isArray(payload?.dados?.unidades)) return payload.dados.unidades;
  if (Array.isArray(payload?.dados?.lotes)) return payload.dados.lotes;
  if (Array.isArray(payload?.dados?.items)) return payload.dados.items;
  return [];
}

function isUnitLike(item: any) {
  if (!item || typeof item !== "object") return false;

  return Boolean(
    item.idunidade ||
      item.idunidade_int ||
      item.unidade ||
      item.nome ||
      item.lote ||
      item.numero ||
      item.situacao ||
      item.status ||
      item.situacao_comercial ||
      item.status_comercial ||
      item.disponibilidade
  );
}

function findArrays(payload: any, arrays: any[][] = [], depth = 0) {
  if (!payload || depth > 8) return arrays;

  if (Array.isArray(payload)) {
    arrays.push(payload);
    payload.forEach((item) => findArrays(item, arrays, depth + 1));
    return arrays;
  }

  if (typeof payload !== "object") return arrays;

  Object.values(payload).forEach((value) => {
    if (Array.isArray(value)) arrays.push(value);
    if (value && typeof value === "object") findArrays(value, arrays, depth + 1);
  });

  return arrays;
}

function getAvailabilityRows(payload: any) {
  const directRows = getArrayPayload(payload);
  const arrays = [directRows, ...findArrays(payload)].filter((rows) => rows.length > 0);

  const unitArrays = arrays.filter((rows) => rows.some(isUnitLike));
  const bestArray = (unitArrays.length > 0 ? unitArrays : arrays).sort(
    (a, b) => b.length - a.length
  )[0];

  return bestArray || [];
}

function getNumberValue(value: any) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function getTotalFromPayload(payload: any, depth = 0): number | null {
  if (!payload || typeof payload !== "object" || depth > 8) return null;

  const totalKeys = [
    "total",
    "total_registros",
    "total_registro",
    "totalRegistros",
    "total_lotes",
    "lotes_totais",
    "unidades_totais",
    "total_unidades",
    "quantidade_unidades",
    "quantidade_lotes",
    "qtd_unidades",
    "qtd_lotes",
  ];

  for (const key of totalKeys) {
    const value = getNumberValue(payload?.[key]);
    if (value !== null) return value;
  }

  for (const value of Object.values(payload)) {
    const nested = getTotalFromPayload(value, depth + 1);
    if (nested !== null) return nested;
  }

  return null;
}

function getProjectPayload(payload: any, idEmpreendimento: string) {
  const rows = getArrayPayload(payload);
  if (rows.length > 0) {
    return (
      rows.find((item: any) => {
        const ids = [
          item?.idempreendimento,
          item?.id,
          item?.codigo,
          item?.referencia,
          item?.idempreendimento_int,
        ].map((value) => String(value || ""));
        return ids.includes(String(idEmpreendimento));
      }) || rows[0]
    );
  }

  return payload?.dados || payload?.data || payload || {};
}

function isUpstreamErrorPayload(payload: any) {
  if (!payload || typeof payload !== "object") return false;

  const status = Number(payload.status || payload.code || payload.codigo);
  const message = normalizeText(
    payload.error ||
      payload.message ||
      payload.mensagem ||
      payload.erro ||
      payload.descricao
  );

  return (
    (Number.isFinite(status) && status >= 400) ||
    message.includes("method not allowed") ||
    message.includes("dados invalidos") ||
    message.includes("nao autorizado") ||
    message.includes("unauthorized")
  );
}

function hasProjectMetadata(payload: any) {
  if (!payload || typeof payload !== "object" || isUpstreamErrorPayload(payload)) {
    return false;
  }

  return Boolean(
    payload.idempreendimento ||
      payload.id ||
      payload.codigo ||
      payload.referencia ||
      payload.nome ||
      payload.titulo ||
      payload.situacao ||
      payload.cidade ||
      payload.descricao ||
      payload.foto_destaque ||
      payload.foto ||
      payload.imagem ||
      payload.imagem_principal ||
      payload.url_foto ||
      payload.foto_url ||
      payload.capa ||
      payload.banner ||
      payload.fotos ||
      payload.galeria ||
      payload.imagens
  );
}

function getSafeProjectPayload(payload: any, idEmpreendimento: string) {
  if (isUpstreamErrorPayload(payload)) return null;

  const project = getProjectPayload(payload, idEmpreendimento);
  return hasProjectMetadata(project) ? project : null;
}

function getImageUrlFromValue(value: any): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return (
    value.url ||
    value.foto ||
    value.imagem ||
    value.arquivo ||
    value.caminho ||
    value.link ||
    null
  );
}

function getProjectImage(project: any, gallery: any[] = []) {
  const direct =
    project?.foto_destaque ||
    project?.foto ||
    project?.imagem ||
    project?.imagem_principal ||
    project?.url_foto ||
    project?.foto_url ||
    project?.capa ||
    project?.banner;

  return getImageUrlFromValue(direct) || getImageUrlFromValue(gallery[0]);
}

async function getRequestId(req: Request) {
  const url = new URL(req.url);
  const queryId = url.searchParams.get("id");
  if (queryId) return queryId;

  if (req.method !== "GET") {
    try {
      const body = await req.json();
      return body?.id || body?.idempreendimento || body?.idEmpreendimento || null;
    } catch {
      return null;
    }
  }

  return null;
}

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const text = await response.text();

  try {
    return {
      ok: response.ok,
      status: response.status,
      data: text ? JSON.parse(text) : null,
    };
  } catch {
    return {
      ok: response.ok,
      status: response.status,
      data: text,
    };
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const cvcrmEmail = Deno.env.get("CVCRM_EMAIL") || Deno.env.get("CVCRM_API_EMAIL");
    const cvcrmToken = Deno.env.get("CVCRM_TOKEN") || Deno.env.get("CVCRM_API_TOKEN");
    const cvcrmDomain = Deno.env.get("CVCRM_DOMAIN") || Deno.env.get("CVCRM_SUBDOMAIN");
    const idEmpreendimento = await getRequestId(req);

    if (!cvcrmToken || !cvcrmDomain) {
      return new Response(
        JSON.stringify({ error: "Token ou dominio do CVCRM nao configurado." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    if (!idEmpreendimento) {
      return new Response(JSON.stringify({ error: "ID do empreendimento nao informado." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const baseUrl = `https://${cvcrmDomain}.cvcrm.com.br`;
    const encodedToken = encodeURIComponent(cvcrmToken);
    const encodedId = encodeURIComponent(idEmpreendimento);
    const v1Headers = cvcrmEmail
      ? {
          accept: "application/json",
          email: cvcrmEmail,
          token: cvcrmToken,
        }
      : undefined;

    if (idEmpreendimento === "all") {
      const legacyAll = await fetchJson(
        `${baseUrl}/api/cvio/empreendimento?token=${encodedToken}`
      );

      return new Response(JSON.stringify(getArrayPayload(legacyAll.data)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [legacyProject, legacyUnits, cvbotUnits, mapAvailability, cvdwProjects] = await Promise.all([
      fetchJson(`${baseUrl}/api/cvio/empreendimento?token=${encodedToken}&id=${encodedId}`),
      fetchJson(`${baseUrl}/api/cvio/unidade?token=${encodedToken}&idempreendimento=${encodedId}`),
      v1Headers
        ? fetchJson(`${baseUrl}/api/v1/cvbot/empreendimentos/${encodedId}/unidades`, {
            headers: v1Headers,
          })
        : Promise.resolve({ ok: false, status: 0, data: null }),
      v1Headers
        ? fetchJson(
            `${baseUrl}/api/v1/comercial/mapadisponibilidade/${encodedId}?limitePagina=500&pag=1`,
            {
              headers: v1Headers,
            }
          )
        : Promise.resolve({ ok: false, status: 0, data: null }),
      v1Headers
        ? fetchJson(`${baseUrl}/api/v1/cvdw/empreendimentos?pagina=1&registros_por_pagina=500`, {
            headers: v1Headers,
          })
        : Promise.resolve({ ok: false, status: 0, data: null }),
    ]);

    const projectFromLegacy = getSafeProjectPayload(legacyProject.data, idEmpreendimento);
    const projectFromCvdw = getSafeProjectPayload(cvdwProjects.data, idEmpreendimento);
    const projectSources: Array<{ name: string; project: Record<string, unknown> | null }> = [
      { name: "cvdw_projects", project: projectFromCvdw },
      { name: "legacy_project", project: projectFromLegacy },
    ];
    const validProjectSources = projectSources.filter(
      (source): source is { name: string; project: Record<string, unknown> } =>
        Boolean(source.project)
    );
    const project =
      validProjectSources.length > 0
        ? validProjectSources.reduce((acc, source) => ({ ...acc, ...source.project }), {})
        : { idempreendimento: idEmpreendimento };

    if (validProjectSources.length === 0) {
      console.warn("sync-projects project metadata fallback", {
        idEmpreendimento,
        legacyProjectStatus: legacyProject.status,
        cvdwProjectsStatus: cvdwProjects.status,
        legacyProjectError: isUpstreamErrorPayload(legacyProject.data),
        cvdwProjectsError: isUpstreamErrorPayload(cvdwProjects.data),
      });
    }

    const legacyUnitRows = getArrayPayload(legacyUnits.data);
    const cvbotUnitRows = getArrayPayload(cvbotUnits.data);
    const mapRows = getAvailabilityRows(mapAvailability.data);
    const mapTotal = getTotalFromPayload(mapAvailability.data);
    const availableUnits = cvbotUnitRows.length > 0
      ? cvbotUnitRows
      : legacyUnitRows.length > 0
        ? legacyUnitRows.filter(isAvailableUnit)
        : mapRows.filter(isAvailableUnit);

    const gallery = project?.fotos || project?.galeria || project?.imagens || [];
    const responseData: Record<string, unknown> = {
      project: {
        ...project,
        foto_destaque: getProjectImage(project, gallery),
      },
      stats: {
        total:
          mapTotal ||
          mapRows.length ||
          Number(project?.unidades_totais || project?.total_unidades || project?.quantidade_unidades || 0),
        available:
          availableUnits.length ||
          Number(project?.unidades_disponiveis || project?.disponiveis || project?.quantidade_disponiveis || 0),
      },
      gallery,
      units: availableUnits.map((unit: any) => ({
        id: unit.idunidade || unit.id || unit.codigo || unit.referencia,
        label:
          unit.unidade ||
          unit.nome ||
          unit.lote ||
          unit.numero ||
          unit.idunidade ||
          unit.referencia ||
          "Lote",
        status:
          unit.situacao ||
          unit.status ||
          unit.situacao_comercial ||
          unit.status_comercial ||
          unit.disponibilidade ||
          "Disponivel",
        subbloco: unit.subbloco || unit.quadra || unit.bloco || "",
      })),
    };

    if (Deno.env.get("DEBUG_CVCRM") === "true") {
      responseData.debug = {
        legacyProjectStatus: legacyProject.status,
        legacyUnitsStatus: legacyUnits.status,
        cvbotUnitsStatus: cvbotUnits.status,
        mapAvailabilityStatus: mapAvailability.status,
        mapRows: mapRows.length,
        mapTotal,
        cvdwProjectsStatus: cvdwProjects.status,
        hasCvcrmEmail: Boolean(cvcrmEmail),
      };
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("sync-projects error", {
      message: error instanceof Error ? error.message : "unknown",
    });

    return new Response(JSON.stringify({ error: "Erro ao sincronizar dados do CVCRM." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
