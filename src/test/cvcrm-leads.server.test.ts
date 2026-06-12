import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleCvcrmLeadRequest } from "@/lib/cvcrm-leads.server";

const endpoint = "https://site-final2.marketing-internouniurb.workers.dev/api/send-lead-to-cvcrm";

function postRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("CVCRM lead endpoint security", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("denies requests without Origin unless the server-to-server secret is valid", async () => {
    const response = await handleCvcrmLeadRequest(
      postRequest({ name: "Teste", email: "teste@example.com" }),
      { LEAD_FORM_SECRET: "server-secret" },
    );

    expect(response.status).toBe(403);
  });

  it("keeps the current phone payload unchanged for server-to-server submissions", async () => {
    const cvcrmFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 123 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", cvcrmFetch);

    const response = await handleCvcrmLeadRequest(
      postRequest(
        {
          name: "Maria Teste",
          email: "maria@example.com",
          phone: "(27) 99999-0000",
          message: "Tenho interesse.",
        },
        { "x-lead-secret": "server-secret" },
      ),
      {
        LEAD_FORM_SECRET: "server-secret",
        CVCRM_EMAIL: "crm@example.com",
        CVCRM_TOKEN: "token",
        CVCRM_DOMAIN: "universal",
      },
    );

    expect(response.status).toBe(200);
    const sent = JSON.parse(String(cvcrmFetch.mock.calls[0][1]?.body)) as {
      telefone?: string;
      telefone_ddi?: string;
    };
    expect(sent.telefone).toBe("27999990000");
    expect(sent.telefone_ddi).toBe("+55");
  });

  it("requires Turnstile for browser submissions without server secret", async () => {
    const response = await handleCvcrmLeadRequest(
      postRequest(
        { name: "Teste", email: "teste@example.com" },
        { origin: "https://site-final2.marketing-internouniurb.workers.dev" },
      ),
      {
        TURNSTILE_SECRET_KEY: "turnstile-secret",
        LEAD_ALLOWED_ORIGINS: "https://site-final2.marketing-internouniurb.workers.dev",
      },
    );

    expect(response.status).toBe(403);
  });

  it("accepts a valid browser Turnstile token in dry run", async () => {
    const turnstileFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", turnstileFetch);

    const response = await handleCvcrmLeadRequest(
      postRequest(
        {
          name: "Teste",
          email: "teste@example.com",
          turnstileToken: "valid-token",
        },
        { origin: "https://site-final2.marketing-internouniurb.workers.dev" },
      ),
      {
        TURNSTILE_SECRET_KEY: "turnstile-secret",
        LEAD_ALLOWED_ORIGINS: "https://site-final2.marketing-internouniurb.workers.dev",
        DRY_RUN: "true",
      },
    );

    expect(response.status).toBe(200);
    expect(turnstileFetch).toHaveBeenCalledOnce();
  });

  it("rejects invalid content type before reading the body", async () => {
    const request = new Request(endpoint, {
      method: "POST",
      headers: {
        "content-type": "text/plain",
        origin: "https://site-final2.marketing-internouniurb.workers.dev",
      },
      body: "plain text",
    });

    const response = await handleCvcrmLeadRequest(request, {
      LEAD_ALLOWED_ORIGINS: "https://site-final2.marketing-internouniurb.workers.dev",
    });

    expect(response.status).toBe(415);
  });

  it("rejects oversized payloads", async () => {
    const response = await handleCvcrmLeadRequest(
      postRequest(
        {
          name: "Teste",
          email: "teste@example.com",
          message: "x".repeat(21_000),
        },
        { origin: "https://site-final2.marketing-internouniurb.workers.dev" },
      ),
      {
        LEAD_ALLOWED_ORIGINS: "https://site-final2.marketing-internouniurb.workers.dev",
      },
    );

    expect(response.status).toBe(413);
  });
});
