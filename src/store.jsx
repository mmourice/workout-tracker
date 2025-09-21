import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// --- Local storage key
const LS_KEY = "workout_tracker_state_v3";

// --- Helpers
const uid = () => Math.random().toString(36).slice(2, 9);

const GROUPS = ["Chest","Back","Shoulders","Legs","Arms","Core","Cardio","Other"];

// --- Defaults
const defaultExercises = [
  { id: uid(), name: "Incline Chest Press", group: "Chest", sets: 4, reps: 10, link: "" },
  { id: uid(), name: "Seated Cable Row", group: "Back", sets: 4, reps: 10, link: "" },
  { id: uid(), name: "Lateral Raises", group: "Shoulders", sets: 3, reps: 12, link: "" },
];

const defaultState = {
  units: "kg",
  exercises: defaultExercises,
  plan: {
    days: [
      { id: uid(), name: "Upper A", exerciseIds: [defaultExercises[0].id, defaultExercises[1].id, defaultExercises[2].id] },
      { id: uid(), name: "Upper B", exerciseIds: [] },
      { id: uid(), name: "Lower",  exerciseIds: [] },
      { id: uid(), name: "Full Body", exerciseIds: [] },
    ],
  },
  logs: [], // {id, dateISO, dayId, entries:[{exerciseId, sets:[{weight, reps}]}]}
};

// --- Load & save
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    // Tiny migrations/guards
    parsed.units = parsed.units || "kg";
    parsed.plan ||= { days: [] };
    parsed.logs ||= [];
    parsed.exercises ||= [];
    return parsed;
  } catch {
    return defaultState;
  }
}
function save(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}

// --- Context
const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => { setState(load()); setReady(true); }, []);
  useEffect(() => { if (ready) save(state); }, [state, ready]);

  // --- Exercise CRUD
  const addExercise = () => {
    const ex = { id: uid(), name: "New Exercise", group: "Other", sets: 3, reps: 10, link: "" };
    setState(s => ({ ...s, exercises: [...s.exercises, ex] }));
  };
  const updateExercise = (id, patch) => {
    setState(s => ({ ...s, exercises: s.exercises.map(e => (e.id === id ? { ...e, ...patch } : e)) }));
  };
  const removeExercise = (id) => {
    setState(s => ({
      ...s,
      exercises: s.exercises.filter(e => e.id !== id),
      plan: { ...s.plan, days: s.plan.days.map(d => ({ ...d, exerciseIds: d.exerciseIds.filter(x => x !== id) })) },
      logs: s.logs.map(l => ({ ...l, entries: l.entries.filter(en => en.exerciseId !== id) })),
    }));
  };

  // --- Plan CRUD
  const addDay = () => {
    const d = { id: uid(), name: "New Day", exerciseIds: [] };
    setState(s => ({ ...s, plan: { ...s.plan, days: [...s.plan.days, d] } }));
  };
  const updateDay = (id, patch) => {
    setState(s => ({ ...s, plan: { ...s.plan, days: s.plan.days.map(d => (d.id === id ? { ...d, ...patch } : d)) } }));
  };
  const removeDay = (id) => {
    setState(s => ({ ...s, plan: { ...s.plan, days: s.plan.days.filter(d => d.id !== id) } }));
  };
  const addExerciseToDay = (dayId, exId) => {
    setState(s => ({
      ...s,
      plan: { ...s.plan, days: s.plan.days.map(d => (d.id === dayId && !d.exerciseIds.includes(exId) ? { ...d, exerciseIds: [...d.exerciseIds, exId] } : d)) },
    }));
  };
  const removeExerciseFromDay = (dayId, exId) => {
    setState(s => ({
      ...s,
      plan: { ...s.plan, days: s.plan.days.map(d => (d.id === dayId ? { ...d, exerciseIds: d.exerciseIds.filter(x => x !== exId) } : d)) },
    }));
  };

  // --- Session helpers
  function findLastEntry(logs, exId) {
    for (let i = logs.length - 1; i >= 0; i--) {
      const en = logs[i].entries.find(e => e.exerciseId === exId);
      if (en) return en;
    }
    return null;
  }

  // Build a prefilled session for a day (weights from last time)
  const buildSessionForDay = (dayId) => {
    const day = state.plan.days.find(d => d.id === dayId) || state.plan.days[0];
    if (!day) return null;
    const entries = day.exerciseIds.map(eid => {
      const ex = state.exercises.find(e => e.id === eid);
      const last = findLastEntry(state.logs, eid);
      const setsCount = ex?.sets || 3;
      const sets = Array.from({ length: setsCount }, (_, i) => {
        const w = last?.sets?.[i]?.weight ?? last?.sets?.[last?.sets?.length - 1]?.weight ?? 0;
        const r = last?.sets?.[i]?.reps   ?? ex?.reps ?? 10;
        return { weight: String(w), reps: String(r) };
      });
      return { exerciseId: eid, sets };
    });
    return { dayId: day.id, dateISO: new Date().toISOString(), entries };
  };

  const saveSession = (session) => {
    const clean = {
      id: uid(),
      dateISO: session.dateISO,
      dayId: session.dayId,
      entries: session.entries.map(e => ({
        exerciseId: e.exerciseId,
        sets: e.sets.map(s => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 })),
      })),
    };
    setState(s => ({ ...s, logs: [...s.logs, clean] }));
  };

  const exerciseMap = useMemo(() => Object.fromEntries(state.exercises.map(e => [e.id, e])), [state.exercises]);

  const api = {
    state, ready, GROUPS,
    // plan + exercises
    addExercise, updateExercise, removeExercise,
    addDay, updateDay, removeDay,
    addExerciseToDay, removeExerciseFromDay,
    // session
    buildSessionForDay, saveSession,
    // utils
    exerciseMap,
    setUnits: (u) => setState(s => ({ ...s, units: u })),
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
