import { useState } from "react";
import type { Ticket, User } from "../App";
import type { TicketStatus } from "../data/constants";
import { G } from "../styles/glass";
import { Avatar, FaIcon, CategoryPill, PriorityBadge, StatCard, Btn } from "../components/Atoms";
import { GlassDropdown } from "../components/GlassInput";
import { Modal } from "../components/Layout";

interface Props {
  tickets: Ticket[];
  technicians: User[];
  onStatusChange: (id: number, status: TicketStatus) => void;
  onAssign: (id: number, techId: string) => void;
}

export default function DispatcherDash({ tickets, technicians, onStatusChange, onAssign }: Props) {
  const [assignModal,     setAssignModal]     = useState<Ticket | null>(null);
  const [pendingAssignId, setPendingAssignId] = useState("");

  const yangi   = tickets.filter(t => t.status === "yangi");
  const jarayon = tickets.filter(t => t.status === "jarayon").length;
  const tugal   = tickets.filter(t => t.status === "tugallandi").length;

  const techOptions = [
    { value:"", label:"Texnik tanlang…" },
    ...technicians.map(t => ({ value:String(t.id), label:t.fullname }))
  ];

  const confirmAssign = () => {
    if (!assignModal) return;
    onStatusChange(assignModal.id, "qabul");
    if (pendingAssignId) onAssign(assignModal.id, pendingAssignId);
    setAssignModal(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm">Real vaqtda holat</p>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Jami"       value={tickets.length} fa="fa-layer-group"  from="#5E6AD2" to="#7C3AED" />
        <StatCard label="Yangi"      value={yangi.length}   fa="fa-bell"         from="#D97706" to="#EA580C" sub="Javob kutmoqda" />
        <StatCard label="Jarayonda"  value={jarayon}        fa="fa-gears"        from="#7C3AED" to="#9333EA" />
        <StatCard label="Tugallandi" value={tugal}          fa="fa-circle-check" from="#059669" to="#059669" />
      </div>

      <div className="rounded-2xl p-4 sm:p-5" style={G.card}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaIcon name="fa-bell" color="#D97706" size={14} />
            <h3 className="font-bold text-gray-900">Yangi murojaatlar</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                style={{ background:"rgba(249,115,22,0.12)", color:"#C2410C", border:"1px solid rgba(249,115,22,0.25)" }}>
            {yangi.length} ta
          </span>
        </div>
        {yangi.length === 0 ? (
          <div className="py-10 text-center">
            <FaIcon name="fa-circle-check" color="#A3E635" size={32} />
            <p className="text-sm text-gray-400 mt-2">Barcha murojaatlar qayta ishlangan</p>
          </div>
        ) : (
          <div className="space-y-2">
            {yangi.map(t => (
              <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl"
                   style={{ background:"rgba(255,247,237,0.7)", border:"1px solid rgba(249,115,22,0.18)" }}>
                <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" style={{ boxShadow:"0 0 6px rgba(249,115,22,0.6)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{t.fullname}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <CategoryPill name={t.problem_type} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                </div>
                <Btn size="sm" variant="orange" onClick={() => { setAssignModal(t); setPendingAssignId(""); }} className="flex-shrink-0">
                  <FaIcon name="fa-check" color="#fff" size={10} /> Qabul
                </Btn>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl p-4 sm:p-5" style={G.card}>
        <div className="flex items-center gap-2 mb-4">
          <FaIcon name="fa-users" color="#5E6AD2" size={14} />
          <h3 className="font-bold text-gray-900">Texnik xodimlar yuklamasi</h3>
        </div>
        <div className="space-y-4">
          {technicians.map(tech => {
            const active = tickets.filter(t => t.assigned_to === tech.id && ["qabul","jarayon"].includes(t.status)).length;
            const done   = tickets.filter(t => t.assigned_to === tech.id && t.status === "tugallandi").length;
            const clr    = active === 0 ? "#059669" : active <= 2 ? "#D97706" : "#E11D48";
            return (
              <div key={tech.id} className="flex items-center gap-3">
                <Avatar name={tech.fullname} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-gray-800 truncate">{tech.fullname}</p>
                    <div className="flex gap-3 text-xs ml-2 flex-shrink-0">
                      <span style={{ color:clr }} className="font-semibold">{active} faol</span>
                      <span className="text-emerald-600 font-medium">{done} ✓</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background:"var(--tint-07)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{ width:`${Math.min(active*25,100)}%`, background:`linear-gradient(90deg,${clr},${clr}aa)` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {assignModal && (
        <Modal title="Murojaatni qabul qilish" onClose={() => setAssignModal(null)}>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl" style={{ background:"rgba(255,247,237,0.8)", border:"1px solid rgba(249,115,22,0.2)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Avatar name={assignModal.fullname} size="sm" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{assignModal.fullname}</p>
                  <p className="text-xs text-gray-500">{assignModal.department}</p>
                </div>
              </div>
              <CategoryPill name={assignModal.problem_type} />
              <p className="text-sm text-gray-600 mt-2">{assignModal.description}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <FaIcon name="fa-user-plus" color="#5E6AD2" size={13} /> Texnik xodim (ixtiyoriy)
              </p>
              <GlassDropdown value={pendingAssignId} onChange={setPendingAssignId} options={techOptions}
                placeholder="Texnik tanlang…"
                renderOption={opt => (
                  <div className="flex items-center gap-2.5 w-full">
                    {opt.value
                      ? <Avatar name={opt.label} size="sm" />
                      : <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"var(--tint-06)" }}><FaIcon name="fa-user" color="#9CA3AF" size={12} /></div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color:opt.value?"var(--text-strong)":"#9CA3AF" }}>{opt.label}</p>
                      {opt.value && (() => {
                        const tech   = technicians.find(t => String(t.id) === opt.value);
                        const active = tech ? tickets.filter(x => x.assigned_to === tech.id && ["qabul","jarayon"].includes(x.status)).length : 0;
                        const clr    = active === 0 ? "#059669" : active <= 2 ? "#D97706" : "#E11D48";
                        return <p className="text-xs font-medium" style={{ color:clr }}>{active} faol vazifa</p>;
                      })()}
                    </div>
                  </div>
                )}
                renderSelected={opt => opt.label}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Btn variant="outline" onClick={() => setAssignModal(null)} className="flex-1">Bekor</Btn>
              <Btn variant="primary" onClick={confirmAssign} className="flex-1">
                <FaIcon name="fa-check" color="#fff" size={12} />
                {pendingAssignId ? "Qabul qil & Biriktir" : "Faqat qabul qil"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
