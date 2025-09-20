import React from 'react'
import { useStore } from '../store.jsx'

export default function Exercises(){
  const { state, setState, uid } = useStore()

  function addExercise(){ setState(s=>({...s,exercises:[...s.exercises,{id:uid(),name:'New Exercise',link:'',sets:3,reps:10}]})) }
  function updateExercise(id,patch){ setState(s=>({...s,exercises:s.exercises.map(e=>e.id===id?{...e,...patch}:e)})) }
  function removeExercise(id){
    setState(s=>({
      ...s,
      exercises: s.exercises.filter(e=>e.id!==id),
      plan: { ...s.plan, days: s.plan.days.map(d=>({...d,exerciseIds:d.exerciseIds.filter(x=>x!==id)})) },
      logs: s.logs.map(l=>({ ...l, entries: l.entries.filter(en=>en.exerciseId!==id) }))
    }))
  }

  return (
    <div className="space-y-3">
      <button className="px-4 py-2 rounded-button bg-brand-primary text-black" onClick={addExercise}>Add Exercise</button>
      {state.exercises.map(ex=>(
        <div key={ex.id} className="border border-brand-border rounded-card p-4 bg-brand-card space-y-2">
          <label className="text-label text-brand-accent">Name</label>
          <input value={ex.name} onChange={e=>updateExercise(ex.id,{name:e.target.value})}
            className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body font-mont text-white"/>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-label text-brand-accent">Sets</label>
              <input value={String(ex.sets)} onChange={e=>updateExercise(ex.id,{sets:Math.max(1,Number(e.target.value||1))})}
                inputMode="numeric" className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body font-mont text-white"/>
            </div>
            <div>
              <label className="text-label text-brand-accent">Reps</label>
              <input value={String(ex.reps)} onChange={e=>updateExercise(ex.id,{reps:Math.max(1,Number(e.target.value||1))})}
                inputMode="numeric" className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body font-mont text-white"/>
            </div>
          </div>
          <label className="text-label text-brand-accent">YouTube link (optional)</label>
          <input value={ex.link} onChange={e=>updateExercise(ex.id,{link:e.target.value})}
            placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body font-mont text-white"/>
          <div className="flex justify-between items-center">
            {ex.link ? <a href={ex.link} target="_blank" className="underline text-brand-accent">Test link ↗</a> : <span className="text-neutral-400">Add a link to preview</span>}
            <button className="px-4 py-2 rounded-button" onClick={()=>removeExercise(ex.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}
