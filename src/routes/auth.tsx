import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth, useAuthHydrated } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, Eye, EyeOff, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — TicketManager CRM" },
      { name: "description", content: "Sign in to your TicketManager CRM workspace." },
    ],
  }),
  component: AuthPage,
});

const DEMOS = [
  { role: "Owner", email: "owner@ticketmanager.local", password: "Owner@123", icon: ShieldCheck, desc: "Full access to every module" },
  { role: "Staff", email: "staff@ticketmanager.local", password: "Staff@123", icon: User, desc: "Sales & operations only" },
];

function AuthPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const hydrated = useAuthHydrated();
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && isAuthenticated()) navigate({ to: "/dashboard" });
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password, remember);
      setLoading(false);
      if (res.ok) {
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      } else {
        toast.error(res.error ?? "Login failed.");
      }
    }, 700);
  };

  const fillDemo = (d: (typeof DEMOS)[number]) => {
    setEmail(d.email);
    setPassword(d.password);
    toast.info(`${d.role} credentials filled — click Sign in.`);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-foreground/[0.03] to-transparent border-r border-border">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-md bg-gradient-to-br from-foreground to-muted-foreground flex items-center justify-center">
            <Sparkles className="size-4.5 text-background" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">TicketManager</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">CRM · v1.0</span>
          </div>
        </div>
        <div className="max-w-sm">
          <h1 className="text-3xl font-semibold tracking-tight leading-tight">
            The operating system for ticket brokerage.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Manage inventory, orders, customers, delivery and finance — all in one
            premium workspace built for speed.
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          © 2026 TicketManager. Local demo — no data leaves your browser.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="size-8 rounded-md bg-gradient-to-br from-foreground to-muted-foreground flex items-center justify-center">
              <Sparkles className="size-4 text-background" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight">TicketManager CRM</span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight">Sign in to your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to continue.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@ticketmanager.local"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-[12px] text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input id="password" type={show ? "text" : "password"} autoComplete="current-password"
                  placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShow((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-[13px] cursor-pointer select-none">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
              Remember me
            </label>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Demo accounts</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="mt-3 grid gap-2">
              {DEMOS.map((d) => {
                const Icon = d.icon;
                return (
                  <button key={d.role} onClick={() => fillDemo(d)} type="button"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-accent transition-colors">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium">{d.role}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{d.desc}</div>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Use →</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
