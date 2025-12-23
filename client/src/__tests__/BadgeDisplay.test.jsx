import React from 'react';
import { render, screen } from '@testing-library/react';
import BadgeDisplay from '../components/ui/BadgeDisplay';

describe('BadgeDisplay', () => {
  const mockBadge = {
    name: 'Test Badge',
    level: 3,
    description: 'Test Description'
  };

  it('renders badge name correctly', () => {
    render(<BadgeDisplay badge={mockBadge} />);
    expect(screen.getByText(mockBadge.name)).toBeInTheDocument();
  });

  it('shows badge level', () => {
    render(<BadgeDisplay badge={mockBadge} />);
    expect(screen.getByText(`Level ${mockBadge.level}`)).toBeInTheDocument();
  });

  it('renders tooltip with description', () => {
    render(<BadgeDisplay badge={mockBadge} />);
    const element = screen.getByText(mockBadge.name).closest('[title]');
    expect(element).toHaveAttribute('title', mockBadge.description);
  });
});