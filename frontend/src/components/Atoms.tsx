import type { CSSProperties, ReactNode } from "react";
import { AVATAR_PALETTE, PRIORITY, STATUS, CAT_META } from "../data/constants";
import type { TicketStatus, Priority } from "../data/constants";
import { G } from "../styles/glass";

/* ─── Avatar ─────────────────────────────────────────────────── */
interface AvatarProps { name: string; size?: "sm" | "md" | "lg"; }
export function Avatar({ name, size = "md" }: AvatarProps) {
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_PALETTE.length;
  const [bg, fg] = AVATAR_PALETTE[idx];
  const initials = name.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-xl flex items-center justify-center font-semibold flex-shrink-0 select-none`}
         style={{ background:bg, color:fg, backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.7)" }}>
      {initials}
    </div>
  );
}

/* ─── FaIcon ─────────────────────────────────────────────────── */
interface FaIconProps { name: string; color?: string; size?: number; className?: string; }
export function FaIcon({ name, color, size = 14, className = "" }: FaIconProps) {
  return <i className={`fa-solid ${name} ${className}`} style={{ color, fontSize: size }} />;
}

/* ─── Badge ──────────────────────────────────────────────────── */
export function Badge({ status }: { status: TicketStatus }) {
  const s = STATUS[status] ?? STATUS.yangi;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
          style={{ background:s.bg, color:s.fg, border:`1px solid ${s.dot}40`, boxShadow:`0 0 8px ${s.glow}`, backdropFilter:"blur(8px)" }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:s.dot }} />{s.label}
    </span>
  );
}

/* ─── PriorityBadge ──────────────────────────────────────────── */
export function PriorityBadge({ priority }: { priority: Priority }) {
  const p = PRIORITY[priority] ?? PRIORITY.orta;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background:p.bg, color:p.fg, border:`1px solid ${p.dot}30` }}>
      <FaIcon name={p.fa} color={p.fg} size={9} />{p.label}
    </span>
  );
}

/* ─── CategoryPill ───────────────────────────────────────────── */
export function CategoryPill({ name }: { name: string }) {
  const m = CAT_META[name] ?? { fa:"fa-circle-question", color:"#64748B" };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background:`${m.color}14`, color:m.color, border:`1px solid ${m.color}28`, backdropFilter:"blur(8px)" }}>
      <FaIcon name={m.fa} color={m.color} size={10} />{name}
    </span>
  );
}

/* ─── Btn ────────────────────────────────────────────────────── */
type BtnVariant = "primary"|"ghost"|"outline"|"danger"|"success"|"soft"|"orange";
interface BtnProps {
  children: ReactNode;
  variant?: BtnVariant;
  onClick?: () => void;
  className?: string;
  size?: "sm"|"md"|"lg";
  disabled?: boolean;
}
export function Btn({ children, variant = "primary", onClick, className = "", size = "md", disabled = false }: BtnProps) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl cursor-pointer select-none whitespace-nowrap btn-press";
  const sz: Record<string, string> = { sm:"px-3 py-1.5 text-xs", md:"px-4 py-2 text-sm", lg:"px-5 py-2.5 text-sm" };
  const styles: Record<BtnVariant, CSSProperties> = {
    primary: { background:"linear-gradient(135deg,#5E6AD2,#7C3AED)", color:"#fff", boxShadow:"0 2px 10px rgba(94,106,210,0.30), inset 0 1px 0 rgba(255,255,255,0.15)", border:"1px solid rgba(94,106,210,0.4)" },
    ghost:   { background:"transparent", color:"#5E6AD2", border:"none" },
    outline: { background:"rgba(255,255,255,0.70)", color:"#334155", border:"1px solid rgba(203,213,225,0.9)", backdropFilter:"blur(10px)", boxShadow:"0 1px 4px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.9)" },
    danger:  { background:"linear-gradient(135deg,#E11D48,#BE123C)", color:"#fff", boxShadow:"0 2px 10px rgba(225,29,72,0.25)", border:"1px solid rgba(190,18,60,0.3)" },
    success: { background:"linear-gradient(135deg,#059669,#047857)", color:"#fff", boxShadow:"0 2px 10px rgba(5,150,105,0.25)", border:"1px solid rgba(4,120,87,0.3)" },
    soft:    { background:"rgba(238,242,255,0.90)", color:"#3730A3", border:"1px solid rgba(94,106,210,0.20)", backdropFilter:"blur(10px)" },
    orange:  { background:"linear-gradient(135deg,#D97706,#EA580C)", color:"#fff", boxShadow:"0 2px 10px rgba(217,119,6,0.25)", border:"1px solid rgba(234,88,12,0.3)" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...styles[variant], opacity: disabled ? 0.5 : 1 }}
      className={`${base} ${sz[size]} ${className}`}>
      {children}
    </button>
  );
}

/* ─── StatCard ───────────────────────────────────────────────── */
interface StatCardProps { label: string; value: string | number; fa: string; from: string; to: string; sub?: string; }
export function StatCard({ label, value, fa, from, to, sub }: StatCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden card-shine" style={G.card}>
      <div className="px-4 sm:px-5 pt-4 pb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
             style={{ background:`linear-gradient(135deg,${from},${to})`, boxShadow:`0 4px 14px ${from}55`, border:"1px solid rgba(255,255,255,0.2)" }}>
          <FaIcon name={fa} color="#fff" size={16} />
        </div>
      </div>
      <div className="h-1 w-full" style={{ background:`linear-gradient(90deg,${from},${to})` }} />
    </div>
  );
}

/* ─── KpiRing ────────────────────────────────────────────────── */
interface KpiRingProps { pct: number; color: string; size?: number; }
export function KpiRing({ pct, color, size = 80 }: KpiRingProps) {
  const r = (size - 10) / 2, circ = 2 * Math.PI * r, dash = circ * (pct / 100);
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        className="kpi-ring" style={{ filter:`drop-shadow(0 0 4px ${color}66)` }} />
    </svg>
  );
}

/* ─── PageTitle ──────────────────────────────────────────────── */
interface PageTitleProps { title: string; sub?: string; }
export function PageTitle({ title, sub }: PageTitleProps) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {sub && <p className="text-gray-500 text-sm mt-0.5">{sub}</p>}
    </div>
  );
}
