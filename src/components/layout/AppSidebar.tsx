import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarDays, MapPin, Ticket, ShoppingCart, Users, Briefcase,
  MessageCircle, Truck, Wallet, FileBarChart2, Activity as ActivityIcon, Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { group: "Overview", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/activity", label: "Activity", icon: ActivityIcon },
  ]},
  { group: "Sales", items: [
    { to: "/orders", label: "Orders", icon: ShoppingCart },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
    { to: "/delivery", label: "Delivery", icon: Truck },
  ]},
  { group: "Catalog", items: [
    { to: "/events", label: "Events", icon: CalendarDays },
    { to: "/venues", label: "Venues", icon: MapPin },
    { to: "/inventory", label: "Inventory", icon: Ticket },
    { to: "/brokers", label: "Brokers", icon: Briefcase },
  ]},
  { group: "Finance", items: [
    { to: "/finance", label: "Finance", icon: Wallet },
    { to: "/reports", label: "Reports", icon: FileBarChart2 },
  ]},
  { group: "Workspace", items: [
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <aside className="hidden md:flex w-[248px] shrink-0 flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
      <div className="px-4 h-14 flex items-center gap-2 border-b border-sidebar-border">
        <div className="size-8 rounded-md bg-gradient-to-br from-foreground to-muted-foreground flex items-center justify-center">
          <Sparkles className="size-4 text-background" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">TicketManager</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">CRM · v1.0</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {nav.map((section) => (
          <div key={section.group}>
            <div className="px-2 mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {section.group}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="size-4" strokeWidth={2} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-1 py-1">
          <div className="size-8 rounded-full bg-gradient-to-br from-chart-1 to-chart-4 flex items-center justify-center text-[11px] font-semibold text-background">
            AC
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium truncate">Alex Chen</div>
            <div className="text-[11px] text-muted-foreground truncate">Admin · Online</div>
          </div>
          <div className="size-1.5 rounded-full bg-success" />
        </div>
      </div>
    </aside>
  );
}
