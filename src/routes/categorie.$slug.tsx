import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";

const NAMES: Record<string, string> = {
  boubous: "Boubous",
  bijoux: "Bijoux",
  sacs: "Sacs",
  chaussures: "Chaussures",
  accessoires: "Accessoires",
  beaute: "Beauté",
};

export const Route = createFileRoute("/categorie/$slug")({
  component: CategoryPage,
  head: ({ params }) => ({
    meta: [
      { title: `${NAMES[params.slug] ?? "Catégorie"} — Élégance CI` },
      { name: "description", content: `Découvrez notre sélection ${NAMES[params.slug] ?? ""} pour femme en Côte d'Ivoire.` },
    ],
  }),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
      if (!cat) { setProducts([]); setLoading(false); return; }
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, price_xof, image_url")
        .eq("category_id", cat.id)
        .order("created_at", { ascending: false });
      setProducts(data ?? []);
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Catégorie</span>
        <h1 className="font-display text-3xl sm:text-4xl mt-2">{NAMES[slug] ?? slug}</h1>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">Aucun produit pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
