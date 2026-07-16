import { useState, useEffect, useCallback } from "react";
import { api, connectWS } from "./api/api";
import type { ApiUser, ApiTicket } from "./api/api";
import type { TicketStatus, Priority } from "./data/constants";
import { BgBlobs } from "./components/Layout";
import { Sidebar, Header } from "./components/Navigation";
import { PageTitle } from "./components/Atoms";
import LoginPage from "./pages/LoginPage";
import { TicketList, NewTicketForm } from "./pages/TicketPages";
import type { NewTicketPayload } from "./pages/TicketPages";
import DispatcherDash from "./pages/DispatcherDash";
import AdminStats from "./pages/AdminStats";
import { KpiPage, UsersTable, LogsTable } from "./pages/AdminPages";
import DepartmentsPage from "./pages/DepartmentsPage";

/* ── Frontendda ishlatiladigan local User/Ticket/Log tiplari ── */
export interface User {
  id: string; fullname: string; username: string;
  role: string; is_active: boolean;
}
export interface Ticket {
  id: number; fullname: string; department: string; department_id: number; phone: string;
  problem_type: string; description: string; status: TicketStatus;
  assigned_to: string | null; priority: Priority;
  created_at: string; created_by: string; assigned_at: string | null;
  attachments?: { id: number; filename: string; original: string; mime_type: string; size_bytes: number; uploaded_at: string; uploaded_by: string }[];
}
export interface Log {
  id: number; action: string; user: string; time: string;
}

function apiToTicket(t: ApiTicket): Ticket {
  return {
    id: t.id, fullname: t.fullname, department: t.department, department_id: t.department_id,
    phone: t.phone, problem_type: t.problem_type, description: t.description,
    status: t.status as TicketStatus, assigned_to: t.assigned_to,
    priority: t.priority as Priority,
    created_at: t.created_at.replace("T", " ").slice(0, 16),
    created_by: t.created_by,
    assigned_at: t.assigned_at ? t.assigned_at.replace("T", " ").slice(0, 16) : null,
    attachments: t.attachments,
  };
}

function apiToUser(u: ApiUser): User {
  return { id: u.id, fullname: u.fullname, username: u.username, role: u.role, is_active: u.is_active };
}

