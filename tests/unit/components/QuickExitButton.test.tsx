import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import QuickExitButton from '@/components/safety/QuickExitButton';

describe('QuickExitButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the quick exit button', () => {
    const { getByRole } = render(<QuickExitButton />);
    
    const button = getByRole('button', { name: /ESC/i });
    expect(button).toBeInTheDocument();
  });

  it('exits when clicked', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<QuickExitButton />);
    
    const button = getByRole('button', { name: /ESC/i });
    await user.click(button);
    
    expect(window.location.replace).toHaveBeenCalledWith('https://www.google.com');
  });

  it('exits on triple ESC key press', async () => {
    const user = userEvent.setup();
    render(<QuickExitButton />);
    
    // Press ESC three times
    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');
    
    expect(window.location.replace).toHaveBeenCalledWith('https://www.google.com');
  });

  it('resets ESC count after timeout', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<QuickExitButton />);
    
    // Press ESC twice
    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');
    
    // Wait for timeout
    jest.advanceTimersByTime(1000);
    
    // Press ESC once more - should not exit
    await user.keyboard('{Escape}');
    
    expect(window.location.replace).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('shows tooltip on hover', async () => {
    const user = userEvent.setup();
    const { getByRole, findByText } = render(<QuickExitButton />);
    
    const button = getByRole('button', { name: /ESC/i });
    await user.hover(button);
    
    // Tooltip content should appear
    expect(await findByText(/Click to immediately leave this page/i)).toBeInTheDocument();
  });
});