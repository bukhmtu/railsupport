import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { CSS, G } from "../styles/glass";
import { FaIcon } from "./Atoms";

export function BgBlobs() {
  return (
    <>
      <style>{CSS}</style>
      <div style={{ position:"fixed", inset:0, zIndex:-1, overflow:"hidden",
        background:"linear-gradient(160deg,#F1F5FE 0%,#F8F7FF 35%,#F0FAF6 65%,#FDF8F0 100%)" }}>
        <div style={{ position:"absolute", top:"-8%", left:"15%", width:700, height:700, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(94,106,210,0.12),transparent 65%)", filter:"blur(80px)" }} />
        <div style={{ position:"absolute", top:"35%", right:"-8%", width:600, height:600, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(124,58,237,0.09),transparent 65%)", filter:"blur(90px)" }} />
        <div style={{ position:"absolute", bottom:"-8%", left:"-8%", width:650, height:650, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(5,150,105,0.08),transparent 65%)", filter:"blur(100px)" }} />
        <div style={{ position:"absolute", top:"10%", right:"25%", width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(217,119,6,0.07),transparent 65%)", filter:"blur(70px)" }} />
      </div>
    </>
  );
}

interface ModalProps { title: string; onClose: () => void; children: ReactNode; wide?: boolean; }
export function Modal({ title, onClose, children, wide = false }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 anim-fade"
         style={{ background:"rgba(15,23,42,0.38)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)" }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"} rounded-t-3xl sm:rounded-3xl anim-up max-h-[92vh] flex flex-col`} style={G.modal}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background:"rgba(0,0,0,0.15)" }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0" style={{ borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
          <span className="font-semibold text-gray-800">{title}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600"
                  style={{ background:"rgba(0,0,0,0.06)" }}>
            <FaIcon name="fa-xmark" color="currentColor" size={13} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
}
