import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, Ticket, FileImage, RotateCcw, XCircle, CheckCheck, Check, MessageCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/whatsapp")({ component: WhatsAppPage });

const TEMPLATES = [
  "Your tickets are ready! Sending them now.",
  "Payment received. Thank you!",
  "Here's your PKPass for the event.",
  "Please confirm your seat preference.",
];

function WhatsAppPage() {
  const conversations = useCRM(s => s.conversations);
  const customers = useCRM(s => s.customers);
  const sendMessage = useCRM(s => s.sendMessage);

  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string>(conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  const filtered = conversations.filter(c => {
    const cus = customers.find(x => x.id === c.customerId);
    return !q || cus?.name.toLowerCase().includes(q.toLowerCase());
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const active = conversations.find(c => c.id === activeId);
  const activeCustomer = active ? customers.find(c => c.id === active.customerId) : null;

  const send = (text: string, type: "text" | "ticket" | "pkpass" = "text") => {
    if (!text.trim() || !active) return;
    sendMessage(active.id, text, type);
    setDraft("");
    toast.success(type === "text" ? "Message sent" : type === "ticket" ? "Ticket link sent" : "PKPass sent");
    // simulate incoming reply
    setTimeout(() => {
      const state = useCRM.getState();
      state.conversations.find(c => c.id === active.id) && useCRM.setState((s) => ({
        conversations: s.conversations.map(c => c.id === active.id ? {
          ...c, messages: [...c.messages, {
            id: `msg_${Date.now()}`, conversationId: active.id, direction: "in",
            text: "Got it, thanks!", timestamp: new Date().toISOString(), status: "read", type: "text",
          }], lastMessage: "Got it, thanks!", updatedAt: new Date().toISOString(),
        } : c),
      }));
    }, 1600);
  };

  return (
    <div>
      <PageHeader title="WhatsApp" description="Send tickets, passes, and updates to customers" />
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-3 h-[calc(100vh-11rem)] rounded-xl border border-border bg-card overflow-hidden">
        {/* Conversation list */}
        <div className="border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats…" className="pl-8 h-8" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(c => {
              const cus = customers.find(x => x.id === c.customerId);
              const isActive = c.id === activeId;
              return (
                <button key={c.id} onClick={() => setActiveId(c.id)}
                  className={cn("w-full flex items-start gap-2.5 px-3 py-2.5 text-left border-b border-border hover:bg-accent/50 transition-colors",
                    isActive && "bg-accent")}>
                  <div className="size-9 rounded-full bg-gradient-to-br from-chart-2 to-chart-3 flex items-center justify-center text-[11px] font-semibold text-background shrink-0">
                    {cus?.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium truncate">{cus?.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{formatDistanceToNow(new Date(c.updatedAt), { addSuffix: false })}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-[11.5px] text-muted-foreground truncate">{c.lastMessage}</span>
                      {c.unread > 0 && <span className="text-[10px] bg-success text-success-foreground rounded-full px-1.5 py-0.5 font-semibold shrink-0">{c.unread}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat panel */}
        {active ? (
          <div className="flex flex-col min-w-0">
            <div className="h-14 border-b border-border px-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-gradient-to-br from-chart-2 to-chart-3 flex items-center justify-center text-[11px] font-semibold text-background">
                  {activeCustomer?.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-[13px] font-medium">{activeCustomer?.name}</div>
                  <div className="text-[11px] text-muted-foreground">{activeCustomer?.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 text-[11.5px]"><RotateCcw className="size-3 mr-1" /> Resend</Button>
                <Button variant="outline" size="sm" className="h-7 text-[11.5px] text-destructive"><XCircle className="size-3 mr-1" /> Revoke</Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-muted/20 to-transparent">
              {active.messages.map(m => (
                <div key={m.id} className={cn("flex", m.direction === "out" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[70%] rounded-2xl px-3 py-2 text-[13px]",
                    m.direction === "out" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm")}>
                    {m.type === "ticket" ? (
                      <div className="flex items-center gap-2"><Ticket className="size-3.5" /> <span className="font-medium">Ticket link sent</span></div>
                    ) : m.type === "pkpass" ? (
                      <div className="flex items-center gap-2"><FileImage className="size-3.5" /> <span className="font-medium">PKPass attached</span></div>
                    ) : (
                      <span>{m.text}</span>
                    )}
                    <div className={cn("text-[9.5px] mt-1 flex items-center gap-0.5 justify-end",
                      m.direction === "out" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {format(new Date(m.timestamp), "HH:mm")}
                      {m.direction === "out" && (m.status === "read" ? <CheckCheck className="size-2.5" /> : <Check className="size-2.5" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-[11.5px]">Templates</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Quick replies</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {TEMPLATES.map((t, i) => <DropdownMenuItem key={i} onClick={() => setDraft(t)}>{t}</DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => send("Ticket link", "ticket")}>
                  <Ticket className="size-3 mr-1" /> Send ticket
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => send("PKPass", "pkpass")}>
                  <FileImage className="size-3 mr-1" /> Send PKPass
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(draft)}
                  placeholder="Type a message…" className="h-9" />
                <Button size="sm" className="h-9 gap-1.5" onClick={() => send(draft)}><Send className="size-3.5" /> Send</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-muted-foreground text-[13px]">
            <MessageCircle className="size-5 mr-2" /> Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
