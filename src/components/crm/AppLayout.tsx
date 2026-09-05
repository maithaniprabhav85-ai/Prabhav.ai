import { Link, useRouterState, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import appBg from "@/assets/app-bg.jpg";
import appBg2 from "@/assets/app-bg-2.jpg";
import appBg3 from "@/assets/app-bg-3.jpg";
import appBg4 from "@/assets/app-bg-4.jpg";
import appBg5 from "@/assets/app-bg-5.jpg";
import {
  Activity as ActivityIcon,
  Bell,
  CalendarClock,
  KeyRound,
  LayoutDashboard,

  LogOut,
  Menu,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/crm/ChangePasswordDialog";

import { useCrm } from "@/lib/crm/context";
import { cn } from "@/lib/utils";

type NavItem = { to: NonNullable<LinkProps["to"]>; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { to: "/activities", label: "Activities", icon: ActivityIcon },
  { to: "/interns", label: "Intern Profiles", icon: UsersRound },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { settings, unreadCount, isFounder } = useCrm();
  const items: NavItem[] = [...NAV];
  if (isFounder) {
    items.splice(6, 0, { to: "/admin", label: "Admin Panel", icon: ShieldCheck });
  }

  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.to === "/notifications" && unreadCount > 0 && (
              <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountChip() {
  const { settings, isFounder, currentIntern, signOut } = useCrm();
  return (
    <div className="mx-3 mt-4 rounded-xl bg-sidebar-accent/60 p-3">
      <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
        {isFounder ? settings.adminId : currentIntern ? `${currentIntern.code} — ${currentIntern.name}` : "Guest"}
      </p>
      <p className="text-xs text-sidebar-foreground/60">{isFounder ? "Admin access" : "Intern access"}</p>
      <ChangePasswordDialog
        trigger={
          <Button variant="secondary" size="sm" className="mt-2 w-full">
            <KeyRound className="size-4" /> Change password
          </Button>
        }
      />
      <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={signOut}>
        <LogOut className="size-4" /> Sign out
      </Button>

    </div>
  );
}

function Brand() {
  const { settings } = useCrm();
  return (
    <div className="flex items-center gap-3 px-6 py-5">
      <div className="grid size-9 place-items-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
        IL
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">{settings.companyName}</p>
        <p className="text-xs text-sidebar-foreground/60">{settings.role} workspace</p>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background lg:flex">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <img src={appBg} alt="" width={1920} height={1280} loading="lazy" className="absolute inset-0 size-full object-cover" />
        <img
          src={appBg2}
          alt=""
          width={1920}
          height={1280}
          loading="lazy"
          className="absolute -right-1/4 top-0 h-full w-3/4 object-cover opacity-40 mix-blend-screen"
        />
        <img
          src={appBg3}
          alt=""
          width={1920}
          height={1280}
          loading="lazy"
          className="absolute inset-0 size-full object-cover opacity-70 mix-blend-soft-light"
        />
        <img
          src={appBg4}
          alt=""
          width={1920}
          height={1080}
          loading="lazy"
          className="absolute inset-0 size-full object-cover opacity-45 mix-blend-screen"
        />
        <img
          src={appBg5}
          alt=""
          width={1920}
          height={1080}
          loading="lazy"
          className="absolute bottom-0 left-0 h-2/3 w-full object-cover opacity-25 mix-blend-soft-light"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-accent/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent),radial-gradient(50%_40%_at_0%_100%,color-mix(in_oklab,var(--color-chart-2)_10%,transparent),transparent)]" />
      </div>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar lg:flex">
        <Brand />
        <AccountChip />
        <NavList />
        <div className="mt-auto px-6 py-5 text-xs text-sidebar-foreground/50">MVP demo · local data</div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-card px-4 py-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open navigation">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-0 bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Brand />
            <AccountChip />
            <NavList onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="text-sm font-semibold text-foreground">InternLead CRM</span>
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
