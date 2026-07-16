import { useState } from "react";
import { G } from "../styles/glass";
import { FaIcon, Btn } from "../components/Atoms";
import { GlassInput } from "../components/GlassInput";
import { BgBlobs } from "../components/Layout";

interface Props {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

export default function LoginPage({ onLogin, loading }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  const demos = [
    { label: "Admin",      fa: "fa-shield-halved",     color: "#E11D48", u: "admin" },
    { label: "Dispetcher", fa: "fa-headset",            color: "#5E6AD2", u: "disp1" },
    { label: "Texnik",     fa: "fa-screwdriver-wrench", color: "#059669", u: "tech1" },
    { label: "Xodim",      fa: "fa-user",               color: "#64748B", u: "user1" },
  ];

  const doLogin = async () => {
    if (!username || !password) { setError("Login va parolni kiriting"); return; }
    setError("");
    const res = await onLogin(username, password);
    if (!res.success) setError(res.error ?? "Xato yuz berdi");
  };

  return (
    <>
      <BgBlobs />
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left panel */}
        <div className="lg:w-[45%] flex flex-col justify-between px-7 py-8 lg:p-14 relative overflow-hidden"
             style={{ background: "linear-gradient(150deg,#3730A3 0%,#5E6AD2 45%,#7C3AED 100%)", minHeight: "clamp(200px,40vw,100vh)" }}>
          <div style={{ position:"absolute", top:"-20%", right:"-10%", width:450, height:450, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,0.12),transparent 70%)" }} />
          <div style={{ position:"absolute", bottom:"5%", left:"-15%", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,0.08),transparent 70%)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                   style={{ background:"rgba(255,255,255,0.18)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.3)", boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>🚂</div>
              <div>
                <p className="text-white font-bold text-xl leading-tight">RailSupport</p>
                <p className="text-indigo-200 text-xs">Texnik yordam tizimi</p>
              </div>
            </div>
            <div className="hidden lg:block mt-14">
              <h2 className="text-white text-3xl font-bold leading-snug">
                Texnik muammolarni<br />
                <span style={{ background:"linear-gradient(90deg,#BAE6FD,#C4B5FD)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>tezkor hal etamiz.</span>
              </h2>
              <p className="mt-4 text-indigo-100/80 text-sm leading-relaxed">Temir yo'l boshqarmasidagi barcha murojaatlar —<br />bitta platformada, real vaqtda.</p>
            </div>
          </div>
          <div className="relative z-10 hidden lg:flex gap-8 mt-8">
            {([["98%","Muvaffaqiyat"],["< 2h","O'rtacha javob"],["24/7","Monitoring"]] as [string,string][]).map(([v,l]) => (
              <div key={l} className="px-4 py-3 rounded-2xl" style={{ background:"rgba(255,255,255,0.12)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.2)" }}>
                <p className="text-white text-xl font-bold">{v}</p>
                <p className="text-blue-200 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-4 py-6 lg:p-10">
          <div className="w-full max-w-sm">
            <div className="rounded-3xl p-6 lg:p-8" style={G.strong}>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Xush kelibsiz</h1>
              <p className="text-sm text-gray-500 mb-5">Tizimga kirish uchun ma'lumot kiriting</p>
              {error && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-rose-700"
                     style={{ background:"rgba(254,226,226,0.8)", border:"1px solid rgba(252,165,165,0.5)" }}>
                  <FaIcon name="fa-circle-exclamation" color="#E11D48" size={14} />{error}
                </div>
              )}
              <div className="space-y-3.5">
                <GlassInput label="Foydalanuvchi nomi" value={username} onChange={setUsername} placeholder="username" required />
                <GlassInput label="Parol" type="password" value={password} onChange={setPassword} placeholder="••••••" required />
                <Btn variant="primary" onClick={doLogin} disabled={loading} className="w-full h-11">
                  {loading
                    ? <><FaIcon name="fa-circle-notch" color="#fff" size={13} className="fa-spin" /> Tekshirilmoqda…</>
                    : <><FaIcon name="fa-arrow-right-to-bracket" color="#fff" size={13} /> Kirish</>}
                </Btn>
              </div>
              <div className="mt-5 pt-5" style={{ borderTop:"1px solid rgba(0,0,0,0.07)" }}>
                <p className="text-xs text-gray-400 text-center mb-3">Demo kirish (parol: 1234)</p>
                <div className="grid grid-cols-2 gap-2">
                  {demos.map(d => (
                    <button key={d.u} onClick={() => { setUsername(d.u); setPassword("1234"); }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left btn-press"
                      style={{ ...G.card }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ background:`${d.color}18`, border:`1px solid ${d.color}28` }}>
                        <FaIcon name={d.fa} color={d.color} size={12} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{d.label}</p>
                        <p className="text-xs text-gray-400 font-mono truncate">{d.u}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
