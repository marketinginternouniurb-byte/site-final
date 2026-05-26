import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { bootstrapFirstAdmin, hasAnyAdmin } from "@/lib/admin-users.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Painel Universal" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user, isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [bootstrapMode, setBootstrapMode] = useState(false);
  const [fullName, setFullName] = useState("");

  const checkAdmin = useServerFn(hasAnyAdmin);
  const bootstrapFn = useServerFn(bootstrapFirstAdmin);

  useEffect(() => {
    checkAdmin().then((r) => setAdminExists(r.hasAdmin)).catch(() => setAdminExists(true));
  }, []);

  useEffect(() => {
    if (!loading && user && isStaff) navigate({ to: "/admin" as any });
  }, [loading, user, isStaff, navigate]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) toast.error(error);
  };

  const onBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bootstrapFn({ data: { email, password, full_name: fullName } });
      toast.success("Administrador criado! Faça login.");
      setBootstrapMode(false);
      setAdminExists(true);
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao criar administrador");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <Link to="/" className="text-xs text-muted-foreground hover:text-secondary">← Voltar ao site</Link>
        <div className="text-center my-6">
          <div className="w-14 h-14 rounded-xl bg-primary text-secondary font-bold text-2xl mx-auto flex items-center justify-center mb-3">U</div>
          <h1 className="font-poppins text-2xl font-bold">Painel Universal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bootstrapMode ? "Criar administrador inicial" : "Acesso restrito a equipe"}
          </p>
        </div>

        <form onSubmit={bootstrapMode ? onBootstrap : onLogin} className="space-y-4">
          {bootstrapMode && (
            <div>
              <label className="text-sm font-semibold block mb-1">Nome</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
          )}
          <div>
            <label className="text-sm font-semibold block mb-1">E-mail</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Senha</label>
            <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <button disabled={submitting} type="submit" className="w-full py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold disabled:opacity-50">
            {submitting ? "Aguarde…" : bootstrapMode ? "Criar admin" : "Entrar"}
          </button>
        </form>

        {adminExists === false && !bootstrapMode && (
          <button onClick={() => setBootstrapMode(true)} className="w-full mt-4 text-xs text-secondary underline">
            Nenhum admin cadastrado — configurar agora
          </button>
        )}
        {bootstrapMode && (
          <button onClick={() => setBootstrapMode(false)} className="w-full mt-4 text-xs text-muted-foreground underline">
            Já tenho conta
          </button>
        )}
      </div>
    </div>
  );
}
