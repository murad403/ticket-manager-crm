// Deterministic mock data generator (seeded, no randomness across reloads).
import { addDays, subDays, addHours } from "date-fns";

// ---------- Seeded RNG ----------
let seed = 42;
function rnd() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
function pick<T>(arr: T[]): T { return arr[Math.floor(rnd() * arr.length)]; }
function int(min: number, max: number) { return Math.floor(rnd() * (max - min + 1)) + min; }
function id(prefix: string, n: number) { return `${prefix}_${String(n).padStart(4, "0")}`; }

// ---------- Types ----------
export type EventCategory = "Concert" | "Sports" | "Theatre" | "Comedy" | "Festival";
export type EventStatus = "upcoming" | "on-sale" | "sold-out" | "past";
export interface Venue {
  id: string; name: string; city: string; country: string; capacity: number; type: string; address: string;
}
export interface Event {
  id: string; name: string; artist: string; category: EventCategory; date: string; venueId: string;
  status: EventStatus; image: string; ticketsAvailable: number; ticketsSold: number; minPrice: number; maxPrice: number;
}
export type TicketStatus = "available" | "reserved" | "sold" | "delivered";
export interface Ticket {
  id: string; eventId: string; section: string; row: string; seat: string;
  price: number; cost: number; status: TicketStatus; brokerId: string; source: string;
  barcode: string; hasPkPass: boolean; ticketLink: string; addedAt: string; orderId?: string;
}
export type OrderStatus = "pending" | "confirmed" | "cancelled" | "refunded";
export type PaymentStatus = "unpaid" | "paid" | "partial" | "refunded";
export type DeliveryStatus = "pending" | "delivered" | "revoked";
export interface Order {
  id: string; customerId: string; eventId: string; ticketIds: string[]; total: number; cost: number;
  status: OrderStatus; payment: PaymentStatus; delivery: DeliveryStatus;
  createdAt: string; notes: string; channel: "WhatsApp" | "Phone" | "Email" | "In-Person";
}
export interface Customer {
  id: string; name: string; email: string; phone: string; city: string; country: string;
  totalOrders: number; totalSpent: number; vip: boolean; notes: string; createdAt: string;
}
export interface Broker {
  id: string; name: string; company: string; email: string; phone: string;
  totalTickets: number; balance: number; rating: number; createdAt: string;
}
export interface Invoice {
  id: string; brokerId: string; amount: number; status: "paid" | "due" | "overdue"; issuedAt: string; dueAt: string;
}
export interface Expense {
  id: string; category: string; description: string; amount: number; date: string; vendor: string;
}
export type ActivityType = "order" | "ticket" | "customer" | "broker" | "event" | "delivery" | "payment" | "system";
export interface Activity {
  id: string; type: ActivityType; title: string; description: string; user: string; timestamp: string;
}
export interface WhatsAppMessage {
  id: string; conversationId: string; direction: "in" | "out"; text: string; timestamp: string;
  status: "sent" | "delivered" | "read" | "failed"; type?: "text" | "ticket" | "pkpass";
}
export interface Conversation {
  id: string; customerId: string; lastMessage: string; unread: number; updatedAt: string;
  messages: WhatsAppMessage[];
}
export interface AppUser {
  id: string; name: string; email: string; role: "Owner" | "Staff"; avatar: string;
  avatarUrl?: string; phone?: string; active: boolean; password: string;
  lastLogin?: string; createdAt: string;
}
export interface NotificationItem {
  id: string; title: string; description: string; type: "info" | "success" | "warning" | "error";
  read: boolean; timestamp: string;
}

