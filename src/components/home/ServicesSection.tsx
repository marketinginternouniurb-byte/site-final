import { CheckCircle } from "lucide-react";

export default function ServicesSection() {
  const projetos = [
    {
      nome: "Vista do Universo",
      local: "Cariacica",
      status: "LANÇADO",
      info: "Entrega em Junho/2027",
      facilita: false,
    },
    {
      nome: "Vista dos Montes & Rio",
      local: "Cariacica (Prolar)",
      status: "PRÉ-LANÇAMENTO",
      info: "Lançamento 2º Sem/2026",
      facilita: true,
    },
    {
      nome: "Reserva Mestre Álvaro",
      local: "Serra",
      status: "PRÉ-LANÇAMENTO",
      info: "Lançamento Jun-Jul/2026",
      facilita: true,
    },
    {
      nome: "Nova Campo Grande",
      local: "Cariacica",
      status: "LANÇAMENTO 2027",
      info: "Em breve",
      facilita: true,
    },
    {
      nome: "Nova Almeida",
      local: "Serra",
      status: "BREVE LANÇAMENTO",
      info: "Previsão 2027",
      facilita: true,
    },
    {
      nome: "Interlagos",
      local: "Vila Velha",
      status: "BREVE LANÇAMENTO",
      info: "Previsão 2027",
      facilita: true,
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-6 text-center lg:px-16">
        <h2 className="mb-16 text-4xl font-black uppercase tracking-tight text-[#123AAA]">
          Nossa Presença em <span className="text-[#FFD700]">Expansão</span>
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projetos.map((p) => (
            <div key={p.nome} className={`relative rounded-3xl border-2 p-8 transition-all duration-300 ${p.facilita ? "border-[#FFD700] bg-[#123AAA]/5 shadow-[0_0_20px_rgba(255,215,0,0.1)]" : "border-gray-100 bg-white"}`}>
              {p.facilita && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FFD700] px-4 py-1 text-[10px] font-black text-[#123AAA] shadow-md">
                  <CheckCircle className="mr-1 inline h-3 w-3" /> DISPONÍVEL NO FACILITA
                </div>
              )}

              <h3 className="mb-2 text-xl font-bold text-[#123AAA]">{p.nome}</h3>
              <p className="mb-4 text-sm text-gray-500">{p.local}</p>

              <div className="mt-4 flex flex-col gap-2">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${p.status === "LANÇADO" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                  {p.status}
                </span>
                <p className="text-sm font-medium text-[#123AAA]/70">{p.info}</p>
              </div>

              <a
                href={p.facilita ? "/universal-facilita" : "/contato"}
                className={`mt-6 block w-full rounded-xl py-3 font-bold transition-all ${p.facilita ? "bg-[#FFD700] text-[#123AAA] hover:scale-105" : "bg-[#123AAA] text-white hover:bg-[#123AAA]/90"}`}
              >
                {p.facilita ? "Conhecer o Facilita" : "Ver Detalhes"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
