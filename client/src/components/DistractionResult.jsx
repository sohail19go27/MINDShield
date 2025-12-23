import React from 'react'
import { Chip, Stack, Paper } from '@mui/material'

// Emotion color mapping
const SENTIMENT_COLORS = {
  positive: 'text-emerald-400',
  neutral: 'text-slate-400',
  negative: 'text-rose-400'
}

// Emoji mapping for habit types
const HABIT_EMOJIS = {
  add: '🌱',
  remove: '🚫'
}

export default function DistractionResult({ analysis }) {
  const {
    sentiment,
    keywords,
    habits_to_remove,
    habits_to_add,
    routine_suggestion
  } = analysis

  return (
    <div className="space-y-6">
      {/* Mood Analysis */}
      <div className="p-4 rounded-lg bg-slate-800/50">
        <h4 className="text-lg font-medium mb-2">🌤️ Mood Analysis</h4>
        <p className={SENTIMENT_COLORS[sentiment]}>
          You felt {sentiment === 'negative' ? 'stressed' : sentiment === 'positive' ? 'optimistic' : 'neutral'} today.
        </p>
      </div>

      {/* Key Distractions */}
      <div>
        <h4 className="text-lg font-medium mb-2">🔑 Key Distractions</h4>
        <div className="flex flex-wrap gap-2">
          {keywords.map((word, idx) => (
            <Chip 
              key={idx}
              label={word}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
        </div>
      </div>

      {/* Habits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Habits to Add */}
        <div className="p-4 rounded-lg bg-slate-800/50">
          <h4 className="text-lg font-medium mb-3">
            {HABIT_EMOJIS.add} Habits to Develop
          </h4>
          <div className="space-y-2">
            {habits_to_add.map((habit, idx) => (
              <button
                key={idx}
                onClick={() => {/* TODO: Integration with Habits page */}}
                className="w-full p-3 text-left rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30"
              >
                <span className="block font-medium">{habit}</span>
                <span className="text-sm text-emerald-400">Click to add to Habits →</span>
              </button>
            ))}
          </div>
        </div>

        {/* Habits to Remove */}
        <div className="p-4 rounded-lg bg-slate-800/50">
          <h4 className="text-lg font-medium mb-3">
            {HABIT_EMOJIS.remove} Habits to Remove
          </h4>
          <div className="space-y-2">
            {habits_to_remove.map((habit, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-rose-600/20 border border-rose-600/30"
              >
                <span className="block font-medium">{habit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Routine Suggestion */}
      <div>
        <h4 className="text-lg font-medium mb-3">📅 Suggested Routine</h4>
        <Stack spacing={2}>
          {routine_suggestion.split(';').map((step, idx) => (
            <Paper 
              key={idx}
              className="p-4 bg-slate-800/50 border border-slate-700"
              elevation={0}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 text-indigo-400">
                  {idx + 1}.
                </div>
                <div>{step.trim()}</div>
              </div>
            </Paper>
          ))}
        </Stack>
      </div>
    </div>
  )
}