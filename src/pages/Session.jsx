import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store.jsx'

const NumInput = (props) => (
  <input
    {...props}
    inputMode="decimal"
    className={'w-20 rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body text-white ' + (props.className||'')}
  />
)

export default function Session(){
  const { state, exerciseMap, saveSession } = useStore()
  const [selectedDayId, setSelectedDayId] = useState(state.plan.days[0]?.id || null)
  const day = useMemo(()=>state.plan.days.find(d=>d.id===selectedDayId)||state.plan.days[0],[state.plan.days,selectedDayId])

  const [session, setSession] = useState(null)

  // Prefill from last log
  useEffect(()=>{
    if (!day) return
    const entries = day.exerciseIds.map(eid=>{
      const ex = exerciseMap[eid]
      const lastEntry = [...state.logs].reverse().map(l=>l.entries.find(e=>e.exerciseId===eid)).find(Boolean)
      const sets = ex?.sets || 3
      const weights = Array.from({length: sets}, (_,i)=>{
        if (lastEntry && lastEntry.weights[i]!=null) return String(lastEntry.weights[i])
        if (lastEntry && lastEntry.weights.length)   return String(lastEntry.weights.at(-1))
        return '0'
      })
      const reps = Array.from({length: sets}, (_,i)=>{
        if (lastEntry && lastEntry.reps && lastEntry.reps[i]!=null) return String(lastEntry.reps[i])
        return String(ex?.reps || 10)
      })
      return { exerciseId: eid, weights, reps }
    })
    setSession({ dayId: day.id, dateISO: new Date().toISOString(), entries })
  }, [day, state.logs, exerciseMap])

  if (!day) return <p className="text-brand-accent">Create a day in Plan first.</p>

  return (
    <div className="space-y-3">
      {/* Day picker */}
      <div className="flex items-center gap-2">
        <span className="text-label text-brand-accent">Pick day</span>
        <div className="flex flex-wrap gap-2">
          {state.plan.days.map(d=>(
            <button key={d.id} onClick={()=>setSelectedDayId(d.id)}
              className={'px-3 py-1 rounded-chip border ' + (d.id===day.id ? 'bg-brand-primary text-black border-brand-primary' : 'bg-transparent text-white border-brand-border')}>
              <span className="text-label">{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded-button border border-brand-border flex items-center gap-2"
          onClick={()=>setSession(s=>({...s}))}
          title="Copy last is already the default prefill"
        >
          ⤴︎ Copy last
        </button>
        <button
          className="px-4 py-2 rounded-button border border-brand-border"
          onClick={()=>setSession(s=>({...s, entries: s.entries.map(e=>({...e, weights:e.weights.map(()=> '0'), reps:e.reps.map(()=> String( (exerciseMap[e.exerciseId]?.reps) || 10 ))}))}))}
        >
          Clear
        </button>
        <button className="px-4 py-2 rounded-button bg-brand-primary text-black" onClick={()=>{ saveSession(session); alert('Saved. Great work.') }}>
          Save Session
        </button>
      </div>

      {/* Exercise cards */}
      {day.exerciseIds.map(eid=>{
        const ex = exerciseMap[eid]
        const idx = session?.entries.findIndex(en=>en.exerciseId===eid) ?? -1
        const entry = idx>=0 ? session.entries[idx] : null
        if (!ex || !entry) return null
        return (
          <div key={eid} className="border border-brand-border rounded-card p-4 bg-brand-card space-y-2">
            <div className="flex justify-between">
              <div className="font-bold">{ex.name} <span className="text-brand-accent">({ex.sets} x {ex.reps})</span></div>
              {ex.link ? <a href={ex.link} target="_blank" className="underline text-brand-accent">How-to ↗</a> : <span className="text-neutral-400">No link</span>}
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {entry.weights.map((w,i)=>(
                <div key={i} className="rounded-card border border-brand-border bg-brand-input p-2 shrink-0">
                  <div className="text-label text-brand-accent mb-1">Set {i+1}</div>
                  <div className="flex gap-2">
                    <NumInput
                      value={entry.weights[i]}
                      onChange={e=>{
                        const v = e.target.value
                        setSession(s=>{ const c = structuredClone(s); c.entries[idx].weights[i]=v; return c })
                      }}
                      placeholder={`0 ${state.units}`}
                    />
                    <NumInput
                      value={entry.reps[i]}
                      onChange={e=>{
                        const v = e.target.value
                        setSession(s=>{ const c = structuredClone(s); c.entries[idx].reps[i]=v; return c })
                      }}
                      placeholder="reps"
                      className="w-16"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
