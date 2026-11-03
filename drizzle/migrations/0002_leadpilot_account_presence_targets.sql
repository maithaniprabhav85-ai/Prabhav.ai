ALTER TABLE public.interns ADD COLUMN is_online boolean NOT NULL DEFAULT false;
ALTER TABLE public.interns ADD COLUMN target_leads integer NOT NULL DEFAULT 25;

CREATE OR REPLACE FUNCTION public.set_intern_presence(_online boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.interns
  SET is_online = _online, last_activity_at = now(), updated_at = now()
  WHERE user_id = auth.uid() AND is_active = true;
END
$$;
REVOKE ALL ON FUNCTION public.set_intern_presence(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_intern_presence(boolean) TO authenticated;