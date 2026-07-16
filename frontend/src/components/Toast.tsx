import { useEffect } from "react";
import { createPortal } from "react-dom";
import { G } from "../styles/glass";
import { FaIcon } from "./Atoms";
import type { Ticket } from "../App";

interface NewTicketToastProps {
  ticket: Ticket;
  kind: "new" | "assigned";
  onView: () => void;
  onClose: () => void;
}
export function NewTicketToast({ ticket, kind, onView, onClose }: NewTicketToastProps) {
  useEffect(() => {
    const id = setTimeout(onClose, 8000);
    return () => clearTimeout(id);
  }, [ticket.id, kind]);

  const isNew = kind === "new";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pointer-events-none anim-fade">
      <div className="w-full max-w-sm rounded-2xl pointer-events-auto anim-up" style={G.modal}>
        <div className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: isNew ? "rgba(217,119,6,0.12)" : "rgba(5,150,105,0.12)" }}>
            <FaIcon name={isNew ? "fa-bell" : "fa-screwdriver-wrench"} color={isNew ? "#D97706" : "#059669"} size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 text-sm">
              {isNew ? "Yangi murojaat keldi" : "Sizga vazifa biriktirildi"}
            </p>
            <p className="text-sm text-gray-600 truncate mt-0.5">{ticket.fullname} — {ticket.problem_type}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5 line-clamp-2">{ticket.description}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={onView} className="text-xs font-semibold px-3 py-1.5 rounded-lg btn-press"
                      style={{ background: isNew ? "#D97706" : "#059669", color:"#fff" }}>
                Ko'rish
              </button>
              <button onClick={onClose} className="text-xs font-semibold px-3 py-1.5 rounded-lg btn-press text-gray-500"
                      style={{ background:"var(--tint-05)" }}>
                Yopish
              </button>
            </div>
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-600"
                  style={{ background:"var(--tint-05)" }}>
            <FaIcon name="fa-xmark" color="currentColor" size={11} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
