import type { CSSProperties } from "react";

type GlassToken = CSSProperties;

export const G: Record<string, GlassToken> = {
  card:     { background:"var(--card-bg)",    backdropFilter:"blur(20px) saturate(160%)", WebkitBackdropFilter:"blur(20px) saturate(160%)", border:"1px solid var(--card-border)",    boxShadow:"var(--card-shadow)" },
  strong:   { background:"var(--strong-bg)",  backdropFilter:"blur(30px) saturate(180%)", WebkitBackdropFilter:"blur(30px) saturate(180%)", border:"1px solid var(--strong-border)",  boxShadow:"var(--strong-shadow)" },
  sidebar:  { background:"var(--sidebar-bg)", backdropFilter:"blur(40px) saturate(180%)", WebkitBackdropFilter:"blur(40px) saturate(180%)", borderRight:"1px solid var(--sidebar-border)", boxShadow:"var(--sidebar-shadow)" },
  header:   { background:"var(--header-bg)",  backdropFilter:"blur(24px) saturate(160%)", WebkitBackdropFilter:"blur(24px) saturate(160%)", borderBottom:"1px solid var(--header-border)", boxShadow:"var(--header-shadow)" },
  modal:    { background:"var(--modal-bg)",   backdropFilter:"blur(40px) saturate(180%)", WebkitBackdropFilter:"blur(40px) saturate(180%)", border:"1px solid var(--modal-border)",   boxShadow:"var(--modal-shadow)" },
  input:    { background:"var(--input-bg)",   backdropFilter:"blur(8px)",                 WebkitBackdropFilter:"blur(8px)",                 border:"1px solid var(--input-border)" },
  navActive:{ background:"var(--navactive-bg)", border:"1px solid var(--navactive-border)", boxShadow:"var(--navactive-shadow)" },
  dropdown: { background:"var(--dropdown-bg)", backdropFilter:"blur(24px) saturate(180%)", WebkitBackdropFilter:"blur(24px) saturate(180%)", border:"1px solid var(--dropdown-border)", boxShadow:"var(--dropdown-shadow)" },
};

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;font-family:'Plus Jakarta Sans',sans-serif;}

:root{
  --page-gradient: linear-gradient(160deg,#F1F5FE 0%,#F8F7FF 35%,#F0FAF6 65%,#FDF8F0 100%);
  --blob-1: rgba(94,106,210,0.12);
  --blob-2: rgba(124,58,237,0.09);
  --blob-3: rgba(5,150,105,0.08);
  --blob-4: rgba(217,119,6,0.07);

  --card-bg: rgba(255,255,255,0.80);      --card-border: rgba(226,232,240,0.85); --card-shadow: 0 1px 4px rgba(15,23,42,0.05), 0 4px 16px rgba(15,23,42,0.04);
  --strong-bg: rgba(255,255,255,0.96);    --strong-border: rgba(226,232,240,0.9); --strong-shadow: 0 4px 24px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04);
  --sidebar-bg: rgba(255,255,255,0.88);   --sidebar-border: rgba(226,232,240,0.8); --sidebar-shadow: 1px 0 0 rgba(226,232,240,0.6), 2px 0 16px rgba(15,23,42,0.03);
  --header-bg: rgba(255,255,255,0.85);    --header-border: rgba(226,232,240,0.8); --header-shadow: 0 1px 0 rgba(226,232,240,0.6);
  --modal-bg: rgba(255,255,255,0.98);     --modal-border: rgba(226,232,240,0.9); --modal-shadow: 0 20px 60px rgba(15,23,42,0.15), 0 4px 16px rgba(15,23,42,0.06);
  --input-bg: rgba(248,250,252,0.9);      --input-border: rgba(203,213,225,0.8);
  --navactive-bg: linear-gradient(135deg,rgba(94,106,210,0.10),rgba(124,58,237,0.07)); --navactive-border: rgba(94,106,210,0.20); --navactive-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 6px rgba(94,106,210,0.08);
  --dropdown-bg: rgba(255,255,255,0.99);  --dropdown-border: rgba(226,232,240,0.9); --dropdown-shadow: 0 8px 32px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.06);

  --text-strong: #0f172a;
  --text-item: #334155;
  --item-hover-text: #3730A3;

  --tint-015: rgba(0,0,0,0.015); --tint-02: rgba(0,0,0,0.02); --tint-04: rgba(0,0,0,0.04);
  --tint-05: rgba(0,0,0,0.05);   --tint-06: rgba(0,0,0,0.06); --tint-07: rgba(0,0,0,0.07);
  --tint-08: rgba(0,0,0,0.08);   --tint-10: rgba(0,0,0,0.1);  --tint-15: rgba(0,0,0,0.15);

  --btn-outline-bg: rgba(255,255,255,0.70); --btn-outline-fg: #334155; --btn-outline-border: rgba(203,213,225,0.9);
  --btn-soft-bg: rgba(238,242,255,0.90);    --btn-soft-fg: #3730A3;

  --status-yangi-bg: rgba(255,251,235,0.90);      --status-yangi-fg: #92400E;
  --status-qabul-bg: rgba(238,242,255,0.90);      --status-qabul-fg: #3730A3;
  --status-jarayon-bg: rgba(245,243,255,0.90);    --status-jarayon-fg: #5B21B6;
  --status-tugallandi-bg: rgba(236,253,245,0.90); --status-tugallandi-fg: #065F46;
  --status-bekor-bg: rgba(255,241,242,0.90);      --status-bekor-fg: #9F1239;

  --priority-yuqori-bg: rgba(255,241,242,0.90); --priority-yuqori-fg: #9F1239;
  --priority-orta-bg: rgba(255,251,235,0.90);   --priority-orta-fg: #92400E;
  --priority-past-bg: rgba(240,253,250,0.90);   --priority-past-fg: #065F46;

  --role-admin-bg: rgba(254,242,242,0.90);      --role-admin-fg: #9F1239;
  --role-dispatcher-bg: rgba(238,242,255,0.90); --role-dispatcher-fg: #3730A3;
  --role-technician-bg: rgba(236,253,245,0.90); --role-technician-fg: #065F46;
  --role-employee-bg: rgba(248,250,252,0.90);   --role-employee-fg: #475569;
}