export default function App() {
  const [user,            setUser]            = useState<User | null>(null);
  const [checkingSession, setCheckingSession]  = useState(true);
  const [page,        setPage]        = useState("");
  const [tickets,     setTickets]     = useState<Ticket[]>([]);
  const [logs,        setLogs]        = useState<Log[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [allUsers,    setAllUsers]    = useState<User[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const notifCount = tickets.filter(t => t.status === "yangi").length;

  /* ── Ticketlarni yuklash ─────────────────────────────────── */
  const loadTickets = useCallback(async () => {
    try {
      const data = await api.tickets.list();
      setTickets(data.map(apiToTicket));
    } catch { /* ignore */ }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const data = await api.logs();
      setLogs(data.map(l => ({
        id: l.id, action: l.action,
        user: l.user_fullname ?? "Tizim",
        time: l.time.replace("T", " ").slice(0, 16),
      })));
    } catch { /* ignore */ }
  }, []);

  /* ── Rolga bog'liq qo'shimcha ma'lumotlar (texniklar/foydalanuvchilar) ── */
  const loadRoleData = async (u: ApiUser) => {
    try {
      const techs = await api.users.technicians();
      setTechnicians(techs.map(apiToUser));
      if (u.role === "admin" || u.role === "dispatcher") {
        const users = await api.users.list();
        setAllUsers(users.map(apiToUser));
      }
    } catch { /* ignore */ }
  };

  const startPage: Record<string, string> = {
    employee: "new-ticket", dispatcher: "dash", technician: "my-tasks", admin: "stats",
  };

  /* ── Sahifa ochilganda avvalgi sessiyani tiklash ──────────── */
  useEffect(() => {
    (async () => {
      try {
        const hasSession = await api.auth.hasSession();
        if (hasSession) {
          const u = await api.auth.me();
          setUser(apiToUser(u));
          setPage(startPage[u.role] ?? "");
          await loadRoleData(u);
        }
      } catch { /* sessiya yaroqsiz — login sahifasi ko'rsatiladi */ }
      setCheckingSession(false);
    })();
  }, []);

  /* ── Login ────────────────────────────────────────────────── */
  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const u = await api.auth.login(username, password);
      setUser(apiToUser(u));
      setPage(startPage[u.role] ?? "");
      await loadRoleData(u);
      return { success: true };
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  /* ── Login bo'lgandan keyin ticketlarni yuklash ──────────── */
  useEffect(() => {
    if (!user) return;
    loadTickets();
    loadLogs();
  }, [user, loadTickets, loadLogs]);

  /* ── Realtime ulanish ─────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    const ws = connectWS({
      "ticket:new":     (t) => setTickets(p => {
        const mapped = apiToTicket(t);
        return [mapped, ...p.filter(x => x.id !== mapped.id)];
      }),
      "ticket:updated": (t) => setTickets(p => {
        const mapped = apiToTicket(t);
        const exists = p.some(x => x.id === mapped.id);
        return exists ? p.map(x => x.id === mapped.id ? mapped : x) : [mapped, ...p];
      }),
      "ticket:assigned": (t) => {
        const mapped = apiToTicket(t);
        if (user.role === "technician" && mapped.assigned_to === user.id) {
          setTickets(p => [mapped, ...p.filter(x => x.id !== mapped.id)]);
        }
      },
    });
    return () => { ws?.close(); };
  }, [user]);

  /* ── Actions ─────────────────────────────────────────────── */
  const addTicket = async (form: NewTicketPayload) => {
    if (!user) return;
    try {
      const t = await api.tickets.create(form);
      setTickets(p => [apiToTicket(t), ...p]);
    } catch (e: any) { alert(e.message); }
  };

  const changeStatus = async (id: number, status: TicketStatus) => {
    if (!user) return;
    try {
      const t = await api.tickets.setStatus(id, status);
      setTickets(p => p.map(x => x.id === id ? apiToTicket(t) : x));
      await loadLogs();
    } catch (e: any) { alert(e.message); }
  };

  const assignTicket = async (id: number, techId: string) => {
    if (!user) return;
    try {
      const t = await api.tickets.assign(id, techId);
      setTickets(p => p.map(x => x.id === id ? apiToTicket(t) : x));
      await loadLogs();
    } catch (e: any) { alert(e.message); }
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null); setPage(""); setTickets([]); setLogs([]);
  };

  /* ── Sessiya tekshirilayotganda hech narsa ko'rsatilmaydi ── */
  if (checkingSession) return null;

  /* ── Login sahifasi ───────────────────────────────────────── */
  if (!user) return <LoginPage onLogin={login} loading={loading} />;

  const props = { tickets, user, technicians, onStatusChange: changeStatus, onAssign: assignTicket };

  const renderPage = () => {
    switch (page) {
      case "new-ticket":     return <NewTicketForm user={user} onSubmit={addTicket} />;
      case "my-tickets":     return <><PageTitle title="Mening murojaatlarim" sub="Siz yuborgan barcha murojaatlar" /><TicketList {...props} filter={t => t.created_by === user.id} emptyMsg="Siz hali murojaat yubormadingiz" /></>;
      case "dash":           return <DispatcherDash {...props} />;
      case "new-tickets":    return <><PageTitle title="Yangi murojaatlar" sub={`${tickets.filter(t => t.status === "yangi").length} ta javob kutmoqda`} /><TicketList {...props} filter={t => t.status === "yangi"} emptyMsg="Yangi murojaatlar yo'q" /></>;
      case "active-tickets": return <><PageTitle title="Jarayondagi murojaatlar" /><TicketList {...props} filter={t => ["qabul", "jarayon"].includes(t.status)} emptyMsg="Jarayondagi murojaatlar yo'q" /></>;
      case "all-tickets":    return <><PageTitle title="Barcha murojaatlar" sub={`Jami ${tickets.length} ta`} /><TicketList {...props} /></>;
      case "my-tasks":       return <><PageTitle title="Mening vazifalarim" sub="Sizga biriktirilgan faol murojaatlar" /><TicketList {...props} filter={t => t.assigned_to === user.id && t.status !== "tugallandi"} emptyMsg="Hozircha faol vazifa yo'q" /></>;
      case "completed":      return <><PageTitle title="Bajarilgan vazifalar" /><TicketList {...props} filter={t => t.assigned_to === user.id && t.status === "tugallandi"} emptyMsg="Hali bajarilgan vazifa yo'q" /></>;
      case "stats":          return <AdminStats tickets={tickets} />;
      case "kpi":            return <KpiPage tickets={tickets} allUsers={allUsers} />;
      case "archive":        return <><PageTitle title="Arxiv" sub="Yakunlangan va bekor qilingan murojaatlar" /><TicketList {...props} filter={t => ["tugallandi", "bekor"].includes(t.status)} emptyMsg="Arxiv hozircha bo'sh" /></>;
      case "users":          return <UsersTable users={allUsers} onRefresh={async () => { const u = await api.users.list(); setAllUsers(u.map(apiToUser)); }} />;
      case "departments":    return <DepartmentsPage />;
      case "logs":           return <LogsTable logs={logs} />;
      default:               return null;
    }
  };

  return (
    <>
      <BgBlobs />
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={user} page={page} setPage={setPage} notifCount={notifCount}
          mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header user={user} page={page} notifCount={notifCount} onHamburger={() => setMobileOpen(o => !o)}
            onLogout={logout} onProfileUpdated={setUser} />
          <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
            <div className="max-w-5xl mx-auto">{renderPage()}</div>
          </main>
        </div>
      </div>
    </>
  );
}
