// Notification WhatsApp à la vendeuse après chaque commande
const SELLER_WHATSAPP = "2250711598503";

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

export function notifySellerWhatsApp(order: OrderNotifData) {
  const lines = [
    `🛍️ *NOUVELLE COMMANDE — KGF BOUTIQUE*`,
    `📋 Commande n°*${order.order_number}*`,
    ``,
    `👤 *Cliente :* ${order.customer_name}`,
    `📱 *Tél :* ${order.phone}`,
    `💬 *WhatsApp :* ${order.whatsapp}`,
    `📍 *Adresse :* ${order.address}`,
    `🏘️ *Commune :* ${order.city}`,
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
    `⏰ Commande reçue le ${new Date().toLocaleString("fr-FR")}`,
  ];

  const text = encodeURIComponent(lines.join("\n"));
  const url = `https://wa.me/${SELLER_WHATSAPP}?text=${text}`;
  // Ouvre dans un nouvel onglet — la vendeuse voit le message pré-rempli
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
