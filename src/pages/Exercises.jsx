import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useStore } from "../store.jsx";
import { PlusIcon } from "../Icons.jsx";

const GROUPS = ["Chest","Back","Shoulders","Legs","Arms","Core","Cardio","Other"];

export default function Exercises() {
  const { state, addExercise, addExerciseToDay } = useStore();
  const [q, setQ] = useState("");
  const [modal, setModal] = useState({ open:false, group:"Chest", name:"", sets:3, reps:10, link:"" });

  // add-to-day flow
  const params = new URLSearchParams(useLocation().search);
  const addToDay = params.get("addToDay");

  const grouped = useMemo(() => {
    const bag = Object.fromEntries(GROUPS.map(g => [g, []]));
    state.exercises.forEach(e => {
      const g = e.group || "Other";
      if (!bag[g]) bag[g] = [];
      bag[g].push(e);
    });
    // filter by query
    if (q.trim()) {
      const needle = q.toLowerCase();
      Object.keys(bag).forEach(g => {
        bag[g] = bag[g].filter(e => e.name.toLowerCase().includes(needle));
      });
    }
    return bag;
  }, [state.exercises, q]);

  const createExercise = () => {
    const ex = addExercise({
      name: modal.name.trim(),
      group: modal.group,
      sets: Number(modal.sets) || 3,
      reps: Number(modal.reps) || 10,
      link: modal.link.trim(),
    });
    if (addToDay && ex?.id) addExerciseToDay(addToDay, ex.id);
    setModal({ open:false, group:"Chest", name:"", sets:3, reps:10, link:"" });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-label">Manage exercises by muscle group</div>
        <input className="text-input mt-2" placeholder="Search exercises..." value={q} onChange={e=>setQ(e.target.value)} />
        <div className="mt-3">
          <button className="cta" onClick={()=>setModal(m=>({...m, open:true}))}><PlusIcon/><span style={{marginLeft:8}}>Add Exercise</span></button>
        </div>
      </div>

      {/* Group sections */}
      <div className="space-y-4">
        {GROUPS.map(g => (
          <div key={g} className="rounded-card p-3">
            <div className="group-header">{g}</div>
            {grouped[g]?.length ? (
              <div className="stack">
                {grouped[g].map(ex => (
                  <div key={ex.id} className="list-row">
                    <div className="title">{ex.name}</div>
                    <div className="muted tiny">{ex.sets}×{ex.reps}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="muted tiny">No exercises in {g} yet.</div>
            )}
          </div>
        ))}
      </div>

      {/* Create modal */}
      {modal.open && (
        <div className="modal">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title">Add Exercise</div>
              <button className="close-x" onClick={()=>setModal(m=>({...m, open:false}))}>×</button>
            </div>

            <div className="grid-form">
              <label>Name</label>
              <input className="text-input" value={modal.name} onChange={e=>setModal({...modal, name:e.target.value})} placeholder="e.g., Incline Chest Press" />

              <label>Group</label>
              <select className="text-input" value={modal.group} onChange={e=>setModal({...modal, group:e.target.value})}>
                {GROUPS.map(g=> <option key={g} value={g}>{g}</option>)}
              </select>

              <label>Sets</label>
              <input className="text-input" type="number" min="1" value={modal.sets} onChange={e=>setModal({...modal, sets:e.target.value})} />

              <label>Reps</label>
              <input className="text-input" type="number" min="1" value={modal.reps} onChange={e=>setModal({...modal, reps:e.target.value})} />

              <label>YouTube link (optional)</label>
              <input className="text-input" value={modal.link} onChange={e=>setModal({...modal, link:e.target.value})} placeholder="https://www.youtube.com/watch?v=..." />
            </div>

            <div className="chips mt-4">
              <button className="cta" onClick={createExercise}>Create</button>
              <button className="chip chip--idle" onClick={()=>setModal({open:false, group:"Chest", name:"", sets:3, reps:10, link:""})}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
