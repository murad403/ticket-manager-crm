import { useEffect } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { users as seedUsers, type AppUser } from "@/lib/mock-data";
import {
  DEFAULT_ROLE_PERMISSIONS, type Role, type Permission,
} from "@/lib/rbac";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min mock session timeout

interface Session {
  userId: string;
  expiresAt: number;
  remember: boolean;
}

interface AuthState {
  users: AppUser[];
  session: Session | null;
  rolePermissions: Record<Role, Record<Permission, boolean>>;
  hydrated: boolean;

  // derived
  currentUser: () => AppUser | null;
  isAuthenticated: () => boolean;
  can: (perm: Permission) => boolean;

  // auth flow
  login: (email: string, password: string, remember: boolean) => { ok: boolean; error?: string };
  logout: () => void;
  touchSession: () => void;
  checkExpiry: () => boolean; // returns true if expired & logged out

  // profile / security
  updateProfile: (patch: Partial<Pick<AppUser, "name" | "email" | "phone" | "avatarUrl" | "avatar">>) => void;
  changePassword: (current: string, next: string) => { ok: boolean; error?: string };
  resetPasswordMock: (email: string) => { ok: boolean; error?: string };
  setNewPasswordMock: (email: string, next: string) => { ok: boolean; error?: string };

  // user management (owner)
  addUser: (u: Omit<AppUser, "id" | "createdAt">) => void;
  updateUser: (id: string, patch: Partial<AppUser>) => void;
  toggleUserActive: (id: string) => void;
  resetUserPassword: (id: string, next: string) => void;
  deleteUser: (id: string) => void;

  // role management
  setRolePermission: (role: Role, perm: Permission, value: boolean) => void;
  resetRolePermissions: () => void;
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      session: null,
      rolePermissions: DEFAULT_ROLE_PERMISSIONS,
      hydrated: false,

      currentUser: () => {
        const { session, users } = get();
        if (!session) return null;
        return users.find((u) => u.id === session.userId) ?? null;
      },
      isAuthenticated: () => {
        const { session } = get();
        if (!session) return false;
        return session.expiresAt > Date.now();
      },
      can: (perm) => {
        const user = get().currentUser();
        if (!user) return false;
        return get().rolePermissions[user.role]?.[perm] ?? false;
      },

      login: (email, password, remember) => {
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (!user || user.password !== password) {
          return { ok: false, error: "Invalid email or password." };
        }
        if (!user.active) {
          return { ok: false, error: "This account is disabled. Contact an owner." };
        }
        set((s) => ({
          session: { userId: user.id, expiresAt: Date.now() + SESSION_TIMEOUT_MS, remember },
          users: s.users.map((u) =>
            u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u
          ),
        }));
        return { ok: true };
      },

      logout: () => set({ session: null }),

      touchSession: () =>
        set((s) =>
          s.session
            ? { session: { ...s.session, expiresAt: Date.now() + SESSION_TIMEOUT_MS } }
            : {}
        ),

      checkExpiry: () => {
        const { session } = get();
        if (session && session.expiresAt <= Date.now()) {
          set({ session: null });
          return true;
        }
        return false;
      },

      updateProfile: (patch) => {
        const user = get().currentUser();
        if (!user) return;
        const next = { ...patch };
        if (patch.name) next.avatar = initials(patch.name);
        set((s) => ({
          users: s.users.map((u) => (u.id === user.id ? { ...u, ...next } : u)),
        }));
      },

      changePassword: (current, next) => {
        const user = get().currentUser();
        if (!user) return { ok: false, error: "Not signed in." };
        if (user.password !== current) return { ok: false, error: "Current password is incorrect." };
        set((s) => ({
          users: s.users.map((u) => (u.id === user.id ? { ...u, password: next } : u)),
        }));
        return { ok: true };
      },

      resetPasswordMock: (email) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) return { ok: false, error: "No account found with that email." };
        return { ok: true };
      },

      setNewPasswordMock: (email, next) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) return { ok: false, error: "No account found with that email." };
        set((s) => ({
          users: s.users.map((u) => (u.id === user.id ? { ...u, password: next } : u)),
        }));
        return { ok: true };
      },

      addUser: (u) =>
        set((s) => {
          const nums = s.users.map((x) => parseInt(x.id.split("_")[1] || "0", 10));
          const id = `usr_${String(Math.max(0, ...nums) + 1).padStart(4, "0")}`;
          return {
            users: [
              { ...u, id, avatar: u.avatar || initials(u.name), createdAt: new Date().toISOString() },
              ...s.users,
            ],
          };
        }),

      updateUser: (id, patch) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id ? { ...u, ...patch, avatar: patch.name ? initials(patch.name) : u.avatar } : u
          ),
        })),

      toggleUserActive: (id) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
        })),

      resetUserPassword: (id, next) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, password: next } : u)),
        })),

      deleteUser: (id) =>
        set((s) => ({ users: s.users.filter((u) => u.id !== id) })),

      setRolePermission: (role, perm, value) =>
        set((s) => ({
          rolePermissions: {
            ...s.rolePermissions,
            [role]: { ...s.rolePermissions[role], [perm]: value },
          },
        })),

      resetRolePermissions: () => set({ rolePermissions: DEFAULT_ROLE_PERMISSIONS }),
    }),
    {
      name: "ticketmanager-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        users: s.users,
        session: s.session,
        rolePermissions: s.rolePermissions,
      }),
      onRehydrateStorage: () => (state) => {
        state?.checkExpiry();
      },
    }
  )
);

// Client-only hydration flag. Zustand persist with synchronous localStorage
// rehydrates during store creation on the client, so by the time a component
// mounts the state is already restored — we just flip `hydrated` once mounted.
export function useAuthHydrated() {
  const hydrated = useAuth((s) => s.hydrated);
  useEffect(() => {
    if (!useAuth.getState().hydrated) {
      useAuth.getState().checkExpiry();
      useAuth.setState({ hydrated: true });
    }
  }, []);
  return hydrated;
}
