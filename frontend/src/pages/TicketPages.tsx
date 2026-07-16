import { useState, useEffect } from "react";
import { CATEGORIES, STATUS, PRIORITY, CAT_META } from "../data/constants";
import type { Ticket, User } from "../App";
import type { TicketStatus, Priority } from "../data/constants";
import { G } from "../styles/glass";
import { Avatar, FaIcon, Badge, PriorityBadge, CategoryPill, Btn } from "../components/Atoms";
import { GlassDropdown, GlassInput } from "../components/GlassInput";
import { Modal } from "../components/Layout";
import { api } from "../api/api";

/* ─── TICKET CARD ─────────────────────────────────────────────── */
interface TicketCardProps { ticket: Ticket; onClick: () => void; }
function TicketCard({ ticket, onClick }: TicketCardProps) {
  const s = STATUS[ticket.status] ?? STATUS.yangi;
  const slaAlert = ticket.priority === "yuqori" && ticket.status === "yangi";
  return (
    <div onClick={onClick} className="rounded-2xl cursor-pointer card-shine"
         style={{ ...G.card, borderLeft:`3px solid ${s.dot}` }}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={ticket.fullname} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs text-gray-400">#{ticket.id}</span>
                <span className="font-semibold text-gray-900 text-sm truncate">{ticket.fullname}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{ticket.department}</p>
            </div>
          </div>
          <Badge status={ticket.status} />
        </div>
        <div className="flex items-center flex-wrap gap-1.5 mb-2">
          <CategoryPill name={ticket.problem_type} />
          <PriorityBadge priority={ticket.priority} />
          {slaAlert && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white pulse-red"
                  style={{ background:"#E11D48" }}>
              <FaIcon name="fa-triangle-exclamation" color="#fff" size={9} />SLA
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{ticket.description}</p>
        <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-1">
          <FaIcon name="fa-clock" color="#9CA3AF" size={10} /> {ticket.created_at}
        </p>
      </div>
    </div>
  );
}

/* ─── TICKET DETAIL ──────────────────────────────────────────── */
interface TicketDetailProps {
  ticket: Ticket;
  user: User;
  technicians: User[];
  onStatusChange: (id: number, status: TicketStatus) => void;
  onAssign: (id: number, techId: string) => void;
  onClose: () => void;
}
function TicketDetail({ ticket, user, technicians, onStatusChange, onAssign, onClose }: TicketDetailProps) {
  const [assignId, setAssignId] = useState(ticket.assigned_to ? String(ticket.assigned_to) : "");
  const tech = technicians.find(t => t.id === ticket.assigned_to);
  const techOptions = [
    { value:"", label:"Texnik tanlang…" },
    ...technicians.map(t => ({ value:String(t.id), label:t.fullname }))
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-mono text-xs font-medium text-gray-400">#{ticket.id}</span>
        <Badge status={ticket.status} />
        <CategoryPill name={ticket.problem_type} />
        <PriorityBadge priority={ticket.priority} />
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl p-4" style={G.card}>
        {([["fa-user","F.I.Sh",ticket.fullname,"#5E6AD2"],["fa-building","Bo'lim",ticket.department,"#7C3AED"],
           ["fa-phone","Telefon",ticket.phone,"#059669"],["fa-clock","Sana",ticket.created_at,"#D97706"]] as [string,string,string,string][]).map(([fa,k,v,c]) => (
          <div key={k}>
            <div className="flex items-center gap-1 mb-0.5">
              <FaIcon name={fa} color={c} size={10} /><p className="text-xs text-gray-400">{k}</p>
            </div>
            <p className="font-semibold text-gray-800 text-sm break-words">{v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4" style={{ ...G.card, borderLeft:"3px solid #5E6AD2" }}>
        <p className="text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
          <FaIcon name="fa-align-left" color="#5E6AD2" size={10} /> Muammo tavsifi
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{ticket.description}</p>
      </div>

      {tech && (
        <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ ...G.card, borderLeft:"3px solid #059669" }}>
          <Avatar name={tech.fullname} size="sm" />
          <div>
            <p className="text-xs text-gray-400">Biriktirilgan texnik xodim</p>
            <p className="font-semibold text-gray-800 text-sm">{tech.fullname}</p>
            {ticket.assigned_at && <p className="text-xs text-gray-400 mt-0.5">Biriktirildi: {ticket.assigned_at}</p>}
          </div>
          <FaIcon name="fa-circle-check" color="#059669" size={18} className="ml-auto" />
        </div>
      )}

      {/* Dispatcher actions */}
      {user.role === "dispatcher" && (
        <div className="space-y-4 pt-3" style={{ borderTop:"1px solid var(--tint-07)" }}>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <FaIcon name="fa-user-plus" color="#5E6AD2" size={10} /> Texnik xodimga biriktirish
            </p>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <GlassDropdown value={assignId} onChange={setAssignId} options={techOptions}
                  placeholder="Texnik tanlang…"
                  renderOption={opt => (
                    <div className="flex items-center gap-2.5 w-full">
                      {opt.value
                        ? <Avatar name={opt.label} size="sm" />
                        : <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"var(--tint-06)" }}><FaIcon name="fa-user" color="#9CA3AF" size={12} /></div>}
                      <p className="text-sm font-semibold truncate" style={{ color:opt.value?"var(--text-strong)":"#9CA3AF" }}>{opt.label}</p>
                    </div>
                  )}
                  renderSelected={opt => opt.label}
                />
              </div>
              <Btn onClick={() => { if (assignId) { onAssign(ticket.id, assignId); onClose(); } }}
                   variant="primary" size="sm" disabled={!assignId}>
                <FaIcon name="fa-link" color="#fff" size={11} /> Biriktir
              </Btn>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status o'zgartirish</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(STATUS) as [TicketStatus, typeof STATUS[TicketStatus]][]).map(([k, v]) => (
                <button key={k} onClick={() => { onStatusChange(ticket.id, k); onClose(); }} className="btn-press"
                  style={{ background:ticket.status===k?v.dot:v.bg, color:ticket.status===k?"#fff":v.fg,
                           padding:"6px 14px", borderRadius:99, fontSize:12, fontWeight:600,
                           border:`1px solid ${v.dot}40` }}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {user.role === "admin" && (
        <div className="pt-3" style={{ borderTop:"1px solid var(--tint-07)" }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status o'zgartirish</p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(STATUS) as [TicketStatus, typeof STATUS[TicketStatus]][]).map(([k, v]) => (
              <button key={k} onClick={() => { onStatusChange(ticket.id, k); onClose(); }} className="btn-press"
                style={{ background:ticket.status===k?v.dot:v.bg, color:ticket.status===k?"#fff":v.fg,
                         padding:"6px 14px", borderRadius:99, fontSize:12, fontWeight:600,
                         border:`1px solid ${v.dot}40` }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {user.role === "technician" && (
        <div className="pt-3" style={{ borderTop:"1px solid var(--tint-07)" }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Statusni yangilash</p>
          <div className="flex gap-2 flex-wrap">
            <Btn onClick={() => { onStatusChange(ticket.id, "jarayon"); onClose(); }} variant="soft" size="sm">
              <FaIcon name="fa-gears" color="#7C3AED" size={11} /> Jarayonda
            </Btn>
            <Btn onClick={() => { onStatusChange(ticket.id, "tugallandi"); onClose(); }} variant="success" size="sm">
              <FaIcon name="fa-circle-check" color="#fff" size={11} /> Tugallandi
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── TICKET LIST ──────────────────────────────────────────────── */
interface TicketListProps {
  tickets: Ticket[];
  user: User;
  technicians: User[];
  onStatusChange: (id: number, status: TicketStatus) => void;
  onAssign: (id: number, techId: string) => void;
  filter?: (t: Ticket) => boolean;
  emptyMsg?: string;
}
export function TicketList({ tickets, user, technicians, onStatusChange, onAssign, filter, emptyMsg }: TicketListProps) {
  const [selected,       setSelected]       = useState<Ticket | null>(null);
  const [search,         setSearch]         = useState("");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterType,     setFilterType]     = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  let list = tickets.filter(t => filter ? filter(t) : true);
  if (search)                 list = list.filter(t => t.fullname.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search));
  if (filterStatus !== "all") list = list.filter(t => t.status === filterStatus);
  if (filterType   !== "all") list = list.filter(t => t.problem_type === filterType);
  if (filterPriority !== "all") list = list.filter(t => t.priority === filterPriority);
  const hasFilter = search || filterStatus !== "all" || filterType !== "all" || filterPriority !== "all";

  const statusOpts = [{ value:"all", label:"Barcha statuslar" }, ...Object.keys(STATUS).map(k => ({ value:k, label:STATUS[k as TicketStatus].label }))];
  const typeOpts   = [{ value:"all", label:"Barcha turlar" },    ...CATEGORIES.map(c => ({ value:c, label:c }))];
  const prioOpts   = [{ value:"all", label:"Barcha ustuvorlik" },...Object.keys(PRIORITY).map(k => ({ value:k, label:PRIORITY[k as Priority].label }))];

  return (
    <div>
      <div className="rounded-2xl p-3 mb-4 flex flex-col gap-2" style={G.card}>
        <div className="relative">
          <FaIcon name="fa-magnifying-glass" color="#9CA3AF" size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ID, ism yoki tavsif..."
            className="w-full h-9 pl-8 pr-3 text-sm rounded-xl outline-none glass-input" style={G.input} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <GlassDropdown value={filterStatus} onChange={setFilterStatus} options={statusOpts}
            renderOption={opt => (<div className="flex items-center gap-2">{opt.value !== "all" && <span style={{ background:STATUS[opt.value as TicketStatus]?.dot, width:7, height:7, borderRadius:"50%", display:"inline-block" }} />}{opt.label}</div>)}
            renderSelected={opt => opt.label} placeholder="Status" />
          <GlassDropdown value={filterType} onChange={setFilterType} options={typeOpts}
            renderOption={opt => (<div className="flex items-center gap-2">{opt.value !== "all" && <FaIcon name={CAT_META[opt.value]?.fa||"fa-circle"} color={CAT_META[opt.value]?.color||"#64748B"} size={11} />}{opt.label}</div>)}
            renderSelected={opt => opt.label} placeholder="Tur" />
          <GlassDropdown value={filterPriority} onChange={setFilterPriority} options={prioOpts}
            renderOption={opt => (<div className="flex items-center gap-2">{opt.value !== "all" && <span style={{ background:PRIORITY[opt.value as Priority]?.dot, width:7, height:7, borderRadius:"50%", display:"inline-block" }} />}{opt.label}</div>)}
            renderSelected={opt => opt.label} placeholder="Ustuvorlik" />
        </div>
        {hasFilter && (
          <Btn variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterStatus("all"); setFilterType("all"); setFilterPriority("all"); }}>
            <FaIcon name="fa-xmark" color="#5E6AD2" size={11} /> Tozalash
          </Btn>
        )}
      </div>
      {list.length > 0 && <p className="text-xs text-gray-400 mb-3 px-1">{list.length} ta murojaat</p>}
      {list.length === 0 ? (
        <div className="rounded-2xl py-14 text-center px-4" style={G.card}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
               style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.15)" }}>
            <FaIcon name="fa-inbox" color="#A5B4FC" size={28} />
          </div>
          <p className="text-gray-500 text-sm font-medium">{emptyMsg ?? "Murojaatlar topilmadi"}</p>
          {hasFilter && <p className="text-xs text-gray-400 mt-1">Filterni o'zgartiring</p>}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map(t => <TicketCard key={t.id} ticket={t} onClick={() => setSelected(t)} />)}
        </div>
      )}
      {selected && (
        <Modal title="Murojaat tafsilotlari" onClose={() => setSelected(null)}>
          <TicketDetail ticket={selected} user={user} technicians={technicians}
            onStatusChange={onStatusChange} onAssign={onAssign} onClose={() => setSelected(null)} />
        </Modal>
      )}
    </div>
  );
}

/* ─── NEW TICKET FORM ─────────────────────────────────────────── */
export interface NewTicketPayload {
  fullname: string; department_id: number; phone: string;
  problem_type: string; description: string; priority: Priority;
}
interface NewTicketFormProps { user: User; onSubmit: (form: NewTicketPayload) => void; }
export function NewTicketForm({ user, onSubmit }: NewTicketFormProps) {
  const [form,    setForm]    = useState({ fullname:user.role==="employee"?user.fullname:"", department:"", phone:"", problem_type:"", description:"", priority:"orta" as Priority });
  const [depts,   setDepts]   = useState<{ id: number; name: string }[]>([]);
  const [success, setSuccess] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]:v }));

  useEffect(() => { api.departments.list({ activeOnly: true }).then(setDepts).catch(() => {}); }, []);

  const submit = () => {
    if (!form.fullname || !form.department || !form.phone || !form.problem_type || !form.description)
      return alert("Barcha maydonlarni to'ldiring");
    const dept = depts.find(d => d.name === form.department);
    if (!dept) return alert("Bo'limni qayta tanlang");
    onSubmit({ fullname:form.fullname, department_id:dept.id, phone:form.phone, problem_type:form.problem_type, description:form.description, priority:form.priority });
    setSuccess(true);
    setForm({ fullname:user.role==="employee"?user.fullname:"", department:"", phone:"", problem_type:"", description:"", priority:"orta" });
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Yangi murojaat yuborish</h2>
        <p className="text-gray-500 text-sm mt-1">Barcha maydonlarni to'ldiring</p>
      </div>
      {success && (
        <div className="mb-5 flex items-start gap-3 px-5 py-4 rounded-2xl anim-fade"
             style={{ background:"rgba(240,253,244,0.85)", border:"1px solid rgba(34,197,94,0.3)" }}>
          <FaIcon name="fa-circle-check" color="#059669" size={16} />
          <div>
            <p className="font-bold text-emerald-800">Murojaat muvaffaqiyatli yuborildi!</p>
            <p className="text-emerald-600 text-xs mt-0.5">Dispetcher tez orada ko'rib chiqadi.</p>
          </div>
        </div>
      )}
      <div className="rounded-2xl p-4 sm:p-6" style={G.card}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <GlassInput label="F.I.Sh" value={form.fullname} onChange={v => set("fullname",v)} placeholder="Ism Familiya" required />
          <GlassInput label="Bo'lim" value={form.department} onChange={v => set("department",v)} as="select" options={depts.map(d => d.name)} placeholder="Bo'lim tanlang…" required />
          <GlassInput label="Telefon raqami" value={form.phone} onChange={v => set("phone",v)} placeholder="+998 90 000 00 00" required />
          <GlassInput label="Muammo turi" value={form.problem_type} onChange={v => set("problem_type",v)} as="select" options={CATEGORIES} placeholder="Kategoriya tanlang…" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ustuvorlik</label>
          <div className="flex gap-2">
            {(Object.entries(PRIORITY) as [Priority, typeof PRIORITY[Priority]][]).map(([k, v]) => (
              <button key={k} onClick={() => set("priority", k)} className="btn-press flex-1 py-2 rounded-xl text-xs font-semibold"
                style={{ background:form.priority===k?v.dot:v.bg, color:form.priority===k?"#fff":v.fg, border:`1px solid ${v.dot}40` }}>
                <FaIcon name={v.fa} color={form.priority===k?"#fff":v.fg} size={10} /> {v.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <GlassInput label="Muammo tavsifi" value={form.description} onChange={v => set("description",v)}
            placeholder="Muammoni batafsil yozing..." as="textarea" rows={4} required />
        </div>
        <Btn variant="primary" onClick={submit} className="w-full h-11">
          <FaIcon name="fa-paper-plane" color="#fff" size={13} /> Murojaat yuborish
        </Btn>
      </div>
    </div>
  );
}
