import { describe, expect, it } from "vitest";
import { buildFacilitaLeadPayload } from "@/routes/facilita";

describe("Universal Facilita lead payload", () => {
  it("uses the secure lead endpoint payload shape without changing the phone field", () => {
    const { payload, whatsappUrl } = buildFacilitaLeadPayload({
      nome: "Maria Teste",
      whatsapp: "(27) 99999-0000",
      email: "maria@example.com",
      interesse: "Cariacica: Vista dos Montes",
      website: "",
      turnstileToken: "turnstile-token",
    });

    expect(payload).toMatchObject({
      name: "Maria Teste",
      phone: "(27) 99999-0000",
      email: "maria@example.com",
      origin: "Universal Facilita",
      conversion: "Formulario Universal Facilita",
      page: "/facilita",
      website: "",
      turnstileToken: "turnstile-token",
      campos_adicionais: {
        interesse: "Cariacica: Vista dos Montes",
      },
    });
    expect(payload.message).toContain("meu WhatsApp é (27) 99999-0000");
    expect(whatsappUrl).toContain("https://wa.me/552728880001");
  });
});
