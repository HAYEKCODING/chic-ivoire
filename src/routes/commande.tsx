import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useCart, cart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/format";
import { toast } from "sonner";
import { notifySellerWhatsApp } from "@/lib/notifications";
import { resolveImage } from "@/lib/images";
import { ShieldCheck, Truck } from "lucide-react";

export const Route = createFileRoute("/commande")({ component: CheckoutPage });

const COMMUNES = [
  "Abidjan - Cocody",
  "Abidjan - Plateau",
  "Abidjan - Yopougon",
  "Abidjan - Marcory",
  "Abidjan - Treichville",
  "Abidjan - Koumassi",
  "Abidjan - Adjamé",
  "Abidjan - Abobo",
  "Abidjan - Port-Bouët",
  "Abidjan - Attécoubé",
  "Abidjan - Bingerville",
  "Abidjan - Songon",
  "Bouaké",
  "Yamoussoukro",
  "San-Pedro",
  "Korhogo",
  "Daloa",
  "Man",
  "Gagnoa",
  "Divo",
  "Autre",
];

const schema = z.object({
  customer_name: z.string().trim().min(2, "Nom complet requis").max(100),
  phone: z
    .string()
    .trim()
    .min(8, "Numéro de téléphone invalide")
    .max(20),
  whatsapp: z
    .string()
    .trim()
    .min(8, "Numéro WhatsApp requis")
    .max(20),
  address: z
    .string()
    .trim()
    .min(5, "Adresse de livraison requise")
    .max(300),
  city: z.string().min(1, "Veuillez sélectionner une commune / ville"),
  notes: z.string().max(500).optional(),
});

type FormState = {
  customer_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  notes: string;
};

function CheckoutPage() {
  const items = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    customer_name: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-display text-3xl text-foreground">Votre panier est vide</h1>
        <p className="mt-3 text-muted-foreground">
          Ajoutez des articles avant de passer commande.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90 transition"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const set = (name: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [name]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      // Créer la commande + articles via la fonction sécurisée
      const { data: orderRows, error } = await supabase.rpc("create_order", {
        p_customer_name: result.data.customer_name,
        p_phone: result.data.phone,
        p_whatsapp: result.data.whatsapp,
        p_address: result.data.address,
        p_city: result.data.city,
        p_notes: result.data.notes ?? null,
        p_total_xof: total,
        p_items: items.map((i) => ({
          product_id: i.productId,
          product_name: i.variant
            ? `${i.name} (${Object.entries(i.variant)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")})`
            : i.name,
          unit_price_xof: i.price,
          quantity: i.quantity,
        })),
      });
      if (error) throw error;
      const order = Array.isArray(orderRows) ? orderRows[0] : orderRows;
      if (!order) throw new Error("Erreur lors de la création de la commande");

      // 3. Notifier la vendeuse par WhatsApp
      notifySellerWhatsApp({
        order_number: order.order_number,
        customer_name: result.data.customer_name,
        phone: result.data.phone,
        whatsapp: result.data.whatsapp,
        address: result.data.address,
        city: result.data.city,
        notes: result.data.notes,
        total_xof: total,
        items: items.map((i) => ({
          product_name: i.name,
          quantity: i.quantity,
          unit_price_xof: i.price,
        })),
      });

      // 4. Vider le panier et rediriger
      cart.clear();
      toast.success("Commande passée avec succès !");
      navigate({
        to: "/commande/confirmation/$id",
        params: { id: String(order.order_number) },
      });
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const field = (
    name: keyof FormState,
    label: string,
    type = "text",
    textarea = false,
    placeholder = ""
  ) => (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={form[name]}
          onChange={(e) => set(name, e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
        />
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={(e) => set(name, e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
        />
      )}
      {errors[name] && (
        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
          ⚠ {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Étape finale
        </span>
        <h1 className="font-display text-3xl sm:text-4xl mt-2 text-foreground">
          Finaliser ma commande
        </h1>
      </div>

      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-8">
        {/* Formulaire livraison */}
        <div className="lg:col-span-2 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl text-foreground border-b border-border pb-3">
            Informations de livraison
          </h2>

          {field("customer_name", "Nom complet *", "text", false, "Ex : Aminata Koné")}

          <div className="grid sm:grid-cols-2 gap-4">
            {field("phone", "Numéro de téléphone *", "tel", false, "+225 07 XX XX XX XX")}
            {field("whatsapp", "Numéro WhatsApp *", "tel", false, "+225 07 XX XX XX XX")}
          </div>

          {field("address", "Adresse de livraison *", "text", false, "Rue, quartier, immeuble...")}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">
              Commune / Ville *
            </label>
            <select
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            >
              <option value="">— Sélectionnez votre commune —</option>
              {COMMUNES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-xs text-destructive mt-1">⚠ {errors.city}</p>
            )}
          </div>

          {field(
            "notes",
            "Notes supplémentaires (facultatif)",
            "text",
            true,
            "Instructions particulières pour la livraison..."
          )}

          {/* Paiement */}
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary">
                Paiement à la livraison uniquement
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Vous payez en espèces (FCFA) lors de la réception de votre colis.
                Aucun paiement en ligne requis.
              </p>
            </div>
          </div>
        </div>

        {/* Résumé commande */}
        <aside className="rounded-2xl border border-border bg-card p-6 h-fit shadow-soft">
          <h2 className="font-display text-xl text-foreground border-b border-border pb-3 mb-4">
            Votre commande
          </h2>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3 items-start">
                <img
                  src={resolveImage(i.image)}
                  alt={i.name}
                  className="h-14 w-12 rounded-md object-cover shrink-0 border border-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight truncate">
                    {i.name}
                  </p>
                  {i.variant && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {Object.entries(i.variant)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">× {i.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-primary shrink-0">
                  {formatXOF(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total</span>
              <span>{formatXOF(total)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Livraison</span>
              <span className="text-green-600 font-medium">À la livraison</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatXOF(total)}</span>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="mt-6 w-full rounded-lg bg-primary text-primary-foreground py-4 font-semibold text-base shadow-elegant hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Truck className="h-5 w-5" />
            {loading ? "Envoi en cours…" : "Confirmer ma commande"}
          </button>
          <p className="mt-3 text-xs text-muted-foreground text-center">
            En confirmant, vous acceptez d'être contactée par WhatsApp ou téléphone.
          </p>
        </aside>
      </form>
    </div>
  );
}
