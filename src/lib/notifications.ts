// Notification WhatsApp à la vendeuse après chaque commande
const SELLER_WHATSAPP = "2250711598503";
const STORAGE_KEY = "kgf-pending-whatsapp";

export interface OrderNotifData {
  order_number: number;
  customer_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  notes?: string | null;
  total_xof: number;
  items: { product_name: string; quantity: number; unit_price_xof: number }[];
}

export function buildSellerWhatsAppUrl(order: OrderNotifData): string {
  const lines = [
    `🛍️ *NOUVELLE COMMANDE — KGF BOUTIQUE*`,
    `📋 Commande n°*${order.order_number}*`,
    ``,
    `👤 *Cliente :* ${order.customer_name}`,
    `📱 *Tél :* ${order.phone}`,
    `💬 *WhatsApp :* ${order.whatsapp}`,
    `📍 *Adresse :* ${order.address}`,
    `🏘️ *Commune :* ${order.city}`,
    ...(order.notes ? [`📝 *Notes :* ${order.notes}`] : []),
    ``,
    `🛒 *Articles commandés :*`,
    ...order.items.map(
      (i) =>
        `  • ${i.product_name} × ${i.quantity} = ${new Intl.NumberFormat("fr-FR").format(i.unit_price_xof * i.quantity)} FCFA`
    ),
    ``,
    `💰 *TOTAL : ${new Intl.NumberFormat("fr-FR").format(order.total_xof)} FCFA*`,
    `💳 *Paiement :* À la livraison (espèces)`,
    ``,
    `⏰ Commande passée le ${new Date().toLocaleString("fr-FR")}`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${SELLER_WHATSAPP}?text=${text}`;
}

// Stocke l'URL pour la page de confirmation (clic utilisateur = pas de blocage)
export function notifySellerWhatsApp(order: OrderNotifData) {
  if (typeof window === "undefined") return;
  const url = buildSellerWhatsAppUrl(order);
  try {
    sessionStorage.setItem(STORAGE_KEY, url);
  } catch {
    // ignore
  }
}

export function consumePendingWhatsAppUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const url = sessionStorage.getItem(STORAGE_KEY);
    return url;
  } catch {
    return null;
  }
}

export function clearPendingWhatsAppUrl() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
