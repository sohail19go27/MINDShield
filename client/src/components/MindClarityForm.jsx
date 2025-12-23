import React, { useState } from 'react'

export default function MindClarityForm({ onSubmit, defaultRetention = 3, loading = false }){
  const [form, setForm] = useState({
    whatMakeDayBetter: '',
    preSleepHappiness: '',
    moralLessons: '',
    planTomorrow: '',
    gratitude: '',
    retentionDays: defaultRetention
  })

  const change = (k) => (e) => setForm(s => ({ ...s, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">What can you do today to make your day better?</label>
        <textarea value={form.whatMakeDayBetter} onChange={change('whatMakeDayBetter')} className="w-full mt-1 p-2 bg-slate-900 rounded h-20" />
      </div>

      <div>
        <label className="block text-sm font-medium">What will make you happy before you sleep?</label>
        <textarea value={form.preSleepHappiness} onChange={change('preSleepHappiness')} className="w-full mt-1 p-2 bg-slate-900 rounded h-20" />
      </div>

      <div>
        <label className="block text-sm font-medium">What mistakes or moral lessons did you learn today?</label>
        <textarea value={form.moralLessons} onChange={change('moralLessons')} className="w-full mt-1 p-2 bg-slate-900 rounded h-20" />
      </div>

      <div>
        <label className="block text-sm font-medium">Plan your day for tomorrow</label>
        <textarea value={form.planTomorrow} onChange={change('planTomorrow')} className="w-full mt-1 p-2 bg-slate-900 rounded h-20" />
      </div>

      <div>
        <label className="block text-sm font-medium">(Optional) 3 small things you’re grateful for today</label>
        <textarea value={form.gratitude} onChange={change('gratitude')} className="w-full mt-1 p-2 bg-slate-900 rounded h-16" />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm">Auto-delete after</label>
        <select value={form.retentionDays} onChange={e=>setForm(s=>({...s, retentionDays: Number(e.target.value)}))} className="bg-slate-900 px-2 py-1 rounded">
          {Array.from({length:14},(_,i)=>i+1).map(d=> <option key={d} value={d}>{d} day{d>1?'s':''}</option>)}
        </select>
        <div className="text-sm text-slate-400">(default 3 days, max 14)</div>
      </div>

      <div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 rounded">{loading? 'Saving...':'Save Reflection'}</button>
      </div>
    </form>
  )
}
