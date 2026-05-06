import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState } from "react";

const cats = [
  { slug: "boubous", name: "Boubous" },
  { slug: "bijoux", name: "Bijoux" },
  { slug: "sacs", name: "Sacs" },
  { slug: "chaussures", name: "Chaussures" },
  { slug: "accessoires", name: "Accessoires" },
  { slug: "beaute", name: "Beauté" },
];

export function Header() {
  const items = useCart();
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl sm:text-2xl tracking-tight text-primary">
              Élégance <span className="text-gold">CI</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {cats.map((c) => (
              <Link
                key={c.slug}
                to="/categorie/$slug"
                params={{ slug: c.slug }}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                activeProps={{ className: "text-primary" }}
              >
                {c.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/panier"
              className="relative inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent transition-colors"
              aria-label="Panier"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button
              className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-accent"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="md:hidden pb-4 grid grid-cols-2 gap-2">
            {cats.map((c) => (
              <Link
                key={c.slug}
                to="/categorie/$slug"
                params={{ slug: c.slug }}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
