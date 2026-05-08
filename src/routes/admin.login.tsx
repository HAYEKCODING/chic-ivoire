import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/login")({ component: AdminLogin });

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Connexion réussie !");
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Identifiants incorrects";
      toast.error(msg === "Invalid login credentials" ? "Email ou mot de passe incorrect." : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-hero">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-display text-3xl text-primary">
              KGF <span className="text-gold">BOUTIQUE</span>
            </span>
          </Link>
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 border border-primary/20 mt-5 mx-auto block">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl text-foreground mt-4">Espace vendeuse</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Connectez-vous pour gérer vos commandes et produits.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-8 shadow-elegant space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendeuse@kgfboutique.ci"
                className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPwd ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-input bg-background pl-10 pr-10 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-lg bg-primary text-primary-foreground py-3.5 font-semibold text-sm shadow-elegant hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Lock className="h-4 w-4" />
            {loading ? "Connexion en cours…" : "Se connecter"}
          </button>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
            🔒 Accès réservé à la vendeuse et à l'administrateur KGF BOUTIQUE.
          </div>
        </form>

        <Link
          to="/"
          className="block text-center text-sm text-muted-foreground mt-6 hover:text-primary transition"
        >
          ← Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
