const KEY = "kgf_order_history";

export type StoredOrder = { order_number: number; saved_at: string };

export function getOrderHistory(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addOrderToHistory(order_number: number) {
  if (typeof window === "undefined") return;
  const list = getOrderHistory().filter((o) => o.order_number !== order_number);
  list.unshift({ order_number, saved_at: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
}

export function removeOrderFromHistory(order_number: number) {
  if (typeof window === "undefined") return;
  const list = getOrderHistory().filter((o) => o.order_number !== order_number);
  localStorage.setItem(KEY, JSON.stringify(list));
}
