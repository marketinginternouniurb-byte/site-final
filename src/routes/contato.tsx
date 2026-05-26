import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const contact = {
  address: "Villagio Limoeiro - Torre Sul, Serra - ES",
  phone: "(27) 2888-0001",
  email: "contato@universalurbanismo.com.br",
  hours: "Seg a Sex · 8h às 18h",
  whatsapp: "552728880001",
};

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Universal Imobiliária" },
      { name: "description", content: "Entre em contato com a Universal Imobiliária. Estamos prontos para te atender." },
      { property: "og:title", content: "Contato — Universal Imobiliária" },
      { property: "og:description", content: "Fale com nossos consultores em Vitória-ES." },
    ],
  }),
  component: Contato,
});

const infos = [
  { icon: MapPin, title: "Endereço", text: contact.address },
  { icon: Phone, title: "Telefone", text: contact.phone },
  { icon: Mail, title: "E-mail", text: contact.email },
  { icon: Clock, title: "Horário", text: contact.hours },
];

function Contato() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedPrivacy) {
      toast.error("Para continuar, aceite a Política de Privacidade e LGPD.");
      return;
    }

    setSending(true);
    const { error } = await supabase.from("leads").insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
    });
    setSending(false);
    if (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      return;
    }
    toast.success("Mensagem enviada! Em breve entraremos em contato.");
    setForm({ name: "", email: "", phone: "", message: "" });
    setAcceptedPrivacy(false);
  };

  return (
    <PageShell>
      <section className="pt-32 pb-12 bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block px-4 py-1.5 bg-primary text-secondary text-xs font-bold tracking-widest uppercase rounded-full mb-4">
            Fale Conosco
          </span>
          <h1 className="font-poppins text-4xl md:text-6xl font-extrabold leading-tight">
            Vamos Conversar?
          </h1>
          <p className="text-white/80 mt-3 max-w-2xl">
            Nosso time está pronto para te ajudar a encontrar o imóvel perfeito.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="space-y-4">
            {infos.map((info, i) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-bold text-foreground mb-0.5">{info.title}</p>
                  <p className="text-sm text-muted-foreground">{info.text}</p>
                </div>
              </motion.div>
            ))}
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp Direto
            </a>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-5">
              <h2 className="font-poppins text-2xl font-bold mb-2">Envie sua mensagem</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Nome</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background outline-none focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Telefone</label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">E-mail</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Mensagem</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background outline-none focus:border-primary text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold hover:opacity-90 transition w-full disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> {sending ? "Enviando…" : "Enviar Mensagem"}
              </button>

              <label className="flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
                <input
                  type="checkbox"
                  required
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-secondary"
                />
                <span>
                  Li e aceito o tratamento dos meus dados para atendimento,
                  conforme a{" "}
                  <a
                    href="/politica-de-privacidade"
                    className="font-semibold text-secondary hover:underline"
                  >
                    Política de Privacidade e LGPD
                  </a>
                  .
                </span>
              </label>
            </form>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
