-- Retirer l'accès public en lecture sur orders
DROP POLICY IF EXISTS "Anyone can read own just-created order" ON public.orders;

-- Fonction sécurisée pour créer une commande + ses articles
CREATE OR REPLACE FUNCTION public.create_order(
  p_customer_name text,
  p_phone text,
  p_whatsapp text,
  p_address text,
  p_city text,
  p_notes text,
  p_total_xof integer,
  p_items jsonb
)
RETURNS TABLE (id uuid, order_number integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_order_number integer;
BEGIN
  INSERT INTO public.orders (customer_name, phone, whatsapp, address, city, notes, total_xof)
  VALUES (p_customer_name, p_phone, p_whatsapp, p_address, p_city, p_notes, p_total_xof)
  RETURNING orders.id, orders.order_number INTO v_order_id, v_order_number;

  INSERT INTO public.order_items (order_id, product_id, product_name, unit_price_xof, quantity)
  SELECT
    v_order_id,
    (item->>'product_id')::uuid,
    item->>'product_name',
    (item->>'unit_price_xof')::integer,
    (item->>'quantity')::integer
  FROM jsonb_array_elements(p_items) AS item;

  RETURN QUERY SELECT v_order_id, v_order_number;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order(text, text, text, text, text, text, integer, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(text, text, text, text, text, text, integer, jsonb) TO anon, authenticated;
