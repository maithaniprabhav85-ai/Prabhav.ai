CREATE TYPE public.app_role AS ENUM ('founder', 'intern');

CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.interns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  department text NOT NULL DEFAULT 'Sales',
  designation text NOT NULL DEFAULT 'Sales Intern',
  email text NOT NULL UNIQUE,
  phone text NOT NULL DEFAULT '',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  working_hours numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  permissions jsonb NOT NULL DEFAULT '{"leads.view":true,"leads.edit":true,"leads.assign":false,"notes.edit":true,"followups.manage":true,"contacts.log":true,"work_sessions.manage":true,"history.view":true}'::jsonb,
  last_activity_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interns TO authenticated;
GRANT ALL ON public.interns TO service_role;
ALTER TABLE public.interns ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  archived boolean NOT NULL DEFAULT false,
  company text NOT NULL,
  contact_person text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'New',
  priority text NOT NULL DEFAULT 'Warm',
  intern_id uuid REFERENCES public.interns(id) ON DELETE SET NULL,
  next_follow_up date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  intern_id uuid,
  actor_id uuid,
  type text NOT NULL,
  message text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.follow_up_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  intern_id uuid,
  completed_at timestamptz NOT NULL DEFAULT now(),
  scheduled_for date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_up_logs TO authenticated;
GRANT ALL ON public.follow_up_logs TO service_role;
ALTER TABLE public.follow_up_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.work_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_sessions TO authenticated;
GRANT ALL ON public.work_sessions TO service_role;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workspace_settings (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  company_name text NOT NULL DEFAULT 'LeadPilot CRM',
  default_follow_up_days integer NOT NULL DEFAULT 3,
  compact_table boolean NOT NULL DEFAULT false,
  notify_overdue boolean NOT NULL DEFAULT true,
  notify_upcoming boolean NOT NULL DEFAULT true,
  default_target_leads integer NOT NULL DEFAULT 20,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.workspace_settings TO authenticated;
GRANT ALL ON public.workspace_settings TO service_role;
ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;

CREATE INDEX leads_intern_id_idx ON public.leads(intern_id);
CREATE INDEX leads_next_follow_up_idx ON public.leads(next_follow_up);
CREATE INDEX activities_intern_created_idx ON public.activities(intern_id, created_at DESC);
CREATE INDEX activities_lead_created_idx ON public.activities(lead_id, created_at DESC);
CREATE INDEX follow_up_logs_intern_completed_idx ON public.follow_up_logs(intern_id, completed_at DESC);
CREATE INDEX work_sessions_intern_started_idx ON public.work_sessions(intern_id, started_at DESC);

CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'founder'::public.app_role)
$$;
CREATE OR REPLACE FUNCTION public.owns_intern(_intern_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _intern_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.interns WHERE id = _intern_id AND user_id = auth.uid() AND is_active = true)
$$;
CREATE OR REPLACE FUNCTION public.has_crm_permission(_permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_founder() OR EXISTS (
    SELECT 1 FROM public.interns i
    WHERE i.user_id = auth.uid() AND i.is_active = true AND i.permissions -> _permission = 'true'::jsonb
  )
$$;
REVOKE ALL ON FUNCTION public.is_founder() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owns_intern(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_crm_permission(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_founder() TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_intern(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_crm_permission(text) TO authenticated;

CREATE POLICY "Users read own profile or founder reads all" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_founder());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users read own roles or founder reads all" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_founder());
CREATE POLICY "Founder manages intern roster; intern reads own row" ON public.interns FOR SELECT TO authenticated USING (public.is_founder() OR user_id = auth.uid());
CREATE POLICY "Founder inserts intern roster" ON public.interns FOR INSERT TO authenticated WITH CHECK (public.is_founder());
CREATE POLICY "Founder updates intern roster" ON public.interns FOR UPDATE TO authenticated USING (public.is_founder()) WITH CHECK (public.is_founder());
CREATE POLICY "Founder removes intern roster rows" ON public.interns FOR DELETE TO authenticated USING (public.is_founder());
CREATE POLICY "Founder reads all leads and interns read assigned leads" ON public.leads FOR SELECT TO authenticated USING (public.is_founder() OR (public.has_crm_permission('leads.view') AND public.owns_intern(intern_id)));
CREATE POLICY "Founder and permitted owner create leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (public.is_founder() OR (public.has_crm_permission('leads.edit') AND public.owns_intern(intern_id)));
CREATE POLICY "Founder and permitted owner update leads" ON public.leads FOR UPDATE TO authenticated USING (public.is_founder() OR (public.has_crm_permission('leads.edit') AND public.owns_intern(intern_id))) WITH CHECK (public.is_founder() OR (public.has_crm_permission('leads.edit') AND public.owns_intern(intern_id)));
CREATE POLICY "Founder only deletes leads" ON public.leads FOR DELETE TO authenticated USING (public.is_founder());
CREATE POLICY "Founder reads all activities and interns read own history" ON public.activities FOR SELECT TO authenticated USING (public.is_founder() OR actor_id = auth.uid() OR public.owns_intern(intern_id));
CREATE POLICY "Users log activity only on their own leads" ON public.activities FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid() AND (public.is_founder() OR (public.owns_intern(intern_id) AND (lead_id IS NULL OR EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id AND (l.intern_id IS NULL OR public.owns_intern(l.intern_id)))))));
CREATE POLICY "Founder controls activity records" ON public.activities FOR UPDATE TO authenticated USING (public.is_founder()) WITH CHECK (public.is_founder());
CREATE POLICY "Founder removes activity records" ON public.activities FOR DELETE TO authenticated USING (public.is_founder());
CREATE POLICY "Founder reads all follow-up history and interns read assigned history" ON public.follow_up_logs FOR SELECT TO authenticated USING (public.is_founder() OR public.owns_intern(intern_id));
CREATE POLICY "Founder and permitted owner add follow-up history" ON public.follow_up_logs FOR INSERT TO authenticated WITH CHECK (public.is_founder() OR (public.has_crm_permission('followups.manage') AND public.owns_intern(intern_id) AND EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id AND public.owns_intern(l.intern_id))));
CREATE POLICY "Founder and permitted owner update follow-up history" ON public.follow_up_logs FOR UPDATE TO authenticated USING (public.is_founder() OR (public.has_crm_permission('followups.manage') AND public.owns_intern(intern_id))) WITH CHECK (public.is_founder() OR (public.has_crm_permission('followups.manage') AND public.owns_intern(intern_id) AND EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id AND public.owns_intern(l.intern_id))));
CREATE POLICY "Founder removes follow-up history" ON public.follow_up_logs FOR DELETE TO authenticated USING (public.is_founder());
CREATE POLICY "Founder reads all work sessions and interns read own" ON public.work_sessions FOR SELECT TO authenticated USING (public.is_founder() OR public.owns_intern(intern_id));
CREATE POLICY "Founder and permitted owner start work sessions" ON public.work_sessions FOR INSERT TO authenticated WITH CHECK (public.is_founder() OR (public.has_crm_permission('work_sessions.manage') AND public.owns_intern(intern_id)));
CREATE POLICY "Founder and permitted owner update work sessions" ON public.work_sessions FOR UPDATE TO authenticated USING (public.is_founder() OR (public.has_crm_permission('work_sessions.manage') AND public.owns_intern(intern_id))) WITH CHECK (public.is_founder() OR (public.has_crm_permission('work_sessions.manage') AND public.owns_intern(intern_id)));
CREATE POLICY "Founder removes work sessions" ON public.work_sessions FOR DELETE TO authenticated USING (public.is_founder());
CREATE POLICY "Founder manages workspace settings" ON public.workspace_settings FOR ALL TO authenticated USING (public.is_founder()) WITH CHECK (public.is_founder());

