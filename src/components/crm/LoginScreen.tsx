import { Eye, EyeOff, LogIn, ShieldCheck, Target, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import pixelLogoGlow from "@/assets/pixel-infinite-logo-glow.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrm } from "@/lib/crm/context";

const GOLD = "#d4af37";

const features = [
  { icon: TrendingUp, label: "Business Growth", hint: "Track pipeline momentum" },
  { icon: Target, label: "Lead Tracking", hint: "Never miss a follow-up" },
  { icon: Zap, label: "Automation", hint: "Faster daily workflows" },
  { icon: ShieldCheck, label: "Secure Access", hint: "Private by design" },
];

export function LoginScreen() {
  const { signIn } = useCrm();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const tabClass = (active: boolean) =>
    `w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 ${
      active
        ? "bg-gradient-to-r from-[#d4af37] to-[#b8963e] text-[#0a0f1e] shadow-[0_8px_24px_-8px_rgba(212,175,55,0.6)]"
        : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="relative isolate flex min-h-screen min-h-[100svh] overflow-hidden bg-[#0a0f1e] text-white">
      {/* Deep dark gradient background with soft vignette */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(155deg,#0a0f1e_0%,#0c1424_45%,#111827_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]" />
        {/* Soft champagne ambient glows */}
        <div className="absolute -top-40 left-1/4 size-[32rem] rounded-full bg-[#d4af37]/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-0 size-[28rem] rounded-full bg-[#d4af37]/[0.05] blur-[120px]" />
      </div>

      {/* Faint infinity logo glow behind the card */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <img
          src={pixelLogoGlow}
          alt=""
          className="w-[min(120vw,900px)] max-w-none opacity-[0.10] [filter:drop-shadow(0_0_60px_rgba(212,175,55,0.45))] lg:translate-x-[28%]"
        />
      </div>

      {/* Left branding */}
      <aside className="relative z-10 hidden w-[44%] flex-col justify-between px-12 py-14 lg:flex xl:px-20">
        <div>
          <img
            src={pixelLogoGlow}
            alt="Pixel Infinite AI"
            className="w-64 [filter:drop-shadow(0_0_28px_rgba(212,175,55,0.35))]"
          />
          <p className="mt-10 text-3xl font-semibold leading-snug text-slate-100 xl:text-4xl">
            Connect. <span style={{ color: GOLD }}>Automate.</span> Grow.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            The lead CRM tool built for focused teams — every lead, follow-up and intern in one calm workspace.
          </p>
        </div>
        <ul className="grid gap-5">
          {features.map(({ icon: Icon, label, hint }) => (
            <li key={label} className="flex items-center gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <Icon className="size-5" style={{ color: GOLD }} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-100">{label}</span>
                <span className="block text-xs text-slate-400">{hint}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Login card — same size/position as the old right-hand card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[480px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_40px_120px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div aria-hidden className="h-px w-full bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />
          <div className="p-7 sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-black uppercase leading-tight tracking-[0.16em] text-white sm:text-4xl">
                Pixel Infinite AI
              </h1>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: GOLD }}>
                Lead CRM Tool
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5">
              <button type="button" className={tabClass(mode === "admin")} aria-pressed={mode === "admin"} onClick={() => pickMode("admin")}>
                Admin
              </button>
              <button type="button" className={tabClass(mode === "intern")} aria-pressed={mode === "intern"} onClick={() => pickMode("intern")}>
                Intern
              </button>
            </div>

            <form onSubmit={submit} className="mt-8 grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="userId" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
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
                  className="h-14 rounded-xl border-white/10 bg-white/5 text-base text-white placeholder:text-slate-500 focus-visible:border-[#d4af37]/60 focus-visible:ring-[#d4af37]/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    maxLength={60}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-14 rounded-xl border-white/10 bg-white/5 pr-14 text-base text-white placeholder:text-slate-500 focus-visible:border-[#d4af37]/60 focus-visible:ring-[#d4af37]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-150 hover:text-[#d4af37]"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm font-medium text-red-300">{error}</p>}
              <Button
                type="submit"
                className="h-14 w-full rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e6cd7d] to-[#d4af37] text-base font-bold text-[#0a0f1e] shadow-[0_12px_32px_-10px_rgba(212,175,55,0.55)] transition-all duration-200 hover:brightness-110 active:scale-[0.99]"
              >
                <LogIn className="size-5" /> Sign in
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
