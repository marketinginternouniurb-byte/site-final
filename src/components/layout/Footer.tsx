import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, ArrowRight } from "lucide-react";
import { openCookiePreferences } from "@/lib/cookie-consent";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert("Inscrição realizada!");
      setEmail("");
    }
  };

  const socials: Array<[string, typeof Instagram]> = [
    ["https://instagram.com/universalurbanismo", Instagram],
    ["https://facebook.com/universalurbanismo", Facebook],
    ["https://youtube.com/@universalurbanismo", Youtube],
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-secondary font-bold text-xl">
                U
              </div>
              <div>
                <p className="font-poppins font-bold text-lg">UNIVERSAL</p>
                <p className="text-[10px] uppercase tracking-widest opacity-70">Imobiliária & Urbanismo</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed mb-6">
              Mais de 50 anos ajudando famílias a conquistar o sonho da casa própria com parcelas acessíveis!
            </p>
            <div className="flex gap-3">
              {socials.map(([href, Icon], i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary hover:text-secondary flex items-center justify-center transition"
                  aria-label="social"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm opacity-90">
              {[
                { label: "Empreendimentos", path: "/empreendimentos" as const },
                { label: "Sobre Nós", path: "/sobre" as const },
                { label: "Contato", path: "/contato" as const },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="hover:text-primary transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Contato</h4>
            <ul className="space-y-3 text-sm opacity-90">
              <li className="flex gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                Villagio Limoeiro - Torre Sul, Serra - ES
              </li>
              <li className="flex gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                (27) 2888-0001
              </li>
              <li className="flex gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                contato@universalurbanismo.com.br
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-2">Receba Ofertas!</h4>
            <p className="text-sm opacity-80 mb-4">
              Cadastre seu e-mail e receba as melhores oportunidades em primeira mão!
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="px-3 rounded-md bg-primary text-secondary hover:opacity-90"
                aria-label="Enviar"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 text-xs opacity-70">
          <p>© 2024 Universal Imobiliária e Urbanismo. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={openCookiePreferences} className="hover:text-primary">
              Revisar cookies
            </button>
            <p>CRECI-ES 12243-J</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
