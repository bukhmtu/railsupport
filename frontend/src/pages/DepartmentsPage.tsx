import { useEffect, useState } from "react";
import { G } from "../styles/glass";
import { FaIcon, Btn } from "../components/Atoms";
import { GlassInput } from "../components/GlassInput";
import { api } from "../api/api";
import type { ApiDepartment } from "../api/api";

/* ─── BO'LIMLAR (Admin) ───────────────────────────────────────── */
export default function DepartmentsPage() {
  const [depts,   setDepts]   = useState<ApiDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [editId,  setEditId]  = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const refresh = async () => {
    try { setDepts(await api.departments.list()); } catch { /* ignore */ }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return alert("Bo'lim nomini kiriting");
    setSaving(true);
    try {
      await api.departments.create(newName.trim());
      setNewName(""); setShowAdd(false);
      await refresh();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (d: ApiDepartment) => {
    try { await api.departments.update(d.id, { is_active: !d.is_active }); await refresh(); }
    catch (e: any) { alert(e.message); }
  };

  const startEdit = (d: ApiDepartment) => { setEditId(d.id); setEditName(d.name); };
  const saveEdit = async (d: ApiDepartment) => {
    if (!editName.trim()) return;
    try { await api.departments.update(d.id, { name: editName.trim() }); setEditId(null); await refresh(); }
    catch (e: any) { alert(e.message); }
  };

  const handleDelete = async (d: ApiDepartment) => {
    if (!confirm(`"${d.name}" bo'limini butunlay o'chirmoqchimisiz?`)) return;
    try { await api.departments.remove(d.id); await refresh(); }
    catch { alert("Bu bo'limga bog'liq murojaatlar bor, shuning uchun o'chirib bo'lmaydi. Buning o'rniga faolligini o'chiring."); }
  };

  if (loading) return null;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bo'limlar</h2>
          <p className="text-gray-500 text-sm">{depts.length} ta bo'lim — murojaat formasida shu ro'yxat ko'rsatiladi</p>
        </div>
        <Btn variant="primary" size="sm" onClick={() => setShowAdd(s => !s)}>
          <FaIcon name="fa-plus" color="#fff" size={11} /> Yangi qo'shish
        </Btn>
      </div>

      {showAdd && (
        <div className="mb-4 rounded-2xl p-4" style={G.card}>
          <p className="font-semibold text-gray-800 mb-3">Yangi bo'lim</p>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <GlassInput label="Bo'lim nomi" value={newName} onChange={setNewName} placeholder="Masalan: Marketing" />
            </div>
            <Btn variant="outline" size="sm" onClick={() => setShowAdd(false)}>Bekor</Btn>
            <Btn variant="primary" size="sm" onClick={handleAdd} disabled={saving}>
              {saving ? "Saqlanmoqda…" : "Saqlash"}
            </Btn>
          </div>
        </div>
      )}

      <div className="sm:hidden space-y-3">
        {depts.map(d => (
          <div key={d.id} className="rounded-2xl p-4 flex items-center gap-3 card-shine" style={G.card}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"rgba(5,150,105,0.1)" }}>
              <FaIcon name="fa-building" color="#059669" size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{d.name}</p>
              <span className={`text-xs font-semibold ${d.is_active ? "text-emerald-600" : "text-gray-400"}`}>
                {d.is_active ? "Faol" : "Nofaol"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block rounded-2xl overflow-hidden card-shine" style={G.card}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom:"1px solid var(--tint-07)", background:"var(--tint-02)" }}>
              {(["Nomi","Holat","Amal"] as string[]).map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {depts.map((d, i) => (
              <tr key={d.id} style={{ borderBottom:"1px solid var(--tint-04)", background:i%2===0?"transparent":"var(--tint-015)" }} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-5 py-3.5">
                  {editId === d.id ? (
                    <div className="flex items-center gap-2 max-w-xs">
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="w-full h-8 px-2 text-sm rounded-lg outline-none glass-input" style={G.input} />
                      <button onClick={() => saveEdit(d)} className="text-emerald-600"><FaIcon name="fa-check" color="#059669" size={13} /></button>
                      <button onClick={() => setEditId(null)} className="text-gray-400"><FaIcon name="fa-xmark" color="#9CA3AF" size={13} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaIcon name="fa-building" color="#059669" size={12} />
                      <span className="font-semibold text-gray-800">{d.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${d.is_active ? "text-emerald-700" : "text-gray-400"}`}
                        style={{ background:d.is_active?"rgba(34,197,94,0.1)":"var(--tint-05)", border:`1px solid ${d.is_active?"rgba(34,197,94,0.2)":"var(--tint-10)"}` }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${d.is_active?"bg-emerald-500":"bg-gray-300"}`} />{d.is_active?"Faol":"Nofaol"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(d)} className="text-xs px-2.5 py-1 rounded-lg font-medium btn-press" style={{ background:"rgba(94,106,210,0.08)", color:"#5E6AD2" }}>
                      Tahrirlash
                    </button>
                    <button onClick={() => handleToggle(d)} className="text-xs px-2.5 py-1 rounded-lg font-medium btn-press"
                            style={{ background:d.is_active?"rgba(225,29,72,0.07)":"rgba(5,150,105,0.07)", color:d.is_active?"#E11D48":"#059669" }}>
                      {d.is_active ? "Nofaol qilish" : "Faollashtir"}
                    </button>
                    <button onClick={() => handleDelete(d)} className="text-xs px-2.5 py-1 rounded-lg font-medium btn-press" style={{ background:"var(--tint-05)", color:"#6B7280" }}>
                      O'chirish
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