[data-theme="dark"]{
  --page-gradient: linear-gradient(160deg,#0B1120 0%,#0F172A 35%,#111827 65%,#0B1220 100%);
  --blob-1: rgba(99,102,241,0.20); --blob-2: rgba(139,92,246,0.16); --blob-3: rgba(16,185,129,0.14); --blob-4: rgba(217,119,6,0.13);

  --card-bg: rgba(30,41,59,0.72);      --card-border: rgba(148,163,184,0.18); --card-shadow: 0 1px 4px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.24);
  --strong-bg: rgba(15,23,42,0.92);    --strong-border: rgba(148,163,184,0.22); --strong-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.24);
  --sidebar-bg: rgba(15,23,42,0.90);   --sidebar-border: rgba(148,163,184,0.14); --sidebar-shadow: 1px 0 0 rgba(148,163,184,0.12), 2px 0 16px rgba(0,0,0,0.3);
  --header-bg: rgba(15,23,42,0.85);    --header-border: rgba(148,163,184,0.14); --header-shadow: 0 1px 0 rgba(148,163,184,0.12);
  --modal-bg: rgba(15,23,42,0.97);     --modal-border: rgba(148,163,184,0.2); --modal-shadow: 0 20px 60px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3);
  --input-bg: rgba(30,41,59,0.65);     --input-border: rgba(100,116,139,0.45);
  --navactive-bg: linear-gradient(135deg,rgba(99,102,241,0.28),rgba(139,92,246,0.20)); --navactive-border: rgba(129,140,248,0.4); --navactive-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 6px rgba(99,102,241,0.2);
  --dropdown-bg: rgba(15,23,42,0.98);  --dropdown-border: rgba(148,163,184,0.22); --dropdown-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3);

  --btn-outline-bg: rgba(51,65,85,0.55); --btn-outline-fg: #e2e8f0; --btn-outline-border: rgba(148,163,184,0.35);
  --btn-soft-bg: rgba(55,48,163,0.35);   --btn-soft-fg: #c7d2fe;

  --text-strong: #f1f5f9;
  --text-item: #cbd5e1;
  --item-hover-text: #c7d2fe;

  --tint-015: rgba(255,255,255,0.02); --tint-02: rgba(255,255,255,0.03); --tint-04: rgba(255,255,255,0.05);
  --tint-05: rgba(255,255,255,0.06);  --tint-06: rgba(255,255,255,0.07); --tint-07: rgba(255,255,255,0.08);
  --tint-08: rgba(255,255,255,0.09);  --tint-10: rgba(255,255,255,0.12); --tint-15: rgba(255,255,255,0.16);

  --status-yangi-bg: rgba(120,53,15,0.35);      --status-yangi-fg: #FCD34D;
  --status-qabul-bg: rgba(55,48,163,0.35);      --status-qabul-fg: #A5B4FC;
  --status-jarayon-bg: rgba(91,33,182,0.35);    --status-jarayon-fg: #D8B4FE;
  --status-tugallandi-bg: rgba(6,95,70,0.35);   --status-tugallandi-fg: #6EE7B7;
  --status-bekor-bg: rgba(159,18,57,0.35);      --status-bekor-fg: #FDA4AF;

  --priority-yuqori-bg: rgba(159,18,57,0.35); --priority-yuqori-fg: #FDA4AF;
  --priority-orta-bg: rgba(120,53,15,0.35);   --priority-orta-fg: #FCD34D;
  --priority-past-bg: rgba(6,95,70,0.35);     --priority-past-fg: #6EE7B7;

  --role-admin-bg: rgba(159,18,57,0.35);      --role-admin-fg: #FDA4AF;
  --role-dispatcher-bg: rgba(55,48,163,0.35); --role-dispatcher-fg: #A5B4FC;
  --role-technician-bg: rgba(6,95,70,0.35);   --role-technician-fg: #6EE7B7;
  --role-employee-bg: rgba(71,85,105,0.55);   --role-employee-fg: #E2E8F0;
}

