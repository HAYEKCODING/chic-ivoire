import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/images";
import { formatXOF } from "@/lib/format";
import { cart } from "@/lib/cart";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";

type Product = {
  id: string; slug: string; name: string; description: string | null;
  price_xof: number; image_url: string | null; stock: number;
};

export const Route = createFileRoute("/produit/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.from("products").select("*").eq("slug", slug).maybeSingle()
      .then(({ data }) => { setP(data as Product | null); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Chargement…</div>;
  if (!p) return <div className="p-10 text-center">Produit introuvable.</div>;

  const add = (goCart = false) => {
    cart.add({ productId: p.id, name: p.name, price: p.price_xof, image: p.image_url ?? "", slug: p.slug }, qty);
    toast.success(`${p.name} ajouté au panier`);
    if (goCart) navigate({ to: "/panier" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Retour</Link>
      <div className="grid lg:grid-cols-2 gap-10 mt-6">
        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-elegant">
          <img src={resolveImage(p.image_url)} alt={p.name} className="h-full w-full object-cover" width={800} height={1000} />
        </div>
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-foreground">{p.name}</h1>
          <p className="mt-4 text-2xl text-primary font-semibold">{formatXOF(p.price_xof)}</p>
          <p className="mt-6 text-muted-foreground leading-relaxed">{p.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-medium">Quantité</span>
            <div className="inline-flex items-center border border-border rounded-md">
              <button className="h-10 w-10 flex items-center justify-center hover:bg-accent" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center">{qty}</span>
              <button className="h-10 w-10 flex items-center justify-center hover:bg-accent" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></button>
            </div>
            <span className="text-xs text-muted-foreground">{p.stock} en stock</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => add(false)} className="inline-flex items-center gap-2 h-12 px-6 rounded-md border border-primary/40 text-primary font-medium hover:bg-accent">
              <ShoppingBag className="h-4 w-4" /> Ajouter au panier
            </button>
            <button onClick={() => add(true)} className="inline-flex items-center justify-center h-12 px-7 rounded-md bg-primary text-primary-foreground font-medium shadow-elegant hover:opacity-90">
              Commander maintenant
            </button>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="rounded-md border border-border p-4">✓ Paiement à la livraison</div>
            <div className="rounded-md border border-border p-4">✓ Livraison Abidjan 24-48h</div>
          </div>
        </div>
      </div>
    </div>
  );
}
