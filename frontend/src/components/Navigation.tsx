import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { G } from "../styles/glass";
import { MENU, ROLE_META } from "../data/constants";
import type { Role } from "../data/constants";
import type { User, Ticket } from "../App";
import { Avatar, FaIcon, Btn } from "./Atoms";
import { GlassInput } from "./GlassInput";
import { Modal } from "./Layout";
import { api } from "../api/api";
import { getInitialTheme, applyTheme } from "../lib/theme";
import type { Theme } from "../lib/theme";

function notifTargetPage(role: string): string {
  if (role === "dispatcher") return "new-tickets";
  if (role === "technician") return "my-tasks";
  if (role === "admin")      return "all-tickets";
  return "my-tickets";
}
export function notifTickets(tickets: Ticket[], user: User): Ticket[] {
  if (user.role === "technician") return tickets.filter(t => t.assigned_to === user.id && t.status === "qabul");
  return tickets.filter(t => t.status === "yangi");
}

interface SidebarProps {
  user: User;
  page: string;
  setPage: (p: string) => void;
  notifCount: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}
export function Sidebar({ user, page, setPage, notifCount, mobileOpen, onMobileClose }: SidebarProps) {
  const items = MENU[user.role as Role] ?? [];
  const rm    = ROLE_META[user.role as Role];
  const nav   = (k: string) => { setPage(k); onMobileClose(); };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden anim-fade"
             style={{ background:"rgba(15,23,42,0.35)", backdropFilter:"blur(4px)" }}
             onClick={onMobileClose} />
      )}
      <aside style={G.sidebar}
        className={[
          "fixed top-0 left-0 z-50 h-full w-64 sidebar-drawer",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:z-auto lg:h-screen lg:flex-shrink-0 lg:w-60 lg:translate-x-0 lg:sidebar-drawer-none",
          "flex flex-col"
        ].join(" ")}>

        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
             style={{ borderBottom:"1px solid var(--tint-06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                 style={{ background:"linear-gradient(135deg,#5E6AD2,#7C3AED)", boxShadow:"0 2px 10px rgba(94,106,210,0.30)", border:"1px solid rgba(255,255,255,0.2)" }}>🚂</div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">RailSupport</p>
              <p className="text-xs text-gray-400">Texnik yordam</p>
            </div>
          </div>
          <button onClick={onMobileClose} className="lg:hidden w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background:"var(--tint-06)" }}>
            <FaIcon name="fa-xmark" color="#6B7280" size={12} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="text-xs font-semibold text-gray-400/70 uppercase tracking-widest px-2 mb-2">Menyu</p>
          <ul className="space-y-0.5">
            {items.map(item => {
              const active = page === item.k;
              return (
                <li key={item.k}>
                  <button onClick={() => nav(item.k)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left relative btn-press"
                    style={active ? G.navActive : { background:"transparent" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                         style={{ background:`${item.color}18`, border:`1px solid ${item.color}28` }}>
                      <FaIcon name={item.fa} color={active ? item.color : `${item.color}aa`} size={12} />
                    </div>
                    <span className={`flex-1 font-medium ${active ? "text-blue-700" : "text-gray-600"}`}>{item.label}</span>
                    {item.k === "new-tickets" && notifCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold text-white"
                            style={{ background:"linear-gradient(135deg,#E11D48,#F59E0B)", boxShadow:"0 2px 6px rgba(239,68,68,0.4)" }}>
                        {notifCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3.5 flex-shrink-0" style={{ borderTop:"1px solid var(--tint-06)" }}>
          <div className="rounded-2xl p-3 flex items-center gap-3" style={G.card}>
            <Avatar name={user.fullname} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 text-sm truncate">{user.fullname}</p>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background:rm.bg, color:rm.fg }}>
                <FaIcon name={rm.icon} color={rm.iconColor} size={9} />{rm.label}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ─── PROFIL TAHRIRLASH ───────────────────────────────────────── */
interface ProfileEditModalProps { user: User; onClose: () => void; onSaved: (u: User) => void; }
function ProfileEditModal({ user, onClose, onSaved }: ProfileEditModalProps) {
  const [fullname, setFullname] = useState(user.fullname);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const save = async () => {
    if (!fullname || !username) { setError("F.I.Sh va login bo'sh bo'lmasin"); return; }
    setError("");
    setSaving(true);
    try {
      const body: { fullname?: string; username?: string; password?: string } = {};
      if (fullname !== user.fullname) body.fullname = fullname;
      if (username !== user.username) body.username = username;
      if (password) body.password = password;
      const updated = await api.auth.updateProfile(body);
      onSaved({ id: updated.id, fullname: updated.fullname, username: updated.username, role: updated.role, is_active: updated.is_active });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Profilni tahrirlash" onClose={onClose}>
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-rose-700"
               style={{ background:"rgba(254,226,226,0.8)", border:"1px solid rgba(252,165,165,0.5)" }}>
            <FaIcon name="fa-circle-exclamation" color="#E11D48" size={14} />{error}
          </div>
        )}
        <GlassInput label="F.I.Sh" value={fullname} onChange={setFullname} placeholder="Ism Familiya" />
        <GlassInput label="Login (username)" value={username} onChange={setUsername} placeholder="username" />
        <GlassInput label="Yangi parol (ixtiyoriy)" type="password" value={password} onChange={setPassword} placeholder="o'zgartirmasangiz bo'sh qoldiring" />
        <div className="flex gap-2 pt-1">
          <Btn variant="outline" onClick={onClose} className="flex-1">Bekor</Btn>
          <Btn variant="primary" onClick={save} disabled={saving} className="flex-1">
            {saving ? "Saqlanmoqda…" : "Saqlash"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ─── FOYDALANUVCHI MENYUSI (Sozlamalar / Tema / Tizimdan chiqish) ─ */
interface UserMenuProps { user: User; onLogout: () => void; onProfileUpdated: (u: User) => void; }
function UserMenu({ user, onLogout, onProfileUpdated }: UserMenuProps) {
  const [open, setOpen]         = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme]       = useState<Theme>(getInitialTheme());
  const [rect, setRect]         = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef     = useRef<HTMLDivElement>(null);
  const rm = ROLE_META[user.role as Role];

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  const updateRect = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 8, right: window.innerWidth - r.right });
  };

  useLayoutEffect(() => { if (open) updateRect(); }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updateRect();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <>
      <button ref={triggerRef} onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-2 border-l btn-press rounded-lg" style={{ borderColor:"var(--tint-08)" }}>
        <Avatar name={user.fullname} size="sm" />
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-gray-800 leading-tight">{user.fullname}</p>
          <p className="text-xs" style={{ color:rm.fg }}>{rm.label}</p>
        </div>
        <FaIcon name={open ? "fa-chevron-up" : "fa-chevron-down"} color="#9CA3AF" size={10} className="hidden sm:block" />
      </button>

      {open && rect && createPortal(
        <div ref={menuRef} className="gd-menu" style={{ ...G.dropdown, position:"fixed", top:rect.top, right:rect.right, width:200 }}>
          <div className="gd-item" onClick={() => { setShowProfile(true); setOpen(false); }}>
            <FaIcon name="fa-gear" color="#5E6AD2" size={12} /> Sozlamalar
          </div>
          <div className="gd-item" onClick={toggleTheme}>
            <FaIcon name={theme === "dark" ? "fa-sun" : "fa-moon"} color="#D97706" size={12} />
            {theme === "dark" ? "Yorug' rejim" : "Tungi rejim"}
          </div>
          <div className="gd-item" onClick={() => { setOpen(false); onLogout(); }} style={{ color:"#E11D48" }}>
            <FaIcon name="fa-arrow-right-from-bracket" color="#E11D48" size={12} /> Tizimdan chiqish
          </div>
        </div>,
        document.body
      )}

      {showProfile && (
        <ProfileEditModal user={user} onClose={() => setShowProfile(false)}
          onSaved={u => { onProfileUpdated(u); setShowProfile(false); }} />
      )}
    </>
  );
}

/* ─── BILDIRISHNOMALAR (Qo'ng'iroqcha) ────────────────────────── */
interface NotificationBellProps { tickets: Ticket[]; user: User; onNavigate: (page: string) => void; }
function NotificationBell({ tickets, user, onNavigate }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef     = useRef<HTMLDivElement>(null);

  const items = notifTickets(tickets, user);
  const targetPage = notifTargetPage(user.role);

  const updateRect = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 8, right: window.innerWidth - r.right });
  };

  useLayoutEffect(() => { if (open) updateRect(); }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updateRect();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const goToList = () => { onNavigate(targetPage); setOpen(false); };

  return (
    <div className="relative">
      <button ref={triggerRef} onClick={() => setOpen(o => !o)} className="w-9 h-9 rounded-xl flex items-center justify-center btn-press" style={G.card}>
        <FaIcon name="fa-bell" color="#6B7280" size={14} />
      </button>
      {items.length > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full text-white font-bold"
              style={{ background:"linear-gradient(135deg,#E11D48,#F59E0B)", fontSize:9, boxShadow:"0 2px 6px rgba(239,68,68,0.5)" }}>
          {items.length}
        </span>
      )}
      {open && rect && createPortal(
        <div ref={menuRef} className="gd-menu" style={{ ...G.dropdown, position:"fixed", top:rect.top, right:rect.right, width:300, padding:0 }}>
          <div className="px-4 py-3" style={{ borderBottom:"1px solid var(--tint-06)" }}>
            <span className="font-semibold text-gray-800 text-sm">Bildirishnomalar</span>
          </div>
          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Yangi bildirishnoma yo'q</p>
            ) : items.slice(0, 8).map(t => (
              <div key={t.id} className="gd-item" style={{ borderRadius: 0, alignItems: "flex-start" }} onClick={goToList}>
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background:"#D97706" }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{t.fullname} — {t.problem_type}</p>
                  <p className="text-xs text-gray-400 truncate">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
          {items.length > 0 && (
            <div className="px-4 py-2.5" style={{ borderTop:"1px solid var(--tint-06)" }}>
              <button onClick={goToList} className="text-xs font-semibold text-blue-600 w-full text-center">Barchasini ko'rish</button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

interface HeaderProps {
  user: User;
  page: string;
  tickets: Ticket[];
  onNavigate: (page: string) => void;
  onHamburger: () => void;
  onLogout: () => void;
  onProfileUpdated: (u: User) => void;
}
export function Header({ user, page, tickets, onNavigate, onHamburger, onLogout, onProfileUpdated }: HeaderProps) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("uz-UZ", { hour:"2-digit", minute:"2-digit", second:"2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const allPages = Object.values(MENU).flat();
  const pageItem = allPages.find(p => p.k === page);

  return (
    <header className="sticky top-0 z-30 flex-shrink-0 px-4 sm:px-5 h-14 flex items-center justify-between" style={G.header}>
      <div className="flex items-center gap-3">
        <button onClick={onHamburger} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl btn-press" style={G.card}>
          <FaIcon name="fa-bars" color="#6B7280" size={14} />
        </button>
        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="text-gray-400 hidden sm:inline text-xs">RailSupport</span>
          <span className="text-gray-300 hidden sm:inline">/</span>
          {pageItem && (
            <>
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background:`${pageItem.color}18` }}>
                <FaIcon name={pageItem.fa} color={pageItem.color} size={10} />
              </div>
              <span className="font-semibold text-gray-800 truncate">{pageItem.label}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-gray-500" style={G.card}>
          <FaIcon name="fa-clock" color="#5E6AD2" size={10} />{clock}
        </div>
        <NotificationBell tickets={tickets} user={user} onNavigate={onNavigate} />
        <UserMenu user={user} onLogout={onLogout} onProfileUpdated={onProfileUpdated} />
      </div>
    </header>
  );
}