body{background:var(--page-gradient);}

[data-theme="dark"] .text-gray-900{color:#f1f5f9;}
[data-theme="dark"] .text-gray-800{color:#e2e8f0;}
[data-theme="dark"] .text-gray-700{color:#cbd5e1;}
[data-theme="dark"] .text-gray-600{color:#94a3b8;}
[data-theme="dark"] .text-gray-500{color:#94a3b8;}
[data-theme="dark"] .text-gray-400{color:#64748b;}
[data-theme="dark"] .text-gray-300{color:#475569;}
[data-theme="dark"] .bg-gray-300{background-color:#475569;}

.btn-press{transition:all .15s ease;border:none;outline:none;}
.btn-press:hover{transform:translateY(-1px);filter:brightness(1.03);}
.btn-press:active{transform:translateY(0) scale(0.97);}
.card-shine{position:relative;overflow:hidden;transition:box-shadow .2s,transform .2s;}
.card-shine:hover{box-shadow:0 4px 20px rgba(15,23,42,0.09)!important;}
[data-theme="dark"] .card-shine:hover{box-shadow:0 4px 20px rgba(0,0,0,0.4)!important;}
.glass-input{font-family:inherit;color:var(--text-strong);transition:border-color .2s,box-shadow .2s;}
.glass-input:focus{border-color:rgba(94,106,210,0.5)!important;box-shadow:0 0 0 3px rgba(94,106,210,0.10);}
.glass-input::placeholder{color:#94a3b8;}
select.glass-input{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235E6AD2' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;}
.sidebar-drawer{transition:transform .28s cubic-bezier(.4,0,.2,1);}
.sidebar-drawer-none{transition:none!important;}
.anim-fade{animation:fadeIn .2s ease;}
.anim-up{animation:slideUp .22s cubic-bezier(.4,0,.2,1);}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.fa-spin{animation:spin 1s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.kpi-ring{transform-origin:center;transition:stroke-dashoffset 1s cubic-bezier(.4,0,.2,1);}
.gd-wrap{position:relative;user-select:none;}
.gd-trigger{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;height:40px;padding:0 14px;border-radius:12px;cursor:pointer;font-size:13.5px;font-weight:500;transition:all .15s ease;outline:none;}
.gd-trigger:hover{border-color:rgba(94,106,210,0.4)!important;}
.gd-menu{z-index:1000;border-radius:14px;padding:6px;overflow-y:auto;overflow-x:hidden;max-height:280px;animation:menuPop .15s cubic-bezier(.4,0,.2,1);}
@keyframes menuPop{from{opacity:0;transform:translateY(-6px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.gd-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;color:var(--text-item);transition:all .12s ease;}
.gd-item:hover{background:rgba(94,106,210,0.07);color:var(--item-hover-text);}
.gd-item.selected{background:rgba(94,106,210,0.09);color:var(--item-hover-text);font-weight:600;}
.gd-item .dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.pulse-red{animation:pulseR 1.5s ease-in-out infinite;}
@keyframes pulseR{0%,100%{box-shadow:0 0 0 0 rgba(225,29,72,0.35)}50%{box-shadow:0 0 0 5px rgba(225,29,72,0)}}
`;
