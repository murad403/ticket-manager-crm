import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — TicketManager CRM" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const resetPasswordMock = useAuth((s) => s.resetPasswordMock);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Enter your email address.");
    setLoading(true);
    setTimeout(() => {
      const res = resetPasswordMock(email);
      setLoading(false);
      if (res.ok) {
        setSent(true);
        toast.success("Reset link sent (mock).");
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

        {sent ? (
          <div className="text-center rounded-xl border border-border p-6">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-success/10">
              <MailCheck className="size-6 text-success" />
            </div>
            <h2 className="text-lg font-semibold">Check your inbox</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a password reset link to <span className="font-medium text-foreground">{email}</span> (mock).
            </p>
            <Button asChild className="w-full mt-6" >
              <Link to="/reset-password" search={{ email }}>Continue to reset (mock)</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full mt-2 gap-2">
              <Link to="/auth"><ArrowLeft className="size-4" /> Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold tracking-tight">Forgot your password?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@ticketmanager.local"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
            <Button asChild variant="ghost" className="w-full mt-2 gap-2">
              <Link to="/auth"><ArrowLeft className="size-4" /> Back to sign in</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
