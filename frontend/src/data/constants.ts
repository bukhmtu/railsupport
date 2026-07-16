/* ─── TYPES ──────────────────────────────────────────────────── */
export type Role = "admin" | "dispatcher" | "technician" | "employee";
export type TicketStatus = "yangi" | "qabul" | "jarayon" | "tugallandi" | "bekor";
export type Priority = "yuqori" | "orta" | "past";

export interface User {
  id: number;
  fullname: string;
  username: string;
  password: string;
  role: Role;
}

export interface Ticket {
  id: number;
  fullname: string;
  department: string;
  phone: string;
  problem_type: string;
  description: string;
  status: TicketStatus;
  assigned_to: number | null;
  priority: Priority;
  created_at: string;
  created_by: number;
  assigned_at: string | null;
}

export interface Log {
  id: number;
  action: string;
  user: string;
  time: string;
}

export interface StatusMeta {
  label: string;
  bg: string;
  fg: string;
  dot: string;
  glow: string;
}

export interface PriorityMeta {
  label: string;
  bg: string;
  fg: string;
  dot: string;
  fa: string;
}

export interface RoleMeta {
  label: string;
  bg: string;
  fg: string;
  icon: string;
  iconColor: string;
}

export interface MenuItem {
  k: string;
  fa: string;
  color: string;
  label: string;
}

/* ─── CONSTANTS ──────────────────────────────────────────────── */
export const STATUS: Record<TicketStatus, StatusMeta> = {
  yangi:      { label:"Yangi",          bg:"rgba(255,251,235,0.90)", fg:"#92400E", dot:"#D97706", glow:"rgba(217,119,6,0.15)"   },
  qabul:      { label:"Qabul qilindi",  bg:"rgba(238,242,255,0.90)", fg:"#3730A3", dot:"#5E6AD2", glow:"rgba(94,106,210,0.15)" },
  jarayon:    { label:"Jarayonda",      bg:"rgba(245,243,255,0.90)", fg:"#5B21B6", dot:"#7C3AED", glow:"rgba(124,58,237,0.15)"  },
  tugallandi: { label:"Tugallandi",     bg:"rgba(236,253,245,0.90)", fg:"#065F46", dot:"#059669", glow:"rgba(5,150,105,0.15)"   },
  bekor:      { label:"Bekor qilindi",  bg:"rgba(255,241,242,0.90)", fg:"#9F1239", dot:"#E11D48", glow:"rgba(225,29,72,0.15)"   },
};

export const PRIORITY: Record<Priority, PriorityMeta> = {
  yuqori: { label:"Yuqori",  bg:"rgba(255,241,242,0.90)", fg:"#9F1239", dot:"#E11D48", fa:"fa-arrow-up"    },
  orta:   { label:"O'rta",   bg:"rgba(255,251,235,0.90)", fg:"#92400E", dot:"#D97706", fa:"fa-minus"       },
  past:   { label:"Past",    bg:"rgba(240,253,250,0.90)", fg:"#065F46", dot:"#059669", fa:"fa-arrow-down"  },
};

export const CATEGORIES: string[]  = ["Internet","Printer","Kartridj","Kamera","Kompyuter","Telefon","Server","Dastur ishlamayapti"];
// Bo'limlar endi Supabase `departments` jadvalidan keladi (admin panelidan boshqariladi) — api.departments.list()

export const CAT_META: Record<string, { fa: string; color: string }> = {
  "Internet":             { fa:"fa-wifi",                color:"#0891B2" },
  "Printer":              { fa:"fa-print",               color:"#7C3AED" },
  "Kartridj":             { fa:"fa-fill-drip",           color:"#D97706" },
  "Kamera":               { fa:"fa-camera",              color:"#E11D48" },
  "Kompyuter":            { fa:"fa-desktop",             color:"#059669" },
  "Telefon":              { fa:"fa-phone",               color:"#D97706" },
  "Server":               { fa:"fa-server",              color:"#5E6AD2" },
  "Dastur ishlamayapti":  { fa:"fa-triangle-exclamation", color:"#DB2777" },
};

export const ROLE_META: Record<Role, RoleMeta> = {
  admin:      { label:"Admin",        bg:"rgba(254,242,242,0.90)", fg:"#9F1239", icon:"fa-shield-halved",      iconColor:"#E11D48" },
  dispatcher: { label:"Dispetcher",   bg:"rgba(238,242,255,0.90)", fg:"#3730A3", icon:"fa-headset",            iconColor:"#5E6AD2" },
  technician: { label:"Muhandis",     bg:"rgba(236,253,245,0.90)", fg:"#065F46", icon:"fa-screwdriver-wrench", iconColor:"#059669" },
  employee:   { label:"Bo'lim xodimi",bg:"rgba(248,250,252,0.90)", fg:"#475569", icon:"fa-user",               iconColor:"#64748B" },
};

export const MENU: Record<Role, MenuItem[]> = {
  employee: [
    { k:"new-ticket", fa:"fa-paper-plane",    color:"#5E6AD2", label:"Murojaat yuborish"    },
    { k:"my-tickets", fa:"fa-inbox",          color:"#64748B", label:"Mening murojaatlarim" },
  ],
  dispatcher: [
    { k:"dash",           fa:"fa-gauge-high",  color:"#5E6AD2", label:"Dashboard"          },
    { k:"new-tickets",    fa:"fa-bell",        color:"#D97706", label:"Yangi murojaatlar"   },
    { k:"active-tickets", fa:"fa-gears",       color:"#7C3AED", label:"Jarayondagilar"      },
    { k:"all-tickets",    fa:"fa-list-check",  color:"#5E6AD2", label:"Barcha murojaatlar"  },
  ],
  technician: [
    { k:"my-tasks",  fa:"fa-screwdriver-wrench", color:"#059669", label:"Mening vazifalarim" },
    { k:"completed", fa:"fa-circle-check",        color:"#059669", label:"Bajarilganlar"       },
  ],
  admin: [
    { k:"stats",       fa:"fa-chart-pie",   color:"#5E6AD2", label:"Statistika"         },
    { k:"kpi",         fa:"fa-trophy",      color:"#D97706", label:"KPI & Xodimlar"     },
    { k:"all-tickets", fa:"fa-list-check",  color:"#5E6AD2", label:"Barcha murojaatlar" },
    { k:"archive",     fa:"fa-box-archive", color:"#D97706", label:"Arxiv"              },
    { k:"users",       fa:"fa-users",       color:"#7C3AED", label:"Foydalanuvchilar"   },
    { k:"departments", fa:"fa-building",    color:"#059669", label:"Bo'limlar"          },
    { k:"logs",        fa:"fa-file-lines",  color:"#94A3B8", label:"Loglar"             },
  ],
};

export const AVATAR_PALETTE: [string, string][] = [
  ["rgba(238,242,255,0.95)","#3730A3"],["rgba(236,253,245,0.95)","#065F46"],
  ["rgba(245,243,255,0.95)","#5B21B6"],["rgba(255,251,235,0.95)","#92400E"],
  ["rgba(240,253,250,0.95)","#065F46"],["rgba(254,242,242,0.95)","#9F1239"],
];

