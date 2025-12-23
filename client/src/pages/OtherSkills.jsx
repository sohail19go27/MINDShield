import React, { useState, useEffect } from 'react'
import { readJSON, writeJSON } from '../utils/storage'
import PriorityModal from '../components/PriorityModal'

const STORAGE_KEY = 'ms:skills'

function todayKey(d=new Date()){
  return d.toISOString().slice(0,10)
}

function calcPointsForItem(p){
  const map = p.dailyMinutes || {}
  let total = 0
  for (const [, mins] of Object.entries(map)){
    if (Number(mins) >= 30) total += (p.basePoints || 4)
    else if (Number(mins) > 0) total += Math.round((Number(mins)/30) * (p.basePoints || 4))
  }
  return total
}

function calcStreak(p){
  const map = p.dailyMinutes || {}
  let count = 0
  let d = new Date()
  while(true){
    const k = todayKey(d)
    const mins = Number(map[k] || 0)
    if (mins >= 30) { count++; d.setDate(d.getDate()-1) }
    else break
    if (count > 1000) break
  }
  return count
}

export default function OtherSkills(){
  const [items, setItems] = useState(()=> readJSON(STORAGE_KEY, []))
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [todayInput, setTodayInput] = useState(30)

  useEffect(()=>{ writeJSON(STORAGE_KEY, items) },[items])

  const openNew = () => { setEditing(null); setModalOpen(true) }
  const onSave = (payload) => {
    if (payload.id){ setItems(prev => prev.map(it => it.id === payload.id ? {...it, ...payload} : it)) }
    else { const id = 's_' + Date.now(); setItems(prev => [{ id, dailyMinutes: {}, basePoints: payload.basePoints ?? 4, ...payload }, ...prev]) }
    setModalOpen(false)
  }

  const onDelete = (id) => { if (!confirm('Delete this skill?')) return; setItems(prev => prev.filter(p=>p.id!==id)) }

  const addTodayMinutes = (id, mins) => {
    setItems(prev => prev.map(p=>{
      if (p.id !== id) return p
      const map = {...(p.dailyMinutes||{})}
      const key = todayKey()
      map[key] = (Number(map[key]||0) + Number(mins))
      return {...p, dailyMinutes: map}
    }))
  }

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Other Skills</h2>
        <div>
          <button onClick={openNew} className="px-3 py-1 bg-sky-600 rounded">Add Skill</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.length === 0 && (<div className="p-4 ms-glass rounded">No skills yet. Click Add Skill to create one.</div>)}

        {items.map(p => {
          const points = calcPointsForItem(p)
          const streak = calcStreak(p)
          let badge = null
          if (streak >= 180) badge = 'Gold'
          else if (streak >= 90) badge = 'Silver'
          else if (streak >= 30) badge = 'Bronze'

          return (
            <div key={p.id} className="p-4 ms-glass rounded">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-lg">{p.title || 'Untitled'}</div>
                </div>
                <div className="text-right">
                  <div>Points: <span className="font-bold">{points}</span></div>
                  <div>Streak: <span className="font-bold">{streak}d</span> {badge && <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-700 rounded">{badge}</span>}</div>
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-300">{p.notes || 'No notes'}</div>

              <div className="mt-3 flex items-center gap-2">
                <input type="number" value={todayInput} onChange={e=>setTodayInput(Number(e.target.value))} className="w-24 bg-transparent border border-slate-700 rounded px-2 py-1" />
                <button onClick={()=>addTodayMinutes(p.id, todayInput)} className="px-3 py-1 bg-emerald-600 rounded text-sm">Add minutes (today)</button>
                <button onClick={()=>{ setEditing(p); setModalOpen(true) }} className="px-3 py-1 border rounded text-sm">Edit</button>
                <button onClick={()=>onDelete(p.id)} className="px-3 py-1 border rounded text-sm">Delete</button>
              </div>

              <div className="mt-3 text-xs text-slate-400">Recent days: {Object.entries(p.dailyMinutes||{}).slice(-7).map(([k,v])=> `${k}:${v}m`).join(' | ') || 'No activity'}</div>
            </div>
          )
        })}
      </div>

      <PriorityModal open={modalOpen} onClose={()=>setModalOpen(false)} onSave={onSave} initial={editing} />
    </div>
  )
}
