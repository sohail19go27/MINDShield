import React, { useEffect, useState } from 'react'
import { readJSON, writeJSON } from '../utils/storage'

const STORAGE_KEY = 'ms:reminders'

export default function Reminders(){
  const [items, setItems] = useState(()=> readJSON(STORAGE_KEY, []))
  const [text, setText] = useState('')

  useEffect(()=>{ writeJSON(STORAGE_KEY, items) },[items])

  const add = () => { if (!text.trim()) return; const r = { id: 'r_'+Date.now(), text: text.trim(), read: false, createdAt: new Date().toISOString() }; setItems(prev => [r, ...prev]); setText('') }
  const toggle = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, read: !i.read } : i))
  const remove = (id) => setItems(prev => prev.filter(i=>i.id!==id))
  const markAll = () => setItems(prev => prev.map(i=> ({...i, read:true})))

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Reminders</h2>
        <div>
          <button onClick={markAll} className="px-3 py-1 bg-sky-600 rounded">Mark all read</button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add reminder..." className="flex-1 bg-transparent border border-slate-700 rounded px-2 py-1" />
          <button onClick={add} className="px-3 py-1 bg-emerald-600 rounded">Add</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {items.length === 0 && <div className="p-4 ms-glass rounded text-slate-400">No reminders yet</div>}
        {items.map(i=> (
          <div key={i.id} className={`p-3 ms-glass rounded flex items-center justify-between ${i.read ? 'opacity-60' : ''}`}>
            <div className="flex-1">
              <div className="font-medium text-slate-200">
                {i.text}
                {i.type && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    i.type === 'priority' ? 'bg-amber-600/20 text-amber-400' :
                    i.type === 'reflection' ? 'bg-purple-600/20 text-purple-400' :
                    'bg-slate-600/20 text-slate-400'
                  }`}>
                    {i.type}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">{new Date(i.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>toggle(i.id)} className="text-sm px-2 py-1 border rounded hover:bg-slate-700/40">{i.read ? 'Unread' : 'Read'}</button>
              <button onClick={()=>remove(i.id)} className="text-sm px-2 py-1 border rounded hover:bg-slate-700/40">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
