import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarDays, MapPin, Ticket, ShoppingCart, Users, Briefcase,
  MessageCircle, Truck, Wallet, FileBarChart2, Activity as ActivityIcon, Settings,
  Sparkles, Receipt, ShieldCheck, UserCog, LogOut, ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-store";
import { canAccessRoute } from "@/lib/rbac";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const nav = [
  { group: "Overview", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/activity", label: "Activity Logs", icon: ActivityIcon },
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
    { to: "/expenses", label: "Expenses", icon: Receipt },
    { to: "/reports", label: "Reports", icon: FileBarChart2 },
  ]},
  { group: "Administration", items: [
    { to: "/users", label: "Users", icon: UserCog },
    { to: "/roles", label: "Roles", icon: ShieldCheck },
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const session = useAuth((s) => s.session);
  const users = useAuth((s) => s.users);
  const logout = useAuth((s) => s.logout);
  const user = session ? users.find((u) => u.id === session.userId) ?? null : null;
  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully.");
    navigate({ to: "/auth" });
  };

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
        {nav.map((section) => {
          const items = section.items.filter((item) => canAccessRoute(item.to, user.role));
          if (items.length === 0) return null;
          return (
            <div key={section.group}>
              <div className="px-2 mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {section.group}
              </div>
              <ul className="space-y-0.5">
                {items.map((item) => {
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
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 rounded-md px-1.5 py-1.5 hover:bg-sidebar-accent/60 transition-colors">
              <Avatar className="size-8">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback className="text-[11px] font-semibold bg-gradient-to-br from-chart-1 to-chart-4 text-background">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[13px] font-medium truncate">{user.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{user.role} · Online</div>
              </div>
              <ChevronsUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span>{user.name}</span>
              <span className="text-[11px] font-normal text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile"><UserCog className="size-4" /> Profile & security</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
