import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Section, StatCard } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Receipt, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const CATS = ["Office", "Marketing", "Travel", "Software", "Salaries", "Utilities", "Fees", "Misc"];

export const Route = createFileRoute("/_app/expenses")({
  head: () => ({ meta: [{ title: "Expenses — TicketManager CRM" }] }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const expenses = useCRM((s) => s.expenses);
  const addExpense = useCRM((s) => s.addExpense);
  const deleteExpense = useCRM((s) => s.deleteExpense);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "Office", description: "", amount: "", vendor: "", date: format(new Date(), "yyyy-MM-dd") });

  const filtered = useMemo(() =>
    expenses.filter((e) =>
      (cat === "all" || e.category === cat) &&
      (e.description.toLowerCase().includes(q.toLowerCase()) || e.vendor.toLowerCase().includes(q.toLowerCase()))
    ), [expenses, q, cat]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const submit = () => {
    if (!form.description || !form.amount) return toast.error("Description and amount are required.");
    addExpense({ ...form, amount: Number(form.amount), date: new Date(form.date).toISOString() });
    toast.success("Expense added.");
    setOpen(false);
    setForm({ category: "Office", description: "", amount: "", vendor: "", date: format(new Date(), "yyyy-MM-dd") });
  };

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track and categorize business expenses"
        actions={<Button size="sm" className="h-8 gap-1.5" onClick={() => setOpen(true)}><Plus className="size-3.5" /> Add expense</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total (filtered)" value={`$${total.toLocaleString()}`} icon={<Receipt className="size-4" />} />
        <StatCard label="Records" value={String(filtered.length)} />
        <StatCard label="Categories" value={String(new Set(expenses.map(e => e.category)).size)} />
      </div>

      <Section title="All expenses">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search description or vendor…" className="pl-8 h-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-[13px]">{format(new Date(e.date), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-[13px]">{e.category}</TableCell>
                  <TableCell className="text-[13px]">{e.description}</TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">{e.vendor}</TableCell>
                  <TableCell className="text-[13px] text-right font-medium">${e.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => { deleteExpense(e.id); toast.success("Expense deleted."); }}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No expenses found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add expense</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Google Ads campaign" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount ($)</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Vendor</Label>
                <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Vendor name" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Add expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
