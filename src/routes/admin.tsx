import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Building2, Users, FileText, MessageSquare, UserCog, UserCircle, LogOut, Home } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel — Universal" }] }),
  component: AdminLayout,
});

const links = [
  { to: "/admin" as const, label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/projects" as const, label: "Empreendimentos", icon: Building2 }, // Rota corrigida aqui
  { to: "/admin/leads" as const, label: "Leads", icon: Users },
  { to: "/admin/blog" as const, label: "Blog", icon: FileText },
  { to: "/admin/depoimentos" as const, label: "Depoimentos", icon: MessageSquare },
  { to: "/admin/usuarios" as const, label: "Usuários", icon: UserCog, adminOnly: true },
  { to: "/admin/perfil" as const, label: "Perfil", icon: UserCircle },
];

function AdminLayout() {
  const { user, isStaff, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && (!user || !isStaff)) navigate({ to: "/login" });
  }, [loading, user, isStaff, navigate]);

  if (loading || !user || !isStaff) return <div className="p-20 text-center font-bold">Carregando...</div>;

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <aside className="w-64 bg-[#123AAA] text-white flex flex-col fixed h-full z-50 shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FFD700] text-[#123AAA] font-black flex items-center justify-center">U</div>
          <span className="font-bold tracking-tighter text-sm uppercase">Universal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.filter((l) => !l.adminOnly || isAdmin).map((l) => (
            <Link key={l.to} to={l.to} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${path === l.to ? "bg-[#FFD700] text-[#123AAA]" : "hover:bg-white/10"}`}>
              <l.icon size={16} /> {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold hover:bg-red-500/10 text-red-300 border-none cursor-pointer">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-12 relative z-10">
        <div className="max-w-6xl mx-auto"><Outlet /></div>
      </main>
    </div>
  );
}