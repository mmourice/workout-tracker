import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../store.jsx";
import Accordion from "../components/Accordion.jsx";
import Modal from "../components/Modal.jsx";
import { PlusIcon, TrashIcon } from "../Icons.jsx";

const useQuery = () => new URLSearchParams(useLocation().search);

export default function Exercises() {
  const {
    state,
    GROUPS,
    addExercise,
    updateExercise,
    removeExercise,
    addExerciseToDay,
  } = useStore();

  const q = useQuery();
  const navigate = useNavigate();
  const addToDay = q.get("addToDay");
  const isSelectMode = Boolean(addToDay);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [targetGroup, setTargetGroup] = useState(GROUPS[0] || "Other");
  const [form, setForm] = useState({ name: "", sets: "3", reps: "10", link: "" });

  const grouped = useMemo(() => {
    const map = Object.fromEntries([...GROUPS, "Other"].map((g) => [g, []]));
    for (const ex of state.exercises) {
      const g = ex.group && GROUPS.includes(ex.group) ? ex.group : "Other";
      map[g].push(ex);
    }
    return map;
  }, [state.exercises, GROUPS]);

  const filtered = search.trim()
    ? state.exercises.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    : null;

  const openCreate = (group) => {
    setEditing(null);
    setTargetGroup(group || GROUPS[0] || "Other");
    setForm({ name: "", sets: "3", reps: "10", link: "" });
    setModalOpen(true);
  };
  const openEdit = (ex) => {
    setEditing(ex);
    setTargetGroup(ex.group || GROUPS[0] || "Other");
    setForm({
      name: ex.name || "",
      sets: String(ex.sets ?? 3),
      reps: String(ex.reps ?? 10),
      link: ex.link || "",
    });
    setModalOpen(true);
  };
  const saveCreate = () => {
    const name = form.name.trim();
    if (!name) return alert("Please enter a name.");
    addExercise();
    const newEx = state.exercises[state.exercises.length - 1];
    if (!newEx) return;
    updateExercise(newEx.id, {
      name,
      group: targetGroup,
      sets: Math.max(1, Number(form.sets || 1)),
      reps: Math.max(1, Number(form.reps || 1)),
      link: form.link.trim(),
    });
    setModalOpen(false);
    if (isSelectMode && addToDay) {
      addExerciseToDay(addToDay, newEx.id);
      navigate("/plan");
    }
  };
  const saveEdit = () => {
    if (!editing) return;
    updateExercise(editing.id, {
      name: form.name.trim(),
      group: targetGroup,
      sets: Math.max(1, Number(form.sets || 1)),
      reps: Math.max(1, Number(form.reps || 1)),
      link: form.link.trim(),
    });
    setModalOpen(false);
  };
  const pickForDay = (id) => {
    if (!isSelectMode || !addToDay) return;
    addExerciseToDay(addToDay, id);
    navigate("/plan");
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="text-neutral-400 text-sm">Manage exercises by muscle group</div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="search-input"
        />
        {!isSelectMode && (
          <button className="add-exercise-main" onClick={() => openCreate(GROUPS[0] || "Other")}>
            <PlusIcon /><span>Add Exercise</span>
          </button>
        )}
      </div>

      {/* Search results */}
      {filtered ? (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="muted text-sm">No matches.</div>
          ) : (
            filtered.map((ex) => (
              <div key={ex.id} className="group-row">
                <button
                  className="name text-body"
                  onClick={() => (isSelectMode ? pickForDay(ex.id) : openEdit(ex))}
                >
                  {ex.name} <span className="muted text-xs">({ex.group || "Other"})</span>
                </button>
                {!isSelectMode && (
                  <button className="icon-btn ghost" onClick={() => removeExercise(ex.id)} title="Delete">
                    <TrashIcon />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {[...GROUPS, "Other"].map((group) => (
            <Accordion
              key={group}
              id={group}
              defaultOpen={false}
              /* group header is flat, no plus button here */
              header={
                <div className="group-row">
                  <div className="title">{group}</div>
                  <div className="right">
                    <div className="muted text-xs">{grouped[group]?.length || 0}</div>
                    <div className="chev">›</div>
                  </div>
                </div>
              }
            >
              {grouped[group]?.length ? (
                <div className="space-y-2">
                  {grouped[group].map((ex) => (
                    <div key={ex.id} className="group-row">
                      <button
                        className="name text-body"
                        onClick={() => (isSelectMode ? pickForDay(ex.id) : openEdit(ex))}
                      >
                        {ex.name}
                      </button>
                      {!isSelectMode && (
                        <button className="icon-btn ghost" onClick={() => removeExercise(ex.id)} title="Delete">
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isSelectMode && (
                    <div>
                      <button className="rounded-button" onClick={() => openCreate(group)}>
                        <PlusIcon /> <span style={{ marginLeft: 6 }}>Add to {group}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="muted text-sm">No exercises in {group} yet.</div>
              )}
            </Accordion>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editing ? "Edit" : "Add"} Exercise${editing ? "" : targetGroup ? ` to ${targetGroup}` : ""}`}
        actions={
          <>
            <button className="px-4 py-2 rounded-button bg-brand-primary text-black" onClick={editing ? saveEdit : saveCreate}>
              {editing ? "Save" : isSelectMode ? "Create & Add" : "Create"}
            </button>
            <button className="px-4 py-2 rounded-button" onClick={() => setModalOpen(false)}>Cancel</button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-label mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Incline Chest Press"
              className="w-full rounded-card bg-brand-input px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-label mb-1">Group</label>
              <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)} className="w-full rounded-card bg-brand-input px-3 py-2">
                {[...GROUPS, "Other"].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-label mb-1">Sets</label>
              <input inputMode="numeric" value={form.sets} onChange={(e) => setForm((f) => ({ ...f, sets: e.target.value }))} className="w-full rounded-card bg-brand-input px-3 py-2" placeholder="3" />
            </div>
            <div>
              <label className="block text-label mb-1">Reps</label>
              <input inputMode="numeric" value={form.reps} onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))} className="w-full rounded-card bg-brand-input px-3 py-2" placeholder="10" />
            </div>
          </div>
          <div>
            <label className="block text-label mb-1">YouTube link (optional)</label>
            <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} className="w-full rounded-card bg-brand-input px-3 py-2" placeholder="https://www.youtube.com/watch?v=..." />
          </div>
        </div>
      </Modal>
    </div>
  );
}
