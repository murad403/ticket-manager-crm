import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/store/auth-store";
import { PageHeader } from "@/components/layout/TopBar";
import { Section } from "@/components/ui-ext/primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ROLES, ALL_PERMISSIONS, PERMISSION_LABELS, type Permission, type Role,
} from "@/lib/rbac";
import { RotateCcw, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/roles")({
  head: () => ({ meta: [{ title: "Role Management — TicketManager CRM" }] }),
  component: RolesPage,
});

function RolesPage() {
  const rolePermissions = useAuth((s) => s.rolePermissions);
  const users = useAuth((s) => s.users);
  const setRolePermission = useAuth((s) => s.setRolePermission);
  const resetRolePermissions = useAuth((s) => s.resetRolePermissions);

  const toggle = (role: Role, perm: Permission, value: boolean) => {
    setRolePermission(role, perm, value);
    toast.success(`${role} · ${PERMISSION_LABELS[perm]} ${value ? "enabled" : "disabled"}.`);
  };

  return (
    <div>
      <PageHeader
        title="Role Management"
        description="Configure the permission matrix for each role"
        actions={
          <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => { resetRolePermissions(); toast.success("Permissions reset to defaults."); }}>
            <RotateCcw className="size-3.5" /> Reset to defaults
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {ROLES.map((role) => {
          const count = users.filter((u) => u.role === role).length;
          const enabled = ALL_PERMISSIONS.filter((p) => rolePermissions[role][p]).length;
          return (
            <div key={role} className="rounded-xl border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{role}</h3>
                    <Badge variant="secondary" className="gap-1"><Users className="size-3" /> {count}</Badge>
                  </div>
                  <p className="text-[12px] text-muted-foreground">{enabled} of {ALL_PERMISSIONS.length} permissions enabled</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Section title="Permission matrix" description="Toggle capabilities granted to each role">
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Permission</TableHead>
                {ROLES.map((r) => <TableHead key={r} className="text-center">{r}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALL_PERMISSIONS.map((perm) => (
                <TableRow key={perm}>
                  <TableCell className="text-[13px] font-medium">{PERMISSION_LABELS[perm]}</TableCell>
                  {ROLES.map((role) => (
                    <TableCell key={role} className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={rolePermissions[role][perm]}
                          onCheckedChange={(v) => toggle(role, perm, v)}
                          disabled={role === "Owner"}
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          Owner permissions are locked to full access and cannot be reduced.
        </p>
      </Section>
    </div>
  );
}
