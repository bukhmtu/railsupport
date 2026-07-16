import { useRef } from "react";
import { CATEGORIES, STATUS, CAT_META } from "../data/constants";
import type { Ticket } from "../App";
import type { TicketStatus } from "../data/constants";
import { G } from "../styles/glass";
import { FaIcon, Badge, StatCard } from "../components/Atoms";
import { useChartJs } from "../hooks/useChartJs";
import { cssVar } from "../lib/theme";

const COLORS = ["#5E6AD2","#7C3AED","#059669","#D97706","#E11D48","#0891B2","#DB2777","#EA580C"];

export default function AdminStats({ tickets }: { tickets: Ticket[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<any>(null);

  const total = tickets.length;
  const tugal = tickets.filter(t => t.status === "tugallandi").length;
  const pct   = total > 0 ? Math.round((tugal / total) * 100) : 0;
  const byType = CATEGORIES
    .map(c => ({ name:c, count:tickets.filter(t => t.problem_type === c).length }))
    .sort((a, b) => b.count - a.count)
    .filter(x => x.count > 0);
  const maxC = byType[0]?.count || 1;

  useChartJs((Chart) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (chartRef.current) chartRef.current.destroy();
    const deptNames = [...new Set(tickets.map(t => t.department))];
    const deptData = deptNames
      .map(d => ({ name:d, count:tickets.filter(t => t.department === d).length }))
      .filter(x => x.count > 0);
    chartRef.current = new Chart(canvas, {
      type:"doughnut",
      data: { labels:deptData.map(d => d.name), datasets:[{ data:deptData.map(d => d.count), backgroundColor:COLORS, borderWidth:2, borderColor:cssVar("--strong-bg"), hoverOffset:6 }] },
      options: { responsive:true, maintainAspectRatio:false, cutout:"60%",
        plugins: { legend:{ position:"right", labels:{ color:cssVar("--text-strong"), font:{ family:"Plus Jakarta Sans", size:11 }, padding:10, usePointStyle:true, boxWidth:8 } },
          tooltip:{ backgroundColor:cssVar("--dropdown-bg"), titleColor:cssVar("--text-strong"), bodyColor:cssVar("--text-item"), borderColor:cssVar("--card-border"), borderWidth:1, padding:10, cornerRadius:10,
            titleFont:{ family:"Plus Jakarta Sans", weight:"bold" }, bodyFont:{ family:"Plus Jakarta Sans" } } } }
    });
  }, [tickets]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Statistika</h2>
        <p className="text-gray-500 text-sm">Tizim ko'rsatkichlari</p>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Jami"       value={total}                                              fa="fa-layer-group"  from="#5E6AD2" to="#7C3AED" />
        <StatCard label="Tugallandi" value={tugal}                                              fa="fa-circle-check" from="#059669" to="#059669" />
        <StatCard label="Jarayonda"  value={tickets.filter(t => t.status === "jarayon").length} fa="fa-gears"        from="#7C3AED" to="#9333EA" />
        <StatCard label="Daraja"     value={`${pct}%`}                                         fa="fa-bullseye"     from="#D97706" to="#EA580C" />
      </div>
      <div className="grid xl:grid-cols-2 gap-4 sm:gap-5">
        <div className="rounded-2xl p-4 sm:p-5" style={G.card}>
          <div className="flex items-center gap-2 mb-4">
            <FaIcon name="fa-chart-bar" color="#5E6AD2" size={14} />
            <h3 className="font-bold text-gray-900">Muammo turlari bo'yicha</h3>
          </div>
          <div className="space-y-3">
            {byType.map((item, i) => {
              const c = COLORS[i % COLORS.length];
              const m = CAT_META[item.name];
              return (
                <div key={item.name}>
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <FaIcon name={m?.fa || "fa-circle-question"} color={c} size={11} />
                      <span className="text-gray-700 font-medium truncate">{item.name}</span>
                    </div>
                    <span className="font-bold flex-shrink-0" style={{ color:c }}>{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background:"var(--tint-07)" }}>
                    <div className="h-full rounded-full" style={{ width:`${(item.count/maxC)*100}%`, background:`linear-gradient(90deg,${c},${c}bb)` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl p-4 sm:p-5" style={G.card}>
          <div className="flex items-center gap-2 mb-4">
            <FaIcon name="fa-chart-pie" color="#5E6AD2" size={14} />
            <h3 className="font-bold text-gray-900">Bo'limlar bo'yicha</h3>
          </div>
          <div style={{ height:200 }}><canvas ref={canvasRef} /></div>
        </div>
      </div>
      <div className="rounded-2xl p-4 sm:p-5" style={G.card}>
        <div className="flex items-center gap-2 mb-4">
          <FaIcon name="fa-chart-pie" color="#5E6AD2" size={14} />
          <h3 className="font-bold text-gray-900">Statuslar taqsimoti</h3>
        </div>
        <div className="space-y-3">
          {(Object.entries(STATUS) as [TicketStatus, typeof STATUS[TicketStatus]][]).map(([k, v]) => {
            const count  = tickets.filter(t => t.status === k).length;
            const pctBar = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={k} className="flex items-center gap-3">
                <Badge status={k} />
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background:"var(--tint-07)" }}>
                  <div className="h-full rounded-full" style={{ width:`${pctBar}%`, background:v.dot }} />
                </div>
                <span className="text-sm font-bold text-gray-700 w-5 text-right flex-shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
