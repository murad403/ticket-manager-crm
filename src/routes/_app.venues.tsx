import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Section, EmptyState } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, MapPin, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Venue } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/venues")({ component: VenuesPage });

function VenuesPage() {
  const venues = useCRM(s => s.venues);
  const events = useCRM(s => s.events);
  const addVenue = useCRM(s => s.addVenue);
  const updateVenue = useCRM(s => s.updateVenue);
  const deleteVenue = useCRM(s => s.deleteVenue);

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);
  const [toDelete, setToDelete] = useState<Venue | null>(null);

  const filtered = useMemo(() => venues.filter(v =>
    (!q || v.name.toLowerCase().includes(q.toLowerCase()) || v.city.toLowerCase().includes(q.toLowerCase())) &&
    (typeFilter === "all" || v.type === typeFilter)
  ), [venues, q, typeFilter]);

  const handleSave = (data: Omit<Venue, "id">) => {
    if (editing) { updateVenue(editing.id, data); toast.success("Venue updated"); }
    else { addVenue(data); toast.success("Venue created"); }
    setOpenForm(false); setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Venues"
        description={`${venues.length} venues in your catalog`}
        actions={<Button size="sm" className="h-8 gap-1.5" onClick={() => { setEditing(null); setOpenForm(true); }}><Plus className="size-3.5" /> New venue</Button>}
      />

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search venues by name or city…" className="pl-8 h-8" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[140px] text-[13px]"><Filter className="size-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Arena">Arena</SelectItem>
            <SelectItem value="Stadium">Stadium</SelectItem>
            <SelectItem value="Theatre">Theatre</SelectItem>
            <SelectItem value="Amphitheatre">Amphitheatre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<MapPin className="size-5" />} title="No venues" description="Add your first venue to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(v => {
            const evCount = events.filter(e => e.venueId === v.id).length;
            return (
              <div key={v.id} className="rounded-xl border border-border bg-card p-4 hover:border-foreground/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold truncate">{v.name}</div>
                    <div className="text-[12px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3" /> {v.city}, {v.country}
                    </div>
                  </div>
                  <span className="text-[10.5px] font-medium bg-muted px-1.5 py-0.5 rounded border border-border">{v.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                  <div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Capacity</div><div className="text-[13px] font-semibold num">{v.capacity.toLocaleString()}</div></div>
                  <div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Events</div><div className="text-[13px] font-semibold num">{evCount}</div></div>
                </div>
                <div className="flex gap-1 mt-3">
                  <Button variant="outline" size="sm" className="h-7 flex-1" onClick={() => { setEditing(v); setOpenForm(true); }}><Edit className="size-3 mr-1.5" /> Edit</Button>
                  <Button variant="outline" size="sm" className="h-7 text-destructive" onClick={() => setToDelete(v)}><Trash2 className="size-3" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={openForm} onOpenChange={(o) => { setOpenForm(o); if (!o) setEditing(null); }}>
        <VenueForm venue={editing} onSave={handleSave} onCancel={() => { setOpenForm(false); setEditing(null); }} />
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete venue?</AlertDialogTitle>
            <AlertDialogDescription>"{toDelete?.name}" will be removed permanently.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (toDelete) { deleteVenue(toDelete.id); toast.success("Venue deleted"); setToDelete(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Section import used above via <Section>? not; keep referenced */}
      <span style={{ display: "none" }}><Section>_</Section></span>
    </div>
  );
}

function VenueForm({ venue, onSave, onCancel }: { venue: Venue | null; onSave: (v: Omit<Venue, "id">) => void; onCancel: () => void }) {
  const [name, setName] = useState(venue?.name ?? "");
  const [city, setCity] = useState(venue?.city ?? "");
  const [country, setCountry] = useState(venue?.country ?? "");
  const [capacity, setCapacity] = useState(venue?.capacity ?? 10000);
  const [type, setType] = useState(venue?.type ?? "Arena");
  const [address, setAddress] = useState(venue?.address ?? "");
  const submit = () => {
    if (!name || !city) { toast.error("Name and city are required"); return; }
    onSave({ name, city, country, capacity, type, address });
  };
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{venue ? "Edit venue" : "Create venue"}</DialogTitle>
        <DialogDescription>Manage the venues you sell tickets for.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div><Label className="text-[12px]">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[12px]">City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <div><Label className="text-[12px]">Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
        </div>
        <div><Label className="text-[12px]">Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[12px]">Capacity</Label><Input type="number" value={capacity} onChange={(e) => setCapacity(+e.target.value)} /></div>
          <div>
            <Label className="text-[12px]">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Arena", "Stadium", "Theatre", "Amphitheatre"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit}>{venue ? "Save changes" : "Create venue"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
