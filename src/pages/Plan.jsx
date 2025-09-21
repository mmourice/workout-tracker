import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store.jsx";
import { TrashIcon, PlusIcon } from "../Icons.jsx";

export default function Plan() {
  const { state, exerciseMap, addDay, updateDay, removeDay, addExerciseToDay, removeExerciseFromDay } = useStore();
  const nav = useNavigate();

  return (
    <div className="space-y-5">
      <div className="chips">
        <button className="cta" onClick={() => addDay()}><PlusIcon /><span style={{marginLeft:8}}>Add Day</span></button>
      </div>

      {state.plan.days.map((d) => (
        <div key={d.id} className="rounded-card p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="text-label mb-1">Day name</div>
              <input
                className="text-input"
                value={d.name}
                onChange={(e) => updateDay(d.id, { name: e.target.value })}
                placeholder="Upper A"
              />
            </div>
            <button className="icon ghost" title="Delete day" onClick={() => removeDay(d.id)}>
              <TrashIcon />
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-label">Exercises</div>
            {d.exerciseIds.length ? (
              <div className="stack">
                {d.exerciseIds.map((eid) => {
                  const ex = exerciseMap[eid];
                  return (
                    <div key={eid} className="list-row">
                      <div>
                        <div className="title">{ex?.name || "(missing)"}</div>
                        {ex?.group && <div className="muted tiny">· {ex.group}</div>}
                      </div>
                      <button className="icon ghost" onClick={() => removeExerciseFromDay(d.id, eid)} title="Remove">
                        <TrashIcon />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="muted">No exercises yet.</div>
            )}
          </div>

          <div>
            <button className="chip chip--idle" onClick={() => nav(`/exercises?addToDay=${d.id}`)}>
              <PlusIcon /><span style={{marginLeft:6}}>Add exercise</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
