import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Section, StatusBadge, EmptyState } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Truck, CheckCircle2, XCircle, Send } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/delivery")({ component: DeliveryPage });

function DeliveryPage() {
  const orders = useCRM(s => s.orders);
  const customers = useCRM(s => s.customers);
  const events = useCRM(s => s.events);
  const updateOrder = useCRM(s => s.updateOrder);
  const addActivity = useCRM(s => s.addActivity);

  const pending = orders.filter(o => o.delivery === "pending" && o.status !== "cancelled");
  const delivered = orders.filter(o => o.delivery === "delivered");
  const revoked = orders.filter(o => o.delivery === "revoked");

  const markDelivered = (id: string) => {
    updateOrder(id, { delivery: "delivered" });
    addActivity({ type: "delivery", title: "Ticket delivered", description: `Order ${id}`, user: "Alex Chen" });
    toast.success("Marked as delivered");
  };

  const revoke = (id: string) => {
    updateOrder(id, { delivery: "revoked" });
    toast.success("Delivery revoked");
  };

  const renderTable = (list: typeof orders, showActions = false) => (
    <Section>
      {list.length === 0 ? (
        <EmptyState icon={<Truck className="size-5" />} title="Nothing here" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="text-left px-3 py-2 font-medium">Order</th>
                <th className="text-left px-3 py-2 font-medium">Customer</th>
                <th className="text-left px-3 py-2 font-medium">Event</th>
                <th className="text-left px-3 py-2 font-medium">Tickets</th>
                <th className="text-left px-3 py-2 font-medium">Total</th>
                <th className="text-left px-3 py-2 font-medium">Payment</th>
                <th className="text-left px-3 py-2 font-medium">Status</th>
                <th className="text-right px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {list.map(o => {
                const cus = customers.find(c => c.id === o.customerId);
                const evt = events.find(e => e.id === o.eventId);
                return (
                  <tr key={o.id} className="border-b border-border hover:bg-accent/40">
                    <td className="px-3 py-2 font-mono text-[11px]">{o.id}</td>
                    <td className="px-3 py-2 font-medium">{cus?.name}</td>
                    <td className="px-3 py-2 text-muted-foreground truncate max-w-[220px]">{evt?.name}</td>
                    <td className="px-3 py-2 num">{o.ticketIds.length}</td>
                    <td className="px-3 py-2 num">${o.total}</td>
                    <td className="px-3 py-2"><StatusBadge status={o.payment} /></td>
                    <td className="px-3 py-2"><StatusBadge status={o.delivery} /></td>
                    <td className="px-3 py-2 text-right">
                      {showActions ? (
                        <div className="flex gap-1 justify-end">
                          <Button variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => markDelivered(o.id)}>
                            <CheckCircle2 className="size-3 mr-1" /> Deliver
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-[11.5px]">
                            <Send className="size-3 mr-1" /> WhatsApp
                          </Button>
                        </div>
                      ) : o.delivery === "delivered" && (
                        <Button variant="ghost" size="sm" className="h-7 text-[11.5px] text-destructive" onClick={() => revoke(o.id)}>
                          <XCircle className="size-3 mr-1" /> Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );

  return (
    <div>
      <PageHeader title="Delivery" description="Track and manage ticket delivery workflow" />
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[11px] text-muted-foreground uppercase">Pending</div>
          <div className="text-[22px] font-semibold num text-warning">{pending.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[11px] text-muted-foreground uppercase">Delivered</div>
          <div className="text-[22px] font-semibold num text-success">{delivered.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[11px] text-muted-foreground uppercase">Revoked</div>
          <div className="text-[22px] font-semibold num text-destructive">{revoked.length}</div>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-3">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({delivered.length})</TabsTrigger>
          <TabsTrigger value="revoked">Revoked ({revoked.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">{renderTable(pending, true)}</TabsContent>
        <TabsContent value="delivered">{renderTable(delivered)}</TabsContent>
        <TabsContent value="revoked">{renderTable(revoked)}</TabsContent>
        <TabsContent value="history">
          <Section title="Delivery timeline">
            <ul className="divide-y divide-border">
              {[...delivered, ...revoked].slice(0, 15).map(o => {
                const cus = customers.find(c => c.id === o.customerId);
                return (
                  <li key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`size-8 rounded-full flex items-center justify-center ${o.delivery === "delivered" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {o.delivery === "delivered" ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium">{cus?.name} · {o.id}</div>
                      <div className="text-[11px] text-muted-foreground">{format(new Date(o.createdAt), "PPp")}</div>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(o.createdAt), { addSuffix: true })}</div>
                  </li>
                );
              })}
            </ul>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
