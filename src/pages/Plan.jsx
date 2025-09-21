import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store.jsx";
import { TrashIcon, PlusIcon } from "../Icons.jsx";

export default function Plan() {
  const {
    state,
    exerciseMap,
    addDay,
    updateDay,
    removeDay,
    addExerciseToDay,
    removeExerciseFromDay,
  } = useStore();
  const nav = useNavigate();

  const handleAddDay = () => {
    const d = addDay(); // assume store returns the new day
    if (!d) return;
  };

  const goAddExercises = (dayId) => {
    nav(`/exercises?addToDay=${encodeURIComponent(dayId)}`);
  };

  return (
    <div className="space-y-5">
      <div className="tabs-row">
        <button className="rounded-button bg-brand-primary text-black" onClick={handleAddDay}>
          <PlusIcon /> <span style={{ marginLeft: 8, fontWeight: 800 }}>Add Day</span>
        </button>
      </div>

      {!state.plan.days.length ? (
        <div className="muted">No days yet. Tap <b>Add Day</b> to start building your plan.</div>
      ) : (
        state.plan.days.map((d) => (
          <div key={d.id} className="rounded-card p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-label mb-1">Day name</label>
                <input
                  className="w-full rounded-card bg-brand-input px-3 py-2"
                  value={d.name}
                  onChange={(e) => updateDay(d.id, { name: e.target.value })}
                  placeholder="Upper A"
                />
              </div>

              <button
                className="icon-btn ghost"
                title="Delete day"
                onClick={() => removeDay(d.id)}
                aria-label="Delete day"
              >
                <TrashIcon />
              </button>
            </div>

            <div>
              <div className="text-label mb-2">Exercises</div>

              {/* Current day exercises as flat rows */}
              {d.exerciseIds.length ? (
                <div className="space-y-2">
                  {d.exerciseIds.map((eid) => {
                    const ex = exerciseMap[eid];
                    return (
                      <div key={eid} className="group-row">
                        <div className="title" style={{ fontSize: 18 }}>
                          {ex?.name || "(missing exercise)"}
                          {ex?.group ? (
                            <span className="muted text-xs" style={{ marginLeft: 8 }}>
                              · {ex.group}
                            </span>
                          ) : null}
                        </div>
                        <div className="right">
                          <button
                            className="icon-btn ghost"
                            title="Remove from day"
                            onClick={() => removeExerciseFromDay(d.id, eid)}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="muted">No exercises in this day yet.</div>
              )}

              {/* Add exercise CTA (navigates to Exercises in select mode) */}
              <div className="mt-3">
                <button
                  className="rounded-button"
                  onClick={() => goAddExercises(d.id)}
                  title="Add exercise"
                >
                  <PlusIcon /> <span style={{ marginLeft: 6 }}>Add exercise</span>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
