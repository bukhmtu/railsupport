/**
 * RailSupport — Supabase API client
 *
 * Eski FastAPI backend o'rniga to'g'ridan-to'g'ri Supabase (Postgres + Auth + Storage + Realtime)
 * bilan ishlaydi. Ruxsatlar Row Level Security (RLS) va DB triggerlar orqali ta'minlanadi
 * (supabase/migrations/*.sql), shu sababli bu yerda rol tekshiruvi qaytarilmaydi.
 */
import { supabase, EMAIL_DOMAIN } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string; fullname: string; username: string; role: string; is_active: boolean;
}
export interface ApiDepartment {
  id: number; name: string; is_active: boolean;
}
export interface ApiAttachment {
  id: number; filename: string; original: string;
  mime_type: string; size_bytes: number; uploaded_at: string; uploaded_by: string;
}
export interface ApiTicket {
  id: number; fullname: string; department_id: number; department: string; phone: string;
  problem_type: string; description: string; priority: string; status: string;
  created_by: string; assigned_to: string | null;
  created_at: string; assigned_at: string | null; resolved_at: string | null;
  attachments: ApiAttachment[];
}
export interface ApiLog {
  id: number; action: string; user_id: string | null;
  ticket_id: number | null; time: string; user_fullname: string | null;
}
export interface ApiStats {
  total: number; yangi: number; jarayon: number; tugallandi: number; bekor: number;
  by_category: Record<string, number>; by_priority: Record<string, number>;
  technician_kpi: { id: string; fullname: string; assigned: number; completed: number; in_progress: number }[];
  online_users: number;
}

// ─── Yordamchi: department nomi keshi (realtime eventlarda join yo'q) ────────

const deptNameCache = new Map<number, string>();

function cacheDepartments(rows: { id: number; name: string }[]) {
  for (const d of rows) deptNameCache.set(d.id, d.name);
}

function rowToApiTicket(row: any): ApiTicket {
  const deptName = row.departments?.name ?? deptNameCache.get(row.department_id) ?? "";
  return {
    id: row.id,
    fullname: row.fullname,
    department_id: row.department_id,
    department: deptName,
    phone: row.phone,
    problem_type: row.problem_type,
    description: row.description,
    priority: row.priority,
    status: row.status,
    created_by: row.created_by,
    assigned_to: row.assigned_to,
    created_at: row.created_at,
    assigned_at: row.assigned_at,
    resolved_at: row.resolved_at,
    attachments: (row.attachments ?? []).map(rowToApiAttachment),
  };
}

function rowToApiAttachment(row: any): ApiAttachment {
  return {
    id: row.id,
    filename: row.storage_path.split("/").pop() ?? row.storage_path,
    original: row.original,
    mime_type: row.mime_type,
    size_bytes: row.size_bytes,
    uploaded_at: row.uploaded_at,
    uploaded_by: row.uploaded_by,
  };
}

