import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { StatusBadge, Section, EmptyState } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, ShoppingCart, XCircle, Filter, CheckCircle2, Clock, Truck, DollarSign } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Order } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/orders")({ component: OrdersPage });

function OrdersPage() {
  const orders = useCRM(s => s.orders);
  const customers = useCRM(s => s.customers);
  const events = useCRM(s => s.events);
  const tickets = useCRM(s => s.tickets);
  const addOrder = useCRM(s => s.addOrder);
  const updateOrder = useCRM(s => s.updateOrder);
  const addActivity = useCRM(s => s.addActivity);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payFilter, setPayFilter] = useState("all");
  const [openForm, setOpenForm] = useState(false);
  const [detailFor, setDetailFor] = useState<Order | null>(null);
  const [toCancel, setToCancel] = useState<Order | null>(null);

  const filtered = useMemo(() => orders.filter(o => {
    const cus = customers.find(c => c.id === o.customerId);
    const matchQ = !q || o.id.includes(q) || cus?.name.toLowerCase().includes(q.toLowerCase());
    const matchS = statusFilter === "all" || o.status === statusFilter;
    const matchP = payFilter === "all" || o.payment === payFilter;
    return matchQ && matchS && matchP;
  }), [orders, customers, q, statusFilter, payFilter]);

  const totals = {
    revenue: orders.reduce((s, o) => s + o.total, 0),
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    unpaid: orders.filter(o => o.payment === "unpaid").length,
  };

  const handleCreate = (data: Omit<Order, "id">) => {
    addOrder(data);
    addActivity({ type: "order", title: "New order created", description: `#${data.customerId}`, user: "Alex Chen" });
    toast.success("Order created");
    setOpenForm(false);
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${orders.length} orders · $${totals.revenue.toLocaleString()} lifetime`}
        actions={<Button size="sm" className="h-8 gap-1.5" onClick={() => setOpenForm(true)}><Plus className="size-3.5" /> New order</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <MetricPill icon={<DollarSign className="size-3.5" />} label="Revenue" value={`$${totals.revenue.toLocaleString()}`} />
        <MetricPill icon={<Clock className="size-3.5" />} label="Pending" value={totals.pending} tone="warning" />
        <MetricPill icon={<CheckCircle2 className="size-3.5" />} label="Confirmed" value={totals.confirmed} tone="success" />
        <MetricPill icon={<Truck className="size-3.5" />} label="Unpaid" value={totals.unpaid} tone="destructive" />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders or customers…" className="pl-8 h-8" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[150px] text-[13px]"><Filter className="size-3.5 mr-1" /><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={payFilter} onValueChange={setPayFilter}>
          <SelectTrigger className="h-8 w-[150px] text-[13px]"><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ShoppingCart className="size-5" />} title="No orders" description="Create your first order." />
      ) : (
        <Section>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="text-left px-3 py-2 font-medium">Order</th>
                  <th className="text-left px-3 py-2 font-medium">Customer</th>
                  <th className="text-left px-3 py-2 font-medium">Event</th>
                  <th className="text-left px-3 py-2 font-medium">Total</th>
                  <th className="text-left px-3 py-2 font-medium">Payment</th>
                  <th className="text-left px-3 py-2 font-medium">Delivery</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="text-left px-3 py-2 font-medium">Created</th>
                  <th className="text-right px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const cus = customers.find(c => c.id === o.customerId);
                  const evt = events.find(e => e.id === o.eventId);
                  return (
                    <tr key={o.id} className="border-b border-border hover:bg-accent/40 cursor-pointer" onClick={() => setDetailFor(o)}>
                      <td className="px-3 py-2 font-mono text-[11px]">{o.id}</td>
                      <td className="px-3 py-2 font-medium">{cus?.name}</td>
                      <td className="px-3 py-2 text-muted-foreground truncate max-w-[220px]">{evt?.name}</td>
                      <td className="px-3 py-2 num font-medium">${o.total}</td>
                      <td className="px-3 py-2"><StatusBadge status={o.payment} /></td>
                      <td className="px-3 py-2"><StatusBadge status={o.delivery} /></td>
                      <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
                      <td className="px-3 py-2 text-muted-foreground text-[11px]">{formatDistanceToNow(new Date(o.createdAt), { addSuffix: true })}</td>
                      <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                        {o.status !== "cancelled" && (
                          <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => setToCancel(o)}><XCircle className="size-3.5" /></Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <OrderForm customers={customers} events={events} tickets={tickets} onSave={handleCreate} onCancel={() => setOpenForm(false)} />
      </Dialog>

      <Sheet open={!!detailFor} onOpenChange={(o) => !o && setDetailFor(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {detailFor && (() => {
            const cus = customers.find(c => c.id === detailFor.customerId);
            const evt = events.find(e => e.id === detailFor.eventId);
            const orderTickets = tickets.filter(t => detailFor.ticketIds.includes(t.id));
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 font-mono text-[14px]">{detailFor.id}</SheetTitle>
                  <SheetDescription>{evt?.name} — {cus?.name}</SheetDescription>
                </SheetHeader>
                <div className="px-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-border p-2">
                      <div className="text-[10px] text-muted-foreground uppercase">Status</div>
                      <div className="mt-1"><StatusBadge status={detailFor.status} /></div>
                    </div>
                    <div className="rounded-lg border border-border p-2">
                      <div className="text-[10px] text-muted-foreground uppercase">Payment</div>
                      <div className="mt-1"><StatusBadge status={detailFor.payment} /></div>
                    </div>
                    <div className="rounded-lg border border-border p-2">
                      <div className="text-[10px] text-muted-foreground uppercase">Delivery</div>
                      <div className="mt-1"><StatusBadge status={detailFor.delivery} /></div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5">Tickets ({orderTickets.length})</div>
                    <div className="space-y-1.5">
                      {orderTickets.map(t => (
                        <div key={t.id} className="flex items-center justify-between text-[13px] rounded border border-border px-2.5 py-1.5">
                          <span className="num">{t.section}-{t.row}-{t.seat}</span>
                          <span className="num text-muted-foreground">${t.price}</span>
                        </div>
                      ))}
                      {orderTickets.length === 0 && <div className="text-[12px] text-muted-foreground">No tickets allocated yet.</div>}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between text-[13px] mb-1"><span className="text-muted-foreground">Subtotal</span><span className="num">${detailFor.total}</span></div>
                    <div className="flex items-center justify-between text-[13px] mb-1"><span className="text-muted-foreground">Cost</span><span className="num">${detailFor.cost}</span></div>
                    <div className="flex items-center justify-between text-[14px] font-semibold pt-2 border-t border-border"><span>Profit</span><span className="num text-success">${detailFor.total - detailFor.cost}</span></div>
                  </div>

                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5">Timeline</div>
                    <ul className="relative space-y-3 pl-4 before:absolute before:left-1 before:top-1 before:bottom-1 before:w-px before:bg-border">
                      <TimelineItem title="Order created" time={format(new Date(detailFor.createdAt), "PPp")} />
                      {detailFor.payment === "paid" && <TimelineItem title="Payment received" time={format(new Date(detailFor.createdAt), "PPp")} />}
                      {detailFor.delivery === "delivered" && <TimelineItem title="Tickets delivered" time={format(new Date(detailFor.createdAt), "PPp")} />}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { updateOrder(detailFor.id, { delivery: "delivered", status: "confirmed", payment: "paid" }); toast.success("Order fulfilled"); setDetailFor(null); }}>
                      <CheckCircle2 className="size-3.5 mr-1.5" /> Fulfill order
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-destructive" onClick={() => setToCancel(detailFor)}>
                      <XCircle className="size-3.5 mr-1.5" /> Cancel
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!toCancel} onOpenChange={(o) => !o && setToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>Order {toCancel?.id} will be marked as cancelled. Tickets return to available inventory.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (toCancel) { updateOrder(toCancel.id, { status: "cancelled" }); toast.success("Order cancelled"); setToCancel(null); setDetailFor(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Cancel order</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MetricPill({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone?: "success" | "warning" | "destructive" }) {
  const toneCls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 flex items-center gap-2.5">
      <div className={`size-7 rounded-md bg-muted flex items-center justify-center ${toneCls}`}>{icon}</div>
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={`text-[15px] font-semibold num ${toneCls}`}>{value}</div>
      </div>
    </div>
  );
}

function TimelineItem({ title, time }: { title: string; time: string }) {
  return (
    <li className="relative">
      <div className="absolute -left-[13px] top-1 size-2 rounded-full bg-primary ring-4 ring-background" />
      <div className="text-[13px] font-medium">{title}</div>
      <div className="text-[11px] text-muted-foreground">{time}</div>
    </li>
  );
}

function OrderForm({ customers, events, tickets, onSave, onCancel }: {
  customers: ReturnType<typeof useCRM.getState>["customers"];
  events: ReturnType<typeof useCRM.getState>["events"];
  tickets: ReturnType<typeof useCRM.getState>["tickets"];
  onSave: (o: Omit<Order, "id">) => void; onCancel: () => void;
}) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<Order["channel"]>("WhatsApp");
  const [notes, setNotes] = useState("");

  const available = tickets.filter(t => t.eventId === eventId && t.status === "available");
  const total = [...selectedTickets].reduce((s, id) => s + (tickets.find(t => t.id === id)?.price || 0), 0);
  const cost = [...selectedTickets].reduce((s, id) => s + (tickets.find(t => t.id === id)?.cost || 0), 0);

  const toggle = (id: string) => {
    const s = new Set(selectedTickets); s.has(id) ? s.delete(id) : s.add(id); setSelectedTickets(s);
  };

  const submit = () => {
    if (!customerId || !eventId) { toast.error("Select customer and event"); return; }
    onSave({
      customerId, eventId, ticketIds: [...selectedTickets],
      total: total || 200, cost: cost || 120,
      status: "pending", payment: "unpaid", delivery: "pending",
      createdAt: new Date().toISOString(), notes, channel,
    });
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Create order</DialogTitle>
        <DialogDescription>Select customer, event, and allocate tickets from inventory.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[12px]">Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[12px]">Event</Label>
            <Select value={eventId} onValueChange={(v) => { setEventId(v); setSelectedTickets(new Set()); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{events.map(e => <SelectItem key={e.id} value={e.id}>{e.name.slice(0, 40)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-[12px]">Allocate tickets ({available.length} available)</Label>
          <div className="mt-1 rounded-lg border border-border max-h-40 overflow-y-auto">
            {available.length === 0 ? (
              <div className="p-3 text-[12px] text-muted-foreground text-center">No tickets available for this event.</div>
            ) : available.slice(0, 20).map(t => (
              <label key={t.id} className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-accent/50 cursor-pointer text-[13px] border-b border-border last:border-0">
                <input type="checkbox" checked={selectedTickets.has(t.id)} onChange={() => toggle(t.id)} className="accent-primary" />
                <span className="num flex-1">{t.section}-{t.row}-{t.seat}</span>
                <span className="text-muted-foreground text-[11px]">{t.source}</span>
                <span className="num font-medium">${t.price}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[12px]">Channel</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v as Order["channel"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["WhatsApp", "Phone", "Email", "In-Person"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[12px]">Order total</Label>
            <div className="h-9 rounded-md border border-border bg-muted flex items-center px-3 text-[14px] font-semibold num">${total}</div>
          </div>
        </div>

        <div><Label className="text-[12px]">Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions…" rows={2} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit}>Create order</Button>
      </DialogFooter>
    </DialogContent>
  );
}
