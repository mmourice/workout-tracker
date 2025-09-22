import React, { useState, useMemo } from "react";
import { useStore } from "../store.jsx";
import { TrashIcon } from "../Icons.jsx";

export default function Session() {
  const { plan, exercises, logs, addLog } = useStore();
  const [selectedDayId, setSelectedDayId] = useState(plan[0]?.id || "");
  const [entries, setEntries] = useState([]);

  const day = useMemo(
    () => plan.find((d) => d.id === selectedDayId),
    [plan, selectedDayId]
  );

  const exerciseMap = useMemo(
    () => Object.fromEntries(exercises.map((e) => [e.id, e])),
    [exercises]
  );

  function startSession() {
    if (!day) return;
    const initEntries = day.exerciseIds.map((eid) => {
      const ex = exerciseMap[eid];
      return {
        exerciseId: eid,
        weights: Array.from({ length: ex.sets }, () => ""),
        reps: Array.from({ length: ex.sets }, () => ""),
      };
    });
    setEntries(initEntries);
  }

  function saveSession() {
    if (!day) return;
    addLog({
      id: Date.now().toString(),
      dateISO: new Date().toISOString(),
      dayId: day.id,
      entries,
    });
    setEntries([]);
    alert("Session saved ✅");
  }

  return (
    <div className="page session">
      <h2>Session</h2>

      <div className="pill-row">
        {plan.map((d) => (
          <button
            key={d.id}
            className={`pill ${d.id === selectedDayId ? "pill--active" : ""}`}
            onClick={() => setSelectedDayId(d.id)}
          >
            {d.name}
          </button>
        ))}
      </div>

      {!entries.length ? (
        <button className="btn" onClick={startSession}>
          Start Session
        </button>
      ) : (
        <>
          {entries.map((entry, idx) => {
            const ex = exerciseMap[entry.exerciseId];
            return (
              <div key={idx} className="card">
                <div className="card-header">
                  <span>{ex.name}</span>
                  {ex.link ? (
                    <a
                      href={ex.link}
                      target="_blank"
                      rel="noreferrer"
                      className="external-link"
                    >
                      How-to ↗
                    </a>
                  ) : null}
                </div>
                <div className="sets-grid">
                  {entry.weights.map((w, i) => (
                    <div key={i} className="set-box">
                      <label>Set {i + 1}</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        placeholder="kg"
                        value={w}
                        onChange={(e) => {
                          const v = e.target.value;
                          setEntries((prev) => {
                            const copy = [...prev];
                            copy[idx].weights[i] = v;
                            return copy;
                          });
                        }}
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        step="1"
                        placeholder="reps"
                        value={entry.reps[i]}
                        onChange={(e) => {
                          const v = e.target.value;
                          setEntries((prev) => {
                            const copy = [...prev];
                            copy[idx].reps[i] = v;
                            return copy;
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <button className="btn" onClick={saveSession}>
            Save Session
          </button>
        </>
      )}
    </div>
  );
}
