import React from 'react'

export default function DistractionInsight({ insight }) {
  if (!insight) return null
  const { aiSummary, mlPrediction } = insight

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-900/40 rounded">
        <h4 className="font-semibold">AI Summary</h4>
        <p className="mt-2 text-sm">{aiSummary && aiSummary !== 'Failed to generate AI summary' ? aiSummary : 'No AI summary available yet.'}</p>
      </div>

      <div className="p-4 bg-slate-900/40 rounded">
        <h4 className="font-semibold">ML Prediction</h4>
        <p className="mt-2 text-sm">Predicted clarity: {mlPrediction && mlPrediction.predictedClarity != null ? mlPrediction.predictedClarity : '—'}</p>
        <p className="mt-1 text-sm">Trend: {mlPrediction && mlPrediction.trend ? mlPrediction.trend : '—'}</p>
      </div>
    </div>
  )
}
