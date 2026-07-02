import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Section } from "@/components/ui-ext/primitives";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Ticket, User, Briefcase, Calendar, Truck, DollarSign, Cog } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ActivityType } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/activity")({ component: ActivityPage });

const iconMap: Record<ActivityType, any> = {
  order: ShoppingCart, ticket: Ticket, customer: User, broker: Briefcase,
  event: Calendar, delivery: Truck, payment: DollarSign, system: Cog,
};

function ActivityPage() {
  const activities = useCRM(s => s.activities);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = activities.filter(a =>
    (!q || a.title.toLowerCase().includes(q.toLowerCase()) || a.description.toLowerCase().includes(q.toLowerCase())) &&
    (typeFilter === "all" || a.type === typeFilter)
  );

  return (
    <div>
      <PageHeader title="Activity" description="A live feed of everything happening across your CRM" />
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activity…" className="pl-8 h-8" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[160px] text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity</SelectItem>
            {Object.keys(iconMap).map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Section>
        <ul className="relative divide-y divide-border">
          {filtered.slice(0, 60).map(a => {
            const Icon = iconMap[a.type];
            return (
              <li key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-accent/40">
                <div className="size-8 rounded-md border border-border bg-muted flex items-center justify-center text-foreground/70 shrink-0">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="font-medium">{a.title}</span>
                    <span className="text-[10px] rounded border border-border bg-muted px-1.5 py-0.5 uppercase tracking-wider text-muted-foreground">{a.type}</span>
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{a.description} · by {a.user}</div>
                </div>
                <div className="text-[11px] text-muted-foreground shrink-0">{formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}</div>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}
