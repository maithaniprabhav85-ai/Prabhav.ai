import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, Save, SwatchBook } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/lib/crm/context";
import { THEME_COLOR_FIELDS, THEME_PRESETS, type ThemeColors, type ThemePreset, themeCssProperties } from "@/lib/crm/ecosystem";

const validHex = /^#[0-9a-fA-F]{6}$/;

export function ThemeManagement() {
  const { isFounder, accountKey, ecosystem, chooseTheme, saveCustomTheme, setInternApprovedThemes, setPersonalThemeColors } = useCrm();
  const allThemes = useMemo(() => [...THEME_PRESETS, ...ecosystem.themes.customPresets], [ecosystem.themes.customPresets]);
  const selectedThemeId = ecosystem.themes.byAccount[accountKey] ?? "classic-light";
  const selectedTheme = allThemes.find((theme) => theme.id === selectedThemeId) ?? THEME_PRESETS[0];
  const [draft, setDraft] = useState<ThemeColors>(selectedTheme.colors);
  const [themeName, setThemeName] = useState("My custom theme");

  useEffect(() => setDraft(selectedTheme.colors), [selectedTheme.id]);

  const applyPreset = (id: string) => {
    chooseTheme(id);
    const preset = allThemes.find((theme) => theme.id === id);
    if (preset) setDraft(preset.colors);
  };

  const save = () => {
    if (THEME_COLOR_FIELDS.some(({ key }) => !validHex(draft[key]))) {
      toast.error("Enter a valid 6-digit HEX color for each field.");
      return;
    }
    if (!themeName.trim()) {
      toast.error("Enter a name for this theme.");
      return;
    }
    const preset: ThemePreset = { id: `custom-${Date.now()}`, name: themeName.trim(), colors: draft };
    saveCustomTheme(preset);
    toast.success("Theme saved and applied to your account.");
  };

  const applyPersonal = () => {
    if (THEME_COLOR_FIELDS.some(({ key }) => !validHex(draft[key]))) {
      toast.error("Enter a valid 6-digit HEX color for each field.");
      return;
    }
    setPersonalThemeColors(draft);
    toast.success("Personal appearance saved.");
  };

  const colorFields = isFounder
    ? THEME_COLOR_FIELDS
    : THEME_COLOR_FIELDS.filter(({ key }) => ["background", "cardBackground", "accent", "activeNavigation"].includes(key));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
      <section className="surface-card min-w-0 p-5 sm:p-6">
        <header className="mb-5 flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><SwatchBook className="size-5" /></span>
          <div><h2 className="text-base font-semibold text-navy">{isFounder ? "Theme management" : "Personal appearance"}</h2><p className="mt-1 text-sm text-muted-foreground">Saved separately for the signed-in browser account.</p></div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:col-span-2">Theme
            <Select value={selectedTheme.id} onValueChange={applyPreset}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{allThemes.filter((theme) => isFounder || ecosystem.themes.internApprovedThemeIds.includes(theme.id)).map((theme) => <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          {isFounder && <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:col-span-2">Saved theme name
            <Input value={themeName} maxLength={48} onChange={(event) => setThemeName(event.target.value)} />
          </label>}
          {colorFields.map(({ key, label }) => (
            <div key={key} className="grid min-w-0 gap-1.5">
              <Label htmlFor={`theme-${key}`} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
              <div className="flex min-w-0 gap-2">
                <Input aria-label={`${label} picker`} type="color" value={validHex(draft[key]) ? draft[key] : "#ffffff"} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} className="h-10 w-14 shrink-0 cursor-pointer p-1" />
                <Input id={`theme-${key}`} value={draft[key]} maxLength={7} aria-label={`${label} HEX`} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} className="min-w-0 font-mono uppercase" />
              </div>
            </div>
          ))}
        </div>

        {isFounder ? (
          <div className="mt-6 border-t pt-5">
            <h3 className="text-sm font-semibold text-navy">Intern-approved themes</h3>
            <p className="mb-3 mt-1 text-xs text-muted-foreground">Select the presets available in intern appearance settings.</p>
            <div className="flex flex-wrap gap-2">
              {allThemes.map((theme) => {
                const checked = ecosystem.themes.internApprovedThemeIds.includes(theme.id);
                return <Button key={theme.id} size="sm" variant={checked ? "default" : "outline"} aria-pressed={checked} onClick={() => setInternApprovedThemes(checked ? ecosystem.themes.internApprovedThemeIds.filter((id) => id !== theme.id) : [...ecosystem.themes.internApprovedThemeIds, theme.id])}>{checked && <Check className="size-4" />}{theme.name}</Button>;
              })}
            </div>
          </div>
        ) : <p className="mt-5 text-xs text-muted-foreground">Personal colors are stored separately for this browser account.</p>}

        <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">
          {isFounder && <Button onClick={save}><Save className="size-4" /> Save Theme</Button>}
          {!isFounder && <Button onClick={applyPersonal}><Save className="size-4" /> Save Personal Appearance</Button>}
          <Button variant="outline" onClick={() => { setDraft(THEME_PRESETS[0].colors); if (isFounder) applyPreset("classic-light"); else { chooseTheme("classic-light"); setPersonalThemeColors(null); } toast.success("Default theme restored for this account."); }}><RotateCcw className="size-4" /> Reset to Default</Button>
        </div>
      </section>

      <section className="min-w-0">
        <h2 className="mb-3 text-sm font-semibold text-navy">Live preview</h2>
        <div className="overflow-hidden rounded-xl border shadow-card" style={themeCssProperties(draft) as React.CSSProperties}>
          <div className="flex min-h-12 items-center justify-between px-4" style={{ backgroundColor: "var(--header-background)" }}><span className="text-sm font-semibold text-foreground">LeadPilot CRM</span><span className="text-xs text-muted-foreground">Appearance preview</span></div>
          <div className="grid gap-3 p-4" style={{ backgroundColor: "var(--background)" }}>
            <div className="rounded-lg border p-4" style={{ backgroundColor: "var(--card)" }}><h3 className="font-semibold text-navy">Your workspace</h3><p className="mt-1 text-sm text-foreground">Cards, controls, and text adapt to your selection.</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-md px-3 py-2 text-sm font-medium" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>Primary action</span><span className="rounded-md px-3 py-2 text-sm font-medium" style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}>Secondary</span></div></div>
            <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: "var(--sidebar)", color: "var(--sidebar-foreground)" }}>Navigation preview <span className="ml-2 rounded px-2 py-1" style={{ backgroundColor: "var(--sidebar-primary)", color: "var(--sidebar-primary-foreground)" }}>Active</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}