import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar, QuickCreate } from "@/components/layout/TopBar";
import { AccessDenied } from "@/components/layout/AccessDenied";
import { useAuth, useAuthHydrated } from "@/store/auth-store";
import { canAccessRoute } from "@/lib/rbac";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const hydrated = useAuth((s) => s.hydrated);
  const session = useAuth((s) => s.session);
  const users = useAuth((s) => s.users);
  const touchSession = useAuth((s) => s.touchSession);
  const checkExpiry = useAuth((s) => s.checkExpiry);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const authed = !!session && session.expiresAt > Date.now();
  const currentUser = session ? users.find((u) => u.id === session.userId) ?? null : null;

  // Redirect unauthenticated users to /auth once hydrated.
  useEffect(() => {
    if (hydrated && !authed) {
      navigate({ to: "/auth" });
    }
  }, [hydrated, authed, navigate]);

  // Mock session timeout: refresh expiry on activity, poll for expiry.
  useEffect(() => {
    if (!authed) return;
    const onActivity = () => touchSession();
    window.addEventListener("click", onActivity);
    window.addEventListener("keydown", onActivity);
    const interval = setInterval(() => {
      if (checkExpiry()) {
        toast.warning("Session expired. Please sign in again.");
        navigate({ to: "/auth" });
      }
    }, 15000);
    return () => {
      window.removeEventListener("click", onActivity);
      window.removeEventListener("keydown", onActivity);
      clearInterval(interval);
    };
  }, [authed, touchSession, checkExpiry, navigate]);

  if (!hydrated || !authed || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allowed = canAccessRoute(pathname, currentUser.role);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar actions={<QuickCreate />} />
        <main className="flex-1 px-4 md:px-8 py-6 max-w-[1600px] w-full mx-auto">
          {allowed ? <Outlet /> : <AccessDenied />}
        </main>
      </div>
    </div>
  );
}
