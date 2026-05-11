import { Link } from "@tanstack/react-router";
import { MessageCircle, Phone, MapPin, Heart } from "lucide-react";

const cats = [
  { slug: "boubous", name: "Boubous" },
  { slug: "bijoux", name: "Bijoux" },
  { slug: "sacs", name: "Sacs" },
  { slug: "chaussures", name: "Chaussures femmes" },
  { slug: "accessoires", name: "Accessoires" },
  { slug: "beaute", name: "Produits de beauté" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-accent/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link to="/">
            <h3 className="font-display text-2xl text-primary">
              KGF <span className="text-gold">BOUTIQUE</span>
            </h3>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
            Mode féminine raffinée, fièrement ivoirienne. Boubous, bijoux, sacs
            et plus encore — sélectionnés avec passion pour vous.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary font-medium">
            <Heart className="h-3.5 w-3.5 fill-primary" />
            Fait avec fierté en Côte d'Ivoire 🇨🇮
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-display text-base text-foreground mb-4">Nos collections</h4>
          <ul className="space-y-2.5">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/categorie/$slug"
                  params={{ slug: c.slug }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-display text-base text-foreground mb-4">Nos services</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              Paiement à la livraison (espèces)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              Livraison à Abidjan sous 24-48h
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              Livraison partout en Côte d'Ivoire
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              Service client 7j/7 par WhatsApp
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              Articles authentiques et de qualité
            </li>
            <li className="pt-2">
              <Link
                to="/suivi"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition"
              >
                📦 Suivre ma commande
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display text-base text-foreground mb-4">Nous contacter</h4>
          <ul className="space-y-3">
            <li>
              <a
                href="https://wa.me/2250711598503"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700 hover:bg-green-100 transition"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-xs">+225 07 11 59 85 03</p>
                </div>
              </a>
            </li>
            <li>
              <a
                href="tel:+2250711598503"
                className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm text-foreground hover:bg-accent transition"
              >
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Téléphone</p>
                  <p className="text-xs text-muted-foreground">+225 07 11 59 85 03</p>
                </div>
              </a>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-muted-foreground px-3">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              Abidjan, Côte d'Ivoire
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KGF BOUTIQUE — Tous droits réservés.</p>
          <p>Mode féminine ivoirienne de luxe · Paiement à la livraison uniquement</p>
        </div>
      </div>
    </footer>
  );
}
