ALTER TABLE public.leads ADD COLUMN legacy_id text;
CREATE UNIQUE INDEX leads_legacy_id_unique ON public.leads(legacy_id) WHERE legacy_id IS NOT NULL;
ALTER TABLE public.activities ADD COLUMN legacy_id text;
CREATE UNIQUE INDEX activities_legacy_id_unique ON public.activities(legacy_id) WHERE legacy_id IS NOT NULL;
ALTER TABLE public.follow_up_logs ADD COLUMN legacy_id text;
CREATE UNIQUE INDEX follow_up_logs_legacy_id_unique ON public.follow_up_logs(legacy_id) WHERE legacy_id IS NOT NULL;
ALTER TABLE public.work_sessions ADD COLUMN legacy_id text;
CREATE UNIQUE INDEX work_sessions_legacy_id_unique ON public.work_sessions(legacy_id) WHERE legacy_id IS NOT NULL;
CREATE POLICY "Signed-in users read workspace settings" ON public.workspace_settings FOR SELECT TO authenticated USING (true);