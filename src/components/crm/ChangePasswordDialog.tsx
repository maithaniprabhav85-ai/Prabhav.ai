import { useState, type ReactNode } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/lib/crm/context";

export function ChangePasswordDialog({ trigger }: { trigger?: ReactNode }) {
  const { isFounder, currentIntern, interns, changePassword, setInternPassword } = useCrm();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("self");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const forOther = isFounder && target !== "self";

  function reset() {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setError("The two new passwords do not match.");
      return;
    }
    const res = forOther ? setInternPassword(target, next) : changePassword(current, next);
    if (!res.ok) {
      setError(res.error ?? "Could not update the password.");
      return;
    }
    toast.success(forOther ? "Intern password updated" : "Password updated");
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <KeyRound className="size-4" /> Change password
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            {isFounder
              ? "Update the admin password, or set a new password for any intern."
              : `Update the sign-in password for ${currentIntern ? currentIntern.code : "your account"}.`}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={submit}>
          {isFounder && (
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</Label>
              <Select
                value={target}
                onValueChange={(v) => {
                  setTarget(v);
                  setError("");
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Admin (my account)</SelectItem>
                  {interns.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.code} — {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!forOther && (
            <div className="grid gap-1.5">
              <Label htmlFor="cp-current" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current password
              </Label>
              <Input
                id="cp-current"
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="cp-new" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              New password
            </Label>
            <Input
              id="cp-new"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cp-confirm" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Confirm new password
            </Label>
            <Input
              id="cp-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update password</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
