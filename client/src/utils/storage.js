export const readJSON = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch (e) {
    console.warn('readJSON error', e)
    return fallback
  }
}

export const writeJSON = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.warn('writeJSON error', e)
  }
}
