import type { CSSProperties } from "react";

type GlassToken = CSSProperties;

export const G: Record<string, GlassToken> = {
  card:     { background:"rgba(255,255,255,0.80)", backdropFilter:"blur(20px) saturate(160%)", WebkitBackdropFilter:"blur(20px) saturate(160%)", border:"1px solid rgba(226,232,240,0.85)", boxShadow:"0 1px 4px rgba(15,23,42,0.05), 0 4px 16px rgba(15,23,42,0.04)" },
  strong:   { background:"rgba(255,255,255,0.96)", backdropFilter:"blur(30px) saturate(180%)", WebkitBackdropFilter:"blur(30px) saturate(180%)", border:"1px solid rgba(226,232,240,0.9)",  boxShadow:"0 4px 24px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)" },
  sidebar:  { background:"rgba(255,255,255,0.88)", backdropFilter:"blur(40px) saturate(180%)", WebkitBackdropFilter:"blur(40px) saturate(180%)", borderRight:"1px solid rgba(226,232,240,0.8)", boxShadow:"1px 0 0 rgba(226,232,240,0.6), 2px 0 16px rgba(15,23,42,0.03)" },
  header:   { background:"rgba(255,255,255,0.85)", backdropFilter:"blur(24px) saturate(160%)", WebkitBackdropFilter:"blur(24px) saturate(160%)", borderBottom:"1px solid rgba(226,232,240,0.8)", boxShadow:"0 1px 0 rgba(226,232,240,0.6)" },
  modal:    { background:"rgba(255,255,255,0.98)", backdropFilter:"blur(40px) saturate(180%)", WebkitBackdropFilter:"blur(40px) saturate(180%)", border:"1px solid rgba(226,232,240,0.9)",  boxShadow:"0 20px 60px rgba(15,23,42,0.15), 0 4px 16px rgba(15,23,42,0.06)" },
  input:    { background:"rgba(248,250,252,0.9)",  backdropFilter:"blur(8px)",                 WebkitBackdropFilter:"blur(8px)",                 border:"1px solid rgba(203,213,225,0.8)" },
  navActive:{ background:"linear-gradient(135deg,rgba(94,106,210,0.10),rgba(124,58,237,0.07))", border:"1px solid rgba(94,106,210,0.20)", boxShadow:"inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 6px rgba(94,106,210,0.08)" },
  dropdown: { background:"rgba(255,255,255,0.99)", backdropFilter:"blur(24px) saturate(180%)", WebkitBackdropFilter:"blur(24px) saturate(180%)", border:"1px solid rgba(226,232,240,0.9)",  boxShadow:"0 8px 32px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.06)" },
};

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;font-family:'Plus Jakarta Sans',sans-serif;}
.btn-press{transition:all .15s ease;border:none;outline:none;}
.btn-press:hover{transform:translateY(-1px);filter:brightness(1.03);}
.btn-press:active{transform:translateY(0) scale(0.97);}
.card-shine{position:relative;overflow:hidden;transition:box-shadow .2s,transform .2s;}
.card-shine:hover{box-shadow:0 4px 20px rgba(15,23,42,0.09)!important;}
.glass-input{font-family:inherit;color:#0f172a;transition:border-color .2s,box-shadow .2s;}
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
.gd-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;color:#334155;transition:all .12s ease;}
.gd-item:hover{background:rgba(94,106,210,0.07);color:#3730A3;}
.gd-item.selected{background:rgba(94,106,210,0.09);color:#3730A3;font-weight:600;}
.gd-item .dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.pulse-red{animation:pulseR 1.5s ease-in-out infinite;}
@keyframes pulseR{0%,100%{box-shadow:0 0 0 0 rgba(225,29,72,0.35)}50%{box-shadow:0 0 0 5px rgba(225,29,72,0)}}
`;
