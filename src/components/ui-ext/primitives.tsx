import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  hint?: string;
  icon?: React.ReactNode;
  accent?: "default" | "success" | "warning" | "info";
}

export function StatCard({ label, value, delta, hint, icon, accent = "default" }: StatCardProps) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-border bg-card p-4 hover:border-foreground/20 transition-colors group">
      <div className="flex items-start justify-between">
        <div className="text-[12px] text-muted-foreground font-medium">{label}</div>
        {icon && (
          <div className={cn(
            "size-7 rounded-md flex items-center justify-center border border-border",
            accent === "success" && "text-success bg-success/10 border-success/20",
            accent === "warning" && "text-warning bg-warning/10 border-warning/20",
            accent === "info" && "text-info bg-info/10 border-info/20",
            accent === "default" && "text-foreground bg-muted",
          )}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 text-[26px] font-semibold tracking-tight num">{value}</div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px]">
        {delta !== undefined && (
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-medium",
            up ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
          )}>
            {up ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
            {up ? "+" : ""}{delta}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

export function Section({ title, description, actions, children, className }: {
  title?: string; description?: string; actions?: React.ReactNode;
  children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            {title && <div className="text-[13px] font-semibold">{title}</div>}
            {description && <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div className="size-12 rounded-xl border border-border bg-muted flex items-center justify-center text-muted-foreground mb-4">
          {icon}
        </div>
      )}
      <div className="text-[14px] font-semibold">{title}</div>
      {description && <div className="text-[12px] text-muted-foreground mt-1 max-w-xs">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    available: "bg-info/10 text-info border-info/20",
    reserved: "bg-warning/10 text-warning border-warning/20",
    sold: "bg-success/10 text-success border-success/20",
    delivered: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    confirmed: "bg-success/10 text-success border-success/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    refunded: "bg-muted text-muted-foreground border-border",
    paid: "bg-success/10 text-success border-success/20",
    unpaid: "bg-destructive/10 text-destructive border-destructive/20",
    partial: "bg-warning/10 text-warning border-warning/20",
    due: "bg-warning/10 text-warning border-warning/20",
    overdue: "bg-destructive/10 text-destructive border-destructive/20",
    revoked: "bg-destructive/10 text-destructive border-destructive/20",
    upcoming: "bg-info/10 text-info border-info/20",
    "on-sale": "bg-success/10 text-success border-success/20",
    "sold-out": "bg-destructive/10 text-destructive border-destructive/20",
    past: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium capitalize",
      map[s] || "bg-muted text-muted-foreground border-border",
    )}>
      <span className="size-1 rounded-full bg-current" />
      {status.replace("-", " ")}
    </span>
  );
}
