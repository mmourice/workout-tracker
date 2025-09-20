import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "../store.jsx";
import { TrashIcon, PlusIcon } from "../Icons.jsx";

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

// Input with a right-side unit badge to keep weight/reps perfectly aligned
const UnitField = ({ value, onChange, placeholder, unit = "kg" }) => (
  <div className="relative">
    <NumInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="pr-10" // space for unit badge
    />
    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-70 select-none">
      {unit}
    </span>
  </div>
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

  // Prefill from most recent log
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
    removeExerciseFromDay(day.id, eid); // remove from plan for this day
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
        <button
          className="px-4 py-2 rounded-button border border-brand-border"
          onClick={() => setSession((s) => ({ ...s }))} // already prefilled
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
                  () => String(exerciseMap[e.exerciseId]?.reps || 10)
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

          const Title = ex.link
            ? (props) => (
                <a
                  href={ex.link}
                  target="_blank"
                  className="underline decoration-brand-accent underline-offset-2"
                >
                  {props.children}
                </a>
              )
            : (props) => <span>{props.children}</span>;

          return (
            <div
              key={entry.exerciseId}
              className="border border-brand-border rounded-card p-4 bg-brand-card space-y-3"
            >
              {/* Header line: clickable title + actions on the same row */}
              <div className="flex items-start justify-between gap-3">
                <div className="font-bold leading-snug">
                  <Title>
                    {ex.name}{" "}
                    <span className="text-brand-accent">
                      ({ex.sets} x {ex.reps})
                    </span>
                  </Title>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded-button hover:bg-[#181818]"
                    onClick={() => addSet(idx, ex.reps)}
                    title="Add Set"
                    aria-label="Add set"
                  >
                    <span className="text-lg leading-none">＋</span>
                  </button>
                  <button
                    className="flex items-center px-2 py-1 rounded-button hover:bg-[#181818]"
                    onClick={() => removeExerciseCard(entry.exerciseId)}
                    title="Remove workout from this day"
                    aria-label="Remove workout"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              {/* Sets grid: 2 columns on phones, 3 on larger */}
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
                          Weight
                        </label>
                        <UnitField
                          value={entry.weights[i]}
                          onChange={(e) => {
                            const v = e.target.value;
                            setSession((s) => {
                              const c = structuredClone(s);
                              c.entries[idx].weights[i] = v;
                              return c;
                            });
                          }}
                          placeholder="0"
                          unit={state.units}
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
