import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/format";
import { toast } from "sonner";
import {
  Phone, MessageCircle, LogOut, RefreshCw,
  Package, ShoppingBag, TrendingUp, Clock,
  Plus, Pencil, Trash2, Upload, X, ChevronDown, ChevronUp,
  Check, Truck, Ban, Eye,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

type OrderStatus = "en_attente" | "confirmee" | "expediee" | "livree" | "annulee";

type Order = {
  id: string; order_number: number; customer_name: string; phone: string;
  whatsapp: string; address: string; city: string; notes: string | null;
  total_xof: number; status: OrderStatus; created_at: string;
};
type Item = { id: string; product_name: string; quantity: number; unit_price_xof: number };
type Category = { id: string; slug: string; name: string };
type Product = {
  id: string; slug: string; name: string; price_xof: number;
  description: string | null; image_url: string | null; images: string[];
  stock: number; featured: boolean; category_id: string | null;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  en_attente: "En attente", confirmee: "Confirmée", expediee: "Expédiée",
  livree: "Livrée", annulee: "Annulée",
};
const STATUS_COLOR: Record<OrderStatus, string> = {
  en_attente: "bg-amber-100 text-amber-700 border-amber-200",
  confirmee: "bg-blue-100 text-blue-700 border-blue-200",
  expediee: "bg-violet-100 text-violet-700 border-violet-200",
  livree: "bg-emerald-100 text-emerald-700 border-emerald-200",
  annulee: "bg-red-100 text-red-700 border-red-200",
};

type AdminTab = "commandes" | "produits" | "categories";

function AdminDashboard() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<AdminTab>("commandes");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, Item[]>>({});
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productForm, setProductForm] = useState({
    name: "", slug: "", price_xof: "", description: "",
    stock: "0", featured: false, category_id: "", image_url: "",
  });

  // Categories form state
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", image_url: "" });
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/admin/login" }); return; }
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", session.user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      setAuthChecked(true);
      if (admin) { loadOrders(); loadProducts(); loadCategories(); }
    })();
  }, [navigate]);

  const loadOrders = async () => {
    const { data } = await supabase
      .from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as Product[]) ?? []);
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from("categories").select("id, slug, name").order("sort_order");
    setCategories((data as Category[]) ?? []);
  };

  const loadOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase
      .from("order_items")
      .select("id, product_name, quantity, unit_price_xof")
      .eq("order_id", orderId);
    setOrderItems((prev) => ({ ...prev, [orderId]: (data as Item[]) ?? [] }));
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success("Statut mis à jour ✓");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  // ---- PRODUCT FORM ----
  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", slug: "", price_xof: "", description: "", stock: "0", featured: false, category_id: "", image_url: "" });
    setShowProductForm(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, slug: p.slug,
      price_xof: String(p.price_xof), description: p.description ?? "",
      stock: String(p.stock), featured: p.featured,
      category_id: p.category_id ?? "", image_url: p.image_url ?? "",
    });
    setShowProductForm(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      setProductForm((f) => ({ ...f, image_url: urlData.publicUrl }));
      toast.success("Image téléversée ✓");
    } catch (err) {
      // Bucket may not exist yet — store URL directly or use a placeholder
      toast.error("Erreur upload image. Vérifiez que le bucket 'product-images' existe dans Supabase Storage.");
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProduct = async () => {
    if (!productForm.name || !productForm.price_xof) {
      toast.error("Nom et prix sont obligatoires");
      return;
    }
    const payload = {
      name: productForm.name.trim(),
      slug: productForm.slug || slugify(productForm.name),
      price_xof: parseInt(productForm.price_xof, 10),
      description: productForm.description || null,
      stock: parseInt(productForm.stock, 10) || 0,
      featured: productForm.featured,
      category_id: productForm.category_id || null,
      image_url: productForm.image_url || null,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Produit modifié ✓");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Produit ajouté ✓");
    }
    setShowProductForm(false);
    loadProducts();
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Produit supprimé");
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  // ---- CATEGORIES ----
  const addCategory = async () => {
    if (!newCategory.name.trim()) { toast.error("Le nom de la catégorie est obligatoire"); return; }
    setSavingCategory(true);
    const slug = (newCategory.slug || slugify(newCategory.name)).trim();
    const { error } = await supabase.from("categories").insert({
      name: newCategory.name.trim(),
      slug,
      image_url: newCategory.image_url || null,
    });
    setSavingCategory(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Catégorie ajoutée ✓");
    setNewCategory({ name: "", slug: "", image_url: "" });
    loadCategories();
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Supprimer la catégorie "${name}" ? Les produits associés ne seront plus rattachés à aucune catégorie.`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Catégorie supprimée");
    setCategories((c) => c.filter((x) => x.id !== id));
    loadProducts();
  };

  if (!authChecked) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Vérification de l'accès…</p>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="mx-auto max-w-lg p-10 text-center">
      <h1 className="font-display text-2xl text-primary">Accès refusé</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Votre compte n'a pas le rôle administrateur.
        Contactez l'administrateur pour obtenir l'accès.
      </p>
      <button onClick={logout} className="mt-6 rounded-lg bg-primary text-primary-foreground px-6 py-3 font-medium">
        Se déconnecter
      </button>
    </div>
  );

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const pendingCount = orders.filter((o) => o.status === "en_attente").length;
  const totalRevenue = orders.filter((o) => o.status === "livree").reduce((s, o) => s + o.total_xof, 0);
  const cleanPhone = (p: string) => p.replace(/[^+\d]/g, "");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Administration</span>
          <h1 className="font-display text-3xl text-foreground mt-1">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">KGF BOUTIQUE — Espace vendeuse</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { loadOrders(); loadProducts(); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-accent transition">
            <RefreshCw className="h-4 w-4" /> Actualiser
          </button>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-accent transition">
            Boutique
          </Link>
          <button onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-4 py-2.5 text-sm hover:bg-primary/20 transition">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Commandes totales", value: orders.length, icon: <ShoppingBag className="h-5 w-5" />, color: "text-blue-600" },
          { label: "En attente", value: pendingCount, icon: <Clock className="h-5 w-5" />, color: "text-amber-600" },
          { label: "Produits", value: products.length, icon: <Package className="h-5 w-5" />, color: "text-violet-600" },
          { label: "Revenu livré", value: formatXOF(totalRevenue), icon: <TrendingUp className="h-5 w-5" />, color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className={`${s.color} mb-2`}>{s.icon}</div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 rounded-xl bg-muted p-1 w-full sm:w-fit overflow-x-auto">
        {(["commandes", "produits", "categories"] as AdminTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition whitespace-nowrap ${tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "commandes" ? `Commandes (${orders.length})` : t === "produits" ? `Produits (${products.length})` : `Catégories (${categories.length})`}
          </button>
        ))}
      </div>

      {/* ===== COMMANDES ===== */}
      {tab === "commandes" && (
        <div>
          <div className="flex flex-wrap gap-2 mb-5">
            {(["all", "en_attente", "confirmee", "expediee", "livree", "annulee"] as const).map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${filter === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
                {s === "all" ? `Toutes (${orders.length})` : `${STATUS_LABEL[s as OrderStatus]} (${orders.filter((o) => o.status === s).length})`}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                Aucune commande dans cette catégorie.
              </div>
            )}
            {filtered.map((o) => (
              <div key={o.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-soft">
                <button
                  onClick={() => { setOpenId(openId === o.id ? null : o.id); loadOrderItems(o.id); }}
                  className="w-full p-5 text-left grid sm:grid-cols-5 gap-3 items-center hover:bg-accent/30 transition"
                >
                  <div>
                    <p className="font-display text-lg text-primary">#{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="font-semibold text-foreground">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.city}</p>
                  </div>
                  <div className="font-bold text-primary">{formatXOF(o.total_xof)}</div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLOR[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                    {openId === o.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {openId === o.id && (
                  <div className="border-t border-border p-5 grid md:grid-cols-2 gap-6 bg-accent/10">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground mb-3">Informations cliente</h3>
                      <p className="text-sm font-medium">{o.customer_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{o.address}</p>
                      <p className="text-sm text-muted-foreground">{o.city}</p>
                      <div className="mt-4 flex gap-2 flex-wrap">
                        <a href={`tel:${cleanPhone(o.phone)}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium hover:opacity-90">
                          <Phone className="h-3.5 w-3.5" /> {o.phone}
                        </a>
                        <a href={`https://wa.me/${cleanPhone(o.whatsapp).replace(/^\+/, "")}`}
                          target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 text-white px-3 py-2 text-xs font-medium hover:opacity-90">
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      </div>
                      {o.notes && (
                        <p className="mt-3 text-xs text-muted-foreground bg-muted rounded-md p-2">
                          📝 {o.notes}
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-foreground mb-3">Articles commandés</h3>
                      <ul className="space-y-2">
                        {(orderItems[o.id] ?? []).map((i) => (
                          <li key={i.id} className="flex justify-between text-sm">
                            <span className="text-foreground">{i.product_name} <span className="text-muted-foreground">× {i.quantity}</span></span>
                            <span className="font-medium text-primary">{formatXOF(i.unit_price_xof * i.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-3 border-t border-border flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatXOF(o.total_xof)}</span>
                      </div>

                      <div className="mt-5">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">Changer le statut</p>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
                            <button key={s} onClick={() => updateStatus(o.id, s)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${o.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
                              {s === "confirmee" && <Check className="h-3 w-3 inline mr-1" />}
                              {s === "livree" && <Truck className="h-3 w-3 inline mr-1" />}
                              {s === "annulee" && <Ban className="h-3 w-3 inline mr-1" />}
                              {STATUS_LABEL[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== PRODUITS ===== */}
      {tab === "produits" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-muted-foreground">{products.length} produit(s)</p>
            <button onClick={openNewProduct}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition">
              <Plus className="h-4 w-4" /> Ajouter un produit
            </button>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="relative bg-card rounded-2xl border border-border shadow-elegant w-full max-w-2xl my-8">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="font-display text-xl">
                    {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
                  </h2>
                  <button onClick={() => setShowProductForm(false)} className="rounded-full p-2 hover:bg-accent">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Image Upload */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Photo du produit</p>
                    <div className="flex gap-4 items-start">
                      {productForm.image_url && (
                        <img src={productForm.image_url} alt="aperçu"
                          className="h-24 w-20 rounded-lg object-cover border border-border" />
                      )}
                      <div className="flex-1">
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition w-full justify-center">
                          <Upload className="h-4 w-4" />
                          {uploadingImage ? "Téléversement…" : "Choisir une photo"}
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                        <p className="text-xs text-muted-foreground mt-2">
                          Ou saisir l'URL directement :
                        </p>
                        <input type="url" value={productForm.image_url}
                          onChange={(e) => setProductForm((f) => ({ ...f, image_url: e.target.value }))}
                          placeholder="https://..."
                          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-1 block">Nom du produit *</label>
                      <input value={productForm.name}
                        onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-1 block">Prix (FCFA) *</label>
                      <input type="number" value={productForm.price_xof}
                        onChange={(e) => setProductForm((f) => ({ ...f, price_xof: e.target.value }))}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-1 block">Stock</label>
                      <input type="number" value={productForm.stock}
                        onChange={(e) => setProductForm((f) => ({ ...f, stock: e.target.value }))}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-1 block">Catégorie</label>
                      <select value={productForm.category_id}
                        onChange={(e) => setProductForm((f) => ({ ...f, category_id: e.target.value }))}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
                        <option value="">— Aucune catégorie —</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-1 block">Description</label>
                    <textarea value={productForm.description}
                      onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                      rows={4}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-1 block">Slug (URL)</label>
                    <input value={productForm.slug}
                      onChange={(e) => setProductForm((f) => ({ ...f, slug: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-mono text-xs" />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={productForm.featured}
                      onChange={(e) => setProductForm((f) => ({ ...f, featured: e.target.checked }))}
                      className="rounded border-border" />
                    <span className="text-sm font-medium">Mettre en vedette (coups de cœur)</span>
                  </label>
                </div>

                <div className="flex gap-3 p-6 border-t border-border">
                  <button onClick={() => setShowProductForm(false)}
                    className="flex-1 rounded-lg border border-border py-3 text-sm font-medium hover:bg-accent transition">
                    Annuler
                  </button>
                  <button onClick={saveProduct}
                    className="flex-1 rounded-lg bg-primary text-primary-foreground py-3 text-sm font-semibold hover:opacity-90 transition">
                    {editingProduct ? "Enregistrer les modifications" : "Ajouter le produit"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-soft">
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                      Pas d'image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base leading-tight text-foreground">{p.name}</h3>
                    {p.featured && (
                      <span className="shrink-0 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Vedette</span>
                    )}
                  </div>
                  <p className="text-primary font-bold mt-1">{formatXOF(p.price_xof)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {p.stock > 0 ? `${p.stock} en stock` : "Épuisé"}
                    </span>
                    {categories.find((c) => c.id === p.category_id) && (
                      <span className="text-xs text-muted-foreground">
                        {categories.find((c) => c.id === p.category_id)?.name}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openEditProduct(p)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium hover:bg-accent transition">
                      <Pencil className="h-3.5 w-3.5" /> Modifier
                    </button>
                    <button onClick={() => deleteProduct(p.id, p.name)}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Aucun produit. Cliquez sur "Ajouter un produit" pour commencer.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
