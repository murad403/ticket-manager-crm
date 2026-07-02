import { checkPassword, passwordScore } from "@/lib/rbac";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const RULES: { key: keyof ReturnType<typeof checkPassword>; label: string }[] = [
  { key: "length", label: "At least 8 characters" },
  { key: "upper", label: "One uppercase letter" },
  { key: "lower", label: "One lowercase letter" },
  { key: "number", label: "One number" },
  { key: "special", label: "One special character" },
];

const LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
const COLORS = [
  "bg-muted", "bg-destructive", "bg-warning", "bg-warning", "bg-info", "bg-success",
];

export function PasswordStrength({ password }: { password: string }) {
  const checks = checkPassword(password);
  const score = passwordScore(password);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-full transition-colors",
                i < score ? COLORS[score] : "bg-muted"
              )}
            />
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground w-16 text-right">
          {password ? LABELS[score] : ""}
        </span>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {RULES.map((r) => {
          const ok = checks[r.key];
          return (
            <li key={r.key} className={cn("flex items-center gap-1.5 text-[11px]", ok ? "text-success" : "text-muted-foreground")}>
              {ok ? <Check className="size-3" /> : <X className="size-3" />}
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
