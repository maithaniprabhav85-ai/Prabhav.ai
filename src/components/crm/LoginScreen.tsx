import { LogIn, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import appBg from "@/assets/app-bg.jpg";
import appBg4 from "@/assets/app-bg-4.jpg";
import appBg5 from "@/assets/app-bg-5.jpg";
import crmBgMain from "@/assets/crm-bg-main.jpg.asset.json";
import crmBgAccent from "@/assets/crm-bg-accent.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrm } from "@/lib/crm/context";

export function LoginScreen() {
  const { signIn, settings } = useCrm();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"admin" | "intern">("admin");

  const pickMode = (next: "admin" | "intern") => {
    setMode(next);
    setError("");
    setUserId(next === "admin" ? settings.adminId : "Intern 1");
    setPassword("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      setError("Enter both your ID and password.");
      return;
    }
    if (signIn(userId, password)) {
      setError("");
      toast.success("Signed in");
    } else {
      setError("Wrong ID or password. Interns sign in with their assignment ID, e.g. Intern 1.");
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-10">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <img src={appBg} alt="" width={1920} height={1280} className="size-full object-cover" />
        <img src={appBg4} alt="" width={1920} height={1080} loading="lazy" className="absolute inset-0 size-full object-cover opacity-60 mix-blend-screen" />
        <img src={appBg5} alt="" width={1920} height={1080} loading="lazy" className="absolute bottom-0 left-0 h-2/3 w-full object-cover opacity-25 mix-blend-soft-light" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-accent/80 backdrop-blur-[2px]" />
      </div>

      <div className="surface-card w-full max-w-md p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-navy text-navy-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-navy">{settings.companyName}</h1>
            <p className="text-xs text-muted-foreground">Secure sign in — admin and interns</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          <Button
            type="button"
            variant={mode === "admin" ? "default" : "ghost"}
            className="w-full"
            aria-pressed={mode === "admin"}
            onClick={() => pickMode("admin")}
          >
            Admin
          </Button>
          <Button
            type="button"
            variant={mode === "intern" ? "default" : "ghost"}
            className="w-full"
            aria-pressed={mode === "intern"}
            onClick={() => pickMode("intern")}
          >
            Intern
          </Button>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="userId" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              User ID
            </Label>
            <Input
              id="userId"
              maxLength={60}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={mode === "admin" ? "admin" : "Intern 1"}
              autoComplete="username"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              maxLength={60}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            <LogIn className="size-4" /> Sign in
          </Button>
        </form>

        <div className="mt-5 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
          <p className="font-semibold text-navy">Demo logins</p>
          <p className="mt-1">Admin — ID <strong>admin</strong>, password <strong>admin123</strong></p>
          <p>Intern — ID <strong>Intern 1</strong>, password <strong>intern1</strong> (Intern 2 → intern2, …)</p>
          <p className="mt-1">Interns only see their own leads, follow-ups and activity.</p>
        </div>
      </div>
    </div>
  );
}
