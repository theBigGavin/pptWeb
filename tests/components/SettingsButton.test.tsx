import { render, screen, fireEvent, act } from '@testing-library/react'; // Import act and fireEvent
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SettingsButton from '../../src/components/SettingsButton'; // Corrected path
import { Theme } from '../../src/types'; // Corrected path

// Mock the SettingsModal component to isolate the SettingsButton tests
// Mock path needs to be relative to *this* file now
vi.mock('../../src/components/SettingsModal', () => ({
  // Default export mock
  default: ({ isOpen, onClose, currentTheme, onThemeChange }: any) => {
    // Render something minimal or identifiable if needed for testing prop passing
    return isOpen ? (
      <div data-testid="mock-settings-modal">
        Modal Open
        <button onClick={onClose}>Close</button>
        <span>Theme: {currentTheme}</span>
        <button onClick={() => onThemeChange('dark')}>Change Theme</button>
      </div>
    ) : null;
  },
}));


describe('SettingsButton Component', () => {
  const mockOnThemeChange = vi.fn();
  const initialTheme: Theme = 'light';

  it('should render the settings button with the cog icon', () => {
    render(<SettingsButton currentTheme={initialTheme} onThemeChange={mockOnThemeChange} />);

    // Find the button by its title attribute or role
    const settingsButton = screen.getByRole('button', { name: /设置/i });
    expect(settingsButton).toBeInTheDocument();

    // Check for the FontAwesome icon (its parent svg element)
    // Note: FontAwesome renders faCog as data-icon="gear"
    const icon = settingsButton.querySelector('svg[data-icon="gear"]');
    expect(icon).toBeInTheDocument();

    // Initially, the modal should not be visible
    expect(screen.queryByTestId('mock-settings-modal')).not.toBeInTheDocument();
  });

  it('should open the modal and add spin class on button click', async () => {
    const user = userEvent.setup();
    render(<SettingsButton currentTheme={initialTheme} onThemeChange={mockOnThemeChange} />);
    const settingsButton = screen.getByRole('button', { name: /设置/i });

    // Initially modal is closed and no spin class
    expect(screen.queryByTestId('mock-settings-modal')).not.toBeInTheDocument();
    expect(settingsButton).not.toHaveClass('spin');

    // Click the button
    await user.click(settingsButton);

    // Modal should be open now
    expect(screen.getByTestId('mock-settings-modal')).toBeInTheDocument();
    // Button should have the spin class immediately after click
    expect(settingsButton).toHaveClass('spin');
  });

  it('should remove spin class after timeout', () => { // Make synchronous
    vi.useFakeTimers(); // Use fake timers for this test
    render(<SettingsButton currentTheme={initialTheme} onThemeChange={mockOnThemeChange} />);
    const settingsButton = screen.getByRole('button', { name: /设置/i });

    // Click the button using fireEvent
    fireEvent.click(settingsButton);

    // Spin class should be present immediately after synchronous click
    expect(settingsButton).toHaveClass('spin');

    // Advance timers by 500ms within act()
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Spin class should be removed now
    expect(settingsButton).not.toHaveClass('spin');

    vi.useRealTimers(); // Restore real timers after the test
  });

  it('should pass correct props to SettingsModal', async () => {
    const user = userEvent.setup();
    const testTheme: Theme = 'dark'; // Use a different theme for clarity
    const handleChange = vi.fn();
    render(<SettingsButton currentTheme={testTheme} onThemeChange={handleChange} />);
    const settingsButton = screen.getByRole('button', { name: /设置/i });

    // Click to open the modal
    await user.click(settingsButton);

    // Find the mocked modal
    const modal = screen.getByTestId('mock-settings-modal');
    expect(modal).toBeInTheDocument();

    // Check if the theme prop is passed correctly (using the text rendered in the mock)
    expect(screen.getByText(`Theme: ${testTheme}`)).toBeInTheDocument();

    // Simulate the theme change action within the mock modal
    const changeThemeButton = screen.getByRole('button', { name: /Change Theme/i });
    await user.click(changeThemeButton);

    // Check if the onThemeChange callback passed from SettingsButton was called
    expect(handleChange).toHaveBeenCalledTimes(1);
    // Optionally check the argument if the mock provides it, our mock calls it with 'dark'
    expect(handleChange).toHaveBeenCalledWith('dark');

    // Simulate closing the modal via the mock's close button
    const closeButton = screen.getByRole('button', { name: /Close/i });
    await user.click(closeButton);

    // Check if the modal is closed again
    expect(screen.queryByTestId('mock-settings-modal')).not.toBeInTheDocument();
  });
});