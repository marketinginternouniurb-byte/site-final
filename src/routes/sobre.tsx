import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Award,
  Building2,
  CheckCircle2,
  Handshake,
  Home,
  Landmark,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import AnimatedCounter from "@/components/shared/AnimatedCounter";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Universal — Universal Urbanismo" },
      {
        name: "description",
        content:
          "Conheça a Universal Urbanismo: mais de 50 anos de tradição em loteamentos no Espírito Santo.",
      },
      { property: "og:title", content: "Sobre a Universal Urbanismo" },
      {
        property: "og:description",
        content:
          "Tradição capixaba, loteamentos com infraestrutura e compromisso com famílias e investidores.",
      },
      { property: "og:image", content: "/sobre-universal-hero.webp" },
    ],
  }),
  component: Sobre,
});

const stats = [
  { icon: Landmark, value: 50, suffix: "+", label: "anos de tradição" },
  { icon: Users, value: 80000, suffix: "+", label: "famílias impactadas" },
  { icon: Building2, value: 130, suffix: "+", label: "empreendimentos" },
  { icon: Award, value: 20, suffix: "+", label: "anos no Recall" },
];

const milestones = [
  {
    title: "Raízes capixabas",
    text: "A Universal nasceu em Cariacica com vocação local e visão de longo prazo: abrir caminhos para moradia com infraestrutura e localização estratégica.",
  },
  {
    title: "Crescimento lote a lote",
    text: "Cada empreendimento entregue consolidou uma relação próxima com famílias, bairros e comunidades que ajudaram a construir a história da marca.",
  },
  {
    title: "Reconhecimento público",
    text: "A presença constante no Recall de Marcas reforça a confiança de quem acompanha a trajetória da Universal no Espírito Santo.",
  },
  {
    title: "Expansão com responsabilidade",
    text: "O futuro da Universal combina novos loteamentos, urbanismo planejado, segurança jurídica e compromisso com quem compra para morar ou investir.",
  },
];

const principles = [
  {
    icon: Home,
    title: "Moradia possível",
    text: "Projetos pensados para aproximar famílias do sonho do lote próprio, com condições acessíveis e clareza na jornada de compra.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança e confiança",
    text: "Relações comerciais construídas com transparência, documentação organizada e respeito por cada etapa do processo.",
  },
  {
    icon: Leaf,
    title: "Urbanismo com futuro",
    text: "Empreendimentos com infraestrutura, localização e visão de desenvolvimento para valorizar pessoas, bairros e cidades.",
  },
];

export default function Sobre() {
  return (
    <PageShell>
      <section className="relative min-h-[92vh] overflow-hidden bg-[#071947] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/sobre-universal-hero.webp')" }}
        />
        <div className="absolute inset-0 bg-[#071947]/70" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FAF9F6] to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-24 min-h-[92vh] flex items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 bg-[#FFD700] text-[#123AAA] px-4 py-2 rounded-lg mb-6">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.22em]">
                Sobre a Universal
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.98] mb-6">
              Muito mais que loteamentos.
              <span className="block text-[#FFD700]">Um legado capixaba.</span>
            </h1>

            <p className="text-base md:text-xl text-white/85 max-w-3xl leading-relaxed font-medium">
              Há mais de cinco décadas, a Universal Urbanismo aproxima famílias
              da moradia planejada e ajuda a transformar regiões do Espírito
              Santo com empreendimentos de infraestrutura completa.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative -mt-10 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-[#123AAA]/10 rounded-[28px] p-6 shadow-xl"
            >
              <s.icon className="w-8 h-8 text-[#FFD700] mb-5" />
              <div className="text-3xl md:text-4xl font-black text-[#123AAA]">
                <AnimatedCounter end={s.value} suffix={s.suffix} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#123AAA]/55 mt-2">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="inline-flex items-center gap-2 text-[#123AAA]/65 mb-5">
              <MapPin size={18} className="text-[#FFD700]" />
              <span className="text-[10px] font-black uppercase tracking-[0.28em]">
                Nascida no Espírito Santo
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-[#123AAA] uppercase tracking-tight leading-tight mb-6">
              A confiança que cresceu junto com as cidades.
            </h2>

            <p className="text-gray-600 leading-relaxed font-medium">
              A Universal é uma empresa capixaba movida por um propósito
              simples e poderoso: criar bases reais para famílias construírem
              lares, patrimônio e futuro. O que começou como presença local se
              tornou uma história de expansão, reconhecimento e compromisso com
              quem acredita no lote como ponto de partida.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {milestones.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="relative bg-white border border-[#123AAA]/10 rounded-[28px] p-7 shadow-sm overflow-hidden"
              >
                <div className="absolute left-0 top-0 h-full w-1.5 bg-[#FFD700]" />
                <div className="flex gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#123AAA] text-[#FFD700] flex items-center justify-center font-black">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#123AAA] uppercase tracking-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                      {item.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#123AAA] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] rounded-[36px] overflow-hidden border-4 border-white/10 shadow-2xl"
          >
            <img
              src="/sobre-universal-hero.webp"
              alt="Universal Urbanismo"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#123AAA]/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 text-[#123AAA] rounded-[24px] p-5">
              <div className="flex items-center gap-3">
                <Award className="text-[#FFD700]" size={28} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#123AAA]/55">
                    Reconhecimento
                  </p>
                  <p className="text-lg font-black uppercase leading-tight">
                    20 anos no 1º lugar no Recall de Marcas
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div>
            <div className="inline-flex items-center gap-2 bg-[#FFD700] text-[#123AAA] px-4 py-2 rounded-lg mb-6">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.22em]">
                Confiança comprovada
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-6">
              Uma marca lembrada porque está presente na vida das pessoas.
            </h2>

            <p className="text-white/80 leading-relaxed font-medium mb-8">
              O reconhecimento público reforça uma verdade construída ao longo
              de décadas: a Universal cresceu mantendo proximidade com a
              comunidade, respeito pela história de cada cliente e dedicação ao
              desenvolvimento do Espírito Santo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Tradição regional",
                "Relacionamento próximo",
                "Infraestrutura completa",
                "Visão de futuro",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#FFD700]" size={18} />
                  <span className="text-sm font-black uppercase tracking-widest">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.32em] text-[#123AAA]/50">
              O que sustenta cada projeto
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[#123AAA] uppercase tracking-tight leading-tight mt-4">
              Mais que vender terrenos, criamos bases sólidas para lares.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="bg-[#FAF9F6] border border-[#123AAA]/10 rounded-[28px] p-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FFD700] text-[#123AAA] flex items-center justify-center mb-6">
                  <principle.icon size={26} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black text-[#123AAA] uppercase tracking-tight mb-3">
                  {principle.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                  {principle.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto bg-[#FFD700] rounded-[36px] p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 text-[#123AAA]/70 mb-4">
              <Handshake size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.28em]">
                Próximo capítulo
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#123AAA] uppercase tracking-tight leading-tight">
              O lote que define o futuro é o lote que nasce com confiança.
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-[#123AAA]/75 leading-relaxed font-bold">
              A Universal segue avançando com novos empreendimentos, novas
              regiões e a mesma missão: transformar planejamento urbano em
              oportunidade real para famílias e investidores.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
