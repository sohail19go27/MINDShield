import React, { useState, useEffect } from 'react'
import { readJSON, writeJSON } from '../utils/storage'
import PriorityModal from '../components/PriorityModal'

const STORAGE_KEY_DEV = 'ms:habits:develop'
const STORAGE_KEY_REM = 'ms:habits:remove'

function todayKey(d=new Date()){
  return d.toISOString().slice(0,10)
}

function calcPointsForItem(p){
  // points rule: first 30m => basePoints (default 5), each extra 30m => extra (default 2)
  const base = p.basePoints ?? 5
  const extra = p.extraIncrement ?? 2
  const map = p.dailyMinutes || {}
  let total = 0
  for (const [, minsRaw] of Object.entries(map)){
    const mins = Number(minsRaw || 0)
    if (mins >= 30) {
      total += base + Math.floor((mins - 30) / 30) * extra
    } else if (mins > 0) {
      total += Math.round((mins / 30) * base)
    }
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

export default function Habits(){
  const [develop, setDevelop] = useState(()=> readJSON(STORAGE_KEY_DEV, []))
  const [remove, setRemove] = useState(()=> readJSON(STORAGE_KEY_REM, []))
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editingType, setEditingType] = useState('develop')
  const [todayInput, setTodayInput] = useState(30)

  useEffect(()=>{ writeJSON(STORAGE_KEY_DEV, develop) },[develop])
  useEffect(()=>{ writeJSON(STORAGE_KEY_REM, remove) },[remove])

  const openNew = (type='develop') => { setEditing(null); setEditingType(type); setModalOpen(true) }
  const onSave = (payload) => {
    const target = payload.type === 'remove' || editingType === 'remove' ? 'remove' : (payload.type || editingType || 'develop')
    const setter = target === 'remove' ? setRemove : setDevelop
    const list = target === 'remove' ? remove : develop

    if (payload.id){
      setter(list.map(it => it.id === payload.id ? {...it, ...payload} : it))
    } else {
      const id = (target === 'remove' ? 'hr_' : 'hd_') + Date.now()
      const item = { id, dailyMinutes: {}, basePoints: payload.basePoints ?? 5, extraIncrement: payload.extraIncrement ?? 2, ...payload }
      setter([item, ...list])
    }
    setModalOpen(false)
  }

  const onDelete = (id, type='develop') => { if (!confirm('Delete this habit?')) return; if (type==='remove') setRemove(prev=>prev.filter(p=>p.id!==id)); else setDevelop(prev=>prev.filter(p=>p.id!==id)) }

  const addTodayMinutes = (id, mins, type='develop') => {
    const updater = type === 'remove' ? setRemove : setDevelop
    const list = type === 'remove' ? remove : develop
    updater(list.map(p=>{
      if (p.id !== id) return p
      const map = {...(p.dailyMinutes||{})}
      const key = todayKey()
      map[key] = (Number(map[key]||0) + Number(mins))
      return {...p, dailyMinutes: map}
    }))
  }

  const renderList = (list, type) => (
    list.length === 0 ? (
      <div className="p-4 ms-glass rounded">No habits yet.</div>
    ) : list.map(p => {
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
            <button onClick={()=>addTodayMinutes(p.id, todayInput, type)} className="px-3 py-1 bg-emerald-600 rounded text-sm">Add minutes (today)</button>
            <button onClick={()=>{ setEditing(p); setEditingType(type); setModalOpen(true) }} className="px-3 py-1 border rounded text-sm">Edit</button>
            <button onClick={()=>onDelete(p.id, type)} className="px-3 py-1 border rounded text-sm">Delete</button>
          </div>

          <div className="mt-3 text-xs text-slate-400">Recent days: {Object.entries(p.dailyMinutes||{}).slice(-7).map(([k,v])=> `${k}:${v}m`).join(' | ') || 'No activity'}</div>
        </div>
      )
    })
  )

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Habits</h2>
        <div className="flex gap-2">
          <button onClick={()=>openNew('develop')} className="px-3 py-1 bg-sky-600 rounded">Add Habit to Develop</button>
          <button onClick={()=>openNew('remove')} className="px-3 py-1 bg-rose-600 rounded">Add Habit to Remove</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Habits to develop</h3>
          <div className="space-y-3">
            {renderList(develop, 'develop')}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Habits to remove</h3>
          <div className="space-y-3">
            {renderList(remove, 'remove')}
          </div>
        </div>
      </div>

      <PriorityModal open={modalOpen} onClose={()=>setModalOpen(false)} onSave={onSave} initial={editing} />
    </div>
  )
}
