import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Section, StatCard, EmptyState } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, Wallet, DollarSign, Trash2 } from "lucide-react";
import { format, isThisMonth, subDays } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/finance")({ component: FinancePage });

const CATS = ["Office", "Marketing", "Travel", "Software", "Salaries", "Utilities", "Fees", "Misc"];
const COLORS = ["oklch(0.6 0.18 255)", "oklch(0.65 0.15 175)", "oklch(0.7 0.17 55)", "oklch(0.62 0.2 310)", "oklch(0.68 0.18 25)", "oklch(0.7 0.15 155)", "oklch(0.6 0.15 85)", "oklch(0.55 0.1 220)"];

function FinancePage() {
  const orders = useCRM(s => s.orders);
  const expenses = useCRM(s => s.expenses);
  const addExpense = useCRM(s => s.addExpense);
  const deleteExpense = useCRM(s => s.deleteExpense);
  const [openForm, setOpenForm] = useState(false);

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const cost = orders.reduce((s, o) => s + o.cost, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const grossProfit = revenue - cost;
  const netProfit = grossProfit - totalExpenses;
  const monthlyRevenue = orders.filter(o => isThisMonth(new Date(o.createdAt))).reduce((s, o) => s + o.total, 0);
  const monthlyExpenses = expenses.filter(e => isThisMonth(new Date(e.date))).reduce((s, e) => s + e.amount, 0);

  const byCategory = CATS.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(x => x.value > 0);

  const trend = Array.from({ length: 30 }, (_, i) => {
    const day = subDays(new Date(), 29 - i);
    const key = format(day, "yyyy-MM-dd");
    return {
      date: format(day, "MMM d"),
      revenue: orders.filter(o => format(new Date(o.createdAt), "yyyy-MM-dd") === key).reduce((s, o) => s + o.total, 0),
      expenses: expenses.filter(e => format(new Date(e.date), "yyyy-MM-dd") === key).reduce((s, e) => s + e.amount, 0),
    };
  });

  return (
    <div>
      <PageHeader
        title="Finance"
        description="Revenue, expenses, and profit at a glance"
        actions={<Button size="sm" className="h-8 gap-1.5" onClick={() => setOpenForm(true)}><Plus className="size-3.5" /> Add expense</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Total Revenue" value={`$${revenue.toLocaleString()}`} delta={12.4} icon={<DollarSign className="size-3.5" />} accent="success" />
        <StatCard label="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} delta={4.1} icon={<Wallet className="size-3.5" />} accent="warning" />
        <StatCard label="Gross Profit" value={`$${grossProfit.toLocaleString()}`} delta={9.8} icon={<TrendingUp className="size-3.5" />} accent="info" />
        <StatCard label="Net Profit" value={`$${netProfit.toLocaleString()}`} delta={netProfit > 0 ? 14.2 : -3.1} icon={netProfit > 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />} accent={netProfit > 0 ? "success" : "warning"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Cash flow" description="Last 30 days" className="lg:col-span-2">
          <div className="p-4 pt-2 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="oklch(0.65 0.17 155)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expenses" stroke="oklch(0.62 0.22 25)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
        <Section title="Expenses by category">
          <div className="p-4 pt-2 h-[280px]">
            {byCategory.length === 0 ? <EmptyState title="No data" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={2}>
                    {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Section>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList className="mb-3">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses">
          <Section>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="text-left px-3 py-2 font-medium">Category</th>
                  <th className="text-left px-3 py-2 font-medium">Description</th>
                  <th className="text-left px-3 py-2 font-medium">Vendor</th>
                  <th className="text-left px-3 py-2 font-medium">Date</th>
                  <th className="text-right px-3 py-2 font-medium">Amount</th>
                  <th className="text-right px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 25).map(e => (
                  <tr key={e.id} className="border-b border-border hover:bg-accent/40">
                    <td className="px-3 py-2"><span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10.5px] font-medium">{e.category}</span></td>
                    <td className="px-3 py-2">{e.description}</td>
                    <td className="px-3 py-2 text-muted-foreground">{e.vendor}</td>
                    <td className="px-3 py-2 num text-muted-foreground">{format(new Date(e.date), "MMM d, yyyy")}</td>
                    <td className="px-3 py-2 num text-right font-medium">${e.amount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right"><Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => { deleteExpense(e.id); toast.success("Expense deleted"); }}><Trash2 className="size-3.5" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </TabsContent>
        <TabsContent value="revenue">
          <Section>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="text-left px-3 py-2 font-medium">Order</th>
                  <th className="text-left px-3 py-2 font-medium">Date</th>
                  <th className="text-left px-3 py-2 font-medium">Channel</th>
                  <th className="text-right px-3 py-2 font-medium">Revenue</th>
                  <th className="text-right px-3 py-2 font-medium">Cost</th>
                  <th className="text-right px-3 py-2 font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 25).map(o => (
                  <tr key={o.id} className="border-b border-border hover:bg-accent/40">
                    <td className="px-3 py-2 font-mono text-[11px]">{o.id}</td>
                    <td className="px-3 py-2 num text-muted-foreground">{format(new Date(o.createdAt), "MMM d")}</td>
                    <td className="px-3 py-2 text-muted-foreground">{o.channel}</td>
                    <td className="px-3 py-2 num text-right">${o.total}</td>
                    <td className="px-3 py-2 num text-right text-muted-foreground">${o.cost}</td>
                    <td className="px-3 py-2 num text-right font-medium text-success">${o.total - o.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </TabsContent>
      </Tabs>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <ExpenseForm onSave={(d) => { addExpense(d); toast.success("Expense added"); setOpenForm(false); }} onCancel={() => setOpenForm(false)} />
      </Dialog>

      <span className="hidden">{monthlyRevenue}{monthlyExpenses}</span>
    </div>
  );
}

function ExpenseForm({ onSave, onCancel }: { onSave: (e: any) => void; onCancel: () => void }) {
  const [category, setCategory] = useState(CATS[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(100);
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Add expense</DialogTitle><DialogDescription>Track operational spend.</DialogDescription></DialogHeader>
      <div className="space-y-3">
        <div>
          <Label className="text-[12px]">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label className="text-[12px]">Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[12px]">Vendor</Label><Input value={vendor} onChange={(e) => setVendor(e.target.value)} /></div>
          <div><Label className="text-[12px]">Amount ($)</Label><Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} /></div>
        </div>
        <div><Label className="text-[12px]">Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => {
          if (!description) { toast.error("Description required"); return; }
          onSave({ category, description, amount, vendor, date: new Date(date).toISOString() });
        }}>Add expense</Button>
      </DialogFooter>
    </DialogContent>
  );
}
