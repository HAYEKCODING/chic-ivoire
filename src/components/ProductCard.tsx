import { Link } from "@tanstack/react-router";
import { resolveImage } from "@/lib/images";
import { formatXOF } from "@/lib/format";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price_xof: number;
  image_url: string | null;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  return (
    <Link
      to="/produit/$slug"
      params={{ slug: p.slug }}
      className="group block"
    >
      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-primary/5 ring-1 ring-primary/20 shadow-soft">
        <img
          src={resolveImage(p.image_url)}
          alt={p.name}
          loading="lazy"
          width={800}
          height={1000}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-3">
        <h3 className="font-display text-lg leading-tight text-primary">{p.name}</h3>
        <p className="text-sm text-primary font-semibold mt-1">{formatXOF(p.price_xof)}</p>
      </div>
    </Link>
  );
}
