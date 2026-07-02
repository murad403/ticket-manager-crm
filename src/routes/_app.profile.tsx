import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/store/auth-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Section } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PasswordStrength } from "@/components/layout/PasswordStrength";
import { isPasswordValid } from "@/lib/rbac";
import { Upload, Loader2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — TicketManager CRM" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const session = useAuth((s) => s.session);
  const users = useAuth((s) => s.users);
  const updateProfile = useAuth((s) => s.updateProfile);
  const changePassword = useAuth((s) => s.changePassword);
  const user = session ? users.find((u) => u.id === session.userId)! : null;
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  if (!user) return null;

  const saveProfile = () => {
    if (!name.trim() || !email.trim()) return toast.error("Name and email are required.");
    setSavingProfile(true);
    setTimeout(() => {
      updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() });
      setSavingProfile(false);
      toast.success("Profile updated.");
    }, 500);
  };

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatarUrl: reader.result as string });
      toast.success("Avatar updated (mock).");
    };
    reader.readAsDataURL(file);
  };

  const savePassword = () => {
    if (!current) return toast.error("Enter your current password.");
    if (!isPasswordValid(next)) return toast.error("New password does not meet the requirements.");
    if (next !== confirm) return toast.error("Passwords do not match.");
    setSavingPw(true);
    setTimeout(() => {
      const res = changePassword(current, next);
      setSavingPw(false);
      if (res.ok) {
        toast.success("Password changed successfully.");
        setCurrent(""); setNext(""); setConfirm("");
      } else {
        toast.error(res.error ?? "Could not change password.");
      }
    }, 500);
  };

  return (
    <div>
      <PageHeader title="Profile & Security" description="Manage your account details and password" />

      <div className="flex items-center gap-4 mb-6 rounded-xl border border-border p-5">
        <div className="relative">
          <Avatar className="size-16">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-chart-1 to-chart-4 text-background">{user.avatar}</AvatarFallback>
          </Avatar>
          <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
            <Upload className="size-3" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatar} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold truncate">{user.name}</h2>
            <Badge variant="secondary">{user.role}</Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <p className="text-[12px] text-muted-foreground mt-1">
            Last login: {user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy · h:mm a") : "—"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Section title="Personal information" description="Update your name and contact details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Input value={user.role} disabled />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={saveProfile} disabled={savingProfile} className="gap-2">
                {savingProfile && <Loader2 className="size-4 animate-spin" />} Save changes
              </Button>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Section title="Change password" description="Choose a strong password to keep your account secure">
            <div className="max-w-md space-y-4">
              <div className="space-y-1.5">
                <Label>Current password</Label>
                <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label>New password</Label>
                <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="••••••••" />
                <div className="pt-1"><PasswordStrength password={next} /></div>
              </div>
              <div className="space-y-1.5">
                <Label>Confirm new password</Label>
                <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
                {confirm && next !== confirm && <p className="text-[11px] text-destructive">Passwords do not match.</p>}
              </div>
              <Button onClick={savePassword} disabled={savingPw} className="gap-2">
                {savingPw ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} Update password
              </Button>
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
