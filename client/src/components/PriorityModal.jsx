import React, {useState, useEffect} from 'react'

function formatDateInput(d){
  if(!d) return ''
  const dt = new Date(d)
  return dt.toISOString().slice(0,10)
}

export default function PriorityModal({open, onClose, onSave, initial}){
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const [basePoints, setBasePoints] = useState(10)

  useEffect(()=>{
    if (open && initial) {
      setTitle(initial.title||'')
      setDeadline(formatDateInput(initial.deadline))
      setNotes(initial.notes||'')
      setBasePoints(initial.basePoints ?? 10)
    }
    if (!open) {
      setTitle('')
      setDeadline('')
      setNotes('')
      setBasePoints(10)
    }
  },[open, initial])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#06102a] p-4 rounded w-full max-w-lg border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{initial? 'Edit Priority' : 'Add Priority'}</h3>
          <button onClick={onClose} className="text-slate-400">Close</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-300">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-transparent border border-slate-700 rounded px-2 py-1" />
          </div>

          <div>
            <label className="block text-sm text-slate-300">Deadline</label>
            <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full bg-transparent border border-slate-700 rounded px-2 py-1" />
          </div>

          <div>
            <label className="block text-sm text-slate-300">Base points (for 30+ mins)</label>
            <input type="number" value={basePoints} onChange={e=>setBasePoints(Number(e.target.value))} className="w-32 bg-transparent border border-slate-700 rounded px-2 py-1" />
          </div>

          <div>
            <label className="block text-sm text-slate-300">Notes</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="w-full bg-transparent border border-slate-700 rounded px-2 py-1" rows={4} />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1 border rounded text-sm">Cancel</button>
            <button onClick={()=>{
              const payload = {
                ...initial,
                title,
                deadline: deadline ? new Date(deadline).toISOString() : null,
                notes,
                basePoints
              }
              onSave(payload)
            }} className="px-3 py-1 bg-sky-600 rounded text-sm">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
