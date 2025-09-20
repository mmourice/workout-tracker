import React, { useMemo, useState } from 'react'
import { useStore } from '../store'

export default function History(){
  const { state } = useStore()
  const [exId, setExId] = useState(state.exercises[0]?.id || '')

  const rows = useMemo(()=>{
    if (!exId) return []
    const out = []
    state.logs.forEach(log=>{
      const entry = log.entries.find(e=>e.exerciseId===exId)
      if (entry) out.push({ date: new Date(log.dateISO), weights: entry.weights })
    })
    return out.sort((a,b)=>a.date-b.date)
  }, [state.logs, exId])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-label text-brand-accent">Exercise</span>
        <div className="flex overflow-x-auto no-scrollbar gap-2">
          {state.exercises.map(e=>(
            <button key={e.id} onClick={()=>setExId(e.id)}
              className={'px-3 py-1 rounded-chip border '+(e.id===exId?'bg-brand-primary text-black border-brand-primary':'bg-transparent text-white border-brand-border')}>
              <span className="text-label font-mont">{e.name}</span>
            </button>
          ))}
        </div>
      </div>

      {!rows.length ? (
        <p className="text-brand-accent">No logs yet for this exercise. Save a session first.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r,idx)=>(
            <div key={idx} className="border-t border-brand-border pt-2">
              <div className="mb-2">{r.date.toLocaleDateString()}</div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {r.weights.map((w,i)=>(
                  <div key={i} className="rounded-card border border-brand-border bg-brand-input px-3 py-1">Set {i+1}: {w}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
