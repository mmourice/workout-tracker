// src/store.js
// Single source of truth + safe load/save + migrations

export const LS_KEY = "workout-tracker:v3";

// Canonical groups (same order as UI)
export const GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Legs",
  "Arms",
  "Core",
  "Cardio",
  "Other",
];

const uid = () => Math.random().toString(36).slice(2, 9);

export const DEFAULT_EXERCISES = [
  { id: uid(), name: "Incline Chest Press", group: "Chest", sets: 4, reps: 10, link: "" },
  { id: uid(), name: "Seated Cable Row", group: "Back", sets: 4, reps: 10, link: "" },
  { id: uid(), name: "Lateral Raises", group: "Shoulders", sets: 3, reps: 12, link: "" },
];

export const DEFAULT_STATE = {
  units: "kg",
  restSec: 90,
  exercises: DEFAULT_EXERCISES,
  plan: {
    days: [
      { id: uid(), name: "Upper A", exerciseIds: DEFAULT_EXERCISES.map(e => e.id) },
      { id: uid(), name: "Upper B", exerciseIds: [] },
      { id: uid(), name: "Lower",  exerciseIds: [] },
      { id: uid(), name: "Full Body", exerciseIds: [] },
    ],
  },
  logs: [], // {id,dateISO,dayId,entries:[{exerciseId, sets:[{w,r}]}]}
};

// ----- Migration helpers -----
function coerceExercise(e) {
  return {
    id: e.id || uid(),
    name: typeof e.name === "string" ? e.name : "Exercise",
    group: GROUPS.includes(e.group) ? e.group : "Other",
    sets: Number.isFinite(e.sets) ? e.sets : 3,
    reps: Number.isFinite(e.reps) ? e.reps : 10,
    link: typeof e.link === "string" ? e.link : "",
  };
}

function coerceDay(d) {
  return {
    id: d.id || uid(),
    name: typeof d.name === "string" ? d.name : "Day",
    exerciseIds: Array.isArray(d.exerciseIds) ? d.exerciseIds.filter(Boolean) : [],
  };
}

function migrate(raw) {
  // v1/v2 → v3 shape
  const s = { ...DEFAULT_STATE, ...(raw || {}) };

  s.units = s.units === "lb" ? "lb" : "kg";
  s.restSec = Number.isFinite(s.restSec) ? s.restSec : 90;

  s.exercises = Array.isArray(s.exercises) ? s.exercises.map(coerceExercise) : DEFAULT_STATE.exercises;
  s.plan = s.plan && s.plan.days ? s : { ...s, plan: DEFAULT_STATE.plan };
  s.plan.days = s.plan.days.map(coerceDay);

  // Remove exerciseIds that don’t exist anymore
  const validIds = new Set(s.exercises.map(e => e.id));
  s.plan.days = s.plan.days.map(d => ({ ...d, exerciseIds: d.exerciseIds.filter(id => validIds.has(id)) }));

  // Coerce logs to new shape
  if (!Array.isArray(s.logs)) s.logs = [];
  s.logs = s.logs.map(l => ({
    id: l.id || uid(),
    dateISO: l.dateISO || new Date().toISOString(),
    dayId: l.dayId || (s.plan.days[0]?.id ?? ""),
    entries: Array.isArray(l.entries)
      ? l.entries.map(en => ({
          exerciseId: en.exerciseId,
          sets: Array.isArray(en.sets)
            ? en.sets.map(x => ({ w: Number(x.w) || 0, r: Number(x.r) || 0 }))
            // backward compat: weights-only arrays
            : Array.isArray(en.weights)
              ? en.weights.map(v => ({ w: Number(v) || 0, r: 0 }))
              : [],
        }))
      : [],
  }));

  return s;
}

// ----- Public API -----
export function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return migrate(parsed);
  } catch (e) {
    console.warn("State load failed, using defaults:", e);
    return DEFAULT_STATE;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("State save failed:", e);
  }
}

// small in-memory store (no Redux)
let _state = loadState();
const listeners = new Set();

export function getState() { return _state; }
export function setState(updater) {
  _state = typeof updater === "function" ? updater(_state) : updater;
  saveState(_state);
  listeners.forEach(fn => fn(_state));
}
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// Utilities
export function byIdMap(arr) { return Object.fromEntries(arr.map(x => [x.id, x])); }
export function newLogFromDay(day, exercises, restSec) {
  const map = byIdMap(exercises);
  return {
    id: uid(),
    dateISO: new Date().toISOString(),
    dayId: day.id,
    entries: day.exerciseIds.map(eid => {
      const ex = map[eid];
      const sets = Array.from({ length: ex?.sets ?? 3 }, () => ({ w: 0, r: ex?.reps ?? 10 }));
      return { exerciseId: eid, sets };
    }),
    restSec: Number.isFinite(restSec) ? restSec : 90,
  };
}
