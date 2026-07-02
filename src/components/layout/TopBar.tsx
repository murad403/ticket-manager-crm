import { useEffect, useState } from "react";
import { Search, Bell, Moon, Sun, Command, Plus } from "lucide-react";
import { useCRM } from "@/store/crm-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@tanstack/react-router";

export function TopBar({ title, actions }: { title?: string; actions?: React.ReactNode }) {
  const theme = useCRM((s) => s.theme);
  const toggleTheme = useCRM((s) => s.toggleTheme);
  const notifications = useCRM((s) => s.notifications);
  const markAllRead = useCRM((s) => s.markAllRead);
  const unread = notifications.filter(n => !n.read).length;
  const [q, setQ] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="h-full px-4 md:px-6 flex items-center gap-3">
        {title && (
          <div className="text-[13px] font-medium text-foreground/90 hidden sm:block">
            {title}
          </div>
        )}
        <div className="flex-1 max-w-md ml-auto md:ml-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search orders, tickets, customers…"
              className="w-full h-8 rounded-md bg-muted/60 border border-transparent focus:border-border focus:bg-background pl-8 pr-14 text-[13px] placeholder:text-muted-foreground outline-none transition"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Command className="size-2.5" />K
            </kbd>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {actions}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="size-8">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 relative">
                <Bell className="size-4" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <button onClick={markAllRead} className="text-[11px] font-normal text-muted-foreground hover:text-foreground">Mark all read</button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.slice(0, 6).map(n => (
                <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5 py-2">
                  <div className="flex items-center gap-2 w-full">
                    <div className={cn("size-1.5 rounded-full",
                      n.type === "success" && "bg-success",
                      n.type === "warning" && "bg-warning",
                      n.type === "error" && "bg-destructive",
                      n.type === "info" && "bg-info",
                    )} />
                    <span className="text-[13px] font-medium">{n.title}</span>
                    {!n.read && <span className="ml-auto text-[10px] text-muted-foreground">new</span>}
                  </div>
                  <div className="text-[11px] text-muted-foreground pl-3.5">{n.description}</div>
                  <div className="text-[10px] text-muted-foreground pl-3.5">{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight leading-tight">{title}</h1>
        {description && <p className="text-[13px] text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function QuickCreate() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="h-8 gap-1.5">
          <Plus className="size-3.5" /> Create
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/orders">New order</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/inventory">Add ticket</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/customers">New customer</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/events">New event</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/venues">New venue</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
