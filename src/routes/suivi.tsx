import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OrderStatusTimeline, OrderStatusBadge, type OrderStatus } from "@/components/OrderStatusTimeline";
import { Search, PackageSearch } from "lucide-react";

export const Route = createFileRoute("/suivi")({ component: SuiviPage });

type Result = { order_number: number; status: OrderStatus; created_at: string };

function SuiviPage() {
  const [num, setNum] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const n = parseInt(num.trim(), 10);
    if (!n || n <= 0) {
      setError("Veuillez saisir un numéro de commande valide.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("get_order_status", { p_order_number: n });
    setLoading(false);
    if (error) {
      setError("Erreur lors de la recherche. Réessayez.");
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      setError(`Aucune commande trouvée avec le numéro #${n}.`);
      return;
    }
    setResult(row as Result);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <PackageSearch className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-foreground">
          Suivre ma commande
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Saisissez votre numéro de commande pour connaître son statut.
        </p>
      </div>

      <form onSubmit={search} className="flex gap-2 mb-8">
        <input
          type="number"
          inputMode="numeric"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          placeholder="Ex : 1024"
          className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary text-primary-foreground px-5 py-3 font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          {loading ? "..." : "Suivre"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-xs text-muted-foreground">Commande</p>
              <p className="font-display text-xl text-foreground">#{result.order_number}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Passée le {new Date(result.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
            <OrderStatusBadge status={result.status} />
          </div>
          <OrderStatusTimeline status={result.status} />
        </div>
      )}

      <div className="mt-10 text-center">
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
