import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  OrderStatusTimeline,
  OrderStatusBadge,
  type OrderStatus,
} from "@/components/OrderStatusTimeline";
import {
  getCustomerPhone,
  saveCustomerPhone,
  clearCustomerPhone,
} from "@/lib/order-history";
import { formatXOF } from "@/lib/format";
import { PackageSearch, RefreshCw, Phone, Pencil } from "lucide-react";

export const Route = createFileRoute("/suivi")({ component: SuiviPage });

type OrderRow = {
  order_number: number;
  status: OrderStatus;
  created_at: string;
  total_xof: number;
  city: string;
};

function SuiviPage() {
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (p: string) => {
    if (!p || p.replace(/\D/g, "").length < 8) {
      setError("Numéro de téléphone invalide");
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase.rpc(
      "get_orders_by_phone" as never,
      { p_phone: p } as never,
    );
    if (err) {
      setError("Erreur lors du chargement. Réessayez.");
      setOrders([]);
    } else {
      setOrders((data as OrderRow[]) || []);
    }
    setSearched(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const saved = getCustomerPhone();
    if (saved) {
      setPhone(saved);
      setInput(saved);
      load(saved);
    } else {
      setEditing(true);
    }
  }, [load]);

  const submitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.replace(/\D/g, "").length < 8) {
      setError("Numéro de téléphone invalide (8 chiffres minimum)");
      return;
    }
    saveCustomerPhone(trimmed);
    setPhone(trimmed);
    setEditing(false);
    load(trimmed);
  };

  const changePhone = () => {
    clearCustomerPhone();
    setPhone("");
    setInput("");
    setOrders([]);
    setSearched(false);
    setEditing(true);
    setError("");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <PackageSearch className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-foreground">
              Historique de mes commandes
            </h1>
            <p className="text-sm text-muted-foreground">
              Retrouvez toutes vos commandes liées à votre numéro de téléphone.
            </p>
          </div>
        </div>
      </div>

      {/* Phone form */}
      {editing ? (
        <form
          onSubmit={submitPhone}
          className="rounded-xl border border-border bg-card p-5 sm:p-6 mb-6"
        >
          <label className="block text-sm font-medium text-foreground mb-2">
            Votre numéro de téléphone
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Saisissez le numéro utilisé lors de vos commandes (téléphone ou
            WhatsApp).
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="+225 07 XX XX XX XX"
                className="w-full rounded-md border border-border bg-background pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              Rechercher
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          )}
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Téléphone :</span>
            <span className="font-medium text-foreground">{phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(phone)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent transition disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Rafraîchir
            </button>
            <button
              onClick={changePhone}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent transition"
            >
              <Pencil className="h-3.5 w-3.5" />
              Changer
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-border bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      ) : searched && orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <PackageSearch className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">
            Aucune commande trouvée
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Aucune commande n'est associée à ce numéro. Vérifiez le numéro
            saisi ou passez votre première commande.
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
              <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
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
                    {o.city ? ` · ${o.city}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <OrderStatusBadge status={o.status} />
                  <p className="text-sm font-semibold text-foreground">
                    {formatXOF(o.total_xof)}
                  </p>
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
