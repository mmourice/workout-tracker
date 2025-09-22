// src/store.jsx
import React from "react";

/** ---------- Constants / Defaults ---------- */
const LS_KEY = "workout-tracker:v3";

export const GROUPS = [
  "Chest", "Back", "Shoulders", "Legs", "Arms", "Core", "Cardio", "Other",
];

const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_EXERCISES = [
  { id: uid(), name: "Incline Chest Press", group: "Chest", sets: 4, reps: 10, link: "" },
  { id: uid(), name: "Seated Cable Row",    group: "Back",  sets: 4, reps: 10, link: "" },
  { id: uid(), name: "Lateral Raises",       group: "Shoulders", sets: 3, reps: 12, link: "" },
];

const DEFAULT_STATE = {
  units: "kg",
  restSec: 90,
  exercises: DEFAULT_EXERCISES,
  plan: {
    days: [
      { id: uid(), name: "Upper A",  exerciseIds: DEFAULT_EXERCISES.map(e => e.id) },
      { id: uid(), name: "Upper B",  exerciseIds: [] },
      { id: uid(), name: "Lower",    exerciseIds: [] },
      { id: uid(), name: "Full Body",exerciseIds: [] },
    ],
  },
  // logs: {id, dateISO, dayId, entries:[{exerciseId, weights:number[], reps:number[]}]}
  logs: [],
};

/** ---------- Storage (with safe migration) ---------- */
function migrate(raw) {
  const s = { ...DEFAULT_STATE, ...(raw || {}) };

  // units / rest
  s.units = s.units === "lb" ? "lb" : "kg";
  s.restSec = Number.isFinite(+s.restSec) ? +s.restSec : 90;

  // exercises
  s.exercises = Array.isArray(s.exercises) ? s.exercises.map(e => ({
    id: e.id || uid(),
    name: typeof e.name === "string" ? e.name : "Exercise",
    group: GROUPS.includes(e.group) ? e.group : "Other",
    sets: Number.isFinite(+e.sets) ? +e.sets : 3,
    reps: Number.isFinite(+e.reps) ? +e.reps : 10,
    link: typeof e.link === "string" ? e.link : "",
  })) : DEFAULT_STATE.exercises;

  // plan
  s.plan = s.plan && Array.isArray(s.plan.days) ? s.plan : DEFAULT_STATE.plan;
  s.plan.days = s.plan.days.map(d => ({
    id: d.id || uid(),
    name: typeof d.name === "string" ? d.name : "Day",
    exerciseIds: Array.isArray(d.exerciseIds) ? d.exerciseIds.filter(Boolean) : [],
  }));

  // remove invalid exerciseIds
  const validIds = new Set(s.exercises.map(e => e.id));
  s.plan.days = s.plan.days.map(d => ({ ...d, exerciseIds: d.exerciseIds.filter(id => validIds.has(id)) }));

  // logs (support old shapes)
  if (!Array.isArray(s.logs)) s.logs = [];
  s.logs = s.logs.map(l => {
    const entries = Array.isArray(l.entries) ? l.entries.map(en => {
      if (Array.isArray(en.sets)) {
        // new-ish shape stored as {sets:[{w,r}]}
        const weights = en.sets.map(x => Number(x.w) || 0);
        const reps    = en.sets.map(x => Number(x.r) || 0);
        return { exerciseId: en.exerciseId, weights, reps };
      }
      if (Array.isArray(en.weights) || Array.isArray(en.reps)) {
        return {
          exerciseId: en.exerciseId,
          weights: (en.weights || []).map(v => Number(v) || 0),
          reps: (en.reps || []).map(v => Number(v) || 0),
        };
      }
      return { exerciseId: en.exerciseId, weights: [], reps: [] };
    }) : [];
    return {
      id: l.id || uid(),
      dateISO: l.dateISO || new Date().toISOString(),
      dayId: l.dayId || (s.plan.days[0]?.id ?? ""),
      entries,
    };
  });

  return s;
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return migrate(parsed);
  } catch {
    return DEFAULT_STATE;
  }
}
function saveState(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}

/** ---------- Tiny store core (no external libs) ---------- */
let _state = loadState();
const listeners = new Set();
const notify = () => listeners.forEach(fn => fn(_state));

function setState(updater) {
  _state = typeof updater === "function" ? updater(_state) : updater;
  saveState(_state);
  notify();
}
function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
const byId = (arr) => Object.fromEntries(arr.map(x => [x.id, x]));

/** ---------- Helpers used by pages ---------- */
function exerciseMap() { return byId(_state.exercises); }

function addDay() {
  const d = { id: uid(), name: "New Day", exerciseIds: [] };
  setState(s => ({ ...s, plan: { ...s.plan, days: [...s.plan.days, d] } }));
  return d;
}
function updateDay(id, patch) {
  setState(s => ({ ...s, plan: { ...s.plan, days: s.plan.days.map(d => d.id === id ? { ...d, ...patch } : d) } }));
}
function removeDay(id) {
  setState(s => ({ ...s, plan: { ...s.plan, days: s.plan.days.filter(d => d.id !== id) } }));
}
function addExerciseToDay(dayId, exId) {
  setState(s => ({
    ...s,
    plan: {
      ...s.plan,
      days: s.plan.days.map(d => d.id === dayId
        ? { ...d, exerciseIds: d.exerciseIds.includes(exId) ? d.exerciseIds : [...d.exerciseIds, exId] }
        : d),
    },
  }));
}
function removeExerciseFromDay(dayId, exId) {
  setState(s => ({
    ...s,
    plan: {
      ...s.plan,
      days: s.plan.days.map(d => d.id === dayId
        ? { ...d, exerciseIds: d.exerciseIds.filter(x => x !== exId) }
        : d),
    },
  }));
}

