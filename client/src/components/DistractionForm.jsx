import React, { useState } from 'react'
import { 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const TRIGGER_OPTIONS = ['Boredom', 'Stress', 'Loneliness', 'Exhaustion', 'Anxiety', 'Other']
const EMOJI_MARKS = [
  { value: 1, label: '😌' },
  { value: 2, label: '😐' },
  { value: 3, label: '😣' },
  { value: 4, label: '😤' },
  { value: 5, label: '😭' }
]

export default function DistractionForm({ onSubmit, loading }) {
  const [expanded, setExpanded] = useState('panel1')
  const [formData, setFormData] = useState({
    habit: '',
    trigger: '',
    triggerDetail: '',
    emotionalIntensity: 3,
    smallStep: '',
    replacement: ''
  })

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const renderQuestion = (id, question, input) => (
    <Accordion 
      expanded={expanded === id} 
      onChange={handleChange(id)}
      className="bg-slate-800/50 border border-slate-700"
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <span className="font-medium">{question}</span>
      </AccordionSummary>
      <AccordionDetails>
        {input}
      </AccordionDetails>
    </Accordion>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderQuestion(
        'panel1',
        'What habit/behavior drains your energy or focus lately?',
        <textarea
          value={formData.habit}
          onChange={handleInputChange('habit')}
          className="w-full p-3 bg-slate-900/50 rounded resize-none h-24"
          placeholder="e.g., Scrolling Reels before bed"
          required
        />
      )}

      {renderQuestion(
        'panel2',
        'What usually triggers this distraction or chaos?',
        <div className="space-y-3">
          <FormControl fullWidth>
            <InputLabel id="trigger-label">Select a trigger</InputLabel>
            <Select
              labelId="trigger-label"
              value={formData.trigger}
              onChange={handleInputChange('trigger')}
              label="Select a trigger"
              required
            >
              {TRIGGER_OPTIONS.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <textarea
            value={formData.triggerDetail}
            onChange={handleInputChange('triggerDetail')}
            className="w-full p-3 bg-slate-900/50 rounded resize-none h-24"
            placeholder="Describe the trigger in more detail..."
          />
        </div>
      )}

      {renderQuestion(
        'panel3',
        'How does it make you feel mentally or physically?',
        <div className="px-4">
          <Slider
            value={formData.emotionalIntensity}
            onChange={(e, val) => setFormData(prev => ({ ...prev, emotionalIntensity: val }))}
            min={1}
            max={5}
            marks={EMOJI_MARKS}
            step={1}
            valueLabelDisplay="auto"
            valueLabelFormat={(val) => EMOJI_MARKS.find(m => m.value === val)?.label}
          />
        </div>
      )}

      {renderQuestion(
        'panel4',
        'What small step could you take today to reduce it?',
        <textarea
          value={formData.smallStep}
          onChange={handleInputChange('smallStep')}
          className="w-full p-3 bg-slate-900/50 rounded resize-none h-24"
          placeholder="e.g., Turn off phone at 10:30 PM"
          required
        />
      )}

      {renderQuestion(
        'panel5',
        'What positive habit or activity could replace it?',
        <textarea
          value={formData.replacement}
          onChange={handleInputChange('replacement')}
          className="w-full p-3 bg-slate-900/50 rounded resize-none h-24"
          placeholder="e.g., Read 10 pages or meditate"
          required
        />
      )}

      <div className="pt-4">
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Get AI Analysis'}
        </button>
      </div>
    </form>
  )
}