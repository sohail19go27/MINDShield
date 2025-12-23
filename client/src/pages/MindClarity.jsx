import React, { useEffect, useState } from 'react'
import MindClarityJournal from '../components/MindClarity'

export default function MindClarity(){
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState([])
  const [message, setMessage] = useState(null)
  const [edits, setEdits] = useState({})
  const [editsLoading, setEditsLoading] = useState({})

  useEffect(()=>{
    // fetch recent reflections on mount
    fetchReflections()
  },[])

  async function fetchReflections(){
    try{
      const res = await fetch('/api/reflections')
      if (!res.ok) return
      const j = await res.json()
      setList(j.reflections || [])
      // initialize edits map
      const map = {}
      ;(j.reflections || []).forEach(r => { map[r._id] = r.retentionDays || 3 })
      setEdits(map)
    }catch(e){ console.error(e) }
  }

  async function onSubmit(payload){
    setLoading(true)
    setMessage(null)
    try{
      const res = await fetch('/api/reflections',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify(payload)
      })
      const j = await res.json()
      if (j && j.ok){
        setMessage('Saved. This reflection will be deleted on ' + (new Date(j.expireAt)).toLocaleString())
        fetchReflections()
      } else {
        setMessage('Saved locally (server may be unreachable)')
      }
    }catch(e){
      console.error(e)
      setMessage('Failed to save to server. You can try again later.')
    }finally{ setLoading(false) }
  }

  function onRetentionChange(id, value){
    setEdits(prev => ({ ...prev, [id]: Number(value) }))
  }

  async function updateRetention(id){
    const days = edits[id] ?? 3
    setEditsLoading(prev => ({ ...prev, [id]: true }))
    setMessage(null)
    try{
      const res = await fetch(`/api/reflections/${id}`,{
        method: 'PATCH',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({ retentionDays: days })
      })
      const j = await res.json()
      if (res.ok && j.ok){
        // update list item
        setList(prev => prev.map(r => r._id === id ? { ...r, retentionDays: j.retentionDays, expireAt: j.expireAt } : r))
        setMessage('Retention updated')
      } else {
        setMessage(j && j.error ? j.error : 'Failed to update retention')
      }
    }catch(e){
      console.error(e)
      setMessage('Failed to update retention')
    }finally{
      setEditsLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">MindClarity — Daily Reflection</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-3xl">
        <section className="ms-glass p-6 rounded">
          <h3 className="text-lg font-semibold mb-3">Reflect</h3>
          <MindClarityJournal />
          {message && <div className="mt-3 text-sm text-emerald-400">{message}</div>}
        </section>

        <section className="ms-glass p-6 rounded">
          <h3 className="text-lg font-semibold mb-3">Recent reflections (will auto-delete)</h3>
          <div className="space-y-3">
            {list.length===0 && <div className="text-sm text-slate-400">No reflections yet.</div>}
            {list.map(r => (
              <div key={r._id} className="p-3 bg-slate-900/40 rounded">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">Saved: {new Date(r.createdAt).toLocaleString()}</div>
                  <div className="text-xs text-slate-400">Deletes: {new Date(r.expireAt).toLocaleString()}</div>
                </div>
                <div className="mt-2 text-sm"><strong>What would make today better:</strong> {r.answers?.whatMakeDayBetter}</div>
                <div className="mt-1 text-sm"><strong>Before sleep:</strong> {r.answers?.preSleepHappiness}</div>
                <div className="mt-1 text-sm"><strong>Moral lessons:</strong> {r.answers?.moralLessons}</div>
                <div className="mt-1 text-sm"><strong>Plan tomorrow:</strong> {r.answers?.planTomorrow}</div>
                <div className="mt-1 text-sm"><strong>Gratitude:</strong> {r.answers?.gratitude}</div>

                <div className="mt-3 flex items-center gap-3">
                  <label className="text-sm">Auto-delete after</label>
                  <select value={edits[r._id] ?? (r.retentionDays || 3)} onChange={e=>onRetentionChange(r._id, e.target.value)} className="bg-slate-900 px-2 py-1 rounded">
                    {Array.from({length:14},(_,i)=>i+1).map(d=> <option key={d} value={d}>{d} day{d>1?'s':''}</option>)}
                  </select>
                  <button onClick={()=>updateRetention(r._id)} disabled={editsLoading[r._id]} className="px-3 py-1 bg-indigo-600 rounded text-sm">{editsLoading[r._id] ? 'Saving...' : 'Update'}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
