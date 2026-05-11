CREATE OR REPLACE FUNCTION public.get_order_status(p_order_number integer)
RETURNS TABLE(order_number integer, status order_status, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.order_number, o.status, o.created_at
  FROM public.orders o
  WHERE o.order_number = p_order_number
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_status(integer) TO anon, authenticated;