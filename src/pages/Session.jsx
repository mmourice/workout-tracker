import React, { useEffect, useState } from "react";
import { useStore } from "../store.jsx";
import { PlusIcon, TrashIcon } from "../Icons.jsx";
import RestTimer from "../components/RestTimer.jsx";

const UnitField = ({ value, onChange, placeholder, unit = "kg" }) => (
  <div className="relative min-w-0 flex-1">
    <input
      value={value}
      onChange={onChange}
      inputMode="decimal"
      placeholder={placeholder}
      className="w-full rounded-card border border-brand-border bg-brand-input px-3 pr-14 text-base text-white"
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2">{unit}</span>
  </div>
);

export default function Session() {
  const { state, exerciseMap, buildSessionForDay, saveSession } = useStore();
  const [selectedDayId, setSelectedDayId] = useState(state.plan.days[0]?.id || "");
  const [session, setSession] = useState(null);
  const [kicks, setKicks] = useState({});

  useEffect(() => {
    setSession(buildSessionForDay(selectedDayId));
    setKicks({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayId, state.logs]);

  if (!session) return null;
  const bump = (id) => setKicks(m => ({ ...m, [id]: (m[id] || 0) + 1 }));
  const units = state.units;

  const setAdd = (id) => setSession(s => {
    const c = structuredClone(s);
    const e = c.entries.find(x => x.exerciseId === id);
    if (!e) return s;
    const last = e.sets[e.sets.length - 1] || { weight: "0", reps: "10" };
    e.sets.push({ weight: last.weight, reps: last.reps });
    return c;
  });
  const setDel = (id, i) => setSession(s => {
    const c = structuredClone(s);
    const e = c.entries.find(x => x.exerciseId === id);
    if (!e) return s;
    e.sets.splice(i, 1);
    if (!e.sets.length) e.sets.push({ weight: "0", reps: "10" });
    return c;
  });

  const onSave = () => {
    saveSession(session);
    setSession(buildSessionForDay(selectedDayId));
    alert("Session saved!");
  };

  return (
    <div className="space-y-4">
      {/* Day pills */}
      <div className="space-y-2">
        <div className="text-brand-accent text-label">Pick day</div>
        <div className="flex flex-wrap gap-8">
          {state.plan.days.map(d => (
            <button
              key={d.id}
              className={`rounded-button px-4 py-2 ${d.id === selectedDayId ? "bg-brand-primary text-black border-transparent" : ""}`}
              onClick={() => setSelectedDayId(d.id)}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-8">
        <button className="rounded-button" onClick={() => setSession(buildSessionForDay(selectedDayId))}>Copy last</button>
        <button className="rounded-button" onClick={() => setSession(buildSessionForDay(selectedDayId))}>Clear</button>
        <button className="rounded-button bg-brand-primary text-black" onClick={onSave}>Save Session</button>
      </div>

      {/* Exercise cards */}
      {session.entries.map((en) => {
        const ex = exerciseMap[en.exerciseId];
        if (!ex) return null;
        return (
          <div key={en.exerciseId} className="rounded-card border border-brand-border bg-brand-card p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="font-extrabold leading-snug">
                {ex.link ? (
                  <a href={ex.link} target="_blank" rel="noopener noreferrer" className="underline decoration-brand-accent underline-offset-2">
                    {ex.name}
                  </a>
                ) : (
                  <span>{ex.name}</span>
                )}
              </div>
              <div className="card-actions">
                <RestTimer seconds={90} kick={kicks[en.exerciseId] || 0} />
                <button className="icon-btn ghost" title="Add set" onClick={() => setAdd(en.exerciseId)}><PlusIcon /></button>
                <button className="icon-btn ghost" title="Remove exercise"
                        onClick={() => setSession(s => ({ ...s, entries: s.entries.filter(e => e.exerciseId !== en.exerciseId) }))}>
                  <TrashIcon />
                </button>
              </div>
            </div>

            {/* Sets grid (always 2 columns) */}
            <div className="grid-sets">
              {en.sets.map((s, i) => (
                <div key={i} className="set-card">
                  <div className="corner-x">
                    <button onClick={() => setDel(en.exerciseId, i)} aria-label="Remove set">✕</button>
                  </div>
                  <div className="text-label mb-2">Set {i + 1}</div>
                  <div className="row">
                    <UnitField value={s.weight} onChange={(e)=>{ s.weight=e.target.value; bump(en.exerciseId); setSession({...session}); }} placeholder="0" unit={units} />
                    <UnitField value={s.reps}   onChange={(e)=>{ s.reps=e.target.value;   bump(en.exerciseId); setSession({...session}); }} placeholder="10" unit="reps" />
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
