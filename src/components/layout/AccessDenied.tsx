import { Link } from "@tanstack/react-router";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldX className="size-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have permission to view this page. If you believe this is a
          mistake, contact your workspace owner.
        </p>
        <div className="mt-6">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/dashboard">
              <ArrowLeft className="size-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
