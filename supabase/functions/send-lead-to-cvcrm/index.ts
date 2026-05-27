
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      headers: { "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    const { name, email, phone, message, origin } = await req.json();

    if (!name || !email || !phone || !origin) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const cvcrmApiToken = Deno.env.get("CVCRM_API_TOKEN");
    const cvcrmSubdomain = Deno.env.get("CVCRM_SUBDOMAIN");

    if (!cvcrmApiToken || !cvcrmSubdomain) {
      return new Response(JSON.stringify({ error: "CVCRM API credentials not set" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    const cvcrmApiUrl = `https://${cvcrmSubdomain}.cvcrm.com.br/api/v3/prospeccao/leads`;

    const cvcrmPayload = {
      nome: name,
      email: email,
      telefone: phone,
      observacao: `Mensagem: ${message} | Origem: ${origin}`,
      // Adicione outros campos do CVCRM aqui conforme necessário
      // Ex: idEmpreendimento, idCorretor, etc.
    };

    const response = await fetch(cvcrmApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cvcrmApiToken}`,
      },
      body: JSON.stringify(cvcrmPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("CVCRM API Error:", responseData);
      return new Response(JSON.stringify({ error: "Failed to send lead to CVCRM", details: responseData }), {
        headers: { "Content-Type": "application/json" },
        status: response.status,
      });
    }

    return new Response(JSON.stringify({ message: "Lead sent to CVCRM successfully", data: responseData }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