function must<T>(res: { data: any; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

// ─── API methods ──────────────────────────────────────────────────────────────

export const api = {
  auth: {
    async login(username: string, password: string): Promise<ApiUser> {
      const { error } = await supabase.auth.signInWithPassword({
        email: `${username}@${EMAIL_DOMAIN}`,
        password,
      });
      if (error) throw new Error("Login yoki parol noto'g'ri");

      const { data: { user } } = await supabase.auth.getUser();
      const profile = must<ApiUser>(await supabase.from("profiles").select("*").eq("id", user!.id).single());

      if (!profile.is_active) {
        await supabase.auth.signOut();
        throw new Error("Hisob bloklangan");
      }
      return profile;
    },

    async logout() {
      await supabase.auth.signOut();
    },

    async me(): Promise<ApiUser> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessiya topilmadi");
      return must<ApiUser>(await supabase.from("profiles").select("*").eq("id", user.id).single());
    },

    async hasSession(): Promise<boolean> {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    },

    async updateProfile(b: { fullname?: string; username?: string; password?: string }): Promise<ApiUser> {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "update_own_profile", ...b },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
      });
      if (error) throw new Error(error.message);
      if (data?.detail) throw new Error(data.detail);
      return data;
    },
  },

  departments: {
    async list(opts?: { activeOnly?: boolean }): Promise<ApiDepartment[]> {
      let q = supabase.from("departments").select("*").order("name");
      if (opts?.activeOnly) q = q.eq("is_active", true);
      const rows = must<ApiDepartment[]>(await q);
      cacheDepartments(rows);
      return rows;
    },
    async create(name: string): Promise<ApiDepartment> {
      return must<ApiDepartment>(await supabase.from("departments").insert({ name }).select().single());
    },
    async update(id: number, body: Partial<{ name: string; is_active: boolean }>): Promise<ApiDepartment> {
      return must<ApiDepartment>(await supabase.from("departments").update(body).eq("id", id).select().single());
    },
    async remove(id: number): Promise<void> {
      const { error } = await supabase.from("departments").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
  },

  tickets: {
    async list(params?: { status?: string; assigned_to?: string; created_by?: string }): Promise<ApiTicket[]> {
      let q = supabase.from("tickets").select("*, departments(name), attachments(*)").order("created_at", { ascending: false });
      if (params?.status)      q = q.eq("status", params.status);
      if (params?.assigned_to) q = q.eq("assigned_to", params.assigned_to);
      if (params?.created_by)  q = q.eq("created_by", params.created_by);
      const rows = must<any[]>(await q);
      return rows.map(rowToApiTicket);
    },

    async create(b: { fullname: string; department_id: number; phone: string; problem_type: string; description: string; priority: string }): Promise<ApiTicket> {
      const { data: { user } } = await supabase.auth.getUser();
      const row = must<any>(await supabase.from("tickets")
        .insert({ ...b, created_by: user!.id })
        .select("*, departments(name), attachments(*)")
        .single());
      return rowToApiTicket(row);
    },

    async assign(id: number, technician_id: string): Promise<ApiTicket> {
      const row = must<any>(await supabase.from("tickets")
        .update({ assigned_to: technician_id })
        .eq("id", id)
        .select("*, departments(name), attachments(*)")
        .single());
      return rowToApiTicket(row);
    },

    async setStatus(id: number, status: string): Promise<ApiTicket> {
      const row = must<any>(await supabase.from("tickets")
        .update({ status })
        .eq("id", id)
        .select("*, departments(name), attachments(*)")
        .single());
      return rowToApiTicket(row);
    },

    async uploadFile(ticketId: number, file: File): Promise<ApiAttachment> {
      const { data: { user } } = await supabase.auth.getUser();
      const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
      const path = `${ticketId}/${crypto.randomUUID()}${ext}`;

      const up = await supabase.storage.from("attachments").upload(path, file, { contentType: file.type });
      if (up.error) throw new Error(up.error.message);

      const row = must<any>(await supabase.from("attachments").insert({
        ticket_id: ticketId,
        uploaded_by: user!.id,
        storage_path: path,
        original: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      }).select().single());

      return rowToApiAttachment(row);
    },

    async deleteFile(ticketId: number, attId: number): Promise<void> {
      const att = must<{ storage_path: string }>(await supabase.from("attachments").select("storage_path").eq("id", attId).eq("ticket_id", ticketId).single());
      await supabase.storage.from("attachments").remove([att.storage_path]);
      const { error } = await supabase.from("attachments").delete().eq("id", attId);
      if (error) throw new Error(error.message);
    },

    async fileUrl(ticketId: number, filename: string): Promise<string> {
      const { data, error } = await supabase.storage.from("attachments").createSignedUrl(`${ticketId}/${filename}`, 60);
      if (error) throw new Error(error.message);
      return data.signedUrl;
    },
  },

  users: {
    async list(): Promise<ApiUser[]> {
      return must<ApiUser[]>(await supabase.from("profiles").select("*").order("created_at"));
    },
    async technicians(): Promise<ApiUser[]> {
      return must<ApiUser[]>(await supabase.from("profiles").select("*").eq("role", "technician").eq("is_active", true));
    },
    async create(b: { fullname: string; username: string; password: string; role: string }): Promise<ApiUser> {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "create", ...b },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
      });
      if (error) throw new Error(error.message);
      if (data?.detail) throw new Error(data.detail);
      return data;
    },
    async update(id: string, b: Partial<{ fullname: string; role: string; is_active: boolean }>): Promise<ApiUser> {
      return must<ApiUser>(await supabase.from("profiles").update(b).eq("id", id).select().single());
    },
    async resetPassword(id: string, password: string): Promise<void> {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "reset_password", user_id: id, password },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
      });
      if (error) throw new Error(error.message);
      if (data?.detail) throw new Error(data.detail);
    },
    async delete(id: string): Promise<void> {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "delete", user_id: id },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
      });
      if (error) throw new Error(error.message);
      if (data?.detail) throw new Error(data.detail);
    },
  },

  async stats(): Promise<ApiStats> {
    const { data, error } = await supabase.rpc("get_stats");
    if (error) throw new Error(error.message);
    return data as ApiStats;
  },

  async logs(): Promise<ApiLog[]> {
    const rows = must<any[]>(await supabase.from("logs").select("*, profiles(fullname)").order("time", { ascending: false }).limit(200));
    return rows.map((r: any) => ({
      id: r.id, action: r.action, user_id: r.user_id, ticket_id: r.ticket_id,
      time: r.time, user_fullname: r.profiles?.fullname ?? null,
    }));
  },
};

// ─── Realtime (Supabase Realtime — WebSocket o'rnini bosadi) ─────────────────
// RLS postgres_changes'ga ham qo'llanadi: har bir client faqat o'ziga ruxsat
// etilgan qatorlar bo'yicha event oladi (employee — o'z ticketlari, technician — o'ziga
// biriktirilganlar, dispatcher/admin — barchasi).

type WSEvent = "ticket:new" | "ticket:updated" | "ticket:assigned";
type WSHandler = (data: ApiTicket) => void;

export function connectWS(handlers: Partial<Record<WSEvent, WSHandler>>) {
  const channel = supabase
    .channel("tickets-changes")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "tickets" }, (payload) => {
      handlers["ticket:new"]?.(rowToApiTicket(payload.new));
    })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tickets" }, (payload) => {
      const t = rowToApiTicket(payload.new);
      handlers["ticket:updated"]?.(t);
      if (payload.new.assigned_to && payload.new.assigned_to !== (payload.old as any)?.assigned_to) {
        handlers["ticket:assigned"]?.(t);
      }
    })
    .subscribe();

  return { close: () => { supabase.removeChannel(channel); } };
}
