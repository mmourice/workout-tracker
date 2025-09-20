import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "../store.jsx";

const NumInput = (props) => (
  <input
    {...props}
    inputMode="decimal"
    className={
      "w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body text-white " +
      (props.className || "")
    }
  />
);

// Simple 2D white outline trash icon (no external libs)
const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export default function Session() {
  const {
    state,
    exerciseMap,
    saveSession,
    removeExerciseFromDay, // remove workout from the selected day
  } = useStore();

  const [selectedDayId, setSelectedDayId] = useState(
    state.plan.days[0]?.id || null
  );
  const day = useMemo(
    () =>
      state.plan.days.find((d) => d.id === selectedDayId) ||
      state.plan.days[0],
    [state.plan.days, selectedDayId]
  );

  // local “today” session (weights + reps, can add/remove sets)
  const [session, setSession] = useState(null);

  // Prefill from the most recent log
  useEffect(() => {
    if (!day) return;
    const entries = day.exerciseIds.map((eid) => {
      const ex = exerciseMap[eid];
      const lastEntry = [...state.logs]
        .reverse()
        .map((l) => l.entries.find((e) => e.exerciseId === eid))
        .find(Boolean);

      const sets = ex?.sets || 3;
      const weights = Array.from({ length: sets }, (_, i) => {
        if (lastEntry && lastEntry.weights[i] != null)
          return String(lastEntry.weights[i]);
        if (lastEntry && lastEntry.weights.length)
          return String(lastEntry.weights.at(-1));
        return "0";
      });
      const reps = Array.from({ length: sets }, (_, i) => {
        if (lastEntry && lastEntry.reps && lastEntry.reps[i] != null)
          return String(lastEntry.reps[i]);
        return String(ex?.reps || 10);
      });
      return { exerciseId: eid, weights, reps };
    });
    setSession({
      dayId: day.id,
      dateISO: new Date().toISOString(),
      entries,
    });
  }, [day, state.logs, exerciseMap]);

  if (!day)
    return <p className="text-brand-accent">Create a day in Plan first.</p>;

  // helpers
  const addSet = (idx, defaultReps) => {
    setSession((s) => {
      const c = structuredClone(s);
      c.entries[idx].weights.push("0");
      c.entries[idx].reps.push(String(defaultReps || 10));
      return c;
    });
  };

  const removeExerciseCard = (eid) => {
    // remove from the current day (so it won’t appear next time)
    removeExerciseFromDay(day.id, eid);
    // also remove from today’s session view immediately
    setSession((s) => {
      const c = structuredClone(s);
      c.entries = c.entries.filter((e) => e.exerciseId !== eid);
      return c;
    });
  };

  return (
    <div className="space-y-4">
      {/* Day picker (no horizontal scroll) */}
      <div className="space-y-2">
        <div className="text-label text-brand-accent">Pick day</div>
        <div className="flex flex-wrap gap-8">
          {state.plan.days.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDayId(d.id)}
              className={
                "px-3 py-1 rounded-chip border " +
                (d.id === day.id
                  ? "bg-brand-primary text-black border-brand-primary"
                  : "bg-transparent text-white border-brand-border")
              }
            >
              <span className="text-label">{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* Copy last is effectively the default state, keep a button for clarity */}
        <button
          className="px-4 py-2 rounded-button border border-brand-border"
          onClick={() => setSession((s) => ({ ...s }))} // noop, already copied
          title="Already prefilled from last"
        >
          ⤴︎ Copy last
        </button>

        <button
          className="px-4 py-2 rounded-button border border-brand-border"
          onClick={() =>
            setSession((s) => ({
              ...s,
              entries: s.entries.map((e) => ({
                ...e,
                weights: e.weights.map(() => "0"),
                reps: e.reps.map(
                  (_, i) => String(exerciseMap[e.exerciseId]?.reps || 10)
                ),
              })),
            }))
          }
        >
          Clear
        </button>

        <button
          className="px-4 py-2 rounded-button bg-brand-primary text-black"
          onClick={() => {
            saveSession(session);
            alert("Saved to History. Nice work!");
          }}
        >
          Save Session
        </button>
      </div>

      {/* Exercise cards (no horizontal scroll; grid of sets) */}
      <div className="space-y-4">
        {session?.entries.map((entry, idx) => {
          const ex = exerciseMap[entry.exerciseId];
          if (!ex) return null;

          return (
            <div
              key={entry.exerciseId}
              className="border border-brand-border rounded-card p-4 bg-brand-card space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="font-bold">
                  {ex.name}{" "}
                  <span className="text-brand-accent">
                    ({ex.sets} x {ex.reps})
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {ex.link ? (
                    <a
                      href={ex.link}
                      target="_blank"
                      className="underline text-brand-accent"
                    >
                      How-to ↗
                    </a>
                  ) : (
                    <span className="text-neutral-400">No link</span>
                  )}
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded-button hover:bg-[#181818]"
                    onClick={() => addSet(idx, ex.reps)}
                    title="Add Set"
                  >
                    <span className="text-lg leading-none">＋</span>
                    <span className="text-label">Add Set</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-2 py-1 rounded-button hover:bg-[#181818]"
                    onClick={() => removeExerciseCard(entry.exerciseId)}
                    title="Remove workout from this day"
                  >
                    <TrashIcon />
                    <span className="text-label">Remove</span>
                  </button>
                </div>
              </div>

              {/* Sets grid: 2 columns on small screens, 3+ on wide */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {entry.weights.map((w, i) => (
                  <div
                    key={i}
                    className="rounded-card border border-brand-border bg-brand-input p-3"
                  >
                    <div className="text-label text-brand-accent mb-2">
                      Set {i + 1}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-label opacity-70 mb-1">
                          Weight ({state.units})
                        </label>
                        <NumInput
                          value={entry.weights[i]}
                          onChange={(e) => {
                            const v = e.target.value;
                            setSession((s) => {
                              const c = structuredClone(s);
                              c.entries[idx].weights[i] = v;
                              return c;
                            });
                          }}
                          placeholder={`0 ${state.units}`}
                        />
                      </div>
                      <div>
                        <label className="block text-label opacity-70 mb-1">
                          Reps
                        </label>
                        <NumInput
                          value={entry.reps[i]}
                          onChange={(e) => {
                            const v = e.target.value;
                            setSession((s) => {
                              const c = structuredClone(s);
                              c.entries[idx].reps[i] = v;
                              return c;
                            });
                          }}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
