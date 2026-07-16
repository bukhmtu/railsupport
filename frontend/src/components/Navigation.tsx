import { useState, useEffect } from "react";
import { G } from "../styles/glass";
import { MENU, ROLE_META } from "../data/constants";
import type { User } from "../App";
import { Avatar, FaIcon } from "./Atoms";

interface SidebarProps {
  user: User;
  page: string;
  setPage: (p: string) => void;
  onLogout: () => void;
  notifCount: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}
export function Sidebar({ user, page, setPage, onLogout, notifCount, mobileOpen, onMobileClose }: SidebarProps) {
  const items = MENU[user.role] ?? [];
  const rm    = ROLE_META[user.role];
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
             style={{ borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                 style={{ background:"linear-gradient(135deg,#5E6AD2,#7C3AED)", boxShadow:"0 2px 10px rgba(94,106,210,0.30)", border:"1px solid rgba(255,255,255,0.2)" }}>🚂</div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">RailSupport</p>
              <p className="text-xs text-gray-400">Texnik yordam</p>
            </div>
          </div>
          <button onClick={onMobileClose} className="lg:hidden w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background:"rgba(0,0,0,0.06)" }}>
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

        <div className="p-3.5 flex-shrink-0" style={{ borderTop:"1px solid rgba(0,0,0,0.06)" }}>
          <div className="rounded-2xl p-3" style={G.card}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={user.fullname} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm truncate">{user.fullname}</p>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background:rm.bg, color:rm.fg }}>
                  <FaIcon name={rm.icon} color={rm.iconColor} size={9} />{rm.label}
                </span>
              </div>
            </div>
            <button onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 rounded-xl btn-press"
              style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.1)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)"; }}>
              <FaIcon name="fa-arrow-right-from-bracket" color="#E11D48" size={11} />Tizimdan chiqish
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

interface HeaderProps { user: User; page: string; notifCount: number; onHamburger: () => void; }
export function Header({ user, page, notifCount, onHamburger }: HeaderProps) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("uz-UZ", { hour:"2-digit", minute:"2-digit", second:"2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const allPages = Object.values(MENU).flat();
  const pageItem = allPages.find(p => p.k === page);
  const rm       = ROLE_META[user.role];

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
        <div className="relative">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center btn-press" style={G.card}>
            <FaIcon name="fa-bell" color="#6B7280" size={14} />
          </button>
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full text-white font-bold"
                  style={{ background:"linear-gradient(135deg,#E11D48,#F59E0B)", fontSize:9, boxShadow:"0 2px 6px rgba(239,68,68,0.5)" }}>
              {notifCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor:"rgba(0,0,0,0.08)" }}>
          <Avatar name={user.fullname} size="sm" />
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-800 leading-tight">{user.fullname}</p>
            <p className="text-xs" style={{ color:rm.fg }}>{rm.label}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
