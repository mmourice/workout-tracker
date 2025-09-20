import React from "react";
import { useStore } from "../store.jsx";

export default function Plan() {
  const {
    state,
    updateDay,
    addDay,
    removeDay,
    addExerciseToDay,
    removeExerciseFromDay,
    exerciseMap,
  } = useStore();

  return (
    <div className="p-5 space-y-4">
      <button
        onClick={addDay}
        className="px-4 py-2 rounded-button border border-brand-border hover:bg-[#181818]"
      >
        Add Day
      </button>

      {state.plan.days.map((d) => (
        <div
          key={d.id}
          className="rounded-card border border-brand-border bg-brand-surface p-4 space-y-3"
        >
          {/* Day name */}
          <div>
            <label className="block text-label text-brand-accent mb-1">
              Day name
            </label>
            <input
              value={d.name}
              onChange={(e) => updateDay(d.id, { name: e.target.value })}
              className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
            />
          </div>

          {/* Current exercises */}
          <div>
            <div className="text-label text-brand-accent mb-2">Exercises</div>
            <div className="space-y-2">
              {d.exerciseIds.length === 0 ? (
                <div className="text-neutral-400">
                  No exercises yet. Add some below.
                </div>
              ) : (
                d.exerciseIds.map((eid) => (
                  <div
                    key={eid}
                    className="flex items-center justify-between rounded-card border border-brand-border bg-brand-input px-3 py-2"
                  >
                    <span className="text-body font-mont truncate">
                      {exerciseMap[eid]?.name || "(missing)"}
                    </span>
                    <button
                      onClick={() => removeExerciseFromDay(d.id, eid)}
                      className="text-neutral-400 px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add exercise options */}
          <div>
            <div className="text-label text-brand-accent mb-2">Add exercise</div>
            <div className="space-y-2">
              {state.exercises
                .filter((e) => !d.exerciseIds.includes(e.id))
                .map((e) => (
                  <button
                    key={e.id}
                    onClick={() => addExerciseToDay(d.id, e.id)}
                    className="w-full text-left px-3 py-2 rounded-button border border-brand-border hover:bg-[#181818]"
                  >
                    {e.name}
                  </button>
                ))}
            </div>
          </div>

          {/* Delete day */}
          <div>
            <button
              onClick={() => removeDay(d.id)}
              className="text-red-500 text-label"
            >
              Delete Day
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
