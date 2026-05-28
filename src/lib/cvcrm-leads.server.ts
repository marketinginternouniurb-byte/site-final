type CvcrmEnv = {
  CVCRM_EMAIL?: string;
  CVCRM_TOKEN?: string;
  CVCRM_DOMAIN?: string;
  CVCRM_BASE_URL?: string;
  CVCRM_ORIGEMCV?: string;
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
};

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
};

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

function buildCvcrmUrl(env: CvcrmEnv): string | undefined {
  if (env.CVCRM_BASE_URL) {
    return `${env.CVCRM_BASE_URL.replace(/\/$/, "")}/api/v1/comercial/leads`;
  }

  if (env.CVCRM_DOMAIN) {
    return `https://${env.CVCRM_DOMAIN}.cvcrm.com.br/api/v1/comercial/leads`;
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

async function parseBody(request: Request): Promise<SiteLeadPayload | undefined> {
  try {
    return (await request.json()) as SiteLeadPayload;
  } catch {
    return undefined;
  }
}

export async function handleCvcrmLeadRequest(request: Request, envInput: unknown): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: jsonHeaders });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405, headers: jsonHeaders });
  }

  const payload = await parseBody(request);
  if (!payload) {
    return Response.json({ error: "JSON invalido." }, { status: 400, headers: jsonHeaders });
  }

  const cvcrmPayload = buildCvcrmPayload(payload);
  if (!cvcrmPayload.email && !cvcrmPayload.telefone) {
    return Response.json(
      { error: "Informe e-mail ou telefone para cadastrar o lead." },
      { status: 400, headers: jsonHeaders },
    );
  }

  const env = asEnv(envInput);
  const cvcrmUrl = buildCvcrmUrl(env);
  if (!cvcrmUrl || !env.CVCRM_EMAIL || !env.CVCRM_TOKEN) {
    return Response.json(
      { error: "Credenciais CVCRM nao configuradas no ambiente." },
      { status: 500, headers: jsonHeaders },
    );
  }

  const cvcrmResponse = await fetch(cvcrmUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      email: env.CVCRM_EMAIL,
      token: env.CVCRM_TOKEN,
      ...(env.CVCRM_ORIGEMCV ? { origemcv: env.CVCRM_ORIGEMCV } : {}),
    },
    body: JSON.stringify(cvcrmPayload),
  });

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
      body: responseBody,
    });

    return Response.json(
      { error: "Falha ao cadastrar lead no CVCRM.", details: responseBody },
      { status: cvcrmResponse.status, headers: jsonHeaders },
    );
  }

  return Response.json({ ok: true, data: responseBody }, { status: 200, headers: jsonHeaders });
}
