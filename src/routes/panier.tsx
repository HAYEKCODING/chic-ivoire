import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart, cart } from "@/lib/cart";
import { resolveImage } from "@/lib/images";
import { formatXOF } from "@/lib/format";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/panier")({ component: CartPage });

function CartPage() {
  const items = useCart();
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl sm:text-4xl">Mon panier</h1>
      {items.length === 0 ? (
        <div className="mt-10 text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">Votre panier est vide.</p>
          <Link to="/" className="mt-4 inline-block rounded-md bg-primary px-5 py-2 text-primary-foreground font-medium">
            Continuer mes achats
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <ul className="lg:col-span-2 space-y-4">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                <img src={resolveImage(i.image)} alt={i.name} className="h-24 w-20 rounded-md object-cover" />
                <div className="flex-1">
                  <h3 className="font-display text-lg">{i.name}</h3>
                  <p className="text-primary font-semibold text-sm">{formatXOF(i.price)}</p>
                  <div className="mt-3 inline-flex items-center border border-border rounded-md">
                    <button className="h-8 w-8 flex items-center justify-center hover:bg-accent" onClick={() => cart.setQty(i.productId, i.quantity - 1)}><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm">{i.quantity}</span>
                    <button className="h-8 w-8 flex items-center justify-center hover:bg-accent" onClick={() => cart.setQty(i.productId, i.quantity + 1)}><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
                <button onClick={() => cart.remove(i.productId)} className="text-muted-foreground hover:text-destructive self-start">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <aside className="rounded-xl border border-border bg-card p-6 h-fit shadow-soft">
            <h2 className="font-display text-xl">Récapitulatif</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatXOF(total)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Livraison</span>
              <span>À la livraison</span>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatXOF(total)}</span>
            </div>
            <Link to="/commande" className="mt-6 block text-center w-full rounded-md bg-primary text-primary-foreground py-3 font-medium shadow-elegant hover:opacity-90">
              Passer la commande
            </Link>
            <p className="mt-3 text-xs text-muted-foreground text-center">Paiement à la livraison uniquement</p>
          </aside>
        </div>
      )}
    </div>
  );
}
