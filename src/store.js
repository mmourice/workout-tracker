// src/store.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LS_KEY = 'workout_tracker_local_v1'
const uid = () => Math.random().toString(36).slice(2,9)

const defaultExercises = [
  { id: uid(), name: 'Incline Chest Press', link: 'https://www.youtube.com/watch?v=SrqOu55lrYU', sets: 4, reps: 10 },
  { id: uid(), name: 'Seated Cable Row',  link: 'https://www.youtube.com/watch?v=GZbfZ033f74', sets: 4, reps: 10 },
  { id: uid(), name: 'Lateral Raises',     link: 'https://www.youtube.com/watch?v=kDqklk1ZESo', sets: 3, reps: 12 },
]

const defaultState = {
  units: 'kg',
  exercises: defaultExercises,
  plan: { days: [{ id: uid(), name: 'Upper', exerciseIds: defaultExercises.map(e=>e.id) }] },
  logs: []
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(defaultState)

  // Load once from localStorage
  useEffect(()=>{
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setState(JSON.parse(raw))
    } catch {}
  },[])

  // Persist on every change
  useEffect(()=>{
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state))
    } catch {}
  },[state])

  const exerciseMap = useMemo(
    () => Object.fromEntries(state.exercises.map(e => [e.id, e])),
    [state.exercises]
  )

  function saveSession(session){
    const log = {
      id: uid(),
      dateISO: session.dateISO,
      dayId: session.dayId,
      entries: session.entries.map(e => ({
        exerciseId: e.exerciseId,
        weights: e.weights.map(w => Number(w) || 0)
      })),
    }
    setState(s => ({ ...s, logs: [...s.logs, log] }))
  }

  return (
    <Ctx.Provider value={{ state, setState, exerciseMap, uid, saveSession }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStore(){ return useContext(Ctx) }
