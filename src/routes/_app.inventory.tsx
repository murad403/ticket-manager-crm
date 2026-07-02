import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { StatusBadge, Section, EmptyState } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Plus, Search, Trash2, Ticket as TicketIcon, ArrowUpDown, Copy, ExternalLink, Filter, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Ticket, TicketStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/inventory")({ component: InventoryPage });

function InventoryPage() {
  const tickets = useCRM(s => s.tickets);
  const events = useCRM(s => s.events);
  const brokers = useCRM(s => s.brokers);
  const addTicket = useCRM(s => s.addTicket);
  const deleteTicket = useCRM(s => s.deleteTicket);
  const bulkDelete = useCRM(s => s.bulkDeleteTickets);
  const addActivity = useCRM(s => s.addActivity);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"addedAt" | "price" | "section">("addedAt");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openForm, setOpenForm] = useState(false);
  const [detailFor, setDetailFor] = useState<Ticket | null>(null);

  const filtered = useMemo(() => {
    const arr = tickets.filter(t => {
      const matchQ = !q || t.section.toLowerCase().includes(q.toLowerCase()) || t.barcode.includes(q) || t.id.includes(q);
      const matchS = statusFilter === "all" || t.status === statusFilter;
      const matchE = eventFilter === "all" || t.eventId === eventFilter;
      return matchQ && matchS && matchE;
    });
    arr.sort((a, b) => {
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "section") return a.section.localeCompare(b.section);
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });
    return arr;
  }, [tickets, q, statusFilter, eventFilter, sortBy]);

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(t => t.id)));
  };

  const handleBulkDelete = () => {
    bulkDelete([...selected]);
    toast.success(`Deleted ${selected.size} tickets`);
    setSelected(new Set());
  };

  const handleAdd = (t: Omit<Ticket, "id">) => {
    // Duplicate validation frontend
    const dup = tickets.find(x => x.eventId === t.eventId && x.section === t.section && x.row === t.row && x.seat === t.seat);
    if (dup) { toast.error("Duplicate seat", { description: `${t.section}-${t.row}-${t.seat} already exists for this event.` }); return; }
    addTicket(t);
    addActivity({ type: "ticket", title: "Ticket added", description: `${t.section}-${t.row}-${t.seat}`, user: "Alex Chen" });
    toast.success("Ticket added to inventory");
    setOpenForm(false);
  };

  return (
    <div>
      <PageHeader
        title="Inventory"
        description={`${tickets.length} tickets · ${tickets.filter(t => t.status === "available").length} available`}
        actions={<Button size="sm" className="h-8 gap-1.5" onClick={() => setOpenForm(true)}><Plus className="size-3.5" /> Add ticket</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {(["available", "reserved", "sold", "delivered"] as TicketStatus[]).map(s => {
          const count = tickets.filter(t => t.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(s === statusFilter ? "all" : s)}
              className={`text-left rounded-lg border p-3 transition-colors ${statusFilter === s ? "border-foreground/50 bg-accent" : "border-border bg-card hover:border-foreground/20"}`}>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{s}</div>
              <div className="text-[20px] font-semibold num mt-0.5">{count}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by section, barcode, or ID…" className="pl-8 h-8" />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="h-8 w-[200px] text-[13px]"><Filter className="size-3.5 mr-1" /><SelectValue placeholder="All events" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            {events.map(e => <SelectItem key={e.id} value={e.id}>{e.name.slice(0, 40)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="h-8 w-[140px] text-[13px]"><ArrowUpDown className="size-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="addedAt">Newest</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="section">Section</SelectItem>
          </SelectContent>
        </Select>
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" className="h-8 gap-1.5" onClick={handleBulkDelete}>
            <Trash2 className="size-3.5" /> Delete {selected.size}
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<TicketIcon className="size-5" />} title="No tickets found" description="Try changing your filters." />
      ) : (
        <Section>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="px-3 py-2 w-8"><Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} /></th>
                  <th className="text-left px-3 py-2 font-medium">Event</th>
                  <th className="text-left px-3 py-2 font-medium">Seat</th>
                  <th className="text-left px-3 py-2 font-medium">Source</th>
                  <th className="text-left px-3 py-2 font-medium">Broker</th>
                  <th className="text-left px-3 py-2 font-medium">Cost</th>
                  <th className="text-left px-3 py-2 font-medium">Price</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="text-right px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map(t => {
                  const event = events.find(e => e.id === t.eventId);
                  const broker = brokers.find(b => b.id === t.brokerId);
                  return (
                    <tr key={t.id} className="border-b border-border hover:bg-accent/40 group">
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}><Checkbox checked={selected.has(t.id)} onCheckedChange={() => toggle(t.id)} /></td>
                      <td className="px-3 py-2 cursor-pointer" onClick={() => setDetailFor(t)}>
                        <div className="font-medium truncate max-w-[220px]">{event?.name}</div>
                        <div className="text-[11px] text-muted-foreground">{event && format(new Date(event.date), "MMM d, yyyy")}</div>
                      </td>
                      <td className="px-3 py-2 num">{t.section}-{t.row}-{t.seat}</td>
                      <td className="px-3 py-2 text-muted-foreground">{t.source}</td>
                      <td className="px-3 py-2 text-muted-foreground truncate max-w-[140px]">{broker?.company}</td>
                      <td className="px-3 py-2 num">${t.cost}</td>
                      <td className="px-3 py-2 num font-medium">${t.price}</td>
                      <td className="px-3 py-2"><StatusBadge status={t.status} /></td>
                      <td className="px-3 py-2 text-right">
                        <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => { deleteTicket(t.id); toast.success("Ticket deleted"); }}><Trash2 className="size-3.5" /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 100 && (
            <div className="px-4 py-2 text-[11px] text-muted-foreground border-t border-border">
              Showing 100 of {filtered.length}. Refine filters to see more.
            </div>
          )}
        </Section>
      )}

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <TicketForm events={events} brokers={brokers} onSave={handleAdd} onCancel={() => setOpenForm(false)} />
      </Dialog>

      <Sheet open={!!detailFor} onOpenChange={(o) => !o && setDetailFor(null)}>
        <SheetContent className="sm:max-w-md">
          {detailFor && (() => {
            const event = events.find(e => e.id === detailFor.eventId);
            const broker = brokers.find(b => b.id === detailFor.brokerId);
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2"><TicketIcon className="size-4" /> Ticket {detailFor.id}</SheetTitle>
                  <SheetDescription>{event?.name}</SheetDescription>
                </SheetHeader>
                <div className="px-4 space-y-4">
                  <div className="rounded-lg border border-border bg-muted/40 p-4">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Seat</div>
                    <div className="text-[24px] font-semibold num">{detailFor.section} · Row {detailFor.row} · Seat {detailFor.seat}</div>
                  </div>
                  <Row label="Status"><StatusBadge status={detailFor.status} /></Row>
                  <Row label="Source">{detailFor.source}</Row>
                  <Row label="Broker">{broker?.company} · {broker?.name}</Row>
                  <Row label="Cost">${detailFor.cost}</Row>
                  <Row label="Selling price">${detailFor.price}</Row>
                  <Row label="Margin">${detailFor.price - detailFor.cost} ({Math.round(((detailFor.price - detailFor.cost) / detailFor.price) * 100)}%)</Row>
                  <Row label="Barcode"><code className="text-[11px] font-mono">{detailFor.barcode}</code></Row>
                  <Row label="PKPass">{detailFor.hasPkPass ? <span className="text-success">Available</span> : <span className="text-muted-foreground">Not generated</span>}</Row>
                  <Row label="Ticket link">
                    <a href={detailFor.ticketLink} target="_blank" rel="noreferrer" className="text-info hover:underline text-[12px] inline-flex items-center gap-1">
                      Open <ExternalLink className="size-3" />
                    </a>
                  </Row>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { navigator.clipboard.writeText(detailFor.barcode); toast.success("Barcode copied"); }}>
                      <Copy className="size-3 mr-1.5" /> Copy barcode
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-destructive" onClick={() => { deleteTicket(detailFor.id); setDetailFor(null); toast.success("Ticket deleted"); }}>
                      <Trash2 className="size-3 mr-1.5" /> Delete
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* keep unused imports referenced */}
      <span style={{ display: "none" }}><AlertTriangle /></span>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-[13px] py-1.5 border-b border-border">
      <span className="text-muted-foreground text-[12px]">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

function TicketForm({ events, brokers, onSave, onCancel }: {
  events: ReturnType<typeof useCRM.getState>["events"];
  brokers: ReturnType<typeof useCRM.getState>["brokers"];
  onSave: (t: Omit<Ticket, "id">) => void; onCancel: () => void;
}) {
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [section, setSection] = useState("A");
  const [row, setRow] = useState("A");
  const [seat, setSeat] = useState("1");
  const [price, setPrice] = useState(150);
  const [cost, setCost] = useState(80);
  const [brokerId, setBrokerId] = useState(brokers[0]?.id ?? "");
  const [source, setSource] = useState("Ticketmaster");
  const [hasPkPass, setHasPkPass] = useState(false);

  const submit = () => {
    if (!eventId || !section || !seat) { toast.error("Fill required fields"); return; }
    onSave({
      eventId, section, row, seat, price, cost, brokerId, source, hasPkPass,
      status: "available",
      barcode: `BC${Math.floor(Math.random() * 900000000) + 100000000}`,
      ticketLink: `https://tix.example.com/t/${Math.floor(Math.random() * 900000) + 100000}`,
      addedAt: new Date().toISOString(),
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add ticket to inventory</DialogTitle>
        <DialogDescription>Duplicate seats will be blocked automatically.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label className="text-[12px]">Event</Label>
          <Select value={eventId} onValueChange={setEventId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{events.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-[12px]">Section</Label><Input value={section} onChange={(e) => setSection(e.target.value)} /></div>
          <div><Label className="text-[12px]">Row</Label><Input value={row} onChange={(e) => setRow(e.target.value)} /></div>
          <div><Label className="text-[12px]">Seat</Label><Input value={seat} onChange={(e) => setSeat(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[12px]">Cost ($)</Label><Input type="number" value={cost} onChange={(e) => setCost(+e.target.value)} /></div>
          <div><Label className="text-[12px]">Selling price ($)</Label><Input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[12px]">Broker</Label>
            <Select value={brokerId} onValueChange={setBrokerId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{brokers.map(b => <SelectItem key={b.id} value={b.id}>{b.company}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[12px]">Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Ticketmaster", "AXS", "See Tickets", "Live Nation", "Broker Direct", "Marketplace"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-[13px]">
          <Checkbox checked={hasPkPass} onCheckedChange={(v) => setHasPkPass(v === true)} />
          Has PKPass available
        </label>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit}>Add ticket</Button>
      </DialogFooter>
    </DialogContent>
  );
}
