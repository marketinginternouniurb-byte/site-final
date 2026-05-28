import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
};

function cleanText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function cleanPhone(value: unknown): string | undefined {
  const phone = cleanText(value)?.replace(/\D/g, "");
  return phone && phone.length > 0 ? phone.slice(0, 15) : undefined;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: jsonHeaders, status: 204 });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      headers: jsonHeaders,
      status: 405,
    });
  }

  try {
    const { name, email, phone, message, origin, conversion, page, campos_adicionais } = await req.json();
    const leadEmail = cleanText(email);
    const leadPhone = cleanPhone(phone);

    if (!leadEmail && !leadPhone) {
      return new Response(JSON.stringify({ error: "Informe e-mail ou telefone." }), {
        headers: jsonHeaders,
        status: 400,
      });
    }

    const cvcrmEmail = Deno.env.get("CVCRM_EMAIL");
    const cvcrmToken = Deno.env.get("CVCRM_TOKEN");
    const cvcrmDomain = Deno.env.get("CVCRM_DOMAIN");
    const cvcrmBaseUrl = Deno.env.get("CVCRM_BASE_URL");
    const cvcrmOrigemcv = Deno.env.get("CVCRM_ORIGEMCV");
    const cvcrmUrl = cvcrmBaseUrl
      ? `${cvcrmBaseUrl.replace(/\/$/, "")}/api/v1/comercial/leads`
      : cvcrmDomain
        ? `https://${cvcrmDomain}.cvcrm.com.br/api/v1/comercial/leads`
        : undefined;

    if (!cvcrmUrl || !cvcrmEmail || !cvcrmToken) {
      return new Response(JSON.stringify({ error: "Credenciais CVCRM nao configuradas." }), {
        headers: jsonHeaders,
        status: 500,
      });
    }

    const origem = cleanText(origin) ?? "Site";
    const mensagem = cleanText(message);
    const camposAdicionais = {
      canal: origem,
      pagina_origem: cleanText(page),
      mensagem,
      ...(campos_adicionais ?? {}),
    };

    const cvcrmPayload = {
      nome: cleanText(name) ?? "Lead do site",
      email: leadEmail,
      telefone: leadPhone,
      telefone_ddi: leadPhone ? "+55" : undefined,
      modulo: "Site",
      origem,
      conversao: cleanText(conversion) ?? "Formulario do site",
      midia: "site",
      permitir_alteracao: true,
      campos_adicionais: camposAdicionais,
      interacoes: mensagem
        ? [
            {
              tipo: "A",
              descricao: `Mensagem enviada pelo site: ${mensagem}`,
            },
          ]
        : undefined,
    };

    const response = await fetch(cvcrmUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        email: cvcrmEmail,
        token: cvcrmToken,
        ...(cvcrmOrigemcv ? { origemcv: cvcrmOrigemcv } : {}),
      },
      body: JSON.stringify(cvcrmPayload),
    });

    const responseText = await response.text();
    let responseData: unknown = responseText;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      console.error("CVCRM API Error:", responseData);
      return new Response(JSON.stringify({ error: "Failed to send lead to CVCRM", details: responseData }), {
        headers: jsonHeaders,
        status: response.status,
      });
    }

    return new Response(JSON.stringify({ ok: true, data: responseData }), {
      headers: jsonHeaders,
      status: 200,
    });
  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      headers: jsonHeaders,
      status: 500,
    });
  }
});
