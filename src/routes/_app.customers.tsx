import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Section, EmptyState } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Users, Edit, Trash2, Mail, Phone, MapPin, Star, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Customer } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/customers")({ component: CustomersPage });

function CustomersPage() {
  const customers = useCRM(s => s.customers);
  const orders = useCRM(s => s.orders);
  const events = useCRM(s => s.events);
  const addCustomer = useCRM(s => s.addCustomer);
  const updateCustomer = useCRM(s => s.updateCustomer);
  const deleteCustomer = useCRM(s => s.deleteCustomer);

  const [q, setQ] = useState("");
  const [vipOnly, setVipOnly] = useState("all");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [detailFor, setDetailFor] = useState<Customer | null>(null);
  const [toDelete, setToDelete] = useState<Customer | null>(null);

  const filtered = useMemo(() => customers.filter(c =>
    (!q || c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase())) &&
    (vipOnly === "all" || (vipOnly === "vip" ? c.vip : !c.vip))
  ), [customers, q, vipOnly]);

  const handleSave = (data: Omit<Customer, "id">) => {
    if (editing) { updateCustomer(editing.id, data); toast.success("Customer updated"); }
    else { addCustomer(data); toast.success("Customer added"); }
    setOpenForm(false); setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${customers.length} customers · ${customers.filter(c => c.vip).length} VIP`}
        actions={<Button size="sm" className="h-8 gap-1.5" onClick={() => { setEditing(null); setOpenForm(true); }}><Plus className="size-3.5" /> New customer</Button>}
      />

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="pl-8 h-8" />
        </div>
        <Select value={vipOnly} onValueChange={setVipOnly}>
          <SelectTrigger className="h-8 w-[140px] text-[13px]"><Filter className="size-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All customers</SelectItem>
            <SelectItem value="vip">VIP only</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Users className="size-5" />} title="No customers" description="Start building your customer base." />
      ) : (
        <Section>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="text-left px-3 py-2 font-medium">Customer</th>
                  <th className="text-left px-3 py-2 font-medium">Contact</th>
                  <th className="text-left px-3 py-2 font-medium">Location</th>
                  <th className="text-left px-3 py-2 font-medium">Orders</th>
                  <th className="text-left px-3 py-2 font-medium">Spent</th>
                  <th className="text-left px-3 py-2 font-medium">Since</th>
                  <th className="text-right px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-border hover:bg-accent/40 cursor-pointer" onClick={() => setDetailFor(c)}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-gradient-to-br from-chart-1 to-chart-4 flex items-center justify-center text-[10px] font-semibold text-background">
                          {c.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-1.5">
                            {c.name}
                            {c.vip && <Star className="size-3 fill-warning text-warning" />}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-[12px]">{c.email}</td>
                    <td className="px-3 py-2 text-muted-foreground text-[12px]">{c.city}, {c.country}</td>
                    <td className="px-3 py-2 num">{c.totalOrders}</td>
                    <td className="px-3 py-2 num font-medium">${c.totalSpent.toLocaleString()}</td>
                    <td className="px-3 py-2 text-muted-foreground text-[11px]">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</td>
                    <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditing(c); setOpenForm(true); }}><Edit className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => setToDelete(c)}><Trash2 className="size-3.5" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Dialog open={openForm} onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}>
        <CustomerForm customer={editing} onSave={handleSave} onCancel={() => { setOpenForm(false); setEditing(null); }} />
      </Dialog>

      <Sheet open={!!detailFor} onOpenChange={(o) => !o && setDetailFor(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {detailFor && (() => {
            const custOrders = orders.filter(o => o.customerId === detailFor.id);
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="size-9 rounded-full bg-gradient-to-br from-chart-1 to-chart-4 flex items-center justify-center text-[11px] font-semibold text-background">
                      {detailFor.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
                    </div>
                    {detailFor.name}
                    {detailFor.vip && <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded border border-warning/20">VIP</span>}
                  </SheetTitle>
                  <SheetDescription>Customer since {format(new Date(detailFor.createdAt), "MMM yyyy")}</SheetDescription>
                </SheetHeader>
                <div className="px-4 space-y-4">
                  <div className="space-y-2">
                    <ContactRow icon={<Mail className="size-3.5" />}>{detailFor.email}</ContactRow>
                    <ContactRow icon={<Phone className="size-3.5" />}>{detailFor.phone}</ContactRow>
                    <ContactRow icon={<MapPin className="size-3.5" />}>{detailFor.city}, {detailFor.country}</ContactRow>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total orders</div>
                      <div className="text-[20px] font-semibold num">{detailFor.totalOrders}</div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Lifetime spent</div>
                      <div className="text-[20px] font-semibold num">${detailFor.totalSpent.toLocaleString()}</div>
                    </div>
                  </div>
                  {detailFor.notes && (
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Notes</div>
                      <div className="text-[13px]">{detailFor.notes}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Purchase history ({custOrders.length})</div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {custOrders.map(o => {
                        const evt = events.find(e => e.id === o.eventId);
                        return (
                          <div key={o.id} className="rounded-lg border border-border px-3 py-2 flex items-center justify-between text-[12px]">
                            <div>
                              <div className="font-medium truncate">{evt?.name}</div>
                              <div className="text-[11px] text-muted-foreground">{format(new Date(o.createdAt), "MMM d, yyyy")}</div>
                            </div>
                            <div className="num font-semibold">${o.total}</div>
                          </div>
                        );
                      })}
                      {custOrders.length === 0 && <div className="text-[12px] text-muted-foreground text-center py-4">No orders yet.</div>}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>{toDelete?.name} and their contact info will be removed. Orders remain in the system.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (toDelete) { deleteCustomer(toDelete.id); toast.success("Customer deleted"); setToDelete(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ContactRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-[13px] text-muted-foreground"><span className="text-foreground/50">{icon}</span>{children}</div>;
}

function CustomerForm({ customer, onSave, onCancel }: { customer: Customer | null; onSave: (c: Omit<Customer, "id">) => void; onCancel: () => void }) {
  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [city, setCity] = useState(customer?.city ?? "");
  const [country, setCountry] = useState(customer?.country ?? "");
  const [vip, setVip] = useState(customer?.vip ?? false);
  const [notes, setNotes] = useState(customer?.notes ?? "");

  const submit = () => {
    if (!name || !email) { toast.error("Name and email are required"); return; }
    onSave({
      name, email, phone, city, country, vip, notes,
      totalOrders: customer?.totalOrders ?? 0,
      totalSpent: customer?.totalSpent ?? 0,
      createdAt: customer?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{customer ? "Edit customer" : "New customer"}</DialogTitle>
        <DialogDescription>Store contact info and preferences.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div><Label className="text-[12px]">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[12px]">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label className="text-[12px]">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[12px]">City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <div><Label className="text-[12px]">Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
        </div>
        <label className="flex items-center gap-2 text-[13px]">
          <Checkbox checked={vip} onCheckedChange={(v) => setVip(v === true)} /> Mark as VIP
        </label>
        <div><Label className="text-[12px]">Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit}>{customer ? "Save" : "Create customer"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
