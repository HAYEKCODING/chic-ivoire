import { useSyncExternalStore } from "react";

export type CartItem = {
  key: string; // unique per product + variant combo
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  quantity: number;
  variant?: Record<string, string>; // ex: { Taille: "M", Couleur: "Or" }
};

const KEY = "boutique-cart-v2";
let items: CartItem[] = [];
const listeners = new Set<() => void>();

export function makeKey(productId: string, variant?: Record<string, string>) {
  if (!variant || Object.keys(variant).length === 0) return productId;
  const sig = Object.keys(variant)
    .sort()
    .map((k) => `${k}:${variant[k]}`)
    .join("|");
  return `${productId}::${sig}`;
}

function load() {
  if (typeof window === "undefined") return;
  try {
    items = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    items = [];
  }
}
function persist() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}
load();

export const cart = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get(): CartItem[] {
    return items;
  },
  add(item: Omit<CartItem, "quantity" | "key">, qty = 1) {
    const key = makeKey(item.productId, item.variant);
    const existing = items.find((i) => i.key === key);
    if (existing) existing.quantity += qty;
    else items = [...items, { ...item, key, quantity: qty }];
    persist();
  },
  remove(key: string) {
    items = items.filter((i) => i.key !== key);
    persist();
  },
  setQty(key: string, qty: number) {
    if (qty <= 0) return cart.remove(key);
    items = items.map((i) => (i.key === key ? { ...i, quantity: qty } : i));
    persist();
  },
  clear() {
    items = [];
    persist();
  },
  total(): number {
    return items.reduce((s, i) => s + i.price * i.quantity, 0);
  },
  count(): number {
    return items.reduce((s, i) => s + i.quantity, 0);
  },
};

const emptySnap: CartItem[] = [];
export function useCart() {
  return useSyncExternalStore(
    cart.subscribe,
    () => items,
    () => emptySnap,
  );
}
