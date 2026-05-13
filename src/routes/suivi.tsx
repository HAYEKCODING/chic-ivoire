import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OrderStatusTimeline, OrderStatusBadge, type OrderStatus } from "@/components/OrderStatusTimeline";
import { getOrderHistory, addOrderToHistory, removeOrderFromHistory } from "@/lib/order-history";
import { PackageSearch, RefreshCw, Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/suivi")({ component: SuiviPage });

type OrderRow = {
  order_number: number;
  status: OrderStatus;
  created_at: string;
};

function SuiviPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [missing, setMissing] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [num, setNum] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const history = getOrderHistory();
    if (history.length === 0) {
      setOrders([]);
      setMissing([]);
      setLoading(false);
      return;
    }
    const results = await Promise.all(
      history.map(async (h) => {
        const { data } = await supabase.rpc("get_order_status", {
          p_order_number: h.order_number,
        });
        const row = Array.isArray(data) ? data[0] : data;
        return { num: h.order_number, row: row as OrderRow | undefined };
      }),
    );
    const found: OrderRow[] = [];
    const notFound: number[] = [];
    for (const r of results) {
      if (r.row) found.push(r.row);
      else notFound.push(r.num);
    }
    found.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    setOrders(found);
    setMissing(notFound);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const addOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const n = parseInt(num.trim(), 10);
    if (!n || n <= 0) {
      setAddError("Numéro de commande invalide.");
      return;
    }
    const { data, error } = await supabase.rpc("get_order_status", {
      p_order_number: n,
    });
    if (error) {
      setAddError("Erreur. Réessayez.");
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      setAddError(`Aucune commande #${n} trouvée.`);
      return;
    }
    addOrderToHistory(n);
    setNum("");
    setShowAdd(false);
    loadAll();
  };

  const remove = (n: number) => {
    removeOrderFromHistory(n);
    loadAll();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <PackageSearch className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-foreground">
              Mes commandes
            </h1>
            <p className="text-sm text-muted-foreground">
              Historique et statut de vos commandes sur cet appareil.
            </p>
          </div>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="rounded-md border border-border p-2 hover:bg-accent transition disabled:opacity-50 shrink-0"
          aria-label="Rafraîchir"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Add order */}
      <div className="mb-6">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 text-sm rounded-lg border border-dashed border-border px-4 py-2.5 hover:bg-accent transition"
          >
            <Plus className="h-4 w-4" /> Ajouter une commande par numéro
          </button>
        ) : (
          <form
            onSubmit={addOrder}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Ajouter une commande</p>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setAddError(null);
                  setNum("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={num}
                onChange={(e) => setNum(e.target.value)}
                placeholder="N° de commande (ex : 1024)"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                Ajouter
              </button>
            </div>
            {addError && (
              <p className="mt-2 text-xs text-destructive">{addError}</p>
            )}
          </form>
        )}
      </div>

      {/* Missing */}
      {missing.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-medium text-amber-900 mb-2">
            Commandes introuvables
          </p>
          <ul className="space-y-1">
            {missing.map((n) => (
              <li
                key={n}
                className="flex items-center justify-between text-amber-800"
              >
                <span>#{n}</span>
                <button
                  onClick={() => remove(n)}
                  className="text-xs underline hover:no-underline"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-border bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      ) : orders.length === 0 && missing.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <PackageSearch className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">
            Aucune commande pour l'instant
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Vos commandes apparaîtront ici automatiquement après validation.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium"
          >
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => (
            <div
              key={o.order_number}
              className="rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Commande</p>
                  <p className="font-display text-lg sm:text-xl text-foreground">
                    #{o.order_number}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(o.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={o.status} />
                  <button
                    onClick={() => remove(o.order_number)}
                    className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-accent transition"
                    aria-label="Retirer de l'historique"
                    title="Retirer de l'historique"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <OrderStatusTimeline status={o.status} />
            </div>
          ))}
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
