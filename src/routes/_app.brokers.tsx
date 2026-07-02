import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Section, StatusBadge, EmptyState } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Search, Briefcase, Star, Mail, Phone, DollarSign, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Broker } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/brokers")({ component: BrokersPage });

function BrokersPage() {
  const brokers = useCRM(s => s.brokers);
  const invoices = useCRM(s => s.invoices);
  const tickets = useCRM(s => s.tickets);
  const addBroker = useCRM(s => s.addBroker);

  const [q, setQ] = useState("");
  const [detailFor, setDetailFor] = useState<Broker | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const filtered = useMemo(() => brokers.filter(b =>
    !q || b.name.toLowerCase().includes(q.toLowerCase()) || b.company.toLowerCase().includes(q.toLowerCase())
  ), [brokers, q]);

  const totalDue = brokers.reduce((s, b) => s + Math.max(0, b.balance), 0);

  const handleSave = (data: Omit<Broker, "id">) => {
    addBroker(data);
    toast.success("Broker added");
    setOpenForm(false);
  };

  return (
    <div>
      <PageHeader
        title="Brokers"
        description={`${brokers.length} brokers · $${totalDue.toLocaleString()} outstanding`}
        actions={<Button size="sm" className="h-8 gap-1.5" onClick={() => setOpenForm(true)}><Plus className="size-3.5" /> New broker</Button>}
      />

      <div className="relative max-w-md mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brokers or companies…" className="pl-8 h-8" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Briefcase className="size-5" />} title="No brokers" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(b => (
            <div key={b.id} onClick={() => setDetailFor(b)} className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-foreground/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[14px] font-semibold truncate">{b.company}</div>
                  <div className="text-[12px] text-muted-foreground">{b.name}</div>
                </div>
                <div className="flex items-center gap-1 text-[12px]">
                  <Star className="size-3 fill-warning text-warning" /> {b.rating}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                <div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Tickets</div><div className="text-[13px] font-semibold num">{b.totalTickets}</div></div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Balance</div>
                  <div className={`text-[13px] font-semibold num ${b.balance > 0 ? "text-warning" : b.balance < 0 ? "text-success" : ""}`}>
                    ${Math.abs(b.balance).toLocaleString()} {b.balance > 0 ? "due" : b.balance < 0 ? "credit" : ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={!!detailFor} onOpenChange={(o) => !o && setDetailFor(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {detailFor && (() => {
            const brokInvoices = invoices.filter(i => i.brokerId === detailFor.id);
            const brokTickets = tickets.filter(t => t.brokerId === detailFor.id);
            return (
              <>
                <SheetHeader>
                  <SheetTitle>{detailFor.company}</SheetTitle>
                  <SheetDescription>{detailFor.name} · Rating {detailFor.rating}</SheetDescription>
                </SheetHeader>
                <div className="px-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-border p-3"><div className="text-[10px] text-muted-foreground uppercase">Tickets</div><div className="text-[18px] font-semibold num">{detailFor.totalTickets}</div></div>
                    <div className="rounded-lg border border-border p-3"><div className="text-[10px] text-muted-foreground uppercase">Invoices</div><div className="text-[18px] font-semibold num">{brokInvoices.length}</div></div>
                    <div className="rounded-lg border border-border p-3"><div className="text-[10px] text-muted-foreground uppercase">Balance</div><div className="text-[18px] font-semibold num">${Math.abs(detailFor.balance).toLocaleString()}</div></div>
                  </div>
                  <div className="space-y-1.5 text-[13px] text-muted-foreground">
                    <div className="flex items-center gap-2"><Mail className="size-3.5" />{detailFor.email}</div>
                    <div className="flex items-center gap-2"><Phone className="size-3.5" />{detailFor.phone}</div>
                  </div>
                  <Tabs defaultValue="ledger">
                    <TabsList className="grid grid-cols-3 h-8">
                      <TabsTrigger value="ledger" className="text-[12px]">Ledger</TabsTrigger>
                      <TabsTrigger value="invoices" className="text-[12px]">Invoices</TabsTrigger>
                      <TabsTrigger value="tickets" className="text-[12px]">Tickets</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ledger" className="mt-3">
                      <div className="rounded-lg border border-border">
                        <div className="grid grid-cols-3 gap-3 p-3 text-[12px] font-medium border-b border-border">
                          <span>Description</span><span>Date</span><span className="text-right">Amount</span>
                        </div>
                        {brokInvoices.slice(0, 6).map(inv => (
                          <div key={inv.id} className="grid grid-cols-3 gap-3 p-3 text-[12px] border-b border-border last:border-0">
                            <span>Invoice {inv.id}</span>
                            <span className="text-muted-foreground">{format(new Date(inv.issuedAt), "MMM d")}</span>
                            <span className="text-right num font-medium">${inv.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="invoices" className="mt-3 space-y-1.5">
                      {brokInvoices.map(inv => (
                        <div key={inv.id} className="rounded border border-border p-2.5 flex items-center justify-between text-[12px]">
                          <div className="flex items-center gap-2"><FileText className="size-3.5 text-muted-foreground" /><span className="font-mono">{inv.id}</span></div>
                          <StatusBadge status={inv.status} />
                          <span className="num font-medium">${inv.amount.toLocaleString()}</span>
                          <span className="text-muted-foreground text-[11px]">Due {format(new Date(inv.dueAt), "MMM d")}</span>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="tickets" className="mt-3 space-y-1">
                      {brokTickets.slice(0, 20).map(t => (
                        <div key={t.id} className="flex items-center justify-between rounded border border-border px-2.5 py-1.5 text-[12px]">
                          <span className="num">{t.section}-{t.row}-{t.seat}</span>
                          <StatusBadge status={t.status} />
                          <span className="num">${t.price}</span>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                  <Button className="w-full" size="sm"><DollarSign className="size-3.5 mr-1.5" /> Record payment</Button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <BrokerForm onSave={handleSave} onCancel={() => setOpenForm(false)} />
      </Dialog>
    </div>
  );
}

function BrokerForm({ onSave, onCancel }: { onSave: (b: Omit<Broker, "id">) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const submit = () => {
    if (!name || !company) { toast.error("Name and company required"); return; }
    onSave({ name, company, email, phone, totalTickets: 0, balance: 0, rating: 5, createdAt: new Date().toISOString() });
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New broker</DialogTitle><DialogDescription>Add a ticket supplier to your network.</DialogDescription></DialogHeader>
      <div className="space-y-3">
        <div><Label className="text-[12px]">Company</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
        <div><Label className="text-[12px]">Contact name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[12px]">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label className="text-[12px]">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit}>Add broker</Button>
      </DialogFooter>
    </DialogContent>
  );
}
