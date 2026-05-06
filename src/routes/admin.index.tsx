import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/format";
import { toast } from "sonner";
import { Phone, MessageCircle, LogOut, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

type OrderStatus = "en_attente" | "confirmee" | "expediee" | "livree" | "annulee";

type Order = {
  id: string; order_number: number; customer_name: string; phone: string;
  whatsapp: string; address: string; city: string; notes: string | null;
  total_xof: number; status: OrderStatus; created_at: string;
};

type Item = { id: string; product_name: string; quantity: number; unit_price_xof: number };

const STATUS_LABEL: Record<OrderStatus,string> = {
  en_attente: "En attente", confirmee: "Confirmée", expediee: "Expédiée",
  livree: "Livrée", annulee: "Annulée",
};
const STATUS_COLOR: Record<OrderStatus,string> = {
  en_attente: "bg-amber-100 text-amber-800",
  confirmee: "bg-blue-100 text-blue-800",
  expediee: "bg-purple-100 text-purple-800",
  livree: "bg-green-100 text-green-800",
  annulee: "bg-red-100 text-red-800",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Record<string, Item[]>>({});
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/admin/login" }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const admin = (roles ?? []).some(r => r.role === "admin");
      setIsAdmin(admin);
      setAuthChecked(true);
      if (admin) loadOrders();
    })();
  }, [navigate]);

  const loadOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
  };

  const loadItems = async (orderId: string) => {
    if (items[orderId]) return;
    const { data } = await supabase.from("order_items").select("id, product_name, quantity, unit_price_xof").eq("order_id", orderId);
    setItems(prev => ({ ...prev, [orderId]: (data as Item[]) ?? [] }));
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
    toast.success("Statut mis à jour");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (!authChecked) return <div className="p-10 text-center">Chargement…</div>;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <h1 className="font-display text-2xl">Accès refusé</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Votre compte n'a pas le rôle administrateur. Contactez le support pour être promu.
        </p>
        <button onClick={logout} className="mt-6 rounded-md bg-primary text-primary-foreground px-5 py-2">Se déconnecter</button>
      </div>
    );
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const pendingCount = orders.filter(o => o.status === "en_attente").length;

  const cleanPhone = (p: string) => p.replace(/[^+\d]/g, "");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} commandes · {pendingCount} en attente</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadOrders} className="inline-flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"><RefreshCw className="h-4 w-4"/> Actualiser</button>
          <button onClick={logout} className="inline-flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"><LogOut className="h-4 w-4"/> Déconnexion</button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all","en_attente","confirmee","expediee","livree","annulee"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter===s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>
            {s === "all" ? `Toutes (${orders.length})` : `${STATUS_LABEL[s]} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-10">Aucune commande.</p>}
        {filtered.map(o => (
          <div key={o.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <button onClick={() => { setOpenId(openId === o.id ? null : o.id); loadItems(o.id); }} className="w-full p-5 text-left grid sm:grid-cols-5 gap-3 items-center hover:bg-accent/30">
              <div>
                <p className="font-display text-lg">#{o.order_number}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="font-medium">{o.customer_name}</p>
                <p className="text-xs text-muted-foreground">{o.city}</p>
              </div>
              <div className="text-primary font-semibold">{formatXOF(o.total_xof)}</div>
              <div className="text-right">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[o.status]}`}>{STATUS_LABEL[o.status]}</span>
              </div>
            </button>
            {openId === o.id && (
              <div className="border-t border-border p-5 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Client</h3>
                  <p className="text-sm">{o.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{o.address}, {o.city}</p>
                  <div className="mt-3 flex gap-2">
                    <a href={`tel:${cleanPhone(o.phone)}`} className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-2 text-xs"><Phone className="h-3 w-3"/> Appeler</a>
                    <a href={`https://wa.me/${cleanPhone(o.whatsapp).replace(/^\+/,"")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-green-600 text-white px-3 py-2 text-xs"><MessageCircle className="h-3 w-3"/> WhatsApp</a>
                  </div>
                  {o.notes && <p className="mt-3 text-xs text-muted-foreground">Note : {o.notes}</p>}
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-2">Articles</h3>
                  <ul className="text-sm space-y-1">
                    {(items[o.id] ?? []).map(i => (
                      <li key={i.id} className="flex justify-between">
                        <span>{i.product_name} × {i.quantity}</span>
                        <span className="text-muted-foreground">{formatXOF(i.unit_price_xof * i.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <label className="text-xs text-muted-foreground">Changer le statut</label>
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value as OrderStatus)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {(Object.keys(STATUS_LABEL) as OrderStatus[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