// ---------- Seeds ----------
const CITIES: [string, string][] = [
  ["London", "UK"], ["New York", "USA"], ["Los Angeles", "USA"], ["Paris", "FR"],
  ["Berlin", "DE"], ["Tokyo", "JP"], ["Sydney", "AU"], ["Toronto", "CA"],
  ["Madrid", "ES"], ["Amsterdam", "NL"], ["Dubai", "AE"], ["Singapore", "SG"],
];
const VENUE_NAMES = ["The O2 Arena", "Madison Square Garden", "SoFi Stadium", "Wembley Stadium", "Accor Arena", "Mercedes-Benz Arena", "Tokyo Dome", "Qudos Bank Arena", "Rogers Centre", "Palacio Vistalegre", "Ziggo Dome", "Coca-Cola Arena", "Marina Bay Sands", "Red Rocks", "Barclays Center", "Staples Center", "AT&T Stadium", "Fenway Park", "Anfield", "Camp Nou"];
const ARTISTS = ["Taylor Swift", "Coldplay", "The Weeknd", "Beyoncé", "Drake", "Ed Sheeran", "Bad Bunny", "Billie Eilish", "Adele", "Bruno Mars", "Post Malone", "Harry Styles", "Dua Lipa", "Kendrick Lamar", "SZA", "Olivia Rodrigo", "Travis Scott", "Rihanna", "Metallica", "Foo Fighters"];
const CATEGORIES: EventCategory[] = ["Concert", "Sports", "Theatre", "Comedy", "Festival"];
const FIRST = ["James", "Sofia", "Liam", "Olivia", "Noah", "Emma", "Aiden", "Ava", "Ethan", "Isabella", "Lucas", "Mia", "Mason", "Charlotte", "Logan", "Amelia", "Elijah", "Harper", "Oliver", "Evelyn", "Rahul", "Priya", "Yuki", "Chen", "Hassan", "Fatima", "Diego", "Camila", "Luca", "Nora"];
const LAST = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Chen", "Kim", "Patel", "Khan", "Singh", "Kumar", "Nakamura", "Silva", "Rossi", "Cohen"];
const BROKER_COMPANIES = ["Vivid Seats Ltd", "StubHub Partners", "SeatGeek Pro", "Ticket Vault Co", "GoldStar Brokers", "ElitePass Group", "FrontRow Trading", "PrimeSeat Holdings", "TixNet Global", "BackstagePass Inc"];
const EXPENSE_CATS = ["Office", "Marketing", "Travel", "Software", "Salaries", "Utilities", "Fees", "Misc"];
const SOURCES = ["Ticketmaster", "AXS", "See Tickets", "Live Nation", "Broker Direct", "Marketplace"];
const NOW = new Date("2026-07-02T12:00:00Z");

// ---------- Generators ----------
export const venues: Venue[] = VENUE_NAMES.map((name, i) => {
  const [city, country] = CITIES[i % CITIES.length];
  return {
    id: id("ven", i + 1), name, city, country,
    capacity: [20000, 45000, 70000, 90000, 15000][i % 5],
    type: ["Arena", "Stadium", "Theatre", "Amphitheatre"][i % 4],
    address: `${int(1, 999)} ${pick(["Main", "King", "Queen", "Park", "River"])} St`,
  };
});

export const events: Event[] = Array.from({ length: 22 }, (_, i) => {
  const artist = ARTISTS[i % ARTISTS.length];
  const cat = CATEGORIES[i % CATEGORIES.length];
  const venue = venues[i % venues.length];
  const date = i < 5 ? subDays(NOW, int(1, 30)) : addDays(NOW, int(1, 200));
  const sold = int(200, 8000);
  const avail = int(50, 2000);
  const min = int(45, 120);
  return {
    id: id("evt", i + 1),
    name: `${artist} — ${cat === "Sports" ? "Championship Finals" : cat === "Theatre" ? "Live Broadway" : "World Tour 2026"}`,
    artist, category: cat, date: date.toISOString(),
    venueId: venue.id,
    status: (date < NOW ? "past" : avail < 100 ? "sold-out" : i % 3 === 0 ? "upcoming" : "on-sale") as EventStatus,
    image: `https://images.unsplash.com/photo-${["1470229722913-7c0e2dbbafd3", "1501386761578-eac5c94b800a", "1516450360452-9312f5e86fc7", "1493225457124-a3eb161ffa5f", "1459749411175-04bf5292ceea"][i % 5]}?w=800&q=70`,
    ticketsAvailable: avail, ticketsSold: sold,
    minPrice: min, maxPrice: min + int(200, 800),
  };
});

export const brokers: Broker[] = Array.from({ length: 20 }, (_, i) => ({
  id: id("brk", i + 1),
  name: `${pick(FIRST)} ${pick(LAST)}`,
  company: BROKER_COMPANIES[i % BROKER_COMPANIES.length],
  email: `broker${i + 1}@${BROKER_COMPANIES[i % BROKER_COMPANIES.length].toLowerCase().replace(/[^a-z]/g, "")}.com`,
  phone: `+1 555 ${String(int(1000, 9999))}`,
  totalTickets: int(20, 400),
  balance: int(-5000, 25000),
  rating: Math.round((3 + rnd() * 2) * 10) / 10,
  createdAt: subDays(NOW, int(30, 800)).toISOString(),
}));