CREATE OR REPLACE FUNCTION public.create_crm_profile_for_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text := lower(coalesce(new.email, ''));
  _intern_id uuid;
BEGIN
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
REVOKE ALL ON FUNCTION public.create_crm_profile_for_auth_user() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created_crm_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_crm_profile_for_auth_user();

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
  IF _intern IS NOT NULL THEN UPDATE public.interns SET last_activity_at = now() WHERE id = _intern; END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END
$$;
REVOKE ALL ON FUNCTION public.audit_crm_change() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER audit_leads_change AFTER INSERT OR UPDATE OR DELETE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.audit_crm_change();
CREATE TRIGGER audit_interns_change AFTER INSERT OR UPDATE OR DELETE ON public.interns FOR EACH ROW EXECUTE FUNCTION public.audit_crm_change();
CREATE TRIGGER audit_followups_change AFTER INSERT OR UPDATE OR DELETE ON public.follow_up_logs FOR EACH ROW EXECUTE FUNCTION public.audit_crm_change();
CREATE TRIGGER audit_work_sessions_change AFTER INSERT OR UPDATE OR DELETE ON public.work_sessions FOR EACH ROW EXECUTE FUNCTION public.audit_crm_change();

ALTER PUBLICATION supabase_realtime ADD TABLE public.interns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follow_up_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_settings;