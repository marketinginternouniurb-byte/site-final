import { motion } from "framer-motion";
import { Building2, Users, Leaf } from "lucide-react";
import AnimatedCounter from "../shared/AnimatedCounter";
import SectionHeader from "../shared/SectionHeader";

const stats = [
  { icon: Building2, value: 50, suffix: "+", label: "Anos de Experiência", desc: "Atuando no mercado imobiliário capixaba desde 1974" },
  { icon: Users, value: 80000, suffix: "+", label: "Famílias Realizadas", desc: "Milhares de sonhos transformados em endereços reais" },
  { icon: Leaf, value: 130, suffix: "+", label: "Empreendimentos Sustentáveis", desc: "Liderando o urbanismo sustentável no Espírito Santo" },
];

export default function AboutPreview() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <SectionHeader
            label="Sobre a Universal"
            title="Construindo Histórias Há Mais de 50 Anos"
            subtitle="Tradição, confiança e expertise no mercado imobiliário capixaba."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="inline-flex w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-5">
                <stat.icon className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-4xl font-bold text-secondary mb-2">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <h3 className="font-poppins font-bold text-lg text-foreground mb-2">{stat.label}</h3>
              <p className="text-sm text-muted-foreground">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <p className="text-lg text-muted-foreground italic max-w-2xl mx-auto">
            "Tradição que acolhe o seu futuro."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
