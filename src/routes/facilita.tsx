import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/facilita")({
  head: () => ({
    meta: [
      { title: "Universal Facilita - Universal Urbanismo" },
      {
        name: "description",
        content: "Conheca o programa Universal Facilita e fale com a Universal Urbanismo.",
      },
      { property: "og:title", content: "Universal Facilita" },
      {
        property: "og:description",
        content: "Atendimento consultivo para encontrar o empreendimento ideal.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://site-final2.marketing-internouniurb.workers.dev/facilita" },
    ],
  }),
  component: Facilita,
});

const benefits = [
  "Financiamento direto com a Universal",
  "Atendimento consultivo para escolher o projeto ideal",
  "Pré-lançamentos em Cariacica, Serra e Vila Velha",
  "Processo claro, com apoio em cada próximo passo",
];

function Facilita() {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [interesse, setInteresse] = useState("");
  const [website, setWebsite] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!acceptedPrivacy) {
      alert("Para continuar, aceite a Política de Privacidade e LGPD.");
      return;
    }

    if (website.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("leads").insert([
        {
          name: nome,
          phone: whatsapp,
          email,
          interest: `Facilita: ${interesse}`,
        } as any,
      ]);

      if (error) {
        console.warn("Lead Facilita Supabase insert skipped", {
          code: error.code,
          message: error.message,
        });
      }
    } catch (error) {
      console.warn("Lead Facilita Supabase insert failed", {
        message: error instanceof Error ? error.message : "unknown",
      });
    } finally {
      setIsSubmitting(false);
    }

    const message = `Olá! Quero entrar no programa Universal Facilita. Meu nome é ${nome}, meu WhatsApp é ${whatsapp}, meu e-mail é ${email} e tenho interesse em: ${interesse}.`;
    window.location.href = `https://wa.me/552728880001?text=${encodeURIComponent(message)}`;
  };

  return (
    <PageShell>
      <main className="min-h-screen bg-[#123AAA] text-white selection:bg-[#FFD700] selection:text-[#123AAA]">
        <section className="relative overflow-hidden pt-32 sm:pt-40">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/fundo-lote.webp')" }}
          />
          <div className="absolute inset-0 bg-[#123AAA]/88" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#123AAA] to-transparent" />

          <div className="container relative z-10 mx-auto grid min-h-[calc(100vh-8rem)] grid-cols-1 items-center gap-10 px-5 pb-16 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-16">
            <div className="max-w-3xl">
              <img
                src="/facilita-logo-cropped.png"
                alt="Universal Facilita"
                className="mb-8 h-auto w-full max-w-[300px] rounded-2xl bg-white p-4 shadow-2xl shadow-black/25 sm:max-w-[390px]"
              />

              <p className="mb-4 inline-flex rounded-full border border-[#FFD700]/45 bg-[#FFD700]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#FFD700]">
                Programa Universal Facilita
              </p>

              <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                E aí, pronto pra encontrar o seu lote ideal?
              </h1>

              <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-white/80 sm:text-xl">
                O Lotti te ajuda a dar o primeiro passo: informe seus dados, escolha o empreendimento de interesse e fale com a equipe da Universal.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#formulario-facilita"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#FFD700] px-7 py-4 text-sm font-black uppercase tracking-widest text-[#123AAA] shadow-[0_18px_40px_rgba(255,215,0,0.32)] transition hover:bg-[#ffe45c]"
                >
                  Quero entrar no programa
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="https://wa.me/552728880001"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/30 px-7 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-[#123AAA]"
                >
                  Falar no WhatsApp
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
              <div className="absolute inset-x-8 bottom-0 h-20 rounded-full bg-black/25 blur-2xl" />
              <img
                src="/mascote-universal.png"
                alt="Lotti, mascote da Universal"
                className="relative z-10 mx-auto max-h-[520px] w-full object-contain drop-shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#123AAA] px-5 py-12 sm:px-6 lg:px-16">
          <div className="container mx-auto grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex min-h-24 items-start gap-3 rounded-2xl border border-white/12 bg-white/[0.06] p-5"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#FFD700]" />
                <span className="text-sm font-bold leading-snug text-white/85">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="formulario-facilita" className="bg-[#123AAA] px-5 py-16 sm:px-6 lg:px-16">
          <div className="container mx-auto grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="max-w-xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD700]">
                Atendimento Universal
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
                Seu lote ideal começa com uma conversa simples.
              </h2>
              <p className="mt-5 text-base font-medium leading-relaxed text-white/75">
                Preencha o formulário e a equipe entra em contato para explicar os projetos disponíveis, condições e próximos passos.
              </p>
              <div className="mt-8 rounded-2xl border border-[#FFD700]/35 bg-[#FFD700]/10 p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#FFD700]" />
                  <p className="text-sm font-semibold leading-relaxed text-white/80">
                    Seus dados serão usados apenas para atendimento comercial e contato sobre o Universal Facilita.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#FFD700]/35 bg-[#0b2f91] p-5 shadow-2xl shadow-black/25 sm:p-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <input type="text" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                {/* Nome */}
                <label className="relative group block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#FFD700]">Nome</span>
                  <input required placeholder="Seu nome completo" value={nome} onChange={(event) => setNome(event.target.value)} className="w-full rounded-2xl border-2 border-white/15 bg-white px-5 py-4 text-base font-bold text-[#123AAA] outline-none transition focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/20" />
                </label>
                {/* WhatsApp */}
                <label className="relative group block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#FFD700]">WhatsApp</span>
                  <input required placeholder="(xx) xxxxx-xxxx" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} className="w-full rounded-2xl border-2 border-white/15 bg-white px-5 py-4 text-base font-bold text-[#123AAA] outline-none transition focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/20" />
                </label>
                {/* E-mail */}
                <label className="relative group block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#FFD700]">E-mail</span>
                  <input required type="email" placeholder="seu@email.com" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border-2 border-white/15 bg-white px-5 py-4 text-base font-bold text-[#123AAA] outline-none transition focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/20" />
                </label>
                {/* Seleção de Interesse */}
                <label className="relative group block sm:col-span-2">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#FFD700]">Seu interesse em:</span>
                  <select required value={interesse} onChange={(event) => setInteresse(event.target.value)} className="w-full appearance-none rounded-2xl border-2 border-white/15 bg-white px-5 py-4 text-base font-bold text-[#123AAA] outline-none transition focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/20">
                    <option value="">Selecione o projeto</option>
                    <option value="Cariacica: Vista dos Montes">Cariacica: Vista dos Montes (Pré-Lançamento)</option>
                    <option value="Serra: Reserva Mestre Álvaro">Serra: Reserva Mestre Álvaro (Pré-Lançamento)</option>
                    <option value="Vila Velha: Interlagos">Vila Velha: Interlagos (Pré-Lançamento)</option>
                  </select>
                </label>
                {/* Checkbox LGPD */}
                <label className="mt-4 flex items-start gap-3 text-xs font-medium leading-relaxed text-white/70">
                  <input type="checkbox" required checked={acceptedPrivacy} onChange={(event) => setAcceptedPrivacy(event.target.checked)} className="mt-1" />
                  <span>Li e aceito a <a href="/politica-de-privacidade" className="font-bold text-[#FFD700] hover:underline">Política de Privacidade e LGPD</a>.</span>
                </label>
                {/* Botão */}
                <button type="submit" disabled={isSubmitting} className="mt-4 flex w-full items-center justify-center gap-4 rounded-2xl bg-[#FFD700] px-6 py-5 text-sm font-black uppercase tracking-widest text-[#123AAA] transition-all hover:bg-[#ffe45c] disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? "Enviando..." : "Quero entrar no programa"}</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
