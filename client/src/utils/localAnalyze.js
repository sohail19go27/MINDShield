export function localAnalyze(payload){
  const { habit = '', trigger = '', triggerDetail = '', emotionalIntensity = 3, smallStep = '', replacement = '' } = payload || {}
  let sentiment = 'neutral'
  if (Number(emotionalIntensity) <= 2) sentiment = 'positive'
  else if (Number(emotionalIntensity) >= 4) sentiment = 'negative'

  const text = [habit, trigger, triggerDetail, smallStep, replacement].join(' ').toLowerCase()
  const known = ['phone','social media','reels','instagram','tiktok','youtube','sleep','bed','procrastination','boredom','stress','anxiety','loneliness','notifications','gaming']
  const keywords = []
  for (const k of known) if (text.includes(k) && !keywords.includes(k)) keywords.push(k)

  const habits_to_remove = []
  if (text.match(/phone|reel|instagram|tiktok|social media|notifications/)) habits_to_remove.push('Late-night phone use (reduce screen time)')
  if (text.match(/procrastin|gaming/)) habits_to_remove.push('Mindless gaming / procrastination')
  if (text.match(/snacking|sugar/)) habits_to_remove.push('Late-night snacking')

  const habits_to_add = []
  if (replacement && replacement.trim()) habits_to_add.push(replacement.trim())
  if (smallStep && smallStep.toLowerCase().includes('turn off')) habits_to_add.push('Digital curfew (phone off)')
  if (habits_to_add.length === 0){
    if (text.includes('sleep')||text.includes('bed')) habits_to_add.push('Wind-down routine: reading, light stretching, no screens 1 hr before bed')
    if (text.includes('boredom')||text.includes('loneliness')) habits_to_add.push('Short social check-ins or scheduled walk')
    if (text.includes('stress')||text.includes('anxiety')) habits_to_add.push('5–10min breathing or mini-meditation')
  }

  const suggestions = []
  if (habits_to_remove.length) suggestions.push('Remove: ' + habits_to_remove[0])
  if (habits_to_add.length) suggestions.push('Add: ' + habits_to_add[0])
  if (smallStep) suggestions.push('Today: ' + smallStep)
  if (suggestions.length === 0) suggestions.push('Try a 10-minute screen-free routine before bed; swap scrolling with reading.')

  const routine_suggestion = suggestions.join('; ')
  return { sentiment, keywords, habits_to_remove, habits_to_add, routine_suggestion }
}
