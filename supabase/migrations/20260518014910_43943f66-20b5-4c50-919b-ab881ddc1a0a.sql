CREATE OR REPLACE FUNCTION public.get_orders_by_phone(p_phone text)
RETURNS TABLE(order_number integer, status order_status, created_at timestamp with time zone, total_xof integer, city text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT o.order_number, o.status, o.created_at, o.total_xof, o.city
  FROM public.orders o
  WHERE regexp_replace(o.phone, '[^0-9]', '', 'g') = regexp_replace(p_phone, '[^0-9]', '', 'g')
     OR regexp_replace(o.whatsapp, '[^0-9]', '', 'g') = regexp_replace(p_phone, '[^0-9]', '', 'g')
  ORDER BY o.created_at DESC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.get_orders_by_phone(text) TO anon, authenticated;