import React, { useEffect, useState } from "react";

export default function Accordion({ id, title, children, rightActions, defaultOpen = false }) {
  const key = `acc:${id}`;
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    setOpen(raw === null ? defaultOpen : raw === "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { try { localStorage.setItem(key, open ? "1" : "0"); } catch {} }, [key, open]);

  return (
    <div className="rounded-card border border-brand-border bg-brand-card">
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={`acc-${id}`}
      >
        <span className="acc-title">{title}</span>
        <div className="flex items-center gap-10">
          {rightActions}
          <span className="acc-chevron">{open ? "▾" : "▸"}</span>
        </div>
      </button>
      {open && <div id={`acc-${id}`} className="px-4 pb-4">{children}</div>}
    </div>
  );
}
