import React from 'react'
import { useStore } from '../store'

export default function Settings(){
  const { state, setState } = useStore()
  return (
    <div className="space-y-3">
      <div>
        <div className="text-label text-brand-accent mb-1">Units</div>
        <div className="flex gap-2">
          {['kg','lb'].map(u=>(
            <button key={u} onClick={()=>setState(s=>({...s, units: u}))}
              className={'px-3 py-1 rounded-chip border '+(state.units===u?'bg-brand-primary text-black border-brand-primary':'bg-transparent text-white border-brand-border')}>
              <span className="text-label font-mont">{u}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-label text-brand-accent mb-1">Export / Import</div>
        <button className="px-4 py-2 rounded-button border border-brand-border"
          onClick={()=>{ navigator.clipboard.writeText(JSON.stringify(state)); alert('Copied export JSON to clipboard'); }}>
          Copy Export JSON
        </button>
        <div className="mt-2 flex gap-2">
          <textarea id="importBox" placeholder="Paste JSON here" className="w-full h-24 rounded-card border border-brand-border bg-brand-input px-3 py-2 text-white"></textarea>
          <button className="px-4 py-2 rounded-button bg-brand-primary text-black"
            onClick={()=>{ try{ const data=JSON.parse(document.getElementById('importBox').value); if(!data.exercises||!data.plan) throw Error(); setState(data); alert('Imported.'); } catch{ alert('Invalid JSON') } }}>
            Import
          </button>
        </div>
        <button className="px-4 py-2 rounded-button mt-2" onClick={()=>{ if(confirm('Reset all data?')) { localStorage.removeItem('workout_tracker_local_v1'); location.reload() } }}>
          Reset All
        </button>
      </div>
    </div>
  )
}
