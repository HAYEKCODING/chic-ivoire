import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState, useEffect } from "react";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Barre d'annonce */}
      <div className="bg-primary text-primary-foreground text-xs text-center py-2 px-4 font-medium">
        ✓ Paiement à la livraison &nbsp;·&nbsp; ✓ Livraison partout en Côte d'Ivoire &nbsp;·&nbsp;
        <a href="https://wa.me/2250711598503" target="_blank" rel="noreferrer" className="underline hover:no-underline">
          Commander via WhatsApp
        </a>
      </div>

      <header className={`sticky top-0 z-50 transition-all ${scrolled ? "backdrop-blur-md bg-background/90 shadow-soft" : "bg-background/85 backdrop-blur-md"} border-b border-border/60`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="font-display text-xl sm:text-2xl tracking-tight">
                <span className="text-primary">KGF</span>
                {" "}
                <span className="text-gold">BOUTIQUE</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {cats.map((c) => (
                <Link
                  key={c.slug}
                  to="/categorie/$slug"
                  params={{ slug: c.slug }}
                  className="text-sm font-medium text-foreground/75 hover:text-primary transition-colors relative group"
                  activeProps={{ className: "text-primary" }}
                >
                  {c.name}
                  <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* WhatsApp desktop */}
              <a
                href="https://wa.me/2250711598503"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-green-600/10 text-green-700 border border-green-200 px-3 py-1.5 text-xs font-medium hover:bg-green-600/20 transition"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>

              {/* Panier */}
              <Link
                to="/panier"
                className="relative inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent transition-colors"
                aria-label="Panier"
              >
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>

              {/* Burger mobile */}
              <button
                className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-accent transition"
                onClick={() => setOpen((o) => !o)}
                aria-label="Menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {open && (
            <nav className="lg:hidden pb-5 pt-2 border-t border-border/60 mt-1">
              <div className="grid grid-cols-2 gap-2">
                {cats.map((c) => (
                  <Link
                    key={c.slug}
                    to="/categorie/$slug"
                    params={{ slug: c.slug }}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition"
                    onClick={() => setOpen(false)}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              <a
                href="https://wa.me/2250711598503"
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-green-600 text-white px-4 py-3 text-sm font-medium"
              >
                <MessageCircle className="h-4 w-4" /> Commander via WhatsApp
              </a>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
