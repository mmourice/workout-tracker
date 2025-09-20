import React from 'react'
import { useStore } from '../store'

export default function Plan(){
  const { state, setState, exerciseMap, uid } = useStore()

  function addDay(){ const d={id:uid(),name:'New Day',exerciseIds:[]}; setState(s=>({...s,plan:{...s.plan,days:[...s.plan.days,d]}})) }
  function updateDay(id,patch){ setState(s=>({...s,plan:{...s.plan,days:s.plan.days.map(d=>d.id===id?{...d,...patch}:d)}})) }
  function removeDay(id){ setState(s=>({...s,plan:{...s.plan,days:s.plan.days.filter(d=>d.id!==id)}})) }
  function addExerciseToDay(dayId, exId){ setState(s=>({...s,plan:{...s.plan,days:s.plan.days.map(d=>d.id===dayId&&!d.exerciseIds.includes(exId)?{...d,exerciseIds:[...d.exerciseIds,exId]}:d)}})) }
  function removeExerciseFromDay(dayId, exId){ setState(s=>({...s,plan:{...s.plan,days:s.plan.days.map(d=>d.id===dayId?{...d,exerciseIds:d.exerciseIds.filter(x=>x!==exId)}:d)}})) }

  return (
    <div className="space-y-3">
      <button className="px-4 py-2 rounded-button border border-brand-border" onClick={addDay}>Add Day</button>
      {state.plan.days.map(d=>(
        <div key={d.id} className="border border-brand-border rounded-card p-4 bg-brand-card space-y-2">
          <label className="text-label text-brand-accent">Day name</label>
          <input value={d.name} onChange={e=>updateDay(d.id,{name:e.target.value})}
            className="w-full rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body font-mont text-white"/>
          <div className="text-label text-brand-accent mt-2">Exercises</div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {d.exerciseIds.map(eid=>(
              <div key={eid} className="flex items-center bg-brand-input border border-brand-border rounded-full px-3 py-1 gap-2">
                <span>{exerciseMap[eid]?.name || '(missing)'}</span>
                <button onClick={()=>removeExerciseFromDay(d.id,eid)} className="text-neutral-400">✕</button>
              </div>
            ))}
          </div>
          <div className="text-label text-brand-accent mt-2">Add exercise</div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {state.exercises.filter(e=>!d.exerciseIds.includes(e.id)).map(e=>(
              <button key={e.id} onClick={()=>addExerciseToDay(d.id,e.id)} className="px-3 py-1 rounded-button border border-brand-border">{e.name}</button>
            ))}
          </div>
          <div className="mt-2"><button className="px-4 py-2 rounded-button" onClick={()=>removeDay(d.id)}>Delete Day</button></div>
        </div>
      ))}
    </div>
  )
}