function addExercise(init) {
  const ex = {
    id: uid(),
    name: init?.name || "New Exercise",
    group: GROUPS.includes(init?.group) ? init.group : "Other",
    sets: Number.isFinite(+init?.sets) ? +init.sets : 3,
    reps: Number.isFinite(+init?.reps) ? +init.reps : 10,
    link: init?.link || "",
  };
  setState(s => ({ ...s, exercises: [...s.exercises, ex] }));
  return ex;
}
function updateExercise(id, patch) {
  setState(s => ({ ...s, exercises: s.exercises.map(e => e.id === id ? { ...e, ...patch } : e) }));
}
function removeExercise(id) {
  setState(s => ({
    ...s,
    exercises: s.exercises.filter(e => e.id !== id),
    plan: { ...s.plan, days: s.plan.days.map(d => ({ ...d, exerciseIds: d.exerciseIds.filter(x => x !== id) })) },
    logs: s.logs.map(l => ({ ...l, entries: l.entries.filter(en => en.exerciseId !== id) })),
  }));
}

/** Build a session object for a day, prefilling from last log if present */
function buildSessionForDay(dayId, { copyLast = true } = {}) {
  const day = _state.plan.days.find(d => d.id === dayId);
  if (!day) return null;
  const map = exerciseMap();
  const entries = day.exerciseIds.map(eid => {
    const ex = map[eid];
    const last = findLastExerciseLog(eid);
    const setsCount = Number.isFinite(+ex?.sets) ? +ex.sets : 3;
    const sets = Array.from({ length: setsCount }, (_, i) => ({
      weight: copyLast ? (last?.weights?.[i] ?? last?.weights?.[last?.weights?.length - 1] ?? 0) : 0,
      reps:   copyLast ? (last?.reps?.[i]    ?? ex?.reps ?? 10) : (ex?.reps ?? 10),
    }));
    return { exerciseId: eid, sets };
  });
  return { dayId, dateISO: new Date().toISOString(), entries };
}

/** Save a built session into logs (weights/reps arrays for persistence) */
function saveSession(session) {
  if (!session) return;
  const log = {
    id: uid(),
    dateISO: session.dateISO || new Date().toISOString(),
    dayId: session.dayId,
    entries: session.entries.map(e => ({
      exerciseId: e.exerciseId,
      weights: e.sets.map(s => Number(s.weight) || 0),
      reps:    e.sets.map(s => Number(s.reps) || 0),
    })),
  };
  setState(s => ({ ...s, logs: [...s.logs, log] }));
  return log;
}

/** Simpler “addLog” used by the basic Session.jsx version */
function addLog(log) {
  const safe = {
    id: log.id || uid(),
    dateISO: log.dateISO || new Date().toISOString(),
    dayId: log.dayId || (_state.plan.days[0]?.id ?? ""),
    entries: Array.isArray(log.entries) ? log.entries.map(en => ({
      exerciseId: en.exerciseId,
      weights: (en.weights || []).map(v => Number(v) || 0),
      reps:    (en.reps    || []).map(v => Number(v) || 0),
    })) : [],
  };
  setState(s => ({ ...s, logs: [...s.logs, safe] }));
  return safe;
}

function deleteLog(logId) {
  setState(s => ({ ...s, logs: s.logs.filter(l => l.id !== logId) }));
}

function findLastExerciseLog(exerciseId) {
  for (let i = _state.logs.length - 1; i >= 0; i--) {
    const entry = _state.logs[i].entries.find(e => e.exerciseId === exerciseId);
    if (entry) return entry;
  }
  return null;
}

/** ---------- React hook: useStore() ---------- */
export function useStore() {
  const [snap, setSnap] = React.useState(_state);
  React.useEffect(() => subscribe(setSnap), []);
  const map = React.useMemo(() => exerciseMap(), [snap.exercises]);

  return {
    // raw state if you want it
    state: snap,
    // convenient fields (for simpler pages)
    plan: snap.plan.days,
    exercises: snap.exercises,
    logs: snap.logs,
    units: snap.units,
    exerciseMap: map,

    // constants
    GROUPS,

    // plan crud
    addDay, updateDay, removeDay,
    addExerciseToDay, removeExerciseFromDay,

    // exercises crud
    addExercise, updateExercise, removeExercise,

    // sessions / logs
    buildSessionForDay, saveSession, addLog, deleteLog, findLastExerciseLog,
  };
}

// Optional bootstrap logic lives here (migrations, hydration, analytics, etc.)
export function StoreProvider({ children }) {
  // Example: one-time bootstrap spot
  // React.useEffect(() => {
  //   // load/migrate persisted data, warm caches, attach global listeners, etc.
  // }, []);

  return <>{children}</>;
}
