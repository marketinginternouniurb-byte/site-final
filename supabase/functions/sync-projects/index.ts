import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const cvcrmApiToken = Deno.env.get("CVCRM_API_TOKEN");
    const cvcrmSubdomain = Deno.env.get("CVCRM_SUBDOMAIN");
    
    const url = new URL(req.url);
    const idEmpreendimento = url.searchParams.get("id") || "2";

    // Se o ID for 'all', retorna a lista de todos os empreendimentos ativos
    if (idEmpreendimento === "all") {
      const allRes = await fetch(`https://${cvcrmSubdomain}.cvcrm.com.br/api/cvio/empreendimento?token=${cvcrmApiToken}`);
      const allData = await allRes.json();
      return new Response(JSON.stringify(allData.dados || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Buscar dados do empreendimento
    const projectRes = await fetch(`https://${cvcrmSubdomain}.cvcrm.com.br/api/cvio/empreendimento?token=${cvcrmApiToken}&id=${idEmpreendimento}`);
    const projectData = await projectRes.json();

    // 2. Buscar disponibilidade de unidades
    const unitsRes = await fetch(`https://${cvcrmSubdomain}.cvcrm.com.br/api/cvio/unidade?token=${cvcrmApiToken}&idempreendimento=${idEmpreendimento}`);
    const unitsData = await unitsRes.json();

    // 3. Buscar Galeria/Mídias (Usando endpoint de mídias se disponível ou extraindo do cadastro)
    // Nota: O CVCRM costuma retornar mídias dentro do objeto de empreendimento ou via endpoint específico
    // Vou preparar a estrutura para receber a galeria

    const units = unitsData.dados || [];
    const availableUnits = units.filter((u: any) => u.situacao === "Disponível").length;

    const responseData = {
      project: projectData.dados || {},
      stats: {
        total: units.length,
        available: availableUnits
      },
      gallery: projectData.dados?.fotos || [], // Ajustando para pegar fotos do CV
      units: units.map((u: any) => ({
        id: u.idunidade,
        label: u.unidade,
        status: u.situacao,
        subbloco: u.subbloco
      }))
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
