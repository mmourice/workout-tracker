import React, { useMemo } from "react";
import { useStore } from "../store.jsx";
import { TrashIcon, PlusIcon } from "../Icons.jsx";
import { useLocation, useNavigate } from "react-router-dom";

const GROUPS = ["Chest", "Back", "Shoulders", "Legs", "Arms", "Core", "Cardio", "Other"];

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Exercises() {
  const { state, addExercise, updateExercise, removeExercise, addExerciseToDay } = useStore();
  const q = useQuery();
  const navigate = useNavigate();

  const addToDay = q.get("addToDay"); // if present -> select mode
  const isSelectMode = Boolean(addToDay);

  // group exercises by ex.group (default "Other")
  const grouped = useMemo(() => {
    const map = Object.fromEntries(GROUPS.map(g => [g, []]));
    for (const ex of state.exercises) {
      const g = ex.group && GROUPS.includes(ex.group) ? ex.group : "Other";
      map[g].push(ex);
    }
    return map;
  }, [state.exercises]);

  const handlePick = (exId) => {
    if (!isSelectMode) return;
    addExerciseToDay(addToDay, exId);
    // go back to Plan
    navigate("/plan");
  };

  return (
    <div className="space-y-5">
      {/* Top actions */}
      {!isSelectMode && (
        <button
          onClick={addExercise}
          className="w-full md:w-auto px-4 py-2 rounded-button bg-brand-primary text-black font-mont flex items-center gap-2"
        >
          <span className="text-lg leading-none">＋</span>
          <span>Add Exercise</span>
        </button>
      )}

      {/* Select mode banner */}
      {isSelectMode && (
        <div className="rounded-card border border-brand-border bg-[#181818] px-3 py-2 text-label">
          Select an exercise to add to this day.
        </div>
      )}

      {/* Categories */}
      {GROUPS.map((group) => (
        <div key={group} className="space-y-3">
          <h3 className="text-h2 font-mont font-bold">{group}</h3>

          {/* Empty state per group */}
          {grouped[group].length === 0 ? (
            !isSelectMode && (
              <div className="text-neutral-500 text-sm">No exercises in {group} yet.</div>
            )
          ) : (
            <div className="space-y-3">
              {grouped[group].map((ex) =>
                isSelectMode ? (
                  // SELECT MODE: each name is a button to add to day
                  <button
                    key={ex.id}
                    onClick={() => handlePick(ex.id)}
                    className="w-full text-left px-3 py-3 rounded-button border border-brand-border hover:bg-[#181818] flex items-center gap-2"
                  >
                    <span className="text-lg leading-none">＋</span>
                    <span className="text-body">{ex.name}</span>
                  </button>
                ) : (
                  // EDIT MODE: full editable card
                  <div
                    key={ex.id}
                    className="rounded-card border border-brand-border bg-brand-card p-4 space-y-3"
                  >
                    {/* Name */}
                    <div>
                      <label className="block text-label text-brand-accent mb-1">Name</label>
                      <input
                        value={ex.name}
                        onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                        className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
                        placeholder="e.g., Incline Chest Press"
                      />
                    </div>

                    {/* Group / Sets / Reps */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-label text-brand-accent mb-1">Group</label>
                        <select
                          value={ex.group || "Other"}
                          onChange={(e) => updateExercise(ex.id, { group: e.target.value })}
                          className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
                        >
                          {GROUPS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-label text-brand-accent mb-1">Sets</label>
                        <input
                          inputMode="numeric"
                          value={String(ex.sets ?? 3)}
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
                        <label className="block text-label text-brand-accent mb-1">Reps</label>
                        <input
                          inputMode="numeric"
                          value={String(ex.reps ?? 10)}
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
                        aria-label="Delete exercise"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