export const customers: Customer[] = Array.from({ length: 30 }, (_, i) => {
  const first = pick(FIRST); const last = pick(LAST);
  const [city, country] = pick(CITIES);
  const orders = int(1, 18);
  return {
    id: id("cus", i + 1),
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${pick(["gmail.com", "outlook.com", "yahoo.com", "proton.me"])}`,
    phone: `+${int(1, 99)} ${int(100, 999)} ${int(1000, 9999)}`,
    city, country,
    totalOrders: orders, totalSpent: orders * int(200, 1200),
    vip: rnd() > 0.75,
    notes: pick(["Prefers premium seats.", "VIP hospitality package client.", "Loyal customer since 2022.", "Contact via WhatsApp only.", ""]),
    createdAt: subDays(NOW, int(30, 900)).toISOString(),
  };
});

export const tickets: Ticket[] = Array.from({ length: 120 }, (_, i) => {
  const evt = pick(events);
  const cost = int(40, 400);
  const status = pick<TicketStatus>(["available", "available", "available", "reserved", "sold", "sold", "delivered"]);
  return {
    id: id("tkt", i + 1),
    eventId: evt.id,
    section: pick(["A", "B", "C", "D", "VIP", "Floor", "Balcony", "Lower Bowl", "Upper Bowl"]),
    row: String.fromCharCode(65 + int(0, 25)),
    seat: String(int(1, 40)),
    price: cost + int(50, 400),
    cost,
    status, brokerId: pick(brokers).id,
    source: pick(SOURCES),
    barcode: `BC${int(100000000, 999999999)}`,
    hasPkPass: rnd() > 0.4,
    ticketLink: `https://tix.example.com/t/${int(100000, 999999)}`,
    addedAt: subDays(NOW, int(1, 60)).toISOString(),
  };
});

export const orders: Order[] = Array.from({ length: 55 }, (_, i) => {
  const cus = pick(customers);
  const evt = pick(events);
  const tkts = tickets.filter(t => t.eventId === evt.id).slice(0, int(1, 4));
  const total = tkts.reduce((s, t) => s + t.price, 0) || int(150, 1500);
  const cost = tkts.reduce((s, t) => s + t.cost, 0) || Math.floor(total * 0.6);
  return {
    id: id("ord", i + 1),
    customerId: cus.id, eventId: evt.id,
    ticketIds: tkts.map(t => t.id),
    total, cost,
    status: pick<OrderStatus>(["pending", "confirmed", "confirmed", "confirmed", "cancelled"]),
    payment: pick<PaymentStatus>(["paid", "paid", "unpaid", "partial"]),
    delivery: pick<DeliveryStatus>(["pending", "delivered", "delivered", "delivered"]),
    createdAt: subDays(NOW, int(0, 60)).toISOString(),
    notes: pick(["", "Rush delivery requested", "VIP client", "Handle with care", ""]),
    channel: pick(["WhatsApp", "Phone", "Email", "In-Person"]),
  };
});

export const invoices: Invoice[] = Array.from({ length: 25 }, (_, i) => ({
  id: id("inv", i + 1),
  brokerId: pick(brokers).id,
  amount: int(500, 15000),
  status: pick(["paid", "paid", "due", "overdue"] as const),
  issuedAt: subDays(NOW, int(1, 90)).toISOString(),
  dueAt: addDays(NOW, int(-15, 30)).toISOString(),
}));

export const expenses: Expense[] = Array.from({ length: 40 }, (_, i) => ({
  id: id("exp", i + 1),
  category: pick(EXPENSE_CATS),
  description: pick(["Monthly subscription", "Team lunch", "Client meeting", "Ad spend", "Payroll", "Utility bill", "Office rent", "Travel to venue"]),
  amount: int(50, 3500),
  date: subDays(NOW, int(0, 90)).toISOString(),
  vendor: pick(["Google Ads", "Slack", "AWS", "WeWork", "Uber", "Stripe fees", "Payroll Co", "Local Vendor"]),
}));

