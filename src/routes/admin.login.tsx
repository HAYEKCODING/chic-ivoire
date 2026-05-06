import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({ component: AdminLogin });

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Compte créé. Demandez à être promu administrateur.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl text-center">Espace vendeuse</h1>
      <p className="text-center text-sm text-muted-foreground mt-2">
        {mode === "login" ? "Connectez-vous pour gérer vos commandes." : "Créez votre compte administrateur."}
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6 shadow-soft">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Mot de passe</label>
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button disabled={loading} className="w-full rounded-md bg-primary text-primary-foreground py-3 font-medium">
          {loading ? "..." : mode === "login" ? "Se connecter" : "Créer le compte"}
        </button>
        <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-xs text-muted-foreground hover:text-primary block w-full text-center">
          {mode === "login" ? "Créer un compte" : "Déjà un compte ? Se connecter"}
        </button>
      </form>
      <Link to="/" className="block text-center text-sm text-muted-foreground mt-6 hover:text-primary">← Retour à la boutique</Link>
    </div>
  );
}
