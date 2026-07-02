import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/store/auth-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Section, StatCard } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES, type Role } from "@/lib/rbac";
import type { AppUser } from "@/lib/mock-data";
import { Plus, Search, MoreHorizontal, KeyRound, UserCog, Users as UsersIcon, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "User Management — TicketManager CRM" }] }),
  component: UsersPage,
});

function UsersPage() {
  const users = useAuth((s) => s.users);
  const session = useAuth((s) => s.session);
  const addUser = useAuth((s) => s.addUser);
  const updateUser = useAuth((s) => s.updateUser);
  const toggleUserActive = useAuth((s) => s.toggleUserActive);
  const resetUserPassword = useAuth((s) => s.resetUserPassword);
  const deleteUser = useAuth((s) => s.deleteUser);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editing, setEditing] = useState<AppUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Staff" as Role, password: "", active: true });
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  const filtered = useMemo(() =>
    users.filter((u) =>
      (roleFilter === "all" || u.role === roleFilter) &&
      (statusFilter === "all" || (statusFilter === "active" ? u.active : !u.active)) &&
      (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
    ), [users, q, roleFilter, statusFilter]);

  const openCreate = () => {
    setForm({ name: "", email: "", phone: "", role: "Staff", password: "", active: true });
    setCreating(true);
  };
  const openEdit = (u: AppUser) => {
    setForm({ name: u.name, email: u.email, phone: u.phone ?? "", role: u.role, password: "", active: u.active });
    setEditing(u);
  };

  const submitCreate = () => {
    if (!form.name || !form.email || !form.password) return toast.error("Name, email and password are required.");
    if (users.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) return toast.error("A user with that email already exists.");
    addUser({ name: form.name, email: form.email, phone: form.phone, role: form.role, password: form.password, active: form.active, avatar: "" });
    toast.success("User created.");
    setCreating(false);
  };

  const submitEdit = () => {
    if (!editing) return;
    if (!form.name || !form.email) return toast.error("Name and email are required.");
    updateUser(editing.id, { name: form.name, email: form.email, phone: form.phone, role: form.role, active: form.active });
    toast.success("User updated.");
    setEditing(null);
  };

  const doResetPassword = (u: AppUser) => {
    const temp = "Temp@" + Math.floor(1000 + Math.random() * 9000);
    resetUserPassword(u.id, temp);
    toast.success(`Password reset. Temporary password: ${temp}`, { duration: 8000 });
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Create, manage and control access for workspace users"
        actions={<Button size="sm" className="h-8 gap-1.5" onClick={openCreate}><Plus className="size-3.5" /> Add user</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total users" value={String(users.length)} icon={<UsersIcon className="size-4" />} />
        <StatCard label="Active" value={String(users.filter(u => u.active).length)} />
        <StatCard label="Owners" value={String(users.filter(u => u.role === "Owner").length)} />
        <StatCard label="Staff" value={String(users.filter(u => u.role === "Staff").length)} />
      </div>

      <Section title="All users">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="pl-8 h-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.name} />}
                        <AvatarFallback className="text-[11px] font-semibold bg-gradient-to-br from-chart-1 to-chart-4 text-background">{u.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium truncate">{u.name}{session?.userId === u.id && <span className="text-muted-foreground font-normal"> (you)</span>}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={u.active ? "default" : "outline"} className={u.active ? "bg-success/15 text-success hover:bg-success/15" : "text-muted-foreground"}>
                      {u.active ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">{u.lastLogin ? format(new Date(u.lastLogin), "MMM d, yyyy") : "—"}</TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">{format(new Date(u.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(u)}><UserCog className="size-4" /> Edit user</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => doResetPassword(u)}><KeyRound className="size-4" /> Reset password</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { toggleUserActive(u.id); toast.success(u.active ? "User disabled." : "User enabled."); }} disabled={session?.userId === u.id}>
                          {u.active ? <><ShieldOff className="size-4" /> Disable</> : <><ShieldCheck className="size-4" /> Enable</>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" disabled={session?.userId === u.id} onClick={() => setDeleteTarget(u)}>
                          <Trash2 className="size-4" /> Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No users found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Section>

      {/* Create dialog */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>Create a new workspace account.</DialogDescription>
          </DialogHeader>
          <UserFormFields form={form} setForm={setForm} showPassword />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={submitCreate}>Create user</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Update details and assign a role.</DialogDescription>
          </DialogHeader>
          <UserFormFields form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={submitEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-medium text-foreground">{deleteTarget?.name}</span> (mock). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteTarget) { deleteUser(deleteTarget.id); toast.success("User deleted."); } setDeleteTarget(null); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UserFormFields({ form, setForm, showPassword }: {
  form: { name: string; email: string; phone: string; role: Role; password: string; active: boolean };
  setForm: (f: typeof form) => void;
  showPassword?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Full name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.active ? "active" : "disabled"} onValueChange={(v) => setForm({ ...form, active: v === "active" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {showPassword && (
        <div className="space-y-1.5">
          <Label>Temporary password</Label>
          <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Set an initial password" />
        </div>
      )}
    </div>
  );
}
