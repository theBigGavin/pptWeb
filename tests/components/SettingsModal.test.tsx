import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsModal from '../../src/components/SettingsModal'; // Corrected path
import { Theme } from '../../src/types'; // Corrected path

describe('SettingsModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnThemeChange = vi.fn();
  const initialTheme: Theme = 'system';

  // Helper function to render the modal with default props
  const renderModal = (isOpen: boolean, theme: Theme = initialTheme) => {
    return render(
      <SettingsModal
        isOpen={isOpen}
        onClose={mockOnClose}
        currentTheme={theme}
        onThemeChange={mockOnThemeChange}
      />
    );
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnThemeChange.mockClear();
  });

  it('should not render when isOpen is false', () => {
    renderModal(false);
    // Use queryByRole as getByRole would throw an error if not found
    // Check for a specific element like the header instead of role="dialog" which might be tricky
    expect(screen.queryByRole('heading', { name: /设置/i })).not.toBeInTheDocument();
  });

  it('should render correctly when isOpen is true', () => {
    renderModal(true);

    // Check for the main dialog container (using role="dialog" implicitly via overlay)
    // Or check for a specific element like the header
    expect(screen.getByRole('heading', { name: /设置/i })).toBeInTheDocument();

    // Check for close button - find button containing the times icon
    const closeButton = screen.getByRole('button', { name: '' }); // Find button without explicit name first
    // Note: FontAwesome renders faTimes as data-icon="xmark"
    expect(closeButton.querySelector('svg[data-icon="xmark"]')).toBeInTheDocument();


    // Check for theme options (find by label text)
    expect(screen.getByLabelText(/明亮/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/黑暗/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/跟随系统/i)).toBeInTheDocument();

    // Check for language dropdown (find by associated label)
    expect(screen.getByRole('combobox', { name: /界面语言/i })).toBeInTheDocument();

    // Check for LLM dropdown
    expect(screen.getByRole('combobox', { name: /大模型接口/i })).toBeInTheDocument();

    // Check for version info
    expect(screen.getByText(/版本: 0\.1\.0/i)).toBeInTheDocument();
  });

  it('should call onClose when overlay is clicked', async () => {
    const user = userEvent.setup();
    renderModal(true);
    // Find the overlay div by looking for the parent of the content
    const content = screen.getByRole('heading', { name: /设置/i }).closest('.settings-modal-content');
    const overlay = content?.parentElement; // The overlay is the direct parent of content
    expect(overlay).toHaveClass('settings-modal-overlay'); // Verify it's the overlay

    if (overlay) { // Check if overlay was found
        await user.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    } else {
        throw new Error("Overlay element not found"); // Fail test if overlay is missing
    }
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    renderModal(true);
    // Find the close button specifically by its class or containing the icon
    const closeButton = screen.getByRole('button', { name: '' }).closest('.settings-modal-close-btn');

    expect(closeButton).toBeInTheDocument();
    expect(closeButton?.querySelector('svg[data-icon="xmark"]')).toBeInTheDocument(); // Double check icon

    if (closeButton) {
        await user.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    } else {
         throw new Error("Close button not found");
    }
  });

  it('should not call onClose when modal content is clicked', async () => {
    const user = userEvent.setup();
    renderModal(true);
    // Find the content div
    const content = screen.getByRole('heading', { name: /设置/i }).closest('.settings-modal-content');
    expect(content).toBeInTheDocument();

    if (content) {
        // Click somewhere inside the content, e.g., the header
        const header = screen.getByRole('heading', { name: /设置/i });
        await user.click(header);
        expect(mockOnClose).not.toHaveBeenCalled();
    } else {
        throw new Error("Modal content not found");
    }
  });

  it('should display the correct theme based on currentTheme prop', () => {
    // Test with 'light' theme
    const { rerender } = renderModal(true, 'light'); // Get rerender function
    expect(screen.getByLabelText(/明亮/i)).toBeChecked();
    expect(screen.getByLabelText(/黑暗/i)).not.toBeChecked();
    expect(screen.getByLabelText(/跟随系统/i)).not.toBeChecked();

    // Test with 'dark' theme (using rerender)
    rerender( // Use rerender with the same component type but new props
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        currentTheme={'dark'}
        onThemeChange={mockOnThemeChange}
      />
    );
    expect(screen.getByLabelText(/明亮/i)).not.toBeChecked();
    expect(screen.getByLabelText(/黑暗/i)).toBeChecked();
    expect(screen.getByLabelText(/跟随系统/i)).not.toBeChecked();

     // Test with 'system' theme
    rerender(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        currentTheme={'system'}
        onThemeChange={mockOnThemeChange}
      />
    );
    expect(screen.getByLabelText(/明亮/i)).not.toBeChecked();
    expect(screen.getByLabelText(/黑暗/i)).not.toBeChecked();
    expect(screen.getByLabelText(/跟随系统/i)).toBeChecked();
  });

  it('should call onThemeChange with the correct value when a theme radio button is clicked', async () => {
    const user = userEvent.setup();
    // Start with 'system' theme and get rerender function
    const { rerender } = renderModal(true, 'system');

    const lightRadio = screen.getByLabelText(/明亮/i);
    const darkRadio = screen.getByLabelText(/黑暗/i);
    const systemRadio = screen.getByLabelText(/跟随系统/i);

    // 1. Click 'light' (initial theme: system)
    await user.click(lightRadio);
    expect(mockOnThemeChange).toHaveBeenCalledTimes(1);
    expect(mockOnThemeChange).toHaveBeenCalledWith('light');

    // 2. Rerender with updated theme prop ('light') and click 'dark'
    mockOnThemeChange.mockClear();
    rerender(
      <SettingsModal isOpen={true} onClose={mockOnClose} currentTheme={'light'} onThemeChange={mockOnThemeChange} />
    );
    await user.click(darkRadio);
    expect(mockOnThemeChange).toHaveBeenCalledTimes(1);
    expect(mockOnThemeChange).toHaveBeenCalledWith('dark');

    // 3. Rerender with updated theme prop ('dark') and click 'system'
    mockOnThemeChange.mockClear();
    rerender(
      <SettingsModal isOpen={true} onClose={mockOnClose} currentTheme={'dark'} onThemeChange={mockOnThemeChange} />
    );
    await user.click(systemRadio);
    expect(mockOnThemeChange).toHaveBeenCalledTimes(1); // Should now be called
    expect(mockOnThemeChange).toHaveBeenCalledWith('system');

    // 4. Rerender with updated theme prop ('system') and click 'light' again
    mockOnThemeChange.mockClear();
     rerender(
      <SettingsModal isOpen={true} onClose={mockOnClose} currentTheme={'system'} onThemeChange={mockOnThemeChange} />
    );
    await user.click(lightRadio);
    expect(mockOnThemeChange).toHaveBeenCalledTimes(1);
    expect(mockOnThemeChange).toHaveBeenCalledWith('light');
  });

  it('should display the correct initial language and update on change', async () => {
    const user = userEvent.setup();
    renderModal(true);

    const languageSelect = screen.getByRole('combobox', { name: /界面语言/i });

    // Check initial value (default is zh-CN)
    expect(languageSelect).toHaveValue('zh-CN');

    // Change to English
    await user.selectOptions(languageSelect, 'en');
    expect(languageSelect).toHaveValue('en');

    // Change to Japanese
    await user.selectOptions(languageSelect, 'ja');
    expect(languageSelect).toHaveValue('ja');
  });

  it('should display the correct initial LLM provider and update on change', async () => {
    const user = userEvent.setup();
    renderModal(true);

    const llmSelect = screen.getByRole('combobox', { name: /大模型接口/i });

    // Check initial value (default is deepseek)
    expect(llmSelect).toHaveValue('deepseek');

    // Change to OpenAI
    await user.selectOptions(llmSelect, 'openai');
    expect(llmSelect).toHaveValue('openai');

    // Change to Gemini
    await user.selectOptions(llmSelect, 'gemini');
    expect(llmSelect).toHaveValue('gemini');
  });
});