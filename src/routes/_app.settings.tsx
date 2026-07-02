import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCRM } from "@/store/crm-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Section } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, RotateCcw, Building2, Users as UsersIcon, Palette, Bell, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

function SettingsPage() {
  const theme = useCRM(s => s.theme);
  const setTheme = useCRM(s => s.setTheme);
  const users = useCRM(s => s.users);
  const reset = useCRM(s => s.reset);

  const [bizName, setBizName] = useState("TicketManager LLC");
  const [bizEmail, setBizEmail] = useState("hello@ticketmanager.com");
  const [bizPhone, setBizPhone] = useState("+1 555 010 4224");
  const [bizAddress, setBizAddress] = useState("221B Broadway, New York, NY 10007");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifWa, setNotifWa] = useState(true);

  const [template1, setTemplate1] = useState("Hi {name}, your tickets for {event} are ready! Sending them now.");
  const [template2, setTemplate2] = useState("Thank you {name}! Payment received for order {order}.");

  return (
    <div>
      <PageHeader title="Settings" description="Configure your workspace, team, and preferences" />
      <Tabs defaultValue="business">
        <TabsList className="mb-4">
          <TabsTrigger value="business"><Building2 className="size-3.5 mr-1.5" />Business</TabsTrigger>
          <TabsTrigger value="users"><UsersIcon className="size-3.5 mr-1.5" />Users</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="size-3.5 mr-1.5" />Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="size-3.5 mr-1.5" />Notifications</TabsTrigger>
          <TabsTrigger value="templates"><MessageSquare className="size-3.5 mr-1.5" />Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Section title="Business information">
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><Label className="text-[12px]">Business name</Label><Input value={bizName} onChange={(e) => setBizName(e.target.value)} /></div>
              <div><Label className="text-[12px]">Email</Label><Input value={bizEmail} onChange={(e) => setBizEmail(e.target.value)} /></div>
              <div><Label className="text-[12px]">Phone</Label><Input value={bizPhone} onChange={(e) => setBizPhone(e.target.value)} /></div>
              <div><Label className="text-[12px]">Address</Label><Input value={bizAddress} onChange={(e) => setBizAddress(e.target.value)} /></div>
              <div>
                <Label className="text-[12px]">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["USD", "EUR", "GBP", "CAD", "AUD"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[12px]">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-full flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => { reset(); toast.success("Data reset to seed"); }}><RotateCcw className="size-3.5 mr-1.5" /> Reset demo data</Button>
                <Button size="sm" onClick={() => toast.success("Settings saved")}>Save changes</Button>
              </div>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="users">
          <Section title="Team members" actions={<Button size="sm" className="h-7">Invite user</Button>}>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="text-left px-3 py-2 font-medium">Name</th>
                  <th className="text-left px-3 py-2 font-medium">Email</th>
                  <th className="text-left px-3 py-2 font-medium">Role</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-full bg-gradient-to-br from-chart-1 to-chart-4 flex items-center justify-center text-[10px] font-semibold text-background">{u.avatar}</div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{u.email}</td>
                    <td className="px-3 py-2"><span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10.5px] font-medium">{u.role}</span></td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 text-[11.5px] ${u.active ? "text-success" : "text-muted-foreground"}`}>
                        <span className={`size-1.5 rounded-full ${u.active ? "bg-success" : "bg-muted-foreground"}`} />
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </TabsContent>

        <TabsContent value="appearance">
          <Section title="Appearance">
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-[13px] font-medium">Theme</Label>
                <p className="text-[11.5px] text-muted-foreground mb-3">Choose how TicketManager looks to you.</p>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button onClick={() => setTheme("light")} className={`rounded-lg border-2 p-3 text-left transition-colors ${theme === "light" ? "border-foreground" : "border-border hover:border-foreground/40"}`}>
                    <div className="h-16 rounded bg-white border border-neutral-200 mb-2 flex items-center justify-center"><Sun className="size-5 text-neutral-500" /></div>
                    <div className="text-[13px] font-medium">Light</div>
                  </button>
                  <button onClick={() => setTheme("dark")} className={`rounded-lg border-2 p-3 text-left transition-colors ${theme === "dark" ? "border-foreground" : "border-border hover:border-foreground/40"}`}>
                    <div className="h-16 rounded bg-neutral-900 border border-neutral-700 mb-2 flex items-center justify-center"><Moon className="size-5 text-neutral-300" /></div>
                    <div className="text-[13px] font-medium">Dark</div>
                  </button>
                </div>
              </div>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="notifications">
          <Section title="Notification preferences">
            <div className="p-4 space-y-3">
              <NotifRow label="Email notifications" description="Receive summaries via email" checked={notifEmail} onChange={setNotifEmail} />
              <NotifRow label="Push notifications" description="Get real-time push alerts" checked={notifPush} onChange={setNotifPush} />
              <NotifRow label="SMS alerts" description="Critical alerts sent via SMS" checked={notifSms} onChange={setNotifSms} />
              <NotifRow label="WhatsApp notifications" description="Get order updates on WhatsApp" checked={notifWa} onChange={setNotifWa} />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="templates">
          <Section title="Message templates">
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-[12px]">Ticket ready</Label>
                <Textarea rows={2} value={template1} onChange={(e) => setTemplate1(e.target.value)} className="font-mono text-[12.5px]" />
              </div>
              <div>
                <Label className="text-[12px]">Payment received</Label>
                <Textarea rows={2} value={template2} onChange={(e) => setTemplate2(e.target.value)} className="font-mono text-[12.5px]" />
              </div>
              <div className="text-[11px] text-muted-foreground">Available variables: {`{name}`}, {`{event}`}, {`{order}`}, {`{amount}`}, {`{date}`}</div>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => toast.success("Templates saved")}>Save templates</Button>
              </div>
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotifRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div>
        <div className="text-[13px] font-medium">{label}</div>
        <div className="text-[11.5px] text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
