import { useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  quantity: number;
};

const KEY = "boutique-cart-v1";
let items: CartItem[] = [];
const listeners = new Set<() => void>();

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
  add(item: Omit<CartItem, "quantity">, qty = 1) {
    const existing = items.find((i) => i.productId === item.productId);
    if (existing) existing.quantity += qty;
    else items = [...items, { ...item, quantity: qty }];
    persist();
  },
  remove(productId: string) {
    items = items.filter((i) => i.productId !== productId);
    persist();
  },
  setQty(productId: string, qty: number) {
    if (qty <= 0) return cart.remove(productId);
    items = items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i));
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
