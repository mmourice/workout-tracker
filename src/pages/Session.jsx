import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store.jsx'

const Input = (props) => (
  <input
    {...props}
    className={'w-20 rounded-card border border-brand-border bg-brand-input px-3 py-2 text-body font-mont text-white '+(props.className||'')}
  />
)

export default function Session(){
  const { state, exerciseMap, saveSession } = useStore()
  const [selectedDayId, setSelectedDayId] = useState(state.plan.days[0]?.id || null)
  const day = useMemo(()=>state.plan.days.find(d=>d.id===selectedDayId)||state.plan.days[0],[state.plan.days,selectedDayId])

  const [session, setSession] = useState(null)
  useEffect(()=>{
    if (!day) return
    const entries = day.exerciseIds.map(eid=>{
      const ex = exerciseMap[eid]
      const last = [...state.logs].reverse().map(l=>l.entries.find(e=>e.exerciseId===eid)).find(Boolean)
      const setsCount = ex?.sets || 3
      const weights = Array.from({ length: setsCount }, (_,i)=>{
        if (last && last.weights[i]!=null) return String(last.weights[i])
        if (last && last.weights.length)   return String(last.weights[last.weights.length-1])
        return '0'
      })
      return { exerciseId: eid, weights }
    })
    setSession({ dayId: day.id, dateISO: new Date().toISOString(), entries })
  }, [day, state.logs, exerciseMap])

  if (!day) return <p className="text-brand-accent">Create a day in Plan first.</p>

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-label font-mont text-brand-accent">Pick day</span>
        <div className="flex overflow-x-auto no-scrollbar gap-2">
          {state.plan.days.map(d=>(
            <button key={d.id}
              onClick={()=>setSelectedDayId(d.id)}
              className={'px-3 py-1 rounded-chip border ' + (d.id===day.id ? 'bg-brand-primary text-black border-brand-primary' : 'bg-transparent text-white border-brand-border')}>
              <span className="text-label font-mont">{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-button border border-brand-border">Copy last</button>
        <button className="px-4 py-2 rounded-button border border-brand-border" onClick={()=>setSession(s=>({...s, entries: s.entries.map(e=>({...e, weights: e.weights.map(()=> '0')}))}))}>Clear</button>
        <button className="px-4 py-2 rounded-button bg-brand-primary text-black" onClick={()=>{ saveSession(session); alert('Saved. Great work.') }}>Save Session</button>
      </div>

      {day.exerciseIds.map(eid=>{
        const ex = exerciseMap[eid]
        const entryIndex = session?.entries.findIndex(en=>en.exerciseId===eid) ?? -1
        const entry = entryIndex>=0 ? session.entries[entryIndex] : null
        if (!ex || !entry) return null
        return (
          <div key={eid} className="border border-brand-border rounded-card p-4 bg-brand-card space-y-2">
            <div className="flex justify-between">
              <div className="font-bold">{ex.name} <span className="text-brand-accent">({ex.sets} x {ex.reps})</span></div>
              {ex.link ? <a href={ex.link} target="_blank" className="underline text-brand-accent">How-to ↗</a> : <span className="text-neutral-400">No link</span>}
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {entry.weights.map((w,i)=>(
                <div key={i} className="w-24 rounded-card border border-brand-border bg-brand-input p-2 shrink-0">
                  <div className="text-label font-mont text-brand-accent mb-1">Set {i+1}</div>
                  <Input value={w} onChange={e=>{
                    const v = e.target.value
                    setSession(s=>{ const c = structuredClone(s); c.entries[entryIndex].weights[i]=v; return c })
                  }} placeholder={`0 ${state.units}`} inputMode="decimal"/>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
