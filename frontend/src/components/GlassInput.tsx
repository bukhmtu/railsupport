import { useState, useEffect, useRef, useLayoutEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { G } from "../styles/glass";
import { FaIcon } from "./Atoms";

/* ─── GlassDropdown ──────────────────────────────────────────── */
/* Menyu document.body ga portal qilinadi — shu bilan sahifadagi
   backdrop-filter'li kartalar (o'zining stacking context'i borligi sababli)
   dropdown ustidan chiqib qolish muammosi butunlay yo'qoladi. */
interface DropdownOption { value: string; label: string; }
interface GlassDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  renderOption?: (opt: DropdownOption, selected: boolean) => ReactNode;
  renderSelected?: (opt: DropdownOption) => ReactNode;
}
export function GlassDropdown({ value, onChange, options, placeholder, renderOption, renderSelected }: GlassDropdownProps) {
  const [open, setOpen]   = useState(false);
  const [rect, setRect]   = useState<{ top: number; left: number; width: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateRect = () => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 6, left: r.left, width: r.width });
  };

  useLayoutEffect(() => { if (open) updateRect(); }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updateRect();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="gd-wrap" ref={wrapRef}>
      <button className="gd-trigger glass-input" style={G.input} onClick={() => setOpen(o => !o)}>
        <span style={{ color: selected ? "#1e293b" : "#94a3b8", flex:1, textAlign:"left" }}>
          {selected ? (renderSelected ? renderSelected(selected) : selected.label) : placeholder}
        </span>
        <FaIcon name={open ? "fa-chevron-up" : "fa-chevron-down"} color="#5E6AD2" size={11} />
      </button>
      {open && rect && createPortal(
        <div ref={menuRef} className="gd-menu" style={{ ...G.dropdown, position:"fixed", top:rect.top, left:rect.left, width:rect.width }}>
          {options.map((opt, i) => {
            const isSel = opt.value === value;
            return (
              <div key={i} className={`gd-item ${isSel ? "selected" : ""}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}>
                {renderOption ? renderOption(opt, isSel) : opt.label}
                {isSel && <FaIcon name="fa-check" color="#5E6AD2" size={11} className="ml-auto" />}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─── GlassInput ─────────────────────────────────────────────── */
interface GlassInputProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  as?: "input" | "textarea" | "select";
  rows?: number;
  options?: string[];
}
export function GlassInput({ label, value, onChange, placeholder, type = "text", required, as = "input", rows = 3, options = [] }: GlassInputProps) {
  const cls = "w-full px-3.5 text-sm rounded-xl outline-none font-sans glass-input focus:outline-none";

  if (as === "select") {
    const opts: DropdownOption[] = options.map(o => ({ value:o, label:o }));
    return (
      <div>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</label>}
        <GlassDropdown value={value} onChange={onChange} options={opts} placeholder={placeholder}
          renderOption={opt => opt.label} renderSelected={opt => opt.label} />
      </div>
    );
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</label>}
      {as === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
          className={`${cls} py-2.5 resize-none`} style={{ ...G.input, height:"auto" }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`${cls} h-10`} style={G.input} />
      )}
    </div>
  );
}
