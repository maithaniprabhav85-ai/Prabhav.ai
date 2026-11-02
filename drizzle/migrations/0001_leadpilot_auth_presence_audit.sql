CREATE OR REPLACE FUNCTION public.create_crm_profile_for_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text := lower(coalesce(new.email, ''));
  _intern_id uuid;
BEGIN
  IF new.email_confirmed_at IS NULL THEN
    RETURN new;
  END IF;

  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (new.id, _email, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(_email, '@', 1)))
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, updated_at = now();
  IF _email = 'admin@pixelinfinite.ai' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'founder'::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    UPDATE public.interns SET user_id = new.id, updated_at = now()
    WHERE lower(email) = _email AND user_id IS NULL AND is_active = true
    RETURNING id INTO _intern_id;
    IF _intern_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'intern'::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
  RETURN new;
END
$$;
DROP TRIGGER on_auth_user_created_crm_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_crm_profile AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_crm_profile_for_auth_user();

CREATE OR REPLACE FUNCTION public.touch_intern_presence()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.interns SET last_activity_at = now(), updated_at = now()
  WHERE user_id = auth.uid() AND is_active = true
$$;
REVOKE ALL ON FUNCTION public.touch_intern_presence() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.touch_intern_presence() TO authenticated;

CREATE OR REPLACE FUNCTION public.audit_crm_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _row jsonb;
  _old jsonb;
  _lead uuid;
  _intern uuid;
  _type text;
  _message text;
BEGIN
  _row := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
  _old := CASE WHEN TG_OP = 'INSERT' THEN '{}'::jsonb ELSE to_jsonb(OLD) END;
  IF TG_TABLE_NAME = 'leads' THEN _lead := (_row ->> 'id')::uuid; ELSE _lead := nullif(_row ->> 'lead_id', '')::uuid; END IF;
  IF TG_TABLE_NAME = 'interns' THEN _intern := (_row ->> 'id')::uuid; ELSE _intern := nullif(_row ->> 'intern_id', '')::uuid; END IF;
  _type := lower(TG_TABLE_NAME) || '_' || lower(TG_OP);
  _message := CASE
    WHEN TG_TABLE_NAME = 'leads' AND TG_OP = 'INSERT' THEN 'Lead created: ' || coalesce(_row ->> 'company', '')
    WHEN TG_TABLE_NAME = 'leads' AND TG_OP = 'DELETE' THEN 'Lead deleted: ' || coalesce(_row ->> 'company', '')
    WHEN TG_TABLE_NAME = 'leads' AND (_old ->> 'status') IS DISTINCT FROM (_row ->> 'status') THEN 'Lead status changed: ' || coalesce(_row ->> 'company', '') || ' — ' || coalesce(_old ->> 'status', '') || ' → ' || coalesce(_row ->> 'status', '')
    WHEN TG_TABLE_NAME = 'leads' AND (_old ->> 'intern_id') IS DISTINCT FROM (_row ->> 'intern_id') THEN 'Lead assignment changed: ' || coalesce(_row ->> 'company', '')
    WHEN TG_TABLE_NAME = 'leads' AND (_old ->> 'notes') IS DISTINCT FROM (_row ->> 'notes') THEN 'Lead notes updated: ' || coalesce(_row ->> 'company', '')
    WHEN TG_TABLE_NAME = 'leads' AND (_old ->> 'archived') IS DISTINCT FROM (_row ->> 'archived') THEN 'Lead archive state changed: ' || coalesce(_row ->> 'company', '')
    WHEN TG_TABLE_NAME = 'interns' AND TG_OP = 'UPDATE' AND (_old -> 'permissions') IS DISTINCT FROM (_row -> 'permissions') THEN 'Intern permissions updated: ' || coalesce(_row ->> 'code', '')
    WHEN TG_TABLE_NAME = 'interns' AND TG_OP = 'UPDATE' AND (_old ->> 'is_active') IS DISTINCT FROM (_row ->> 'is_active') THEN 'Intern account status changed: ' || coalesce(_row ->> 'code', '')
    ELSE initcap(replace(TG_TABLE_NAME, '_', ' ')) || ' ' || lower(TG_OP)
  END;
  INSERT INTO public.activities (lead_id, intern_id, actor_id, type, message, details)
  VALUES (_lead, _intern, auth.uid(), _type, _message, jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP, 'before', _old, 'after', _row));
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END
$$;
DROP TRIGGER audit_interns_change ON public.interns;
CREATE TRIGGER audit_interns_change AFTER INSERT OR UPDATE OF code, name, department, designation, email, phone, start_date, working_hours, is_active, permissions OR DELETE ON public.interns FOR EACH ROW EXECUTE FUNCTION public.audit_crm_change();