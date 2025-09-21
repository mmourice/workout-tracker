import React, { useEffect, useState } from "react";
import { useStore } from "../store.jsx";
import { PlusIcon, TrashIcon } from "../Icons.jsx";
import RestTimer from "../components/RestTimer.jsx";

const UnitField = ({ value, onChange, placeholder, unit = "kg" }) => (
  <div className="unit-wrap">
    <input
      type="number"
      value={value}
      onChange={onChange}
      inputMode="decimal"
      placeholder={placeholder}
      className="w-full rounded-card bg-brand-input px-3 pr-12"
    />
    <span>{unit}</span>
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

  const addSet = (exId) => setSession(s => {
    const c = structuredClone(s);
    const e = c.entries.find(x => x.exerciseId === exId);
    if (!e) return s;
    const last = e.sets[e.sets.length - 1] || { weight: "0", reps: "10" };
    e.sets.push({ weight: last.weight, reps: last.reps });
    return c;
  });
  const delSet = (exId, i) => setSession(s => {
    const c = structuredClone(s);
    const e = c.entries.find(x => x.exerciseId === exId);
    if (!e) return s;
    e.sets.splice(i, 1);
    if (!e.sets.length) e.sets.push({ weight: "0", reps: "10" });
    return c;
  });
  const removeExerciseFromSession = (exId) =>
    setSession(s => ({ ...s, entries: s.entries.filter(e => e.exerciseId !== exId) }));

  const onSave = () => {
    saveSession(session);
    setSession(buildSessionForDay(selectedDayId));
    alert("Session saved!");
  };

  return (
    <div className="space-y-5">
      {/* Tabs are defined in layout; here only day pills + actions */}
      <div className="space-y-2">
        <div className="text-label">Pick day</div>
        <div className="tabs-row">
          {state.plan.days.map(d => (
            <button
              key={d.id}
              className={`rounded-button ${d.id === selectedDayId ? "is-active" : ""}`}
              onClick={() => setSelectedDayId(d.id)}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      <div className="tabs-row">
        <button className="rounded-button" onClick={() => setSession(buildSessionForDay(selectedDayId))}>Copy last</button>
        <button className="rounded-button" onClick={() => setSession(buildSessionForDay(selectedDayId))}>Clear</button>
        <button className="rounded-button bg-brand-primary text-black" onClick={onSave}>Save Session</button>
      </div>

      {session.entries.map((en) => {
        const ex = exerciseMap[en.exerciseId];
        if (!ex) return null;
        return (
          <div key={en.exerciseId} className="rounded-card p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-extrabold leading-snug">
                {ex.link ? (
                  <a className="underline decoration-[var(--accent)] underline-offset-2"
                     href={ex.link} target="_blank" rel="noopener noreferrer">
                    {ex.name}
                  </a>
                ) : (
                  <span>{ex.name}</span>
                )}
              </div>
              <div className="card-actions">
                <RestTimer seconds={90} kick={kicks[en.exerciseId] || 0} />
                <button className="icon-btn ghost" title="Add set" onClick={() => addSet(en.exerciseId)}><PlusIcon/></button>
                <button className="icon-btn ghost" title="Remove exercise" onClick={() => removeExerciseFromSession(en.exerciseId)}><TrashIcon/></button>
              </div>
            </div>

            <div className="grid-sets">
              {en.sets.map((s, i) => (
                <div key={i} className="set-card">
                  <div className="corner-x"><button onClick={() => delSet(en.exerciseId, i)} aria-label="Remove set">✕</button></div>
                  <div className="text-label mb-2">Set {i+1}</div>
                  <div className="row">
                    <UnitField
                      value={s.weight}
                      onChange={(e)=>{ s.weight=e.target.value; bump(en.exerciseId); setSession({...session}); }}
                      placeholder="0" unit={units}
                    />
                    <UnitField
                      value={s.reps}
                      onChange={(e)=>{ s.reps=e.target.value; bump(en.exerciseId); setSession({...session}); }}
                      placeholder="10" unit="reps"
                    />
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
