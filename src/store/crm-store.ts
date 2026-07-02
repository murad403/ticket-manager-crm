import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  events as seedEvents, venues as seedVenues, tickets as seedTickets,
  orders as seedOrders, customers as seedCustomers, brokers as seedBrokers,
  invoices as seedInvoices, expenses as seedExpenses, activities as seedActivities,
  conversations as seedConversations, users as seedUsers, notifications as seedNotifs,
  type Event, type Venue, type Ticket, type Order, type Customer, type Broker,
  type Invoice, type Expense, type Activity, type Conversation, type AppUser, type NotificationItem,
} from "@/lib/mock-data";

type Theme = "light" | "dark";

interface CRMState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  currentUser: AppUser;

  events: Event[];
  venues: Venue[];
  tickets: Ticket[];
  orders: Order[];
  customers: Customer[];
  brokers: Broker[];
  invoices: Invoice[];
  expenses: Expense[];
  activities: Activity[];
  conversations: Conversation[];
  users: AppUser[];
  notifications: NotificationItem[];

  addActivity: (a: Omit<Activity, "id" | "timestamp">) => void;

  // Events
  addEvent: (e: Omit<Event, "id">) => void;
  updateEvent: (id: string, patch: Partial<Event>) => void;
  deleteEvent: (id: string) => void;

  // Venues
  addVenue: (v: Omit<Venue, "id">) => void;
  updateVenue: (id: string, patch: Partial<Venue>) => void;
  deleteVenue: (id: string) => void;

  // Tickets
  addTicket: (t: Omit<Ticket, "id">) => void;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  bulkDeleteTickets: (ids: string[]) => void;

  // Orders
  addOrder: (o: Omit<Order, "id">) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  deleteOrder: (id: string) => void;

  // Customers
  addCustomer: (c: Omit<Customer, "id">) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Brokers
  addBroker: (b: Omit<Broker, "id">) => void;
  updateBroker: (id: string, patch: Partial<Broker>) => void;
  deleteBroker: (id: string) => void;

  // Expenses
  addExpense: (e: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;

  // Notifications
  markAllRead: () => void;

  // WhatsApp
  sendMessage: (conversationId: string, text: string, type?: "text" | "ticket" | "pkpass") => void;

  reset: () => void;
}

const nextId = (prefix: string, list: { id: string }[]) => {
  const nums = list.map(x => parseInt(x.id.split("_")[1] || "0", 10));
  return `${prefix}_${String(Math.max(0, ...nums) + 1).padStart(4, "0")}`;
};

export const useCRM = create<CRMState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),

      currentUser: seedUsers[0],
      events: seedEvents,
      venues: seedVenues,
      tickets: seedTickets,
      orders: seedOrders,
      customers: seedCustomers,
      brokers: seedBrokers,
      invoices: seedInvoices,
      expenses: seedExpenses,
      activities: seedActivities,
      conversations: seedConversations,
      users: seedUsers,
      notifications: seedNotifs,

      addActivity: (a) => set((s) => ({
        activities: [{ ...a, id: nextId("act", s.activities), timestamp: new Date().toISOString() }, ...s.activities],
      })),

      addEvent: (e) => set((s) => ({ events: [{ ...e, id: nextId("evt", s.events) }, ...s.events] })),
      updateEvent: (id, patch) => set((s) => ({ events: s.events.map(e => e.id === id ? { ...e, ...patch } : e) })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter(e => e.id !== id) })),

      addVenue: (v) => set((s) => ({ venues: [{ ...v, id: nextId("ven", s.venues) }, ...s.venues] })),
      updateVenue: (id, patch) => set((s) => ({ venues: s.venues.map(v => v.id === id ? { ...v, ...patch } : v) })),
      deleteVenue: (id) => set((s) => ({ venues: s.venues.filter(v => v.id !== id) })),

      addTicket: (t) => set((s) => ({ tickets: [{ ...t, id: nextId("tkt", s.tickets) }, ...s.tickets] })),
      updateTicket: (id, patch) => set((s) => ({ tickets: s.tickets.map(t => t.id === id ? { ...t, ...patch } : t) })),
      deleteTicket: (id) => set((s) => ({ tickets: s.tickets.filter(t => t.id !== id) })),
      bulkDeleteTickets: (ids) => set((s) => ({ tickets: s.tickets.filter(t => !ids.includes(t.id)) })),

      addOrder: (o) => set((s) => ({ orders: [{ ...o, id: nextId("ord", s.orders) }, ...s.orders] })),
      updateOrder: (id, patch) => set((s) => ({ orders: s.orders.map(o => o.id === id ? { ...o, ...patch } : o) })),
      deleteOrder: (id) => set((s) => ({ orders: s.orders.filter(o => o.id !== id) })),

      addCustomer: (c) => set((s) => ({ customers: [{ ...c, id: nextId("cus", s.customers) }, ...s.customers] })),
      updateCustomer: (id, patch) => set((s) => ({ customers: s.customers.map(c => c.id === id ? { ...c, ...patch } : c) })),
      deleteCustomer: (id) => set((s) => ({ customers: s.customers.filter(c => c.id !== id) })),

      addBroker: (b) => set((s) => ({ brokers: [{ ...b, id: nextId("brk", s.brokers) }, ...s.brokers] })),
      updateBroker: (id, patch) => set((s) => ({ brokers: s.brokers.map(b => b.id === id ? { ...b, ...patch } : b) })),
      deleteBroker: (id) => set((s) => ({ brokers: s.brokers.filter(b => b.id !== id) })),

      addExpense: (e) => set((s) => ({ expenses: [{ ...e, id: nextId("exp", s.expenses) }, ...s.expenses] })),
      deleteExpense: (id) => set((s) => ({ expenses: s.expenses.filter(e => e.id !== id) })),

      markAllRead: () => set((s) => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),

      sendMessage: (conversationId, text, type = "text") => set((s) => ({
        conversations: s.conversations.map(c => c.id === conversationId ? {
          ...c,
          lastMessage: text,
          updatedAt: new Date().toISOString(),
          messages: [...c.messages, {
            id: `msg_${Date.now()}`, conversationId, direction: "out", text,
            timestamp: new Date().toISOString(), status: "sent", type,
          }],
        } : c),
      })),

      reset: () => set({
        events: seedEvents, venues: seedVenues, tickets: seedTickets, orders: seedOrders,
        customers: seedCustomers, brokers: seedBrokers, invoices: seedInvoices,
        expenses: seedExpenses, activities: seedActivities, conversations: seedConversations,
        users: seedUsers, notifications: seedNotifs,
      }),
    }),
    {
      name: "ticketmanager-crm",
      partialize: (s) => ({ theme: s.theme }), // only persist theme (data always fresh from seed)
    }
  )
);
