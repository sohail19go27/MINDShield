import React from 'react';
import { render, screen } from '@testing-library/react';
import MotivationMeter from '../components/MotivationMeter';
import { AppProvider } from '../context/AppContext';

// Mock the app context
jest.mock('../context/AppContext', () => ({
  useApp: () => ({
    state: {
      priorities: [{
        _id: 'test-priority',
        title: 'Test Priority',
        currentStreak: 5
      }],
      sessions: [{
        priorityId: 'test-priority',
        startTime: new Date().toISOString(),
        duration: 1800000 // 30 minutes
      }],
      badges: [{
        priorityId: 'test-priority',
        type: 'streak',
        level: 2
      }]
    }
  }),
  AppProvider: ({ children }) => <div>{children}</div>
}));

describe('MotivationMeter', () => {
  const priorityId = 'test-priority';

  it('renders the motivation meter title', () => {
    render(<MotivationMeter priorityId={priorityId} />);
    expect(screen.getByText('Motivation Meter')).toBeInTheDocument();
  });

  it('displays a motivation score', () => {
    render(<MotivationMeter priorityId={priorityId} />);
    const scoreElement = screen.getByText(/\d+/);
    expect(scoreElement).toBeInTheDocument();
    const score = parseInt(scoreElement.textContent);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('shows motivation level text', () => {
    render(<MotivationMeter priorityId={priorityId} />);
    const levelText = screen.getByText(/(Excellent|Good|Okay|Need Push|Low)/);
    expect(levelText).toBeInTheDocument();
  });
});