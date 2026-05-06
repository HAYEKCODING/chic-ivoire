## Boutique Élégance CI — Plan

E-commerce site in French for an Ivorian fashion seller. Cash on delivery only. Admin dashboard for order management.

### Stack
- TanStack Start (already set up) + React + TypeScript
- Lovable Cloud (Supabase) for DB + auth (admin)
- Tailwind v4 + shadcn/ui
- Currency: FCFA (XOF), Language: FR only

### Design direction
- Elegant feminine luxury African vibe
- Palette: deep terracotta `#B5482F`, warm gold `#C9A961`, ivory `#FBF7F1`, deep brown text
- Fonts: Playfair Display (headings) + Inter (body)
- Wax-pattern subtle accents, generous whitespace, mobile-first

### Pages (TanStack routes)
- `/` Home — hero, categories, featured products, brand story
- `/categorie/$slug` — product grid filtered by category
- `/produit/$id` — product detail with add to cart
- `/panier` — cart
- `/commande` — checkout form (cash on delivery)
- `/commande/confirmation/$id` — order confirmation
- `/admin/login` — seller login
- `/admin` — dashboard (orders list, status updates, customer contact via tel/WhatsApp links)

### Database (Lovable Cloud)
Tables:
- `categories` (slug, name, image)
- `products` (name, description, price_xof, image_url, category_id, stock, featured)
- `orders` (id, customer_name, phone, whatsapp, address, city, status, total_xof, created_at)
- `order_items` (order_id, product_id, quantity, unit_price)
- `user_roles` (user_id, role enum: admin) + `has_role` security definer function

RLS:
- Public read on categories/products
- Public insert on orders + order_items (anonymous checkout)
- Admin-only read/update on orders via `has_role`

### Order flow
- Cart stored in localStorage (Zustand)
- Checkout form validates with zod (nom, tel CI format, whatsapp, adresse, commune)
- Insert order → redirect to confirmation page with order #
- Seller sees orders in dashboard, can update status (En attente / Confirmée / Expédiée / Livrée / Annulée), one-click `tel:` and `wa.me/` links

### Sample data
~12 products across 6 categories with generated images

### Admin auth
Email/password sign-in. First registered admin must be promoted manually via SQL (will provide instructions). Dashboard route protected by `has_role` check.

### Notifications
For v1: dashboard notification (unread orders badge). Email sending can be added later via Lovable Emails if requested.

### Out of scope (v1)
- Online payment
- Email notifications (dashboard only)
- Product reviews, wishlists, multi-language
