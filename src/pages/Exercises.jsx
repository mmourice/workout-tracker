import React from "react";
import { useStore } from "../store.jsx";

export default function Exercises() {
  const {
    state,
    addExercise,
    updateExercise,
    removeExercise,
  } = useStore();

  return (
    <div className="space-y-4">
      {/* Add exercise */}
      <button
        onClick={addExercise}
        className="w-full md:w-auto px-4 py-2 rounded-button bg-brand-primary text-black font-mont flex items-center gap-2"
      >
        <span className="text-lg leading-none">＋</span>
        <span>Add Exercise</span>
      </button>

      {/* Exercise cards */}
      <div className="space-y-4">
        {state.exercises.length === 0 ? (
          <div className="text-neutral-400">No exercises yet. Tap “Add Exercise”.</div>
        ) : (
          state.exercises.map((ex) => (
            <div
              key={ex.id}
              className="rounded-card border border-brand-border bg-brand-card p-4 space-y-3"
            >
              {/* Name */}
              <div>
                <label className="block text-label text-brand-accent mb-1">
                  Name
                </label>
                <input
                  value={ex.name}
                  onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                  className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
                  placeholder="e.g., Incline Chest Press"
                />
              </div>

              {/* Sets & Reps */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label text-brand-accent mb-1">
                    Sets
                  </label>
                  <input
                    inputMode="numeric"
                    value={String(ex.sets)}
                    onChange={(e) =>
                      updateExercise(ex.id, {
                        sets: Math.max(1, Number(e.target.value || 1)),
                      })
                    }
                    className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-label text-brand-accent mb-1">
                    Reps
                  </label>
                  <input
                    inputMode="numeric"
                    value={String(ex.reps)}
                    onChange={(e) =>
                      updateExercise(ex.id, {
                        reps: Math.max(1, Number(e.target.value || 1)),
                      })
                    }
                    className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-label text-brand-accent mb-1">
                  YouTube link (optional)
                </label>
                <input
                  value={ex.link || ""}
                  onChange={(e) => updateExercise(ex.id, { link: e.target.value })}
                  className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between">
                {ex.link ? (
                  <a
                    href={ex.link}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-brand-accent"
                  >
                    Test link ↗
                  </a>
                ) : (
                  <span className="text-neutral-400">Add a link to preview</span>
                )}

                <button
                  onClick={() => removeExercise(ex.id)}
                  className="px-3 py-2 rounded-button hover:bg-[#181818]"
                  title="Delete exercise"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
