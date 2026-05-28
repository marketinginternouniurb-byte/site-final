import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const cvcrmApiToken = Deno.env.get("CVCRM_API_TOKEN");
    const cvcrmSubdomain = Deno.env.get("CVCRM_SUBDOMAIN");

    // Endpoint de integração nativa (o que funcionou no teste anterior)
    const cvcrmApiUrl = `https://${cvcrmSubdomain}.cvcrm.com.br/api/cv.php?leads=true`;

    const formData = new URLSearchParams();
    formData.append("ajax", "true");
    formData.append("token", cvcrmApiToken || "");
    formData.append("email_gestor", "novicpedro27@gmail.com");
    formData.append("nome", body.name || "");
    formData.append("email", body.email || "");
    formData.append("telefone", body.phone || "");
    formData.append("mensagem", body.message || "");
    formData.append("origem", body.origin || "Site");
    formData.append("idempreendimento", "2"); // ID IDENTIFICADO PELO USUÁRIO

    console.log("Enviando lead para CVCRM com ID Empreendimento 2...");

    const response = await fetch(cvcrmApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    return new Response(JSON.stringify({ success: true, message: "Lead processado" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Erro na função:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
