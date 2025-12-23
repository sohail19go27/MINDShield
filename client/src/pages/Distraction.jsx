import React, { useState } from 'react'
import { format } from 'date-fns'
import DistractionJournalForm from '../components/DistractionJournalForm'
import DistractionInsight from '../components/DistractionInsight'
import DistractionGraph from '../components/DistractionGraph'

export default function Distraction() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  
  const onSubmit = async (formData) => {
    setLoading(true)
    setFetchError(null)
    // Add a dummy userId for now; integrate with auth if available
    const payload = { userId: formData.userId || null, ...formData }
  // Try relative path first (Vite proxy will forward /api to backend in dev), then absolute
  const tryUrls = ['/api/distractionjournal', 'http://localhost:5000/api/distractionjournal']
    let lastError = null
    for (const url of tryUrls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!response.ok) {
          const text = await response.text().catch(() => '')
          lastError = new Error(`HTTP ${response.status} ${response.statusText} - ${text}`)
          continue
        }
  const result = await response.json()
        const ai = result && (result.aiSummary || result.ai_summary || result.ai) ? (result.aiSummary || result.ai_summary || result.ai) : null
        const ml = result && (result.mlPrediction || result.ml_prediction || result.ml) ? (result.mlPrediction || result.ml_prediction || result.ml) : null
        setAnalysis({ aiSummary: ai || result.aiSummary || result.ai_summary || 'No insight available', mlPrediction: ml || result.mlPrediction || {} })
        setLoading(false)
        return
      } catch (err) {
        console.error('Fetch to', url, 'failed:', err)
        lastError = err
        // try next URL
      }
    }

    // All attempts failed
    setFetchError(lastError && lastError.message ? lastError.message : String(lastError))
    setAnalysis({ aiSummary: `Failed to generate AI summary (${lastError && lastError.message ? lastError.message : 'network error'})`, mlPrediction: {} })
    setLoading(false)
    return
  }

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Distraction Journal</h2>
          <div className="text-sm px-2 py-1 bg-amber-600/20 text-amber-400 rounded flex items-center gap-1">
            <span>🔥</span>
            <span>3 Days Consistent</span>
          </div>
        </div>
        <input
          type="date"
          value={format(new Date(), 'yyyy-MM-dd')}
          className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        <section className="ms-glass rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Reflect Today</h3>
          <DistractionJournalForm onSubmit={onSubmit} loading={loading} />
        </section>

        {analysis && (
          <section className="ms-glass rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Daily Insight Card</h3>
            <DistractionInsight insight={analysis} />
          </section>
        )}

        {/* Debug panel removed */}

        <section className="ms-glass rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
          <DistractionGraph />
        </section>
      </div>
    </div>
  )
}