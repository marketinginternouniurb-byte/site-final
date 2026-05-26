import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, MessageSquare, FileText, PlusCircle, Settings } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();

  // Dados para os cards de estatísticas
  const stats = [
    { label: "EMPREENDIMENTOS", value: 12, icon: Building2, color: "bg-blue-500" },
    { label: "DEPOIMENTOS", value: 24, icon: MessageSquare, color: "bg-green-500" },
    { label: "POSTS NO BLOG", value: 8, icon: FileText, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-10 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#123AAA] tracking-tighter">Painel Administrativo</h1>
          <p className="text-gray-500 font-medium">Gestão de conteúdo - Universal Urbanismo</p>
        </div>
        
        {/* BOTÃO CORRIGIDO: Agora ele realmente navega para a página de projetos */}
        <button 
          onClick={() => navigate({ to: '/admin/projects' })}
          style={{ cursor: 'pointer' }}
          className="bg-[#123AAA] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-800 transition-all shadow-xl active:scale-95 relative z-30"
        >
          <PlusCircle size={20} />
          Novo Empreendimento
        </button>
      </header>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center gap-6">
            <div className={`${s.color} p-4 rounded-2xl text-white shadow-lg`}>
              <s.icon size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-4xl font-black text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Configurações Rápidas */}
      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 max-w-2xl">
        <h2 className="text-2xl font-black text-[#123AAA] mb-8 flex items-center gap-3">
           <Settings className="text-[#FFD700]" /> Configurações do Site
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl">
            <span className="font-bold text-gray-700">Alterar Frase da Home (Emotiva)</span>
            <button style={{ cursor: 'pointer' }} className="text-blue-600 font-black text-xs uppercase hover:underline">Editar</button>
          </div>
          <div className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl">
            <span className="font-bold text-gray-700">Gerir Cores do Sistema</span>
            <button style={{ cursor: 'pointer' }} className="text-blue-600 font-black text-xs uppercase hover:underline">Editar</button>
          </div>
        </div>
      </div>
    </div>
  );
}