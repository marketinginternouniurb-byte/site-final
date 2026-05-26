import type { LinkProps } from "@tanstack/react-router";
import { LayoutDashboard, Building2, Users, FileText, MessageSquare, UserCog, UserCircle, type LucideIcon } from "lucide-react";

export type AdminNavLink = {
  to: LinkProps["to"];
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  adminOnly?: boolean;
};

export const adminNavLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/empreendimentos", label: "Empreendimentos", icon: Building2 },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquare },
  { to: "/admin/usuarios", label: "Usuários", icon: UserCog, adminOnly: true },
  { to: "/admin/perfil", label: "Perfil", icon: UserCircle },
] as const satisfies ReadonlyArray<AdminNavLink>;
