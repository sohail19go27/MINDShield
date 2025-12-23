export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export function apiUrl(path){
  if (path.startsWith('http')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export async function apiFetch(path, opts={}){
  const url = apiUrl(path);
  return fetch(url, opts);
}


