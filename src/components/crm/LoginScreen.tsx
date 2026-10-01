import { LogIn, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import pixelLogoGlow from "@/assets/pixel-infinite-logo-glow.png";
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
      setError("Enter both your email and password.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+$/.test(userId.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (signIn(userId, password)) {
      setError("");
      toast.success("Signed in");
    } else {
      setError("Wrong email or password.");
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-10">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-navy via-[#0d2540] to-primary/60">
        <img
          src={pixelLogoGlow}
          alt=""
          className="absolute left-1/2 top-1/2 w-[150vmin] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-90 [filter:drop-shadow(0_0_40px_rgba(59,130,246,0.9))_drop-shadow(0_0_120px_rgba(147,197,253,0.6))]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(11,31,51,0.55)_100%)]" />
      </div>

      <div className="surface-card w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black uppercase leading-tight tracking-[0.18em] text-navy sm:text-3xl">
            Pixel Infinite AI
          </h1>
          <span className="mx-auto mt-3 block h-px w-16 bg-primary/40" />
        </div>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-navy text-navy-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="text-base font-bold text-navy">{settings.companyName}</p>
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
              Email address
            </Label>
            <Input
              id="userId"
              type="text"
              maxLength={80}
              placeholder={mode === "admin" ? "admin@company.com" : "you@company.com"}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoComplete="email"
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
