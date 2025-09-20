import React, { useMemo, useState } from "react";
import { useStore } from "../store.jsx";

export default function History() {
  const { state, exerciseMap } = useStore();

  // default to first exercise, if any
  const [exId, setExId] = useState(state.exercises[0]?.id || "");

  // Build rows: [{ date: Date, sets: [{w, r}], note? }]
  const rows = useMemo(() => {
    if (!exId) return [];
    const out = [];
    for (const log of state.logs) {
      const entry = log.entries.find((e) => e.exerciseId === exId);
      if (!entry) continue;
      const sets = (entry.weights || []).map((w, i) => ({
        w,
        r: entry.reps?.[i] ?? "",
      }));
      out.push({ date: new Date(log.dateISO), sets });
    }
    // oldest → newest
    return out.sort((a, b) => a.date - b.date);
  }, [state.logs, exId]);

  const currentName = exerciseMap[exId]?.name || "(select an exercise)";

  return (
    <div className="space-y-4">
      {/* Exercise picker */}
      <div>
        <div className="text-label text-brand-accent mb-2">Exercise</div>
        <div className="flex flex-wrap gap-2">
          {state.exercises.length === 0 ? (
            <div className="text-neutral-400">No exercises yet.</div>
          ) : (
            state.exercises.map((e) => (
              <button
                key={e.id}
                onClick={() => setExId(e.id)}
                className={
                  "px-3 py-1 rounded-chip border " +
                  (e.id === exId
                    ? "bg-brand-primary text-black border-brand-primary"
                    : "bg-transparent text-white border-brand-border")
                }
              >
                <span className="text-label font-mont">{e.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-h2 font-mont font-bold">{currentName}</h2>

      {/* Rows */}
      {rows.length === 0 ? (
        <div className="text-neutral-400">
          No logs yet for this exercise. Go to <b>Session</b> and save a
          workout.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r, idx) => (
            <div
              key={idx}
              className="rounded-card border border-brand-border bg-brand-card p-3"
            >
              <div className="mb-2 opacity-80">
                {r.date.toLocaleDateString()}
              </div>

              {/* Sets: “weight × reps” chips */}
              <div className="flex flex-wrap gap-2">
                {r.sets.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-card border border-brand-border bg-brand-input px-3 py-1"
                  >
                    Set {i + 1}: {s.w}
                    {typeof s.r === "number" || s.r
                      ? ` × ${s.r}`
                      : ""}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
