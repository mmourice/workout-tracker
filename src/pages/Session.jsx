import React, { useEffect, useState } from "react";
import { useStore } from "../store.jsx";
import { PlusIcon, TrashIcon } from "../Icons.jsx";
import RestTimer from "../components/RestTimer.jsx";

const UnitField = ({ value, onChange, placeholder, unit = "kg" }) => (
  <div className="relative min-w-0">
    <input
      value={value}
      onChange={onChange}
      inputMode="decimal"
      placeholder={placeholder}
      className="w-full h-11 rounded-card border border-brand-border bg-brand-input px-3 pr-14 text-base text-white"
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-70 select-none">
      {unit}
    </span>
  </div>
);

export default function Session() {
  const { state, exerciseMap, buildSessionForDay, saveSession } = useStore();
  const [selectedDayId, setSelectedDayId] = useState(state.plan.days[0]?.id || "");
  const [session, setSession] = useState(null);

  // kick counters for timers per exercise
  const [kicks, setKicks] = useState({}); // { exerciseId: number }

  useEffect(() => {
    const s = buildSessionForDay(selectedDayId);
    setSession(s);
    setKicks({}); // reset kicks when switching day
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayId, state.logs]);

  if (!session) return null;

  const bumpKick = (exerciseId) =>
    setKicks((m) => ({ ...m, [exerciseId]: (m[exerciseId] || 0) + 1 }));

  const onAddSet = (exId) => {
    setSession(s => {
      const c = structuredClone(s);
      const entry = c.entries.find(e => e.exerciseId === exId);
      if (!entry) return s;
      const last = entry.sets[entry.sets.length - 1] || { weight: "0", reps: "10" };
      entry.sets.push({ weight: last.weight, reps: last.reps });
      return c;
    });
  };
  const onRemoveSet = (exId, idx) => {
    setSession(s => {
      const c = structuredClone(s);
      const entry = c.entries.find(e => e.exerciseId === exId);
      if (!entry) return s;
      entry.sets.splice(idx, 1);
      if (entry.sets.length === 0) entry.sets.push({ weight: "0", reps: "10" });
      return c;
    });
  };
  const onChangeW = (exId, idx, v) => {
    setSession(s => {
      const c = structuredClone(s);
      const entry = c.entries.find(e => e.exerciseId === exId);
      if (!entry) return s;
      entry.sets[idx].weight = v;
      return c;
    });
    bumpKick(exId); // auto-start timer
  };
  const onChangeR = (exId, idx, v) => {
    setSession(s => {
      const c = structuredClone(s);
      const entry = c.entries.find(e => e.exerciseId === exId);
      if (!entry) return s;
      entry.sets[idx].reps = v;
      return c;
    });
    bumpKick(exId); // auto-start timer
  };

  const onSave = () => {
    saveSession(session);
    setSession(buildSessionForDay(selectedDayId)); // refresh with last values
    alert("Session saved!");
  };

  const units = state.units;

  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="space-y-2">
        <div className="text-brand-accent text-label">Pick day</div>
        <div className="flex flex-wrap gap-2">
          {state.plan.days.map(d => (
            <button
              key={d.id}
              className={`px-4 py-2 rounded-button border ${d.id === selectedDayId ? "bg-brand-primary text-black border-transparent" : "border-brand-border"}`}
              onClick={() => setSelectedDayId(d.id)}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button className="px-4 py-2 rounded-button border border-brand-border"
                onClick={() => setSession(buildSessionForDay(selectedDayId))}>
          Copy last
        </button>
        <button className="px-4 py-2 rounded-button border border-brand-border"
                onClick={() => setSession(buildSessionForDay(selectedDayId))}>
          Clear
        </button>
        <button className="px-4 py-2 rounded-button bg-brand-primary text-black" onClick={onSave}>
          Save Session
        </button>
      </div>

      {/* Exercise cards */}
      {session.entries.map((en) => {
        const ex = exerciseMap[en.exerciseId];
        if (!ex) return null;
        const kick = kicks[en.exerciseId] || 0;

        return (
          <div key={en.exerciseId} className="rounded-card border border-brand-border bg-brand-card p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="font-bold leading-snug">
                <a
                  className="underline decoration-brand-accent underline-offset-2"
                  href={ex.link || "#"}
                  target={ex.link ? "_blank" : "_self"}
                  rel="noreferrer"
                >
                  {ex.name} <span className="text-brand-accent">({ex.sets} x {ex.reps})</span>
                </a>
              </div>
              <div className="flex items-center gap-2">
                <RestTimer seconds={90} kick={kick} />
                <button className="icon-btn" onClick={() => onAddSet(en.exerciseId)} aria-label="Add set"><PlusIcon /></button>
                <button
                  className="icon-btn"
                  onClick={() => setSession(s => ({ ...s, entries: s.entries.filter(e => e.exerciseId !== en.exerciseId) }))}
                  aria-label="Remove exercise"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>

            {/* Sets grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {en.sets.map((s, idx) => (
                <div key={idx} className="relative rounded-card border border-brand-border bg-brand-input p-3">
                  <div className="absolute top-1 right-1">
                    <button className="icon-btn" onClick={() => onRemoveSet(en.exerciseId, idx)} aria-label="Remove set">✕</button>
                  </div>
                  <div className="text-label text-brand-accent mb-2">Set {idx + 1}</div>
                  <div className="flex gap-2">
                    <UnitField value={s.weight} onChange={(e) => onChangeW(en.exerciseId, idx, e.target.value)} placeholder="0" unit={units} />
                    <UnitField value={s.reps}   onChange={(e) => onChangeR(en.exerciseId, idx, e.target.value)}   placeholder="10" unit="reps" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
