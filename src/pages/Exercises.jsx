import React, { useMemo, useState } from "react";
import { useStore } from "../store.jsx";
import { TrashIcon, PlusIcon } from "../Icons.jsx";
import { useLocation, useNavigate } from "react-router-dom";

const GROUPS = ["Chest", "Back", "Shoulders", "Legs", "Arms", "Core", "Cardio", "Other"];

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function Exercises() {
  const {
    state,
    addExercise,
    updateExercise,
    removeExercise,
    addExerciseToDay,
  } = useStore();

  const q = useQuery();
  const navigate = useNavigate();
  const addToDay = q.get("addToDay");           // select-mode if present
  const isSelectMode = Boolean(addToDay);

  // which group currently has the inline "add" form expanded?
  const [openGroup, setOpenGroup] = useState(null);
  // simple local form state for the new exercise
  const [form, setForm] = useState({ name: "", sets: "3", reps: "10", link: "" });

  // group existing exercises
  const grouped = useMemo(() => {
    const map = Object.fromEntries(GROUPS.map(g => [g, []]));
    for (const ex of state.exercises) {
      const g = ex.group && GROUPS.includes(ex.group) ? ex.group : "Other";
      map[g].push(ex);
    }
    return map;
  }, [state.exercises]);

  // create a new exercise inside a group; if select-mode, also add to day and go back
  const createInGroup = async (group) => {
    if (!form.name.trim()) return alert("Please enter a name.");
    // 1) make a new exercise (addExercise adds a default at the end)
    addExercise();
    // 2) grab the freshly-added exercise id (last item)
    const newEx = state.exercises[state.exercises.length - 1];
    if (!newEx) return;

    // 3) patch it with your form + group
    updateExercise(newEx.id, {
      name: form.name.trim(),
      sets: Math.max(1, Number(form.sets || 1)),
      reps: Math.max(1, Number(form.reps || 1)),
      link: form.link?.trim() || "",
      group,
    });

    // 4) if we came from Plan in select-mode, attach to that day & go back
    if (isSelectMode && addToDay) {
      addExerciseToDay(addToDay, newEx.id);
      navigate("/plan");
      return;
    }

    // reset the inline form
    setForm({ name: "", sets: "3", reps: "10", link: "" });
    setOpenGroup(null);
  };

  const handlePickExisting = (exId) => {
    if (!isSelectMode) return;
    addExerciseToDay(addToDay, exId);
    navigate("/plan");
  };

  return (
    <div className="space-y-5">
      {/* Top actions (hidden in select-mode) */}
      {!isSelectMode && (
        <div className="flex items-center justify-between">
          <div className="text-neutral-400 text-sm">
            Manage exercises by muscle group
          </div>
          {/* Quick add anywhere (defaults to Other) */}
          <button
            onClick={() => { setOpenGroup("Other"); }}
            className="px-3 py-2 rounded-button bg-brand-primary text-black flex items-center gap-2"
            title="Add exercise"
          >
            <PlusIcon />
            <span>Add Exercise</span>
          </button>
        </div>
      )}

      {/* Select-mode banner */}
      {isSelectMode && (
        <div className="rounded-card border border-brand-border bg-[#181818] px-3 py-2 text-label">
          Select an exercise or press + to create a new one in that group.
        </div>
      )}

      {/* Category sections */}
      {GROUPS.map((group) => (
        <div key={group} className="space-y-3">
          {/* Header row with + on the right */}
          <div className="flex items-center justify-between">
            <h3 className="text-h2 font-mont font-bold">{group}</h3>
            <button
              onClick={() => {
                setOpenGroup(openGroup === group ? null : group);
                setForm({ name: "", sets: "3", reps: "10", link: "" });
              }}
              className="px-2 py-1 rounded-button hover:bg-[#181818]"
              aria-label={`Add ${group} exercise`}
              title={`Add ${group} exercise`}
            >
              <PlusIcon />
            </button>
          </div>

          {/* Inline add form (appears under header) */}
          {openGroup === group && (
            <div className="rounded-card border border-brand-border bg-brand-card p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-label text-brand-accent mb-1">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
                    placeholder={`e.g., ${group === "Chest" ? "Incline Chest Press" : "New Exercise"}`}
                  />
                </div>
                <div>
                  <label className="block text-label text-brand-accent mb-1">Sets</label>
                  <input
                    inputMode="numeric"
                    value={form.sets}
                    onChange={(e) => setForm((f) => ({ ...f, sets: e.target.value }))}
                    className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-label text-brand-accent mb-1">Reps</label>
                  <input
                    inputMode="numeric"
                    value={form.reps}
                    onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))}
                    className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
                    placeholder="10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-label text-brand-accent mb-1">YouTube link (optional)</label>
                <input
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => createInGroup(group)}
                  className="px-4 py-2 rounded-button bg-brand-primary text-black"
                >
                  {isSelectMode ? "Create & Add to Day" : "Create Exercise"}
                </button>
                <button
                  onClick={() => setOpenGroup(null)}
                  className="px-4 py-2 rounded-button border border-brand-border"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing exercises in this group */}
          {grouped[group].length === 0 ? (
            <div className="text-neutral-500 text-sm">No exercises in {group} yet.</div>
          ) : (
            <div className="space-y-3">
              {grouped[group].map((ex) =>
                isSelectMode ? (
                  // SELECT MODE: each name is a button to add to day
                  <button
                    key={ex.id}
                    onClick={() => handlePickExisting(ex.id)}
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
                        placeholder="Exercise name"
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

                    {/* Footer */}
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
