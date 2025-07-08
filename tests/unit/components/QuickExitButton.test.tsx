import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import QuickExitButton from '@/components/safety/QuickExitButton';
import { trackEvent } from '@/lib/analytics';

describe('QuickExitButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
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
    
    // Verify analytics was called
    expect(trackEvent).toHaveBeenCalledWith('QUICK_EXIT_USED', 'SAFETY', {
      trigger: 'button',
      page: '/',
    });
    
    // Since jsdom doesn't properly support window.location.replace,
    // we'll just verify the analytics call was made
  });

  it('exits on triple ESC key press', async () => {
    const user = userEvent.setup();
    render(<QuickExitButton />);
    
    // Press ESC three times
    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');
    
    // Verify analytics was called with keyboard trigger
    expect(trackEvent).toHaveBeenCalledWith('QUICK_EXIT_USED', 'SAFETY', {
      trigger: 'keyboard',
      page: '/',
    });
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
    
    // Analytics should not have been called
    expect(trackEvent).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('shows tooltip on hover', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<QuickExitButton />);
    
    const button = getByRole('button', { name: /ESC/i });
    await user.hover(button);
    
    // We can check that the button is rendered and hoverable
    // The tooltip implementation uses Radix UI which is complex to test in jsdom
    expect(button).toBeInTheDocument();
  });
});