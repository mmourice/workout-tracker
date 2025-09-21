import React, { useMemo, useState } from "react";
import { useStore } from "../store.jsx";
import { TrashIcon, PlusIcon } from "../Icons.jsx";
import Modal from "../components/Modal.jsx";
import Accordion from "../components/Accordion.jsx";
import { useLocation, useNavigate } from "react-router-dom";

const useQuery = () => new URLSearchParams(useLocation().search);

export default function Exercises() {
  const {
    state, GROUPS,
    addExercise, updateExercise, removeExercise,
    addExerciseToDay
  } = useStore();

  const q = useQuery();
  const navigate = useNavigate();
  const addToDay = q.get("addToDay");
  const isSelectMode = Boolean(addToDay);

  const [search, setSearch] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [targetGroup, setTargetGroup] = useState("Other");
  const [form, setForm] = useState({ name: "", sets: "3", reps: "10", link: "" });

  const grouped = useMemo(() => {
    const map = Object.fromEntries(GROUPS.map(g => [g, []]));
    for (const ex of state.exercises) {
      const g = ex.group && GROUPS.includes(ex.group) ? ex.group : "Other";
      map[g].push(ex);
    }
    return map;
  }, [state.exercises, GROUPS]);

  const filtered = search.trim()
    ? state.exercises.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    : null;

  const openCreate = (group) => {
    setEditing(null);
    setTargetGroup(group);
    setForm({ name: "", sets: "3", reps: "10", link: "" });
    setModalOpen(true);
  };
  const openEdit = (ex) => {
    setEditing(ex);
    setTargetGroup(ex.group || "Other");
    setForm({
      name: ex.name || "",
      sets: String(ex.sets ?? 3),
      reps: String(ex.reps ?? 10),
      link: ex.link || "",
    });
    setModalOpen(true);
  };
  const saveCreate = () => {
    if (!form.name.trim()) return alert("Please enter a name.");
    addExercise();
    const newEx = state.exercises[state.exercises.length - 1];
    if (!newEx) return;
    updateExercise(newEx.id, {
      name: form.name.trim(),
      group: targetGroup,
      sets: Math.max(1, Number(form.sets || 1)),
      reps: Math.max(1, Number(form.reps || 1)),
      link: form.link.trim(),
    });
    if (isSelectMode && addToDay) {
      addExerciseToDay(addToDay, newEx.id);
      setModalOpen(false);
      navigate("/plan");
      return;
    }
    setModalOpen(false);
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
  const pickExistingForDay = (exId) => {
    if (!isSelectMode) return;
    addExerciseToDay(addToDay, exId);
    navigate("/plan");
  };

  return (
    <div className="space-y-5">
      {/* Subtitle + search + main Add */}
      <div className="space-y-2">
        <div className="text-neutral-400 text-sm">Manage exercises by muscle group</div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
        />
        {!isSelectMode && (
          <button className="px-4 py-2 rounded-button bg-brand-primary text-black flex items-center gap-2"
                  onClick={() => openCreate("Other")}>
            <PlusIcon /> <span>Add Exercise</span>
          </button>
        )}
      </div>

      {/* Search results OR grouped accordions */}
      {filtered ? (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-neutral-500 text-sm">No matches.</div>
          ) : filtered.map(ex => (
            <div key={ex.id}
                 className="flex items-center justify-between rounded-card border border-brand-border bg-brand-input px-3 py-2">
              <button
                className="text-left text-body underline decoration-brand-accent underline-offset-2"
                onClick={() => (isSelectMode ? pickExistingForDay(ex.id) : openEdit(ex))}
              >
                {ex.name} <span className="text-xs opacity-60">({ex.group || "Other"})</span>
              </button>
              {!isSelectMode && (
                <button className="icon-btn" onClick={() => removeExercise(ex.id)} aria-label="Delete">
                  <TrashIcon />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Accordions shrink long pages dramatically
        <div className="space-y-3">
          {GROUPS.map(group => (
            <Accordion
              key={group}
              id={group}
              title={group}
              defaultOpen={false}
              rightActions={
                <button className="icon-btn" onClick={(e) => { e.stopPropagation(); openCreate(group); }} aria-label={`Add ${group}`}>
                  <PlusIcon />
                </button>
              }
            >
              {grouped[group].length === 0 ? (
                <div className="text-neutral-500 text-sm">No exercises in {group} yet.</div>
              ) : (
                <div className="space-y-2">
                  {grouped[group].map(ex => (
                    <div key={ex.id}
                         className="flex items-center justify-between rounded-card border border-brand-border bg-brand-input px-3 py-2">
                      <button
                        className="text-left text-body underline decoration-brand-accent underline-offset-2"
                        onClick={() => (isSelectMode ? pickExistingForDay(ex.id) : openEdit(ex))}
                      >
                        {ex.name}
                      </button>
                      {!isSelectMode && (
                        <button className="icon-btn" onClick={() => removeExercise(ex.id)} aria-label="Delete">
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Accordion>
          ))}
        </div>
      )}

      {/* Modal for create/edit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Exercise" : `Add Exercise to ${targetGroup}`}
        actions={
          <>
            <button
              className="px-4 py-2 rounded-button bg-brand-primary text-black"
              onClick={editing ? saveEdit : saveCreate}
            >
              {editing ? "Save" : isSelectMode ? "Create & Add to Day" : "Create"}
            </button>
            <button className="px-4 py-2 rounded-button border border-brand-border"
                    onClick={() => setModalOpen(false)}>
              Cancel
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-label text-brand-accent mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
              placeholder="e.g., Incline Chest Press"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-label text-brand-accent mb-1">Group</label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
              >
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-label text-brand-accent mb-1">Sets</label>
              <input
                inputMode="numeric"
                value={form.sets}
                onChange={(e) => setForm(f => ({ ...f, sets: e.target.value }))}
                className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
                placeholder="3"
              />
            </div>
            <div>
              <label className="block text-label text-brand-accent mb-1">Reps</label>
              <input
                inputMode="numeric"
                value={form.reps}
                onChange={(e) => setForm(f => ({ ...f, reps: e.target.value }))}
                className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
                placeholder="10"
              />
            </div>
          </div>
          <div>
            <label className="block text-label text-brand-accent mb-1">YouTube link (optional)</label>
            <input
              value={form.link}
              onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))}
              className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
