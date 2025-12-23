import { useCallback } from 'react';
import { useApp } from '../context/AppContext';

export function useSessions() {
  const { state, dispatch } = useApp();

  const startSession = useCallback(async (priorityId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priorityId })
      });
      const session = await response.json();
      dispatch({ type: 'START_SESSION', payload: session });
      return session;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const endSession = useCallback(async (sessionId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST'
      });
      const endedSession = await response.json();
      dispatch({ type: 'END_SESSION', payload: endedSession });
      
      // Update points after session ends
      const pointsResponse = await fetch('/api/points');
      const points = await pointsResponse.json();
      dispatch({ type: 'UPDATE_POINTS', payload: points });
      
      return endedSession;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  return {
    currentSession: state.currentSession,
    sessions: state.sessions,
    loading: state.loading,
    error: state.error,
    startSession,
    endSession
  };
}