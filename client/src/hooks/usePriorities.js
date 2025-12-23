import { useCallback } from 'react';
import { useApp } from '../context/AppContext';

export function usePriorities() {
  const { state, dispatch } = useApp();

  const addPriority = useCallback(async (priorityData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch('/api/priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priorityData)
      });
      const newPriority = await response.json();
      dispatch({ type: 'ADD_PRIORITY', payload: newPriority });
      return newPriority;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const updatePriority = useCallback(async (id, updates) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(`/api/priorities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updatedPriority = await response.json();
      dispatch({ type: 'UPDATE_PRIORITY', payload: updatedPriority });
      return updatedPriority;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const deletePriority = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await fetch(`/api/priorities/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_PRIORITY', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  return {
    priorities: state.priorities,
    loading: state.loading,
    error: state.error,
    addPriority,
    updatePriority,
    deletePriority
  };
}