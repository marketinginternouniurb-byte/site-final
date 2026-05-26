import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SectionHeader from "../shared/SectionHeader";

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const { data: testimonials = [] } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  useEffect(() => {
    if (testimonials.length < 2) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;
  const safeIdx = current % testimonials.length;
  const t = testimonials[safeIdx];

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <SectionHeader
            label="Depoimentos"
            title="Quem Confia em Nós"
            subtitle="Histórias reais de famílias que realizaram seus sonhos com a Universal."
          />
        </div>

        <div className="relative mt-8">
          <button
            onClick={prev}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border border-border items-center justify-center hover:bg-primary hover:text-secondary transition z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <Quote className="absolute top-6 right-6 w-20 h-20 text-primary/15" />
            <AnimatePresence mode="wait">
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < t.rating ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  ))}
                </div>
                <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-secondary text-primary font-bold flex items-center justify-center text-xl">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-poppins font-bold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={next}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border border-border items-center justify-center hover:bg-primary hover:text-secondary transition z-10"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Ir para depoimento ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === safeIdx ? "bg-primary w-6" : "bg-border w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
