import { createFileRoute } from "@tanstack/react-router";
import PageShell from "@/components/layout/PageShell";
import HeroSection from "@/components/home/HeroSection";
import AboutPreview from "@/components/home/AboutPreview";
import ExpansionSection from "@/components/home/ExpansionSection"; 
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BlogPreview from "@/components/home/BlogPreview";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PageShell>
      <HeroSection />
      
      {/* História e Credibilidade (51 anos) */}
      <AboutPreview />
      
      {/* Vitrine de Loteamentos */}
      <ExpansionSection />
      
      {/* Prova Social e Conteúdo */}
      <TestimonialsSection />
      <BlogPreview />
      
      {/* FooterSection removido daqui, pois já está no PageShell */}
    </PageShell>
  );
}