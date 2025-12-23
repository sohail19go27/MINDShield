import React from 'react';
import { render, screen } from '@testing-library/react';
import PriorityAnalytics from '../components/PriorityAnalytics';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div>{children}</div>,
  AreaChart: ({ children }) => <div>{children}</div>,
  Bar: () => null,
  Line: () => null,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null
}));

// Mock the app context
jest.mock('../context/AppContext', () => ({
  useApp: () => ({
    state: {
      priorities: [{
        _id: 'test-priority',
        title: 'Test Priority'
      }],
      sessions: [
        {
          priorityId: 'test-priority',
          startTime: '2025-10-28T10:00:00Z',
          endTime: '2025-10-28T11:00:00Z',
          duration: 3600000,
          pointsAwarded: 15
        },
        {
          priorityId: 'test-priority',
          startTime: '2025-10-29T10:00:00Z',
          endTime: '2025-10-29T12:00:00Z',
          duration: 7200000,
          pointsAwarded: 25
        }
      ]
    }
  })
}));

describe('PriorityAnalytics', () => {
  const priorityId = 'test-priority';

  it('renders chart titles', () => {
    render(<PriorityAnalytics priorityId={priorityId} />);
    expect(screen.getByText('Daily Time Spent')).toBeInTheDocument();
    expect(screen.getByText('Points Earned')).toBeInTheDocument();
    expect(screen.getByText('Session Frequency')).toBeInTheDocument();
  });

  it('renders all three chart containers', () => {
    const { container } = render(<PriorityAnalytics priorityId={priorityId} />);
    const charts = container.querySelectorAll('.MuiCard-root');
    expect(charts).toHaveLength(3);
  });
});