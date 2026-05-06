import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import hero from "@/assets/hero.jpg";

const categories = [
  { slug: "boubous", name: "Boubous" },
  { slug: "bijoux", name: "Bijoux" },
  { slug: "sacs", name: "Sacs" },
  { slug: "chaussures", name: "Chaussures" },
  { slug: "accessoires", name: "Accessoires" },
  { slug: "beaute", name: "Beauté" },
];

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [featured, setFeatured] = useState<ProductCardData[]>([]);
  useEffect(() => {
    supabase
      .from("products")
      .select("id, slug, name, price_xof, image_url")
      .eq("featured", true)
      .limit(6)
      .then(({ data }) => setFeatured(data ?? []));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                Mode féminine ivoirienne
              </span>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-foreground">
                L'élégance africaine,<br />
                <span className="text-primary">portée avec fierté.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-lg">
                Découvrez notre collection exclusive de boubous brodés, bijoux dorés, sacs en raphia et accessoires raffinés. Livraison partout en Côte d'Ivoire — paiement à la livraison.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/categorie/$slug"
                  params={{ slug: "boubous" }}
                  className="inline-flex items-center justify-center h-12 px-7 rounded-md bg-primary text-primary-foreground font-medium shadow-elegant hover:opacity-90 transition"
                >
                  Découvrir la collection
                </Link>
                <Link
                  to="/categorie/$slug"
                  params={{ slug: "bijoux" }}
                  className="inline-flex items-center justify-center h-12 px-7 rounded-md border border-primary/30 text-primary font-medium hover:bg-accent transition"
                >
                  Voir les bijoux
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
                <span>✓ Paiement à la livraison</span>
                <span>✓ Livraison Abidjan & CI</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-gold opacity-20 blur-3xl rounded-full" />
              <img
                src={hero}
                alt="Femme ivoirienne en boubou doré"
                width={1080}
                height={1600}
                className="relative rounded-2xl shadow-elegant w-full max-h-[640px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Univers</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-2">Nos catégories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/categorie/$slug"
              params={{ slug: c.slug }}
              className="group relative aspect-square rounded-xl bg-gradient-to-br from-accent to-secondary border border-border/60 overflow-hidden flex items-center justify-center text-center px-2 hover:shadow-soft transition"
            >
              <span className="font-display text-lg sm:text-xl text-primary group-hover:text-gold transition">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Sélection</span>
            <h2 className="font-display text-3xl sm:text-4xl mt-2">Nos coups de cœur</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 sm:gap-7">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Story */}
      <section className="bg-accent/40 mt-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Notre histoire</span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3">Une boutique, une passion.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Élégance CI célèbre la beauté et la sophistication des femmes ivoiriennes. Chaque pièce est sélectionnée avec soin auprès d'artisans locaux et de créateurs talentueux pour vous offrir le meilleur de la mode africaine contemporaine.
          </p>
        </div>
      </section>
    </div>
  );
}
