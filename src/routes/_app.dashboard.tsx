import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { StatCard, Section, StatusBadge } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import {
  DollarSign, ShoppingCart, Truck, TrendingUp, Ticket as TicketIcon, Wallet,
  CalendarPlus, UserPlus, MessageCircle, PlusCircle, Sparkles,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend,
} from "recharts";
import { subDays, format, formatDistanceToNow, isToday, isThisMonth } from "date-fns";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const orders = useCRM(s => s.orders);
  const tickets = useCRM(s => s.tickets);
  const expenses = useCRM(s => s.expenses);
  const activities = useCRM(s => s.activities);
  const events = useCRM(s => s.events);

  const todaySales = orders.filter(o => isToday(new Date(o.createdAt))).reduce((s, o) => s + o.total, 0);
  const monthlyRevenue = orders.filter(o => isThisMonth(new Date(o.createdAt))).reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const pendingDeliveries = orders.filter(o => o.delivery === "pending").length;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalCost = orders.reduce((s, o) => s + o.cost, 0);
  const profit = totalRevenue - totalCost - totalExpenses;

  const chartData = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const dayOrders = orders.filter(o => format(new Date(o.createdAt), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"));
    return {
      date: format(day, "MMM d"),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    };
  });

  const catData = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.ticketsSold;
    return acc;
  }, {});
  const pieData = Object.entries(catData).map(([name, value]) => ({ name, value }));
  const pieColors = ["oklch(0.6 0.18 255)", "oklch(0.65 0.15 175)", "oklch(0.7 0.17 55)", "oklch(0.62 0.2 310)", "oklch(0.68 0.18 25)"];

  const inv = {
    total: tickets.length,
    available: tickets.filter(t => t.status === "available").length,
    reserved: tickets.filter(t => t.status === "reserved").length,
    sold: tickets.filter(t => t.status === "sold" || t.status === "delivered").length,
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live overview of your ticket brokerage operations"
        actions={
          <Button size="sm" variant="outline" className="h-8 gap-1.5">
            <Sparkles className="size-3.5" /> Generate report
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <StatCard label="Today's Sales" value={`$${todaySales.toLocaleString()}`} delta={12.4} hint="vs yesterday" icon={<DollarSign className="size-3.5" />} accent="success" />
        <StatCard label="Monthly Revenue" value={`$${monthlyRevenue.toLocaleString()}`} delta={8.2} hint="MTD" icon={<TrendingUp className="size-3.5" />} accent="info" />
        <StatCard label="Pending Orders" value={pendingOrders} delta={-3.1} hint="need action" icon={<ShoppingCart className="size-3.5" />} accent="warning" />
        <StatCard label="Pending Delivery" value={pendingDeliveries} delta={-6.4} hint="to send" icon={<Truck className="size-3.5" />} accent="warning" />
        <StatCard label="Expenses" value={`$${totalExpenses.toLocaleString()}`} delta={2.1} hint="last 90d" icon={<Wallet className="size-3.5" />} />
        <StatCard label="Net Profit" value={`$${profit.toLocaleString()}`} delta={14.7} hint="after costs" icon={<TrendingUp className="size-3.5" />} accent="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Revenue & orders" description="Last 14 days" className="lg:col-span-2">
          <div className="p-4 pt-2 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.6 0.18 255)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.6 0.18 255)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.6 0.18 255)" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Sales by category" description="Ticket volume">
          <div className="p-4 pt-2 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Orders volume" description="Last 14 days" className="lg:col-span-2">
          <div className="p-4 pt-2 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="orders" fill="oklch(0.65 0.15 175)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Inventory summary">
          <div className="p-4 space-y-3">
            <InvBar label="Available" value={inv.available} total={inv.total} color="bg-info" />
            <InvBar label="Reserved" value={inv.reserved} total={inv.total} color="bg-warning" />
            <InvBar label="Sold" value={inv.sold} total={inv.total} color="bg-success" />
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">Total tickets</span>
              <span className="text-[14px] font-semibold num">{inv.total}</span>
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/inventory"><TicketIcon className="size-3.5 mr-1.5" /> View inventory</Link>
            </Button>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Recent activity" className="lg:col-span-2">
          <ul className="divide-y divide-border">
            {activities.slice(0, 8).map(a => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="size-7 rounded-md bg-muted flex items-center justify-center text-[10px] font-semibold">
                  {a.user.split(" ").map(s => s[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{a.description}</div>
                </div>
                <div className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}</div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Quick actions">
          <div className="p-3 grid grid-cols-2 gap-2">
            <QuickBtn to="/orders" icon={<PlusCircle className="size-4" />} label="New Order" />
            <QuickBtn to="/inventory" icon={<TicketIcon className="size-4" />} label="Add Ticket" />
            <QuickBtn to="/customers" icon={<UserPlus className="size-4" />} label="New Customer" />
            <QuickBtn to="/events" icon={<CalendarPlus className="size-4" />} label="New Event" />
            <QuickBtn to="/whatsapp" icon={<MessageCircle className="size-4" />} label="WhatsApp" />
            <QuickBtn to="/finance" icon={<Wallet className="size-4" />} label="Add Expense" />
          </div>
        </Section>
      </div>
    </div>
  );
}

function InvBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] text-muted-foreground">{label}</span>
        <span className="text-[12px] font-medium num">{value} <span className="text-muted-foreground">· {pct}%</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickBtn({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center gap-2 py-4 rounded-lg border border-border hover:border-foreground/30 hover:bg-accent transition-colors">
      <div className="text-foreground/70">{icon}</div>
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}

// Suppress unused import warnings for status badge in future use
void StatusBadge;
