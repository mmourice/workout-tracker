import React, { useEffect, useState } from "react";

/**
 * <Accordion id="Chest" title="Chest" defaultOpen={false} rightActions={<Button/>}>
 *   ...content...
 * </Accordion>
 *
 * Persists open/closed per id in localStorage under "acc:<id>"
 */
export default function Accordion({ id, title, children, rightActions, defaultOpen = false }) {
  const key = `acc:${id}`;
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      setOpen(defaultOpen);
    } else {
      setOpen(raw === "1");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    try { localStorage.setItem(key, open ? "1" : "0"); } catch {}
  }, [key, open]);

  return (
    <div className="rounded-card border border-brand-border bg-brand-card">
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={`acc-body-${id}`}
      >
        <span className="text-h2 font-mont font-bold text-left">{title}</span>
        <div className="flex items-center gap-2">
          {rightActions}
          <span className="text-body opacity-70">{open ? "▾" : "▸"}</span>
        </div>
      </button>
      {open && (
        <div id={`acc-body-${id}`} className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
