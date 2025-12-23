import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiUrl } from '../utils/api';

const AppContext = createContext();

const initialState = {
  priorities: [],
  sessions: [],
  points: 0,
  todayPoints: 0,
  streaks: {},
  badges: [],
  currentSession: null,
  loading: false,
  error: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_PRIORITIES':
      return { ...state, priorities: action.payload };
    case 'ADD_PRIORITY':
      return { ...state, priorities: [...state.priorities, action.payload] };
    case 'UPDATE_PRIORITY':
      return {
        ...state,
        priorities: state.priorities.map(p => 
          p._id === action.payload._id ? action.payload : p
        )
      };
    case 'DELETE_PRIORITY':
      return {
        ...state,
        priorities: state.priorities.filter(p => p._id !== action.payload)
      };
    case 'START_SESSION':
      return { ...state, currentSession: action.payload };
    case 'END_SESSION':
      return { 
        ...state, 
        currentSession: null,
        sessions: [...state.sessions, action.payload]
      };
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    case 'UPDATE_POINTS':
      return { 
        ...state, 
        points: action.payload.total,
        todayPoints: action.payload.today
      };
    case 'UPDATE_STREAKS':
      return { ...state, streaks: action.payload };
    case 'UPDATE_BADGES':
      return { ...state, badges: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Initial data fetch
    fetchInitialData(dispatch);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

async function fetchInitialData(dispatch) {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    // Fetch priorities, points, streaks, and badges
    // helper to handle authenticated endpoints returning 401
    const safeFetch = async (url, opts = {}) => {
      // include token from localStorage if present
      const token = localStorage.getItem('ms_token');
      const headers = opts.headers || {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      opts.headers = headers;
      try {
        const res = await fetch(apiUrl(url), opts);
        if (!res.ok) {
          if (res.status === 401) return null; // not logged in
          // try to parse error body
          const text = await res.text().catch(() => '');
          throw new Error(`Fetch ${url} failed: ${res.status} ${text}`);
        }
        return await res.json();
      } catch (err) {
        // network or parse error
        console.warn('safeFetch error', url, err.message);
        return null;
      }
    };

    const [priorities, points, badges, sessions] = await Promise.all([
      safeFetch('/api/priorities'),
      safeFetch('/api/points'),
      safeFetch('/api/badges'),
      safeFetch('/api/sessions')
    ]);

    if (priorities) dispatch({ type: 'SET_PRIORITIES', payload: priorities });
    // points may be null for unauthenticated users
    dispatch({ type: 'UPDATE_POINTS', payload: points || { total: 0, today: 0 } });

    // normalize badges: ensure priorityId string
    const normalizedBadges = (badges || []).map(b => ({
      ...b,
      priorityId: b.priorityId ? String(b.priorityId) : null
    }));
    dispatch({ type: 'UPDATE_BADGES', payload: normalizedBadges });

    // normalize sessions: ensure priorityId string and fields
    const normalizedSessions = (sessions || []).map(s => ({
      ...s,
      priorityId: s.priorityId ? String(s.priorityId) : null,
      startTime: s.startTime || s.startAt,
      duration: s.duration || (s.durationMinutes ? s.durationMinutes * 60000 : 0),
      pointsAwarded: s.pointsAwarded || s.points || 0
    }));
  // set sessions array in state for analytics
  dispatch({ type: 'SET_SESSIONS', payload: normalizedSessions });
  // detect any currently running session (no endTime)
  const current = normalizedSessions.find(s => !s.endTime);
  if (current) dispatch({ type: 'SET_CURRENT_SESSION', payload: current });
  } catch (error) {
    dispatch({ type: 'SET_ERROR', payload: error.message });
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
}