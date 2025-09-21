import React, { useMemo, useState } from "react";
import { useStore } from "../store.jsx";

export default function History() {
  const { state, exerciseMap } = useStore();
  const allExercises = state.exercises;

  const [exId, setExId] = useState(allExercises[0]?.id || "");
  const [showLastOnly, setShowLastOnly] = useState(false);

  const rows = useMemo(() => {
    if (!exId) return [];
    const out = [];
    for (const log of state.logs) {
      const entry = log.entries.find((e) => e.exerciseId === exId);
      if (entry) out.push({ date: new Date(log.dateISO), weights: entry.weights || [], reps: entry.reps || [] });
    }
    out.sort((a, b) => a.date - b.date);
    return showLastOnly ? out.slice(-1) : out;
  }, [state.logs, exId, showLastOnly]);

  const units = state.units;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="text-label">Exercise</div>
        <div className="tabs-row">
          {allExercises.map((e) => (
            <button
              key={e.id}
              className={`rounded-button ${exId === e.id ? "is-active" : ""}`}
              onClick={() => setExId(e.id)}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      <div className="tabs-row">
        <button
          className={`rounded-button ${showLastOnly ? "is-active" : ""}`}
          onClick={() => setShowLastOnly((v) => !v)}
        >
          {showLastOnly ? "Showing last" : "Show last only"}
        </button>
      </div>

      {!rows.length ? (
        <div className="muted">No logs yet for this exercise.</div>
      ) : (
        <div className="space-y-4">
          {rows.map((r, idx) => (
            <div key={idx} className="rounded-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-extrabold">{r.date.toLocaleDateString()}</div>
                <div className="muted text-sm">{exerciseMap[exId]?.name}</div>
              </div>

              {/* Sets grid mirror (2 columns) */}
              <div className="grid-sets">
                {r.weights.map((w, i) => (
                  <div key={i} className="set-card">
                    <div className="text-label mb-2">Set {i + 1}</div>
                    <div className="row">
                      <div className="unit-wrap">
                        <input disabled value={String(w)} className="w-full rounded-card bg-brand-input px-3 pr-12" />
                        <span>{units}</span>
                      </div>
                      <div className="unit-wrap">
                        <input
                          disabled
                          value={String((r.reps && r.reps[i]) ?? "")}
                          className="w-full rounded-card bg-brand-input px-3 pr-12"
                        />
                        <span>reps</span>
                      </div>
                    </div>
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
