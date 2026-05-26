import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative py-24 bg-secondary overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-5 py-2 rounded-full bg-primary text-secondary text-xs font-bold tracking-widest uppercase mb-6">
            🔥 Oportunidade Imperdível!
          </span>
          <h2 className="font-poppins text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Seu Lote com <span className="text-primary">Parcelas Acessíveis!</span>
          </h2>
          <p className="text-lg text-white/85 max-w-2xl mx-auto mb-10">
            Fale agora com um de nossos consultores e descubra as melhores condições para sair do aluguel!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/552728880001"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-primary text-secondary font-bold hover:scale-[1.03] transition shadow-xl shadow-primary/30"
            >
              <MessageCircle className="w-5 h-5" /> Quero Falar com Consultor!
            </a>
            <a
              href="tel:+552728880001"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 backdrop-blur transition"
            >
              <Phone className="w-5 h-5" /> (27) 2888-0001
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
