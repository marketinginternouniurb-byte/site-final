import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Home, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import PageShell from "@/components/layout/PageShell";

export const Route = createFileRoute("/universal-facilita")({
  head: () => ({
    meta: [
      { title: "Universal Facilita - Universal Urbanismo" },
      {
        name: "description",
        content: "Conquiste seu espaco com atendimento da Universal Urbanismo.",
      },
      { property: "og:title", content: "Universal Facilita" },
      {
        property: "og:description",
        content: "Projetos em regioes de expansao urbana com atendimento direto.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://site-final2.marketing-internouniurb.workers.dev/universal-facilita" },
    ],
  }),
  component: UniversalSimplifica,
});

const pillars = [
  "Atendimento direto com a loteadora",
  "Projetos em regiões de expansão urbana",
  "Condições de lançamento apresentadas com clareza",
  "Apoio para entender documentos, prazos e próximos passos",
];

const projects = [
  "Vista dos Montes",
  "Reserva Mestre Álvaro",
  "Interlagos",
];

function UniversalSimplifica() {
  return (
    <PageShell>
      <main className="min-h-screen bg-white text-[#123AAA]">
        <section className="relative flex min-h-screen items-center overflow-hidden pt-28">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/lote-vista.webp')" }}
          />
          <div className="absolute inset-0 bg-[#071947]/70" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

          <div className="container relative z-10 mx-auto grid grid-cols-1 items-center gap-8 px-5 pb-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-16">
            <div className="max-w-4xl text-white">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFD700]/45 bg-[#FFD700]/12 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#FFD700]">
                <Sparkles className="h-4 w-4" /> Universal Facilita
              </p>

              <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                A credibilidade que constrói
                <span className="block text-[#FFD700]">o seu futuro há 51 anos.</span>
              </h1>

              <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-white/86 sm:text-xl">
                Conquiste seu espaço com segurança, atendimento humano e condições exclusivas de lançamento direto com a Universal Urbanismo.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/facilita"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#FFD700] px-7 py-5 text-sm font-black uppercase tracking-widest text-[#123AAA] shadow-[0_18px_40px_rgba(255,215,0,0.32)] transition hover:bg-[#ffe45c]"
                >
                  Tenho interesse
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="/#ancora-lotes"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/35 px-7 py-5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-[#123AAA]"
                >
                  Ver empreendimentos
                  <MapPin className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/92 p-4 shadow-2xl shadow-black/25 backdrop-blur sm:p-7">
              <img
                src="/facilita-logo-cropped.png"
                alt="Universal Facilita"
                className="mb-5 h-auto w-full rounded-2xl bg-white p-4 shadow-sm"
              />

              <div className="space-y-3">
                {pillars.map((pillar) => (
                  <div key={pillar} className="flex items-start gap-3 rounded-2xl border border-[#123AAA]/10 bg-[#F6F8FF] p-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#FFD700]" />
                    <span className="text-sm font-black leading-snug text-[#123AAA]">{pillar}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 lg:px-16">
          <div className="container mx-auto grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#123AAA]/55">
                Para quem quer escolher com segurança
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
                Entenda os lançamentos antes de preencher o cadastro.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {projects.map((project) => (
                <div key={project} className="rounded-2xl border border-[#123AAA]/10 bg-[#123AAA] p-5 text-white">
                  <Home className="mb-5 h-7 w-7 text-[#FFD700]" />
                  <h3 className="text-lg font-black">{project}</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">
                    Pré-lançamento com atendimento consultivo Universal.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#123AAA] px-5 py-16 text-white sm:px-6 lg:px-16">
          <div className="container mx-auto flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD700]">
                Próximo passo
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
                Gostou do Facilita? Agora fale com o Lotti e entre no Facilita.
              </h2>
            </div>
            <a
              href="/facilita"
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#FFD700] px-7 py-5 text-sm font-black uppercase tracking-widest text-[#123AAA] transition hover:bg-[#ffe45c] sm:w-auto"
            >
              Quero me cadastrar
              <ShieldCheck className="h-5 w-5" />
            </a>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