export const activities: Activity[] = Array.from({ length: 100 }, (_, i) => {
  const type = pick<ActivityType>(["order", "ticket", "customer", "broker", "event", "delivery", "payment", "system"]);
  const map: Record<ActivityType, [string, string]> = {
    order: ["New order created", `Order for ${pick(customers).name}`],
    ticket: ["Ticket added to inventory", `${pick(events).artist} — Section ${pick(["A", "B", "VIP"])}`],
    customer: ["Customer profile updated", `${pick(customers).name} details changed`],
    broker: ["Broker payment sent", `Paid ${pick(brokers).company}`],
    event: ["Event created", pick(events).name],
    delivery: ["Ticket delivered", `Delivered via WhatsApp`],
    payment: ["Payment received", `$${int(200, 3000)} confirmed`],
    system: ["System notification", "Backup completed successfully"],
  };
  const [title, desc] = map[type];
  return {
    id: id("act", i + 1), type, title, description: desc,
    user: pick(["Alex Chen", "Priya Rao", "Marcus Bell", "Sofia Reyes", "System"]),
    timestamp: subDays(NOW, int(0, 30)).toISOString(),
  };
});

export const conversations: Conversation[] = customers.slice(0, 12).map((c, i) => {
  const msgs: WhatsAppMessage[] = Array.from({ length: int(3, 8) }, (_, j) => ({
    id: id(`msg${i}`, j + 1),
    conversationId: `conv_${c.id}`,
    direction: j % 2 === 0 ? "in" : "out",
    text: pick(["Hi, are tickets still available?", "Yes, we have great seats for that event.", "How much for VIP?", "Sending you the options now.", "Booked! Please send the pass.", "Delivered — enjoy the show!", "Thanks so much!", "Can I get 2 more?"]),
    timestamp: addHours(subDays(NOW, int(0, 5)), j).toISOString(),
    status: pick(["sent", "delivered", "read"] as const),
    type: "text",
  }));
  return {
    id: `conv_${c.id}`, customerId: c.id,
    lastMessage: msgs[msgs.length - 1].text,
    unread: i < 3 ? int(1, 4) : 0,
    updatedAt: msgs[msgs.length - 1].timestamp,
    messages: msgs,
  };
});

export const users: AppUser[] = [
  { id: "usr_0001", name: "Alex Chen", email: "owner@ticketmanager.local", role: "Owner", avatar: "AC", phone: "+1 555 010 4224", active: true, password: "Owner@123", lastLogin: subDays(NOW, 0).toISOString(), createdAt: subDays(NOW, 320).toISOString() },
  { id: "usr_0002", name: "Priya Rao", email: "staff@ticketmanager.local", role: "Staff", avatar: "PR", phone: "+1 555 010 7781", active: true, password: "Staff@123", lastLogin: subDays(NOW, 1).toISOString(), createdAt: subDays(NOW, 210).toISOString() },
  { id: "usr_0003", name: "Marcus Bell", email: "marcus@ticketmanager.local", role: "Staff", avatar: "MB", phone: "+1 555 010 3390", active: true, password: "Staff@123", lastLogin: subDays(NOW, 3).toISOString(), createdAt: subDays(NOW, 150).toISOString() },
  { id: "usr_0004", name: "Sofia Reyes", email: "sofia@ticketmanager.local", role: "Staff", avatar: "SR", phone: "+1 555 010 8842", active: true, password: "Staff@123", lastLogin: subDays(NOW, 5).toISOString(), createdAt: subDays(NOW, 96).toISOString() },
  { id: "usr_0005", name: "Yuki Tanaka", email: "yuki@ticketmanager.local", role: "Staff", avatar: "YT", phone: "+1 555 010 1120", active: false, password: "Staff@123", lastLogin: subDays(NOW, 40).toISOString(), createdAt: subDays(NOW, 60).toISOString() },
];


export const notifications: NotificationItem[] = [
  { id: "n1", title: "3 orders pending delivery", description: "Send passes via WhatsApp", type: "warning", read: false, timestamp: subDays(NOW, 0).toISOString() },
  { id: "n2", title: "Payment received", description: "$2,450 from Sofia Martinez", type: "success", read: false, timestamp: subDays(NOW, 0).toISOString() },
  { id: "n3", title: "Broker invoice overdue", description: "GoldStar Brokers — $4,200", type: "error", read: false, timestamp: subDays(NOW, 1).toISOString() },
  { id: "n4", title: "New event on sale", description: "Coldplay — World Tour", type: "info", read: true, timestamp: subDays(NOW, 2).toISOString() },
];

// ---------- Utility ----------
export function venueById(id: string) { return venues.find(v => v.id === id); }
export function eventById(id: string) { return events.find(e => e.id === id); }
export function customerById(id: string) { return customers.find(c => c.id === id); }
export function brokerById(id: string) { return brokers.find(b => b.id === id); }
export function ticketById(id: string) { return tickets.find(t => t.id === id); }
