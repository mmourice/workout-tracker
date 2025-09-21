import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "../store.jsx";
import { TrashIcon, PlusIcon } from "../Icons.jsx";

const fmt = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

export default function Session() {
  const { state, exerciseMap, findLastExerciseLog, startNewSession, saveCurrentSession, updateSessionEntry, clearSessionForDay } = useStore();

  // selected day tab (chip)
  const [dayId, setDayId] = useState(state.plan.days[0]?.id || "");
  const day = useMemo(() => state.plan.days.find((d) => d.id === dayId) || state.plan.days[0], [state.plan.days, dayId]);

  // in-memory timers per exerciseId
  const [timers, setTimers] = useState({}); // { [exerciseId]: secondsRemaining }
  const [tick, setTick] = useState(0);

  // build or rebuild the session whenever day changes
  useEffect(() => {
    if (!day) return;
    startNewSession(day.id);
  }, [day?.id, startNewSession]);

  // simple 1s heartbeat for timers
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    setTimers((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (next[k] > 0) next[k] -= 1;
      });
      return next;
    });
  }, [tick]);

  if (!day) return <div className="muted">Create a plan day first.</div>;

  const chips = [
    { id: state.plan.days.find(d => /upper a/i.test(d.name))?.id, label: "Upper A" },
    { id: state.plan.days.find(d => /upper b/i.test(d.name))?.id, label: "Upper B" },
    { id: state.plan.days.find(d => /lower/i.test(d.name))?.id, label: "Lower" },
    { id: state.plan.days.find(d => /full/i.test(d.name))?.id, label: "Full Body" },
  ].filter(Boolean);

  const session = state._session; // current session lives in store

  const unit = state.units || "kg";

  const onChangeWeight = (exerciseId, setIdx, val) => {
    updateSessionEntry(exerciseId, setIdx, { weight: Number(val) || 0 });
  };
  const onChangeReps = (exerciseId, setIdx, val) => {
    updateSessionEntry(exerciseId, setIdx, { reps: Number(val) || 0 });
  };

  const startTimer = (exerciseId, seconds = 90) => {
    setTimers((t) => ({ ...t, [exerciseId]: seconds }));
  };
  const resetCard = (exerciseId) => {
    const ex = exerciseMap[exerciseId];
    const last = findLastExerciseLog(exerciseId);
    const sets = ex?.sets || 3;
    for (let i = 0; i < sets; i++) {
      updateSessionEntry(exerciseId, i, {
        weight: last?.weights?.[i] ?? 0,
        reps: last?.reps?.[i] ?? ex?.reps ?? 10,
      });
    }
  };
  const removeCard = (exerciseId) => {
    // clears just this exercise from the session
    clearSessionForDay(day.id, exerciseId);
  };

  return (
    <div className="space-y-5">
      {/* Day chips */}
      <div className="space-y-2">
        <div className="text-label">Pick day</div>
        <div className="chips">
          {chips.map((c) => (
            <button
              key={c.id}
              className={`chip ${day.id === c.id ? "chip--active" : "chip--idle"}`}
              onClick={() => setDayId(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="chips">
        <button className="chip chip--idle" onClick={() => startNewSession(day.id, { copyLast: true })}>Copy last</button>
        <button className="chip chip--idle" onClick={() => startNewSession(day.id, { copyLast: false })}>Clear</button>
        <button className="cta" onClick={saveCurrentSession}>Save Session</button>
      </div>

      {/* Exercise cards */}
      {!day.exerciseIds.length ? (
        <div className="muted">No exercises in this day. Go to <b>Plan</b> to add some.</div>
      ) : (
        day.exerciseIds.map((eid) => {
          const ex = exerciseMap[eid];
          const entry = session?.entries?.find((en) => en.exerciseId === eid);
          if (!ex || !entry) return null;

          const t = timers[eid] ?? 0;

          return (
            <div key={eid} className="rounded-card p-4 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <a
                  className="card-title linkable"
                  href={ex.link || "#"}
                  target={ex.link ? "_blank" : "_self"}
                  rel="noreferrer"
                  onClick={(e) => { if (!ex.link) e.preventDefault(); }}
                >
                  {ex.name}
                </a>

                <div className="chips">
                  <div className="timer-pill" onClick={() => startTimer(eid)}>
                    <span role="img" aria-label="timer">⏱️</span>
                    <span className="mono">{fmt(t || 90)}</span>
                  </div>
                  <button className="chip chip--idle" onClick={() => resetCard(eid)}>Reset</button>
                  <button className="icon ghost" onClick={() => updateSessionEntry(eid, entry.weights.length, { addSet: true })} title="Add set">
                    <PlusIcon />
                  </button>
                  <button className="icon ghost" onClick={() => removeCard(eid)} title="Remove card">
                    <TrashIcon />
                  </button>
                </div>
              </div>

              {/* 2-column sets */}
              <div className="grid-sets">
                {entry.weights.map((w, i) => (
                  <div key={i} className="set-card">
                    <div className="text-label mb-2">Set {i + 1}</div>
                    <button className="close-x" onClick={() => updateSessionEntry(eid, i, { deleteSet: true })}>×</button>
                    <div className="row">
                      <div className="input-wrap">
                        <input
                          inputMode="decimal"
                          pattern="[0-9]*"
                          placeholder="0"
                          value={String(w ?? "")}
                          onChange={(e) => onChangeWeight(eid, i, e.target.value)}
                        />
                        <span className="suffix">{unit}</span>
                      </div>
                      <div className="input-wrap">
                        <input
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="0"
                          value={String(entry.reps?.[i] ?? "")}
                          onChange={(e) => onChangeReps(eid, i, e.target.value)}
                        />
                        <span className="suffix">reps</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
