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
      unit?.status_comercial
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
  if (Array.isArray(payload?.unidades)) return payload.unidades;
  if (Array.isArray(payload?.dados?.unidades)) return payload.dados.unidades;
  return [];
}

function getProjectPayload(payload: any) {
  if (Array.isArray(payload?.dados)) return payload.dados[0] || {};
  return payload?.dados || payload?.data || payload || {};
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const cvcrmApiToken = Deno.env.get("CVCRM_API_TOKEN");
    const cvcrmSubdomain = Deno.env.get("CVCRM_SUBDOMAIN");
    const idEmpreendimento = await getRequestId(req);

    if (!cvcrmApiToken || !cvcrmSubdomain) {
      return new Response(
        JSON.stringify({ error: "CVCRM_API_TOKEN ou CVCRM_SUBDOMAIN nao configurado." }),
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

    const baseUrl = `https://${cvcrmSubdomain}.cvcrm.com.br/api/cvio`;
    const token = encodeURIComponent(cvcrmApiToken);

    if (idEmpreendimento === "all") {
      const allRes = await fetch(`${baseUrl}/empreendimento?token=${token}`);
      const allData = await allRes.json();

      return new Response(JSON.stringify(getArrayPayload(allData)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const encodedId = encodeURIComponent(idEmpreendimento);

    const [projectRes, unitsRes] = await Promise.all([
      fetch(`${baseUrl}/empreendimento?token=${token}&id=${encodedId}`),
      fetch(`${baseUrl}/unidade?token=${token}&idempreendimento=${encodedId}`),
    ]);

    const [projectData, unitsData] = await Promise.all([
      projectRes.json(),
      unitsRes.json(),
    ]);

    const project = getProjectPayload(projectData);
    const units = getArrayPayload(unitsData);
    const availableUnits = units.filter(isAvailableUnit);

    const responseData = {
      project,
      stats: {
        total: units.length,
        available: availableUnits.length,
      },
      gallery: project?.fotos || project?.galeria || [],
      units: units.map((unit: any) => ({
        id: unit.idunidade || unit.id || unit.codigo,
        label:
          unit.unidade ||
          unit.nome ||
          unit.lote ||
          unit.numero ||
          unit.idunidade ||
          "Lote",
        status:
          unit.situacao ||
          unit.status ||
          unit.situacao_comercial ||
          unit.status_comercial ||
          "",
        subbloco: unit.subbloco || unit.quadra || unit.bloco || "",
      })),
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
