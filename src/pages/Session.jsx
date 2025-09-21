import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "../store.jsx";
import { PlusIcon, TrashIcon, ExternalIcon } from "../Icons.jsx";

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

  // Build (or rebuild) session when day changes
  useEffect(() => {
    setSession(buildSessionForDay(selectedDayId));
  }, [selectedDayId, state.logs]); // when you save, a new log appears; next open will prefill

  const dayTabs = state.plan.days;

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
  };
  const onChangeR = (exId, idx, v) => {
    setSession(s => {
      const c = structuredClone(s);
      const entry = c.entries.find(e => e.exerciseId === exId);
      if (!entry) return s;
      entry.sets[idx].reps = v;
      return c;
    });
  };

  const onSave = () => {
    if (!session) return;
    saveSession(session);
    // Rebuild with last values copied
    setSession(buildSessionForDay(selectedDayId));
    alert("Session saved!");
  };

  const units = state.units;

  if (!session) return null;

  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="space-y-2">
        <div className="text-brand-accent text-label">Pick day</div>
        <div className="flex flex-wrap gap-2">
          {dayTabs.map(d => (
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

      {/* Save */}
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

      {/* Exercises */}
      {session.entries.map((en) => {
        const ex = exerciseMap[en.exerciseId];
        if (!ex) return null;
        return (
          <div key={en.exerciseId} className="rounded-card border border-brand-border bg-brand-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <a
                className="text-h3 underline decoration-brand-accent underline-offset-2"
                href={ex.link || "#"}
                target={ex.link ? "_blank" : "_self"}
                rel="noreferrer"
              >
                {ex.name} <span className="text-brand-accent">({ex.sets} x {ex.reps})</span>
              </a>
              <div className="flex items-center gap-2">
                <button className="icon-btn" onClick={() => onAddSet(en.exerciseId)} aria-label="Add set"><PlusIcon /></button>
                <button className="icon-btn" onClick={() => {
                  // remove whole exercise from the session view
                  setSession(s => ({ ...s, entries: s.entries.filter(e => e.exerciseId !== en.exerciseId) }));
                }} aria-label="Remove exercise"><TrashIcon /></button>
              </div>
            </div>

            {/* Sets */}
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
