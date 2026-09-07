import { LogIn, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import crmHero from "@/assets/crm-hero.jpg.asset.json";
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
    setUserId("");
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
      setError("Wrong ID or password.");
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-10">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <img src={crmHero.url} alt="" width={1920} height={720} className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/85 via-navy/70 to-primary/40" />
      </div>

      <div className="surface-card w-full max-w-md p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-navy text-navy-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-navy">{settings.companyName}</h1>
            <p className="text-xs text-muted-foreground">Sign in</p>
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

      </div>
    </div>
  );
}
