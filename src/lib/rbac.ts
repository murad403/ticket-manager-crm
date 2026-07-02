export type Role = "Owner" | "Staff";

export type Permission =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "assign"
  | "deliver"
  | "revoke"
  | "export"
  | "manageUsers"
  | "manageRoles"
  | "manageSettings";

export const PERMISSION_LABELS: Record<Permission, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  assign: "Assign",
  deliver: "Deliver",
  revoke: "Revoke",
  export: "Export",
  manageUsers: "Manage Users",
  manageRoles: "Manage Roles",
  manageSettings: "Manage Settings",
};

export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as Permission[];

export const ROLES: Role[] = ["Owner", "Staff"];

// Default permission matrix. Editable in Role Management (persisted).
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Record<Permission, boolean>> = {
  Owner: {
    view: true, create: true, edit: true, delete: true, assign: true,
    deliver: true, revoke: true, export: true, manageUsers: true,
    manageRoles: true, manageSettings: true,
  },
  Staff: {
    view: true, create: true, edit: true, delete: false, assign: true,
    deliver: true, revoke: true, export: false, manageUsers: false,
    manageRoles: false, manageSettings: false,
  },
};

// Which roles may access each route (by pathname prefix, no leading _app).
export const ROUTE_ACCESS: Record<string, Role[]> = {
  "/dashboard": ["Owner", "Staff"],
  "/events": ["Owner", "Staff"],
  "/venues": ["Owner"],
  "/inventory": ["Owner", "Staff"],
  "/orders": ["Owner", "Staff"],
  "/customers": ["Owner", "Staff"],
  "/brokers": ["Owner"],
  "/whatsapp": ["Owner", "Staff"],
  "/delivery": ["Owner", "Staff"],
  "/finance": ["Owner"],
  "/expenses": ["Owner"],
  "/reports": ["Owner"],
  "/activity": ["Owner"],
  "/users": ["Owner"],
  "/roles": ["Owner"],
  "/settings": ["Owner"],
  "/profile": ["Owner", "Staff"],
};

export function canAccessRoute(pathname: string, role: Role): boolean {
  const match = Object.keys(ROUTE_ACCESS).find((p) => pathname.startsWith(p));
  if (!match) return true; // unknown route → let router handle 404
  return ROUTE_ACCESS[match].includes(role);
}

// Password validation
export interface PasswordChecks {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
}

export function checkPassword(pw: string): PasswordChecks {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

export function passwordScore(pw: string): number {
  const c = checkPassword(pw);
  return Object.values(c).filter(Boolean).length;
}

export function isPasswordValid(pw: string): boolean {
  return passwordScore(pw) === 5;
}
