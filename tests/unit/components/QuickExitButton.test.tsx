import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickExitButton from '@/components/safety/QuickExitButton';

// Mock window.location
delete (window as any).location;
window.location = { replace: jest.fn() } as any;

describe('QuickExitButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the quick exit button', () => {
    render(<QuickExitButton />);
    
    const button = screen.getByRole('button', { name: /quick exit/i });
    expect(button).toBeInTheDocument();
  });

  it('exits when clicked', () => {
    render(<QuickExitButton />);
    
    const button = screen.getByRole('button', { name: /quick exit/i });
    fireEvent.click(button);
    
    expect(window.location.replace).toHaveBeenCalledWith('https://weather.com');
  });

  it('exits on triple ESC key press', () => {
    render(<QuickExitButton />);
    
    // Press ESC three times
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(window.location.replace).toHaveBeenCalledWith('https://weather.com');
  });

  it('resets ESC count after timeout', () => {
    jest.useFakeTimers();
    render(<QuickExitButton />);
    
    // Press ESC twice
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.keyDown(window, { key: 'Escape' });
    
    // Wait for timeout
    jest.advanceTimersByTime(1000);
    
    // Press ESC once more - should not exit
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(window.location.replace).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('shows tooltip on hover', async () => {
    render(<QuickExitButton />);
    
    const button = screen.getByRole('button', { name: /quick exit/i });
    fireEvent.mouseEnter(button);
    
    // Tooltip content should appear
    expect(await screen.findByText(/immediately leave/i)).toBeInTheDocument();
  });
});