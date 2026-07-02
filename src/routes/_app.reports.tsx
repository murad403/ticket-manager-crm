import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Section } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, FileBarChart2, TrendingUp, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { toast } from "sonner";
import { format, subDays } from "date-fns";

export const Route = createFileRoute("/_app/reports")({ component: ReportsPage });

function ReportsPage() {
  const orders = useCRM(s => s.orders);
  const events = useCRM(s => s.events);
  const brokers = useCRM(s => s.brokers);
  const expenses = useCRM(s => s.expenses);
  const tickets = useCRM(s => s.tickets);

  const exportCSV = (name: string) => {
    toast.success(`Exporting ${name}.csv`, { description: "Your file will be ready in a moment." });
  };

  // Sales report
  const salesByDay = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    const key = format(d, "yyyy-MM-dd");
    return {
      date: format(d, "MMM d"),
      sales: orders.filter(o => format(new Date(o.createdAt), "yyyy-MM-dd") === key).reduce((s, o) => s + o.total, 0),
      orders: orders.filter(o => format(new Date(o.createdAt), "yyyy-MM-dd") === key).length,
    };
  });

  // Event report
  const eventReport = events.slice(0, 8).map(e => ({
    name: e.name.slice(0, 18), sold: e.ticketsSold, revenue: e.ticketsSold * e.minPrice,
  }));

  // Broker report
  const brokerReport = brokers.slice(0, 8).map(b => ({
    name: b.company.slice(0, 14),
    tickets: tickets.filter(t => t.brokerId === b.id).length,
    revenue: tickets.filter(t => t.brokerId === b.id).reduce((s, t) => s + t.price, 0),
  }));

  return (
    <div>
      <PageHeader title="Reports" description="Detailed reports across sales, events, brokers, and finance" />
      <Tabs defaultValue="sales">
        <div className="flex items-center justify-between mb-3">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="brokers">Brokers</TabsTrigger>
            <TabsTrigger value="profit">Profit</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sales">
          <ReportCard title="Sales report" icon={<TrendingUp className="size-4" />} onExport={() => exportCSV("sales-report")}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                <Line type="monotone" dataKey="sales" stroke="oklch(0.6 0.18 255)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="orders" stroke="oklch(0.7 0.17 55)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ReportCard>
        </TabsContent>

        <TabsContent value="events">
          <ReportCard title="Event performance" icon={<FileBarChart2 className="size-4" />} onExport={() => exportCSV("event-report")}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={eventReport} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={140} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="oklch(0.6 0.18 255)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ReportCard>
        </TabsContent>

        <TabsContent value="brokers">
          <ReportCard title="Broker contribution" icon={<FileBarChart2 className="size-4" />} onExport={() => exportCSV("broker-report")}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={brokerReport}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                <Bar dataKey="tickets" fill="oklch(0.65 0.15 175)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="oklch(0.7 0.17 55)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ReportCard>
        </TabsContent>

        <TabsContent value="profit">
          <ReportCard title="Profit & loss" icon={<TrendingUp className="size-4" />} onExport={() => exportCSV("profit-report")}>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PLRow label="Revenue" value={orders.reduce((s, o) => s + o.total, 0)} tone="success" />
              <PLRow label="Cost of goods" value={-orders.reduce((s, o) => s + o.cost, 0)} tone="warning" />
              <PLRow label="Expenses" value={-expenses.reduce((s, e) => s + e.amount, 0)} tone="destructive" />
              <div className="col-span-3 border-t border-border pt-4">
                <PLRow label="Net profit" value={orders.reduce((s, o) => s + o.total - o.cost, 0) - expenses.reduce((s, e) => s + e.amount, 0)} tone="success" big />
              </div>
            </div>
          </ReportCard>
        </TabsContent>

        <TabsContent value="expenses">
          <ReportCard title="Expense report" icon={<Wallet className="size-4" />} onExport={() => exportCSV("expense-report")}>
            <div className="p-4">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                    <th className="text-left px-3 py-2 font-medium">Date</th>
                    <th className="text-left px-3 py-2 font-medium">Category</th>
                    <th className="text-left px-3 py-2 font-medium">Description</th>
                    <th className="text-right px-3 py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.slice(0, 12).map(e => (
                    <tr key={e.id} className="border-b border-border">
                      <td className="px-3 py-2 num text-muted-foreground">{format(new Date(e.date), "MMM d")}</td>
                      <td className="px-3 py-2">{e.category}</td>
                      <td className="px-3 py-2">{e.description}</td>
                      <td className="px-3 py-2 num text-right font-medium">${e.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportCard({ title, icon, onExport, children }: { title: string; icon: React.ReactNode; onExport: () => void; children: React.ReactNode }) {
  return (
    <Section
      title={title}
      actions={<Button variant="outline" size="sm" className="h-7 gap-1.5" onClick={onExport}><Download className="size-3.5" /> Export CSV</Button>}
    >
      <div className="p-4">{icon && <span className="hidden">{icon}</span>}{children}</div>
    </Section>
  );
}

function PLRow({ label, value, tone, big }: { label: string; value: number; tone: "success" | "warning" | "destructive"; big?: boolean }) {
  const cls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-destructive";
  return (
    <div className={`rounded-lg border border-border p-4 ${big ? "text-center" : ""}`}>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`${big ? "text-[32px]" : "text-[22px]"} font-semibold num mt-1 ${cls}`}>${Math.abs(value).toLocaleString()}</div>
    </div>
  );
}
