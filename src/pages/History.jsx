import React, { useMemo, useState } from "react";
import { useStore } from "../store.jsx";
import { TrashIcon } from "../Icons.jsx";

export default function History() {
  const { state, exerciseMap, deleteLog } = useStore();
  const [exId, setExId] = useState(state.exercises[0]?.id || "");
  const [lastOnly, setLastOnly] = useState(false);
  const units = state.units || "kg";

  const rows = useMemo(() => {
    if (!exId) return [];
    const out = [];
    state.logs.forEach((log) => {
      const hit = log.entries.find((e) => e.exerciseId === exId);
      if (hit) out.push({ id: log.id, date: new Date(log.dateISO), weights: hit.weights || [], reps: hit.reps || [] });
    });
    out.sort((a, b) => b.date - a.date); // newest first
    return lastOnly ? out.slice(0, 1) : out;
  }, [state.logs, exId, lastOnly]);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-label">Exercise</div>
        <div className="chips">
          {state.exercises.map((e) => (
            <button key={e.id} className={`chip ${exId === e.id ? "chip--active" : "chip--idle"}`} onClick={()=>setExId(e.id)}>{e.name}</button>
          ))}
        </div>
      </div>

      <div className="chips">
        <button className={`chip ${lastOnly ? "chip--active" : "chip--idle"}`} onClick={()=>setLastOnly(v=>!v)}>
          {lastOnly ? "Showing last" : "Show last only"}
        </button>
      </div>

      {!rows.length ? (
        <div className="muted">No logs yet.</div>
      ) : (
        rows.map((r) => (
          <div key={r.id} className="rounded-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="title">{r.date.toLocaleDateString()}</div>
              <button className="icon ghost" title="Delete log" onClick={()=>deleteLog(r.id)}><TrashIcon/></button>
            </div>
            <div className="grid-sets">
              {r.weights.map((w, i) => (
                <div key={i} className="set-card">
                  <div className="text-label mb-2">Set {i + 1}</div>
                  <div className="row">
                    <div className="input-wrap is-readonly">
                      <input disabled value={w} />
                      <span className="suffix">{units}</span>
                    </div>
                    <div className="input-wrap is-readonly">
                      <input disabled value={r.reps?.[i] ?? ""} />
                      <span className="suffix">reps</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
