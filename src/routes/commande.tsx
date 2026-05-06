import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useCart, cart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/commande")({ component: CheckoutPage });

const COMMUNES = ["Abidjan - Cocody","Abidjan - Plateau","Abidjan - Yopougon","Abidjan - Marcory","Abidjan - Treichville","Abidjan - Koumassi","Abidjan - Adjamé","Abidjan - Abobo","Abidjan - Port-Bouët","Abidjan - Attécoubé","Bouaké","Yamoussoukro","San-Pedro","Korhogo","Daloa","Man","Autre"];

const schema = z.object({
  customer_name: z.string().trim().min(2, "Nom requis").max(100),
  phone: z.string().trim().min(8, "Numéro invalide").max(20),
  whatsapp: z.string().trim().min(8, "WhatsApp requis").max(20),
  address: z.string().trim().min(5, "Adresse requise").max(300),
  city: z.string().min(1, "Sélectionnez une ville"),
  notes: z.string().max(500).optional(),
});

function CheckoutPage() {
  const items = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: "", phone: "", whatsapp: "", address: "", city: "", notes: "" });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const total = items.reduce((s,i)=> s+i.price*i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Votre panier est vide</h1>
        <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-5 py-2 text-primary-foreground">Retour à la boutique</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const e: Record<string,string> = {};
      result.error.issues.forEach(i => { e[i.path[0] as string] = i.message; });
      setErrors(e);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        ...result.data,
        total_xof: total,
      }).select("id, order_number").single();
      if (error || !order) throw error ?? new Error("Erreur");

      const { error: itemsError } = await supabase.from("order_items").insert(
        items.map(i => ({
          order_id: order.id,
          product_id: i.productId,
          product_name: i.name,
          unit_price_xof: i.price,
          quantity: i.quantity,
        }))
      );
      if (itemsError) throw itemsError;

      cart.clear();
      toast.success("Commande passée avec succès !");
      navigate({ to: "/commande/confirmation/$id", params: { id: String(order.order_number) } });
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const field = (name: keyof typeof form, label: string, type="text", textarea=false) => (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {textarea ? (
        <textarea value={form[name]} onChange={e => setForm({...form, [name]: e.target.value})} rows={3}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      ) : (
        <input type={type} value={form[name]} onChange={e => setForm({...form, [name]: e.target.value})}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      )}
      {errors[name] && <p className="text-xs text-destructive mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl sm:text-4xl">Finaliser ma commande</h1>
      <form onSubmit={submit} className="mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Informations de livraison</h2>
          {field("customer_name", "Nom complet")}
          <div className="grid sm:grid-cols-2 gap-4">
            {field("phone", "Numéro de téléphone", "tel")}
            {field("whatsapp", "Numéro WhatsApp", "tel")}
          </div>
          {field("address", "Adresse de livraison")}
          <div>
            <label className="text-sm font-medium">Commune / Ville</label>
            <select value={form.city} onChange={e => setForm({...form, city: e.target.value})}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">— Sélectionnez —</option>
              {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
          </div>
          {field("notes", "Notes (facultatif)", "text", true)}

          <div className="rounded-md bg-accent p-4">
            <p className="text-sm font-semibold">💵 Mode de paiement</p>
            <p className="text-sm text-muted-foreground mt-1">Paiement à la livraison uniquement (espèces)</p>
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-card p-6 h-fit shadow-soft">
          <h2 className="font-display text-xl">Votre commande</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map(i => (
              <li key={i.productId} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{i.name} × {i.quantity}</span>
                <span>{formatXOF(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-border flex justify-between font-semibold">
            <span>Total</span><span className="text-primary">{formatXOF(total)}</span>
          </div>
          <button disabled={loading} type="submit"
            className="mt-6 w-full rounded-md bg-primary text-primary-foreground py-3 font-medium shadow-elegant hover:opacity-90 disabled:opacity-50">
            {loading ? "Envoi…" : "Confirmer ma commande"}
          </button>
        </aside>
      </form>
    </div>
  );
}
