import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const inviteCrmIntern = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string }) => z.object({ email: z.string().email().max(160) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isFounder, error: roleError } = await context.supabase.rpc("is_founder");
    if (roleError || !isFounder) throw new Error("Founder access is required to invite interns.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email.trim().toLowerCase());
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setCrmInternPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { internId: string; password: string }) => z.object({
    internId: z.string().uuid(),
    password: z.string().min(8).max(72),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isFounder, error: roleError } = await context.supabase.rpc("is_founder");
    if (roleError || !isFounder) throw new Error("Founder access is required to reset intern passwords.");
    const { data: intern, error: internError } = await context.supabase
      .from("interns")
      .select("user_id")
      .eq("id", data.internId)
      .maybeSingle();
    if (internError) throw new Error(internError.message);
    if (!intern?.user_id) throw new Error("This intern has not accepted the account invitation yet.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(intern.user_id, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });