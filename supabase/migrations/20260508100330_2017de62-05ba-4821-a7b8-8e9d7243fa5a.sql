-- Garantir que les visiteurs anonymes peuvent créer des commandes
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT INSERT ON public.order_items TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE orders_order_number_seq TO anon, authenticated;

-- Recréer les politiques pour cibler explicitement anon + authenticated
DROP POLICY IF EXISTS "Public create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Public create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permettre à l'insertion de retourner l'id et order_number nouvellement créés
DROP POLICY IF EXISTS "Anyone can read own just-created order" ON public.orders;
CREATE POLICY "Anyone can read own just-created order"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);
