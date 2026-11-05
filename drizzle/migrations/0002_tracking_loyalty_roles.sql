ALTER TABLE public.store_settings ADD COLUMN loyalty_enabled boolean NOT NULL DEFAULT false, ADD COLUMN points_per_real numeric NOT NULL DEFAULT 1, ADD COLUMN reward_points integer NOT NULL DEFAULT 100, ADD COLUMN reward_value numeric NOT NULL DEFAULT 10;
ALTER TABLE public.orders ADD COLUMN points_earned integer NOT NULL DEFAULT 0, ADD COLUMN points_redeemed integer NOT NULL DEFAULT 0, ADD COLUMN status_updated_at timestamptz NOT NULL DEFAULT now();
CREATE TABLE public.loyalty_accounts (phone text PRIMARY KEY, points integer NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.loyalty_accounts TO authenticated;
GRANT ALL ON public.loyalty_accounts TO service_role;
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_loyalty ON public.loyalty_accounts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY staff_orders_read ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'staff'));
CREATE OR REPLACE FUNCTION public.set_order_status(_id uuid, _status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _status NOT IN ('recebido','preparando','pronto','em rota','entregue','cancelado') THEN RAISE EXCEPTION 'invalid status'; END IF;
  UPDATE public.orders SET status=_status, status_updated_at=now() WHERE id=_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.set_order_status(uuid,text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.set_order_status(uuid,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.track_order(_id uuid) RETURNS TABLE(number bigint, status text, delivery_method text, total numeric, created_at timestamptz, status_updated_at timestamptz, items jsonb) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT number, status, delivery_method, total, created_at, status_updated_at, items FROM public.orders WHERE id=_id
$$;
GRANT EXECUTE ON FUNCTION public.track_order(uuid) TO anon, authenticated;
CREATE OR REPLACE FUNCTION public.grant_first_director() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role='admin') THEN INSERT INTO public.user_roles(user_id,role) VALUES (NEW.id,'admin'); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_profile_first_director AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.grant_first_director();