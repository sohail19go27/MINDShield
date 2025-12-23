import axios from 'axios'

export function saveAuth(token, user){
  localStorage.setItem('ms_token', token)
  localStorage.setItem('ms_user', JSON.stringify(user))
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export function clearAuth(){
  localStorage.removeItem('ms_token')
  localStorage.removeItem('ms_user')
  delete axios.defaults.headers.common['Authorization']
}

export function getUser(){
  const s = localStorage.getItem('ms_user')
  return s ? JSON.parse(s) : null
}
