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
  logs: [] // each log: {dateISO, dayId, entries:[{exerciseId, weights:number[], reps:number[]}]}
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(defaultState)

  useEffect(()=>{ const raw = localStorage.getItem(LS_KEY); if (raw) setState(JSON.parse(raw)) },[])
  useEffect(()=>{ localStorage.setItem(LS_KEY, JSON.stringify(state)) },[state])

  const exerciseMap = useMemo(()=>Object.fromEntries(state.exercises.map(e=>[e.id, e])),[state.exercises])

  // -------- Session ----------
  function saveSession(session){
    const log = {
      id: uid(),
      dateISO: session.dateISO,
      dayId: session.dayId,
      entries: session.entries.map(e => ({
        exerciseId: e.exerciseId,
        weights: e.weights.map(w => Number(w) || 0),
        reps:    e.reps.map(r => Number(r) || 0),
      })),
    }
    setState(s => ({ ...s, logs: [...s.logs, log] }))
  }

  // -------- Plan helpers ----------
  function addDay(){ const d={id:uid(), name:'New Day', exerciseIds:[]}; setState(s=>({...s, plan:{...s.plan, days:[...s.plan.days, d]}})) }
  function updateDay(id, patch){ setState(s=>({...s, plan:{...s.plan, days:s.plan.days.map(d=>d.id===id?{...d, ...patch}:d)}})) }
  function removeDay(id){ setState(s=>({...s, plan:{...s.plan, days:s.plan.days.filter(d=>d.id!==id)}})) }
  function addExerciseToDay(dayId, exId){ setState(s=>({...s, plan:{...s.plan, days:s.plan.days.map(d=>d.id===dayId && !d.exerciseIds.includes(exId)?{...d, exerciseIds:[...d.exerciseIds, exId]}:d)}})) }
  function removeExerciseFromDay(dayId, exId){ setState(s=>({...s, plan:{...s.plan, days:s.plan.days.map(d=>d.id===dayId?{...d, exerciseIds:d.exerciseIds.filter(x=>x!==exId)}:d)}})) }

  // -------- Exercises helpers ----------
  function addExercise(){ setState(s=>({...s, exercises:[...s.exercises, {id:uid(), name:'New Exercise', link:'', sets:3, reps:10}]})) }
  function updateExercise(id, patch){ setState(s=>({...s, exercises:s.exercises.map(e=>e.id===id?{...e, ...patch}:e)})) }
  function removeExercise(id){
    setState(s=>({
      ...s,
      exercises: s.exercises.filter(e=>e.id!==id),
      plan: { ...s.plan, days: s.plan.days.map(d=>({...d, exerciseIds:d.exerciseIds.filter(x=>x!==id)})) },
      logs: s.logs.map(l=>({ ...l, entries: l.entries.filter(en=>en.exerciseId!==id) }))
    }))
  }

  return (
    <Ctx.Provider value={{
      state, setState, exerciseMap, uid, saveSession,
      addDay, updateDay, removeDay, addExerciseToDay, removeExerciseFromDay,
      addExercise, updateExercise, removeExercise
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStore(){ return useContext(Ctx) }
