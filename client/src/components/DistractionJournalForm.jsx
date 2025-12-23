import React, { useState } from 'react'

export default function DistractionJournalForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    clarityRating: 5,
    focusLevel: 5,
    mood: 'neutral',
    sleepHours: 7,
    productivity: 5,
    stress: false,
    distractionText: '',
    gratitudeText: '',
    selfLearningText: ''
  })

  const handle = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [field]: val }))
  }

  const submit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col">
          <span>How clear was your mind today? (1-10)</span>
          <input type="number" min="1" max="10" value={form.clarityRating} onChange={handle('clarityRating')} required className="p-2 bg-slate-900/50 rounded" />
        </label>
        <label className="flex flex-col">
          <span>How focused were you? (1-10)</span>
          <input type="number" min="1" max="10" value={form.focusLevel} onChange={handle('focusLevel')} required className="p-2 bg-slate-900/50 rounded" />
        </label>
        <label className="flex flex-col">
          <span>Mood</span>
          <select value={form.mood} onChange={handle('mood')} className="p-2 bg-slate-900/50 rounded">
            <option value="calm">calm</option>
            <option value="happy">happy</option>
            <option value="stressed">stressed</option>
            <option value="neutral">neutral</option>
            <option value="sad">sad</option>
          </select>
        </label>
        <label className="flex flex-col">
          <span>How many hours did you sleep?</span>
          <input type="number" min="0" step="0.1" value={form.sleepHours} onChange={handle('sleepHours')} className="p-2 bg-slate-900/50 rounded" />
        </label>
        <label className="flex flex-col">
          <span>How productive did you feel? (1-10)</span>
          <input type="number" min="1" max="10" value={form.productivity} onChange={handle('productivity')} className="p-2 bg-slate-900/50 rounded" />
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={form.stress} onChange={handle('stress')} />
          <span>Did you feel stress/anxiety today?</span>
        </label>
      </div>

      <label className="flex flex-col">
        <span>What distracted or affected your clarity today?</span>
        <textarea value={form.distractionText} onChange={handle('distractionText')} className="w-full p-3 bg-slate-900/50 rounded h-24" required />
      </label>

      <label className="flex flex-col">
        <span>What are you grateful for today?</span>
        <textarea value={form.gratitudeText} onChange={handle('gratitudeText')} className="w-full p-3 bg-slate-900/50 rounded h-24" required />
      </label>

      <label className="flex flex-col">
        <span>What did you learn or realize about yourself today?</span>
        <textarea value={form.selfLearningText} onChange={handle('selfLearningText')} className="w-full p-3 bg-slate-900/50 rounded h-24" required />
      </label>

      <div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium disabled:opacity-50">{loading ? 'Submitting...' : 'Submit Reflection'}</button>
      </div>
    </form>
  )
}
