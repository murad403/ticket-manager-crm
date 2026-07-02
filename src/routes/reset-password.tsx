import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "@/components/layout/PasswordStrength";
import { isPasswordValid } from "@/lib/rbac";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — TicketManager CRM" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ email: typeof s.email === "string" ? s.email : "" }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { email } = Route.useSearch();
  const setNewPasswordMock = useAuth((s) => s.setNewPasswordMock);

  const [emailField, setEmailField] = useState(email);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailField) return toast.error("Enter your email address.");
    if (!isPasswordValid(pw)) return toast.error("Password does not meet the requirements.");
    if (pw !== confirm) return toast.error("Passwords do not match.");
    setLoading(true);
    setTimeout(() => {
      const res = setNewPasswordMock(emailField, pw);
      setLoading(false);
      if (res.ok) {
        toast.success("Password reset. Please sign in.");
        navigate({ to: "/auth" });
      } else {
        toast.error(res.error ?? "Something went wrong.");
      }
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="size-8 rounded-md bg-gradient-to-br from-foreground to-muted-foreground flex items-center justify-center">
            <Sparkles className="size-4 text-background" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight">TicketManager CRM</span>
        </div>

        <h2 className="text-xl font-semibold tracking-tight">Set a new password</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a strong password for your account.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@ticketmanager.local"
              value={emailField} onChange={(e) => setEmailField(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">New password</Label>
            <Input id="pw" type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} />
            <div className="pt-1"><PasswordStrength password={pw} /></div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {confirm && pw !== confirm && <p className="text-[11px] text-destructive">Passwords do not match.</p>}
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Saving…" : "Reset password"}
          </Button>
        </form>
        <Button asChild variant="ghost" className="w-full mt-2 gap-2">
          <Link to="/auth"><ArrowLeft className="size-4" /> Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
