import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { StatusBadge, EmptyState, Section } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, LayoutGrid, List, CalendarDays, Edit, Trash2, MapPin, Music, Filter } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Event, EventCategory, EventStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/events")({ component: EventsPage });

function EventsPage() {
  const events = useCRM(s => s.events);
  const venues = useCRM(s => s.venues);
  const addEvent = useCRM(s => s.addEvent);
  const updateEvent = useCRM(s => s.updateEvent);
  const deleteEvent = useCRM(s => s.deleteEvent);
  const addActivity = useCRM(s => s.addActivity);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const perPage = 9;

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [toDelete, setToDelete] = useState<Event | null>(null);

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchQ = !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.artist.toLowerCase().includes(q.toLowerCase());
      const matchS = statusFilter === "all" || e.status === statusFilter;
      const matchC = catFilter === "all" || e.category === catFilter;
      return matchQ && matchS && matchC;
    });
  }, [events, q, statusFilter, catFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSave = (data: Omit<Event, "id">) => {
    if (editing) {
      updateEvent(editing.id, data);
      addActivity({ type: "event", title: "Event updated", description: data.name, user: "Alex Chen" });
      toast.success("Event updated");
    } else {
      addEvent(data);
      addActivity({ type: "event", title: "Event created", description: data.name, user: "Alex Chen" });
      toast.success("Event created");
    }
    setOpenForm(false); setEditing(null);
  };

  const handleDelete = () => {
    if (!toDelete) return;
    deleteEvent(toDelete.id);
    addActivity({ type: "event", title: "Event deleted", description: toDelete.name, user: "Alex Chen" });
    toast.success(`Deleted "${toDelete.name}"`);
    setToDelete(null);
  };

  return (
    <div>
      <PageHeader
        title="Events"
        description={`${events.length} events across ${venues.length} venues`}
        actions={
          <Button size="sm" className="h-8 gap-1.5" onClick={() => { setEditing(null); setOpenForm(true); }}>
            <Plus className="size-3.5" /> New event
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search events, artists…" className="pl-8 h-8" />
        </div>
        <Select value={catFilter} onValueChange={(v) => { setCatFilter(v); setPage(1); }}>
          <SelectTrigger className="h-8 w-[140px] text-[13px]"><Filter className="size-3.5 mr-1" /><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(["Concert", "Sports", "Theatre", "Comedy", "Festival"] as EventCategory[]).map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="h-8 w-[140px] text-[13px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="on-sale">On sale</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="sold-out">Sold out</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex rounded-md border border-border p-0.5">
          <button onClick={() => setView("grid")} className={`h-7 px-2 rounded ${view === "grid" ? "bg-accent" : ""}`}><LayoutGrid className="size-3.5" /></button>
          <button onClick={() => setView("list")} className={`h-7 px-2 rounded ${view === "list" ? "bg-accent" : ""}`}><List className="size-3.5" /></button>
        </div>
      </div>

      {paged.length === 0 ? (
        <EmptyState icon={<CalendarDays className="size-5" />} title="No events found" description="Try adjusting your filters or create a new event." />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map(e => {
            const venue = venues.find(v => v.id === e.venueId);
            return (
              <div key={e.id} className="group rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/30 transition-colors">
                <div className="relative h-32 overflow-hidden">
                  <img src={e.image} alt={e.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  <div className="absolute top-2 right-2"><StatusBadge status={e.status} /></div>
                  <div className="absolute bottom-2 left-3 text-[11px] text-white/90 font-medium">{e.category}</div>
                </div>
                <div className="p-3">
                  <div className="font-semibold text-[14px] truncate">{e.name}</div>
                  <div className="text-[12px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3" /> {venue?.name}, {venue?.city}
                  </div>
                  <div className="text-[12px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <CalendarDays className="size-3" /> {format(new Date(e.date), "EEE, MMM d, yyyy")}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div>
                      <div className="text-[10px] text-muted-foreground">From</div>
                      <div className="text-[13px] font-semibold num">${e.minPrice}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground">Available</div>
                      <div className="text-[13px] font-semibold num">{e.ticketsAvailable}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditing(e); setOpenForm(true); }}><Edit className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => setToDelete(e)}><Trash2 className="size-3.5" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Section>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="text-left px-4 py-2 font-medium">Event</th>
                  <th className="text-left px-4 py-2 font-medium">Category</th>
                  <th className="text-left px-4 py-2 font-medium">Venue</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Available</th>
                  <th className="text-left px-4 py-2 font-medium">Price</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {paged.map(e => {
                  const venue = venues.find(v => v.id === e.venueId);
                  return (
                    <tr key={e.id} className="border-b border-border hover:bg-accent/50">
                      <td className="px-4 py-2.5 font-medium flex items-center gap-2"><Music className="size-3.5 text-muted-foreground" /> {e.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{e.category}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{venue?.name}</td>
                      <td className="px-4 py-2.5 num">{format(new Date(e.date), "MMM d, yyyy")}</td>
                      <td className="px-4 py-2.5 num">{e.ticketsAvailable}</td>
                      <td className="px-4 py-2.5 num">${e.minPrice} – ${e.maxPrice}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={e.status} /></td>
                      <td className="px-4 py-2.5 text-right">
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditing(e); setOpenForm(true); }}><Edit className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => setToDelete(e)}><Trash2 className="size-3.5" /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-4 text-[12px]">
          <div className="text-muted-foreground">Page {page} of {pageCount} · {filtered.length} results</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" className="h-7" disabled={page === pageCount} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={openForm} onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}>
        <DialogTrigger asChild><span /></DialogTrigger>
        <EventForm event={editing} venues={venues} onSave={handleSave} onCancel={() => { setOpenForm(false); setEditing(null); }} />
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              "{toDelete?.name}" will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EventForm({ event, venues, onSave, onCancel }: {
  event: Event | null; venues: ReturnType<typeof useCRM.getState>["venues"];
  onSave: (e: Omit<Event, "id">) => void; onCancel: () => void;
}) {
  const [name, setName] = useState(event?.name ?? "");
  const [artist, setArtist] = useState(event?.artist ?? "");
  const [category, setCategory] = useState<EventCategory>(event?.category ?? "Concert");
  const [date, setDate] = useState(event?.date?.slice(0, 10) ?? "");
  const [venueId, setVenueId] = useState(event?.venueId ?? venues[0]?.id ?? "");
  const [status, setStatus] = useState<EventStatus>(event?.status ?? "on-sale");
  const [minPrice, setMinPrice] = useState(event?.minPrice ?? 50);
  const [maxPrice, setMaxPrice] = useState(event?.maxPrice ?? 250);
  const [ticketsAvailable, setTicketsAvailable] = useState(event?.ticketsAvailable ?? 100);

  const submit = () => {
    if (!name || !artist || !date || !venueId) { toast.error("Please fill all required fields"); return; }
    onSave({
      name, artist, category, date: new Date(date).toISOString(), venueId, status,
      image: event?.image ?? `https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=70`,
      ticketsAvailable, ticketsSold: event?.ticketsSold ?? 0, minPrice, maxPrice,
    });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{event ? "Edit event" : "Create event"}</DialogTitle>
        <DialogDescription>{event ? "Update event details." : "Add a new event to the catalog."}</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div><Label className="text-[12px]">Event name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Coldplay — World Tour 2026" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[12px]">Artist / team</Label><Input value={artist} onChange={(e) => setArtist(e.target.value)} /></div>
          <div>
            <Label className="text-[12px]">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as EventCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Concert", "Sports", "Theatre", "Comedy", "Festival"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[12px]">Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div>
            <Label className="text-[12px]">Venue</Label>
            <Select value={venueId} onValueChange={setVenueId}>
              <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
              <SelectContent>{venues.map(v => <SelectItem key={v.id} value={v.id}>{v.name} · {v.city}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-[12px]">Min price ($)</Label><Input type="number" value={minPrice} onChange={(e) => setMinPrice(+e.target.value)} /></div>
          <div><Label className="text-[12px]">Max price ($)</Label><Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} /></div>
          <div><Label className="text-[12px]">Available</Label><Input type="number" value={ticketsAvailable} onChange={(e) => setTicketsAvailable(+e.target.value)} /></div>
        </div>
        <div>
          <Label className="text-[12px]">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as EventStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="on-sale">On sale</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="sold-out">Sold out</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit}>{event ? "Save changes" : "Create event"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

// intentionally unused
void Textarea;
