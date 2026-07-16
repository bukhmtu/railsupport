import { useRef, useState } from "react";
import { ROLE_META } from "../data/constants";
import type { Role } from "../data/constants";
import type { Ticket, Log } from "../App";
import type { User } from "../App";
import { G } from "../styles/glass";
import { Avatar, FaIcon, KpiRing, Btn } from "../components/Atoms";
import { GlassDropdown, GlassInput } from "../components/GlassInput";
import { Modal } from "../components/Layout";
import { useChartJs } from "../hooks/useChartJs";
import { api } from "../api/api";

/* ─── KPI PAGE ─────────────────────────────────────────────── */
export function KpiPage({ tickets, allUsers }: { tickets: Ticket[]; allUsers: User[] }) {
  const barRef    = useRef<HTMLCanvasElement>(null);
  const barChart  = useRef<any>(null);
  const donutRef  = useRef<HTMLCanvasElement>(null);
  const donutChart = useRef<any>(null);

  const workers = allUsers.filter(u => u.role === "dispatcher" || u.role === "technician");
  const stats = workers.map(w => {
    const assigned = tickets.filter(t => t.assigned_to === w.id);
    const done     = assigned.filter(t => t.status === "tugallandi").length;
    const active   = assigned.filter(t => ["qabul","jarayon"].includes(t.status)).length;
    const total    = assigned.length;
    const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
    const accepted = w.role === "dispatcher" ? tickets.filter(t => t.status !== "yangi").length : 0;
    return { ...w, done, active, total, pct, accepted };
  });

  useChartJs((Chart) => {
    const canvas = barRef.current; if (!canvas) return;
    if (barChart.current) barChart.current.destroy();
    barChart.current = new Chart(canvas, {
      type: "bar",
      data: { labels: stats.map(s => s.fullname.split(" ")[0]),
        datasets: [
          { label:"Tugallangan", data:stats.map(s => s.done),   backgroundColor:"rgba(34,197,94,0.75)",  borderRadius:8, borderSkipped:false },
          { label:"Faol",        data:stats.map(s => s.active), backgroundColor:"rgba(139,92,246,0.75)", borderRadius:8, borderSkipped:false },
        ]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:"top", labels:{ font:{ family:"Plus Jakarta Sans", size:12 }, padding:16, usePointStyle:true } } },
        scales:{ x:{ grid:{ display:false } }, y:{ grid:{ color:"rgba(0,0,0,0.05)" }, beginAtZero:true } } }
    });
  }, [tickets, allUsers]);

  useChartJs((Chart) => {
    const canvas = donutRef.current; if (!canvas) return;
    if (donutChart.current) donutChart.current.destroy();
    donutChart.current = new Chart(canvas, {
      type: "doughnut",
      data: { labels: stats.map(s => s.fullname.split(" ")[0]),
        datasets:[{ data:stats.map(s => s.done || 1), backgroundColor:["#059669","#5E6AD2","#7C3AED","#D97706","#DB2777"], borderWidth:2, borderColor:"rgba(255,255,255,0.9)", hoverOffset:6 }]},
      options:{ responsive:true, maintainAspectRatio:false, cutout:"68%",
        plugins:{ legend:{ position:"bottom", labels:{ font:{ family:"Plus Jakarta Sans", size:11 }, padding:12, usePointStyle:true } } } }
    });
  }, [tickets, allUsers]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">KPI & Xodimlar samaradorligi</h2>
        <p className="text-gray-500 text-sm mt-0.5">Har bir xodimning ish ko'rsatkichlari</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(s => {
          const clr = s.pct >= 80 ? "#059669" : s.pct >= 50 ? "#D97706" : "#E11D48";
          const rm  = ROLE_META[s.role as keyof typeof ROLE_META];
          return (
            <div key={s.id} className="rounded-2xl p-4 card-shine" style={G.card}>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={s.fullname} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{s.fullname}</p>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mt-0.5" style={{ background:rm?.bg, color:rm?.fg }}>
                    <FaIcon name={rm?.icon} color={rm?.iconColor} size={9} />{rm?.label}
                  </span>
                </div>
                <div className="relative flex-shrink-0">
                  <KpiRing pct={s.pct} color={clr} size={64} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold" style={{ color:clr }}>{s.pct}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["fa-circle-check","#059669",s.done,"Tugallandi"],
                  ["fa-gears","#7C3AED",s.active,"Faol"],
                  [s.role==="dispatcher"?"fa-check-double":"fa-layer-group","#5E6AD2",
                    s.role==="dispatcher"?s.accepted:s.total,
                    s.role==="dispatcher"?"Qabul qildi":"Jami"],
                ] as [string,string,number,string][]).map(([fa,c,v,l]) => (
                  <div key={l} className="rounded-xl p-2.5 text-center" style={{ background:`${c}0d`, border:`1px solid ${c}20` }}>
                    <FaIcon name={fa} color={c} size={14} />
                    <p className="text-lg font-bold mt-1" style={{ color:c }}>{v}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Samaradorlik</span>
                  <span style={{ color:clr }} className="font-semibold">{s.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(0,0,0,0.07)" }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                       style={{ width:`${s.pct}%`, background:`linear-gradient(90deg,${clr},${clr}bb)` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid xl:grid-cols-2 gap-4">
        <div className="rounded-2xl p-4 sm:p-5" style={G.card}>
          <div className="flex items-center gap-2 mb-4"><FaIcon name="fa-chart-bar" color="#5E6AD2" size={14} /><h3 className="font-bold text-gray-900">Xodimlar bo'yicha hisobot</h3></div>
          <div style={{ height:220 }}><canvas ref={barRef} /></div>
        </div>
        <div className="rounded-2xl p-4 sm:p-5" style={G.card}>
          <div className="flex items-center gap-2 mb-4"><FaIcon name="fa-chart-pie" color="#5E6AD2" size={14} /><h3 className="font-bold text-gray-900">Tugallangan ishlar ulushi</h3></div>
          <div style={{ height:220 }}><canvas ref={donutRef} /></div>
        </div>
      </div>
    </div>
  );
}

/* ─── USERS TABLE ─────────────────────────────────────────── */
export function UsersTable({ users, onRefresh }: { users: User[]; onRefresh: () => void }) {
  const [showAdd,   setShowAdd]   = useState(false);
  const [form, setForm]       = useState({ fullname:"", username:"", password:"", role:"employee" });
  const [saving, setSaving]   = useState(false);
  const [resetFor, setResetFor] = useState<User | null>(null);
  const [newPass,  setNewPass]  = useState("");
  const [resetting, setResetting] = useState(false);

  const roleOpts = (Object.keys(ROLE_META) as Role[]).map(r => ({ value:r, label:ROLE_META[r].label }));

  const handleAdd = async () => {
    if (!form.fullname || !form.username || !form.password) { alert("Barcha maydonlarni to'ldiring"); return; }
    setSaving(true);
    try {
      await api.users.create(form);
      setShowAdd(false);
      setForm({ fullname:"", username:"", password:"", role:"employee" });
      onRefresh();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (u: User) => {
    try {
      await api.users.update(u.id, { is_active: !u.is_active });
      onRefresh();
    } catch (e: any) { alert(e.message); }
  };

  const handleResetPassword = async () => {
    if (!resetFor || newPass.length < 4) { alert("Parol kamida 4 ta belgidan iborat bo'lsin"); return; }
    setResetting(true);
    try {
      await api.users.resetPassword(resetFor.id, newPass);
      setResetFor(null); setNewPass("");
      alert(`${resetFor.fullname} uchun yangi parol o'rnatildi`);
    } catch (e: any) { alert(e.message); }
    finally { setResetting(false); }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Foydalanuvchilar</h2>
          <p className="text-gray-500 text-sm">{users.length} ta ro'yxatdan o'tgan</p>
        </div>
        <Btn variant="primary" size="sm" onClick={() => setShowAdd(s => !s)}>
          <FaIcon name="fa-plus" color="#fff" size={11} /> Yangi qo'shish
        </Btn>
      </div>

      {showAdd && (
        <div className="mb-4 rounded-2xl p-4" style={G.card}>
          <p className="font-semibold text-gray-800 mb-3">Yangi foydalanuvchi</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <GlassInput label="F.I.Sh" value={form.fullname} onChange={v => setForm(f => ({...f,fullname:v}))} placeholder="Ism Familiya" />
            <GlassInput label="Username" value={form.username} onChange={v => setForm(f => ({...f,username:v}))} placeholder="login" />
            <GlassInput label="Parol" type="password" value={form.password} onChange={v => setForm(f => ({...f,password:v}))} placeholder="parol" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
              <GlassDropdown value={form.role} onChange={v => setForm(f => ({...f,role:v}))} options={roleOpts} placeholder="Rol tanlang…" />
            </div>
          </div>
          <div className="flex gap-2">
            <Btn variant="outline" size="sm" onClick={() => setShowAdd(false)}>Bekor</Btn>
            <Btn variant="primary" size="sm" onClick={handleAdd} disabled={saving}>
              {saving ? "Saqlanmoqda…" : "Saqlash"}
            </Btn>
          </div>
        </div>
      )}

      <div className="sm:hidden space-y-3">
        {users.map(u => {
          const rm = ROLE_META[u.role as keyof typeof ROLE_META];
          return (
            <div key={u.id} className="rounded-2xl p-4 flex items-center gap-3 card-shine" style={G.card}>
              <Avatar name={u.fullname} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{u.fullname}</p>
                <p className="text-xs font-mono text-gray-400">{u.username}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background:rm?.bg, color:rm?.fg }}>
                <FaIcon name={rm?.icon} color={rm?.iconColor} size={9} />{rm?.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="hidden sm:block rounded-2xl overflow-hidden card-shine" style={G.card}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.07)", background:"rgba(0,0,0,0.02)" }}>
              {(["F.I.Sh","Login","Rol","Holat","Amal"] as string[]).map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const rm = ROLE_META[u.role as keyof typeof ROLE_META];
              return (
                <tr key={u.id} style={{ borderBottom:"1px solid rgba(0,0,0,0.04)", background:i%2===0?"transparent":"rgba(0,0,0,0.015)" }} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><Avatar name={u.fullname} size="sm" /><span className="font-semibold text-gray-800">{u.fullname}</span></div></td>
                  <td className="px-5 py-3.5"><span className="font-mono text-xs px-2 py-1 rounded-lg" style={{ background:"rgba(0,0,0,0.05)" }}>{u.username}</span></td>
                  <td className="px-5 py-3.5"><span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background:rm?.bg, color:rm?.fg }}><FaIcon name={rm?.icon} color={rm?.iconColor} size={9} />{rm?.label}</span></td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${u.is_active ? "text-emerald-700" : "text-gray-400"}`}
                          style={{ background:u.is_active?"rgba(34,197,94,0.1)":"rgba(0,0,0,0.05)", border:`1px solid ${u.is_active?"rgba(34,197,94,0.2)":"rgba(0,0,0,0.1)"}` }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.is_active?"bg-emerald-500":"bg-gray-300"}`} />{u.is_active?"Faol":"Bloklangan"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setResetFor(u); setNewPass(""); }} className="text-xs px-2.5 py-1 rounded-lg font-medium btn-press"
                              style={{ background:"rgba(94,106,210,0.08)", color:"#5E6AD2" }}>
                        Parolni tiklash
                      </button>
                      <button onClick={() => handleToggle(u)} className="text-xs px-2.5 py-1 rounded-lg font-medium btn-press"
                              style={{ background:u.is_active?"rgba(225,29,72,0.07)":"rgba(5,150,105,0.07)", color:u.is_active?"#E11D48":"#059669" }}>
                        {u.is_active ? "Blokla" : "Faollashtir"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {resetFor && (
        <Modal title="Parolni tiklash" onClose={() => setResetFor(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={resetFor.fullname} />
              <div>
                <p className="font-semibold text-gray-800 text-sm">{resetFor.fullname}</p>
                <p className="text-xs font-mono text-gray-400">{resetFor.username}</p>
              </div>
            </div>
            <GlassInput label="Yangi parol" type="password" value={newPass} onChange={setNewPass} placeholder="kamida 4 belgi" />
            <div className="flex gap-2">
              <Btn variant="outline" size="sm" onClick={() => setResetFor(null)} className="flex-1">Bekor</Btn>
              <Btn variant="primary" size="sm" onClick={handleResetPassword} disabled={resetting} className="flex-1">
                {resetting ? "Saqlanmoqda…" : "Saqlash"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── LOGS TABLE ──────────────────────────────────────────── */
export function LogsTable({ logs }: { logs: Log[] }) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Tizim loglari</h2>
        <p className="text-gray-500 text-sm">Barcha harakatlar tarixi</p>
      </div>
      <div className="sm:hidden space-y-2">
        {logs.map(l => (
          <div key={l.id} className="rounded-2xl p-4 card-shine" style={G.card}>
            <div className="flex items-start gap-2 mb-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background:"#5E6AD2" }} />
              <p className="text-sm text-gray-700">{l.action}</p>
            </div>
            <div className="flex justify-between pl-4 text-xs text-gray-400">
              <span className="font-medium text-gray-500">{l.user}</span>
              <span className="font-mono">{l.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden sm:block rounded-2xl overflow-hidden card-shine" style={G.card}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.07)", background:"rgba(0,0,0,0.02)" }}>
              {(["Amal","Foydalanuvchi","Vaqt"]).map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={l.id} style={{ borderBottom:"1px solid rgba(0,0,0,0.04)", background:i%2===0?"transparent":"rgba(0,0,0,0.015)" }} className="hover:bg-blue-50/20 transition-colors">
                <td className="px-5 py-3.5"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:"#5E6AD2" }} />{l.action}</div></td>
                <td className="px-5 py-3.5 font-medium text-gray-500">{l.user}</td>
                <td className="px-5 py-3.5"><span className="font-mono text-xs text-gray-400">{l.time}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
