import React, { useState } from 'react'
import axios from 'axios'

export default function MindClarityJournal() {
  const [answers, setAnswers] = useState({
    q1: '', q2: '', q3: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (k) => (e) => setAnswers(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = { answer1: answers.q1, answer2: answers.q2, answer3: answers.q3 }
      const res = await axios.post('/api/mindclarity/analyze', payload)
      setResult(res.data)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || err.message || 'Failed to analyze')
    } finally {
      setLoading(false)
    }
  }

  const saveHabits = async () => {
    if (!result) return
    setSaveLoading(true)
    setSaved(false)
    try {
      const payload = { userId: null, habitsToAdd: result.habitsToAdd, habitsToRemove: result.habitsToRemove }
      const res = await axios.post('/api/habits/save', payload)
      if (res.data && res.data.ok) setSaved(true)
    } catch (err) {
      console.error('Save failed', err)
      setError('Failed to save habits')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/60 dark:bg-slate-900/40 rounded-lg shadow-md">
      <h2 className="text-2xl font-medium mb-4">MindClarity — Journaling</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">1. What habit or behavior is not helping you?</label>
          <textarea
            value={answers.q1}
            onChange={handleChange('q1')}
            placeholder="e.g., Scrolling social media before bed"
            className="w-full p-3 rounded bg-slate-100 dark:bg-slate-800 resize-none min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">2. What is making your mind feel chaotic today?</label>
          <textarea
            value={answers.q2}
            onChange={handleChange('q2')}
            placeholder="e.g., Overloaded with tasks, noisy environment"
            className="w-full p-3 rounded bg-slate-100 dark:bg-slate-800 resize-none min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">3. What can you do to remove or improve that?</label>
          <textarea
            value={answers.q3}
            onChange={handleChange('q3')}
            placeholder="e.g., Turn off notifications for 1 hour, schedule focused blocks"
            className="w-full p-3 rounded bg-slate-100 dark:bg-slate-800 resize-none min-h-[80px]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded">
            {loading ? 'Analyzing...' : 'Get AI Analysis'}
          </button>
          {loading && <div className="text-sm text-slate-500">Generating AI insights…</div>}
        </div>
      </form>

      {error && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}

      {result && (
        <div className="mt-6 p-4 bg-white dark:bg-slate-900 rounded shadow-sm">
          <h3 className="font-semibold text-lg">AI Summary</h3>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{result.summary}</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-emerald-600">🟢 Habits to Add</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.habitsToAdd && result.habitsToAdd.length > 0 ? result.habitsToAdd.map((h, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">{h}</span>
                )) : <div className="text-xs text-slate-400">No suggestions</div>}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-red-600">🔴 Habits to Remove</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.habitsToRemove && result.habitsToRemove.length > 0 ? result.habitsToRemove.map((h, i) => (
                  <span key={i} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">{h}</span>
                )) : <div className="text-xs text-slate-400">No suggestions</div>}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={saveHabits} disabled={saveLoading} className="px-4 py-2 bg-indigo-600 text-white rounded">
              {saveLoading ? 'Saving...' : 'Save to My Routine'}
            </button>
            {saved && <div className="text-sm text-emerald-500">Saved to your routine</div>}
          </div>
        </div>
      )}
    </div>
  )
}
