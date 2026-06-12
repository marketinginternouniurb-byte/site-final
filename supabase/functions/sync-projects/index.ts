import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

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
  if (Array.isArray(payload?.empreendimentos)) return payload.empreendimentos;
  if (Array.isArray(payload?.dados?.unidades)) return payload.dados.unidades;
  if (Array.isArray(payload?.dados?.items)) return payload.dados.items;
  return [];
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

    const [legacyProject, legacyUnits, cvbotUnits, cvdwProjects] = await Promise.all([
      fetchJson(`${baseUrl}/api/cvio/empreendimento?token=${encodedToken}&id=${encodedId}`),
      fetchJson(`${baseUrl}/api/cvio/unidade?token=${encodedToken}&idempreendimento=${encodedId}`),
      v1Headers
        ? fetchJson(`${baseUrl}/api/v1/cvbot/empreendimentos/${encodedId}/unidades`, {
            headers: v1Headers,
          })
        : Promise.resolve({ ok: false, status: 0, data: null }),
      v1Headers
        ? fetchJson(`${baseUrl}/api/v1/cvdw/empreendimentos?pagina=1&registros_por_pagina=500`, {
            headers: v1Headers,
          })
        : Promise.resolve({ ok: false, status: 0, data: null }),
    ]);

    const projectFromLegacy = getProjectPayload(legacyProject.data, idEmpreendimento);
    const projectFromCvdw = getProjectPayload(cvdwProjects.data, idEmpreendimento);
    const project =
      normalizeText(projectFromLegacy?.mensagem).includes("dados invalidos")
        ? projectFromCvdw
        : { ...projectFromCvdw, ...projectFromLegacy };

    const legacyUnitRows = getArrayPayload(legacyUnits.data);
    const cvbotUnitRows = getArrayPayload(cvbotUnits.data);
    const units = legacyUnitRows.length > 0 ? legacyUnitRows : cvbotUnitRows;
    const availableUnits =
      legacyUnitRows.length > 0 ? legacyUnitRows.filter(isAvailableUnit) : cvbotUnitRows;

    const gallery = project?.fotos || project?.galeria || project?.imagens || [];
    const responseData = {
      project: {
        ...project,
        foto_destaque: getProjectImage(project, gallery),
      },
      stats: {
        total:
          units.length ||
          Number(project?.unidades_totais || project?.total_unidades || project?.quantidade_unidades || 0),
        available:
          availableUnits.length ||
          Number(project?.unidades_disponiveis || project?.disponiveis || project?.quantidade_disponiveis || 0),
      },
      gallery,
      units: units.map((unit: any) => ({
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
      debug: {
        legacyProjectStatus: legacyProject.status,
        legacyUnitsStatus: legacyUnits.status,
        cvbotUnitsStatus: cvbotUnits.status,
        cvdwProjectsStatus: cvdwProjects.status,
        hasCvcrmEmail: Boolean(cvcrmEmail),
      },
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
